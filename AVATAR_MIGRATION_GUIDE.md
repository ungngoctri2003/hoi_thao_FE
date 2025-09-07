# Avatar Migration Guide

## Vấn đề
Hiện tại chỉ có bảng `ATTENDEES` có trường `AVATAR_URL`, còn bảng `APP_USERS` (dành cho admin/staff) không có trường avatar. Điều này dẫn đến việc admin và staff không thể có avatar.

## Giải pháp
Thêm trường `AVATAR_URL` vào bảng `APP_USERS` để admin và staff có thể có avatar.

## Các bước thực hiện

### 1. Chạy Migration Script
```sql
-- Chạy file: db/add-avatar-to-users.sql
ALTER TABLE APP_USERS ADD AVATAR_URL VARCHAR2(500);
COMMENT ON COLUMN APP_USERS.AVATAR_URL IS 'URL of user avatar image';
```

### 2. Cập nhật Seed Data (tùy chọn)
```sql
-- Thêm avatar mẫu cho admin và staff
UPDATE APP_USERS SET AVATAR_URL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' WHERE ID = 1; -- admin
UPDATE APP_USERS SET AVATAR_URL = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' WHERE ID = 2; -- staff
```

### 3. Cập nhật Backend API
Backend cần cập nhật endpoint `PATCH /users/me` để hỗ trợ cập nhật trường `AVATAR_URL`:

```javascript
// Backend cần xử lý:
{
  "name": "New Name",
  "email": "new@email.com", 
  "avatar": "https://example.com/avatar.jpg"  // Lưu vào APP_USERS.AVATAR_URL
}
```

### 4. Cập nhật Frontend API Logic
Frontend đã được cập nhật để:
- Lấy avatar từ `APP_USERS.AVATAR_URL` trước, sau đó mới từ `ATTENDEES.AVATAR_URL`
- Gọi `PATCH /users/me` để cập nhật avatar cho admin/staff
- Gọi `PATCH /attendees/me` để cập nhật avatar cho attendee

## Cấu trúc Database sau Migration

### Bảng APP_USERS (Admin/Staff)
```sql
APP_USERS (
  ID,
  EMAIL,
  NAME,
  PASSWORD_HASH,
  STATUS,
  CREATED_AT,
  LAST_LOGIN,
  AVATAR_URL  -- MỚI THÊM
)
```

### Bảng ATTENDEES (Attendees)
```sql
ATTENDEES (
  ID,
  NAME,
  EMAIL,
  PHONE,
  COMPANY,
  POSITION,
  AVATAR_URL,  -- ĐÃ CÓ SẴN
  DIETARY,
  SPECIAL_NEEDS,
  DATE_OF_BIRTH,
  GENDER,
  CREATED_AT
)
```

## Logic Avatar

### Lấy Avatar
```javascript
// Ưu tiên: APP_USERS.AVATAR_URL > ATTENDEES.AVATAR_URL
const avatar = userData.AVATAR_URL || attendeeData?.AVATAR_URL || null;
```

### Lưu Avatar
```javascript
// Admin/Staff: Lưu vào APP_USERS.AVATAR_URL
PATCH /users/me { "avatar": "url" }

// Attendee: Lưu vào ATTENDEES.AVATAR_URL  
PATCH /attendees/me { "avatarUrl": "url" }
```

## Test
1. Chạy migration script
2. Mở `test-avatar-save.html` để test
3. Kiểm tra Profile page có thể upload avatar cho tất cả roles

## Kết quả
- ✅ Admin có thể có avatar (lưu trong APP_USERS.AVATAR_URL)
- ✅ Staff có thể có avatar (lưu trong APP_USERS.AVATAR_URL)  
- ✅ Attendee có thể có avatar (lưu trong ATTENDEES.AVATAR_URL)
- ✅ Tất cả users có thể upload avatar qua Profile page
- ✅ Avatar hiển thị đúng cho tất cả roles
