import { notFound } from 'next/navigation';
import { pool } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { ReconciliationTable, ReconciliationRow } from '@/components/ReconciliationTable';
import { SqlPanel } from '@/components/SqlPanel';

export const revalidate = 0;

interface SingleRunPageProps {
  params: Promise<{ id: string }>;
}

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
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Reconciliation Run #{run.id}</h1>
        <p className="page-subtitle">
          Executed on {new Date(run.run_date).toISOString().replace('T', ' ').slice(0, 16)} · Bank:{' '}
          <code style={{ color: 'var(--accent)' }}>{run.bank_filename}</code> · Internal:{' '}
          <code style={{ color: 'var(--accent)' }}>{run.internal_filename}</code>
        </p>
      </div>

      {/* Metric Cards for this run */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <StatCard
          label="Matched Records"
          value={run.matched_count}
          subtext="Amount & date aligned"
          variant="success"
        />
        <StatCard
          label="Amount/Date Mismatches"
          value={run.mismatched_count}
          subtext="Discrepancy detected"
          variant={run.mismatched_count > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Missing in Bank"
          value={run.missing_in_bank_count}
          subtext="In internal ledger only"
          variant={run.missing_in_bank_count > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Missing in Internal"
          value={run.missing_in_internal_count}
          subtext="In bank statement only"
          variant={run.missing_in_internal_count > 0 ? 'danger' : 'default'}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
          Reconciliation Results ({resultsRes.rows.length} records)
        </h2>
        <ReconciliationTable rows={resultsRes.rows} />
      </div>

      <SqlPanel query={resultsQuery} executionMs={executionMs} params={{ run_id: runId }} />
    </div>
  );
}
