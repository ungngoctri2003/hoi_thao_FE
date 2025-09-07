// Test với token thật từ localStorage
// Using built-in fetch in Node.js 18+

async function getTokenFromLogin() {
    console.log('🔐 Đang lấy token từ API login...\n');
    
    try {
        const response = await fetch('http://localhost:4000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@example.com',
                password: 'admin123'
            })
        });

        const data = await response.json();
        
        if (response.ok && data.data && data.data.accessToken) {
            console.log('✅ Đăng nhập thành công!');
            console.log('🔑 Token:', data.data.accessToken.substring(0, 50) + '...');
            return data.data.accessToken;
        } else {
            console.log('❌ Đăng nhập thất bại');
            console.log('📋 Response:', JSON.stringify(data, null, 2));
            return null;
        }
    } catch (error) {
        console.error('❌ Lỗi khi đăng nhập:', error.message);
        return null;
    }
}

async function testAttendeeUpdateWithRealToken() {
    console.log('🧪 Testing attendee update with real token...\n');
    
    // Lấy token thật
    const token = await getTokenFromLogin();
    if (!token) {
        console.log('❌ Không thể lấy token, dừng test');
        return;
    }
    
    const testData = {
        NAME: 'Test User Real Token',
        EMAIL: 'testrealtoken@example.com',
        DATE_OF_BIRTH: '1990-01-01',
        GENDER: 'male',
        PHONE: '0123456789',
        COMPANY: 'Real Token Company',
        POSITION: 'Real Token Position'
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
            console.log('🎉 Oracle bind error đã được khắc phục!');
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

async function testAttendeeCreationWithRealToken() {
    console.log('\n🧪 Testing attendee creation with real token...\n');
    
    // Lấy token thật
    const token = await getTokenFromLogin();
    if (!token) {
        console.log('❌ Không thể lấy token, dừng test');
        return;
    }
    
    const testData = {
        NAME: 'Test User Creation Real Token',
        EMAIL: 'testcreationrealtoken@example.com',
        DATE_OF_BIRTH: '1985-05-15',
        GENDER: 'female',
        PHONE: '0987654321',
        COMPANY: 'Creation Real Token Company',
        POSITION: 'Creation Real Token Position'
    };
    
    try {
        console.log('📤 Sending data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:4000/api/v1/attendees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 201) {
            console.log('✅ SUCCESS: Creation completed successfully!');
            console.log('🎉 Oracle bind error đã được khắc phục!');
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

async function runTests() {
    console.log('🚀 Starting real token tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await testAttendeeUpdateWithRealToken();
    await testAttendeeCreationWithRealToken();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);