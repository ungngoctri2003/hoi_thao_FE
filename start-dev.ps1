# Script để chạy cả Backend và Frontend cùng lúc
# Sử dụng: .\start-dev.ps1

Write-Host "🚀 Đang khởi động cả Backend và Frontend..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Chạy cả hai hệ thống cùng lúc
npm run dev:all
