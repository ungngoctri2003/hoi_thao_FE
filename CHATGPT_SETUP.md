# Hướng dẫn tích hợp ChatGPT

## 1. Cấu hình API Key

### Frontend (.env.local)

```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Backend (.env)

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## 2. Lấy OpenAI API Key

1. Truy cập https://platform.openai.com/
2. Đăng nhập hoặc tạo tài khoản
3. Vào API Keys section
4. Tạo API key mới
5. Copy và paste vào file .env

## 3. Cài đặt dependencies

### Frontend

```bash
npm install
```

### Backend

```bash
npm install
```

## 4. Khởi động ứng dụng

### Backend

```bash
cd D:\DATN\HOI_THAO_BE
npm run dev
```

### Frontend

```bash
cd D:\DATN\conference-management-system
npm run dev
```

## 5. Tính năng ChatGPT

- **AI Insights**: Phân tích thông minh dữ liệu hội nghị
- **Summary**: Tóm tắt tổng quan tình hình
- **Recommendations**: Gợi ý cải thiện cụ thể
- **Real-time updates**: Cập nhật tự động khi có thay đổi

## 6. Troubleshooting

### Lỗi API Key

- Kiểm tra API key có đúng không
- Đảm bảo có credit trong tài khoản OpenAI
- Kiểm tra rate limits

### Lỗi kết nối

- Kiểm tra internet connection
- Kiểm tra firewall settings
- Thử lại sau ít phút

## 7. Cost Management

- Sử dụng model gpt-3.5-turbo để tiết kiệm chi phí
- Có thể điều chỉnh max_tokens trong code
- Monitor usage trên OpenAI dashboard
