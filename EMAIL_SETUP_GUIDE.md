# Hướng dẫn cấu hình Email Service cho chức năng Quên mật khẩu

## Tổng quan

Hiện tại, hệ thống quên mật khẩu đã được cập nhật với logic **gửi mật khẩu mới trực tiếp qua email**:

### Frontend (Đã cập nhật)
- ✅ Validation email format
- ✅ Xử lý lỗi chi tiết hơn
- ✅ UI/UX tốt hơn với loading states
- ✅ Thông báo rõ ràng cho người dùng
- ✅ Giao diện phù hợp với logic gửi mật khẩu mới

### Backend (Đã cập nhật)
- ✅ Tạo mật khẩu mới ngẫu nhiên (12 ký tự, đầy đủ chữ hoa, thường, số, ký tự đặc biệt)
- ✅ Cập nhật mật khẩu trực tiếp vào database
- ✅ Gửi mật khẩu mới qua email với template đẹp
- ✅ Logging chi tiết cho debugging
- ✅ Xử lý lỗi tốt hơn

## Cấu hình Email Service cho Production

### 1. Sử dụng Nodemailer với Gmail

```bash
npm install nodemailer @types/nodemailer
```

Tạo file `src/services/email.service.ts`:

```typescript
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Sử dụng App Password, không phải mật khẩu thường
      }
    });
  }

  async sendNewPasswordEmail(email: string, name: string, newPassword: string) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
      to: email,
      subject: 'Mật khẩu mới - Hệ thống Quản lý Hội thảo',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mật khẩu mới</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .password-box { background: #fff; border: 2px solid #e74c3c; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                .password { font-size: 24px; font-weight: bold; color: #e74c3c; letter-spacing: 2px; font-family: 'Courier New', monospace; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                .btn { display: inline-block; background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Mật khẩu mới</h1>
                    <p>Hệ thống Quản lý Hội thảo</p>
                </div>
                
                <div class="content">
                    <h2>Xin chào ${name}!</h2>
                    
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    
                    <div class="password-box">
                        <h3>Mật khẩu mới của bạn:</h3>
                        <div class="password">${newPassword}</div>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Lưu ý quan trọng:</strong>
                        <ul>
                            <li>Vui lòng đăng nhập ngay với mật khẩu này</li>
                            <li>Thay đổi mật khẩu thành một mật khẩu dễ nhớ hơn</li>
                            <li>Không chia sẻ mật khẩu này với bất kỳ ai</li>
                        </ul>
                    </div>
                    
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với chúng tôi ngay lập tức.</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="btn">
                            Đăng nhập ngay
                        </a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Email này được gửi tự động từ hệ thống quản lý hội thảo.</p>
                    <p>Vui lòng không trả lời email này.</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`New password email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send new password email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
```

### 2. Cập nhật Auth Service

Trong `src/modules/auth/auth.service.ts`, thay thế method `sendNewPasswordEmail`:

```typescript
import { emailService } from '../../services/email.service';

// Thay thế method sendNewPasswordEmail
async sendNewPasswordEmail(email: string, name: string, newPassword: string) {
  await emailService.sendNewPasswordEmail(email, name, newPassword);
}
```

### 3. Cấu hình Environment Variables

Thêm vào file `.env`:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 4. Cấu hình Gmail App Password

1. Đăng nhập vào tài khoản Google
2. Vào **Bảo mật** → **Xác minh 2 bước** (bật nếu chưa có)
3. Vào **Mật khẩu ứng dụng**
4. Tạo mật khẩu ứng dụng mới cho "Mail"
5. Sử dụng mật khẩu này làm `EMAIL_APP_PASSWORD`

### 5. Sử dụng SendGrid (Alternative)

```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  async sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM!,
      subject: 'Đặt lại mật khẩu - Hệ thống Quản lý Hội thảo',
      html: `...` // HTML template như trên
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('SendGrid error:', error);
      throw error;
    }
  }
}
```

## Testing

### 1. Test trong Development

Hiện tại, mật khẩu mới sẽ được log ra console của server backend. Để test:

1. Chạy backend server
2. Vào trang forgot password
3. Nhập email hợp lệ
4. Kiểm tra console của server để lấy mật khẩu mới
5. Sử dụng mật khẩu mới để đăng nhập

### 2. Test Email Service

```typescript
// Test script
import { emailService } from './src/services/email.service';

async function testEmail() {
  try {
    await emailService.sendNewPasswordEmail(
      'test@example.com',
      'Test User',
      'NewPass123!'
    );
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmail();
```

## Security Best Practices

1. **Rate Limiting**: Thêm rate limiting cho endpoint forgot-password
2. **Password Strength**: Mật khẩu mới được tạo với độ mạnh cao (12 ký tự, đầy đủ loại ký tự)
3. **Immediate Change**: Khuyến nghị người dùng đổi mật khẩu ngay sau khi đăng nhập
4. **Email Validation**: Kiểm tra email có tồn tại trong hệ thống
5. **Logging**: Log tất cả các request reset password
6. **Secure Generation**: Sử dụng crypto.randomBytes cho việc tạo mật khẩu ngẫu nhiên

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid credentials"**: Kiểm tra EMAIL_USER và EMAIL_APP_PASSWORD
2. **"Connection timeout"**: Kiểm tra kết nối internet và firewall
3. **"Rate limit exceeded"**: Gmail có giới hạn 100 email/ngày cho tài khoản miễn phí
4. **"Email not found"**: Email không tồn tại trong hệ thống
5. **"Password generation failed"**: Lỗi trong quá trình tạo mật khẩu mới

### Debug:

```typescript
// Thêm vào auth.service.ts để debug
console.log('Sending email to:', email);
console.log('New password:', newPassword);
console.log('Environment:', process.env.NODE_ENV);
```
