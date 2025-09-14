// Test conference API
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testConferenceAPI() {
  try {
    console.log("Testing conference API...");

    // Test 1: Get all conferences
    console.log("\n1. Testing GET /conferences");
    const response1 = await fetch(`${API_BASE_URL}/conferences`);
    console.log("Status:", response1.status);
    const data1 = await response1.json();
    console.log("Response:", JSON.stringify(data1, null, 2));

    // Test 2: Get conference by ID 32
    console.log("\n2. Testing GET /conferences/32");
    const response2 = await fetch(`${API_BASE_URL}/conferences/32`);
    console.log("Status:", response2.status);
    const data2 = await response2.json();
    console.log("Response:", JSON.stringify(data2, null, 2));

    // Test 3: Get sessions for conference 12 (which has data)
    console.log("\n3. Testing GET /sessions?conferenceId=12");
    const response3 = await fetch(`${API_BASE_URL}/sessions?conferenceId=12`);
    console.log("Status:", response3.status);
    const data3 = await response3.json();
    console.log("Response:", JSON.stringify(data3, null, 2));
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testConferenceAPI();
