'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {  LogOut, PanelLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Header({ onShowToast, isSidebarOpen = true, onToggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const { showToast: ctxToast } = useToast();
  const showToast = onShowToast || ctxToast;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/90 transition-all duration-300">
      <div className="max-w-[1700px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Brand Logo & Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 select-none min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 flex items-center justify-center ${!isSidebarOpen
                ? 'bg-rose-50 text-[#e11d48] border-rose-200 shadow-2xs hover:bg-rose-100 ring-2 ring-rose-500/20'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              title={isSidebarOpen ? 'Close Navigation Sidebar' : 'Open Navigation Sidebar'}
            >
              <PanelLeft size={18} />
            </button>
          )}

<Link href="/dashboard">
               <Image
              src="/logo.png"
              alt="Business Strategy"
              width={4096}
              height={1204}
              className="h-10 w-auto object-contain cursor-pointer"
            />
</Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* User Profile Summary - Hidden on mobile, compact on desktop */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 border border-slate-200 px-3 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#f43f5e] to-[#9333ea] flex items-center justify-center font-bold text-white text-[0.7rem]">
                 {(currentUser?.fullName &&typeof currentUser.fullName ==="string")?currentUser.fullName.slice(0,2): 'A'}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-xs text-slate-900 leading-tight">
                {currentUser?.fullName || 'User'}
              </span>
              <span className="text-[0.65rem] text-slate-500 truncate max-w-[130px]">
                {currentUser?.email}
              </span>
            </div>
          </div>

          {/* Top Header Logout */}
          <button
            onClick={() => {
              logout();
              showToast('Signed out of admin dashboard.', 'info');
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 text-slate-600 hover:text-[#e11d48] transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
