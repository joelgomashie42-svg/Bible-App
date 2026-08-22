/**
 * home.js — renders the Home page.
 */

const Home = (() => {
  // A small rotating pool used to pick a "verse of the day" deterministically
  // by date (so it's the same all day, and different on different days).
  const VOTD_POOL = [
    { bookId: 'JHN', book: 'John', chapter: 3, verse: 16 },
    { bookId: 'PSA', book: 'Psalms', chapter: 23, verse: 1 },
    { bookId: 'PRO', book: 'Proverbs', chapter: 3, verse: 5 },
    { bookId: 'ISA', book: 'Isaiah', chapter: 41, verse: 10 },
    { bookId: 'ROM', book: 'Romans', chapter: 8, verse: 28 },
    { bookId: 'PHP', book: 'Philippians', chapter: 4, verse: 13 },
    { bookId: 'JOS', book: 'Joshua', chapter: 1, verse: 9 },
    { bookId: 'MAT', book: 'Matthew', chapter: 11, verse: 28 },
    { bookId: '1CO', book: '1 Corinthians', chapter: 13, verse: 4 },
    { bookId: 'JER', book: 'Jeremiah', chapter: 29, verse: 11 },
  ];

  function pickVerseOfDay() {
    const dayNumber = Math.floor(Date.now() / 86400000);
    return VOTD_POOL[dayNumber % VOTD_POOL.length];
  }

  function shell() {
    return `
      <section class="card hero-card">
        <h1>Welcome to Bible App</h1>
        <p class="tagline">Grow in Grace &amp; Truth</p>
      </section>

      <section class="card" id="continue-reading-card"></section>

      <section class="card" id="votd-card">
        <h2>Verse of the Day</h2>
        <p class="loading-text">Loading verse…</p>
      </section>

      <section class="card">
        <h2>Quick Access</h2>
        <div class="quick-grid">
          <button class="quick-btn" data-quick="ot">Old Testament</button>
          <button class="quick-btn" data-quick="nt">New Testament</button>
          <button class="quick-btn" data-quick="search">Search Bible</button>
          <button class="quick-btn" data-quick="bookmarks">Bookmarks</button>
        </div>
      </section>

      <section class="card" id="stats-card"></section>
    `;
  }

  function renderContinueReading(container) {
    const history = Storage.getHistory();
    const el = container.querySelector('#continue-reading-card');
    if (history.last) {
      const version = getVersionById(history.last.version);
      el.innerHTML = `
        <h2>Continue Reading</h2>
        <p class="continue-ref">${UI.escapeHTML(history.last.book)} ${history.last.chapter}
          <span class="pill">${UI.escapeHTML(version ? version.short : history.last.version)}</span></p>
        <button class="btn btn-primary" id="continue-btn">Continue Reading</button>
      `;
      el.querySelector('#continue-btn').addEventListener('click', () => {
        Reader.openLocation(history.last.version, history.last.bookId, history.last.chapter);
        App.goTo('bible');
      });
    } else {
      el.innerHTML = `
        <h2>Start Reading</h2>
        <p>Begin your journey through Scripture today.</p>
        <button class="btn btn-primary" id="start-btn">Start Reading</button>
      `;
      el.querySelector('#start-btn').addEventListener('click', () => {
        Reader.openLocation('kjv', 'GEN', 1);
        App.goTo('bible');
      });
    }
  }

  async function renderVerseOfDay(container) {
    const el = container.querySelector('#votd-card');
    const pick = pickVerseOfDay();
    const settings = Storage.getSettings();
    const version = getVersionById(settings.version) || BIBLE_VERSIONS[0];

    try {
      const { data } = await BibleAPI.fetchChapter(version.id, pick.bookId, pick.chapter);
      const verseObj = data.verses.find((v) => v.number === pick.verse);
      if (!verseObj) throw new Error('Verse not found in chapter');

      el.innerHTML = `
        <h2>Verse of the Day</h2>
        <blockquote class="votd-text">${UI.escapeHTML(verseObj.text)}</blockquote>
        <p class="votd-ref">${UI.escapeHTML(pick.book)} ${pick.chapter}:${pick.verse}
          <span class="pill">${UI.escapeHTML(version.short)}</span></p>
        <div class="btn-row">
          <button class="btn btn-secondary" id="votd-copy">Copy</button>
          <button class="btn btn-secondary" id="votd-share">Share</button>
          <button class="btn btn-secondary" id="votd-open">Open</button>
        </div>
      `;
      el.querySelector('#votd-copy').addEventListener('click', () =>
        UI.copyVerse(pick.book, pick.chapter, pick.verse, verseObj.text, version.short));
      el.querySelector('#votd-share').addEventListener('click', () =>
        UI.shareVerse(pick.book, pick.chapter, pick.verse, verseObj.text, version.short));
      el.querySelector('#votd-open').addEventListener('click', () => {
        Reader.openLocation(version.id, pick.bookId, pick.chapter, pick.verse);
        App.goTo('bible');
      });
    } catch (err) {
      console.error('Verse of the day failed to load:', err);
      el.innerHTML = `
        <h2>Verse of the Day</h2>
        <p class="error-text">Unable to load today's verse. ${navigator.onLine ? 'Please try again shortly.' : 'You appear to be offline.'}</p>
      `;
    }
  }

  function renderStats(container) {
    const stats = Storage.getStats();
    const saved = Storage.getSaved();
    const el = container.querySelector('#stats-card');
    el.innerHTML = `
      <h2>Reading Stats</h2>
      <div class="stats-grid">
        <div class="stat"><span class="stat-num">${stats.chaptersRead.length}</span><span class="stat-label">Chapters Read</span></div>
        <div class="stat"><span class="stat-num">${saved.filter((s) => s.bookmarked).length}</span><span class="stat-label">Verses Bookmarked</span></div>
        <div class="stat"><span class="stat-num">${stats.streak}</span><span class="stat-label">Day Streak</span></div>
      </div>
    `;
  }

  function wireQuickAccess(container) {
    container.querySelectorAll('[data-quick]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.quick;
        if (action === 'ot') { Reader.openLocation(Storage.getSettings().version, 'GEN', 1); App.goTo('bible'); }
        else if (action === 'nt') { Reader.openLocation(Storage.getSettings().version, 'MAT', 1); App.goTo('bible'); }
        else if (action === 'search') { App.goTo('search'); }
        else if (action === 'bookmarks') { App.goTo('bookmarks'); }
      });
    });
  }

  function render(container) {
    container.innerHTML = shell();
    renderContinueReading(container);
    renderVerseOfDay(container);
    renderStats(container);
    wireQuickAccess(container);
  }

  return { render };
})();
