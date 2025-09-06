// Test đăng nhập với admin user
// Using built-in fetch in Node.js 18+

async function testAdminLogin() {
    console.log('🔐 Testing admin login...\n');
    
    const credentials = [
        { email: 'admin@conference.vn', password: 'admin123' },
        { email: 'admin@example.com', password: 'admin123' },
        { email: 'admin', password: 'admin123' }
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
                console.log('👤 User:', data.data.user);
                
                // Test API với token này
                await testAttendeeUpdateWithToken(data.data.accessToken);
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
}

async function testAttendeeUpdateWithToken(token) {
    console.log('\n🧪 Testing attendee update with token...\n');
    
    const testData = {
        NAME: 'Test User With Token',
        EMAIL: 'testwithtoken@example.com',
        DATE_OF_BIRTH: '1990-01-01',
        GENDER: 'male',
        PHONE: '0123456789',
        COMPANY: 'Token Test Company',
        POSITION: 'Token Test Position'
    };
    
    try {
        console.log('📤 Sending data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:4000/api/v1/attendees/6', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Update completed successfully!');
            console.log('🎉 Cả Oracle bind error và authentication đã được khắc phục!');
        } else if (response.status === 401) {
            console.log('❌ FAILED: Still getting UNAUTHORIZED error');
            console.log('🔍 Error details:', data.error?.message || 'Unknown auth error');
        } else if (response.status === 500) {
            console.log('❌ FAILED: Server error');
            console.log('🔍 Error details:', data.error?.message || 'Unknown server error');
        } else {
            console.log('ℹ️  INFO: Unexpected response status');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function runTest() {
    console.log('🚀 Starting admin login test...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testAdminLogin();
    
    console.log('\n🏁 Test completed!');
}

runTest().catch(console.error);
