// Test script to debug session creation API call

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

async function testSessionCreation() {
  try {
    console.log("Testing session creation API...");
    console.log("API Base URL:", API_BASE_URL);

    // Test data
    const conferenceId = 1;
    const sessionData = {
      TITLE: "Test Session",
      DESCRIPTION: "Test Description",
      START_TIME: "2024-12-20T10:00:00.000Z",
      END_TIME: "2024-12-20T11:00:00.000Z",
      SPEAKER: "Test Speaker",
      ROOM_ID: null,
      STATUS: "upcoming",
    };

    console.log("Session data:", sessionData);

    const url = `${API_BASE_URL}/conferences/${conferenceId}/sessions`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token", // You might need a real token
      },
      body: JSON.stringify(sessionData),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log("Success! Created session:", data);
    } else {
      console.log("Error response:", responseText);
    }
  } catch (error) {
    console.error("Error testing session creation:", error);
  }
}

testSessionCreation();
