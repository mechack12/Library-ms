const https = require('https');

function query(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'sbxrnpwxtitnmvrdmcxr.supabase.co',
      path: path,
      method: 'GET',
      headers: {
        'apikey': 'sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz',
        'Authorization': 'Bearer sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const r = await query('/rest/v1/categories?select=*');
    if (r.status === 200) {
      const cats = JSON.parse(r.body);
      console.log('--- ALL CATEGORIES ---');
      cats.forEach((c, idx) => {
        console.log(`${idx + 1}. Name: ${c.name} | Description: ${c.description || 'N/A'}`);
      });
      console.log('---------------------------');
      console.log(`Total: ${cats.length} categories.`);
    } else {
      console.log('Categories table check status:', r.status, 'Body:', r.body);
    }
  } catch (err) {
    console.error('Error:', err);
  }
})();
