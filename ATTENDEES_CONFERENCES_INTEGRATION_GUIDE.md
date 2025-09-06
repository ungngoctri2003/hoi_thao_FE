# Hướng dẫn Tích hợp Attendees với Conferences

## Tổng quan
Tính năng này cho phép trang `/attendees` hiển thị chỉ những hội nghị mà mỗi attendee thực sự tham gia, thay vì hiển thị tất cả hội nghị như trước đây.

## Các thay đổi chính

### 1. Hook mới: `use-attendee-conferences.ts`
- **Mục đích**: Lấy thông tin attendees kèm theo các hội nghị mà họ tham gia
- **Tính năng**:
  - Fetch danh sách attendees
  - Lấy registrations của từng attendee
  - Lấy thông tin chi tiết conference từ registration
  - Kết hợp dữ liệu thành `AttendeeWithConferences`

### 2. Cập nhật trang `/attendees`
- **Thay đổi**: Sử dụng `useAttendeeConferences` thay vì `useAttendees` và `useConferences` riêng biệt
- **Kết quả**: Mỗi attendee chỉ hiển thị những hội nghị mà họ thực sự đăng ký tham gia

### 3. Cập nhật UI Components
- **Bảng danh sách**: Hiển thị hội nghị chính xác cho từng attendee
- **Grid view**: Hiển thị hội nghị trong card view
- **Cards view**: Hiển thị hội nghị trong detailed cards
- **Stats cards**: Cập nhật số liệu thống kê

## Cấu trúc dữ liệu

### AttendeeWithConferences Interface
```typescript
export interface AttendeeWithConferences extends Attendee {
  conferences: Conference[];
  registrations: Registration[];
}
```

### Luồng dữ liệu
1. **Fetch attendees** từ API `/attendees`
2. **Với mỗi attendee**:
   - Gọi API `/attendees/{id}/registrations` để lấy danh sách đăng ký
   - Với mỗi registration, gọi API `/conferences/{conferenceId}` để lấy thông tin hội nghị
3. **Kết hợp dữ liệu** thành `AttendeeWithConferences`
4. **Hiển thị** trong UI với thông tin conference chính xác

## API Endpoints được sử dụng

### 1. GET `/api/v1/attendees`
- **Mục đích**: Lấy danh sách attendees với pagination và filters
- **Parameters**: `page`, `limit`, `filters`, `search`

### 2. GET `/api/v1/attendees/{id}/registrations`
- **Mục đích**: Lấy danh sách đăng ký của một attendee
- **Response**: Array of Registration objects

### 3. GET `/api/v1/conferences/{id}`
- **Mục đích**: Lấy thông tin chi tiết của một conference
- **Response**: Conference object

## Cách sử dụng

### 1. Import hook
```typescript
import { useAttendeeConferences } from "@/hooks/use-attendee-conferences";
```

### 2. Sử dụng trong component
```typescript
const {
  attendeesWithConferences,
  isLoading,
  error,
  pagination,
  refetch
} = useAttendeeConferences({
  page: 1,
  limit: 20,
  filters: {
    name: searchTerm || undefined,
    gender: filterGender !== "all" ? filterGender : undefined,
  },
  search: searchTerm || undefined,
  autoFetch: true
});
```

### 3. Truy cập dữ liệu
```typescript
// Lấy danh sách attendees (không có conferences)
const attendees = attendeesWithConferences.map(item => ({
  ...item,
  conferences: undefined,
  registrations: undefined
}));

// Lấy tất cả conferences duy nhất
const allConferences = attendeesWithConferences.reduce((acc, attendee) => {
  attendee.conferences.forEach(conference => {
    if (!acc.find(c => c.ID === conference.ID)) {
      acc.push(conference);
    }
  });
  return acc;
}, [] as Conference[]);

// Lấy conferences của một attendee cụ thể
const attendeeWithConferences = attendeesWithConferences.find(a => a.ID === attendeeId);
const attendeeConferences = attendeeWithConferences?.conferences || [];
```

## Hiển thị trong UI

### 1. Bảng danh sách
```typescript
<TableCell>
  <div className="max-w-32 truncate">
    <p className="text-sm font-medium">
      {attendeeConferences.length > 0 ? attendeeConferences[0].NAME : "Chưa có hội nghị"}
    </p>
    <p className="text-xs text-muted-foreground">
      {attendeeConferences.length > 1 ? `+${attendeeConferences.length - 1} hội nghị khác` : ""}
    </p>
  </div>
</TableCell>
```

### 2. Grid View
```typescript
<div className="flex items-center justify-between text-sm">
  <span>Hội nghị:</span>
  <span className="font-medium">{attendeeConferences.length > 0 ? attendeeConferences[0].NAME : "Chưa có"}</span>
</div>
```

## Lợi ích

### 1. Dữ liệu chính xác
- Mỗi attendee chỉ hiển thị những hội nghị mà họ thực sự tham gia
- Không còn hiển thị tất cả hội nghị cho tất cả attendees

### 2. Hiệu suất tốt hơn
- Chỉ fetch dữ liệu cần thiết
- Giảm thiểu việc hiển thị thông tin không liên quan

### 3. Trải nghiệm người dùng tốt hơn
- Thông tin rõ ràng và chính xác
- Dễ dàng xác định attendee tham gia hội nghị nào

## Testing

### 1. Test file: `test-attendees-conferences.html`
- Test API endpoints
- Test integration logic
- Test frontend display
- Test data processing

### 2. Cách test
1. Mở file `test-attendees-conferences.html` trong browser
2. Đảm bảo backend đang chạy
3. Click các button test để kiểm tra từng phần
4. Kiểm tra console logs để debug

## Troubleshooting

### 1. Lỗi thường gặp
- **API không trả về dữ liệu**: Kiểm tra backend có đang chạy không
- **Conferences không hiển thị**: Kiểm tra có registrations không
- **Performance chậm**: Có thể do fetch quá nhiều API calls

### 2. Debug
- Kiểm tra console logs
- Sử dụng test file để debug từng bước
- Kiểm tra network tab trong DevTools

## Tương lai

### 1. Cải tiến có thể thêm
- Cache conferences để tránh fetch lại
- Batch API calls để tối ưu performance
- Loading states cho từng attendee
- Error handling tốt hơn

### 2. Tính năng mở rộng
- Filter theo conference
- Sort theo conference
- Export data theo conference
- Bulk operations theo conference
