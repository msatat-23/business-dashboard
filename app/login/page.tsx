'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useToast } from '@/context/ToastContext';

function LoginPageContent() {
  const { showToast } = useToast();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 flex items-center justify-center p-4">
      <LoginForm onShowToast={showToast} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
