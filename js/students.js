let allStudents = [];

async function renderStudents(filter = '') {
    const list = document.getElementById('students-list');
    const filtered = filter
        ? allStudents.filter(s => (s.full_name || '').toLowerCase().includes(filter.toLowerCase()) || (s.library_id || '').toLowerCase().includes(filter.toLowerCase()))
        : allStudents;

    document.getElementById('student-count').textContent = `${filtered.length} student${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        list.innerHTML = '<div class="px-md py-10 text-center text-dusty-rose">No students found.</div>';
        return;
    }

    list.innerHTML = filtered.map(s => {
        const hasOverdue = s.activeLoans > 0 && s.overdueCount > 0;
        const statusBadge = hasOverdue
            ? '<span class="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">Overdue</span>'
            : s.activeLoans > 0
            ? '<span class="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">Active</span>'
            : '<span class="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">No Loans</span>';

        const initials = (s.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return `<div onclick="viewStudentDetails('${s.id}')" class="grid grid-cols-7 px-md py-3 items-center text-sm hover:bg-surface-container-low cursor-pointer transition-colors ${hasOverdue ? 'bg-red-50/30' : ''}">
            <div class="col-span-2 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-deep-pine text-soft-parchment flex items-center justify-center text-xs font-bold flex-shrink-0">${initials}</div>
                <div>
                    <p class="font-medium text-deep-pine">${s.full_name || 'Unknown'}</p>
                    <p class="text-dusty-rose text-xs">${s.id?.slice(0, 8)}...</p>
                </div>
            </div>
            <span class="text-dusty-rose text-xs font-mono">${s.library_id || '—'}</span>
            <span class="text-center font-semibold ${s.activeLoans > 0 ? 'text-teal-blue' : 'text-dusty-rose/50'}">${s.activeLoans || 0}</span>
            <span class="text-center font-semibold ${s.reservationCount > 0 ? 'text-sage-green' : 'text-dusty-rose/50'}">${s.reservationCount || 0}</span>
            <div class="text-center">${statusBadge}</div>
            <div class="flex items-center justify-end gap-2 text-right">
                <button onclick="event.stopPropagation(); openEditStudentModal('${s.id}')" class="p-1 rounded-md text-teal-blue hover:bg-teal-blue/10 transition-colors" title="Edit Student"><span class="material-symbols-outlined text-[18px]">edit</span></button>
                <button onclick="event.stopPropagation(); suspendStudent('${s.id}', '${(s.full_name || '').replace(/'/g, "\\'")}')" class="p-1 rounded-md text-error hover:bg-error/10 transition-colors" title="Suspend Student"><span class="material-symbols-outlined text-[18px]">person_off</span></button>
            </div>
        </div>`;
    }).join('');
}

async function init() {
    await window.initNav();
    await window.initNotifications();
    const { data: { session } } = await window.sbClient.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return; }

    const avatarUrl = session.user.user_metadata?.profile_picture_url;
    if (avatarUrl) document.getElementById('user-avatar').src = avatarUrl;

    // Check librarian
    const { data: profile } = await window.sbClient.from('library_users').select('role').eq('id', session.user.id).single();
    if (profile?.role !== 'librarian') { window.location.href = 'student-dashboard.html'; return; }

    // Fetch all students
    const { data: students, error } = await window.sbClient.from('library_users').select('*').eq('role', 'student').order('full_name');
    if (error) { document.getElementById('students-list').innerHTML = `<div class="px-md py-8 text-center text-error">Error: ${error.message}</div>`; return; }

    // Fetch aggregates: active loans + reservations per user
    const [{ data: loans }, { data: reservations }] = await Promise.all([
        window.sbClient.from('loans').select('user_id, status, due_date').eq('status', 'active'),
        window.sbClient.from('reservations').select('user_id, status').eq('status', 'pending')
    ]);

    const now = new Date();
    const loanMap = {};
    const overdueMap = {};
    (loans || []).forEach(l => {
        loanMap[l.user_id] = (loanMap[l.user_id] || 0) + 1;
        if (new Date(l.due_date) < now) overdueMap[l.user_id] = (overdueMap[l.user_id] || 0) + 1;
    });
    const reservationMap = {};
    (reservations || []).forEach(r => { reservationMap[r.user_id] = (reservationMap[r.user_id] || 0) + 1; });

    allStudents = students.map(s => ({
        ...s,
        activeLoans: loanMap[s.id] || 0,
        overdueCount: overdueMap[s.id] || 0,
        reservationCount: reservationMap[s.id] || 0,
    }));

    const totalLoans = Object.values(loanMap).reduce((a, b) => a + b, 0);
    const totalOverdue = Object.values(overdueMap).reduce((a, b) => a + b, 0);
    const totalReservations = Object.values(reservationMap).reduce((a, b) => a + b, 0);

    document.getElementById('stats-row').innerHTML = `
        <div class="bg-white border border-dusty-rose/20 rounded-xl p-md text-center"><p class="text-3xl font-bold text-deep-pine">${students.length}</p><p class="font-body-sm text-dusty-rose mt-1">Total Students</p></div>
        <div class="bg-white border border-dusty-rose/20 rounded-xl p-md text-center"><p class="text-3xl font-bold text-teal-blue">${totalLoans}</p><p class="font-body-sm text-dusty-rose mt-1">Active Loans</p></div>
        <div class="bg-white border border-dusty-rose/20 rounded-xl p-md text-center"><p class="text-3xl font-bold text-error">${totalOverdue}</p><p class="font-body-sm text-dusty-rose mt-1">Overdue Books</p></div>
        <div class="bg-white border border-dusty-rose/20 rounded-xl p-md text-center"><p class="text-3xl font-bold text-sage-green">${totalReservations}</p><p class="font-body-sm text-dusty-rose mt-1">Pending Reservations</p></div>`;

    renderStudents();

    let searchTimeout;
    document.getElementById('student-search').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => renderStudents(e.target.value), 300);
    });
}

// Student Detail Modal state
let currentSelectedStudent = null;
let currentStudentLoans = [];
let currentStudentReservations = [];

function openReportModal() {
    const modal = document.getElementById('report-generator-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeReportModal() {
    const modal = document.getElementById('report-generator-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Add Student Modal functions
function openAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}
function closeAddStudentModal() {
    const modal = document.getElementById('add-student-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('add-student-form').reset();
}

async function submitAddStudent() {
    const fullName = document.getElementById('add-full-name').value.trim();
    const userIdInput = document.getElementById('add-user-id').value.trim();
    const password = document.getElementById('add-password').value;
    const libId = document.getElementById('add-library-id').value.trim();
    const btn = document.getElementById('btn-create-student');
    const statusMsg = document.getElementById('add-status-msg');
    
    if (!fullName || !userIdInput || !password) return;
    
    let authIdentifier = userIdInput;
    if (!userIdInput.includes('@')) {
        authIdentifier = `${userIdInput}@student.scholarly.local`;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> Creating...';
    statusMsg.classList.add('hidden');
    
    try {
        // Create a temporary client that DOES NOT persist session 
        // This prevents the librarian from being logged out when creating another user
        const tempClient = window.supabase.createClient(
            SUPABASE_URL, 
            SUPABASE_ANON_KEY, 
            { auth: { persistSession: false, autoRefreshToken: false } }
        );

        const { data, error } = await tempClient.auth.signUp({
            email: authIdentifier,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    role: 'student',
                    library_id: libId
                }
            }
        });
        
        if (error) throw error;
        
        statusMsg.textContent = 'Student created successfully!';
        statusMsg.className = 'mb-2 p-sm rounded-lg font-body-sm text-body-sm text-center bg-green-100 text-green-800';
        statusMsg.classList.remove('hidden');
        
        // The newly created user is in data.user, but we should fetch them properly to get the DB record
        // Give the database trigger a moment to insert into library_users
        setTimeout(async () => {
            const { data: newStudent } = await window.sbClient.from('library_users').select('*').eq('id', data.user.id).single();
            if (newStudent) {
                allStudents.push({
                    ...newStudent,
                    activeLoans: 0,
                    overdueCount: 0,
                    reservationCount: 0
                });
                document.getElementById('student-count').textContent = `${allStudents.length} student${allStudents.length !== 1 ? 's' : ''}`;
                renderStudents(document.getElementById('student-search').value);
            }
            setTimeout(() => {
                closeAddStudentModal();
            }, 1000);
        }, 500);
        
    } catch (err) {
        console.error(err);
        statusMsg.textContent = 'Error creating student: ' + err.message;
        statusMsg.className = 'mb-2 p-sm rounded-lg font-body-sm text-body-sm text-center bg-error-container text-on-error-container';
        statusMsg.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Create Student';
    }
}

// Edit Student Modal functions
function openEditStudentModal(id) {
    const student = allStudents.find(s => s.id === id);
    if (!student) return;
    
    document.getElementById('edit-student-id').value = student.id;
    document.getElementById('edit-full-name').value = student.full_name || '';
    document.getElementById('edit-library-id').value = student.library_id || '';
    
    const statusMsg = document.getElementById('edit-status-msg');
    statusMsg.classList.add('hidden');
    
    const modal = document.getElementById('edit-student-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}
function closeEditStudentModal() {
    const modal = document.getElementById('edit-student-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function submitEditStudent() {
    const id = document.getElementById('edit-student-id').value;
    const fullName = document.getElementById('edit-full-name').value.trim();
    const libId = document.getElementById('edit-library-id').value.trim();
    const btn = document.getElementById('btn-save-student');
    const statusMsg = document.getElementById('edit-status-msg');
    
    if (!fullName) return;
    
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> Saving...';
    statusMsg.classList.add('hidden');
    
    try {
        const { error } = await window.sbClient
            .from('library_users')
            .update({ full_name: fullName, library_id: libId })
            .eq('id', id);
            
        if (error) throw error;
        
        // Update local state
        const studentIndex = allStudents.findIndex(s => s.id === id);
        if (studentIndex !== -1) {
            allStudents[studentIndex].full_name = fullName;
            allStudents[studentIndex].library_id = libId;
        }
        
        // Re-render
        renderStudents(document.getElementById('student-search').value);
        closeEditStudentModal();
        
    } catch (err) {
        console.error(err);
        statusMsg.textContent = 'Error updating student: ' + err.message;
        statusMsg.className = 'mb-2 p-sm rounded-lg font-body-sm text-body-sm text-center bg-error-container text-on-error-container';
        statusMsg.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">save</span> Save Changes';
    }
}

async function suspendStudent(id, name) {
    if (!confirm(`Are you sure you want to suspend "${name}"?\n\nThis will revoke their student role and prevent them from logging in or borrowing books.`)) {
        return;
    }
    
    try {
        const { error } = await window.sbClient
            .from('library_users')
            .update({ role: 'suspended' })
            .eq('id', id);
            
        if (error) throw error;
        
        // Remove from local list
        allStudents = allStudents.filter(s => s.id !== id);
        
        // Update stats
        document.getElementById('student-count').textContent = `${allStudents.length} student${allStudents.length !== 1 ? 's' : ''}`;
        
        // Re-render
        renderStudents(document.getElementById('student-search').value);
        
    } catch (err) {
        console.error(err);
        alert('Failed to suspend student: ' + err.message);
    }
}

function closeStudentDetailModal() {
    const modal = document.getElementById('student-detail-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    currentSelectedStudent = null;
}

// Close modals on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.id === 'report-generator-modal') closeReportModal();
    if (e.target.id === 'student-detail-modal') closeStudentDetailModal();
    if (e.target.id === 'add-student-modal') closeAddStudentModal();
    if (e.target.id === 'edit-student-modal') closeEditStudentModal();
});

function switchDetailTab(tabName) {
    // Hide all panels
    document.querySelectorAll('.detail-tab-panel').forEach(p => p.classList.add('hidden'));
    // Show selected panel
    document.getElementById(`panel-det-${tabName}`).classList.remove('hidden');
    
    // Reset tabs classes
    const tabs = ['loans', 'history', 'reservations'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-det-${t}`);
        if (t === tabName) {
            btn.className = 'pb-2 px-4 font-label-lg border-b-2 border-teal-blue text-teal-blue font-bold transition-all';
        } else {
            btn.className = 'pb-2 px-4 font-label-lg border-b-2 border-transparent text-dusty-rose hover:text-teal-blue transition-all';
        }
    });
}

