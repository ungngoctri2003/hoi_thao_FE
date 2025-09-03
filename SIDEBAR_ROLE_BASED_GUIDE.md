# Hướng dẫn Sidebar phân quyền

## Tổng quan
Sidebar đã được cải thiện để chỉ hiển thị những menu items mà người dùng có quyền truy cập, dựa trên role của họ.

## Cách hoạt động

### 1. Phân quyền theo Role
Sidebar tự động lọc và hiển thị các menu items dựa trên role của người dùng:

- **Admin**: Hiển thị tất cả tính năng
- **Staff**: Hiển thị các tính năng quản lý cơ bản
- **Attendee**: Chỉ hiển thị các tính năng tham dự

### 2. Cấu trúc Navigation Items
Mỗi navigation item được định nghĩa với:
- `href`: Đường dẫn trang
- `icon`: Icon hiển thị
- `label`: Tên hiển thị
- `allowedRoles`: Danh sách roles được phép truy cập
- `description`: Mô tả chức năng

### 3. Nhóm Menu Items
Menu được chia thành 3 nhóm:

#### Main Items (Chính)
- Dashboard/Trang chủ
- Thông tin cá nhân

#### Management Items (Quản lý)
- Quản lý hội nghị (Admin + Staff)
- Danh sách tham dự (Admin + Staff)
- Check-in QR (Admin + Staff)
- Phân quyền (Admin only)
- Nhật ký hệ thống (Admin only)
- Cài đặt (Admin only)

#### Feature Items (Tính năng)
- Kết nối mạng (Tất cả)
- Bản đồ địa điểm (Tất cả)
- Phiên trực tiếp (Tất cả)
- Huy hiệu số (Tất cả)
- Ứng dụng di động (Tất cả)
- Sự kiện của tôi (Attendee only)
- Phân tích AI (Admin only)

## Tính năng mới

### 1. Real-time Role Updates
- Sidebar sử dụng `useAuth()` hook để lấy role từ auth state
- Khi role thay đổi, sidebar tự động cập nhật menu items
- Không cần refresh trang

### 2. Tooltip khi Collapsed
- Khi sidebar collapsed, hover vào icon sẽ hiển thị tooltip
- Tooltip chứa tên menu, mô tả và role badge
- Giúp người dùng hiểu rõ chức năng

### 3. Role Badge trong Footer
- Hiển thị role hiện tại với màu sắc tương ứng
- Hiển thị số lượng tính năng có sẵn
- Cập nhật real-time khi role thay đổi

### 4. Role Info Panel
- Component mới hiển thị thông tin chi tiết về quyền
- Có thể expand/collapse để xem danh sách quyền hạn
- Hiển thị trong dashboard của tất cả roles

## Màu sắc Role

- **Admin**: Đỏ (`bg-red-100 text-red-800`)
- **Staff**: Xanh dương (`bg-blue-100 text-blue-800`)
- **Attendee**: Xanh lá (`bg-green-100 text-green-800`)

## Cách thêm Menu Item mới

1. Thêm item vào `allNavigationItems` array:
```typescript
{
  href: "/new-page",
  icon: NewIcon,
  label: "Trang mới",
  allowedRoles: ["admin", "staff"], // Chỉ định roles được phép
  description: "Mô tả chức năng"
}
```

2. Thêm vào nhóm phù hợp trong `groupedItems`:
```typescript
const groupedItems = {
  main: items.filter(item => 
    ["/dashboard", "/profile", "/new-page"].includes(item.href)
  ),
  // ...
};
```

## Lợi ích

### 1. Bảo mật
- Người dùng chỉ thấy những gì họ có quyền truy cập
- Giảm thiểu confusion và lỗi truy cập

### 2. UX tốt hơn
- Giao diện sạch sẽ, không cluttered
- Dễ dàng tìm thấy chức năng cần thiết
- Tooltip cung cấp thông tin hữu ích

### 3. Maintainability
- Dễ dàng thêm/sửa/xóa menu items
- Logic phân quyền tập trung
- Có thể mở rộng cho nhiều roles khác

## Troubleshooting

### Nếu menu không hiển thị đúng:
1. Kiểm tra `allowedRoles` trong navigation item
2. Kiểm tra role của user trong auth state
3. Kiểm tra console để xem lỗi

### Nếu tooltip không hoạt động:
1. Kiểm tra component `SidebarTooltip`
2. Kiểm tra CSS z-index
3. Kiểm tra hover events

### Nếu role không cập nhật:
1. Sử dụng nút "Cập nhật quyền" trong header
2. Kiểm tra `refreshPermissions()` API
3. Kiểm tra auth state management

## Tương lai

1. **Dynamic Menu**: Menu items từ server
2. **Custom Permissions**: Phân quyền chi tiết hơn
3. **Menu Analytics**: Theo dõi usage của menu items
4. **Favorites**: Cho phép user đánh dấu menu yêu thích
