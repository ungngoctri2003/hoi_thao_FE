# Backend CORS Fix Guide

## 🚨 Lỗi hiện tại
```
Access to fetch at 'http://localhost:4000/api/v1/users/me' from origin 'http://localhost:3000' 
has been blocked by CORS policy: Method PATCH is not allowed by Access-Control-Allow-Methods 
in preflight response.
```

## 🔍 Nguyên nhân
Backend chưa cấu hình CORS để cho phép method `PATCH`. Khi frontend gửi request PATCH, browser sẽ gửi preflight request (OPTIONS) trước, nhưng backend không cho phép method PATCH.

## 🛠️ Giải pháp

### 1. Cấu hình CORS trong Backend (Khuyến nghị)

#### Express.js với cors middleware:
```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',  // Next.js frontend
    'http://localhost:3001',  // Alternative port
    'http://127.0.0.1:3000'   // Alternative localhost
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // ← QUAN TRỌNG: Cần có PATCH
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200 // For legacy browser support
}));
```

#### Manual CORS headers:
```javascript
app.use((req, res, next) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

### 2. Cấu hình cho các framework khác

#### Fastify:
```javascript
await fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});
```

#### Koa:
```javascript
const cors = require('@koa/cors');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
```

### 3. Kiểm tra cấu hình hiện tại

#### Test CORS với curl:
```bash
# Test preflight request
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: PATCH" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v \
  http://localhost:4000/api/v1/users/me

# Expected response headers:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

#### Test với browser:
```javascript
// Mở browser console và chạy:
fetch('http://localhost:4000/api/v1/users/me', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'PATCH',
    'Access-Control-Request-Headers': 'Content-Type,Authorization'
  }
}).then(response => {
  console.log('CORS Headers:', {
    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
  });
});
```

## 🔧 Workaround tạm thời (Frontend)

Frontend đã được cập nhật để:
1. **Thử PATCH trước**
2. **Nếu bị CORS error → Fallback sang POST**
3. **Sử dụng `_method: 'PATCH'` override** (nếu backend hỗ trợ)

```javascript
// Logic trong api.ts
try {
  // Thử PATCH
  await fetch('/users/me', { method: 'PATCH', ... });
} catch (error) {
  if (error.message.includes('CORS')) {
    // Fallback sang POST
    await fetch('/users/me', { 
      method: 'POST', 
      body: JSON.stringify({ ...data, _method: 'PATCH' })
    });
  }
}
```

## 🧪 Test và Debug

### 1. Test CORS với file test:
```bash
# Mở test-upload-cors.html và test:
# - Test Upload Endpoint
# - Test CORS
```

### 2. Check Network Tab:
1. Mở Developer Tools → Network
2. Thử update profile
3. Xem preflight request (OPTIONS)
4. Check response headers

### 3. Backend logs:
```bash
# Xem backend logs để check:
# - OPTIONS request có được xử lý không
# - CORS headers có được set không
```

## 📋 Checklist sửa lỗi

### Backend:
- [ ] Thêm `PATCH` vào `Access-Control-Allow-Methods`
- [ ] Cấu hình `Access-Control-Allow-Origin` đúng
- [ ] Xử lý OPTIONS request (preflight)
- [ ] Test với curl/browser

### Frontend:
- [ ] ✅ Đã có fallback mechanism
- [ ] ✅ Error handling cho CORS
- [ ] ✅ Test với test-upload-cors.html

## 🚀 Kết quả mong đợi

Sau khi sửa CORS:
- ✅ PATCH request hoạt động bình thường
- ✅ Profile update thành công
- ✅ Avatar được lưu vào database
- ✅ Không còn CORS error

## 🔗 Tài liệu tham khảo

- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)
- [CORS preflight](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests)
