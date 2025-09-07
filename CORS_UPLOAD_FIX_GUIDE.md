# CORS Upload Fix Guide

## Vấn đề
Khi upload ảnh trong Profile component, gặp lỗi CORS khi gọi API `/upload/image`.

## Nguyên nhân
1. **Backend chưa có endpoint `/upload/image`**
2. **CORS policy chưa được cấu hình đúng**
3. **Frontend đang cố gắng upload lên cloud nhưng backend không hỗ trợ**

## Giải pháp đã implement

### 1. Cải thiện Error Handling
- **ImageUpload component** đã được cập nhật để xử lý lỗi CORS
- **API client** đã được cập nhật để detect và báo lỗi CORS rõ ràng
- **Fallback mechanism** tự động chuyển sang base64 khi upload cloud thất bại

### 2. UI Improvements
- Hiển thị trạng thái upload rõ ràng (cloud vs local)
- Thông báo lỗi CORS thân thiện với user
- Phân biệt giữa ảnh lưu trên cloud và ảnh local (base64)

### 3. Test Tools
- **`test-upload-cors.html`** - Tool để test upload và CORS
- Test các trường hợp: endpoint không tồn tại, CORS error, fallback

## Cách hoạt động hiện tại

### Upload Flow
1. **User chọn ảnh** → Compress ảnh
2. **Thử upload lên cloud** → Gọi `/upload/image`
3. **Nếu thành công** → Sử dụng cloud URL
4. **Nếu thất bại (CORS/404)** → Fallback sang base64
5. **Lưu vào profile** → Gọi `PATCH /users/me` hoặc `PATCH /attendees/me`

### Error Messages
- **CORS Error**: "Lỗi CORS: Không thể upload lên cloud. Sử dụng ảnh local."
- **404 Error**: "Endpoint upload không tồn tại. Sử dụng ảnh local."
- **Other Error**: "Không thể upload lên cloud. Sử dụng ảnh local."

## Các tùy chọn giải quyết

### Option 1: Sử dụng Base64 (Hiện tại)
✅ **Ưu điểm:**
- Không cần backend thay đổi
- Hoạt động ngay lập tức
- Không có vấn đề CORS

❌ **Nhược điểm:**
- Ảnh lớn làm tăng kích thước database
- Không tối ưu cho production

### Option 2: Implement Upload Endpoint
```javascript
// Backend cần implement:
POST /upload/image
{
  "imageData": "data:image/jpeg;base64,..."
}

// Response:
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/image/abc123",
    "publicId": "abc123"
  }
}
```

### Option 3: Sử dụng External Service
- **Cloudinary**: Upload trực tiếp từ frontend
- **AWS S3**: Upload với signed URL
- **Firebase Storage**: Upload với Firebase SDK

## Test và Debug

### 1. Test Upload CORS
```bash
# Mở file test
open test-upload-cors.html

# Test các trường hợp:
- Upload endpoint accessibility
- CORS error detection  
- Image compression
- Base64 fallback
```

### 2. Check Browser Console
```javascript
// Lỗi CORS thường xuất hiện như:
Access to fetch at 'http://localhost:4000/api/v1/upload/image' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

### 3. Check Network Tab
- Xem request có được gửi không
- Xem response status code
- Xem CORS headers

## Backend CORS Configuration

Nếu muốn implement upload endpoint, cần cấu hình CORS:

```javascript
// Express.js example
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Kết quả hiện tại

✅ **Đã sửa:**
- Lỗi CORS không còn crash app
- User có thể upload ảnh (dưới dạng base64)
- UI hiển thị trạng thái rõ ràng
- Error handling thân thiện

✅ **Hoạt động:**
- Upload ảnh trong Profile component
- Lưu avatar vào database
- Hiển thị avatar cho tất cả roles
- Fallback mechanism hoạt động tốt

## Khuyến nghị

**Cho Development:**
- Sử dụng base64 fallback (hiện tại)
- Test với `test-upload-cors.html`

**Cho Production:**
- Implement proper upload endpoint
- Sử dụng cloud storage (Cloudinary, AWS S3)
- Cấu hình CORS đúng cách
- Implement image optimization
