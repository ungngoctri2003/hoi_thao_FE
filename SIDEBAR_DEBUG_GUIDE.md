# 🔍 Hướng dẫn Debug Sidebar - Mục "Quản lý người tham dự" không hiển thị

## 🚨 Vấn đề
Admin không thấy mục "Quản lý người tham dự" trong sidebar sau "Quản lý hội nghị"

## 🔧 Nguyên nhân có thể

### 1. **User Role không đúng**
- `user.role` không phải `'admin'`
- Role được lưu trong localStorage/sessionStorage không đúng format

### 2. **Permissions không đúng**
- Admin không có quyền `attendees.manage`
- Hệ thống permissions chưa được cấu hình đúng

### 3. **Logic Sidebar có vấn đề**
- Logic `getNavigationItems` không hoạt động đúng
- `adminOnly` check bị lỗi

### 4. **CSS ẩn element**
- Element bị ẩn bởi CSS
- Parent element bị ẩn

## 🛠️ Cách Debug

### Bước 1: Kiểm tra Console Logs
Mở Developer Tools (F12) và kiểm tra Console:

```javascript
// Tìm log này:
🔍 Sidebar Debug: {
  currentRole: "admin",
  userRole: "admin", 
  hasAttendeesPermission: true/false,
  itemsCount: 5,
  hasAttendeesItem: true/false,
  allItems: [...]
}
```

**Nếu `hasAttendeesItem: false`** → Vấn đề ở logic sidebar
**Nếu `currentRole !== "admin"`** → Vấn đề ở user role

### Bước 2: Kiểm tra User Role
```javascript
// Trong Console:
console.log('User from localStorage:', localStorage.getItem('user'));
console.log('User from sessionStorage:', sessionStorage.getItem('user'));
console.log('User from cookies:', document.cookie);

// Kiểm tra React state
console.log('React user state:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
```

### Bước 3: Kiểm tra Elements
```javascript
// Tìm element sidebar
const sidebar = document.querySelector('[class*="sidebar"]');
console.log('Sidebar found:', !!sidebar);

// Tìm link attendees
const attendeesLink = sidebar?.querySelector('a[href="/attendees"]');
console.log('Attendees link found:', !!attendeesLink);
console.log('Attendees link visible:', attendeesLink?.offsetParent !== null);
```

### Bước 4: Kiểm tra CSS
```javascript
const attendeesLink = document.querySelector('a[href="/attendees"]');
if (attendeesLink) {
  const style = getComputedStyle(attendeesLink);
  console.log('Display:', style.display);
  console.log('Visibility:', style.visibility);
  console.log('Opacity:', style.opacity);
}
```

## 🔧 Giải pháp

### Giải pháp 1: Đảm bảo Admin luôn có quyền
```typescript
// Trong components/layout/sidebar.tsx
if (item.href === '/attendees' && userRole === 'admin') {
  return true; // Admin luôn có quyền, bỏ qua permission check
}
```

### Giải pháp 2: Debug User Role
```typescript
// Thêm debug log
console.log('🔍 User Debug:', {
  user,
  userRole: user?.role,
  currentRole,
  isAdmin: user?.role === 'admin'
});
```

### Giải pháp 3: Kiểm tra Permissions
```typescript
// Thêm debug log cho permissions
console.log('🔍 Permissions Debug:', {
  hasAttendeesManage: hasPermission('attendees.manage'),
  allPermissions: user?.permissions,
  isAdmin: user?.role === 'admin'
});
```

## 🧪 Test Files

### 1. `test-sidebar-debug.html`
- Test logic sidebar
- Test user role
- Test permissions
- Chạy: Mở file trong browser

### 2. `debug-sidebar-console.js`
- Debug script cho browser
- Chạy: Copy vào Console

### 3. `debug-sidebar-attendees.html`
- Test chi tiết sidebar
- Chạy: Mở file trong browser

## 📋 Checklist Debug

- [ ] Console có log "🔍 Sidebar Debug" không?
- [ ] `currentRole` có phải "admin" không?
- [ ] `hasAttendeesItem` có phải true không?
- [ ] Element `a[href="/attendees"]` có tồn tại không?
- [ ] Element có bị ẩn bởi CSS không?
- [ ] User object có đúng không?
- [ ] Permissions có được load đúng không?

## 🚀 Quick Fix

Nếu vẫn không hoạt động, thử cách này:

```typescript
// Trong getNavigationItems function, thêm ở đầu:
if (item.href === '/attendees' && userRole === 'admin') {
  console.log('✅ Force showing attendees for admin');
  return true;
}
```

## 📞 Hỗ trợ

Nếu vẫn không giải quyết được:
1. Chụp screenshot Console logs
2. Chụp screenshot Elements tab
3. Gửi thông tin user role và permissions
4. Liên hệ team phát triển

---

**Lưu ý**: Debug logs sẽ được tự động xóa trong production build.
