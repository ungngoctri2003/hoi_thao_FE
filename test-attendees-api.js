const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:5000/api';

// Test data
const testUsers = {
    admin: {
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
    },
    staff: {
        email: 'staff@example.com', 
        password: 'staff123',
        role: 'staff'
    },
    attendee: {
        email: 'attendee@example.com',
        password: 'attendee123', 
        role: 'attendee'
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
    const statusColor = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    
    log(`\n${statusIcon} ${testName}: ${status}`, statusColor);
    if (details) {
        log(`   ${details}`, 'cyan');
    }
}

async function loginUser(user) {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: user.email,
            password: user.password
        });
        
        return {
            success: true,
            token: response.data.token,
            user: response.data.user
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
}

async function testAttendeesAccess(token, userRole) {
    try {
        const response = await axios.get(`${API_URL}/attendees`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return {
            success: true,
            data: response.data,
            status: response.status
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
}

async function testSidebarNavigation(userRole) {
    try {
        const response = await axios.get(`${BASE_URL}/api/sidebar`, {
            headers: {
                'Cookie': `userRole=${userRole}`
            }
        });
        
        const sidebarData = response.data;
        const hasAttendeesManagement = sidebarData.items?.some(item => 
            item.href === '/attendees' && item.adminOnly
        );
        
        return {
            success: true,
            hasAttendeesManagement,
            sidebarData
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function testConferenceFiltering(token) {
    try {
        // Test filtering by conference
        const response = await axios.get(`${API_URL}/attendees?conference=1`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        return {
            success: true,
            data: response.data,
            filteredCount: response.data.length
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message
        };
    }
}

async function runTests() {
    log('🧪 Bắt đầu test phân quyền quản lý người tham dự...', 'bright');
    log('=' * 60, 'blue');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    // Test 1: Admin Access
    log('\n📋 Test 1: Admin Access', 'yellow');
    totalTests++;
    
    const adminLogin = await loginUser(testUsers.admin);
    if (adminLogin.success) {
        const adminAttendees = await testAttendeesAccess(adminLogin.token, 'admin');
        if (adminAttendees.success) {
            logTest('Admin có thể truy cập /attendees', 'PASS', 
                `Tìm thấy ${adminAttendees.data.length} người tham dự`);
            passedTests++;
        } else {
            logTest('Admin có thể truy cập /attendees', 'FAIL', 
                `Lỗi: ${adminAttendees.error}`);
            failedTests++;
        }
    } else {
        logTest('Admin login', 'FAIL', `Lỗi: ${adminLogin.error}`);
        failedTests++;
    }
    
    // Test 2: Staff Access (should be denied)
    log('\n📋 Test 2: Staff Access', 'yellow');
    totalTests++;
    
    const staffLogin = await loginUser(testUsers.staff);
    if (staffLogin.success) {
        const staffAttendees = await testAttendeesAccess(staffLogin.token, 'staff');
        if (!staffAttendees.success && staffAttendees.status === 403) {
            logTest('Staff bị chặn truy cập /attendees', 'PASS', 
                'Nhận được lỗi 403 Forbidden như mong đợi');
            passedTests++;
        } else {
            logTest('Staff bị chặn truy cập /attendees', 'FAIL', 
                `Không bị chặn như mong đợi. Status: ${staffAttendees.status}`);
            failedTests++;
        }
    } else {
        logTest('Staff login', 'FAIL', `Lỗi: ${staffLogin.error}`);
        failedTests++;
    }
    
    // Test 3: Attendee Access (should be denied)
    log('\n📋 Test 3: Attendee Access', 'yellow');
    totalTests++;
    
    const attendeeLogin = await loginUser(testUsers.attendee);
    if (attendeeLogin.success) {
        const attendeeAttendees = await testAttendeesAccess(attendeeLogin.token, 'attendee');
        if (!attendeeAttendees.success && attendeeAttendees.status === 403) {
            logTest('Attendee bị chặn truy cập /attendees', 'PASS', 
                'Nhận được lỗi 403 Forbidden như mong đợi');
            passedTests++;
        } else {
            logTest('Attendee bị chặn truy cập /attendees', 'FAIL', 
                `Không bị chặn như mong đợi. Status: ${attendeeAttendees.status}`);
            failedTests++;
        }
    } else {
        logTest('Attendee login', 'FAIL', `Lỗi: ${attendeeLogin.error}`);
        failedTests++;
    }
    
    // Test 4: Sidebar Navigation
    log('\n📋 Test 4: Sidebar Navigation', 'yellow');
    totalTests++;
    
    const adminSidebar = await testSidebarNavigation('admin');
    if (adminSidebar.success && adminSidebar.hasAttendeesManagement) {
        logTest('Admin thấy mục quản lý người tham dự trong sidebar', 'PASS');
        passedTests++;
    } else {
        logTest('Admin thấy mục quản lý người tham dự trong sidebar', 'FAIL', 
            'Không thấy mục trong sidebar');
        failedTests++;
    }
    
    // Test 5: Conference Filtering
    log('\n📋 Test 5: Conference Filtering', 'yellow');
    totalTests++;
    
    if (adminLogin.success) {
        const filterTest = await testConferenceFiltering(adminLogin.token);
        if (filterTest.success) {
            logTest('Bộ lọc hội nghị hoạt động', 'PASS', 
                `Tìm thấy ${filterTest.filteredCount} người tham dự trong hội nghị 1`);
            passedTests++;
        } else {
            logTest('Bộ lọc hội nghị hoạt động', 'FAIL', 
                `Lỗi: ${filterTest.error}`);
            failedTests++;
        }
    } else {
        logTest('Bộ lọc hội nghị hoạt động', 'SKIP', 'Admin login failed');
    }
    
    // Test Summary
    log('\n📊 Tổng kết Test', 'bright');
    log('=' * 60, 'blue');
    log(`Tổng số test: ${totalTests}`, 'cyan');
    log(`✅ Passed: ${passedTests}`, 'green');
    log(`❌ Failed: ${failedTests}`, 'red');
    log(`⚠️  Skipped: ${totalTests - passedTests - failedTests}`, 'yellow');
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    log(`\n🎯 Tỷ lệ thành công: ${successRate}%`, 
        successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
    
    if (failedTests === 0) {
        log('\n🎉 Tất cả test đều PASSED! Hệ thống phân quyền hoạt động chính xác.', 'green');
    } else {
        log('\n⚠️  Một số test FAILED. Vui lòng kiểm tra lại cấu hình.', 'yellow');
    }
}

// Run tests
runTests().catch(error => {
    log(`\n💥 Lỗi khi chạy test: ${error.message}`, 'red');
    process.exit(1);
});
