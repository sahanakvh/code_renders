import { Pool } from "pg";

export type Mode = "db" | "memory";
let mode: Mode = process.env.DATABASE_URL ? "db" : "memory";
export const isDb = () => mode === "db";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Memory fallback (demo mode)
export const memory = {
  therapists: [
    { id: "T1", name: "Therapist A", skills: ["Abhyanga","Basti"], rr_index: 0, minutes_worked_today: 120 },
    { id: "T2", name: "Therapist B", skills: ["Swedana","Abhyanga"], rr_index: 1, minutes_worked_today: 60 },
    { id: "T3", name: "Therapist C", skills: ["Abhyanga","Virechana"], rr_index: 2, minutes_worked_today: 30 },
  ],
  rooms: [
    { id: "R1", name: "Room 1", tags: [] },
    { id: "R2", name: "Room 2", tags: [] },
  ],
  appointments: [
    { id:"EX1", patient_id:"P_EXIST", therapy:"Abhyanga", therapist_id:"T1", room_id:"R1",
      start_ts: new Date("2025-09-15T09:00:00"), end_ts: new Date("2025-09-15T10:00:00"), status:"SCHEDULED" }
  ]
};
