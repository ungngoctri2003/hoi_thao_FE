# Hướng dẫn sử dụng Frontend Audit Logging

## Tổng quan

Hệ thống Frontend Audit Logging cho phép theo dõi các hành động của người dùng trên giao diện frontend, bao gồm:
- Truy cập trang
- Các thao tác CRUD (Tạo, Xem, Cập nhật, Xóa)
- Đăng ký tham dự
- Check-in/Check-out
- Xuất/Nhập dữ liệu
- Tìm kiếm/Lọc
- Thay đổi cài đặt
- Cập nhật hồ sơ

## Cách sử dụng

### 1. Import hook

```typescript
import { useFrontendAudit } from "@/hooks/use-frontend-audit"
```

### 2. Sử dụng trong component

```typescript
function MyComponent() {
  const { actions } = useFrontendAudit()

  const handleCreate = () => {
    // Log action
    actions.create('người tham dự', 'Quản lý người tham dự')
    
    // ... rest of your logic
  }

  const handleLogin = () => {
    // Log action
    actions.login()
    
    // ... rest of your logic
  }

  return (
    <div>
      <button onClick={handleCreate}>Tạo mới</button>
      <button onClick={handleLogin}>Đăng nhập</button>
    </div>
  )
}
```

### 3. Các action có sẵn

#### Navigation
```typescript
actions.navigate('Tên trang') // Truy cập trang
```

#### Authentication
```typescript
actions.login() // Đăng nhập
actions.logout() // Đăng xuất
```

#### CRUD Operations
```typescript
actions.create('loại item', 'tên trang') // Tạo mới
actions.read('loại item', 'tên trang') // Xem
actions.update('loại item', 'tên trang') // Cập nhật
actions.delete('loại item', 'tên trang') // Xóa
```

#### Registration
```typescript
actions.register('Tên hội nghị') // Đăng ký tham dự
actions.unregister('Tên hội nghị') // Hủy đăng ký
```

#### Check-in/Check-out
```typescript
actions.checkin('Tên hội nghị') // Check-in
actions.checkout('Tên hội nghị') // Check-out
```

#### Data Export/Import
```typescript
actions.export('loại dữ liệu', 'tên trang') // Xuất dữ liệu
actions.import('loại dữ liệu', 'tên trang') // Nhập dữ liệu
```

#### Search/Filter
```typescript
actions.search('từ khóa tìm kiếm', 'tên trang') // Tìm kiếm
actions.filter('loại lọc', 'tên trang') // Lọc
```

#### Settings
```typescript
actions.settingsChange('loại cài đặt') // Thay đổi cài đặt
```

#### Profile
```typescript
actions.profileUpdate() // Cập nhật hồ sơ
```

#### File Operations
```typescript
actions.upload('loại file', 'tên trang') // Tải lên
actions.download('loại file', 'tên trang') // Tải xuống
```

#### Custom Action
```typescript
actions.custom('hành động tùy chỉnh', 'tên trang', 'chi tiết') // Hành động tùy chỉnh
```

### 4. Tự động log navigation

Để tự động log khi người dùng chuyển trang, sử dụng `AuditWrapper`:

```typescript
import { AuditWrapper } from "@/components/audit/audit-wrapper"

function App() {
  return (
    <AuditWrapper>
      {/* Your app content */}
    </AuditWrapper>
  )
}
```

### 5. Xem logs

Frontend audit logs sẽ xuất hiện trong màn hình "Nhật ký hệ thống" với:
- Category: "Giao diện" (màu hồng)
- Action: Tên hành động
- Resource: "frontend"
- Details: Thông tin trang và chi tiết

## Ví dụ thực tế

### Trong component Attendees

```typescript
import { useFrontendAudit } from "@/hooks/use-frontend-audit"

function AttendeesPage() {
  const { actions } = useFrontendAudit()

  const handleCreateAttendee = async (data) => {
    try {
      // Log action
      actions.create('người tham dự', 'Quản lý người tham dự')
      
      // Create attendee
      await createAttendee(data)
      
      // Show success message
      toast.success('Tạo người tham dự thành công')
    } catch (error) {
      // Handle error
    }
  }

  const handleSearch = (searchTerm) => {
    // Log action
    actions.search(searchTerm, 'Quản lý người tham dự')
    
    // Perform search
    setSearchTerm(searchTerm)
  }

  const handleExport = () => {
    // Log action
    actions.export('danh sách người tham dự', 'Quản lý người tham dự')
    
    // Export data
    exportAttendees()
  }

  return (
    <div>
      {/* Your component JSX */}
    </div>
  )
}
```

### Trong component Check-in

```typescript
import { useFrontendAudit } from "@/hooks/use-frontend-audit"

function CheckinPage() {
  const { actions } = useFrontendAudit()

  const handleCheckin = async (attendeeId) => {
    try {
      // Log action
      actions.checkin('Hội nghị Công nghệ 2024')
      
      // Perform checkin
      await checkinAttendee(attendeeId)
      
      // Show success message
      toast.success('Check-in thành công')
    } catch (error) {
      // Handle error
    }
  }

  return (
    <div>
      {/* Your component JSX */}
    </div>
  )
}
```

## Lưu ý

1. **Performance**: Hệ thống được thiết kế để không ảnh hưởng đến performance của ứng dụng
2. **Error Handling**: Nếu việc gửi log thất bại, hệ thống sẽ ghi log warning vào console nhưng không làm gián đoạn flow chính
3. **Privacy**: Chỉ log các hành động công khai, không log thông tin nhạy cảm
4. **Storage**: Logs được lưu trong bảng `AUDIT_LOGS` hiện có với category `frontend`

## Troubleshooting

### Logs không xuất hiện
1. Kiểm tra xem user đã đăng nhập chưa
2. Kiểm tra network connection
3. Kiểm tra console để xem có lỗi gì không

### Logs bị duplicate
1. Đảm bảo không gọi `actions.logAction` trực tiếp
2. Sử dụng các helper functions có sẵn

### Performance issues
1. Kiểm tra xem có gọi quá nhiều log actions không
2. Sử dụng `setEnabled(false)` để tắt logging tạm thời nếu cần
