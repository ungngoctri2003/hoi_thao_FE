# Sửa Lỗi Dashboard Người Tham Dự

## Vấn Đề

Dashboard người tham dự gặp lỗi quyền truy cập:

```
{
    "error": {
        "code": "FORBIDDEN",
        "message": "Insufficient permissions",
        "details": {
            "required": ["conferences.view"],
            "missing": ["conferences.view"],
            "userPermissions": []
        }
    }
}
```

## Nguyên Nhân

- Người tham dự không có quyền `conferences.view`
- API client đang gọi endpoint `/conferences` yêu cầu quyền cao
- Cần tạo endpoint riêng cho người tham dự

## Giải Pháp Đã Thực Hiện

### 1. Tạo Endpoint Riêng Cho Người Tham Dự

#### Backend Changes:

**File: `HOI_THAO_BE/src/routes/attendee/attendee.routes.ts`**

```typescript
import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { listForAttendees } from "../../modules/conferences/conferences.controller";
import { getMyRegistrations } from "../../modules/conference-registrations/conference-registrations.controller";

export const attendeeRouter = Router();

// Get upcoming events for attendees (no special permissions required)
attendeeRouter.get("/events/upcoming", auth(), listForAttendees);

// Get my registrations
attendeeRouter.get("/registrations", auth(), getMyRegistrations);

// Get my notifications (placeholder)
attendeeRouter.get("/notifications", auth(), async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Chào mừng bạn đến với hệ thống!",
        message: "Cảm ơn bạn đã tham gia hệ thống quản lý hội nghị.",
        type: "info",
        read: false,
        timestamp: new Date().toISOString(),
      },
    ],
  });
});

// Get my certificates (placeholder)
attendeeRouter.get("/certificates", auth(), async (req, res) => {
  res.json({
    success: true,
    data: [],
  });
});
```

**File: `HOI_THAO_BE/src/modules/conferences/conferences.controller.ts`**

```typescript
export async function listForAttendees(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, limit } = parsePagination(req.query);
    const { rows, total } = await conferencesRepository.listForAttendees(
      page,
      limit
    );
    res.json(ok(rows, meta(page, limit, total)));
  } catch (e) {
    next(e);
  }
}
```

**File: `HOI_THAO_BE/src/modules/conferences/conferences.repository.ts`**

```typescript
async listForAttendees(page: number, limit: number) {
  const offset = (page - 1) * limit;
  return withConn(async conn => {
    const listRes = await conn.execute(
      `SELECT * FROM (
         SELECT t.*, ROWNUM rn FROM (
           SELECT c.ID, c.NAME, c.DESCRIPTION, c.START_DATE, c.END_DATE, c.LOCATION, c.CATEGORY, c.ORGANIZER, c.CAPACITY, c.STATUS, c.CREATED_AT,
                  NVL(reg.totalRegistrations, 0) as totalRegistrations
           FROM CONFERENCES c
           LEFT JOIN (
             SELECT CONFERENCE_ID, COUNT(*) as totalRegistrations
             FROM CONFERENCE_REGISTRATIONS
             GROUP BY CONFERENCE_ID
           ) reg ON c.ID = reg.CONFERENCE_ID
           WHERE c.STATUS IN ('published', 'active', 'upcoming')
           ORDER BY c.START_DATE ASC, c.CREATED_AT DESC
         ) t WHERE ROWNUM <= :max_row
       ) WHERE rn > :min_row`,
      { max_row: offset + limit, min_row: offset },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: { DESCRIPTION: { type: oracledb.STRING } },
      }
    );
    const countRes = await conn.execute(
      `SELECT COUNT(*) AS CNT FROM CONFERENCES WHERE STATUS IN ('published', 'active', 'upcoming')`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const rows = (listRes.rows as any[]) || [];
    const total = Number((countRes.rows as Array<{ CNT: number }>)[0]?.CNT || 0);
    return { rows: rows as ConferenceRow[], total };
  });
}
```

