// Using built-in fetch (Node.js 18+)

async function testPublicSessions() {
  try {
    console.log("Testing public sessions endpoint...");

    const response = await fetch("http://localhost:4000/api/v1/sessions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("✅ Public sessions endpoint working!");
    } else {
      console.log("❌ Public sessions endpoint failed!");
    }
  } catch (error) {
    console.error("Error testing public sessions:", error);
  }
}

testPublicSessions();
