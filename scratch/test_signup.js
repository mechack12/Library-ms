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
  const email = `teststudent_${Math.floor(Math.random() * 100000)}@mailinator.com`;
  const password = 'testpassword123';
  
  console.log(`Testing SignUp with email: ${email}`);
  
  const signUpRes = await post('/auth/v1/signup', {
    email,
    password,
    data: {
      full_name: 'Test Student',
      role: 'student',
      library_id: 'TEST1234'
    }
  });
  
  console.log('SignUp Status:', signUpRes.status);
  console.log('SignUp Body:', signUpRes.body);
  
  if (signUpRes.status === 200 || signUpRes.status === 201) {
    console.log('\nSignUp succeeded! Now testing SignIn...');
    const signInRes = await post('/auth/v1/token?grant_type=password', {
      email,
      password
    });
    console.log('SignIn Status:', signInRes.status);
    console.log('SignIn Body:', signInRes.body);
  }
})();
