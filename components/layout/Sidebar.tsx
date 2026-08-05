'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Contact,
  LogOut,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export type NavTab = 'overview' | 'users' | 'pages' | 'contacts';

interface SidebarProps {
  activeTab?: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onClose?: () => void;
}

export function Sidebar({ activeTab, onSelectTab, onShowToast, onClose }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const pathname = usePathname();
  const isAdmin = currentUser?.role === 'admin';

  const navItems = [
    {
      id: 'overview' as NavTab,
      href: '/dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      id: 'users' as NavTab,
      href: '/users',
      label: 'User Management',
      icon: Users,
      adminOnly: true,
    },
    {
      id: 'pages' as NavTab,
      href: '/pages',
      label: 'Pages Management',
      icon: FileText,
      adminOnly: false,
    },
    {
      id: 'contacts' as NavTab,
      href: '/contacts',
      label: 'Contact Management',
      icon: Contact,
      adminOnly: false,
    },
  ];

  // Filter out user management from sidebar when role is not admin
  const visibleNavItems = navItems.filter((item) => !(item.adminOnly && !isAdmin));

  const checkIsActive = (item: (typeof navItems)[0]) => {
    if (activeTab) return activeTab === item.id;
    if (item.href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="w-full lg:w-68 bg-white border border-slate-200/90 rounded-3xl p-4.5 flex flex-col justify-between gap-6 shrink-0 shadow-sm relative"
    >
      <div className="flex flex-col gap-3">
        {/* Navigation Header with Close Button */}
        <div className="flex items-center justify-between px-1.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles size={13} className="text-[#f43f5e]" />
            <span className="text-[0.68rem] font-black uppercase tracking-wider text-slate-400">
              Platform Navigation
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Navigation Menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (onSelectTab) onSelectTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white shadow-md shadow-[#f43f5e]/20 scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3 truncate min-w-0">
                  <Icon size={17} className={isActive ? 'text-white' : 'text-slate-500'} />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Active Session Card & Logout */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.62rem] text-slate-400 font-black uppercase tracking-wider">
              Active Persona
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[0.65rem] font-bold text-emerald-600">Online</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#f43f5e] to-[#9333ea] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {currentUser?.fullName.substring(0, 1) || 'U'}
            </div>
            <div className="flex flex-col min-w-0 truncate">
              <span className="text-xs font-black text-slate-900 truncate leading-tight">
                {currentUser?.fullName}
              </span>
              <span className="text-[0.68rem] text-slate-500 font-mono truncate">
                {currentUser?.email}
              </span>
            </div>
          </div>

          <div className="text-[0.72rem] font-mono text-slate-500 capitalize flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>
              Role:{' '}
              <strong className="text-[#e11d48] uppercase font-black">{currentUser?.role}</strong>
            </span>
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          </div>
        </div>

        {/* Sidebar Logout Button */}
        <button
          onClick={() => {
            logout();
            if (onShowToast) onShowToast('Signed out of admin dashboard.', 'info');
          }}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#e11d48] border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
}
