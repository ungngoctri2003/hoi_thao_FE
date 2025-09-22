# QR Name Card Generator

## Tổng quan

QR Name Card Generator là một component cho phép tạo và xuất name card với QR code cho tham dự viên hội nghị. Component này tích hợp với hệ thống quản lý tham dự viên để tạo ra các thẻ tham dự chuyên nghiệp.

## Tính năng

- ✅ Tạo QR code cho tham dự viên
- ✅ Hiển thị thông tin tham dự viên trên name card
- ✅ Tích hợp thông tin hội nghị
- ✅ Xuất name card dưới dạng hình ảnh (PNG)
- ✅ In name card trực tiếp
- ✅ Kích thước chuẩn thẻ tham dự (3.5" x 2")
- ✅ Responsive design

## Cách sử dụng

### 1. Import component

```tsx
import { QRNameCardGenerator } from "@/components/attendees/qr-name-card-generator";
```

### 2. Sử dụng trong component

```tsx
<QRNameCardGenerator
  attendee={attendee}
  conference={conference}
  qrCode={existingQRCode} // Optional
  onGenerateQR={generateQRCodeFunction} // Optional
/>
```

### 3. Props

| Prop           | Type         | Required | Description                             |
| -------------- | ------------ | -------- | --------------------------------------- |
| `attendee`     | `Attendee`   | ✅       | Thông tin tham dự viên                  |
| `conference`   | `Conference` | ❌       | Thông tin hội nghị (optional)           |
| `qrCode`       | `string`     | ❌       | QR code có sẵn (optional)               |
| `onGenerateQR` | `function`   | ❌       | Function để generate QR code (optional) |

### 4. API Endpoint

Component sử dụng API endpoint `/api/attendees/[id]/qr-code` để generate QR code:

```typescript
// GET /api/attendees/123/qr-code?conferenceId=456
{
  "success": true,
  "data": {
    "qrCode": "ATTENDEE:123:CONF:456:1234567890",
    "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "attendeeId": 123,
    "conferenceId": 456,
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Cấu trúc QR Code

QR code chứa thông tin JSON với format:

```json
{
  "attendeeId": 123,
  "conferenceId": 456,
  "timestamp": 1234567890,
  "type": "attendee_registration"
}
```

## Tích hợp với AttendeeDialog

Component đã được tích hợp vào `AttendeeDialog` và chỉ hiển thị ở chế độ xem (view mode):

```tsx
{
  mode === "view" && attendee && (
    <QRNameCardGenerator
      attendee={attendee}
      conference={conferences.find(
        (c) => c.ID === checkinStatuses[0]?.conferenceId
      )}
      qrCode={checkinStatuses[0]?.qrCode}
      onGenerateQR={generateQRCode}
    />
  );
}
```

## Dependencies

- `qrcode`: Thư viện tạo QR code
- `html2canvas`: Thư viện chuyển đổi HTML thành hình ảnh
- `lucide-react`: Icons
- `@/components/ui/*`: UI components

## Cài đặt dependencies

```bash
npm install qrcode @types/qrcode html2canvas @types/html2canvas
```

## Test

Để test component, truy cập `/test-qr-namecard` để xem demo.

## Troubleshooting

### Lỗi "Failed to generate QR code"

- Kiểm tra API endpoint có hoạt động không
- Kiểm tra authentication token
- Kiểm tra network connection

### Lỗi "html2canvas is not defined"

- Đảm bảo đã cài đặt html2canvas
- Kiểm tra import statement

### QR code không hiển thị

- Kiểm tra qrCode prop có giá trị không
- Kiểm tra console để xem lỗi
- Thử generate QR code mới

## Customization

### Thay đổi kích thước name card

Chỉnh sửa CSS trong component:

```css
.print-card {
  width: 3.5in; /* Thay đổi kích thước */
  height: 2in; /* Thay đổi kích thước */
}
```

### Thay đổi màu sắc QR code

```typescript
const qrDataUrl = await QRCode.toDataURL(qrData, {
  color: {
    dark: "#000000", // Màu đen
    light: "#FFFFFF", // Màu trắng
  },
});
```

### Thay đổi layout name card

Chỉnh sửa JSX trong component để thay đổi layout, thêm/bớt thông tin hiển thị.

## Future Enhancements

- [ ] Hỗ trợ template name card tùy chỉnh
- [ ] Xuất PDF thay vì PNG
- [ ] Batch export nhiều name card cùng lúc
- [ ] Tích hợp với hệ thống in từ xa
- [ ] QR code với logo công ty

