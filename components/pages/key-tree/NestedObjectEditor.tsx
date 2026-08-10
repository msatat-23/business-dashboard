'use client';

import React, { useState } from 'react';
import { Plus, FolderTree } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { KeyNode, KeyType, generateId } from './types';
import { TYPE_OPTIONS } from './type-options';
import { NodeEditorRow } from './NodeEditorRow';
import { useToast } from '@/context/ToastContext';

interface NestedObjectEditorProps {
    nodes: KeyNode[];
    onChange: (nodes: KeyNode[]) => void;
    parentKey: string;
    mode?: 'create' | 'edit';
}

export function NestedObjectEditor({ nodes, onChange, parentKey, mode }: NestedObjectEditorProps) {
    const [nestedKeyName, setNestedKeyName] = useState('');
    const [nestedKeyType, setNestedKeyType] = useState<KeyType>('plainText');
    const { showToast } = useToast();

    const handleAddNestedKey = () => {
        const trimmed = nestedKeyName.trim();
        if (!trimmed) return;

        if (nodes.some((n) => n.key === trimmed)) {
            showToast(`Property key "${trimmed}" already exists inside object "${parentKey}".`, 'error');
            return;
        }

        const newNode: KeyNode = {
            id: generateId(),
            key: trimmed,
            type: nestedKeyType,
            valueText: nestedKeyType === 'plainText' || nestedKeyType === 'richText' ? '' : undefined,
            valueImage: nestedKeyType === 'image' ? '' : undefined,
            valueObject: nestedKeyType === 'object' ? [] : undefined,
            valueArray: nestedKeyType === 'array' ? [] : undefined,
        };

        onChange([...nodes, newNode]);
        setNestedKeyName('');
    };

    return (
        <div className="p-4 bg-amber-50/30 border border-amber-200/70 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/60">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <FolderTree size={15} className="text-amber-600" />
                    <span>Object:</span>
                    <code className="font-mono bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                        {parentKey}
                    </code>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="text"
                        value={nestedKeyName}
                        onChange={(e) => setNestedKeyName(e.target.value)}
                        placeholder="Nested property key..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddNestedKey();
                        }}
                        className="px-3 py-1.5 bg-white border border-amber-300/80 rounded-xl text-xs text-slate-800 outline-none focus:border-amber-600 font-mono"
                    />

                    <CustomSelect
                        value={nestedKeyType}
                        onChange={setNestedKeyType}
                        options={TYPE_OPTIONS}
                        buttonClassName="!bg-amber-950 !border-amber-800"
                    />

                    <button
                        type="button"
                        onClick={handleAddNestedKey}
                        disabled={!nestedKeyName.trim()}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                    >
                        <Plus size={13} />
                        <span>Add Property</span>
                    </button>
                </div>
            </div>

            {nodes.length === 0 ? (
                <p className="text-xs text-amber-700/80 italic text-center py-2">
                    Object is empty. Add nested properties above.
                </p>
            ) : (
                <div className="space-y-3">
                    {nodes.map((child, idx) => (
                        <NodeEditorRow
                            key={child.id}
                            node={child}
                            index={idx}
                            total={nodes.length}
                            onUpdate={(updated) => onChange(nodes.map((n) => (n.id === child.id ? updated : n)))}
                            onDelete={() => onChange(nodes.filter((n) => n.id !== child.id))}
                            onMove={(dir) => {
                                const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
                                if (targetIdx < 0 || targetIdx >= nodes.length) return;
                                const copy = [...nodes];
                                const tmp = copy[idx];
                                copy[idx] = copy[targetIdx];
                                copy[targetIdx] = tmp;
                                onChange(copy);
                            }}
                            mode={mode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}