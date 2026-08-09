'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { User, UserRole } from '@/lib/types';
import { UserModal } from './UserModal';
import { CustomSelect, SelectOption } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useUsersQuery,
  mapUserApiToDashboard,
} from '@/hooks/use-auth-api';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  Edit2,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

interface UserManagementProps {
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export function UserManagement({ onShowToast }: UserManagementProps) {
  const { showToast: ctxToast } = useToast();
  const showToast = onShowToast || ctxToast;
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Build query params for API call
  const queryParams = useMemo(() => {
    const params: {
      search?: string;
      role?: string;
      status?: string;
      page: number;
      pageSize: number;
    } = {
      page: currentPage,
      pageSize: pageSize,
    };

    if (searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    if (roleFilter !== 'all') {
      params.role = roleFilter;
    }
    if (statusFilter !== 'all') {
      params.status = statusFilter === 'active' ? 'active' : 'inactive';
    }

    return params;
  }, [searchTerm, roleFilter, statusFilter, currentPage, pageSize]);

  const { data: apiResponse, isLoading, isError, error, refetch } = useUsersQuery(queryParams);
  // console.log(apiResponse)

  // Extract data array from paginated response

  const users = useMemo(
    () => (apiResponse?.items ?? []).map(mapUserApiToDashboard),
    [apiResponse],
  );


  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const updateUserRoleMutation = useUpdateUserRoleMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      showToast('User directory refreshed successfully.', 'success');
    } catch {
      showToast('Unable to refresh the user directory right now.', 'error');
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
  }, [searchTerm, roleFilter, statusFilter]);

  // Extract total from paginated response
  const totalItems = apiResponse?.meta.total ?? 0;

  const totalPages = apiResponse?.meta.pageCount ?? 0;

