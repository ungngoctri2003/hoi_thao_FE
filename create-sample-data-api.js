// Script to create sample data using API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function createSampleDataViaAPI() {
  try {
    console.log('🚀 Creating sample data via API...');
    console.log('API Base URL:', API_BASE_URL);

    // Step 1: Check if API is running
    console.log('\n1. Checking API connectivity...');
    try {
      const healthResponse = await fetch(`${API_BASE_URL}/health`);
      if (healthResponse.ok) {
        console.log('✅ API is running');
      } else {
        console.log('⚠️ API health check failed, but continuing...');
      }
    } catch (error) {
      console.log('⚠️ API health check failed:', error.message);
    }

    // Step 2: Check existing data
    console.log('\n2. Checking existing data...');
    
    const conferencesResponse = await fetch(`${API_BASE_URL}/conferences`);
    const conferences = conferencesResponse.ok ? await conferencesResponse.json() : { data: [] };
    
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    const users = usersResponse.ok ? await usersResponse.json() : { data: [] };
    
    const assignmentsResponse = await fetch(`${API_BASE_URL}/user-conference-assignments`);
    const assignments = assignmentsResponse.ok ? await assignmentsResponse.json() : { data: [] };
    
    console.log(`Conferences: ${conferences.data?.length || 0}`);
    console.log(`Users: ${users.data?.length || 0}`);
    console.log(`Assignments: ${assignments.data?.length || 0}`);

    // Step 3: Create conferences if none exist
    if (!conferences.data || conferences.data.length === 0) {
      console.log('\n3. Creating sample conferences...');
      
      const sampleConferences = [
        {
          name: 'Hội nghị Công nghệ 2024',
          description: 'Hội nghị về công nghệ và đổi mới',
          startDate: '2024-01-15T00:00:00.000Z',
          endDate: '2024-01-17T23:59:59.000Z',
          location: 'Hà Nội',
          status: 'active'
        },
        {
          name: 'Hội nghị AI & Machine Learning',
          description: 'Hội nghị về trí tuệ nhân tạo và học máy',
          startDate: '2024-02-20T00:00:00.000Z',
          endDate: '2024-02-22T23:59:59.000Z',
          location: 'TP.HCM',
          status: 'active'
        }
      ];

      for (const conferenceData of sampleConferences) {
        try {
          const response = await fetch(`${API_BASE_URL}/conferences`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(conferenceData)
          });

          if (response.ok) {
            const created = await response.json();
            console.log(`✅ Created conference: ${conferenceData.name}`);
          } else {
            console.log(`❌ Failed to create conference: ${conferenceData.name}`);
          }
        } catch (error) {
          console.log(`❌ Error creating conference ${conferenceData.name}:`, error.message);
        }
      }
    } else {
      console.log('✅ Conferences already exist');
    }

    // Step 4: Get updated data
    console.log('\n4. Getting updated data...');
    
    const updatedConferencesResponse = await fetch(`${API_BASE_URL}/conferences`);
    const updatedConferences = updatedConferencesResponse.ok ? await updatedConferencesResponse.json() : { data: [] };
    
    const updatedUsersResponse = await fetch(`${API_BASE_URL}/users`);
    const updatedUsers = updatedUsersResponse.ok ? await updatedUsersResponse.json() : { data: [] };

    console.log(`Updated Conferences: ${updatedConferences.data?.length || 0}`);
    console.log(`Updated Users: ${updatedUsers.data?.length || 0}`);

    if (!updatedConferences.data || updatedConferences.data.length === 0) {
      console.log('❌ No conferences available for assignments');
      return;
    }

    if (!updatedUsers.data || updatedUsers.data.length === 0) {
      console.log('❌ No users available for assignments');
      return;
    }

    // Step 5: Create conference assignments
    console.log('\n5. Creating conference assignments...');
    
    for (const user of updatedUsers.data) {
      for (const conference of updatedConferences.data) {
        // Check if assignment already exists
        const existingResponse = await fetch(
          `${API_BASE_URL}/user-conference-assignments?userId=${user.id}&conferenceId=${conference.id}`
        );
        
        if (existingResponse.ok) {
          const existing = await existingResponse.json();
          if (existing.data && existing.data.length > 0) {
            console.log(`⚠️ Assignment already exists for user ${user.id} and conference ${conference.id}`);
            continue;
          }
        }

        // Determine permissions based on user role
        let permissions = {};
        
        if (user.role === 'admin') {
          permissions = {
            'conferences.view': true,
            'conferences.create': true,
            'conferences.update': true,
            'conferences.delete': true,
            'attendees.view': true,
            'attendees.manage': true,
            'checkin.manage': true,
            'networking.view': true,
            'venue.view': true,
            'sessions.view': true,
            'badges.view': true,
            'analytics.view': true,
            'my-events.view': true,
            'roles.manage': true,
            'mobile.view': true,
          };
        } else if (user.role === 'staff') {
          permissions = {
            'conferences.view': true,
            'conferences.create': true,
            'conferences.update': true,
            'attendees.view': true,
            'attendees.manage': true,
            'checkin.manage': true,
            'networking.view': true,
            'venue.view': true,
            'sessions.view': true,
            'badges.view': true,
            'analytics.view': true,
            'my-events.view': true,
            'mobile.view': true,
          };
        } else {
          // attendee
          permissions = {
            'conferences.view': true,
            'attendees.view': true,
            'networking.view': true,
            'venue.view': true,
            'sessions.view': true,
            'badges.view': true,
            'my-events.view': true,
            'mobile.view': true,
          };
        }

        try {
          const assignmentData = {
            userId: user.id,
            conferenceId: conference.id,
            permissions: JSON.stringify(permissions),
            isActive: 1
          };

          const response = await fetch(`${API_BASE_URL}/user-conference-assignments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(assignmentData)
          });

          if (response.ok) {
            console.log(`✅ Created assignment for user ${user.name} (${user.role}) and conference ${conference.name}`);
          } else {
            const errorText = await response.text();
            console.log(`❌ Failed to create assignment for user ${user.id} and conference ${conference.id}: ${errorText}`);
          }
        } catch (error) {
          console.log(`❌ Error creating assignment for user ${user.id} and conference ${conference.id}:`, error.message);
        }
      }
    }

    // Step 6: Verify created assignments
    console.log('\n6. Verifying created assignments...');
    
    const finalAssignmentsResponse = await fetch(`${API_BASE_URL}/user-conference-assignments`);
    if (finalAssignmentsResponse.ok) {
      const finalAssignments = await finalAssignmentsResponse.json();
      console.log(`✅ Total assignments created: ${finalAssignments.data?.length || 0}`);
      
      if (finalAssignments.data && finalAssignments.data.length > 0) {
        console.log('\n📋 Assignment details:');
        finalAssignments.data.forEach((assignment, index) => {
          console.log(`  ${index + 1}. User ID: ${assignment.userId}, Conference ID: ${assignment.conferenceId}`);
          console.log(`     Active: ${assignment.isActive ? 'Yes' : 'No'}`);
          console.log(`     Permissions: ${Object.keys(JSON.parse(assignment.permissions)).length} permissions`);
        });
      }
    }

    console.log('\n🎉 Sample data creation completed!');
    console.log('💡 Now refresh your browser and check the navbar.');
    console.log('🔗 Visit /debug-conference-permissions to see detailed information.');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Run the script
createSampleDataViaAPI();
