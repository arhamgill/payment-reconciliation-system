'use client';

import React, { useState, useRef } from 'react';

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
        border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '4px',
        padding: '32px 16px',
        textAlign: 'center',
        backgroundColor: isDragOver ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
        flex: 1,
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
      <div style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--text-secondary)' }}>
        📁
      </div>
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{label}</div>
      {selectedFile ? (
        <div style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 500 }}>
          ✓ {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </div>
      ) : (
        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          Drop {label.toLowerCase()} here or click to browse (.csv)
        </div>
      )}
    </div>
  );
};
