const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  const form = new FormData();
  // Using a small text file as a fake image to test multipart handling
  fs.writeFileSync('test.txt', 'test content');
  form.append('image', fs.createReadStream('test.txt'));

  try {
    console.log('Testing POST http://localhost:5000/api/upload ...');
    const res = await axios.post('http://localhost:5000/api/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error Status:', err.response?.status);
    console.error('Error Data:', err.response?.data);
  } finally {
    if (fs.existsSync('test.txt')) fs.unlinkSync('test.txt');
  }
}

testUpload();
