'use client';

import {
    FileText,
    Image as ImageIcon,
    ListPlus,
    Trash2,
    Type,
} from 'lucide-react';

import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ImageProgressUploader } from '@/components/pages/ImageProgressUploader';
import { CustomSelect } from '@/components/ui/Select';
import { ContentArrayEditor } from './ContentArrayEditor';

import type {
    ContentArrayItem,
    ContentFieldType,
} from '@/lib/types';
import type { EditableContentField } from '@/lib/content-editor';

interface ContentFieldEditorProps {
    field: EditableContentField;
    index: number;
    onChange: (
        changes: Partial<EditableContentField>,
    ) => void;
    onRemove: () => void;
}

export function ContentFieldEditor({
    field,
    index,
    onChange,
    onRemove,
}: ContentFieldEditorProps) {
    const handleTypeChange = (
        type: ContentFieldType,
    ) => {
        onChange({
            type,
            value: '',
            items: [],
        });
    };

    const handleItemsChange = (
        items: ContentArrayItem[],
    ) => {
        onChange({ items });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-[#e11d48] flex items-center justify-center text-xs font-black">
                        {index + 1}
                    </div>

                    <span className="text-xs font-black text-slate-800">
                        Content Field
                    </span>
                </div>

                <div className="flex-1">
                    <input
                        type="text"
                        value={field.key}
                        onChange={(event) =>
                            onChange({
                                key: event.target.value,
                            })
                        }
                        placeholder="Field name e.g. heroTitle"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20"
                    />
                </div>

                <div className="w-[125px] shrink-0">
                    <CustomSelect<ContentFieldType>
                        value={field.type}
                        onChange={handleTypeChange}
                        options={[
                            {
                                value: 'text',
                                label: 'Text',
                                icon: <Type size={13} />,
                            },
                            {
                                value: 'richtext',
                                label: 'Rich Text',
                                icon: <FileText size={13} />,
                            },
                            {
                                value: 'image',
                                label: 'Image',
                                icon: <ImageIcon size={13} />,
                            },
                            {
                                value: 'array',
                                label: 'Array',
                                icon: <ListPlus size={13} />,
                            },
                        ]}
                        size="sm"
                        minWidth="min-w-0"
                    />
                </div>

                <button
                    type="button"
                    onClick={onRemove}
                    className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-[#e11d48] transition-colors"
                    title="Remove field"
                >
                    <Trash2 size={15} />
                </button>
            </div>

            {field.type === 'text' && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <Type size={13} />
                        Text Value
                    </label>

                    <input
                        type="text"
                        value={field.value}
                        onChange={(event) =>
                            onChange({
                                value: event.target.value,
                            })
                        }
                        placeholder="Enter normal text..."
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20"
                    />
                </div>
            )}

            {field.type === 'richtext' && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <FileText size={13} />
                        Rich Text Value
                    </label>

                    <RichTextEditor
                        value={field.value}
                        onChange={(value) =>
                            onChange({ value })
                        }
                        placeholder="Enter rich text content..."
                        minHeight="min-h-[180px]"
                    />
                </div>
            )}

            {field.type === 'image' && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <ImageIcon size={13} />
                        Image
                    </label>

                    <ImageProgressUploader
                        value={field.value}
                        onChange={(value) =>
                            onChange({ value })
                        }
                    />
                </div>
            )}

            {field.type === 'array' && (
                <ContentArrayEditor
                    items={field.items}
                    onChange={handleItemsChange}
                />
            )}
        </div>
    );
}
