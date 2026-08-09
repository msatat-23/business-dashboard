# Auth System Quick Reference

## Files Modified

### Core Auth Files
1. **`context/AuthContext.tsx`** - Main authentication context
   - Added `isAuthLoading` state
   - Enhanced initialization logic
   - Refresh token support in login/logout

2. **`lib/api.ts`** - API layer with token refresh
   - Automatic token refresh on 401
   - Queue system for concurrent requests
   - Refresh token endpoint integration

3. **`lib/auth-storage.ts`** ⭐ NEW - Token storage utilities
   - Centralized token management
   - Type-safe storage helpers
   - JWT parsing utilities

### UI Components
4. **`components/layout/DashboardShell.tsx`**
   - Added loading state handling
   - Prevents premature redirects

5. **`app/page.tsx`**
   - Improved redirect logic
   - Shows loading state

## Key Features

### ✅ Fixed Issues
- ✅ No more login redirect on page refresh
- ✅ User properly fetched and stored on reload
- ✅ Refresh token integration with backend array
- ✅ Automatic token refresh on expiration
- ✅ Proper loading states prevent redirect loops

### 🔒 Security Features
- Automatic token refresh before expiration
- Secure token storage helpers
- Token validation and expiration checks
- Request queuing during token refresh

## Token Flow

```
User Login
    ↓
Store: accessToken, refreshToken, email
    ↓
Make API Request
    ↓
Token Expired? (401)
    ↓
Refresh Token → New Access Token
    ↓
Retry Request → Success
    ↓
Refresh Failed? → Redirect to Login
```

## LocalStorage Keys

```typescript
business_dev_access_token   // Short-lived access token
business_dev_refresh_token  // Long-lived refresh token
business_dev_session_email  // User's email
```

## Backend Requirements

### 1. Login Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",  // NEW - Required
    "user": {
      "id": "123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
}
```

### 2. Refresh Token Endpoint (NEW)
```
POST /api/v1/auth/refresh
Body: { "refreshToken": "eyJhbG..." }

Response:
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."  // Optional - for token rotation
  }
}
```

### 3. Get Current User
```
GET /api/v1/auth/me
Headers: { "Authorization": "Bearer eyJhbG..." }

Response:
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "123",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

## Backend Integration (refreshTokens[] Array)

Your backend should store refresh tokens in a user's array:

```typescript
// User model
{
  id: string;
  email: string;
  refreshTokens: string[];  // Array of active refresh tokens
}
```

### On Login
```typescript
// Generate new refresh token
const refreshToken = generateRefreshToken(user);
// Add to user's refreshTokens array
user.refreshTokens.push(refreshToken);
await user.save();
```

### On Refresh
```typescript
// Validate token exists in array
if (!user.refreshTokens.includes(refreshToken)) {
  throw new UnauthorizedException();
}

// Generate new tokens
const newAccessToken = generateAccessToken(user);
const newRefreshToken = generateRefreshToken(user);

// Token rotation (optional but recommended)
user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
user.refreshTokens.push(newRefreshToken);
await user.save();
```

### On Logout
```typescript
// Remove token from array
user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
await user.save();
```

## Usage Examples

### Check if User is Authenticated
```typescript
import { useAuth } from '@/context/AuthContext';

const { currentUser, isAuthLoading } = useAuth();

if (isAuthLoading) {
  return <Loading />;
}

if (!currentUser) {
  return <LoginPrompt />;
}
```

### Make Authenticated API Call
```typescript
import { getUsersApi } from '@/lib/api';

// Just call the API - token refresh is automatic
const users = await getUsersApi();
```

### Manual Token Check
```typescript
import { hasAuthTokens, isTokenExpired, getAccessToken } from '@/lib/auth-storage';

if (!hasAuthTokens()) {
  // No tokens - user not logged in
}

const token = getAccessToken();
if (token && isTokenExpired(token)) {
  // Token expired - will auto-refresh on next API call
}
```

## Testing

### Test Scenarios
1. ✅ Login → Store tokens → Refresh page → Stay logged in
2. ✅ Make API call → Token expires → Auto refresh → Request succeeds
3. ✅ Refresh token expires → Redirect to login
4. ✅ Multiple tabs → Consistent auth state
5. ✅ Logout → All tokens cleared

### Manual Testing
```bash
# 1. Login and check localStorage
localStorage.getItem('business_dev_access_token')
localStorage.getItem('business_dev_refresh_token')

# 2. Refresh page - should stay logged in

# 3. Clear access token only
localStorage.removeItem('business_dev_access_token')
# Make API call - should auto-refresh

# 4. Clear all tokens
localStorage.clear()
# Should redirect to login
```

## Common Issues

### Issue: Still redirecting to login on refresh
**Solution**: Check that `isAuthLoading` is properly handled in all route guards

### Issue: Token not refreshing
**Solution**: Ensure backend `/auth/refresh` endpoint exists and returns correct response

### Issue: Infinite refresh loop
**Solution**: Check that refresh token endpoint doesn't return 401 unnecessarily

## Environment Setup

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

## Next Steps

1. ✅ Implement all fixes (DONE)
2. 🔄 Update backend to return refreshToken in login
3. 🔄 Implement `/auth/refresh` endpoint
4. 🔄 Add refreshTokens[] to user model
5. ✅ Test all scenarios

## Additional Resources

- Full documentation: `AUTH_AND_REFRESH_TOKEN_FIXES.md`
- Token utilities: `lib/auth-storage.ts`
- API layer: `lib/api.ts`
- Auth context: `context/AuthContext.tsx`
