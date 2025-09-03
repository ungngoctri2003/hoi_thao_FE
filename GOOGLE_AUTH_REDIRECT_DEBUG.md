# Google Authentication Redirect Debug Guide

## Vấn đề: User đăng nhập Google thành công nhưng không redirect về trang chủ

### 🔍 Cách debug và kiểm tra:

#### 1. **Mở Developer Tools**
- Nhấn `F12` hoặc `Ctrl+Shift+I`
- Mở tab **Console** để xem logs
- Mở tab **Application** > **Local Storage** để kiểm tra tokens

#### 2. **Test Redirect Flow**
- Mở file: `test-redirect-flow.html` trong browser
- Click "Test Google Authentication Redirect"
- Theo dõi logs trong console

#### 3. **Kiểm tra Callback Page**
- Sau khi đăng nhập Google, bạn sẽ được redirect về `/auth/google/callback`
- Trên trang này sẽ có debug component ở góc phải màn hình
- Kiểm tra trạng thái:
  - ✅ Firebase: Authenticated
  - ✅ Backend: Has tokens
  - ✅ Ready to redirect

#### 4. **Debug Steps**

**Step 1: Kiểm tra Firebase Authentication**
```javascript
// Trong console
console.log('Firebase user:', firebase.auth().currentUser);
```

**Step 2: Kiểm tra Backend Tokens**
```javascript
// Trong console
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
console.log('Cookies:', document.cookie);
```

**Step 3: Kiểm tra Redirect Logic**
- Mở `/auth/google/callback` page
- Xem debug component ở góc phải
- Kiểm tra "Ready to redirect" status

#### 5. **Common Issues và Solutions**

**Issue 1: Firebase user exists but no backend tokens**
```
❌ Firebase: Authenticated
❌ Backend: No tokens
```
**Solution:** Backend API không hoạt động hoặc lỗi network

**Issue 2: Backend tokens exist but no redirect**
```
✅ Firebase: Authenticated  
✅ Backend: Has tokens
❌ Ready to redirect: false
```
**Solution:** Logic redirect có vấn đề

**Issue 3: Redirect loop**
```
🔄 Redirecting to dashboard...
🔄 Redirecting to dashboard...
🔄 Redirecting to dashboard...
```
**Solution:** Auth service reinitialize gây conflict

#### 6. **Manual Redirect Test**

Nếu auto redirect không hoạt động, thử manual:

```javascript
// Trong console của callback page
if (localStorage.getItem('accessToken')) {
    window.location.href = '/dashboard';
}
```

#### 7. **Check Backend API**

Test backend API trực tiếp:

```bash
# Test Google login endpoint
curl -X POST http://localhost:4000/api/v1/auth/google/login \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseUid": "test_uid_123",
    "email": "test@example.com", 
    "name": "Test User",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

#### 8. **Database Check**

Chạy script kiểm tra database:

```bash
cd conference-management-system
node check-google-users.js
```

#### 9. **Environment Variables Check**

Đảm bảo backend có đủ environment variables:

```bash
# Backend .env file cần có:
FIREBASE_PROJECT_ID=fun-chat-9e936
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account@fun-chat-9e936.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
```

#### 10. **Complete Test Flow**

1. **Clear all data:**
   ```javascript
   localStorage.clear();
   document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
   document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
   ```

2. **Start fresh test:**
   - Mở `test-redirect-flow.html`
   - Click "Test Google Authentication Redirect"
   - Theo dõi từng step

3. **Check each step:**
   - Step 1-3: Google OAuth flow
   - Step 4: Redirect to callback page
   - Step 5: Firebase processes result
   - Step 6: Backend authentication
   - Step 7: Redirect to dashboard

### 🚀 Quick Fixes

**Fix 1: Force redirect after 3 seconds**
```javascript
// Thêm vào callback page
setTimeout(() => {
    if (window.location.href.includes('/auth/google/callback')) {
        window.location.href = '/dashboard';
    }
}, 3000);
```

**Fix 2: Check auth state before redirect**
```javascript
// Trong redirect handler
const isAuthenticated = localStorage.getItem('accessToken') || 
                       document.cookie.includes('accessToken=');
if (isAuthenticated) {
    router.push('/dashboard');
}
```

**Fix 3: Add fallback redirect**
```javascript
// Nếu auto redirect fail, thêm button manual
if (isAuthenticated && window.location.href.includes('/auth/google/callback')) {
    // Show "Continue to Dashboard" button
}
```

### 📞 Support

Nếu vẫn có vấn đề, hãy:

1. **Copy console logs** và gửi cho tôi
2. **Screenshot debug component** trên callback page  
3. **Check network tab** xem API calls có thành công không
4. **Run database check script** và gửi kết quả

### 🎯 Expected Behavior

**Successful flow:**
1. User clicks "Đăng nhập với Google"
2. Redirect to Google OAuth
3. User authenticates
4. Redirect to `/auth/google/callback`
5. Firebase processes result
6. Backend API called successfully
7. Tokens saved to localStorage + cookies
8. Redirect to `/dashboard` within 1-2 seconds

**Debug component should show:**
- ✅ Firebase: Authenticated
- ✅ Backend: Has tokens  
- ✅ Ready to redirect
