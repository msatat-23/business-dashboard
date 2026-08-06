'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { User, UserRole } from '@/lib/types';
import { UserPlus, Save, Shield, UserCheck, AlertCircle } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
  }) => { success: boolean; message: string };
  initialUser?: User | null;
}

export function UserModal({ isOpen, onClose, onSubmit, initialUser }: UserModalProps) {
  const isEditing = Boolean(initialUser);

  // Initialize form state directly from initialUser prop
  const [fullName, setFullName] = useState(initialUser?.fullName || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [password, setPassword] = useState(''); // never pre-filled: API never returns real/hashed passwords
  const [role, setRole] = useState<UserRole>(initialUser?.role || 'user');
  const [isActive, setIsActive] = useState(initialUser?.isActive ?? true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Valid email address is required.');
      return;
    }
    if (!isEditing && !password.trim()) {
      setErrorMsg('Password is required.');
      return;
    }

    const res = onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
      isActive,
    });

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Update User Account' : 'Provision New User'}
      subtitle={
        isEditing
          ? 'Modify account credentials, role permissions, or status.'
          : 'Create a new user account with assigned system credentials.'
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 text-[#e11d48] text-xs font-bold">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.78rem] font-bold text-slate-700 tracking-wide uppercase">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Eleanor Vance"
            className="w-full font-sans text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 outline-none focus:bg-white focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.78rem] font-bold text-slate-700 tracking-wide uppercase">
            Corporate Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. e.vance@business-dev.com"
            className="w-full font-sans text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 outline-none focus:bg-white focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Password Input with Eye Toggle */}
        <PasswordInput
          label="Account Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter secure password'}
          helperText={
            isEditing
              ? 'Passwords are hashed and cannot be displayed. Leave blank to keep the current password, or enter a new one to reset it.'
              : 'Click the eye icon on the right to toggle password visibility.'
          }
          required={!isEditing}
        />

        {/* Role Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.78rem] font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1.5">
            <Shield size={14} className="text-[#9333ea]" />
            <span>System Access Role</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${role === 'admin'
                  ? 'bg-rose-50 border-[#f43f5e] text-[#e11d48] shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="font-extrabold uppercase tracking-wider">Admin</span>
              <span className="text-[0.68rem] font-normal text-slate-500 text-center">Full Control</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('editor')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${role === 'editor'
                  ? 'bg-purple-50 border-purple-500 text-[#9333ea] shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="font-extrabold uppercase tracking-wider">Editor</span>
              <span className="text-[0.68rem] font-normal text-slate-500 text-center">Manage Pages</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('user')}
              className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${role === 'user'
                  ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <span className="font-extrabold uppercase tracking-wider">User</span>
              <span className="text-[0.68rem] font-normal text-slate-500 text-center">Read Only</span>
            </button>
          </div>
        </div>

        {/* Account Status Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl mt-1">
          <div className="flex items-center gap-2.5">
            <UserCheck size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
            <div>
              <div className="text-xs font-bold text-slate-900">Account Status</div>
              <div className="text-[0.72rem] text-slate-500">
                {isActive ? 'User can log in and access allowed areas' : 'User account is locked/disabled'}
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f43f5e]"></div>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white px-5 py-2.5 rounded-xl font-sans text-xs font-bold cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_22px_rgba(244,63,94,0.45)] transition-all flex items-center gap-2"
          >
            {isEditing ? <Save size={15} /> : <UserPlus size={15} />}
            <span>{isEditing ? 'Save User Changes' : 'Provision User'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
