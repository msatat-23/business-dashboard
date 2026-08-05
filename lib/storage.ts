import { User, Page, Contact } from './types';
import { INITIAL_USERS, INITIAL_PAGES, INITIAL_CONTACTS } from './mock-data';

const USERS_KEY = 'business_dev_admin_users_v1';
const PAGES_KEY = 'business_dev_admin_pages_v1';
const CONTACTS_KEY = 'business_dev_admin_contacts_v1';

export function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return INITIAL_USERS;
  try {
    const item = localStorage.getItem(USERS_KEY);
    if (!item) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(item);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

export function getStoredPages(): Page[] {
  if (typeof window === 'undefined') return INITIAL_PAGES;
  try {
    const item = localStorage.getItem(PAGES_KEY);
    if (!item) {
      localStorage.setItem(PAGES_KEY, JSON.stringify(INITIAL_PAGES));
      return INITIAL_PAGES;
    }
    return JSON.parse(item);
  } catch {
    return INITIAL_PAGES;
  }
}

export function savePages(pages: Page[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PAGES_KEY, JSON.stringify(pages));
  } catch (err) {
    console.error('Failed to save pages:', err);
  }
}

export function getStoredContacts(): Contact[] {
  if (typeof window === 'undefined') return INITIAL_CONTACTS;
  try {
    const item = localStorage.getItem(CONTACTS_KEY);
    if (!item) {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(INITIAL_CONTACTS));
      return INITIAL_CONTACTS;
    }
    return JSON.parse(item);
  } catch {
    return INITIAL_CONTACTS;
  }
}

export function saveContacts(contacts: Contact[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Failed to save contacts:', err);
  }
}
