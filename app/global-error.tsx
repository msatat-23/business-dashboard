'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 md:p-12">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-red-500/10 rounded-full blur-2xl"></div>
                  <div className="relative bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6">
                    <AlertTriangle size={64} className="text-white" strokeWidth={1.5} />
                  </div>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  Critical Error Occurred
                </h1>
                
                <p className="text-slate-600 max-w-md text-sm md:text-base leading-relaxed mb-4">
                  A critical error has occurred in the application. This is unexpected and has been logged. 
                  Please try refreshing the page or returning to the dashboard.
                </p>

                {process.env.NODE_ENV === 'development' && error.message && (
                  <div className="w-full mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-left">
                    <p className="text-xs font-mono text-slate-700 break-words">
                      <strong className="text-red-600">Error:</strong> {error.message}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RotateCcw size={18} />
                  Try Again
                </button>
                
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e11d48] to-rose-600 hover:from-[#be123c] hover:to-rose-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-500/30"
                >
                  <Home size={18} />
                  Return to Dashboard
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <p className="text-center text-xs text-slate-500">
                  If this error persists, please contact technical support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
