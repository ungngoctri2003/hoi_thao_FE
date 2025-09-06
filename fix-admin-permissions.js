// Fix admin permissions để có quyền registrations
// Using built-in fetch in Node.js 18+

async function fixAdminPermissions() {
    console.log('🔧 Fixing admin permissions...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // Get current admin user info
        console.log('1️⃣ Getting admin user info...');
        const userResponse = await fetch('http://localhost:4000/api/v1/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const userData = await userResponse.json();
        console.log('👤 User info:', JSON.stringify(userData, null, 2));
        
        // Get all roles
        console.log('\n2️⃣ Getting all roles...');
        const rolesResponse = await fetch('http://localhost:4000/api/v1/roles', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const rolesData = await rolesResponse.json();
        console.log('🎭 Roles:', JSON.stringify(rolesData, null, 2));
        
        // Get all permissions
        console.log('\n3️⃣ Getting all permissions...');
        const permissionsResponse = await fetch('http://localhost:4000/api/v1/permissions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const permissionsData = await permissionsResponse.json();
        console.log('🔐 Permissions:', JSON.stringify(permissionsData, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
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

async function runFix() {
    console.log('🚀 Starting admin permissions fix...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await fixAdminPermissions();
    
    console.log('\n🏁 Fix completed!');
}

runFix().catch(console.error);
