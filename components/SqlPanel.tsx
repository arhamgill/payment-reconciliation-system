'use client';

import React, { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';

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
    <div style={{ marginTop: '24px', marginBottom: '24px' }}>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(!open)}
        style={{ fontSize: '12px', padding: '5px 12px' }}
      >
        <Code2 size={14} />
        {open ? 'Hide SQL Query' : 'View SQL Query'}
      </button>

      {open && (
        <div
          style={{
            marginTop: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '13px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ fontFamily: 'monospace' }}>
              {executionMs !== undefined ? `Execution time: ${executionMs}ms` : 'Automated Query'}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleCopy}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              {copied ? (
                <>
                  <Check size={12} style={{ color: 'var(--success)' }} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy SQL
                </>
              )}
            </button>
          </div>

          <pre
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: '12px',
              lineHeight: '1.6',
              color: '#e4e4e7',
              backgroundColor: 'var(--bg-base)',
              padding: '14px',
              borderRadius: '6px',
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
                marginTop: '10px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontFamily: "'Fira Code', monospace",
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

