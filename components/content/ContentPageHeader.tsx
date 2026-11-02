'use client';

import { FileText, Plus } from 'lucide-react';

interface ContentPageHeaderProps {
    contentCount: number;
    canEdit: boolean;
    onCreateClick: () => void;
}

export function ContentPageHeader({
    contentCount,
    canEdit,
    onCreateClick,
}: ContentPageHeaderProps) {
    return (
        <div className="sticky top-20 z-6 bg-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-slate-200">
            <div>
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#e11d48]">
                        <FileText size={22} />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Content Management
                    </h1>

                    <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                        {contentCount} Content
                    </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                    Manage flat CMS content fields with text,
                    rich text, image, and array values.
                </p>
            </div>

            {canEdit && (
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_22px_rgba(244,63,94,0.45)] transition-all flex items-center justify-center gap-2 shrink-0"
                >
                    <Plus size={18} />
                    <span>Create Content</span>
                </button>
            )}
        </div>
    );
}