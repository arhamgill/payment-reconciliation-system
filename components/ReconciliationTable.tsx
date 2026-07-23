'use client';

import React, { useState } from 'react';
import { StatusChip } from './StatusChip';
import { ResolveModal } from './ResolveModal';

export interface ReconciliationRow {
  id: number;
  transaction_id: string;
  match_status: string;
  bank_amount: number | string | null;
  internal_amount: number | string | null;
  amount_diff: number | string | null;
  bank_date: string | null;
  internal_date: string | null;
  notes: string | null;
  resolved: boolean;
}

interface ReconciliationTableProps {
  rows: ReconciliationRow[];
}

export const ReconciliationTable: React.FC<ReconciliationTableProps> = ({ rows }) => {
  const [activeResolve, setActiveResolve] = useState<{ id: number; transactionId: string } | null>(null);

  const formatAmount = (val: number | string | null) => {
    if (val === null || val === undefined) return '—';
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? '—' : `$${num.toFixed(2)}`;
  };

  const formatDate = (val: string | null | Date) => {
    if (!val) return '—';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val).split('T')[0];
    return d.toISOString().split('T')[0];
  };

  return (
    <>
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '4px' }}>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Status</th>
              <th>Bank Amount</th>
              <th>Internal Amount</th>
              <th>Difference</th>
              <th>Bank Date</th>
              <th>Internal Date</th>
              <th>Resolved</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  No transaction records found matching filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const formattedBankDate = formatDate(row.bank_date);
                const formattedInternalDate = formatDate(row.internal_date);
                const isDateMismatch =
                  row.bank_date &&
                  row.internal_date &&
                  formattedBankDate !== '—' &&
                  formattedInternalDate !== '—' &&
                  formattedBankDate !== formattedInternalDate;

                return (
                  <tr key={row.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.transaction_id}</td>
                    <td>
                      <StatusChip
                        status={row.match_status}
                        bankAmount={row.bank_amount}
                        internalAmount={row.internal_amount}
                        bankDate={row.bank_date}
                        internalDate={row.internal_date}
                      />
                    </td>
                    <td>{formatAmount(row.bank_amount)}</td>
                    <td>{formatAmount(row.internal_amount)}</td>
                    <td
                      style={{
                        color:
                          row.amount_diff && parseFloat(String(row.amount_diff)) !== 0
                            ? 'var(--warning)'
                            : 'inherit',
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatAmount(row.amount_diff)}
                    </td>
                    <td style={{ color: isDateMismatch ? '#fbbf24' : 'inherit', fontWeight: isDateMismatch ? 600 : 400 }}>
                      {formattedBankDate}
                    </td>
                    <td style={{ color: isDateMismatch ? '#fbbf24' : 'inherit', fontWeight: isDateMismatch ? 600 : 400 }}>
                      {formattedInternalDate}
                    </td>
                  <td>
                    {row.resolved ? (
                      <span style={{ color: 'var(--success)', fontSize: '12px' }}>✓ Resolved</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td>
                    {!row.resolved && row.match_status !== 'matched' ? (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                        onClick={() => setActiveResolve({ id: row.id, transactionId: row.transaction_id })}
                      >
                        Resolve
                      </button>
                    ) : row.notes ? (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }} title={row.notes}>
                        Notes: {row.notes.slice(0, 15)}...
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {activeResolve && (
        <ResolveModal
          resultId={activeResolve.id}
          transactionId={activeResolve.transactionId}
          onClose={() => setActiveResolve(null)}
        />
      )}
    </>
  );
};
