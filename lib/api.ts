import type { ContactStatus, ContentData } from './types';
import { 
  getAccessToken, 
  setAuthTokens, 
  clearAuthTokens, 
  getRefreshToken 
} from './auth-storage';

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api/v1';

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

export type ApiEnvelope<T> = {
    success: true;
    statusCode: number;
    data: T;
};

export type ApiError = {
    message?: string;
    error?: string;
    statusCode?: number;
};

export interface AuthLoginResponse {
    
    accessToken: string;
    refreshToken?: string;
    user: {
        id: string;
        fullName: string;
        email: string;
        role: 'admin' | 'editor' | 'user';
    };
}

export interface MeResponse {

data:{

        id: string;
        fullName: string;
        email: string;
        role: 'admin' | 'editor' | 'user';

}
}

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        total: number;
        page: number;
        pageCount: number;
        pageSize: number;
    };
}

export interface UserApiRecord {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'editor' | 'user';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ContactApiRecord {
    id: string;
    fullName: string;
    phone: string;
    jobTitle: string;
    email: string;
    submittedByUserId: string | null;
    createdAt: string;
    contactStatus?: ContactStatus;
}

export interface PageApiRecord {
    id: number;
    slug: string;
    content: Record<string, any>;
    updatedByEmail: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface PagesApi extends Array<PageApiRecord> { };

export interface AdminStatsApiRecord {
    users: number;
    pages: number;
    contacts: number;
}



// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const envelope = (await response.json()) as ApiEnvelope<{ accessToken: string; refreshToken?: string }>;
        const { accessToken, refreshToken: newRefreshToken } = envelope.data;

        setAuthTokens({
            accessToken,
            refreshToken: newRefreshToken,
            email: localStorage.getItem('business_dev_session_email') || '',
        });

        return accessToken;
    } catch (error) {
        // Clear all auth data if refresh fails
        clearAuthTokens();
        return null;
    }
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (typeof window !== 'undefined') {
        const token = getAccessToken();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        let payload: ApiError | undefined;
        try {
            payload = (await response.json()) as ApiError;
        } catch {
            payload = undefined;
        }

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && typeof window !== 'undefined' && path !== '/auth/refresh') {
            // Try to refresh the token
            if (!isRefreshing) {
                isRefreshing = true;
                
                const newToken = await refreshAccessToken();
                isRefreshing = false;

                if (newToken) {
                    onTokenRefreshed(newToken);
                    
                    // Retry the original request with new token
                    headers.set('Authorization', `Bearer ${newToken}`);
                    const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
                        ...options,
                        headers,
                    });

                    if (retryResponse.ok) {
                        if (retryResponse.status === 204) {
                            return undefined as T;
                        }
                        const envelope = (await retryResponse.json()) as ApiEnvelope<T>;
                        return envelope.data;
                    }
                }
            } else {
                // Wait for the token to be refreshed
                return new Promise((resolve, reject) => {
                    subscribeTokenRefresh(async (token: string) => {
                        try {
                            headers.set('Authorization', `Bearer ${token}`);
                            const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
                                ...options,
                                headers,
                            });

                            if (retryResponse.ok) {
                                if (retryResponse.status === 204) {
                                    resolve(undefined as T);
                                    return;
                                }
                                const envelope = (await retryResponse.json()) as ApiEnvelope<T>;
                                resolve(envelope.data);
                            } else {
                                reject(new Error('Request failed after token refresh'));
                            }
                        } catch (error) {
                            reject(error);
                        }
                    });
                });
            }

            // If we get here, refresh failed - redirect to login
            const currentPath = window.location.pathname;
            if (currentPath !== '/login') {
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
            }
        }

        const message = payload?.message || payload?.error || 'Request failed.';
        throw new Error(message);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const envelope = (await response.json()) as ApiEnvelope<T>;
    return envelope.data;
}

export async function loginWithApi(payload: {
    email: string;
    password: string;
}): Promise<AuthLoginResponse> {
    return apiRequest<AuthLoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function getCurrentUserApi(): Promise<MeResponse> {
    return apiRequest<MeResponse>('/auth/me');
}

export async function getUsersApi(params?: {
    status?: string;
    role?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}): Promise<PaginatedResponse<UserApiRecord>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set('status', params.status);
    if (params?.role) queryParams.set('role', params.role);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));

    const queryString = queryParams.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    return apiRequest<PaginatedResponse<UserApiRecord>>(url);
}

