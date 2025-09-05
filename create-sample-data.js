// Script to create sample data for testing
const API_BASE_URL = 'http://localhost:3001/api';

// Sample data
const sampleConferences = [
  {
    name: "Hội nghị AI 2024",
    description: "Hội nghị về trí tuệ nhân tạo và machine learning",
    startDate: "2024-12-15T08:00:00Z",
    endDate: "2024-12-17T18:00:00Z",
    location: "Hà Nội",
    status: "active"
  },
  {
    name: "Tech Conference 2024",
    description: "Hội nghị công nghệ thông tin",
    startDate: "2024-12-20T09:00:00Z",
    endDate: "2024-12-22T17:00:00Z",
    location: "TP.HCM",
    status: "active"
  },
  {
    name: "Blockchain Summit",
    description: "Hội nghị về blockchain và cryptocurrency",
    startDate: "2024-12-25T10:00:00Z",
    endDate: "2024-12-27T16:00:00Z",
    location: "Đà Nẵng",
    status: "active"
  }
];

const sampleUsers = [
  {
    name: "Nguyễn Văn Admin",
    email: "admin@example.com",
    role: "admin",
    status: "active"
  },
  {
    name: "Trần Thị Staff",
    email: "staff@example.com", 
    role: "staff",
    status: "active"
  },
  {
    name: "Lê Văn Attendee",
    email: "attendee@example.com",
    role: "attendee", 
    status: "active"
  }
];

const sampleAssignments = [
  {
    userId: 1,
    conferenceId: 1,
    permissions: {
      "conferences.view": true,
      "conferences.update": true,
      "attendees.view": true,
      "attendees.manage": true,
      "checkin.manage": true,
      "analytics.view": true
    },
    isActive: 1
  },
  {
    userId: 2,
    conferenceId: 1,
    permissions: {
      "conferences.view": true,
      "attendees.view": true,
      "checkin.manage": true
    },
    isActive: 1
  },
  {
    userId: 2,
    conferenceId: 2,
    permissions: {
      "conferences.view": true,
      "attendees.view": true,
      "networking.view": true
    },
    isActive: 1
  }
];

async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // First, check if backend is running
    try {
      const healthCheck = await fetch(`${API_BASE_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      console.error('Backend is not running. Please start the backend first:');
      console.error('cd D:\\DATN\\HOI_THAO_BE && npm run dev');
      return;
    }
    
    // Create conferences
    console.log('\n1. Creating conferences...');
    for (const conference of sampleConferences) {
      try {
        const response = await fetch(`${API_BASE_URL}/conferences`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(conference)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✓ Created conference: ${conference.name} (ID: ${data.data?.id})`);
        } else {
          console.log(`✗ Failed to create conference: ${conference.name}`);
        }
      } catch (error) {
        console.log(`✗ Error creating conference ${conference.name}:`, error.message);
      }
    }
    
    // Create users
    console.log('\n2. Creating users...');
    for (const user of sampleUsers) {
      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✓ Created user: ${user.name} (ID: ${data.data?.id})`);
        } else {
          console.log(`✗ Failed to create user: ${user.name}`);
        }
      } catch (error) {
        console.log(`✗ Error creating user ${user.name}:`, error.message);
      }
    }
    
    // Wait a bit for users to be created
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create conference assignments
    console.log('\n3. Creating conference assignments...');
    for (const assignment of sampleAssignments) {
      try {
        const response = await fetch(`${API_BASE_URL}/user-conference-assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assignment)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✓ Created assignment for user ${assignment.userId} and conference ${assignment.conferenceId}`);
        } else {
          console.log(`✗ Failed to create assignment for user ${assignment.userId}`);
        }
      } catch (error) {
        console.log(`✗ Error creating assignment:`, error.message);
      }
    }
    
    console.log('\n✓ Sample data creation completed!');
    console.log('\nYou can now test the frontend with sample data.');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSampleData();
