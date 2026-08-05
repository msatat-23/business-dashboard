'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Page, Contact, UserRole } from '@/lib/types';
import { INITIAL_USERS, INITIAL_PAGES, INITIAL_CONTACTS } from '@/lib/mock-data';
import {
  getStoredUsers,
  saveUsers,
  getStoredPages,
  savePages,
  getStoredContacts,
  saveContacts,
} from '@/lib/storage';
import { loginWithApi } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  pages: Page[];
  contacts: Contact[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  createUser: (newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; message: string };
  updateUser: (id: string, updatedFields: Partial<User>) => { success: boolean; message: string };
  deleteUser: (id: string) => { success: boolean; message: string };
  createPage: (slug: string, initialContent?: Record<string, any>) => { success: boolean; message: string; page?: Page };
  updatePage: (id: number, content: Record<string, any>, newSlug?: string) => { success: boolean; message: string };
  deletePage: (id: number) => { success: boolean; message: string };
  createContact: (newContact: Omit<Contact, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string };
  updateContactStatus: (id: string, status: 'New' | 'In Progress' | 'Resolved') => { success: boolean; message: string };
  deleteContact: (id: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [pages, setPages] = useState<Page[]>(INITIAL_PAGES);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]);
  const isInitialized = useRef(false);

  // Sync with localStorage on client mount to prevent hydration mismatch
  useEffect(() => {
    const loadedUsers = getStoredUsers();
    const loadedPages = getStoredPages();
    const loadedContacts = getStoredContacts();


    const initiatValsFromStorage = () => {
      setUsers(loadedUsers);
      setPages(loadedPages);
      setContacts(loadedContacts);
    };

    initiatValsFromStorage();

    const initiatCurrentUser = (val: User | null) => {
      setCurrentUser(val);
    };

    const savedUserEmail = localStorage.getItem('business_dev_session_email');
    if (savedUserEmail) {
      const found = loadedUsers.find((u) => u.email === savedUserEmail);
      if (found && found.isActive) {
        initiatCurrentUser(found);
      } else if (loadedUsers.length > 0) {
        initiatCurrentUser(loadedUsers[0]);
      }
    } else if (loadedUsers.length > 0) {
      initiatCurrentUser(loadedUsers[0]);
    }

    isInitialized.current = true;
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const response = await loginWithApi({ email, password: password || '' });
      const loggedUser: User = {
        id: response.user.id,
        fullName: response.user.fullName,
        email: response.user.email,
        password: password || '',
        role: response.user.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCurrentUser(loggedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('business_dev_session_email', loggedUser.email);
        localStorage.setItem('business_dev_access_token', response.accessToken);
      }

      return { success: true, message: `Welcome back, ${loggedUser.fullName}!` };
    } catch (error) {
      // Fallback to local stored/initial users if API server is not available
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        if (!found.isActive) {
          return { success: false, message: 'Account is deactivated. Contact an administrator.' };
        }
        if (password && found.password !== password && !found.password.startsWith('$2')) {
          return { success: false, message: 'Invalid password.' };
        }
        setCurrentUser(found);
        if (typeof window !== 'undefined') {
          localStorage.setItem('business_dev_session_email', found.email);
          localStorage.setItem('business_dev_access_token', 'mock_token_' + found.id);
        }
        return { success: true, message: `Welcome back, ${found.fullName}!` };
      }
      const message = error instanceof Error ? error.message : 'Login failed.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('business_dev_session_email');
      localStorage.removeItem('business_dev_access_token');
    }
  };

  const switchRole = (role: UserRole) => {
    let targetUser = users.find((u) => u.role === role && u.isActive);
    if (!targetUser) {
      // Create quick temporary persona if none exists
      targetUser = {
        id: crypto.randomUUID(),
        fullName: `${role.toUpperCase()} Persona`,
        email: `${role}@business-dev.com`,
        password: `${role}Pass123!`,
        role: role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updatedUsers = [targetUser, ...users];
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    }
    setCurrentUser(targetUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('business_dev_session_email', targetUser.email);
    }
  };

  const createUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, message: 'Permission denied: Only Admin can create users.' };
    }
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, message: 'A user with this email address already exists.' };
    }

    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextUsers = [newUser, ...users];
    setUsers(nextUsers);
    saveUsers(nextUsers);
    return { success: true, message: `User ${newUser.fullName} successfully created!` };
  };

  const updateUser = (id: string, updatedFields: Partial<User>) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, message: 'Permission denied: Only Admin can update users.' };
    }

    const nextUsers = users.map((u) => {
      if (u.id === id) {
        return {
          ...u,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
      return u;
    });

    setUsers(nextUsers);
    saveUsers(nextUsers);

    // If updating currently logged in user
    if (currentUser?.id === id) {
      const updatedCurrent = nextUsers.find((u) => u.id === id) || null;
      setCurrentUser(updatedCurrent);
    }

    return { success: true, message: 'User updated successfully.' };
  };

  const deleteUser = (id: string) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, message: 'Permission denied: Only Admin can delete users.' };
    }
    if (currentUser?.id === id) {
      return { success: false, message: 'Cannot delete your own active session account.' };
    }

    const nextUsers = users.filter((u) => u.id !== id);
    setUsers(nextUsers);
    saveUsers(nextUsers);
    return { success: true, message: 'User deleted successfully.' };
  };

  const createPage = (slug: string, initialContent?: Record<string, any>) => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'editor') {
      return { success: false, message: 'Permission denied: Only Admin or Editor can create pages.' };
    }

    const formattedSlug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!formattedSlug) {
      return { success: false, message: 'Invalid slug specified.' };
    }

    if (pages.some((p) => p.slug === formattedSlug)) {
      return { success: false, message: 'A page with this slug already exists.' };
    }

    const newPage: Page = {
      id: pages.length ? Math.max(...pages.map((p) => p.id)) + 1 : 1,
      slug: formattedSlug,
      content: initialContent || {
        title: `${slug.toUpperCase()} Page Title`,
        metaDescription: 'Enterprise platform documentation and details.',
      },
      updatedByEmail: currentUser.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextPages = [newPage, ...pages];
    setPages(nextPages);
    savePages(nextPages);
    return { success: true, message: `Page /${formattedSlug} created successfully!`, page: newPage };
  };

  const updatePage = (id: number, content: Record<string, any>, newSlug?: string) => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'editor') {
      return { success: false, message: 'Permission denied: Only Admin or Editor can update pages.' };
    }

    let formattedSlug: string | undefined = undefined;
    if (newSlug !== undefined) {
      formattedSlug = newSlug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!formattedSlug) {
        return { success: false, message: 'Invalid page slug specified.' };
      }
      const existing = pages.find((p) => p.slug === formattedSlug && p.id !== id);
      if (existing) {
        return { success: false, message: `A page with slug "/${formattedSlug}" already exists.` };
      }
    }

    const nextPages = pages.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          slug: formattedSlug ?? p.slug,
          content,
          updatedByEmail: currentUser?.email || 'admin@business-dev.com',
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    setPages(nextPages);
    savePages(nextPages);
    return { success: true, message: 'Page configuration updated successfully.' };
  };

  const deletePage = (id: number) => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'editor') {
      return { success: false, message: 'Permission denied: Only Admin or Editor can delete pages.' };
    }

    const nextPages = pages.filter((p) => p.id !== id);
    setPages(nextPages);
    savePages(nextPages);
    return { success: true, message: 'Page removed successfully.' };
  };

  const createContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'status'>) => {
    const newContact: Contact = {
      ...contactData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'New',
    };

    const nextContacts = [newContact, ...contacts];
    setContacts(nextContacts);
    saveContacts(nextContacts);
    return { success: true, message: 'Contact entry logged successfully!' };
  };

  const updateContactStatus = (id: string, status: 'New' | 'In Progress' | 'Resolved') => {
    const nextContacts = contacts.map((c) => (c.id === id ? { ...c, status } : c));
    setContacts(nextContacts);
    saveContacts(nextContacts);
    return { success: true, message: `Status updated to ${status}` };
  };

  const deleteContact = (id: string) => {
    const nextContacts = contacts.filter((c) => c.id !== id);
    setContacts(nextContacts);
    saveContacts(nextContacts);
    return { success: true, message: 'Contact inquiry deleted successfully' };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        pages,
        contacts,
        login,
        logout,
        switchRole,
        createUser,
        updateUser,
        deleteUser,
        createPage,
        updatePage,
        deletePage,
        createContact,
        updateContactStatus,
        deleteContact,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
