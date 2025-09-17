// backend/src/services/schedulingService.ts
// Core scheduling logic for dynamic slot allocation, load balancing, real-time reallocation, and fairness

/**
 * Predicts therapy duration based on therapy type, patient, and historical data.
 * For demo, returns a random duration between 30-90 min.
 */
function predictTherapyDuration(therapy: string, patientId: string): number {
  // TODO: Use real ML/data
  return 30 + Math.floor(Math.random() * 60);
}

/**
 * Returns therapist load score (lower is better).
 * For demo, returns a random score between 1-10.
 */
function getTherapistLoad(therapistId: string, date: string): number {
  // TODO: Use real workload data
  return 1 + Math.floor(Math.random() * 10);
}

/**
 * Returns fairness score for therapist (lower is fairer).
 * For demo, returns a random score between 1-5.
 */
function getFairnessScore(therapistId: string): number {
  // TODO: Use round-robin/work-minimizing logic
  return 1 + Math.floor(Math.random() * 5);
}

/**
 * Generates candidate slots for a given window, using dynamic durations.
 */
type Slot = {
  therapist_id: string;
  start_ts: string;
  end_ts: string;
  duration: number;
  load_score: number;
  fairness: number;
};

function generateCandidateSlots({
  windowStart,
  windowEnd,
  therapy,
  patientId,
  therapists,
  date
}: {
  windowStart: string,
  windowEnd: string,
  therapy: string,
  patientId: string,
  therapists: string[],
  date: string
}): Slot[] {
  const start = Date.parse(`${date}T${windowStart}`);
  const end = Date.parse(`${date}T${windowEnd}`);
  const slots: Slot[] = [];
  therapists.forEach(therapistId => {
    let slotStart = start;
    while (slotStart + 15 * 60000 <= end) {
      const duration = predictTherapyDuration(therapy, patientId);
      const slotEnd = Math.min(slotStart + duration * 60000, end);
      slots.push({
        therapist_id: therapistId,
        start_ts: new Date(slotStart).toISOString(),
        end_ts: new Date(slotEnd).toISOString(),
        duration,
        load_score: getTherapistLoad(therapistId, date),
        fairness: getFairnessScore(therapistId)
      });
      slotStart = slotEnd;
    }
  });
  // Sort by load, fairness, then earliest
  slots.sort((a, b) =>
    a.load_score - b.load_score ||
    a.fairness - b.fairness ||
    Date.parse(a.start_ts) - Date.parse(b.start_ts)
  );
  return slots;
}

module.exports = {
  predictTherapyDuration,
  getTherapistLoad,
  getFairnessScore,
  generateCandidateSlots
};
