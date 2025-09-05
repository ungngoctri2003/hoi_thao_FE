# Hệ thống Phân quyền Dựa trên Hội nghị

## Tổng quan

Hệ thống phân quyền dựa trên hội nghị cho phép quản trị viên phân quyền cho người dùng cụ thể cho từng hội nghị riêng biệt. Người dùng chỉ có thể truy cập vào các tính năng mà họ được phân quyền cho hội nghị hiện tại.

## Các thành phần chính

### 1. Conference Permission Hook (`useConferencePermissions`)

Hook này quản lý quyền truy cập dựa trên hội nghị:

```typescript
const {
  conferencePermissions,        // Danh sách tất cả hội nghị được phân quyền
  currentConferenceId,         // ID hội nghị hiện tại
  hasConferencePermission,     // Kiểm tra quyền cho hội nghị cụ thể
  hasAnyConferencePermission,  // Kiểm tra quyền cho bất kỳ hội nghị nào
  hasAllConferencePermission,  // Kiểm tra quyền cho tất cả hội nghị
  getCurrentConferencePermissions, // Lấy quyền của hội nghị hiện tại
  switchConference,            // Chuyển đổi hội nghị
  getAvailableConferences,     // Lấy danh sách hội nghị có sẵn
} = useConferencePermissions()
```

### 2. Conference Permission Guard (`ConferencePermissionGuard`)

Component bảo vệ route dựa trên quyền hội nghị:

```tsx
<ConferencePermissionGuard 
  requiredPermissions={['conferences.view', 'attendees.manage']}
  conferenceId={123} // Optional: kiểm tra cho hội nghị cụ thể
  fallbackPath="/dashboard"
>
  <YourComponent />
</ConferencePermissionGuard>
```

### 3. Conference Selector (`ConferenceSelector`)

Component cho phép người dùng chọn hội nghị:

```tsx
<ConferenceSelector 
  variant="dropdown" // hoặc "select"
  showPermissions={true} // Hiển thị số quyền
/>
```

## Cách sử dụng

### 1. Bảo vệ trang

```tsx
// app/conferences/page.tsx
import { ConferenceViewGuard } from "@/components/auth/conference-permission-guard"

export default function ConferencesPage() {
  return (
    <ConferenceViewGuard>
      <MainLayout>
        <ConferenceManagement />
      </MainLayout>
    </ConferenceViewGuard>
  )
}
```

### 2. Bảo vệ component

```tsx
import { AttendeeManageGuard } from "@/components/auth/conference-permission-guard"

function AttendeeSection() {
  return (
    <AttendeeManageGuard>
      <AttendeeManagement />
    </AttendeeManageGuard>
  )
}
```

### 3. Kiểm tra quyền trong component

```tsx
import { useConferencePermissions } from "@/hooks/use-conference-permissions"

function MyComponent() {
  const { hasConferencePermission, currentConferenceId } = useConferencePermissions()
  
  const canManageAttendees = hasConferencePermission('attendees.manage')
  
  return (
    <div>
      {canManageAttendees && (
        <Button>Quản lý người tham dự</Button>
      )}
    </div>
  )
}
```

### 4. Cập nhật Sidebar

Sidebar tự động hiển thị menu dựa trên quyền hội nghị:

```tsx
// components/layout/sidebar.tsx
const { hasConferencePermission } = useConferencePermissions()

// Menu chỉ hiển thị nếu user có quyền cho hội nghị hiện tại
const items = getNavigationItems(hasPermission, hasConferencePermission)
```

## Các loại quyền

### Quyền cơ bản (Role-based)
- `dashboard.view` - Xem dashboard
- `profile.view` - Xem profile
- `settings.manage` - Quản lý cài đặt

### Quyền hội nghị (Conference-based)
- `conferences.view` - Xem hội nghị
- `conferences.create` - Tạo hội nghị
- `conferences.update` - Cập nhật hội nghị
- `conferences.delete` - Xóa hội nghị
- `attendees.view` - Xem người tham dự
- `attendees.manage` - Quản lý người tham dự
- `checkin.manage` - Quản lý check-in
- `networking.view` - Xem kết nối mạng
- `venue.view` - Xem bản đồ
- `sessions.view` - Xem phiên trực tiếp
- `badges.view` - Xem huy hiệu
- `analytics.view` - Xem phân tích
- `my-events.view` - Xem sự kiện của tôi

## Luồng hoạt động

1. **Đăng nhập**: User đăng nhập và xác thực
2. **Tải quyền**: Hệ thống tải danh sách hội nghị được phân quyền
3. **Chọn hội nghị**: User chọn hội nghị từ danh sách có sẵn
4. **Kiểm tra quyền**: Mỗi trang/component kiểm tra quyền cho hội nghị hiện tại
5. **Hiển thị UI**: Chỉ hiển thị các tính năng mà user có quyền

## Cấu trúc dữ liệu

### UserConferenceAssignment
```typescript
interface UserConferenceAssignment {
  id: number
  userId: number
  conferenceId: number
  permissions: Record<string, boolean> // Quyền cho hội nghị này
  assignedBy: number
  assignedAt: string
  isActive: number // 1 = hoạt động, 0 = không hoạt động
  conferenceName?: string
  userName?: string
  userEmail?: string
}
```

### ConferencePermission
```typescript
interface ConferencePermission {
  conferenceId: number
  conferenceName: string
  permissions: Record<string, boolean>
  isActive: boolean
}
```

## Test hệ thống

Truy cập `/test-conference-permissions` để:
- Xem danh sách hội nghị được phân quyền
- Kiểm tra quyền cho từng hội nghị
- Test chuyển đổi giữa các hội nghị
- Debug thông tin phân quyền

## Lưu ý quan trọng

1. **Fallback**: Nếu không có quyền hội nghị, hệ thống sẽ fallback về quyền role-based
2. **Performance**: Quyền được cache và chỉ reload khi cần thiết
3. **Security**: Tất cả kiểm tra quyền đều được thực hiện ở cả frontend và backend
4. **UX**: User được thông báo rõ ràng khi không có quyền truy cập

## Troubleshooting

### User không thấy menu
- Kiểm tra xem user có được phân quyền cho hội nghị nào không
- Kiểm tra `isActive` của assignment
- Kiểm tra quyền cơ bản (role-based)

### Không thể chuyển hội nghị
- Kiểm tra `hasConferenceAccess(conferenceId)`
- Kiểm tra `isActive` của assignment

### Quyền không cập nhật
- Gọi `refreshPermissions()` để reload quyền
- Kiểm tra backend API có trả về đúng dữ liệu không
