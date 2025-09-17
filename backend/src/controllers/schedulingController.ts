// backend/src/controllers/schedulingController.ts
import { Request, Response } from "express";
const schedulingService = require("../services/schedulingService");

/**
 * POST /api/schedule/slots
 * Body: { windowStart, windowEnd, therapy, patientId, therapists, date }
 * Returns: candidate slots with load and fairness
 */
exports.getCandidateSlots = (req: Request, res: Response) => {
  const { windowStart, windowEnd, therapy, patientId, therapists, date } = req.body;
  if (!windowStart || !windowEnd || !therapy || !patientId || !therapists || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const slots = schedulingService.generateCandidateSlots({
    windowStart,
    windowEnd,
    therapy,
    patientId,
    therapists,
    date
  });
  res.json({ candidates: slots });
};

/**
 * POST /api/schedule/reallocate
 * Body: { affectedAppointments }
 * Emits real-time event (placeholder)
 */
exports.handleReallocation = (req: Request, res: Response) => {
  // Placeholder: In real app, update DB and emit event
  const { affectedAppointments } = req.body;
  // TODO: Reallocation logic and WebSocket event
  res.json({ message: "Reallocation triggered", affected: affectedAppointments });
};
