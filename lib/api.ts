import type { ContactStatus, ContentData } from './types';

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
    user: {
        id: string;
        fullName: string;
        email: string;
        role: 'admin' | 'editor' | 'user';
    };
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



async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('business_dev_access_token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });
    console.log(response)

    if (!response.ok) {
        let payload: ApiError | undefined;
        try {
            payload = (await response.json()) as ApiError;
        } catch {
            payload = undefined;
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
