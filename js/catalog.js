// js/catalog.js
// This module adds librarian CRUD capabilities to the catalog page.
// It assumes Supabase client is available as window.supabase and that initNav() has already set up the UI.

(() => {
  // Utility: Show toast (reuses the function from other pages if present)
  const showToast = (msg, type = 'success') => {
    if (typeof window.showToast === 'function') {
      window.showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  // Fetch current user role (librarian or student)
  async function getUserRole() {
    const { data: { session } } = await window.sbClient.auth.getSession();
    return session?.user?.user_metadata?.role || 'student';
  }

  // Create and inject a modal for add/edit book
  function createModal() {
    // Prevent duplicate modal
    if (document.getElementById('book-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'book-modal';
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[200]';
    modal.innerHTML = `
      <div class="bg-surface-container-lowest p-6 rounded-xl shadow-xl w-full max-w-md relative">
        <h2 class="font-headline-md mb-4" id="book-modal-title">Add Book</h2>
        <form id="book-form" class="space-y-4">
          <input type="hidden" id="book-id" />
          <div>
            <label class="block font-label-md mb-1" for="book-title">Title</label>
            <input type="text" id="book-title" class="w-full border border-outline rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block font-label-md mb-1" for="book-author">Author</label>
            <input type="text" id="book-author" class="w-full border border-outline rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block font-label-md mb-1" for="book-isbn">ISBN</label>
            <input type="text" id="book-isbn" class="w-full border border-outline rounded px-3 py-2" required />
          </div>
          <div>
            <label class="block font-label-md mb-1" for="book-category">Category</label>
            <select id="book-category" class="w-full border border-outline rounded px-3 py-2">
              <option value="Computer Science">Computer Science</option>
              <option value="Philosophy">Philosophy</option>
              <option value="Architecture">Architecture</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Literature">Literature</option>
              <option value="History">History</option>
              <option value="Biology">Biology</option>
              <option value="Art">Art</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block font-label-md mb-1" for="book-copies">Available Copies</label>
            <input type="number" id="book-copies" class="w-full border border-outline rounded px-3 py-2" min="0" required />
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button type="button" id="book-cancel" class="px-4 py-2 bg-surface border border-outline rounded">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded">Save</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Cancel button
    document.getElementById('book-cancel').addEventListener('click', () => {
      closeModal();
    });
    // Form submit
    document.getElementById('book-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await saveBook();
    });
  }

  function openModal(mode = 'add', book = null) {
    createModal();
    const modal = document.getElementById('book-modal');
    const titleEl = document.getElementById('book-modal-title');
    const idInput = document.getElementById('book-id');
    const titleInput = document.getElementById('book-title');
    const authorInput = document.getElementById('book-author');
    const isbnInput = document.getElementById('book-isbn');
    const categoryInput = document.getElementById('book-category');
    const copiesInput = document.getElementById('book-copies');

    if (mode === 'edit' && book) {
      titleEl.textContent = 'Edit Book';
      idInput.value = book.id;
      titleInput.value = book.title || '';
      authorInput.value = book.author || '';
      isbnInput.value = book.isbn || '';
      categoryInput.value = book.category || '';
      copiesInput.value = book.available_copies ?? 0;
    } else {
      titleEl.textContent = 'Add Book';
      idInput.value = '';
      titleInput.value = '';
      authorInput.value = '';
      isbnInput.value = '';
      categoryInput.value = '';
      copiesInput.value = 0;
    }
    modal.classList.remove('hidden');
  }

  function closeModal() {
    const modal = document.getElementById('book-modal');
    if (modal) modal.remove();
  }

  async function saveBook() {
    const id = document.getElementById('book-id').value;
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    const isbn = document.getElementById('book-isbn').value.trim();
    const category = document.getElementById('book-category').value.trim();
    const copies = parseInt(document.getElementById('book-copies').value, 10);

    if (!title || !author || !isbn || isNaN(copies) || copies < 0) {
      showToast('Please fill all required fields correctly.', 'error');
      return;
    }
    try {
      if (id) {
        // Update existing book
        const { error } = await window.sbClient
          .from('books')
          .update({ title, author, isbn, category, available_copies: copies })
          .eq('id', id);
        if (error) throw error;
        showToast('Book updated successfully.', 'success');
      } else {
        // Insert new book
        const { error } = await window.sbClient
          .from('books')
          .insert({ title, author, isbn, category, available_copies: copies });
        if (error) throw error;
        showToast('Book added successfully.', 'success');
      }
      closeModal();
      loadBooks(); // refresh catalog
    } catch (err) {
      console.error('Save book error:', err);
      showToast(err.message || 'Failed to save book.', 'error');
    }
  }

  async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to permanently delete this book?')) return;
    try {
      const { error } = await window.sbClient.from('books').delete().eq('id', bookId);
      if (error) throw error;
      showToast('Book deleted.', 'success');
      loadBooks();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete book.', 'error');
    }
  }

  // Augment the existing loadBooks function to inject edit/delete controls for librarians.
  // We'll monkey‑patch after the original definition loads (catalog page already defines loadBooks).
  async function augmentLoadBooks() {
    // Wait until loadBooks exists (it may already be defined globally).
    if (typeof window.loadBooks !== 'function') {
      setTimeout(augmentLoadBooks, 100);
      return;
    }
    const originalLoad = window.loadBooks;
    window.loadBooks = async function () {
      await originalLoad(); // original behavior populates the grid
      const role = await getUserRole();
      if (role !== 'librarian') return;

      const grid = document.getElementById('book-catalog-grid');
      // Add edit/delete icons to each card
      grid.querySelectorAll('.borrow-btn, .reserve-btn').forEach((btn) => {
        // find the parent card element
        const card = btn.closest('.bg-surface-container-lowest');
        if (!card) return;
        // Avoid duplicate icons
        if (card.querySelector('.edit-btn')) return;
        const bookId = btn.dataset.bookId;
        // Create icons container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'absolute top-2 left-2 flex gap-1';
        // Edit icon
        const edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'edit-btn p-1 bg-surface rounded-full hover:bg-surface/70';
        edit.innerHTML = '<span class="material-symbols-outlined text-sm">edit</span>';
        edit.title = 'Edit book';
        edit.addEventListener('click', async (e) => {
          e.stopPropagation();
          // Pull book data from Supabase for pre‑fill
          const { data: book, error } = await window.sbClient.from('books').select('*').eq('id', bookId).single();
          if (error) { showToast('Failed to fetch book data.', 'error'); return; }
          openModal('edit', book);
        });
        // Delete icon
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'delete-btn p-1 bg-surface rounded-full hover:bg-surface/70';
        del.innerHTML = '<span class="material-symbols-outlined text-sm" style="color:#b91c1c;">delete</span>';
        del.title = 'Delete book';
        del.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteBook(bookId);
        });
        iconContainer.append(edit, del);
        // Position container inside the card (relative parent)
        card.style.position = 'relative';
        card.appendChild(iconContainer);
      });
    };
  }

  // Add Add‑Book button for librarians (inject after the catalog header)
  async function addAddBookButton() {
    const role = await getUserRole();
    if (role !== 'librarian') return;
    // Locate the header containing the count (line around h2 with id "catalog-count-text")
    const header = document.querySelector('h2.font-headline-lg');
    if (!header) return;
    if (document.getElementById('add-book-btn')) return; // already added
    const btn = document.createElement('button');
    btn.id = 'add-book-btn';
    btn.type = 'button';
    btn.className = 'ml-4 bg-primary text-on-primary font-label-md py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors';
    btn.textContent = 'Add Book';
    btn.addEventListener('click', () => openModal('add'));
    header.parentElement.appendChild(btn);
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    // Ensure nav is already initialized via nav.js; we just augment after that.
    augmentLoadBooks();
    addAddBookButton();
  });
})();
