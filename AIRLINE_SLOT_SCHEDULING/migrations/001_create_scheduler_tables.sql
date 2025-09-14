CREATE TABLE IF NOT EXISTS therapists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  rr_index INT NOT NULL DEFAULT 0,
  minutes_worked_today INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  therapy TEXT NOT NULL,
  therapist_id TEXT NOT NULL REFERENCES therapists(id),
  room_id TEXT NOT NULL REFERENCES rooms(id),
  start_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  end_ts TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_therapist ON appointments(therapist_id, start_ts, end_ts);
CREATE INDEX IF NOT EXISTS idx_appointments_room ON appointments(room_id, start_ts, end_ts);
