# Hướng dẫn tích hợp Google Authentication cho Backend

## Tổng quan

Backend cần được cập nhật để hỗ trợ Google Authentication thông qua Firebase. Điều này bao gồm:

1. Thêm endpoint cho Google login/register
2. Cập nhật database schema để lưu Firebase UID
3. Xác thực Firebase token từ frontend

## 1. Cập nhật Database Schema

### Thêm cột firebase_uid vào bảng users

```sql
-- Thêm cột firebase_uid vào bảng users
ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;

-- Tạo index cho firebase_uid để tối ưu tìm kiếm
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
```

### Cập nhật bảng attendees (nếu cần)

```sql
-- Thêm cột firebase_uid vào bảng attendees
ALTER TABLE attendees ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;

-- Tạo index cho firebase_uid
CREATE INDEX idx_attendees_firebase_uid ON attendees(firebase_uid);
```

## 2. Cài đặt Firebase Admin SDK

```bash
npm install firebase-admin
```

## 3. Cấu hình Firebase Admin

Tạo file `src/config/firebase-admin.ts`:

```typescript
import admin from 'firebase-admin';

// Khởi tạo Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const firebaseAdmin = admin;
```

## 4. Thêm Environment Variables

Thêm vào file `.env`:

```env
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
```

## 5. Tạo Google Auth Service

Tạo file `src/services/google-auth.service.ts`:

```typescript
import { firebaseAdmin } from '../config/firebase-admin';
import { User } from '../types/user.types';

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
    // Kiểm tra user đã tồn tại chưa
    const existingUser = await this.findUserByFirebaseUid(googleData.firebaseUid);
    
    if (existingUser) {
      // Cập nhật thông tin user
      return await this.updateUser(existingUser.id, {
        name: googleData.name,
        avatar: googleData.avatar,
        lastLogin: new Date(),
      });
    } else {
      // Tạo user mới
      return await this.createUser({
        firebaseUid: googleData.firebaseUid,
        email: googleData.email,
        name: googleData.name,
        avatar: googleData.avatar,
        role: 'attendee', // Default role
      });
    }
  }

  private async findUserByFirebaseUid(firebaseUid: string) {
    // Implement database query to find user by firebase_uid
    // Return user object or null
  }

  private async createUser(userData: any) {
    // Implement database query to create new user
    // Return created user object
  }

  private async updateUser(userId: number, updateData: any) {
    // Implement database query to update user
    // Return updated user object
  }
}
```

## 6. Tạo Google Auth Routes

Tạo file `src/routes/google-auth.routes.ts`:

```typescript
import { Router } from 'express';
import { GoogleAuthService } from '../services/google-auth.service';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const googleAuthService = new GoogleAuthService();
const authController = new AuthController();

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

    // Tạo JWT token
    const tokens = await authController.generateTokens(user);

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

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await googleAuthService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Tạo user mới
    const user = await googleAuthService.createOrUpdateUser({
      firebaseUid,
      email,
      name,
      avatar,
    });

    // Tạo JWT token
    const tokens = await authController.generateTokens(user);

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
```

## 7. Cập nhật Auth Routes chính

Thêm vào `src/routes/auth.routes.ts`:

```typescript
import googleAuthRoutes from './google-auth.routes';

// Thêm Google auth routes
router.use('/google', googleAuthRoutes);
```

## 8. Cập nhật User Model

Cập nhật user model để hỗ trợ firebase_uid:

```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  password?: string; // Optional for Google users
  firebaseUid?: string; // New field
  role: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

## 9. Middleware xác thực Firebase (Optional)

Nếu muốn xác thực Firebase token trong middleware:

```typescript
import { Request, Response, NextFunction } from 'express';
import { firebaseAdmin } from '../config/firebase-admin';

export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No Firebase token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
};
```

## 10. Testing

Tạo file test để kiểm tra Google auth:

```typescript
// test/google-auth.test.ts
import request from 'supertest';
import app from '../app';

describe('Google Authentication', () => {
  test('POST /api/v1/auth/google/login', async () => {
    const response = await request(app)
      .post('/api/v1/auth/google/login')
      .send({
        firebaseUid: 'test-firebase-uid',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('accessToken');
  });
});
```

## 11. CORS Configuration

Đảm bảo CORS được cấu hình đúng cho Firebase domain:

```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-firebase-project.web.app',
    'https://your-firebase-project.firebaseapp.com'
  ],
  credentials: true
};
```

## Lưu ý quan trọng

1. **Bảo mật**: Không bao giờ expose Firebase private key
2. **Database**: Đảm bảo firebase_uid là unique
3. **Error Handling**: Xử lý lỗi Firebase token verification
4. **Logging**: Log các hoạt động authentication để debug
5. **Rate Limiting**: Thêm rate limiting cho Google auth endpoints

## Deployment

1. Cập nhật environment variables trên production
2. Chạy database migration để thêm firebase_uid column
3. Deploy code mới
4. Test Google authentication trên production
