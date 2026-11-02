'use client';

import { Search } from 'lucide-react';

interface ContentSearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function ContentSearchBar({
    value,
    onChange,
}: ContentSearchBarProps) {
    return (
        <div className="relative flex items-center max-w-md">
            <Search
                size={16}
                className="absolute left-3.5 text-slate-400 pointer-events-none"
            />

            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Filter content by slug name..."
                className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 outline-none focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 placeholder:text-slate-400 font-medium"
            />
        </div>
    );
}