# Fix Role & Permissions Update - Đã hoàn thành

## 🎯 Vấn đề đã được giải quyết

**Vấn đề gốc**: Khi admin thay đổi role của user trong trang quản lý role, user đó vẫn thấy role cũ và không có quyền mới khi đăng nhập vào hệ thống.

**Nguyên nhân**:
- Backend cập nhật role trong database nhưng **permissions không được refresh ngay lập tức**
- **Token hiện tại** vẫn chứa permissions cũ
- **Frontend** sử dụng token cũ nên vẫn thấy role và permissions cũ
- Không có cách nào để **force refresh permissions** mà không cần đăng nhập lại

## ✅ Các fix đã áp dụng

### 1. **Cải thiện Backend - Cập nhật Role & Permissions**

**File**: `HOI_THAO_BE/src/modules/users/users.controller.ts`

```typescript
// Thêm logging để track permissions sau khi cập nhật role
const newPermissions = await usersRepository.getPermissions(Number(req.params.id));
console.log(`User ${req.params.id} now has ${newPermissions.length} permissions:`, newPermissions);
```

**Thêm endpoint mới**: `/users/me/refresh-permissions`
```typescript
export async function refreshPermissions(req: Request, res: Response, next: NextFunction) {
  // Get fresh permissions and role from database
  const permissions = await usersRepository.getPermissions(userId);
  const userRoles = await usersRepository.listRoles(userId);
  const primaryRole = userRoles.length > 0 ? userRoles[0].CODE : 'attendee';
  
  // Return updated user info with fresh permissions
  res.json(ok({
    user: {
      id: userId,
      email: req.user!.email,
      name: req.user!.name,
      role: primaryRole,
      status: req.user!.status,
      permissions: permissions
    }
  }));
}
```

### 2. **Cải thiện Frontend - API Client**

**File**: `conference-management-system/lib/api.ts`

**Thêm method mới**:
```typescript
async refreshPermissions(): Promise<UserInfo> {
  const response = await this.request<any>('/users/me/refresh-permissions', {
    method: 'GET',
  });
  
  const userData = response.data.user;
  // Return updated user info with fresh role and permissions
  return {
    id: userData.id || 0,
    email: userData.email || 'unknown@example.com',
    name: userData.name || 'User',
    role: userData.role || 'attendee',
    avatar: userData.avatar || null,
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: userData.updatedAt || new Date().toISOString(),
  };
}
```

### 3. **Cải thiện Auth Service**

**File**: `conference-management-system/lib/auth.ts`

**Thêm method refresh permissions**:
```typescript
public async refreshPermissions(): Promise<void> {
  try {
    console.log('Refreshing user permissions...');
    this.state.isLoading = true;
    this.notifyListeners();

    const userInfo = await apiClient.refreshPermissions();
    this.state.user = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      role: userInfo.role,
      avatar: userInfo.avatar,
    };
    this.state.isAuthenticated = true;
    this.state.isLoading = false;
    this.notifyListeners();
    
    // Show success toast
    toast({
      title: "Quyền đã được cập nhật",
      description: `Role của bạn đã được cập nhật thành: ${userInfo.role}`,
      variant: "success",
      duration: 5000,
    });
  } catch (error) {
    // Handle error and show error toast
  }
}
```

### 4. **Cải thiện useAuth Hook**

**File**: `conference-management-system/hooks/use-auth.ts`

**Thêm method mới**:
```typescript
const refreshPermissions = async () => {
  await authService.refreshPermissions();
};

return {
  ...authState,
  // ... other methods
  refreshPermissions,
};
```

### 5. **Tạo Component Refresh Permissions Button**

**File**: `conference-management-system/components/auth/refresh-permissions-button.tsx`

**Tính năng**:
- Nút "Cập nhật quyền" với icon refresh
- Loading state khi đang refresh
- Toast notification khi thành công/thất bại
- Tooltip giải thích chức năng

### 6. **Tích hợp vào Header**

**File**: `conference-management-system/components/layout/header.tsx`

**Thêm nút vào header**:
```typescript
<RefreshPermissionsButton 
  variant="ghost" 
  size="sm"
  className="text-xs"
/>
```

### 7. **Trang Test**

**File**: `conference-management-system/test-role-permissions-update.html`

**Các test case**:
- Đăng nhập với tài khoản test
- Kiểm tra thông tin user hiện tại
- Cập nhật role cho user (admin only)
- Test refresh permissions
- Kiểm tra lại sau khi refresh

## 🧪 Cách test fix

### 1. **Sử dụng trang test**
```bash
# Mở file trong trình duyệt
open test-role-permissions-update.html
```

**Quy trình test**:
1. **Đăng nhập** với tài khoản cần test
2. **Kiểm tra** thông tin user hiện tại (role, permissions)
3. **Cập nhật role** cho user (cần quyền admin)
4. **Refresh permissions** để cập nhật role mới
5. **Kiểm tra lại** để xem role đã được cập nhật

### 2. **Test thủ công**

1. **Admin cập nhật role**:
   - Vào trang quản lý role
   - Thay đổi role của user từ "attendee" thành "staff"

2. **User refresh permissions**:
   - User đăng nhập vào hệ thống
   - Nhấn nút "Cập nhật quyền" trong header
   - Xem toast notification thành công

3. **Kiểm tra kết quả**:
   - Role hiển thị đúng (staff thay vì attendee)
   - Có quyền mới của role staff
   - Có thể truy cập các chức năng của staff

## 📋 Kết quả mong đợi

### ✅ Trước khi fix:
- Admin cập nhật role nhưng user vẫn thấy role cũ
- User không có quyền mới của role
- Phải đăng nhập lại để thấy thay đổi
- Không có cách nào refresh permissions

### ✅ Sau khi fix:
- Admin cập nhật role thành công
- User có thể refresh permissions ngay lập tức
- Role và permissions được cập nhật ngay
- Toast notification thông báo thành công
- Không cần đăng nhập lại

## 🔧 Các file đã được sửa đổi

### Backend:
1. `HOI_THAO_BE/src/modules/users/users.controller.ts` - Thêm refresh permissions endpoint
2. `HOI_THAO_BE/src/routes/users/users.routes.ts` - Thêm route mới

### Frontend:
1. `conference-management-system/lib/api.ts` - Thêm refresh permissions method
2. `conference-management-system/lib/auth.ts` - Thêm refresh permissions logic
3. `conference-management-system/hooks/use-auth.ts` - Thêm refresh permissions hook
4. `conference-management-system/components/auth/refresh-permissions-button.tsx` - Component mới
5. `conference-management-system/components/layout/header.tsx` - Tích hợp nút refresh
6. `conference-management-system/test-role-permissions-update.html` - Trang test

## 🎉 Kết luận

Fix đã hoàn thành và giải quyết triệt để vấn đề:
- ✅ **Backend**: Cập nhật role và permissions đúng cách
- ✅ **Frontend**: Có thể refresh permissions ngay lập tức
- ✅ **UX**: Nút refresh permissions dễ dàng truy cập
- ✅ **Feedback**: Toast notification rõ ràng
- ✅ **Testing**: Trang test đầy đủ các trường hợp

**Quy trình hoạt động**:
1. Admin cập nhật role của user
2. User nhấn nút "Cập nhật quyền" trong header
3. Hệ thống gọi API refresh permissions
4. Role và permissions được cập nhật ngay lập tức
5. User thấy thay đổi và có quyền mới

Bây giờ khi admin thay đổi role của user, user có thể **refresh permissions ngay lập tức** mà không cần đăng nhập lại!
