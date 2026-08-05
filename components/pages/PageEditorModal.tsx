'use client';

import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Page } from '@/lib/types';
import {
  Plus,
  Trash2,
  Save,
  Globe,
  Upload,
  ChevronDown,
  ChevronRight,
  Code,
  Sliders,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Layers,
  Sparkles,
  Search,
  Filter,
  Copy,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  FolderTree,
  Type,
  Hash,
  ToggleLeft,
  ListPlus,
  Maximize2,
  Minimize2,
  Edit2,
} from 'lucide-react';
import { CloudinaryImageModal } from './CloudinaryImageModal';
import { AddPropertyModal, FieldType } from './AddPropertyModal';

interface PageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: Page | null;
  userRole: string;
  onSaveContent: (
    id: number,
    content: Record<string, any>,
    newSlug?: string
  ) => { success: boolean; message: string };
}

// Helper to test if string is an image URL
function isImageUrl(val: any): boolean {
  if (typeof val !== 'string') return false;
  const lower = val.toLowerCase();
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:image/') ||
    lower.includes('cloudinary') ||
    lower.includes('unsplash') ||
    /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?.*)?$/i.test(lower)
  );
}

// Preset sections library for 1-click CMS section additions
const CMS_PRESET_SECTIONS: Record<
  string,
  { name: string; icon: string; description: string; data: Record<string, any> }
> = {
  hero: {
    name: 'Hero Section',
    icon: 'Sparkles',
    description: 'Header badge, headline, subtitle, image, and CTA buttons',
    data: {
      badge: 'ENTERPRISE PLATFORM',
      title: 'Accelerate Enterprise Growth & Digital Dominance',
      titleHighlight: 'Strategic Business Development',
      description: 'End-to-end management portal engineered for high-growth firms and dynamic content control.',
      bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      primaryCta: {
        text: 'Explore Platform Capabilities',
        url: '/services',
      },
      secondaryCta: {
        text: 'Contact Executive Team',
        url: '/contact',
      },
    },
  },
  services: {
    name: 'Services Grid Section',
    icon: 'Layers',
    description: 'Structured section info and list of 4 core offerings',
    data: {
      section: {
        badge: 'EXPERT SOLUTIONS',
        title: 'Core Capabilities & Enterprise Services',
        description: 'Strategic advisory and digital transformation services tailored for scale.',
      },
      items: [
        {
          id: '1',
          title: 'Growth Strategy & Expansion',
          desc: 'Architecting data-backed enterprise expansion roadmaps.',
          icon: 'TrendingUp',
          badge: 'High Impact',
          features: ['Market Analysis', 'Go-To-Market Execution'],
        },
        {
          id: '2',
          title: 'Digital Transformation & Automation',
          desc: 'Modernizing legacy operational channels with automated digital workflows.',
          icon: 'Zap',
          badge: 'Automation',
          features: ['Workflow Optimization', 'ERP Integration'],
        },
        {
          id: '3',
          title: 'Market Intelligence & Analytics',
          desc: 'Rigorous competitive intelligence to eliminate guesswork.',
          icon: 'Target',
          badge: 'Data Analytics',
          features: ['Competitor Benchmarking', 'Demand Forecasting'],
        },
      ],
    },
  },
  features: {
    name: 'Features List Section',
    icon: 'Sliders',
    description: 'Feature badges, icons, and bullet point capabilities',
    data: {
      badge: 'KEY FEATURES',
      heading: 'Engineered for Performance and Security',
      featuresList: [
        { title: 'Real-Time Telemetry', desc: 'Instant live metrics and tracking.', icon: 'Activity' },
        { title: 'Multi-Role Permissions', desc: 'Granular access control for teams.', icon: 'Shield' },
        { title: 'Cloud Data Storage', desc: 'Encrypted persistent cloud state.', icon: 'Database' },
      ],
    },
  },
  testimonials: {
    name: 'Testimonials & Proof',
    icon: 'Check',
    description: 'Quotes, client avatars, roles, and company badges',
    data: {
      title: 'Trusted by Industry Leaders',
      reviews: [
        {
          id: '1',
          author: 'Sarah Jenkins',
          role: 'Chief Strategy Officer',
          company: 'Nexus Global',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          quote: 'The transformation platform delivered unmatched speed and market clarity.',
        },
      ],
    },
  },
  seo: {
    name: 'SEO & Social Metadata',
    icon: 'Globe',
    description: 'Meta titles, descriptions, and OpenGraph social banner',
    data: {
      metaTitle: 'Enterprise Business Developer | Platform',
      metaDescription: 'Official enterprise portal for user management and CMS operations.',
      ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
      keywords: ['Enterprise', 'CMS', 'Admin Dashboard', 'Business Development'],
    },
  },
};

