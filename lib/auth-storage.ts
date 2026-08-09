/**
 * Centralized authentication token storage utilities
 * Provides type-safe access to authentication tokens and session data
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'business_dev_access_token',
  REFRESH_TOKEN: 'business_dev_refresh_token',
  SESSION_EMAIL: 'business_dev_session_email',
} as const;

/**
 * Authentication tokens interface
 */
export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Get session email from localStorage
 */
export function getSessionEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.SESSION_EMAIL);
}

/**
 * Get all auth tokens at once
 */
export function getAuthTokens(): AuthTokens {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    email: getSessionEmail(),
  };
}

/**
 * Set access token in localStorage
 */
export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}

/**
 * Set refresh token in localStorage
 */
export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Set session email in localStorage
 */
export function setSessionEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SESSION_EMAIL, email);
}

/**
 * Set all auth tokens at once
 */
export function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
  email: string;
}): void {
  setAccessToken(tokens.accessToken);
  setSessionEmail(tokens.email);
  if (tokens.refreshToken) {
    setRefreshToken(tokens.refreshToken);
  }
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Remove refresh token from localStorage
 */
export function removeRefreshToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Remove session email from localStorage
 */
export function removeSessionEmail(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.SESSION_EMAIL);
}

/**
 * Clear all auth tokens from localStorage
 */
export function clearAuthTokens(): void {
  removeAccessToken();
  removeRefreshToken();
  removeSessionEmail();
}

/**
 * Check if user has any auth tokens (is potentially authenticated)
 */
export function hasAuthTokens(): boolean {
  const tokens = getAuthTokens();
  return !!(tokens.accessToken || tokens.refreshToken);
}

/**
 * Check if user has valid session data
 */
export function hasValidSession(): boolean {
  const tokens = getAuthTokens();
  return !!(tokens.accessToken && tokens.email);
}

/**
 * Parse JWT token payload (without verification)
 * Returns null if token is invalid or not a JWT
 */
export function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired (client-side check only)
 * Returns true if expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return true;
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  
  return currentTime >= expirationTime;
}

/**
 * Get time until token expires in milliseconds
 * Returns 0 if token is expired or invalid
 */
export function getTokenExpirationTime(token: string): number {
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return 0;
  
  const expirationTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;
  
  return Math.max(0, timeRemaining);
}

/**
 * Check if access token needs refresh (expires within 5 minutes)
 */
export function shouldRefreshToken(): boolean {
  const accessToken = getAccessToken();
  if (!accessToken) return false;
  
  const timeRemaining = getTokenExpirationTime(accessToken);
  const fiveMinutes = 5 * 60 * 1000;
  
  return timeRemaining < fiveMinutes;
}
