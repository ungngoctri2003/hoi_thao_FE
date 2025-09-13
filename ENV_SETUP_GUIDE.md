# Hướng dẫn cấu hình Environment Variables

## 1. Tạo file .env.local cho Frontend

Tạo file `.env.local` trong thư mục `D:\DATN\conference-management-system` với nội dung:

```bash
# Frontend Environment Variables
# OpenAI API Configuration for ChatGPT
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

## 2. Tạo file .env cho Backend

Tạo file `.env` trong thư mục `D:\DATN\HOI_THAO_BE` với nội dung:

```bash
# Backend Environment Variables
# OpenAI API Configuration for ChatGPT
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL=your_database_url_here

# Other configurations...
```

## 3. Lấy OpenAI API Key

1. Truy cập https://platform.openai.com/
2. Đăng nhập hoặc tạo tài khoản
3. Vào API Keys section
4. Tạo API key mới
5. Copy và paste vào cả 2 file .env

## 4. Cách tạo file .env.local

### Cách 1: Sử dụng Command Line

```bash
# Trong thư mục frontend
echo "NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here" > .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" >> .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:4000" >> .env.local
```

### Cách 2: Sử dụng VS Code

1. Mở VS Code trong thư mục `D:\DATN\conference-management-system`
2. Tạo file mới tên `.env.local`
3. Copy nội dung từ trên vào file
4. Thay `your_openai_api_key_here` bằng API key thật

### Cách 3: Sử dụng Notepad

1. Mở Notepad
2. Copy nội dung từ trên
3. Lưu file với tên `.env.local` trong thư mục frontend

## 5. Kiểm tra cấu hình

Sau khi tạo file, chạy lệnh để kiểm tra:

```bash
# Trong thư mục frontend
node -e "console.log('OpenAI API Key configured:', !!process.env.NEXT_PUBLIC_OPENAI_API_KEY);"
```

## 6. Khởi động ứng dụng

```bash
# Backend (Terminal 1)
cd D:\DATN\HOI_THAO_BE
npm run dev

# Frontend (Terminal 2)
cd D:\DATN\conference-management-system
npm run dev
```

## 7. Truy cập trang

- Vào http://localhost:3000/ai-analytics
- Đăng nhập với tài khoản admin
- ChatGPT sẽ tự động phân tích dữ liệu

## Lưu ý quan trọng

- **Không commit file .env.local vào git**
- **API key phải giống nhau ở cả frontend và backend**
- **Restart server sau khi thay đổi .env**
- **Kiểm tra console để xem lỗi nếu có**
