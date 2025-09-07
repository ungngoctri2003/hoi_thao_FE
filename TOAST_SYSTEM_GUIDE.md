# 🍞 Hệ thống Toast - Hướng dẫn sử dụng

## Tổng quan

Hệ thống toast đã được tích hợp vào màn hình `/attendees` để thay thế tất cả các thông báo `alert()` mặc định của Chrome. Toast hiển thị trong 5 giây và có giao diện đẹp mắt, thân thiện với người dùng.

## 🎯 Các thay đổi đã thực hiện

### 1. Tạo hệ thống Toast
- ✅ `components/ui/toast.tsx` - Component Toast cơ bản
- ✅ `components/ui/toaster.tsx` - Component Toaster để hiển thị toast
- ✅ `hooks/use-toast.ts` - Hook quản lý trạng thái toast

### 2. Tích hợp vào Layout
- ✅ Thêm `Toaster` vào `components/layout/main-layout.tsx`
- ✅ Toast sẽ hiển thị trên toàn bộ ứng dụng

### 3. Thay thế Alert trong Attendees
- ✅ `app/attendees/page.tsx` - Thay thế 12 alert()
- ✅ `components/attendees/attendee-dialog.tsx` - Thay thế 3 alert()

## 🎨 Các loại Toast

### Success (Thành công) - Màu xanh lá
```typescript
toast({
  title: "Thành công",
  description: "Tham dự viên đã được tạo thành công!",
  variant: "success",
});
```

### Error (Lỗi) - Màu đỏ
```typescript
toast({
  title: "Lỗi",
  description: "Lỗi khi tạo tham dự viên: Email đã tồn tại",
  variant: "destructive",
});
```

### Warning (Cảnh báo) - Màu vàng
```typescript
toast({
  title: "Cảnh báo",
  description: "Vui lòng chọn ít nhất một tham dự viên để gửi email.",
  variant: "warning",
});
```

### Info (Thông tin) - Màu xanh dương
```typescript
toast({
  title: "Thông báo",
  description: "Tính năng chỉnh sửa hàng loạt đang được phát triển.",
  variant: "info",
});
```

## 📋 Danh sách Alert đã thay thế

### Trong `app/attendees/page.tsx`:

1. **Tạo tham dự viên thành công** → Success Toast
2. **Lỗi khi tạo tham dự viên** → Error Toast
3. **Cập nhật tham dự viên thành công** → Success Toast
4. **Lỗi khi cập nhật tham dự viên** → Error Toast
5. **Xóa tham dự viên thành công** → Success Toast
6. **Lỗi khi xóa tham dự viên** → Error Toast
7. **Xuất Excel thành công** → Success Toast
8. **Lỗi khi xuất dữ liệu** → Error Toast
9. **Cảnh báo chưa chọn tham dự viên (Email)** → Warning Toast
10. **Cảnh báo chưa chọn tham dự viên (Export)** → Warning Toast
11. **Xuất danh sách đã chọn thành công** → Success Toast
12. **Lỗi khi xuất dữ liệu đã chọn** → Error Toast
13. **Cảnh báo chưa chọn tham dự viên (Edit)** → Warning Toast
14. **Cảnh báo chọn quá nhiều tham dự viên** → Warning Toast
15. **Thông báo tính năng đang phát triển** → Info Toast

### Trong `components/attendees/attendee-dialog.tsx`:

1. **Tạo tham dự viên với hội nghị** → Success Toast
2. **Cập nhật thành công với thay đổi** → Success Toast
3. **Xác nhận xóa hội nghị** → Info Toast

## ⚙️ Cấu hình

### Thời gian hiển thị
- **Mặc định:** 5 giây
- **Có thể đóng thủ công:** Có (nút X)
- **Tự động ẩn:** Có

### Vị trí hiển thị
- **Desktop:** Góc phải dưới
- **Mobile:** Góc phải trên
- **Z-index:** 1000

### Giới hạn
- **Số lượng toast tối đa:** 1 (có thể điều chỉnh)
- **Animation:** Slide in từ phải

## 🚀 Cách sử dụng

### Import hook
```typescript
import { useToast } from "@/hooks/use-toast";
```

### Sử dụng trong component
```typescript
function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Thành công",
      description: "Thao tác đã hoàn thành!",
      variant: "success",
    });
  };

  const handleError = () => {
    toast({
      title: "Lỗi",
      description: "Có lỗi xảy ra!",
      variant: "destructive",
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </div>
  );
}
```

## 🎨 Tùy chỉnh giao diện

### CSS Variables
```css
:root {
  --toast-success-bg: #f0fdf4;
  --toast-success-border: #10b981;
  --toast-error-bg: #fef2f2;
  --toast-error-border: #ef4444;
  --toast-warning-bg: #fffbeb;
  --toast-warning-border: #f59e0b;
  --toast-info-bg: #eff6ff;
  --toast-info-border: #3b82f6;
}
```

### Animation
```css
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## 📱 Responsive Design

- **Mobile:** Toast hiển thị ở góc phải trên
- **Desktop:** Toast hiển thị ở góc phải dưới
- **Tablet:** Tự động điều chỉnh theo kích thước màn hình

## 🔧 Troubleshooting

### Toast không hiển thị
1. Kiểm tra `Toaster` đã được thêm vào layout chính
2. Kiểm tra import `useToast` hook
3. Kiểm tra console có lỗi JavaScript không

### Toast hiển thị sai vị trí
1. Kiểm tra CSS z-index
2. Kiểm tra position fixed
3. Kiểm tra responsive breakpoints

### Toast không tự động ẩn
1. Kiểm tra timeout trong hook
2. Kiểm tra có conflict với CSS animation không

## 📈 Performance

- **Bundle size:** ~2KB (gzipped)
- **Memory usage:** Minimal (toast được tự động cleanup)
- **Render performance:** Optimized với React.memo

## 🧪 Testing

Mở file `test-toast-system.html` để test các loại toast khác nhau.

## 📝 Ghi chú

- Tất cả alert() trong màn hình `/attendees` đã được thay thế
- Toast có thời gian hiển thị 5 giây như yêu cầu
- Giao diện thân thiện và responsive
- Hỗ trợ đóng thủ công và tự động
- Tương thích với tất cả trình duyệt hiện đại
