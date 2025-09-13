// Debug script for WebSocket connection issues in AI Analytics page
// Run this in the browser console on the AI analytics page

console.log("=== AI Analytics WebSocket Debug ===");

// Check if WebSocket service is available
if (typeof window !== "undefined") {
  // Import WebSocket service dynamically
  import("/lib/websocket.js")
    .then(({ websocketService }) => {
      console.log("WebSocket service loaded successfully");

      // Get current status
      const status = websocketService.getConnectionStatus();
      console.log("Current WebSocket status:", status);

      // Check token sources
      console.log("=== Token Sources Check ===");

      // Check localStorage
      const localToken = localStorage.getItem("accessToken");
      console.log(
        "LocalStorage accessToken:",
        localToken ? `${localToken.substring(0, 20)}...` : "none"
      );

      // Check cookies
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );
      const cookieToken = tokenCookie ? tokenCookie.split("=")[1] : null;
      console.log(
        "Cookie accessToken:",
        cookieToken ? `${cookieToken.substring(0, 20)}...` : "none"
      );

      // Check if tokens match
      console.log("Tokens match:", localToken === cookieToken);

      // Validate token format
      if (localToken) {
        try {
          const parts = localToken.split(".");
          console.log("Token parts count:", parts.length);
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log("Token payload:", {
              userId: payload.userId,
              email: payload.email,
              role: payload.role,
              exp: payload.exp,
              expDate: new Date(payload.exp * 1000).toISOString(),
              currentTime: new Date().toISOString(),
              isExpired: Date.now() >= payload.exp * 1000,
              timeUntilExpiry: payload.exp - Math.floor(Date.now() / 1000),
            });
          } else {
            console.error("Invalid JWT format - should have 3 parts");
          }
        } catch (error) {
          console.error("Error parsing token:", error);
        }
      }

      // Test WebSocket connection
      console.log("=== Testing WebSocket Connection ===");

      // Try to force reconnect
      websocketService
        .forceReconnect()
        .then(() => {
          console.log("Force reconnect completed");
          const newStatus = websocketService.getConnectionStatus();
          console.log("New WebSocket status:", newStatus);
        })
        .catch((error) => {
          console.error("Force reconnect failed:", error);
        });
    })
    .catch((error) => {
      console.error("Failed to load WebSocket service:", error);
    });
} else {
  console.error("This script must be run in a browser environment");
}

// Add event listeners for WebSocket events
window.addEventListener("websocket-connected", (event) => {
  console.log("WebSocket connected event received:", event.detail);
});

window.addEventListener("websocket-disconnected", (event) => {
  console.log("WebSocket disconnected event received:", event.detail);
});

window.addEventListener("websocket-error", (event) => {
  console.log("WebSocket error event received:", event.detail);
});

console.log("Event listeners added for WebSocket events");