export function PageEditorModal({
  isOpen,
  onClose,
  page,
  userRole,
  onSaveContent,
}: PageEditorModalProps) {
  const canEdit = userRole === 'admin' || userRole === 'editor';

  const [slug, setSlug] = useState('');
  const [editorMode, setEditorMode] = useState<'visual' | 'json'>('visual');
  const [contentObj, setContentObj] = useState<Record<string, any>>({});
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Search & Filter state for large trees
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'objects' | 'arrays' | 'images' | 'strings'>('all');

  // Cloudinary Modal state
  const [cloudinaryOpen, setCloudinaryOpen] = useState(false);
  const [activeImageFieldPath, setActiveImageFieldPath] = useState<string[] | null>(null);
  const [activeImageFieldValue, setActiveImageFieldValue] = useState('');

  // Structured Property Creator Modal State
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [targetObjectPathForNewProperty, setTargetObjectPathForNewProperty] = useState<string[]>([]);

  // Accordion Expand State
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  // Active breadcrumb focus
  const [focusedPath, setFocusedPath] = useState<string[]>([]);

  const [prevPageId, setPrevPageId] = useState<number | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState<boolean>(false);

  // Sync state when page prop updates
  if (page && (page.id !== prevPageId || (isOpen && !prevIsOpen))) {
    setPrevPageId(page.id);
    setPrevIsOpen(isOpen);
    setSlug(page.slug || '');
    const content = page.content || {};
    setContentObj(JSON.parse(JSON.stringify(content)));
    setJsonString(JSON.stringify(content, null, 2));
    setJsonError(null);

    const initialExpanded: Record<string, boolean> = {};
    Object.keys(content).forEach((key) => {
      initialExpanded[key] = true;
    });
    setExpandedPaths(initialExpanded);
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  if (!page) return null;

  const toggleExpand = (pathKey: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [pathKey]: !prev[pathKey],
    }));
  };

  const handleExpandAll = () => {
    const newExpanded: Record<string, boolean> = {};
    const traverse = (obj: any, path: string[]) => {
      const pathStr = path.join('.');
      if (pathStr) newExpanded[pathStr] = true;
      if (obj !== null && typeof obj === 'object') {
        Object.keys(obj).forEach((k) => traverse(obj[k], [...path, k]));
      }
    };
    traverse(contentObj, []);
    setExpandedPaths(newExpanded);
  };

  const handleCollapseAll = () => {
    setExpandedPaths({});
  };

  // Switch between Visual Form and Raw JSON
  const handleSwitchMode = (mode: 'visual' | 'json') => {
    if (mode === 'json') {
      setJsonString(JSON.stringify(contentObj, null, 2));
      setJsonError(null);
    } else {
      try {
        const parsed = JSON.parse(jsonString);
        setContentObj(parsed);
        setJsonError(null);
      } catch (err: any) {
        setJsonError(`JSON Syntax Error: ${err.message}`);
        return;
      }
    }
    setEditorMode(mode);
  };

  // Helper to set nested value deeply
  const setNestedValue = (path: string[], value: any) => {
    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (path.length === 0) return value;
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return copy;
    });
  };

  // Open Structured Property Modal for specific Object path
  const handleOpenAddPropertyForPath = (targetPath: string[]) => {
    setTargetObjectPathForNewProperty(targetPath);
    setAddPropertyModalOpen(true);
  };

  // Callback from AddPropertyModal to insert clean structured property
  const handlePropertyCreated = (
    keyName: string,
    fieldType: FieldType,
    initialVal: any,
    targetPath: string[]
  ) => {
    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (targetPath.length === 0) {
        copy[keyName] = initialVal;
        return copy;
      }
      let current = copy;
      for (let i = 0; i < targetPath.length; i++) {
        current = current[targetPath[i]];
      }
      if (typeof current === 'object' && current !== null && !Array.isArray(current)) {
        current[keyName] = initialVal;
      }
      return copy;
    });

    // Auto expand parent
    if (targetPath.length > 0) {
      setExpandedPaths((prev) => ({
        ...prev,
        [targetPath.join('.')]: true,
      }));
    }
  };

  // Preset section injector
  const handleInjectPresetSection = (presetKey: string) => {
    const preset = CMS_PRESET_SECTIONS[presetKey];
    if (!preset) return;

    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[presetKey] = JSON.parse(JSON.stringify(preset.data));
      return copy;
    });

    setExpandedPaths((prev) => ({
      ...prev,
      [presetKey]: true,
    }));
  };

  // Rename key
  const renameKeyAt = (path: string[], newKeyName: string) => {
    if (!newKeyName.trim() || path.length === 0) return;
    const cleanNewKey = newKeyName.trim();
    const oldKey = path[path.length - 1];
    if (cleanNewKey === oldKey) return;

    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (path.length === 1) {
        copy[cleanNewKey] = copy[oldKey];
        delete copy[oldKey];
        return copy;
      }
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      if (!Array.isArray(current) && typeof current === 'object') {
        current[cleanNewKey] = current[oldKey];
        delete current[oldKey];
      }
      return copy;
    });
  };

  // Change type
  const changeTypeAt = (
    path: string[],
    newType: 'string' | 'number' | 'boolean' | 'object' | 'array'
  ) => {
    let initVal: any = '';
    if (newType === 'number') initVal = 0;
    if (newType === 'boolean') initVal = true;
    if (newType === 'object') initVal = { title: '', description: '' };
    if (newType === 'array') initVal = ['Item 1'];

    setNestedValue(path, initVal);
  };

  // Duplicate node
  const duplicateNodeAt = (path: string[]) => {
    if (path.length === 0) return;
    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (path.length === 1) {
        const oldKey = path[0];
        const newKey = `${oldKey}_copy`;
        copy[newKey] = JSON.parse(JSON.stringify(copy[oldKey]));
        return copy;
      }
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      if (Array.isArray(current)) {
        const idx = Number(lastKey);
        const itemCopy = JSON.parse(JSON.stringify(current[idx]));
        current.splice(idx + 1, 0, itemCopy);
      } else if (typeof current === 'object') {
        const newKey = `${lastKey}_copy`;
        current[newKey] = JSON.parse(JSON.stringify(current[lastKey]));
      }
      return copy;
    });
  };

  // Delete node
  const deleteNestedValue = (path: string[]) => {
    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (path.length === 1) {
        delete copy[path[0]];
        return copy;
      }
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      if (Array.isArray(current)) {
        current.splice(Number(lastKey), 1);
      } else {
        delete current[lastKey];
      }
      return copy;
    });
  };

  // Array reorder move up/down
  const moveArrayItem = (arrayPath: string[], index: number, direction: 'up' | 'down') => {
    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let current = copy;
      for (let i = 0; i < arrayPath.length; i++) {
        current = current[arrayPath[i]];
      }
      if (Array.isArray(current)) {
        const targetIdx = direction === 'up' ? index - 1 : index + 1;
        if (targetIdx >= 0 && targetIdx < current.length) {
          const temp = current[index];
          current[index] = current[targetIdx];
          current[targetIdx] = temp;
        }
      }
      return copy;
    });
  };

  // Array item addition
  const addItemToArray = (path: string[], itemType: 'string' | 'object' | 'array' = 'string') => {
    setContentObj((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let current = copy;
      for (let i = 0; i < path.length; i++) {
        current = current[path[i]];
      }
      if (Array.isArray(current)) {
        if (itemType === 'object') {
          current.push({
            id: String(current.length + 1),
            title: 'New Service Item',
            description: 'Item description details.',
          });
        } else if (itemType === 'array') {
          current.push(['Sub Item 1']);
        } else {
          current.push('New Value Item');
        }
      }
      return copy;
    });
  };

  // Open Cloudinary
  const handleOpenCloudinary = (path: string[], currentVal: string) => {
    setActiveImageFieldPath(path);
    setActiveImageFieldValue(currentVal || '');
    setCloudinaryOpen(true);
  };

  const handleCloudinarySelected = (url: string) => {
    if (activeImageFieldPath) {
      setNestedValue(activeImageFieldPath, url);
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setJsonString(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(`Cannot format invalid JSON: ${err.message}`);
    }
  };

  const handleSave = () => {
    let finalContent = contentObj;
    if (editorMode === 'json') {
      try {
        finalContent = JSON.parse(jsonString);
      } catch (err: any) {
        setJsonError(`Cannot save invalid JSON: ${err.message}`);
        return;
      }
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!cleanSlug) {
      alert('Please specify a valid page slug.');
      return;
    }

    const res = onSaveContent(page.id, finalContent, cleanSlug);
    if (res.success) {
      onClose();
    }
  };

  // Filter keys according to search and type filters
  const filterKeyMatch = (keyName: string, val: any): boolean => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const keyMatches = keyName.toLowerCase().includes(q);
      const valMatches = typeof val === 'string' && val.toLowerCase().includes(q);
      if (!keyMatches && !valMatches && typeof val !== 'object') return false;
    }

    if (typeFilter === 'objects') return typeof val === 'object' && val !== null && !Array.isArray(val);
    if (typeFilter === 'arrays') return Array.isArray(val);
    if (typeFilter === 'images') return isImageUrl(val);
    if (typeFilter === 'strings') return typeof val === 'string';

    return true;
  };

  // Render Node in Visual Hierarchy Tree
  const renderValueNode = (val: any, path: string[], keyLabel?: string, depth = 0) => {
    const pathStr = path.join('.');
    const isExpanded = expandedPaths[pathStr] ?? true;
    const isRootKey = path.length === 1;

    // OBJECT NODE
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const keys = Object.keys(val);
      const passesFilter = filterKeyMatch(keyLabel || '', val);

      if (!passesFilter && searchQuery) return null;

      return (
        <div
          key={pathStr}
          className={`relative border rounded-2xl transition-all duration-200 bg-white shadow-2xs my-3 ${
            isRootKey ? 'border-slate-300/90 hover:border-slate-400 ring-1 ring-slate-100' : 'border-slate-200'
          }`}
          style={{ marginLeft: `${Math.min(depth * 10, 30)}px` }}
        >
          {/* Vertical Indent Guide Bar for Deep Depth */}
          {depth > 0 && (
            <div className="absolute top-0 bottom-0 -left-3.5 w-0.5 bg-gradient-to-b from-amber-400 to-rose-400 opacity-60 rounded-full" />
          )}

          {/* Header Bar for Object */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-slate-50 via-amber-50/20 to-white border-b border-slate-200/80 rounded-t-2xl cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
            onClick={() => toggleExpand(pathStr)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/60 transition-colors shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <div className="p-1.5 rounded-lg bg-amber-100/80 text-amber-800 shrink-0">
                <FolderPlus className="w-4 h-4" />
              </div>

              {/* Editable Key Label */}
              {canEdit && keyLabel && !keyLabel.startsWith('[') ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    defaultValue={keyLabel}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => renameKeyAt(path, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                    className="text-xs font-black text-slate-900 bg-white/90 border border-slate-300/80 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono shadow-2xs"
                    title="Click to rename object key"
                  />
                </div>
              ) : (
                <span className="text-xs font-black text-slate-900 tracking-tight font-mono">
                  {keyLabel || 'Root Object'}
                </span>
              )}

              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                {keys.length} keys
              </span>
            </div>

            {/* Actions for Object Node */}
            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* PRIMARY ACTION: Add Key to this Object (NO raw text containers!) */}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => handleOpenAddPropertyForPath(path)}
                  className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                  title={`Add a new key inside ${keyLabel || 'Object'}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Key</span>
                </button>
              )}

              {canEdit && path.length > 0 && (
                <button
                  type="button"
                  onClick={() => duplicateNodeAt(path)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                  title="Duplicate Object"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}

              {path.length > 0 && canEdit && (
                <button
                  type="button"
                  onClick={() => deleteNestedValue(path)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Object Section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Children List inside Object */}
          {isExpanded && (
            <div className="p-4 space-y-3 bg-slate-50/30 rounded-b-2xl">
              {keys.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300/80">
                  <p className="font-semibold text-slate-700">Empty Object Section</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click <strong className="text-rose-600">+ Add Key</strong> above to add properties visually without writing raw code.
                  </p>
                </div>
              ) : (
                keys.map((k) => renderValueNode(val[k], [...path, k], k, depth + 1))
              )}

              {/* Bottom Add Key Button */}
              {canEdit && keys.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenAddPropertyForPath(path)}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-600" />
                    <span>Add Another Key to {keyLabel || 'Object'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // ARRAY NODE
    if (Array.isArray(val)) {
      return (
        <div
          key={pathStr}
          className="relative border border-indigo-200 bg-white rounded-2xl shadow-2xs my-3 overflow-hidden"
          style={{ marginLeft: `${Math.min(depth * 10, 30)}px` }}
        >
          {depth > 0 && (
            <div className="absolute top-0 bottom-0 -left-3.5 w-0.5 bg-indigo-400 opacity-60 rounded-full" />
          )}

          <div
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-indigo-50/90 via-slate-50 to-white border-b border-indigo-100 cursor-pointer select-none hover:bg-indigo-100/50 transition-colors"
            onClick={() => toggleExpand(pathStr)}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                className="p-1 text-indigo-500 hover:text-indigo-800 rounded-md shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                <ListPlus className="w-4 h-4" />
              </div>

              {canEdit && keyLabel && !keyLabel.startsWith('[') ? (
                <input
                  type="text"
                  defaultValue={keyLabel}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => renameKeyAt(path, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                  className="text-xs font-black text-indigo-950 bg-white/90 border border-indigo-200 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-2xs"
                  title="Click to rename array key"
                />
              ) : (
                <span className="text-xs font-black text-indigo-950 tracking-tight font-mono">
                  {keyLabel || 'Array List'}
                </span>
              )}

              <span className="text-[10px] font-mono font-bold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded-full shrink-0">
                {val.length} items
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              {path.length > 0 && canEdit && (
                <button
                  type="button"
                  onClick={() => deleteNestedValue(path)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Array"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="p-4 space-y-3 bg-indigo-50/20">
              {val.length === 0 ? (
                <div className="p-4 text-center text-xs text-indigo-500 bg-white rounded-xl border border-dashed border-indigo-200">
                  Array is currently empty.
                </div>
              ) : (
                val.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col items-center gap-1 pt-3 shrink-0">
                        {canEdit && idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveArrayItem(path, idx, 'up')}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                        )}
                        {canEdit && idx < val.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveArrayItem(path, idx, 'down')}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="flex-1">
                        {renderValueNode(item, [...path, String(idx)], `Item [${idx + 1}]`, depth + 1)}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Add Items to Array Controls */}
              {canEdit && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-100">
                  <button
                    type="button"
                    onClick={() => addItemToArray(path, 'string')}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> + Add Text Item
                  </button>
                  <button
                    type="button"
                    onClick={() => addItemToArray(path, 'object')}
                    className="px-3 py-1.5 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Card Object Item
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // PRIMITIVE NODES (String, Number, Boolean, Image)
    const isImg = isImageUrl(val);
    const keyLower = (keyLabel || '').toLowerCase();
    const isImageKey =
      keyLower.includes('image') ||
      keyLower.includes('logo') ||
      keyLower.includes('banner') ||
      keyLower.includes('photo') ||
      keyLower.includes('avatar') ||
      keyLower.includes('icon') ||
      isImg;

    return (
      <div
        key={pathStr}
        className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs my-2"
        style={{ marginLeft: `${Math.min(depth * 10, 30)}px` }}
      >
        <div className="sm:w-1/3 shrink-0 flex items-center justify-between gap-2">
          {canEdit && keyLabel && !keyLabel.startsWith('[') ? (
            <input
              type="text"
              defaultValue={keyLabel}
              onBlur={(e) => renameKeyAt(path, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              className="text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono w-full"
              title="Click to rename key"
            />
          ) : (
            <label className="text-xs font-bold text-slate-700 font-mono truncate" title={keyLabel}>
              {keyLabel}
            </label>
          )}

          {/* Type Badge / Type Switcher */}
          {canEdit && path.length > 0 && (
            <select
              value={typeof val}
              onChange={(e: any) => changeTypeAt(path, e.target.value)}
              className="text-[10px] text-slate-500 bg-slate-100 hover:bg-slate-200 font-mono border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"
              title="Change field data type"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
              <option value="object">object {'{}'}</option>
              <option value="array">array {'[]'}</option>
            </select>
          )}
        </div>

        {/* Input Control */}
        <div className="flex-1 w-full space-y-1.5">
          {typeof val === 'boolean' ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!canEdit}
                onClick={() => setNestedValue(path, !val)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative cursor-pointer ${
                  val ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    val ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-xs font-bold text-slate-700">{val ? 'TRUE' : 'FALSE'}</span>
            </div>
          ) : typeof val === 'number' ? (
            <input
              type="number"
              value={val}
              disabled={!canEdit}
              onChange={(e) => setNestedValue(path, Number(e.target.value))}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          ) : (
            <div className="space-y-1.5">
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                {String(val).length > 60 ? (
                  <textarea
                    value={String(val)}
                    disabled={!canEdit}
                    onChange={(e) => setNestedValue(path, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none custom-scrollbar"
                  />
                ) : (
                  <input
                    type="text"
                    value={String(val)}
                    disabled={!canEdit}
                    onChange={(e) => setNestedValue(path, e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                )}

                {/* Cloudinary & Direct Upload Buttons for Image Keys */}
                {canEdit && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenCloudinary(path, String(val))}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                        isImageKey
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Manage image with Cloudinary or Stock Library"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Cloudinary</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Image Preview Thumbnail */}
              {isImg && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={String(val)}
                    alt="Preview"
                    className="w-9 h-9 object-cover rounded-md border border-slate-300 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="text-[10px] text-slate-500 truncate font-mono flex-1">{String(val)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => deleteNestedValue(path)}
            className="text-slate-300 hover:text-rose-600 p-1 self-center"
            title="Delete field"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`CMS Page Builder: /${page.slug}`}
        subtitle="Professional Headless CMS hierarchy editor with zero code-box hurdles."
        maxWidth="max-w-5xl"
      >
        <div className="space-y-4">
          {/* Header Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-2xl shadow-md">
            <div className="flex items-center gap-2.5">
              <Globe className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Page Route:</span>
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700 text-xs font-mono text-rose-300 font-bold">
                /
                <input
                  type="text"
                  value={slug}
                  disabled={!canEdit}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-white focus:outline-none w-36 font-mono text-xs font-bold"
                />
              </div>
            </div>

            {/* Visual Tree / Raw JSON mode switch */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => handleSwitchMode('visual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  editorMode === 'visual'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Visual Tree Builder
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode('json')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  editorMode === 'json'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-4 h-4" />
                Raw JSON Schema
              </button>
            </div>
          </div>

          {/* Search, Filter & Tree Expand Toolbar */}
          {editorMode === 'visual' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 bg-slate-100/80 border border-slate-200/90 rounded-xl text-xs">
              {/* Search input */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200/90 flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter page keys or text values..."
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                />
              </div>

              {/* Type Filter dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={typeFilter}
                  onChange={(e: any) => setTypeFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium outline-none"
                >
                  <option value="all">All Field Types</option>
                  <option value="objects">Objects {}</option>
                  <option value="arrays">Arrays []</option>
                  <option value="images">Images / Media</option>
                  <option value="strings">Text Strings</option>
                </select>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleExpandAll}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1"
                    title="Expand all tree branches"
                  >
                    <Maximize2 className="w-3 h-3" /> Expand
                  </button>
                  <button
                    type="button"
                    onClick={handleCollapseAll}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1"
                    title="Collapse all tree branches"
                  >
                    <Minimize2 className="w-3 h-3" /> Collapse
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Presets Bar */}
          {editorMode === 'visual' && canEdit && (
            <div className="p-3 bg-gradient-to-r from-rose-50/60 via-purple-50/40 to-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  1-Click CMS Section Presets:
                </span>
                <span className="text-[11px] text-slate-500">Inject structured pre-built sections</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(CMS_PRESET_SECTIONS).map(([key, sec]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleInjectPresetSection(key)}
                    className="px-3 py-1.5 text-xs font-bold bg-white text-slate-800 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    title={sec.description}
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-500" />
                    <span>+ {sec.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Visual Editor Container */}
          {editorMode === 'visual' ? (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 space-y-3">
              {Object.keys(contentObj).length === 0 ? (
                <div className="p-10 text-center text-slate-500 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50">
                  <Layers className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-800">No content sections created yet</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Inject a pre-built section above or create a structured property key below.
                  </p>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleOpenAddPropertyForPath([])}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Top Level Property Key
                    </button>
                  )}
                </div>
              ) : (
                Object.keys(contentObj).map((topKey) =>
                  renderValueNode(contentObj[topKey], [topKey], topKey, 0)
                )
              )}

              {/* Add Top Level Key Button */}
              {canEdit && Object.keys(contentObj).length > 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAddPropertyForPath([])}
                    className="w-full py-3 px-4 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100 border-2 border-dashed border-rose-300/80 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-rose-600" />
                    <span>+ Add Top-Level Section Key to Root Page</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Raw JSON Editor */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono font-bold">Raw JSON Editor</span>
                <button
                  type="button"
                  onClick={handleFormatJson}
                  className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold transition-colors"
                >
                  Format JSON
                </button>
              </div>

              {jsonError && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2 font-mono">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{jsonError}</span>
                </div>
              )}

              <textarea
                value={jsonString}
                disabled={!canEdit}
                onChange={(e) => {
                  setJsonString(e.target.value);
                  setJsonError(null);
                }}
                rows={16}
                className="w-full p-4 font-mono text-xs bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 custom-scrollbar leading-relaxed"
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Updated by: {page.updatedByEmail || 'System Admin'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Save CMS Configuration
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Structured Property Creator Modal */}
      <AddPropertyModal
        isOpen={addPropertyModalOpen}
        onClose={() => setAddPropertyModalOpen(false)}
        targetObjectPath={targetObjectPathForNewProperty}
        onAddProperty={handlePropertyCreated}
      />

      {/* Cloudinary Picker Modal */}
      <CloudinaryImageModal
        isOpen={cloudinaryOpen}
        onClose={() => setCloudinaryOpen(false)}
        onSelectUrl={handleCloudinarySelected}
        targetFieldKey={activeImageFieldPath?.join('.')}
        initialUrl={activeImageFieldValue}
      />
    </>
  );
}
