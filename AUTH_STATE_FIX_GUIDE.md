# Hướng dẫn khắc phục lỗi Authentication State

## Vấn đề
Khi tạo tài khoản mới, hệ thống hiển thị "chưa đăng nhập" và không cho phép đăng nhập với bất kỳ tài khoản nào khác, dù mở sang trang khác cũng không vào được.

## Nguyên nhân
1. **Auto-login sau registration**: Hệ thống tự động đăng nhập sau khi đăng ký, gây xung đột state
2. **Token storage conflict**: Token được lưu vào cả cookies và localStorage, gây xung đột
3. **Session state không được clear**: Khi tạo tài khoản mới, session cũ vẫn tồn tại
4. **Authentication state không được reset**: State không được clear khi có lỗi

## Giải pháp đã triển khai

### 1. Sửa Registration Flow
- **Trước**: Tự động đăng nhập sau khi đăng ký
- **Sau**: Chỉ hiển thị thông báo thành công, yêu cầu đăng nhập thủ công

### 2. Thêm Clear Auth State Method
- Thêm method `clearAuthState()` để xóa toàn bộ dữ liệu xác thực
- Clear cả localStorage, cookies và state

### 3. Cải thiện Error Handling
- Clear authentication state trước khi đăng ký
- Xử lý lỗi tốt hơn

### 4. Tạo Debug Tools
- Auth Debug Panel để kiểm tra trạng thái
- Trang test authentication

## Cách sử dụng

### Bước 1: Truy cập trang test
```
http://localhost:3000/test-auth
```

### Bước 2: Kiểm tra trạng thái hiện tại
- Xem Auth Debug Panel để kiểm tra trạng thái
- Nếu có vấn đề, click "Clear Auth" để reset

### Bước 3: Test đăng nhập
- Sử dụng thông tin admin: `admin@conference.vn` / `admin123`
- Hoặc tạo tài khoản mới

### Bước 4: Test đăng ký
- Đăng ký tài khoản mới
- Sau khi đăng ký thành công, đăng nhập thủ công

## Scripts hỗ trợ

### 1. `fix-auth-state.js`
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

### 2. Auth Debug Panel
Component hiển thị trong development mode để debug:
- Hiển thị trạng thái authentication
- Nút Clear Auth State
- Nút Refresh

## Các thay đổi chính

### 1. `lib/auth.ts`
- Sửa `register()` method: không auto-login
- Thêm `clearAuthState()` method
- Cải thiện error handling

### 2. `hooks/use-auth.ts`
- Thêm `clearAuthState` function
- Expose method cho components

### 3. `components/auth/auth-debug-panel.tsx`
- Component debug cho development
- Hiển thị trạng thái và controls

### 4. `app/test-auth/page.tsx`
- Trang test authentication
- Forms để test login/register
- Quick actions

## Cách khắc phục khi gặp vấn đề

### Nếu không thể đăng nhập:
1. Truy cập `/test-auth`
2. Click "Clear Auth" trong Auth Debug Panel
3. Thử đăng nhập lại

### Nếu đăng ký bị lỗi:
1. Clear auth state
2. Thử đăng ký lại
3. Sau khi đăng ký thành công, đăng nhập thủ công

### Nếu vẫn có vấn đề:
1. Mở Developer Tools (F12)
2. Chạy script `fix-auth-state.js`
3. Reload trang

## Lưu ý
- Trang test chỉ hiển thị trong development mode
- Auth Debug Panel chỉ hiển thị khi `NODE_ENV !== 'production'`
- Luôn test trên trang `/test-auth` trước khi sử dụng thực tế

## Thông tin đăng nhập Admin
- **Email**: `admin@conference.vn`
- **Password**: `admin123`

Chạy script `HOI_THAO_BE/fix-admin-login.js` nếu admin không đăng nhập được.
