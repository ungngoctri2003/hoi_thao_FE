# Session Expiration Fix Summary

## Problem
The application was experiencing session expiration errors where users would see "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." (Session has expired. Please log in again.) but the application wouldn't automatically redirect them to the login page. Users would remain on the current page with an expired session.

## Root Cause
1. The API client correctly detected 401 Unauthorized responses and removed tokens
2. However, there was no mechanism to automatically redirect users to the login page when session expiration occurred
3. The middleware only checked for token expiration on page navigation, not on API call failures

## Solution Implemented

### 1. Enhanced API Client (`lib/api.ts`)
- Added `handleSessionExpiration()` method that dispatches a custom event when session expires
- Modified the 401 error handling to trigger session expiration handling for auth-related endpoints
- The method dispatches a `session-expired` custom event with details about the expiration

### 2. Updated Auth Service (`lib/auth.ts`)
- Added `setupSessionExpirationHandler()` method to listen for session expiration events
- When session expiration is detected, the auth state is updated to reflect the user is no longer authenticated
- This ensures all components using the auth service are notified of the session expiration

### 3. Created Session Expiration Handler Component (`components/auth/session-expiration-handler.tsx`)
- A React component that listens for session expiration events globally
- Shows a toast notification to inform the user about session expiration
- Automatically redirects the user to the login page with the current path as a redirect parameter
- Uses Next.js router for proper client-side navigation

### 4. Integrated Handler in Main Layout (`components/layout/main-layout.tsx`)
- Added the `SessionExpirationHandler` component to the main layout
- This ensures session expiration handling is available on all protected pages

## How It Works

1. **API Call Fails with 401**: When an API call returns 401 Unauthorized (session expired)
2. **Token Cleanup**: The API client removes the access and refresh tokens
3. **Event Dispatch**: A `session-expired` custom event is dispatched with expiration details
4. **Auth State Update**: The AuthService updates the authentication state to reflect the user is no longer authenticated
5. **User Notification**: The SessionExpirationHandler shows a toast notification
6. **Automatic Redirect**: After a 2-second delay, the user is redirected to the login page with the current path as a redirect parameter

## Benefits

1. **Automatic Handling**: Users are automatically redirected when their session expires
2. **User-Friendly**: Clear notification about what happened and why they're being redirected
3. **Preserves Context**: The current page is saved as a redirect parameter so users can return after logging in
4. **Global Coverage**: Works on all protected pages without requiring individual component changes
5. **Clean State Management**: Auth state is properly updated to reflect session expiration

## Testing

A test file `test-session-expiration.html` has been created to verify the session expiration handling works correctly. The test includes:
- Simulating session expiration events
- Testing API calls that return 401
- Verifying event handling and redirect behavior

## Files Modified

1. `lib/api.ts` - Enhanced 401 error handling and session expiration detection
2. `lib/auth.ts` - Added session expiration event handling
3. `components/auth/session-expiration-handler.tsx` - New component for handling session expiration
4. `components/layout/main-layout.tsx` - Integrated session expiration handler
5. `test-session-expiration.html` - Test file for verification

## Usage

The session expiration handling is now automatic and requires no additional configuration. When a user's session expires:

1. They will see a toast notification: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống."
2. After 2 seconds, they will be automatically redirected to the login page
3. The current page URL will be preserved as a redirect parameter
4. After logging in again, they can be redirected back to where they were

This provides a seamless user experience and prevents users from being stuck on pages with expired sessions.
