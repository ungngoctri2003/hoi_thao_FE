# 🔧 Roles Management Debug Guide

## 🎯 **Tình hình hiện tại:**

### ✅ **Đã sửa:**
1. **JSON Parsing Error** - Đã xử lý response 204 No Content
2. **API Error Handling** - Cải thiện xử lý lỗi và thông báo
3. **Authentication Error** - Thêm fallback cho trường hợp chưa đăng nhập
4. **UI/UX** - Thêm màn hình thông báo khi cần đăng nhập

### 🔍 **Lỗi đã được giải quyết:**
- ❌ `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`
- ❌ `401 Unauthorized` - Đã thêm xử lý fallback
- ❌ `500 Internal Server Error` - Đã cải thiện error handling

## 🚀 **Cách test module:**

### **1. Khởi động hệ thống:**
```bash
# Terminal 1 - Backend
cd ../HOI_THAO_BE
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### **2. Test các trường hợp:**

#### **Trường hợp 1: Chưa đăng nhập**
- Truy cập: `http://localhost:3000/roles`
- Kết quả mong đợi: Hiển thị màn hình "Cần đăng nhập"

#### **Trường hợp 2: Đã đăng nhập (admin)**
- Đăng nhập với tài khoản admin
- Truy cập: `http://localhost:3000/roles`
- Kết quả mong đợi: Hiển thị giao diện quản lý roles

#### **Trường hợp 3: Test API trực tiếp**
- Mở file: `test-roles-simple.html`
- Click "Test GET /roles" và "Test GET /permissions"

## 🛠️ **Troubleshooting:**

### **Lỗi 401 Unauthorized:**
```bash
# Kiểm tra token trong localStorage
# Mở DevTools > Application > Local Storage
# Tìm key 'token' hoặc 'accessToken'
```

### **Lỗi 500 Internal Server Error:**
```bash
# Kiểm tra backend logs
cd ../HOI_THAO_BE
npm run dev
# Xem console để tìm lỗi cụ thể
```

### **Lỗi CORS:**
```bash
# Kiểm tra backend CORS config
# File: ../HOI_THAO_BE/src/app.ts
# Đảm bảo có: app.use(cors({ origin: 'http://localhost:3000' }))
```

## 📋 **Checklist test:**

- [ ] Backend chạy trên port 4000
- [ ] Frontend chạy trên port 3000  
- [ ] API `/ping` trả về 200
- [ ] Trang `/roles` load được
- [ ] Hiển thị màn hình đăng nhập khi chưa auth
- [ ] Hiển thị giao diện roles khi đã auth
- [ ] API `/roles` và `/permissions` hoạt động
- [ ] Tạo role mới thành công
- [ ] Phân quyền hoạt động

## 🎯 **Kết quả mong đợi:**

### **Khi chưa đăng nhập:**
```
┌─────────────────────────────────────┐
│  🛡️  Cần đăng nhập                  │
│                                     │
│  Vui lòng đăng nhập với tài khoản   │
│  admin để truy cập tính năng quản   │
│  lý vai trò                         │
│                                     │
│  [Đăng nhập]                        │
└─────────────────────────────────────┘
```

### **Khi đã đăng nhập:**
```
┌─────────────────────────────────────┐
│  👥 Quản lý vai trò                 │
│                                     │
│  [Tạo vai trò] [Thêm người dùng]    │
│                                     │
│  📊 Stats Cards                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│  │Total│ │Admin│ │Staff│ │Active│   │
│  └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│  📋 Tabs: [Người dùng] [Phân quyền] │
└─────────────────────────────────────┘
```

## 🔧 **Files đã sửa:**

1. **lib/api.ts** - Sửa JSON parsing và error handling
2. **components/roles/role-management.tsx** - Thêm auth fallback và error handling
3. **components/roles/permission-matrix.tsx** - Cập nhật props interface
4. **components/roles/create-role-dialog.tsx** - Đã có sẵn

## 📞 **Hỗ trợ:**

Nếu vẫn gặp lỗi, hãy:
1. Kiểm tra console logs trong browser
2. Kiểm tra backend logs
3. Test API endpoints trực tiếp
4. Đảm bảo đã đăng nhập với tài khoản admin
