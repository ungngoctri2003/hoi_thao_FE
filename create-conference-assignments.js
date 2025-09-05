// Script to create sample conference assignments for testing
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleConferenceAssignments() {
  try {
    console.log('🚀 Creating sample conference assignments...');

    // First, check if we have users
    const users = await prisma.user.findMany();
    console.log(`📊 Found ${users.length} users in database`);

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    // Check if we have conferences
    const conferences = await prisma.conference.findMany();
    console.log(`📊 Found ${conferences.length} conferences in database`);

    if (conferences.length === 0) {
      console.log('❌ No conferences found. Please create conferences first.');
      return;
    }

    // Create sample conference assignments
    const sampleAssignments = [
      {
        userId: users[0].id,
        conferenceId: conferences[0].id,
        permissions: {
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
        },
        isActive: 1
      }
    ];

    // Add more assignments if we have more conferences
    if (conferences.length > 1) {
      sampleAssignments.push({
        userId: users[0].id,
        conferenceId: conferences[1].id,
        permissions: {
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
          'roles.manage': true,
          'mobile.view': true,
        },
        isActive: 1
      });
    }

    // Create assignments for other users if they exist
    if (users.length > 1) {
      sampleAssignments.push({
        userId: users[1].id,
        conferenceId: conferences[0].id,
        permissions: {
          'conferences.view': true,
          'attendees.view': true,
          'networking.view': true,
          'venue.view': true,
          'sessions.view': true,
          'badges.view': true,
          'my-events.view': true,
          'mobile.view': true,
        },
        isActive: 1
      });
    }

    // Insert assignments
    for (const assignment of sampleAssignments) {
      try {
        const existing = await prisma.userConferenceAssignment.findFirst({
          where: {
            userId: assignment.userId,
            conferenceId: assignment.conferenceId
          }
        });

        if (existing) {
          console.log(`⚠️ Assignment already exists for user ${assignment.userId} and conference ${assignment.conferenceId}`);
          continue;
        }

        const created = await prisma.userConferenceAssignment.create({
          data: {
            userId: assignment.userId,
            conferenceId: assignment.conferenceId,
            permissions: JSON.stringify(assignment.permissions),
            isActive: assignment.isActive
          }
        });

        console.log(`✅ Created assignment for user ${assignment.userId} and conference ${assignment.conferenceId}`);
      } catch (error) {
        console.error(`❌ Failed to create assignment for user ${assignment.userId}:`, error.message);
      }
    }

    // Verify assignments were created
    const allAssignments = await prisma.userConferenceAssignment.findMany({
      include: {
        user: true,
        conference: true
      }
    });

    console.log(`\n📋 Created ${allAssignments.length} conference assignments:`);
    allAssignments.forEach(assignment => {
      console.log(`  - User: ${assignment.user.name} (${assignment.user.email})`);
      console.log(`    Conference: ${assignment.conference.name || `Conference #${assignment.conferenceId}`}`);
      console.log(`    Permissions: ${Object.keys(JSON.parse(assignment.permissions)).length} permissions`);
      console.log(`    Active: ${assignment.isActive ? 'Yes' : 'No'}`);
      console.log('');
    });

    console.log('✅ Sample conference assignments created successfully!');
    console.log('💡 Now test the navbar to see if conferences are displayed.');

  } catch (error) {
    console.error('❌ Error creating sample conference assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleConferenceAssignments();
