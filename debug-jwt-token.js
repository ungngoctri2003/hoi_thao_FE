// Debug JWT token issue
const jwt = require("jsonwebtoken");

// Test JWT verification with different secrets
function testJWTVerification() {
  console.log("🔍 Testing JWT verification...");

  // Get token from command line argument or use a test token
  const token = process.argv[2];

  if (!token) {
    console.log(
      "❌ Please provide a token as argument: node debug-jwt-token.js <token>"
    );
    return;
  }

  console.log("Token:", token.substring(0, 20) + "...");
  console.log("Token length:", token.length);

  // Test with different secrets
  const secrets = [
    "your_super_secret_access_key_here_change_in_production",
    "change_in_production",
    "default_secret",
    "test_secret",
  ];

  for (const secret of secrets) {
    try {
      const decoded = jwt.verify(token, secret);
      console.log(
        `✅ Token verified with secret: ${secret.substring(0, 10)}...`
      );
      console.log("Decoded payload:", decoded);
      return;
    } catch (error) {
      console.log(
        `❌ Failed with secret: ${secret.substring(0, 10)}... - ${
          error.message
        }`
      );
    }
  }

  // Try to decode without verification
  try {
    const decoded = jwt.decode(token);
    console.log("🔓 Token decoded without verification:", decoded);
    console.log("Token expired:", Date.now() >= decoded.exp * 1000);
  } catch (error) {
    console.log("❌ Failed to decode token:", error.message);
  }
}

testJWTVerification();

