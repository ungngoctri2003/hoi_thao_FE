// Test script for conference users API
const API_BASE_URL = "http://localhost:4000";

async function testConferenceUsersAPI() {
  try {
    console.log("Testing Conference Users API...");

    // Test 1: Get all conference users
    console.log("\n1. Testing get all conference users:");
    const response1 = await fetch(
      `${API_BASE_URL}/messaging/conference-users-with-details`
    );
    const data1 = await response1.json();
    console.log("Status:", response1.status);
    console.log("Data count:", data1.data?.length || 0);
    if (data1.data && data1.data.length > 0) {
      console.log("Sample user:", {
        id: data1.data[0].ID,
        name: data1.data[0].NAME,
        email: data1.data[0].EMAIL,
        conferenceName: data1.data[0].CONFERENCE_NAME,
        role: data1.data[0].role,
      });
    }

    // Test 2: Get conference users for specific conference
    console.log("\n2. Testing get conference users for conference ID 1:");
    const response2 = await fetch(
      `${API_BASE_URL}/messaging/conference-users-with-details?conferenceId=1`
    );
    const data2 = await response2.json();
    console.log("Status:", response2.status);
    console.log("Data count:", data2.data?.length || 0);
    if (data2.data && data2.data.length > 0) {
      console.log("Sample user:", {
        id: data2.data[0].ID,
        name: data2.data[0].NAME,
        email: data2.data[0].EMAIL,
        conferenceName: data2.data[0].CONFERENCE_NAME,
        role: data2.data[0].role,
      });
    }

    // Test 3: Compare with old API
    console.log("\n3. Comparing with old users-by-category API:");
    const response3 = await fetch(
      `${API_BASE_URL}/messaging/users-by-category`
    );
    const data3 = await response3.json();
    console.log("Old API data count:", data3.data?.length || 0);

    const conferenceUsers =
      data3.data?.filter((user) => user.CATEGORY === "conference") || [];
    console.log("Conference users in old API:", conferenceUsers.length);

    console.log("\n✅ API test completed successfully!");
  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

// Run the test
testConferenceUsersAPI();
