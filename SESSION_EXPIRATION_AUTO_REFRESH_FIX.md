# Session Expiration Auto Refresh Fix

## Vấn đề
Người dùng gặp lỗi "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." khi access token hết hạn, mặc dù refresh token vẫn còn hiệu lực. Hệ thống không tự động refresh token trước khi báo lỗi session expiration.

## Nguyên nhân
1. **Thiếu cơ chế tự động refresh token**: Khi API trả về 401 Unauthorized, hệ thống chỉ xóa token và dispatch event session-expired thay vì thử refresh token trước.
2. **Không có retry mechanism**: Sau khi refresh token thành công, hệ thống không retry lại request gốc.

## Giải pháp đã triển khai

### 1. Cải tiến API Client (`lib/api.ts`)

#### Thêm cơ chế tự động refresh token:
```typescript
private async request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false
): Promise<ApiResponse<T>> {
  // ... existing code ...
  
  if (!response.ok) {
    // Handle 401 Unauthorized with automatic token refresh
    if (response.status === 401 && !isRetry && this.shouldAttemptRefresh(endpoint)) {
      console.log('Access token expired, attempting to refresh...');
      try {
        const refreshSuccess = await this.attemptTokenRefresh();
        if (refreshSuccess) {
          console.log('Token refresh successful, retrying request...');
          // Retry the original request with new token
          return this.request<T>(endpoint, options, true);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    // ... existing error handling ...
  }
}
```

#### Thêm các phương thức helper:
```typescript
private getRefreshToken(): string | null {
  // Lấy refresh token từ cookies hoặc localStorage
}

private shouldAttemptRefresh(endpoint: string): boolean {
  // Không thử refresh cho các auth endpoints
  const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];
  return !authEndpoints.some(authEndpoint => endpoint.includes(authEndpoint));
}

private async attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = this.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await this.refreshToken({ refreshToken });
    return true;
  } catch (error) {
    // Clear tokens if refresh fails
    this.removeTokens();
    this.handleSessionExpiration();
    return false;
  }
}
```

#### Sửa phương thức refreshToken để tránh vòng lặp vô hạn:
```typescript
async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  // Use direct fetch to avoid infinite loop with request method
  const url = `${this.baseURL}/auth/refresh`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Token refresh failed' }));
    throw new Error(errorData.message || 'Token refresh failed');
  }

  const result = await response.json();
  
  if (result.data) {
    this.setToken(result.data.accessToken);
    this.setRefreshToken(result.data.refreshToken);
  }

  return result.data;
}
```

## Cách hoạt động

### Luồng xử lý mới:
1. **API Call**: Gọi API với access token hiện tại
2. **401 Response**: Nếu nhận được 401 Unauthorized
3. **Check Refresh Eligibility**: Kiểm tra xem có nên thử refresh token không
4. **Attempt Refresh**: Thử refresh token bằng refresh token
5. **Retry Request**: Nếu refresh thành công, retry lại request gốc với token mới
6. **Fallback**: Nếu refresh thất bại, xóa tokens và dispatch session-expired event

### Các trường hợp được xử lý:
- ✅ **Access token hết hạn**: Tự động refresh và retry
- ✅ **Refresh token hết hạn**: Xóa tokens và redirect về login
- ✅ **Auth endpoints**: Không thử refresh để tránh vòng lặp
- ✅ **Network errors**: Xử lý lỗi mạng một cách graceful

## Lợi ích

1. **Trải nghiệm người dùng tốt hơn**: Không bị gián đoạn khi access token hết hạn
2. **Tự động hóa**: Không cần can thiệp thủ công
3. **Bảo mật**: Vẫn đảm bảo session expiration khi refresh token hết hạn
4. **Hiệu suất**: Giảm số lần phải đăng nhập lại

## Testing

### File test: `test-auto-refresh-token.html`
- Test đăng nhập và lấy tokens
- Test API calls với token hợp lệ
- Test giả lập token hết hạn
- Test cơ chế auto refresh

### Cách test:
1. Mở file `test-auto-refresh-token.html` trong browser
2. Đăng nhập với tài khoản hợp lệ
3. Gọi API để lấy thông tin user
4. Giả lập token hết hạn
5. Gọi lại API - hệ thống sẽ tự động refresh token

## Files đã sửa đổi

1. **`lib/api.ts`**:
   - Thêm cơ chế tự động refresh token
   - Thêm các phương thức helper
   - Sửa phương thức refreshToken để tránh vòng lặp

2. **`test-auto-refresh-token.html`** (mới):
   - File test để kiểm tra cơ chế auto refresh

## Lưu ý

- Cơ chế này chỉ hoạt động khi có refresh token hợp lệ
- Nếu refresh token cũng hết hạn, hệ thống sẽ fallback về session expiration handling
- Không áp dụng cho các auth endpoints để tránh vòng lặp vô hạn
- Tất cả API calls đều được bảo vệ bởi cơ chế này

## Kết quả

Sau khi triển khai, người dùng sẽ không còn gặp lỗi "Phiên đăng nhập đã hết hạn" một cách đột ngột. Thay vào đó, hệ thống sẽ tự động refresh token và tiếp tục hoạt động bình thường cho đến khi refresh token cũng hết hạn.
