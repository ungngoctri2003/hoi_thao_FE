// Test registrations API để tìm lỗi OVERALLSTATUS
// Using built-in fetch in Node.js 18+

async function testRegistrationsAPI() {
    console.log('🧪 Testing registrations API...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // Test API registrations cho attendee ID 6
        const response = await fetch('http://localhost:4000/api/v1/attendees/6/registrations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Registrations API completed!');
        } else {
            console.log('❌ FAILED: Registrations API failed');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testConferencesAPI() {
    console.log('\n🧪 Testing conferences API...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:4000/api/v1/conferences', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Conferences API completed!');
        } else {
            console.log('❌ FAILED: Conferences API failed');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testFullFlow() {
    console.log('\n🧪 Testing full flow (update + refetch)...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // 1. Update attendee
        console.log('1️⃣ Updating attendee...');
        const updateResponse = await fetch('http://localhost:4000/api/v1/attendees/6', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                NAME: 'Full Flow Test Update'
            })
        });
        
        const updateData = await updateResponse.json();
        console.log(`📊 Update Status: ${updateResponse.status}`);
        
        if (updateResponse.status !== 200) {
            console.log('❌ Update failed:', updateData);
            return;
        }
        
        // 2. Get attendees list (simulate refetch)
        console.log('2️⃣ Getting attendees list...');
        const listResponse = await fetch('http://localhost:4000/api/v1/attendees?page=1&limit=10', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const listData = await listResponse.json();
        console.log(`📊 List Status: ${listResponse.status}`);
        
        if (listResponse.status !== 200) {
            console.log('❌ List failed:', listData);
            return;
        }
        
        // 3. Get registrations for attendee
        console.log('3️⃣ Getting registrations...');
        const regResponse = await fetch('http://localhost:4000/api/v1/attendees/6/registrations', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const regData = await regResponse.json();
        console.log(`📊 Registrations Status: ${regResponse.status}`);
        
        if (regResponse.status !== 200) {
            console.log('❌ Registrations failed:', regData);
            return;
        }
        
        console.log('✅ SUCCESS: Full flow completed!');
        
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
    console.log('🚀 Starting registrations API tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testRegistrationsAPI();
    await testConferencesAPI();
    await testFullFlow();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
