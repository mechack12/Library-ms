const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  hostname: 'sbxrnpwxtitnmvrdmcxr.supabase.co',
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz',
    'Authorization': 'Bearer sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const schema = JSON.parse(data);
      console.log('JSON Keys:', Object.keys(schema));
      
      // Save it to a file so we can view/grep it
      fs.writeFileSync(path.join(__dirname, 'raw_schema.json'), JSON.stringify(schema, null, 2));
      console.log('Saved raw schema to scratch/raw_schema.json');
      
      if (schema.paths) {
        console.log('Paths found:', Object.keys(schema.paths));
      }
      
      if (schema.components && schema.components.schemas) {
        console.log('Schemas found in components:');
        Object.keys(schema.components.schemas).forEach(s => {
          console.log(`- ${s}`);
        });
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
});

req.on('error', console.error);
req.end();
