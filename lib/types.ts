export type UserRole = 'admin' | 'editor' | 'user';

export interface User {
  id: string; // UUID
  fullName: string;
  email: string;
  password?: string; // never returned by the API; only used for local create/edit form state
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: number;
  slug: string;
  content: Record<string, any>; // Json content stored as nested object structure
  updatedByEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContactStatus = 'new' | 'inprogress' | 'resolved';

export interface Contact {
  id: string; // UUID
  fullName: string;
  phone: string;
  jobTitle: string;
  email: string;
  submittedByUserId: string | null;
  createdAt: string;
  status?: ContactStatus;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}