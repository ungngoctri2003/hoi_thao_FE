// Test frontend API call
const API_BASE_URL = "http://localhost:4000";

async function testFrontendAPI() {
  try {
    console.log("Testing frontend API call...");

    // Simulate the frontend API call
    const url = `${API_BASE_URL}/messaging/users-by-category`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("✅ Frontend API call successful!");
    console.log("Response:", data);

    // Test mapping like frontend does
    const mapped = (Array.isArray(data.data) ? data.data : []).map((row) => ({
      id: Number(row.ID || row.id),
      name: row.NAME || row.name,
      email: row.EMAIL || row.email,
      role: row.role || "attendee",
      status: row.STATUS || row.status || "active",
      lastLogin:
        row.LAST_LOGIN || row.lastLogin
          ? new Date(row.LAST_LOGIN || row.lastLogin).toLocaleString("vi-VN")
          : "Chưa đăng nhập",
      createdAt:
        row.CREATED_AT || row.createdAt
          ? new Date(row.CREATED_AT || row.createdAt).toLocaleDateString(
              "vi-VN"
            )
          : new Date().toLocaleDateString("vi-VN"),
      avatar: row.AVATAR_URL || row.avatar_url || row.avatar,
      company: row.COMPANY || row.company,
      position: row.POSITION || row.position,
      userType: row.USER_TYPE || row.userType || "app_user",
      category: row.CATEGORY || row.category || "system",
      conferenceName: row.CONFERENCE_NAME || row.conferenceName,
    }));

    console.log("Mapped data:", mapped.length, "users");

    // Group by category
    const categories = {};
    mapped.forEach((user) => {
      const category = user.category || "unknown";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(user);
    });

    console.log("Users by category (mapped):");
    Object.keys(categories).forEach((category) => {
      console.log(`  ${category}: ${categories[category].length} users`);
    });
  } catch (error) {
    console.error("❌ Frontend API test failed:", error);
  }
}

testFrontendAPI();

