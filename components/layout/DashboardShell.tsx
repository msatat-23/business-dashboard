'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldAlert } from 'lucide-react';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  // If user is not authenticated or logged out, show Login Form
  if (!currentUser) {
    return <LoginForm onShowToast={showToast} />;
  }

  const isAccessRestricted = currentUser.role !== 'admin' && pathname === '/users';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#f43f5e] selection:text-white">
      {/* Fixed Top Header Bar */}
      <Header
        onShowToast={showToast}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        onShowToast={showToast}
        onClose={() => setIsSidebarOpen(false)}
        isOpen={isSidebarOpen}
      />

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 top-16 bg-slate-900/40 backdrop-blur-xs z-20 lg:hidden"
        />
      )}

      {/* Main Layout Area - Fixed left padding ensures content position does not shift */}
      <div className={`pt-4 ${isSidebarOpen ? 'lg:pl-68' : 'lg:pl-0'} transition-all duration-300 flex-1 flex flex-col`}>
        <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8">
          {isAccessRestricted ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
              <ShieldAlert size={36} className="text-[#e11d48]" />
              <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
              <p className="text-xs text-slate-600 max-w-md">
                User Management is restricted to Admin role users. Your current active role is{' '}
                <strong className="uppercase font-mono text-[#e11d48]">{currentUser.role}</strong>.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-2 bg-[#e11d48] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-rose-700 transition-colors"
              >
                Return to Dashboard Overview
              </button>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Footer copyright bar */}
        <footer className="border-t border-slate-200/90 bg-white py-4 px-12 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-[1700px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>&copy; {new Date().getFullYear()} Business Developer Inc. Enterprise Admin Platform.</div>
            <div className="text-[0.72rem] text-slate-400">Next.js App Router • Tailwind CSS • TypeScript</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
