'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Type,
  Image as ImageIcon,
  FolderTree,
  ListFilter,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { ImageProgressUploader } from './ImageProgressUploader';

export type KeyType = 'text' | 'image' | 'object' | 'array';

export interface KeyNode {
  id: string;
  key: string;
  type: KeyType;
  valueText?: string;
  valueImage?: string;
  valueObject?: KeyNode[];
  valueArray?: ArrayItemNode[];
}

export interface ArrayItemNode {
  id: string;
  type: 'text' | 'image' | 'object';
  valueText?: string;
  valueImage?: string;
  valueObject?: KeyNode[];
}

interface KeyTreeEditorProps {
  nodes: KeyNode[];
  onChange: (nodes: KeyNode[]) => void;
  mode?: "create" | "edit"
}

// Key type select options with icons
const TYPE_OPTIONS: SelectOption<KeyType>[] = [
  { value: 'text', label: 'Text', icon: <Type size={14} className="text-blue-400" /> },
  { value: 'image', label: 'Image', icon: <ImageIcon size={14} className="text-purple-400" /> },
  { value: 'object', label: 'Group', icon: <FolderTree size={14} className="text-amber-400" /> },
  { value: 'array', label: 'List', icon: <ListFilter size={14} className="text-emerald-400" /> },
];

const ARRAY_ITEM_OPTIONS: SelectOption<'text' | 'image' | 'object'>[] = [
  { value: 'text', label: 'Rich Text', icon: <Type size={14} className="text-blue-400" /> },
  { value: 'image', label: 'Image', icon: <ImageIcon size={14} className="text-purple-400" /> },
  { value: 'object', label: 'Group', icon: <FolderTree size={14} className="text-amber-400" /> },
];

export function generateId(): string {
  return 'node_' + Math.random().toString(36).substring(2, 9);
}

export function treeToRecord(nodes: KeyNode[]): Record<string, any> {
  const result: Record<string, any> = {};

  for (const node of nodes) {
    if (!node.key.trim()) continue;

    if (node.type === 'text') {
      result[node.key] = node.valueText ?? node.valueImage ?? '';
    } else if (node.type === 'image') {
      result[node.key] = node.valueImage ?? node.valueText ?? '';
    } else if (node.type === 'object') {
      result[node.key] = treeToRecord(node.valueObject || []);
    } else if (node.type === 'array') {
      result[node.key] = (node.valueArray || []).map((item) => {
        if (item.type === 'text') return item.valueText ?? item.valueImage ?? '';
        if (item.type === 'image') return item.valueImage ?? item.valueText ?? '';
        if (item.type === 'object') return treeToRecord(item.valueObject || []);
        return '';
      });
    }
  }

  return result;
}

export function recordToTree(obj: Record<string, any>): KeyNode[] {
  if (!obj || typeof obj !== 'object') return [];

  return Object.entries(obj).map(([key, val]) => {
    const id = generateId();

    if (typeof val === 'string') {
      const isImg =
        val.startsWith('data:image/') ||
        val.startsWith('/uploads/') ||
        val.includes('cloudinary') ||
        val.includes('images.unsplash.com') ||
        (val.startsWith('http') && Boolean(val.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)));

      if (isImg) {
        return { id, key, type: 'image', valueImage: val, valueText: val };
      }
      return { id, key, type: 'text', valueText: val, valueImage: val };
    }

    if (Array.isArray(val)) {
      const valueArray: ArrayItemNode[] = val.map((item) => {
        const itemId = generateId();
        if (typeof item === 'string') {
          const isImg =
            item.startsWith('data:image/') ||
            item.startsWith('/uploads/') ||
            item.includes('cloudinary') ||
            item.includes('images.unsplash.com') ||
            (item.startsWith('http') && Boolean(item.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i)));

          if (isImg) {
            return { id: itemId, type: 'image', valueImage: item, valueText: item };
          }
          return { id: itemId, type: 'text', valueText: item, valueImage: item };
        } else if (typeof item === 'object' && item !== null) {
          return { id: itemId, type: 'object', valueObject: recordToTree(item) };
        }
        return { id: itemId, type: 'text', valueText: String(item ?? ''), valueImage: String(item ?? '') };
      });

      return { id, key, type: 'array', valueArray };
    }

    if (typeof val === 'object' && val !== null) {
      return { id, key, type: 'object', valueObject: recordToTree(val) };
    }

    return { id, key, type: 'text', valueText: String(val ?? ''), valueImage: String(val ?? '') };
  });
}

