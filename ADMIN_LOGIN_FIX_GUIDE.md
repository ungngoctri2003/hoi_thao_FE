# Hướng dẫn khắc phục lỗi đăng nhập Admin

## Vấn đề
Khi đăng nhập với tài khoản admin, gặp lỗi:
```json
{
    "error": {
        "code": "INTERNAL_ERROR",
        "message": "Invalid credentials",
        "stack": "Error: Invalid credentials\n    at Object.login (D:\\DATN\\HOI_THAO_BE\\src\\modules\\auth\\auth.service.ts:17:34)\n    at login (D:\\DATN\\HOI_THAO_BE\\src\\modules\\auth\\auth.controller.ts:7:18)"
    }
}
```

## Nguyên nhân
Lỗi "Invalid credentials" xảy ra khi:
1. Không tìm thấy user với email `admin@conference.vn`
2. Mật khẩu không khớp với `PASSWORD_HASH` trong database
3. Tài khoản bị vô hiệu hóa (STATUS ≠ 'active')

## Giải pháp

### Bước 1: Kiểm tra tài khoản admin trong database
```sql
SELECT ID, EMAIL, NAME, STATUS, PASSWORD_HASH FROM APP_USERS WHERE EMAIL = 'admin@conference.vn';
```

### Bước 2: Tạo hoặc cập nhật tài khoản admin
Chạy script SQL: `HOI_THAO_BE/fix-admin-credentials.sql`

### Bước 3: Reset mật khẩu admin
Chạy script: `node HOI_THAO_BE/reset-admin-password.js`

### Bước 4: Test đăng nhập
Chạy script: `node HOI_THAO_BE/test-admin-login.js`

## Thông tin đăng nhập Admin
- **Email**: `admin@conference.vn`
- **Password**: `admin123`

## Scripts có sẵn

### 1. `check-users.js`
- Kiểm tra tất cả users trong database
- Tạo admin user nếu chưa có
- Gán role admin

### 2. `test-login.js`
- Test các mật khẩu khác nhau
- Reset mật khẩu admin về `admin123`

### 3. `fix-admin-login.js`
- Script tổng hợp để fix toàn bộ vấn đề
- Tạo user, reset password, gán role

### 4. `reset-admin-password.js`
- Script đơn giản chỉ reset mật khẩu

### 5. `test-admin-login.js`
- Test đăng nhập qua API

## Cách chạy

### Chạy từ thư mục backend:
```bash
cd D:\DATN\HOI_THAO_BE
node fix-admin-login.js
```

### Hoặc chạy từ thư mục gốc:
```bash
node HOI_THAO_BE/fix-admin-login.js
```

## Kiểm tra kết quả

Sau khi chạy script, bạn có thể:
1. Đăng nhập qua giao diện web với email `admin@conference.vn` và password `admin123`
2. Hoặc test qua API bằng script `test-admin-login.js`

## Lưu ý
- Đảm bảo database Oracle đang chạy
- Kiểm tra kết nối database trong file `.env`
- Nếu vẫn lỗi, kiểm tra log của backend server
