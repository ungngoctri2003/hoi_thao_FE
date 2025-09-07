const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Tự động tạo file .env.local với JWT secrets được generate ngẫu nhiên cho frontend
 */
function generateJWTSecrets() {
  // Tạo JWT secrets ngẫu nhiên với độ dài 64 ký tự
  const accessSecret = crypto.randomBytes(32).toString('hex');
  const refreshSecret = crypto.randomBytes(32).toString('hex');
  
  return { accessSecret, refreshSecret };
}

/**
 * Tạo nội dung file .env.local từ template
 */
function createEnvContent(accessSecret, refreshSecret) {
  return `# Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=http://localhost:4000

# JWT Configuration (Auto-generated)
NEXT_PUBLIC_JWT_ACCESS_SECRET=${accessSecret}
NEXT_PUBLIC_JWT_REFRESH_SECRET=${refreshSecret}

# Firebase Configuration (Cần cấu hình thủ công)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Development Settings
NODE_ENV=development
`;
}

/**
 * Kiểm tra và tạo file .env.local nếu chưa tồn tại
 */
function ensureEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  // Nếu file .env.local đã tồn tại, không làm gì
  if (fs.existsSync(envPath)) {
    console.log('✅ File .env.local đã tồn tại');
    return;
  }
  
  console.log('🔧 Tạo file .env.local mới...');
  
  // Tạo JWT secrets mới
  const { accessSecret, refreshSecret } = generateJWTSecrets();
  
  // Tạo nội dung file .env.local
  const envContent = createEnvContent(accessSecret, refreshSecret);
  
  // Ghi file .env.local
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('✅ Đã tạo file .env.local với JWT secrets mới');
  console.log('🔑 NEXT_PUBLIC_JWT_ACCESS_SECRET:', accessSecret.substring(0, 8) + '...');
  console.log('🔑 NEXT_PUBLIC_JWT_REFRESH_SECRET:', refreshSecret.substring(0, 8) + '...');
  console.log('⚠️  Lưu ý: Cần cấu hình Firebase credentials thủ công');
}

/**
 * Cập nhật JWT secrets trong file .env.local hiện có
 */
function updateJWTSecrets() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env.local không tồn tại. Chạy ensureEnvFile() trước.');
    return;
  }
  
  console.log('🔄 Cập nhật JWT secrets...');
  
  // Đọc file .env.local hiện tại
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Tạo JWT secrets mới
  const { accessSecret, refreshSecret } = generateJWTSecrets();
  
  // Cập nhật JWT secrets
  envContent = envContent.replace(
    /NEXT_PUBLIC_JWT_ACCESS_SECRET=.*/,
    `NEXT_PUBLIC_JWT_ACCESS_SECRET=${accessSecret}`
  );
  envContent = envContent.replace(
    /NEXT_PUBLIC_JWT_REFRESH_SECRET=.*/,
    `NEXT_PUBLIC_JWT_REFRESH_SECRET=${refreshSecret}`
  );
  
  // Ghi lại file
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('✅ Đã cập nhật JWT secrets');
  console.log('🔑 NEXT_PUBLIC_JWT_ACCESS_SECRET:', accessSecret.substring(0, 8) + '...');
  console.log('🔑 NEXT_PUBLIC_JWT_REFRESH_SECRET:', refreshSecret.substring(0, 8) + '...');
}

/**
 * Kiểm tra và tự động cập nhật JWT secrets nếu chúng không an toàn
 */
