CREATE TABLE IF NOT EXISTS intake_routes (
  intake_id TEXT NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  org_id TEXT,
  org_name TEXT,
  program_name TEXT NOT NULL,
  support_type TEXT,
  routed_at TEXT NOT NULL,
  PRIMARY KEY (intake_id, program_id, support_type)
);
