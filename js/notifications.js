// js/notifications.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared Notification Engine for Scholarly Archive Library Hub
//
// Generates real, meaningful notifications from existing Supabase tables:
//   • Overdue loans      → 🔴  critical
//   • Due soon (≤3 days) → 🟡  warning
//   • Pending reserves   → 📚  info
//   • Librarians also see all-user overdue totals
//
// Usage: call  initNotifications()  after nav.js has finished loading.
// ─────────────────────────────────────────────────────────────────────────────

(function () {

  /* ── Styles injected once ─────────────────────────────────────────────── */
  const CSS = `
  #notif-btn { position: relative; }
  #notif-count {
    position: absolute;
    top: 4px; right: 4px;
    min-width: 18px; height: 18px;
    padding: 0 4px;
    background: #DC2626;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    line-height: 1;
    border: 2px solid transparent;
    box-shadow: 0 1px 4px rgba(0,0,0,.25);
  }

  #notif-panel {
    position: fixed;
    top: 68px; right: 20px;
    width: 360px;
    max-height: 520px;
    background: #fff;
    border: 1px solid rgba(148,163,184,.2);
    border-radius: 16px;
    box-shadow: 0 24px 60px rgba(15,23,42,.12), 0 4px 16px rgba(15,23,42,.06);
    overflow: hidden;
    z-index: 9999;
    display: none;
    flex-direction: column;
    font-family: 'Source Sans 3', sans-serif;
    animation: notifSlideIn .18s ease;
  }
  #notif-panel.open { display: flex; }

  @keyframes notifSlideIn {
    from { opacity:0; transform: translateY(-8px) scale(.97); }
    to   { opacity:1; transform: translateY(0)     scale(1);   }
  }

  #notif-header {
    padding: 16px 20px 12px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid rgba(148,163,184,.12);
    background: #F8FAFC;
    flex-shrink: 0;
  }
  #notif-header h3 {
    font-family: 'Roboto Flex', sans-serif;
    font-size: 16px; font-weight: 700;
    color: #0F172A; margin: 0;
    display: flex; align-items: center; gap: 8px;
  }
  #notif-header button {
    background: none; border: none;
    cursor: pointer;
    color: #94A3B8;
    font-size: 20px; padding: 2px;
    border-radius: 6px;
    transition: background .15s;
    display: flex; align-items: center;
  }
  #notif-header button:hover { background: rgba(148,163,184,.12); }

  #notif-tabs {
    display: flex;
    border-bottom: 1px solid rgba(148,163,184,.10);
    background: #F8FAFC;
    flex-shrink: 0;
  }
  .notif-tab {
    flex: 1; padding: 8px 4px;
    text-align: center;
    font-size: 12px; font-weight: 600; color: #64748B;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all .15s;
    background: none; border-left: none; border-right: none; border-top: none;
  }
  .notif-tab:hover { color: #0F172A; }
  .notif-tab.active { color: #2563EB; border-bottom-color: #2563EB; }

  #notif-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
  }
  #notif-list::-webkit-scrollbar { width: 4px; }
  #notif-list::-webkit-scrollbar-track { background: transparent; }
  #notif-list::-webkit-scrollbar-thumb { background: rgba(148,163,184,.2); border-radius: 4px; }

  .notif-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 20px;
    cursor: default;
    border-bottom: 1px solid rgba(148,163,184,.07);
    transition: background .12s;
  }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: rgba(148,163,184,.05); }
  .notif-item.unread { background: rgba(37,99,235,.04); }

  .notif-icon {
    width: 36px; height: 36px; border-radius: 50%;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .notif-icon.critical { background: rgba(220,38,38,.1); color: #DC2626; }
  .notif-icon.warning  { background: rgba(100,116,139,.12); color: #64748B; }
  .notif-icon.info     { background: rgba(37,99,235,.1); color: #2563EB; }
  .notif-icon.success  { background: rgba(71,85,105,.12); color: #475569; }

  .notif-body { flex: 1; min-width: 0; }
  .notif-title {
    font-size: 13px; font-weight: 600; color: #0F172A;
    line-height: 1.3; margin-bottom: 2px;
  }
  .notif-desc {
    font-size: 12px; color: #64748B; line-height: 1.4;
  }
  .notif-time {
    font-size: 10px; color: rgba(148,163,184,.7);
    margin-top: 4px;
  }
  .notif-action {
    display: inline-block; margin-top: 6px;
    font-size: 11px; font-weight: 600; color: #2563EB;
    text-decoration: none;
    padding: 2px 8px; border-radius: 4px;
    border: 1px solid rgba(37,99,235,.3);
    transition: all .12s;
  }
  .notif-action:hover { background: rgba(37,99,235,.1); }

  .notif-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 48px 20px;
    color: #64748B; font-size: 13px;
  }
  .notif-empty .material-symbols-outlined {
    font-size: 40px; margin-bottom: 10px;
    color: rgba(148,163,184,.4);
  }

  #notif-footer {
    padding: 10px 20px;
    border-top: 1px solid rgba(148,163,184,.10);
    display: flex; justify-content: flex-end; gap: 8px;
    background: #F8FAFC;
    flex-shrink: 0;
  }
  #notif-footer button {
    font-size: 12px; font-weight: 600;
    padding: 5px 12px; border-radius: 8px;
    cursor: pointer; border: none; transition: all .15s;
  }
  #btn-mark-all-read {
    background: rgba(37,99,235,.1); color: #2563EB;
  }
  #btn-mark-all-read:hover { background: rgba(37,99,235,.2); }
  `;

  function injectStyles() {
    if (document.getElementById('notif-styles')) return;
    const s = document.createElement('style');
    s.id = 'notif-styles';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── In-memory state ─────────────────────────────────────────────────── */
  let allNotifications = [];   // { id, type, icon, title, desc, link, linkLabel, time, read }
  let currentFilter = 'all';  // 'all' | 'unread'
  let panelOpen = false;

  /* ── Notification builders ───────────────────────────────────────────── */
  function makeNotif(type, icon, title, desc, link, linkLabel, timeMs) {
    return {
      id: Math.random().toString(36).slice(2),
      type, icon, title, desc,
      link: link || null,
      linkLabel: linkLabel || 'View',
      time: timeMs || Date.now(),
      read: false,
    };
  }

  /* ── Relative time formatter ─────────────────────────────────────────── */
  function relTime(msOrStr) {
    try {
      const ms = typeof msOrStr === 'string' ? new Date(msOrStr).getTime() : msOrStr;
      const diff = Date.now() - ms;
      if (diff < 60000) return 'just now';
      if (diff < 3600000) return `${Math.round(diff/60000)}m ago`;
      if (diff < 86400000) return `${Math.round(diff/3600000)}h ago`;
      return `${Math.round(diff/86400000)}d ago`;
    } catch {
      return '';
    }
  }

  /* ── Fetch notifications from Supabase ──────────────────────────────── */
  // Helper for handling query timeouts
  async function withTimeout(promise, ms = 3000, defaultValue = { data: null, error: new Error('Timeout') }) {
    let timeoutId;
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve(defaultValue), ms);
    });
    return Promise.race([promise, timeoutPromise]).then((res) => {
      clearTimeout(timeoutId);
      return res;
    });
  }

  /* ── Fetch notifications from Supabase ──────────────────────────────── */
  async function fetchNotifications(role, userId) {
    const notifs = [];
    const now = new Date();
    const soon = new Date(now.getTime() + 3 * 86400000); // 3 days

    try {
      if (role === 'student' || role !== 'librarian') {
        // Fetch active loans and reservations in parallel
        const [loansRes, reservesRes] = await Promise.all([
          withTimeout(
            window.sbClient
              .from('loans')
              .select('id, due_date, created_at, books(title)')
              .eq('user_id', userId)
              .eq('status', 'active'),
            3000,
            { data: [], error: null }
          ),
          withTimeout(
            window.sbClient
              .from('reservations')
              .select('id, created_at, books(title)')
              .eq('user_id', userId)
              .eq('status', 'pending'),
            3000,
            { data: [], error: null }
          )
        ]);

        const loans = loansRes.data || [];
        const reserves = reservesRes.data || [];

        loans.forEach(loan => {
          const due = new Date(loan.due_date);
          const title = loan.books?.title || 'a book';
          if (due < now) {
            const daysOverdue = Math.ceil((now - due) / 86400000);
            notifs.push(makeNotif(
              'critical', 'warning',
              `Overdue: "${title}"`,
              `This book is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue. Please return it to avoid penalties.`,
              'overdue.html', 'View Overdue',
              due.getTime()
            ));
          } else if (due <= soon) {
            const daysLeft = Math.ceil((due - now) / 86400000);
            notifs.push(makeNotif(
              'warning', 'schedule',
              `Due soon: "${title}"`,
              `Return by ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${daysLeft === 1 ? 'tomorrow!' : `in ${daysLeft} days`}`,
              'transactions.html', 'View Loans',
              loan.created_at
            ));
          }
        });

        if (reserves && reserves.length > 0) {
          const bookNames = reserves.slice(0, 2).map(r => `"${r.books?.title || 'Book'}"`).join(', ');
          const extra = reserves.length > 2 ? ` +${reserves.length - 2} more` : '';
          notifs.push(makeNotif(
              'info', 'bookmark',
              `${reserves.length} Pending Reservation${reserves.length > 1 ? 's' : ''}`,
              `${bookNames}${extra} — you'll be notified when available.`,
              'reservations.html', 'View Reservations',
              Date.now() - 60000
          ));
        }
      }

      if (role === 'librarian') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
        const [overdueRes, dueSoonRes, reserveRes, newStudentsRes] = await Promise.all([
          withTimeout(
            window.sbClient
              .from('loans')
              .select('id, due_date, user_id, books(title), library_users(full_name)')
              .eq('status', 'active')
              .lt('due_date', now.toISOString())
              .order('due_date', { ascending: true })
              .limit(20),
            3000,
            { data: [], error: null }
          ),
          withTimeout(
            window.sbClient
              .from('loans')
              .select('id, due_date, books(title), library_users(full_name)')
              .eq('status', 'active')
              .gte('due_date', now.toISOString())
              .lte('due_date', soon.toISOString())
              .limit(10),
            3000,
            { data: [], error: null }
          ),
          withTimeout(
            window.sbClient
              .from('reservations')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'pending'),
            3000,
            { count: 0, error: null }
          ),
          withTimeout(
            window.sbClient
              .from('library_users')
              .select('id, full_name, created_at')
              .eq('role', 'student')
              .gte('created_at', weekAgo)
              .order('created_at', { ascending: false }),
            3000,
            { data: [], error: null }
          )
        ]);

        const overdueLoans = overdueRes.data || [];
        const dueSoon = dueSoonRes.data || [];
        const reserveCount = reserveRes.count || 0;
        const newStudents = newStudentsRes.data || [];

        if (overdueLoans && overdueLoans.length > 0) {
          notifs.push(makeNotif(
            'critical', 'warning',
            `${overdueLoans.length} Overdue Loan${overdueLoans.length > 1 ? 's' : ''} System-Wide`,
            `${overdueLoans.slice(0, 2).map(l => `${l.library_users?.full_name || 'Student'}: "${l.books?.title || 'Book'}"`).join(' | ')}${overdueLoans.length > 2 ? ` +${overdueLoans.length - 2} more` : ''}`,
            'overdue.html', 'Review Overdue',
            Date.now()
          ));
        }

        if (dueSoon && dueSoon.length > 0) {
          notifs.push(makeNotif(
            'warning', 'schedule',
            `${dueSoon.length} Loan${dueSoon.length > 1 ? 's' : ''} Due in 3 Days`,
            dueSoon.slice(0, 2).map(l => `${l.library_users?.full_name || 'Student'}: "${l.books?.title || 'Book'}"`).join(' | ') + (dueSoon.length > 2 ? ` +${dueSoon.length - 2} more` : ''),
            'overdue.html', 'View Loans',
            Date.now() - 120000
          ));
        }

        if (reserveCount > 0) {
          notifs.push(makeNotif(
            'info', 'bookmark',
            `${reserveCount} Pending Reservation${reserveCount > 1 ? 's' : ''}`,
            `Students are waiting for books to become available.`,
            'reservations.html', 'View Reservations',
            Date.now() - 300000
          ));
        }

        if (newStudents && newStudents.length > 0) {
          const names = newStudents.slice(0, 2).map(s => s.full_name || 'Student').join(', ');
          notifs.push(makeNotif(
            'success', 'person_add',
            `${newStudents.length} New Student${newStudents.length > 1 ? 's' : ''} This Week`,
            `${names}${newStudents.length > 2 ? ` +${newStudents.length - 2} more` : ''} registered recently.`,
            'students.html', 'View Students',
            new Date(newStudents[0].created_at).getTime()
          ));
        }
      }

    } catch (err) {
      console.warn('notifications.js fetch error:', err.message);
    }

    // Sort: critical first, then by time descending
    const order = { critical: 0, warning: 1, info: 2, success: 3 };
    notifs.sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9) || b.time - a.time);
    return notifs;
  }

  /* ── Render panel contents ───────────────────────────────────────────── */
  function renderPanel() {
    const list = document.getElementById('notif-list');
    if (!list) return;

    const visible = currentFilter === 'unread'
      ? allNotifications.filter(n => !n.read)
      : allNotifications;

    if (visible.length === 0) {
      list.innerHTML = `
        <div class="notif-empty">
          <span class="material-symbols-outlined">notifications_active</span>
          <p>${currentFilter === 'unread' ? 'No unread notifications' : 'All caught up! No notifications.'}</p>
        </div>`;
      return;
    }

    list.innerHTML = visible.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
        <div class="notif-icon ${n.type}">
          <span class="material-symbols-outlined">${n.icon}</span>
        </div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-desc">${n.desc}</div>
          ${n.link ? `<a class="notif-action" href="${n.link}">${n.linkLabel}</a>` : ''}
          <div class="notif-time">${relTime(n.time)}</div>
        </div>
      </div>`).join('');

    // Mark as read when panel is open
    list.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.notifId;
        const n = allNotifications.find(x => x.id === id);
        if (n) n.read = true;
        el.classList.remove('unread');
        updateBadge();
      });
    });
  }

  /* ── Update the bell badge count ─────────────────────────────────────── */
  function updateBadge() {
    const unread = allNotifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-count');
    if (!badge) return;
    if (unread > 0) {
      badge.textContent = unread > 99 ? '99+' : unread;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }

    // Also update tab counts
    const allTab = document.querySelector('.notif-tab[data-filter="all"]');
    const unreadTab = document.querySelector('.notif-tab[data-filter="unread"]');
    if (allTab) allTab.textContent = `All (${allNotifications.length})`;
    if (unreadTab) unreadTab.textContent = `Unread (${unread})`;
  }

  /* ── Build & inject the notification button + panel ─────────────────── */
  function buildUI(bellBtn) {
    // Wrap existing button
    bellBtn.id = 'notif-btn';
    bellBtn.setAttribute('aria-label', 'Notifications');
    bellBtn.setAttribute('title', 'Notifications');

    // Badge
    const badge = document.createElement('span');
    badge.id = 'notif-count';
    badge.style.display = 'none';
    badge.textContent = '0';
    bellBtn.appendChild(badge);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.innerHTML = `
      <div id="notif-header">
        <h3>
          <span class="material-symbols-outlined" style="font-size:20px;color:#2563EB">notifications</span>
          Notifications
        </h3>
        <button id="notif-close" title="Close">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div id="notif-tabs">
        <button class="notif-tab active" data-filter="all">All (0)</button>
        <button class="notif-tab" data-filter="unread">Unread (0)</button>
      </div>
      <div id="notif-list">
        <div class="notif-empty">
          <span class="material-symbols-outlined">sync</span>
          <p>Loading…</p>
        </div>
      </div>
      <div id="notif-footer">
        <button id="btn-mark-all-read">Mark all as read</button>
      </div>`;
    document.body.appendChild(panel);

    // Toggle panel
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.classList.toggle('open', panelOpen);
    });

    // Close button
    document.getElementById('notif-close').addEventListener('click', () => {
      panelOpen = false;
      panel.classList.remove('open');
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (panelOpen && !panel.contains(e.target) && e.target !== bellBtn) {
        panelOpen = false;
        panel.classList.remove('open');
      }
    });

    // Tabs
    panel.querySelectorAll('.notif-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentFilter = tab.dataset.filter;
        panel.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderPanel();
      });
    });

    // Mark all read
    document.getElementById('btn-mark-all-read').addEventListener('click', () => {
      allNotifications.forEach(n => n.read = true);
      renderPanel();
      updateBadge();
    });
  }

  /* ── Main entry point ────────────────────────────────────────────────── */
  async function initNotifications() {
    if (!window.sbClient) return;

    const { data: { session } } = await window.sbClient.auth.getSession();
    if (!session) return;

    // Use cached metadata role to render instantly
    let role = session.user.user_metadata?.role || 'student';

    injectStyles();

    // Find the notifications bell button
    const bellBtn = findBellButton();
    if (!bellBtn) return;

    buildUI(bellBtn);

    // Fetch and render in background
    _backgroundLoadNotifications(session, role);
  }

  async function _backgroundLoadNotifications(session, initialRole) {
    let role = initialRole;
    try {
      const profilePromise = withTimeout(
        window.sbClient
          .from('library_users')
          .select('role')
          .eq('id', session.user.id)
          .single(),
        3000,
        { data: null, error: null }
      );

      allNotifications = await fetchNotifications(role, session.user.id);
      renderPanel();
      updateBadge();

      // Background check for database role changes
      const { data: profile } = await profilePromise;
      if (profile && profile.role && profile.role !== role) {
        role = profile.role;
        allNotifications = await fetchNotifications(role, session.user.id);
        renderPanel();
        updateBadge();
      }

      // Auto-refresh every 2 minutes
      setInterval(async () => {
        allNotifications = await fetchNotifications(role, session.user.id);
        renderPanel();
        updateBadge();
      }, 120000);
    } catch (e) {
      console.warn('notifications.js background load error:', e);
    }
  }

  /* ── Find the notifications bell button in the page ─────────────────── */
  function findBellButton() {
    // Look for button containing the text "notifications"
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.querySelector('span.material-symbols-outlined')?.textContent?.trim() === 'notifications') {
        return btn;
      }
    }
    return null;
  }

  // Expose globally
  window.initNotifications = initNotifications;

})();
