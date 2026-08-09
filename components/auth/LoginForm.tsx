'use client';

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Layers, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function LoginForm({ onShowToast }: LoginFormProps) {
  const { login } = useAuth();
  const { register, handleSubmit, formState } = useForm<LoginFormValues>({
    defaultValues: {
      email: 'admin@business-dev.com',
      password: 'AdminSecretPassword2026!',
    },
  });
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setErrorMsg('');

    try {
      const res = await login(values.email, values.password);

      if (!res.success) {
        setErrorMsg(res.message);
        onShowToast(res.message, 'error');
      } else {
        onShowToast(res.message, 'success');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setErrorMsg(message);
      onShowToast(message, 'error');
    }
  };


  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[min(700px,90vw)] h-[min(700px,90vw)] bg-[radial-gradient(circle,rgba(244,63,94,0.12)_0%,rgba(168,85,247,0.06)_50%,rgba(248,250,252,0)_70%)] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f43f5e] via-[#e11d48] to-[#9333ea] flex items-center justify-center text-white shadow-[0_6px_20px_rgba(244,63,94,0.3)] border border-white/30 mb-4">
            <Layers size={24} />
          </div>
          <h1 className="font-sans text-2xl font-black text-slate-900 tracking-tight">
            BUSINESS <span className="bg-gradient-to-r from-[#e11d48] to-[#9333ea] bg-clip-text text-transparent">DEVELOPER</span>
          </h1>
          <p className="text-xs tracking-[1.5px] text-slate-500 font-bold uppercase mt-1">
            Enterprise Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2.5 text-[#e11d48] text-xs font-bold">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.78rem] font-bold text-slate-700 tracking-wide uppercase">
              Corporate Email
            </label>
            <input
              type="email"
              required
              {...register('email')}
              placeholder="e.g. admin@business-dev.com"
              className="w-full font-sans text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 outline-none focus:bg-white focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <PasswordInput
            label="Account Password"
            {...register('password')}
            placeholder="Enter password"
            required
          />

          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="mt-2 bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white px-5 py-3 rounded-xl font-sans text-sm font-bold cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_22px_rgba(244,63,94,0.45)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <span>{formState.isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[0.72rem] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Encrypted Session • Enterprise Governance Portal</span>
        </div>
      </div>
    </div>
  );
}
