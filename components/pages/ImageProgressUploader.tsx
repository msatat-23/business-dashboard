'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ImageProgressUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ImageProgressUploader({
  value,
  onChange,
  placeholder = 'Paste Image URL or click Upload...',
  disabled = false,
  className = '',
}: ImageProgressUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds 10MB limit.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          setIsUploading(false);
          return;
        }
      }

      // Fallback local reader if route fails
      fallbackLocalRead(file);
    } catch {
      fallbackLocalRead(file);
    }
  };

  const fallbackLocalRead = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        onChange(reader.result as string);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const isImg =
    value &&
    (value.startsWith('http') ||
      value.startsWith('data:image/') ||
      value.startsWith('/'));

  return (
    <div className={`space-y-2 text-xs font-sans ${className}`}>
      {/* Input Row */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={value}
            disabled={disabled || isUploading}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#f43f5e] focus:ring-1 focus:ring-[#f43f5e]/20 transition-all pr-8"
          />
          {value && (
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => onChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
              title="Clear Image URL"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <label
          className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
            isUploading
              ? 'bg-rose-50 text-rose-700 border-rose-300 pointer-events-none'
              : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-slate-700 hover:border-slate-500 hover:shadow'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-rose-600 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-rose-400" />
              <span>Upload Image</span>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={disabled || isUploading}
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Image Preview Thumbnail */}
      {isImg && (
        <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0 truncate">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Asset Preview"
              className="w-12 h-12 object-cover rounded-lg border border-slate-300 shrink-0 bg-white shadow-2xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col truncate">
              <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Image Asset Uploaded
              </span>
              <span className="text-[10px] text-slate-500 font-mono truncate">{value}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[10px] text-rose-600 font-bold hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors ml-2 shrink-0"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
