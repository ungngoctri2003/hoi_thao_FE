# Tính năng Phê duyệt Đăng ký Người tham dự

## Tổng quan

Tính năng này cho phép người tham dự đăng ký tham gia hội nghị với trạng thái "chờ duyệt" (pending). Admin hoặc nhân viên cần phải duyệt đăng ký trước khi người tham dự có thể chính thức tham gia hội nghị với trạng thái "đã đăng ký" (registered).

## Các thay đổi đã thực hiện

### 1. Backend Changes (HOI_THAO_BE)

#### 1.1 Database Migration
**File**: `src/database/add-pending-status-to-registrations.sql`

Thêm migration SQL để:
- Thêm trạng thái 'pending' vào bảng REGISTRATIONS
- Thêm cột APPROVED_BY (ID của user phê duyệt)
- Thêm cột APPROVED_AT (thời gian phê duyệt)
- Thêm index cho cột STATUS để tăng hiệu suất truy vấn
- Cập nhật default status thành 'pending'

**Cách chạy migration:**
```sql
-- Chạy file SQL này trong Oracle database
@src/database/add-pending-status-to-registrations.sql
```

#### 1.2 TypeScript Types Update
**File**: `src/modules/registrations/registrations.repository.ts`

Cập nhật type `RegistrationRow`:
```typescript
export type RegistrationRow = {
  ID: number;
  ATTENDEE_ID: number;
  CONFERENCE_ID: number;
  REGISTRATION_DATE: Date;
  STATUS: 'pending' | 'registered' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show';
  QR_CODE: string | null;
  APPROVED_BY?: number | null;
  APPROVED_AT?: Date | null;
};
```

#### 1.3 Repository Methods
**File**: `src/modules/registrations/registrations.repository.ts`

Thêm 2 phương thức mới:
- `approve(id: number, approvedBy: number)` - Phê duyệt đăng ký
- `reject(id: number, approvedBy: number)` - Từ chối đăng ký

Cả hai phương thức đều:
- Cập nhật STATUS và APPROVED_BY, APPROVED_AT
- Chỉ hoạt động với đăng ký có STATUS = 'pending'
- Trả về thông tin registration đã cập nhật

#### 1.4 Controller Methods
**File**: `src/modules/registrations/registrations.controller.ts`

Thêm 2 controller methods:
- `approveRegistration()` - Xử lý request phê duyệt
- `rejectRegistration()` - Xử lý request từ chối

Cả hai đều:
- Kiểm tra authentication
- Validate registration tồn tại và có status 'pending'
- Gọi repository method tương ứng
- Trả về registration đã cập nhật

#### 1.5 API Routes
**File**: `src/routes/registrations/registrations.routes.ts`

Thêm 2 endpoints mới:
```typescript
POST /api/v1/registrations/:id/approve  // Phê duyệt đăng ký
POST /api/v1/registrations/:id/reject   // Từ chối đăng ký
```

Cả hai đều yêu cầu:
- Authentication (`auth()` middleware)
- Permission `checkin.manage` (`rbac()` middleware)
- Ghi log audit (`audit()` middleware)

#### 1.6 Public Registration Endpoint
**File**: `src/modules/registrations/registrations.repository.ts`

Cập nhật phương thức `create()`:
- Default STATUS thành 'pending' thay vì 'registered'
- Cho phép override STATUS khi cần (cho admin/staff tạo trực tiếp)

### 2. Frontend Changes (conference-management-system)

#### 2.1 API Client Update
**File**: `lib/api/attendees-api.ts`

Cập nhật:
- Interface `Registration` để bao gồm status 'pending' và các field mới
- Interface `CheckinStatus` để bao gồm status 'pending'
- Class `RegistrationsAPI` thêm 2 methods:
  - `approveRegistration(registrationId: number)`
  - `rejectRegistration(registrationId: number)`

#### 2.2 Attendees Management Page
**File**: `app/attendees/page.tsx`

**Badge Updates:**
- Cập nhật `getRegistrationStatusBadge()` - Thêm pending status với màu vàng (⏳ Chờ duyệt)
- Cập nhật `getCheckinStatusBadge()` - Thêm pending status với màu vàng (⏳ Chờ duyệt)

**Filter Updates:**
- Thêm option "⏳ Chờ duyệt" vào dropdown filter trạng thái
- Người dùng có thể lọc để xem chỉ những đăng ký đang chờ duyệt

**Action Handlers:**
Thêm 2 handlers mới:
- `handleApproveRegistration(registration)` - Gọi API approve
- `handleRejectRegistration(registration)` - Gọi API reject

Cả hai đều:
- Validate registration data
- Call corresponding API endpoint
- Refresh data sau khi thành công
- Show error nếu có lỗi

**UI Updates:**
Thêm nút approve/reject trong bảng danh sách:
- Chỉ hiển thị khi user có quyền `canManage`
- Chỉ hiển thị khi registration có STATUS = 'pending'
- 2 nút với tooltips:
  - ✅ Nút xanh "Duyệt đăng ký" (approve)
  - ❌ Nút đỏ "Từ chối đăng ký" (reject)

**Export Updates:**
- Cập nhật hàm `handleExportExcel()` để bao gồm pending status
- Cập nhật hàm `handleBulkExport()` để bao gồm pending status

## Quy trình sử dụng

### 1. Người tham dự đăng ký
1. Người dùng truy cập `/register-attendee`
2. Điền form đăng ký với đầy đủ thông tin
3. Submit form
4. Hệ thống tạo:
   - User account
   - Attendee record
   - Registration với STATUS = 'pending'
5. Thông báo "Đăng ký thành công! Vui lòng chờ admin duyệt."

