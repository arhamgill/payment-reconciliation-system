'use client';

import React, { useState } from 'react';
import { StatusChip } from './StatusChip';
import { ResolveModal } from './ResolveModal';
import { Check, ArrowRight, ArrowUpRight, AlertTriangle, AlertCircle } from 'lucide-react';

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
      <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-base)' }}>
        <table>
          <thead>
            <tr>
              <th style={{ paddingLeft: '16px' }}>Transaction ID</th>
              <th>Status</th>
              <th>Bank Amount</th>
              <th>Internal Amount</th>
              <th>Difference</th>
              <th>Bank Date</th>
              <th>Internal Date</th>
              <th>Resolved</th>
              <th style={{ textAlign: 'right', paddingRight: '16px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                  No transaction records found matching filter criteria.
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

                const isMatched = row.match_status === 'matched';
                const isIssue = !isMatched && !row.resolved;

                return (
                  <tr key={row.id}>
                    <td style={{ paddingLeft: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Resend-style Neutral Row Icon Badge */}
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#141414',
                            border: '1px solid #222222',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#888888',
                          }}
                        >
                          {isMatched || row.resolved ? <ArrowUpRight size={14} /> : <AlertCircle size={14} />}
                        </div>

                        <span style={{ fontFamily: "'Fira Code', monospace", fontWeight: 500, color: '#ffffff', fontSize: '13px' }}>
                          {row.transaction_id}
                        </span>
                      </div>
                    </td>

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

                    <td style={{ fontFamily: "'Fira Code', monospace", color: '#ffffff' }}>
                      {formatAmount(row.amount_diff)}
                    </td>

                    <td style={{ color: 'var(--text-secondary)' }}>
                      {formattedBankDate}
                    </td>

                    <td style={{ color: 'var(--text-secondary)' }}>
                      {formattedInternalDate}
                    </td>

                    <td>
                      {row.resolved ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ffffff', fontSize: '12px', fontWeight: 500 }}>
                          <Check size={14} /> Resolved
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      {!row.resolved && row.match_status !== 'matched' ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '11.5px', padding: '3px 10px' }}
                          onClick={() => setActiveResolve({ id: row.id, transactionId: row.transaction_id })}
                        >
                          Resolve <ArrowRight size={12} />
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


