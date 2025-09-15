# Dashboard API Integration Guide

## Tổng quan

Tài liệu này mô tả việc tích hợp API cho các dashboard trong hệ thống quản lý hội nghị. Tất cả các dashboard (Admin, Staff, Attendee) đã được cập nhật để sử dụng dữ liệu thực tế từ API thay vì dữ liệu tĩnh.

## Các API đã được tích hợp

### 1. Dashboard Overview API

- **Endpoint**: `/analytics/overview`
- **Mô tả**: Cung cấp thống kê tổng quan cho dashboard
- **Dữ liệu trả về**:
  - `totalConferences`: Tổng số hội nghị
  - `totalAttendees`: Tổng số người tham dự
  - `totalCheckIns`: Tổng số check-in
  - `attendanceRate`: Tỷ lệ tham dự
  - `recentActivity`: Hoạt động gần đây
  - `upcomingEvents`: Sự kiện sắp tới

### 2. Realtime Data API

- **Endpoint**: `/analytics/overview`
- **Mô tả**: Cung cấp dữ liệu thời gian thực
- **Dữ liệu trả về**:
  - `checkInsToday`: Check-in hôm nay
  - `checkInsLast24h`: Check-in 24h qua
  - `activeUsers`: Người dùng đang hoạt động
  - `systemAlerts`: Cảnh báo hệ thống

### 3. Conferences API

- **Endpoint**: `/conferences`
- **Mô tả**: Lấy danh sách hội nghị
- **Sử dụng**: Hiển thị sự kiện sắp tới

### 4. Registrations API

- **Endpoint**: `/registrations`
- **Mô tả**: Lấy thông tin đăng ký
- **Sử dụng**: Thống kê đăng ký

## Các Component đã được cập nhật

### 1. AdminDashboard (`components/dashboard/admin-dashboard.tsx`)

- ✅ Tích hợp API thống kê tổng quan
- ✅ Hiển thị dữ liệu thời gian thực
- ✅ Charts với dữ liệu từ API
- ✅ Hoạt động gần đây từ API
- ✅ Cảnh báo hệ thống động

### 2. StaffDashboard (`components/dashboard/staff-dashboard.tsx`)

- ✅ Thống kê check-in hôm nay
- ✅ Dữ liệu thời gian thực
- ✅ Hoạt động gần đây

### 3. AttendeeDashboard (`components/dashboard/attendee-dashboard.tsx`)

- ✅ Sự kiện đã đăng ký
- ✅ Thống kê cá nhân
- ✅ Sự kiện sắp tới

### 4. Charts Components

- ✅ `RealtimeChart`: Dữ liệu check-in thời gian thực
- ✅ `RegistrationChart`: Xu hướng đăng ký
- ✅ `RecentActivity`: Hoạt động gần đây

## Cách sử dụng

### 1. Chạy test API

```bash
node test-dashboard-api.js
```

### 2. Kiểm tra dashboard

1. Đăng nhập với tài khoản admin/staff/attendee
2. Truy cập `/dashboard`
3. Dashboard sẽ tự động load dữ liệu từ API

### 3. Xử lý lỗi

- Nếu API không khả dụng, dashboard sẽ hiển thị dữ liệu mặc định
- Có loading state và error handling
- Nút "Thử lại" để reload dữ liệu

## Cấu trúc API Client

### Các method mới trong `lib/api.ts`:

```typescript
// Dashboard Analytics
getDashboardOverview(): Promise<DashboardData>
getConferenceStats(conferenceId?: number): Promise<ConferenceStats>
getRealtimeData(): Promise<RealtimeData>
getRecentActivity(limit: number): Promise<Activity[]>
getUpcomingEvents(): Promise<Event[]>
getRegistrationTrends(days: number): Promise<TrendData[]>
getAttendanceByEvent(): Promise<AttendanceData[]>
getSystemAlerts(): Promise<Alert[]>
```

## Fallback Data

Tất cả các component đều có dữ liệu fallback để đảm bảo dashboard vẫn hoạt động khi API không khả dụng:

- **Admin Dashboard**: Hiển thị dữ liệu mặc định với thông báo lỗi
- **Staff Dashboard**: Thống kê check-in mặc định
- **Attendee Dashboard**: Danh sách sự kiện mặc định
- **Charts**: Dữ liệu mẫu khi API lỗi

## Lưu ý quan trọng

1. **Authentication**: Tất cả API calls đều yêu cầu token xác thực
2. **Error Handling**: Có xử lý lỗi toàn diện với fallback data
3. **Loading States**: Hiển thị loading spinner khi đang tải dữ liệu
4. **Type Safety**: Sử dụng TypeScript interfaces cho type safety
5. **Performance**: Sử dụng Promise.all cho parallel API calls

## Troubleshooting

### Lỗi thường gặp:

1. **401 Unauthorized**: Kiểm tra token authentication
2. **404 Not Found**: Kiểm tra API endpoints
3. **500 Server Error**: Kiểm tra backend server
4. **Network Error**: Kiểm tra kết nối mạng

### Debug:

1. Mở Developer Tools (F12)
2. Kiểm tra Network tab để xem API calls
3. Kiểm tra Console tab để xem error messages
4. Sử dụng `test-dashboard-api.js` để test API riêng lẻ

## Cập nhật tiếp theo

- [ ] Thêm real-time updates với WebSocket
- [ ] Caching cho performance tốt hơn
- [ ] Pagination cho danh sách dài
- [ ] Export data functionality
- [ ] Advanced filtering và search
