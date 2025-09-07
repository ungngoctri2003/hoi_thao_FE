// Debug script to check role assignment issue
const API_BASE_URL = 'http://localhost:3001/api';

async function debugRoleIssue() {
    console.log('🔍 Debugging role assignment issue...\n');
    
    // Get token from cookies or localStorage
    const token = getToken();
    if (!token) {
        console.log('❌ No token found. Please login first.');
        return;
    }
    
    console.log('✅ Token found:', token.substring(0, 20) + '...');
    
    try {
        // Test profile endpoint
        console.log('\n📋 Testing /profile endpoint...');
        const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const profileData = await profileResponse.json();
        console.log('Profile Response Status:', profileResponse.status);
        console.log('Profile Data:', JSON.stringify(profileData, null, 2));
        
        if (profileData.data && profileData.data.user) {
            const user = profileData.data.user;
            console.log('\n👤 User Info:');
            console.log('- ID:', user.ID);
            console.log('- Email:', user.EMAIL);
            console.log('- Name:', user.NAME);
            console.log('- ROLE_CODE:', user.ROLE_CODE);
            console.log('- Avatar:', user.AVATAR_URL);
        }
        
        // Test users/me endpoint
        console.log('\n📋 Testing /users/me endpoint...');
        const meResponse = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const meData = await meResponse.json();
        console.log('Users/Me Response Status:', meResponse.status);
        console.log('Users/Me Data:', JSON.stringify(meData, null, 2));
        
        if (meData.data) {
            console.log('\n👤 Users/Me Info:');
            console.log('- User:', meData.data.user);
            console.log('- Permissions:', meData.data.permissions);
        }
        
        // Test roles endpoint
        console.log('\n📋 Testing /roles endpoint...');
        const rolesResponse = await fetch(`${API_BASE_URL}/roles`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const rolesData = await rolesResponse.json();
        console.log('Roles Response Status:', rolesResponse.status);
        console.log('Roles Data:', JSON.stringify(rolesData, null, 2));
        
        // Test permissions endpoint
        console.log('\n📋 Testing /permissions endpoint...');
        const permissionsResponse = await fetch(`${API_BASE_URL}/permissions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const permissionsData = await permissionsResponse.json();
        console.log('Permissions Response Status:', permissionsResponse.status);
        console.log('Permissions Data:', JSON.stringify(permissionsData, null, 2));
        
        // Analyze role determination
        console.log('\n🔍 Role Determination Analysis:');
        const userData = profileData.data?.user;
        const permissions = meData.data?.permissions || [];
        
        console.log('- User ROLE_CODE:', userData?.ROLE_CODE);
        console.log('- Permissions:', permissions);
        console.log('- Has roles.admin permission:', permissions.includes('roles.admin'));
        console.log('- Has conferences.create permission:', permissions.includes('conferences.create'));
        console.log('- Has conferences.update permission:', permissions.includes('conferences.update'));
        
        // Determine role using current logic
        let role = 'attendee';
        if (permissions.includes('roles.admin') || userData?.ROLE_CODE === 'admin') {
            role = 'admin';
        } else if (permissions.includes('conferences.create') || permissions.includes('conferences.update') || userData?.ROLE_CODE === 'staff') {
            role = 'staff';
        } else if (userData?.ROLE_CODE) {
            role = userData.ROLE_CODE;
        }
        
        console.log('\n🎯 Determined Role:', role);
        
        if (role === 'attendee' && userData?.ROLE_CODE === 'admin') {
            console.log('\n❌ ISSUE FOUND: User has ROLE_CODE=admin but determined role is attendee');
            console.log('This suggests the permissions array is empty or missing roles.admin permission');
        }
        
    } catch (error) {
        console.error('❌ Error during debugging:', error);
    }
}

function getToken() {
    // Try to get from cookies first
    if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('accessToken='));
        if (tokenCookie) {
            return tokenCookie.split('=')[1];
        }
        return localStorage.getItem('accessToken');
    }
    return null;
}

// Run the debug function
debugRoleIssue();
