import type { Metadata } from 'next';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { DashboardShell } from '@/components/layout/DashboardShell';

export const metadata: Metadata = {
  title: 'Business Strategy | Admin Dashboard Platform',
  description:
    'Enterprise administration portal for user management, dynamic page CMS, and client contact inquiry management.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ReactQueryProvider>
          <AuthProvider>
            <ToastProvider>
              <DashboardShell>{children}</DashboardShell>
            </ToastProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
