'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Page } from '@/lib/types';
import {
  useDeletePageMutation,
  usePagesQuery,
  mapPageApiToDashboard,
} from '@/hooks/use-pages-api';
import {
  FileText,
  Plus,
  Search,
  Code2,
  Edit3,
  Trash2,
  Clock,
  Shield,
  Layers,
  Globe,
} from 'lucide-react';

import { ActionConfirmationModal } from '@/components/ui/ActionConfirmationModal';

interface PagesManagementProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function PagesManagement({ onShowToast }: PagesManagementProps) {

  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);

  const { showToast: ctxToast } = useToast();
  const showToast = onShowToast || ctxToast;
  const { currentUser } = useAuth();
  const { data: pageApiData = [], isLoading, isError, error } = usePagesQuery();
  const deletePageMutation = useDeletePageMutation();
  const pages = pageApiData.map(mapPageApiToDashboard);

  const [searchTerm, setSearchTerm] = useState('');

  const userRole = currentUser?.role || 'user';
  const canEdit = userRole === 'admin' || userRole === 'editor';

  const filteredPages = pages.filter((p) =>
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePage = (page: Page) => {
    setDeleteTarget(page);
  };

  const confirmDeletePage = () => {
    if (!deleteTarget) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      deletePageMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          showToast('Page removed successfully.', 'success');
          setDeleteTarget(null);
          resolve();
        },

        onError: (err) => {
          const error =
            err instanceof Error
              ? err
              : new Error('Page delete failed.');

          showToast(error.message, 'error');
          reject(error);
        },
      });
    });
  };

  return (
    <div className="flex flex-col gap-10 w-full font-sans">
      {/* Header */}
      <div className="sticky top-24 z-3 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 pt-2 pl-2 pr-2 rounded-xl border-b border-slate-200 bg-white">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#e11d48]">
              <FileText size={22} />
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pages CMS Management
            </h1>
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
              {pages.length} Pages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic Headless CMS page configurations, recursive property key hierarchy trees, and role permissions.
          </p>
        </div>

        {canEdit && (
          <Link
            href="/pages/create"
            className="bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white px-5 py-2.5 min-h-[44px] rounded-xl font-sans text-xs font-bold cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_22px_rgba(244,63,94,0.45)] transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus size={18} />
            <span>Create Dynamic Page</span>
          </Link>
        )}
      </div>

      {/* Session Role Notice */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-[#9333ea]" />
          <div className="text-xs">
            <span className="font-bold text-slate-900">Current Session Role: </span>
            <span className="font-extrabold uppercase text-[#e11d48]">{userRole}</span>
            <span className="text-slate-500 ml-2">
              {canEdit
                ? '• You have permission to manage fields, add property keys, and publish page updates.'
                : '• Standard user role is read-only for page content.'}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center max-w-md">
        <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter pages by slug name..."
          className="w-full font-sans text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 placeholder:text-slate-400 font-medium"
        />
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-500 shadow-2xs">
          Loading CMS pages from the backend...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-xs text-[#e11d48]">
          {(error as Error)?.message || 'Unable to load pages from the API.'}
        </div>
      )}

      {/* Pages Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {!isLoading && filteredPages.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-400 text-xs font-sans shadow-2xs">
            No pages found matching search filter. Click &quot;Create Dynamic Page&quot; to build a new page.
          </div>
        ) : (
          filteredPages.map((page) => {
            const fieldKeys = Object.keys(page.content || {});
            return (
              <div
                key={page.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 shadow-2xs transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-[#e11d48] px-3 py-1 rounded-full text-xs font-mono font-bold">
                      <Globe size={13} className="text-rose-500" />
                      <span className="text-slate-900">{page.slug}</span>
                    </span>
                    <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold font-mono">
                      {fieldKeys.length} Root Keys
                    </span>
                  </div>

                  {/* Content Key Inspector Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-2 font-mono text-[0.72rem] text-slate-300 flex flex-col gap-1.5 overflow-hidden">
                    <div className="text-[0.68rem] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="flex items-center gap-1 text-rose-400">
                        <Layers size={12} />
                        Property Hierarchy Keys
                      </span>
                      <Code2 size={12} className="text-[#9333ea]" />
                    </div>
                    {fieldKeys.slice(0, 4).map((k) => {
                      const val = page.content[k];
                      const valType = Array.isArray(val)
                        ? `Array [${val.length}]`
                        : typeof val === 'object' && val !== null
                          ? `Object {${Object.keys(val).length}}`
                          : typeof val;

                      return (
                        <div key={k} className="flex items-center justify-between truncate">
                          <span className="text-rose-300 font-bold">{k}:</span>
                          <span className="text-slate-400 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
                            {valType}
                          </span>
                        </div>
                      );
                    })}
                    {fieldKeys.length > 4 && (
                      <div className="text-slate-500 italic text-[0.68rem] pt-0.5">
                        + {fieldKeys.length - 4} additional key nodes...
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[0.72rem] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    <span>Updated {new Date(page.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/pages/edit/${page.id}`}
                      className="bg-gradient-to-r from-[#f43f5e] to-[#9333ea] text-white px-3.5 py-1.5 rounded-lg font-sans text-xs font-bold cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>{canEdit ? 'Edit Page' : 'View Content'}</span>
                    </Link>

                    {canEdit && (
                      <button
                        onClick={() => handleDeletePage(page)}
                        className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-[#e11d48] hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <ActionConfirmationModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeletePage}
        action="delete"
        title="Delete Page"
        itemName={deleteTarget ? `/${deleteTarget.slug}` : undefined}
        confirmLabel="Delete Page"
      />
    </div>
  );
}
