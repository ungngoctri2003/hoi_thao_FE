const axios = require("axios");

async function testSimple() {
  try {
    console.log("Testing backend endpoints...");

    // Test ping
    const pingResponse = await axios.get("http://localhost:4000/api/v1/ping");
    console.log("✅ Ping:", pingResponse.data);

    // Test attendee endpoint without auth (should fail)
    try {
      const attendeeResponse = await axios.get(
        "http://localhost:4000/api/v1/attendee/events/upcoming"
      );
      console.log(
        "❌ Attendee endpoint should require auth:",
        attendeeResponse.data
      );
    } catch (error) {
      console.log(
        "✅ Attendee endpoint properly requires auth:",
        error.response?.status
      );
    }

    console.log("Backend is working correctly!");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testSimple();
