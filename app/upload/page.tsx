'use client';

import React, { useState } from 'react';
import { FileDropZone } from '@/components/FileDropZone';
import { uploadAction } from '@/app/actions/upload';

export default function UploadPage() {
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bankFile || !internalFile) {
      setError('Please select both Bank and Internal CSV files.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('bank_file', bankFile);
    formData.append('internal_file', internalFile);

    try {
      await uploadAction(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload and reconciliation failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 className="page-title">Upload CSV Files</h1>
      <p className="page-subtitle">
        Upload matching bank statement CSV and internal system CSV to execute automated payment reconciliation.
      </p>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--danger-soft)',
            border: '1px solid var(--danger)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <FileDropZone
            label="Bank Statement CSV"
            name="bank_file"
            onFileSelect={(file) => setBankFile(file)}
          />
          <FileDropZone
            label="Internal Ledger CSV"
            name="internal_file"
            onFileSelect={(file) => setInternalFile(file)}
          />
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '24px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Expected CSV Format Header:
          </div>
          <code style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>
            transaction_id, amount, currency, transaction_date, description, status
          </code>
          <div style={{ marginTop: '8px' }}>
            Tip: You can use the sample files in <code>/sample-data/bank_sample.csv</code> and{' '}
            <code>/sample-data/internal_sample.csv</code> for testing.
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !bankFile || !internalFile}
          style={{ padding: '10px 24px', fontSize: '14px' }}
        >
          {loading ? 'Processing & Reconciling...' : '⚡ Run Automated Reconciliation'}
        </button>
      </form>
    </div>
  );
}
