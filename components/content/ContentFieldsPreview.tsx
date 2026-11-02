'use client';

import { Code2, Layers, List, Type } from 'lucide-react';

import type { ContentData } from '@/lib/types';

interface ContentFieldsPreviewProps {
    content: ContentData;
    maxVisible?: number;
}

export function ContentFieldsPreview({
    content,
    maxVisible = 5,
}: ContentFieldsPreviewProps) {
    const fields = Object.entries(content);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-2 font-mono text-[0.72rem] text-slate-300 flex flex-col gap-1.5 overflow-hidden">
            <div className="text-[0.68rem] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                <span className="flex items-center gap-1 text-rose-400">
                    <Layers size={12} />
                    Content Fields
                </span>

                <Code2 size={12} className="text-[#9333ea]" />
            </div>

            {fields
                .slice(0, maxVisible)
                .map(([key, value]) => {
                    const isArray = Array.isArray(value);
                    const Icon = isArray ? List : Type;
                    const label = isArray
                        ? `Array [${value.length}]`
                        : 'Value';

                    return (
                        <div
                            key={key}
                            className="flex items-center justify-between gap-2 truncate"
                        >
                            <span className="text-rose-300 font-bold truncate flex items-center gap-1.5">
                                <Icon size={11} className="shrink-0" />
                                {key}
                            </span>

                            <span className="text-slate-400 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                {label}
                            </span>
                        </div>
                    );
                })}

            {fields.length > maxVisible && (
                <div className="text-slate-500 italic text-[0.68rem] pt-0.5">
                    + {fields.length - maxVisible} additional fields...
                </div>
            )}

            {fields.length === 0 && (
                <div className="text-slate-500 italic">
                    No fields configured.
                </div>
            )}
        </div>
    );
}