export function KeyTreeEditor({ nodes, onChange, mode = "create" }: KeyTreeEditorProps) {
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<KeyType>('text');

  const handleAddKey = () => {
    const trimmed = newKeyName.trim();
    if (!trimmed) return;

    if (nodes.some((n) => n.key === trimmed)) {
      alert(`Property key "${trimmed}" already exists at this level.`);
      return;
    }

    const newNode: KeyNode = {
      id: generateId(),
      key: trimmed,
      type: newKeyType,
      valueText: newKeyType === 'text' ? '' : undefined,
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
    if (mode === "edit") return;
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

          <CustomSelect
            value={newKeyType}
            onChange={(val) => setNewKeyType(val)}
            options={TYPE_OPTIONS}
          />

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

function NodeEditorRow({
  node,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
  mode
}: {
  node: KeyNode;
  index: number;
  total: number;
  onUpdate: (updated: KeyNode) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  mode?: "create" | "edit"
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  console.log(mode)
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs transition-all hover:border-slate-300">
      {/* Node Row Header */}
      <div className={`bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl ${!isExpanded ? 'rounded-b-2xl border-b-0' : ''}`}>
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
            onChange={(newType) => {
              onUpdate({
                ...node,
                type: newType,
                valueText: node.valueText || node.valueImage || '',
                valueImage: node.valueImage || node.valueText || '',
                valueObject: newType === 'object' ? node.valueObject || [] : undefined,
                valueArray: newType === 'array' ? node.valueArray || [] : undefined,
              });
            }}
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
          {
            mode === "create" &&
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Key"
            >
              <Trash2 size={14} />
            </button>
          }
        </div>
      </div>

      {/* Node Content Body */}
      {isExpanded && (
        <div className="p-4 bg-white rounded-b-2xl">
          {node.type === 'text' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">Rich Text Value</label>
              <RichTextEditor
                value={node.valueText || node.valueImage || ''}
                onChange={(val) => onUpdate({ ...node, valueText: val, valueImage: val })}
                placeholder={`Content for key "${node.key}"...`}
              />
            </div>
          )}

          {node.type === 'image' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">Image Asset</label>
              <ImageProgressUploader
                value={node.valueImage || node.valueText || ''}
                onChange={(url) => onUpdate({ ...node, valueImage: url, valueText: url })}
                placeholder="Upload image or enter URL..."
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

// Nested Object Editor Component
function NestedObjectEditor({
  nodes,
  onChange,
  parentKey,
  mode
}: {
  nodes: KeyNode[];
  onChange: (nodes: KeyNode[]) => void;
  parentKey: string;
  mode?: "create" | "edit"
}) {
  const [nestedKeyName, setNestedKeyName] = useState('');
  const [nestedKeyType, setNestedKeyType] = useState<KeyType>('text');

  const handleAddNestedKey = () => {
    const trimmed = nestedKeyName.trim();
    if (!trimmed) return;

    if (nodes.some((n) => n.key === trimmed)) {
      alert(`Property key "${trimmed}" already exists inside object "${parentKey}".`);
      return;
    }

    const newNode: KeyNode = {
      id: generateId(),
      key: trimmed,
      type: nestedKeyType,
      valueText: nestedKeyType === 'text' ? '' : undefined,
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
            onChange={(val) => setNestedKeyType(val)}
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

// Clean, Polished Array Editor Component
function NestedArrayEditor({
  items,
  onChange,
  parentKey,
  mode
}: {
  items: ArrayItemNode[];
  onChange: (items: ArrayItemNode[]) => void;
  parentKey: string;
  mode?: "create" | "edit"
}) {
  const [arrayItemType, setArrayItemType] = useState<'text' | 'image' | 'object'>('text');
  const [elementCountInput, setElementCountInput] = useState<string>(String(items.length));

  const handleAddItem = () => {
    const newItem: ArrayItemNode = {
      id: generateId(),
      type: arrayItemType,
      valueText: arrayItemType === 'text' ? '' : undefined,
      valueImage: arrayItemType === 'image' ? '' : undefined,
      valueObject: arrayItemType === 'object' ? [] : undefined,
    };
    const updated = [...items, newItem];
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
        added.push({
          id: generateId(),
          type: arrayItemType,
          valueText: arrayItemType === 'text' ? '' : undefined,
          valueImage: arrayItemType === 'image' ? '' : undefined,
          valueObject: arrayItemType === 'object' ? [] : undefined,
        });
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
            onChange={(val) => setArrayItemType(val as 'text' | 'image' | 'object')}
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
          {items.map((item: any, idx: any) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-xl p-3.5 space-y-3 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    Index [{idx}]
                  </span>

                  <CustomSelect
                    value={item.type}
                    onChange={(newType) => {
                      onChange(
                        items.map((it) =>
                          it.id === item.id
                            ? {
                              ...it,
                              type: newType as 'text' | 'image' | 'object',
                              valueText: it.valueText || it.valueImage || '',
                              valueImage: it.valueImage || it.valueText || '',
                            }
                            : it
                        )
                      );
                    }}
                    options={ARRAY_ITEM_OPTIONS}
                    buttonClassName="!bg-slate-100 !text-slate-800 !border-slate-200 !py-0.5 !text-[10px]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onChange(items.filter((it) => it.id !== item.id))}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove Array Element"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {item.type === 'text' && (
                <RichTextEditor
                  value={item.valueText || item.valueImage || ''}
                  onChange={(val) =>
                    onChange(
                      items.map((it) => (it.id === item.id ? { ...it, valueText: val, valueImage: val } : it))
                    )
                  }
                  placeholder={`Array element [${idx}] text...`}
                />
              )}

              {item.type === 'image' && (
                <ImageProgressUploader
                  value={item.valueImage || item.valueText || ''}
                  onChange={(url) =>
                    onChange(
                      items.map((it) => (it.id === item.id ? { ...it, valueImage: url, valueText: url } : it))
                    )
                  }
                  placeholder="Upload image file or paste URL..."
                />
              )}

              {item.type === 'object' && (
                <NestedObjectEditor
                  nodes={item.valueObject || []}
                  onChange={(childNodes) =>
                    onChange(
                      items.map((it) => (it.id === item.id ? { ...it, valueObject: childNodes } : it))
                    )
                  }
                  parentKey={`${parentKey}[${idx}]`}
                  mode={mode}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
