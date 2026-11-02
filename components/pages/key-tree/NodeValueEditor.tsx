'use client';

import React from 'react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { ImageProgressUploader } from '../ImageProgressUploader';

interface NodeValueEditorProps {
    type: 'plainText' | 'richText' | 'image';
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

// Single source of truth for "how do I edit a value of type X" — used by
// both a top-level/nested key row and an array item row.
export function NodeValueEditor({ type, value, onChange, placeholder }: NodeValueEditorProps) {
    if (type === 'richText') {
        return <RichTextEditor value={value} onChange={onChange} placeholder={placeholder} />;
    }

    if (type === 'image') {
        return (
            <ImageProgressUploader
                value={value}
                onChange={onChange}
                placeholder="Upload image file or paste URL..."
            />
        );
    }

    // Plain text — no formatting toolbar, just a straightforward field.
    const isLong = value.length > 80;

    if (isLong) {
        return (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#f43f5e] focus:ring-1 focus:ring-[#f43f5e]/20 transition-all resize-y"
            />
        );
    }

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#f43f5e] focus:ring-1 focus:ring-[#f43f5e]/20 transition-all"
        />
    );
}