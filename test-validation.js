// Using built-in fetch (Node.js 18+)

async function testValidation() {
  try {
    console.log("Testing validation endpoint...");

    // Test với dữ liệu từ request gốc
    const updateData = {
      TITLE: "API Test Session",
      DESCRIPTION: "Test Description",
      START_TIME: "2025-09-14T15:24", // Format từ request gốc
      END_TIME: "2025-09-14T16:24", // Format từ request gốc
      SPEAKER: "Ứng Ngọc Trí",
    };

    console.log("Update data:", updateData);

    const response = await fetch(
      `http://localhost:4000/api/v1/test/test-session-validation`,
      {
        method: "POST",
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
      console.log("✅ Validation successful! Schema accepts the format!");
    } else {
      console.log("❌ Validation failed!");
    }
  } catch (error) {
    console.error("Error testing validation:", error);
  }
}

testValidation();
