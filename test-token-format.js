// Test token format and JWT validation
const jwt = require("jsonwebtoken");

// Test with a sample token from localStorage
function testTokenFormat() {
  console.log("🔍 Testing token format...");

  // Get token from localStorage (if running in browser)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      console.log(
        "Token found in localStorage:",
        token.substring(0, 20) + "..."
      );
      console.log("Token length:", token.length);
      console.log("Token parts:", token.split(".").length);

      try {
        // Decode without verification to check format
        const decoded = jwt.decode(token);
        console.log("Decoded token payload:", decoded);
        console.log("Token expiration:", new Date(decoded.exp * 1000));
        console.log("Current time:", new Date());
        console.log("Token expired:", Date.now() >= decoded.exp * 1000);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.log("No token found in localStorage");
    }
  } else {
    console.log(
      "This script should be run in the browser to access localStorage"
    );
  }
}

// Test JWT secret validation
function testJWTSecret() {
  console.log("🔑 Testing JWT secret...");

  // Test with default secret from env.example
  const defaultSecret =
    "your_super_secret_access_key_here_change_in_production";
  console.log("Default secret length:", defaultSecret.length);
  console.log(
    "Default secret (first 10 chars):",
    defaultSecret.substring(0, 10) + "..."
  );

  // Test if secret is being used
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        // Try to verify with default secret
        const decoded = jwt.verify(token, defaultSecret);
        console.log("✅ Token verified with default secret");
        console.log("Decoded payload:", decoded);
      } catch (error) {
        console.log(
          "❌ Token verification failed with default secret:",
          error.message
        );

        // Try with a different secret
        try {
          const decoded = jwt.verify(token, "change_in_production");
          console.log('✅ Token verified with "change_in_production"');
        } catch (error2) {
          console.log(
            '❌ Token verification failed with "change_in_production":',
            error2.message
          );
        }
      }
    }
  }
}

// Run tests
if (typeof window !== "undefined") {
  testTokenFormat();
  testJWTSecret();
} else {
  console.log(
    "This script should be run in the browser to access localStorage"
  );
}

