# Tính năng My Events - Quản lý sự kiện theo vai trò

## Tổng quan

Tính năng My Events cho phép người dùng xem và quản lý các hội nghị/sự kiện dựa trên vai trò của họ trong hệ thống.

## Các vai trò và quyền hạn

### 1. Admin (Quản trị viên)

- **Xem**: Tất cả các hội nghị trong hệ thống
- **Tabs**: Tất cả, Bản nháp, Đang diễn ra, Đã hoàn thành, Đã hủy
- **Chức năng**: Quản lý toàn bộ hệ thống hội nghị

### 2. Staff (Nhân viên)

- **Xem**: Các hội nghị được giao quản lý
- **Tabs**: Tất cả, Sắp tới, Đang quản lý, Đã hoàn thành, Đã hủy
- **Chức năng**: Quản lý các hội nghị được giao, xem báo cáo

### 3. Attendee (Người tham dự)

- **Xem**: Các hội nghị đã đăng ký tham dự
- **Tabs**: Tất cả, Sắp tới, Đã đăng ký, Đã tham dự, Đã bỏ lỡ
- **Chức năng**: Xem chi tiết, hủy đăng ký, tải chứng chỉ

## Cấu trúc dữ liệu

### Conference Interface

```typescript
interface Conference {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "draft" | "active" | "completed" | "cancelled";
  maxAttendees: number;
  currentAttendees: number;
  category?: string;
  permissions?: Record<string, boolean>;
  assignmentId?: number;
  assignedAt?: string;
}
```

## API Endpoints sử dụng

### 1. Lấy danh sách hội nghị

- **Endpoint**: `GET /api/v1/conferences`
- **Mô tả**: Lấy tất cả hội nghị (admin) hoặc hội nghị được giao (staff/attendee)

### 2. Lấy assignments của user

- **Endpoint**: `GET /api/v1/user-conference-assignments/my-assignments`
- **Mô tả**: Lấy danh sách hội nghị được giao cho user hiện tại

## Logic phân quyền

### Admin

```typescript
if (user.role === "admin") {
  // Lấy tất cả hội nghị
  const response = await apiClient.getConferences();
  conferencesData = response.data.map((conf) => ({
    // Map conference data
  }));
}
```

### Staff

```typescript
if (user.role === "staff") {
  // Lấy assignments của user
  const assignmentsResponse = await apiClient.getMyAssignments();
  const assignments = assignmentsResponse.data;

  // Lấy thông tin hội nghị từ assignments
  const conferenceIds = assignments.map((a) => a.conferenceId);
  const conferencesResponse = await apiClient.getConferences();
  const allConferences = conferencesResponse.data;

  // Filter và map data
  conferencesData = allConferences
    .filter((conf) => conferenceIds.includes(conf.id))
    .map((conf) => ({
      // Map conference data with assignment info
    }));
}
```

### Attendee

```typescript
// Tương tự như staff nhưng với logic khác
if (user.role === "attendee") {
  // Lấy assignments và filter conferences
}
```

## Trạng thái hội nghị

### Admin

- Sử dụng trạng thái trực tiếp từ database: `draft`, `active`, `completed`, `cancelled`

### Staff

- Dựa trên thời gian và trạng thái hội nghị:
  - `upcoming`: Chưa bắt đầu
  - `managing`: Đang diễn ra
  - `attended`: Đã hoàn thành
  - `missed`: Đã hủy

### Attendee

- Dựa trên thời gian và trạng thái hội nghị:
  - `upcoming`: Chưa bắt đầu
  - `registered`: Đã đăng ký
  - `attended`: Đã tham dự
  - `missed`: Đã bỏ lỡ

## Tính năng tìm kiếm và lọc

- **Tìm kiếm**: Theo tên và mô tả hội nghị
- **Lọc theo danh mục**: Hiển thị các danh mục có sẵn
- **Tabs**: Phân loại theo trạng thái

## Xử lý lỗi

- **Loading state**: Hiển thị spinner khi đang tải dữ liệu
- **Error state**: Hiển thị thông báo lỗi và nút thử lại
- **Empty state**: Thông báo phù hợp với từng vai trò

## Cách sử dụng

1. Đăng nhập với vai trò tương ứng
2. Truy cập trang `/my-events`
3. Hệ thống sẽ tự động hiển thị hội nghị phù hợp với vai trò
4. Sử dụng tìm kiếm và lọc để tìm hội nghị cụ thể
5. Click vào các tab để xem hội nghị theo trạng thái

## Lưu ý

- Cần đảm bảo backend đã có API endpoints tương ứng
- Cần có hệ thống phân quyền hoạt động đúng
- Cần có dữ liệu mẫu để test tính năng
