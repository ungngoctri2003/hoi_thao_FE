// Test messaging API
const API_BASE = 'http://localhost:4000/api/v1';

async function testMessagingAPI() {
  try {
    console.log('🧪 Testing Messaging API...\n');

    // 1. Test get sessions
    console.log('1. Testing get sessions...');
    const sessionsResponse = await fetch(`${API_BASE}/sessions`);
    const sessionsData = await sessionsResponse.json();
    console.log('✅ Sessions:', sessionsData.data?.length || 0, 'found');
    console.log('Sessions data:', JSON.stringify(sessionsData, null, 2));
    
    if (sessionsData.data && sessionsData.data.length > 0) {
      const sessionId = sessionsData.data[0].ID || sessionsData.data[0].id;
      console.log('📝 Using session ID:', sessionId);

      // 2. Test get messages
      console.log('\n2. Testing get messages...');
      const messagesResponse = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
      const messagesData = await messagesResponse.json();
      console.log('✅ Messages:', messagesData.data?.length || 0, 'found');

      // 3. Test send message
      console.log('\n3. Testing send message...');
      const sendResponse = await fetch(`${API_BASE}/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // This will fail but we can see the error
        },
        body: JSON.stringify({
          content: 'Test message from API test',
          type: 'text',
          attendeeId: null
        })
      });

      if (sendResponse.ok) {
        const sendData = await sendResponse.json();
        console.log('✅ Message sent successfully:', sendData.data);
      } else {
        const errorText = await sendResponse.text();
        console.log('⚠️ Send message failed (expected without auth):', sendResponse.status, errorText);
      }

    } else {
      console.log('❌ No sessions found');
    }

    console.log('\n🎉 Messaging API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMessagingAPI();
