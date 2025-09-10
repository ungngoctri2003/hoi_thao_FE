// Test script for messaging API with real token
const API_BASE_URL = "http://localhost:4000/api/v1";

// This script should be run in browser console to get the token from localStorage
// Then copy the token here
const TOKEN = "YOUR_TOKEN_HERE"; // Replace with actual token from browser

async function testMessagingAPIWithToken() {
  if (TOKEN === "YOUR_TOKEN_HERE") {
    console.log(
      "Please get a token from browser localStorage and replace TOKEN variable"
    );
    console.log("To get token:");
    console.log("1. Open browser and go to http://localhost:3000");
    console.log("2. Login to the app");
    console.log("3. Open browser console (F12)");
    console.log('4. Run: localStorage.getItem("accessToken")');
    console.log("5. Copy the token and replace TOKEN variable in this script");
    return;
  }

  try {
    console.log("Testing messaging API endpoints with token...");

    // Test users with messages endpoint
    console.log("\n1. Testing users with messages endpoint...");
    const messagesResponse = await fetch(
      `${API_BASE_URL}/users/with-messages`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      console.log("✅ Users with messages:", messagesData);
    } else {
      const errorText = await messagesResponse.text();
      console.log(
        "❌ Users with messages failed:",
        messagesResponse.status,
        messagesResponse.statusText
      );
      console.log("Error details:", errorText);
    }

    // Test available users endpoint
    console.log("\n2. Testing available users endpoint...");
    const availableResponse = await fetch(`${API_BASE_URL}/users/available`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    if (availableResponse.ok) {
      const availableData = await availableResponse.json();
      console.log("✅ Available users:", availableData);
    } else {
      const errorText = await availableResponse.text();
      console.log(
        "❌ Available users failed:",
        availableResponse.status,
        availableResponse.statusText
      );
      console.log("Error details:", errorText);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testMessagingAPIWithToken();
