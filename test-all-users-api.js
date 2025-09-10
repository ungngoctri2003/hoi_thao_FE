// Test script for all users API
const API_BASE_URL = "http://localhost:4000";

async function testAllUsersAPI() {
  try {
    console.log("Testing All Users API...");

    // Test getUsersByConferenceCategory API
    console.log("\n1. Testing getUsersByConferenceCategory (all users):");
    const response1 = await fetch(
      `${API_BASE_URL}/messaging/users-by-category`
    );
    const data1 = await response1.json();
    console.log("Status:", response1.status);
    console.log("Data count:", data1.data?.length || 0);

    if (data1.data && data1.data.length > 0) {
      console.log("\nSample users:");
      data1.data.slice(0, 5).forEach((user, index) => {
        console.log(
          `${index + 1}. ${user.NAME || user.name} (${
            user.EMAIL || user.email
          }) - Role: ${user.role} - Category: ${
            user.CATEGORY || user.category
          } - Conference: ${
            user.CONFERENCE_NAME || user.conferenceName || "N/A"
          }`
        );
      });

      // Count by category
      const conferenceUsers = data1.data.filter(
        (user) => (user.CATEGORY || user.category) === "conference"
      );
      const systemUsers = data1.data.filter(
        (user) => (user.CATEGORY || user.category) === "system"
      );
      const nonConferenceUsers = data1.data.filter(
        (user) => (user.CATEGORY || user.category) === "non_conference"
      );

      console.log(`\nCategory breakdown:`);
      console.log(`- Conference users: ${conferenceUsers.length}`);
      console.log(`- System users: ${systemUsers.length}`);
      console.log(`- Non-conference users: ${nonConferenceUsers.length}`);
    }

    console.log("\n✅ API test completed successfully!");
  } catch (error) {
    console.error("❌ API test failed:", error);
  }
}

// Run the test
testAllUsersAPI();
