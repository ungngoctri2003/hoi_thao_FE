// Test script for users by conference category API
const API_BASE_URL = "http://localhost:4000";

async function testUsersByCategory() {
  try {
    console.log("Testing users by conference category API...");

    // Test without conference ID (all categories)
    console.log("\n1. Testing all categories:");
    const allCategoriesResponse = await fetch(
      `${API_BASE_URL}/messaging/users-by-category`
    );
    const allCategoriesData = await allCategoriesResponse.json();

    if (allCategoriesResponse.ok) {
      console.log("✅ All categories API working");
      console.log("Total users:", allCategoriesData.data?.length || 0);

      // Group by category
      const categories = {};
      allCategoriesData.data?.forEach((user) => {
        const category = user.category || "unknown";
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(user);
      });

      console.log("Users by category:");
      Object.keys(categories).forEach((category) => {
        console.log(`  ${category}: ${categories[category].length} users`);
      });
    } else {
      console.log("❌ All categories API failed:", allCategoriesData);
    }

    // Test with conference ID 1
    console.log("\n2. Testing with conference ID 1:");
    const conferenceResponse = await fetch(
      `${API_BASE_URL}/messaging/users-by-category?conferenceId=1`
    );
    const conferenceData = await conferenceResponse.json();

    if (conferenceResponse.ok) {
      console.log("✅ Conference-specific API working");
      console.log("Users in conference 1:", conferenceData.data?.length || 0);
    } else {
      console.log("❌ Conference-specific API failed:", conferenceData);
    }

    // Test with conference ID 2
    console.log("\n3. Testing with conference ID 2:");
    const conference2Response = await fetch(
      `${API_BASE_URL}/messaging/users-by-category?conferenceId=2`
    );
    const conference2Data = await conference2Response.json();

    if (conference2Response.ok) {
      console.log("✅ Conference 2 API working");
      console.log("Users in conference 2:", conference2Data.data?.length || 0);
    } else {
      console.log("❌ Conference 2 API failed:", conference2Data);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testUsersByCategory();

