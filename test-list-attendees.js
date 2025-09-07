// Test list attendees API để tìm lỗi OVERALLSTATUS
// Using built-in fetch in Node.js 18+

async function testListAttendees() {
    console.log('🧪 Testing list attendees API...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:4000/api/v1/attendees?page=1&limit=10', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: List attendees completed!');
        } else {
            console.log('❌ FAILED: List attendees failed');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testListAttendeesWithConferences() {
    console.log('\n🧪 Testing list attendees with conferences...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // Thử gọi API với các tham số khác nhau
        const endpoints = [
            'http://localhost:4000/api/v1/attendees?page=1&limit=10',
            'http://localhost:4000/api/v1/attendees?page=1&limit=10&filters[gender]=male',
            'http://localhost:4000/api/v1/attendees?page=1&limit=10&search=test'
        ];
        
        for (const endpoint of endpoints) {
            console.log(`🔍 Testing endpoint: ${endpoint}`);
            
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                console.log(`📊 Status: ${response.status}`);
                if (response.status === 200) {
                    console.log('✅ SUCCESS');
                } else {
                    console.log('❌ FAILED:', data.error?.message || 'Unknown error');
                }
            } catch (error) {
                console.log('❌ Error:', error.message);
            }
            console.log('---');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function getToken() {
    try {
        const response = await fetch('http://localhost:4000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@conference.vn',
                password: 'admin123'
            })
        });

        const data = await response.json();
        
        if (response.ok && data.data && data.data.accessToken) {
            return data.data.accessToken;
        }
        return null;
    } catch (error) {
        console.error('Error getting token:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Starting list attendees tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testListAttendees();
    await testListAttendeesWithConferences();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
