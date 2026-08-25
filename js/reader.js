/**
 * reader.js — the Bible reader, split into two screens:
 *   1. Selection screen — pick version, book, and chapter.
 *   2. Reading screen — the actual chapter text, with Previous/Next and
 *      a button to go back and pick a different book/chapter.
 *
 * Other pages (Home, Search, Bookmarks) call Reader.openLocation() then
 * App.goTo('bible') to jump straight to the reading screen, skipping
 * the selection screen entirely.
 */

const Reader = (() => {
  let pending = null;   // explicit target set by another page: { version, bookId, chapter, verse }
  let current = null;   // location currently shown on the reading screen
  let currentChapterData = null; // last successfully loaded chapter's verses (for AI Assistant context)
  let mode = 'select';  // 'select' | 'read'
  let containerRef = null;

  function openLocation(version, bookId, chapter, verse) {
    pending = { version, bookId, chapter: Number(chapter), verse: verse ? Number(verse) : null };
  }

  // ======================= SELECTION SCREEN =======================

  function populateBookSelect(container, ntOnly, selectedBookId) {
    const bookSelect = container.querySelector('#book-select');
    const books = ntOnly ? BIBLE_BOOKS.filter((b) => b.testament === 'NT') : BIBLE_BOOKS;
    const stillValid = books.some((b) => b.id === selectedBookId);
    const fallbackId = ntOnly ? 'MAT' : 'GEN';
    bookSelect.innerHTML = books.map((b) =>
      `<option value="${b.id}">${UI.escapeHTML(b.name)}</option>`).join('');
    bookSelect.value = stillValid ? selectedBookId : fallbackId;
  }

  function selectionShell() {
    const settings = Storage.getSettings();
    const history = Storage.getHistory();
    const defaults = current || (history.last
      ? { version: history.last.version, bookId: history.last.bookId, chapter: history.last.chapter }
      : { version: settings.version, bookId: 'GEN', chapter: 1 });

    const versionOptions = BIBLE_VERSIONS.map((v) =>
      `<option value="${v.id}" ${v.id === defaults.version ? 'selected' : ''}>${UI.escapeHTML(v.short)} — ${UI.escapeHTML(v.name)}</option>`).join('');

    return `
      <h1 class="page-title">Choose a Passage</h1>

      ${history.last ? `
        <section class="card continue-quick">
          <p class="hint-text">Last read: <strong>${UI.escapeHTML(history.last.book)} ${history.last.chapter}</strong></p>
          <button class="btn btn-secondary" id="quick-continue-btn">Continue Reading</button>
        </section>
      ` : ''}

      <section class="card reader-controls">
        <div class="control-group">
          <label for="version-select">Bible Version</label>
          <select id="version-select">${versionOptions}</select>
          <p class="hint-text" id="ntonly-note" hidden>This translation covers the New Testament only.</p>
        </div>
        <div class="control-group">
          <label for="book-select">Book</label>
          <select id="book-select"></select>
        </div>
        <div class="control-group">
          <label for="chapter-select">Chapter</label>
          <select id="chapter-select"></select>
        </div>
        <button class="btn btn-primary read-btn" id="read-chapter-btn">Read Chapter</button>
      </section>
    `;
  }

  function populateChapterSelect(container, bookId, selectedChapter) {
    const book = getBookById(bookId);
    const chapterSelect = container.querySelector('#chapter-select');
    const options = [];
    for (let c = 1; c <= book.chapters; c += 1) {
      options.push(`<option value="${c}">Chapter ${c}</option>`);
    }
    chapterSelect.innerHTML = options.join('');
    chapterSelect.value = String(Math.min(selectedChapter, book.chapters));
  }

  function renderSelectScreen(container) {
    mode = 'select';
    currentChapterData = null;
    container.innerHTML = selectionShell();

    const versionSelect = container.querySelector('#version-select');
    const bookSelect = container.querySelector('#book-select');
    const chapterSelect = container.querySelector('#chapter-select');
    const ntOnlyNote = container.querySelector('#ntonly-note');
    const defaults = current || (Storage.getHistory().last
      ? { bookId: Storage.getHistory().last.bookId, chapter: Storage.getHistory().last.chapter }
      : { bookId: 'GEN', chapter: 1 });

    function syncForVersion() {
      const version = getVersionById(versionSelect.value);
      ntOnlyNote.hidden = !version.ntOnly;
      populateBookSelect(container, !!version.ntOnly, bookSelect.value || defaults.bookId);
      populateChapterSelect(container, bookSelect.value, 1);
    }

    populateBookSelect(container, !!getVersionById(versionSelect.value).ntOnly, defaults.bookId);
    ntOnlyNote.hidden = !getVersionById(versionSelect.value).ntOnly;
    populateChapterSelect(container, bookSelect.value, defaults.chapter || 1);

    versionSelect.addEventListener('change', syncForVersion);
    bookSelect.addEventListener('change', () => populateChapterSelect(container, bookSelect.value, 1));

    container.querySelector('#read-chapter-btn').addEventListener('click', () => {
      openLocation(
        versionSelect.value,
        bookSelect.value,
        Number(chapterSelect.value)
      );
      renderReadScreen(container);
    });

    const quickBtn = container.querySelector('#quick-continue-btn');
    if (quickBtn) {
      quickBtn.addEventListener('click', () => {
        const last = Storage.getHistory().last;
        openLocation(last.version, last.bookId, last.chapter);
        renderReadScreen(container);
      });
    }
  }

  // ======================= READING SCREEN =======================

  function readingShell() {
    return `
      <div class="reader-header">
        <button class="btn btn-secondary" id="back-to-picker-btn">&larr; Books &amp; Chapters</button>
      </div>

      <section class="card reader-content" id="reader-content" aria-live="polite">
        <p class="loading-text">Loading Scripture…</p>
      </section>

      <nav class="chapter-nav" id="chapter-nav">
        <button class="btn btn-secondary" id="prev-chapter-btn">&larr; Previous</button>
        <button class="btn btn-secondary" id="next-chapter-btn">Next &rarr;</button>
      </nav>

      <div class="verse-menu" id="verse-menu" hidden></div>
    `;
  }

  function renderVerses(container, data, bookName, versionShort) {
    const content = container.querySelector('#reader-content');
    const verseHtml = data.verses.map((v) => `
      <div class="verse" data-verse="${v.number}" tabindex="0" role="button"
           aria-label="Verse ${v.number}, tap for actions">
        <span class="verse-num">${v.number}</span>
        <span class="verse-text">${UI.escapeHTML(v.text)}</span>
      </div>
    `).join('');

    content.innerHTML = `
      <div class="chapter-heading">
        <h2>${UI.escapeHTML(bookName)}</h2>
        <span class="chapter-label">Chapter ${data.chapter}</span>
      </div>
      <div class="verses">${verseHtml}</div>
    `;

    content.querySelectorAll('.verse').forEach((el) => {
      const openMenu = () => showVerseMenu(container, {
        version: data.version, bookId: data.bookId, book: bookName,
        chapter: data.chapter, verse: Number(el.dataset.verse),
        text: data.verses.find((v) => v.number === Number(el.dataset.verse)).text,
        versionShort,
      });
      el.addEventListener('click', openMenu);
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(); } });
    });

    applySavedHighlights(container);
  }

  function applySavedHighlights(container) {
    const saved = Storage.getSaved();
    container.querySelectorAll('.verse').forEach((el) => {
      const verseNum = Number(el.dataset.verse);
      const match = saved.find((s) => s.bookId === current.bookId && s.chapter === current.chapter
        && s.verse === verseNum && s.version === current.version);
      el.classList.toggle('bookmarked', !!(match && match.bookmarked));
      el.classList.toggle('favorited', !!(match && match.favorited));
    });
  }

  function showVerseMenu(container, verseInfo) {
    const menu = container.querySelector('#verse-menu');
    const saved = Storage.findSaved(verseInfo);
    const note = Storage.getNoteFor(verseInfo);
    const ref = UI.referenceLabel(verseInfo.book, verseInfo.chapter, verseInfo.verse);

    menu.innerHTML = `
      <div class="verse-menu-backdrop"></div>
      <div class="verse-menu-panel" role="dialog" aria-label="Verse actions for ${UI.escapeHTML(ref)}">
        <div class="verse-menu-ref">${UI.escapeHTML(ref)}</div>
        <p class="verse-menu-text">${UI.escapeHTML(verseInfo.text)}</p>
        <div class="verse-menu-actions">
          <button class="menu-action" id="act-bookmark">${saved && saved.bookmarked ? '\u2605 Bookmarked' : '\u2606 Bookmark'}</button>
          <button class="menu-action" id="act-favorite">${saved && saved.favorited ? '\u2665 Favorited' : '\u2661 Favorite'}</button>
          <button class="menu-action" id="act-note">${note ? 'Edit Note' : 'Add Note'}</button>
          <button class="menu-action" id="act-copy">Copy</button>
          <button class="menu-action" id="act-share">Share</button>
        </div>
        <div class="verse-menu-note-editor" id="note-editor" hidden>
          <label for="note-textarea">Note</label>
          <textarea id="note-textarea" rows="3" maxlength="1000">${note ? UI.escapeHTML(note.note) : ''}</textarea>
          <div class="btn-row">
            <button class="btn btn-primary" id="note-save">Save Note</button>
            ${note ? '<button class="btn btn-secondary" id="note-delete">Delete</button>' : ''}
          </div>
        </div>
        <button class="btn btn-secondary verse-menu-close" id="menu-close">Close</button>
      </div>
    `;
    menu.hidden = false;

    menu.querySelector('.verse-menu-backdrop').addEventListener('click', () => hideVerseMenu(container));
    menu.querySelector('#menu-close').addEventListener('click', () => hideVerseMenu(container));

    menu.querySelector('#act-bookmark').addEventListener('click', () => {
      Storage.toggleBookmark(verseInfo);
      applySavedHighlights(container);
      showVerseMenu(container, verseInfo);
    });
    menu.querySelector('#act-favorite').addEventListener('click', () => {
      Storage.toggleFavorite(verseInfo);
      applySavedHighlights(container);
      showVerseMenu(container, verseInfo);
    });
    menu.querySelector('#act-copy').addEventListener('click', () =>
      UI.copyVerse(verseInfo.book, verseInfo.chapter, verseInfo.verse, verseInfo.text, verseInfo.versionShort));
    menu.querySelector('#act-share').addEventListener('click', () =>
      UI.shareVerse(verseInfo.book, verseInfo.chapter, verseInfo.verse, verseInfo.text, verseInfo.versionShort));
    menu.querySelector('#act-note').addEventListener('click', () => {
      const editor = menu.querySelector('#note-editor');
      editor.hidden = !editor.hidden;
      if (!editor.hidden) menu.querySelector('#note-textarea').focus();
    });
    menu.querySelector('#note-save').addEventListener('click', () => {
      Storage.saveNote(verseInfo, menu.querySelector('#note-textarea').value);
      UI.toast('Note saved.');
      hideVerseMenu(container);
    });
    const delBtn = menu.querySelector('#note-delete');
    if (delBtn) delBtn.addEventListener('click', () => {
      Storage.deleteNote(verseInfo);
      UI.toast('Note deleted.');
      hideVerseMenu(container);
    });
  }

  function hideVerseMenu(container) {
    const menu = container.querySelector('#verse-menu');
    menu.hidden = true;
    menu.innerHTML = '';
  }

  function renderError(container, message) {
    const content = container.querySelector('#reader-content');
    content.innerHTML = `
      <div class="error-state">
        <p class="error-title">Unable to load Scripture.</p>
        <p class="error-detail">${UI.escapeHTML(message)}</p>
        <button class="btn btn-primary" id="retry-btn">Try Again</button>
      </div>
    `;
    content.querySelector('#retry-btn').addEventListener('click', () => loadChapter(container));
  }

  function updateNavButtons(container) {
    const prevBtn = container.querySelector('#prev-chapter-btn');
    const nextBtn = container.querySelector('#next-chapter-btn');
    const version = getVersionById(current.version);
    let prev = getAdjacentChapter(current.bookId, current.chapter, 'prev');
    let next = getAdjacentChapter(current.bookId, current.chapter, 'next');
    if (version.ntOnly) {
      if (prev && getBookById(prev.bookId).testament !== 'NT') prev = null;
      if (next && getBookById(next.bookId).testament !== 'NT') next = null;
    }
    prevBtn.disabled = !prev;
    nextBtn.disabled = !next;
    prevBtn.onclick = prev ? () => { openLocation(current.version, prev.bookId, prev.chapter); loadChapter(container); } : null;
    nextBtn.onclick = next ? () => { openLocation(current.version, next.bookId, next.chapter); loadChapter(container); } : null;
  }

  async function loadChapter(container) {
    const target = pending || current;
    const versionId = target.version;
    const bookId = target.bookId;
    const chapter = target.chapter;
    const scrollToVerse = target.verse || null;
    const book = getBookById(bookId);
    const version = getVersionById(versionId);

    container.querySelector('#reader-content').innerHTML = '<p class="loading-text">Loading Scripture…</p>';

    try {
      const { data, fromCache } = await BibleAPI.fetchChapter(versionId, bookId, chapter);
      current = { version: versionId, bookId, chapter };
      currentChapterData = { bookName: book.name, versionShort: version.short, chapter, verses: data.verses };
      renderVerses(container, data, book.name, version.short);
      updateNavButtons(container);
      Storage.recordVisit({ version: versionId, bookId, book: book.name, chapter });

      if (fromCache && !navigator.onLine) {
        UI.toast('You\u2019re offline — showing saved Scripture.');
      }

      if (scrollToVerse) {
        const verseEl = container.querySelector(`.verse[data-verse="${scrollToVerse}"]`);
        if (verseEl) verseEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to load chapter:', err);
      current = { version: versionId, bookId, chapter };
      currentChapterData = null;
      const message = navigator.onLine
        ? 'Please check your internet connection and try again.'
        : 'You\u2019re offline and this chapter hasn\u2019t been saved yet.';
      renderError(container, message);
      updateNavButtons(container);
    } finally {
      pending = null;
    }
  }

  function renderReadScreen(container) {
    mode = 'read';
    container.innerHTML = readingShell();
    container.querySelector('#back-to-picker-btn').addEventListener('click', () => renderSelectScreen(container));
    loadChapter(container);
  }

  // ======================= ENTRY POINT =======================

  function render(container) {
    containerRef = container;
    if (pending) {
      renderReadScreen(container);
    } else {
      renderSelectScreen(container);
    }
  }

  // Returns a short plain-text description of what's currently on screen,
  // for the AI Assistant to ground its answers in — or null if the person
  // isn't currently viewing a loaded chapter (e.g. on the selection screen).
  function getCurrentContext() {
    if (mode !== 'read' || !currentChapterData) return null;
    const { bookName, versionShort, chapter, verses } = currentChapterData;
    const text = verses.map((v) => `${v.number} ${v.text}`).join(' ');
    // Keep this reasonably short — it's sent with every message.
    const trimmed = text.length > 4000 ? `${text.slice(0, 4000)}…` : text;
    return `${bookName} ${chapter} (${versionShort}): ${trimmed}`;
  }

  return { render, openLocation, getCurrentContext };
})();
