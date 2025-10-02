# Session Status Feature - Hiển thị trạng thái session check-in

## Tổng quan
Feature này cho phép hiển thị tất cả các trạng thái check-in của người dùng trong từng session của hội nghị ở cột "Trạng thái" trong trang `/attendees`. Khi có nhiều hơn 2 session, các session bổ sung sẽ được hiển thị trong popup khi hover.

## Các thay đổi đã thực hiện

### 1. Backend Changes

#### File: `src/modules/attendees/attendees.repository.ts`
- **Cập nhật query `listWithConferences`** để JOIN với bảng `CHECKINS` và `SESSIONS`
- **Thêm fields mới vào SELECT**:
  - `ch.ID as CHECKIN_ID`
  - `ch.SESSION_ID`
  - `ch.CHECKIN_TIME`
  - `ch.ACTION_TYPE`
  - `ch.METHOD as CHECKIN_METHOD`
  - `s.TITLE as SESSION_TITLE`
  - `s.START_TIME as SESSION_START_TIME`
  - `s.END_TIME as SESSION_END_TIME`
  - `s.STATUS as SESSION_STATUS`
- **Thêm sessionCheckins array** vào response data cho mỗi attendee
- Mỗi sessionCheckin bao gồm thông tin đầy đủ về session và check-in record

### 2. Frontend Changes

#### File: `lib/api/attendees-api.ts`
- **Thêm interface `SessionCheckin`**:
  ```typescript
  export interface SessionCheckin {
    ID: number;
    SESSION_ID: number;
    CHECKIN_TIME: Date;
    ACTION_TYPE: 'checkin' | 'checkout';
    METHOD: 'qr' | 'manual' | 'nfc';
    SESSION_TITLE: string;
    SESSION_START_TIME: Date;
    SESSION_END_TIME: Date;
    SESSION_STATUS: string;
    CONFERENCE_ID: number;
  }
  ```
- **Cập nhật interface `Attendee`** để thêm `sessionCheckins?: SessionCheckin[]`

#### File: `hooks/use-attendee-conferences.ts`
- **Import type `SessionCheckin`**
- **Cập nhật interface `AttendeeWithConferences`** để thêm `sessionCheckins: SessionCheckin[]`
- **Xử lý sessionCheckins data** từ API response
- Gán sessionCheckins cho mỗi attendee trong processed data

#### File: `components/attendees/session-status-badges.tsx` (MỚI)
- **Component mới** để hiển thị session status badges với tooltip
- **Features**:
  - Hiển thị tối đa `maxVisible` badges (mặc định: 2)
  - Badge "+X session khác" để hiển thị tooltip với tất cả sessions
  - Tooltip hiển thị đầy đủ thông tin:
    - Tên session
    - Trạng thái (Check-in/Check-out)
    - Thời gian check-in
    - Thời gian session
    - Phương thức check-in (QR/Manual/NFC)
  - Group sessions theo SESSION_ID và chỉ hiển thị status mới nhất
  - Filter theo conferenceId nếu cần
  - Sắp xếp theo thời gian check-in giảm dần

#### File: `app/attendees/page.tsx`
- **Import component `SessionStatusBadges`**
- **Cập nhật TableCell "Trạng thái"** trong List View:
  - Hiển thị overall status badge
  - Hiển thị SessionStatusBadges component nếu có sessionCheckins
  - Hiển thị tối đa 2 badges, phần còn lại trong tooltip
- **Cập nhật Grid View**:
  - Thêm SessionStatusBadges với maxVisible=1
- **Cập nhật Cards View**:
  - Thêm SessionStatusBadges với maxVisible=2

## Cấu trúc Database

### Bảng CHECKINS
- `ID`: Check-in record ID
- `REGISTRATION_ID`: Registration ID
- `SESSION_ID`: Session ID (NULL = conference-level check-in)
- `CHECKIN_TIME`: Thời gian check-in/checkout
- `ACTION_TYPE`: 'checkin' hoặc 'checkout'
- `METHOD`: 'qr', 'manual', hoặc 'nfc'
- `STATUS`: 'success', 'failed', 'duplicate'

