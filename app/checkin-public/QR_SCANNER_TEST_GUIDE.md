# Hướng dẫn Test QR Scanner

## Vấn đề đã được sửa

Chức năng quét QR code trong trang `/checkin-public` đã được cập nhật để sử dụng thư viện `qr-scanner` chuyên nghiệp thay vì thuật toán phát hiện đơn giản trước đó.

## Các thay đổi chính

### 1. Cài đặt thư viện qr-scanner
```bash
npm install qr-scanner
```

### 2. Cập nhật QR Scanner Component
- Thay thế thuật toán phát hiện QR code đơn giản bằng thư viện `qr-scanner`
- Thêm type definitions cho TypeScript
- Cải thiện UI và trải nghiệm người dùng

### 3. Tính năng mới
- Phát hiện QR code chính xác và nhanh chóng
- Highlight vùng quét và outline của QR code
- Tự động sử dụng camera sau (environment) trên mobile
- Xử lý lỗi tốt hơn
- UI feedback rõ ràng khi đang quét

## Cách test

### 1. Test với file HTML độc lập
Mở file `test-qr-scanner.html` trong trình duyệt:
```bash
# Mở file trong trình duyệt
open app/checkin-public/test-qr-scanner.html
```

### 2. Test trong ứng dụng chính
1. Truy cập `/checkin-public`
2. Chọn một hội nghị từ dropdown
3. Chuyển sang tab "Quét QR Code"
4. Nhấn "Bắt đầu quét"
5. Cho phép truy cập camera
6. Đưa mã QR vào khung hình

### 3. Tạo QR code test
Bạn có thể tạo QR code test tại:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QR Code Monkey](https://www.qrcode-monkey.com/)
- Sử dụng QR code từ Google Authenticator, WhatsApp, v.v.

## Các loại QR code có thể test

1. **QR code văn bản đơn giản**
   - Nội dung: "Test QR Code"
   - Mã QR sẽ được quét và hiển thị nội dung

2. **QR code URL**
   - Nội dung: "https://example.com"
   - Mã QR sẽ được quét và hiển thị URL

3. **QR code JSON**
   - Nội dung: `{"name": "Test", "id": 123}`
   - Mã QR sẽ được quét và hiển thị JSON

## Xử lý sự cố

### Camera không hoạt động
- Kiểm tra quyền truy cập camera trong trình duyệt
- Đảm bảo sử dụng HTTPS (camera yêu cầu HTTPS)
- Thử refresh trang và cấp quyền lại

### QR code không được quét
- Đảm bảo QR code rõ nét, không bị mờ
- Có đủ ánh sáng
- QR code không bị che khuất
- Thử di chuyển camera gần/xa QR code

### Lỗi JavaScript
- Kiểm tra console để xem lỗi chi tiết
- Đảm bảo thư viện qr-scanner đã được cài đặt
- Kiểm tra TypeScript compilation

## Cấu trúc file

```
app/checkin-public/
├── components/
│   └── qr-scanner.tsx          # Component QR Scanner chính
├── types/
│   └── qr-scanner.d.ts         # Type definitions
├── test-qr-scanner.html        # File test độc lập
└── QR_SCANNER_TEST_GUIDE.md    # File hướng dẫn này
```

## Kết quả mong đợi

Sau khi cập nhật, QR scanner sẽ:
- Quét QR code chính xác và nhanh chóng
- Hiển thị feedback rõ ràng cho người dùng
- Tự động dừng sau khi quét thành công
- Xử lý lỗi một cách graceful
- Hoạt động tốt trên cả desktop và mobile
