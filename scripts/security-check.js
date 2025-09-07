const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Kiểm tra bảo mật JWT secrets
 */
function checkJWTSecurity() {
  console.log('🔒 Kiểm tra bảo mật JWT secrets...');
  
  const issues = [];
  const warnings = [];
  
  // Kiểm tra file .env.local frontend
  const frontendEnvPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(frontendEnvPath)) {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    
    // Kiểm tra JWT secrets không an toàn
    if (frontendEnv.includes('NEXT_PUBLIC_JWT_ACCESS_SECRET=your_super_secret_access_key_here_change_in_production')) {
      issues.push('❌ Frontend: JWT_ACCESS_SECRET vẫn sử dụng giá trị mặc định không an toàn');
    }
    
    if (frontendEnv.includes('NEXT_PUBLIC_JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production')) {
      issues.push('❌ Frontend: JWT_REFRESH_SECRET vẫn sử dụng giá trị mặc định không an toàn');
    }
    
    // Kiểm tra độ dài JWT secrets
    const accessMatch = frontendEnv.match(/NEXT_PUBLIC_JWT_ACCESS_SECRET=(.+)/);
    const refreshMatch = frontendEnv.match(/NEXT_PUBLIC_JWT_REFRESH_SECRET=(.+)/);
    
    if (accessMatch && accessMatch[1].length < 32) {
      warnings.push('⚠️  Frontend: JWT_ACCESS_SECRET quá ngắn (nên >= 32 ký tự)');
    }
    
    if (refreshMatch && refreshMatch[1].length < 32) {
      warnings.push('⚠️  Frontend: JWT_REFRESH_SECRET quá ngắn (nên >= 32 ký tự)');
    }
  } else {
    warnings.push('⚠️  Frontend: File .env.local không tồn tại');
  }
  
  // Kiểm tra file .env backend
  const backendEnvPath = path.join(__dirname, '..', '..', 'HOI_THAO_BE', '.env');
  if (fs.existsSync(backendEnvPath)) {
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    // Kiểm tra JWT secrets không an toàn
    if (backendEnv.includes('JWT_ACCESS_SECRET=your_super_secret_access_key_here_change_in_production')) {
      issues.push('❌ Backend: JWT_ACCESS_SECRET vẫn sử dụng giá trị mặc định không an toàn');
    }
    
    if (backendEnv.includes('JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_change_in_production')) {
      issues.push('❌ Backend: JWT_REFRESH_SECRET vẫn sử dụng giá trị mặc định không an toàn');
    }
    
    // Kiểm tra độ dài JWT secrets
    const accessMatch = backendEnv.match(/JWT_ACCESS_SECRET=(.+)/);
    const refreshMatch = backendEnv.match(/JWT_REFRESH_SECRET=(.+)/);
    
    if (accessMatch && accessMatch[1].length < 32) {
      warnings.push('⚠️  Backend: JWT_ACCESS_SECRET quá ngắn (nên >= 32 ký tự)');
    }
    
    if (refreshMatch && refreshMatch[1].length < 32) {
      warnings.push('⚠️  Backend: JWT_REFRESH_SECRET quá ngắn (nên >= 32 ký tự)');
    }
    
    // Kiểm tra JWT secrets có giống nhau không
    if (accessMatch && refreshMatch && accessMatch[1] === refreshMatch[1]) {
      issues.push('❌ Backend: JWT_ACCESS_SECRET và JWT_REFRESH_SECRET giống nhau (không an toàn)');
    }
  } else {
    warnings.push('⚠️  Backend: File .env không tồn tại');
  }
  
  // Kiểm tra đồng bộ giữa frontend và backend
  if (fs.existsSync(frontendEnvPath) && fs.existsSync(backendEnvPath)) {
    const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
    const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    
    const frontendAccessMatch = frontendEnv.match(/NEXT_PUBLIC_JWT_ACCESS_SECRET=(.+)/);
    const backendAccessMatch = backendEnv.match(/JWT_ACCESS_SECRET=(.+)/);
    
    if (frontendAccessMatch && backendAccessMatch && frontendAccessMatch[1] !== backendAccessMatch[1]) {
      warnings.push('⚠️  JWT_ACCESS_SECRET không đồng bộ giữa frontend và backend');
    }
    
    const frontendRefreshMatch = frontendEnv.match(/NEXT_PUBLIC_JWT_REFRESH_SECRET=(.+)/);
    const backendRefreshMatch = backendEnv.match(/JWT_REFRESH_SECRET=(.+)/);
    
    if (frontendRefreshMatch && backendRefreshMatch && frontendRefreshMatch[1] !== backendRefreshMatch[1]) {
      warnings.push('⚠️  JWT_REFRESH_SECRET không đồng bộ giữa frontend và backend');
    }
  }
  
  // Hiển thị kết quả
  console.log('\n📊 KẾT QUẢ KIỂM TRA BẢO MẬT:');
  console.log('=' .repeat(50));
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ Tất cả JWT secrets đều an toàn!');
  } else {
    if (issues.length > 0) {
      console.log('\n🚨 VẤN ĐỀ NGHIÊM TRỌNG:');
      issues.forEach(issue => console.log(issue));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  CẢNH BÁO:');
      warnings.forEach(warning => console.log(warning));
    }
  }
  
  console.log('\n💡 KHUYẾN NGHỊ:');
  console.log('- Chạy "npm run env:update" để tạo JWT secrets mới');
  console.log('- Chạy "npm run env:sync" để đồng bộ JWT secrets giữa frontend và backend');
  console.log('- Không bao giờ commit file .env vào git');
  console.log('- Sử dụng JWT secrets khác nhau cho môi trường development và production');
  
  return {
    hasIssues: issues.length > 0,
    hasWarnings: warnings.length > 0,
    issues,
    warnings
  };
}

/**
 * Tự động sửa các vấn đề bảo mật
 */
function autoFixSecurityIssues() {
  console.log('🔧 Tự động sửa các vấn đề bảo mật...');
  
  const { autoUpdateJWTSecrets } = require('./generate-env');
  const { syncJWTSecretsFromBackend } = require('./generate-env');
  
  try {
    // Cập nhật JWT secrets frontend
    autoUpdateJWTSecrets();
    
    // Đồng bộ từ backend
    syncJWTSecretsFromBackend();
    
    console.log('✅ Đã tự động sửa các vấn đề bảo mật');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi tự động sửa:', error.message);
    return false;
  }
}

// Chạy script
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'fix':
      autoFixSecurityIssues();
      break;
    case 'check':
    default:
      checkJWTSecurity();
      break;
  }
}

module.exports = {
  checkJWTSecurity,
  autoFixSecurityIssues
};
