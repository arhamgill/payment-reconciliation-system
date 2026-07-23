import Link from 'next/link';
import { pool } from '@/lib/db';
import { StatusChip } from '@/components/StatusChip';
import { SqlPanel } from '@/components/SqlPanel';

export const revalidate = 0;

const ALL_RUNS_QUERY = `SELECT id, run_date, bank_filename, internal_filename,
       total_bank_records, total_internal_records,
       matched_count, mismatched_count,
       missing_in_bank_count, missing_in_internal_count,
       ROUND(
         matched_count::numeric / NULLIF(matched_count + mismatched_count + missing_in_bank_count + missing_in_internal_count, 0) * 100,
         1
       ) AS match_pct,
       status
FROM reconciliation_runs
ORDER BY run_date DESC;`;

export default async function AllRunsPage() {
  const start = Date.now();

  const res = await pool.query<{
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
    match_pct: number | string | null;
    status: string;
  }>(ALL_RUNS_QUERY);

  const executionMs = Date.now() - start;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Reconciliation Runs History</h1>
          <p className="page-subtitle">Historical list of all batch payment reconciliation executions</p>
        </div>
        <Link href="/upload" className="btn btn-primary">
          + New Run
        </Link>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '4px' }}>
        <table>
          <thead>
            <tr>
              <th>Run #</th>
              <th>Execution Date</th>
              <th>Bank File</th>
              <th>Internal File</th>
              <th>Bank Recs</th>
              <th>Internal Recs</th>
              <th>Matched</th>
              <th>Mismatched</th>
              <th>Missing (Bank)</th>
              <th>Missing (Internal)</th>
              <th>Match Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {res.rows.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  No reconciliation runs executed yet.
                </td>
              </tr>
            ) : (
              res.rows.map((run) => (
                <tr key={run.id}>
                  <td>
                    <Link
                      href={`/runs/${run.id}`}
                      style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      #{run.id}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(run.run_date).toISOString().replace('T', ' ').slice(0, 16)}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{run.bank_filename}</td>
                  <td style={{ fontFamily: 'monospace' }}>{run.internal_filename}</td>
                  <td>{run.total_bank_records}</td>
                  <td>{run.total_internal_records}</td>
                  <td style={{ color: 'var(--success)' }}>{run.matched_count}</td>
                  <td style={{ color: run.mismatched_count > 0 ? 'var(--warning)' : 'inherit' }}>
                    {run.mismatched_count}
                  </td>
                  <td style={{ color: run.missing_in_bank_count > 0 ? 'var(--danger)' : 'inherit' }}>
                    {run.missing_in_bank_count}
                  </td>
                  <td style={{ color: run.missing_in_internal_count > 0 ? 'var(--danger)' : 'inherit' }}>
                    {run.missing_in_internal_count}
                  </td>
                  <td style={{ fontWeight: 600, color: run.match_pct && Number(run.match_pct) === 100 ? 'var(--success)' : 'var(--accent)' }}>
                    {run.match_pct !== null && run.match_pct !== undefined ? `${run.match_pct}%` : '—'}
                  </td>
                  <td>
                    <StatusChip status={run.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SqlPanel query={ALL_RUNS_QUERY} executionMs={executionMs} />
    </div>
  );
}
