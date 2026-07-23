import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'danger' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  variant = 'default',
}) => {
  let borderStyle = '1px solid var(--border)';
  if (variant === 'danger') {
    borderStyle = '1px solid var(--border)';
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: borderStyle,
        borderLeft:
          variant === 'danger'
            ? '3px solid var(--danger)'
            : variant === 'success'
            ? '3px solid var(--success)'
            : borderStyle,
        padding: '16px',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
        minWidth: '180px',
      }}
    >
      <span className="section-label" style={{ fontSize: '11px' }}>
        {label}
      </span>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {subtext && (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {subtext}
        </span>
      )}
    </div>
  );
};
