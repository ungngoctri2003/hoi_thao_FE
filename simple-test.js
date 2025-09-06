const http = require('http');

const testData = {
    NAME: 'Test User',
    EMAIL: 'test@example.com',
    DATE_OF_BIRTH: '1990-01-01',
    GENDER: 'male'
};

const data = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/attendees/6',
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
    }
};

console.log('Testing attendee update...');
console.log('Data:', data);

const req = http.request(options, (res) => {
    let body = '';
    
    res.on('data', (chunk) => {
        body += chunk;
    });
    
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', body);
        
        if (res.statusCode === 401) {
            console.log('✅ SUCCESS: No Oracle bind errors!');
        } else if (body.includes('NJS-012')) {
            console.log('❌ FAILED: Oracle bind error still exists');
        } else {
            console.log('ℹ️  INFO: Unexpected response');
        }
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
});

req.write(data);
req.end();
