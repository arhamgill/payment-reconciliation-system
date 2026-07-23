'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { pool } from '@/lib/db';

export async function deleteRunAction(runId: number) {
  await pool.query('DELETE FROM reconciliation_runs WHERE id = $1', [runId]);
  revalidatePath('/runs');
  revalidatePath('/');
  revalidatePath('/issues');
  redirect('/runs');
}
