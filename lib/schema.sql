CREATE TABLE IF NOT EXISTS reconciliation_runs (
  id                       SERIAL PRIMARY KEY,
  run_date                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bank_filename            TEXT NOT NULL,
  internal_filename        TEXT NOT NULL,
  total_bank_records       INT NOT NULL DEFAULT 0,
  total_internal_records   INT NOT NULL DEFAULT 0,
  matched_count            INT NOT NULL DEFAULT 0,
  mismatched_count         INT NOT NULL DEFAULT 0,
  missing_in_bank_count    INT NOT NULL DEFAULT 0,
  missing_in_internal_count INT NOT NULL DEFAULT 0,
  status                   TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id               SERIAL PRIMARY KEY,
  run_id           INT NOT NULL REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
  transaction_id   TEXT NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  description      TEXT,
  status           TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS internal_transactions (
  id               SERIAL PRIMARY KEY,
  run_id           INT NOT NULL REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
  transaction_id   TEXT NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  description      TEXT,
  status           TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reconciliation_results (
  id                SERIAL PRIMARY KEY,
  run_id            INT NOT NULL REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
  transaction_id    TEXT NOT NULL,
  match_status      TEXT NOT NULL,
  bank_amount       NUMERIC(12, 2),
  internal_amount   NUMERIC(12, 2),
  amount_diff       NUMERIC(12, 2),
  bank_date         DATE,
  internal_date     DATE,
  notes             TEXT,
  resolved          BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at       TIMESTAMPTZ,
  resolved_by       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_results_run_id ON reconciliation_results(run_id);
CREATE INDEX IF NOT EXISTS idx_results_match_status ON reconciliation_results(match_status);
CREATE INDEX IF NOT EXISTS idx_results_transaction_id ON reconciliation_results(transaction_id);
CREATE INDEX IF NOT EXISTS idx_bank_run_id ON bank_transactions(run_id);
CREATE INDEX IF NOT EXISTS idx_internal_run_id ON internal_transactions(run_id);
