'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Upload, Image as ImageIcon, Link, Check, Sparkles, AlertCircle, RefreshCw, X } from 'lucide-react';

interface CloudinaryImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string) => void;
  targetFieldKey?: string;
  initialUrl?: string;
}

const CURATED_STOCK_IMAGES = [
  {
    title: 'Enterprise Analytics Dashboard',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
    category: 'Hero / Banner',
  },
  {
    title: 'Corporate Executive Team',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    category: 'Team / About',
  },
  {
    title: 'Abstract Business Tech Logo',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    category: 'Logos',
  },
  {
    title: 'Modern Office Tower',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    category: 'Architecture',
  },
  {
    title: 'Data & Growth Graph',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    category: 'Analytics',
  },
  {
    title: 'Strategy Consultation Meeting',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
    category: 'Consulting',
  },
];

export function CloudinaryImageModal({
  isOpen,
  onClose,
  onSelectUrl,
  targetFieldKey,
  initialUrl = '',
}: CloudinaryImageModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'stock'>('upload');
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [cloudName, setCloudName] = useState(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '');
  const [uploadPreset, setUploadPreset] = useState(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessUrl, setUploadSuccessUrl] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    // If Cloudinary credentials are missing or default, try direct Cloudinary upload or fallback to Data URL preview
    if (cloudName && uploadPreset) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData?.error?.message || 'Cloudinary upload failed.');
        }

        const data = await res.json();
        const uploadedUrl = data.secure_url || data.url;
        setUploadSuccessUrl(uploadedUrl);
        setImageUrl(uploadedUrl);
      } catch (err: any) {
        // Fallback to data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Url = reader.result as string;
          setUploadSuccessUrl(base64Url);
          setImageUrl(base64Url);
          setUploadError(`Cloudinary error (${err.message}). Loaded image local preview.`);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    } else {
      // Local Base64 preview fallback when cloud name isn't configured
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        setUploadSuccessUrl(base64Url);
        setImageUrl(base64Url);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApply = (urlToUse?: string) => {
    const finalUrl = urlToUse || imageUrl || uploadSuccessUrl;
    if (finalUrl) {
      onSelectUrl(finalUrl);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cloudinary Image Manager ${targetFieldKey ? `(${targetFieldKey})` : ''}`} maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'stock'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Curated Stock
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-rose-600 text-rose-600 bg-rose-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-4 h-4" />
            Direct URL
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Cloudinary config options */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Cloudinary Direct Upload Settings
                </span>
                <span className="text-[11px] text-slate-500">Unsigned REST API</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Cloud Name</label>
                  <input
                    type="text"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    placeholder="e.g. demo"
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Upload Preset</label>
                  <input
                    type="text"
                    value={uploadPreset}
                    onChange={(e) => setUploadPreset(e.target.value)}
                    placeholder="e.g. ml_default"
                    className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Drag and drop area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 hover:border-rose-500 transition-colors rounded-xl p-6 text-center bg-slate-50 hover:bg-rose-50/20 cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                id="cloudinary-file-input"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <label htmlFor="cloudinary-file-input" className="cursor-pointer space-y-2 block">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                  {isUploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {isUploading ? 'Uploading to Cloudinary...' : 'Click to select or drag and drop image'}
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG, SVG, WEBP up to 10MB</p>
                </div>
              </label>
            </div>

            {uploadError && (
              <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccessUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Image Ready
                  </span>
                  <button
                    type="button"
                    onClick={() => setUploadSuccessUrl(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadSuccessUrl} alt="Uploaded preview" className="w-16 h-16 object-cover rounded border border-emerald-300" />
                  <div className="text-xs space-y-1 overflow-hidden">
                    <p className="text-slate-600 truncate font-mono text-[11px]">{uploadSuccessUrl}</p>
                    <button
                      type="button"
                      onClick={() => handleApply(uploadSuccessUrl)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded transition-colors"
                    >
                      Use Uploaded Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Curated Stock Tab */}
        {activeTab === 'stock' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Select an enterprise-graded image from our curated library:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {CURATED_STOCK_IMAGES.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImageUrl(img.url);
                    handleApply(img.url);
                  }}
                  className="group border border-slate-200 hover:border-rose-500 rounded-lg overflow-hidden bg-white text-left transition-all hover:shadow-md"
                >
                  <div className="h-24 bg-slate-100 overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/80 text-white text-[10px] rounded font-medium">
                      {img.category}
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{img.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Direct URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {imageUrl && (
              <div className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                <p className="text-xs font-semibold text-slate-700">Image Preview</p>
                <div className="h-36 bg-white rounded border border-slate-200 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleApply()}
            disabled={!imageUrl && !uploadSuccessUrl}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Set Image Field Value
          </button>
        </div>
      </div>
    </Modal>
  );
}
