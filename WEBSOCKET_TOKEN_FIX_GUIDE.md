# Hướng dẫn khắc phục lỗi WebSocket Token Refresh

## Vấn đề

Lỗi `"websocket.ts:58 Token refresh succeeded but no token found after refresh"` xảy ra khi:

- WebSocket service cố gắng kết nối đến server
- Token hiện tại đã hết hạn hoặc không hợp lệ
- Hệ thống thực hiện refresh token thành công
- Nhưng sau khi refresh, không thể tìm thấy token mới

## Nguyên nhân

1. **Vấn đề với cookie**: Token được lưu trong cookie nhưng không được đọc đúng cách
2. **Timing issue**: Token được set nhưng chưa được commit ngay lập tức
3. **Logic đọc token phức tạp**: Có nhiều nguồn token (cookie, localStorage, sessionStorage) gây nhầm lẫn

## Giải pháp đã áp dụng

### 1. Cải thiện logic `getToken()`

- **Ưu tiên localStorage**: Đọc token từ localStorage trước (đáng tin cậy nhất)
- **Cải thiện logging**: Thêm log chi tiết để debug
- **Fallback mechanism**: Có cơ chế dự phòng khi đọc token

### 2. Cải thiện logic `setToken()`

- **Lưu localStorage trước**: Đảm bảo token được lưu vào localStorage trước
- **Verification**: Kiểm tra token đã được lưu đúng chưa
- **Better logging**: Log chi tiết quá trình lưu token

### 3. Cải thiện logic `attemptTokenRefresh()`

- **Verification sau refresh**: Kiểm tra token sau khi refresh
- **Fallback mechanism**: Sử dụng localStorage nếu cookie không hoạt động
- **Better error handling**: Xử lý lỗi tốt hơn

### 4. Cải thiện logic `connect()`

- **Delay sau refresh**: Thêm delay để đảm bảo token được set
- **Better logging**: Log chi tiết quá trình kết nối

## Cách test

### 1. Sử dụng file test

Mở file `test-websocket-token-fix.html` trong browser để test:

- Test token storage
- Test WebSocket connection
- Test token refresh

### 2. Test trong ứng dụng

1. Mở trang `/ai-analytics`
2. Mở Developer Tools (F12)
3. Xem Console logs
4. Kiểm tra WebSocket connection status

## Các thay đổi chính

### File: `lib/websocket.ts`

#### 1. Cải thiện `getToken()`

```typescript
// Ưu tiên localStorage trước
const sources = [
  // 1. Try localStorage accessToken first (most reliable)
  () => {
    const token = localStorage.getItem("accessToken");
    console.log("localStorage accessToken:", token ? "exists" : "missing");
    return token;
  },
  // 2. Try cookies
  () => {
    // ... cookie logic
  },
  // ... other sources
];
```

#### 2. Cải thiện `setToken()`

```typescript
private setToken(token: string): void {
  if (typeof window !== "undefined") {
    console.log("Setting new access token...");

    // Set localStorage first (most reliable)
    localStorage.setItem("accessToken", token);
    console.log("Token saved to localStorage");

    // Set cookie with 7 days expiration
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    document.cookie = `accessToken=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    console.log("Token saved to cookie");

    // Verify token was set correctly
    const verifyToken = localStorage.getItem("accessToken");
    if (verifyToken === token) {
      console.log("Token verification successful");
    } else {
      console.error("Token verification failed");
    }
  }
}
```

#### 3. Cải thiện `attemptTokenRefresh()`

```typescript
// Verify token was set correctly
const newToken = this.getToken();
if (newToken) {
  console.log("Token refresh successful, new token verified");
  return true;
} else {
  console.error("Token refresh succeeded but token not found after setting");
  // Try to get token from localStorage as fallback
  const fallbackToken = localStorage.getItem("accessToken");
  if (fallbackToken && this.isValidTokenFormat(fallbackToken)) {
    console.log("Using fallback token from localStorage");
    return true;
  }
  return false;
}
```

## Kết quả mong đợi

Sau khi áp dụng các thay đổi:

1. **WebSocket connection thành công**: Không còn lỗi "Token refresh succeeded but no token found after refresh"
2. **Token refresh hoạt động đúng**: Token được refresh và lưu đúng cách
3. **Better debugging**: Có log chi tiết để debug khi có vấn đề
4. **Fallback mechanism**: Có cơ chế dự phòng khi cookie không hoạt động

## Troubleshooting

### Nếu vẫn gặp lỗi:

1. **Kiểm tra Console logs**: Xem log chi tiết trong Developer Tools
2. **Kiểm tra localStorage**: Đảm bảo token được lưu trong localStorage
3. **Kiểm tra cookie**: Đảm bảo cookie được set đúng
4. **Clear cache**: Xóa cache và thử lại

### Log cần chú ý:

- `"Token refresh successful, new token verified"` - Refresh thành công
- `"Token verification successful"` - Token được lưu đúng
- `"WebSocket connected successfully"` - Kết nối thành công

## Lưu ý

- Các thay đổi này tương thích ngược với code hiện tại
- Không ảnh hưởng đến các chức năng khác
- Cải thiện độ tin cậy của WebSocket connection
