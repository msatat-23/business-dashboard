'use client';

import type { Content } from '@/lib/types';
import { ContentCard } from './ContentCard';

interface ContentListProps {
    contents: Content[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    canEdit: boolean;
    onEdit: (content: Content) => void;
    onDelete: (content: Content) => void;
}

export function ContentList({
    contents,
    isLoading,
    isError,
    errorMessage,
    canEdit,
    onEdit,
    onDelete,
}: ContentListProps) {
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-500 shadow-2xs">
                Loading CMS content from the backend...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-xs text-[#e11d48]">
                {errorMessage ?? 'Unable to load content from the API.'}
            </div>
        );
    }

    if (contents.length === 0) {
        return (
            <div className="py-12 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-400 text-xs shadow-2xs">
                No content found matching the search
                filter. Click &quot;Create Content&quot; to
                add a new content record.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {contents.map((content) => (
                <ContentCard
                    key={content.id}
                    content={content}
                    canEdit={canEdit}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}