export async function createUserApi(payload: {
    fullName: string;
    email: string;
    password: string;
    role?: 'admin' | 'editor' | 'user';
    isActive?: boolean;
}): Promise<UserApiRecord> {
    return apiRequest<UserApiRecord>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateUserApi(
    id: string,
    payload: Partial<{
        fullName: string;
        email: string;
        password: string;
        isActive: boolean;
    }>,
): Promise<UserApiRecord> {
    return apiRequest<UserApiRecord>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function updateUserRoleApi(
    id: string,
    role: 'admin' | 'editor' | 'user',
): Promise<UserApiRecord> {
    return apiRequest<UserApiRecord>(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
    });
}

export async function deleteUserApi(id: string): Promise<void> {
    return apiRequest<void>(`/users/${id}`, {
        method: 'DELETE',
    });
}

export async function getPages(): Promise<PagesApi> {
    return apiRequest<PagesApi>(`/pages`);
}

export async function getPublicPageBySlug(slug: string): Promise<PageApiRecord> {
    return apiRequest<PageApiRecord>(`/pages/${slug}`);
}

export async function updatePageBySlug(
    slug: string,
    payload: { content: Record<string, any> },
): Promise<PageApiRecord> {
    return apiRequest<PageApiRecord>(`/pages/${slug}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function createPageApi(payload: {
    slug: string;
    content: Record<string, any>;
}): Promise<PageApiRecord> {
    return apiRequest<PageApiRecord>(`/pages/${payload.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: payload.content }),
    });
}

export async function deletePageApi(id: number | string): Promise<void> {
    return apiRequest<void>(`/pages/${id}`, {
        method: 'DELETE',
    });
}

export async function getContactsApi(params?: {
    contactStatus?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}): Promise<PaginatedResponse<ContactApiRecord>> {
    const queryParams = new URLSearchParams();
    if (params?.contactStatus) queryParams.set('contactStatus', params.contactStatus);
    if (params?.search) queryParams.set('search', params.search);
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));

    const queryString = queryParams.toString();
    const url = queryString ? `/contact?${queryString}` : '/contact';
    return apiRequest<PaginatedResponse<ContactApiRecord>>(url);
}

export async function createContactApi(payload: {
    fullName: string;
    email: string;
    phone?: string;
    jobTitle?: string;
    submittedByUserId?: string | null;
}): Promise<ContactApiRecord> {
    return apiRequest<ContactApiRecord>('/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateContactStatusApi(id: string,
    contactStatus: ContactStatus): Promise<ContactApiRecord> {
    return apiRequest<ContactApiRecord>(`/contact/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ contactStatus })
    });
}

export async function deleteContactApi(id: string): Promise<void> {
    return apiRequest<void>(`/contact/${id}`, {
        method: 'DELETE',
    });
}

export async function getAdminStatsApi(): Promise<AdminStatsApiRecord> {
    return apiRequest<AdminStatsApiRecord>('/admin/stats');
}

export interface ContentApiRecord {
    id: number;
    slug: string;
    content: ContentData;
    updatedByEmail: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ContentsApi extends Array<ContentApiRecord> { }

export async function getContents(): Promise<ContentsApi> {
    return apiRequest<ContentsApi>('/contents');
}

export async function getPublicContentBySlug(
    slug: string,
): Promise<ContentApiRecord> {
    return apiRequest<ContentApiRecord>(`/contents/${slug}`);
}

export async function updateContentBySlug(
    slug: string,
    payload: {
        content: ContentData;
    },
): Promise<ContentApiRecord> {
    return apiRequest<ContentApiRecord>(`/contents/${slug}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
}

export async function createContentApi(payload: {
    slug: string;
    content: ContentData;
}): Promise<ContentApiRecord> {
    return apiRequest<ContentApiRecord>(`/contents/${payload.slug}`, {
        method: 'PATCH',
        body: JSON.stringify({
            content: payload.content,
        }),
    });
}

export async function deleteContentApi(
    id: number | string,
): Promise<void> {
    return apiRequest<void>(`/contents/${id}`, {
        method: 'DELETE',
    });
}
