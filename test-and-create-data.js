// Simple script to test API and create data
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function testAndCreateData() {
  console.log('🔍 Testing API and creating sample data...');
  console.log('API Base URL:', API_BASE_URL);

  try {
    // Test 1: Check API health
    console.log('\n1. Testing API health...');
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      console.log('Health check status:', healthResponse.status);
    } catch (error) {
      console.log('Health check failed:', error.message);
    }

    // Test 2: Check users endpoint
    console.log('\n2. Testing users endpoint...');
    try {
      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      console.log('Users endpoint status:', usersResponse.status);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('Users data:', JSON.stringify(usersData, null, 2));
      } else {
        const errorText = await usersResponse.text();
        console.log('Users endpoint error:', errorText);
      }
    } catch (error) {
      console.log('Users endpoint failed:', error.message);
    }

    // Test 3: Check conferences endpoint
    console.log('\n3. Testing conferences endpoint...');
    try {
      const conferencesResponse = await fetch(`${API_BASE_URL}/conferences`);
      console.log('Conferences endpoint status:', conferencesResponse.status);
      
      if (conferencesResponse.ok) {
        const conferencesData = await conferencesResponse.json();
        console.log('Conferences data:', JSON.stringify(conferencesData, null, 2));
      } else {
        const errorText = await conferencesResponse.text();
        console.log('Conferences endpoint error:', errorText);
      }
    } catch (error) {
      console.log('Conferences endpoint failed:', error.message);
    }

    // Test 4: Check assignments endpoint
    console.log('\n4. Testing assignments endpoint...');
    try {
      const assignmentsResponse = await fetch(`${API_BASE_URL}/user-conference-assignments`);
      console.log('Assignments endpoint status:', assignmentsResponse.status);
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        console.log('Assignments data:', JSON.stringify(assignmentsData, null, 2));
      } else {
        const errorText = await assignmentsResponse.text();
        console.log('Assignments endpoint error:', errorText);
      }
    } catch (error) {
      console.log('Assignments endpoint failed:', error.message);
    }

    // Test 5: Try to create a conference
    console.log('\n5. Testing conference creation...');
    try {
      const conferenceData = {
        name: 'Test Conference 2024',
        description: 'Test conference for debugging',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-03T23:59:59.000Z',
        location: 'Test Location',
        status: 'active'
      };

      const createResponse = await fetch(`${API_BASE_URL}/conferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conferenceData)
      });

      console.log('Create conference status:', createResponse.status);
      
      if (createResponse.ok) {
        const createdData = await createResponse.json();
        console.log('Created conference:', JSON.stringify(createdData, null, 2));
      } else {
        const errorText = await createResponse.text();
        console.log('Create conference error:', errorText);
      }
    } catch (error) {
      console.log('Create conference failed:', error.message);
    }

    // Test 6: Check if we can get assignments for a specific user
    console.log('\n6. Testing assignments for user ID 1...');
    try {
      const userAssignmentsResponse = await fetch(`${API_BASE_URL}/user-conference-assignments?userId=1`);
      console.log('User assignments status:', userAssignmentsResponse.status);
      
      if (userAssignmentsResponse.ok) {
        const userAssignmentsData = await userAssignmentsResponse.json();
        console.log('User assignments data:', JSON.stringify(userAssignmentsData, null, 2));
      } else {
        const errorText = await userAssignmentsResponse.text();
        console.log('User assignments error:', errorText);
      }
    } catch (error) {
      console.log('User assignments failed:', error.message);
    }

    console.log('\n📋 Summary:');
    console.log('1. Check if backend server is running on port 4000');
    console.log('2. Check if database is connected');
    console.log('3. Check if API endpoints are working');
    console.log('4. If no data, you may need to create it manually in the database');
    console.log('\n💡 Next steps:');
    console.log('- Check backend server logs');
    console.log('- Check database connection');
    console.log('- Run the SQL script: create-sample-data-sql.sql');
    console.log('- Or create data manually through your database management tool');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

// Run the test
testAndCreateData();
