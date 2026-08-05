'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createUserApi,
  deleteUserApi,
  getUsersApi,
  loginWithApi,
  updateUserApi,
  updateUserRoleApi,
  type AuthLoginResponse,
  type UserApiRecord,
} from '@/lib/api';

const USERS_QUERY_KEY = ['users'];

export function useLoginMutation() {
  return useMutation({
    mutationFn: loginWithApi,
  });
}

export function useUsersQuery() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: getUsersApi,
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<UserApiRecord> }) =>
      updateUserApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserApiRecord['role'] }) =>
      updateUserRoleApi(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
}

export function mapUserApiToDashboard(user: UserApiRecord) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    password: user.password.startsWith('$2') ? '••••••••••••' : user.password,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function useAuthSession() {
  return {
    saveSession: (response: AuthLoginResponse) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('business_dev_access_token', response.accessToken);
        localStorage.setItem('business_dev_session_email', response.user.email);
      }
    },
    clearSession: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('business_dev_access_token');
        localStorage.removeItem('business_dev_session_email');
      }
    },
  };
}
