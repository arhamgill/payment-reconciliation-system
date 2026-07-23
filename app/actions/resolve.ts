'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';

export async function resolveAction(resultId: number, notes: string, resolvedBy: string) {
  // Update result row
  const res = await pool.query<{ run_id: number }>(
    `
    UPDATE reconciliation_results
    SET resolved = TRUE, notes = $2, resolved_by = $3, resolved_at = NOW()
    WHERE id = $1
    RETURNING run_id;
  `,
    [resultId, notes, resolvedBy]
  );

  if (res.rows.length > 0) {
    const runId = res.rows[0].run_id;

    // Check if any open (unresolved) issues remain for this run
    const openCheck = await pool.query<{ count: string }>(
      `
      SELECT COUNT(*) AS count
      FROM reconciliation_results
      WHERE run_id = $1
        AND resolved = FALSE
        AND match_status != 'matched';
    `,
      [runId]
    );

    const remainingOpen = parseInt(openCheck.rows[0]?.count || '0', 10);
    if (remainingOpen === 0) {
      await pool.query(
        `UPDATE reconciliation_runs SET status = 'discrepancies_resolved' WHERE id = $1;`,
        [runId]
      );
    }
  }

  revalidatePath('/');
  revalidatePath('/issues');
  revalidatePath('/runs');
}
