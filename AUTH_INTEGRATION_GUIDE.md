# Hướng dẫn tích hợp API Authentication

## Tổng quan

Đã tích hợp thành công các API authentication từ Backend vào Frontend. Hệ thống hiện tại hỗ trợ:

- ✅ Đăng nhập (Login)
- ✅ Đăng ký (Register) 
- ✅ Quên mật khẩu (Forgot Password)
- ✅ Đặt lại mật khẩu (Reset Password)
- ✅ Quản lý trạng thái authentication
- ✅ Bảo vệ routes

## Cấu trúc files đã tạo/cập nhật

### 1. API Client (`lib/api.ts`)
- Quản lý tất cả các API calls
- Xử lý authentication headers
- Quản lý tokens (access & refresh)

### 2. Auth Service (`lib/auth.ts`)
- Quản lý trạng thái authentication
- Xử lý login, register, logout
- Pattern Singleton để đảm bảo consistency

### 3. Auth Hook (`hooks/use-auth.ts`)
- React hook để sử dụng authentication trong components
- Cung cấp trạng thái và methods

### 4. Auth Status Component (`components/auth/auth-status.tsx`)
- Component hiển thị trạng thái đăng nhập
- Nút đăng xuất

### 5. Middleware (`middleware.ts`)
- Bảo vệ các routes cần authentication
- Redirect logic

### 6. Pages đã cập nhật
- `app/login/page.tsx` - Sử dụng API thật
- `app/register/page.tsx` - Tabs cho đăng ký tham dự và tạo tài khoản
- `app/register-simple/page.tsx` - Form đăng ký đơn giản
- `app/forgot-password/page.tsx` - Sử dụng API thật
- `app/reset-password/page.tsx` - Sử dụng API thật
- `app/dashboard/page.tsx` - Hiển thị thông tin user đã đăng nhập

## Cách sử dụng

### 1. Cấu hình Environment

Tạo file `.env.local` trong root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NODE_ENV=development
```

### 2. Sử dụng Auth Hook trong Components

```tsx
import { useAuth } from '@/hooks/use-auth'

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>
  
  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### 3. Bảo vệ Routes

Middleware đã được cấu hình để tự động bảo vệ các routes:
- `/dashboard`
- `/profile`
- `/settings`
- `/conferences`
- `/attendees`
- `/sessions`
- `/badges`
- `/checkin`
- `/networking`
- `/analytics`
- `/audit`
- `/roles`
- `/venue`
- `/my-events`

### 4. API Endpoints được sử dụng

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/refresh` - Refresh token

## Testing

### 1. Khởi động Backend
```bash
cd ../HOI_THAO_BE
npm start
```

### 2. Khởi động Frontend
```bash
npm run dev
```

### 3. Test các chức năng

1. **Đăng ký tài khoản mới:**
   - Truy cập `/register-simple`
   - Điền thông tin và đăng ký

2. **Đăng nhập:**
   - Truy cập `/login`
   - Sử dụng tài khoản đã tạo hoặc demo accounts

3. **Quên mật khẩu:**
   - Truy cập `/forgot-password`
   - Nhập email để nhận token reset

4. **Đặt lại mật khẩu:**
   - Truy cập `/reset-password?token=YOUR_TOKEN`
   - Đặt mật khẩu mới

## Demo Accounts

Hệ thống vẫn hỗ trợ các tài khoản demo:
- Admin: `admin@conference.vn` / `admin123`
- Staff: `staff@conference.vn` / `staff123`
- User: `user@conference.vn` / `user123`

## Lưu ý quan trọng

1. **Backend phải chạy** trên port 4000
2. **CORS** đã được cấu hình ở Backend
3. **JWT tokens** được lưu trong localStorage
4. **Middleware** sẽ redirect về login nếu chưa đăng nhập
5. **Error handling** đã được implement cho tất cả API calls

## Troubleshooting

### Lỗi CORS
- Đảm bảo Backend đang chạy
- Kiểm tra CORS configuration trong Backend

### Lỗi 401 Unauthorized
- Kiểm tra JWT secrets trong Backend
- Đảm bảo token chưa hết hạn

### Lỗi 404 Not Found
- Kiểm tra API URL trong `.env.local`
- Đảm bảo Backend routes đúng

## Tương lai

Có thể mở rộng thêm:
- Role-based access control (RBAC)
- Refresh token tự động
- Social login (Google, Facebook)
- Two-factor authentication (2FA)
- Session management
