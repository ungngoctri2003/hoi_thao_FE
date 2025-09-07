# Hướng dẫn sửa lỗi 429 (Too Many Requests) trong màn hình /attendees

## Vấn đề
Màn hình `/attendees` gặp lỗi 429 (Too Many Requests) do gửi quá nhiều API calls trong thời gian ngắn, gây ra infinite loop và spam requests.

## Nguyên nhân chính

### 1. Infinite Loop trong useAttendees hook
- `fetchAttendees` có dependencies `[page, limit, filters, search]`
- `useEffect` gọi `fetchAttendees` mỗi khi dependencies thay đổi
- Trong `page.tsx`, có nhiều `useEffect` gọi `refetch()` liên tục

### 2. Multiple API calls
- Cả `getAttendees` và `getConferences` được gọi cùng lúc trong `Promise.all`
- Mỗi lần `refetch()` được gọi, cả 2 API đều được gọi lại

### 3. Debouncing không hiệu quả
- Search debouncing chỉ áp dụng cho `searchTerm` nhưng không áp dụng cho các filter khác

### 4. Backend Rate Limiting
- Backend có rate limiting: 100 requests per minute (60000ms window)
- Frontend gửi quá nhiều requests vượt quá giới hạn này

## Giải pháp đã áp dụng

### 1. Tạo API Manager Hook (`hooks/use-api-manager.ts`)
```typescript
// Quản lý debouncing, retry logic, và rate limiting
const apiManager = useApiManager({
  debounceMs: 500,        // Debounce 500ms
  retryAttempts: 3,       // Retry tối đa 3 lần
  retryDelay: 2000        // Delay 2s giữa các retry
});
```

**Tính năng:**
- **Debouncing**: Tự động delay requests để tránh spam
- **Retry Logic**: Tự động retry khi gặp lỗi 429
- **Exponential Backoff**: Tăng dần thời gian delay giữa các retry
- **Request Queue**: Quản lý queue requests để tránh conflict
- **Abort Controller**: Hủy requests cũ khi có requests mới

### 2. Cập nhật AttendeesAPI (`lib/api/attendees-api.ts`)
```typescript
// Thêm rate limiting cho từng API class
private readonly MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests
private requestQueue: Array<() => Promise<any>> = [];
private isProcessing = false;
```

**Tính năng:**
- **Request Queue**: Xếp hàng requests thay vì gửi đồng thời
- **Rate Limiting**: Đảm bảo tối thiểu 100ms giữa các requests
- **Sequential Processing**: Xử lý requests tuần tự để tránh spam

### 3. Cập nhật useAttendees Hook (`hooks/use-attendees.ts`)
```typescript
// Sử dụng API Manager thay vì logic cũ
const apiManager = useApiManager({
  debounceMs: 500,
  retryAttempts: 3,
  retryDelay: 2000
});

const fetchAttendees = useCallback(async (): Promise<void> => {
  await apiManager.executeWithDebounce(async () => {
    // API calls logic
  });
}, [page, limit, JSON.stringify(filters), search, apiManager]);
```

**Cải tiến:**
- **Stable Dependencies**: Sử dụng `JSON.stringify(filters)` để tránh re-render
- **API Manager Integration**: Tự động debouncing và retry
- **Error Handling**: Xử lý lỗi 429 một cách thông minh

### 4. Cập nhật Page Component (`app/attendees/page.tsx`)
```typescript
// Đơn giản hóa useEffect
useEffect(() => {
  refetch();
}, [searchTerm, filterGender, filterConference, refetch]);
```

**Cải tiến:**
- **Simplified Logic**: Loại bỏ logic phức tạp, để API Manager xử lý
- **Single useEffect**: Chỉ một useEffect thay vì nhiều useEffect riêng biệt
- **Automatic Debouncing**: API Manager tự động debounce tất cả requests

## Kết quả

### Trước khi sửa:
- ❌ Gửi hàng trăm requests trong vài giây
- ❌ Lỗi 429 (Too Many Requests) liên tục
- ❌ Infinite loop trong useEffect
- ❌ UI bị lag và không responsive

### Sau khi sửa:
- ✅ Chỉ gửi 1 request mỗi 500ms (debounced)
- ✅ Tự động retry khi gặp lỗi 429
- ✅ Không còn infinite loop
- ✅ UI mượt mà và responsive
- ✅ Rate limiting được tuân thủ

## Cách sử dụng

### 1. Sử dụng API Manager trong hook mới:
```typescript
const apiManager = useApiManager({
  debounceMs: 500,        // Debounce time
  retryAttempts: 3,       // Số lần retry
  retryDelay: 2000        // Delay giữa retry
});

// Debounced request
await apiManager.executeWithDebounce(async () => {
  // API call logic
});

// Immediate request
await apiManager.executeImmediate(async () => {
  // API call logic
});
```

### 2. Sử dụng trong component:
```typescript
const { isLoading, error, refetch } = useAttendees({
  page: currentPage,
  limit: pageSize,
  filters: { /* filters */ },
  search: searchTerm,
  autoFetch: true
});

// API Manager sẽ tự động debounce và retry
useEffect(() => {
  refetch();
}, [searchTerm, filterGender, refetch]);
```

## Monitoring và Debug

### 1. Kiểm tra Network Tab:
- Xem số lượng requests được gửi
- Kiểm tra thời gian giữa các requests
- Xác nhận không còn spam requests

### 2. Console Logs:
```typescript
// API Manager sẽ log các thông tin debug
console.log('Request queued');
console.log('Request executed');
console.log('Retry attempt:', attempt);
```

### 3. Error Handling:
```typescript
// Lỗi 429 sẽ được xử lý tự động
if (error?.includes('429')) {
  // Tự động retry với exponential backoff
}
```

## Best Practices

### 1. Luôn sử dụng API Manager cho API calls:
```typescript
// ✅ Good
const apiManager = useApiManager();
await apiManager.executeWithDebounce(apiCall);

// ❌ Bad
await apiCall(); // Không có rate limiting
```

### 2. Cấu hình debounce phù hợp:
```typescript
// Search: 500ms
const searchManager = useApiManager({ debounceMs: 500 });

// Filter: 300ms  
const filterManager = useApiManager({ debounceMs: 300 });

// Critical: 100ms
const criticalManager = useApiManager({ debounceMs: 100 });
```

### 3. Xử lý dependencies đúng cách:
```typescript
// ✅ Good - Stable dependencies
const filters = useMemo(() => ({ gender, status }), [gender, status]);
const fetchData = useCallback(() => {
  // logic
}, [page, limit, JSON.stringify(filters)]);

// ❌ Bad - Unstable dependencies
const fetchData = useCallback(() => {
  // logic
}, [page, limit, filters]); // filters object changes every render
```

## Troubleshooting

### Nếu vẫn gặp lỗi 429:
1. Kiểm tra `debounceMs` có quá thấp không
2. Tăng `retryDelay` lên cao hơn
3. Kiểm tra có component nào khác gọi API không
4. Xem backend logs để xác nhận rate limit

### Nếu UI bị lag:
1. Giảm `debounceMs` xuống thấp hơn
2. Kiểm tra có quá nhiều re-renders không
3. Sử dụng `useMemo` cho expensive calculations

### Nếu data không cập nhật:
1. Kiểm tra dependencies trong `useCallback`
2. Xác nhận `autoFetch` được set đúng
3. Kiểm tra error logs trong console
