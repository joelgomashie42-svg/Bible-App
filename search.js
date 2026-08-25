/**
 * search.js — searches Scripture that has been cached locally. Every
 * chapter opened in the reader is saved automatically; for full-Bible
 * search, point people at "Download for Offline Use" in Settings (More),
 * which downloads everything via js/offline-library.js.
 */

const Search = (() => {
  function shell() {
    return `
      <section class="card">
        <h1>Search Scripture</h1>
        <div class="control-group">
          <label for="search-input">Search words or phrases</label>
          <input type="search" id="search-input" placeholder="e.g. love, faith" autocomplete="off" />
        </div>
        <div class="control-group">
          <label for="search-version">In translation</label>
          <select id="search-version"></select>
        </div>
      </section>

      <section class="card" id="index-status-card"></section>

      <section id="search-results"></section>
    `;
  }

  async function renderIndexStatus(container) {
    const el = container.querySelector('#index-status-card');
    const versionId = container.querySelector('#search-version').value;
    const progress = await OfflineLibrary.getProgress(versionId);

    if (progress.complete) {
      el.innerHTML = `<p class="index-status-text">\u2713 This translation is fully downloaded — search covers the whole Bible, offline.</p>`;
      return;
    }

    el.innerHTML = `
      <p class="index-status-text">
        Search covers <strong>${progress.downloaded} of ${progress.total}</strong> chapters cached for this translation
        (everything you've read, plus anything downloaded).
      </p>
      <div class="btn-row">
        <button class="btn btn-secondary" id="download-btn" ${progress.downloading ? 'disabled' : ''}>
          ${progress.downloading ? 'Downloading…' : 'Download Full Bible for Offline Search'}
        </button>
        ${progress.downloading ? '<button class="btn btn-secondary" id="stop-download-btn">Stop</button>' : ''}
      </div>
    `;

    const dlBtn = el.querySelector('#download-btn');
    if (dlBtn) dlBtn.addEventListener('click', () => OfflineLibrary.startDownload(versionId));
    const stopBtn = el.querySelector('#stop-download-btn');
    if (stopBtn) stopBtn.addEventListener('click', () => OfflineLibrary.cancelDownload(versionId));
  }

  function highlightMatch(text, query) {
    const escaped = UI.escapeHTML(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const re = new RegExp(`(${escapedQuery})`, 'ig');
      return escaped.replace(re, '<mark>$1</mark>');
    } catch {
      return escaped;
    }
  }

  async function runSearch(container) {
    const query = container.querySelector('#search-input').value.trim();
    const versionId = container.querySelector('#search-version').value;
    const resultsEl = container.querySelector('#search-results');

    if (query.length < 2) {
      resultsEl.innerHTML = '<p class="hint-text">Type at least 2 characters to search.</p>';
      return;
    }

    resultsEl.innerHTML = '<p class="loading-text">Searching…</p>';
    const cachedChapters = (await BibleAPI.getAllCachedChapters()).filter((c) => c.version === versionId);

    const matches = [];
    cachedChapters.forEach((entry) => {
      const book = getBookById(entry.bookId);
      entry.data.verses.forEach((v) => {
        if (v.text.toLowerCase().includes(query.toLowerCase())) {
          matches.push({ book, chapter: entry.chapter, verse: v.number, text: v.text, version: versionId });
        }
      });
    });

    if (matches.length === 0) {
      resultsEl.innerHTML = `
        <p class="hint-text">No matches in your cached Scripture yet. Try opening more chapters in the
        reader, or use "Download Full Bible for Offline Search" above.</p>
      `;
      return;
    }

    const version = getVersionById(versionId);
    resultsEl.innerHTML = `<p class="hint-text">${matches.length} result${matches.length === 1 ? '' : 's'}</p>` +
      matches.slice(0, 200).map((m) => `
        <button class="card search-result" data-book="${m.book.id}" data-chapter="${m.chapter}" data-verse="${m.verse}">
          <div class="search-result-ref">${UI.escapeHTML(m.book.name)} ${m.chapter}:${m.verse}
            <span class="pill">${UI.escapeHTML(version.short)}</span></div>
          <div class="search-result-text">${highlightMatch(m.text, query)}</div>
        </button>
      `).join('');

    resultsEl.querySelectorAll('.search-result').forEach((btn) => {
      btn.addEventListener('click', () => {
        Reader.openLocation(versionId, btn.dataset.book, Number(btn.dataset.chapter), Number(btn.dataset.verse));
        App.goTo('bible');
      });
    });
  }

  function render(container) {
    container.innerHTML = shell();
    const settings = Storage.getSettings();
    const versionSelect = container.querySelector('#search-version');
    versionSelect.innerHTML = BIBLE_VERSIONS.map((v) =>
      `<option value="${v.id}">${UI.escapeHTML(v.short)}</option>`).join('');
    versionSelect.value = settings.version;

    renderIndexStatus(container);
    let unsubscribe = OfflineLibrary.onProgress(versionSelect.value, () => renderIndexStatus(container));

    let debounceTimer = null;
    container.querySelector('#search-input').addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runSearch(container), 300);
    });
    versionSelect.addEventListener('change', () => {
      unsubscribe();
      renderIndexStatus(container);
      unsubscribe = OfflineLibrary.onProgress(versionSelect.value, () => renderIndexStatus(container));
      runSearch(container);
    });
  }

  return { render };
})();
