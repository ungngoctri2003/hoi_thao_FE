const https = require("https");

async function testRoomsAPI() {
  try {
    console.log("Testing rooms API...");

    const response = await new Promise((resolve, reject) => {
      const req = https.get("https://localhost:3001/api/rooms", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({
              ok: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              json: () => JSON.parse(data),
            });
          } catch (error) {
            reject(error);
          }
        });
      });
      req.on("error", reject);
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rooms = await response.json();
    console.log(`\nFound ${rooms.length} rooms from API:`);

    rooms.forEach((room) => {
      console.log(
        `ID: ${room.ID}, Name: ${room.NAME}, STATUS: ${room.STATUS}, status: ${room.status}`
      );
    });

    // Check status distribution
    const statusCounts = {};
    rooms.forEach((room) => {
      const status = room.STATUS || "null";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log("\nSTATUS distribution from API:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} rooms`);
    });
  } catch (error) {
    console.error("Error testing rooms API:", error);
  }
}

testRoomsAPI();
