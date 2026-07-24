'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, FileSpreadsheet } from 'lucide-react';

interface FileDropZoneProps {
  label: string;
  name: string;
  onFileSelect?: (file: File | null) => void;
  accept?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  label,
  name,
  onFileSelect,
  accept = '.csv',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
      if (inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
      }
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `1.5px dashed ${isDragOver ? '#ffffff' : 'var(--border)'}`,
        borderRadius: '8px',
        padding: '32px 20px',
        textAlign: 'center',
        backgroundColor: isDragOver ? 'var(--bg-elevated)' : 'var(--bg-card)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <input
        type="file"
        ref={inputRef}
        name={name}
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          color: selectedFile ? 'var(--success)' : 'var(--text-secondary)',
        }}
      >
        {selectedFile ? <FileCheck size={20} /> : <UploadCloud size={20} />}
      </div>

      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {label}
      </div>

      {selectedFile ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '12px', fontWeight: 500 }}>
          <FileSpreadsheet size={14} />
          {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
          Drop {label.toLowerCase()} here or click to browse (.csv)
        </div>
      )}
    </div>
  );
};

