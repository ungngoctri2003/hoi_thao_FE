// Test the fixed category logic
const BASE_URL = 'http://localhost:3001';

async function testFixedLogic() {
  try {
    console.log('Testing fixed category logic...\n');
    
    // Wait a bit for backend to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const response = await fetch(`${BASE_URL}/messaging/users-by-category`);
    const data = await response.json();
    
    if (!data.success) {
      console.error('API Error:', data.error);
      return;
    }
    
    const users = data.data || [];
    console.log(`Total users: ${users.length}\n`);
    
    // Group by category
    const byCategory = {
      conference: [],
      system: [],
      non_conference: []
    };
    
    users.forEach(user => {
      if (byCategory[user.CATEGORY]) {
        byCategory[user.CATEGORY].push(user);
      }
    });
    
    // Display results
    console.log('=== CONFERENCE CATEGORY ===');
    console.log(`Count: ${byCategory.conference.length}`);
    byCategory.conference.forEach(user => {
      console.log(`- ${user.NAME} (${user.EMAIL}) - Role: ${user.role || 'N/A'} - Type: ${user.USER_TYPE}`);
    });
    
    console.log('\n=== SYSTEM CATEGORY ===');
    console.log(`Count: ${byCategory.system.length}`);
    byCategory.system.forEach(user => {
      console.log(`- ${user.NAME} (${user.EMAIL}) - Role: ${user.role || 'N/A'} - Type: ${user.USER_TYPE}`);
    });
    
    console.log('\n=== NON_CONFERENCE CATEGORY ===');
    console.log(`Count: ${byCategory.non_conference.length}`);
    byCategory.non_conference.forEach(user => {
      console.log(`- ${user.NAME} (${user.EMAIL}) - Role: ${user.role || 'N/A'} - Type: ${user.USER_TYPE}`);
    });
    
    // Analysis
    console.log('\n=== ANALYSIS ===');
    const systemAttendees = byCategory.system.filter(u => u.role === 'attendee');
    const systemAdmins = byCategory.system.filter(u => u.role === 'admin');
    const systemStaff = byCategory.system.filter(u => u.role === 'staff');
    
    console.log(`System category breakdown:`);
    console.log(`- Admins: ${systemAdmins.length}`);
    console.log(`- Staff: ${systemStaff.length}`);
    console.log(`- Attendees: ${systemAttendees.length} (❌ Should be 0)`);
    
    if (systemAttendees.length > 0) {
      console.log('\n❌ ISSUE: System category still contains attendees!');
      systemAttendees.forEach(user => {
        console.log(`  - ${user.NAME} (${user.EMAIL})`);
      });
    } else {
      console.log('\n✅ SUCCESS: System category only contains admin/staff');
    }
    
    // Check non_conference
    const nonConferenceAttendees = byCategory.non_conference.filter(u => u.role === 'attendee');
    const nonConferenceAdmins = byCategory.non_conference.filter(u => u.role === 'admin');
    const nonConferenceStaff = byCategory.non_conference.filter(u => u.role === 'staff');
    
    console.log(`\nNon-conference category breakdown:`);
    console.log(`- Admins: ${nonConferenceAdmins.length} (should be 0)`);
    console.log(`- Staff: ${nonConferenceStaff.length} (should be 0)`);
    console.log(`- Attendees: ${nonConferenceAttendees.length} (should be > 0)`);
    
    if (nonConferenceAdmins.length > 0 || nonConferenceStaff.length > 0) {
      console.log('\n❌ ISSUE: Non-conference category contains admin/staff!');
    } else {
      console.log('\n✅ SUCCESS: Non-conference category only contains attendees');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFixedLogic();
