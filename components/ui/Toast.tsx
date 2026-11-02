'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-100 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/15 bg-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.7)] text-white text-sm max-w-md"
        >
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-[#34d399] shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-[#fb7185] shrink-0" />}
          {toast.type === 'info' && <Info size={18} className="text-[#c084fc] shrink-0" />}

          <span className="font-medium text-gray-200">{toast.message}</span>

          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
