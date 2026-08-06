'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  Type,
  FolderPlus,
  ListPlus,
  Hash,
  ToggleLeft,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  Code2,
} from 'lucide-react';

export type FieldType = 'string' | 'image' | 'object' | 'array' | 'number' | 'boolean';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetObjectPath: string[]; // e.g. ['services', 'section'] or [] for root
  onAddProperty: (
    key: string,
    type: FieldType,
    initialValue: any,
    targetPath: string[]
  ) => void;
}

const COMMON_KEY_SUGGESTIONS = [
  'title',
  'subtitle',
  'description',
  'badge',
  'image',
  'logo',
  'icon',
  'url',
  'ctaText',
  'buttonText',
  'items',
  'features',
  'config',
  'settings',
  'isActive',
];

const PRESET_NESTED_TEMPLATES: Record<
  string,
  { label: string; description: string; keys: Array<{ key: string; type: FieldType; val: any }> }
> = {
  headerSection: {
    label: 'Standard Section Header',
    description: 'Badge, main title, highlighted subtitle, and description',
    keys: [
      { key: 'badge', type: 'string', val: 'EXPERT SOLUTIONS' },
      { key: 'title', type: 'string', val: 'Core Offerings & Capabilities' },
      { key: 'subtitle', type: 'string', val: 'Driven by Innovation' },
      { key: 'description', type: 'string', val: 'Strategic services built for enterprise growth.' },
    ],
  },
  ctaButton: {
    label: 'Call to Action Button',
    description: 'Button text, link URL, style variant, and openInNewTab flag',
    keys: [
      { key: 'text', type: 'string', val: 'Get Started Now' },
      { key: 'url', type: 'string', val: '/contact' },
      { key: 'variant', type: 'string', val: 'primary' },
      { key: 'openInNewTab', type: 'boolean', val: false },
    ],
  },
  cardMeta: {
    label: 'Item / Card Metadata',
    description: 'ID, title, icon, summary, and status badge',
    keys: [
      { key: 'id', type: 'string', val: '1' },
      { key: 'title', type: 'string', val: 'Strategic Expansion' },
      { key: 'icon', type: 'string', val: 'TrendingUp' },
      { key: 'badge', type: 'string', val: 'High Impact' },
      { key: 'summary', type: 'string', val: 'Data-driven growth execution.' },
    ],
  },
};

