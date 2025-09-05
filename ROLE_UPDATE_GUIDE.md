# Hướng dẫn cập nhật quyền người dùng

## Vấn đề
Khi admin thay đổi quyền của người dùng từ "người tham dự" thành "nhân viên" hoặc ngược lại, giao diện của người dùng đó vẫn hiển thị như quyền cũ thay vì cập nhật theo quyền mới.

## Giải pháp đã triển khai

### 1. Nút "Cập nhật quyền" trong Header
- **Vị trí**: Góc trên bên phải, bên cạnh nút chuyển đổi theme
- **Chức năng**: Cho phép người dùng cập nhật quyền của mình từ server
- **Cách sử dụng**: 
  - Nhấn nút "Cập nhật quyền" 
  - Hệ thống sẽ tự động làm mới thông tin quyền
  - Giao diện sẽ cập nhật theo quyền mới

### 2. Thông báo tự động
- **Khi nào hiển thị**: Sau 30 giây người dùng ở trên trang
- **Mục đích**: Nhắc nhở người dùng cập nhật quyền nếu cần
- **Cách tắt**: Nhấn nút X hoặc nhấn "Cập nhật quyền"

### 3. Hiển thị role rõ ràng
- **Trong dropdown user**: Hiển thị role hiện tại với badge màu sắc
- **Trong sidebar**: Badge role với màu sắc tương ứng
- **Màu sắc**:
  - Admin: Đỏ
  - Staff: Xanh dương  
  - Attendee: Xanh lá

## Cách hoạt động

### Khi admin thay đổi quyền:
1. Admin thay đổi quyền trong trang "Phân quyền"
2. Người dùng nhận thông báo (sau 30s) hoặc tự nhấn "Cập nhật quyền"
3. Hệ thống gọi API `/users/me/refresh-permissions`
4. Auth state được cập nhật với role mới
5. Tất cả components tự động re-render với giao diện mới

### Các trang được cập nhật tự động:
- Dashboard (hiển thị dashboard phù hợp với role)
- Sidebar (hiển thị menu items phù hợp)
- Header (hiển thị role badge)
- Tất cả các trang khác

## API Endpoint

```
GET /api/users/me/refresh-permissions
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "staff",
      "avatar": "avatar_url"
    }
  }
}
```

## Troubleshooting

### Nếu nút "Cập nhật quyền" không hoạt động:
1. Kiểm tra kết nối internet
2. Kiểm tra phiên đăng nhập (có thể đã hết hạn)
3. Thử đăng nhập lại

### Nếu giao diện vẫn không cập nhật:
1. Nhấn F5 để refresh trang
2. Kiểm tra console để xem lỗi
3. Liên hệ admin để kiểm tra quyền trên server

## Lưu ý kỹ thuật

- Hệ thống sử dụng React Context và hooks để quản lý auth state
- Khi `refreshPermissions()` được gọi, tất cả components subscribe sẽ tự động re-render
- Session storage được sử dụng để tránh hiển thị thông báo quá nhiều lần
- Toast notifications cung cấp feedback cho người dùng

## Cải tiến trong tương lai

1. **WebSocket notifications**: Thông báo real-time khi role thay đổi
2. **Auto-refresh**: Tự động refresh permissions định kỳ
3. **Role change history**: Lịch sử thay đổi quyền
4. **Bulk role updates**: Cập nhật quyền hàng loạt






