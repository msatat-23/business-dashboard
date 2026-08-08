export type UserRole = 'admin' | 'editor' | 'user';

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Page {
  id: number;
  slug: string;
  content: Record<string, unknown>;
  updatedByEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContactStatus = 'new' | 'inprogress' | 'resolved';

export interface Contact {
  id: string;
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

/** Types used only by the CMS editor UI. */
export type ContentFieldType =
  | 'text'
  | 'richtext'
  | 'image'
  | 'array';

export type ContentArrayItemType = 'text' | 'image';

export interface ContentArrayItem {
  type: ContentArrayItemType;
  value: string;
}

export interface ContentField {
  type: ContentFieldType;
  value: string;
  items: ContentArrayItem[];
}

/** Actual content shape sent to and received from the API. */
export type ContentValue = string | string[];

export type ContentData = Record<string, ContentValue>;

export interface Content {
  id: number;
  slug: string;
  content: ContentData;
  updatedByEmail: string | null;
  createdAt: string;
  updatedAt: string;
}
