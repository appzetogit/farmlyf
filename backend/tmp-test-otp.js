import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const testPhone = '9876543210';

async function testSendOtp() {
    console.log(`Sending OTP to ${testPhone}...`);
    try {
        const res = await axios.post(`${API_URL}/users/send-otp-login`, { phone: testPhone });
        console.log('Response:', res.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testSendOtp();
