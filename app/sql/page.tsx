'use client';

import React, { useState, useEffect } from 'react';
import { SqlEditor } from '@/components/SqlEditor';
import { Play, Check, AlertCircle } from 'lucide-react';

const SQL_TEMPLATES = [
  {
    label: '1. Find all mismatches across all runs',
    sql: `SELECT rr.transaction_id, rr.match_status,
  rr.bank_amount, rr.internal_amount, rr.amount_diff,
  run.bank_filename, run.run_date::date
FROM reconciliation_results rr
JOIN reconciliation_runs run ON rr.run_id = run.id
WHERE rr.match_status != 'matched'
ORDER BY ABS(rr.amount_diff) DESC NULLS LAST;`,
  },
  {
    label: '2. Top 10 largest amount discrepancies',
    sql: `SELECT transaction_id, bank_amount, internal_amount,
  ABS(amount_diff) AS abs_diff, match_status
FROM reconciliation_results
WHERE match_status = 'mismatched'
  AND amount_diff IS NOT NULL
  AND amount_diff != 0
ORDER BY ABS(amount_diff) DESC
LIMIT 10;`,
  },
  {
    label: '3. Transactions missing in bank',
    sql: `SELECT rr.transaction_id, rr.internal_amount,
  rr.internal_date, run.internal_filename, run.run_date::date
FROM reconciliation_results rr
JOIN reconciliation_runs run ON rr.run_id = run.id
WHERE rr.match_status = 'missing_in_bank'
ORDER BY run.run_date DESC;`,
  },
  {
    label: '4. Unresolved issues older than 7 days',
    sql: `SELECT rr.transaction_id, rr.match_status,
  rr.amount_diff, run.run_date::date,
  NOW()::date - run.run_date::date AS days_open
FROM reconciliation_results rr
JOIN reconciliation_runs run ON rr.run_id = run.id
WHERE rr.resolved = FALSE
  AND rr.match_status != 'matched'
  AND run.run_date < NOW() - INTERVAL '7 days'
ORDER BY run.run_date ASC;`,
  },
  {
    label: '5. Match rate by run summary',
    sql: `SELECT
  id AS run_id,
  run_date::date,
  bank_filename,
  total_bank_records + total_internal_records AS total_records,
  matched_count,
  ROUND(matched_count::numeric / NULLIF(matched_count + mismatched_count + missing_in_bank_count + missing_in_internal_count, 0) * 100, 1) AS match_rate_pct,
  status
FROM reconciliation_runs
ORDER BY run_date DESC;`,
  },
  {
    label: '6. Daily upload volume',
    sql: `SELECT
  run_date::date AS upload_date,
  COUNT(*)       AS runs_count,
  SUM(total_bank_records + total_internal_records) AS total_records
FROM reconciliation_runs
GROUP BY run_date::date
ORDER BY upload_date DESC;`,
  },
  {
    label: '7. Transactions by currency breakdown',
    sql: `SELECT currency,
  COUNT(*) AS transaction_count,
  SUM(amount) AS total_amount,
  ROUND(AVG(amount), 2) AS avg_amount
FROM bank_transactions
GROUP BY currency
ORDER BY total_amount DESC;`,
  },
  {
    label: '8. Full reconciliation results for latest run',
    sql: `SELECT rr.transaction_id, rr.match_status,
  rr.bank_amount, rr.internal_amount, rr.amount_diff,
  rr.bank_date, rr.internal_date, rr.resolved, rr.notes
FROM reconciliation_results rr
WHERE rr.run_id = (SELECT MAX(id) FROM reconciliation_runs)
ORDER BY
  CASE
    WHEN rr.resolved = FALSE AND rr.match_status != 'matched' THEN 1
    WHEN rr.resolved = TRUE  AND rr.match_status != 'matched' THEN 2
    ELSE 3
  END,
  CASE rr.match_status
    WHEN 'mismatched'          THEN 1
    WHEN 'missing_in_bank'     THEN 2
    WHEN 'missing_in_internal' THEN 3
    ELSE 4
  END;`,
  },

];

export default function SqlWorkbenchPage() {
  const [query, setQuery] = useState(SQL_TEMPLATES[0].sql);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [rowCount, setRowCount] = useState<number | null>(null);
  const [executionMs, setExecutionMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sql_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveHistory = (q: string) => {
    const next = [q, ...history.filter((item) => item !== q)].slice(0, 10);
    setHistory(next);
    try {
      localStorage.setItem('sql_history', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleRun = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setColumns([]);
    setRows([]);

    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Query failed');
      } else {
        setColumns(data.columns || []);
        setRows(data.rows || []);
        setRowCount(data.rowCount);
        setExecutionMs(data.executionMs);
        saveHistory(query);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">SQL Workbench</h1>
          <p className="page-subtitle">
            Execute ad-hoc SQL queries against live PostgreSQL data · Read-only mode (SELECT queries only)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="section-label" style={{ fontSize: '11px' }}>
            Template Queries:
          </label>
          <select
            onChange={(e) => {
              const selected = SQL_TEMPLATES.find((t) => t.sql === e.target.value);
              if (selected) setQuery(selected.sql);
            }}
            style={{ maxWidth: '320px' }}
          >
            {SQL_TEMPLATES.map((t, idx) => (
              <option key={idx} value={t.sql}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Box */}
      <div style={{ marginBottom: '16px' }}>
        <SqlEditor value={query} onChange={setQuery} onRun={handleRun} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleRun}
          disabled={loading}
          style={{ padding: '8px 20px' }}
        >
          {loading ? (
            'Executing Query...'
          ) : (
            <>
              <Play size={14} fill="currentColor" /> Run Query
            </>
          )}
        </button>

        {executionMs !== null && rowCount !== null && !error && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={14} style={{ color: 'var(--success)' }} /> {rowCount} rows returned · Executed in {executionMs}ms
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--danger-soft)',
            border: '1px solid var(--danger)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '13px',
            fontFamily: "'Fira Code', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Results Table */}
      {columns.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Query Results</h2>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px', maxHeight: '500px', backgroundColor: 'var(--bg-surface)' }}>
            <table>
              <thead>
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} style={{ whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Query returned 0 rows.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {columns.map((col, cIdx) => {
                        const val = row[col];
                        let rendered = '—';
                        if (val !== null && val !== undefined) {
                          if (typeof val === 'object') rendered = JSON.stringify(val);
                          else rendered = String(val);
                        }
                        return (
                          <td key={cIdx} style={{ fontFamily: "'Fira Code', monospace", fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                            {rendered}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Query History */}
      {history.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <h3 className="section-label" style={{ marginBottom: '12px' }}>
            Recent Query History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map((hQuery, idx) => (
              <div
                key={idx}
                onClick={() => setQuery(hQuery)}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontFamily: "'Fira Code', monospace",
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.15s ease',
                }}
                title="Click to load into editor"
              >
                {hQuery.replace(/\s+/g, ' ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

