# Patch: Add SessionId to Frontend Check-in Flow

## Files cần sửa:

### 1. app/checkin-public/page.tsx

Cần thêm sessionId vào 3 chỗ:

#### A. Trong `handleQRScanSuccess` (dòng ~203-216)

**Thay đổi từ:**
```typescript
      // Perform check-in
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        checkInMethod: "qr",
      });
```

**Thành:**
```typescript
      // Perform check-in
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        sessionId: sessionId, // Include session ID from QR code
        checkInMethod: "qr",
      });
```

#### B. Trong `handleQRUploadSuccess` (dòng ~286-299)

**Thêm sau dòng 287:**
```typescript
      let parsedQRData = null;
      let conferenceId: number | null = conferenceIdFromQR || null;
      let sessionId: number | null = null; // ADD THIS LINE

      try {
        parsedQRData = JSON.parse(qrData);
        console.log("📱 Parsed QR data:", parsedQRData);

        // Extract conference ID from QR data (support both old and new format)
        if (parsedQRData.conferenceId) {
          conferenceId = parsedQRData.conferenceId;
        } else if (parsedQRData.conf) {
          conferenceId = parsedQRData.conf;
        }

        // Extract session ID from QR data if available
        if (parsedQRData.session) {
          sessionId = parsedQRData.session;
          console.log("📱 Session ID from uploaded QR:", sessionId);
        }
      } catch (e) {
        console.log("📱 QR data is not JSON format");
      }
```

**Thay đổi check-in call (dòng ~354-359):**
```typescript
      // Perform check-in
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        sessionId: sessionId, // ADD THIS LINE
        checkInMethod: "qr",
      });
```

### 2. API QR Generation (nếu cần)

File: `app/api/attendees/[id]/qr-code/route.ts`

Hiện tại API này không hỗ trợ sessionId parameter. Nếu muốn generate QR với session từ API endpoint, cần thêm:

```typescript
// GET endpoint
const sessionId = searchParams.get("sessionId");

let qrData: any = {
  id: attendeeId,
  conf: conferenceId ? parseInt(conferenceId) : null,
  ...(sessionId && { session: parseInt(sessionId) }), // ADD THIS
};

// POST endpoint
const { conferenceId, sessionId, customData } = body; // ADD sessionId

const qrData = {
  id: attendeeId,
  conf: conferenceId || null,
  ...(sessionId && { session: sessionId }), // ADD THIS
};
```

## Testing

### 1. Tạo QR code với session:
```json
{
  "id": 68,
  "conf": 12,
  "session": 10,
  "t": 1759332776039,
  "type": "attendee_registration",
  "cs": "57d0ec5",
  "v": "2.0"
}
```

### 2. Test check-in:
- Scan/upload QR code có session → phải check-in vào session 10
- Scan/upload QR code không có session → phải check-in vào conference (session_id = null)
- Check-in 2 lần vào cùng session → lần 2 phải trả về status "duplicate"

### 3. Verify trong database:
```sql
SELECT 
    c.ID,
    c.REGISTRATION_ID,
    c.SESSION_ID,
    c.CHECKIN_TIME,
    c.METHOD,
    c.STATUS,
    s.TITLE as SESSION_TITLE
FROM CHECKINS c
LEFT JOIN SESSIONS s ON s.ID = c.SESSION_ID
WHERE c.REGISTRATION_ID = <registration_id>
ORDER BY c.CHECKIN_TIME DESC;
```

## Lưu ý

1. **Backward Compatibility**: QR code cũ không có `session` field vẫn hoạt động bình thường (conference-level check-in)

2. **Session Validation**: Backend đã handle việc:
   - Kiểm tra duplicate check-in per session
   - Tạo registration nếu chưa có
   - Lưu session_id vào CHECKINS table

3. **Frontend Changes**: 
   - ✅ Interface CheckInRequest đã có sessionId
   - ⚠️ Cần update page.tsx để extract và pass sessionId
   - ⚠️ Có thể thêm UI để hiển thị session info khi check-in thành công

4. **QR Code Generation**:
   - Component QRNameCardGenerator đã tạo QR với session field
   - API endpoint có thể cần update nếu muốn generate từ server


