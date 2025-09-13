// Test script for conference analytics API
const fetch = require("node-fetch");

async function testConferenceAnalytics() {
  try {
    console.log("🧪 Testing Conference Analytics API...");

    // Test with a sample conference ID
    const conferenceId = 1; // Replace with actual conference ID
    const apiUrl = "http://localhost:4000/api/v1/analytics/conference-ai";

    const response = await fetch(
      `${apiUrl}?conferenceId=${conferenceId}&timeRange=all`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add your auth token here if needed
          // 'Authorization': 'Bearer YOUR_TOKEN_HERE'
        },
      }
    );

    console.log("📊 Response Status:", response.status);
    console.log(
      "📊 Response Headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Success! Data received:");
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log("❌ Error Response:");
      console.log(errorText);
    }
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

// Run the test
testConferenceAnalytics();
