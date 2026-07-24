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

  let color = '#888888';
  let bg = '#161616';
  let borderColor = '#222222';
  let label = status.charAt(0).toUpperCase() + status.slice(1);

  if (effectiveStatus === 'discrepancies_found') {
    color = '#f59e0b';
    bg = '#261904';
    borderColor = 'rgba(245, 158, 11, 0.25)';
    label = 'Discrepancies Found';
  } else if (effectiveStatus === 'discrepancies_resolved' || effectiveStatus === 'all_resolved') {
    color = '#00e599';
    bg = '#04261c';
    borderColor = 'rgba(0, 229, 153, 0.25)';
    label = 'Resolved';
  } else if (effectiveStatus === 'fully_balanced' || effectiveStatus === 'completed' || effectiveStatus === 'matched') {
    color = '#00e599';
    bg = '#04261c';
    borderColor = 'rgba(0, 229, 153, 0.25)';
    label = effectiveStatus === 'matched' ? 'Matched' : 'Fully Balanced';
  } else if (effectiveStatus === 'processing') {
    color = '#3b82f6';
    bg = '#091c38';
    borderColor = 'rgba(59, 130, 246, 0.25)';
    label = 'Processing';
  } else if (effectiveStatus === 'failed') {
    color = '#ff4d4d';
    bg = '#280a0c';
    borderColor = 'rgba(255, 77, 77, 0.25)';
    label = 'Failed';
  } else if (effectiveStatus === 'date_mismatch') {
    color = '#f59e0b';
    bg = '#261904';
    borderColor = 'rgba(245, 158, 11, 0.25)';
    label = 'Date Mismatch';
  } else if (effectiveStatus === 'amount_mismatch') {
    color = '#f59e0b';
    bg = '#261904';
    borderColor = 'rgba(245, 158, 11, 0.25)';
    label = 'Amount Mismatch';
  } else if (effectiveStatus === 'amount_and_date_mismatch') {
    color = '#f97316';
    bg = '#281305';
    borderColor = 'rgba(249, 115, 22, 0.25)';
    label = 'Amount & Date Mismatch';
  } else if (effectiveStatus === 'mismatched' || effectiveStatus === 'pending') {
    color = '#f59e0b';
    bg = '#261904';
    borderColor = 'rgba(245, 158, 11, 0.25)';
    label = 'Mismatched';
  } else if (effectiveStatus === 'missing_in_bank') {
    color = '#ff4d4d';
    bg = '#280a0c';
    borderColor = 'rgba(255, 77, 77, 0.25)';
    label = 'Missing in Bank';
  } else if (effectiveStatus === 'missing_in_internal') {
    color = '#ff4d4d';
    bg = '#280a0c';
    borderColor = 'rgba(255, 77, 77, 0.25)';
    label = 'Missing in Internal';
  } else if (effectiveStatus === 'resolved') {
    color = '#888888';
    bg = '#161616';
    borderColor = '#222222';
    label = 'Resolved';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '12px',
        fontWeight: 500,
        padding: '3px 10px',
        borderRadius: '6px',
        color,
        backgroundColor: bg,
        border: `1px solid ${borderColor}`,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
};



