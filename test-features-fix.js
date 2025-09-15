// Test script to verify FEATURES fix
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testFeaturesFix() {
  try {
    console.log("Testing FEATURES fix...");

    // Test 1: Get rooms and check FEATURES
    const response = await fetch(`${API_BASE_URL}/venue/rooms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch rooms:",
        response.status,
        response.statusText
      );
      return;
    }

    const data = await response.json();
    console.log("Rooms data:", JSON.stringify(data, null, 2));

    // Check FEATURES for each room
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((room, index) => {
        console.log(`\nRoom ${index + 1}: ${room.NAME}`);
        console.log("FEATURES:", room.FEATURES);
        console.log("FEATURES type:", typeof room.FEATURES);
        console.log("FEATURES isArray:", Array.isArray(room.FEATURES));

        if (Array.isArray(room.FEATURES)) {
          console.log("FEATURES length:", room.FEATURES.length);
          room.FEATURES.forEach((feature, featureIndex) => {
            console.log(
              `  Feature ${
                featureIndex + 1
              }: "${feature}" (type: ${typeof feature})`
            );
          });
        }
      });
    }

    // Test 2: Create a room with valid features
    console.log("\n\nTesting room creation with features...");
    const createResponse = await fetch(`${API_BASE_URL}/venue/floors/1/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token
      },
      body: JSON.stringify({
        name: "Test Room Features",
        capacity: 50,
        description: "Test room for features validation",
        roomType: "meeting",
        features: ["Máy chiếu", "Hệ thống âm thanh", "WiFi", "Bảng trắng"],
      }),
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log("Room created successfully:", createData);
    } else {
      console.error(
        "Failed to create room:",
        createResponse.status,
        createResponse.statusText
      );
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

// Run the test
testFeaturesFix();
