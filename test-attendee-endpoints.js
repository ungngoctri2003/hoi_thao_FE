const axios = require("axios");

const API_BASE_URL = "http://localhost:4000/api/v1";

// Test data
const testUser = {
  email: "attendee@test.com",
  password: "password123",
};

let authToken = "";

async function testAttendeeEndpoints() {
  console.log("🧪 Testing Attendee Endpoints...\n");

  try {
    // Step 1: Login to get token
    console.log("1️⃣ Logging in...");
    const loginResponse = await axios.post(
      `${API_BASE_URL}/auth/login`,
      testUser
    );
    authToken = loginResponse.data.data.accessToken;
    console.log("✅ Login successful");
    console.log("Token:", authToken.substring(0, 20) + "...\n");

    // Step 2: Test upcoming events endpoint
    console.log("2️⃣ Testing upcoming events endpoint...");
    try {
      const eventsResponse = await axios.get(
        `${API_BASE_URL}/attendee/events/upcoming`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Upcoming events endpoint working");
      console.log("Events count:", eventsResponse.data.data?.length || 0);
      console.log(
        "Sample event:",
        eventsResponse.data.data?.[0]
          ? {
              name: eventsResponse.data.data[0].NAME,
              status: eventsResponse.data.data[0].STATUS,
              date: eventsResponse.data.data[0].START_DATE,
            }
          : "No events found"
      );
    } catch (error) {
      console.log(
        "❌ Upcoming events endpoint failed:",
        error.response?.data || error.message
      );
    }
    console.log("");

    // Step 3: Test notifications endpoint
    console.log("3️⃣ Testing notifications endpoint...");
    try {
      const notificationsResponse = await axios.get(
        `${API_BASE_URL}/attendee/notifications`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Notifications endpoint working");
      console.log(
        "Notifications count:",
        notificationsResponse.data.data?.length || 0
      );
      console.log(
        "Sample notification:",
        notificationsResponse.data.data?.[0] || "No notifications"
      );
    } catch (error) {
      console.log(
        "❌ Notifications endpoint failed:",
        error.response?.data || error.message
      );
    }
    console.log("");

    // Step 4: Test certificates endpoint
    console.log("4️⃣ Testing certificates endpoint...");
    try {
      const certificatesResponse = await axios.get(
        `${API_BASE_URL}/attendee/certificates`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ Certificates endpoint working");
      console.log(
        "Certificates count:",
        certificatesResponse.data.data?.length || 0
      );
      console.log(
        "Sample certificate:",
        certificatesResponse.data.data?.[0] || "No certificates"
      );
    } catch (error) {
      console.log(
        "❌ Certificates endpoint failed:",
        error.response?.data || error.message
      );
    }
    console.log("");

    // Step 5: Test my registrations endpoint
    console.log("5️⃣ Testing my registrations endpoint...");
    try {
      const registrationsResponse = await axios.get(
        `${API_BASE_URL}/attendee/registrations`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("✅ My registrations endpoint working");
      console.log(
        "Registrations count:",
        registrationsResponse.data.data?.length || 0
      );
      console.log(
        "Sample registration:",
        registrationsResponse.data.data?.[0] || "No registrations"
      );
    } catch (error) {
      console.log(
        "❌ My registrations endpoint failed:",
        error.response?.data || error.message
      );
    }
    console.log("");

    // Step 6: Test old conferences endpoint (should fail for attendee)
    console.log("6️⃣ Testing old conferences endpoint (should fail)...");
    try {
      const oldConferencesResponse = await axios.get(
        `${API_BASE_URL}/conferences`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log("⚠️ Old conferences endpoint still working (unexpected)");
    } catch (error) {
      console.log(
        "✅ Old conferences endpoint properly blocked:",
        error.response?.data?.error?.code || "Unknown error"
      );
    }
    console.log("");

    console.log("🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testAttendeeEndpoints();
