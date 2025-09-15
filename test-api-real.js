// Test real API calls
const https = require("https");
const http = require("http");

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    const req = client.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testRealAPI() {
  try {
    console.log("Testing real API calls...");

    // Test 1: Get rooms
    console.log("\n1. Testing GET /api/v1/venue/rooms...");
    const roomsResponse = await makeRequest(
      "http://localhost:4000/api/v1/venue/rooms"
    );

    console.log("Status:", roomsResponse.status);
    if (roomsResponse.status === 200) {
      console.log("✅ Rooms API working");
      console.log("Total rooms:", roomsResponse.data.data?.length || 0);

      if (roomsResponse.data.data && roomsResponse.data.data.length > 0) {
        const firstRoom = roomsResponse.data.data[0];
        console.log("First room:");
        console.log(`  ID: ${firstRoom.ID}`);
        console.log(`  Name: ${firstRoom.NAME}`);
        console.log(`  Status: ${firstRoom.STATUS}`);
        console.log(
          `  Features: ${JSON.stringify(firstRoom.FEATURES, null, 2)}`
        );
      }
    } else {
      console.log("❌ Rooms API failed:", roomsResponse.data);
    }

    // Test 2: Create room
    console.log("\n2. Testing POST /api/v1/venue/floors/1/rooms...");
    const createData = {
      name: "API Test Room",
      capacity: 40,
      description: "Room created via API test",
      roomType: "meeting",
      features: ["WiFi", "Projector"],
      status: "maintenance",
    };

    const createResponse = await makeRequest(
      "http://localhost:4000/api/v1/venue/floors/1/rooms",
      {
        method: "POST",
        body: createData,
      }
    );

    console.log("Create status:", createResponse.status);
    if (createResponse.status === 201) {
      console.log("✅ Room created successfully");
      console.log("Created room ID:", createResponse.data.data?.id);

      const roomId = createResponse.data.data?.id;

      if (roomId) {
        // Test 3: Update room
        console.log("\n3. Testing PUT /api/v1/venue/rooms/" + roomId + "...");
        const updateData = {
          name: "API Test Room Updated",
          capacity: 40,
          description: "Room updated via API test",
          roomType: "meeting",
          features: ["WiFi", "Projector", "Whiteboard"],
          status: "available",
        };

        const updateResponse = await makeRequest(
          `http://localhost:4000/api/v1/venue/rooms/${roomId}`,
          {
            method: "PUT",
            body: updateData,
          }
        );

        console.log("Update status:", updateResponse.status);
        if (updateResponse.status === 200) {
          console.log("✅ Room updated successfully");
        } else {
          console.log("❌ Room update failed:", updateResponse.data);
        }
      }
    } else {
      console.log("❌ Room creation failed:", createResponse.data);
    }
  } catch (error) {
    console.error("Error testing API:", error.message);
  }
}

testRealAPI();
