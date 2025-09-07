const API_BASE_URL = 'http://localhost:3001/api';

async function makeRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || response.statusText}`);
    }
    
    return { data, status: response.status };
}

async function testConferenceRealData() {
    console.log('🔍 Testing Conference Real Data Display...\n');

    try {
        // Step 1: Login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@conference.com',
                password: 'admin123'
            })
        });

        const adminToken = loginResponse.data.data.accessToken;
        console.log('✅ Admin login successful');

        // Step 2: Test admin's assignments
        console.log('\n2. Testing admin assignments...');
        try {
            const adminAssignmentsResponse = await makeRequest(`${API_BASE_URL}/user-conference-assignments/my-assignments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            console.log('✅ Admin assignments API successful');
            console.log(`   - Raw assignments: ${adminAssignmentsResponse.data.data.length}`);
        } catch (error) {
            console.log('❌ Admin assignments API failed:', error.message);
        }

        // Step 3: Test conferences API
        console.log('\n3. Testing conferences API...');
        try {
            const conferencesResponse = await makeRequest(`${API_BASE_URL}/conferences`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            console.log('✅ Conferences API successful');
            console.log(`   - Total conferences: ${conferencesResponse.data.data.length}`);
            
            if (conferencesResponse.data.data.length > 0) {
                console.log('   - Conferences:');
                conferencesResponse.data.data.forEach(conference => {
                    console.log(`     * ID: ${conference.id}, Name: ${conference.name}, Status: ${conference.status}`);
                });
            } else {
                console.log('   - No conferences found');
            }
        } catch (error) {
            console.log('❌ Conferences API failed:', error.message);
        }

        // Step 4: Test user assignments API (for roles page)
        console.log('\n4. Testing user assignments API (for roles page)...');
        try {
            const userAssignmentsResponse = await makeRequest(`${API_BASE_URL}/user-conference-assignments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            console.log('✅ User assignments API successful');
            console.log(`   - Total assignments: ${userAssignmentsResponse.data.data.length}`);
            
            if (userAssignmentsResponse.data.data.length > 0) {
                console.log('   - Sample assignments:');
                userAssignmentsResponse.data.data.slice(0, 3).forEach(assignment => {
                    console.log(`     * User: ${assignment.userName} (${assignment.userEmail})`);
                    console.log(`       Conference: ${assignment.conferenceName} (ID: ${assignment.conferenceId})`);
                    console.log(`       Active: ${assignment.isActive === 1 ? 'Yes' : 'No'}`);
                });
            } else {
                console.log('   - No assignments found');
            }
        } catch (error) {
            console.log('❌ User assignments API failed:', error.message);
        }

        // Step 5: Test with different user
        console.log('\n5. Testing with user lamcongtri2003@gmail.com...');
        try {
            const userLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({
                    email: 'lamcongtri2003@gmail.com',
                    password: 'password123'
                })
            });

            const userToken = userLoginResponse.data.data.accessToken;
            console.log('✅ User login successful');

            const userAssignmentsResponse = await makeRequest(`${API_BASE_URL}/user-conference-assignments/my-assignments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            console.log('✅ User assignments API successful');
            console.log(`   - User assignments: ${userAssignmentsResponse.data.data.length}`);
            
            if (userAssignmentsResponse.data.data.length > 0) {
                console.log('   - User conferences:');
                userAssignmentsResponse.data.data.forEach(assignment => {
                    console.log(`     * Conference: ${assignment.conferenceName} (ID: ${assignment.conferenceId})`);
                    console.log(`       Permissions: ${Object.keys(JSON.parse(assignment.permissions || '{}')).length} quyền`);
                });
            } else {
                console.log('   - User has no conference assignments');
            }
        } catch (error) {
            console.log('❌ User test failed:', error.message);
        }

        console.log('\n✅ Test completed!');
        console.log('\n📋 Summary:');
        console.log('- Admin should see real conferences in navbar (not dummy)');
        console.log('- User with assignments should see their assigned conferences');
        console.log('- Roles page should show all assignments');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testConferenceRealData();
