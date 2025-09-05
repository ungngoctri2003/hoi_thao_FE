# 🔧 Camera Troubleshooting Guide

## Vấn đề: Camera không mở được

### Bước 1: Test Camera Cơ Bản

Mở file `test-camera-basic.html` để kiểm tra camera có hoạt động không:

```bash
# Mở file trong trình duyệt
open app/checkin-public/test-camera-basic.html
```

### Bước 2: Kiểm tra Các Yêu Cầu Cơ Bản

#### ✅ HTTPS hoặc Localhost
Camera chỉ hoạt động trên:
- `https://` (HTTPS)
- `http://localhost` 
- `http://127.0.0.1`

**Không hoạt động trên:**
- `http://` (HTTP thông thường)
- IP address khác localhost

#### ✅ Quyền Truy Cập Camera
1. Khi nhấn "Bắt đầu camera", trình duyệt sẽ hỏi quyền
2. **Phải chọn "Cho phép"** (Allow)
3. Nếu đã từ chối trước đó, cần reset quyền:
   - Chrome: Click icon camera bên trái thanh địa chỉ → Reset permissions
   - Firefox: Settings → Privacy & Security → Permissions → Camera
   - Safari: Safari → Preferences → Websites → Camera

#### ✅ Trình Duyệt Hỗ Trợ
- ✅ Chrome 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Edge 12+

### Bước 3: Debug Chi Tiết

#### Kiểm tra Console Logs
Mở Developer Tools (F12) và xem Console để tìm lỗi:

```javascript
// Các log quan trọng:
=== QR Scanner Debug ===
Protocol: https: (hoặc http:)
Host: localhost:3000
User Agent: Chrome/...
✅ QrScanner.hasCamera() returned true
🎥 Testing basic camera access...
✅ Basic camera access successful
```

#### Các Lỗi Thường Gặp

**1. NotAllowedError**
```
❌ Lỗi: Quyền truy cập camera bị từ chối
```
**Giải pháp:**
- Cho phép quyền truy cập camera
- Reset quyền camera trong trình duyệt
- Thử trình duyệt khác

**2. NotFoundError**
```
❌ Lỗi: Không tìm thấy camera trên thiết bị này
```
**Giải pháp:**
- Kiểm tra thiết bị có camera không
- Kết nối camera ngoài nếu cần
- Thử thiết bị khác

**3. NotReadableError**
```
❌ Lỗi: Camera đang được sử dụng bởi ứng dụng khác
```
**Giải pháp:**
- Đóng các ứng dụng khác đang dùng camera (Zoom, Teams, Skype, etc.)
- Restart trình duyệt
- Restart máy tính

**4. SecurityError**
```
❌ Lỗi: Lỗi bảo mật. Cần HTTPS hoặc localhost
```
**Giải pháp:**
- Sử dụng HTTPS hoặc localhost
- Không sử dụng HTTP thông thường

**5. OverconstrainedError**
```
❌ Lỗi: Camera không hỗ trợ cài đặt yêu cầu
```
**Giải pháp:**
- Thử camera khác
- Cập nhật driver camera
- Thử trình duyệt khác

### Bước 4: Test Từng Bước

#### Test 1: Camera Access Cơ Bản
```javascript
// Mở Console và chạy:
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Camera OK');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Camera Error:', err));
```

#### Test 2: QR Scanner Library
```javascript
// Kiểm tra thư viện QR Scanner
import QrScanner from 'qr-scanner';
console.log('QR Scanner supported:', QrScanner.hasCamera());
```

#### Test 3: Video Element
```javascript
// Kiểm tra video element
const video = document.getElementById('video');
console.log('Video element:', video);
console.log('Video parent:', video?.parentElement);
```

### Bước 5: Giải Pháp Nâng Cao

#### 1. Reset Camera Permissions
**Chrome:**
1. Vào `chrome://settings/content/camera`
2. Tìm site của bạn
3. Xóa và cấp quyền lại

**Firefox:**
1. Vào `about:preferences#privacy`
2. Permissions → Camera
3. Xóa site và cấp quyền lại

#### 2. Test Trên Thiết Bị Khác
- Thử trên điện thoại
- Thử trên máy tính khác
- Thử trình duyệt khác

#### 3. Kiểm tra Camera Hardware
- Camera có hoạt động với ứng dụng khác không?
- Thử camera ngoài
- Kiểm tra driver camera

#### 4. Cài Đặt Trình Duyệt
- Cập nhật trình duyệt lên phiên bản mới nhất
- Tắt các extension có thể chặn camera
- Thử chế độ incognito/private

### Bước 6: Test Files

1. **test-camera-basic.html** - Test camera cơ bản
2. **test-simple-qr.html** - Test QR scanner đơn giản  
3. **test-qr-scanner.html** - Test QR scanner đầy đủ

### Bước 7: Logs Debug

Khi gặp lỗi, gửi thông tin sau:

```javascript
// Chạy trong Console và gửi kết quả:
console.log('=== Debug Info ===');
console.log('Protocol:', window.location.protocol);
console.log('Host:', window.location.host);
console.log('User Agent:', navigator.userAgent);
console.log('MediaDevices:', !!navigator.mediaDevices);
console.log('getUserMedia:', !!navigator.mediaDevices?.getUserMedia);

// Test camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Camera OK, tracks:', stream.getTracks().length);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('Camera Error:', err.name, err.message));
```

### Liên Hệ Hỗ Trợ

Nếu vẫn không giải quyết được, gửi:
1. Kết quả từ test-camera-basic.html
2. Console logs đầy đủ
3. Thông tin thiết bị và trình duyệt
4. Screenshot lỗi (nếu có)
