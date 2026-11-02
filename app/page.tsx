'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, isAuthLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) return;

    // Redirect authenticated users to dashboard
    if (currentUser) {
      router.replace('/dashboard');
    } else {
      // Redirect unauthenticated users to login
      router.replace('/login');
    }
  }, [currentUser, router, isAuthLoading]);

  // Show loading while determining auth state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#f43f5e] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  return null;
}
