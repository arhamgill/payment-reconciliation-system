import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

const FORBIDDEN = ['insert', 'update', 'delete', 'drop', 'truncate', 'alter', 'create'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body || {};

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'No query provided.' }, { status: 400 });
    }

    const trimmed = query.trim();
    const lower = trimmed.toLowerCase();

    if (!lower.startsWith('select')) {
      return NextResponse.json({ error: 'Only SELECT queries are permitted.' }, { status: 400 });
    }

    for (const word of FORBIDDEN) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(trimmed)) {
        return NextResponse.json({ error: `Forbidden keyword detected: ${word.toUpperCase()}` }, { status: 400 });
      }
    }

    const finalQuery = lower.includes('limit') ? trimmed : `${trimmed} LIMIT 500`;

    const start = Date.now();
    const result = await pool.query(finalQuery);
    const executionMs = Date.now() - start;

    return NextResponse.json({
      columns: result.fields.map((f) => f.name),
      rows: result.rows,
      rowCount: result.rowCount,
      executionMs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Query execution failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
