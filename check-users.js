// Kiểm tra users trong database
// Using built-in fetch in Node.js 18+

async function checkUsers() {
    console.log('🔍 Kiểm tra users trong database...\n');
    
    try {
        // Thử các credentials khác nhau
        const credentials = [
            { email: 'admin@example.com', password: 'admin123' },
            { email: 'admin@admin.com', password: 'admin' },
            { email: 'admin', password: 'admin' },
            { email: 'test@test.com', password: 'test' },
            { email: 'user@user.com', password: 'user' }
        ];
        
        for (const cred of credentials) {
            console.log(`🔐 Thử đăng nhập với: ${cred.email} / ${cred.password}`);
            
            try {
                const response = await fetch('http://localhost:4000/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cred)
                });

                const data = await response.json();
                
                if (response.ok && data.data && data.data.accessToken) {
                    console.log('✅ Đăng nhập thành công!');
                    console.log('🔑 Token:', data.data.accessToken.substring(0, 50) + '...');
                    return data.data.accessToken;
                } else {
                    console.log('❌ Thất bại:', data.error?.message || 'Unknown error');
                }
            } catch (error) {
                console.log('❌ Lỗi:', error.message);
            }
            
            console.log('---');
        }
        
        console.log('❌ Không tìm thấy credentials hợp lệ');
        return null;
        
    } catch (error) {
        console.error('❌ Lỗi khi kiểm tra users:', error.message);
        return null;
    }
}

async function testPublicEndpoints() {
    console.log('\n🌐 Kiểm tra các public endpoints...\n');
    
    const endpoints = [
        'http://localhost:4000/api/v1/attendees',
        'http://localhost:4000/api/v1/conferences',
        'http://localhost:4000/api/v1/health',
        'http://localhost:4000/'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`🔍 Testing: ${endpoint}`);
            const response = await fetch(endpoint);
            console.log(`📊 Status: ${response.status}`);
            
            if (response.status === 200) {
                const data = await response.json();
                console.log('📋 Data:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
        console.log('---');
    }
}

async function runChecks() {
    console.log('🚀 Starting user and endpoint checks...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await checkUsers();
    await testPublicEndpoints();
    
    console.log('\n🏁 Checks completed!');
}

runChecks().catch(console.error);
