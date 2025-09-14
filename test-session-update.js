// Using built-in fetch (Node.js 18+)

async function testSessionUpdate() {
  try {
    const sessionId = 9; // ID của session cần update
    const updateData = {
      TITLE: "API Test Session Updated",
      DESCRIPTION: "Test Description Updated",
      START_TIME: "2025-09-14T15:24:00.000Z", // ISO format với timezone
      END_TIME: "2025-09-14T16:24:00.000Z", // ISO format với timezone
      SPEAKER: "Ứng Ngọc Trí Updated",
    };

    console.log("Testing session update with data:", updateData);

    const response = await fetch(
      `http://localhost:4000/api/v1/sessions/${sessionId}`,
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
      console.log("✅ Session update successful!");
    } else {
      console.log("❌ Session update failed!");
    }
  } catch (error) {
    console.error("Error testing session update:", error);
  }
}

testSessionUpdate();
