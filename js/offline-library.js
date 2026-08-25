/**
 * offline-library.js
 * Shared logic for downloading an entire translation into the local
 * IndexedDB cache (via BibleAPI) so the app can be used with zero network
 * requests afterward. Both the Settings page and the Search page use this
 * same module, so a download started from one place is reflected in both.
 *
 * Respects bible-api.com's fair-use rate limit (15 requests / 30s) by
 * waiting between requests instead of firing them all at once.
 */

const OfflineLibrary = (() => {
  const REQUEST_DELAY_MS = 2200; // ~1 request per 2.2s, well under the limit
  const state = {}; // versionId -> { downloading, cancelled, listeners: Set }

  function getState(versionId) {
    if (!state[versionId]) {
      state[versionId] = { downloading: false, cancelled: false, listeners: new Set() };
    }
    return state[versionId];
  }

  function booksForVersion(versionId) {
    const version = getVersionById(versionId);
    return version && version.ntOnly ? BIBLE_BOOKS.filter((b) => b.testament === 'NT') : BIBLE_BOOKS;
  }

  function totalChapterCount(versionId) {
    return booksForVersion(versionId).reduce((sum, b) => sum + b.chapters, 0);
  }

  async function getProgress(versionId) {
    const cached = await BibleAPI.getAllCachedChapters();
    const downloaded = cached.filter((c) => c.version === versionId).length;
    const total = totalChapterCount(versionId);
    return {
      downloaded,
      total,
      complete: downloaded >= total,
      downloading: getState(versionId).downloading,
    };
  }

  function isDownloading(versionId) {
    return getState(versionId).downloading;
  }

  function onProgress(versionId, callback) {
    getState(versionId).listeners.add(callback);
    return () => getState(versionId).listeners.delete(callback);
  }

  function notify(versionId) {
    getState(versionId).listeners.forEach((cb) => cb());
  }

  async function startDownload(versionId) {
    const s = getState(versionId);
    if (s.downloading) return;
    s.downloading = true;
    s.cancelled = false;
    notify(versionId);

    for (const book of booksForVersion(versionId)) {
      for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
        if (s.cancelled) break;
        const already = await BibleAPI.getCachedChapter(versionId, book.id, chapter);
        if (!already) {
          try {
            await BibleAPI.fetchChapter(versionId, book.id, chapter);
          } catch (err) {
            console.error(`Offline library download: failed on ${book.id} ${chapter}`, err);
          }
          notify(versionId);
          await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
        }
      }
      if (s.cancelled) break;
    }

    s.downloading = false;
    notify(versionId);
  }

  function cancelDownload(versionId) {
    const s = getState(versionId);
    s.cancelled = true;
  }

  return { getProgress, isDownloading, startDownload, cancelDownload, onProgress, totalChapterCount };
})();
