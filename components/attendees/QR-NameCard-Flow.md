# QR Name Card Generator - Luồng hoạt động

## 1. Khởi tạo Component

```
User mở AttendeeDialog (view mode)
    ↓
QRNameCardGenerator được render
    ↓
Component nhận props: attendee, conference, qrCode, onGenerateQR
```

## 2. Hiển thị QR Code

```
Có QR code sẵn?
    ↓ YES
Hiển thị QR code từ prop qrCode
    ↓ NO
Hiển thị placeholder QR code
```

## 3. Generate QR Code mới

```
User nhấn "Tạo QR Code"
    ↓
Gọi API /api/attendees/[id]/qr-code
    ↓
API trả về QR code data
    ↓
Tạo QR code image bằng qrcode.js
    ↓
Hiển thị QR code trên name card
```

## 4. Xuất Name Card

### 4.1. Download (Tải xuống)

```
User nhấn "Tải xuống"
    ↓
Sử dụng html2canvas để capture name card
    ↓
Tạo link download với tên file
    ↓
Trigger download file PNG
```

### 4.2. Print (In)

```
User nhấn "In"
    ↓
Mở popup window mới
    ↓
Render name card với CSS print media
    ↓
Gọi window.print()
```

## 5. API Endpoint Flow

```
GET /api/attendees/[id]/qr-code?conferenceId=[confId]
    ↓
Validate attendeeId và conferenceId
    ↓
Tạo QR data object
    ↓
Generate QR code bằng qrcode.js
    ↓
Trả về JSON response với QR code data
```

## 6. QR Code Data Structure

```json
{
  "attendeeId": 123,
  "conferenceId": 456,
  "timestamp": 1234567890,
  "type": "attendee_registration"
}
```

## 7. Error Handling

```
API call fails?
    ↓ YES
Fallback to onGenerateQR prop function
    ↓
Still fails?
    ↓
Show error message to user
    ↓ NO
Continue normal flow
```

## 8. Component States

- `isOpen`: Dialog mở/đóng
- `qrCodeDataUrl`: QR code image data URL
- `isGenerating`: Đang generate QR code
- `generatedQR`: QR code string đã generate

## 9. Dependencies Flow

```
QRNameCardGenerator
    ↓
qrcode.js (generate QR code image)
    ↓
html2canvas (capture name card)
    ↓
AttendeeDialog (parent component)
    ↓
API /api/attendees/[id]/qr-code
```

## 10. User Experience Flow

```
1. User mở chi tiết tham dự viên
2. Thấy nút "Xuất Name Card"
3. Nhấn nút → Dialog mở
4. Thấy preview name card
5. Nhấn "Tạo QR Code" (nếu cần)
6. Chọn "Tải xuống" hoặc "In"
7. Name card được xuất thành công
```

## 11. File Structure

```
components/attendees/
├── qr-name-card-generator.tsx    # Main component
├── attendee-dialog.tsx           # Parent component
├── README-QR-NameCard.md         # Documentation
└── QR-NameCard-Flow.md          # This file

app/api/attendees/[id]/qr-code/
└── route.ts                      # API endpoint

app/test-qr-namecard/
└── page.tsx                      # Test page
```

## 12. Integration Points

- **AttendeeDialog**: Hiển thị nút xuất name card
- **API**: Generate QR code data
- **Database**: Lưu trữ QR code trong registration
- **Print System**: In name card
- **File System**: Lưu file PNG

