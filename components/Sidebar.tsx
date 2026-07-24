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
  ChevronsUpDown,
  User,
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
        backgroundColor: '#000000',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 12px',
        zIndex: 40,
      }}
    >
      <div>
        {/* Resend Workspace Selector Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            padding: '6px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: '#00e599',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              R
            </div>
            <span style={{ fontWeight: 600, fontSize: '13.5px', color: '#ffffff', letterSpacing: '-0.01em' }}>
              resolver.dev
            </span>
          </div>
          <ChevronsUpDown size={14} style={{ color: '#666666' }} />
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
                  gap: '12px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#ffffff' : '#888888',
                  backgroundColor: isActive ? '#1f1f1f' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} strokeWidth={1.8} style={{ color: isActive ? '#ffffff' : '#888888' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile Info (Resend style bottom item) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 10px',
          borderRadius: '8px',
          borderTop: '1px solid var(--border-subtle)',
          marginTop: 'auto',
          paddingTop: '16px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: '#1f1f1f',
            border: '1px solid #333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#888888',
          }}
        >
          <User size={13} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            ops.admin@resolver.dev
          </span>
        </div>
      </div>
    </aside>
  );
};


