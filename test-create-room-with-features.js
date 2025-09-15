// Test script to create a room with valid features
const API_BASE_URL = "http://localhost:4000/api/v1";

async function testCreateRoomWithFeatures() {
  try {
    console.log("🧪 Testing room creation with valid features...\n");

    // First, get floors to find a valid floor ID
    console.log("📋 Getting floors...");
    const floorsResponse = await fetch(`${API_BASE_URL}/venue/floors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token
      },
    });

    if (!floorsResponse.ok) {
      console.error(
        "❌ Failed to fetch floors:",
        floorsResponse.status,
        floorsResponse.statusText
      );
      return;
    }

    const floorsData = await floorsResponse.json();
    console.log("✅ Floors data:", floorsData);

    if (!floorsData.data || floorsData.data.length === 0) {
      console.error("❌ No floors found");
      return;
    }

    const floorId = floorsData.data[0].ID;
    console.log(`📋 Using floor ID: ${floorId}\n`);

    // Create a room with valid features
    const roomData = {
      name: "Test Room Features Debug",
      capacity: 50,
      description: "Test room for debugging features display",
      roomType: "meeting",
      features: [
        "Máy chiếu",
        "Hệ thống âm thanh",
        "WiFi",
        "Bảng trắng",
        "Máy lạnh",
      ],
    };

    console.log("🏗️  Creating room with data:", roomData);

    const createResponse = await fetch(
      `${API_BASE_URL}/venue/floors/${floorId}/rooms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token
        },
        body: JSON.stringify(roomData),
      }
    );

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      console.error(
        "❌ Failed to create room:",
        createResponse.status,
        createResponse.statusText
      );
      console.error("Error details:", errorData);
      return;
    }

    const createData = await createResponse.json();
    console.log("✅ Room created successfully:", createData);

    // Now fetch the room to see how FEATURES are stored
    console.log("\n🔍 Fetching created room to check FEATURES...");
    const roomId = createData.data.id;

    const getRoomResponse = await fetch(
      `${API_BASE_URL}/venue/rooms/${roomId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_TOKEN_HERE", // Replace with actual token
        },
      }
    );

    if (!getRoomResponse.ok) {
      console.error(
        "❌ Failed to fetch created room:",
        getRoomResponse.status,
        getRoomResponse.statusText
      );
      return;
    }

    const roomData = await getRoomResponse.json();
    console.log("📋 Created room data:", roomData);
    console.log("🔍 FEATURES in response:", roomData.data.FEATURES);
    console.log("🔍 FEATURES type:", typeof roomData.data.FEATURES);
    console.log("🔍 FEATURES isArray:", Array.isArray(roomData.data.FEATURES));

    // Test cleanFeatures function
    const cleanFeatures = (features) => {
      if (!Array.isArray(features)) return [];

      return features
        .map((feature) => {
          if (typeof feature === "string") {
            const cleaned = feature.trim();
            if (
              !cleaned ||
              cleaned === "null" ||
              cleaned === "undefined" ||
              cleaned === "[object Object]" ||
              cleaned === "DB_TYPE_CLOB" ||
              cleaned === "Có sẵn" ||
              cleaned === "Không có" ||
              cleaned.startsWith("Tính năng ")
            ) {
              return null;
            }
            return cleaned;
          }
          return null;
        })
        .filter((feature) => feature !== null && feature !== undefined);
    };

    const validFeatures = cleanFeatures(roomData.data.FEATURES || []);
    console.log("✅ Valid features after cleaning:", validFeatures);
    console.log("📊 Valid features count:", validFeatures.length);
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testCreateRoomWithFeatures();
