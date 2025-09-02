# Hướng dẫn sử dụng chức năng Đổi mật khẩu

## Tổng quan

Đã thêm thành công chức năng **đổi mật khẩu** vào phần thông tin cá nhân của người dùng.

## ✅ Tính năng đã hoàn thành

### 1. Frontend Components
- ✅ **ChangePassword Component** (`components/auth/change-password.tsx`)
  - Dialog modal đẹp với form đổi mật khẩu
  - Validation mật khẩu mạnh
  - Hiển thị/ẩn mật khẩu
  - Password strength indicator
  - Thông báo thành công/lỗi

### 2. Backend API
- ✅ **Auth Service** (`../HOI_THAO_BE/src/modules/auth/auth.service.ts`)
  - Method `changePassword()` với validation đầy đủ
  - Kiểm tra mật khẩu hiện tại
  - Validation mật khẩu mới
  - Hash và cập nhật mật khẩu

- ✅ **Auth Controller** (`../HOI_THAO_BE/src/modules/auth/auth.controller.ts`)
  - Endpoint `POST /auth/change-password`
  - Xác thực JWT token
  - Xử lý request/response

- ✅ **Auth Routes** (`../HOI_THAO_BE/src/routes/auth/auth.routes.ts`)
  - Route được bảo vệ bởi middleware `authenticate`

### 3. API Integration
- ✅ **API Client** (`lib/api.ts`)
  - Interface `ChangePasswordRequest` và `ChangePasswordResponse`
  - Method `changePassword()`

- ✅ **Auth Service** (`lib/auth.ts`)
  - Method `changePassword()` trong AuthService

- ✅ **Auth Hook** (`hooks/use-auth.ts`)
  - Hook `changePassword()` cho React components

### 4. UI Integration
- ✅ **Profile Page** (`components/profile/Profile.tsx`)
  - Button "Đổi mật khẩu" bên cạnh "Chỉnh sửa thông tin"
  - Icon Lock đẹp mắt
  - Responsive design

## 🎯 Cách sử dụng

### 1. Truy cập chức năng
1. Đăng nhập vào hệ thống
2. Vào trang **Thông tin cá nhân** (Profile)
3. Nhấn nút **"Đổi mật khẩu"** (có icon khóa)

### 2. Quy trình đổi mật khẩu
1. **Nhập mật khẩu hiện tại** - Xác thực danh tính
2. **Nhập mật khẩu mới** - Tối thiểu 6 ký tự, có chữ hoa, thường, số
3. **Xác nhận mật khẩu mới** - Đảm bảo nhập đúng
4. **Nhấn "Cập nhật mật khẩu"** - Hoàn tất

### 3. Validation Rules
- ✅ Mật khẩu hiện tại phải đúng
- ✅ Mật khẩu mới tối thiểu 6 ký tự
- ✅ Mật khẩu mới phải có chữ hoa, thường, số
- ✅ Mật khẩu mới phải khác mật khẩu hiện tại
- ✅ Xác nhận mật khẩu phải khớp

## 🔒 Bảo mật

### 1. Authentication
- ✅ Yêu cầu đăng nhập (JWT token)
- ✅ Xác thực mật khẩu hiện tại
- ✅ User ID được lấy từ JWT token

### 2. Password Security
- ✅ Mật khẩu được hash bằng bcrypt
- ✅ Validation độ mạnh mật khẩu
- ✅ Không cho phép mật khẩu trùng với mật khẩu cũ

### 3. Error Handling
- ✅ Thông báo lỗi chi tiết và thân thiện
- ✅ Không tiết lộ thông tin nhạy cảm
- ✅ Logging đầy đủ cho audit

## 🎨 UI/UX Features

### 1. Visual Design
- ✅ Dialog modal đẹp mắt
- ✅ Icon Lock cho button
- ✅ Password strength indicator
- ✅ Show/hide password toggles
- ✅ Success animation

### 2. User Experience
- ✅ Form validation real-time
- ✅ Loading states
- ✅ Clear error messages
- ✅ Success confirmation
- ✅ Auto-close after success

### 3. Responsive
- ✅ Mobile-friendly
- ✅ Tablet support
- ✅ Desktop optimized

## 🧪 Testing

### 1. Test Cases
```typescript
// Test đổi mật khẩu thành công
await changePassword("oldPassword123", "newPassword456");

// Test mật khẩu hiện tại sai
await changePassword("wrongPassword", "newPassword456");
// Expected: "Mật khẩu hiện tại không đúng"

// Test mật khẩu mới yếu
await changePassword("oldPassword123", "123");
// Expected: "Mật khẩu mới phải có ít nhất 6 ký tự"

// Test mật khẩu trùng
await changePassword("oldPassword123", "oldPassword123");
// Expected: "Mật khẩu mới phải khác mật khẩu hiện tại"
```

### 2. Manual Testing
1. **Test thành công**: Đổi mật khẩu với thông tin đúng
2. **Test mật khẩu sai**: Nhập sai mật khẩu hiện tại
3. **Test validation**: Nhập mật khẩu yếu
4. **Test UI**: Kiểm tra show/hide password, loading states

## 🔧 API Endpoints

### POST /auth/change-password
```typescript
// Request
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}

// Response (Success)
{
  "success": true,
  "data": {
    "changed": true
  }
}

// Response (Error)
{
  "success": false,
  "message": "Current password is incorrect"
}
```

## 📱 Screenshots

### Profile Page
- Button "Đổi mật khẩu" bên cạnh "Chỉnh sửa thông tin"
- Icon Lock đẹp mắt

### Change Password Dialog
- Form với 3 trường: mật khẩu hiện tại, mới, xác nhận
- Password strength indicator
- Show/hide toggles
- Success/error messages

## 🚀 Deployment

### 1. Backend
- ✅ Code đã sẵn sàng deploy
- ✅ Không cần migration database
- ✅ Sử dụng existing user table

### 2. Frontend
- ✅ Component đã tích hợp sẵn
- ✅ Không cần cấu hình thêm
- ✅ Responsive và accessible

## 🎉 Kết luận

Chức năng đổi mật khẩu đã được tích hợp hoàn chỉnh vào hệ thống:

- **Bảo mật cao**: Xác thực đầy đủ, validation mạnh
- **UX tốt**: Giao diện đẹp, thông báo rõ ràng
- **Dễ sử dụng**: Quy trình đơn giản, trực quan
- **Robust**: Xử lý lỗi tốt, logging đầy đủ

Người dùng giờ đây có thể dễ dàng đổi mật khẩu trực tiếp từ trang thông tin cá nhân! 🔐✨
