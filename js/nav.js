// js/nav.js
/*
  Shared Navigation Module
  - Fetches the user's ACTUAL role from the library_users table (not unreliable user_metadata)
  - Builds the side navigation dynamically (deep-pine dark theme matching the project)
  - Adjusts nav items based on role: students only see student items, librarians see all
  - Shows Settings and Logout at the bottom
  - Real-time badge counts for Overdue and Reservations
*/

async function initNav() {
  if (!window.sbClient) {
    console.error('nav.js: Supabase client (sbClient) not found');
    return;
  }

  // ── 1. Get session ────────────────────────────────────────────────────────
  const { data: { session } } = await window.sbClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // ── 2. Fetch ACTUAL role from library_users table ─────────────────────────
  //       user_metadata.role is only set at signup and can drift out of sync.
  //       library_users is the source of truth.
  let role = 'student';
  let fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';
  let avatarUrl = session.user.user_metadata?.profile_picture_url || null;

  try {
    const { data: profile } = await window.sbClient
      .from('library_users')
      .select('role, full_name, profile_picture_url')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      role      = profile.role                || role;
      fullName  = profile.full_name           || fullName;
      avatarUrl = profile.profile_picture_url || avatarUrl;
    }
  } catch (e) {
    // Graceful fallback – use user_metadata role if DB query fails
    role = session.user.user_metadata?.role || 'student';
    console.warn('nav.js: library_users lookup failed, falling back to user_metadata role:', role);
  }

  // ── 3. Protect librarian-only pages ───────────────────────────────────────
  const currentPage = window.location.pathname.split('/').pop() || '';
  const librarianOnlyPages = ['librarian-dashboard.html', 'students.html', 'categories.html', 'reports.html'];
  if (role !== 'librarian' && librarianOnlyPages.includes(currentPage)) {
    window.location.href = 'student-dashboard.html';
    return;
  }

  // ── 4. Build sidebar ──────────────────────────────────────────────────────
  const sidebar = document.getElementById('app-sidebar');
  if (!sidebar) {
    console.warn('nav.js: No <aside id="app-sidebar"> placeholder found — skipping injection');
    return;
  }

  const dashboardHref = role === 'librarian' ? 'librarian-dashboard.html' : 'student-dashboard.html';

  const allItems = [
    { id: 'nav-dashboard',    label: 'Dashboard',    icon: 'dashboard',   href: dashboardHref },
    { id: 'nav-inventory',    label: 'Inventory',    icon: 'menu_book',   href: 'catalog.html' },
    { id: 'nav-transactions', label: 'Transactions', icon: 'swap_horiz',  href: 'transactions.html' },
    { id: 'nav-reservations', label: 'Reservations', icon: 'bookmark',    href: 'reservations.html', badge: true },
    { id: 'nav-overdue',      label: 'Overdue',      icon: 'schedule',    href: 'overdue.html',      badge: true },
    // ↓ Librarian-only
    { id: 'nav-students',     label: 'Students',     icon: 'group',       href: 'students.html',    librarianOnly: true },
    { id: 'nav-categories',   label: 'Categories',   icon: 'category',    href: 'categories.html',  librarianOnly: true },
    { id: 'nav-reports',      label: 'Reports',      icon: 'assessment',  href: 'reports.html',     librarianOnly: true },
  ];

  const visibleItems = allItems.filter(item => !item.librarianOnly || role === 'librarian');

  function isItemActive(item) {
    if (item.id === 'nav-dashboard') {
      return currentPage === 'librarian-dashboard.html' || currentPage === 'student-dashboard.html';
    }
    return item.href === currentPage;
  }

  // Avatar: show image if available, otherwise show initials
  const initials = fullName.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarHtml = avatarUrl
    ? `<img id="nav-user-avatar" src="${avatarUrl}" alt="Avatar" class="w-full h-full object-cover" />`
    : `<span class="text-sage-green font-bold text-sm select-none">${initials}</span>`;

  const navItemsHtml = visibleItems.map(item => {
    const active = isItemActive(item);
    const cls = active
      ? 'bg-sage-green text-deep-pine font-semibold'
      : 'text-soft-parchment/80 hover:bg-white/10 hover:text-soft-parchment';
    return `
      <a id="${item.id}" href="${item.href}"
         class="relative px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-150 ${cls}">
        <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
        <span class="font-label-md text-label-md">${item.label}</span>
        ${item.badge ? `<span id="${item.id}-badge" class="hidden absolute top-2 right-3 w-2 h-2 bg-error rounded-full"></span>` : ''}
      </a>`;
  }).join('');

  const settingsActive = currentPage === 'settings.html';
  const settingsCls = settingsActive
    ? 'bg-sage-green text-deep-pine font-semibold'
    : 'text-soft-parchment/80 hover:bg-white/10 hover:text-soft-parchment';

  const profileActive = currentPage === 'profile.html';
  const profileCls = profileActive
    ? 'bg-sage-green text-deep-pine font-semibold'
    : 'text-soft-parchment/80 hover:bg-white/10 hover:text-soft-parchment';

  sidebar.innerHTML = `
  <aside class="bg-deep-pine h-screen w-64 fixed left-0 top-0 shadow-xl flex flex-col p-4 z-50 overflow-y-auto">

    <!-- Brand + Avatar -->
    <div class="mb-6">
      <a href="profile.html" class="flex items-center gap-3 mb-4 hover:opacity-90 transition-opacity cursor-pointer group">
        <div class="w-10 h-10 rounded-full bg-sage-green/20 border border-sage-green/40 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-sage-green transition-colors">
          ${avatarHtml}
        </div>
        <div class="min-w-0">
          <h1 class="font-bold text-soft-parchment text-sm leading-tight truncate group-hover:text-white transition-colors">Scholarly Archive</h1>
          <p class="text-sage-green text-xs mt-0.5">${role.charAt(0).toUpperCase() + role.slice(1)} Portal</p>
        </div>
      </a>

      <!-- Borrow/Return CTA -->
      <button id="nav-borrow-return"
        class="w-full bg-sage-green text-deep-pine font-semibold py-2 px-4 rounded-lg flex justify-center items-center gap-2 hover:bg-sage-green/90 transition-colors shadow-sm text-sm">
        <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
        Borrow / Return
      </button>
    </div>

    <!-- Main Navigation -->
    <nav class="flex-1 flex flex-col gap-1">
      ${navItemsHtml}
    </nav>

    <!-- Footer: Profile + Settings + Logout -->
    <div class="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1">
      <a id="nav-profile" href="profile.html"
         class="px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-150 ${profileCls}">
        <span class="material-symbols-outlined text-[20px]">manage_accounts</span>
        <span class="font-label-md text-label-md">My Profile</span>
      </a>
      <a id="nav-settings" href="settings.html"
         class="px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-150 ${settingsCls}">
        <span class="material-symbols-outlined text-[20px]">settings</span>
        <span class="font-label-md text-label-md">Settings</span>
      </a>
      <button id="nav-logout"
        class="px-4 py-3 rounded-lg flex items-center gap-3 text-soft-parchment/80 hover:bg-error/20 hover:text-error transition-all duration-150 w-full text-left">
        <span class="material-symbols-outlined text-[20px]">logout</span>
        <span class="font-label-md text-label-md">Logout</span>
      </button>
    </div>

  </aside>`;

  // ── 5. Wire up Logout ─────────────────────────────────────────────────────
  document.getElementById('nav-logout')?.addEventListener('click', async () => {
    await window.sbClient.auth.signOut();
    window.location.href = 'login.html';
  });

  // ── 6. Wire up Borrow/Return ──────────────────────────────────────────────
  document.getElementById('nav-borrow-return')?.addEventListener('click', () => {
    const modal = document.getElementById('borrow-return-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      window.location.href = 'transactions.html';
    }
  });

  // ── 7. Sync top-bar avatar if it exists on the page ──────────────────────
  const topAvatar = document.getElementById('user-avatar');
  if (topAvatar) {
    topAvatar.title = "View/Edit Profile";
    topAvatar.style.cursor = 'pointer';
    topAvatar.classList.add("hover:opacity-80", "transition-all", "duration-150");

    // Click handler to redirect to profile.html
    topAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = 'profile.html';
    });

    const parentContainer = topAvatar.parentElement;
    if (parentContainer && parentContainer.classList.contains('rounded-full')) {
      parentContainer.style.cursor = 'pointer';
      parentContainer.title = "View/Edit Profile";
      parentContainer.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
    }

    if (avatarUrl) {
      topAvatar.src = avatarUrl;
      topAvatar.classList.remove('hidden');
      const initialsSpan = document.getElementById('user-avatar-initials');
      if (initialsSpan) initialsSpan.classList.add('hidden');
    } else {
      // Show initials fallback
      const initialsSpan = document.getElementById('user-avatar-initials');
      if (initialsSpan) {
        const initials = fullName.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
        initialsSpan.textContent = initials;
      }
    }
  }

  // ── 8. Badge counts ───────────────────────────────────────────────────────
  await _navFetchBadges(role, session.user.id);
  
  // ── 9. Inject Header & Modals ─────────────────────────────────────────────
  injectHeaderAndModals(role);
}

