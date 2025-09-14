CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  therapy TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  window_start TIME NOT NULL,
  window_end TIME NOT NULL,
  priority INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_date ON waitlist(preferred_date, created_at);
