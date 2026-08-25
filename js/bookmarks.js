/**
 * bookmarks.js — Bookmarks & Favorites page, plus the notes attached to verses.
 */

const Bookmarks = (() => {
  function verseCard(v, options) {
    const version = getVersionById(v.version);
    const note = Storage.getNoteFor(v);
    return `
      <div class="card saved-verse">
        <div class="search-result-ref">${UI.escapeHTML(v.book || (getBookById(v.bookId) || {}).name || '')} ${v.chapter}:${v.verse}
          <span class="pill">${UI.escapeHTML(version ? version.short : v.version)}</span></div>
        <p class="search-result-text">${UI.escapeHTML(v.text)}</p>
        ${note ? `<p class="note-preview"><strong>Note:</strong> ${UI.escapeHTML(note.note)}</p>` : ''}
        <div class="btn-row">
          <button class="btn btn-secondary" data-open>Open</button>
          ${options.removable ? '<button class="btn btn-secondary" data-remove>Remove</button>' : ''}
        </div>
      </div>
    `;
  }

  function wireCard(el, v) {
    el.querySelector('[data-open]').addEventListener('click', () => {
      Reader.openLocation(v.version, v.bookId, v.chapter, v.verse);
      App.goTo('bible');
    });
    const removeBtn = el.querySelector('[data-remove]');
    if (removeBtn) removeBtn.addEventListener('click', () => {
      Storage.removeSaved(v);
      render(document.getElementById('page-content'));
    });
  }

  function noteCard(n) {
    const version = getVersionById(n.version);
    return `
      <div class="card saved-verse">
        <div class="search-result-ref">${UI.escapeHTML(n.book || (getBookById(n.bookId) || {}).name || '')} ${n.chapter}:${n.verse}
          <span class="pill">${UI.escapeHTML(version ? version.short : n.version)}</span></div>
        <p class="search-result-text">${UI.escapeHTML(n.text || '')}</p>
        <p class="note-preview"><strong>Note:</strong> ${UI.escapeHTML(n.note)}</p>
        <div class="btn-row">
          <button class="btn btn-secondary" data-open>Open</button>
          <button class="btn btn-secondary" data-remove>Delete Note</button>
        </div>
      </div>
    `;
  }

  function renderNotesSection() {
    const notes = Storage.getNotes().sort((a, b) => b.timestamp - a.timestamp);
    const wrapper = document.createElement('section');
    wrapper.className = 'card';
    if (notes.length === 0) {
      wrapper.innerHTML = '<h2>Notes</h2><p class="hint-text">No notes yet — tap any verse in the reader, then "Add Note."</p>';
      return wrapper;
    }
    wrapper.innerHTML = '<h2>Notes</h2>';
    notes.forEach((n) => {
      const div = document.createElement('div');
      div.innerHTML = noteCard(n);
      const cardEl = div.firstElementChild;
      cardEl.querySelector('[data-open]').addEventListener('click', () => {
        Reader.openLocation(n.version, n.bookId, n.chapter, n.verse);
        App.goTo('bible');
      });
      cardEl.querySelector('[data-remove]').addEventListener('click', () => {
        Storage.deleteNote(n);
        render(document.getElementById('page-content'));
      });
      wrapper.appendChild(cardEl);
    });
    return wrapper;
  }

  function section(title, items, emptyText, removable) {
    const wrapper = document.createElement('section');
    wrapper.className = 'card';
    if (items.length === 0) {
      wrapper.innerHTML = `<h2>${title}</h2><p class="hint-text">${emptyText}</p>`;
      return wrapper;
    }
    wrapper.innerHTML = `<h2>${title}</h2>`;
    items.forEach((v) => {
      const div = document.createElement('div');
      div.innerHTML = verseCard(v, { removable });
      const cardEl = div.firstElementChild;
      wireCard(cardEl, v);
      wrapper.appendChild(cardEl);
    });
    return wrapper;
  }

  function render(container) {
    const saved = Storage.getSaved();
    const bookmarked = saved.filter((s) => s.bookmarked).sort((a, b) => b.timestamp - a.timestamp);
    const favorited = saved.filter((s) => s.favorited).sort((a, b) => b.timestamp - a.timestamp);

    container.innerHTML = '<h1 class="page-title">Bookmarks, Favorites &amp; Notes</h1>';
    container.appendChild(section('Bookmarks', bookmarked, 'No bookmarks yet — tap any verse in the reader to bookmark it.', true));
    container.appendChild(section('Favorites', favorited, 'No favorites yet — tap any verse in the reader to favorite it.', true));
    container.appendChild(renderNotesSection());
  }

  return { render };
})();
