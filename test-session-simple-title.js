// Using built-in fetch (Node.js 18+)

async function testSessionSimpleTitle() {
  try {
    console.log("Testing session update with simple title...");

    const updateData = {
      TITLE: "API Test Session Simple",
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
      console.log("✅ Session update with simple title successful!");
    } else {
      console.log("❌ Session update with simple title failed!");
    }
  } catch (error) {
    console.error("Error testing session update with simple title:", error);
  }
}

testSessionSimpleTitle();
