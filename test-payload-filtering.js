// Test payload filtering để khắc phục lỗi OVERALLSTATUS
// Using built-in fetch in Node.js 18+

async function testPayloadFiltering() {
    console.log('🧪 Testing payload filtering for invalid fields...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    // Payload giống như frontend gửi (có các trường không hợp lệ)
    const payloadWithInvalidFields = {
        ID: 6,
        NAME: "Test User With Token",
        EMAIL: "testwithtoken@example.com",
        PHONE: "0123456789",
        AVATAR_URL: "https://res.cloudinary.com/drzrlehgg/image/upload/v1756831432/conference-attendees/y7dtqg7r6uevlllgsrau.jpg",
        COMPANY: "Token Test Company",
        CREATED_AT: "2025-09-02T16:44:14.867Z",
        DATE_OF_BIRTH: "1990-01-01T00:00:00.000Z",
        DIETARY: "vegetarian",
        EMAIL: "testwithtoken@example.com",
        GENDER: "male",
        ID: 6,
        NAME: "Test User With Token",
        PHONE: "0123456789",
        POSITION: "Token Test Position",
        RN: 1, // Invalid field
        SPECIAL_NEEDS: "eqwewq",
        conferences: [{ID: 3, NAME: "Seminar Khởi nghiệp"}], // Invalid field
        overallStatus: "registered", // Invalid field - this was causing the error!
        registrations: [{ID: 23, CONFERENCE_ID: 3, STATUS: "registered"}] // Invalid field
    };
    
    try {
        console.log('📤 Sending payload with invalid fields:', JSON.stringify(payloadWithInvalidFields, null, 2));
        
        const response = await fetch('http://localhost:4000/api/v1/attendees/6', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payloadWithInvalidFields)
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Payload filtering worked! Invalid fields were ignored.');
            console.log('🎉 OVERALLSTATUS error has been fixed!');
        } else if (response.status === 500 && data.error && data.error.message && data.error.message.includes('OVERALLSTATUS')) {
            console.log('❌ FAILED: OVERALLSTATUS error still exists');
            console.log('🔍 Error details:', data.error.message);
        } else {
            console.log('❌ FAILED: Update failed with different error');
            console.log('🔍 Error details:', data.error?.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

async function testValidPayload() {
    console.log('\n🧪 Testing with valid payload only...\n');
    
    // Lấy token
    const token = await getToken();
    if (!token) {
        console.log('❌ Không thể lấy token');
        return;
    }
    
    // Payload chỉ có các trường hợp lệ
    const validPayload = {
        NAME: "Test User Valid Payload",
        EMAIL: "testvalid@example.com",
        PHONE: "0123456789",
        COMPANY: "Valid Test Company",
        POSITION: "Valid Test Position",
        GENDER: "male",
        DATE_OF_BIRTH: "1990-01-01",
        DIETARY: "vegetarian",
        SPECIAL_NEEDS: "none"
    };
    
    try {
        console.log('📤 Sending valid payload:', JSON.stringify(validPayload, null, 2));
        
        const response = await fetch('http://localhost:4000/api/v1/attendees/6', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validPayload)
        });
        
        const data = await response.json();
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log('📋 Response Data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('✅ SUCCESS: Valid payload update completed!');
        } else {
            console.log('❌ FAILED: Valid payload update failed');
            console.log('🔍 Error details:', data.error?.message || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

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
            return data.data.accessToken;
        }
        return null;
    } catch (error) {
        console.error('Error getting token:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('🚀 Starting payload filtering tests...\n');
    
    // Wait a bit for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testPayloadFiltering();
    await testValidPayload();
    
    console.log('\n🏁 Tests completed!');
}

runTests().catch(console.error);
