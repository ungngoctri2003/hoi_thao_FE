// Using built-in fetch in Node.js 18+

async function testBackendAuth() {
    console.log('🔍 Testing Backend Authentication...\n');
    
    // Test 1: Check if backend is running
    console.log('1. Testing backend health...');
    try {
        const healthResponse = await fetch('http://localhost:4000/api/v1/health');
        const healthData = await healthResponse.json();
        console.log('✅ Backend is running:', healthData);
    } catch (error) {
        console.log('❌ Backend is not running:', error.message);
        return;
    }
    
    // Test 2: Try to login with admin credentials
    console.log('\n2. Testing admin login...');
    try {
        const loginResponse = await fetch('http://localhost:4000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@conference.vn',
                password: 'admin123'
            })
        });
        
        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log('✅ Admin login successful');
            console.log('Token:', loginData.data.accessToken.substring(0, 20) + '...');
            
            // Test 3: Use token to access protected endpoints
            console.log('\n3. Testing protected endpoints with token...');
            const token = loginData.data.accessToken;
            
            // Test profile endpoint
            const profileResponse = await fetch('http://localhost:4000/api/v1/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const profileData = await profileResponse.json();
            
            if (profileResponse.ok) {
                console.log('✅ Profile API works:', profileData.data);
            } else {
                console.log('❌ Profile API failed:', profileData);
            }
            
            // Test roles endpoint
            const rolesResponse = await fetch('http://localhost:4000/api/v1/roles', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const rolesData = await rolesResponse.json();
            
            if (rolesResponse.ok) {
                console.log('✅ Roles API works:', rolesData.data);
            } else {
                console.log('❌ Roles API failed:', rolesData);
            }
            
            // Test permissions endpoint
            const permissionsResponse = await fetch('http://localhost:4000/api/v1/permissions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const permissionsData = await permissionsResponse.json();
            
            if (permissionsResponse.ok) {
                console.log('✅ Permissions API works:', permissionsData.data);
            } else {
                console.log('❌ Permissions API failed:', permissionsData);
            }
            
        } else {
            console.log('❌ Admin login failed:', loginData);
        }
        
    } catch (error) {
        console.log('❌ Login error:', error.message);
    }
}

// Run the test
testBackendAuth().catch(console.error);
