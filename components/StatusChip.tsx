import React from 'react';

interface StatusChipProps {
  status: string;
  bankAmount?: number | string | null;
  internalAmount?: number | string | null;
  bankDate?: string | null;
  internalDate?: string | null;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  bankAmount,
  internalAmount,
  bankDate,
  internalDate,
}) => {
  const normalized = status.toLowerCase();

  let effectiveStatus = normalized;
  if (normalized === 'mismatched') {
    const isAmountDifferent =
      bankAmount !== undefined &&
      internalAmount !== undefined &&
      bankAmount !== null &&
      internalAmount !== null &&
      parseFloat(String(bankAmount)) !== parseFloat(String(internalAmount));

    const isDateDifferent =
      bankDate &&
      internalDate &&
      String(bankDate).split('T')[0] !== String(internalDate).split('T')[0];

    if (isAmountDifferent && isDateDifferent) {
      effectiveStatus = 'amount_and_date_mismatch';
    } else if (isDateDifferent) {
      effectiveStatus = 'date_mismatch';
    } else if (isAmountDifferent) {
      effectiveStatus = 'amount_mismatch';
    }
  }

  let color = 'var(--text-secondary)';
  let bg = 'var(--bg-elevated)';
  let label = status.charAt(0).toUpperCase() + status.slice(1);

  if (effectiveStatus === 'discrepancies_found') {
    color = '#f59e0b';
    bg = '#1c1202';
    label = 'Discrepancies Found';
  } else if (effectiveStatus === 'discrepancies_resolved' || effectiveStatus === 'all_resolved') {
    color = '#10b981';
    bg = '#042f2e';
    label = 'Discrepancies Resolved';
  } else if (effectiveStatus === 'fully_balanced' || effectiveStatus === 'completed') {
    color = '#22c55e';
    bg = '#052e16';
    label = 'Fully Balanced';
  } else if (effectiveStatus === 'processing') {
    color = '#3b82f6';
    bg = '#0a192f';
    label = 'Processing';
  } else if (effectiveStatus === 'failed') {
    color = '#ef4444';
    bg = '#1a0a0a';
    label = 'Failed';
  } else if (effectiveStatus === 'matched') {
    color = '#22c55e';
    bg = '#052e16';
    label = 'Matched';
  } else if (effectiveStatus === 'date_mismatch') {
    color = '#fbbf24';
    bg = '#271e05';
    label = 'Date Mismatch';
  } else if (effectiveStatus === 'amount_mismatch') {
    color = '#f59e0b';
    bg = '#1c1202';
    label = 'Amount Mismatch';
  } else if (effectiveStatus === 'amount_and_date_mismatch') {
    color = '#f97316';
    bg = '#261204';
    label = 'Amount & Date Mismatch';
  } else if (effectiveStatus === 'mismatched' || effectiveStatus === 'pending') {
    color = '#f59e0b';
    bg = '#1c1202';
    label = 'Mismatched';
  } else if (effectiveStatus === 'missing_in_bank') {
    color = '#ef4444';
    bg = '#1a0a0a';
    label = 'Missing in Bank';
  } else if (effectiveStatus === 'missing_in_internal') {
    color = '#ef4444';
    bg = '#1a0a0a';
    label = 'Missing in Internal';
  } else if (effectiveStatus === 'resolved') {
    color = '#8b949e';
    bg = '#1c2128';
    label = 'Resolved';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '11px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '4px',
        color,
        backgroundColor: bg,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};
