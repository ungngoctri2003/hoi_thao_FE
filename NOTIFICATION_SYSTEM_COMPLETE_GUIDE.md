# 🔔 Hệ Thống Thông Báo Hoàn Chỉnh - Database + Backend + Frontend

## 📋 Tổng quan

Hệ thống thông báo đã được nâng cấp từ hệ thống test đơn giản thành một hệ thống hoàn chỉnh với:
- ✅ **Database**: Lưu trữ thông báo, templates, preferences
- ✅ **Backend API**: RESTful API với đầy đủ tính năng
- ✅ **Frontend**: Components tương tác với database
- ✅ **WebSocket**: Realtime notifications
- ✅ **Admin Panel**: Quản lý thông báo hệ thống

## 🗄️ Database Schema

### Bảng chính
- `notifications` - Lưu trữ thông báo
- `notification_templates` - Templates thông báo
- `notification_preferences` - Tùy chọn người dùng
- `notification_logs` - Log gửi thông báo

### Setup Database
```bash
cd HOI_THAO_BE
# For Oracle Database
node setup-notifications-db-oracle.js

# For MySQL Database (if using MySQL)
node setup-notifications-db.js
```

## 🔧 Backend API

### Endpoints chính

#### User Endpoints
- `GET /api/notifications` - Lấy thông báo của user
- `GET /api/notifications/stats` - Thống kê thông báo
- `PATCH /api/notifications/:id/read` - Đánh dấu đã đọc
- `PATCH /api/notifications/read-all` - Đánh dấu tất cả đã đọc
- `PATCH /api/notifications/:id/archive` - Lưu trữ thông báo
- `DELETE /api/notifications/:id` - Xóa thông báo
- `GET /api/notifications/preferences` - Lấy tùy chọn
- `PATCH /api/notifications/preferences` - Cập nhật tùy chọn

#### Admin Endpoints
- `POST /api/notifications/send/:userId` - Gửi thông báo cá nhân
- `POST /api/notifications/send-template/:userId` - Gửi từ template
- `POST /api/notifications/broadcast` - Broadcast thông báo
- `POST /api/notifications/broadcast-template` - Broadcast từ template
- `POST /api/notifications/cleanup` - Dọn dẹp thông báo hết hạn

## 🎨 Frontend Components

### Components chính
1. **NotificationProvider** - Provider cho WebSocket
2. **NotificationPanel** - Panel hiển thị thông báo
3. **NotificationBell** - Icon chuông với badge
4. **AdminNotificationManager** - Quản lý thông báo cho admin

### Tích hợp vào Layout
```tsx
// app/layout.tsx hoặc main layout
import { NotificationProvider } from '@/components/notifications/notification-provider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

## 🔌 WebSocket Integration

### Events
- `system_notification` - Thông báo hệ thống
- `notification_update` - Cập nhật thông báo
- `notification_stats` - Cập nhật thống kê
- `permission_change` - Thay đổi quyền

### Auto-reconnection
- Tự động kết nối lại khi mất kết nối
- Exponential backoff với tối đa 5 lần thử
- Join room theo user ID

## 🎯 Tính năng chính

### 1. Quản lý thông báo
- ✅ Tạo, đọc, cập nhật, xóa thông báo
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ Lưu trữ thông báo
- ✅ Thông báo có thời hạn
- ✅ Phân loại theo category

### 2. Templates
- ✅ Templates có sẵn (welcome, role_changed, etc.)
- ✅ Thay thế biến động
- ✅ Gửi cá nhân hoặc broadcast

### 3. Admin Panel
- ✅ Gửi thông báo đến user cụ thể
- ✅ Broadcast đến tất cả users
- ✅ Sử dụng templates
- ✅ Dọn dẹp thông báo hết hạn
- ✅ Thống kê hệ thống

### 4. Realtime Features
- ✅ Nhận thông báo realtime
- ✅ Cập nhật trạng thái realtime
- ✅ Thông báo thay đổi quyền
- ✅ Auto-sync với database

## 🚀 Cách sử dụng

### 1. Setup Backend
```bash
cd HOI_THAO_BE
npm install
# For Oracle Database
node setup-notifications-db-oracle.js
# For MySQL Database
# node setup-notifications-db.js
npm run dev
```

### 2. Setup Frontend
```bash
cd conference-management-system
npm install
npm run dev
```

### 3. Sử dụng trong code

#### Gửi thông báo từ backend
```typescript
import { notificationsRepository } from './modules/notifications/notifications.repository';

