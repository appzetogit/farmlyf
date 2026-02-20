import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';
const credentials = {
    email: 'admin@farmlyf.com',
    password: 'admin'
};

async function testAuth() {
    console.log('--- Testing Admin Login ---');
    try {
        const loginRes = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        
        if (loginRes.ok) {
            console.log('Login Successful!');
            const token = loginData.token;
            
            console.log('\n--- Testing Protected Profile Endpoint ---');
            const profileRes = await fetch(`${API_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const profileData = await profileRes.json();
            console.log('Profile Status:', profileRes.status);
            if (profileRes.ok) {
                console.log('Profile fetch successful! User role:', profileData.role);
            } else {
                console.error('Profile fetch failed:', profileData.message);
            }
        } else {
            console.error('Login failed:', loginData.message);
        }
    } catch (error) {
        console.error('Test failed with error:', error.message);
    }
}

testAuth();
