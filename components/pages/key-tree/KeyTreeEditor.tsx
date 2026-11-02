'use client';

import React, { useState } from 'react';
import { Plus, FolderTree } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { KeyNode, KeyType, generateId } from './types';
import { TYPE_OPTIONS } from './type-options';
import { NodeEditorRow } from './NodeEditorRow';
import { useToast } from '@/context/ToastContext';

interface KeyTreeEditorProps {
    nodes: KeyNode[];
    onChange: (nodes: KeyNode[]) => void;
    mode?: 'create' | 'edit';
}

export function KeyTreeEditor({ nodes, onChange, mode = 'create' }: KeyTreeEditorProps) {
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyType, setNewKeyType] = useState<KeyType>('plainText');
    const { showToast } = useToast();

    const handleAddKey = () => {
        const trimmed = newKeyName.trim();
        if (!trimmed) return;

        if (nodes.some((n) => n.key === trimmed)) {
            showToast(`Property key "${trimmed}" already exists at this level.`, 'error');
            return;
        }

        const newNode: KeyNode = {
            id: generateId(),
            key: trimmed,
            type: newKeyType,
            valueText: newKeyType === 'plainText' || newKeyType === 'richText' ? '' : undefined,
            valueImage: newKeyType === 'image' ? '' : undefined,
            valueObject: newKeyType === 'object' ? [] : undefined,
            valueArray: newKeyType === 'array' ? [] : undefined,
        };

        onChange([...nodes, newNode]);
        setNewKeyName('');
    };

    const handleUpdateNode = (id: string, updated: KeyNode) => {
        onChange(nodes.map((n) => (n.id === id ? updated : n)));
    };

    const handleDeleteNode = (id: string) => {
        if (mode === 'edit') return;
        onChange(nodes.filter((n) => n.id !== id));
    };

    const handleMoveNode = (index: number, direction: 'up' | 'down') => {
        const newNodes = [...nodes];
        const targetIdx = direction === 'up' ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= newNodes.length) return;

        const temp = newNodes[index];
        newNodes[index] = newNodes[targetIdx];
        newNodes[targetIdx] = temp;
        onChange(newNodes);
    };

    return (
        <div className="space-y-6 font-sans">
            {/* Add Key Control Bar */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white shadow-md border border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#f43f5e] rounded-xl text-white shadow-sm">
                        <Plus size={18} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Add Property Key</span>
                            <span className="text-[10px] font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800/60">
                                Single Field
                            </span>
                        </h3>
                        <p className="text-[11px] text-slate-400">Enter key name and choose type</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
                    <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. title, hero, features..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddKey();
                        }}
                        className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-[#f43f5e] focus:ring-1 focus:ring-[#f43f5e]"
                    />

                    <CustomSelect value={newKeyType} onChange={setNewKeyType} options={TYPE_OPTIONS} />

                    <button
                        type="button"
                        onClick={handleAddKey}
                        disabled={!newKeyName.trim()}
                        className="px-4 py-2 bg-[#f43f5e] hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                    >
                        <Plus size={14} />
                        <span>Add Key</span>
                    </button>
                </div>
            </div>

            {/* Nodes List */}
            {nodes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                    <FolderTree size={32} className="mx-auto text-slate-400" />
                    <p className="text-xs font-bold text-slate-700">No Property Keys Added Yet</p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        Use the bar above to add your first key (e.g.{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">title</code>,{' '}
                        <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">features</code>).
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {nodes.map((node, index) => (
                        <NodeEditorRow
                            key={node.id}
                            node={node}
                            index={index}
                            total={nodes.length}
                            onUpdate={(updated) => handleUpdateNode(node.id, updated)}
                            onDelete={() => handleDeleteNode(node.id)}
                            onMove={(dir) => handleMoveNode(index, dir)}
                            mode={mode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}