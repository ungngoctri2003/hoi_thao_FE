// Test checkin API endpoints
// Using built-in fetch in Node.js 18+

async function testCheckinAPI() {
    console.log('🧪 Testing checkin API...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // Test checkin endpoint
        console.log('📤 Testing POST /api/v1/registrations/23/checkin');
        const checkinResponse = await fetch('http://localhost:4000/api/v1/registrations/23/checkin', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const checkinData = await checkinResponse.json();
        
        console.log(`📊 Checkin Response Status: ${checkinResponse.status}`);
        console.log('📋 Checkin Response Data:', JSON.stringify(checkinData, null, 2));
        
        if (checkinResponse.status === 200) {
            console.log('✅ SUCCESS: Checkin API completed!');
        } else {
            console.log('❌ FAILED: Checkin API failed');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testCheckoutAPI() {
    console.log('\n🧪 Testing checkout API...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // Test checkout endpoint
        console.log('📤 Testing POST /api/v1/registrations/23/checkout');
        const checkoutResponse = await fetch('http://localhost:4000/api/v1/registrations/23/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const checkoutData = await checkoutResponse.json();
        
        console.log(`📊 Checkout Response Status: ${checkoutResponse.status}`);
        console.log('📋 Checkout Response Data:', JSON.stringify(checkoutData, null, 2));
        
        if (checkoutResponse.status === 200) {
            console.log('✅ SUCCESS: Checkout API completed!');
        } else {
            console.log('❌ FAILED: Checkout API failed');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testRegistrationStatus() {
    console.log('\n🧪 Testing registration status...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // Get registration details
        console.log('📤 Testing GET /api/v1/registrations/23');
        const regResponse = await fetch('http://localhost:4000/api/v1/registrations/23', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const regData = await regResponse.json();
        
        console.log(`📊 Registration Response Status: ${regResponse.status}`);
        console.log('📋 Registration Data:', JSON.stringify(regData, null, 2));
        
        if (regResponse.status === 200) {
            console.log('✅ SUCCESS: Registration details retrieved!');
        } else {
            console.log('❌ FAILED: Registration details failed');
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
    console.log('🚀 Starting checkin API tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testRegistrationStatus();
    await testCheckinAPI();
    await testCheckoutAPI();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
