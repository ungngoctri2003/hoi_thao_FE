# Hướng dẫn sử dụng Messaging Socket Real-time

## Tổng quan

Tính năng messaging socket cho phép 2 users nhắn tin với nhau real-time thông qua WebSocket connection.

## Cài đặt Database

### 1. Kiểm tra database hiện tại

```bash
cd D:\DATN\HOI_THAO_BE
node scripts/check-db-tables.js
```

### 2. Chạy script setup database thông minh (chỉ tạo table chưa có)

```bash
cd D:\DATN\HOI_THAO_BE
node scripts/setup-messaging-smart.js
```

### 3. Hoặc chạy script setup database đầy đủ (nếu cần)

```bash
cd D:\DATN\HOI_THAO_BE
node scripts/setup-messaging-db.js
```

### 4. Kiểm tra tables đã được tạo

- `MESSAGING_SESSIONS`: Lưu trữ các phiên trò chuyện
- `MESSAGING_MESSAGES`: Lưu trữ tin nhắn
- `MESSAGING_USERS`: Theo dõi users trong hệ thống messaging

## Cấu trúc API

### Backend Endpoints

- `POST /api/v1/messaging/conversation/session` - Tạo/lấy session trò chuyện
- `GET /api/v1/messaging/conversation/:sessionId/messages` - Lấy tin nhắn
- `POST /api/v1/messaging/conversation/:sessionId/messages` - Gửi tin nhắn
- `PUT /api/v1/messaging/messages/:messageId/read` - Đánh dấu đã đọc
- `GET /api/v1/messaging/user/:userId/conversations` - Lấy danh sách trò chuyện

### WebSocket Events

#### Client → Server

- `join-conversation` - Tham gia phòng trò chuyện
- `leave-conversation` - Rời khỏi phòng trò chuyện
- `send-message` - Gửi tin nhắn
- `typing` - Báo đang gõ
- `stop-typing` - Báo dừng gõ
- `mark-message-read` - Đánh dấu đã đọc
- `get-conversation-history` - Lấy lịch sử trò chuyện

#### Server → Client

- `joined-conversation` - Xác nhận tham gia
- `left-conversation` - Xác nhận rời khỏi
- `new-message` - Tin nhắn mới
- `message-sent` - Xác nhận gửi tin nhắn
- `user-typing` - User khác đang gõ
- `user-stopped-typing` - User khác dừng gõ
- `message-read` - Tin nhắn đã được đọc
- `conversation-history` - Lịch sử trò chuyện

## Cách sử dụng trong Frontend

### 1. Import WebSocket service

```typescript
import { websocketService } from "@/lib/websocket";
```

### 2. Tham gia trò chuyện

```typescript
websocketService.joinConversation(sessionId, userId);
```

### 3. Gửi tin nhắn

```typescript
websocketService.sendMessage({
  sessionId: 1,
  content: "Hello!",
  type: "text",
  senderId: 1,
  attendeeId: 2,
});
```

### 4. Lắng nghe tin nhắn mới

```typescript
websocketService.on("new-message", (message) => {
  console.log("New message:", message);
  // Cập nhật UI
});
```

### 5. Typing indicator

```typescript
// Bắt đầu gõ
websocketService.setTyping(sessionId, userId, true);

// Dừng gõ
websocketService.stopTyping(sessionId, userId);
```

## Testing

### 1. Chạy backend server

```bash
cd D:\DATN\HOI_THAO_BE
npm run dev
```

### 2. Chạy frontend

```bash
cd D:\DATN\conference-management-system
npm run dev
```

### 3. Test WebSocket

```bash
node test-messaging-socket.js
```

## Tính năng chính

### ✅ Real-time messaging

- Tin nhắn được gửi và nhận ngay lập tức
- Không cần refresh trang

### ✅ Typing indicators

- Hiển thị khi user khác đang gõ
- Animation đẹp mắt

### ✅ Message status

- Đã gửi (✓)
- Đã đọc (✓✓)

### ✅ Conversation management

- Tự động tạo session trò chuyện
- Lưu trữ lịch sử tin nhắn

### ✅ User management

- Thêm/xóa users khỏi hệ thống messaging
- Phân quyền theo role

## Troubleshooting

### Lỗi kết nối WebSocket

1. Kiểm tra backend server đang chạy
2. Kiểm tra CORS settings
3. Kiểm tra authentication token

### Lỗi database

1. Chạy lại script setup database
2. Kiểm tra connection string
3. Kiểm tra quyền user database

### Tin nhắn không hiển thị

1. Kiểm tra WebSocket connection
2. Kiểm tra event listeners
3. Kiểm tra console logs

## Cấu trúc Files

```
Backend:
├── src/sockets/messaging.socket.ts    # Socket handlers
├── src/routes/messaging.routes.ts     # API routes
├── src/database/messaging-tables.sql  # Database schema
└── scripts/setup-messaging-db.js      # Setup script

Frontend:
├── lib/websocket.ts                   # WebSocket service
├── hooks/use-messaging.ts            # Messaging hook
├── app/messaging/page.tsx            # Messaging page
└── lib/api.ts                        # API client
```

## Kết luận

Tính năng messaging socket đã được triển khai hoàn chỉnh với:

- Real-time communication
- Typing indicators
- Message status tracking
- Database persistence
- User management
- Error handling

Bạn có thể sử dụng ngay trong màn hình `/messaging` để nhắn tin giữa 2 users!
