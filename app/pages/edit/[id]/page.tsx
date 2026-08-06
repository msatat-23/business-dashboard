'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { usePagesQuery, useUpdatePageMutation, mapPageApiToDashboard } from '@/hooks/use-pages-api';
import {
  KeyTreeEditor,
  KeyNode,
  treeToRecord,
  recordToTree,
  generateId,
} from '@/components/pages/KeyTreeEditor';
import { CloudinaryImageModal } from '@/components/pages/CloudinaryImageModal';
import {
  ArrowLeft,
  Save,
  Code2,
  Globe,
  Layers,
  Info,
  Loader2,
  AlertCircle,
  Pencil,
} from 'lucide-react';

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const pageIdOrSlug = resolvedParams.id;

  const router = useRouter();
  const { showToast } = useToast();


  const { data: pageApiData = [], isLoading, isError } = usePagesQuery();
  const updatePageMutation = useUpdatePageMutation();

  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);
  const [slugName, setSlugName] = useState('');
  const [originalSlug, setOriginalSlug] = useState('');
  const [nodes, setNodes] = useState<KeyNode[]>([]);
  const [isCloudinaryOpen, setIsCloudinaryOpen] = useState(false);

  // Synchronize target page data into state when query returns
  const allPages = pageApiData.map(mapPageApiToDashboard);
  const targetPage = allPages.find(
    (p) => String(p.id) === String(pageIdOrSlug) || p.slug === pageIdOrSlug
  );

  if (targetPage && loadedSlug !== targetPage.slug) {
    setLoadedSlug(targetPage.slug);
    setSlugName(targetPage.slug);
    setOriginalSlug(targetPage.slug);
    setNodes(recordToTree(targetPage.content || {}));
  }

  const isLoaded = Boolean(targetPage && loadedSlug === targetPage.slug);

  const jsonContent = treeToRecord(nodes);

  const handleSave = () => {
    const cleanSlug = slugName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!cleanSlug) {
      showToast('Please enter a valid Slug Name.', 'error');
      return;
    }

    updatePageMutation.mutate(
      { slug: originalSlug || cleanSlug, content: jsonContent },
      {
        onSuccess: () => {
          showToast(`Page "${cleanSlug}" updated successfully!`, 'success');
          router.push('/pages');
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Page update failed.', 'error');
        },
      }
    );
  };

  if (isLoading || (!isLoaded && !isError)) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 font-sans my-8 shadow-2xs">
        <Loader2 size={32} className="mx-auto text-[#e11d48] animate-spin" />
        <h2 className="text-sm font-bold text-slate-800">Loading Page Configuration...</h2>
        <p className="text-xs text-slate-500">Retrieving hierarchy tree and schema structure.</p>
      </div>
    );
  }

  if (isError || (!isLoaded && pageApiData.length > 0)) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3 font-sans my-8">
        <AlertCircle size={32} className="mx-auto text-rose-600" />
        <h2 className="text-sm font-bold text-slate-900">Page Record Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested page record (<code className="font-mono bg-rose-100 text-rose-900 px-1 py-0.5 rounded">{pageIdOrSlug}</code>) could not be located.
        </p>
        <Link
          href="/pages"
          className="inline-block mt-2 px-4 py-2 bg-[#e11d48] text-white font-bold rounded-xl text-xs hover:bg-rose-700 transition-colors"
        >
          Return to Pages Management
        </Link>
      </div>
    );
  }

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
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                <Pencil size={11} /> Edit CMS Page
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5 font-mono">
              <span>/{slugName}</span>
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
            disabled={updatePageMutation.isPending || !slugName.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={15} />
            <span>{updatePageMutation.isPending ? 'Saving Changes...' : 'Save Page Updates'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Builder vs Live JSON */}
      <div className="">
        {/* Left / Main Editor Section */}
        <div className="lg:col-span-8 space-y-6">
          {/* Slug Name Input Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="editSlugName" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Globe size={15} className="text-[#e11d48]" />
                <span>Slug Name</span>
                <span className="text-rose-600">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Clean Identifier Name</span>
            </div>

            <input
              id="editSlugName"
              type="text"
              value={slugName}
              onChange={(e) => setSlugName(e.target.value)}
              placeholder="e.g. about, services, contact-us"
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
              mode="edit"
            />
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
