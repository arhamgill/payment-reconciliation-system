'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDropZone } from '@/components/FileDropZone';
import { uploadAction } from '@/app/actions/upload';
import { Zap, AlertCircle, Info } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bankFile || !internalFile) {
      setError('Please select both Bank Statement and Internal Ledger CSV files.');
      return;
    }

    if (!bankFile.name.toLowerCase().endsWith('.csv')) {
      setError('Bank statement file must have a .csv extension.');
      return;
    }

    if (!internalFile.name.toLowerCase().endsWith('.csv')) {
      setError('Internal ledger file must have a .csv extension.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('bank_file', bankFile);
    formData.append('internal_file', internalFile);

    try {
      const res = await uploadAction(formData);
      if (res?.runId) {
        router.push(`/runs/${res.runId}`);
      } else {
        setError('Failed to retrieve new run ID.');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload and reconciliation failed.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px' }}>
      <h1 className="page-title">Upload Reconciliation Data</h1>
      <p className="page-subtitle">
        Upload bank statement CSV and internal ledger CSV to execute automated payment reconciliation.
      </p>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--danger-soft)',
            border: '1px solid var(--danger)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} /> {error}
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
            padding: '16px 20px',
            borderRadius: '8px',
            marginBottom: '28px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} /> Expected CSV Schema Format:
          </div>
          <code style={{ fontFamily: "'Fira Code', monospace", color: '#ffffff', backgroundColor: 'var(--bg-base)', padding: '6px 10px', borderRadius: '4px', display: 'block', border: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
            transaction_id, amount, currency, transaction_date, description, status
          </code>
          <div>
            Tip: Test sample files available at <code style={{ fontFamily: "'Fira Code', monospace" }}>/sample-data/bank_sample.csv</code> and{' '}
            <code style={{ fontFamily: "'Fira Code', monospace" }}>/sample-data/internal_sample.csv</code>.
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !bankFile || !internalFile}
          style={{ padding: '10px 24px', fontSize: '14px' }}
        >
          {loading ? (
            'Processing & Reconciling...'
          ) : (
            <>
              <Zap size={16} /> Run Automated Reconciliation
            </>
          )}
        </button>
      </form>
    </div>
  );
}

