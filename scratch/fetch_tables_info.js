const https = require('https');

const tables = [
  'books',
  'library_users',
  'student_credentials',
  'loans',
  'reservations',
  'categories'
];

function fetchTableInfo(table) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'sbxrnpwxtitnmvrdmcxr.supabase.co',
      path: `/rest/v1/${table}?limit=1`,
      method: 'GET',
      headers: {
        'apikey': 'sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz',
        'Authorization': 'Bearer sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz',
        'Prefer': 'count=exact'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({
          table,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', (err) => resolve({ table, error: err }));
    req.end();
  });
}

(async () => {
  for (const table of tables) {
    const result = await fetchTableInfo(table);
    console.log(`\n================ ${table} (Status: ${result.status}) ================`);
    if (result.status === 200 || result.status === 206) {
      try {
        const rows = JSON.parse(result.body);
        if (rows.length > 0) {
          console.log('Sample Row keys & values:');
          Object.keys(rows[0]).forEach(key => {
            console.log(`  - ${key}: ${typeof rows[0][key]} (e.g. ${rows[0][key]})`);
          });
        } else {
          console.log('No rows returned. Checking if we can fetch columns from header (Content-Range):', result.headers['content-range']);
          // Since it's empty, we can still see columns by requesting options if supported, or just print empty array
          console.log('Row is empty array:', result.body);
        }
      } catch (e) {
        console.error('Error parsing response body:', e);
      }
    } else {
      console.log('Error body:', result.body);
    }
  }
})();
