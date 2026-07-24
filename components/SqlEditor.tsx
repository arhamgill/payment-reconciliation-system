'use client';

import React from 'react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
}

export const SqlEditor: React.FC<SqlEditorProps> = ({
  value,
  onChange,
  onRun,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onRun) onRun();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter SELECT query here..."
        style={{
          width: '100%',
          minHeight: '180px',
          fontFamily: "'Fira Code', monospace",
          fontSize: '13px',
          lineHeight: '1.6',
          backgroundColor: 'var(--bg-base)',
          color: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '14px',
          resize: 'vertical',
        }}
      />
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', alignSelf: 'flex-end' }}>
        Press <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Ctrl + Enter</kbd> to execute
      </div>
    </div>
  );
};

