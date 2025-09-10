// Check backend status and JWT configuration
const http = require("http");

function checkBackendStatus() {
  console.log("🔍 Checking backend status...");

  const options = {
    hostname: "localhost",
    port: 4000,
    path: "/health",
    method: "GET",
    timeout: 5000,
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Backend is running on port 4000`);
    console.log(`Status: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const healthData = JSON.parse(data);
        console.log("Health check response:", healthData);
      } catch (e) {
        console.log("Health check response (raw):", data);
      }
    });
  });

  req.on("error", (err) => {
    console.log("❌ Backend is not running or not accessible");
    console.log("Error:", err.message);
    console.log(
      "Make sure to start the backend with: cd D:/DATN/HOI_THAO_BE && npm run dev"
    );
  });

  req.on("timeout", () => {
    console.log("⏰ Backend check timed out");
    req.destroy();
  });

  req.end();
}

// Check if we can connect to the WebSocket
function checkWebSocketStatus() {
  console.log("🔌 Checking WebSocket status...");

  const options = {
    hostname: "localhost",
    port: 4000,
    path: "/ws",
    method: "GET",
    timeout: 5000,
  };

  const req = http.request(options, (res) => {
    console.log(`✅ WebSocket endpoint is accessible`);
    console.log(`Status: ${res.statusCode}`);
  });

  req.on("error", (err) => {
    console.log("❌ WebSocket endpoint is not accessible");
    console.log("Error:", err.message);
  });

  req.on("timeout", () => {
    console.log("⏰ WebSocket check timed out");
    req.destroy();
  });

  req.end();
}

// Run checks
checkBackendStatus();
setTimeout(checkWebSocketStatus, 1000);

