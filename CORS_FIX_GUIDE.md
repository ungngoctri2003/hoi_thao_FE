# Hướng dẫn sửa lỗi CORS

## Vấn đề
Lỗi CORS xảy ra khi Frontend (localhost:3000) cố gắng gọi API đến Backend (localhost:4000).

## Giải pháp

### 1. Khởi động Backend
```bash
cd ../HOI_THAO_BE
npm start
```

### 2. Kiểm tra Backend đang chạy
Mở browser và truy cập: `http://localhost:4000/healthz`

Bạn sẽ thấy response:
```json
{"data":{"status":"ok"}}
```

### 3. Tạo file .env cho Backend (nếu chưa có)
Tạo file `.env` trong thư mục `../HOI_THAO_BE/` với nội dung:

```env
# Server Configuration
NODE_ENV=development
PORT=4000

# Database Configuration
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_CONNECT_STRING=localhost:1521/XE

# JWT Configuration
JWT_ACCESS_SECRET=your_super_secret_access_key_here_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001

# Logging
LOG_LEVEL=debug
```

### 3.1. Tạo file .env.local cho Frontend
Tạo file `.env.local` trong thư mục `conference-management-system/` với nội dung:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NODE_ENV=development
```

### 4. Khởi động Frontend
```bash
cd conference-management-system
npm run dev
```

### 5. Test đăng nhập
1. Truy cập `http://localhost:3000/login`
2. Sử dụng tài khoản demo:
   - Email: `admin@conference.vn`
   - Password: `admin123`

## Cấu hình CORS đã được cập nhật

File `../HOI_THAO_BE/src/middlewares/cors.ts` đã được cập nhật để:
- Cho phép tất cả localhost origins trong development
- Log các origin bị block để debug
- Hỗ trợ cả `localhost` và `127.0.0.1`

## Troubleshooting

### Nếu vẫn gặp lỗi CORS:
1. Kiểm tra Backend có đang chạy trên port 4000 không
2. Kiểm tra console của Backend để xem log CORS
3. Thử refresh browser và clear cache
4. Kiểm tra Network tab trong DevTools để xem request headers

### Nếu Backend không khởi động được:
1. Kiểm tra database connection
2. Kiểm tra file `.env` có đúng format không
3. Chạy `npm install` trong thư mục Backend

## Test API trực tiếp

Bạn có thể test API bằng cách chạy:
```bash
node test-api-endpoints.js
```

Script này sẽ test:
- Health endpoint
- Ping endpoint  
- Auth login endpoint
- CORS preflight request

## Kiểm tra API endpoints

Sau khi Backend chạy, bạn có thể test các endpoints:

1. **Health check**: `http://localhost:4000/healthz`
2. **API ping**: `http://localhost:4000/api/v1/ping`
3. **Auth login**: `http://localhost:4000/api/v1/auth/login` (POST)

## Lưu ý quan trọng

- Backend sử dụng `/api/v1` prefix cho tất cả API routes
- Frontend đã được cập nhật để sử dụng đúng URL: `http://localhost:4000/api/v1`
- Đảm bảo tạo file `.env.local` với `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`
