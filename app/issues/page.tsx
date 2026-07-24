import { pool } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { ReconciliationTable, ReconciliationRow } from '@/components/ReconciliationTable';
import { SqlPanel } from '@/components/SqlPanel';

export const revalidate = 0;

const ISSUES_STATS_QUERY = `SELECT
  COUNT(*) FILTER (WHERE resolved = FALSE AND match_status != 'matched') AS open_issues,
  COUNT(*) FILTER (WHERE resolved = TRUE AND match_status != 'matched')  AS resolved_issues,
  COUNT(*) FILTER (WHERE match_status != 'matched')                     AS total_issues
FROM reconciliation_results;`;

const UNRESOLVED_ISSUES_QUERY = `SELECT rr.id, rr.transaction_id, rr.match_status, rr.bank_amount,
       rr.internal_amount, rr.amount_diff, rr.bank_date, rr.internal_date,
       rr.notes, rr.resolved
FROM reconciliation_results rr
WHERE rr.resolved = FALSE
  AND rr.match_status != 'matched'
ORDER BY ABS(COALESCE(rr.amount_diff, 0)) DESC, rr.created_at DESC;`;

export default async function IssuesPage() {
  const start = Date.now();

  const [statsRes, res] = await Promise.all([
    pool.query<{ open_issues: string; resolved_issues: string; total_issues: string }>(ISSUES_STATS_QUERY),
    pool.query<ReconciliationRow>(UNRESOLVED_ISSUES_QUERY),
  ]);

  const executionMs = Date.now() - start;
  const stats = statsRes.rows[0];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="page-title">Unresolved Discrepancies</h1>
        <p className="page-subtitle">
          Active payment mismatches requiring manual inspection or product operations resolution
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
        <StatCard
          label="Open Discrepancies"
          value={stats.open_issues || 0}
          subtext="Requires manual action"
          variant={Number(stats.open_issues) > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Resolved Issues"
          value={stats.resolved_issues || 0}
          subtext="Manually reviewed & resolved"
          variant="success"
        />
        <StatCard
          label="Total Historical Discrepancies"
          value={stats.total_issues || 0}
          subtext="Across all reconciliation runs"
          variant="default"
        />
      </div>

      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Open Action Items ({res.rows.length} pending)
        </h2>
        <ReconciliationTable rows={res.rows} />
      </div>

      <SqlPanel query={UNRESOLVED_ISSUES_QUERY} executionMs={executionMs} />
    </div>
  );
}

