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

export interface UserApiRecord {
    id: string;
    fullName: string;
    email: string;
    password: string;
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
    status?: 'New' | 'In Progress' | 'Resolved';
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

export async function getUsersApi(): Promise<UserApiRecord[]> {
    return apiRequest<UserApiRecord[]>('/users');
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
    return apiRequest<PageApiRecord>('/pages', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function deletePageApi(id: number | string): Promise<void> {
    return apiRequest<void>(`/pages/${id}`, {
        method: 'DELETE',
    });
}

export async function getContactsApi(): Promise<ContactApiRecord[]> {
    return apiRequest<ContactApiRecord[]>('/contact');
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
    contactStatus: string): Promise<ContactApiRecord> {
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