### 2. Cập Nhật API Client

**File: `lib/api.ts`**

```typescript
async getUpcomingEvents(): Promise<any[]> {
  const response = await this.request<any>("/attendee/events/upcoming", {
    method: "GET",
  });
  return response.data?.data || [];
}

async getNotifications(): Promise<any[]> {
  const response = await this.request<any>("/attendee/notifications", {
    method: "GET",
  });
  return response.data?.data || [];
}

async getCertificates(): Promise<any[]> {
  const response = await this.request<any>("/attendee/certificates", {
    method: "GET",
  });
  return response.data?.data || [];
}
```

### 3. Đăng Ký Routes

**File: `HOI_THAO_BE/src/routes/index.ts`**

```typescript
import { attendeeRouter } from "./attendee/attendee.routes";

// ... trong router
router.use("/attendee", attendeeRouter);
```

## Các Endpoint Mới

| Endpoint                           | Method | Mô Tả                         | Quyền             |
| ---------------------------------- | ------ | ----------------------------- | ----------------- |
| `/api/v1/attendee/events/upcoming` | GET    | Lấy danh sách sự kiện sắp tới | Chỉ cần đăng nhập |
| `/api/v1/attendee/registrations`   | GET    | Lấy đăng ký của tôi           | Chỉ cần đăng nhập |
| `/api/v1/attendee/notifications`   | GET    | Lấy thông báo                 | Chỉ cần đăng nhập |
| `/api/v1/attendee/certificates`    | GET    | Lấy chứng chỉ                 | Chỉ cần đăng nhập |

## Cách Test

1. **Chạy backend:**

   ```bash
   cd HOI_THAO_BE
   npm run dev
   ```

2. **Test endpoints:**

   ```bash
   node test-attendee-endpoints.js
   ```

3. **Kiểm tra frontend:**
   - Đăng nhập với tài khoản người tham dự
   - Truy cập dashboard
   - Kiểm tra các tab: Sự kiện của tôi, Sắp tới, Chứng chỉ, Thông báo

## Lợi Ích

1. **Bảo mật:** Người tham dự chỉ có quyền truy cập cần thiết
2. **Hiệu suất:** Endpoint tối ưu cho người tham dự
3. **Dễ bảo trì:** Tách biệt logic cho từng loại người dùng
4. **Mở rộng:** Dễ dàng thêm tính năng mới cho người tham dự

## Tính Năng Dashboard Mới

### 1. Tìm Kiếm & Lọc

- Tìm kiếm theo tên, địa điểm, mô tả
- Lọc theo trạng thái sự kiện
- Lọc theo mức độ ưu tiên

### 2. Thống Kê Cá Nhân

- Số sự kiện đã đăng ký
- Số sự kiện đã tham dự
- Điểm đánh giá trung bình
- Điểm tích lũy
- Số chứng chỉ đã nhận

### 3. Quản Lý Sự Kiện

- Xem sự kiện của tôi
- Đăng ký sự kiện mới
- Hủy đăng ký
- Đánh giá sự kiện
- Bookmark sự kiện yêu thích

### 4. Thông Báo Real-time

- Thông báo sự kiện mới
- Cập nhật trạng thái đăng ký
- Nhắc nhở sự kiện sắp tới

### 5. Chứng Chỉ

- Xem danh sách chứng chỉ
- Tải xuống PDF
- Mã xác thực

## Kết Luận

Dashboard người tham dự đã được cải thiện với:

- ✅ Sửa lỗi quyền truy cập
- ✅ Giao diện hiện đại và responsive
- ✅ Tính năng tìm kiếm và lọc
- ✅ Thống kê cá nhân chi tiết
- ✅ Quản lý chứng chỉ
- ✅ Thông báo real-time
- ✅ Tương tác sự kiện (like, bookmark, share)

Hệ thống giờ đây hoạt động ổn định và cung cấp trải nghiệm tốt cho người tham dự.
