'use client';

import React, { useState } from 'react';
import { Plus, ListFilter } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ArrayItemNode, ArrayItemType, generateId } from './types';
import { ARRAY_ITEM_OPTIONS } from './type-options';
import { ArrayItemEditor } from './ArrayItemEditor';

interface NestedArrayEditorProps {
    items: ArrayItemNode[];
    onChange: (items: ArrayItemNode[]) => void;
    parentKey: string;
    mode?: 'create' | 'edit';
}

export function NestedArrayEditor({ items, onChange, parentKey, mode }: NestedArrayEditorProps) {
    const [arrayItemType, setArrayItemType] = useState<ArrayItemType>('plainText');
    const [elementCountInput, setElementCountInput] = useState<string>(String(items.length));

    const buildItem = (): ArrayItemNode => ({
        id: generateId(),
        type: arrayItemType,
        valueText: arrayItemType === 'plainText' || arrayItemType === 'richText' ? '' : undefined,
        valueImage: arrayItemType === 'image' ? '' : undefined,
        valueObject: arrayItemType === 'object' ? [] : undefined,
    });

    const handleAddItem = () => {
        const updated = [...items, buildItem()];
        onChange(updated);
        setElementCountInput(String(updated.length));
    };

    const handleSetElementCount = () => {
        const targetCount = parseInt(elementCountInput, 10);
        if (isNaN(targetCount) || targetCount < 0) return;
        if (targetCount === items.length) return;

        if (targetCount > items.length) {
            const added: ArrayItemNode[] = [];
            for (let i = items.length; i < targetCount; i++) {
                added.push(buildItem());
            }
            onChange([...items, ...added]);
        } else {
            onChange(items.slice(0, targetCount));
        }
    };

    return (
        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
            {/* Header toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
                        <ListFilter size={15} />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-900">Array Container: </span>
                        <code className="font-mono bg-slate-200 text-slate-900 px-2 py-0.5 rounded text-[11px] border border-slate-300">
                            {parentKey}
                        </code>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono border border-emerald-200">
                        {items.length} {items.length === 1 ? 'element' : 'elements'}
                    </span>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Element Count Input */}
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-2 py-1 text-xs">
                        <span className="text-[11px] font-medium text-slate-600">Count:</span>
                        <input
                            type="number"
                            min="0"
                            value={elementCountInput}
                            onChange={(e) => setElementCountInput(e.target.value)}
                            className="w-10 font-mono text-xs text-slate-900 outline-none text-center font-bold"
                        />
                        <button
                            type="button"
                            onClick={handleSetElementCount}
                            className="text-[10px] bg-slate-800 text-white font-bold px-2 py-0.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                            Set
                        </button>
                    </div>

                    <CustomSelect
                        value={arrayItemType}
                        onChange={setArrayItemType}
                        options={ARRAY_ITEM_OPTIONS}
                        buttonClassName="!bg-slate-900 !border-slate-700"
                    />

                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                        <Plus size={14} />
                        <span>Add Element</span>
                    </button>
                </div>
            </div>

            {/* Item Cards List */}
            {items.length === 0 ? (
                <div className="p-6 text-center bg-white border border-dashed border-slate-200 rounded-xl space-y-1">
                    <p className="text-xs font-bold text-slate-600">Array is currently empty</p>
                    <p className="text-[11px] text-slate-400">
                        Set element count above or click &quot;Add Element&quot; to append items.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, idx) => (
                        <ArrayItemEditor
                            key={item.id}
                            item={item}
                            index={idx}
                            parentKey={parentKey}
                            mode={mode}
                            onUpdate={(updated) => onChange(items.map((it) => (it.id === item.id ? updated : it)))}
                            onDelete={() => onChange(items.filter((it) => it.id !== item.id))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}