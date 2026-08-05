'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function PasswordInput({ label, error, helperText, className = '', ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[0.78rem] font-bold text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={`w-full font-sans text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 outline-none focus:bg-white focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 transition-all duration-200 placeholder:text-slate-400 pr-11 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer select-none"
          title={showPassword ? 'Hide password' : 'View password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} className="text-[#f43f5e]" /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-[#f43f5e] font-semibold mt-0.5">{error}</p>}
      {helperText && !error && <p className="text-[0.75rem] text-slate-500 mt-0.5">{helperText}</p>}
    </div>
  );
}
