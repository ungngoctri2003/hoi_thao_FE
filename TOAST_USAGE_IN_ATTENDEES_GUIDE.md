# Hướng dẫn sử dụng Toast trong màn hình /attendees

## Tổng quan
Màn hình `/attendees` đã được cấu hình đúng cách để sử dụng hệ thống toast của dự án. Tất cả các thông báo đều sử dụng component toast thống nhất.

## Cấu hình hiện tại

### 1. Import và sử dụng hook
```typescript
import { useToast } from "@/hooks/use-toast";

// Trong component
const { toast } = useToast();
```

### 2. Các loại toast được sử dụng

#### Thành công (Success)
```typescript
toast({
  title: "Thành công",
  description: "Tham dự viên đã được tạo thành công!",
  variant: "success",
});
```

#### Lỗi (Error/Destructive)
```typescript
toast({
  title: "Lỗi",
  description: `Lỗi khi tạo tham dự viên: ${error.message}`,
  variant: "destructive",
});
```

#### Cảnh báo (Warning)
```typescript
toast({
  title: "Cảnh báo",
  description: "Vui lòng chọn ít nhất một tham dự viên để gửi email.",
  variant: "warning",
});
```

#### Thông tin (Info)
```typescript
toast({
  title: "Thông báo",
  description: "Tính năng chỉnh sửa hàng loạt đang được phát triển.",
  variant: "info",
});
```

## Các trường hợp sử dụng trong màn hình /attendees

### 1. Tạo tham dự viên
- **Thành công**: Khi tạo tham dự viên thành công
- **Lỗi**: Khi có lỗi xảy ra trong quá trình tạo

### 2. Cập nhật tham dự viên
- **Thành công**: Khi cập nhật thông tin thành công
- **Lỗi**: Khi có lỗi xảy ra trong quá trình cập nhật

### 3. Xóa tham dự viên
- **Thành công**: Khi xóa tham dự viên thành công
- **Lỗi**: Khi có lỗi xảy ra trong quá trình xóa

### 4. Xuất dữ liệu
- **Thành công**: Khi xuất Excel thành công
- **Lỗi**: Khi có lỗi xảy ra trong quá trình xuất

### 5. Hành động hàng loạt
- **Cảnh báo**: Khi chưa chọn tham dự viên nào
- **Cảnh báo**: Khi chọn quá nhiều tham dự viên để chỉnh sửa
- **Thông tin**: Thông báo về tính năng đang phát triển

## Cấu hình hệ thống

### 1. Component Toaster
- Được thêm vào `app/layout.tsx` và `components/layout/main-layout.tsx`
- Hiển thị toast ở góc phải màn hình
- Tự động ẩn sau 5 giây

### 2. CSS Animations
- File `styles/toast.css` chứa các animation cho toast
- Slide in từ bên phải
- Slide out về bên phải
- Fade in/out effects

### 3. Variants có sẵn
- `default`: Màu mặc định
- `destructive`: Màu đỏ cho lỗi
- `success`: Màu xanh lá cho thành công
- `warning`: Màu vàng cho cảnh báo
- `info`: Màu xanh dương cho thông tin

## Lưu ý quan trọng

1. **Không cần thay đổi gì**: Màn hình `/attendees` đã sử dụng đúng hệ thống toast của dự án
2. **Tự động ẩn**: Toast sẽ tự động ẩn sau 5 giây
3. **Có thể đóng thủ công**: Người dùng có thể click vào nút X để đóng toast
4. **Giới hạn số lượng**: Chỉ hiển thị tối đa 1 toast cùng lúc
5. **Responsive**: Toast hiển thị tốt trên cả desktop và mobile

## Kết luận
Màn hình `/attendees` đã được cấu hình hoàn chỉnh để sử dụng hệ thống toast thống nhất của dự án. Tất cả các thông báo đều sử dụng component toast với các variant phù hợp và hiển thị đúng cách.
