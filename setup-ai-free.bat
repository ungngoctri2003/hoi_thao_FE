@echo off
chcp 65001 >nul
echo 🤖 Setting up Free AI for Conference Management System...
echo.

echo 📋 Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js found

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm first.
    pause
    exit /b 1
)
echo ✅ npm found
echo.

echo 📦 Installing dependencies...
npm install dotenv
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

echo ⚙️ Checking configuration files...

if not exist ".env.local" (
    echo ⚠️ .env.local not found, creating template...
    (
        echo # Frontend Environment Variables
        echo # AI Configuration ^(Optional - có thể để trống^)
        echo NEXT_PUBLIC_HUGGINGFACE_API_KEY=
        echo.
        echo # Backend API Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
        echo.
        echo # WebSocket Configuration
        echo NEXT_PUBLIC_WS_URL=ws://localhost:4000
    ) > .env.local
    echo ✅ .env.local created
) else (
    echo ✅ .env.local found
)

if exist "lib\free-ai-service.js" (
    echo ✅ Free AI service found
) else (
    echo ❌ Free AI service not found
    pause
    exit /b 1
)

if exist "lib\chatgpt-service.ts" (
    echo ✅ ChatGPT service updated
) else (
    echo ❌ ChatGPT service not found
    pause
    exit /b 1
)
echo.

echo 🧪 Testing AI service...
echo require('dotenv').config({ path: '.env.local' }); > test-ai-temp.js
echo const { freeAIService } = require('./lib/free-ai-service.js'); >> test-ai-temp.js
echo. >> test-ai-temp.js
echo async function test() { >> test-ai-temp.js
echo   const testData = { >> test-ai-temp.js
echo     totalConferences: 2, >> test-ai-temp.js
echo     totalAttendees: 50, >> test-ai-temp.js
echo     averageEngagement: 70, >> test-ai-temp.js
echo     averageSatisfaction: 4.0, >> test-ai-temp.js
echo     topPerformingConferences: [], >> test-ai-temp.js
echo     globalTrends: [], >> test-ai-temp.js
echo     demographics: { ageGroups: [], industries: [] }, >> test-ai-temp.js
echo     monthlyStats: [] >> test-ai-temp.js
echo   }; >> test-ai-temp.js
echo. >> test-ai-temp.js
echo   const result = await freeAIService.generateAnalyticsInsights(testData); >> test-ai-temp.js
echo   console.log('✅ AI Service Test: PASSED'); >> test-ai-temp.js
echo   console.log('Summary:', result.summary.substring(0, 100) + '...'); >> test-ai-temp.js
echo   console.log('Insights count:', result.insights.length); >> test-ai-temp.js
echo } >> test-ai-temp.js
echo. >> test-ai-temp.js
echo test().catch(err => { >> test-ai-temp.js
echo   console.log('❌ AI Service Test: FAILED'); >> test-ai-temp.js
echo   console.log('Error:', err.message); >> test-ai-temp.js
echo   process.exit(1); >> test-ai-temp.js
echo }); >> test-ai-temp.js

node test-ai-temp.js
if %errorlevel% equ 0 (
    echo ✅ AI service test passed
) else (
    echo ❌ AI service test failed
)

del test-ai-temp.js >nul 2>&1
echo.

echo 🚀 Setup completed! Next steps:
echo.
echo 1. Start Backend:
echo    cd D:\DATN\HOI_THAO_BE
echo    npm run dev
echo.
echo 2. Start Frontend ^(in new terminal^):
echo    cd D:\DATN\conference-management-system
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:3000/ai-analytics
echo.
echo 4. Optional - Get Hugging Face API key:
echo    https://huggingface.co/settings/tokens
echo    Add to .env.local: NEXT_PUBLIC_HUGGINGFACE_API_KEY=your_token
echo.

echo 🎉 Free AI system is ready to use!
echo 📚 Read AI_FREE_SETUP_GUIDE.md for detailed documentation
echo.
pause
