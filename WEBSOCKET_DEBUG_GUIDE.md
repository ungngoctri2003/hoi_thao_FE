# 🔧 WebSocket Debug Guide

## Vấn đề hiện tại
WebSocket không thể kết nối, hiển thị thông báo "Không thể kết nối WebSocket. Thông báo cập nhật quyền có thể bị trễ."

## ✅ Đã kiểm tra và xác nhận
1. **Backend server đang chạy** trên port 4000
2. **Socket.IO đã được cài đặt** (version 4.8.1)
3. **WebSocket server đã được khởi tạo** và hoạt động
4. **Test script thành công** - WebSocket connection hoạt động tốt

## 🔍 Các bước debug

### 1. Kiểm tra Backend Server
```bash
# Kiểm tra server có đang chạy không
netstat -an | findstr :4000

# Restart backend server
cd ../HOI_THAO_BE
npm run dev
```

### 2. Kiểm tra Frontend
```bash
# Kiểm tra socket.io-client đã được cài đặt
npm list socket.io-client

# Nếu chưa có, cài đặt
npm install socket.io-client@^4.8.1
```

### 3. Test WebSocket Connection
Mở file `test-websocket-connection.html` trong browser để test kết nối trực tiếp.

### 4. Kiểm tra Console Logs
Mở Developer Tools (F12) và kiểm tra:
- Console tab để xem lỗi WebSocket
- Network tab để xem WebSocket connection attempts

### 5. Kiểm tra Environment Variables
Đảm bảo `NEXT_PUBLIC_API_URL` được set đúng:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🛠️ Các giải pháp đã triển khai

### 1. Cập nhật Backend WebSocket Config
- Sửa namespace từ `/ws/messages` thành default namespace
- Thêm CORS support cho localhost:3001
- Cải thiện error handling

### 2. Cập nhật Frontend WebSocket Service
- Thêm timeout và forceNew options
- Cải thiện reconnection logic
- Thêm debug logging

### 3. Thêm Debug Components
- `SimpleWebSocketTest` - Test component đơn giản
- `WebSocketDebug` - Debug panel chi tiết
- `WebSocketStatus` - Status indicator

## 🧪 Test Cases

### Test 1: Basic Connection
```javascript
// Test trong browser console
const socket = io('http://localhost:4000', { path: '/ws' });
socket.on('connect', () => console.log('Connected!'));
```

### Test 2: User Room Join
```javascript
// Sau khi connect thành công
socket.emit('join', 'user:123');
```

### Test 3: Permission Change Event
```javascript
// Test nhận event
socket.on('permission_change', (data) => {
  console.log('Received:', data);
});
```

## 🚨 Troubleshooting

### Lỗi: "Connection refused"
- Kiểm tra backend server có đang chạy không
- Kiểm tra firewall/antivirus blocking port 4000

### Lỗi: "CORS error"
- Kiểm tra CORS config trong backend
- Đảm bảo frontend URL được whitelist

### Lỗi: "Namespace not found"
- Kiểm tra path config: `/ws`
- Đảm bảo frontend và backend sử dụng cùng path

### Lỗi: "Transport error"
- Thử thay đổi transport từ websocket sang polling
- Kiểm tra network connectivity

## 📋 Checklist Debug

- [ ] Backend server đang chạy trên port 4000
- [ ] Socket.IO server đã được khởi tạo
- [ ] Frontend có socket.io-client dependency
- [ ] WebSocket path config đúng (`/ws`)
- [ ] CORS config cho phép frontend origin
- [ ] User đã đăng nhập và có user ID
- [ ] Không có firewall blocking
- [ ] Console không có JavaScript errors

## 🎯 Kết quả mong đợi

Sau khi khắc phục, bạn sẽ thấy:
1. WebSocket status hiển thị "Real-time" (màu xanh)
2. Console log "WebSocket connected"
3. User room được join thành công
4. Thông báo real-time hoạt động khi admin thay đổi role

## 📞 Nếu vẫn không hoạt động

1. Kiểm tra network tab trong DevTools
2. Thử test với file HTML standalone
3. Kiểm tra backend logs
4. Restart cả frontend và backend
5. Clear browser cache và localStorage
