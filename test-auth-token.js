// Test authentication token
console.log("Testing authentication...");

// Check if we're in browser environment
if (typeof window !== "undefined") {
  console.log("Browser environment detected");

  // Check localStorage
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  console.log("Access Token:", accessToken ? "Exists" : "Missing");
  console.log("Refresh Token:", refreshToken ? "Exists" : "Missing");

  if (accessToken) {
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = now >= payload.exp;

      console.log("Token payload:", payload);
      console.log("Token expired:", isExpired);
      console.log("Expires at:", new Date(payload.exp * 1000));
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }
} else {
  console.log("Node.js environment - cannot check localStorage");
  console.log("This script should be run in browser console");
}
