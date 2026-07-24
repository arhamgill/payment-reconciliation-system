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
  let indicatorColor = 'var(--border)';
  if (variant === 'danger') {
    indicatorColor = 'var(--danger)';
  } else if (variant === 'success') {
    indicatorColor = 'var(--success)';
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        padding: '18px 20px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flex: 1,
        minWidth: '180px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {variant !== 'default' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: indicatorColor,
          }}
        />
      )}
      <span className="section-label">
        {label}
      </span>
      <div
        style={{
          fontSize: '26px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
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

