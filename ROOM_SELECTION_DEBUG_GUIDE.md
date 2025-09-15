# Hướng dẫn Debug Room Selection

## Vấn đề hiện tại

Danh sách phòng không hiển thị trong dropdown khi tạo phiên.

## Các bước debug

### 1. Kiểm tra Console Logs

Mở Developer Tools (F12) và kiểm tra console để xem:

- `Loading rooms for conference: X` - Có gọi API không
- `Rooms response: {...}` - API trả về gì
- `Rooms data: [...]` - Dữ liệu thô
- `Formatted rooms: [...]` - Dữ liệu đã format

### 2. Kiểm tra Debug Panel

Trong development mode, sẽ có debug panel hiển thị:

- Rooms loaded: X
- Conferences loaded: Y
- Selected conference: Z
- Available rooms: [danh sách]

### 3. Kiểm tra API Backend

Chạy test API:

```bash
node test-room-selection-debug.html
```

Hoặc test trực tiếp:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/v1/venue/rooms
```

### 4. Các nguyên nhân có thể

#### A. API Authentication

- API cần token authentication
- Kiểm tra xem user đã login chưa
- Kiểm tra token có hợp lệ không

#### B. API Endpoint

- Endpoint `/venue/rooms` có tồn tại không
- Backend có chạy không (port 4000)
- CORS có được cấu hình đúng không

#### C. Data Format

- Backend trả về format UPPERCASE (ID, NAME, CAPACITY)
- Frontend expect lowercase (id, name, capacity)
- Cần convert format đúng

#### D. Component State

- State `rooms` có được set đúng không
- Dropdown có render với data mới không
- Event handler có được gọi không

### 5. Cách sửa

#### Nếu API không hoạt động:

1. Kiểm tra backend có chạy không
2. Kiểm tra authentication
3. Thêm error handling tốt hơn

#### Nếu API hoạt động nhưng data không hiển thị:

1. Kiểm tra format conversion
2. Kiểm tra component re-render
3. Thêm debug logs

#### Nếu dropdown không update:

1. Kiểm tra state management
2. Kiểm tra event handlers
3. Kiểm tra React re-rendering

### 6. Test với Mock Data

Sử dụng file `test-room-selection-debug.html` để test với mock data và xem component hoạt động như thế nào.

### 7. Các file cần kiểm tra

- `components/sessions/sessions-management-system.tsx` - Component chính
- `lib/api.ts` - API client
- `D:/DATN/HOI_THAO_BE/src/routes/venue/venue.routes.ts` - Backend API

## Kết quả mong đợi

Sau khi debug, dropdown phòng sẽ hiển thị:

- Danh sách phòng khi chọn hội nghị
- Format: "Tên phòng (sức chứa chỗ)"
- Có thể chọn phòng và lưu vào form
