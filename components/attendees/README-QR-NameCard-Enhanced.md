# QR Name Card Enhanced - Hướng dẫn sử dụng

## Tổng quan

Tính năng QR Name Card Enhanced cho phép xuất QR code cho từng hội nghị riêng biệt mà tham dự viên tham gia, với đầy đủ thông tin cần thiết để checkin thành công.

## Tính năng chính

### 1. Xuất QR cho từng hội nghị

- Chọn hội nghị cụ thể từ dropdown
- QR code được tạo riêng cho từng hội nghị
- Hiển thị thông tin hội nghị trên name card

### 2. QR Code chứa đầy đủ thông tin

- **Thông tin tham dự viên**: ID, tên, email, phone, company, position, avatar
- **Thông tin hội nghị**: ID, tên, mô tả, ngày bắt đầu/kết thúc, địa điểm, trạng thái
- **Thông tin đăng ký**: ID, trạng thái, ngày đăng ký, thời gian checkin/checkout
- **Bảo mật**: Checksum để xác thực, version control

### 3. Checkin thông minh

- QR scanner tự động nhận diện format JSON
- Hiển thị thông tin chi tiết từ QR code
- Validation đầy đủ trước khi checkin

## Cấu trúc QR Code

```json
{
  "type": "attendee_registration",
  "attendeeId": 1,
  "conferenceId": 1,
  "registrationId": 1,
  "timestamp": 1704067200000,
  "attendee": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0123456789",
    "company": "Công ty ABC",
    "position": "Giám đốc",
    "avatarUrl": "https://example.com/avatar.jpg"
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
    "id": 1,
    "status": "registered",
    "registrationDate": "2024-03-01T00:00:00.000Z",
    "checkinTime": null,
    "checkoutTime": null
  },
  "checksum": "a1b2c3d4",
  "version": "1.0"
}
```

## Cách sử dụng

### 1. Trong QR Name Card Generator

```tsx
<QRNameCardGenerator
  attendee={attendee}
  conferences={conferences}
  registrations={registrations}
  onGenerateQR={handleGenerateQR}
/>
```

### 2. Trong Checkin System

```tsx
// QR Scanner tự động xử lý JSON format
<QRScanner
  onScanSuccess={handleQRScanSuccess}
  onScanError={handleQRScanError}
  isScanning={isScanning}
  onStartScan={() => setIsScanning(true)}
  onStopScan={() => setIsScanning(false)}
/>

// Hiển thị thông tin chi tiết
<QRAttendeeInfo qrData={scannedQRData} />
```

### 3. API Endpoints

```typescript
// GET /api/attendees/[id]/qr-code?conferenceId=1&includeFullData=true
// POST /api/attendees/[id]/qr-code với customData
```

## Các component chính

### QRNameCardGenerator

- **Props**: `attendee`, `conferences`, `registrations`, `qrCode`, `onGenerateQR`
- **Features**:
  - Dropdown chọn hội nghị
  - Tạo QR với đầy đủ thông tin
  - Preview name card
  - Download/Print functionality

### QRAttendeeInfo

- **Props**: `qrData`
- **Features**:
  - Hiển thị thông tin tham dự viên
  - Hiển thị thông tin hội nghị
  - Hiển thị trạng thái đăng ký
  - Hiển thị thông tin QR code

### CheckInAPI.validateQRCode

- **Input**: `qrCode: string`, `conferenceId: number`
- **Output**: `{ valid: boolean, attendee?: Attendee, qrData?: any }`
- **Features**:
  - Parse JSON format
  - Validate checksum
  - Extract attendee data
  - Conference validation

## Bảo mật

### Checksum Validation

```typescript
const generateChecksum = (attendeeId: number, conferenceId: number): string => {
  const data = `${attendeeId}-${conferenceId}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};
```

### Version Control

- QR code có version field để tương thích ngược
- Hiện tại version "1.0"

## Test

### Test Page

Truy cập `/test-qr-namecard-enhanced` để test tính năng:

1. Chọn tham dự viên
2. Xuất QR Name Card cho từng hội nghị
3. Test quét QR và hiển thị thông tin
4. Kiểm tra tính năng checkin

### Mock Data

Test page sử dụng mock data để demo:

- 2 tham dự viên
- 2 hội nghị
- 3 đăng ký với trạng thái khác nhau

## Lưu ý

1. **Performance**: QR code chứa nhiều thông tin nên có thể lớn, cần test trên thiết bị thực tế
2. **Compatibility**: QR scanner cần hỗ trợ JSON parsing
3. **Security**: Checksum chỉ là basic validation, có thể cần cải thiện
4. **Database**: Cần đảm bảo API có thể fetch đầy đủ thông tin attendee và conference

## Roadmap

- [ ] Cải thiện checksum algorithm
- [ ] Thêm encryption cho sensitive data
- [ ] Offline QR generation
- [ ] Batch QR generation
- [ ] QR code analytics
- [ ] Mobile app integration
