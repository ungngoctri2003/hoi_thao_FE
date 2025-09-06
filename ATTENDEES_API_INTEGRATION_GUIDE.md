# Hướng dẫn tích hợp API Attendees

## Tổng quan

Trang quản lý attendees đã được tích hợp hoàn toàn với API backend, cung cấp đầy đủ các chức năng CRUD và hiển thị dữ liệu thực từ database.

## Các tính năng đã được tích hợp

### 1. Hiển thị dữ liệu thực
- ✅ Kết nối với API backend
- ✅ Hiển thị danh sách attendees từ database
- ✅ Phân trang (pagination)
- ✅ Tìm kiếm và lọc dữ liệu
- ✅ Hiển thị thông tin chi tiết

### 2. Chức năng CRUD
- ✅ **Create**: Thêm attendee mới
- ✅ **Read**: Xem danh sách và chi tiết attendee
- ✅ **Update**: Chỉnh sửa thông tin attendee
- ✅ **Delete**: Xóa attendee

### 3. Giao diện người dùng
- ✅ 3 chế độ hiển thị: List, Grid, Cards
- ✅ Bộ lọc nâng cao (giới tính, hội nghị, sắp xếp)
- ✅ Tìm kiếm theo tên, email, công ty
- ✅ Dialog chi tiết với form chỉnh sửa
- ✅ Xử lý lỗi và loading states

## Cấu trúc file

### API Layer
```
lib/
├── config.ts                    # Cấu hình API
└── api/
    └── attendees-api.ts         # API functions cho attendees
```

### Hooks
```
hooks/
└── use-attendees.ts            # Custom hooks cho attendees
```

### Components
```
components/
└── attendees/
    └── attendee-dialog.tsx     # Dialog cho CRUD operations
```

### Pages
```
app/
└── attendees/
    └── page.tsx                # Trang chính quản lý attendees
```

## Cách sử dụng

### 1. Cấu hình API
Đảm bảo biến môi trường `NEXT_PUBLIC_API_URL` được cấu hình đúng:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Chạy backend
Đảm bảo backend đang chạy trên port 3001:

```bash
cd D:\DATN\HOI_THAO_BE
npm run dev
```

### 3. Chạy frontend
```bash
cd D:\DATN\conference-management-system
npm run dev
```

### 4. Truy cập trang attendees
Mở trình duyệt và truy cập: `http://localhost:3000/attendees`

## API Endpoints được sử dụng

### Attendees
- `GET /api/attendees` - Lấy danh sách attendees
- `GET /api/attendees/:id` - Lấy chi tiết attendee
- `POST /api/attendees` - Tạo attendee mới
- `PATCH /api/attendees/:id` - Cập nhật attendee
- `DELETE /api/attendees/:id` - Xóa attendee
- `GET /api/attendees/search` - Tìm kiếm attendees

### Conferences
- `GET /api/conferences` - Lấy danh sách conferences

## Cấu trúc dữ liệu

### Attendee Object
```typescript
interface Attendee {
  ID: number;
  NAME: string;
  EMAIL: string;
  PHONE: string | null;
  COMPANY: string | null;
  POSITION: string | null;
  AVATAR_URL: string | null;
  DIETARY: string | null;
  SPECIAL_NEEDS: string | null;
  DATE_OF_BIRTH: Date | null;
  GENDER: string | null;
  CREATED_AT: Date;
}
```

### Conference Object
```typescript
interface Conference {
  ID: number;
  NAME: string;
  DESCRIPTION?: string;
  START_DATE: Date;
  END_DATE: Date;
  STATUS: string;
  VENUE?: string;
  CREATED_AT: Date;
}
```

## Tính năng nâng cao

### 1. Pagination
- Hỗ trợ phân trang với configurable page size
- Hiển thị thông tin trang hiện tại và tổng số trang
- Navigation buttons (Trước/Sau)

### 2. Search & Filter
- Tìm kiếm theo tên, email, công ty
- Lọc theo giới tính
- Lọc theo hội nghị
- Sắp xếp theo nhiều tiêu chí

### 3. Responsive Design
- 3 chế độ hiển thị phù hợp với mọi kích thước màn hình
- Mobile-friendly interface

### 4. Error Handling
- Xử lý lỗi API một cách graceful
- Hiển thị thông báo lỗi rõ ràng
- Retry functionality

## Testing

### Test API trực tiếp
Sử dụng file `test-attendees-api.html` để test các API endpoints:

1. Mở file `test-attendees-api.html` trong trình duyệt
2. Cấu hình API URL (mặc định: http://localhost:3001/api)
3. Test các chức năng CRUD

### Test Frontend
1. Truy cập trang attendees
2. Test các chức năng:
   - Xem danh sách attendees
   - Tìm kiếm và lọc
   - Thêm attendee mới
   - Chỉnh sửa attendee
   - Xóa attendee
   - Chuyển đổi chế độ hiển thị

## Troubleshooting

### Lỗi thường gặp

1. **API không kết nối được**
   - Kiểm tra backend có đang chạy không
   - Kiểm tra URL API trong config
   - Kiểm tra CORS settings

2. **Lỗi authentication**
   - Kiểm tra token trong localStorage
   - Đảm bảo user đã đăng nhập
   - Kiểm tra quyền truy cập

3. **Dữ liệu không hiển thị**
   - Kiểm tra console để xem lỗi
   - Kiểm tra network tab trong DevTools
   - Kiểm tra response từ API

### Debug
1. Mở DevTools (F12)
2. Kiểm tra Console tab để xem lỗi
3. Kiểm tra Network tab để xem API calls
4. Sử dụng test file để verify API hoạt động

## Cải tiến trong tương lai

- [ ] Thêm bulk operations (xóa nhiều, cập nhật nhiều)
- [ ] Export/Import dữ liệu
- [ ] Advanced filtering với date ranges
- [ ] Real-time updates với WebSocket
- [ ] Advanced search với full-text search
- [ ] Thêm validation cho form inputs
- [ ] Thêm confirmation dialogs cho delete operations
- [ ] Thêm toast notifications cho success/error messages

## Kết luận

Trang quản lý attendees đã được tích hợp hoàn toàn với API backend, cung cấp đầy đủ các chức năng cần thiết cho việc quản lý người tham dự hội nghị. Tất cả các chức năng đều hoạt động với dữ liệu thực từ database và có giao diện thân thiện với người dùng.
