const fetch = require("node-fetch");

async function testFrontendStatus() {
  try {
    console.log("Testing frontend API calls...");

    // Test getting rooms
    console.log("1. Testing GET /api/v1/venue/rooms...");
    const roomsResponse = await fetch(
      "http://localhost:4000/api/v1/venue/rooms"
    );

    if (roomsResponse.ok) {
      const roomsData = await roomsResponse.json();
      console.log("✅ Rooms API response:");
      console.log("Total rooms:", roomsData.data?.length || 0);

      if (roomsData.data && roomsData.data.length > 0) {
        const firstRoom = roomsData.data[0];
        console.log("First room details:");
        console.log(`  ID: ${firstRoom.ID}`);
        console.log(`  Name: ${firstRoom.NAME}`);
        console.log(`  Status: ${firstRoom.STATUS}`);
        console.log(
          `  Features: ${JSON.stringify(firstRoom.FEATURES, null, 2)}`
        );
      }
    } else {
      console.log("❌ Failed to get rooms:", await roomsResponse.text());
    }

    // Test creating a room with status
    console.log("\n2. Testing POST /api/v1/venue/floors/1/rooms...");
    const createData = {
      name: "Test Room Status",
      capacity: 30,
      description: "Test room for status",
      roomType: "meeting",
      features: ["WiFi", "Projector"],
      status: "maintenance",
    };

    const createResponse = await fetch(
      "http://localhost:4000/api/v1/venue/floors/1/rooms",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createData),
      }
    );

    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log("✅ Room created successfully:", createResult);

      const roomId = createResult.data.id;

      // Test updating the room status
      console.log("\n3. Testing PUT /api/v1/venue/rooms/" + roomId + "...");
      const updateData = {
        name: "Test Room Status",
        capacity: 30,
        description: "Test room for status",
        roomType: "meeting",
        features: ["WiFi", "Projector"],
        status: "available",
      };

      const updateResponse = await fetch(
        `http://localhost:4000/api/v1/venue/rooms/${roomId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (updateResponse.ok) {
        console.log("✅ Room updated successfully");

        // Verify the update
        const verifyResponse = await fetch(
          "http://localhost:4000/api/v1/venue/rooms"
        );
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          const updatedRoom = verifyData.data.find(
            (room) => room.ID === roomId
          );
          if (updatedRoom) {
            console.log(
              "✅ Verified update - Room status:",
              updatedRoom.STATUS
            );
          }
        }
      } else {
        console.log("❌ Failed to update room:", await updateResponse.text());
      }
    } else {
      console.log("❌ Failed to create room:", await createResponse.text());
    }
  } catch (error) {
    console.error("Error testing frontend:", error.message);
  }
}

testFrontendStatus();
