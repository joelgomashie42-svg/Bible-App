/**
 * reader.js — the core Bible reader. This is the most important page.
 */

const Reader = (() => {
  // In-memory "requested location" so other pages (Home, Search, Bookmarks)
  // can tell the reader where to open before it renders.
  let pending = null; // { version, bookId, chapter, verse }
  let current = null; // last successfully rendered location
  let activeMenuVerse = null;

  function openLocation(version, bookId, chapter, verse) {
    pending = { version, bookId, chapter: Number(chapter), verse: verse ? Number(verse) : null };
  }

  function shell() {
    const settings = Storage.getSettings();
    const versionOptions = BIBLE_VERSIONS.map((v) =>
      `<option value="${v.id}">${UI.escapeHTML(v.short)} — ${UI.escapeHTML(v.name)}</option>`).join('');
    const bookOptions = BIBLE_BOOKS.map((b) =>
      `<option value="${b.id}">${UI.escapeHTML(b.name)}</option>`).join('');

    return `
      <section class="card reader-controls">
        <div class="control-group">
          <label for="version-select">Bible Version</label>
          <select id="version-select">${versionOptions}</select>
        </div>
        <div class="control-group">
          <label for="book-select">Book</label>
          <select id="book-select">${bookOptions}</select>
        </div>
        <div class="control-group">
          <label for="chapter-select">Chapter</label>
          <select id="chapter-select"></select>
        </div>
      </section>

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

  function populateChapterSelect(container, bookId, selectedChapter) {
    const book = getBookById(bookId);
    const chapterSelect = container.querySelector('#chapter-select');
    const options = [];
    for (let c = 1; c <= book.chapters; c += 1) {
      options.push(`<option value="${c}">Chapter ${c}</option>`);
    }
    chapterSelect.innerHTML = options.join('');
    chapterSelect.value = String(selectedChapter);
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
      }, el);
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

  function showVerseMenu(container, verseInfo, verseEl) {
    activeMenuVerse = verseInfo;
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
      showVerseMenu(container, verseInfo, verseEl); // refresh button labels
    });
    menu.querySelector('#act-favorite').addEventListener('click', () => {
      Storage.toggleFavorite(verseInfo);
      applySavedHighlights(container);
      showVerseMenu(container, verseInfo, verseEl);
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
    activeMenuVerse = null;
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
    const prev = getAdjacentChapter(current.bookId, current.chapter, 'prev');
    const next = getAdjacentChapter(current.bookId, current.chapter, 'next');
    prevBtn.disabled = !prev;
    nextBtn.disabled = !next;
    prevBtn.onclick = prev ? () => { openLocation(current.version, prev.bookId, prev.chapter); loadChapter(container); } : null;
    nextBtn.onclick = next ? () => { openLocation(current.version, next.bookId, next.chapter); loadChapter(container); } : null;
  }

  async function loadChapter(container) {
    const versionSelect = container.querySelector('#version-select');
    const bookSelect = container.querySelector('#book-select');
    const chapterSelect = container.querySelector('#chapter-select');

    const versionId = versionSelect.value;
    const bookId = bookSelect.value;
    const chapter = Number(chapterSelect.value);
    const book = getBookById(bookId);
    const version = getVersionById(versionId);

    container.querySelector('#reader-content').innerHTML = '<p class="loading-text">Loading Scripture…</p>';

    try {
      const { data, fromCache } = await BibleAPI.fetchChapter(versionId, bookId, chapter);
      current = { version: versionId, bookId, chapter };
      renderVerses(container, data, book.name, version.short);
      updateNavButtons(container);
      Storage.recordVisit({ version: versionId, bookId, book: book.name, chapter });

      if (fromCache && !navigator.onLine) {
        UI.toast('You\u2019re offline — showing saved Scripture.');
      }

      if (pending && pending.verse) {
        const verseEl = container.querySelector(`.verse[data-verse="${pending.verse}"]`);
        if (verseEl) verseEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      pending = null;
    } catch (err) {
      console.error('Failed to load chapter:', err);
      current = { version: versionId, bookId, chapter };
      const message = navigator.onLine
        ? 'Please check your internet connection and try again.'
        : 'You\u2019re offline and this chapter hasn\u2019t been saved yet.';
      renderError(container, message);
      updateNavButtons(container);
    }
  }

  function wireControls(container) {
    const versionSelect = container.querySelector('#version-select');
    const bookSelect = container.querySelector('#book-select');
    const chapterSelect = container.querySelector('#chapter-select');

    versionSelect.addEventListener('change', () => loadChapter(container));
    bookSelect.addEventListener('change', () => {
      populateChapterSelect(container, bookSelect.value, 1);
      loadChapter(container);
    });
    chapterSelect.addEventListener('change', () => loadChapter(container));
  }

  function render(container) {
    container.innerHTML = shell();

    const settings = Storage.getSettings();
    const history = Storage.getHistory();
    const start = pending || (history.last
      ? { version: history.last.version, bookId: history.last.bookId, chapter: history.last.chapter }
      : { version: settings.version, bookId: 'GEN', chapter: 1 });

    container.querySelector('#version-select').value = start.version;
    container.querySelector('#book-select').value = start.bookId;
    populateChapterSelect(container, start.bookId, start.chapter);

    wireControls(container);
    pending = start.verse ? start : pending; // preserve verse target if any
    loadChapter(container);
  }

  return { render, openLocation };
})();
