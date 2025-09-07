# 🔔 Hệ Thống Thông Báo Real-time

## ✅ Đã hoàn thành

Hệ thống thông báo real-time đã được triển khai hoàn chỉnh với các tính năng:

### 🎯 Tính năng chính

1. **NotificationBell** - Icon chuông ở header với badge số lượng thông báo chưa đọc
2. **NotificationPanel** - Panel hiển thị danh sách thông báo với các tùy chọn:
   - Xem tất cả thông báo hoặc chỉ thông báo chưa đọc
   - Đánh dấu đã đọc / chưa đọc
   - Xóa thông báo
   - Xóa tất cả thông báo
3. **Real-time notifications** - Nhận thông báo qua WebSocket
4. **Admin panel** - Gửi thông báo đến user cụ thể hoặc tất cả users

### 🔧 Các loại thông báo

- **Info** - Thông tin hệ thống (màu xanh)
- **Success** - Thành công (màu xanh lá)
- **Warning** - Cảnh báo (màu vàng)
- **Error** - Lỗi (màu đỏ)

### 📡 WebSocket Integration

- **Permission changes** - Thông báo khi role/permission thay đổi
- **System notifications** - Thông báo từ admin
- **Auto-refresh** - Tự động cập nhật permissions

## 🧪 Cách test hệ thống

### 1. Test cơ bản
- Đăng nhập vào hệ thống
- Click vào icon chuông ở header
- Sử dụng "NotificationTest" component để tạo thông báo mẫu

### 2. Test real-time
- Mở 2 tabs với 2 tài khoản khác nhau
- Tab 1: User thường
- Tab 2: Admin user
- Từ admin tab, sử dụng "AdminNotificationSender" để gửi thông báo
- Quan sát thông báo xuất hiện ở tab user thường

### 3. Test permission changes
- Admin thay đổi role của user
- User sẽ nhận thông báo real-time về việc thay đổi role

## 🎮 Các component test

### NotificationTest
- Test các loại thông báo khác nhau
- Test permission change notification
- Test system message

### AdminNotificationSender (chỉ admin)
- Gửi thông báo đến user cụ thể
- Gửi thông báo đến tất cả users
- Chọn loại thông báo (info, success, warning, error)

### SimpleWebSocketTest
- Test kết nối WebSocket
- Xem logs kết nối
- Test room joining

## 🔌 API Endpoints

### Gửi thông báo đến user cụ thể
```
POST /api/notifications/send/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tiêu đề thông báo",
  "message": "Nội dung thông báo",
  "type": "info" // info, success, warning, error
}
```

### Gửi thông báo đến tất cả users
```
POST /api/notifications/broadcast
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tiêu đề thông báo",
  "message": "Nội dung thông báo",
  "type": "info"
}
```

## 🎨 UI/UX Features

### NotificationBell
- Icon chuông với animation khi có thông báo mới
- Badge hiển thị số lượng thông báo chưa đọc
- Click để mở/đóng panel

### NotificationPanel
- Dropdown panel với scroll
- Filter: Tất cả / Chưa đọc
- Actions: Đánh dấu đã đọc, Xóa, Xóa tất cả
- Timestamp hiển thị thời gian tương đối
- Icons theo loại thông báo

### Auto-cleanup
- Thông báo tự động xóa sau 10 giây (trừ error)
- Thông báo error cần xóa thủ công

## 🚀 Cách sử dụng trong code

### Thêm thông báo
```typescript
import { notificationService } from '@/lib/notification-service';

// Thông báo thành công
notificationService.success("Hoàn thành!", "Nhiệm vụ đã được hoàn thành");

// Thông báo lỗi
notificationService.error("Lỗi!", "Có lỗi xảy ra");

// Thông báo permission change
notificationService.permissionChanged('attendee', 'staff');

// Thông báo hệ thống
notificationService.systemMessage("Thông báo", "Nội dung thông báo");
```

### Sử dụng store
```typescript
import { useNotificationStore } from '@/lib/notification-service';

const { notifications, unreadCount, markAsRead } = useNotificationStore();
```

## 🎯 Kết quả

- ✅ **Real-time notifications** hoạt động hoàn hảo
- ✅ **WebSocket integration** với permission changes
- ✅ **Admin panel** để gửi thông báo
- ✅ **Beautiful UI** với animations và interactions
- ✅ **Auto-cleanup** và management features
- ✅ **Toast notifications** kết hợp với notification panel

Hệ thống thông báo đã sẵn sàng sử dụng! 🎉
