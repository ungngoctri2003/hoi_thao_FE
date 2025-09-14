// Using built-in fetch (Node.js 18+)

async function testSessionSimpleFinal() {
  try {
    console.log("Testing simple session update...");

    // Test với dữ liệu đơn giản trước
    const updateData = {
      TITLE: "Simple Test Session Final",
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
      console.log("✅ Simple session update successful!");
    } else {
      console.log("❌ Simple session update failed!");
    }
  } catch (error) {
    console.error("Error testing simple session update:", error);
  }
}

testSessionSimpleFinal();
