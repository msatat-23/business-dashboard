'use client';

import {
    Image as ImageIcon,
    ListPlus,
    Plus,
    Trash2,
    Type,
} from 'lucide-react';

import { CustomSelect } from '@/components/ui/Select';
import { ImageProgressUploader } from '@/components/pages/ImageProgressUploader';

import type { ContentArrayItem } from '@/lib/types';

interface ContentArrayEditorProps {
    items: ContentArrayItem[];
    onChange: (items: ContentArrayItem[]) => void;
}

export function ContentArrayEditor({
    items,
    onChange,
}: ContentArrayEditorProps) {
    const addItem = () => {
        onChange([
            ...items,
            {
                type: 'text',
                value: '',
            },
        ]);
    };

    const updateItem = (
        index: number,
        changes: Partial<ContentArrayItem>,
    ) => {
        onChange(
            items.map((item, itemIndex) =>
                itemIndex === index
                    ? { ...item, ...changes }
                    : item,
            ),
        );
    };

    const removeItem = (index: number) => {
        onChange(
            items.filter(
                (_, itemIndex) => itemIndex !== index,
            ),
        );
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <ListPlus size={13} />
                    Array Items
                </label>

                <button
                    type="button"
                    onClick={addItem}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                    <Plus size={13} />
                    Add Item
                </button>
            </div>

            {items.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-xl py-8 text-center">
                    <ListPlus
                        size={20}
                        className="mx-auto text-slate-300 mb-2"
                    />

                    <p className="text-xs text-slate-400">
                        No array items yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <span className="w-7 h-7 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                    {index + 1}
                                </span>

                                <div className="w-[105px] shrink-0">
                                    <CustomSelect<'text' | 'image'>
                                        value={item.type}
                                        onChange={(value) =>
                                            updateItem(index, {
                                                type: value,
                                                value: '',
                                            })
                                        }
                                        options={[
                                            {
                                                value: 'text',
                                                label: 'Text',
                                                icon: <Type size={12} />,
                                            },
                                            {
                                                value: 'image',
                                                label: 'Image',
                                                icon: (
                                                    <ImageIcon size={12} />
                                                ),
                                            },
                                        ]}
                                        size="sm"
                                        minWidth="min-w-0"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="sm:ml-auto p-2 rounded-lg text-slate-400 hover:text-[#e11d48] hover:bg-rose-50 transition-colors"
                                    title="Remove item"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {item.type === 'text' ? (
                                <input
                                    type="text"
                                    value={item.value}
                                    onChange={(event) =>
                                        updateItem(index, {
                                            value: event.target.value,
                                        })
                                    }
                                    placeholder="Enter array text..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 outline-none focus:border-[#f43f5e]"
                                />
                            ) : (
                                <ImageProgressUploader
                                    value={item.value}
                                    onChange={(value) =>
                                        updateItem(index, { value })
                                    }
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
