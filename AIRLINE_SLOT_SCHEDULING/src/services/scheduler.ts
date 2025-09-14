import { Pool, PoolClient } from "pg";
import { isDb, pool, memory, Appointment as MAppt } from "../utils/db";

export type RequestPayload = {
  id: string;
  patient_id: string;
  therapy: string;
  preferred_date: string;   // "2025-09-15"
  window_start: string;     // "09:00"
  window_end: string;       // "12:00"
  expected_duration_minutes?: number;
  priority?: number;
};

const BASE_DURATIONS: Record<string, number> = {
  Abhyanga: 60, Swedana: 45, Basti: 30, Virechana: 90
};

const parseDT = (dateStr: string, hhmm: string) => new Date(`${dateStr}T${hhmm}:00`);
const addMin = (d: Date, m: number) => new Date(d.getTime() + m*60000);

export class EnhancedSchedulerService {
  constructor(private pg: Pool) {}

  // Load therapists, rooms, appointments
  async loadAppointmentsForDay(dateISO: string) {
    if (isDb()) {
      const r = await this.pg.query(
        `SELECT * FROM appointments WHERE start_ts::date = $1::date`, [dateISO]
      );
      return r.rows.map((x:any)=>({...x, start_ts: new Date(x.start_ts), end_ts: new Date(x.end_ts)}));
    }
    return memory.appointments.filter(a => a.start_ts.toISOString().slice(0,10) === dateISO);
  }

  // Predict duration
  predictDuration(therapy: string, hint?: number) {
    if (hint && hint > 0) return hint;
    return BASE_DURATIONS[therapy] ?? 45;
  }

  // Check overlaps
  overlaps(aS: Date, aE: Date, bS: Date, bE: Date) {
    return !(aE <= bS || bE <= aS);
  }

  // ========== WAITLIST ==========

  async addToWaitlist(req: RequestPayload) {
    if (isDb()) {
      const result = await this.pg.query(
        `INSERT INTO waitlist (id,patient_id,therapy,preferred_date,window_start,window_end,priority)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [req.id, req.patient_id, req.therapy, req.preferred_date, req.window_start, req.window_end, req.priority || 5]
      );
      const posRes = await this.pg.query(`SELECT COUNT(*) FROM waitlist WHERE preferred_date=$1`, [req.preferred_date]);
      return { waitlist_position: parseInt(posRes.rows[0].count,10) };
    }
    // memory fallback
    return { waitlist_position: 1 };
  }

  async getWaitlistStatus() {
    if (isDb()) {
      const r = await this.pg.query(`SELECT * FROM waitlist ORDER BY created_at ASC`);
      return r.rows;
    }
    return [];
  }

  async removeFromWaitlist(id: string) {
    if (isDb()) {
      await this.pg.query(`DELETE FROM waitlist WHERE id=$1`, [id]);
      return { success: true };
    }
    return { success: false };
  }

  // ========== CONFIRM BOOKING ==========
  async confirm(payload: { id:string; patient_id:string; therapy:string; therapist_id:string; room_id:string; start_ts:string; end_ts:string }) {
    if (isDb()) {
      const client = await this.pg.connect();
      try {
        await client.query("BEGIN");

        const q = await client.query(
          `SELECT 1 FROM appointments WHERE status!='CANCELLED'
           AND (
             (therapist_id=$1 AND NOT ($4 <= start_ts OR $3 >= end_ts)) OR
             (room_id=$2 AND NOT ($4 <= start_ts OR $3 >= end_ts))
           ) LIMIT 1`,
          [payload.therapist_id, payload.room_id, payload.start_ts, payload.end_ts]
        );
        if (q.rowCount > 0) throw new Error("Conflict: busy slot");

        await client.query(
          `INSERT INTO appointments (id,patient_id,therapy,therapist_id,room_id,start_ts,end_ts,status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'SCHEDULED')`,
          [payload.id, payload.patient_id, payload.therapy, payload.therapist_id, payload.room_id, payload.start_ts, payload.end_ts]
        );

        await client.query("COMMIT");
        return { success: true };
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    }
    memory.appointments.push(payload as unknown as MAppt);
    return { success: true };
  }

  // ========== CANCEL + AUTO REALLOCATE ==========
  async cancelAppointment(appointmentId: string, reason="CANCELLED") {
    if (isDb()) {
      const client = await this.pg.connect();
      try {
        await client.query("BEGIN");

        const apptRes = await client.query(`SELECT * FROM appointments WHERE id=$1`, [appointmentId]);
        if (apptRes.rowCount === 0) return { success:false };

        const appt = apptRes.rows[0];
        await client.query(`UPDATE appointments SET status=$2 WHERE id=$1`, [appointmentId, reason]);

        // Try to auto-assign from waitlist
        const wl = await client.query(
          `SELECT * FROM waitlist WHERE therapy=$1 AND preferred_date=$2 ORDER BY priority DESC, created_at ASC LIMIT 1`,
          [appt.therapy, appt.start_ts.toISOString().slice(0,10)]
        );

        if (wl.rowCount > 0) {
          const candidate = wl.rows[0];
          await client.query(`DELETE FROM waitlist WHERE id=$1`, [candidate.id]);

          await this.confirm({
            id: candidate.id,
            patient_id: candidate.patient_id,
            therapy: candidate.therapy,
            therapist_id: appt.therapist_id,
            room_id: appt.room_id,
            start_ts: appt.start_ts.toISOString(),
            end_ts: appt.end_ts.toISOString()
          });

          await client.query("COMMIT");
          return { success:true, freed_slot: appt, auto_booked: candidate };
        }

        await client.query("COMMIT");
        return { success:true, freed_slot: appt, auto_booked: null };
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    }
    return { success:false };
  }
}
