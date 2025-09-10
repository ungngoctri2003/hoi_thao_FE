// Debug script for messaging API
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testMessagingDebug() {
  try {
    console.log("🔍 Testing messaging API endpoints...");

    // Test 1: Database connection (no auth required)
    console.log("\n1. Testing database connection...");
    try {
      const dbResponse = await fetch("http://localhost:4000/test-db");
      const dbData = await dbResponse.json();
      console.log("✅ Database connection:", dbData.status);
    } catch (error) {
      console.log("❌ Database connection failed:", error.message);
    }

    // Test 2: Users with messages (with fake token to see error)
    console.log("\n2. Testing users with messages endpoint...");
    try {
      const messagesResponse = await fetch(
        `${API_BASE_URL}/users/with-messages`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token-for-testing",
          },
        }
      );

      console.log("Response status:", messagesResponse.status);
      console.log(
        "Response headers:",
        Object.fromEntries(messagesResponse.headers.entries())
      );

      const responseText = await messagesResponse.text();
      console.log("Response body:", responseText);

      if (messagesResponse.ok) {
        const messagesData = JSON.parse(responseText);
        console.log("✅ Users with messages:", messagesData);
      } else {
        console.log(
          "❌ Users with messages failed - this is expected with fake token"
        );
      }
    } catch (error) {
      console.log("❌ Network error:", error.message);
    }

    // Test 3: Available users (with fake token)
    console.log("\n3. Testing available users endpoint...");
    try {
      const availableResponse = await fetch(`${API_BASE_URL}/users/available`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer fake-token-for-testing",
        },
      });

      console.log("Response status:", availableResponse.status);
      const responseText = await availableResponse.text();
      console.log("Response body:", responseText);

      if (availableResponse.ok) {
        const availableData = JSON.parse(responseText);
        console.log("✅ Available users:", availableData);
      } else {
        console.log(
          "❌ Available users failed - this is expected with fake token"
        );
      }
    } catch (error) {
      console.log("❌ Network error:", error.message);
    }

    // Test 4: Check if we can get a real token by testing login
    console.log("\n4. Testing login to get real token...");
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "admin123",
        }),
      });

      console.log("Login response status:", loginResponse.status);
      const loginText = await loginResponse.text();
      console.log("Login response body:", loginText);

      if (loginResponse.ok) {
        const loginData = JSON.parse(loginText);
        console.log("✅ Login successful, token received");

        // Now test with real token
        console.log("\n5. Testing with real token...");
        const realToken = loginData.data?.accessToken;
        if (realToken) {
          const realMessagesResponse = await fetch(
            `${API_BASE_URL}/users/with-messages`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${realToken}`,
              },
            }
          );

          console.log(
            "Real token response status:",
            realMessagesResponse.status
          );
          const realResponseText = await realMessagesResponse.text();
          console.log("Real token response body:", realResponseText);
        }
      } else {
        console.log("❌ Login failed - trying with different credentials");
      }
    } catch (error) {
      console.log("❌ Login error:", error.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testMessagingDebug();