### Bảng SESSIONS
- `ID`: Session ID
- `CONFERENCE_ID`: Conference ID
- `TITLE`: Tên session
- `START_TIME`: Thời gian bắt đầu
- `END_TIME`: Thời gian kết thúc
- `STATUS`: 'upcoming', 'live', 'completed', 'cancelled'

## Luồng dữ liệu

1. **Frontend gọi API** `GET /api/v1/attendees/with-conferences?includeConferences=true&includeRegistrations=true`
2. **Backend query** JOIN ATTENDEES, REGISTRATIONS, CONFERENCES, CHECKINS, SESSIONS
3. **Backend group data** theo attendee và gom các sessionCheckins
4. **Frontend nhận data** với field `sessionCheckins` cho mỗi attendee
5. **Component SessionStatusBadges** hiển thị:
   - Lọc theo conference nếu cần
   - Group theo SESSION_ID
   - Hiển thị maxVisible badges
   - Tooltip cho các session còn lại

## UI/UX

### List View
- Cột "Trạng thái" hiển thị:
  - Overall status badge (đã có)
  - Label "Session Check-ins:"
  - Tối đa 2 session badges
  - Badge "+X session khác" để xem tooltip

### Grid View
- Hiển thị tối đa 1 session badge
- Badge "+X" để xem tooltip

### Cards View
- Hiển thị tối đa 2 session badges
- Badge "+X" để xem tooltip

### Session Badges
- **Hiển thị badge**: Icon + tên session (rút gọn nếu quá dài)
- **Hover vào badge**: Tooltip hiển thị chi tiết:
  - 🏛️ Tên hội nghị
  - 📋 Tên session đầy đủ
  - ⏰ Thời gian session
  - ✅/🚪 Thời gian check-in/checkout

### Tooltip "+X session khác"
- **Header**: "📊 Tất cả session check-ins (X)"
- **Group theo hội nghị**:
  - 🏛️ Tên hội nghị + badge số session
  - Danh sách sessions trong hội nghị đó:
    - Số thứ tự
    - 📋 Tên session
    - Badge check-in/checkout status
    - ⏰ Thời gian session (đầy đủ ngày giờ)
    - 🕐 Thời gian check-in/checkout
    - 📱 Phương thức (QR/Thủ công/NFC)
- **Footer**: 
  - Tổng cộng: X session
  - Y hội nghị

## Testing

### Manual Testing Steps
1. Khởi động backend: `cd d:\DATN\HOI_THAO_BE && npm start`
2. Khởi động frontend: `cd d:\DATN\conference-management-system && npm run dev`
3. Đăng nhập vào hệ thống
4. Truy cập trang `/attendees`
5. Kiểm tra:
   - Cột "Trạng thái" hiển thị session check-ins
   - Hover vào badge "+X session khác" để xem tooltip
   - Tooltip hiển thị đầy đủ thông tin sessions
   - Chuyển đổi giữa List/Grid/Cards view
   - Filter theo conference nếu có

### API Testing
```bash
# Get attendees with session check-ins
curl -X GET "http://localhost:4000/api/v1/attendees/with-conferences?includeConferences=true&includeRegistrations=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response should include `sessionCheckins` array for each attendee.

## Notes

- Session check-ins chỉ hiển thị khi `SESSION_ID` không NULL trong bảng CHECKINS
- Conference-level check-ins (SESSION_ID = NULL) vẫn hiển thị như overall status
- Component tự động group và sort sessions theo thời gian check-in
- Tooltip có max-height với scrollbar để hiển thị nhiều sessions
- Component có thể filter theo conferenceId để chỉ hiển thị sessions của conference cụ thể

## Future Enhancements

1. Thêm filter theo session status (upcoming/live/completed)
2. Thêm search sessions trong tooltip
3. Export session check-in data to Excel
4. Add session check-in statistics
5. Visual timeline cho session check-ins

