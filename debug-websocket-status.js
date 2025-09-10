// Debug script to check WebSocket status and prevent infinite loops
// Run this in the browser console on the messaging page

console.log("=== WebSocket Status Debug ===");

// Check WebSocket service status
import("@/lib/websocket").then(({ websocketService }) => {
  const status = websocketService.getConnectionStatus();
  console.log("WebSocket Status:", status);

  // Check if WebSocket is paused
  console.log("WebSocket is paused:", websocketService.isPaused);
  console.log("WebSocket is connecting:", websocketService.isConnecting);
  console.log(
    "WebSocket has attempted token refresh:",
    websocketService.hasAttemptedTokenRefresh
  );
  console.log(
    "WebSocket reconnect attempts:",
    websocketService.reconnectAttempts
  );

  // If WebSocket is paused, reset it
  if (websocketService.isPaused) {
    console.log("WebSocket is paused, resetting...");
    websocketService.reset();
    console.log("WebSocket reset completed");
  }

  // Try to connect
  console.log("Attempting to connect WebSocket...");
  websocketService
    .connect()
    .then(() => {
      console.log("WebSocket connection attempt completed");
    })
    .catch((error) => {
      console.error("WebSocket connection failed:", error);
    });
});

// Check token status
const localToken = localStorage.getItem("accessToken");
console.log(
  "LocalStorage token:",
  localToken ? `${localToken.substring(0, 20)}...` : "none"
);
console.log("LocalStorage token length:", localToken?.length || 0);

if (localToken) {
  try {
    const parts = localToken.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log("Token payload:", payload);
      console.log("Token expires at:", new Date(payload.exp * 1000));
      console.log("Token is expired:", Date.now() / 1000 >= payload.exp);
    }
  } catch (error) {
    console.error("Error parsing token:", error);
  }
}
