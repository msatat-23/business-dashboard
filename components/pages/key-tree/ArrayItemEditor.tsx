'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ArrayItemNode, ArrayItemType } from './types';
import { ARRAY_ITEM_OPTIONS } from './type-options';
import { NodeValueEditor } from './NodeValueEditor';
import { NestedObjectEditor } from './NestedObjectEditor';

interface ArrayItemEditorProps {
    item: ArrayItemNode;
    index: number;
    parentKey: string;
    mode?: 'create' | 'edit';
    onUpdate: (updated: ArrayItemNode) => void;
    onDelete: () => void;
}

export function ArrayItemEditor({ item, index, parentKey, mode, onUpdate, onDelete }: ArrayItemEditorProps) {
    const handleTypeChange = (newType: ArrayItemType) => {
        onUpdate({
            ...item,
            type: newType,
            valueText: item.valueText || item.valueImage || '',
            valueImage: item.valueImage || item.valueText || '',
        });
    };

    return (
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 space-y-3 shadow-2xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {index+1}
                    </span>

                    <CustomSelect
                        value={item.type}
                        onChange={handleTypeChange}
                        options={ARRAY_ITEM_OPTIONS}
                        buttonClassName="!bg-slate-100 !text-slate-800 !border-slate-200 !py-0.5 !text-[10px]"
                    />
                </div>

                <button
                    type="button"
                    onClick={onDelete}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Remove Array Element"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {(item.type === 'plainText' || item.type === 'richText') && (
                <NodeValueEditor
                    type={item.type}
                    value={item.valueText || item.valueImage || ''}
                    onChange={(val) => onUpdate({ ...item, valueText: val, valueImage: val })}
                    placeholder={`Array element [${index}] text...`}
                />
            )}

            {item.type === 'image' && (
                <NodeValueEditor
                    type="image"
                    value={item.valueImage || item.valueText || ''}
                    onChange={(url) => onUpdate({ ...item, valueImage: url, valueText: url })}
                />
            )}

            {item.type === 'object' && (
                <NestedObjectEditor
                    nodes={item.valueObject || []}
                    onChange={(childNodes) => onUpdate({ ...item, valueObject: childNodes })}
                    parentKey={`${parentKey}[${index}]`}
                    mode={mode}
                />
            )}
        </div>
    );
}