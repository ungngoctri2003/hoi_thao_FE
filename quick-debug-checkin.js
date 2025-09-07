// Quick debug script để kiểm tra trạng thái checkin
console.log('🚀 Starting quick debug...');

// Kiểm tra token
const token = localStorage.getItem('accessToken');
console.log('🔑 Token exists:', !!token);

if (!token) {
    console.error('❌ No access token found. Please login first.');
} else {
    // Test API calls
    const API_BASE_URL = 'http://localhost:4000/api/v1';
    
    async function testAPI() {
        try {
            // Test get attendees
            console.log('📋 Testing attendees API...');
            const attendeesResponse = await fetch(`${API_BASE_URL}/attendees?limit=5`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!attendeesResponse.ok) {
                throw new Error(`HTTP error! status: ${attendeesResponse.status}`);
            }
            
            const attendees = await attendeesResponse.json();
            console.log('✅ Got attendees:', attendees.data.length);
            
            // Test specific users
            const targetEmails = ['testnew123@example.com', 'triung8+2@gmail.com'];
            
            for (const email of targetEmails) {
                console.log(`🔍 Testing ${email}...`);
                
                // Find attendee by email
                const attendeeResponse = await fetch(`${API_BASE_URL}/attendees?filters[email]=${encodeURIComponent(email)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!attendeeResponse.ok) {
                    console.error(`❌ Error getting attendee ${email}:`, attendeeResponse.status);
                    continue;
                }
                
                const attendeeData = await attendeeResponse.json();
                console.log(`👤 Found attendee:`, attendeeData.data[0]);
                
                if (attendeeData.data.length === 0) {
                    console.log(`❌ No attendee found with email ${email}`);
                    continue;
                }
                
                const attendee = attendeeData.data[0];
                
                // Get registrations
                const registrationsResponse = await fetch(`${API_BASE_URL}/attendees/${attendee.ID}/registrations`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!registrationsResponse.ok) {
                    console.error(`❌ Error getting registrations for ${email}:`, registrationsResponse.status);
                    continue;
                }
                
                const registrationsData = await registrationsResponse.json();
                console.log(`📋 Registrations for ${email}:`, registrationsData.data);
                
                // Calculate status
                const registrations = registrationsData.data;
                if (registrations.length === 0) {
                    console.log(`📝 No registrations for ${email}`);
                    continue;
                }
                
                // Find latest registration
                const latestRegistration = registrations.reduce((latest, current) => {
                    const latestTime = latest.CHECKOUT_TIME || latest.CHECKIN_TIME || latest.REGISTRATION_DATE;
                    const currentTime = current.CHECKOUT_TIME || current.CHECKIN_TIME || current.REGISTRATION_DATE;
                    return new Date(currentTime) > new Date(latestTime) ? current : latest;
                });
                
                console.log(`🎯 Latest registration for ${email}:`, latestRegistration);
                
                // Calculate status
                let status = 'registered';
                if (latestRegistration.STATUS === 'cancelled') {
                    status = 'cancelled';
                } else if (latestRegistration.STATUS === 'no-show') {
                    status = 'no-show';
                } else if (latestRegistration.CHECKOUT_TIME) {
                    status = 'checked-out';
                } else if (latestRegistration.CHECKIN_TIME) {
                    status = 'checked-in';
                }
                
                console.log(`✅ Final status for ${email}: ${status}`);
                console.log(`   - Checkin time: ${latestRegistration.CHECKIN_TIME}`);
                console.log(`   - Checkout time: ${latestRegistration.CHECKOUT_TIME}`);
                console.log(`   - Registration status: ${latestRegistration.STATUS}`);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
        }
    }
    
    testAPI();
}
