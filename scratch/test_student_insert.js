const https = require('https');

const SUPABASE_URL = 'sbxrnpwxtitnmvrdmcxr.supabase.co';
const ANON_KEY = 'sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz';

function post(path, body) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(body);
    const options = {
      hostname: SUPABASE_URL,
      path: path,
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    
    req.on('error', (err) => resolve({ error: err }));
    req.write(payload);
    req.end();
  });
}

(async () => {
  const randomId = 'fdfdfdfd-dffd-dffd-dffd-fdfdfdfdfdfd'; // A valid UUID format
  console.log(`Testing insert into library_users with random UUID: ${randomId}`);
  
  const res = await post('/rest/v1/library_users', {
    id: randomId,
    full_name: 'Test Mock Student',
    role: 'student',
    library_id: 'MOCK123'
  });
  
  console.log('Status:', res.status);
  console.log('Body:', res.body);
})();
