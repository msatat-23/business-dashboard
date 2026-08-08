'use client';

import React from 'react';
import { Type, Pilcrow, Image as ImageIcon, FolderTree, ListFilter } from 'lucide-react';
import { SelectOption } from '@/components/ui/CustomSelect';
import { KeyType, ArrayItemType } from './types';

export const TYPE_OPTIONS: SelectOption<KeyType>[] = [
  { value: 'plainText', label: 'Plain Text', icon: <Type size={14} className="text-blue-400" /> },
  { value: 'richText', label: 'Rich Text', icon: <Pilcrow size={14} className="text-rose-400" /> },
  { value: 'image', label: 'Image', icon: <ImageIcon size={14} className="text-purple-400" /> },
  { value: 'object', label: 'Group', icon: <FolderTree size={14} className="text-amber-400" /> },
  { value: 'array', label: 'List', icon: <ListFilter size={14} className="text-emerald-400" /> },
];

export const ARRAY_ITEM_OPTIONS: SelectOption<ArrayItemType>[] = [
  { value: 'plainText', label: 'Plain Text', icon: <Type size={14} className="text-blue-400" /> },
  { value: 'richText', label: 'Rich Text', icon: <Pilcrow size={14} className="text-rose-400" /> },
  { value: 'image', label: 'Image', icon: <ImageIcon size={14} className="text-purple-400" /> },
  { value: 'object', label: 'Group', icon: <FolderTree size={14} className="text-amber-400" /> },
];