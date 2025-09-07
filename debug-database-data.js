// Script to debug database data and API response
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function debugDatabaseData() {
  console.log('🔍 Debugging database data and API response...');
  console.log('API Base URL:', API_BASE_URL);

  try {
    // Get authentication token from localStorage (if running in browser)
    // For now, we'll test without token first
    console.log('\n1. Testing API endpoints without authentication...');
    
    // Test conferences endpoint
    console.log('\n📊 Testing conferences endpoint...');
    try {
      const conferencesResponse = await fetch(`${API_BASE_URL}/conferences`);
      console.log('Conferences status:', conferencesResponse.status);
      
      if (conferencesResponse.ok) {
        const conferencesData = await conferencesResponse.json();
        console.log('Conferences response:', JSON.stringify(conferencesData, null, 2));
        
        if (conferencesData.data && conferencesData.data.length > 0) {
          console.log(`✅ Found ${conferencesData.data.length} conferences`);
          conferencesData.data.forEach((conf, index) => {
            console.log(`  ${index + 1}. ${conf.name} (ID: ${conf.id})`);
          });
        } else {
          console.log('⚠️ No conferences found');
        }
      } else {
        const errorText = await conferencesResponse.text();
        console.log('Conferences error:', errorText);
      }
    } catch (error) {
      console.log('Conferences error:', error.message);
    }

    // Test users endpoint
    console.log('\n👥 Testing users endpoint...');
    try {
      const usersResponse = await fetch(`${API_BASE_URL}/users`);
      console.log('Users status:', usersResponse.status);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log('Users response:', JSON.stringify(usersData, null, 2));
        
        if (usersData.data && usersData.data.length > 0) {
          console.log(`✅ Found ${usersData.data.length} users`);
          usersData.data.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
          });
        } else {
          console.log('⚠️ No users found');
        }
      } else {
        const errorText = await usersResponse.text();
        console.log('Users error:', errorText);
      }
    } catch (error) {
      console.log('Users error:', error.message);
    }

    // Test assignments endpoint
    console.log('\n🔗 Testing assignments endpoint...');
    try {
      const assignmentsResponse = await fetch(`${API_BASE_URL}/user-conference-assignments`);
      console.log('Assignments status:', assignmentsResponse.status);
      
      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        console.log('Assignments response:', JSON.stringify(assignmentsData, null, 2));
        
        if (assignmentsData.data && assignmentsData.data.length > 0) {
          console.log(`✅ Found ${assignmentsData.data.length} assignments`);
          assignmentsData.data.forEach((assignment, index) => {
            console.log(`  ${index + 1}. User ID: ${assignment.userId}, Conference ID: ${assignment.conferenceId}`);
            console.log(`     Active: ${assignment.isActive}, Permissions: ${assignment.permissions}`);
          });
        } else {
          console.log('⚠️ No assignments found');
        }
      } else {
        const errorText = await assignmentsResponse.text();
        console.log('Assignments error:', errorText);
      }
    } catch (error) {
      console.log('Assignments error:', error.message);
    }

    // Test with specific user ID
    console.log('\n🎯 Testing assignments for specific user...');
    try {
      const userAssignmentsResponse = await fetch(`${API_BASE_URL}/user-conference-assignments?userId=1`);
      console.log('User assignments status:', userAssignmentsResponse.status);
      
      if (userAssignmentsResponse.ok) {
        const userAssignmentsData = await userAssignmentsResponse.json();
        console.log('User assignments response:', JSON.stringify(userAssignmentsData, null, 2));
        
        if (userAssignmentsData.data && userAssignmentsData.data.length > 0) {
          console.log(`✅ Found ${userAssignmentsData.data.length} assignments for user 1`);
          userAssignmentsData.data.forEach((assignment, index) => {
            console.log(`  ${index + 1}. Conference ID: ${assignment.conferenceId}`);
            console.log(`     Conference Name: ${assignment.conferenceName || 'N/A'}`);
            console.log(`     Active: ${assignment.isActive}`);
            console.log(`     Permissions: ${assignment.permissions}`);
            
            // Try to parse permissions
            try {
              const permissions = typeof assignment.permissions === 'string' 
                ? JSON.parse(assignment.permissions) 
                : assignment.permissions;
              console.log(`     Parsed permissions:`, permissions);
            } catch (parseError) {
              console.log(`     ❌ Failed to parse permissions:`, parseError.message);
            }
          });
        } else {
          console.log('⚠️ No assignments found for user 1');
        }
      } else {
        const errorText = await userAssignmentsResponse.text();
        console.log('User assignments error:', errorText);
      }
    } catch (error) {
      console.log('User assignments error:', error.message);
    }

    console.log('\n📋 Debug Summary:');
    console.log('1. Check if conferences exist in database');
    console.log('2. Check if users exist in database');
    console.log('3. Check if user_conference_assignments exist');
    console.log('4. Check API response format');
    console.log('5. Check permissions JSON format');
    
    console.log('\n💡 Next steps:');
    console.log('- If data exists but API returns empty, check API implementation');
    console.log('- If permissions are malformed, check JSON format');
    console.log('- If user ID mismatch, check user authentication');
    console.log('- Check browser console for frontend errors');

  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
}

// Run the debug
debugDatabaseData();
