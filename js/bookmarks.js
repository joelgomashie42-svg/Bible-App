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

    container.innerHTML = '<h1 class="page-title">Bookmarks &amp; Favorites</h1>';
    container.appendChild(section('Bookmarks', bookmarked, 'No bookmarks yet — tap any verse in the reader to bookmark it.', true));
    container.appendChild(section('Favorites', favorited, 'No favorites yet — tap any verse in the reader to favorite it.', true));
  }

  return { render };
})();
