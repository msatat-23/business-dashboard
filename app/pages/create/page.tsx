'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCreatePageMutation } from '@/hooks/use-pages-api';
import {
  KeyTreeEditor,
  KeyNode,
  treeToRecord,
  generateId,
} from '@/components/pages/KeyTreeEditor';
import { CloudinaryImageModal } from '@/components/pages/CloudinaryImageModal';
import {
  ArrowLeft,
  FilePlus,
  Save,
  Code2,
  Sparkles,
  Info,
  Layers,
  Globe,
} from 'lucide-react';

export default function CreatePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const createPageMutation = useCreatePageMutation();

  const [slugName, setSlugName] = useState('');
  const [nodes, setNodes] = useState<KeyNode[]>([
    {
      id: generateId(),
      key: 'title',
      type: 'text',
      valueText: '<h1>Welcome Page</h1>',
    },
    {
      id: generateId(),
      key: 'subtitle',
      type: 'text',
      valueText: 'Enter your introductory summary text here.',
    },
  ]);

  const [isCloudinaryOpen, setIsCloudinaryOpen] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(true);

  // Compute live JSON output
  const jsonContent = treeToRecord(nodes);

  const handleSave = () => {
    const cleanSlug = slugName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanSlug) {
      showToast('Please enter a valid Slug Name.', 'error');
      return;
    }

    createPageMutation.mutate(
      { slug: cleanSlug, content: jsonContent },
      {
        onSuccess: () => {
          showToast(`Page "${cleanSlug}" created successfully!`, 'success');
          router.push('/pages');
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Page creation failed.', 'error');
        },
      }
    );
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/pages"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to Pages List"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-rose-50 text-[#e11d48] border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                CMS Page Builder
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              <span>Create Dynamic CMS Page</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/pages')}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={createPageMutation.isPending || !slugName.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} />
            <span>{createPageMutation.isPending ? 'Saving Page...' : 'Publish Page'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Builder vs Live JSON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Editor Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Slug Name Input Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="slugName" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Globe size={15} className="text-[#e11d48]" />
                <span>Slug Name</span>
                <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Clean Identifier Name</span>
            </div>

            <input
              id="slugName"
              type="text"
              value={slugName}
              onChange={(e) => setSlugName(e.target.value)}
              placeholder="e.g. about, services, contact-us, pricing"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold outline-none focus:border-[#f43f5e] focus:bg-white focus:ring-1 focus:ring-[#f43f5e]/20 transition-all"
            />
            <p className="text-[11px] text-slate-500">
              Only enter the clean slug identifier (e.g.{' '}
              <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">about</code>,{' '}
              <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono">services</code>).
            </p>
          </div>

          {/* Key Tree Structure Editor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={16} className="text-[#e11d48]" />
                  <span>Property Key Hierarchy</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Add property keys one at a time. Supports Rich Text, Image URLs, Nested Objects & Lists.
                </p>
              </div>
            </div>

            <KeyTreeEditor
              nodes={nodes}
              onChange={setNodes}
            />
          </div>
        </div>

        {/* Right / Live JSON Preview Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live JSON Output</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className="text-[11px] text-slate-400 hover:text-white font-mono"
              >
                {showJsonPreview ? 'Hide' : 'Show'}
              </button>
            </div>

            {showJsonPreview && (
              <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-[500px] border border-slate-800/80 leading-relaxed">
                {JSON.stringify(jsonContent, null, 2)}
              </pre>
            )}

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 space-y-1">
              <div className="font-bold text-white flex items-center gap-1">
                <Info size={13} className="text-rose-400" />
                <span>Payload Structure</span>
              </div>
              <p className="text-slate-400 leading-normal">
                This JSON object represents the raw API content stored under slug{' '}
                <strong className="text-rose-300 font-mono">
                  {slugName.trim() ? slugName.trim() : '(unnamed)'}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cloudinary Asset Modal */}
      <CloudinaryImageModal
        isOpen={isCloudinaryOpen}
        onClose={() => setIsCloudinaryOpen(false)}
        onSelectUrl={(url) => {
          setIsCloudinaryOpen(false);
          showToast('Image URL selected from Cloudinary library.', 'info');
        }}
      />
    </div>
  );
}
