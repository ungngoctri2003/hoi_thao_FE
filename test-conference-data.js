// Using built-in fetch in Node.js 18+

const API_BASE_URL = 'http://localhost:3001/api';

async function testConferenceData() {
  try {
    console.log('Testing conference data...');
    
    // Test conferences endpoint
    console.log('\n1. Testing conferences endpoint...');
    const conferencesResponse = await fetch(`${API_BASE_URL}/conferences?page=1&limit=10`);
    const conferencesData = await conferencesResponse.json();
    console.log('Conferences response:', JSON.stringify(conferencesData, null, 2));
    
    // Test user conference assignments endpoint
    console.log('\n2. Testing user conference assignments endpoint...');
    const assignmentsResponse = await fetch(`${API_BASE_URL}/user-conference-assignments?page=1&limit=10`);
    const assignmentsData = await assignmentsResponse.json();
    console.log('Assignments response:', JSON.stringify(assignmentsData, null, 2));
    
    // Test users endpoint
    console.log('\n3. Testing users endpoint...');
    const usersResponse = await fetch(`${API_BASE_URL}/users?page=1&limit=10`);
    const usersData = await usersResponse.json();
    console.log('Users response:', JSON.stringify(usersData, null, 2));
    
    // Test roles endpoint
    console.log('\n4. Testing roles endpoint...');
    const rolesResponse = await fetch(`${API_BASE_URL}/roles`);
    const rolesData = await rolesResponse.json();
    console.log('Roles response:', JSON.stringify(rolesData, null, 2));
    
    // Test permissions endpoint
    console.log('\n5. Testing permissions endpoint...');
    const permissionsResponse = await fetch(`${API_BASE_URL}/permissions`);
    const permissionsData = await permissionsResponse.json();
    console.log('Permissions response:', JSON.stringify(permissionsData, null, 2));
    
  } catch (error) {
    console.error('Error testing conference data:', error);
  }
}

testConferenceData();
