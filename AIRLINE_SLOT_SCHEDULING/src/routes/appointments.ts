import express from "express";
import { EnhancedSchedulerService } from "../services/scheduler";
import { pool } from "../utils/db";

export default function createEnhancedAppointmentsRouter() {
  const router = express.Router();
  const svc = new EnhancedSchedulerService(pool);

  // View slots
  router.get("/slots", async (req,res)=> {
    const board = await svc.loadAppointmentsForDay((req.query.date as string) || new Date().toISOString().slice(0,10));
    res.json(board);
  });

  // Preview slots
  router.post("/preview", async (req,res)=> {
    // Could hook into slot preview scoring (shortened for brevity)
    res.json({ candidates: [] });
  });

  // Book or waitlist
  router.post("/", async (req,res)=> {
    try {
      const candidates:any[] = []; // call preview() in real logic
      if (candidates.length>0) {
        const result = await svc.confirm(candidates[0]);
        res.json({ success:true, type:"BOOKED" });
      } else {
        const wl = await svc.addToWaitlist(req.body);
        res.json({ success:true, type:"WAITLISTED", ...wl });
      }
    } catch (e:any) {
      res.status(500).json({ error:e.message });
    }
  });

  // Cancel with auto-fill
  router.post("/cancel", async (req,res)=> {
    const result = await svc.cancelAppointment(req.body.appointment_id);
    res.json(result);
  });

  // Waitlist status
  router.get("/waitlist", async (req,res)=> {
    const wl = await svc.getWaitlistStatus();
    res.json({ waitlist: wl });
  });

  return router;
}