function injectHeaderAndModals(role) {
  // Check if header placeholder exists (we'll just prepend it to the main content container if missing, 
  // but to be safe, we look for the main flex container next to sidebar)
  const mainContainer = document.querySelector('.flex-1.ml-64') || document.querySelector('.flex-1');
  if (!mainContainer) return;
  
  // Only inject if not already present
  if (document.getElementById('global-top-header')) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Build the Header
  const headerHtml = `
  <header id="global-top-header" class="border-b border-dusty-rose/20 bg-soft-parchment dark:bg-deep-pine/90 dark:border-white/10 flex justify-between items-center px-lg py-sm w-full z-20 shrink-0 transition-colors">
    <div class="flex items-center gap-lg">
      <span class="font-headline-lg text-headline-lg font-bold text-deep-pine dark:text-soft-parchment hidden md:block">LMS</span>
    </div>
    
    <!-- Middle: Search -->
    <div class="flex-1 max-w-md mx-lg hidden lg:block">
      <div class="relative flex items-center">
        <span class="material-symbols-outlined absolute left-3 text-deep-pine dark:text-soft-parchment/70">search</span>
        <input id="global-search" class="w-full bg-surface-container-low dark:bg-surface-dim/50 border border-dusty-rose/30 dark:border-white/20 rounded-lg py-2 pl-10 pr-4 font-body-sm text-deep-pine dark:text-soft-parchment focus:outline-none focus:border-sage-green focus:ring-1 focus:ring-sage-green transition-shadow placeholder:text-dusty-rose dark:placeholder:text-soft-parchment/50" placeholder="Search catalog, users, or ISBN..." type="text"/>
      </div>
    </div>
    
    <!-- Right Side: Actions -->
    <div class="flex items-center gap-md">
      ${role === 'librarian' ? `
      <button id="btn-action-hub" class="hidden lg:flex items-center gap-xs font-label-lg text-teal-blue dark:text-sage-green hover:opacity-80 transition-opacity">
        Action Hub
      </button>
      ` : ''}
      <div class="flex items-center gap-sm">
        <button id="btn-theme-toggle" class="p-2 text-deep-pine dark:text-soft-parchment hover:text-teal-blue dark:hover:text-sage-green transition-colors rounded-full hover:bg-dusty-rose/10 dark:hover:bg-white/10">
          <span class="material-symbols-outlined">${currentTheme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button class="p-2 text-deep-pine dark:text-soft-parchment hover:text-teal-blue dark:hover:text-sage-green transition-colors rounded-full hover:bg-dusty-rose/10 dark:hover:bg-white/10 relative">
          <span class="material-symbols-outlined">notifications</span>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button id="btn-global-help" class="p-2 text-deep-pine dark:text-soft-parchment hover:text-teal-blue dark:hover:text-sage-green transition-colors rounded-full hover:bg-dusty-rose/10 dark:hover:bg-white/10">
          <span class="material-symbols-outlined">help_outline</span>
        </button>
      </div>
      <div id="header-avatar-container" class="w-8 h-8 rounded-full bg-surface-dim overflow-hidden border border-dusty-rose/20 dark:border-white/20 cursor-pointer hover:opacity-80 transition-opacity" title="View Profile">
        <img id="user-avatar" alt="User Avatar" class="w-full h-full object-cover hidden" />
        <span id="user-avatar-initials" class="text-deep-pine font-bold text-xs select-none w-full h-full flex items-center justify-center bg-sage-green/35"></span>
      </div>
    </div>
  </header>
  `;

  // We find existing header and replace it, OR prepend if it doesn't exist
  const existingHeader = mainContainer.querySelector('header');
  if (existingHeader) {
    existingHeader.outerHTML = headerHtml;
  } else {
    mainContainer.insertAdjacentHTML('afterbegin', headerHtml);
  }

  // Modals HTML
  const modalsHtml = `
  <!-- Action Hub Modal -->
  <div id="action-hub-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] hidden items-center justify-center">
      <div class="bg-surface-container-lowest dark:bg-deep-pine rounded-xl shadow-2xl w-full max-w-sm mx-4 border border-dusty-rose/20 dark:border-white/10 overflow-hidden">
          <div class="bg-soft-parchment dark:bg-surface-dim p-md flex justify-between items-center border-b border-dusty-rose/20 dark:border-white/10">
              <h2 class="font-headline-md text-deep-pine dark:text-soft-parchment font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined">bolt</span> Quick Actions
              </h2>
              <button id="close-action-hub" class="text-dusty-rose dark:text-soft-parchment/60 hover:text-deep-pine dark:hover:text-white p-1 rounded-lg hover:bg-dusty-rose/10 transition-colors">
                  <span class="material-symbols-outlined">close</span>
              </button>
          </div>
          <div class="p-md flex flex-col gap-2">
              <a href="catalog.html?action=add-book" class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-deep-pine dark:text-soft-parchment font-label-md">
                  <span class="material-symbols-outlined text-teal-blue">library_add</span> Add New Book
              </a>
              <a href="students.html?action=add-student" class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-deep-pine dark:text-soft-parchment font-label-md">
                  <span class="material-symbols-outlined text-sage-green">person_add</span> Register Student
              </a>
              <a href="transactions.html" class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-deep-pine dark:text-soft-parchment font-label-md">
                  <span class="material-symbols-outlined text-dusty-rose">qr_code_scanner</span> Issue / Return Loan
              </a>
              <a href="reports.html" class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low dark:hover:bg-white/5 transition-colors text-deep-pine dark:text-soft-parchment font-label-md">
                  <span class="material-symbols-outlined text-deep-pine dark:text-soft-parchment">assessment</span> Generate Reports
              </a>
          </div>
      </div>
  </div>

  <!-- Help Modal -->
  <div id="help-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] hidden items-center justify-center">
      <div class="bg-surface-container-lowest dark:bg-deep-pine rounded-xl shadow-2xl w-full max-w-md mx-4 border border-dusty-rose/20 dark:border-white/10 overflow-hidden">
          <div class="bg-soft-parchment dark:bg-surface-dim p-md flex justify-between items-center border-b border-dusty-rose/20 dark:border-white/10">
              <h2 class="font-headline-md text-deep-pine dark:text-soft-parchment font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined">help</span> System Guide
              </h2>
              <button id="close-help-modal" class="text-dusty-rose dark:text-soft-parchment/60 hover:text-deep-pine dark:hover:text-white p-1 rounded-lg hover:bg-dusty-rose/10 transition-colors">
                  <span class="material-symbols-outlined">close</span>
              </button>
          </div>
          <div class="p-lg flex flex-col gap-4 text-deep-pine dark:text-soft-parchment/90 font-body-sm">
              <p>Welcome to the <strong>Scholarly Archive Library Management System</strong>.</p>
              <ul class="list-disc pl-5 space-y-2">
                  <li><strong>Dashboard:</strong> View key metrics, active loans, and overdue items.</li>
                  <li><strong>Catalog:</strong> Browse books, add new inventory, and manage copies.</li>
                  <li><strong>Transactions:</strong> Process borrows and returns seamlessly.</li>
                  <li><strong>Students:</strong> Manage patron accounts and issue library cards.</li>
              </ul>
              <p class="mt-2 text-xs text-dusty-rose dark:text-soft-parchment/60">If you experience issues, please contact the system administrator or raise an IT ticket.</p>
          </div>
      </div>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalsHtml);

  // Bind Theme Toggle
  document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('btn-theme-toggle').querySelector('span');
    if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
  });

  // Bind Action Hub
  const actionHubBtn = document.getElementById('btn-action-hub');
  const actionHubModal = document.getElementById('action-hub-modal');
  if (actionHubBtn && actionHubModal) {
    actionHubBtn.addEventListener('click', () => {
      actionHubModal.classList.remove('hidden');
      actionHubModal.classList.add('flex');
    });
    document.getElementById('close-action-hub')?.addEventListener('click', () => {
      actionHubModal.classList.add('hidden');
      actionHubModal.classList.remove('flex');
    });
  }

  // Bind Help Modal
  const helpBtn = document.getElementById('btn-global-help');
  const helpModal = document.getElementById('help-modal');
  if (helpBtn && helpModal) {
    helpBtn.addEventListener('click', () => {
      helpModal.classList.remove('hidden');
      helpModal.classList.add('flex');
    });
    document.getElementById('close-help-modal')?.addEventListener('click', () => {
      helpModal.classList.add('hidden');
      helpModal.classList.remove('flex');
    });
  }

  // Close modals on click outside
  document.addEventListener('click', (e) => {
    if (e.target.id === 'action-hub-modal') {
      actionHubModal.classList.add('hidden');
      actionHubModal.classList.remove('flex');
    }
    if (e.target.id === 'help-modal') {
      helpModal.classList.add('hidden');
      helpModal.classList.remove('flex');
    }
  });

  // Init Avatar using the already-fetched profile data in initNav (we must fetch it again or pass it)
  // Let's rely on the topAvatar sync that happens inside initNav, we just need to ensure the IDs match!

  // Global Search: redirect to catalog on Enter from any page
  const globalSearchInput = document.getElementById('global-search');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = globalSearchInput.value.trim();
        if (!query) return;
        // If we're already on the catalog page, just trigger the local filter
        if (window.location.pathname.includes('catalog.html')) {
          // The catalog page's own debounce listener will handle it,
          // but let's fire an input event to be sure
          globalSearchInput.dispatchEvent(new Event('input'));
          return;
        }
        // Redirect to catalog with ?q= parameter
        window.location.href = `catalog.html?q=${encodeURIComponent(query)}`;
      }
    });
  }
}

async function _navFetchBadges(role, userId) {
  try {
    const overdueBadge = document.getElementById('nav-overdue-badge');
    const reservationsBadge = document.getElementById('nav-reservations-badge');

    if (!overdueBadge && !reservationsBadge) return;

    const now = new Date().toISOString();

    if (role === 'librarian') {
      const { data: overdueLoans, error: overdueErr } = await window.sbClient
        .from('loans')
        .select('id')
        .eq('status', 'active')
        .lt('due_date', now)
        .limit(1);

      if (!overdueErr && overdueLoans && overdueLoans.length > 0) {
        overdueBadge?.classList.remove('hidden');
      } else {
        overdueBadge?.classList.add('hidden');
      }

      const { data: pendingRes, error: resErr } = await window.sbClient
        .from('reservations')
        .select('id')
        .eq('status', 'pending')
        .limit(1);

      if (!resErr && pendingRes && pendingRes.length > 0) {
        reservationsBadge?.classList.remove('hidden');
      } else {
        reservationsBadge?.classList.add('hidden');
      }
    } else {
      const { data: studentOverdue, error: overdueErr } = await window.sbClient
        .from('loans')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lt('due_date', now)
        .limit(1);

      if (!overdueErr && studentOverdue && studentOverdue.length > 0) {
        overdueBadge?.classList.remove('hidden');
      } else {
        overdueBadge?.classList.add('hidden');
      }

      const { data: studentRes, error: resErr } = await window.sbClient
        .from('reservations')
        .select('id')
        .eq('status', 'pending')
        .eq('user_id', userId)
        .limit(1);

      if (!resErr && studentRes && studentRes.length > 0) {
        reservationsBadge?.classList.remove('hidden');
      } else {
        reservationsBadge?.classList.add('hidden');
      }
    }
  } catch (err) {
    console.error('nav.js: Failed to fetch badge counts:', err);
  }
}

// Expose globally so all pages can call: initNav()
window.initNav = initNav;
