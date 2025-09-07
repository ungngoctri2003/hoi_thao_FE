# Hướng dẫn sửa lỗi giật liên tục trong màn hình /attendees

## Vấn đề
Màn hình `/attendees` bị giật liên tục do infinite loop và re-render không cần thiết.

## Nguyên nhân chính

### 1. Infinite Loop trong useAttendees Hook
```typescript
// ❌ Vấn đề: apiManager thay đổi mỗi lần render
const apiManager = useApiManager({...});
const fetchAttendees = useCallback(async () => {
  // logic
}, [page, limit, filters, search, apiManager]); // apiManager dependency gây infinite loop

// ❌ Vấn đề: refetch thay đổi mỗi khi fetchAttendees thay đổi
useEffect(() => {
  refetch();
}, [searchTerm, filterGender, filterConference, refetch]); // refetch dependency gây infinite loop
```

### 2. Re-render không cần thiết
```typescript
// ❌ Vấn đề: filteredAttendees được tính toán lại mỗi lần render
const filteredAttendees = attendees.filter(attendee => {
  // expensive filtering logic
}).sort((a, b) => {
  // expensive sorting logic
});
```

### 3. Hook Dependencies không ổn định
```typescript
// ❌ Vấn đề: apiManager object thay đổi mỗi lần render
const apiManager = useApiManager({
  debounceMs: 500,
  retryAttempts: 3,
  retryDelay: 2000
});
```

## Giải pháp đã áp dụng

### 1. Tạo Hook useDebouncedApi đơn giản hơn
```typescript
// hooks/use-debounced-api.ts
export function useDebouncedApi(options: DebouncedApiOptions = {}) {
  const { debounceMs = 500 } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeWithDebounce = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    // Simple debouncing logic without complex dependencies
  }, [debounceMs]);

  return {
    isLoading,
    error,
    executeWithDebounce,
    executeImmediate,
    clearError
  };
}
```

**Ưu điểm:**
- ✅ Đơn giản hơn, ít dependencies
- ✅ Không có complex retry logic gây re-render
- ✅ Stable function references

### 2. Sửa Infinite Loop trong useAttendees
```typescript
// ✅ Sửa: Loại bỏ refetch khỏi dependencies
useEffect(() => {
  refetch();
}, [searchTerm, filterGender, filterConference]); // Không có refetch dependency

// ✅ Sửa: Sử dụng debouncedApi thay vì apiManager
const debouncedApi = useDebouncedApi({
  debounceMs: 500
});

const fetchAttendees = useCallback(async (): Promise<void> => {
  await debouncedApi.executeWithDebounce(async () => {
    // API logic
  });
}, [page, limit, JSON.stringify(filters), search, debouncedApi]);
```

### 3. Tối ưu hóa Filtering với useMemo
```typescript
// ✅ Sửa: Memoize expensive filtering và sorting
const filteredAttendees = useMemo(() => {
  return attendees.filter(attendee => {
    // filtering logic
  }).sort((a, b) => {
    // sorting logic
  });
}, [attendees, searchTerm, filterGender, filterConference, sortBy, conferences]);
```

**Ưu điểm:**
- ✅ Chỉ tính toán lại khi dependencies thay đổi
- ✅ Tránh re-render không cần thiết
- ✅ Performance tốt hơn

### 4. Stable Dependencies
```typescript
// ✅ Sửa: Sử dụng JSON.stringify cho object dependencies
const fetchAttendees = useCallback(async (): Promise<void> => {
  // logic
}, [page, limit, JSON.stringify(filters), search, debouncedApi]);
```

**Ưu điểm:**
- ✅ `JSON.stringify(filters)` tạo stable string thay vì object reference
- ✅ Tránh re-render khi object structure không thay đổi

## Kết quả

### Trước khi sửa:
- ❌ Màn hình giật liên tục
- ❌ Infinite loop trong useEffect
- ❌ Re-render không cần thiết
- ❌ Performance kém
- ❌ UI không responsive

### Sau khi sửa:
- ✅ Màn hình mượt mà, không giật
- ✅ Không còn infinite loop
- ✅ Re-render tối ưu
- ✅ Performance tốt
- ✅ UI responsive

## Best Practices để tránh giật liên tục

### 1. Sử dụng useMemo cho expensive calculations
```typescript
// ✅ Good
const expensiveValue = useMemo(() => {
  return data.filter(...).sort(...).map(...);
}, [data, filters, sortBy]);

// ❌ Bad
const expensiveValue = data.filter(...).sort(...).map(...); // Tính toán mỗi render
```

### 2. Stable dependencies trong useCallback
```typescript
// ✅ Good
const fetchData = useCallback(() => {
  // logic
}, [page, limit, JSON.stringify(filters)]);

// ❌ Bad
const fetchData = useCallback(() => {
  // logic
}, [page, limit, filters]); // filters object thay đổi mỗi render
```

### 3. Tránh dependencies không cần thiết
```typescript
// ✅ Good
useEffect(() => {
  fetchData();
}, [searchTerm, filterGender]); // Chỉ dependencies cần thiết

// ❌ Bad
useEffect(() => {
  fetchData();
}, [searchTerm, filterGender, fetchData]); // fetchData dependency gây infinite loop
```

### 4. Sử dụng useRef cho values không cần re-render
```typescript
// ✅ Good
const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const abortControllerRef = useRef<AbortController | null>(null);

// ❌ Bad
const [timeout, setTimeout] = useState<NodeJS.Timeout | null>(null); // Gây re-render
```

### 5. Tách logic phức tạp thành custom hooks
```typescript
// ✅ Good
const { isLoading, error, executeWithDebounce } = useDebouncedApi({
  debounceMs: 500
});

// ❌ Bad
// Logic phức tạp trực tiếp trong component
```

## Monitoring và Debug

### 1. Sử dụng React DevTools Profiler
- Xem component nào re-render nhiều
- Kiểm tra thời gian render
- Tìm nguyên nhân re-render

### 2. Console Logs để debug
```typescript
// Thêm logs để debug
useEffect(() => {
  console.log('fetchAttendees called', { page, limit, filters, search });
  fetchAttendees();
}, [page, limit, JSON.stringify(filters), search]);
```

### 3. Kiểm tra Network Tab
- Xem số lượng API calls
- Kiểm tra timing của requests
- Xác nhận debouncing hoạt động

### 4. Performance Monitoring
```typescript
// Thêm performance marks
const startTime = performance.now();
// ... expensive operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

## Troubleshooting

### Nếu vẫn bị giật:
1. Kiểm tra có component nào khác gây re-render không
2. Xem dependencies trong useCallback/useMemo có ổn định không
3. Kiểm tra có state nào thay đổi liên tục không
4. Sử dụng React DevTools để profile

### Nếu performance vẫn kém:
1. Tăng debounceMs lên cao hơn
2. Sử dụng useMemo cho tất cả expensive calculations
3. Tách component lớn thành các component nhỏ hơn
4. Sử dụng React.memo cho components không cần re-render

### Nếu data không cập nhật:
1. Kiểm tra dependencies trong useCallback
2. Xác nhận useEffect được gọi đúng
3. Kiểm tra error logs
4. Xác nhận API calls thành công
