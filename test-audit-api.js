// Using built-in fetch in Node.js 18+

async function testAuditAPI() {
  const baseURL = 'http://localhost:4000/api/v1';
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test frontend audit endpoint (should fail without auth)
    console.log('\nTesting frontend audit endpoint without auth...');
    try {
      const auditResponse = await fetch(`${baseURL}/audit/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'Test Action',
          page: 'Test Page',
          details: 'Test Details'
        })
      });
      
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        console.log('Audit response:', auditData);
      } else {
        const errorData = await auditResponse.json();
        console.log('Expected auth error:', errorData);
      }
    } catch (error) {
      console.log('Audit endpoint error:', error.message);
    }
    
    // Test with mock token
    console.log('\nTesting frontend audit endpoint with mock token...');
    try {
      const auditResponse = await fetch(`${baseURL}/audit/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        },
        body: JSON.stringify({
          action: 'Test Action',
          page: 'Test Page',
          details: 'Test Details'
        })
      });
      
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        console.log('Audit response with token:', auditData);
      } else {
        const errorData = await auditResponse.json();
        console.log('Auth error with token:', errorData);
      }
    } catch (error) {
      console.log('Audit endpoint error with token:', error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuditAPI();
