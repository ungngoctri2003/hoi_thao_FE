// Using built-in fetch (Node.js 18+)

async function testSessionFinal() {
  try {
    console.log("Testing session update with final test...");

    // Test với dữ liệu đơn giản trước
    const updateData = {
      TITLE: "Final Test Session",
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

      // Nếu simple update thành công, test với dates
      console.log("\nTesting with dates...");
      const dateResponse = await fetch(
        `http://localhost:4000/api/v1/test/test-session-update-dates/9`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const dateResult = await dateResponse.json();
      console.log("Date update status:", dateResponse.status);
      console.log("Date update result:", JSON.stringify(dateResult, null, 2));

      if (dateResponse.ok) {
        console.log(
          "✅ Session update with dates successful! The Oracle date format error has been completely fixed!"
        );
      } else {
        console.log("❌ Session update with dates failed!");
      }
    } else {
      console.log("❌ Simple session update failed!");
    }
  } catch (error) {
    console.error("Error testing session update:", error);
  }
}

testSessionFinal();
