'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, Page, Contact, ContactStatus } from '@/lib/types';
import { INITIAL_USERS, INITIAL_PAGES, INITIAL_CONTACTS } from '@/lib/mock-data';
import {
  getStoredUsers,
  saveUsers,
  getStoredPages,
  savePages,
  getStoredContacts,
  saveContacts,
} from '@/lib/storage';
import { loginWithApi, getCurrentUserApi } from '@/lib/api';
import { 
  getAuthTokens, 
  setAuthTokens, 
  clearAuthTokens, 
  hasAuthTokens 
} from '@/lib/auth-storage';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  pages: Page[];
  contacts: Contact[];
  isAuthLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUser: (id: string, updatedFields: Partial<User>) => { success: boolean; message: string };
  updatePage: (id: number, content: Record<string, any>, newSlug?: string) => { success: boolean; message: string };
  updateContactStatus: (id: string, status: ContactStatus) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize from storage to avoid hydration mismatch
  const [users, setUsers] = useState<User[]>([]);
  
  const [pages, setPages] = useState<Page[]>([]);
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const isInitialized = useRef(false);

  // Initialize authentication on mount
  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized.current) return;

    const initAuth = async () => {
      const tokens = getAuthTokens();
      
      // No tokens or email - user is not logged in
      if (!hasAuthTokens()) {
        setIsAuthLoading(false);
        return;
      }

      // If we have a token or refresh token, try to fetch current user
      if (tokens.accessToken || tokens.refreshToken) {
        try {
          // Try to fetch the current user from API
          const fetchUser = await getCurrentUserApi();
      console.log(fetchUser)
          const userData=fetchUser.data
          console.log(userData)
          const authenticatedUser: User = {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            password: '',
            role: userData.role,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          setCurrentUser(authenticatedUser);
          
          // Update stored email if different
          if (tokens.email !== userData.email) {
            setAuthTokens({
              accessToken: tokens.accessToken!,
              refreshToken: tokens.refreshToken || undefined,
              email: userData.email,
            });
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          
          // If API fails and we have a saved email, try fallback to localStorage
          if (tokens.email) {
            const loadedUsers = getStoredUsers();
            const found = loadedUsers.find((u) => u.email === tokens.email);
            
            if (found && found.isActive) {
              setCurrentUser(found);
            } else {
              // Clear invalid session
              clearAuthTokens();
            }
          } else {
            // No saved email, clear everything
            clearAuthTokens();
          }
        } finally {
          setIsAuthLoading(false);
        }
      } else {
        setIsAuthLoading(false);
      }
    };

    initAuth();
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
      
      // Store tokens using helper function
      setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        email: loggedUser.email,
      });

      return { success: true, message: `Welcome back, ${loggedUser.fullName}!` };
    } catch (error) {
      // Fallback to local users
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      
      if (found) {
        if (!found.isActive) {
          return { success: false, message: 'Account is deactivated. Contact an administrator.' };
        }
        if (password && found.password && found.password !== password && !found.password.startsWith('$2')) {
          return { success: false, message: 'Invalid password.' };
        }
        
        setCurrentUser(found);
        
        // Store tokens for fallback user
        setAuthTokens({
          accessToken: 'mock_token_' + found.id,
          email: found.email,
        });
        
        return { success: true, message: `Welcome back, ${found.fullName}!` };
      }
      
      const message = error instanceof Error ? error.message : 'Login failed.';
      return { success: false, message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    clearAuthTokens();
    window.location.href = '/login';
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

  const updateContactStatus = (id: string, status: ContactStatus) => {
    const nextContacts = contacts.map((c) => (c.id === id ? { ...c, status } : c));
    setContacts(nextContacts);
    saveContacts(nextContacts);
    return { success: true, message: `Status updated to ${status}` };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        pages,
        contacts,
        isAuthLoading,
        login,
        logout,
        updateUser,
        updatePage,
        updateContactStatus,
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
