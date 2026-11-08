"""Offline SQLite contract verification of the staging Worker's idempotent D1 SQL operations.
Not an HTTP test and not a copy of private worker source. No network, secret or client data.
"""
import hashlib
import sqlite3

db = sqlite3.connect(":memory:")
db.executescript("""
CREATE TABLE demandes(
  ref TEXT PRIMARY KEY,
  service TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  code TEXT NOT NULL,
  etat TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  imported_at TEXT
);
""")
ref = "LMP-V-OFFLINE-TEST-00001"
code = "LIMPID1.offline-fixture-only"
digest = hashlib.sha256(code.encode()).hexdigest()
other = hashlib.sha256(b"different fixture").hexdigest()

def send(reference, payload_hash, payload_code):
    db.execute(
        "INSERT OR IGNORE INTO demandes(ref,service,sha256,code,etat) VALUES(?,?,?,?,?)",
        (reference, "vitres", payload_hash, payload_code, "nouveau"),
    )
    saved = db.execute("SELECT sha256 FROM demandes WHERE ref=?", (reference,)).fetchone()
    if not saved:
        return "PERSISTENCE_NOT_CONFIRMED"
    if saved[0] != payload_hash:
        return "REFERENCE_CONFLICT"
    return "enregistre_lab"

assert send(ref, digest, code) == "enregistre_lab"
assert send(ref, digest, code) == "enregistre_lab"  # identical replay
assert send(ref, other, "LIMPID1.other-fixture") == "REFERENCE_CONFLICT"
assert db.execute("SELECT COUNT(*) FROM demandes WHERE ref=?", (ref,)).fetchone()[0] == 1
assert db.execute("SELECT COUNT(*) FROM demandes WHERE etat='nouveau'").fetchone()[0] == 1

db.execute(
    "UPDATE demandes SET etat='importe', imported_at=CURRENT_TIMESTAMP "
    "WHERE ref=? AND sha256=? AND etat='nouveau'", (ref, digest)
)
assert db.execute("SELECT etat FROM demandes WHERE ref=?", (ref,)).fetchone()[0] == "importe"
assert db.execute("SELECT COUNT(*) FROM demandes WHERE etat='nouveau'").fetchone()[0] == 0
assert send(ref, digest, code) == "enregistre_lab"  # same ref after ACK does not reopen
assert db.execute("SELECT COUNT(*) FROM demandes WHERE etat='nouveau'").fetchone()[0] == 0
assert db.execute("SELECT COUNT(*) FROM demandes WHERE ref=?", (ref,)).fetchone()[0] == 1

print("D1 SQL CONTRACT OK: same-ref replay once, SHA conflict rejected, ACK one-way, outbox stable")
