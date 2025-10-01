# Patch: Thêm Action Type Selector (Check-in/Check-out)

## Mục tiêu
Người dùng phải chọn Check-in hoặc Check-out TRƯỚC khi quét QR code hoặc nhập thông tin thủ công.

## Changes Required

### 1. File: `app/checkin-public/page.tsx`

#### A. Import component mới
```typescript
// Thêm vào đầu file
import { ActionTypeSelector } from "./components/action-type-selector";
```

#### B. Thêm state cho actionType
```typescript
// Thêm vào phần state declarations (sau dòng ~62)
const [selectedActionType, setSelectedActionType] = useState<"checkin" | "checkout">("checkin");
```

#### C. Thêm ActionTypeSelector vào UI
Tìm dòng có `<ConferenceSelector` (khoảng dòng ~450) và thêm sau nó:

```typescript
{/* Action Type Selector - Must select before check-in */}
<ActionTypeSelector
  selectedAction={selectedActionType}
  onActionChange={setSelectedActionType}
/>
```

#### D. Truyền actionType vào các API calls

**1. Trong `handleQRScanSuccess` (khoảng dòng ~211):**
```typescript
const response = await checkInAPI.checkInAttendee({
  attendeeId: validation.attendee.id,
  qrCode: qrData,
  conferenceId: conferenceId,
  sessionId: sessionId,
  actionType: selectedActionType, // THÊM DÒNG NÀY
  checkInMethod: "qr",
});
```

**2. Trong `handleQRUploadSuccess` (khoảng dòng ~354):**
```typescript
const response = await checkInAPI.checkInAttendee({
  attendeeId: validation.attendee.id,
  qrCode: qrData,
  conferenceId: conferenceId,
  sessionId: sessionId, // Thêm sessionId như đã hướng dẫn trước
  actionType: selectedActionType, // THÊM DÒNG NÀY
  checkInMethod: "qr",
});
```

**3. Trong `handleManualCheckInSuccess` (tìm nơi gọi checkInAPI):**
```typescript
const response = await checkInAPI.checkInAttendee({
  attendeeId: attendee.id,
  conferenceId: parseInt(selectedConference),
  sessionId: null, // Hoặc sessionId nếu có
  actionType: selectedActionType, // THÊM DÒNG NÀY
  checkInMethod: "manual",
});
```

#### E. Update success messages
Thay đổi message để hiển thị đúng loại action:

```typescript
// Trong handleQRScanSuccess
const actionText = selectedActionType === 'checkin' ? 'Check-in' : 'Check-out';
const sessionInfo = sessionId ? ` (Session ${sessionId})` : '';
setPopupMessage({
  message: `✅ ${actionText} thành công cho ${response.data.attendeeName}${sessionInfo}`,
  type: "success",
  isVisible: true,
});
```

### 2. File: `app/checkin-public/components/manual-checkin-form.tsx`

Nếu form này có gọi API trực tiếp, cần thêm prop `actionType`:

```typescript
interface ManualCheckInFormProps {
  // ... existing props
  actionType?: "checkin" | "checkout";
}

// Trong component
const response = await checkInAPI.checkInAttendee({
  // ... existing fields
  actionType: actionType || "checkin",
  checkInMethod: "manual",
});
```

## UI/UX Flow

### Before (Cũ):
1. Chọn hội nghị
2. Chọn phương thức (QR Scanner / QR Upload / Manual)
3. Thực hiện check-in

### After (Mới):
1. Chọn hội nghị
2. **Chọn hành động (Check-in / Check-out)** ← MỚI
3. Chọn phương thức (QR Scanner / QR Upload / Manual)
4. Thực hiện check-in/checkout

## Testing

### Test 1: Check-in flow
1. Chọn "Check-in" trong ActionTypeSelector
2. Quét QR code
3. Verify: Backend log hiển thị `ACTION_TYPE: 'checkin'`
4. Verify: Database CHECKINS.ACTION_TYPE = 'checkin'
5. Verify: Success message hiển thị "Check-in thành công"

### Test 2: Check-out flow
1. Chọn "Check-out" trong ActionTypeSelector
2. Quét QR code
3. Verify: Backend log hiển thị `ACTION_TYPE: 'checkout'`
4. Verify: Database CHECKINS.ACTION_TYPE = 'checkout'
5. Verify: Success message hiển thị "Check-out thành công"

### Test 3: Duplicate detection
1. Check-in lần 1 → Status: 'success'
2. Check-in lần 2 (cùng session) → Status: 'duplicate'
3. Check-out lần 1 → Status: 'success' (khác action type)
4. Check-out lần 2 (cùng session) → Status: 'duplicate'

## Database Query Examples

```sql
-- Xem tất cả check-ins và check-outs
SELECT 
    c.ID,
    c.ACTION_TYPE,
    c.SESSION_ID,
    c.CHECKIN_TIME,
    a.NAME,
    CASE 
        WHEN c.ACTION_TYPE = 'checkin' THEN 'Vào'
        WHEN c.ACTION_TYPE = 'checkout' THEN 'Ra'
    END as ACTION_TEXT
FROM CHECKINS c
JOIN REGISTRATIONS r ON r.ID = c.REGISTRATION_ID
JOIN ATTENDEES a ON a.ID = r.ATTENDEE_ID
WHERE r.CONFERENCE_ID = 12
ORDER BY c.CHECKIN_TIME DESC;

-- Đếm số lượt check-in và check-out
SELECT 
    ACTION_TYPE,
    COUNT(*) as TOTAL,
    COUNT(DISTINCT REGISTRATION_ID) as UNIQUE_ATTENDEES
FROM CHECKINS c
JOIN REGISTRATIONS r ON r.ID = c.REGISTRATION_ID
WHERE r.CONFERENCE_ID = 12
AND c.STATUS = 'success'
GROUP BY ACTION_TYPE;

-- Tìm người đã check-in nhưng chưa check-out
SELECT 
    a.NAME,
    a.EMAIL,
    MAX(CASE WHEN c.ACTION_TYPE = 'checkin' THEN c.CHECKIN_TIME END) as LAST_CHECKIN,
    MAX(CASE WHEN c.ACTION_TYPE = 'checkout' THEN c.CHECKIN_TIME END) as LAST_CHECKOUT
FROM ATTENDEES a
JOIN REGISTRATIONS r ON r.ATTENDEE_ID = a.ID
LEFT JOIN CHECKINS c ON c.REGISTRATION_ID = r.ID AND c.STATUS = 'success'
WHERE r.CONFERENCE_ID = 12
GROUP BY a.ID, a.NAME, a.EMAIL
HAVING MAX(CASE WHEN c.ACTION_TYPE = 'checkin' THEN c.CHECKIN_TIME END) > 
       COALESCE(MAX(CASE WHEN c.ACTION_TYPE = 'checkout' THEN c.CHECKIN_TIME END), TO_DATE('1900-01-01', 'YYYY-MM-DD'));
```

## Visual Design

Component `ActionTypeSelector` hiển thị:
- 2 buttons lớn, rõ ràng
- Check-in: Màu xanh lá, icon LogIn
- Check-out: Màu xanh dương, icon LogOut
- Hiển thị hành động hiện tại ở dưới
- Responsive, dễ nhấn trên mobile

## Notes

1. **Default Action**: Mặc định là "checkin" để dễ sử dụng
2. **State Persistence**: Có thể lưu vào localStorage nếu cần
3. **Validation**: Backend validate actionType, frontend default là 'checkin'
4. **Backward Compatibility**: Nếu không gửi actionType, backend mặc định là 'checkin'
5. **Mobile**: Component responsive, buttons lớn dễ nhấn