function checkAndUpdateUnsafeSecrets() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ File .env.local không tồn tại. Chạy ensureEnvFile() trước.');
    return false;
  }
  
  // Đọc file .env.local hiện tại
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Kiểm tra xem có JWT secrets không an toàn không
  const hasUnsafeAccessSecret = envContent.includes('NEXT_PUBLIC_JWT_ACCESS_SECRET=your_super_secret_access_key_here_change_in_production');
  const hasUnsafeRefreshSecret = envContent.includes('NEXT_PUBLIC_JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production');
  
  if (hasUnsafeAccessSecret || hasUnsafeRefreshSecret) {
    console.log('⚠️  Phát hiện JWT secrets không an toàn!');
    console.log('🔄 Tự động cập nhật JWT secrets...');
    updateJWTSecrets();
    return true;
  }
  
  console.log('✅ JWT secrets đã an toàn');
  return false;
}

/**
 * Tự động cập nhật JWT secrets mỗi khi khởi động ứng dụng
 */
function autoUpdateJWTSecrets() {
  console.log('🔍 Kiểm tra JWT secrets...');
  
  // Kiểm tra và cập nhật nếu cần
  const wasUpdated = checkAndUpdateUnsafeSecrets();
  
  if (wasUpdated) {
    console.log('🔄 JWT secrets đã được cập nhật tự động');
  } else {
    console.log('✅ JWT secrets đã sẵn sàng');
  }
}

/**
 * Đồng bộ JWT secrets từ backend
 */
function syncJWTSecretsFromBackend() {
  const backendEnvPath = path.join(__dirname, '..', '..', 'HOI_THAO_BE', '.env');
  const frontendEnvPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(backendEnvPath)) {
    console.log('❌ File .env backend không tồn tại');
    return false;
  }
  
  console.log('🔄 Đồng bộ JWT secrets từ backend...');
  
  // Đọc JWT secrets từ backend
  const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
  const accessMatch = backendEnvContent.match(/JWT_ACCESS_SECRET=(.+)/);
  const refreshMatch = backendEnvContent.match(/JWT_REFRESH_SECRET=(.+)/);
  
  if (!accessMatch || !refreshMatch) {
    console.log('❌ Không tìm thấy JWT secrets trong backend');
    return false;
  }
  
  const accessSecret = accessMatch[1];
  const refreshSecret = refreshMatch[1];
  
  // Đọc hoặc tạo file .env.local frontend
  let frontendEnvContent = '';
  if (fs.existsSync(frontendEnvPath)) {
    frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
  } else {
    frontendEnvContent = createEnvContent(accessSecret, refreshSecret);
  }
  
  // Cập nhật JWT secrets
  frontendEnvContent = frontendEnvContent.replace(
    /NEXT_PUBLIC_JWT_ACCESS_SECRET=.*/,
    `NEXT_PUBLIC_JWT_ACCESS_SECRET=${accessSecret}`
  );
  frontendEnvContent = frontendEnvContent.replace(
    /NEXT_PUBLIC_JWT_REFRESH_SECRET=.*/,
    `NEXT_PUBLIC_JWT_REFRESH_SECRET=${refreshSecret}`
  );
  
  // Ghi file
  fs.writeFileSync(frontendEnvPath, frontendEnvContent, 'utf8');
  
  console.log('✅ Đã đồng bộ JWT secrets từ backend');
  console.log('🔑 NEXT_PUBLIC_JWT_ACCESS_SECRET:', accessSecret.substring(0, 8) + '...');
  console.log('🔑 NEXT_PUBLIC_JWT_REFRESH_SECRET:', refreshSecret.substring(0, 8) + '...');
  
  return true;
}

// Chạy script
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'update':
      updateJWTSecrets();
      break;
    case 'check':
      checkAndUpdateUnsafeSecrets();
      break;
    case 'auto':
      autoUpdateJWTSecrets();
      break;
    case 'sync':
      syncJWTSecretsFromBackend();
      break;
    case 'ensure':
    default:
      ensureEnvFile();
      break;
  }
}

module.exports = {
  generateJWTSecrets,
  createEnvContent,
  ensureEnvFile,
  updateJWTSecrets,
  checkAndUpdateUnsafeSecrets,
  autoUpdateJWTSecrets,
  syncJWTSecretsFromBackend
};
