# Quick Fix - Conference Permissions

## Vấn đề
Navbar không hiển thị hội nghị vì database không có dữ liệu `user_conference_assignments`.

## Nguyên nhân
Từ logs console:
```
getUserConferenceAssignments response: {success: true, data: Array(0), meta: {…}}
useConferencePermissions - response.data: []
```

API trả về empty array vì không có dữ liệu trong database.

## Giải pháp nhanh

### Cách 1: Sử dụng SQL Script (Khuyến nghị)

1. **Mở database management tool** (pgAdmin, DBeaver, etc.)
2. **Chạy script SQL** sau:

```sql
-- 1. Tạo conferences nếu chưa có
INSERT INTO conferences (name, description, start_date, end_date, location, status, created_at, updated_at)
VALUES 
  ('Hội nghị Công nghệ 2024', 'Hội nghị về công nghệ và đổi mới', '2024-01-15', '2024-01-17', 'Hà Nội', 'active', NOW(), NOW()),
  ('Hội nghị AI & Machine Learning', 'Hội nghị về trí tuệ nhân tạo và học máy', '2024-02-20', '2024-02-22', 'TP.HCM', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Tạo assignments cho tất cả users
INSERT INTO user_conference_assignments (user_id, conference_id, permissions, is_active, created_at, updated_at)
SELECT 
  u.id as user_id,
  c.id as conference_id,
  CASE 
    WHEN u.role = 'admin' THEN '{"conferences.view": true, "conferences.create": true, "conferences.update": true, "conferences.delete": true, "attendees.view": true, "attendees.manage": true, "checkin.manage": true, "networking.view": true, "venue.view": true, "sessions.view": true, "badges.view": true, "analytics.view": true, "my-events.view": true, "roles.manage": true, "mobile.view": true}'
    WHEN u.role = 'staff' THEN '{"conferences.view": true, "conferences.create": true, "conferences.update": true, "attendees.view": true, "attendees.manage": true, "checkin.manage": true, "networking.view": true, "venue.view": true, "sessions.view": true, "badges.view": true, "analytics.view": true, "my-events.view": true, "mobile.view": true}'
    ELSE '{"conferences.view": true, "attendees.view": true, "networking.view": true, "venue.view": true, "sessions.view": true, "badges.view": true, "my-events.view": true, "mobile.view": true}'
  END as permissions,
  1 as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM users u
CROSS JOIN conferences c
WHERE NOT EXISTS (
  SELECT 1 FROM user_conference_assignments uca 
  WHERE uca.user_id = u.id AND uca.conference_id = c.id
);
```

### Cách 2: Sử dụng Backend API (Cần token)

1. **Lấy authentication token** từ browser:
   - Mở DevTools (F12)
   - Vào Application/Storage > Local Storage
   - Tìm `accessToken`

2. **Chạy script với token**:
```bash
# Thay YOUR_TOKEN bằng token thực
export ACCESS_TOKEN="YOUR_TOKEN"
node create-sample-data-with-token.js
```

### Cách 3: Tạo dữ liệu thủ công

1. **Tạo conferences** trong database:
   - Name: "Hội nghị Công nghệ 2024"
   - Description: "Hội nghị về công nghệ"
   - Start Date: 2024-01-15
   - End Date: 2024-01-17
   - Location: "Hà Nội"
   - Status: "active"

2. **Tạo user_conference_assignments**:
   - user_id: ID của user hiện tại
   - conference_id: ID của conference vừa tạo
   - permissions: JSON string với các quyền
   - is_active: 1

## Kiểm tra kết quả

1. **Refresh browser** sau khi tạo dữ liệu
2. **Kiểm tra navbar** - should show conferences
3. **Mở DevTools Console** - should see:
   ```
   useConferencePermissions - response.data: [Array with data]
   ConferenceSelectorCompact - availableConferences: [Array with data]
   ```

4. **Truy cập debug page**: `/debug-conference-permissions`

## Cấu trúc dữ liệu cần thiết

### Bảng `conferences`
```sql
id | name | description | start_date | end_date | location | status
1  | Hội nghị Công nghệ 2024 | ... | 2024-01-15 | 2024-01-17 | Hà Nội | active
```

### Bảng `user_conference_assignments`
```sql
id | user_id | conference_id | permissions | is_active
1  | 1       | 1             | {"conferences.view": true, ...} | 1
```

## Troubleshooting

### Nếu vẫn không hiển thị:
1. **Kiểm tra console logs** - tìm errors
2. **Kiểm tra network tab** - xem API calls
3. **Kiểm tra database** - verify data exists
4. **Restart backend server** nếu cần

### Nếu có lỗi API:
1. **Kiểm tra backend server** đang chạy
2. **Kiểm tra database connection**
3. **Kiểm tra CORS settings**
4. **Kiểm tra authentication**

## Files liên quan

- `hooks/use-conference-permissions.ts` - Main hook
- `components/layout/conference-selector.tsx` - UI component
- `create-sample-data-sql.sql` - SQL script
- `app/debug-conference-permissions/page.tsx` - Debug page
