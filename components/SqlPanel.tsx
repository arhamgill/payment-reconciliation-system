'use client';

import React, { useState } from 'react';

interface SqlPanelProps {
  query: string;
  executionMs?: number;
  params?: Record<string, unknown>;
}

export const SqlPanel: React.FC<SqlPanelProps> = ({
  query,
  executionMs,
  params,
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setOpen(!open)}
        style={{ fontSize: '12px', padding: '4px 10px' }}
      >
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>&lt;/&gt;</span>
        {open ? 'Hide SQL Query' : 'View SQL Query'}
      </button>

      {open && (
        <div
          style={{
            marginTop: '10px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '16px',
            fontSize: '13px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              {executionMs !== undefined ? `Executed in ${executionMs}ms` : 'Automated Query'}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCopy}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              {copied ? 'Copied!' : 'Copy SQL'}
            </button>
          </div>

          <pre
            style={{
              fontFamily: "'Fira Code', 'Consolas', monospace",
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#e6edf3',
              backgroundColor: 'var(--bg-base)',
              padding: '12px',
              borderRadius: '4px',
              overflowX: 'auto',
              border: '1px solid var(--border)',
              margin: 0,
            }}
          >
            <code>{query.trim()}</code>
          </pre>

          {params && Object.keys(params).length > 0 && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
              }}
            >
              Parameters: {JSON.stringify(params)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
