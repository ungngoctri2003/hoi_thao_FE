// Test script for WebSocket messaging functionality
const io = require("socket.io-client");

const token = "your-access-token-here"; // Replace with actual token
const baseURL = "http://localhost:4000";

console.log("🔌 Testing WebSocket Messaging Connection...");

// Connect to WebSocket
const socket = io(`${baseURL}`, {
  path: "/ws",
  auth: {
    token: token,
  },
  extraHeaders: {
    Authorization: `Bearer ${token}`,
  },
  transports: ["websocket", "polling"],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Connection events
socket.on("connect", () => {
  console.log("✅ WebSocket connected successfully");
  console.log("Socket ID:", socket.id);

  // Test joining a conversation
  const testSessionId = 1;
  const testUserId = 1;

  console.log(`\n📝 Testing conversation join for session ${testSessionId}...`);
  socket.emit("join-conversation", {
    sessionId: testSessionId,
    userId: testUserId,
  });
});

socket.on("joined-conversation", (data) => {
  console.log("✅ Successfully joined conversation:", data);

  // Test sending a message
  console.log("\n💬 Testing message sending...");
  const testMessage = {
    sessionId: data.sessionId,
    content: "Hello from WebSocket test!",
    type: "text",
    attendeeId: 2,
    senderId: data.userId,
  };

  socket.emit("send-message", testMessage);
});

socket.on("message-sent", (data) => {
  console.log("✅ Message sent successfully:", data);
});

socket.on("new-message", (data) => {
  console.log("📨 Received new message:", data);
});

socket.on("error", (error) => {
  console.error("❌ WebSocket error:", error);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 WebSocket disconnected:", reason);
});

// Test typing indicators
setTimeout(() => {
  console.log("\n⌨️ Testing typing indicators...");
  socket.emit("typing", {
    sessionId: 1,
    userId: 1,
    isTyping: true,
  });

  setTimeout(() => {
    socket.emit("stop-typing", {
      sessionId: 1,
      userId: 1,
    });
    console.log("✅ Typing indicators tested");
  }, 2000);
}, 5000);

// Test message read status
setTimeout(() => {
  console.log("\n👁️ Testing message read status...");
  socket.emit("mark-message-read", {
    messageId: 1,
    userId: 1,
  });
}, 8000);

// Test conversation history
setTimeout(() => {
  console.log("\n📚 Testing conversation history...");
  socket.emit("get-conversation-history", {
    sessionId: 1,
    userId: 1,
    limit: 10,
    offset: 0,
  });
}, 10000);

socket.on("conversation-history", (data) => {
  console.log("📚 Conversation history received:", data);
});

// Cleanup after 15 seconds
setTimeout(() => {
  console.log("\n🧹 Cleaning up...");
  socket.disconnect();
  process.exit(0);
}, 15000);

console.log("⏳ Test will run for 15 seconds...");
