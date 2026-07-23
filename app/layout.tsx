import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Resolver — Payment Reconciliation System',
  description: 'Enterprise fintech payment reconciliation & discrepancy resolution engine',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Sidebar />
        <main
          style={{
            marginLeft: '240px',
            padding: '32px 40px',
            minHeight: '100vh',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
