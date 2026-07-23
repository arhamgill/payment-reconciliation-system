import { pool } from '@/lib/db';
import { ReconciliationTable, ReconciliationRow } from '@/components/ReconciliationTable';
import { SqlPanel } from '@/components/SqlPanel';

export const revalidate = 0;

const UNRESOLVED_ISSUES_QUERY = `SELECT rr.id, rr.transaction_id, rr.match_status, rr.bank_amount,
       rr.internal_amount, rr.amount_diff, rr.bank_date, rr.internal_date,
       rr.notes, rr.resolved
FROM reconciliation_results rr
WHERE rr.resolved = FALSE
  AND rr.match_status != 'matched'
ORDER BY ABS(COALESCE(rr.amount_diff, 0)) DESC, rr.created_at DESC;`;

export default async function IssuesPage() {
  const start = Date.now();

  const res = await pool.query<ReconciliationRow>(UNRESOLVED_ISSUES_QUERY);

  const executionMs = Date.now() - start;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Unresolved Discrepancies</h1>
        <p className="page-subtitle">
          Active payment mismatches requiring manual inspection or product operations resolution ({res.rows.length} open issues)
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <ReconciliationTable rows={res.rows} />
      </div>

      <SqlPanel query={UNRESOLVED_ISSUES_QUERY} executionMs={executionMs} />
    </div>
  );
}
