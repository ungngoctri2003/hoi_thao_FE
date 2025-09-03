#!/usr/bin/env node

/**
 * Script để setup Google Authentication cho Backend
 * Chạy script này trong thư mục backend (HOI_THAO_BE)
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Google Authentication for Backend...\n');

// 1. Tạo file firebase-admin config
const firebaseAdminConfig = `import admin from 'firebase-admin';

// Khởi tạo Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: \`https://www.googleapis.com/robot/v1/metadata/x509/\${process.env.FIREBASE_CLIENT_EMAIL}\`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const firebaseAdmin = admin;
`;

// 2. Tạo Google Auth Service
const googleAuthService = `import { firebaseAdmin } from '../config/firebase-admin';

export class GoogleAuthService {
  /**
   * Xác thực Firebase ID token
   */
  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new Error('Invalid Firebase token');
    }
  }

  /**
   * Tạo hoặc cập nhật user từ Google data
   */
  async createOrUpdateUser(googleData: {
    firebaseUid: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    // TODO: Implement database operations
    // 1. Kiểm tra user đã tồn tại chưa bằng firebaseUid
    // 2. Nếu có, cập nhật thông tin
    // 3. Nếu chưa, tạo user mới
    
    console.log('Creating/updating user:', googleData);
    
    // Mock response - thay thế bằng database operations thực
    return {
      id: Date.now(),
      email: googleData.email,
      name: googleData.name,
      firebaseUid: googleData.firebaseUid,
      avatar: googleData.avatar,
      role: 'attendee',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
`;

// 3. Tạo Google Auth Routes
const googleAuthRoutes = `import { Router } from 'express';
import { GoogleAuthService } from '../services/google-auth.service';

const router = Router();
const googleAuthService = new GoogleAuthService();

/**
 * POST /auth/google/login
 * Đăng nhập với Google
 */
router.post('/login', async (req, res) => {
  try {
    const { firebaseUid, email, name, avatar } = req.body;

    // Tạo hoặc cập nhật user
    const user = await googleAuthService.createOrUpdateUser({
      firebaseUid,
      email,
      name,
      avatar,
    });

    // TODO: Tạo JWT token thực
    const tokens = {
      accessToken: 'jwt_access_token_' + Date.now(),
      refreshToken: 'jwt_refresh_token_' + Date.now(),
    };

    res.json({
      success: true,
      data: tokens,
      message: 'Google login successful'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * POST /auth/google/register
 * Đăng ký với Google
 */
router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, email, name, avatar } = req.body;

    // Tạo user mới
    const user = await googleAuthService.createOrUpdateUser({
      firebaseUid,
      email,
      name,
      avatar,
    });

    // TODO: Tạo JWT token thực
    const tokens = {
      accessToken: 'jwt_access_token_' + Date.now(),
      refreshToken: 'jwt_refresh_token_' + Date.now(),
    };

    res.json({
      success: true,
      data: tokens,
      message: 'Google registration successful'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
`;

// 4. Tạo SQL migration
const sqlMigration = `-- Migration để thêm firebase_uid vào bảng users
-- Chạy SQL này trong database

-- Thêm cột firebase_uid vào bảng users
ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;

-- Tạo index cho firebase_uid để tối ưu tìm kiếm
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Cập nhật bảng attendees (nếu cần)
ALTER TABLE attendees ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;
CREATE INDEX idx_attendees_firebase_uid ON attendees(firebase_uid);
`;

// 5. Tạo environment variables template
const envTemplate = `# Firebase Admin Configuration
# Lấy thông tin từ Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=fun-chat-9e936
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email@fun-chat-9e936.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id_here
`;

console.log('📁 Creating files...\n');

// Tạo thư mục nếu chưa có
const backendDir = path.join(__dirname, '../HOI_THAO_BE');
if (!fs.existsSync(backendDir)) {
  console.log('❌ Backend directory not found. Please run this script from the frontend directory.');
  process.exit(1);
}

// Tạo files
const files = [
  { path: path.join(backendDir, 'src/config/firebase-admin.ts'), content: firebaseAdminConfig },
  { path: path.join(backendDir, 'src/services/google-auth.service.ts'), content: googleAuthService },
  { path: path.join(backendDir, 'src/routes/google-auth.routes.ts'), content: googleAuthRoutes },
  { path: path.join(backendDir, 'google-auth-migration.sql'), content: sqlMigration },
  { path: path.join(backendDir, '.env.google-auth.example'), content: envTemplate }
];

files.forEach(file => {
  const dir = path.dirname(file.path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(file.path, file.content);
  console.log(`✅ Created: ${path.relative(process.cwd(), file.path)}`);
});

console.log('\n🎉 Setup completed!\n');

console.log('📋 Next steps:');
console.log('1. Install Firebase Admin SDK:');
console.log('   cd ../HOI_THAO_BE && npm install firebase-admin\n');

console.log('2. Add environment variables to .env file:');
console.log('   Copy content from .env.google-auth.example to .env\n');

console.log('3. Run database migration:');
console.log('   Execute google-auth-migration.sql in your database\n');

console.log('4. Update auth routes:');
console.log('   Add "router.use(\'/google\', googleAuthRoutes);" to your main auth routes\n');

console.log('5. Get Firebase Service Account:');
console.log('   - Go to Firebase Console > Project Settings > Service Accounts');
console.log('   - Click "Generate new private key"');
console.log('   - Copy the values to your .env file\n');

console.log('6. Test the integration:');
console.log('   - Start your backend server');
console.log('   - Test Google login from frontend\n');

console.log('🔗 Firebase Console: https://console.firebase.google.com/project/fun-chat-9e936/settings/serviceaccounts/adminsdk');
