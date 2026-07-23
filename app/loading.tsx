import React from 'react';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        gap: '12px',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
      <span style={{ fontSize: '13px', fontWeight: 500 }}>Loading data...</span>
    </div>
  );
}
