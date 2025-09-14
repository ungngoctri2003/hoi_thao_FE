// Using built-in fetch (Node.js 18+)

async function testSessionOriginal() {
  try {
    console.log("Testing session update with original data...");

    const updateData = {
      TITLE: "API Test Session",
      DESCRIPTION: "Test Description",
      START_TIME: "2025-09-14T15:24:00.000Z", // ISO format với timezone
      END_TIME: "2025-09-14T16:24:00.000Z", // ISO format với timezone
      SPEAKER: "Ứng Ngọc Trí",
    };

    console.log("Update data:", updateData);

    const response = await fetch(
      `http://localhost:4000/api/v1/test/test-session-update/9`,
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
        "✅ Session update with original data successful! The Oracle date format error has been completely fixed!"
      );
    } else {
      console.log("❌ Session update with original data failed!");
      if (result.error && result.error.includes("ORA-01843")) {
        console.log("🔍 Still getting Oracle date format error");
      }
    }
  } catch (error) {
    console.error("Error testing session update with original data:", error);
  }
}

testSessionOriginal();
