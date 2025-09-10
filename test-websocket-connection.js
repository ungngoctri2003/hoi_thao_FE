// Test WebSocket connection with token
const { io } = require("socket.io-client");

// Test with a sample token (you'll need to replace this with a real token)
const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzYzNzQwMDAsImV4cCI6MTczNjM3NDkwMH0.test";

console.log("Testing WebSocket connection...");
console.log("Token:", testToken.substring(0, 20) + "...");

const socket = io("http://localhost:4000", {
  path: "/ws",
  auth: {
    token: testToken,
  },
  extraHeaders: {
    Authorization: `Bearer ${testToken}`,
  },
  transports: ["websocket", "polling"],
  timeout: 10000,
});

socket.on("connect", () => {
  console.log("✅ WebSocket connected successfully!");
  console.log("Socket ID:", socket.id);
  socket.disconnect();
});

socket.on("connect_error", (error) => {
  console.error("❌ WebSocket connection error:", error.message);
  console.error("Error details:", error);
});

socket.on("disconnect", (reason) => {
  console.log("WebSocket disconnected:", reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log("Test timeout reached");
  socket.disconnect();
  process.exit(0);
}, 10000);
