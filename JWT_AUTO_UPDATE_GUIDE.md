# Hướng Dẫn Tự Động Cập Nhật JWT Secrets

## Tổng Quan

Hệ thống tự động cập nhật JWT secrets đã được tích hợp vào cả frontend và backend để đảm bảo bảo mật tối đa. Hệ thống sẽ tự động:

- Kiểm tra JWT secrets không an toàn
- Tự động tạo JWT secrets mới khi cần
- Đồng bộ JWT secrets giữa frontend và backend
- Cảnh báo về các vấn đề bảo mật

## Các Lệnh Có Sẵn

### Frontend (conference-management-system)

```bash
# Tạo file .env.local mới với JWT secrets
npm run env:generate

# Cập nhật JWT secrets trong file hiện có
npm run env:update

# Kiểm tra JWT secrets có an toàn không
npm run env:check

# Tự động cập nhật JWT secrets nếu cần
npm run env:auto

# Đồng bộ JWT secrets từ backend
npm run env:sync

# Kiểm tra môi trường trước khi khởi động
npm run startup:check

# Kiểm tra bảo mật JWT secrets
npm run security:check

# Tự động sửa các vấn đề bảo mật
npm run security:fix

# Khởi động với kiểm tra tự động (mặc định)
npm run dev
npm run start

# Khởi động không kiểm tra (nếu cần)
npm run dev:raw
npm run start:raw
```

### Backend (HOI_THAO_BE)

```bash
# Tạo file .env mới với JWT secrets
npm run env:generate

# Cập nhật JWT secrets trong file hiện có
npm run env:update

# Kiểm tra JWT secrets có an toàn không
npm run env:check

# Tự động cập nhật JWT secrets nếu cần
npm run env:auto

# Kiểm tra môi trường trước khi khởi động
npm run startup:check

# Kiểm tra bảo mật JWT secrets
npm run security:check

# Tự động sửa các vấn đề bảo mật
npm run security:fix

# Khởi động với kiểm tra tự động (mặc định)
npm run dev

# Khởi động không kiểm tra (nếu cần)
npm run dev:raw
```

## Cách Hoạt Động

### 1. Tự Động Kiểm Tra Khi Khởi Động

Khi chạy `npm run dev` hoặc `npm run start`, hệ thống sẽ:

1. Kiểm tra file `.env` (backend) hoặc `.env.local` (frontend) có tồn tại không
2. Nếu không có, tạo file mới với JWT secrets ngẫu nhiên
3. Nếu có, kiểm tra JWT secrets có an toàn không
4. Nếu phát hiện JWT secrets không an toàn, tự động cập nhật
5. Đồng bộ JWT secrets giữa frontend và backend (nếu có thể)

### 2. Kiểm Tra Bảo Mật

Script `security:check` sẽ kiểm tra:

- JWT secrets có sử dụng giá trị mặc định không an toàn không
- Độ dài JWT secrets có đủ dài không (>= 32 ký tự)
- JWT_ACCESS_SECRET và JWT_REFRESH_SECRET có giống nhau không
- JWT secrets có đủ phức tạp không (chứa ký tự đặc biệt, số, chữ cái)
- Đồng bộ giữa frontend và backend

### 3. Tự Động Sửa Lỗi

Script `security:fix` sẽ:

- Tự động tạo JWT secrets mới nếu phát hiện vấn đề
- Đồng bộ JWT secrets giữa frontend và backend
- Cập nhật file environment với JWT secrets an toàn

## Cấu Trúc File

### Backend (.env)
```env
JWT_ACCESS_SECRET=your_64_character_random_secret_here
JWT_REFRESH_SECRET=your_64_character_random_secret_here
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_JWT_ACCESS_SECRET=your_64_character_random_secret_here
NEXT_PUBLIC_JWT_REFRESH_SECRET=your_64_character_random_secret_here
```

## Lưu Ý Bảo Mật

1. **Không commit file .env vào git** - Các file này chứa thông tin nhạy cảm
2. **Sử dụng JWT secrets khác nhau cho môi trường khác nhau** - Development, staging, production
3. **Thay đổi JWT secrets định kỳ** - Đặc biệt trong môi trường production
4. **Giữ JWT secrets đồng bộ** - Frontend và backend phải sử dụng cùng JWT secrets

## Xử Lý Sự Cố

### Lỗi "JWT secrets không an toàn"
```bash
# Chạy lệnh này để tự động sửa
npm run security:fix
```

### Lỗi "JWT secrets không đồng bộ"
```bash
# Đồng bộ từ backend sang frontend
npm run env:sync
```

### Lỗi "File .env không tồn tại"
```bash
# Tạo file .env mới
npm run env:generate
```

## Tích Hợp Vào CI/CD

Để tích hợp vào pipeline CI/CD, thêm các bước sau:

```yaml
# Backend
- name: Check JWT Security
  run: npm run security:check

# Frontend  
- name: Check JWT Security
  run: npm run security:check
```

## Monitoring

Hệ thống sẽ hiển thị các thông báo:

- ✅ JWT secrets đã an toàn
- ⚠️ Cảnh báo về JWT secrets
- ❌ Vấn đề nghiêm trọng với JWT secrets
- 🔄 Đang cập nhật JWT secrets
- 🔍 Đang kiểm tra JWT secrets

## Hỗ Trợ

Nếu gặp vấn đề, hãy chạy:

```bash
# Kiểm tra chi tiết
npm run security:check

# Tự động sửa
npm run security:fix

# Kiểm tra môi trường
npm run startup:check
```