async function viewStudentDetails(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (!student) return;

    currentSelectedStudent = student;

    // Set header profile
    const avatarContainer = document.getElementById('det-avatar');
    if (student.profile_picture_url) {
        avatarContainer.innerHTML = `<img src="${student.profile_picture_url}" class="w-full h-full object-cover rounded-full" />`;
        avatarContainer.className = "w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border border-dusty-rose/20";
    } else {
        const initials = (student.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatarContainer.textContent = initials;
        avatarContainer.className = "w-16 h-16 rounded-full bg-deep-pine text-soft-parchment flex items-center justify-center text-2xl font-bold flex-shrink-0";
    }

    document.getElementById('det-name').textContent = student.full_name || 'Unknown student';
    document.getElementById('det-id').textContent = `ID: ${student.id}`;
    document.getElementById('det-lib-id').textContent = student.library_id || '—';
    document.getElementById('det-joined').textContent = student.created_at ? new Date(student.created_at).toLocaleDateString() : '—';

    // Show loading
    document.getElementById('panel-det-loans').innerHTML = '<p class="text-center text-dusty-rose py-8">Loading loans...</p>';
    document.getElementById('panel-det-history').innerHTML = '<p class="text-center text-dusty-rose py-8">Loading history...</p>';
    document.getElementById('panel-det-reservations').innerHTML = '<p class="text-center text-dusty-rose py-8">Loading reservations...</p>';

    // Show modal
    const modal = document.getElementById('student-detail-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    switchDetailTab('loans');

    try {
        // Fetch loans and reservations from database
        const [{ data: loans, error: loanErr }, { data: reservations, error: resErr }] = await Promise.all([
            window.sbClient.from('loans').select('*, books(title, author, isbn)').eq('user_id', studentId).order('created_at', { ascending: false }),
            window.sbClient.from('reservations').select('*, books(title, author, isbn)').eq('user_id', studentId).order('created_at', { ascending: false })
        ]);

        if (loanErr) throw loanErr;
        if (resErr) throw resErr;

        currentStudentLoans = loans || [];
        currentStudentReservations = reservations || [];

        // Render Active Loans
        const activeLoans = currentStudentLoans.filter(l => l.status === 'active');
        const activeContainer = document.getElementById('panel-det-loans');
        
        // Update badge counts
        const overdueLoans = activeLoans.filter(l => new Date(l.due_date) < new Date());
        document.getElementById('det-badge-loans').textContent = `${activeLoans.length} Active Loan${activeLoans.length !== 1 ? 's' : ''}`;
        
        const overdueBadge = document.getElementById('det-badge-overdue');
        if (overdueLoans.length > 0) {
            overdueBadge.textContent = `${overdueLoans.length} Overdue`;
            overdueBadge.classList.remove('hidden');
        } else {
            overdueBadge.classList.add('hidden');
        }
        
        document.getElementById('det-badge-res').textContent = `${currentStudentReservations.length} Reserved`;

        if (activeLoans.length === 0) {
            activeContainer.innerHTML = '<p class="text-center text-dusty-rose py-8 text-sm">No active loans.</p>';
        } else {
            activeContainer.innerHTML = activeLoans.map(l => {
                const isOverdue = new Date(l.due_date) < new Date();
                const overdueDays = isOverdue ? Math.ceil((new Date() - new Date(l.due_date)) / (1000 * 60 * 60 * 24)) : 0;
                
                return `<div class="bg-surface-container-low p-3 rounded-xl border ${isOverdue ? 'border-error/30 bg-error-container/20' : 'border-dusty-rose/10'} flex justify-between items-center text-sm shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                    <div>
                        <p class="font-semibold text-deep-pine text-sm">${l.books?.title || 'Unknown Book'}</p>
                        <p class="text-xs text-dusty-rose mt-0.5">${l.books?.author || 'Unknown Author'} · ISBN: ${l.books?.isbn || '—'}</p>
                        <p class="text-xs mt-2 text-dusty-rose">Borrowed: ${new Date(l.created_at).toLocaleDateString()} · <span class="${isOverdue ? 'text-error font-bold' : 'text-deep-pine'}">Due: ${new Date(l.due_date).toLocaleDateString()}</span></p>
                    </div>
                    <div>
                        ${isOverdue 
                            ? `<span class="px-2.5 py-1 rounded-full bg-error-container text-on-error-container text-xs font-bold">${overdueDays}d Overdue</span>`
                            : `<span class="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">Active</span>`}
                    </div>
                </div>`;
            }).join('');
        }

        // Render Borrow History (returned)
        const historyLoans = currentStudentLoans.filter(l => l.status === 'returned');
        const historyContainer = document.getElementById('panel-det-history');
        if (historyLoans.length === 0) {
            historyContainer.innerHTML = '<p class="text-center text-dusty-rose py-8 text-sm">No past borrows.</p>';
        } else {
            historyContainer.innerHTML = historyLoans.map(l => {
                const returnDateStr = l.return_date ? new Date(l.return_date).toLocaleDateString() : '—';
                return `<div class="bg-surface-container-low p-3 rounded-xl border border-dusty-rose/10 flex justify-between items-center text-sm">
                    <div>
                        <p class="font-semibold text-deep-pine text-sm">${l.books?.title || 'Unknown Book'}</p>
                        <p class="text-xs text-dusty-rose mt-0.5">${l.books?.author || 'Unknown Author'}</p>
                        <p class="text-xs mt-2 text-dusty-rose">Borrowed: ${new Date(l.created_at).toLocaleDateString()} · Returned: ${returnDateStr}</p>
                    </div>
                    <div>
                        <span class="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Returned</span>
                    </div>
                </div>`;
            }).join('');
        }

        // Render Reservations
        const resContainer = document.getElementById('panel-det-reservations');
        if (currentStudentReservations.length === 0) {
            resContainer.innerHTML = '<p class="text-center text-dusty-rose py-8 text-sm">No pending reservations.</p>';
        } else {
            resContainer.innerHTML = currentStudentReservations.map(r => {
                const statusColor = r.status === 'ready' ? 'bg-sage-green/10 text-on-secondary-container font-bold' : 'bg-surface-variant text-dusty-rose';
                return `<div class="bg-surface-container-low p-3 rounded-xl border border-dusty-rose/10 flex justify-between items-center text-sm">
                    <div>
                        <p class="font-semibold text-deep-pine text-sm">${r.books?.title || 'Unknown Book'}</p>
                        <p class="text-xs text-dusty-rose mt-0.5">${r.books?.author || 'Unknown Author'}</p>
                        <p class="text-xs mt-2 text-dusty-rose">Reserved on: ${new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span class="px-2.5 py-1 rounded-full text-xs uppercase tracking-wider font-semibold ${statusColor}">${r.status}</span>
                    </div>
                </div>`;
            }).join('');
        }

    } catch (e) {
        console.error(e);
        document.getElementById('panel-det-loans').innerHTML = `<p class="text-center text-error py-8 text-sm">Failed to load details: ${e.message}</p>`;
    }
}

// Attach Student Print handler
document.addEventListener('DOMContentLoaded', () => {
    const printBtn = document.getElementById('btn-print-student-report');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            if (!currentSelectedStudent) return;
            
            const s = currentSelectedStudent;
            const active = currentStudentLoans.filter(l => l.status === 'active');
            const overdue = active.filter(l => new Date(l.due_date) < new Date());
            const returned = currentStudentLoans.filter(l => l.status === 'returned');
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Patron Borrowing Record - ${s.full_name}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet"/>
                    <style>
                        body { font-family: 'Source Sans 3', sans-serif; color: #223127; padding: 40px; margin: 0; background: #fff; }
                        .header { border-bottom: 2px solid #223127; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                        h1 { font-family: 'Roboto Flex', sans-serif; font-size: 26px; color: #223127; margin: 0; }
                        .subtitle { font-size: 14px; color: #7C6C77; margin-top: 5px; }
                        .date { text-align: right; font-size: 12px; color: #7C6C77; }
                        
                        .patron-card { border: 1px solid #c3c8c2; border-radius: 8px; padding: 20px; background: #fbf9f7; display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .patron-name { font-family: 'Roboto Flex', sans-serif; font-size: 20px; font-weight: bold; margin: 0; }
                        .patron-meta { font-size: 13px; color: #7C6C77; margin-top: 4px; }
                        .patron-stats { display: flex; gap: 20px; text-align: center; }
                        .stat-box { border: 1px solid #e4e2e0; background: #fff; border-radius: 6px; padding: 8px 15px; min-width: 60px; }
                        .stat-val { font-size: 20px; font-weight: bold; color: #223127; }
                        .stat-lbl { font-size: 10px; color: #7C6C77; text-transform: uppercase; margin-top: 2px; }
                        
                        h2 { font-family: 'Roboto Flex', sans-serif; font-size: 16px; border-bottom: 1px solid #e4e2e0; padding-bottom: 8px; margin-top: 30px; color: #223127; text-transform: uppercase; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th { border-bottom: 2px solid #223127; padding: 8px 10px; text-align: left; font-family: 'Roboto Flex', sans-serif; font-size: 12px; text-transform: uppercase; color: #7C6C77; }
                        td { border-bottom: 1px solid #e4e2e0; padding: 10px 10px; font-size: 13px; }
                        tr:nth-child(even) { background-color: #fbf9f7; }
                        
                        .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
                        .badge-active { background-color: #e0f2fe; color: #0369a1; }
                        .badge-overdue { background-color: #fee2e2; color: #b91c1c; }
                        .badge-returned { background-color: #dcfce7; color: #15803d; }
                        
                        .footer { margin-top: 50px; border-top: 1px solid #e4e2e0; padding-top: 20px; text-align: center; font-size: 11px; color: #7C6C77; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1>Scholarly Archive Library Hub</h1>
                            <div class="subtitle">Patron Academic Reading & Borrowing Record</div>
                        </div>
                        <div class="date">
                            Generated: ${new Date().toLocaleString()}<br/>
                            System Librarian Portal
                        </div>
                    </div>
                    
                    <div class="patron-card">
                        <div>
                            <div class="patron-name">${s.full_name}</div>
                            <div class="patron-meta">Patron ID: ${s.id}</div>
                            <div class="patron-meta">Library Code: ${s.library_id || '—'}</div>
                            <div class="patron-meta">Registration Date: ${s.created_at ? new Date(s.created_at).toLocaleDateString() : '—'}</div>
                        </div>
                        <div class="patron-stats">
                            <div class="stat-box">
                                <div class="stat-val">${active.length}</div>
                                <div class="stat-lbl">Active</div>
                            </div>
                            <div class="stat-box" style="${overdue.length > 0 ? 'border-color: #fee2e2; background: #fee2e2;' : ''}">
                                <div class="stat-val" style="${overdue.length > 0 ? 'color: #b91c1c;' : ''}">${overdue.length}</div>
                                <div class="stat-lbl" style="${overdue.length > 0 ? 'color: #b91c1c;' : ''}">Overdue</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-val">${returned.length}</div>
                                <div class="stat-lbl">Returned</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-val">${currentStudentReservations.length}</div>
                                <div class="stat-lbl">Reserved</div>
                            </div>
                        </div>
                    </div>
                    
                    <h2>Active Loans</h2>
                    ${active.length === 0 ? '<p style="font-size: 13px; color: #7C6C77;">No current active loans.</p>' : `
                    <table>
                        <thead>
                            <tr>
                                <th>Book Title / Author</th>
                                <th>ISBN</th>
                                <th>Borrow Date</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${active.map(l => {
                                const isOverdue = new Date(l.due_date) < new Date();
                                const overdueDays = isOverdue ? Math.ceil((new Date() - new Date(l.due_date)) / (1000 * 60 * 60 * 24)) : 0;
                                return `<tr>
                                    <td><strong>${l.books?.title || 'Unknown Book'}</strong><br/><span style="font-size: 11px; color:#7C6C77">${l.books?.author || ''}</span></td>
                                    <td style="font-family: monospace;">${l.books?.isbn || '—'}</td>
                                    <td>${new Date(l.created_at).toLocaleDateString()}</td>
                                    <td style="${isOverdue ? 'color: #b91c1c; font-weight: bold;' : ''}">${new Date(l.due_date).toLocaleDateString()}</td>
                                    <td>
                                        ${isOverdue 
                                            ? `<span class="badge badge-overdue">${overdueDays}d Overdue</span>`
                                            : `<span class="badge badge-active">Active</span>`}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                    `}
                    
                    <h2>Borrowing History (Returned)</h2>
                    ${returned.length === 0 ? '<p style="font-size: 13px; color: #7C6C77;">No historical borrowing records.</p>' : `
                    <table>
                        <thead>
                            <tr>
                                <th>Book Title / Author</th>
                                <th>ISBN</th>
                                <th>Borrow Date</th>
                                <th>Return Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${returned.map(l => `<tr>
                                <td><strong>${l.books?.title || 'Unknown Book'}</strong><br/><span style="font-size: 11px; color:#7C6C77">${l.books?.author || ''}</span></td>
                                <td style="font-family: monospace;">${l.books?.isbn || '—'}</td>
                                <td>${new Date(l.created_at).toLocaleDateString()}</td>
                                <td>${l.return_date ? new Date(l.return_date).toLocaleDateString() : '—'}</td>
                                <td><span class="badge badge-returned">Returned</span></td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                    `}
                    
                    <h2>Pending Reservations</h2>
                    ${currentStudentReservations.length === 0 ? '<p style="font-size: 13px; color: #7C6C77;">No pending reservations.</p>' : `
                    <table>
                        <thead>
                            <tr>
                                <th>Book Title / Author</th>
                                <th>ISBN</th>
                                <th>Reservation Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${currentStudentReservations.map(r => `<tr>
                                <td><strong>${r.books?.title || 'Unknown Book'}</strong><br/><span style="font-size: 11px; color:#7C6C77">${r.books?.author || ''}</span></td>
                                <td style="font-family: monospace;">${r.books?.isbn || '—'}</td>
                                <td>${new Date(r.created_at).toLocaleDateString()}</td>
                                <td><span class="badge" style="background:#efedeb; color:#223127;">${r.status.toUpperCase()}</span></td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                    `}
                    
                    <div class="footer">
                        <p>Scholarly Archive © 2026 — Official Librarian Record Verification document.</p>
                        <button onclick="window.print()" class="no-print" style="margin-top: 15px; padding: 8px 16px; background: #223127; color: #f1dac4; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Print Document</button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
});

// CSV Helper
function downloadCSV(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Generate report
async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const reportFormat = document.getElementById('report-format').value;
    
    try {
        let title = '';
        let headers = [];
        let rows = [];
        
        if (reportType === 'all-students') {
            title = 'All Students & Borrowing Summary';
            headers = ['Student Name', 'Library ID', 'Active Loans', 'Overdue Books', 'Reservations', 'Patron Status'];
            
            rows = allStudents.map(s => {
                const hasOverdue = s.activeLoans > 0 && s.overdueCount > 0;
                const status = hasOverdue ? 'Overdue' : (s.activeLoans > 0 ? 'Active' : 'No Loans');
                return [
                    s.full_name || 'Unknown',
                    s.library_id || '—',
                    s.activeLoans || 0,
                    s.overdueCount || 0,
                    s.reservationCount || 0,
                    status
                ];
            });
            
        } else if (reportType === 'active-loans') {
            title = 'Active Loans Report';
            headers = ['Patron Name', 'Library ID', 'Book Title', 'Author', 'ISBN', 'Borrow Date', 'Due Date', 'Status'];
            
            const { data: loans, error } = await window.sbClient
                .from('loans')
                .select('*, books(title, author, isbn), library_users(full_name, library_id)')
                .eq('status', 'active')
                .order('due_date', { ascending: true });
                
            if (error) throw error;
            
            rows = (loans || []).map(l => {
                const isOverdue = new Date(l.due_date) < new Date();
                return [
                    l.library_users?.full_name || 'Unknown',
                    l.library_users?.library_id || '—',
                    l.books?.title || 'Unknown Book',
                    l.books?.author || '—',
                    l.books?.isbn || '—',
                    new Date(l.created_at).toLocaleDateString(),
                    new Date(l.due_date).toLocaleDateString(),
                    isOverdue ? 'Overdue' : 'Active'
                ];
            });
            
        } else if (reportType === 'overdue-loans') {
            title = 'Overdue Loans Report';
            headers = ['Patron Name', 'Library ID', 'Book Title', 'ISBN', 'Due Date', 'Days Overdue'];
            
            const { data: loans, error } = await window.sbClient
                .from('loans')
                .select('*, books(title, isbn), library_users(full_name, library_id)')
                .eq('status', 'active')
                .lt('due_date', new Date().toISOString())
                .order('due_date', { ascending: true });
                
            if (error) throw error;
            
            rows = (loans || []).map(l => {
                const daysOverdue = Math.ceil((new Date() - new Date(l.due_date)) / (1000 * 60 * 60 * 24));
                return [
                    l.library_users?.full_name || 'Unknown',
                    l.library_users?.library_id || '—',
                    l.books?.title || 'Unknown Book',
                    l.books?.isbn || '—',
                    new Date(l.due_date).toLocaleDateString(),
                    `${daysOverdue} days`
                ];
            });
            
        } else if (reportType === 'popular-books') {
            title = 'Popular Inventory Report';
            headers = ['Book Title', 'Author', 'Category', 'Total Copies', 'Times Borrowed'];
            
            const [{ data: loans, error: loanErr }, { data: books, error: bookErr }] = await Promise.all([
                window.sbClient.from('loans').select('book_id'),
                window.sbClient.from('books').select('id, title, author, category, total_copies')
            ]);
            
            if (loanErr) throw loanErr;
            if (bookErr) throw bookErr;
            
            const countMap = {};
            (loans || []).forEach(l => {
                if (l.book_id) countMap[l.book_id] = (countMap[l.book_id] || 0) + 1;
            });
            
            rows = (books || [])
                .map(b => ({
                    ...b,
                    count: countMap[b.id] || 0
                }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 15)
                .map(b => [
                    b.title || 'Unknown',
                    b.author || '—',
                    b.category || 'Uncategorized',
                    b.total_copies || 0,
                    b.count
                ]);
        }
        
        if (reportFormat === 'csv') {
            const csvRows = [headers.join(',')];
            rows.forEach(r => {
                const escapedRow = r.map(val => {
                    const stringVal = String(val);
                    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                        return `"${stringVal.replace(/"/g, '""')}"`;
                    }
                    return stringVal;
                });
                csvRows.push(escapedRow.join(','));
            });
            
            const csvContent = csvRows.join('\n');
            const fileSuffix = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const fileName = `library_report_${fileSuffix}_${new Date().toISOString().slice(0,10)}.csv`;
            downloadCSV(fileName, csvContent);
            closeReportModal();
            
        } else if (reportFormat === 'print') {
            const htmlRows = rows.map(r => `<tr>${r.map(val => `<td>${val}</td>`).join('')}</tr>`).join('');
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${title}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet"/>
                    <style>
                        body { font-family: 'Source Sans 3', sans-serif; color: #223127; padding: 40px; margin: 0; background: #fff; }
                        .header { border-bottom: 2px solid #223127; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                        h1 { font-family: 'Roboto Flex', sans-serif; font-size: 26px; color: #223127; margin: 0; }
                        .subtitle { font-size: 14px; color: #7C6C77; margin-top: 5px; }
                        .date { text-align: right; font-size: 12px; color: #7C6C77; }
                        
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { border-bottom: 2px solid #223127; padding: 10px; text-align: left; font-family: 'Roboto Flex', sans-serif; font-size: 12px; text-transform: uppercase; color: #7C6C77; }
                        td { border-bottom: 1px solid #e4e2e0; padding: 12px 10px; font-size: 13px; }
                        tr:nth-child(even) { background-color: #fbf9f7; }
                        
                        .footer { margin-top: 50px; border-top: 1px solid #e4e2e0; padding-top: 20px; text-align: center; font-size: 11px; color: #7C6C77; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div>
                            <h1>Scholarly Archive Library Hub</h1>
                            <div class="subtitle">${title}</div>
                        </div>
                        <div class="date">
                            Generated: ${new Date().toLocaleString()}<br/>
                            Librarian Reports Portal
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                ${headers.map(h => `<th>${h}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${htmlRows}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>Scholarly Archive Library Hub © 2026 — Verified Administrative System Report.</p>
                        <button onclick="window.print()" class="no-print" style="margin-top: 15px; padding: 8px 16px; background: #223127; color: #f1dac4; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Print Report</button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
            closeReportModal();
        }
    } catch (err) {
        console.error(err);
        alert('Failed to generate report: ' + err.message);
    }
}

document.addEventListener('DOMContentLoaded', init);
