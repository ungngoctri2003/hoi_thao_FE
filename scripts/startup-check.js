const { autoUpdateJWTSecrets, syncJWTSecretsFromBackend } = require('./generate-env');
const path = require('path');

/**
 * Kiểm tra và chuẩn bị môi trường trước khi khởi động frontend
 */
function startupCheck() {
  console.log('🚀 Kiểm tra môi trường frontend...');
  
  try {
    // Kiểm tra và cập nhật JWT secrets
    autoUpdateJWTSecrets();
    
    // Thử đồng bộ từ backend nếu có thể
    try {
      syncJWTSecretsFromBackend();
    } catch (error) {
      console.log('ℹ️  Không thể đồng bộ từ backend, sử dụng JWT secrets hiện có');
    }
    
    console.log('✅ Frontend đã sẵn sàng khởi động');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra môi trường:', error.message);
    return false;
  }
}

// Chạy kiểm tra nếu được gọi trực tiếp
if (require.main === module) {
  const success = startupCheck();
  process.exit(success ? 0 : 1);
}

module.exports = { startupCheck };
