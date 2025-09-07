// Test audit API with real authentication

async function testAuditWithToken() {
  const baseURL = 'http://localhost:4000/api/v1';
  
  try {
    // First, try to login to get a real token
    console.log('Attempting to login...');
    
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@conference.vn',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful!');
      
      const token = loginData.data.accessToken;
      console.log('Token received:', token.substring(0, 20) + '...');
      
      // Now test audit endpoint with real token
      console.log('\nTesting frontend audit endpoint with real token...');
      
      const auditResponse = await fetch(`${baseURL}/audit/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'Test Action from Script',
          page: 'Test Page',
          details: 'Test Details from Node.js script'
        })
      });
      
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        console.log('Audit response:', auditData);
        console.log('✅ Audit logging successful!');
      } else {
        const errorData = await auditResponse.json();
        console.log('❌ Audit error:', errorData);
      }
      
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuditWithToken();
