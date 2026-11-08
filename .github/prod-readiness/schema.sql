-- CONTRACT DRAFT / NO DATABASE MUTATION HAS BEEN PERFORMED.
-- Use ONLY in a newly provisioned production D1, never in STAGING.
CREATE TABLE IF NOT EXISTS demandes (
  ref TEXT NOT NULL PRIMARY KEY,
  service TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  code TEXT NOT NULL,
  etat TEXT NOT NULL DEFAULT 'nouveau'
    CHECK(etat IN ('nouveau','importe')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  imported_at TEXT
);
CREATE INDEX IF NOT EXISTS demandes_by_state ON demandes(etat, created_at);
-- Deletion/retention process is intentionally not provided until approved by controller.
