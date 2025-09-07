const { io } = require('socket.io-client');

console.log('🧪 Testing WebSocket connection...');

const socket = io('http://localhost:4000', {
  path: '/ws',
  transports: ['websocket', 'polling'],
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test joining a room
  socket.emit('join', 'test-room');
  console.log('📝 Joined test room');
  
  // Test after 2 seconds
  setTimeout(() => {
    socket.emit('join', 'user:123');
    console.log('📝 Joined user:123 room');
    
    // Disconnect after test
    setTimeout(() => {
      socket.disconnect();
      console.log('🔌 Disconnected');
      process.exit(0);
    }, 2000);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

// Test receiving messages
socket.on('permission_change', (data) => {
  console.log('🔔 Received permission change:', data);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout');
  socket.disconnect();
  process.exit(1);
}, 10000);
