-- Intakes: one row per submission
CREATE TABLE IF NOT EXISTS intakes (
  id TEXT PRIMARY KEY,
  submitted_at TEXT NOT NULL,
  -- PII (encrypted at rest via server/crypto.js)
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  dob TEXT,
  gender TEXT,
  gender_self_describe TEXT,
  suburb TEXT,
  -- Needs
  urgency TEXT NOT NULL CHECK (urgency IN ('low','medium','high','crisis')),
  description TEXT,
  previous_services TEXT,
  -- Preferences
  contact_time TEXT,
  special_requirements TEXT,
  consent_data INTEGER NOT NULL DEFAULT 0,
  consent_crisis INTEGER NOT NULL DEFAULT 0,
  -- Workflow
  status TEXT NOT NULL DEFAULT 'queued',
  assigned_org_id TEXT,
  assigned_at TEXT
);

-- Multi-value fields as child rows (avoids pipe-delimited text)
CREATE TABLE IF NOT EXISTS intake_tags (
  intake_id TEXT NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,  -- 'seekerGroup' | 'supportType' | 'accessMode' | 'contactMethod'
  value TEXT NOT NULL,
  PRIMARY KEY (intake_id, kind, value)
);

-- Weekly aggregate for the Shared Data bar chart
CREATE TABLE IF NOT EXISTS intake_volume_weeks (
  week TEXT PRIMARY KEY,
  count INTEGER NOT NULL
);

-- Program-level metrics that drive Shared Data reports
CREATE TABLE IF NOT EXISTS program_metrics (
  program_id TEXT NOT NULL,
  gender TEXT NOT NULL,
  avg_wait_days REAL,
  completion_rate INTEGER,
  total_clients INTEGER,
  total_capacity INTEGER,
  current_clients INTEGER,
  available_pct INTEGER,
  waitlist_depth INTEGER,
  has_capacity INTEGER,
  PRIMARY KEY (program_id, gender)
);

CREATE TABLE IF NOT EXISTS program_metrics_age (
  program_id TEXT NOT NULL,
  gender TEXT NOT NULL,
  age_group TEXT NOT NULL,
  outcome_rate INTEGER,
  clients INTEGER,
  PRIMARY KEY (program_id, gender, age_group),
  FOREIGN KEY (program_id, gender) REFERENCES program_metrics(program_id, gender) ON DELETE CASCADE
);
