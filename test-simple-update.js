// Test đơn giản để xác định lỗi OVERALLSTATUS
// Using built-in fetch in Node.js 18+

async function testSimpleUpdate() {
    console.log('🧪 Testing simple attendee update...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    const testData = {
        NAME: 'Simple Test Update'
    };
    
    try {
        console.log('📤 Sending minimal data:', JSON.stringify(testData, null, 2));
        
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
            console.log('✅ SUCCESS: Simple update completed!');
        } else {
            console.log('❌ FAILED: Update failed');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testGetAttendee() {
    console.log('\n🧪 Testing get attendee...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:4000/api/v1/attendees/6', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Get attendee completed!');
        } else {
            console.log('❌ FAILED: Get attendee failed');
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
    console.log('🚀 Starting simple update tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testGetAttendee();
    await testSimpleUpdate();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
