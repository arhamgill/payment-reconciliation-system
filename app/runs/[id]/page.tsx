import { notFound } from 'next/navigation';
import { pool } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { ReconciliationRow } from '@/components/ReconciliationTable';
import { SingleRunClient } from '@/components/SingleRunClient';
import { SqlPanel } from '@/components/SqlPanel';
import { Search, Cpu } from 'lucide-react';

export const revalidate = 0;

interface SingleRunPageProps {
  params: Promise<{ id: string }>;
}

const RECONCILIATION_ENGINE_SQL = `INSERT INTO reconciliation_results
  (run_id, transaction_id, match_status,
   bank_amount, internal_amount, amount_diff,
   bank_date, internal_date)
SELECT
  $1 AS run_id,
  COALESCE(b.transaction_id, i.transaction_id) AS transaction_id,
  CASE
    WHEN b.transaction_id IS NULL                        THEN 'missing_in_bank'
    WHEN i.transaction_id IS NULL                        THEN 'missing_in_internal'
    WHEN b.amount <> i.amount OR b.transaction_date <> i.transaction_date
                                                         THEN 'mismatched'
    ELSE                                                      'matched'
  END AS match_status,
  b.amount            AS bank_amount,
  i.amount            AS internal_amount,
  i.amount - b.amount AS amount_diff,
  b.transaction_date  AS bank_date,
  i.transaction_date  AS internal_date
FROM bank_transactions b
FULL OUTER JOIN internal_transactions i
  ON b.transaction_id = i.transaction_id
  AND b.run_id = i.run_id
WHERE COALESCE(b.run_id, i.run_id) = $1;`;

export default async function SingleRunPage({ params }: SingleRunPageProps) {
  const { id: idStr } = await params;
  const runId = parseInt(idStr, 10);

  if (isNaN(runId)) {
    notFound();
  }

  const start = Date.now();

  // Fetch run details
  const runRes = await pool.query<{
    id: number;
    run_date: Date;
    bank_filename: string;
    internal_filename: string;
    total_bank_records: number;
    total_internal_records: number;
    matched_count: number;
    mismatched_count: number;
    missing_in_bank_count: number;
    missing_in_internal_count: number;
    status: string;
  }>(
    `
    SELECT id, run_date, bank_filename, internal_filename,
           total_bank_records, total_internal_records,
           matched_count, mismatched_count,
           missing_in_bank_count, missing_in_internal_count,
           status
    FROM reconciliation_runs
    WHERE id = $1;
  `,
    [runId]
  );

  if (runRes.rows.length === 0) {
    notFound();
  }

  const run = runRes.rows[0];

  const resultsQuery = `SELECT id, transaction_id, match_status, bank_amount, internal_amount,
       amount_diff, bank_date, internal_date, notes, resolved
FROM reconciliation_results
WHERE run_id = $1
ORDER BY
  CASE
    WHEN resolved = FALSE AND match_status != 'matched' THEN 1
    WHEN resolved = TRUE  AND match_status != 'matched' THEN 2
    ELSE 3
  END,
  CASE match_status
    WHEN 'mismatched'          THEN 1
    WHEN 'missing_in_bank'     THEN 2
    WHEN 'missing_in_internal' THEN 3
    ELSE 4
  END,
  transaction_id ASC;`;


  // Fetch results for this run
  const resultsRes = await pool.query<ReconciliationRow>(resultsQuery, [runId]);

  const executionMs = Date.now() - start;

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Reconciliation Run #{run.id}</h1>
        <p className="page-subtitle">
          Executed on {new Date(run.run_date).toISOString().replace('T', ' ').slice(0, 16)} · Bank:{' '}
          <code style={{ color: '#ffffff', fontFamily: "'Fira Code', monospace" }}>{run.bank_filename}</code> · Internal:{' '}
          <code style={{ color: '#ffffff', fontFamily: "'Fira Code', monospace" }}>{run.internal_filename}</code>
        </p>
      </div>

      {/* Metric Cards for this run */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard
          label="Matched Records"
          value={run.matched_count}
          subtext="Amount & date aligned"
        />
        <StatCard
          label="Amount/Date Mismatches"
          value={run.mismatched_count}
          subtext="Discrepancy detected"
        />
        <StatCard
          label="Missing in Bank"
          value={run.missing_in_bank_count}
          subtext="In internal ledger only"
        />
        <StatCard
          label="Missing in Internal"
          value={run.missing_in_internal_count}
          subtext="In bank statement only"
        />
      </div>


      {/* Interactive Results & Filters */}
      <SingleRunClient runId={run.id} rows={resultsRes.rows} />

      {/* SQL Panels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={14} /> Query Used to View Run Results
          </h3>
          <SqlPanel query={resultsQuery} executionMs={executionMs} params={{ run_id: runId }} />
        </div>

        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} /> Core Reconciliation Engine SQL (FULL OUTER JOIN)
          </h3>
          <SqlPanel query={RECONCILIATION_ENGINE_SQL} params={{ run_id: runId }} />
        </div>
      </div>
    </div>
  );
}


