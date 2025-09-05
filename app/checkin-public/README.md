# Hệ thống Check-in Công khai

Hệ thống check-in cho phép tham dự viên check-in tham dự hội nghị thông qua quét QR code hoặc check-in thủ công.

## Tính năng chính

### 1. Quét QR Code
- Sử dụng camera để quét mã QR của tham dự viên
- Tự động phát hiện và xử lý mã QR
- Validation mã QR với hội nghị được chọn
- Giao diện camera trực quan với khung quét

### 2. Check-in Thủ công
- Tìm kiếm tham dự viên theo tên, email, số điện thoại hoặc mã QR
- Check-in trực tiếp cho tham dự viên đã đăng ký
- Form check-in thủ công cho tham dự viên chưa có trong hệ thống
- Validation thông tin trước khi check-in

### 3. Quản lý Hội nghị
- Chọn hội nghị để check-in
- Hiển thị thông tin hội nghị đang chọn
- Lọc dữ liệu theo hội nghị

### 4. Thống kê Real-time
- Số lượng check-in thành công
- Số lượng check-in thất bại
- Số lượng check-in trùng lặp
- Tổng số lần quét
- Thông tin hội nghị đang chọn

### 5. Lịch sử Check-in
- Danh sách tất cả các lần check-in
- Tìm kiếm theo tên, email, mã QR
- Hiển thị trạng thái check-in
- Xuất báo cáo Excel

### 6. Thông báo
- Toast notification cho các hành động
- Thông báo thành công/lỗi
- Tự động ẩn sau 3 giây

## Cấu trúc Component

```
app/checkin-public/
├── components/
│   ├── qr-scanner.tsx          # Component quét QR code
│   ├── manual-checkin-form.tsx # Form check-in thủ công
│   ├── stats-cards.tsx         # Thẻ thống kê
│   ├── checkin-records-list.tsx # Danh sách lịch sử check-in
│   └── toast-notification.tsx  # Thông báo toast
├── lib/
│   └── checkin-api.ts          # API service
├── page.tsx                    # Trang chính
└── README.md                   # Hướng dẫn này
```

## API Endpoints

### Check-in
- `POST /api/checkin` - Thực hiện check-in
- `POST /api/checkin/validate-qr` - Validate mã QR

### Tham dự viên
- `GET /api/attendees/search` - Tìm kiếm tham dự viên

### Hội nghị
- `GET /api/conferences` - Lấy danh sách hội nghị

### Báo cáo
- `GET /api/checkin/records` - Lấy lịch sử check-in
- `GET /api/checkin/export` - Xuất báo cáo

## Cách sử dụng

### 1. Chọn hội nghị
- Chọn hội nghị từ dropdown ở đầu trang
- Tất cả các thao tác check-in sẽ áp dụng cho hội nghị đã chọn

### 2. Quét QR Code
- Chuyển sang tab "Quét QR Code"
- Nhấn "Bắt đầu quét" để kích hoạt camera
- Đặt mã QR trong khung quét
- Hệ thống sẽ tự động phát hiện và xử lý

### 3. Check-in Thủ công
- Chuyển sang tab "Check-in Thủ công"
- Tìm kiếm tham dự viên hoặc sử dụng form thủ công
- Nhấn "Check-in" để xác nhận

### 4. Xem lịch sử
- Cuộn xuống để xem danh sách lịch sử check-in
- Sử dụng thanh tìm kiếm để lọc kết quả
- Nhấn "Xuất Excel" để tải báo cáo

## Xử lý Lỗi

### Lỗi Camera
- Kiểm tra quyền truy cập camera
- Đảm bảo trình duyệt hỗ trợ getUserMedia
- Thử lại nếu camera không khởi động

### Lỗi Check-in
- Kiểm tra mã QR có hợp lệ không
- Xác nhận tham dự viên đã đăng ký hội nghị
- Kiểm tra kết nối mạng

### Lỗi API
- Kiểm tra kết nối backend
- Xem console để biết chi tiết lỗi
- Thử lại sau vài giây

## Responsive Design

- Hỗ trợ đầy đủ trên desktop và mobile
- Camera tự động chuyển sang camera sau trên mobile
- Giao diện thích ứng với kích thước màn hình

## Bảo mật

- Validation tất cả dữ liệu đầu vào
- Kiểm tra quyền truy cập camera
- Xử lý lỗi an toàn không để lộ thông tin nhạy cảm
