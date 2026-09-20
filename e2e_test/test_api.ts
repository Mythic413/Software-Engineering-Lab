
async function test() {
  console.log("Testing /api/classify/custom...");
  try {
    const response = await fetch('http://localhost:3000/api/classify/custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64: 'test',
        mimeType: 'image/png'
      })
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);
    const text = await response.text();
    console.log("Response Body (first 500 chars):", text.substring(0, 500));
  } catch (err: any) {
    console.error("Fetch Error:", err.message);
  }
}

test();
