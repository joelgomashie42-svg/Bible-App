/**
 * bible-api.js
 * The ONLY file that knows about the external Bible data source.
 * Every other module talks to normalized {book, bookId, chapter, verses:[{number,text}]}
 * objects and never touches the raw API shape.
 *
 * Data source: https://bible-api.com (verified: public JSON API, CORS-enabled,
 * public-domain translations kjv/asv/web). See README.md for verification notes.
 */

const BibleAPI = (() => {
  const BASE_URL = 'https://bible-api.com';
  const DB_NAME = 'bibleapp-cache';
  const DB_VERSION = 1;
  const STORE_CHAPTERS = 'chapters';

  let dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        resolve(null); // No IndexedDB support — app still works online-only.
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_CHAPTERS)) {
          db.createObjectStore(STORE_CHAPTERS, { keyPath: 'key' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null); // Fail soft — caching is a nice-to-have.
    });
    return dbPromise;
  }

  function cacheKey(version, bookId, chapter) {
    return `${version}/${bookId}/${chapter}`;
  }

  async function getCachedChapter(version, bookId, chapter) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const store = tx.objectStore(STORE_CHAPTERS);
      const req = store.get(cacheKey(version, bookId, chapter));
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  }

  async function setCachedChapter(version, bookId, chapter, data) {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_CHAPTERS, 'readwrite');
    tx.objectStore(STORE_CHAPTERS).put({
      key: cacheKey(version, bookId, chapter),
      version, bookId, chapter,
      data,
      savedAt: Date.now(),
    });
  }

  async function getAllCachedChapters() {
    const db = await openDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CHAPTERS, 'readonly');
      const req = tx.objectStore(STORE_CHAPTERS).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  // Cleans up the raw text bible-api.com returns (it includes stray leading/
  // trailing newlines and occasional mid-verse line breaks from poetic
  // formatting) into a single readable line.
  function cleanText(rawText) {
    if (typeof rawText !== 'string') return '';
    return rawText.replace(/\s+/g, ' ').trim();
  }

  // Converts the raw bible-api.com chapter response into the shape the UI
  // expects. Never trusts the API to have exactly the fields we want.
  function normalizeChapter(raw, bookId, chapter, versionId) {
    const rawVerses = Array.isArray(raw && raw.verses) ? raw.verses : [];
    const verses = rawVerses
      .map((v) => ({
        number: Number(v && v.verse),
        text: cleanText(v && v.text),
      }))
      .filter((v) => Number.isFinite(v.number) && v.text.length > 0);

    if (verses.length === 0) {
      throw new Error('No verses found in response');
    }

    return {
      version: versionId,
      bookId,
      chapter: Number(chapter),
      verses,
    };
  }

  /**
   * Fetch a chapter. Tries the network first (so content stays fresh while
   * online), falls back to the IndexedDB cache when offline or on failure.
   * Always returns a normalized chapter object, or throws if nothing is
   * available from either source.
   */
  async function fetchChapter(versionId, bookId, chapter) {
    const url = `${BASE_URL}/data/${versionId}/${bookId}/${chapter}`;

    if (navigator.onLine) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        const normalized = normalizeChapter(raw, bookId, chapter, versionId);
        setCachedChapter(versionId, bookId, chapter, normalized); // fire and forget
        return { data: normalized, fromCache: false };
      } catch (err) {
        console.error('Bible API fetch failed, trying cache:', err);
      }
    }

    const cached = await getCachedChapter(versionId, bookId, chapter);
    if (cached) return { data: cached, fromCache: true };

    throw new Error('OFFLINE_NO_CACHE');
  }

  return {
    fetchChapter,
    getCachedChapter,
    getAllCachedChapters,
  };
})();
