# Tính năng phân loại người dùng trong Messaging

## Tổng quan

Đã thêm tính năng phân loại người dùng trong popup thêm người dùng của màn hình messaging theo 3 loại:

- **Hội nghị**: Người dùng đã được gán cho hội nghị cụ thể
- **Hệ thống**: Người dùng hệ thống chưa tham gia hội nghị nào
- **Chưa tham gia**: Người dùng chưa được gán cho hội nghị nào

## Các thay đổi đã thực hiện

### 1. Backend (HOI_THAO_BE)

#### A. Repository Layer

- **File**: `src/modules/users/users.repository.ts`
- **Thêm method**: `getUsersByConferenceCategory(conferenceId?, currentUserId?)`
- **Chức năng**:
  - Lấy người dùng theo danh mục hội nghị
  - Hỗ trợ lọc theo hội nghị cụ thể
  - Loại bỏ người dùng hiện tại
  - Phân loại tự động: conference, system, non_conference

#### B. Controller Layer

- **File**: `src/modules/users/users.controller.ts`
- **Thêm function**: `getUsersByConferenceCategory(req, res, next)`
- **Chức năng**: Xử lý API request và trả về dữ liệu người dùng đã phân loại

#### C. Routes

- **File**: `src/routes/users/users.routes.ts`
- **Thêm route**: `GET /users/by-conference-category`
- **Chức năng**: Endpoint có xác thực để lấy người dùng theo danh mục

#### D. Messaging Endpoints

- **File**: `src/app.ts`
- **Thêm endpoint**: `GET /messaging/users-by-category`
- **Chức năng**: Endpoint không cần xác thực để test

### 2. Frontend (conference-management-system)

#### A. API Client

- **File**: `lib/api.ts`
- **Thêm method**: `getUsersByConferenceCategory(conferenceId?)`
- **Chức năng**: Gọi API backend và map dữ liệu về format frontend

#### B. Messaging Page

- **File**: `app/messaging/page.tsx`
- **Thay đổi chính**:
  - Thêm state: `userCategory`, `conferenceId`
  - Cập nhật `loadAvailableUsers()` để sử dụng API mới
  - Thêm tabs phân loại trong popup
  - Hiển thị badge category cho mỗi người dùng
  - Thêm useEffect để reload khi category thay đổi

## Cách sử dụng

### 1. Trong Messaging Page

1. Click nút "Thêm người dùng"
2. Chọn tab phân loại:
   - **Tất cả**: Hiển thị tất cả người dùng
   - **Hội nghị**: Chỉ người dùng đã tham gia hội nghị
   - **Hệ thống**: Người dùng hệ thống chưa tham gia hội nghị
   - **Chưa tham gia**: Người dùng chưa được gán hội nghị
3. Tìm kiếm theo tên hoặc email
4. Click "Thêm" để thêm người dùng vào chat

### 2. API Endpoints

#### Lấy người dùng theo danh mục (có xác thực)

```
GET /api/v1/users/by-conference-category?conferenceId=1
```

#### Lấy người dùng theo danh mục (không xác thực - test)

```
GET /messaging/users-by-category?conferenceId=1
```

## Cấu trúc dữ liệu

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "attendee",
      "status": "active",
      "avatar": "avatar_url",
      "company": "Company Name",
      "position": "Position",
      "userType": "app_user",
      "category": "conference",
      "conferenceName": "Conference Name"
    }
  ]
}
```

### Category Values

- `conference`: Người dùng đã tham gia hội nghị
- `system`: Người dùng hệ thống chưa tham gia hội nghị
- `non_conference`: Người dùng chưa được gán hội nghị

## Test

### File test

- **File**: `test-users-by-category.js`
- **Chức năng**: Test các API endpoint mới

### Chạy test

```bash
node test-users-by-category.js
```

## Lưu ý kỹ thuật

1. **Database**: Sử dụng bảng `user_conference_assignments` để xác định người dùng thuộc hội nghị nào
2. **Deduplication**: Loại bỏ trùng lặp dựa trên email (ưu tiên app_user hơn attendee)
3. **Performance**: Query được tối ưu với CTE (Common Table Expression)
4. **Error Handling**: Xử lý lỗi đầy đủ ở cả frontend và backend
5. **TypeScript**: Đảm bảo type safety cho tất cả interfaces

## Tương lai

Có thể mở rộng thêm:

- Filter theo hội nghị cụ thể trong UI
- Search trong từng category riêng biệt
- Bulk add users từ category
- Export danh sách theo category

