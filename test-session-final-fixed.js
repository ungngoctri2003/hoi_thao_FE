// Using built-in fetch (Node.js 18+)

async function testSessionFinalFixed() {
  try {
    console.log("Testing session update with final fixed version...");

    // Test với dữ liệu từ request gốc của bạn
    const updateData = {
      TITLE: "API Test Session",
      DESCRIPTION: "Test Description",
      START_TIME: "2025-09-14T15:24", // Format từ request gốc
      END_TIME: "2025-09-14T16:24", // Format từ request gốc
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
      console.log("✅ Session update successful! All errors have been fixed!");
      console.log(
        "🎉 The Oracle date format error and circular reference error are both resolved!"
      );
    } else {
      console.log("❌ Session update failed!");
      if (result.error && result.error.includes("ORA-01843")) {
        console.log("🔍 Still getting Oracle date format error");
      } else if (result.error && result.error.includes("circular structure")) {
        console.log("🔍 Still getting circular reference error");
      }
    }
  } catch (error) {
    console.error("Error testing session update:", error);
  }
}

testSessionFinalFixed();
