# 🤖 AI Miễn phí - Hướng dẫn nhanh

## ⚡ Setup nhanh (1 phút)

### Cách 1: Chạy script tự động

```bash
# Windows
.\setup-ai-free.bat

# PowerShell
.\setup-ai-free.ps1
```

### Cách 2: Setup thủ công

```bash
# 1. Cài đặt dependencies
npm install dotenv

# 2. Khởi động backend
cd D:\DATN\HOI_THAO_BE
npm run dev

# 3. Khởi động frontend (terminal mới)
cd D:\DATN\conference-management-system
npm run dev

# 4. Mở browser
# http://localhost:3000/ai-analytics
```

## ✅ Kiểm tra hoạt động

1. Mở http://localhost:3000/ai-analytics
2. Đăng nhập với tài khoản admin
3. Xem phần "AI Insights" - sẽ hiển thị "AI miễn phí"

## 🔧 Cấu hình tùy chọn

### Thêm Hugging Face API (không bắt buộc)

1. Truy cập: https://huggingface.co/settings/tokens
2. Tạo token mới
3. Thêm vào `.env.local`:
   ```env
   NEXT_PUBLIC_HUGGINGFACE_API_KEY=hf_your_token_here
   ```

## 📊 Tính năng

- ✅ **Phân tích thông minh** dữ liệu hội nghị
- ✅ **Insights đa dạng**: Trend, Recommendation, Alert, Prediction
- ✅ **Gợi ý cải thiện** dựa trên dữ liệu thực tế
- ✅ **Hoàn toàn miễn phí** - không cần API key
- ✅ **Fallback system** - luôn hoạt động ổn định

## 🆘 Troubleshooting

### Lỗi "Cannot find module"

```bash
npm install dotenv
```

### Lỗi "AI service not found"

```bash
# Kiểm tra file tồn tại
ls lib/free-ai-service.js
```

### Backend không chạy

```bash
cd D:\DATN\HOI_THAO_BE
npm run dev
```

## 📚 Tài liệu chi tiết

- **Hướng dẫn đầy đủ**: `AI_FREE_SETUP_GUIDE.md`
- **API Documentation**: `/api/v1/analytics/global-ai`

---

**🎉 Chúc mừng! Hệ thống AI miễn phí đã sẵn sàng!**
