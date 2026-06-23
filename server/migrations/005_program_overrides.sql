CREATE TABLE IF NOT EXISTS program_overrides (
  program_id TEXT PRIMARY KEY,
  description TEXT,
  access_mode TEXT,
  referral_requirements TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  listed_avg_wait_days REAL,
  listed_total_capacity INTEGER,
  listed_current_clients INTEGER,
  updated_at TEXT,
  updated_by TEXT
);
