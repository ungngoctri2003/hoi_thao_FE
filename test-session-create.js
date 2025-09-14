// Using built-in fetch (Node.js 18+)

async function testSessionCreate() {
  try {
    const createData = {
      TITLE: "Test Session Create",
      DESCRIPTION: "Test Description Create",
      START_TIME: "2025-09-14T15:24:00.000Z", // ISO format với timezone
      END_TIME: "2025-09-14T16:24:00.000Z", // ISO format với timezone
      SPEAKER: "Test Speaker",
      STATUS: "upcoming",
    };

    console.log("Testing session creation with data:", createData);

    // Test với conference ID 12 (đã có trong database)
    const response = await fetch(
      "http://localhost:4000/api/v1/conferences/12/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Thử với một token giả để xem lỗi gì
          Authorization: "Bearer fake-token-for-testing",
        },
        body: JSON.stringify(createData),
      }
    );

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("✅ Session creation successful!");
    } else {
      console.log("❌ Session creation failed!");
      if (
        result.error &&
        result.error.message &&
        result.error.message.includes("ORA-01843")
      ) {
        console.log(
          "🔍 This is the Oracle date format error we are trying to fix!"
        );
      }
    }
  } catch (error) {
    console.error("Error testing session creation:", error);
  }
}

testSessionCreate();
