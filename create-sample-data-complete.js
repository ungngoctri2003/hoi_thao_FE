// Complete script to create sample data for conference permissions
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCompleteSampleData() {
  try {
    console.log('🚀 Creating complete sample data for conference permissions...');

    // Step 1: Check existing data
    console.log('\n📊 Checking existing data...');
    
    const existingUsers = await prisma.user.findMany();
    const existingConferences = await prisma.conference.findMany();
    const existingAssignments = await prisma.userConferenceAssignment.findMany();
    
    console.log(`Users: ${existingUsers.length}`);
    console.log(`Conferences: ${existingConferences.length}`);
    console.log(`Assignments: ${existingAssignments.length}`);

    // Step 2: Create conferences if none exist
    if (existingConferences.length === 0) {
      console.log('\n🏢 Creating sample conferences...');
      
      const conferences = [
        {
          name: 'Hội nghị Công nghệ 2024',
          description: 'Hội nghị về công nghệ và đổi mới',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-17'),
          location: 'Hà Nội',
          status: 'active'
        },
        {
          name: 'Hội nghị AI & Machine Learning',
          description: 'Hội nghị về trí tuệ nhân tạo và học máy',
          startDate: new Date('2024-02-20'),
          endDate: new Date('2024-02-22'),
          location: 'TP.HCM',
          status: 'active'
        },
        {
          name: 'Hội nghị Blockchain & Crypto',
          description: 'Hội nghị về blockchain và tiền điện tử',
          startDate: new Date('2024-03-10'),
          endDate: new Date('2024-03-12'),
          location: 'Đà Nẵng',
          status: 'active'
        }
      ];

      for (const conferenceData of conferences) {
        const conference = await prisma.conference.create({
          data: conferenceData
        });
        console.log(`✅ Created conference: ${conference.name} (ID: ${conference.id})`);
      }
    } else {
      console.log('✅ Conferences already exist');
    }

    // Step 3: Get users and conferences
    const users = await prisma.user.findMany();
    const conferences = await prisma.conference.findMany();

    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }

    if (conferences.length === 0) {
      console.log('❌ No conferences found after creation.');
      return;
    }

    console.log(`\n👥 Found ${users.length} users`);
    console.log(`🏢 Found ${conferences.length} conferences`);

    // Step 4: Create conference assignments
    console.log('\n🔗 Creating conference assignments...');
    
    const assignments = [];

    // Create assignments for each user
    for (const user of users) {
      for (const conference of conferences) {
        // Check if assignment already exists
        const existing = await prisma.userConferenceAssignment.findFirst({
          where: {
            userId: user.id,
            conferenceId: conference.id
          }
        });

        if (existing) {
          console.log(`⚠️ Assignment already exists for user ${user.id} and conference ${conference.id}`);
          continue;
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
          const assignment = await prisma.userConferenceAssignment.create({
            data: {
              userId: user.id,
              conferenceId: conference.id,
              permissions: JSON.stringify(permissions),
              isActive: 1
            }
          });

          assignments.push(assignment);
          console.log(`✅ Created assignment for user ${user.name} (${user.role}) and conference ${conference.name}`);
        } catch (error) {
          console.error(`❌ Failed to create assignment for user ${user.id} and conference ${conference.id}:`, error.message);
        }
      }
    }

    // Step 5: Verify created data
    console.log('\n📋 Verifying created data...');
    
    const allAssignments = await prisma.userConferenceAssignment.findMany({
      include: {
        user: true,
        conference: true
      }
    });

    console.log(`\n✅ Created ${allAssignments.length} conference assignments:`);
    
    // Group by user
    const assignmentsByUser = {};
    allAssignments.forEach(assignment => {
      const userId = assignment.user.id;
      if (!assignmentsByUser[userId]) {
        assignmentsByUser[userId] = {
          user: assignment.user,
          assignments: []
        };
      }
      assignmentsByUser[userId].assignments.push(assignment);
    });

    Object.values(assignmentsByUser).forEach(({ user, assignments }) => {
      console.log(`\n👤 User: ${user.name} (${user.email}) - Role: ${user.role}`);
      assignments.forEach(assignment => {
        const permissions = JSON.parse(assignment.permissions);
        const activePermissions = Object.values(permissions).filter(Boolean).length;
        console.log(`  🏢 Conference: ${assignment.conference.name}`);
        console.log(`     - ID: ${assignment.conferenceId}`);
        console.log(`     - Active: ${assignment.isActive ? 'Yes' : 'No'}`);
        console.log(`     - Permissions: ${activePermissions} active`);
      });
    });

    console.log('\n🎉 Sample data creation completed successfully!');
    console.log('💡 Now test the navbar to see if conferences are displayed.');
    console.log('🔗 Visit /debug-conference-permissions to see detailed information.');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createCompleteSampleData();
