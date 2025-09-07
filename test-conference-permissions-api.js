// Test script to check conference permissions API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function testConferencePermissionsAPI() {
  console.log('🔍 Testing Conference Permissions API...');
  console.log('API Base URL:', API_BASE_URL);

  try {
    // Test 1: Check if API is running
    console.log('\n1. Testing API connectivity...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    if (healthResponse.ok) {
      console.log('✅ API is running');
    } else {
      console.log('⚠️ API health check failed, but continuing...');
    }
  } catch (error) {
    console.log('⚠️ API health check failed:', error.message);
  }

  try {
    // Test 2: Check user-conference-assignments endpoint
    console.log('\n2. Testing user-conference-assignments endpoint...');
    const response = await fetch(`${API_BASE_URL}/user-conference-assignments`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint accessible');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ Found ${data.data.length} conference assignments`);
      } else {
        console.log('⚠️ No conference assignments found');
        console.log('💡 This might be why navbar shows no conferences');
      }
    } else {
      console.log('❌ API endpoint failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }

  try {
    // Test 3: Check with specific user ID
    console.log('\n3. Testing with specific user ID...');
    const userId = 1; // Test with user ID 1
    const response = await fetch(`${API_BASE_URL}/user-conference-assignments?userId=${userId}`);
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API call with userId successful');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ Found ${data.data.length} assignments for user ${userId}`);
        
        // Analyze the data structure
        data.data.forEach((assignment, index) => {
          console.log(`\nAssignment ${index + 1}:`);
          console.log(`  - User ID: ${assignment.userId}`);
          console.log(`  - Conference ID: ${assignment.conferenceId}`);
          console.log(`  - Conference Name: ${assignment.conferenceName || 'N/A'}`);
          console.log(`  - Is Active: ${assignment.isActive}`);
          console.log(`  - Permissions: ${assignment.permissions}`);
          
          // Try to parse permissions
          try {
            const permissions = typeof assignment.permissions === 'string' 
              ? JSON.parse(assignment.permissions) 
              : assignment.permissions;
            console.log(`  - Parsed Permissions:`, permissions);
          } catch (parseError) {
            console.log(`  - ❌ Failed to parse permissions:`, parseError.message);
          }
        });
      } else {
        console.log(`⚠️ No assignments found for user ${userId}`);
        console.log('💡 User might not have been assigned to any conferences');
      }
    } else {
      console.log('❌ API call with userId failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ API test with userId failed:', error.message);
  }

  try {
    // Test 4: Check conferences endpoint
    console.log('\n4. Testing conferences endpoint...');
    const response = await fetch(`${API_BASE_URL}/conferences`);
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conferences endpoint accessible');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ Found ${data.data.length} conferences`);
      } else {
        console.log('⚠️ No conferences found in database');
        console.log('💡 This might be why no assignments exist');
      }
    } else {
      console.log('❌ Conferences endpoint failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Conferences endpoint test failed:', error.message);
  }

  try {
    // Test 5: Check users endpoint
    console.log('\n5. Testing users endpoint...');
    const response = await fetch(`${API_BASE_URL}/users`);
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Users endpoint accessible');
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        console.log(`✅ Found ${data.data.length} users`);
      } else {
        console.log('⚠️ No users found in database');
        console.log('💡 This might be why no assignments exist');
      }
    } else {
      console.log('❌ Users endpoint failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Users endpoint test failed:', error.message);
  }

  console.log('\n🔍 API Test Summary:');
  console.log('1. Check if API is running');
  console.log('2. Check user-conference-assignments endpoint');
  console.log('3. Check with specific user ID');
  console.log('4. Check conferences endpoint');
  console.log('5. Check users endpoint');
  console.log('\n💡 Next steps:');
  console.log('- If no data found, create sample data using create-conference-assignments.js');
  console.log('- Check database connection and tables');
  console.log('- Verify API endpoints are working');
  console.log('- Check browser console for frontend errors');
}

// Run the test
testConferencePermissionsAPI().catch(console.error);
