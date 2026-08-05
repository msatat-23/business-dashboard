'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Contact, User } from '@/lib/types';
import { CustomSelect, SelectOption } from '@/components/ui/Select';
import { Mail, Phone, Briefcase, UserCheck, Calendar, ExternalLink, Trash2 } from 'lucide-react';

interface ContactDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  submittedUser: User | null;
  onUpdateStatus: (id: string, status: 'New' | 'In Progress' | 'Resolved') => void;
  onDelete: (id: string) => void;
}

export function ContactDetailModal({
  isOpen,
  onClose,
  contact,
  submittedUser,
  onUpdateStatus,
  onDelete,
}: ContactDetailModalProps) {
  if (!contact) return null;

  const modalStatusOptions: SelectOption<'New' | 'In Progress' | 'Resolved'>[] = [
    { value: 'New', label: 'New Inquiry', badge: 'NEW', badgeClass: 'bg-blue-100 text-blue-600', description: 'Fresh incoming contact request' },
    { value: 'In Progress', label: 'In Progress', badge: 'ACTIVE', badgeClass: 'bg-amber-100 text-amber-700', description: 'Under active follow up' },
    { value: 'Resolved', label: 'Resolved', badge: 'RESOLVED', badgeClass: 'bg-emerald-100 text-emerald-700', description: 'Inquiry completed' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise Contact Inquiry Details"
      subtitle={`Inquiry Ref ID: ${contact.id}`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-6">
        {/* Profile Card Header */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f43f5e] to-[#9333ea] flex items-center justify-center font-black text-white text-lg shadow-sm shrink-0">
              {contact.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-sans text-lg font-black text-slate-900">{contact.fullName}</h4>
              <div className="text-xs text-[#e11d48] font-semibold flex items-center gap-1.5 mt-0.5">
                <Briefcase size={13} />
                <span>{contact.jobTitle || 'Executive Enterprise Client'}</span>
              </div>
            </div>
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] text-slate-500 font-bold uppercase tracking-wider">Status:</span>
            <CustomSelect<'New' | 'In Progress' | 'Resolved'>
              value={contact.status || 'New'}
              onChange={(val) => onUpdateStatus(contact.id, val)}
              options={modalStatusOptions}
              size="sm"
              minWidth="min-w-[170px]"
            />
          </div>
        </div>

        {/* Contact Information Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={13} className="text-[#e11d48]" /> Corporate Email
            </span>
            <a
              href={`mailto:${contact.email}`}
              className="text-sm font-bold text-slate-900 hover:text-[#e11d48] transition-colors break-all flex items-center gap-1"
            >
              <span>{contact.email}</span>
              <ExternalLink size={12} className="shrink-0" />
            </a>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-600" /> Phone Line
            </span>
            <a
              href={`tel:${contact.phone}`}
              className="text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors"
            >
              {contact.phone || 'N/A'}
            </a>
          </div>
        </div>

        {/* Linked User Relation Info */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <div className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck size={14} className="text-[#9333ea]" />
            <span>Associated User Account (Prisma Relation: submittedByUser)</span>
          </div>

          {submittedUser ? (
            <div className="flex items-center justify-between text-xs bg-white p-3 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-900">{submittedUser.fullName}</div>
                <div className="text-slate-500 text-[0.72rem]">{submittedUser.email}</div>
              </div>
              <span className="bg-purple-50 border border-purple-200 text-[#9333ea] px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase">
                {submittedUser.role} Account
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-200">
              Submitted externally via public web inquiry form (No linked internal user ID).
            </div>
          )}
        </div>

        {/* Timestamp & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Calendar size={13} />
            <span>Submitted on {new Date(contact.createdAt).toLocaleString()}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onDelete(contact.id);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-[#e11d48] hover:bg-rose-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={13} />
              <span>Delete Record</span>
            </button>
            <a
              href={`mailto:${contact.email}?subject=RE: Enterprise Advisory Consultation`}
              className="bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <Mail size={14} />
              <span>Reply via Email</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}
