'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Contact, ContactStatus } from '@/lib/types';
import { ContactDetailModal } from './ContactDetailModal';
import { CustomSelect, SelectOption } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { useContactsQuery, mapContactApiToDashboard, useUpdateContactStatusQuery, useDeleteContactMutation } from '@/hooks/use-contacts-api';
import {
  Contact as ContactIcon,
  Search,
  Filter,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface ContactManagementProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function ContactManagement({ onShowToast }: ContactManagementProps) {
  const { showToast: ctxToast } = useToast();
  const showToast = onShowToast || ctxToast;
  const { users, updateContactStatus } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Build query params for API call
  const queryParams = useMemo(() => {
    const params: {
      search?: string;
      contactStatus?: string;
      page: number;
      pageSize: number;
    } = {
      page: currentPage,
      pageSize: pageSize,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (statusFilter !== 'all') {
      params.contactStatus = statusFilter;
    }

    return params;
  }, [searchTerm, statusFilter, currentPage, pageSize]);

  const { data: apiResponse, isLoading, isError, error, refetch } = useContactsQuery(queryParams);


  const contacts = useMemo(() =>
    (apiResponse?.items ?? []).map(mapContactApiToDashboard), [apiResponse]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      showToast('Contact inquiries list refreshed successfully.', 'success');
    } catch {
      showToast('Unable to refresh contact inquiries right now.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    const initiatePage = () => {
      setCurrentPage(1);
    };
    initiatePage();
  }, [searchTerm, statusFilter]);

  const contactFilterOptions: SelectOption[] = [
    { value: 'all', label: 'All Inquiry Statuses', badge: 'ALL', badgeClass: 'bg-slate-100 text-slate-600' },
    { value: 'new', label: 'New Inquiries Only', badge: 'NEW', badgeClass: 'bg-blue-100 text-blue-600' },
    { value: 'inprogress', label: 'In Progress', badge: 'ACTIVE', badgeClass: 'bg-amber-100 text-amber-700' },
    { value: 'resolved', label: 'Resolved Inquiries', badge: 'RESOLVED', badgeClass: 'bg-emerald-100 text-emerald-700' },
  ];

  const quickStatusOptions: SelectOption<ContactStatus>[] = [
    { value: 'new', label: 'New', badge: 'NEW', badgeClass: 'bg-blue-100 text-blue-600' },
    { value: 'inprogress', label: 'In Progress', badge: 'ACTIVE', badgeClass: 'bg-amber-100 text-amber-700' },
    { value: 'resolved', label: 'Resolved', badge: 'RESOLVED', badgeClass: 'bg-emerald-100 text-emerald-700' },
  ];

  // Extract total from paginated response
  const totalItems = apiResponse?.meta.total ?? 0;

  const totalPages = apiResponse?.meta.pageCount ?? 0;

  const paginatedContacts = contacts;

  const updateStatusMutation = useUpdateContactStatusQuery();
  const deleteContactMutation = useDeleteContactMutation();

  const handleOpenDetail = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (id: string, newStatus: ContactStatus) => {
    updateStatusMutation.mutate(
      { id, contactStatus: newStatus },
      {
        onSuccess: () => {
          showToast(`Status updated to ${newStatus}`, 'success');
          if (selectedContact && selectedContact.id === id) {
            setSelectedContact((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
        },
        onError: () => {
          const res = updateContactStatus(id, newStatus);
          if (res.success) {
            showToast(res.message, 'success');
            if (selectedContact && selectedContact.id === id) {
              setSelectedContact((prev) => (prev ? { ...prev, status: newStatus } : null));
            }
          } else {
            showToast('Failed to update status', 'error');
          }
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this contact inquiry record?')) {
      deleteContactMutation.mutate(id, {
        onSuccess: () => {
          showToast('Contact inquiry record deleted successfully.', 'success');
          if (selectedContact && selectedContact.id === id) {
            setIsDetailOpen(false);
            setSelectedContact(null);
          }
        },
        onError: (err) => {
          showToast(
            err instanceof Error ? err.message : 'Failed to delete contact inquiry',
            'error'
          );
        },
      });
    }
  };

  // Requirement 9: Fix status breaking word text with whitespace-nowrap and non-breaking badges
  const getStatusBadge = (status?: ContactStatus) => {
    const currentStatus = status || 'new';
    switch (currentStatus) {
      case 'new':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-600 px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
            <span>New Inquiry</span>
          </span>
        );
      case 'inprogress':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>In Progress</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full text-[0.72rem] font-bold uppercase tracking-wider">
            <CheckCircle2 size={12} className="shrink-0" />
            <span>Resolved</span>
          </span>
        );
    }
  };

  // Find linked user for selected contact
  const linkedUser = useMemo(() => {
    if (!selectedContact || !selectedContact.submittedByUserId) return null;
    return users.find((u) => u.id === selectedContact.submittedByUserId) || null;
  }, [selectedContact, users]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
              <ContactIcon size={20} />
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Contact Inquiries
            </h1>
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {contacts.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise client lead contacts, advisory consultation requests, and phone contact details.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 min-h-[42px] rounded-xl font-sans text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-2xs shrink-0 disabled:opacity-60"
          title="Refresh Contact Inquiries"
        >
          <RefreshCw
            size={15}
            className={`text-slate-500 transition-transform ${isRefreshing ? 'animate-spin text-[#f43f5e]' : ''}`}
          />
          <span>Refresh Inquiries</span>
        </button>
      </div>

      {/* Requirement 10: Styled Select Controls & Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-2xs">
        {/* Search */}
        <div className="sm:col-span-8 relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by full name, email, job title, or phone number..."
            className="w-full font-sans text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 outline-none focus:bg-white focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 placeholder:text-slate-400"
          />
        </div>

        {/* Custom Status Select Filter */}
        <div className="sm:col-span-4">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={contactFilterOptions}
            icon={<Filter size={15} />}
          />
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-xs text-slate-500">
          Loading contact inquiries from the backend...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-xs text-[#e11d48]">
          {(error as Error)?.message || 'Unable to load contacts from the API.'}
        </div>
      )}

      {/* Requirement 8: Responsive Cards for Tablets and Mobile Screens (Visible on screens < lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {paginatedContacts.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200/90 rounded-2xl text-slate-400 text-xs font-sans">
            No contact inquiries matching search filters found.
          </div>
        ) : (
          paginatedContacts.map((contact: Contact) => (
            <div
              key={contact.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-sm transition-all"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-purple-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs uppercase shrink-0">
                      {contact.fullName.substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-sans font-bold text-slate-900 text-sm">
                        {contact.fullName}
                      </h3>
                      <div className="text-[0.72rem] text-[#e11d48] font-semibold flex items-center gap-1">
                        <Briefcase size={12} />
                        <span>{contact.jobTitle || 'Enterprise Client'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">{getStatusBadge(contact.status)}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <Mail size={13} className="text-[#e11d48] shrink-0" />
                    <a href={`mailto:${contact.email}`} className="hover:underline truncate font-medium">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={13} className="text-emerald-600 shrink-0" />
                    <span className="font-mono font-bold">{contact.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[0.7rem] text-slate-400">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {/* Custom Status Quick Select */}
                  <CustomSelect<ContactStatus>
                    value={contact.status || 'new'}
                    onChange={(val) => handleStatusChange(contact.id, val)}
                    options={quickStatusOptions}
                    size="sm"
                    minWidth="min-w-[120px]"
                  />

                  <button
                    onClick={() => handleOpenDetail(contact)}
                    className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-[#e11d48] hover:bg-rose-100 cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (Visible on lg screens and up) */}
      <div className="hidden lg:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[0.72rem] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Client Name & Title</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Phone Contact</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No contact inquiries matching search filters found.
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact: Contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Name & Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-rose-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-xs uppercase shrink-0">
                          {contact.fullName.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-[#e11d48] transition-colors">
                            {contact.fullName}
                          </div>
                          <div className="text-[0.72rem] text-slate-500 font-medium">
                            {contact.jobTitle || 'Executive Lead'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4 text-slate-700">
                      <a
                        href={`mailto:${contact.email}`}
                        className="hover:text-[#e11d48] hover:underline flex items-center gap-1 font-mono text-[0.78rem]"
                      >
                        <span>{contact.email}</span>
                        <ExternalLink size={11} className="text-slate-400" />
                      </a>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 font-mono text-slate-700 font-bold whitespace-nowrap">
                      {contact.phone || 'N/A'}
                    </td>

                    {/* Requirement 9: Non-breaking Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(contact.status)}
                        {/* Custom status dropdown */}
                        <CustomSelect<ContactStatus>
                          value={contact.status || 'new'}
                          onChange={(val) => handleStatusChange(contact.id, val)}
                          options={quickStatusOptions}
                          size="sm"
                          minWidth="min-w-[125px]"
                        />
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-4 px-4 text-slate-500 text-[0.75rem] whitespace-nowrap">
                      {new Date(contact.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(contact)}
                          className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                          title="View Inquiry Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[#e11d48] hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Delete Contact Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Contact Detail View Modal */}
      <ContactDetailModal
        key={selectedContact ? selectedContact.id : 'detail-closed'}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        contact={selectedContact}
        submittedUser={linkedUser}
        onUpdateStatus={handleStatusChange}
        onDelete={handleDelete}
      />
    </div>
  );
}