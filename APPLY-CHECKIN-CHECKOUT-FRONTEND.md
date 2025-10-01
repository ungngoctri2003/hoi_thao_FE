# Script để Apply Check-in/Check-out Changes vào Frontend

## Đã hoàn thành:
✅ Import ActionTypeSelector component
✅ Thêm state selectedActionType

## Cần làm thủ công:

### Bước 1: Tìm và thay đổi trong `handleQRScanSuccess` (dòng ~212-228)

**Tìm đoạn code:**
```typescript
      // Perform check-in
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        checkInMethod: "qr",
      });

      if (response.success && response.data) {
        // Reload checkin records for the current conference
        await loadCheckInRecords(conferenceId);

        // Show popup success message
        setPopupMessage({
          message: `✅ Check-in thành công cho ${response.data.attendeeName}`,
          type: "success",
          isVisible: true,
        });
```

**Thay bằng:**
```typescript
      // Perform check-in/checkout
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        sessionId: sessionId, // Include session ID from QR code
        actionType: selectedActionType, // Include action type (checkin/checkout)
        checkInMethod: "qr",
      });

      if (response.success && response.data) {
        // Reload checkin records for the current conference
        await loadCheckInRecords(conferenceId);

        // Show popup success message with action type
        const actionText = selectedActionType === 'checkin' ? 'Check-in' : 'Check-out';
        const sessionInfo = sessionId ? ` (Session ${sessionId})` : '';
        setPopupMessage({
          message: `✅ ${actionText} thành công cho ${response.data.attendeeName}${sessionInfo}`,
          type: "success",
          isVisible: true,
        });
```

### Bước 2: Tìm và thay đổi trong `handleQRUploadSuccess` (dòng ~287-299 và ~354-370)

**2A. Thêm extraction cho sessionId (sau dòng ~287):**

Tìm:
```typescript
      let parsedQRData = null;
      let conferenceId: number | null = conferenceIdFromQR || null;

      try {
        parsedQRData = JSON.parse(qrData);
```

Thay bằng:
```typescript
      let parsedQRData = null;
      let conferenceId: number | null = conferenceIdFromQR || null;
      let sessionId: number | null = null;

      try {
        parsedQRData = JSON.parse(qrData);
```

**2B. Extract sessionId từ QR data (sau extraction conferenceId):**

Tìm (trong handleQRUploadSuccess):
```typescript
        // Extract conference ID from QR data (support both old and new format)
        if (parsedQRData.conferenceId) {
          conferenceId = parsedQRData.conferenceId;
        } else if (parsedQRData.conf) {
          conferenceId = parsedQRData.conf;
        }
      } catch (e) {
```

Thay bằng:
```typescript
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
```

**2C. Update API call trong handleQRUploadSuccess (dòng ~354):**

Tìm:
```typescript
      // Perform check-in
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        checkInMethod: "qr",
      });
```

Thay bằng:
```typescript
      // Perform check-in/checkout
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        sessionId: sessionId, // Include session ID from QR code
        actionType: selectedActionType, // Include action type (checkin/checkout)
        checkInMethod: "qr",
      });
```

**2D. Update success message:**

Tìm (trong handleQRUploadSuccess):
```typescript
        // Show popup success message
        setPopupMessage({
          message: `✅ Check-in thành công cho ${response.data.attendeeName}`,
          type: "success",
          isVisible: true,
        });
```

Thay bằng:
```typescript
        // Show popup success message with action type
        const actionText = selectedActionType === 'checkin' ? 'Check-in' : 'Check-out';
        const sessionInfo = sessionId ? ` (Session ${sessionId})` : '';
        setPopupMessage({
          message: `✅ ${actionText} thành công cho ${response.data.attendeeName}${sessionInfo}`,
          type: "success",
          isVisible: true,
        });
```

### Bước 3: Thêm ActionTypeSelector vào UI (sau ConferenceSelector, dòng ~450)

Tìm dòng có `<ConferenceSelector`:
```typescript
        {/* Conference Selector */}
        <ConferenceSelector
          conferences={conferences}
          selectedConference={selectedConference}
          onConferenceChange={handleConferenceChange}
        />
```

Thêm SAU đó:
```typescript
        {/* Action Type Selector - Must select before check-in */}
        {selectedConference && (
          <ActionTypeSelector
            selectedAction={selectedActionType}
            onActionChange={setSelectedActionType}
          />
        )}
```

## Verification Checklist:

- [ ] Import ActionTypeSelector đã có
- [ ] State selectedActionType đã được khai báo
- [ ] handleQRScanSuccess đã pass sessionId và actionType
- [ ] handleQRUploadSuccess đã extract và pass sessionId
- [ ] handleQRUploadSuccess đã pass actionType
- [ ] Success messages hiển thị đúng action type
- [ ] ActionTypeSelector đã được thêm vào UI
- [ ] Component chỉ hiển thị khi đã chọn conference

## Test sau khi apply:

1. **Test Check-in QR Scanner:**
   - Chọn conference
   - Chọn "Check-in" trong ActionTypeSelector
   - Quét QR
   - Verify: Message hiển thị "Check-in thành công"

2. **Test Check-out QR Scanner:**
   - Chọn "Check-out" trong ActionTypeSelector  
   - Quét QR
   - Verify: Message hiển thị "Check-out thành công"

3. **Test với Session:**
   - Quét QR có session field
   - Verify: Message hiển thị session info

4. **Test Visual:**
   - ActionTypeSelector hiển thị đẹp
   - Buttons responsive trên mobile
   - Visual indicator rõ ràng

## Notes:

- Có 2 chỗ gọi `checkInAPI.checkInAttendee` trong file (handleQRScanSuccess và handleQRUploadSuccess)
- Cần update CẢ 2 chỗ
- Success messages cần dynamic dựa trên selectedActionType
- ActionTypeSelector chỉ hiển thị khi đã chọn conference (để UX tốt hơn)

