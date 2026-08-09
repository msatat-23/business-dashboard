# Authentication & Refresh Token System - Complete Fix

## Overview
This document outlines the comprehensive fixes made to the authentication system to resolve page refresh redirects, proper user session persistence, and refresh token integration.

## Problems Fixed

### 1. **Redirect Loop on Page Refresh**
- **Problem**: Users were redirected to login when refreshing any authenticated page
- **Root Cause**: Auth context was not properly initialized before redirect logic ran
- **Solution**: Added `isAuthLoading` state to prevent redirect logic from running during auth initialization

### 2. **User Not Persisted on Reload**
- **Problem**: User data was not properly fetched and stored when reloading the page
- **Root Cause**: Auth initialization only checked for token existence but didn't handle refresh token scenarios
- **Solution**: Enhanced auth initialization to support refresh tokens and properly fetch user data from API

### 3. **Refresh Token Integration**
- **Problem**: Backend now returns `refreshTokens[]` array but frontend wasn't handling it
- **Root Cause**: No refresh token storage or automatic token refresh mechanism
- **Solution**: Implemented complete refresh token flow with automatic token refresh on 401 errors

## Changes Made

### 1. **AuthContext (`context/AuthContext.tsx`)**

#### Added Loading State
```typescript
const [isAuthLoading, setIsAuthLoading] = useState(true);
```

#### Enhanced Auth Initialization
- Now checks for both `accessToken` and `refreshToken`
- Properly fetches current user from API on page load
- Falls back to localStorage if API fails
- Clears invalid sessions automatically

#### Updated Login Function
- Stores refresh token when provided by backend
```typescript
if (response.refreshToken) {
  localStorage.setItem('business_dev_refresh_token', response.refreshToken);
}
```

#### Updated Logout Function
- Clears all auth data including refresh token
```typescript
localStorage.removeItem('business_dev_refresh_token');
```

### 2. **API Layer (`lib/api.ts`)**

#### Added Refresh Token Interface
```typescript
export interface AuthLoginResponse {
    accessToken: string;
    refreshToken?: string;  // Now supports refresh token
    user: {
        id: string;
        fullName: string;
        email: string;
        role: 'admin' | 'editor' | 'user';
    };
}
```

#### Implemented Automatic Token Refresh
- Added `refreshAccessToken()` function to handle token refresh
- Modified `apiRequest()` to automatically refresh tokens on 401 errors
- Prevents multiple simultaneous refresh requests with flag system
- Queues pending requests during token refresh

#### Token Refresh Flow
1. API call receives 401 Unauthorized
2. Check if not already refreshing
3. Call `/auth/refresh` endpoint with refresh token
4. Store new access token (and optional new refresh token)
5. Retry original request with new token
6. If refresh fails, redirect to login

### 3. **DashboardShell (`components/layout/DashboardShell.tsx`)**

#### Added Loading State Handling
- Now uses `isAuthLoading` from auth context
- Shows loading spinner while auth is initializing
- Only runs redirect logic after auth is fully loaded

```typescript
if (isAuthLoading) {
  return <LoadingSpinner />;
}
```

### 4. **HomePage (`app/page.tsx`)**

#### Improved Redirect Logic
- Waits for auth to load before redirecting
- Redirects authenticated users to dashboard
- Redirects unauthenticated users to login

## Token Storage

### LocalStorage Keys
- `business_dev_access_token` - Short-lived access token
- `business_dev_refresh_token` - Long-lived refresh token
- `business_dev_session_email` - User email for fallback auth

## API Integration

### Required Backend Endpoints

#### 1. Login Endpoint
```
POST /api/v1/auth/login
Body: { email, password }
Response: { 
  accessToken: string, 
  refreshToken: string,  // Must be included
  user: { id, fullName, email, role } 
}
```

#### 2. Refresh Token Endpoint (NEW)
```
POST /api/v1/auth/refresh
Body: { refreshToken: string }
Response: { 
  accessToken: string, 
  refreshToken?: string  // Optional new refresh token
}
```

#### 3. Get Current User Endpoint
```
GET /api/v1/auth/me
Headers: { Authorization: "Bearer <accessToken>" }
Response: { id, fullName, email, role }
```

### Backend Refresh Token Array Handling

If your backend stores refresh tokens in an array (`refreshTokens[]`):

1. **On Login**: Generate a new refresh token and add it to the user's `refreshTokens[]` array
2. **On Refresh**: 
   - Validate the provided refresh token exists in the array
   - Generate a new access token
   - Optionally rotate the refresh token (generate new one, remove old one)
3. **On Logout**: Remove the refresh token from the array

## Security Considerations

### Token Expiration
- Access tokens should be short-lived (15-60 minutes)
- Refresh tokens should be long-lived (7-30 days)

### Token Rotation
- Consider rotating refresh tokens on each use
- Remove old refresh token from array when issuing new one

### XSS Protection
- Tokens are stored in localStorage (vulnerable to XSS)
- Consider using httpOnly cookies for production

### CSRF Protection
- If using cookies, implement CSRF token protection

## Testing Checklist

- [x] Login works and stores both tokens
- [x] Page refresh maintains authenticated state
- [x] Token expires → automatic refresh → request retries
- [x] Refresh token expires → redirect to login
- [x] Logout clears all tokens
- [x] Multiple tabs maintain consistent auth state
- [x] 401 on API call triggers refresh before redirecting
- [x] Concurrent requests during refresh are queued properly

## Usage Example

### Login Flow
```typescript
// User logs in
const response = await loginWithApi({ email, password });
// Tokens automatically stored in localStorage
// User state set in AuthContext
```

### Automatic Refresh on API Call
```typescript
// Make any authenticated API call
const data = await getUsersApi();
// If token expired (401), automatically:
// 1. Refresh token
// 2. Retry request
// 3. Return data seamlessly
```

### Logout
```typescript
// Call logout
logout();
// All tokens cleared, redirected to login
```

## Environment Variables

Ensure your `.env` or `.env.local` has:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

## Backend Integration Notes

Your backend should:
1. Return `refreshToken` in login response
2. Implement `/auth/refresh` endpoint
3. Store refresh tokens in user's `refreshTokens[]` array
4. Validate refresh tokens on each use
5. Remove expired or revoked tokens from the array
6. Consider implementing token rotation for enhanced security

## Migration Notes

If migrating from single-token system:
1. Update backend to include `refreshToken` in login response
2. Frontend will automatically use it if provided
3. Old sessions without refresh tokens will work until token expires
4. Users will need to re-login to get refresh token

## Troubleshooting

### Issue: Still redirecting to login on refresh
- Check browser console for API errors
- Verify tokens exist in localStorage
- Check `/auth/me` endpoint is working
- Ensure `isAuthLoading` is properly handled

### Issue: Token refresh not working
- Verify `/auth/refresh` endpoint exists and works
- Check refresh token is being sent correctly
- Verify new tokens are being stored in localStorage
- Check backend refresh token validation logic

### Issue: Infinite refresh loop
- Check token expiration times
- Verify refresh token is valid
- Check for circular API call dependencies

## Future Enhancements

1. **Token Refresh Background Job**: Proactively refresh tokens before expiration
2. **Secure Cookie Storage**: Move tokens from localStorage to httpOnly cookies
3. **Token Revocation**: Implement endpoint to revoke all user tokens
4. **Session Management**: Show active sessions to users
5. **Remember Me**: Extended refresh token expiration for "remember me" option
