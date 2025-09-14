// Test API call directly
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testAPICall() {
  try {
    console.log("Testing API call...");

    // First, try to login to get a token
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

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log("Login failed:", errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log(
      "Login successful, token:",
      loginData.data ? "EXISTS" : "NOT FOUND"
    );

    if (!loginData.data || !loginData.data.accessToken) {
      console.log("No token in login response");
      return;
    }

    const token = loginData.data.accessToken;
    console.log("Token:", token.substring(0, 20) + "...");

    // Now try to create a session
    const sessionData = {
      TITLE: "Test Session",
      DESCRIPTION: "Test Description",
      START_TIME: "2024-12-20T10:00:00.000Z",
      END_TIME: "2024-12-20T11:00:00.000Z",
      SPEAKER: "Test Speaker",
      ROOM_ID: null,
      STATUS: "upcoming",
    };

    console.log("Creating session with data:", sessionData);

    const sessionResponse = await fetch(
      `${API_BASE_URL}/conferences/1/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData),
      }
    );

    console.log("Session creation response status:", sessionResponse.status);
    console.log(
      "Session creation response headers:",
      Object.fromEntries(sessionResponse.headers.entries())
    );

    const sessionResponseText = await sessionResponse.text();
    console.log("Session creation response body:", sessionResponseText);

    if (sessionResponse.ok) {
      const sessionData = JSON.parse(sessionResponseText);
      console.log("SUCCESS! Session created:", sessionData);
    } else {
      console.log("ERROR creating session:", sessionResponseText);
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testAPICall();
