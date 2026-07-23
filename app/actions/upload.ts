'use server';

import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';
import { parseCsvBuffer } from '@/lib/csv-parser';
import { runReconciliation } from '@/lib/reconcile';

export async function uploadAction(formData: FormData) {
  const bankFile = formData.get('bank_file') as File;
  const internalFile = formData.get('internal_file') as File;

  if (!bankFile || !internalFile) {
    throw new Error('Both bank and internal CSV files are required.');
  }

  const bankBuffer = Buffer.from(await bankFile.arrayBuffer());
  const internalBuffer = Buffer.from(await internalFile.arrayBuffer());

  const bankRows = parseCsvBuffer(bankBuffer);
  const internalRows = parseCsvBuffer(internalBuffer);

  // Create the run record
  const runResult = await pool.query<{ id: number }>(
    `
    INSERT INTO reconciliation_runs (bank_filename, internal_filename, total_bank_records, total_internal_records)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `,
    [bankFile.name, internalFile.name, bankRows.length, internalRows.length]
  );

  const runId = runResult.rows[0].id;

  // Bulk insert bank transactions
  for (const row of bankRows) {
    await pool.query(
      `
      INSERT INTO bank_transactions (run_id, transaction_id, amount, currency, transaction_date, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
      [runId, row.transaction_id, row.amount, row.currency, row.transaction_date, row.description, row.status]
    );
  }

  // Bulk insert internal transactions
  for (const row of internalRows) {
    await pool.query(
      `
      INSERT INTO internal_transactions (run_id, transaction_id, amount, currency, transaction_date, description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
      [runId, row.transaction_id, row.amount, row.currency, row.transaction_date, row.description, row.status]
    );
  }

  // Run reconciliation
  await runReconciliation(runId);

  revalidatePath('/');
  revalidatePath('/runs');
  revalidatePath('/issues');

  redirect(`/runs/${runId}`);
}
