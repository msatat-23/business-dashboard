'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Save } from 'lucide-react';

import { Modal } from '@/components/ui/Modal';
import { ContentFieldEditor } from './ContentFieldEditor';

import {
    contentDataToEditableFields,
    createEditableField,
    editableFieldsToContentData,
    type EditableContentField,
} from '@/lib/content-editor';
import type { ContentData } from '@/lib/types';

interface ContentEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    slug: string;
    initialContent?: ContentData;
    onSave: (
        slug: string,
        content: ContentData,
    ) => void;
    isSaving?: boolean;
}

export function ContentEditorModal({
    isOpen,
    onClose,
    slug,
    initialContent = {},
    onSave,
    isSaving = false,
}: ContentEditorModalProps) {
    const [fields, setFields] = useState<
        EditableContentField[]
    >([]);
    const [contentSlug, setContentSlug] =
        useState(slug);

    useEffect(() => {
        if (!isOpen) return;

        const initializeFieldsAndContentSlug = () => {
            setFields(
                contentDataToEditableFields(
                    initialContent,
                ),
            );
            setContentSlug(slug);
        };

        initializeFieldsAndContentSlug();

    }, [isOpen, initialContent, slug]);

    const updateField = (
        id: string,
        changes: Partial<EditableContentField>,
    ) => {
        setFields((current) =>
            current.map((field) =>
                field.id === id
                    ? { ...field, ...changes }
                    : field,
            ),
        );
    };

    const removeField = (id: string) => {
        setFields((current) =>
            current.filter((field) => field.id !== id),
        );
    };

    const addField = () => {
        setFields((current) => [
            ...current,
            createEditableField(),
        ]);
    };

    const handleSave = () => {
        const trimmedSlug = contentSlug.trim();

        if (!trimmedSlug) return;

        onSave(
            trimmedSlug,
            editableFieldsToContentData(fields),
        );
    };

    const isExistingContent =
        Object.keys(initialContent).length > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Content Management — ${slug || 'New Content'}`}
            maxWidth="max-w-5xl"
        >
            <div className="space-y-5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                        <FileText
                            size={17}
                            className="text-[#e11d48]"
                        />

                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Content Fields
                        </span>

                        <span className="ml-auto bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono text-slate-500">
                            {fields.length} Fields
                        </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5">
                        Field types are used by the editor only.
                        The API receives simple values such as
                        <code className="mx-1 font-mono">
                            {`{ property: "value" }`}
                        </code>
                        without editor metadata.
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                        Content Slug
                    </label>

                    <input
                        type="text"
                        value={contentSlug}
                        onChange={(event) =>
                            setContentSlug(event.target.value)
                        }
                        disabled={isExistingContent}
                        placeholder="e.g. home, about, services"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <ContentFieldEditor
                            key={field.id}
                            field={field}
                            index={index}
                            onChange={(changes) =>
                                updateField(field.id, changes)
                            }
                            onRemove={() =>
                                removeField(field.id)
                            }
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addField}
                    className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-[#f43f5e] hover:bg-rose-50/30 rounded-2xl text-xs font-bold text-slate-500 hover:text-[#e11d48] transition-all flex items-center justify-center gap-2"
                >
                    <Plus size={16} />
                    Add Content Field
                </button>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            isSaving || !contentSlug.trim()
                        }
                        className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#f43f5e] to-[#9333ea] hover:shadow-md disabled:opacity-50 rounded-xl transition-all flex items-center gap-1.5"
                    >
                        <Save size={14} />
                        {isSaving ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
