const io = require("socket.io-client");

// Test messaging functionality
async function testMessagingSocket() {
  console.log("🧪 Testing Messaging Socket Functionality");
  console.log("=====================================\n");

  // Connect to the server
  const socket = io("http://localhost:4000", {
    path: "/ws",
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("✅ Connected to WebSocket server");
    console.log("Socket ID:", socket.id);

    // Test 1: Join conversation
    console.log("\n📝 Test 1: Joining conversation...");
    socket.emit("join-conversation", {
      sessionId: 1,
      userId: 1,
    });
  });

  socket.on("joined-conversation", (data) => {
    console.log("✅ Successfully joined conversation:", data);

    // Test 2: Send message
    console.log("\n📝 Test 2: Sending message...");
    socket.emit("send-message", {
      sessionId: 1,
      content: "Hello from test client!",
      type: "text",
      senderId: 1,
      attendeeId: 2,
    });
  });

  socket.on("message-sent", (data) => {
    console.log("✅ Message sent successfully:", data);

    // Test 3: Typing indicator
    console.log("\n📝 Test 3: Testing typing indicator...");
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
    }, 2000);
  });

  socket.on("new-message", (data) => {
    console.log("📨 Received new message:", data);
  });

  socket.on("user-typing", (data) => {
    console.log("⌨️  User typing:", data);
  });

  socket.on("user-stopped-typing", (data) => {
    console.log("⌨️  User stopped typing:", data);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Disconnected from server");
  });

  // Test 4: Get conversation history
  setTimeout(() => {
    console.log("\n📝 Test 4: Getting conversation history...");
    socket.emit("get-conversation-history", {
      sessionId: 1,
      userId: 1,
      limit: 10,
      offset: 0,
    });
  }, 3000);

  socket.on("conversation-history", (data) => {
    console.log("📚 Conversation history received:", data);
  });

  // Test 5: Mark message as read
  setTimeout(() => {
    console.log("\n📝 Test 5: Marking message as read...");
    socket.emit("mark-message-read", {
      messageId: 1,
      userId: 2,
    });
  }, 4000);

  socket.on("message-read", (data) => {
    console.log("✅ Message marked as read:", data);
  });

  // Clean up after tests
  setTimeout(() => {
    console.log("\n🧹 Cleaning up...");
    socket.emit("leave-conversation", {
      sessionId: 1,
      userId: 1,
    });

    setTimeout(() => {
      socket.disconnect();
      console.log("✅ Test completed!");
      process.exit(0);
    }, 1000);
  }, 6000);
}

// Run the test
testMessagingSocket().catch(console.error);
