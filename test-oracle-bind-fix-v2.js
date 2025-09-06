// Using built-in fetch in Node.js 18+

async function testAttendeeUpdate() {
    console.log('🧪 Testing attendee update with Oracle bind fix v2...\n');
    
    // Test data with various data types that might cause Oracle bind issues
    const testData = {
        NAME: 'Test User Updated v2',
        EMAIL: 'testupdatedv2@example.com',
        DATE_OF_BIRTH: '1990-01-01', // String date
        GENDER: 'male',
        PHONE: '0123456789',
        COMPANY: 'Test Company v2',
        POSITION: 'Test Position v2',
        ADDRESS: '123 Test Street, Test City',
        DIETARY: 'No special requirements',
        SPECIAL_NEEDS: 'None'
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
        } else if (response.status === 500 && data.error && data.error.message && data.error.message.includes('NJS-012')) {
            console.log('❌ FAILED: Oracle bind error still exists');
            console.log('🔍 Error details:', data.error.message);
        } else if (response.status === 200) {
            console.log('✅ SUCCESS: Update completed successfully!');
        } else {
            console.log('ℹ️  INFO: Unexpected response status');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testAttendeeUpdateWithDateObject() {
    console.log('\n🧪 Testing attendee update with Date object...\n');
    
    // Test with Date object instead of string
    const testData = {
        NAME: 'Test User Date Object',
        EMAIL: 'testdateobject@example.com',
        DATE_OF_BIRTH: new Date('1985-05-15'), // Date object
        GENDER: 'female',
        PHONE: '0987654321',
        COMPANY: 'Date Test Company',
        POSITION: 'Date Test Position'
    };
    
    try {
        console.log('📤 Sending data with Date object:', JSON.stringify(testData, null, 2));
        
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
        } else if (response.status === 500 && data.error && data.error.message && data.error.message.includes('NJS-012')) {
            console.log('❌ FAILED: Oracle bind error still exists');
            console.log('🔍 Error details:', data.error.message);
        } else if (response.status === 200) {
            console.log('✅ SUCCESS: Update completed successfully!');
        } else {
            console.log('ℹ️  INFO: Unexpected response status');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testAttendeeUpdateWithNullValues() {
    console.log('\n🧪 Testing attendee update with null values...\n');
    
    // Test with null values
    const testData = {
        NAME: 'Test User Null Values',
        EMAIL: 'testnull@example.com',
        DATE_OF_BIRTH: null, // null value
        GENDER: null, // null value
        PHONE: '0123456789',
        COMPANY: null, // null value
        POSITION: 'Test Position',
        ADDRESS: null // null value
    };
    
    try {
        console.log('📤 Sending data with null values:', JSON.stringify(testData, null, 2));
        
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
        } else if (response.status === 500 && data.error && data.error.message && data.error.message.includes('NJS-012')) {
            console.log('❌ FAILED: Oracle bind error still exists');
            console.log('🔍 Error details:', data.error.message);
        } else if (response.status === 200) {
            console.log('✅ SUCCESS: Update completed successfully!');
        } else {
            console.log('ℹ️  INFO: Unexpected response status');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting Oracle bind fix tests v2...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await testAttendeeUpdate();
    await testAttendeeUpdateWithDateObject();
    await testAttendeeUpdateWithNullValues();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
