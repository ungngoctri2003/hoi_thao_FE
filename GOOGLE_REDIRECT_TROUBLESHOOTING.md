# Google Auth Redirect Troubleshooting

## Vấn đề: Đăng nhập Google xong không tự redirect

### 🔍 **Các nguyên nhân có thể:**

#### 1. **Firebase Admin SDK chưa được cấu hình**
- **Lỗi:** `Service account object must contain a string "project_id" property`
- **Giải pháp:** Cấu hình Firebase environment variables trong `.env`

#### 2. **Redirect URL không đúng**
- **Vấn đề:** Google Console chưa cấu hình redirect URL
- **Giải pháp:** Thêm `http://localhost:3000/auth/google/callback` vào Google Console

#### 3. **Logic xử lý redirect result không hoạt động**
- **Vấn đề:** `getRedirectResult()` không được gọi đúng cách
- **Giải pháp:** Đã sửa logic trong `useFirebaseAuth` hook

#### 4. **Backend authentication thất bại**
- **Vấn đề:** Backend không thể lưu user vào database
- **Giải pháp:** Kiểm tra database connection và migration

### 🛠️ **Các sửa đổi đã thực hiện:**

#### 1. **Cập nhật Firebase Auth Hook** (`hooks/use-firebase-auth.ts`)
```typescript
// Thêm redirect logic
if (redirectResult && redirectResult.user.uid === firebaseUser.uid) {
  console.log('New Google sign-in detected, calling backend...');
  await handleGoogleSignInBackend(firebaseUser);
  
  // Redirect to dashboard after successful backend authentication
  setTimeout(() => {
    window.location.href = '/dashboard';
  }, 1000);
}
```

#### 2. **Cập nhật Redirect Handler** (`components/auth/google-auth-redirect-handler.tsx`)
```typescript
// Thêm delay để đảm bảo Firebase auth state được set
const timer = setTimeout(() => {
  handleRedirectResult();
}, 500);
```

#### 3. **Thêm Debug Component** (`components/auth/google-auth-debug.tsx`)
- Hiển thị thông tin debug trong development mode
- Kiểm tra redirect result và user state

#### 4. **Cập nhật Firebase Config** (`lib/firebase.ts`)
```typescript
// Log redirect URL
const redirectUrl = `${window.location.origin}/auth/google/callback`;
console.log('Google Auth redirect URL:', redirectUrl);
```

### 🧪 **Cách test và debug:**

#### 1. **Test Redirect Flow:**
```bash
# Mở test file
open test-google-redirect.html
```

#### 2. **Kiểm tra Console Logs:**
- Mở Developer Tools
- Kiểm tra Console tab
- Tìm các log messages từ Firebase Auth

#### 3. **Kiểm tra Network Tab:**
- Xem các API calls đến backend
- Kiểm tra response từ Google Auth endpoints

#### 4. **Kiểm tra Local Storage:**
- Xem có `accessToken` và `refreshToken` không
- Kiểm tra Firebase auth state

### 🔧 **Các bước khắc phục:**

#### **Bước 1: Cấu hình Firebase Admin SDK**
```bash
cd HOI_THAO_BE
node setup-firebase-env.js
node test-firebase-config.js
```

#### **Bước 2: Cấu hình Google Console**
1. Vào [Google Console](https://console.developers.google.com/)
2. Chọn project của bạn
3. Vào "Credentials" > "OAuth 2.0 Client IDs"
4. Thêm redirect URI: `http://localhost:3000/auth/google/callback`

#### **Bước 3: Chạy Database Migration**
```bash
cd HOI_THAO_BE
node run-google-auth-migration.js
```

#### **Bước 4: Test Full Flow**
1. Mở `test-google-redirect.html`
2. Click "Test Google Redirect"
3. Kiểm tra debug information
4. Test trong app thực tế

### 📋 **Checklist Debug:**

- [ ] Firebase Admin SDK được cấu hình đúng
- [ ] Google Console có redirect URI đúng
- [ ] Database migration đã chạy
- [ ] Backend server đang chạy
- [ ] Frontend server đang chạy
- [ ] Console không có lỗi JavaScript
- [ ] Network requests thành công
- [ ] Local storage có tokens

### 🚨 **Các lỗi thường gặp:**

#### **Lỗi 1: "Service account object must contain a string 'project_id' property"**
```bash
# Giải pháp: Cấu hình Firebase environment variables
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
```

#### **Lỗi 2: "Redirect URI mismatch"**
- Kiểm tra Google Console OAuth settings
- Đảm bảo redirect URI khớp với app

#### **Lỗi 3: "Database connection failed"**
- Kiểm tra database connection string
- Chạy migration script

#### **Lỗi 4: "CORS error"**
- Kiểm tra CORS settings trong backend
- Đảm bảo frontend URL được allow

### 🎯 **Kết quả mong đợi:**

Sau khi sửa xong:
1. ✅ User click "Đăng nhập với Google"
2. ✅ Browser redirect đến Google OAuth
3. ✅ User authenticate với Google
4. ✅ Google redirect về `/auth/google/callback`
5. ✅ Backend authentication tự động
6. ✅ User được redirect đến `/dashboard`
7. ✅ User info hiển thị đúng

### 📞 **Nếu vẫn không hoạt động:**

1. **Kiểm tra Console Logs** - Tìm lỗi cụ thể
2. **Kiểm tra Network Tab** - Xem API calls
3. **Kiểm tra Local Storage** - Xem tokens
4. **Test với Debug Component** - Xem thông tin chi tiết
5. **Kiểm tra Firebase Console** - Xem authentication logs
