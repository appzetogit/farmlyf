async function testUpload() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const body = 
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="image"; filename="test.txt"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `test content\r\n` +
    `--${boundary}--\r\n`;

  try {
    console.log('Testing POST http://localhost:5000/api/upload ...');
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: body
    });

    console.log('Status:', res.status);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Success (JSON):', json);
    } catch (e) {
      console.log('Failure (HTML/Text):', text.substring(0, 200));
    }
  } catch (err) {
    console.error('Fatal Error:', err);
  }
}

testUpload();
