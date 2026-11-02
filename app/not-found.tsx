'use client';

import { useRouter } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/30 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 md:p-12">
          {/* Icon and 404 */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#f43f5e]/10 rounded-full blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-[#f43f5e] to-rose-600 rounded-full p-6">
                <FileQuestion size={64} className="text-white" strokeWidth={1.5} />
              </div>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-[#e11d48] to-rose-600 bg-clip-text text-transparent mb-4">
              404
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Page Not Found
            </h2>
            
            <p className="text-slate-600 max-w-md text-sm md:text-base leading-relaxed">
              The page you're looking for doesn't exist or has been moved. 
              Please check the URL or navigate back to the dashboard.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#e11d48] to-rose-600 hover:from-[#be123c] hover:to-rose-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-rose-500/30"
            >
              <Home size={18} />
              Return to Dashboard
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500">
              Need help? Contact support or check the{' '}
              <button
                onClick={() => router.push('/dashboard')}
                className="text-[#e11d48] hover:text-rose-700 font-semibold underline underline-offset-2"
              >
                dashboard
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
