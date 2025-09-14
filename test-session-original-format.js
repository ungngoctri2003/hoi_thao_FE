// Using built-in fetch (Node.js 18+)

async function testSessionOriginalFormat() {
  try {
    console.log("Testing session update with original format...");

    // Sử dụng format từ request gốc của bạn
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
      console.log(
        "✅ Session update with original format successful! The validation error has been fixed!"
      );
    } else {
      console.log("❌ Session update with original format failed!");
      if (result.error && result.error.includes("VALIDATION_ERROR")) {
        console.log("🔍 Still getting validation error");
      }
    }
  } catch (error) {
    console.error("Error testing session update with original format:", error);
  }
}

testSessionOriginalFormat();
