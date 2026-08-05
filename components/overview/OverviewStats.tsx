'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useUsersQuery, mapUserApiToDashboard } from '@/hooks/use-auth-api';
import { usePagesQuery, mapPageApiToDashboard } from '@/hooks/use-pages-api';
import { useContactsQuery, mapContactApiToDashboard } from '@/hooks/use-contacts-api';
import {
  Users,
  FileText,
  Contact as ContactIcon,
  Shield,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

interface OverviewStatsProps {
  onNavigate?: (tab: 'overview' | 'users' | 'pages' | 'contacts') => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function OverviewStats({ onNavigate, onShowToast }: OverviewStatsProps) {
  const router = useRouter();
  const { showToast: ctxToast } = useToast();
  const showToast = onShowToast || ctxToast;

  const navigateTo = (tab: 'overview' | 'users' | 'pages' | 'contacts') => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      if (tab === 'overview') router.push('/');
      else router.push(`/${tab}`);
    }
  };

  const { currentUser, users: authUsers, pages: authPages, contacts: authContacts, switchRole } = useAuth();

  const { data: userApiData } = useUsersQuery();
  const { data: pageApiData } = usePagesQuery();
  const { data: contactApiData } = useContactsQuery();

  const users = userApiData ? userApiData.map(mapUserApiToDashboard) : authUsers;
  const pages = pageApiData ? pageApiData.map(mapPageApiToDashboard) : authPages;
  const contacts = contactApiData ? contactApiData.map(mapContactApiToDashboard) : authContacts;

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const editorCount = users.filter((u) => u.role === 'editor').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  const totalFields = pages.reduce((acc, p) => acc + Object.keys(p.content || {}).length, 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner / Hero Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-[radial-gradient(circle,rgba(244,63,94,0.25)_0%,rgba(168,85,247,0.12)_50%,rgba(15,23,42,0)_70%)] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 bg-[#f43f5e]/20 border border-[#f43f5e]/40 text-rose-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider max-w-fit">
              <Zap size={14} className="text-[#f43f5e]" />
              <span>Enterprise Admin Control Center</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-4xl font-black text-white tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-[#fb7185] to-[#c084fc] bg-clip-text text-transparent">{currentUser?.fullName || 'Administrator'}</span>
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Managing enterprise platform users, dynamic page content schemas, and client contact inquiries across your organization.
            </p>
          </div>

          {/* Quick Role Switcher Panel */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2.5 min-w-[260px] shadow-lg">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[0.68rem] flex items-center gap-1.5">
                <Shield size={13} className="text-purple-400" /> Active Role Persona
              </span>
              <span className="font-black text-rose-400 uppercase">{currentUser?.role}</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                onClick={() => {
                  switchRole('admin');
                  showToast('Session switched to Admin persona', 'success');
                }}
                className={`py-1.5 px-2 rounded-lg text-[0.7rem] font-extrabold uppercase transition-all cursor-pointer ${
                  currentUser?.role === 'admin'
                    ? 'bg-[#f43f5e] text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Admin
              </button>

              <button
                onClick={() => {
                  switchRole('editor');
                  showToast('Session switched to Editor persona', 'info');
                }}
                className={`py-1.5 px-2 rounded-lg text-[0.7rem] font-extrabold uppercase transition-all cursor-pointer ${
                  currentUser?.role === 'editor'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Editor
              </button>

              <button
                onClick={() => {
                  switchRole('user');
                  showToast('Session switched to User persona', 'info');
                }}
                className={`py-1.5 px-2 rounded-lg text-[0.7rem] font-extrabold uppercase transition-all cursor-pointer ${
                  currentUser?.role === 'user'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                User
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Users Card - Only accessible for admin directly */}
        {currentUser?.role === 'admin' ? (
          <div
            onClick={() => navigateTo('users')}
            className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-rose-400 hover:shadow-md cursor-pointer transition-all group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-[#e11d48]">
                <Users size={22} />
              </div>
              <span className="text-slate-400 group-hover:text-slate-900 transition-colors">
                <ArrowUpRight size={18} />
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{users.length}</div>
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                System Accounts
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[0.72rem] text-slate-500">
                <span className="text-[#e11d48] font-bold">{adminCount} Admins</span> •{' '}
                <span className="text-[#9333ea] font-bold">{editorCount} Editors</span> •{' '}
                <span className="text-blue-600 font-bold">{userCount} Users</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between gap-4 opacity-75 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-slate-200/70 border border-slate-300 flex items-center justify-center text-slate-500">
                <Users size={22} />
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-md uppercase">Admin Only</span>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-700 tracking-tight mb-1">{users.length}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                System Accounts Directory
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200/80 text-[0.72rem] text-slate-400">
                Switch role to Admin to view user accounts
              </div>
            </div>
          </div>
        )}

        {/* Pages Card */}
        <div
          onClick={() => navigateTo('pages')}
          className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-purple-400 hover:shadow-md cursor-pointer transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#9333ea]">
              <FileText size={22} />
            </div>
            <span className="text-slate-400 group-hover:text-slate-900 transition-colors">
              <ArrowUpRight size={18} />
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{pages.length}</div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              CMS Dynamic Pages
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[0.72rem] text-slate-500">
              <span className="text-[#9333ea] font-bold">{totalFields} Content Keys</span> • JSON
              Schema
            </div>
          </div>
        </div>

        {/* Contacts Card */}
        <div
          onClick={() => navigateTo('contacts')}
          className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ContactIcon size={22} />
            </div>
            <span className="text-slate-400 group-hover:text-slate-900 transition-colors">
              <ArrowUpRight size={18} />
            </span>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">
              {contacts.length}
            </div>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Client Inquiries
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[0.72rem] text-slate-500">
              <span className="text-emerald-600 font-bold">100% Accessible</span> to All Roles
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {currentUser?.role === 'admin' ? (
          <div
            onClick={() => navigateTo('users')}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between shadow-2xs"
          >
            <div>
              <div className="font-sans font-bold text-slate-900 text-sm">User Directory</div>
              <div className="text-xs text-slate-500">Read, create, edit users & credentials</div>
            </div>
            <span className="bg-rose-50 text-[#e11d48] p-2.5 rounded-xl border border-rose-100">
              <Users size={18} />
            </span>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex items-center justify-between opacity-75">
            <div>
              <div className="font-sans font-bold text-slate-600 text-sm">User Directory</div>
              <div className="text-xs text-slate-400">Requires Admin Role</div>
            </div>
            <span className="bg-slate-200/80 text-slate-400 p-2.5 rounded-xl">
              <Users size={18} />
            </span>
          </div>
        )}

        <div
          onClick={() => navigateTo('pages')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between shadow-2xs"
        >
          <div>
            <div className="font-sans font-bold text-slate-900 text-sm">Pages CMS</div>
            <div className="text-xs text-slate-500">Manage JSON fields & dynamic keys</div>
          </div>
          <span className="bg-purple-50 text-[#9333ea] p-2.5 rounded-xl border border-purple-100">
            <FileText size={18} />
          </span>
        </div>

        <div
          onClick={() => navigateTo('contacts')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between shadow-2xs"
        >
          <div>
            <div className="font-sans font-bold text-slate-900 text-sm">Contact Submissions</div>
            <div className="text-xs text-slate-500">View inquiries & client details</div>
          </div>
          <span className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100">
            <ContactIcon size={18} />
          </span>
        </div>
      </div>
    </div>
  );
}
