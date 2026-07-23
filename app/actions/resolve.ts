'use server';

import { revalidatePath } from 'next/cache';
import { pool } from '@/lib/db';

export async function resolveAction(resultId: number, notes: string, resolvedBy: string) {
  await pool.query(
    `
    UPDATE reconciliation_results
    SET resolved = TRUE, notes = $2, resolved_by = $3, resolved_at = NOW()
    WHERE id = $1;
  `,
    [resultId, notes, resolvedBy]
  );

  revalidatePath('/issues');
  revalidatePath('/runs');
}
