# Hướng dẫn khắc phục lỗi "Account is disabled"

## 🚨 Vấn đề
Khi bạn khóa một tài khoản trong hệ thống, tài khoản đó sẽ có trạng thái "inactive" hoặc "suspended" trong database. Khi đăng nhập lại, backend kiểm tra trạng thái này và từ chối đăng nhập với lỗi:

```json
{
  "error": {
    "code": "ACCOUNT_DISABLED",
    "message": "Account is disabled"
  }
}
```

## 🔍 Nguyên nhân
1. **Trạng thái tài khoản bị thay đổi**: Khi sử dụng chức năng "Khóa tài khoản" trong giao diện quản lý, trạng thái tài khoản được đặt thành "inactive" hoặc "suspended"
2. **Backend kiểm tra trạng thái**: Trong quá trình đăng nhập, backend kiểm tra trạng thái tài khoản và từ chối nếu không phải "active"
3. **Không có cơ chế tự động mở khóa**: Hệ thống không tự động mở khóa tài khoản sau một khoảng thời gian

## 🛠️ Giải pháp

### Phương pháp 1: Sử dụng Script Node.js (Khuyến nghị)

#### Bước 1: Chạy script sửa tất cả tài khoản bị khóa
```bash
cd conference-management-system
node fix-disabled-accounts.js
```

#### Bước 2: Kiểm tra tài khoản cụ thể
```bash
node fix-disabled-accounts.js check admin@example.com
```

### Phương pháp 2: Sử dụng giao diện web

#### Bước 1: Mở file HTML
Mở file `fix-account-disabled.html` trong trình duyệt

#### Bước 2: Tải danh sách tài khoản
- Click nút "Tải danh sách tài khoản"
- Xem danh sách tất cả tài khoản và trạng thái của chúng

#### Bước 3: Sửa tài khoản bị khóa
- Click "Sửa tất cả tài khoản bị khóa" để sửa hàng loạt
- Hoặc chọn từng tài khoản và click "Kích hoạt"

#### Bước 4: Test đăng nhập
- Nhập email và password
- Click "Test đăng nhập" để xác nhận

### Phương pháp 3: Sửa trực tiếp trong database

#### Bước 1: Kết nối database
```sql
-- Kết nối đến database MySQL
mysql -u root -p
```

#### Bước 2: Kiểm tra trạng thái tài khoản
```sql
-- Xem tất cả tài khoản và trạng thái
SELECT ID, EMAIL, NAME, STATUS, ROLE_CODE 
FROM users 
ORDER BY STATUS, EMAIL;
```

#### Bước 3: Sửa trạng thái tài khoản
```sql
-- Sửa tất cả tài khoản bị khóa thành active
UPDATE users 
SET STATUS = 'active' 
WHERE STATUS IN ('inactive', 'suspended');

-- Hoặc sửa tài khoản cụ thể
UPDATE users 
SET STATUS = 'active' 
WHERE EMAIL = 'admin@example.com';
```

#### Bước 4: Xác nhận thay đổi
```sql
-- Kiểm tra lại trạng thái
SELECT ID, EMAIL, NAME, STATUS 
FROM users 
WHERE EMAIL = 'admin@example.com';
```

## 📋 Các trạng thái tài khoản

| Trạng thái | Mô tả | Có thể đăng nhập |
|------------|-------|------------------|
| `active` | Hoạt động bình thường | ✅ Có |
| `inactive` | Không hoạt động | ❌ Không |
| `suspended` | Bị đình chỉ | ❌ Không |

## 🔧 Script tự động

### Script Node.js (`fix-disabled-accounts.js`)

**Tính năng:**
- Tự động tìm tất cả tài khoản bị khóa
- Sửa trạng thái thành "active"
- Test đăng nhập sau khi sửa
- Báo cáo kết quả chi tiết

**Cách sử dụng:**
```bash
# Sửa tất cả tài khoản bị khóa
node fix-disabled-accounts.js

# Kiểm tra tài khoản cụ thể
node fix-disabled-accounts.js check admin@example.com
```

### Giao diện web (`fix-account-disabled.html`)

**Tính năng:**
- Giao diện trực quan, dễ sử dụng
- Xem danh sách tất cả tài khoản
- Sửa từng tài khoản hoặc hàng loạt
- Test đăng nhập trực tiếp
- Log chi tiết các thao tác

## 🚀 Quy trình khắc phục nhanh

### Cho người dùng cuối:
1. **Mở file HTML**: `fix-account-disabled.html`
2. **Tải danh sách**: Click "Tải danh sách tài khoản"
3. **Sửa hàng loạt**: Click "Sửa tất cả tài khoản bị khóa"
4. **Test đăng nhập**: Thử đăng nhập lại

### Cho developer:
1. **Chạy script**: `node fix-disabled-accounts.js`
2. **Kiểm tra log**: Xem kết quả trong console
3. **Test API**: Thử gọi API đăng nhập

## ⚠️ Lưu ý quan trọng

1. **Backup database**: Trước khi sửa, nên backup database
2. **Kiểm tra quyền**: Đảm bảo có quyền truy cập API hoặc database
3. **Test sau khi sửa**: Luôn test đăng nhập sau khi sửa
4. **Nguyên nhân gốc**: Tìm hiểu tại sao tài khoản bị khóa để tránh lặp lại

## 🔍 Troubleshooting

### Lỗi "Không thể kết nối đến server"
- Kiểm tra backend có đang chạy trên `http://localhost:3001`
- Kiểm tra kết nối mạng
- Kiểm tra firewall

### Lỗi "Không tìm thấy tài khoản"
- Kiểm tra email có đúng không
- Kiểm tra tài khoản có tồn tại trong database không

### Lỗi "Không có quyền truy cập"
- Kiểm tra API key hoặc authentication
- Kiểm tra quyền truy cập database

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra log trong console
2. Sử dụng giao diện web để debug
3. Kiểm tra trạng thái backend
4. Liên hệ team phát triển

## 🎯 Kết quả mong đợi

Sau khi thực hiện các bước trên:
- ✅ Tất cả tài khoản bị khóa sẽ được kích hoạt
- ✅ Có thể đăng nhập bình thường
- ✅ Không còn lỗi "Account is disabled"
- ✅ Hệ thống hoạt động trở lại bình thường
