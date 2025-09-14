// Simple test script để kiểm tra API attendees
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testAPI() {
  console.log("🧪 Testing API endpoints...\n");

  // Test 1: Health check
  try {
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log(`   Response: ${healthData}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 2: Conferences endpoint
  try {
    console.log("\n2. Testing conferences endpoint...");
    const conferencesResponse = await fetch(`${API_BASE_URL}/conferences`);
    console.log(`   Status: ${conferencesResponse.status}`);
    if (conferencesResponse.ok) {
      const conferencesData = await conferencesResponse.json();
      console.log(`   Data: ${JSON.stringify(conferencesData, null, 2)}`);
    } else {
      const errorText = await conferencesResponse.text();
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 3: Attendees endpoint (without auth)
  try {
    console.log("\n3. Testing attendees endpoint (no auth)...");
    const attendeesResponse = await fetch(`${API_BASE_URL}/attendees`);
    console.log(`   Status: ${attendeesResponse.status}`);
    if (attendeesResponse.ok) {
      const attendeesData = await attendeesResponse.json();
      console.log(`   Data: ${JSON.stringify(attendeesData, null, 2)}`);
    } else {
      const errorText = await attendeesResponse.text();
      console.log(`   Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  // Test 4: Check if backend is running
  try {
    console.log("\n4. Testing basic connectivity...");
    const response = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    console.log(`   Status: ${response.status}`);
    console.log(
      `   Headers: ${JSON.stringify([...response.headers.entries()])}`
    );
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }

  console.log("\n✅ Test completed!");
}

testAPI().catch(console.error);

