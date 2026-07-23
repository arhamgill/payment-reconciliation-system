import { pool } from './db';

export async function runReconciliation(runId: number): Promise<{
  matched: number;
  mismatched: number;
  missingInBank: number;
  missingInInternal: number;
}> {
  // Step 1: Full outer join to find all combinations and classify granular status
  const reconcileSQL = `
    INSERT INTO reconciliation_results
      (run_id, transaction_id, match_status,
       bank_amount, internal_amount, amount_diff,
       bank_date, internal_date)
    SELECT
      $1 AS run_id,
      COALESCE(b.transaction_id, i.transaction_id) AS transaction_id,
      CASE
        WHEN b.transaction_id IS NULL                                   THEN 'missing_in_bank'
        WHEN i.transaction_id IS NULL                                   THEN 'missing_in_internal'
        WHEN b.amount <> i.amount AND b.transaction_date <> i.transaction_date
                                                                        THEN 'amount_and_date_mismatch'
        WHEN b.amount <> i.amount                                        THEN 'amount_mismatch'
        WHEN b.transaction_date <> i.transaction_date                    THEN 'date_mismatch'
        ELSE                                                                 'matched'
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
    WHERE COALESCE(b.run_id, i.run_id) = $1;
  `;
  await pool.query(reconcileSQL, [runId]);

  // Step 2: Count each category
  const countResult = await pool.query<{
    matched: string;
    mismatched: string;
    missing_in_bank: string;
    missing_in_internal: string;
  }>(
    `
    SELECT
      COUNT(*) FILTER (WHERE match_status = 'matched')            AS matched,
      COUNT(*) FILTER (WHERE match_status IN ('mismatched', 'amount_mismatch', 'date_mismatch', 'amount_and_date_mismatch')) AS mismatched,
      COUNT(*) FILTER (WHERE match_status = 'missing_in_bank')    AS missing_in_bank,
      COUNT(*) FILTER (WHERE match_status = 'missing_in_internal') AS missing_in_internal
    FROM reconciliation_results
    WHERE run_id = $1;
  `,
    [runId]
  );

  const counts = countResult.rows[0];
  const matched = parseInt(counts.matched || '0', 10);
  const mismatched = parseInt(counts.mismatched || '0', 10);
  const missingInBank = parseInt(counts.missing_in_bank || '0', 10);
  const missingInInternal = parseInt(counts.missing_in_internal || '0', 10);

  // Step 3: Update the run row with final counts and run health status
  const totalIssues = mismatched + missingInBank + missingInInternal;
  const runStatus = totalIssues === 0 ? 'fully_balanced' : 'discrepancies_found';

  await pool.query(
    `
    UPDATE reconciliation_runs SET
      matched_count             = $2,
      mismatched_count          = $3,
      missing_in_bank_count     = $4,
      missing_in_internal_count = $5,
      status                    = $6
    WHERE id = $1;
  `,
    [runId, matched, mismatched, missingInBank, missingInInternal, runStatus]
  );

  return { matched, mismatched, missingInBank, missingInInternal };
}
