'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { Header } from './Header';
import { Sidebar, NavTab } from './Sidebar';
import { OverviewStats } from '@/components/overview/OverviewStats';
import { UserManagement } from '@/components/users/UserManagement';
import { PagesManagement } from '@/components/pages/PagesManagement';
import { ContactManagement } from '@/components/contacts/ContactManagement';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { LoginForm } from '@/components/auth/LoginForm';

export function DashboardLayout() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      id: crypto.randomUUID(),
      message,
      type,
    });
  };

  // If user is not authenticated or logged out, show Login Form
  if (!currentUser) {
    return (
      <>
        <LoginForm onShowToast={showToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // Safety fallback: if user is not admin and activeTab is 'users', switch back to 'overview'
  if (currentUser.role !== 'admin' && activeTab === 'users') {
    setActiveTab('overview');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-[#f43f5e] selection:text-white">
      {/* Header Bar */}
      <Header
        onShowToast={showToast}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Body - Bigger dimensions (max-w-[1700px]) to eliminate large side gutters */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <Sidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onShowToast={showToast}
              onClose={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Content Panel Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <OverviewStats onNavigate={setActiveTab} onShowToast={showToast} />
          )}

          {activeTab === 'users' && <UserManagement onShowToast={showToast} />}

          {activeTab === 'pages' && <PagesManagement onShowToast={showToast} />}

          {activeTab === 'contacts' && <ContactManagement onShowToast={showToast} />}
        </div>
      </main>

      {/* Footer copyright bar */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-[1700px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>&copy; {new Date().getFullYear()} Business Developer Inc. Enterprise Admin Platform.</div>
          <div className="text-[0.72rem] text-slate-400">Next.js App Router • Tailwind CSS • TypeScript</div>
        </div>
      </footer>

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
