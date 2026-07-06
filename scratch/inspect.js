async function run() {
  const url = 'https://sbxrnpwxtitnmvrdmcxr.supabase.co/rest/v1/books?limit=1';
  const headers = {
    'apikey': 'sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz',
    'Authorization': 'Bearer sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz'
  };
  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log('Books Row data:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error fetching:', e);
  }
}
run();
