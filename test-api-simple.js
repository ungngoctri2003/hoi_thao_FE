// Simple test for the API
const API_BASE_URL = "http://localhost:4000";

async function testAPI() {
  try {
    console.log("Testing API...");

    const response = await fetch(`${API_BASE_URL}/messaging/users-by-category`);
    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (data.success && data.data) {
      console.log("✅ API working!");
      console.log("Total users:", data.data.length);

      // Group by category
      const categories = {};
      data.data.forEach((user) => {
        const category = user.CATEGORY || "unknown";
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
      console.log("❌ API failed:", data);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testAPI();

