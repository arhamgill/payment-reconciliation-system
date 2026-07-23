import React from 'react';

interface StatusChipProps {
  status: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const normalized = status.toLowerCase();

  let color = 'var(--text-secondary)';
  let bg = 'var(--bg-elevated)';

  if (normalized === 'matched' || normalized === 'completed') {
    color = '#22c55e';
    bg = '#052e16';
  } else if (normalized === 'mismatched' || normalized === 'pending') {
    color = '#f59e0b';
    bg = '#1c1202';
  } else if (normalized === 'missing_in_bank' || normalized === 'missing_in_internal') {
    color = '#ef4444';
    bg = '#1a0a0a';
  } else if (normalized === 'resolved') {
    color = '#8b949e';
    bg = '#1c2128';
  }

  const label =
    status === 'missing_in_bank'
      ? 'Missing in Bank'
      : status === 'missing_in_internal'
      ? 'Missing in Internal'
      : status.charAt(0).toUpperCase() + status.slice(1);

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
