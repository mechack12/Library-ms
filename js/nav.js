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
    } else {
      // Show initials fallback if no image is set and we're not on profile.html
      const isProfilePage = window.location.pathname.split('/').pop() === 'profile.html';
      if (!isProfilePage && parentContainer && parentContainer.classList.contains('rounded-full')) {
        const initials = fullName.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
        parentContainer.innerHTML = `<span id="user-avatar" class="text-deep-pine font-bold text-xs select-none w-full h-full flex items-center justify-center bg-sage-green/35">${initials}</span>`;
      }
    }
  }

  // ── 8. Badge counts ───────────────────────────────────────────────────────
  await _navFetchBadges(role, session.user.id);
}

async function _navFetchBadges(role, userId) {
  try {
    // Overdue badge
    let overdueQ = window.sbClient
      .from('loans')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .lt('due_date', new Date().toISOString());
    if (role !== 'librarian') overdueQ = overdueQ.eq('user_id', userId);
    const { count: overdueCount } = await overdueQ;
    if (overdueCount > 0) {
      document.getElementById('nav-overdue-badge')?.classList.remove('hidden');
    }

    // Reservations badge
    let resQ = window.sbClient
      .from('reservations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (role !== 'librarian') resQ = resQ.eq('user_id', userId);
    const { count: resCount } = await resQ;
    if (resCount > 0) {
      document.getElementById('nav-reservations-badge')?.classList.remove('hidden');
    }
  } catch (e) {
    console.error('nav.js badge fetch error:', e);
  }
}

// Expose globally so all pages can call: initNav()
window.initNav = initNav;
