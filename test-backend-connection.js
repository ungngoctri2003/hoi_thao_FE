// Test script to check backend connection
const API_BASE_URL = 'http://localhost:3001/api';

async function testBackendConnection() {
    console.log('🔍 Testing backend connection...');
    console.log(`API Base URL: ${API_BASE_URL}`);
    
    try {
        // Test 1: Ping endpoint
        console.log('\n1. Testing ping endpoint...');
        const pingResponse = await fetch(`${API_BASE_URL}/ping`);
        const pingData = await pingResponse.json();
        console.log('✅ Ping response:', pingData);
        
        // Test 2: Health check
        console.log('\n2. Testing health endpoint...');
        try {
            const healthResponse = await fetch(`${API_BASE_URL}/health`);
            const healthData = await healthResponse.json();
            console.log('✅ Health response:', healthData);
        } catch (error) {
            console.log('⚠️ Health endpoint not available:', error.message);
        }
        
        // Test 3: Auth endpoints
        console.log('\n3. Testing auth endpoints...');
        
        // Test login endpoint (should return 400/401 for invalid credentials)
        try {
            const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
            });
            
            console.log(`Login endpoint status: ${loginResponse.status}`);
            if (loginResponse.status === 400 || loginResponse.status === 401) {
                console.log('✅ Login endpoint is working (returned expected error)');
            } else {
                const loginData = await loginResponse.json();
                console.log('Login response:', loginData);
            }
        } catch (error) {
            console.log('❌ Login endpoint error:', error.message);
        }
        
        // Test 4: Roles endpoint (should require auth)
        console.log('\n4. Testing roles endpoint...');
        try {
            const rolesResponse = await fetch(`${API_BASE_URL}/roles`);
            console.log(`Roles endpoint status: ${rolesResponse.status}`);
            
            if (rolesResponse.status === 401) {
                console.log('✅ Roles endpoint is working (requires authentication)');
            } else {
                const rolesData = await rolesResponse.json();
                console.log('Roles response:', rolesData);
            }
        } catch (error) {
            console.log('❌ Roles endpoint error:', error.message);
        }
        
        // Test 5: Users endpoint
        console.log('\n5. Testing users endpoint...');
        try {
            const usersResponse = await fetch(`${API_BASE_URL}/users`);
            console.log(`Users endpoint status: ${usersResponse.status}`);
            
            if (usersResponse.status === 401) {
                console.log('✅ Users endpoint is working (requires authentication)');
            } else {
                const usersData = await usersResponse.json();
                console.log('Users response:', usersData);
            }
        } catch (error) {
            console.log('❌ Users endpoint error:', error.message);
        }
        
        console.log('\n🎉 Backend connection test completed!');
        
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Make sure backend is running on port 3001');
        console.log('2. Check if backend server is accessible');
        console.log('3. Verify CORS settings in backend');
        console.log('4. Check backend logs for errors');
    }
}

// Run the test
testBackendConnection();