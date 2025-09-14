// Test sessions API
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testSessionsAPI() {
  try {
    console.log("Testing sessions API...");

    // Test 1: Get sessions with conferenceId
    console.log("\n1. Testing GET /sessions?conferenceId=32");
    const response1 = await fetch(`${API_BASE_URL}/sessions?conferenceId=32`);
    console.log("Status:", response1.status);
    const data1 = await response1.json();
    console.log("Response:", JSON.stringify(data1, null, 2));

    // Test 2: Get all sessions
    console.log("\n2. Testing GET /sessions");
    const response2 = await fetch(`${API_BASE_URL}/sessions`);
    console.log("Status:", response2.status);
    const data2 = await response2.json();
    console.log("Response:", JSON.stringify(data2, null, 2));

    // Test 3: Get sessions for conference 32 using conference-specific endpoint
    console.log("\n3. Testing GET /conferences/32/sessions");
    const response3 = await fetch(`${API_BASE_URL}/conferences/32/sessions`);
    console.log("Status:", response3.status);
    const data3 = await response3.json();
    console.log("Response:", JSON.stringify(data3, null, 2));
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testSessionsAPI();
