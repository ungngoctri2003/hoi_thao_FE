// Test create session API
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testCreateSession() {
  try {
    console.log("Testing create session API...");

    // Test data
    const sessionData = {
      TITLE: "Test Session from Frontend",
      DESCRIPTION: "Test description",
      START_TIME: "2024-12-25T10:00:00Z",
      END_TIME: "2024-12-25T11:00:00Z",
      SPEAKER: "Test Speaker",
      ROOM_ID: null,
      STATUS: "upcoming",
    };

    // Test 1: Try to create session without auth (should fail)
    console.log("\n1. Testing POST /conferences/32/sessions (no auth)");
    const response1 = await fetch(`${API_BASE_URL}/conferences/32/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    });
    console.log("Status:", response1.status);
    const data1 = await response1.json();
    console.log("Response:", JSON.stringify(data1, null, 2));

    // Test 2: Try to create session with conference 12 (which exists)
    console.log("\n2. Testing POST /conferences/12/sessions (no auth)");
    const response2 = await fetch(`${API_BASE_URL}/conferences/12/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionData),
    });
    console.log("Status:", response2.status);
    const data2 = await response2.json();
    console.log("Response:", JSON.stringify(data2, null, 2));
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testCreateSession();
