'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
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

  // Safety fallback: if user is not admin and visits /users
  if (currentUser.role !== 'admin' && pathname === '/users') {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
        <Header onShowToast={showToast} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <Sidebar onShowToast={showToast} onClose={() => setIsSidebarOpen(false)} />
            )}
          </AnimatePresence>
          <div className="flex-1 min-w-0">
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
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#f43f5e] selection:text-white">
      {/* Header Bar */}
      <Header
        onShowToast={showToast}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <Sidebar
              onShowToast={showToast}
              onClose={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Content Panel Area */}
        <div className="flex-1 min-w-0">{children}</div>
      </main>

      {/* Footer copyright bar */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1700px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>&copy; {new Date().getFullYear()} Business Developer Inc. Enterprise Admin Platform.</div>
          <div className="text-[0.72rem] text-slate-400">Next.js App Router • Tailwind CSS • TypeScript</div>
        </div>
      </footer>
    </div>
  );
}
