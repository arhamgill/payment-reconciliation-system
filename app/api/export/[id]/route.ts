import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const runId = parseInt(idStr, 10);

    if (isNaN(runId)) {
      return NextResponse.json({ error: 'Invalid run ID' }, { status: 400 });
    }

    const res = await pool.query<{
      transaction_id: string;
      match_status: string;
      bank_amount: number | string | null;
      internal_amount: number | string | null;
      amount_diff: number | string | null;
      bank_date: string | null;
      internal_date: string | null;
      resolved: boolean;
      notes: string | null;
    }>(
      `SELECT transaction_id, match_status, bank_amount, internal_amount,
              amount_diff, bank_date, internal_date, resolved, notes
       FROM reconciliation_results
       WHERE run_id = $1
       ORDER BY transaction_id ASC;`,
      [runId]
    );

    const headers = [
      'Transaction ID',
      'Match Status',
      'Bank Amount',
      'Internal Amount',
      'Difference',
      'Bank Date',
      'Internal Date',
      'Resolved',
      'Notes',
    ];

    const rows = res.rows.map((r) => [
      `"${r.transaction_id || ''}"`,
      `"${r.match_status || ''}"`,
      r.bank_amount ?? '',
      r.internal_amount ?? '',
      r.amount_diff ?? '',
      r.bank_date ? new Date(r.bank_date).toISOString().split('T')[0] : '',
      r.internal_date ? new Date(r.internal_date).toISOString().split('T')[0] : '',
      r.resolved ? 'TRUE' : 'FALSE',
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reconciliation-run-${runId}.csv"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Export failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
