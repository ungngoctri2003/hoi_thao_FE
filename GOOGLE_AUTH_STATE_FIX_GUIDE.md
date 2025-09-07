# Hướng dẫn khắc phục lỗi Google Authentication State

## Vấn đề
Khi đăng nhập bằng Google, hệ thống bị lỗi authentication state, không thể đăng nhập với bất kỳ tài khoản nào khác, dù mở sang trang khác cũng không vào được.

## Nguyên nhân
1. **API URL mismatch**: API routes sử dụng sai URL backend
2. **Token storage conflict**: Google auth lưu token trực tiếp, không thông qua auth service
3. **State synchronization**: Firebase auth và backend auth không đồng bộ
4. **Redirect handling**: Có thể gây xung đột với authentication state

## Giải pháp đã triển khai

### 1. Sửa API URL
- **Trước**: `http://localhost:4000/api/v1`
- **Sau**: `http://localhost:3001/api`

### 2. Cải thiện Token Management
- Clear authentication state trước khi Google auth
- Đồng bộ token storage giữa Firebase và backend
- Thêm page reload để sync state

### 3. Tạo Debug Tools
- Google Auth Test component
- Cập nhật trang test authentication

### 4. Cải thiện Error Handling
- Xử lý lỗi tốt hơn cho Google auth
- Fallback mechanisms

## Cách sử dụng

### Bước 1: Truy cập trang test
```
http://localhost:3000/test-auth
```

### Bước 2: Test Google Authentication
- Sử dụng Google Auth Test component
- Chọn mode: Login hoặc Register
- Click "Google Sign In"

### Bước 3: Kiểm tra trạng thái
- Xem Firebase Auth State
- Xem Backend Auth State
- Xem Token Information

### Bước 4: Khắc phục nếu có lỗi
- Click "Clear All Auth" để reset
- Hoặc chạy script `fix-google-auth.js`

## Scripts hỗ trợ

### 1. `fix-google-auth.js`
Script để clear toàn bộ authentication data:
```javascript
// Chạy trong browser console
function clearAllAuthData() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('authState');
  
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  window.location.reload();
}

clearAllAuthData();
```

### 2. Google Auth Test Component
Component để test Google authentication:
- Hiển thị Firebase Auth State
- Hiển thị Backend Auth State
- Hiển thị Token Information
- Nút Clear All Auth
- Nút Refresh Page

## Các thay đổi chính

### 1. `app/api/auth/google/login/route.ts`
- Sửa API URL từ `localhost:4000` thành `localhost:3001`

### 2. `app/api/auth/google/register/route.ts`
- Sửa API URL từ `localhost:4000` thành `localhost:3001`

### 3. `hooks/use-firebase-auth.ts`
- Clear authentication state trước khi Google auth
- Thêm page reload để sync state
- Cải thiện error handling

### 4. `components/auth/google-auth-test.tsx`
- Component test Google authentication
- Hiển thị trạng thái Firebase và Backend
- Debug information

### 5. `app/test-auth/page.tsx`
- Thêm Google Auth Test component

## Cách khắc phục khi gặp vấn đề

### Nếu Google login không hoạt động:
1. Truy cập `/test-auth`
2. Sử dụng Google Auth Test component
3. Click "Clear All Auth" nếu cần
4. Thử Google login lại

### Nếu không thể đăng nhập sau Google auth:
1. Kiểm tra Backend Auth State
2. Nếu không authenticated, click "Clear All Auth"
3. Thử Google login lại

### Nếu vẫn có vấn đề:
1. Mở Developer Tools (F12)
2. Chạy script `fix-google-auth.js`
3. Reload trang

## Lưu ý
- Đảm bảo backend đang chạy trên `localhost:3001`
- Kiểm tra Firebase configuration
- Google auth sử dụng redirect flow, có thể mất vài giây
- Luôn test trên trang `/test-auth` trước khi sử dụng thực tế

## Firebase Configuration
Đảm bảo Firebase config trong `lib/firebase.ts` đúng:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCe5ebKWjE7xB7mq2-y9ZQKOg0a8lz6xKk",
  authDomain: "fun-chat-9e936.firebaseapp.com",
  // ... other config
};
```

## Backend Requirements
Backend cần có các endpoints:
- `POST /api/auth/google/login`
- `POST /api/auth/google/register`

Nếu backend không có Google auth endpoints, hệ thống sẽ sử dụng mock response.
