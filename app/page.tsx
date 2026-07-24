import Link from 'next/link';
import { pool } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { StatusChip } from '@/components/StatusChip';
import { SqlPanel } from '@/components/SqlPanel';
import { Plus, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const DASHBOARD_QUERY = `SELECT
  run_date::date                                                          AS date,
  bank_filename,
  internal_filename,
  (total_bank_records + total_internal_records)                           AS total_records,
  matched_count,
  (mismatched_count + missing_in_bank_count + missing_in_internal_count) AS issues,
  ROUND(matched_count::numeric / NULLIF(matched_count + mismatched_count + missing_in_bank_count + missing_in_internal_count, 0) * 100, 1) AS match_pct,
  status
FROM reconciliation_runs
ORDER BY run_date DESC
LIMIT 10;`;

export default async function DashboardPage() {
  const start = Date.now();

  // Execute all 3 dashboard queries concurrently in parallel
  const [statsRes, overallRes, recentRunsRes] = await Promise.all([
    pool.query<{
      runs_today: string;
      total_records: string;
      mismatches: string;
      matched: string;
    }>(`
      SELECT
        COUNT(*) FILTER (WHERE run_date::date = CURRENT_DATE) AS runs_today,
        COALESCE(SUM(total_bank_records + total_internal_records) FILTER (WHERE run_date::date = CURRENT_DATE), 0) AS total_records,
        COALESCE(SUM(mismatched_count + missing_in_bank_count + missing_in_internal_count) FILTER (WHERE run_date::date = CURRENT_DATE), 0) AS mismatches,
        COALESCE(SUM(matched_count) FILTER (WHERE run_date::date = CURRENT_DATE), 0) AS matched
      FROM reconciliation_runs;
    `),
    pool.query<{
      total_runs: string;
      total_records: string;
      mismatches: string;
      matched: string;
    }>(`
      SELECT
        COUNT(*) AS total_runs,
        COALESCE(SUM(total_bank_records + total_internal_records), 0) AS total_records,
        COALESCE(SUM(mismatched_count + missing_in_bank_count + missing_in_internal_count), 0) AS mismatches,
        COALESCE(SUM(matched_count), 0) AS matched
      FROM reconciliation_runs;
    `),
    pool.query<{
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
    }>(`
      SELECT id, run_date, bank_filename, internal_filename,
             total_bank_records, total_internal_records,
             matched_count, mismatched_count,
             missing_in_bank_count, missing_in_internal_count,
             status
      FROM reconciliation_runs
      ORDER BY run_date DESC
      LIMIT 10;
    `),
  ]);

  const executionMs = Date.now() - start;

  const todayStats = statsRes.rows[0];
  const overallStats = overallRes.rows[0];

  const runsCount = parseInt(todayStats.runs_today || '0', 10);
  const totalRecords = parseInt(runsCount > 0 ? todayStats.total_records : overallStats.total_records, 10);
  const mismatches = parseInt(runsCount > 0 ? todayStats.mismatches : overallStats.mismatches, 10);
  const matched = parseInt(runsCount > 0 ? todayStats.matched : overallStats.matched, 10);
  const totalReconciledItems = matched + mismatches;
  const matchRate = totalReconciledItems > 0 ? ((matched / totalReconciledItems) * 100).toFixed(1) + '%' : '100%';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Operations Dashboard</h1>
          <p className="page-subtitle">Overview of payment reconciliation runs & mismatch metrics</p>
        </div>
        <Link href="/upload" className="btn btn-primary">
          <Plus size={16} /> New Reconciliation Run
        </Link>
      </div>

      {/* Top Stat Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard
          label={runsCount > 0 ? "Runs Today" : "Total Runs"}
          value={runsCount > 0 ? runsCount : overallStats.total_runs}
          subtext="Reconciliation batches"
        />
        <StatCard
          label={runsCount > 0 ? "Processed Today" : "Total Processed"}
          value={totalRecords.toLocaleString()}
          subtext="Total transaction rows"
        />
        <StatCard
          label={runsCount > 0 ? "Mismatches Today" : "Total Mismatches"}
          value={mismatches.toLocaleString()}
          subtext="Requires resolution"
        />
        <StatCard
          label="Match Rate"
          value={matchRate}
          subtext="Accuracy ratio"
        />
      </div>

      {/* Recent Runs Section */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Recent Reconciliation Runs</h2>
          <Link href="/runs" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Runs <ArrowRight size={12} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
          <table style={{ minWidth: '980px' }}>
            <thead>
              <tr>
                <th>Run #</th>
                <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th style={{ whiteSpace: 'nowrap' }}>Bank File</th>
                <th style={{ whiteSpace: 'nowrap' }}>Internal File</th>
                <th style={{ whiteSpace: 'nowrap' }}>Bank Recs</th>
                <th style={{ whiteSpace: 'nowrap' }}>Internal Recs</th>
                <th style={{ whiteSpace: 'nowrap' }}>Matched</th>
                <th style={{ whiteSpace: 'nowrap' }}>Issues</th>
                <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap', minWidth: '130px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentRunsRes.rows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No reconciliation runs executed yet. Upload CSV files to begin.
                  </td>
                </tr>
              ) : (
                recentRunsRes.rows.map((run) => {
                  const issues = run.mismatched_count + run.missing_in_bank_count + run.missing_in_internal_count;
                  return (
                    <tr key={run.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <Link
                          href={`/runs/${run.id}`}
                          style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none', fontFamily: "'Fira Code', monospace" }}
                        >
                          #{run.id}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(run.run_date).toISOString().replace('T', ' ').slice(0, 16)}
                      </td>
                      <td style={{ fontFamily: "'Fira Code', monospace", whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{run.bank_filename}</td>
                      <td style={{ fontFamily: "'Fira Code', monospace", whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{run.internal_filename}</td>
                      <td>{run.total_bank_records}</td>
                      <td>{run.total_internal_records}</td>
                      <td>{run.matched_count}</td>
                      <td>{issues}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <StatusChip status={run.status} />
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <Link
                          href={`/runs/${run.id}`}
                          className="btn btn-secondary"
                          style={{
                            fontSize: '11px',
                            padding: '4px 10px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Details <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>


      <SqlPanel query={DASHBOARD_QUERY} executionMs={executionMs} />
    </div>
  );
}

