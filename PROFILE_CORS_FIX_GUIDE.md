# Hướng dẫn khắc phục lỗi CORS khi cập nhật profile

## 🚨 Vấn đề hiện tại
Khi ấn "Lưu thay đổi" trong trang profile, có thể gặp lỗi CORS:
```
Access to fetch at 'http://localhost:4000/api/v1/users/me' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Method PATCH is not allowed by Access-Control-Allow-Methods 
in preflight response.
```

## ✅ Giải pháp đã được implement

### 1. Backend CORS Configuration
Backend đã được cấu hình đúng CORS trong `../HOI_THAO_BE/src/middlewares/cors.ts`:
```typescript
methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // ✅ Có PATCH
allowedHeaders: [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin'
],
```

### 2. Frontend Fallback Mechanism
Frontend đã có fallback mechanism trong `lib/api.ts`:
```typescript
async updateProfile(profileData: UpdateProfileRequest): Promise<UserInfo> {
  try {
    // Try PATCH first
    let userResponse;
    try {
      userResponse = await this.request<any>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      });
    } catch (patchError) {
      const errorMessage = patchError instanceof Error ? patchError.message : String(patchError);
      if (errorMessage.includes('CORS') || errorMessage.includes('PATCH')) {
        console.warn('PATCH method blocked by CORS, trying POST...');
        // Fallback to POST method
        userResponse = await this.request<any>('/users/me', {
          method: 'POST',
          body: JSON.stringify({ ...profileData, _method: 'PATCH' }),
        });
      } else {
        throw patchError;
      }
    }
    // ... rest of the logic
  }
}
```

## 🧪 Cách test và debug

### 1. Sử dụng file test CORS
Mở file `test-profile-cors.html` trong browser để test:

```bash
# Mở file test
open test-profile-cors.html
# hoặc
start test-profile-cors.html
```

### 2. Test các bước sau:
1. **Đăng nhập** với tài khoản admin:
   - Email: `admin@conference.vn`
   - Password: `admin123`

2. **Test PATCH Method**: Kiểm tra xem PATCH có hoạt động không
3. **Test POST Fallback**: Kiểm tra fallback mechanism
4. **Test CORS Headers**: Xem CORS headers có đúng không
5. **Test Profile Update**: Test cập nhật profile thực tế

### 3. Kiểm tra Network Tab
1. Mở Developer Tools (F12)
2. Vào tab Network
3. Thử cập nhật profile
4. Xem:
   - Preflight request (OPTIONS) có thành công không
   - Response headers có đúng CORS headers không
   - PATCH request có bị block không

## 🔧 Troubleshooting

### Nếu vẫn gặp lỗi CORS:

#### 1. Kiểm tra Backend có đang chạy không:
```bash
cd ../HOI_THAO_BE
npm start
```

#### 2. Test CORS với curl:
```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PATCH" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v \
  http://localhost:4000/api/v1/users/me
```

#### 3. Kiểm tra file .env của Backend:
```env
# ../HOI_THAO_BE/.env
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
```

#### 4. Kiểm tra file .env.local của Frontend:
```env
# conference-management-system/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### Nếu PATCH không hoạt động:

#### 1. Backend có thể không hỗ trợ PATCH:
- Kiểm tra route `/users/me` có hỗ trợ PATCH không
- Có thể cần thêm route PATCH trong backend

#### 2. Sử dụng POST fallback:
- Frontend đã có fallback mechanism
- Sẽ tự động chuyển sang POST nếu PATCH bị block

## 📋 Checklist khắc phục

### Backend:
- [ ] ✅ CORS đã cấu hình đúng (có PATCH method)
- [ ] ✅ Backend đang chạy trên port 4000
- [ ] ✅ Route `/users/me` hỗ trợ PATCH
- [ ] ✅ File .env có CORS_ORIGINS đúng

### Frontend:
- [ ] ✅ Fallback mechanism đã implement
- [ ] ✅ File .env.local có NEXT_PUBLIC_API_URL đúng
- [ ] ✅ Error handling cho CORS
- [ ] ✅ Test file đã tạo

## 🚀 Kết quả mong đợi

Sau khi khắc phục:
- ✅ PATCH request hoạt động bình thường (nếu backend hỗ trợ)
- ✅ Nếu PATCH bị block → Tự động fallback sang POST
- ✅ Profile update thành công
- ✅ Avatar được lưu vào database
- ✅ Không còn CORS error

## 🔗 Files liên quan

- `lib/api.ts` - API client với fallback mechanism
- `lib/auth.ts` - Auth service
- `hooks/use-auth.ts` - Auth hook
- `components/profile/Profile.tsx` - Profile component
- `test-profile-cors.html` - Test file
- `../HOI_THAO_BE/src/middlewares/cors.ts` - Backend CORS config

## 📞 Hỗ trợ

Nếu vẫn gặp vấn đề:
1. Chạy test file `test-profile-cors.html`
2. Kiểm tra console logs
3. Kiểm tra Network tab
4. Kiểm tra backend logs
