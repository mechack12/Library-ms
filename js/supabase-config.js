// Supabase Configuration for Scholarly Archive Library Hub
// Include this file in your HTML pages using: <script src="../supabase-config.js"></script>

// Ensure you include the Supabase CDN script in your HTML BEFORE this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://sbxrnpwxtitnmvrdmcxr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz';

// Initialize the Supabase client using a distinct variable
window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized!');
