'use client';

import React, { useState } from 'react';
import { ReconciliationTable, ReconciliationRow } from '@/components/ReconciliationTable';
import { deleteRunAction } from '@/app/actions/delete-run';
import { Download, Trash2 } from 'lucide-react';

interface SingleRunClientProps {
  runId: number;
  rows: ReconciliationRow[];
}

type FilterType = 'ALL' | 'matched' | 'amount_mismatch' | 'date_mismatch' | 'missing_in_bank' | 'missing_in_internal';

export const SingleRunClient: React.FC<SingleRunClientProps> = ({ runId, rows }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [deleting, setDeleting] = useState(false);

  const isAmountDiff = (r: ReconciliationRow) =>
    r.bank_amount !== null &&
    r.internal_amount !== null &&
    parseFloat(String(r.bank_amount)) !== parseFloat(String(r.internal_amount));

  const isDateDiff = (r: ReconciliationRow) =>
    r.bank_date &&
    r.internal_date &&
    String(r.bank_date).split('T')[0] !== String(r.internal_date).split('T')[0];

  const filteredRows = rows.filter((r) => {
    if (filter === 'ALL') return true;
    if (filter === 'matched') return r.match_status === 'matched';
    if (filter === 'amount_mismatch') return r.match_status === 'mismatched' && isAmountDiff(r);
    if (filter === 'date_mismatch') return r.match_status === 'mismatched' && isDateDiff(r);
    if (filter === 'missing_in_bank') return r.match_status === 'missing_in_bank';
    if (filter === 'missing_in_internal') return r.match_status === 'missing_in_internal';
    return true;
  });

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete Reconciliation Run #${runId}? This will remove all associated records.`)) {
      setDeleting(true);
      await deleteRunAction(runId);
    }
  };

  const counts = {
    ALL: rows.length,
    matched: rows.filter((r) => r.match_status === 'matched').length,
    amount_mismatch: rows.filter((r) => r.match_status === 'mismatched' && isAmountDiff(r)).length,
    date_mismatch: rows.filter((r) => r.match_status === 'mismatched' && isDateDiff(r)).length,
    missing_in_bank: rows.filter((r) => r.match_status === 'missing_in_bank').length,
    missing_in_internal: rows.filter((r) => r.match_status === 'missing_in_internal').length,
  };

  const filterButtons: { label: string; key: FilterType; count: number }[] = [
    { label: 'All', key: 'ALL', count: counts.ALL },
    { label: 'Matched', key: 'matched', count: counts.matched },
    { label: 'Amount Mismatches', key: 'amount_mismatch', count: counts.amount_mismatch },
    { label: 'Date Mismatches', key: 'date_mismatch', count: counts.date_mismatch },
    { label: 'Missing Bank', key: 'missing_in_bank', count: counts.missing_in_bank },
    { label: 'Missing Internal', key: 'missing_in_internal', count: counts.missing_in_internal },
  ];

  return (
    <div>
      {/* Action buttons & Filter bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filterButtons.map((btn) => {
            const isActive = filter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => setFilter(btn.key)}
                className="btn"
                style={{
                  fontSize: '12px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {btn.label}{' '}
                <span
                  style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? 'var(--border)' : 'var(--bg-elevated)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href={`/api/export/${runId}`}
            download
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px', textDecoration: 'none' }}
          >
            <Download size={14} /> Export CSV
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-ghost"
            style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--danger)' }}
          >
            <Trash2 size={14} /> {deleting ? 'Deleting...' : 'Delete Run'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
          Reconciliation Results ({filteredRows.length} shown)
        </h2>
        <ReconciliationTable rows={filteredRows} />
      </div>
    </div>
  );
};

