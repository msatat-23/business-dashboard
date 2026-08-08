'use client';

import { Clock, Edit3, Globe, Trash2 } from 'lucide-react';

import type { Content } from '@/lib/types';
import { ContentFieldsPreview } from './ContentFieldsPreview';

interface ContentCardProps {
    content: Content;
    canEdit: boolean;
    onEdit: (content: Content) => void;
    onDelete: (content: Content) => void;
}

export function ContentCard({
    content,
    canEdit,
    onEdit,
    onDelete,
}: ContentCardProps) {
    const fieldCount = Object.keys(content.content).length;

    return (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 shadow-2xs transition-all">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-[#e11d48] px-3 py-1 rounded-full text-xs font-mono font-bold">
                        <Globe size={13} className="text-rose-500" />
                        <span className="text-slate-900">{content.slug}</span>
                    </span>

                    <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold font-mono">
                        {fieldCount} Fields
                    </span>
                </div>

                <ContentFieldsPreview content={content.content} />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[0.72rem] text-slate-500">
                <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" />
                    <span>
                        Updated{' '}
                        {new Date(content.updatedAt).toLocaleDateString()}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onEdit(content)}
                        className="bg-gradient-to-r from-[#f43f5e] to-[#9333ea] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5"
                    >
                        <Edit3 size={13} />
                        <span>{canEdit ? 'Edit Content' : 'View Content'}</span>
                    </button>

                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => onDelete(content)}
                            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-[#e11d48] hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Content"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}