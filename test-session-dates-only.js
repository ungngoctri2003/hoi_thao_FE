// Using built-in fetch (Node.js 18+)

async function testSessionDatesOnly() {
  try {
    console.log("Testing session update with dates only...");

    const response = await fetch(
      `http://localhost:4000/api/v1/test/test-session-update-dates/9`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log(
        "✅ Session update with dates successful! The Oracle date format error has been fixed!"
      );
    } else {
      console.log("❌ Session update with dates failed!");
    }
  } catch (error) {
    console.error("Error testing session update with dates:", error);
  }
}

testSessionDatesOnly();
