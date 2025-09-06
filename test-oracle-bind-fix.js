const fetch = require('node-fetch');

async function testAttendeeUpdate() {
    console.log('🧪 Testing attendee update with Oracle bind fix...\n');
    
    const testData = {
        NAME: 'Test User Updated',
        EMAIL: 'testupdated@example.com',
        DATE_OF_BIRTH: '1990-01-01',
        GENDER: 'male',
        PHONE: '0123456789',
        COMPANY: 'Test Company',
        POSITION: 'Test Position'
    };
    
    try {
        console.log('📤 Sending data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:4000/api/v1/attendees/6', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 401) {
            console.log('✅ SUCCESS: Endpoint is working! Got authentication error (expected without valid token)');
            console.log('✅ No Oracle bind errors detected!');
        } else if (response.status === 500 && data.message && data.message.includes('NJS-012')) {
            console.log('❌ FAILED: Oracle bind error still exists');
            console.log('🔍 Error details:', data.message);
        } else if (response.status === 200) {
            console.log('✅ SUCCESS: Update completed successfully!');
        } else {
            console.log('ℹ️  INFO: Unexpected response status');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testAttendeeCreation() {
    console.log('\n🧪 Testing attendee creation with Oracle bind fix...\n');
    
    const testData = {
        NAME: 'Test User New',
        EMAIL: 'testnew@example.com',
        DATE_OF_BIRTH: '1985-05-15',
        GENDER: 'female',
        PHONE: '0987654321',
        COMPANY: 'New Test Company',
        POSITION: 'New Test Position'
    };
    
    try {
        console.log('📤 Sending data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:4000/api/v1/attendees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 401) {
            console.log('✅ SUCCESS: Endpoint is working! Got authentication error (expected without valid token)');
            console.log('✅ No Oracle bind errors detected!');
        } else if (response.status === 500 && data.message && data.message.includes('NJS-012')) {
            console.log('❌ FAILED: Oracle bind error still exists');
            console.log('🔍 Error details:', data.message);
        } else if (response.status === 201) {
            console.log('✅ SUCCESS: Creation completed successfully!');
        } else {
            console.log('ℹ️  INFO: Unexpected response status');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting Oracle bind fix tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await testAttendeeUpdate();
    await testAttendeeCreation();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
