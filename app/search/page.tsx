'use client';

import React, { useState } from 'react';
import { ReconciliationTable, ReconciliationRow } from '@/components/ReconciliationTable';
import { SqlPanel } from '@/components/SqlPanel';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [txnId, setTxnId] = useState('');
  const [status, setStatus] = useState('ALL');
  const [resolvedFilter, setResolvedFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [results, setResults] = useState<ReconciliationRow[]>([]);
  const [executedSql, setExecutedSql] = useState<string>('');
  const [executionMs, setExecutionMs] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const VALID_STATUSES = ['matched', 'mismatched', 'missing_in_bank', 'missing_in_internal'];
    if (status !== 'ALL' && !VALID_STATUSES.includes(status)) {
      alert('Invalid status filter selected.');
      return;
    }

    setLoading(true);

    // Build SQL string for demonstration and query execution
    let sql = `SELECT rr.id, rr.transaction_id, rr.match_status, rr.bank_amount,
       rr.internal_amount, rr.amount_diff, rr.bank_date, rr.internal_date,
       rr.notes, rr.resolved
FROM reconciliation_results rr
JOIN reconciliation_runs run ON rr.run_id = run.id
WHERE 1=1`;

    if (txnId.trim()) {
      sql += `\n  AND rr.transaction_id ILIKE '%${txnId.trim().replace(/'/g, "''")}%'`;
    }
    if (status !== 'ALL') {
      sql += `\n  AND rr.match_status = '${status}'`;
    }
    if (resolvedFilter === 'RESOLVED') {
      sql += `\n  AND rr.resolved = TRUE`;
    } else if (resolvedFilter === 'UNRESOLVED') {
      sql += `\n  AND rr.resolved = FALSE`;
    }
    if (fromDate) {
      sql += `\n  AND COALESCE(rr.bank_date, rr.internal_date) >= '${fromDate.replace(/'/g, '')}'`;
    }
    if (toDate) {
      sql += `\n  AND COALESCE(rr.bank_date, rr.internal_date) <= '${toDate.replace(/'/g, '')}'`;
    }

    sql += `\nORDER BY rr.created_at DESC\nLIMIT 100;`;

    setExecutedSql(sql);

    try {
      const res = await fetch('/api/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.rows || []);
        setExecutionMs(data.executionMs);
      } else {
        alert(data.error || 'Search failed');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to perform search');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div>
      <h1 className="page-title">Search Transactions & Discrepancies</h1>
      <p className="page-subtitle">Search across all past reconciliation records by reference, status, or date range</p>

      {/* Filter Form */}
      <form
        onSubmit={handleSearch}
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
            Transaction Reference
          </label>
          <input
            type="text"
            placeholder="e.g. TXN-001"
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
            Match Status
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%' }}>
            <option value="ALL">All Statuses</option>
            <option value="matched">Matched</option>
            <option value="mismatched">Mismatched</option>
            <option value="missing_in_bank">Missing in Bank</option>
            <option value="missing_in_internal">Missing in Internal</option>
          </select>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
            Resolution State
          </label>
          <select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="ALL">All Records</option>
            <option value="UNRESOLVED">Unresolved Only</option>
            <option value="RESOLVED">Resolved Only</option>
          </select>
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', height: '37px' }}>
            {loading ? (
              'Searching...'
            ) : (
              <>
                <Search size={15} /> Search Database
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Search Results ({results.length} records found)
          </h2>
          <ReconciliationTable rows={results} />
        </div>
      )}

      {executedSql && <SqlPanel query={executedSql} executionMs={executionMs} />}
    </div>
  );
}