// Tạo thông báo
await notificationsRepository.create({
  user_id: 1,
  title: "Thông báo mới",
  message: "Nội dung thông báo",
  type: "info",
  category: "system"
});

// Gửi từ template
await notificationsRepository.createFromTemplate({
  user_id: 1,
  template_name: "welcome",
  variables: { user_name: "John Doe" }
});

// Broadcast
await notificationsRepository.broadcast(
  [1, 2, 3], // user IDs
  "Thông báo chung",
  "Nội dung thông báo chung",
  "info"
);
```

#### Sử dụng trong frontend
```typescript
import { useNotificationStore } from '@/lib/notification-service';
import { notificationAPI } from '@/lib/notification-api';

// Lấy thông báo
const { notifications, unreadCount, loadNotifications } = useNotificationStore();

// Load thông báo
await loadNotifications({ limit: 20, is_read: false });

// Đánh dấu đã đọc
await notificationAPI.markAsRead(notificationId);

// Gửi thông báo (admin)
await notificationAPI.sendNotification(userId, {
  title: "Thông báo",
  message: "Nội dung",
  type: "info"
});
```

## 📱 UI/UX Features

### NotificationBell
- Icon chuông với animation
- Badge hiển thị số thông báo chưa đọc
- Click để mở/đóng panel

### NotificationPanel
- Dropdown với scroll
- Filter: Tất cả / Chưa đọc / Đã lưu trữ
- Actions: Đánh dấu đã đọc, Lưu trữ, Xóa
- Loading states
- Empty states

### AdminNotificationManager
- Tabs: Gửi cá nhân, Template, Broadcast, Công cụ
- Form validation
- Real-time feedback
- Statistics dashboard

## 🔒 Security

### Authentication
- Tất cả endpoints yêu cầu JWT token
- Admin endpoints kiểm tra role
- User chỉ có thể truy cập thông báo của mình

### Authorization
- Admin: Gửi thông báo, broadcast, cleanup
- User: Xem, đánh dấu đã đọc, xóa thông báo của mình

## 📊 Performance

### Database
- Indexes trên các trường thường query
- Pagination cho danh sách thông báo
- Cleanup tự động thông báo hết hạn

### Frontend
- Zustand store với persistence
- WebSocket connection pooling
- Lazy loading components
- Optimistic updates

## 🧪 Testing

### Test API
```bash
# Test gửi thông báo
curl -X POST http://localhost:5000/api/notifications/send/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","message":"Test message","type":"info"}'

# Test broadcast
curl -X POST http://localhost:5000/api/notifications/broadcast \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Broadcast","message":"Broadcast message","type":"info"}'
```

### Test WebSocket
```javascript
// Test WebSocket connection
const socket = io('http://localhost:5000', { path: '/ws' });
socket.emit('join', 'user:1');
socket.on('system_notification', (data) => {
  console.log('Received notification:', data);
});
```

## 🎉 Kết quả

Hệ thống thông báo hoàn chỉnh với:
- ✅ **Database persistence** - Thông báo được lưu trữ
- ✅ **RESTful API** - Đầy đủ CRUD operations
- ✅ **Realtime updates** - WebSocket integration
- ✅ **Admin management** - Panel quản lý đầy đủ
- ✅ **User experience** - UI/UX tối ưu
- ✅ **Security** - Authentication & authorization
- ✅ **Performance** - Optimized queries & caching
- ✅ **Scalability** - Ready for production

Hệ thống đã sẵn sàng để sử dụng trong production! 🚀
