import pool from './database';

export async function insertAppointment({
  id,
  patient_id,
  therapy,
  therapist_id,
  start_ts,
  end_ts
}: {
  id: string,
  patient_id: string,
  therapy: string,
  therapist_id: string,
  start_ts: string,
  end_ts: string
}) {
  const query = `
    INSERT INTO therapy_sessions (id, patient_id, therapist_id, therapy_id, scheduled_start, scheduled_end, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
    RETURNING *;
  `;
  // For demo, use therapy as therapy_id (should map to real id in production)
  const values = [id, patient_id, therapist_id, therapy, start_ts, end_ts];
  const { rows } = await pool.query(query, values);
  return rows[0];
}
