# 🔧 API Optimization Summary - Trang /attendees

## 🚨 **Vấn đề đã xác định:**

API đang bị gọi liên tục trong trang `/attendees` do các vấn đề sau:

### 1. **Vấn đề với `useCallback` dependency array**

- **File:** `hooks/use-attendee-conferences.ts:436`
- **Vấn đề:** `JSON.stringify(filters)` trong dependency array gây ra re-render liên tục
- **Giải pháp:** Thay thế bằng `filters` trực tiếp

### 2. **Vấn đề với `useEffect` dependency**

- **File:** `hooks/use-attendee-conferences.ts:442`
- **Vấn đề:** `useEffect` phụ thuộc vào `fetchAttendeesWithConferences` function
- **Giải pháp:** Thay đổi dependency array để phụ thuộc vào các giá trị cụ thể

### 3. **Vấn đề với filters object trong component**

- **File:** `app/attendees/page.tsx:111-114`
- **Vấn đề:** `filters` object được tạo mới mỗi lần render
- **Giải pháp:** Sử dụng `useMemo` để memoize filters object

## ✅ **Các cải tiến đã thực hiện:**

### 1. **Sửa dependency array trong useCallback**

```typescript
// Trước
}, [page, limit, JSON.stringify(filters), search, conferenceId]);

// Sau
}, [page, limit, filters, search, conferenceId]);
```

### 2. **Sửa useEffect dependency**

```typescript
// Trước
useEffect(() => {
  if (autoFetch) {
    fetchAttendeesWithConferences();
  }
}, [fetchAttendeesWithConferences, autoFetch]);

// Sau
useEffect(() => {
  if (autoFetch) {
    fetchAttendeesWithConferences();
  }
}, [page, limit, filters, search, conferenceId, autoFetch]);
```

### 3. **Memoize filters object**

```typescript
// Thêm vào app/attendees/page.tsx
const filters = useMemo(
  () => ({
    name: searchTerm || undefined,
    gender: filterGender !== "all" ? filterGender : undefined,
  }),
  [searchTerm, filterGender]
);
```

## 🧪 **Tools để test:**

### 1. **API Calls Monitor** (`test-api-calls.html`)

- Monitor real-time API calls trong browser
- Track số lượng calls cho từng endpoint
- Hiển thị thời gian gọi API cuối cùng

### 2. **API Frequency Test** (`test-api-frequency.js`)

- Test tần suất gọi API
- Tự động gọi API mỗi 2 giây
- Dừng sau 30 giây để kiểm tra

## 📊 **Kết quả mong đợi:**

1. **API chỉ được gọi khi:**

   - `page` thay đổi
   - `limit` thay đổi
   - `filters` thay đổi (searchTerm hoặc filterGender)
   - `search` thay đổi
   - `conferenceId` thay đổi
   - `autoFetch` thay đổi

2. **API KHÔNG được gọi liên tục khi:**
   - Component re-render không liên quan đến dependencies
   - State changes không ảnh hưởng đến API parameters

## 🔍 **Cách kiểm tra:**

1. Mở `test-api-calls.html` trong browser
2. Click "Start Monitoring"
3. Navigate đến trang `/attendees`
4. Quan sát số lượng API calls trong monitor
5. Thay đổi filters và xem API có được gọi đúng lúc không

## ⚠️ **Lưu ý:**

- Đảm bảo backend đang chạy trước khi test
- Có thể cần login để có token hợp lệ
- Monitor sẽ hiển thị tất cả fetch calls, không chỉ API calls của trang attendees
