'use client';

import { Shield } from 'lucide-react';

interface ContentRoleBannerProps {
    role: string;
    canEdit: boolean;
}

export function ContentRoleBanner({
    role,
    canEdit,
}: ContentRoleBannerProps) {
    return (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
                <Shield size={18} className="text-[#9333ea]" />

                <div className="text-xs">
                    <span className="font-bold text-slate-900">
                        Current Session Role:{' '}
                    </span>

                    <span className="font-extrabold uppercase text-[#e11d48]">
                        {role}
                    </span>

                    <span className="text-slate-500 ml-2">
                        {canEdit
                            ? '• You have permission to create, edit, and publish content.'
                            : '• Standard user role is read-only for content.'}
                    </span>
                </div>
            </div>
        </div>
    );
}