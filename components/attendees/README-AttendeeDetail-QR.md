# QR Name Card trong Chi tiết Tham dự viên

## Tổng quan

Tính năng QR Name Card đã được tích hợp vào trang chi tiết tham dự viên, cho phép xuất QR code cho từng hội nghị riêng biệt mà tham dự viên tham gia.

## Cách truy cập

### 1. Từ trang quản lý tham dự viên

1. Vào trang quản lý tham dự viên
2. Click vào nút "Xem chi tiết" của bất kỳ tham dự viên nào
3. Trong dialog chi tiết, scroll xuống phần "Hội nghị và Check-in"
4. Tìm nút "Xuất Name Card" ở cuối dialog

### 2. Từ trang test

Truy cập `/test-attendee-detail` để test tính năng với dữ liệu mô phỏng.

## Tính năng chính

### 1. Chọn hội nghị cụ thể

- Dropdown hiển thị tất cả hội nghị mà tham dự viên đã đăng ký
- Mỗi hội nghị có thông tin: tên, ngày, địa điểm, trạng thái
- Chỉ hiển thị hội nghị có đăng ký hợp lệ

### 2. QR Code đầy đủ thông tin

- **Thông tin tham dự viên**: ID, tên, email, phone, company, position, avatar
- **Thông tin hội nghị**: ID, tên, mô tả, ngày bắt đầu/kết thúc, địa điểm, trạng thái
- **Thông tin đăng ký**: ID, trạng thái, ngày đăng ký, thời gian checkin/checkout
- **Bảo mật**: Checksum để xác thực, version control

### 3. Preview và xuất

- Preview name card với kích thước chuẩn 3.5" x 2"
- Hiển thị thông tin hội nghị được chọn
- Download dưới dạng hình ảnh PNG
- In trực tiếp với kích thước chuẩn

## Cấu trúc dữ liệu

### QR Code JSON Structure

```json
{
  "type": "attendee_registration",
  "attendeeId": 1,
  "conferenceId": 1,
  "registrationId": 1001,
  "timestamp": 1704067200000,
  "attendee": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "company": "Công ty ABC",
    "position": "Giám đốc",
    "avatarUrl": null
  },
  "conference": {
    "id": 1,
    "name": "Hội nghị Công nghệ 2024",
    "description": "Hội nghị về công nghệ và đổi mới",
    "startDate": "2024-03-15T00:00:00.000Z",
    "endDate": "2024-03-17T00:00:00.000Z",
    "venue": "Trung tâm Hội nghị Quốc gia",
    "status": "active"
  },
  "registration": {
    "id": 1001,
    "status": "checked-in",
    "registrationDate": "2024-03-01T00:00:00.000Z",
    "checkinTime": "2024-03-15T08:30:00.000Z",
    "checkoutTime": null
  },
  "checksum": "a1b2c3d4",
  "version": "1.0"
}
```

## Cách sử dụng

### 1. Mở chi tiết tham dự viên

```tsx
<AttendeeDialog
  attendee={selectedAttendee}
  conferences={conferences}
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  onSave={handleSaveAttendee}
  onRefresh={handleRefresh}
  mode="view"
/>
```

### 2. QR Name Card Generator

```tsx
<QRNameCardGenerator
  attendee={attendee}
  conferences={conferences}
  registrations={registrations}
  onGenerateQR={generateQRCode}
/>
```

### 3. Generate QR Code Function

```typescript
const generateQRCode = async (
  attendeeId: number,
  conferenceId?: number
): Promise<string> => {
  // Tạo QR code với đầy đủ thông tin
  const qrData = {
    type: "attendee_registration",
    attendeeId: attendee.ID,
    conferenceId: conference.ID,
    // ... đầy đủ thông tin
  };
  return JSON.stringify(qrData);
};
```

## Demo và Test

### Test Page

Truy cập `/test-attendee-detail` để test:

1. **Chọn tham dự viên**: Click "Xem chi tiết"
2. **Mở QR Generator**: Tìm nút "Xuất Name Card" ở cuối dialog
3. **Chọn hội nghị**: Sử dụng dropdown để chọn hội nghị cụ thể
4. **Tạo QR**: Click "Tạo QR Code"
5. **Preview**: Xem name card với thông tin hội nghị được chọn
6. **Xuất**: Download hoặc in name card

### Mock Data

Test page sử dụng dữ liệu mô phỏng:

- 2 tham dự viên mẫu
- 3 hội nghị mẫu
- Mỗi tham dự viên có đăng ký cho 2 hội nghị
- Trạng thái đăng ký khác nhau (registered, checked-in)

## Lưu ý kỹ thuật

### 1. Dependencies

- `QRNameCardGenerator` component
- `AttendeeDialog` component
- `qrcode` library cho QR generation
- `html2canvas` cho export functionality

### 2. Props Requirements

```typescript
interface QRNameCardGeneratorProps {
  attendee: Attendee;
  conferences: Conference[];
  registrations: Registration[];
  qrCode?: string;
  onGenerateQR?: (attendeeId: number, conferenceId?: number) => Promise<string>;
}
```

### 3. Data Flow

1. `AttendeeDialog` load attendee và conferences
2. Tạo mock registration data từ conferences
3. Pass data vào `QRNameCardGenerator`
4. User chọn hội nghị từ dropdown
5. Generate QR với đầy đủ thông tin
6. Preview và export name card

## Troubleshooting

### 1. Không hiển thị dropdown hội nghị

- Kiểm tra `conferences` prop có data không
- Kiểm tra `registrations` prop có data không
- Đảm bảo attendee có đăng ký hội nghị

### 2. QR code không tạo được

- Kiểm tra `onGenerateQR` function
- Kiểm tra attendee và conference data
- Kiểm tra console errors

### 3. Name card không hiển thị đúng

- Kiểm tra CSS classes
- Kiểm tra kích thước QR code
- Kiểm tra data format

## Roadmap

- [ ] Thêm validation cho QR data
- [ ] Cải thiện UI/UX cho mobile
- [ ] Thêm batch export cho nhiều hội nghị
- [ ] Tích hợp với real API
- [ ] Thêm analytics cho QR usage


