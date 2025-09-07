const API_BASE_URL = 'http://localhost:4000/api/v1';

async function makeRequest(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`❌ Error making request to ${endpoint}:`, error.message);
        throw error;
    }
}

// Logic tính toán trạng thái (copy từ hook)
function calculateOverallStatus(registrations) {
    if (registrations.length === 0) {
        return 'registered';
    }

    // Lấy registration mới nhất dựa trên thời gian checkin/checkout hoặc registration date
    const latestRegistration = registrations.reduce((latest, current) => {
        const latestTime = latest.CHECKOUT_TIME || latest.CHECKIN_TIME || latest.REGISTRATION_DATE;
        const currentTime = current.CHECKOUT_TIME || current.CHECKIN_TIME || current.REGISTRATION_DATE;
        return new Date(currentTime) > new Date(latestTime) ? current : latest;
    });

    console.log('🔍 Calculating status for registration:', {
        id: latestRegistration.ID,
        status: latestRegistration.STATUS,
        checkinTime: latestRegistration.CHECKIN_TIME,
        checkoutTime: latestRegistration.CHECKOUT_TIME,
        registrationDate: latestRegistration.REGISTRATION_DATE
    });

    // Kiểm tra trạng thái theo thứ tự ưu tiên
    // 1. Cancelled - cao nhất
    if (latestRegistration.STATUS === 'cancelled') {
        console.log('✅ Status: cancelled');
        return 'cancelled';
    }

    // 2. No-show
    if (latestRegistration.STATUS === 'no-show') {
        console.log('✅ Status: no-show');
        return 'no-show';
    }

    // 3. Checked-out - nếu có checkout time
    if (latestRegistration.CHECKOUT_TIME) {
        console.log('✅ Status: checked-out');
        return 'checked-out';
    }

    // 4. Checked-in - nếu có checkin time nhưng chưa checkout
    if (latestRegistration.CHECKIN_TIME) {
        console.log('✅ Status: checked-in');
        return 'checked-in';
    }

    // 5. Registered - mặc định
    console.log('✅ Status: registered (default)');
    return 'registered';
}

async function debugSpecificUsers() {
    console.log('🚀 Bắt đầu debug specific users...');
    
    const targetEmails = ['testnew123@example.com', 'triung8+2@gmail.com'];

    for (const email of targetEmails) {
        try {
            console.log(`🔍 Debugging user: ${email}`);
            
            // Tìm attendee theo email
            const attendeesResponse = await makeRequest(`/attendees?filters[email]=${encodeURIComponent(email)}`);
            console.log(`📋 Found ${attendeesResponse.data.length} attendees with email ${email}`);
            
            if (attendeesResponse.data.length === 0) {
                console.log(`❌ Không tìm thấy attendee với email: ${email}`);
                continue;
            }

            const attendee = attendeesResponse.data[0];
            console.log(`👤 Attendee found:`, {
                id: attendee.ID,
                name: attendee.NAME,
                email: attendee.EMAIL
            });

            // Lấy registrations của attendee
            const registrationsResponse = await makeRequest(`/attendees/${attendee.ID}/registrations`);
            const registrations = registrationsResponse.data;
            console.log(`📋 Found ${registrations.length} registrations for ${attendee.NAME}`);

            // Hiển thị chi tiết registrations
            registrations.forEach((reg, index) => {
                console.log(`📝 Registration ${index + 1}:`, {
                    id: reg.ID,
                    conferenceId: reg.CONFERENCE_ID,
                    status: reg.STATUS,
                    registrationDate: reg.REGISTRATION_DATE,
                    checkinTime: reg.CHECKIN_TIME,
                    checkoutTime: reg.CHECKOUT_TIME
                });
            });

            // Tính toán trạng thái
            const overallStatus = calculateOverallStatus(registrations);
            console.log(`🎯 Final status for ${attendee.NAME}: ${overallStatus}`);

        } catch (error) {
            console.error(`❌ Error debugging ${email}:`, error.message);
        }
    }

    console.log('✅ Hoàn thành debug specific users!');
}

// Chạy debug
debugSpecificUsers();
