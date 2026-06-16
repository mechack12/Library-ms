// Supabase Configuration for Scholarly Archive Library Hub
// Include this file in your HTML pages using: <script src="../supabase-config.js"></script>

// Ensure you include the Supabase CDN script in your HTML BEFORE this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

const SUPABASE_URL = 'https://sbxrnpwxtitnmvrdmcxr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TbmHRbZbW0U-OV8fA2XW3g_0qIqwNSz';

// Initialize the Supabase client using a distinct variable
window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Client-side session override to bypass email verification for student usernames
const originalGetSession = window.sbClient.auth.getSession.bind(window.sbClient.auth);
window.sbClient.auth.getSession = async () => {
  const mockSessionStr = localStorage.getItem('sb-mock-session');
  if (mockSessionStr) {
    try {
      return { data: { session: JSON.parse(mockSessionStr) }, error: null };
    } catch (e) {
      localStorage.removeItem('sb-mock-session');
    }
  }
  return originalGetSession();
};

const originalGetUser = window.sbClient.auth.getUser.bind(window.sbClient.auth);
window.sbClient.auth.getUser = async (jwt) => {
  const mockSessionStr = localStorage.getItem('sb-mock-session');
  if (mockSessionStr) {
    try {
      return { data: { user: JSON.parse(mockSessionStr).user }, error: null };
    } catch (e) {
      localStorage.removeItem('sb-mock-session');
    }
  }
  return originalGetUser(jwt);
};

const originalSignOut = window.sbClient.auth.signOut.bind(window.sbClient.auth);
window.sbClient.auth.signOut = async () => {
  localStorage.removeItem('sb-mock-session');
  return originalSignOut();
};

console.log('Supabase client initialized!');
