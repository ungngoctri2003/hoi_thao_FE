# Hướng dẫn thiết lập Firebase Authentication

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Nhấn "Create a project" hoặc "Add project"
3. Nhập tên project (ví dụ: conference-management-system)
4. Chọn có/không sử dụng Google Analytics
5. Nhấn "Create project"

## Bước 2: Bật Authentication

1. Trong Firebase Console, chọn "Authentication" từ menu bên trái
2. Nhấn "Get started"
3. Chuyển đến tab "Sign-in method"
4. Bật "Google" provider
5. Nhập thông tin project support email
6. Nhấn "Save"

## Bước 3: Lấy thông tin cấu hình

1. Trong Firebase Console, nhấn vào biểu tượng ⚙️ (Settings) > "Project settings"
2. Cuộn xuống phần "Your apps"
3. Nhấn "Add app" > chọn biểu tượng web (</>)
4. Nhập tên app (ví dụ: Conference Management Web)
5. Nhấn "Register app"
6. Copy thông tin cấu hình Firebase

## Bước 4: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Bước 5: Cấu hình Authorized Domains

1. Trong Firebase Console > Authentication > Settings
2. Thêm domain của bạn vào "Authorized domains":
   - `localhost` (cho development)
   - Domain production của bạn

## Bước 6: Cấu hình OAuth Consent Screen (nếu cần)

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project Firebase của bạn
3. Đi đến "APIs & Services" > "OAuth consent screen"
4. Cấu hình thông tin app nếu chưa có

## Lưu ý quan trọng

- Không commit file `.env.local` vào git
- Đảm bảo tất cả environment variables có prefix `NEXT_PUBLIC_` để có thể sử dụng ở client-side
- Test authentication trên cả development và production environment
