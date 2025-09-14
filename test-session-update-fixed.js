// Using built-in fetch (Node.js 18+)

async function testSessionUpdateFixed() {
  try {
    const sessionId = 9; // ID của session cần update
    const updateData = {
      TITLE: "API Test Session Updated Fixed",
      DESCRIPTION: "Test Description Updated Fixed",
      START_TIME: "2025-09-14T15:24:00.000Z", // ISO format với timezone
      END_TIME: "2025-09-14T16:24:00.000Z", // ISO format với timezone
      SPEAKER: "Ứng Ngọc Trí Updated Fixed",
    };

    console.log("Testing session update with fixed code...");
    console.log("Update data:", updateData);

    const response = await fetch(
      `http://localhost:4000/api/v1/test/test-session-update/${sessionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      }
    );

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log(
        "✅ Session update successful! The Oracle date format error has been fixed!"
      );
    } else {
      console.log("❌ Session update failed!");
      if (result.error && result.error.includes("ORA-01843")) {
        console.log(
          "🔍 Still getting Oracle date format error - need more investigation"
        );
      }
    }
  } catch (error) {
    console.error("Error testing session update:", error);
  }
}

testSessionUpdateFixed();
