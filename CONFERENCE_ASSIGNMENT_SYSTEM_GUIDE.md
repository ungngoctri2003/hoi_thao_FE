# Hệ thống Phân quyền theo Hội nghị

## Tổng quan

Hệ thống phân quyền theo hội nghị cho phép admin quản lý từng nhân viên cụ thể, giao cho họ quyền quản lý một số hội nghị nhất định thay vì quản lý tất cả hội nghị.

## Tính năng chính

### 1. Giao hội nghị cho nhân viên
- Admin có thể chọn nhân viên (staff) và giao cho họ quyền quản lý các hội nghị cụ thể
- Mỗi nhân viên chỉ có thể truy cập và quản lý những hội nghị được giao
- Có thể giao nhiều hội nghị cùng lúc cho một nhân viên

### 2. Phân quyền chi tiết
- Mỗi hội nghị được giao có thể có các quyền khác nhau:
  - `conferences.view`: Xem thông tin hội nghị
  - `conferences.update`: Cập nhật thông tin hội nghị
  - `attendees.view`: Xem danh sách người tham dự
  - `attendees.manage`: Quản lý người tham dự
  - `checkin.manage`: Quản lý check-in/check-out
  - `sessions.view`: Xem danh sách phiên họp
  - `sessions.manage`: Quản lý phiên họp
  - `analytics.view`: Xem báo cáo thống kê

### 3. Quản lý tập trung
- Tất cả được quản lý trong trang "Quản lý vai trò"
- Tab mới "Giao hội nghị" để quản lý phân quyền
- Có thể xem, chỉnh sửa, vô hiệu hóa hoặc xóa phân quyền

## Cách sử dụng

### 1. Giao hội nghị cho nhân viên

1. Truy cập trang "Quản lý vai trò"
2. Chuyển sang tab "Người dùng"
3. Tìm nhân viên cần giao hội nghị (chỉ nhân viên có role "staff")
4. Click vào menu "..." và chọn "Giao hội nghị"
5. Trong dialog:
   - Chọn các hội nghị cần giao
   - Cấu hình quyền cho từng hội nghị
   - Click "Lưu phân quyền"

### 2. Quản lý phân quyền

1. Truy cập tab "Giao hội nghị"
2. Xem danh sách tất cả phân quyền đã giao
3. Sử dụng bộ lọc để tìm kiếm theo:
   - Tên hội nghị
   - Tên người dùng
   - Trạng thái (hoạt động/không hoạt động)
4. Thực hiện các thao tác:
   - Chỉnh sửa quyền
   - Vô hiệu hóa phân quyền
   - Xóa phân quyền

### 3. Kiểm tra quyền truy cập

Hệ thống tự động kiểm tra quyền truy cập khi:
- Nhân viên truy cập thông tin hội nghị
- Thực hiện các thao tác quản lý
- Xem danh sách người tham dự
- Quản lý check-in

## Cấu trúc Database

### Bảng `user_conference_assignments`
```sql
- id: ID phân quyền
- user_id: ID người dùng (staff)
- conference_id: ID hội nghị
- permissions: JSON chứa các quyền cụ thể
- assigned_by: ID admin giao quyền
- assigned_at: Thời gian giao quyền
- is_active: Trạng thái (1: hoạt động, 0: không hoạt động)
- created_at: Thời gian tạo
- updated_at: Thời gian cập nhật
```

## API Endpoints

### Quản lý phân quyền
- `GET /api/v1/user-conference-assignments` - Lấy danh sách phân quyền
- `POST /api/v1/user-conference-assignments` - Tạo phân quyền mới
- `POST /api/v1/user-conference-assignments/bulk-assign` - Giao nhiều hội nghị cùng lúc
- `PATCH /api/v1/user-conference-assignments/:id` - Cập nhật phân quyền
- `DELETE /api/v1/user-conference-assignments/:id` - Xóa phân quyền

### Kiểm tra quyền
- `GET /api/v1/user-conference-assignments/check/:userId/:conferenceId/:permission` - Kiểm tra quyền cụ thể
- `GET /api/v1/user-conference-assignments/permissions/:userId` - Lấy tất cả quyền của user

## Middleware

### Conference RBAC
- `conferenceRBAC(permission, conferenceIdParam)` - Kiểm tra quyền cụ thể cho hội nghị
- `conferenceRBACAny(permissions, conferenceIdParam)` - Kiểm tra bất kỳ quyền nào trong danh sách

### Sử dụng trong routes
```typescript
// Kiểm tra quyền xem hội nghị
router.get('/conferences/:conferenceId', 
  auth(), 
  conferenceRBAC('conferences.view'), 
  controller.getConference
);

// Kiểm tra quyền quản lý người tham dự
router.get('/conferences/:conferenceId/attendees', 
  auth(), 
  conferenceRBACAny(['attendees.view', 'attendees.manage']), 
  controller.getAttendees
);
```

## Lưu ý quan trọng

1. **Chỉ nhân viên (staff)** mới có thể được giao quyền quản lý hội nghị
2. **Admin** có quyền truy cập tất cả hội nghị và không bị giới hạn
3. **Attendee** không thể được giao quyền quản lý hội nghị
4. Mỗi nhân viên có thể được giao nhiều hội nghị với quyền khác nhau
5. Phân quyền có thể được vô hiệu hóa (soft delete) hoặc xóa hoàn toàn

## Migration

Để cài đặt hệ thống mới:

1. Chạy migration database:
```bash
node run-conference-assignments-migration.js
```

2. Khởi động lại backend server

3. Truy cập frontend và sử dụng tính năng mới

## Troubleshooting

### Lỗi thường gặp

1. **"User not found"**: Đảm bảo user tồn tại và có role "staff"
2. **"Conference not found"**: Đảm bảo conference tồn tại trong hệ thống
3. **"Access denied"**: Kiểm tra quyền truy cập hội nghị của user
4. **"Assignment already exists"**: User đã được giao quyền cho hội nghị này

### Debug

1. Kiểm tra logs backend để xem chi tiết lỗi
2. Sử dụng API debug để kiểm tra quyền user
3. Xem database để kiểm tra dữ liệu phân quyền