  const paginatedUsers = users;


  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.fullName}" (${user.email})?`)) {
      deleteUserMutation.mutate(user.id, {
        onSuccess: () => showToast('User deleted successfully.', 'success'),
        onError: (err) => showToast(err instanceof Error ? err.message : 'Delete failed.', 'error'),
      });
    }
  };

  const handleModalSubmit = (userData: {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
  }) => {
    if (selectedUser) {
      const updatePayload: {
        fullName: string;
        email: string;
        isActive: boolean;
        password?: string;
      } = {
        fullName: userData.fullName,
        email: userData.email,
        isActive: userData.isActive,
      };

      if (userData.password.trim()) {
        updatePayload.password = userData.password.trim();
      }

      updateUserMutation.mutate(
        {
          id: selectedUser.id,
          payload: updatePayload,
        },
        {
          onSuccess: () => {
            if (userData.role !== selectedUser.role) {
              updateUserRoleMutation.mutate(
                { id: selectedUser.id, role: userData.role },
                {
                  onSuccess: () => {
                    showToast('User updated successfully.', 'success');
                  },
                  onError: (err) => showToast(err instanceof Error ? err.message : 'Role update failed.', 'error'),
                },
              );
            } else {
              showToast('User updated successfully.', 'success');
            }
          },
          onError: (err) => showToast(err instanceof Error ? err.message : 'Update failed.', 'error'),
        },
      );

      return { success: true, message: 'User update started.' };
    }

    createUserMutation.mutate(
      {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        isActive: userData.isActive,
      },
      {
        onSuccess: () => showToast('User created successfully.', 'success'),
        onError: (err) => showToast(err instanceof Error ? err.message : 'Create failed.', 'error'),
      },
    );

    return { success: true, message: 'User creation started.' };
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-[#e11d48] border border-rose-200 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wide whitespace-nowrap">
            <Shield size={11} /> Admin
          </span>
        );
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-[#9333ea] border border-purple-200 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wide whitespace-nowrap">
            Editor
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wide whitespace-nowrap">
            User
          </span>
        );
    }
  };

  // Options for custom selects
  const roleOptions: SelectOption[] = [
    { value: 'all', label: 'All Roles', badge: 'ALL', badgeClass: 'bg-slate-100 text-slate-600' },
    { value: 'admin', label: 'Admin Only', badge: 'ADMIN', badgeClass: 'bg-rose-100 text-[#e11d48]' },
    { value: 'editor', label: 'Editor Only', badge: 'EDITOR', badgeClass: 'bg-purple-100 text-[#9333ea]' },
    { value: 'user', label: 'User Only', badge: 'USER', badgeClass: 'bg-blue-100 text-blue-600' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'All Statuses', badge: 'ALL', badgeClass: 'bg-slate-100 text-slate-600' },
    { value: 'active', label: 'Active Accounts', badge: 'ACTIVE', badgeClass: 'bg-emerald-100 text-emerald-600' },
    { value: 'inactive', label: 'Disabled Accounts', badge: 'DISABLED', badgeClass: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-[#e11d48]">
              <Users size={20} />
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              User Management
            </h1>
            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
              {users.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Provision platform users, assign security roles, and manage password access credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 min-h-[42px] rounded-xl font-sans text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-2xs disabled:opacity-60"
            title="Refresh User Directory"
          >
            <RefreshCw
              size={15}
              className={`text-slate-500 transition-transform ${isRefreshing ? 'animate-spin text-[#f43f5e]' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-[#f43f5e] via-[#e11d48] to-[#9333ea] text-white px-5 py-2.5 min-h-[42px] rounded-xl font-sans text-xs font-bold cursor-pointer shadow-[0_4px_15px_rgba(244,63,94,0.3)] hover:shadow-[0_6px_22px_rgba(244,63,94,0.45)] transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={16} />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      {/* Filters Bar with Custom Select Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-2xs">
        {/* Search Input */}
        <div className="sm:col-span-6 relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by full name or email address..."
            className="w-full font-sans text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-900 outline-none focus:bg-white focus:border-[#f43f5e] focus:ring-2 focus:ring-[#f43f5e]/20 placeholder:text-slate-400"
          />
        </div>

        {/* Custom Role Filter */}
        <div className="sm:col-span-3">
          <CustomSelect
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            options={roleOptions}
            icon={<Filter size={15} />}
          />
        </div>

        {/* Custom Status Filter */}
        <div className="sm:col-span-3">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={statusOptions}
          />
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-xs text-slate-500">
          Loading users from the backend...
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-xs text-[#e11d48]">
          {(error as Error)?.message || 'Unable to load users from the API.'}
        </div>
      )}

      {/* Users Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[0.72rem] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">User Account</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Password Credential</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    No users matching the filter criteria found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user: User) => {
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-purple-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 uppercase text-xs shrink-0">
                            {user.fullName.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm group-hover:text-[#e11d48] transition-colors">
                              {user.fullName}
                            </div>
                            <div className="text-[0.75rem] text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">{getRoleBadge(user.role)}</td>

                      {/* Password Security Indicator */}
                      <td className="py-4 px-4">
                        <div
                          className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"
                          title="Passwords are hashed and cannot be viewed. Use Edit to set a new one."
                        >
                          <Lock size={13} className="text-slate-400" />
                          <span className="font-mono text-xs text-slate-500">Hashed</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-[0.72rem]">
                            <CheckCircle2 size={13} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-400 font-bold text-[0.72rem]">
                            <XCircle size={13} /> Disabled
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-slate-500 text-[0.75rem] whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={user.id === currentUser?.id}
                            className={`p-2 rounded-lg border transition-colors ${user.id === currentUser?.id
                              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                              : 'bg-rose-50 border-rose-200 text-[#e11d48] hover:bg-rose-100 cursor-pointer'
                              }`}
                            title={
                              user.id === currentUser?.id
                                ? 'Cannot delete logged in account'
                                : 'Delete User'
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Requirement 1: User Modal with key to reset state cleanly on open */}
      <UserModal
        key={isModalOpen ? (selectedUser ? selectedUser.id : 'create-new-user') : 'closed-modal'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialUser={selectedUser}
      />
    </div>
  );
}