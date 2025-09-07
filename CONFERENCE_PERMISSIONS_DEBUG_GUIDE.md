# Conference Permissions Debug Guide

## Vấn đề
Navbar không hiển thị hội nghị và quyền, mặc dù đã loại bỏ hardcode data.

## Các bước debug

### 1. Kiểm tra API Backend
```bash
# Chạy test API
node test-conference-permissions-api.js

# Hoặc test thủ công
curl http://localhost:4000/api/v1/user-conference-assignments
curl http://localhost:4000/api/v1/conferences
curl http://localhost:4000/api/v1/users
```

### 2. Kiểm tra Database
```sql
-- Kiểm tra bảng user_conference_assignments
SELECT * FROM user_conference_assignments;

-- Kiểm tra bảng conferences
SELECT * FROM conferences;

-- Kiểm tra bảng users
SELECT * FROM users;

-- Tạo dữ liệu mẫu nếu cần
INSERT INTO user_conference_assignments (user_id, conference_id, permissions, is_active) 
VALUES (1, 1, '{"conferences.view": true, "attendees.view": true}', 1);
```

### 3. Tạo dữ liệu mẫu
```bash
# Chạy script tạo dữ liệu mẫu
node create-conference-assignments.js
```

### 4. Kiểm tra Frontend
1. Mở browser DevTools (F12)
2. Vào tab Console
3. Tìm kiếm logs bắt đầu với "useConferencePermissions"
4. Kiểm tra network tab để xem API calls

### 5. Sử dụng Debug Component
1. Truy cập `/debug-conference-permissions`
2. Xem thông tin debug chi tiết
3. Kiểm tra debug info và error messages

## Các nguyên nhân có thể

### 1. Database trống
- Không có dữ liệu trong bảng `user_conference_assignments`
- Không có dữ liệu trong bảng `conferences`
- Không có dữ liệu trong bảng `users`

### 2. API không hoạt động
- Backend server không chạy
- API endpoint không đúng
- CORS issues
- Authentication issues

### 3. Frontend issues
- Hook không được gọi
- API call thất bại
- Data parsing lỗi
- Component không render

### 4. Authentication issues
- User không được authenticate
- Token expired
- User ID không đúng

## Cách sửa

### 1. Tạo dữ liệu mẫu
```bash
# Chạy script tạo dữ liệu
node create-conference-assignments.js
```

### 2. Kiểm tra API
```bash
# Test API endpoints
node test-conference-permissions-api.js
```

### 3. Debug Frontend
1. Mở `/debug-conference-permissions`
2. Xem debug info
3. Kiểm tra console logs
4. Test refresh permissions

### 4. Kiểm tra Database
```sql
-- Tạo dữ liệu mẫu thủ công
INSERT INTO conferences (name, description, start_date, end_date) 
VALUES ('Hội nghị Công nghệ 2024', 'Hội nghị về công nghệ', '2024-01-01', '2024-01-03');

INSERT INTO user_conference_assignments (user_id, conference_id, permissions, is_active) 
VALUES (1, 1, '{"conferences.view": true, "attendees.view": true, "checkin.manage": true}', 1);
```

## Test Cases

### 1. Empty Database
- Tạo dữ liệu mẫu
- Kiểm tra navbar hiển thị hội nghị

### 2. API Error
- Tắt backend server
- Kiểm tra error handling
- Kiểm tra empty state

### 3. No User Assignments
- User không có assignments
- Kiểm tra "Không có hội nghị" message

### 4. Invalid Permissions
- Permissions JSON không hợp lệ
- Kiểm tra error handling

## Files liên quan

- `hooks/use-conference-permissions.ts` - Main hook
- `hooks/use-conference-permissions-debug.ts` - Debug version
- `components/layout/conference-selector.tsx` - UI component
- `components/debug/conference-permissions-debug.tsx` - Debug component
- `app/debug-conference-permissions/page.tsx` - Debug page
- `test-conference-permissions-api.js` - API test script
- `create-conference-assignments.js` - Data creation script

## Logs để theo dõi

### Console Logs
```
useConferencePermissions - fetchConferencePermissions called
useConferencePermissions - starting API call for user: [USER_ID]
useConferencePermissions - response.data: [RESPONSE]
useConferencePermissions - permissions: [PERMISSIONS]
```

### Network Tab
- `GET /api/v1/user-conference-assignments?userId=[USER_ID]`
- Response status: 200
- Response data: Array of assignments

### Debug Info
- `debugInfo.step`: Current step in the process
- `debugInfo.responseData`: API response
- `debugInfo.permissions`: Transformed permissions
- `debugInfo.error`: Any errors
