'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'Upload CSV', href: '/upload', icon: '⬆️' },
    { label: 'All Runs', href: '/runs', icon: '🗂️' },
    { label: 'Search', href: '/search', icon: '🔍' },
    { label: 'Issues', href: '/issues', icon: '⚠️' },
    { label: 'SQL Workbench', href: '/sql', icon: '</>' },
  ];

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '240px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
        zIndex: 40,
      }}
    >
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '0 4px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'var(--accent)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '12px',
            }}
          >
            PR
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
            PayReconcile
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              padding: '1px 5px',
              borderRadius: '3px',
              border: '1px solid var(--border)',
            }}
          >
            INTERNAL
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  textDecoration: 'none',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                }}
              >
                <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div style={{ padding: '8px 4px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)' }}>
        PayReconcile v1.0.0<br />
        Fintech Operations Admin
      </div>
    </aside>
  );
};