export function AddPropertyModal({
  isOpen,
  onClose,
  targetObjectPath,
  onAddProperty,
}: AddPropertyModalProps) {
  const [keyName, setKeyName] = useState('');
  const [fieldType, setFieldType] = useState<FieldType>('string');
  
  // Custom initial inputs based on type
  const [stringValue, setStringValue] = useState('');
  const [numberValue, setNumberValue] = useState<number>(0);
  const [booleanValue, setBooleanValue] = useState<boolean>(true);
  const [arrayElementType, setArrayElementType] = useState<'string' | 'object'>('string');
  
  // For nested object preview keys
  const [objectChildKeys, setObjectChildKeys] = useState<
    Array<{ id: string; key: string; type: FieldType; val: any }>
  >([
    { id: '1', key: 'title', type: 'string', val: 'Section Title' },
    { id: '2', key: 'description', type: 'string', val: 'Detailed section description...' },
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetPathLabel =
    targetObjectPath.length === 0 ? 'Root Page Object' : targetObjectPath.join(' > ');

  const handleApplyPresetTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const tmpl = PRESET_NESTED_TEMPLATES[templateKey];
    if (tmpl) {
      setFieldType('object');
      setObjectChildKeys(
        tmpl.keys.map((item, idx) => ({
          id: String(idx + 1),
          key: item.key,
          type: item.type,
          val: item.val,
        }))
      );
    }
  };

  const handleAddChildKeyRow = () => {
    setObjectChildKeys((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: '', type: 'string', val: '' },
    ]);
  };

  const handleRemoveChildKeyRow = (id: string) => {
    setObjectChildKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleChildKeyChange = (
    id: string,
    field: 'key' | 'type' | 'val',
    val: any
  ) => {
    setObjectChildKeys((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'type') {
          let defaultVal: any = '';
          if (val === 'number') defaultVal = 0;
          if (val === 'boolean') defaultVal = true;
          if (val === 'object') defaultVal = { title: '' };
          if (val === 'array') defaultVal = ['Item 1'];
          return { ...item, type: val as FieldType, val: defaultVal };
        }
        return { ...item, [field]: val };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyName.trim();
    if (!cleanKey) return;

    let finalValue: any = '';

    if (fieldType === 'string' || fieldType === 'image') {
      finalValue = stringValue;
    } else if (fieldType === 'number') {
      finalValue = Number(numberValue) || 0;
    } else if (fieldType === 'boolean') {
      finalValue = Boolean(booleanValue);
    } else if (fieldType === 'array') {
      if (arrayElementType === 'object') {
        finalValue = [
          {
            id: '1',
            title: 'Sample Item Title',
            description: 'Item description and details.',
          },
        ];
      } else {
        finalValue = ['Sample Item 1', 'Sample Item 2'];
      }
    } else if (fieldType === 'object') {
      const objVal: Record<string, any> = {};
      objectChildKeys.forEach((ck) => {
        if (ck.key.trim()) {
          objVal[ck.key.trim()] = ck.val;
        }
      });
      finalValue = Object.keys(objVal).length > 0 ? objVal : { title: '', description: '' };
    }

    onAddProperty(cleanKey, fieldType, finalValue, targetObjectPath);
    
    // Reset modal
    setKeyName('');
    setStringValue('');
    setFieldType('string');
    setSelectedTemplate(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Property Key to Object"
      subtitle={`Adding a new structured field inside: ${targetPathLabel}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Target Path Indicator */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-900 text-white rounded-xl text-xs font-mono">
          <span className="text-rose-400 font-bold shrink-0">Target Location:</span>
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar text-slate-300">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-rose-300 font-bold">Root</span>
            {targetObjectPath.map((segment, i) => (
              <React.Fragment key={i}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="bg-slate-800 px-2 py-0.5 rounded text-rose-200 font-bold">
                  {segment}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Property Key Name & Suggestions */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Property Key Name <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. heroSection, servicesList, mainTitle, ctaButton"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm font-mono font-bold border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
          />

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-500">Quick keys:</span>
            {COMMON_KEY_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setKeyName(sug)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded-md border transition-colors ${
                  keyName === sug
                    ? 'bg-rose-600 text-white border-rose-600 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                +{sug}
              </button>
            ))}
          </div>
        </div>

        {/* Select Property Type */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Select Field Data Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* String */}
            <button
              type="button"
              onClick={() => setFieldType('string')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                fieldType === 'string'
                  ? 'border-rose-600 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Text String</div>
                <div className="text-[10px] text-slate-500">Headings, descriptions</div>
              </div>
            </button>

            {/* Object */}
            <button
              type="button"
              onClick={() => setFieldType('object')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                fieldType === 'object'
                  ? 'border-amber-600 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                <FolderPlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Nested Object {'{}'}</div>
                <div className="text-[10px] text-slate-500">Keys inside key</div>
              </div>
            </button>

            {/* Array */}
            <button
              type="button"
              onClick={() => setFieldType('array')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                fieldType === 'array'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                <ListPlus className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Array List {'[]'}</div>
                <div className="text-[10px] text-slate-500">List of cards or values</div>
              </div>
            </button>

            {/* Image */}
            <button
              type="button"
              onClick={() => setFieldType('image')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                fieldType === 'image'
                  ? 'border-rose-600 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Media / Image</div>
                <div className="text-[10px] text-slate-500">Upload or URL</div>
              </div>
            </button>

            {/* Number */}
            <button
              type="button"
              onClick={() => setFieldType('number')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                fieldType === 'number'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                <Hash className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Number</div>
                <div className="text-[10px] text-slate-500">Prices, stats, counts</div>
              </div>
            </button>

            {/* Boolean */}
            <button
              type="button"
              onClick={() => setFieldType('boolean')}
              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                fieldType === 'boolean'
                  ? 'border-purple-600 bg-purple-50/70 text-purple-950 ring-2 ring-purple-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                <ToggleLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Boolean</div>
                <div className="text-[10px] text-slate-500">True/False flag</div>
              </div>
            </button>
          </div>
        </div>

        {/* Dynamic Type Configuration Panel */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              Configure Initial Value for &quot;{keyName || 'New Property'}&quot;
            </span>
            <span className="text-[10px] font-mono uppercase bg-slate-200 px-2 py-0.5 rounded text-slate-700">
              Type: {fieldType}
            </span>
          </div>

          {/* STRING / IMAGE CONFIG */}
          {(fieldType === 'string' || fieldType === 'image') && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600">Initial Value</label>
              <input
                type="text"
                placeholder={
                  fieldType === 'image'
                    ? 'https://images.unsplash.com/photo-...'
                    : 'Enter text value...'
                }
                value={stringValue}
                onChange={(e) => setStringValue(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* NUMBER CONFIG */}
          {fieldType === 'number' && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600">Initial Numeric Value</label>
              <input
                type="number"
                value={numberValue}
                onChange={(e) => setNumberValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>
          )}

          {/* BOOLEAN CONFIG */}
          {fieldType === 'boolean' && (
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-800">Default Flag Status:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBooleanValue(true)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    booleanValue
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  TRUE
                </button>
                <button
                  type="button"
                  onClick={() => setBooleanValue(false)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    !booleanValue
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  FALSE
                </button>
              </div>
            </div>
          )}

          {/* ARRAY CONFIG */}
          {fieldType === 'array' && (
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-600">
                Array List Element Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setArrayElementType('string')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-colors ${
                    arrayElementType === 'string'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  List of Text Strings [&quot;Item 1&quot;, &quot;Item 2&quot;]
                </button>
                <button
                  type="button"
                  onClick={() => setArrayElementType('object')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-colors ${
                    arrayElementType === 'object'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  List of Objects [{'[{ id: "1", title: "..." }]'}]
                </button>
              </div>
            </div>
          )}

          {/* NESTED OBJECT CONFIG (NO TEXT CONTAINERS!) */}
          {fieldType === 'object' && (
            <div className="space-y-3">
              {/* Optional Preset Templates */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Quick Object Presets (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(PRESET_NESTED_TEMPLATES).map(([key, tmpl]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleApplyPresetTemplate(key)}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                        selectedTemplate === key
                          ? 'border-amber-600 bg-amber-100 text-amber-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{tmpl.label}</span>
                        {selectedTemplate === key && <Check className="w-3.5 h-3.5 text-amber-700" />}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{tmpl.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Child Keys Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-600" />
                    Define Initial Child Keys inside this Object ({objectChildKeys.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddChildKeyRow}
                    className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add Child Key
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {objectChildKeys.map((ck) => (
                    <div
                      key={ck.id}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs"
                    >
                      <input
                        type="text"
                        placeholder="Child Key (e.g. title, badge)"
                        value={ck.key}
                        onChange={(e) => handleChildKeyChange(ck.id, 'key', e.target.value)}
                        className="w-1/3 px-2 py-1 text-xs font-mono font-bold border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <select
                        value={ck.type}
                        onChange={(e: any) => handleChildKeyChange(ck.id, 'type', e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded bg-slate-50 focus:outline-none"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="object">Nested Sub-Object</option>
                        <option value="array">Array</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Initial Value"
                        value={String(ck.val || '')}
                        onChange={(e) => handleChildKeyChange(ck.id, 'val', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveChildKeyRow(ck.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!keyName.trim()}
            className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Property Key
          </button>
        </div>
      </form>
    </Modal>
  );
}
