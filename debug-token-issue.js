// Debug script to check and fix token issues
// Run this in the browser console on the messaging page

console.log("=== Token Issue Debug ===");

// Check current token
const localToken = localStorage.getItem("accessToken");
console.log(
  "Current token:",
  localToken ? `${localToken.substring(0, 20)}...` : "none"
);

if (localToken) {
  try {
    const parts = localToken.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - now;

      console.log("Token analysis:", {
        expiresAt: new Date(payload.exp * 1000),
        timeUntilExpiry: timeUntilExpiry,
        isExpired: now >= payload.exp,
        userId: payload.userId || payload.sub,
        email: payload.email,
      });

      if (now >= payload.exp) {
        console.log("❌ Token is EXPIRED");

        // Try to refresh token
        console.log("Attempting to refresh token...");
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          fetch("http://localhost:4000/api/v1/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          })
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                throw new Error(`HTTP ${response.status}`);
              }
            })
            .then((result) => {
              if (result.data) {
                console.log("✅ Token refresh successful");
                localStorage.setItem("accessToken", result.data.accessToken);
                localStorage.setItem("refreshToken", result.data.refreshToken);
                console.log("New token saved, reloading page...");
                window.location.reload();
              } else {
                console.error("❌ Token refresh failed - no data");
              }
            })
            .catch((error) => {
              console.error("❌ Token refresh failed:", error);
              console.log("Clearing tokens and redirecting to login...");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");
              window.location.href = "/login";
            });
        } else {
          console.error("❌ No refresh token available");
          console.log("Clearing tokens and redirecting to login...");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } else if (timeUntilExpiry < 300) {
        console.log("⚠️ Token expires soon (less than 5 minutes)");
      } else {
        console.log("✅ Token is valid");
      }
    } else {
      console.error("❌ Invalid token format - not a JWT");
    }
  } catch (error) {
    console.error("❌ Error parsing token:", error);
  }
} else {
  console.error("❌ No token found");
  console.log("Redirecting to login...");
  window.location.href = "/login";
}

// Check WebSocket status
import("@/lib/websocket").then(({ websocketService }) => {
  const status = websocketService.getConnectionStatus();
  console.log("WebSocket Status:", status);

  if (websocketService.isPaused) {
    console.log("WebSocket is paused, resetting...");
    websocketService.reset();
  }
});
