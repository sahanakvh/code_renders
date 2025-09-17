import { Request, Response } from "express";
const schedulingService = require("../services/schedulingService");

// Simple in-memory store for demo. Replace with DB in prod.
const appointments: any[] = []; // each: { id, patient_id, therapy, start_ts, end_ts, therapist_id }
const waitlist: any[] = [];     // each: { id, patient_id, therapy, window_start, window_end, preferred_date, priority }

// GET /api/appointments/slots?date=YYYY-MM-DD
exports.getBoard = (req: Request, res: Response) => {
  const date = req.query.date as string;
  if (!date) return res.status(400).json({ error: "Missing date query" });

  // For demo: return existing appointments for date and a naive free-window list.
  const dayApps = appointments.filter(a => a.start_ts.startsWith(date));
  // Derive free windows from 08:00 - 18:00 by subtracting booked slots (simple)
  // Very naive: single free window if none booked
  const free = [];
  if (dayApps.length === 0) {
    free.push({ window_start: "08:00", window_end: "18:00" });
  } else {
    // sort apps
    const sorted = dayApps.slice().sort((x,y)=>Date.parse(x.start_ts)-Date.parse(y.start_ts));
    // find gaps between 08:00..18:00
    const dayStart = Date.parse(`${date}T08:00:00`);
    const dayEnd = Date.parse(`${date}T18:00:00`);
    let cursor = dayStart;
    for (const a of sorted) {
      const aStart = Date.parse(a.start_ts);
      if (aStart > cursor) {
        free.push({ window_start: new Date(cursor).toISOString().slice(11,16), window_end: new Date(aStart).toISOString().slice(11,16) });
      }
      cursor = Math.max(cursor, Date.parse(a.end_ts));
    }
    if (cursor < dayEnd) free.push({ window_start: new Date(cursor).toISOString().slice(11,16), window_end: "18:00" });
  }

  res.json({ appointments: dayApps, free, waitlist });
};

// POST /api/appointments/preview
// Always return 3 random slots for demo, regardless of input
exports.previewCandidates = (req: Request, res: Response) => {
  const now = Date.now();
  function randomMinutes(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  const slots = Array.from({ length: 3 }).map((_, i) => {
    const offset = randomMinutes(10 + i * 50, 30 + i * 60);
    const duration = randomMinutes(25, 60);
    return {
      therapist_id: ["T_ALICE", "T_BOB", "T_CAROL"][i],
      start_ts: new Date(now + offset * 60000).toISOString(),
      end_ts: new Date(now + (offset + duration) * 60000).toISOString(),
      duration,
      load_score: randomMinutes(1, 5),
      fairness: randomMinutes(1, 3)
    };
  });
  return res.json({ candidates: slots });
};

// POST /api/appointments  (create booking or join waitlist)
// Store confirmed booking in the database
exports.createAppointmentOrWaitlist = async (req: Request, res: Response) => {
  const body = req.body;
  const id = body.id || `APP_${Date.now()}`;
  try {
    // Store in DB
    const { insertAppointment } = require("../services/appointmentDbService");
    const dbResult = await insertAppointment({
      id,
      patient_id: body.patient_id,
      therapy: body.therapy, // For demo, therapy is used as therapy_id
      therapist_id: body.therapist_id,
      start_ts: body.start_ts,
      end_ts: body.end_ts
    });
    return res.status(200).json({ type: "BOOKED", appointment: dbResult, message: "Booked and stored in DB" });
  } catch (err) {
    console.error("DB booking error", err);
    return res.status(500).json({ error: "Failed to book appointment in DB" });
  }
};

// GET /api/appointments/waitlist
exports.getWaitlist = (req: Request, res: Response) => {
  res.json({ waitlist });
};

// POST /api/appointments/cancel
// Body: { appointment_id }
exports.cancelAppointment = (req: Request, res: Response) => {
  const { appointment_id } = req.body;
  if (!appointment_id) return res.status(400).json({ error: "Missing appointment_id" });
  const idx = appointments.findIndex(a => a.id === appointment_id);
  if (idx === -1) return res.status(404).json({ error: "Appointment not found" });
  const removed = appointments.splice(idx,1)[0];

  // Naive auto-assign from waitlist: find first waiting with same therapy/date and window covers slot
  const slotDate = removed.start_ts.slice(0,10);
  let autoBooked = null;
  for (let i=0;i<waitlist.length;i++){
    const w = waitlist[i];
    if (w.preferred_date === slotDate && w.therapy === removed.therapy) {
      // assign to same therapist and same start/end of removed slot (simple)
      const appt = {
        id: `APP_${Date.now()}`,
        patient_id: w.patient_id,
        therapy: w.therapy,
        therapist_id: removed.therapist_id,
        start_ts: removed.start_ts,
        end_ts: removed.end_ts
      };
      appointments.push(appt);
      autoBooked = { ...appt };
      waitlist.splice(i,1);
      break;
    }
  }

  res.json({ message: "Cancelled", cancelled: removed, auto_booked: autoBooked || null });
};
