ALTER TABLE intakes ADD COLUMN referral_owner TEXT;
ALTER TABLE intakes ADD COLUMN follow_up_due TEXT;
ALTER TABLE intakes ADD COLUMN routing_note TEXT;
ALTER TABLE intakes ADD COLUMN decline_reason TEXT;

CREATE TABLE IF NOT EXISTS intake_events (
  id TEXT PRIMARY KEY,
  intake_id TEXT NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  body TEXT,
  created_by TEXT,
  created_at TEXT NOT NULL,
  metadata_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_intake_events_intake_id_created_at
  ON intake_events(intake_id, created_at);
