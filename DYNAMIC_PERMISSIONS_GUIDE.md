# Hướng dẫn Hệ thống Permissions Động

## Vấn đề đã giải quyết
Trước đây, sidebar và các component khác sử dụng hardcode roles (`["admin", "staff", "attendee"]`) để xác định quyền truy cập. Điều này có nghĩa là khi admin thay đổi phân quyền trong màn hình role, giao diện không cập nhật theo.

## Giải pháp mới: Permissions Động

### 1. Hook `usePermissions`
Tạo hook mới để quản lý permissions động:

```typescript
// hooks/use-permissions.ts
export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
}
```

### 2. Cấu trúc Permission
Mỗi permission có cấu trúc:
```typescript
interface Permission {
  id: number;
  code: string;        // VD: "conferences.view", "conferences.create"
  name: string;        // VD: "Xem Hội nghị", "Tạo Hội nghị"
  description?: string;
}
```

### 3. Navigation Items với Permissions
Thay vì hardcode roles, sử dụng permission codes:

```typescript
// Trước (hardcode)
{ 
  href: "/conferences", 
  allowedRoles: ["admin", "staff"]  // ❌ Hardcode
}

// Sau (dynamic)
{ 
  href: "/conferences", 
  requiredPermissions: ["conferences.view"]  // ✅ Dynamic
}
```

## Cách hoạt động

### 1. Lấy Permissions từ API
```typescript
// API trả về permissions của user
const userInfo = await apiClient.getCurrentUser();
// userInfo.permissions = [
//   { id: 1, code: "conferences.view", name: "Xem Hội nghị" },
//   { id: 2, code: "conferences.create", name: "Tạo Hội nghị" },
//   ...
// ]
```

### 2. Kiểm tra Permission
```typescript
// Sidebar kiểm tra permission
const items = allNavigationItems.filter(item => 
  item.requiredPermissions.every(permission => hasPermission(permission))
);
```

### 3. Cập nhật Real-time
Khi admin thay đổi phân quyền:
1. User nhấn "Cập nhật quyền"
2. API gọi `/users/me/refresh-permissions`
3. Permissions được cập nhật
4. Sidebar tự động re-render với menu mới

## Permission Codes

### Conferences (Hội nghị)
- `conferences.view` - Xem danh sách hội nghị
- `conferences.create` - Tạo hội nghị mới
- `conferences.update` - Cập nhật hội nghị
- `conferences.delete` - Xóa hội nghị

### Attendees (Người tham dự)
- `attendees.view` - Xem danh sách người tham dự
- `attendees.manage` - Quản lý người tham dự

### Check-in
- `checkin.manage` - Quản lý check-in QR

### Roles & Permissions
- `roles.manage` - Quản lý phân quyền

### System
- `audit.view` - Xem nhật ký hệ thống
- `settings.manage` - Quản lý cài đặt
- `analytics.view` - Xem phân tích AI

### Features
- `dashboard.view` - Xem dashboard
- `profile.view` - Xem profile
- `networking.view` - Xem kết nối mạng
- `venue.view` - Xem bản đồ địa điểm
- `sessions.view` - Xem phiên trực tiếp
- `badges.view` - Xem huy hiệu
- `mobile.view` - Xem ứng dụng di động
- `my-events.view` - Xem sự kiện của tôi

## Fallback System

Nếu API không trả về permissions, hệ thống sẽ fallback về role-based permissions:

```typescript
// Fallback permissions based on role
function getRoleBasedPermissions(role: "admin" | "staff" | "attendee"): Permission[] {
  switch (role) {
    case 'admin':
      return allPermissions; // Tất cả permissions
    case 'staff':
      return staffPermissions; // Permissions cơ bản
    case 'attendee':
      return attendeePermissions; // Permissions tối thiểu
  }
}
```

## Lợi ích

### 1. **Flexibility**
- Admin có thể tùy chỉnh quyền cho từng user
- Không bị giới hạn bởi 3 roles cố định
- Có thể tạo custom permissions

### 2. **Real-time Updates**
- Giao diện cập nhật ngay khi phân quyền thay đổi
- Không cần refresh trang
- User experience tốt hơn

### 3. **Scalability**
- Dễ dàng thêm permissions mới
- Có thể mở rộng cho nhiều modules khác
- Hỗ trợ fine-grained permissions

### 4. **Security**
- Permissions được kiểm tra từ server
- Không thể bypass từ client
- Audit trail rõ ràng

## Cách sử dụng

### 1. Thêm Menu Item mới
```typescript
{
  href: "/new-feature",
  icon: NewIcon,
  label: "Tính năng mới",
  requiredPermissions: ["new-feature.view"], // Chỉ định permission cần thiết
  description: "Mô tả tính năng"
}
```

### 2. Kiểm tra Permission trong Component
```typescript
function MyComponent() {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission("conferences.create")) {
    return <div>Bạn không có quyền tạo hội nghị</div>;
  }
  
  return <CreateConferenceForm />;
}
```

### 3. Sử dụng trong RoleGuard
```typescript
<RoleGuard allowedPermissions={["conferences.view", "conferences.create"]}>
  <ConferenceManagement />
</RoleGuard>
```

## Troubleshooting

### Nếu menu không hiển thị:
1. Kiểm tra permission code có đúng không
2. Kiểm tra user có permission đó không
3. Kiểm tra API có trả về permissions không

### Nếu permissions không cập nhật:
1. Nhấn nút "Cập nhật quyền" trong header
2. Kiểm tra console để xem lỗi API
3. Kiểm tra network tab để xem request/response

### Nếu fallback không hoạt động:
1. Kiểm tra role của user
2. Kiểm tra `getRoleBasedPermissions` function
3. Kiểm tra console logs

## Tương lai

1. **Permission Groups**: Nhóm permissions theo module
2. **Conditional Permissions**: Permissions có điều kiện
3. **Permission Inheritance**: Permissions kế thừa
4. **Permission Templates**: Template permissions cho roles
5. **Real-time Notifications**: Thông báo khi permissions thay đổi




