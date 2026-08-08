'use client';

import { useState } from 'react';
import {
    Code2,
    Clock,
    Edit3,
    FileText,
    Globe,
    Image as ImageIcon,
    Layers,
    List,
    Plus,
    Search,
    Shield,
    Trash2,
    Type,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
    mapContentApiToDashboard,
    useContentsQuery,
    useDeleteContentMutation,
    useUpdateContentMutation,
} from '@/hooks/use-contents-api';

import type { Content, ContentData } from '@/lib/types';
import { ContentEditorModal } from './ContentEditorModal';

interface ContentManagementProps {
    onShowToast?: (
        msg: string,
        type?: 'success' | 'error' | 'info',
    ) => void;
}

export function ContentManagement({
    onShowToast,
}: ContentManagementProps) {
    const { showToast: contextToast } = useToast();
    const showToast = onShowToast ?? contextToast;
    const { currentUser } = useAuth();

    const {
        data: contentApiData = [],
        isLoading,
        isError,
        error,
    } = useContentsQuery();

    const updateContentMutation =
        useUpdateContentMutation();
    const deleteContentMutation =
        useDeleteContentMutation();

    const contents = contentApiData.map(
        mapContentApiToDashboard,
    );

    const [searchTerm, setSearchTerm] =
        useState('');
    const [editorOpen, setEditorOpen] =
        useState(false);
    const [selectedContent, setSelectedContent] =
        useState<Content | null>(null);

    const userRole = currentUser?.role ?? 'user';
    const canEdit =
        userRole === 'admin' || userRole === 'editor';

    const filteredContents = contents.filter(
        (content) =>
            content.slug
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
    );

    const openCreateEditor = () => {
        setSelectedContent({
            id: 0,
            slug: '',
            content: {},
            updatedByEmail: null,
            createdAt: '',
            updatedAt: '',
        });
        setEditorOpen(true);
    };

    const openEditEditor = (content: Content) => {
        setSelectedContent(content);
        setEditorOpen(true);
    };

    const closeEditor = () => {
        if (updateContentMutation.isPending) return;

        setEditorOpen(false);
        setSelectedContent(null);
    };

    const handleDeleteContent = (content: Content) => {
        if (
            !confirm(
                `Are you sure you want to delete content "/${content.slug}"?`,
            )
        ) {
            return;
        }

        deleteContentMutation.mutate(content.id, {
            onSuccess: () => {
                showToast(
                    'Content removed successfully.',
                    'success',
                );
            },
            onError: (mutationError) => {
                showToast(
                    mutationError instanceof Error
                        ? mutationError.message
                        : 'Content delete failed.',
                    'error',
                );
            },
        });
    };

    const handleSaveContent = (
        slug: string,
        content: ContentData,
    ) => {
        if (!slug.trim()) {
            showToast(
                'Content slug is required.',
                'error',
            );
            return;
        }

        updateContentMutation.mutate(
            {
                slug: slug.trim(),
                content,
            },
            {
                onSuccess: () => {
                    showToast(
                        'Content saved successfully.',
                        'success',
                    );
                    closeEditor();
                },
                onError: (mutationError) => {
                    showToast(
                        mutationError instanceof Error
                            ? mutationError.message
                            : 'Content save failed.',
                        'error',
                    );
                },
            },
        );
    };

    return (
        <div className="flex flex-col gap-6 w-full font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#e11d48]">
                            <FileText size={22} />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Content Management
                        </h1>

                        <span className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold font-mono">
                            {contents.length} Content
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
                        onClick={openCreateEditor}
                        className="bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_22px_rgba(244,63,94,0.45)] transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                        <Plus size={18} />
                        <span>Create Content</span>
                    </button>
                )}
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                    <Shield
                        size={18}
                        className="text-[#9333ea]"
                    />

                    <div className="text-xs">
                        <span className="font-bold text-slate-900">
                            Current Session Role:{' '}
                        </span>

                        <span className="font-extrabold uppercase text-[#e11d48]">
                            {userRole}
                        </span>

                        <span className="text-slate-500 ml-2">
                            {canEdit
                                ? '• You have permission to create, edit, and publish content.'
                                : '• Standard user role is read-only for content.'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative flex items-center max-w-md">
                <Search
                    size={16}
                    className="absolute left-3.5 text-slate-400 pointer-events-none"
                />

                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) =>
                        setSearchTerm(event.target.value)
                    }
                    placeholder="Filter content by slug name..."
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 placeholder:text-slate-400 font-medium"
                />
            </div>

            {isLoading && (
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-xs text-slate-500 shadow-2xs">
                    Loading CMS content from the backend...
                </div>
            )}

            {isError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-xs text-[#e11d48]">
                    {error instanceof Error
                        ? error.message
                        : 'Unable to load content from the API.'}
                </div>
            )}

            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredContents.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-400 text-xs shadow-2xs">
                            No content found matching the search
                            filter. Click &quot;Create Content&quot; to
                            add a new content record.
                        </div>
                    ) : (
                        filteredContents.map((content) => {
                            const fields = Object.entries(
                                content.content,
                            );

                            return (
                                <div
                                    key={content.id}
                                    className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-slate-300 shadow-2xs transition-all"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-[#e11d48] px-3 py-1 rounded-full text-xs font-mono font-bold">
                                                <Globe
                                                    size={13}
                                                    className="text-rose-500"
                                                />

                                                <span className="text-slate-900">
                                                    {content.slug}
                                                </span>
                                            </span>

                                            <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold font-mono">
                                                {fields.length} Fields
                                            </span>
                                        </div>

                                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-2 font-mono text-[0.72rem] text-slate-300 flex flex-col gap-1.5 overflow-hidden">
                                            <div className="text-[0.68rem] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1">
                                                <span className="flex items-center gap-1 text-rose-400">
                                                    <Layers size={12} />
                                                    Content Fields
                                                </span>

                                                <Code2
                                                    size={12}
                                                    className="text-[#9333ea]"
                                                />
                                            </div>

                                            {fields
                                                .slice(0, 5)
                                                .map(([key, value]) => {
                                                    const isArray =
                                                        Array.isArray(value);
                                                    const Icon = isArray
                                                        ? List
                                                        : Type;
                                                    const label = isArray
                                                        ? `Array [${value.length}]`
                                                        : 'Value';

                                                    return (
                                                        <div
                                                            key={key}
                                                            className="flex items-center justify-between gap-2 truncate"
                                                        >
                                                            <span className="text-rose-300 font-bold truncate flex items-center gap-1.5">
                                                                <Icon
                                                                    size={11}
                                                                    className="shrink-0"
                                                                />
                                                                {key}
                                                            </span>

                                                            <span className="text-slate-400 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                                                {label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}

                                            {fields.length > 5 && (
                                                <div className="text-slate-500 italic text-[0.68rem] pt-0.5">
                                                    + {fields.length - 5}{' '}
                                                    additional fields...
                                                </div>
                                            )}

                                            {fields.length === 0 && (
                                                <div className="text-slate-500 italic">
                                                    No fields configured.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[0.72rem] text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Clock
                                                size={12}
                                                className="text-slate-400"
                                            />

                                            <span>
                                                Updated{' '}
                                                {new Date(
                                                    content.updatedAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditEditor(content)
                                                }
                                                className="bg-gradient-to-r from-[#f43f5e] to-[#9333ea] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:shadow-md transition-all flex items-center gap-1.5"
                                            >
                                                <Edit3 size={13} />
                                                <span>
                                                    {canEdit
                                                        ? 'Edit Content'
                                                        : 'View Content'}
                                                </span>
                                            </button>

                                            {canEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteContent(
                                                            content,
                                                        )
                                                    }
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
                        })
                    )}
                </div>
            )}

            {selectedContent && (
                <ContentEditorModal
                    isOpen={editorOpen}
                    onClose={closeEditor}
                    slug={selectedContent.slug}
                    initialContent={selectedContent.content}
                    onSave={handleSaveContent}
                    isSaving={updateContentMutation.isPending}
                />
            )}
        </div>
    );
}
