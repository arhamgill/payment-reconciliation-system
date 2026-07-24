'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveAction } from '@/app/actions/resolve';
import { CheckCircle, X } from 'lucide-react';

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
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
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
          borderRadius: '10px',
          width: '480px',
          maxWidth: '90vw',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Resolve Discrepancy
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Transaction: <span style={{ fontFamily: "'Fira Code', monospace", color: '#ffffff' }}>{transactionId}</span>
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            style={{ padding: '4px', borderRadius: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
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
            <label className="section-label" style={{ display: 'block', marginBottom: '6px' }}>
              Resolution Notes
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide justification or manual ledger adjustment notes..."
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
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
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <CheckCircle size={14} /> Confirm Resolution
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

