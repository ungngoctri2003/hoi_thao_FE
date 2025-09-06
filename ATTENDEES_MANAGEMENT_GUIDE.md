# 📋 Hướng dẫn Quản lý Người Tham Dự Toàn Bộ Hội Nghị

## 🎯 Tổng quan

Hệ thống quản lý người tham dự đã được cập nhật để hỗ trợ quản lý toàn bộ hội nghị với phân quyền rõ ràng:

- **Admin**: Có thể quản lý danh sách người tham dự từ tất cả hội nghị
- **Staff**: Chỉ có thể quản lý danh sách người tham dự trong từng hội nghị cụ thể
- **Attendee**: Không có quyền quản lý

## 🔐 Phân quyền Truy cập

### Admin (Quản trị viên)
- ✅ Truy cập trang `/attendees` - Quản lý người tham dự toàn bộ hội nghị
- ✅ Xem danh sách người tham dự từ tất cả hội nghị
- ✅ Lọc theo hội nghị cụ thể
- ✅ Thêm, sửa, xóa người tham dự
- ✅ Xuất danh sách Excel
- ✅ Thực hiện các hành động hàng loạt

### Staff (Nhân viên)
- ❌ KHÔNG thể truy cập trang `/attendees` toàn bộ hội nghị
- ✅ Có thể truy cập danh sách người tham dự trong từng hội nghị cụ thể
- ✅ Truy cập thông qua sidebar hội nghị: `Hội nghị > Danh sách tham dự`
- ✅ Chỉ thấy người tham dự của hội nghị được phân quyền

### Attendee (Người tham dự)
- ❌ KHÔNG có quyền quản lý người tham dự
- ❌ KHÔNG thể truy cập trang `/attendees`

## 🚀 Tính năng Chính

### 1. Quản lý Toàn Bộ Hội Nghị (Admin)
- **Địa chỉ**: `/attendees`
- **Tiêu đề**: "Quản lý người tham dự toàn bộ hội nghị"
- **Mô tả**: "Quản lý và theo dõi thông tin chi tiết của người tham dự từ tất cả hội nghị"

### 2. Bộ Lọc Nâng Cao
- **Lọc theo hội nghị**: Dropdown chọn hội nghị cụ thể
- **Lọc theo trạng thái**: Đã đăng ký, Đã check-in, Đã hủy, Không tham dự
- **Lọc theo ngành nghề**: Công nghệ, Marketing, Tài chính, Y tế, Giáo dục
- **Lọc theo cấp độ**: Đồng, Bạc, Vàng, Bạch kim
- **Lọc theo loại tham dự**: VIP, Diễn giả, Tình nguyện viên, Nhà tài trợ

### 3. Hiển thị Dữ liệu
- **Cột hội nghị**: Hiển thị tên hội nghị của từng người tham dự
- **Thông tin chi tiết**: Tên, email, công ty, chức vụ, trạng thái
- **Điểm số**: Điểm tích lũy, điểm tương tác, điểm networking
- **Hoạt động**: Số phiên tham dự, thời gian tham dự, số câu hỏi

### 4. Chế độ Xem
- **Danh sách**: Bảng chi tiết với đầy đủ thông tin
- **Lưới**: Thẻ nhỏ gọn, dễ quét qua
- **Thẻ**: Thẻ lớn với thông tin đầy đủ

## 🛠️ Cấu hình Kỹ thuật

### Sidebar Navigation
```typescript
// Trong components/layout/sidebar.tsx
{
  href: "/attendees", 
  icon: Users, 
  label: "Quản lý người tham dự", 
  requiredPermissions: ["attendees.manage"],
  description: "Quản lý danh sách người tham dự toàn bộ hội nghị",
  adminOnly: true  // Chỉ admin mới thấy
}
```

### Phân quyền Truy cập
```typescript
// Trong app/attendees/page.tsx
const isAdmin = user?.role === 'admin';

if (!isAdmin) {
  return (
    <MainLayout>
      <Card>
        <CardTitle>Không có quyền truy cập</CardTitle>
        <CardDescription>
          Chỉ quản trị viên mới có thể truy cập quản lý người tham dự toàn bộ hội nghị
        </CardDescription>
      </Card>
    </MainLayout>
  );
}
```

### Bộ Lọc Hội Nghị
```typescript
// Lọc theo hội nghị
const matchesConference = filterConference === "all" || 
  (attendee.conferenceId && 
   conferences.find(c => c.id === attendee.conferenceId)?.name === filterConference);
```

## 📊 Dữ liệu Mẫu

### Hội Nghị
- Hội nghị Công nghệ 2024
- Workshop AI & Machine Learning  
- Seminar Khởi nghiệp
- Hội thảo Y tế
- Hội nghị Blockchain

### Người Tham Dự Mẫu
- **Nguyễn Văn A**: CEO TechCorp, Hội nghị Công nghệ 2024, VIP, Speaker
- **Trần Thị B**: AI Research Director, Workshop AI & ML, Speaker
- **Lê Văn C**: Blockchain Architect, Seminar Khởi nghiệp, Speaker
- **Phạm Thị D**: Marketing Manager, Hội thảo Y tế, Đã hủy
- **Hoàng Văn E**: Product Manager, Hội nghị Blockchain, Vắng mặt

## 🧪 Testing

### Test Files
- `test-attendees-permissions.html`: Test giao diện và phân quyền
- `test-attendees-frontend.js`: Test logic frontend
- `test-attendees-api.js`: Test API và backend

### Chạy Test
```bash
# Test frontend
node test-attendees-frontend.js

# Test API (cần backend chạy)
node test-attendees-api.js

# Test giao diện
# Mở test-attendees-permissions.html trong browser
```

## 🔧 Troubleshooting

### Lỗi Thường Gặp

1. **Staff vẫn thấy mục "Quản lý người tham dự"**
   - Kiểm tra `adminOnly: true` trong sidebar config
   - Kiểm tra logic `userRole === 'admin'`

2. **Admin không thể truy cập trang**
   - Kiểm tra `isAdmin = user?.role === 'admin'`
   - Kiểm tra token authentication

3. **Bộ lọc hội nghị không hoạt động**
   - Kiểm tra state `filterConference`
   - Kiểm tra logic lọc `matchesConference`

4. **Dữ liệu không hiển thị**
   - Kiểm tra mock data trong `useEffect`
   - Kiểm tra API endpoint

### Debug Steps
1. Mở Developer Tools (F12)
2. Kiểm tra Console logs
3. Kiểm tra Network requests
4. Kiểm tra Local Storage cho user role
5. Kiểm tra Redux state (nếu có)

## 📈 Cải tiến Tương lai

### Tính năng Có thể Thêm
- [ ] Import/Export Excel nâng cao
- [ ] Gửi email hàng loạt
- [ ] Thống kê và báo cáo
- [ ] Tích hợp QR code check-in
- [ ] Real-time updates
- [ ] Advanced search với filters
- [ ] Bulk actions (xóa, cập nhật hàng loạt)
- [ ] Export PDF reports

### Tối ưu Performance
- [ ] Pagination cho danh sách lớn
- [ ] Virtual scrolling
- [ ] Caching dữ liệu
- [ ] Lazy loading
- [ ] Debounced search

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong console
2. Chạy test files để xác định lỗi
3. Kiểm tra cấu hình phân quyền
4. Liên hệ team phát triển

---

**Phiên bản**: 1.0.0  
**Cập nhật cuối**: $(date)  
**Tác giả**: Development Team
