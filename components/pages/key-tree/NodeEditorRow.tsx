'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { KeyNode } from './types';
import { TYPE_OPTIONS } from './type-options';
import { NodeValueEditor } from './NodeValueEditor';
import { NestedObjectEditor } from './NestedObjectEditor';
import { NestedArrayEditor } from './NestedArrayEditor';

interface NodeEditorRowProps {
    node: KeyNode;
    index: number;
    total: number;
    onUpdate: (updated: KeyNode) => void;
    onDelete: () => void;
    onMove: (direction: 'up' | 'down') => void;
    mode?: 'create' | 'edit';
}

const VALUE_LABELS: Record<'plainText' | 'richText', string> = {
    plainText: 'Plain Text Value',
    richText: 'Rich Text Value',
};

export function NodeEditorRow({ node, index, total, onUpdate, onDelete, onMove, mode }: NodeEditorRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs transition-all hover:border-slate-300">
            {/* Node Row Header */}
            <div
                className={`bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl ${!isExpanded ? 'rounded-b-2xl border-b-0' : ''
                    }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {/* Key Name Input */}
                    <input
                        type="text"
                        value={node.key}
                        onChange={(e) => onUpdate({ ...node, key: e.target.value })}
                        className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 focus:border-[#f43f5e] outline-none shadow-2xs w-36 sm:w-44"
                        placeholder="key_name"
                    />

                    {/* Type Selector Dropdown */}
                    <CustomSelect
                        value={node.type}
                        onChange={(newType) =>
                            onUpdate({
                                ...node,
                                type: newType,
                                valueText: node.valueText || node.valueImage || '',
                                valueImage: node.valueImage || node.valueText || '',
                                valueObject: newType === 'object' ? node.valueObject || [] : undefined,
                                valueArray: newType === 'array' ? node.valueArray || [] : undefined,
                            })
                        }
                        options={TYPE_OPTIONS}
                        buttonClassName="!bg-white !text-slate-800 !border-slate-200 !py-1 !text-[11px]"
                    />
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => onMove('up')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Move Up"
                    >
                        <MoveUp size={14} />
                    </button>
                    <button
                        type="button"
                        disabled={index === total - 1}
                        onClick={() => onMove('down')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Move Down"
                    >
                        <MoveDown size={14} />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-300 mx-1" />
                    {mode === 'create' && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Key"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Node Content Body */}
            {isExpanded && (
                <div className="p-4 bg-white rounded-b-2xl">
                    {(node.type === 'plainText' || node.type === 'richText') && (
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">{VALUE_LABELS[node.type]}</label>
                            <NodeValueEditor
                                type={node.type}
                                value={node.valueText || node.valueImage || ''}
                                onChange={(val) => onUpdate({ ...node, valueText: val, valueImage: val })}
                                placeholder={`Content for key "${node.key}"...`}
                            />
                        </div>
                    )}

                    {node.type === 'image' && (
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Image Asset</label>
                            <NodeValueEditor
                                type="image"
                                value={node.valueImage || node.valueText || ''}
                                onChange={(url) => onUpdate({ ...node, valueImage: url, valueText: url })}
                            />
                        </div>
                    )}

                    {node.type === 'object' && (
                        <NestedObjectEditor
                            nodes={node.valueObject || []}
                            onChange={(childNodes) => onUpdate({ ...node, valueObject: childNodes })}
                            parentKey={node.key}
                            mode={mode}
                        />
                    )}

                    {node.type === 'array' && (
                        <NestedArrayEditor
                            items={node.valueArray || []}
                            onChange={(items) => onUpdate({ ...node, valueArray: items })}
                            parentKey={node.key}
                            mode={mode}
                        />
                    )}
                </div>
            )}
        </div>
    );
}