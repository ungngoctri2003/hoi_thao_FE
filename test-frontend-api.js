const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('=== Testing Frontend API Calls ===\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:4000/api/v1/auth/login', {
      email: 'admin@conference.vn',
      password: 'admin123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // Test getMyAssignments API (same as frontend calls)
    console.log('\n2. Testing getMyAssignments API...');
    const assignmentsResponse = await axios.get('http://localhost:4000/api/v1/user-conference-assignments/my-assignments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ getMyAssignments response:');
    console.log('Success:', assignmentsResponse.data.success);
    console.log('Data length:', assignmentsResponse.data.data.length);
    
    if (assignmentsResponse.data.data.length > 0) {
      console.log('First assignment:');
      const first = assignmentsResponse.data.data[0];
      console.log('- Conference ID:', first.conferenceId);
      console.log('- Conference Name:', first.conferenceName);
      console.log('- Is Active:', first.isActive);
      console.log('- Permissions:', first.permissions);
    }

    // Simulate frontend processing
    console.log('\n3. Simulating frontend processing...');
    const assignments = assignmentsResponse.data.data;
    
    const conferencePermissions = assignments.map(assignment => {
      const permissions = typeof assignment.permissions === 'string' 
        ? JSON.parse(assignment.permissions) 
        : assignment.permissions || {};
      
      return {
        conferenceId: assignment.conferenceId,
        conferenceName: assignment.conferenceName || `Hội nghị #${assignment.conferenceId}`,
        permissions: permissions,
        isActive: assignment.isActive === 1
      };
    });

    console.log('Processed conference permissions:');
    conferencePermissions.forEach(cp => {
      console.log(`- ${cp.conferenceName} (ID: ${cp.conferenceId}, Active: ${cp.isActive})`);
      console.log(`  Permissions: ${Object.keys(cp.permissions).filter(k => cp.permissions[k]).join(', ')}`);
    });

    const availableConferences = conferencePermissions.filter(cp => cp.isActive);
    console.log(`\nAvailable conferences: ${availableConferences.length}`);
    availableConferences.forEach(conf => {
      console.log(`- ${conf.conferenceName}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  } finally {
    process.exit(0);
  }
}

testFrontendAPI();
