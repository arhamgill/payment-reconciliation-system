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
          fontFamily: "'Fira Code', 'Consolas', monospace",
          fontSize: '13px',
          lineHeight: '1.6',
          backgroundColor: 'var(--bg-elevated)',
          color: '#e6edf3',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '12px',
          resize: 'vertical',
        }}
      />
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', alignSelf: 'flex-end' }}>
        Press <kbd style={{ background: 'var(--border)', padding: '1px 4px', borderRadius: '3px' }}>Ctrl + Enter</kbd> to run
      </div>
    </div>
  );
};
