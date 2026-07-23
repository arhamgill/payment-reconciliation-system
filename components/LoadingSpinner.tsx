import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ label = 'Loading data...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '45vh',
        gap: '12px',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
      <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
    </div>
  );
};
