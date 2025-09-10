// Script to create a test user and get token
const API_BASE_URL = "http://localhost:4000/api/v1";

async function createTestUserAndLogin() {
  try {
    console.log("🔍 Creating test user and getting token...");

    // Step 1: Try to register a new user
    console.log("\n1. Registering test user...");
    try {
      const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          name: "Test User",
          password: "test123",
        }),
      });

      console.log("Register response status:", registerResponse.status);
      const registerText = await registerResponse.text();
      console.log("Register response body:", registerText);

      if (registerResponse.ok) {
        console.log("✅ User registered successfully");
      } else {
        console.log("❌ Registration failed, user might already exist");
      }
    } catch (error) {
      console.log("❌ Registration error:", error.message);
    }

    // Step 2: Try to login with the test user
    console.log("\n2. Logging in with test user...");
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "test123",
        }),
      });

      console.log("Login response status:", loginResponse.status);
      const loginText = await loginResponse.text();
      console.log("Login response body:", loginText);

      if (loginResponse.ok) {
        const loginData = JSON.parse(loginText);
        console.log("✅ Login successful!");

        const token = loginData.data?.accessToken;
        if (token) {
          console.log("Token received:", token.substring(0, 50) + "...");

          // Step 3: Test WebSocket connection with real token
          console.log("\n3. Testing WebSocket connection with real token...");
          const { io } = require("socket.io-client");

          const socket = io("http://localhost:4000", {
            path: "/ws",
            auth: {
              token: token,
            },
            extraHeaders: {
              Authorization: `Bearer ${token}`,
            },
            transports: ["websocket", "polling"],
            timeout: 10000,
          });

          socket.on("connect", () => {
            console.log("✅ WebSocket connected successfully!");
            console.log("Socket ID:", socket.id);
            socket.disconnect();
            process.exit(0);
          });

          socket.on("connect_error", (error) => {
            console.error("❌ WebSocket connection error:", error.message);
            console.error("Error details:", error);
            process.exit(1);
          });

          socket.on("disconnect", (reason) => {
            console.log("WebSocket disconnected:", reason);
          });

          // Timeout after 10 seconds
          setTimeout(() => {
            console.log("WebSocket test timeout reached");
            socket.disconnect();
            process.exit(0);
          }, 10000);

          // Step 4: Test messaging endpoints with real token
          console.log("\n3. Testing messaging endpoints with real token...");

          // Test users with messages
          try {
            const messagesResponse = await fetch(
              `${API_BASE_URL}/users/with-messages`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("Messages response status:", messagesResponse.status);
            const messagesText = await messagesResponse.text();
            console.log("Messages response body:", messagesText);

            if (messagesResponse.ok) {
              const messagesData = JSON.parse(messagesText);
              console.log("✅ Users with messages:", messagesData);
            } else {
              console.log("❌ Users with messages failed");
            }
          } catch (error) {
            console.log("❌ Messages endpoint error:", error.message);
          }

          // Test available users
          try {
            const availableResponse = await fetch(
              `${API_BASE_URL}/users/available`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            console.log("Available response status:", availableResponse.status);
            const availableText = await availableResponse.text();
            console.log("Available response body:", availableText);

            if (availableResponse.ok) {
              const availableData = JSON.parse(availableText);
              console.log("✅ Available users:", availableData);
            } else {
              console.log("❌ Available users failed");
            }
          } catch (error) {
            console.log("❌ Available users error:", error.message);
          }
        } else {
          console.log("❌ No token in login response");
        }
      } else {
        console.log("❌ Login failed");
      }
    } catch (error) {
      console.log("❌ Login error:", error.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
createTestUserAndLogin();
