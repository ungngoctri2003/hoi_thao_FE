# PowerShell script để setup AI miễn phí
# Chạy: .\setup-ai-free.ps1

Write-Host "🤖 Setting up Free AI for Conference Management System..." -ForegroundColor Green
Write-Host ""

# Kiểm tra Node.js
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Kiểm tra npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Cài đặt dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install dotenv
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Kiểm tra file cấu hình
Write-Host "⚙️ Checking configuration files..." -ForegroundColor Yellow

# Kiểm tra .env.local
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local found" -ForegroundColor Green
} else {
    Write-Host "⚠️ .env.local not found, creating template..." -ForegroundColor Yellow
    @"
# Frontend Environment Variables
# AI Configuration (Optional - có thể để trống)
NEXT_PUBLIC_HUGGINGFACE_API_KEY=

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:4000
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local created" -ForegroundColor Green
}

# Kiểm tra AI service files
if (Test-Path "lib\free-ai-service.js") {
    Write-Host "✅ Free AI service found" -ForegroundColor Green
} else {
    Write-Host "❌ Free AI service not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "lib\chatgpt-service.ts") {
    Write-Host "✅ ChatGPT service updated" -ForegroundColor Green
} else {
    Write-Host "❌ ChatGPT service not found" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test AI service
Write-Host "🧪 Testing AI service..." -ForegroundColor Yellow
try {
    # Tạo file test tạm thời
    @"
require('dotenv').config({ path: '.env.local' });
const { freeAIService } = require('./lib/free-ai-service.js');

async function test() {
  const testData = {
    totalConferences: 2,
    totalAttendees: 50,
    averageEngagement: 70,
    averageSatisfaction: 4.0,
    topPerformingConferences: [],
    globalTrends: [],
    demographics: { ageGroups: [], industries: [] },
    monthlyStats: []
  };
  
  const result = await freeAIService.generateAnalyticsInsights(testData);
  console.log('✅ AI Service Test: PASSED');
  console.log('Summary:', result.summary.substring(0, 100) + '...');
  console.log('Insights count:', result.insights.length);
}

test().catch(err => {
  console.log('❌ AI Service Test: FAILED');
  console.log('Error:', err.message);
  process.exit(1);
});
"@ | Out-File -FilePath "test-ai-temp.js" -Encoding UTF8

    # Chạy test
    $testResult = node test-ai-temp.js 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AI service test passed" -ForegroundColor Green
        Write-Host $testResult -ForegroundColor Gray
    } else {
        Write-Host "❌ AI service test failed" -ForegroundColor Red
        Write-Host $testResult -ForegroundColor Red
    }
    
    # Xóa file test
    Remove-Item "test-ai-temp.js" -ErrorAction SilentlyContinue
} catch {
    Write-Host "❌ Failed to test AI service" -ForegroundColor Red
}

Write-Host ""

# Hướng dẫn tiếp theo
Write-Host "🚀 Setup completed! Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Start Backend:" -ForegroundColor Cyan
Write-Host "   cd D:\DATN\HOI_THAO_BE" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend (in new terminal):" -ForegroundColor Cyan
Write-Host "   cd D:\DATN\conference-management-system" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/ai-analytics" -ForegroundColor White
Write-Host ""
Write-Host "4. Optional - Get Hugging Face API key:" -ForegroundColor Cyan
Write-Host "   https://huggingface.co/settings/tokens" -ForegroundColor White
Write-Host "   Add to .env.local: NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_token" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Free AI system is ready to use!" -ForegroundColor Green
Write-Host "📚 Read AI_FREE_SETUP_GUIDE.md for detailed documentation" -ForegroundColor Yellow