### 2. Admin/Staff duyệt đăng ký
1. Đăng nhập với tài khoản admin/staff
2. Vào trang `/attendees`
3. Lọc "Chờ duyệt" để xem tất cả đăng ký pending
4. Xem thông tin người đăng ký
5. Quyết định:
   - Click nút ✅ xanh để **Duyệt** → STATUS chuyển thành 'registered'
   - Click nút ❌ đỏ để **Từ chối** → STATUS chuyển thành 'cancelled'
6. Hệ thống tự động refresh danh sách

### 3. Người tham dự sau khi được duyệt
- Nếu approved: Có thể check-in tại hội nghị
- Nếu rejected: Không thể tham dự, cần đăng ký lại

## Trạng thái Registration

| Status | Mô tả | Icon | Màu |
|--------|-------|------|-----|
| pending | Chờ duyệt - Mới đăng ký, chưa được admin duyệt | ⏳ | Vàng |
| registered | Đã đăng ký - Đã được admin duyệt | 📝 | Xanh dương |
| checked-in | Đã check-in - Đã check-in tại hội nghị | ✅ | Xanh lá |
| checked-out | Đã check-out - Đã check-out khỏi hội nghị | 🚪 | Cam |
| cancelled | Đã hủy - Bị từ chối hoặc tự hủy | ❌ | Đỏ |
| no-show | Không tham dự - Đăng ký nhưng không đến | ⏰ | Xám |

## Permissions

Các permission cần thiết:
- **Approve/Reject**: Yêu cầu permission `checkin.manage`
- **View pending list**: Yêu cầu permission `attendees.view`
- **Create registration**: Public endpoint, không cần permission

## Testing

### 1. Test Database Migration
```sql
-- Kiểm tra constraint đã được tạo
SELECT constraint_name, constraint_type, search_condition 
FROM user_constraints 
WHERE table_name = 'REGISTRATIONS' AND constraint_name = 'CHK_REGISTRATION_STATUS';

-- Kiểm tra index
SELECT index_name, column_name 
FROM user_ind_columns 
WHERE table_name = 'REGISTRATIONS' AND index_name = 'IDX_REGISTRATIONS_STATUS';

-- Kiểm tra foreign key
SELECT constraint_name, r_constraint_name 
FROM user_constraints 
WHERE table_name = 'REGISTRATIONS' AND constraint_name = 'FK_REGISTRATION_APPROVED_BY';
```

### 2. Test Backend API
```bash
# Tạo registration mới (sẽ có status = 'pending')
curl -X POST http://localhost:4000/api/v1/registrations/public \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "conferenceId": 1
  }'

# Approve registration
curl -X POST http://localhost:4000/api/v1/registrations/1/approve \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Reject registration
curl -X POST http://localhost:4000/api/v1/registrations/2/reject \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Test Frontend
1. Mở `/register-attendee` và đăng ký tài khoản mới
2. Kiểm tra registration có status = 'pending'
3. Login với admin account
4. Vào `/attendees`
5. Lọc "Chờ duyệt"
6. Click nút approve/reject
7. Verify status được cập nhật đúng

## Troubleshooting

### Lỗi khi chạy migration
**Lỗi**: "unique constraint violated"
**Giải pháp**: Có thể constraint name bị trùng, đổi tên constraint hoặc drop constraint cũ trước

### Lỗi khi approve/reject
**Lỗi**: "Only pending registrations can be approved"
**Giải pháp**: Registration không ở trạng thái pending, kiểm tra lại STATUS hiện tại

### Nút approve/reject không hiển thị
**Nguyên nhân**:
1. User không có permission `checkin.manage`
2. Registration không có STATUS = 'pending'
3. Frontend chưa fetch đầy đủ registration data

**Giải pháp**: Kiểm tra permissions và data flow

## Notes

- Chỉ có registration với STATUS = 'pending' mới có thể approve/reject
- Mỗi action (approve/reject) đều được log trong audit_logs
- Sau khi approve/reject, không thể thay đổi lại trừ khi admin update trực tiếp database
- QR code vẫn được tạo ngay khi registration được tạo (pending), nhưng chỉ active sau khi approved

## Future Enhancements

1. **Email Notifications**
   - Gửi email thông báo khi đăng ký thành công (pending)
   - Gửi email thông báo khi được approve
   - Gửi email thông báo khi bị reject (với lý do)

2. **Bulk Approve/Reject**
   - Cho phép admin chọn nhiều registration và approve/reject hàng loạt

3. **Approval Comments**
   - Thêm field để admin ghi chú lý do approve/reject
   - Hiển thị lý do cho người tham dự

4. **Automatic Approval**
   - Tự động approve các email từ domain được whitelist
   - Tự động approve sau X giờ nếu không có action

5. **Dashboard Statistics**
   - Hiển thị số lượng registration đang chờ duyệt
   - Biểu đồ tỷ lệ approve/reject

## Files Changed

### Backend
- ✅ `src/database/add-pending-status-to-registrations.sql` (NEW)
- ✅ `src/modules/registrations/registrations.repository.ts`
- ✅ `src/modules/registrations/registrations.controller.ts`
- ✅ `src/routes/registrations/registrations.routes.ts`

### Frontend
- ✅ `lib/api/attendees-api.ts`
- ✅ `app/attendees/page.tsx`

## Deployment Checklist

- [ ] Backup database trước khi chạy migration
- [ ] Chạy migration SQL trên production database
- [ ] Deploy backend code mới
- [ ] Deploy frontend code mới
- [ ] Test approve/reject workflow
- [ ] Verify permissions đang hoạt động đúng
- [ ] Monitor logs và error reports
- [ ] Thông báo cho users về tính năng mới

## Author
- Date: 2025-10-02
- Version: 1.0.0




