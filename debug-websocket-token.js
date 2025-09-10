// Debug script to check WebSocket token issues
// Run this in the browser console on the messaging page

console.log("=== WebSocket Token Debug ===");

// Check localStorage token
const localToken = localStorage.getItem("accessToken");
console.log(
  "LocalStorage token:",
  localToken ? `${localToken.substring(0, 20)}...` : "none"
);
console.log("LocalStorage token length:", localToken?.length || 0);

// Check cookie token
const cookies = document.cookie.split(";");
const tokenCookie = cookies.find((cookie) =>
  cookie.trim().startsWith("accessToken=")
);
const cookieToken = tokenCookie ? tokenCookie.split("=")[1] : null;
console.log(
  "Cookie token:",
  cookieToken ? `${cookieToken.substring(0, 20)}...` : "none"
);
console.log("Cookie token length:", cookieToken?.length || 0);

// Check if tokens match
console.log("Tokens match:", localToken === cookieToken);

// Check token format
if (localToken) {
  try {
    const parts = localToken.split(".");
    console.log("Token parts count:", parts.length);
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log("Token payload:", payload);
      console.log("Token expires at:", new Date(payload.exp * 1000));
      console.log("Token is expired:", Date.now() / 1000 >= payload.exp);
    } else {
      console.error("Invalid JWT format - should have 3 parts");
    }
  } catch (error) {
    console.error("Error parsing token:", error);
  }
}

// Check refresh token
const refreshToken = localStorage.getItem("refreshToken");
console.log(
  "Refresh token:",
  refreshToken ? `${refreshToken.substring(0, 20)}...` : "none"
);

// Test WebSocket connection
console.log("Testing WebSocket connection...");
import("@/lib/websocket").then(({ websocketService }) => {
  console.log(
    "WebSocket service status:",
    websocketService.getConnectionStatus()
  );

  // Try to reconnect
  websocketService
    .reconnect()
    .then(() => {
      console.log("Reconnection attempt completed");
    })
    .catch((error) => {
      console.error("Reconnection failed:", error);
    });
});
