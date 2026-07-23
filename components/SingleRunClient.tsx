'use client';

import React, { useState } from 'react';
import { ReconciliationTable, ReconciliationRow } from '@/components/ReconciliationTable';
import { deleteRunAction } from '@/app/actions/delete-run';

interface SingleRunClientProps {
  runId: number;
  rows: ReconciliationRow[];
}

export const SingleRunClient: React.FC<SingleRunClientProps> = ({ runId, rows }) => {
  const [filter, setFilter] = useState<'ALL' | 'matched' | 'mismatched' | 'missing_in_bank' | 'missing_in_internal'>('ALL');
  const [deleting, setDeleting] = useState(false);

  const filteredRows = rows.filter((r) => {
    if (filter === 'ALL') return true;
    return r.match_status === filter;
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
    mismatched: rows.filter((r) => r.match_status === 'mismatched').length,
    missing_in_bank: rows.filter((r) => r.match_status === 'missing_in_bank').length,
    missing_in_internal: rows.filter((r) => r.match_status === 'missing_in_internal').length,
  };

  const filterButtons: { label: string; key: keyof typeof counts; color?: string }[] = [
    { label: `All (${counts.ALL})`, key: 'ALL' },
    { label: `Matched (${counts.matched})`, key: 'matched', color: 'var(--success)' },
    { label: `Mismatched (${counts.mismatched})`, key: 'mismatched', color: 'var(--warning)' },
    { label: `Missing Bank (${counts.missing_in_bank})`, key: 'missing_in_bank', color: 'var(--danger)' },
    { label: `Missing Internal (${counts.missing_in_internal})`, key: 'missing_in_internal', color: 'var(--danger)' },
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
          marginBottom: '16px',
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
                className="btn btn-secondary"
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {btn.label}
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
            style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
          >
            📥 Export CSV
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-ghost"
            style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--danger)' }}
          >
            {deleting ? 'Deleting...' : '🗑️ Delete Run'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>
          Reconciliation Results ({filteredRows.length} shown)
        </h2>
        <ReconciliationTable rows={filteredRows} />
      </div>
    </div>
  );
};
