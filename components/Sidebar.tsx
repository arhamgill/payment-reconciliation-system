'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  History,
  Search,
  AlertTriangle,
  Terminal,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Upload CSV', href: '/upload', icon: UploadCloud },
    { label: 'All Runs', href: '/runs', icon: History },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Issues', href: '/issues', icon: AlertTriangle },
    { label: 'SQL Workbench', href: '/sql', icon: Terminal },
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
        padding: '20px 14px',
        zIndex: 40,
      }}
    >
      <div>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', padding: '0 8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
            }}
          >
            <ShieldCheck size={16} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Resolver
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              letterSpacing: '0.05em',
            }}
          >
            OPS
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
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
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                  textDecoration: 'none',
                  border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} strokeWidth={isActive ? 2 : 1.75} style={{ color: isActive ? '#ffffff' : 'var(--text-secondary)' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        <div style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Resolver Engine v1.0</div>
        <div>Automated Payment Reconciliation</div>
      </div>
    </aside>
  );
};

