'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveAction } from '@/app/actions/resolve';

interface ResolveModalProps {
  resultId: number;
  transactionId: string;
  onClose: () => void;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  resultId,
  transactionId,
  onClose,
}) => {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [resolvedBy, setResolvedBy] = useState('Ops Admin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resolveAction(resultId, notes, resolvedBy);
      onClose();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          width: '480px',
          maxWidth: '90vw',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Resolve Discrepancy</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {transactionId}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '4px' }}>
              Resolved By
            </label>
            <input
              type="text"
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '4px' }}>
              Resolution Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide reason for resolution or manual adjustment details..."
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Confirm Resolve'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
