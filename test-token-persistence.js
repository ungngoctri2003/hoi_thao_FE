// Test token persistence và checkin/checkout flow
// Using built-in fetch in Node.js 18+

let currentToken = null;

async function getToken() {
    try {
        const response = await fetch('http://localhost:4000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@conference.vn',
                password: 'admin123'
            })
        });

        const data = await response.json();
        
        if (response.ok && data.data && data.data.accessToken) {
            currentToken = data.data.accessToken;
            console.log('🔑 New token obtained:', currentToken.substring(0, 50) + '...');
            return currentToken;
        }
        return null;
    } catch (error) {
        console.error('Error getting token:', error.message);
        return null;
    }
}

async function testCheckinFlow() {
    console.log('🧪 Testing checkin flow...\n');
    
    // Get fresh token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    try {
        // 1. Checkin
        console.log('1️⃣ Performing checkin...');
        const checkinResponse = await fetch('http://localhost:4000/api/v1/registrations/23/checkin', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const checkinData = await checkinResponse.json();
        console.log(`📊 Checkin Status: ${checkinResponse.status}`);
        console.log('📋 Checkin Data:', JSON.stringify(checkinData, null, 2));
        
        if (checkinResponse.status === 200) {
            console.log('✅ Checkin successful');
        } else {
            console.log('❌ Checkin failed');
            return;
        }
        
        // Wait a bit
        console.log('\n⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 2. Checkout
        console.log('\n2️⃣ Performing checkout...');
        const checkoutResponse = await fetch('http://localhost:4000/api/v1/registrations/23/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const checkoutData = await checkoutResponse.json();
        console.log(`📊 Checkout Status: ${checkoutResponse.status}`);
        console.log('📋 Checkout Data:', JSON.stringify(checkoutData, null, 2));
        
        if (checkoutResponse.status === 200) {
            console.log('✅ Checkout successful');
        } else {
            console.log('❌ Checkout failed');
            return;
        }
        
        // Wait a bit
        console.log('\n⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 3. Checkin again (this is where the error occurs)
        console.log('\n3️⃣ Performing checkin again...');
        const checkinAgainResponse = await fetch('http://localhost:4000/api/v1/registrations/23/checkin', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const checkinAgainData = await checkinAgainResponse.json();
        console.log(`📊 Checkin Again Status: ${checkinAgainResponse.status}`);
        console.log('📋 Checkin Again Data:', JSON.stringify(checkinAgainData, null, 2));
        
        if (checkinAgainResponse.status === 200) {
            console.log('✅ Checkin again successful');
        } else if (checkinAgainResponse.status === 401) {
            console.log('❌ UNAUTHORIZED - Token may have expired');
            
            // Try to get a new token and retry
            console.log('\n🔄 Getting new token and retrying...');
            const newToken = await getToken();
            if (newToken) {
                const retryResponse = await fetch('http://localhost:4000/api/v1/registrations/23/checkin', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${newToken}`
                    }
                });
                
                const retryData = await retryResponse.json();
                console.log(`📊 Retry Status: ${retryResponse.status}`);
                console.log('📋 Retry Data:', JSON.stringify(retryData, null, 2));
                
                if (retryResponse.status === 200) {
                    console.log('✅ Retry with new token successful');
                } else {
                    console.log('❌ Retry failed');
                }
            }
        } else {
            console.log('❌ Checkin again failed with different error');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testTokenValidity() {
    console.log('\n🧪 Testing token validity...\n');
    
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    // Test token with multiple requests
    for (let i = 1; i <= 5; i++) {
        console.log(`\n${i}️⃣ Testing token validity (request ${i})...`);
        
        try {
            const response = await fetch('http://localhost:4000/api/v1/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            console.log(`📊 Status: ${response.status}`);
            
            if (response.status === 200) {
                console.log('✅ Token still valid');
            } else if (response.status === 401) {
                console.log('❌ Token expired');
                break;
            } else {
                console.log('⚠️  Unexpected status');
            }
            
            // Wait between requests
            if (i < 5) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
}

async function runTests() {
    console.log('🚀 Starting token persistence tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testTokenValidity();
    await testCheckinFlow();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
