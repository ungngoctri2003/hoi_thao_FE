// Test script để kiểm tra API attendees
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testAttendeesAPI() {
  console.log("🧪 Testing Attendees API...");

  try {
    // Test 1: Kiểm tra kết nối cơ bản
    console.log("\n1. Testing basic connection...");
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log("Health check status:", healthResponse.status);

    // Test 2: Kiểm tra API attendees (không cần token)
    console.log("\n2. Testing attendees endpoint without auth...");
    try {
      const attendeesResponse = await fetch(`${API_BASE_URL}/attendees`);
      console.log("Attendees endpoint status:", attendeesResponse.status);
      if (!attendeesResponse.ok) {
        const errorText = await attendeesResponse.text();
        console.log("Error response:", errorText);
      }
    } catch (error) {
      console.log("Error fetching attendees:", error.message);
    }

    // Test 3: Kiểm tra API conferences
    console.log("\n3. Testing conferences endpoint...");
    try {
      const conferencesResponse = await fetch(`${API_BASE_URL}/conferences`);
      console.log("Conferences endpoint status:", conferencesResponse.status);
      if (conferencesResponse.ok) {
        const conferencesData = await conferencesResponse.json();
        console.log("Conferences data:", conferencesData);
      } else {
        const errorText = await conferencesResponse.text();
        console.log("Conferences error:", errorText);
      }
    } catch (error) {
      console.log("Error fetching conferences:", error.message);
    }

    // Test 4: Kiểm tra với token (nếu có)
    console.log("\n4. Testing with token...");
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log("Token found, testing authenticated requests...");
      try {
        const authResponse = await fetch(`${API_BASE_URL}/attendees`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Authenticated attendees status:", authResponse.status);
        if (authResponse.ok) {
          const attendeesData = await authResponse.json();
          console.log("Attendees data:", attendeesData);
        } else {
          const errorText = await authResponse.text();
          console.log("Authenticated error:", errorText);
        }
      } catch (error) {
        console.log("Error with authenticated request:", error.message);
      }
    } else {
      console.log("No token found in localStorage");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Chạy test
testAttendeesAPI();

