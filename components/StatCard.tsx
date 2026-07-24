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
}) => {
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
      }}
    >
      <span className="section-label">
        {label}
      </span>
      <div
        style={{
          fontSize: '26px',
          fontWeight: 600,
          color: '#ffffff',
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


