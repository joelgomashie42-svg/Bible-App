/**
 * search.js — searches Scripture that has already been cached locally
 * (every chapter the reader has opened is saved to IndexedDB). Includes an
 * optional, rate-limit-respecting background download to grow the local
 * library so search coverage improves over time.
 *
 * Note: bible-api.com's terms ask that it not be used to bulk-download the
 * whole Bible in one go, so the background download deliberately waits
 * between requests instead of firing them all at once.
 */

const Search = (() => {
  let building = false;
  let cancelBuild = false;

  function shell() {
    return `
      <section class="card">
        <h1>Search Scripture</h1>
        <div class="control-group">
          <label for="search-input">Search words or phrases</label>
          <input type="search" id="search-input" placeholder="e.g. love, faith, John 3:16" autocomplete="off" />
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
    const cached = await BibleAPI.getAllCachedChapters();
    const totalChapters = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0);
    const version = container.querySelector('#search-version').value;
    const cachedForVersion = cached.filter((c) => c.version === version).length;

    el.innerHTML = `
      <p class="index-status-text">
        Search only covers chapters you've already opened, plus anything saved for offline use:
        <strong>${cachedForVersion} of ${totalChapters}</strong> chapters cached for this translation.
      </p>
      <button class="btn btn-secondary" id="build-index-btn" ${building ? 'disabled' : ''}>
        ${building ? 'Building offline library…' : 'Build offline library (slow, respects fair-use limits)'}
      </button>
      ${building ? '<button class="btn btn-secondary" id="cancel-build-btn">Stop</button>' : ''}
    `;

    el.querySelector('#build-index-btn').addEventListener('click', () => startBuild(container));
    const cancelBtn = el.querySelector('#cancel-build-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { cancelBuild = true; });
  }

  async function startBuild(container) {
    if (building) return;
    building = true;
    cancelBuild = false;
    const versionId = container.querySelector('#search-version').value;
    renderIndexStatus(container);

    for (const book of BIBLE_BOOKS) {
      for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
        if (cancelBuild) break;
        const already = await BibleAPI.getCachedChapter(versionId, book.id, chapter);
        if (!already) {
          try {
            await BibleAPI.fetchChapter(versionId, book.id, chapter);
          } catch (err) {
            console.error(`Build offline library: failed on ${book.id} ${chapter}`, err);
          }
          // Respect bible-api.com's fair-use rate limit (15 requests / 30s).
          await new Promise((resolve) => setTimeout(resolve, 2200));
        }
      }
      if (cancelBuild) break;
      renderIndexStatus(container); // update progress after each book
    }

    building = false;
    renderIndexStatus(container);
    if (!cancelBuild) UI.toast('Offline library build complete for this translation.');
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
        reader, or use "Build offline library" above to expand what can be searched.</p>
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

    let debounceTimer = null;
    container.querySelector('#search-input').addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => runSearch(container), 300);
    });
    versionSelect.addEventListener('change', () => {
      renderIndexStatus(container);
      runSearch(container);
    });
  }

  return { render };
})();
