// Test script for Dashboard API integration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// Test authentication first
async function testAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "admin123",
      }),
    });

    if (!response.ok) {
      throw new Error(`Auth failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Authentication successful");
    return data.accessToken;
  } catch (error) {
    console.error("❌ Authentication failed:", error.message);
    return null;
  }
}

// Test dashboard overview API
async function testDashboardOverview(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard overview failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Dashboard overview API working");
    console.log("Data:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("❌ Dashboard overview failed:", error.message);
    return null;
  }
}

// Test conferences API
async function testConferencesAPI(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/conferences`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Conferences API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Conferences API working");
    console.log("Conferences count:", data.data?.length || 0);
    return data;
  } catch (error) {
    console.error("❌ Conferences API failed:", error.message);
    return null;
  }
}

// Test attendees API
async function testAttendeesAPI(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/attendees`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Attendees API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Attendees API working");
    console.log("Attendees count:", data.data?.length || 0);
    return data;
  } catch (error) {
    console.error("❌ Attendees API failed:", error.message);
    return null;
  }
}

// Test registrations API
async function testRegistrationsAPI(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Registrations API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Registrations API working");
    console.log("Registrations count:", data.data?.length || 0);
    return data;
  } catch (error) {
    console.error("❌ Registrations API failed:", error.message);
    return null;
  }
}

// Main test function
async function runDashboardTests() {
  console.log("🚀 Starting Dashboard API Tests...\n");

  // Test authentication
  const token = await testAuth();
  if (!token) {
    console.log("❌ Cannot proceed without authentication");
    return;
  }

  console.log("\n📊 Testing Dashboard APIs...\n");

  // Test all dashboard APIs
  const results = await Promise.allSettled([
    testDashboardOverview(token),
    testConferencesAPI(token),
    testAttendeesAPI(token),
    testRegistrationsAPI(token),
  ]);

  // Summary
  console.log("\n📋 Test Summary:");
  console.log("================");

  const testNames = [
    "Dashboard Overview",
    "Conferences API",
    "Attendees API",
    "Registrations API",
  ];

  results.forEach((result, index) => {
    const status = result.status === "fulfilled" && result.value ? "✅" : "❌";
    console.log(`${status} ${testNames[index]}`);
  });

  const successCount = results.filter(
    (r) => r.status === "fulfilled" && r.value
  ).length;
  console.log(`\n🎯 Success: ${successCount}/${results.length} tests passed`);

  if (successCount === results.length) {
    console.log("🎉 All dashboard APIs are working correctly!");
  } else {
    console.log("⚠️  Some APIs need attention. Check the errors above.");
  }
}

// Run the tests
runDashboardTests().catch(console.error);
