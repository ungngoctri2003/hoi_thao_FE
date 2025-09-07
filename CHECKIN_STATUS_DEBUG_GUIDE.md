# 🔍 Hướng dẫn Debug Trạng thái Checkin

## Vấn đề
Người dùng `testnew123@example.com` và `triung8+2@gmail.com` đã checkin nhưng vẫn hiển thị trạng thái "Đã đăng ký" trong bảng danh sách tham dự.

## Các file đã tạo để debug

### 1. `debug-checkin-status.html`
- File debug chính để kiểm tra dữ liệu thực tế từ API
- Kiểm tra registrations và tính toán trạng thái cho các user cụ thể

### 2. `test-real-checkin-data.html`
- File test để kiểm tra tất cả attendees và thống kê trạng thái
- Hiển thị chi tiết registrations của từng user

### 3. `debug-api-checkin.js`
- Script JavaScript để chạy debug từ console
- Có thể chạy trực tiếp trong browser console

## Cách sử dụng

### Bước 1: Mở file debug
```bash
# Mở file debug trong browser
open debug-checkin-status.html
```

### Bước 2: Đăng nhập vào hệ thống
- Đảm bảo đã đăng nhập và có token trong localStorage
- Kiểm tra `localStorage.getItem('accessToken')` trong console

### Bước 3: Chạy debug
- Click "Debug Specific Users" để kiểm tra 2 user có vấn đề
- Click "Debug All Attendees" để kiểm tra tất cả users

### Bước 4: Kiểm tra console logs
- Mở Developer Tools (F12)
- Xem tab Console để theo dõi quá trình debug
- Kiểm tra dữ liệu registrations và logic tính toán

## Các cải tiến đã thực hiện

### 1. Cải thiện logic tính toán trạng thái
```typescript
// Trước: Chỉ dựa vào REGISTRATION_DATE
const latestRegistration = registrations.reduce((latest, current) => {
  return new Date(current.REGISTRATION_DATE) > new Date(latest.REGISTRATION_DATE) ? current : latest;
});

// Sau: Dựa vào hoạt động thực tế (CHECKOUT_TIME > CHECKIN_TIME > REGISTRATION_DATE)
const latestRegistration = registrations.reduce((latest, current) => {
  const latestTime = latest.CHECKOUT_TIME || latest.CHECKIN_TIME || latest.REGISTRATION_DATE;
  const currentTime = current.CHECKOUT_TIME || current.CHECKIN_TIME || current.REGISTRATION_DATE;
  return new Date(currentTime) > new Date(latestTime) ? current : latest;
});
```

### 2. Thứ tự ưu tiên trạng thái đúng
```typescript
// 1. Cancelled (hủy) - cao nhất
// 2. No-show (không tham dự)
// 3. Checked-out (đã checkout)
// 4. Checked-in (đã checkin)
// 5. Registered (đã đăng ký) - mặc định
```

### 3. Thêm debug logging chi tiết
- Log dữ liệu registrations raw từ API
- Log quá trình tính toán trạng thái
- Log parsing thời gian checkin/checkout

## Các vấn đề có thể gặp

### 1. Dữ liệu API không chính xác
- Kiểm tra xem API có trả về đúng dữ liệu CHECKIN_TIME không
- Kiểm tra format thời gian từ API

### 2. Logic tính toán vẫn sai
- Kiểm tra console logs để xem quá trình tính toán
- So sánh với dữ liệu thực tế trong database

### 3. Vấn đề với timezone
- Kiểm tra xem thời gian có được parse đúng không
- Kiểm tra timezone của server và client

## Cách khắc phục

### Nếu dữ liệu API đúng nhưng logic sai:
1. Kiểm tra console logs trong debug files
2. So sánh với logic trong `calculateOverallStatus`
3. Điều chỉnh logic nếu cần

### Nếu dữ liệu API sai:
1. Kiểm tra backend API
2. Kiểm tra database
3. Kiểm tra quá trình checkin có lưu đúng không

### Nếu vấn đề với timezone:
1. Kiểm tra format thời gian từ API
2. Điều chỉnh cách parse Date
3. Kiểm tra timezone settings

## Kết quả mong đợi

Sau khi debug, các user đã checkin sẽ hiển thị:
- Trạng thái: "Đã check-in" (màu xanh)
- Thời gian check-in: Hiển thị thời gian thực tế
- Thông tin chi tiết trong console logs

## Liên hệ

Nếu vẫn gặp vấn đề, hãy:
1. Chạy debug files và gửi kết quả console logs
2. Kiểm tra dữ liệu trong database
3. Kiểm tra API responses
