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

async function testConferenceDisplayFix() {
    console.log('🔍 Testing Conference Display Fix...\n');

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
            
            if (adminAssignmentsResponse.data.data.length === 0) {
                console.log('   - Admin has no conference assignments (expected for dummy conference)');
            } else {
                console.log('   - Admin has conference assignments:');
                adminAssignmentsResponse.data.data.forEach(assignment => {
                    console.log(`     * Conference ${assignment.conferenceId}: ${assignment.conferenceName}`);
                });
            }
        } catch (error) {
            console.log('❌ Admin assignments API failed:', error.response?.data?.message || error.message);
        }

        // Step 3: Login as test user
        console.log('\n3. Logging in as test user...');
        const userLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'lamcongtri2003@gmail.com',
                password: 'password123'
            })
        });

        const userToken = userLoginResponse.data.data.accessToken;
        console.log('✅ User login successful');

        // Step 4: Test user's assignments
        console.log('\n4. Testing user assignments...');
        try {
            const userAssignmentsResponse = await makeRequest(`${API_BASE_URL}/user-conference-assignments/my-assignments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });

            console.log('✅ User assignments API successful');
            console.log(`   - Raw assignments: ${userAssignmentsResponse.data.data.length}`);
            
            if (userAssignmentsResponse.data.data.length === 0) {
                console.log('   - User has no conference assignments');
            } else {
                console.log('   - User has conference assignments:');
                userAssignmentsResponse.data.data.forEach(assignment => {
                    console.log(`     * Conference ${assignment.conferenceId}: ${assignment.conferenceName}`);
                    console.log(`       Permissions: ${Object.keys(JSON.parse(assignment.permissions || '{}')).length} quyền`);
                });
            }
        } catch (error) {
            console.log('❌ User assignments API failed:', error.response?.data?.message || error.message);
        }

        // Step 5: Test with different users
        console.log('\n5. Testing with different user roles...');
        
        // Test staff user
        try {
            const staffLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({
                    email: 'staff@conference.com',
                    password: 'staff123'
                })
            });

            const staffToken = staffLoginResponse.data.data.accessToken;
            const staffAssignmentsResponse = await makeRequest(`${API_BASE_URL}/user-conference-assignments/my-assignments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${staffToken}`
                }
            });

            console.log(`   - Staff assignments: ${staffAssignmentsResponse.data.data.length}`);
        } catch (error) {
            console.log('   - Staff test failed:', error.response?.data?.message || error.message);
        }

        // Test attendee user
        try {
            const attendeeLoginResponse = await makeRequest(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({
                    email: 'attendee@conference.com',
                    password: 'attendee123'
                })
            });

            const attendeeToken = attendeeLoginResponse.data.data.accessToken;
            const attendeeAssignmentsResponse = await makeRequest(`${API_BASE_URL}/user-conference-assignments/my-assignments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${attendeeToken}`
                }
            });

            console.log(`   - Attendee assignments: ${attendeeAssignmentsResponse.data.data.length}`);
        } catch (error) {
            console.log('   - Attendee test failed:', error.response?.data?.message || error.message);
        }

        console.log('\n✅ Test completed!');
        console.log('\n📋 Summary:');
        console.log('- Admin/Staff should see "Tất cả hội nghị" if no assignments');
        console.log('- Users with assignments should see their assigned conferences');
        console.log('- Users without assignments should see "Không có hội nghị"');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testConferenceDisplayFix();
