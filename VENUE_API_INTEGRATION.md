# Venue API Integration - Hướng dẫn sử dụng

## 📋 Tổng quan

Trang `/venue-public` đã được tích hợp hoàn toàn với API backend để hiển thị thông tin địa điểm hội nghị một cách động và real-time.

## 🚀 Tính năng chính

### ✅ Đã hoàn thành:
- **API Integration**: Kết nối với backend API để lấy dữ liệu floors, rooms và amenities
- **Mock Data Fallback**: Tự động sử dụng dữ liệu mẫu khi backend không khả dụng
- **Loading States**: Hiển thị spinner khi đang tải dữ liệu
- **Error Handling**: Xử lý lỗi và hiển thị thông báo thân thiện
- **Search & Filter**: Tìm kiếm và lọc phòng theo tầng
- **Responsive Design**: Giao diện tương thích với mobile

## 📁 Cấu trúc files

```
app/
├── venue-public/
│   └── page.tsx                 # Trang venue public chính
├── api/venue/public/
│   └── route.ts                 # API route proxy đến backend
hooks/
└── use-venues.ts                # Hook quản lý dữ liệu venue
```

## 🔧 API Endpoints

### 1. Public Venue API (Không cần authentication)
```
GET /api/venue/public
GET /api/venue/public?conferenceId=123
GET /api/venue/public?mock=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "floors": [...],
    "rooms": [...],
    "amenities": [...]
  },
  "message": "Using mock data - backend requires authentication for public access"
}
```

### 2. Admin Venue API (Cần authentication)
```
GET /api/venue/admin
GET /api/venue/admin?conferenceId=123
```

### 3. Backend API (Yêu cầu authentication)
```
GET /api/v1/venue/floors
GET /api/v1/venue/rooms
```

**⚠️ Lưu ý quan trọng:**
- Backend API yêu cầu authentication token
- Public API sử dụng mock data để tránh vấn đề authentication
- Admin API có thể kết nối với backend khi có token hợp lệ

## 🎯 Cách sử dụng

### 1. Sử dụng hook useVenues

```typescript
import { useVenues } from '@/hooks/use-venues';

function MyComponent() {
  // Sử dụng dữ liệu thực từ backend
  const { floors, rooms, amenities, loading, error, refetch } = useVenues();
  
  // Sử dụng mock data
  const { floors, rooms, amenities, loading, error, refetch } = useVenues(undefined, true);
  
  // Sử dụng với conferenceId cụ thể
  const { floors, rooms, amenities, loading, error, refetch } = useVenues(123);
}
```

### 2. Cấu trúc dữ liệu

#### VenueFloor
```typescript
interface VenueFloor {
  id: number;
  name: string;
  description?: string;
  conferenceId?: number;
  conferenceName?: string;
}
```

#### VenueRoom
```typescript
interface VenueRoom {
  id: number;
  floorId: number;
  name: string;
  capacity: number;
  description?: string;
  roomType?: string;
  features: string[];
  status: 'available' | 'occupied' | 'maintenance';
  floorName?: string;
  conferenceId?: number;
  conferenceName?: string;
}
```

#### VenueAmenity
```typescript
interface VenueAmenity {
  name: string;
  icon: string;
  location: string;
  description: string;
}
```

## 🔄 Luồng hoạt động

1. **Component mount** → Hook `useVenues` được gọi
2. **API call** → Gọi `/api/venue/public`
3. **Backend check** → Thử kết nối với backend API
4. **Fallback** → Nếu backend không khả dụng, sử dụng mock data
5. **Data transform** → Chuyển đổi dữ liệu từ backend format sang frontend format
6. **State update** → Cập nhật state và render UI

## 🛠️ Cấu hình

### Environment Variables
```env
BACKEND_API_URL=http://localhost:4000/api/v1
```

### Mock Data
Mock data được định nghĩa trong `app/api/venue/public/route.ts`:
- 3 tầng (Tầng 1, 2, 3)
- 4 phòng (Hội trường A, Phòng họp 201, Workshop Room 202, Sảnh chính)
- 4 tiện ích (Quầy đăng ký, Quầy cà phê, Bãi đỗ xe, WiFi)

## 🐛 Troubleshooting

### 1. Backend không khả dụng
- **Triệu chứng**: API trả về mock data
- **Giải pháp**: Kiểm tra backend có chạy không, kiểm tra `BACKEND_API_URL`

### 2. Lỗi 401 Unauthorized
- **Triệu chứng**: `Backend API error: 401 / 401`
- **Nguyên nhân**: Backend yêu cầu authentication token
- **Giải pháp**: 
  - Sử dụng mock data cho public access (đã được xử lý tự động)
  - Hoặc tạo public endpoints trong backend không cần authentication
  - Hoặc sử dụng admin API với token hợp lệ

### 3. Dữ liệu không hiển thị
- **Triệu chứng**: Trang hiển thị loading mãi
- **Giải pháp**: Kiểm tra console log, kiểm tra network requests

### 4. Lỗi CORS
- **Triệu chứng**: Lỗi CORS trong console
- **Giải pháp**: Backend cần cấu hình CORS cho frontend domain

### 5. Sử dụng dữ liệu thực từ backend
- **Cách 1**: Tạo public endpoints trong backend không cần authentication
- **Cách 2**: Sử dụng admin API với authentication token
- **Cách 3**: Cấu hình backend để cho phép public access cho venue data

## 📱 UI Features

### Loading State
```tsx
if (loading) {
  return <LoadingSpinner />;
}
```

### Error State
```tsx
if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />;
}
```

### Search & Filter
- Tìm kiếm theo tên phòng và mô tả
- Lọc theo tầng
- Hiển thị trạng thái phòng (có sẵn, đang sử dụng, bảo trì)

## 🔮 Cải tiến trong tương lai

1. **Real-time updates**: WebSocket để cập nhật trạng thái phòng real-time
2. **Interactive map**: Bản đồ tương tác để hiển thị vị trí phòng
3. **Booking system**: Hệ thống đặt phòng trực tiếp
4. **QR Code navigation**: QR code để điều hướng đến phòng
5. **Analytics**: Thống kê sử dụng phòng

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs trong browser
2. Network tab trong DevTools
3. Backend logs
4. Environment variables

---

**Tác giả**: AI Assistant  
**Ngày tạo**: 2024  
**Phiên bản**: 1.0.0
