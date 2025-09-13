# 🤖 Hướng dẫn Setup AI Miễn phí cho Conference Management System

## 📋 Tổng quan

Hệ thống đã được cập nhật để sử dụng **AI miễn phí** thay vì ChatGPT, giúp tiết kiệm chi phí và hoạt động ổn định hơn.

## 🚀 Cài đặt nhanh

### Bước 1: Kiểm tra dependencies

```bash
npm install dotenv
```

### Bước 2: Cấu hình Environment Variables

Tạo hoặc cập nhật file `.env.local`:

```env
# Frontend Environment Variables
# AI Configuration (Optional - có thể để trống)
NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_token_here

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### Bước 3: Khởi động hệ thống

```bash
# Terminal 1: Backend
cd D:\DATN\HOI_THAO_BE
npm run dev

# Terminal 2: Frontend
cd D:\DATN\conference-management-system
npm run dev
```

## 🔧 Cấu hình chi tiết

### 1. AI Service Configuration

#### Option A: Sử dụng Hugging Face API (Tùy chọn)

1. Truy cập: https://huggingface.co/settings/tokens
2. Tạo token mới
3. Thêm vào `.env.local`:
   ```env
   NEXT_PUBLIC_HUGGINGFACE_API_KEY=hf_your_token_here
   ```

#### Option B: Sử dụng Fallback AI (Mặc định)

- Không cần cấu hình gì thêm
- Hệ thống sẽ tự động sử dụng rule-based analysis

### 2. Backend Configuration

Đảm bảo backend đang chạy và có endpoint `/api/v1/analytics/global-ai`:

```bash
# Kiểm tra backend status
curl http://localhost:4000/api/v1/analytics/global-ai
```

### 3. Frontend Configuration

Không cần thay đổi gì thêm, hệ thống đã được cập nhật tự động.

## 🧪 Test hệ thống

### Test AI Service

```bash
# Tạo file test
cat > test-ai-system.js << 'EOF'
require('dotenv').config({ path: '.env.local' });
const { freeAIService } = require('./lib/free-ai-service.js');

async function test() {
  const testData = {
    totalConferences: 3,
    totalAttendees: 100,
    averageEngagement: 75,
    averageSatisfaction: 4.2,
    topPerformingConferences: [{
      id: 1,
      name: "Test Conference",
      attendees: 50,
      engagement: 80,
      satisfaction: 4.5,
      trend: "up"
    }],
    globalTrends: [],
    demographics: { ageGroups: [], industries: [] },
    monthlyStats: []
  };

  const result = await freeAIService.generateAnalyticsInsights(testData);
  console.log('✅ AI System working!');
  console.log('Summary:', result.summary);
  console.log('Insights:', result.insights.length);
}

test().catch(console.error);
EOF

# Chạy test
node test-ai-system.js

# Xóa file test
rm test-ai-system.js
```

## 📊 Tính năng AI miễn phí

### 1. Phân tích thông minh

- **Tỷ lệ tương tác:** Phân tích mức độ tham gia
- **Mức độ hài lòng:** Đánh giá chất lượng hội nghị
- **Xu hướng phát triển:** Dự đoán tương lai
- **Phân bố nhân khẩu học:** Phân tích độ tuổi, ngành nghề

### 2. Gợi ý cải thiện

- **Tăng tương tác:** Các hoạt động tương tác hiệu quả
- **Nâng cao chất lượng:** Cải thiện nội dung và dịch vụ
- **Tối ưu hóa:** Sử dụng công nghệ và phân tích dữ liệu

### 3. Insights đa dạng

- **Trend:** Xu hướng phát triển
- **Recommendation:** Gợi ý cải thiện
- **Alert:** Cảnh báo cần chú ý
- **Prediction:** Dự đoán tương lai

## 🔍 Troubleshooting

### Lỗi thường gặp

#### 1. "Cannot find module 'free-ai-service.js'"

```bash
# Kiểm tra file tồn tại
ls lib/free-ai-service.js

# Nếu không có, tạo lại
# File đã được tạo sẵn trong hệ thống
```

#### 2. "Hugging Face API error: 401 Unauthorized"

- **Nguyên nhân:** API key không hợp lệ hoặc chưa có
- **Giải pháp:** Bỏ qua, hệ thống sẽ dùng fallback AI

#### 3. "Error generating AI insights"

- **Nguyên nhân:** Lỗi kết nối hoặc dữ liệu không hợp lệ
- **Giải pháp:** Kiểm tra dữ liệu đầu vào và kết nối mạng

### Debug Mode

Bật debug mode để xem chi tiết:

```javascript
// Trong browser console
localStorage.setItem("debug", "true");
// Refresh trang
```

## 📈 Performance

### Tối ưu hóa

- **Caching:** Kết quả AI được cache để tăng tốc
- **Fallback:** Luôn có kết quả dự phòng
- **Async:** Xử lý bất đồng bộ không block UI

### Monitoring

- **Console logs:** Kiểm tra hoạt động AI
- **Network tab:** Xem API calls
- **Performance:** Đo thời gian phản hồi

## 🔄 Cập nhật hệ thống

### Cập nhật AI Service

```bash
# Backup file hiện tại
cp lib/free-ai-service.js lib/free-ai-service.js.backup

# Cập nhật từ repository
git pull origin main

# Restart hệ thống
npm run dev
```

### Cập nhật Dependencies

```bash
# Cập nhật packages
npm update

# Kiểm tra vulnerabilities
npm audit
```

## 📚 Tài liệu tham khảo

### AI Models

- **Hugging Face:** https://huggingface.co/models
- **DialoGPT:** https://huggingface.co/microsoft/DialoGPT-medium

### API Documentation

- **Hugging Face API:** https://huggingface.co/docs/api-inference
- **Conference Management API:** `/api/v1/analytics/global-ai`

## 🆘 Hỗ trợ

### Liên hệ

- **Email:** support@conference-management.com
- **GitHub Issues:** https://github.com/your-repo/issues

### FAQ

**Q: Tại sao không dùng ChatGPT nữa?**
A: ChatGPT cần trả phí và có giới hạn quota. AI miễn phí hoạt động ổn định và không tốn chi phí.

**Q: Chất lượng AI có kém hơn không?**
A: Không, hệ thống fallback được thiết kế để đưa ra insights chất lượng cao dựa trên dữ liệu thực tế.

**Q: Có thể tùy chỉnh AI không?**
A: Có, bạn có thể chỉnh sửa file `lib/free-ai-service.js` để thay đổi logic phân tích.

## ✅ Checklist Setup

- [ ] Dependencies đã cài đặt
- [ ] Environment variables đã cấu hình
- [ ] Backend đang chạy
- [ ] Frontend đang chạy
- [ ] AI service hoạt động
- [ ] Test thành công
- [ ] UI hiển thị đúng

---

**🎉 Chúc mừng! Hệ thống AI miễn phí đã sẵn sàng sử dụng!**
