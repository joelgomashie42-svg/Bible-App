/**
 * storage.js
 * All localStorage read/write logic lives here. Nothing else in the app
 * should call localStorage directly — this keeps the data shape in one
 * place and makes it easy to migrate to IndexedDB later if needed.
 */

const Storage = (() => {
  const KEYS = {
    SETTINGS: 'bibleapp_settings',
    SAVED: 'bibleapp_saved',       // bookmarks + favorites (one record per verse)
    NOTES: 'bibleapp_notes',
    HISTORY: 'bibleapp_history',
    STATS: 'bibleapp_stats',
  };

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (err) {
      console.error(`Storage: failed to read ${key}`, err);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Storage: failed to write ${key}`, err);
    }
  }

  // ---------- Settings ----------
  const DEFAULT_SETTINGS = {
    version: 'kjv',
    fontSize: 'medium',      // small | medium | large | xlarge
    lineSpacing: 'normal',   // compact | normal | relaxed
    theme: 'system',         // light | dark | system
  };

  function getSettings() {
    return { ...DEFAULT_SETTINGS, ...readJSON(KEYS.SETTINGS, {}) };
  }

  function updateSettings(patch) {
    const next = { ...getSettings(), ...patch };
    writeJSON(KEYS.SETTINGS, next);
    return next;
  }

  // ---------- Saved verses (bookmarks + favorites share one record) ----------
  function verseKey(v) {
    return `${v.version}/${v.bookId}/${v.chapter}/${v.verse}`;
  }

  function getSaved() {
    return readJSON(KEYS.SAVED, []);
  }

  function findSaved(v) {
    return getSaved().find((s) => verseKey(s) === verseKey(v)) || null;
  }

  function toggleBookmark(verse) {
    const list = getSaved();
    const key = verseKey(verse);
    const idx = list.findIndex((s) => verseKey(s) === key);
    if (idx === -1) {
      list.push({ ...verse, bookmarked: true, favorited: false, timestamp: Date.now() });
    } else {
      list[idx].bookmarked = !list[idx].bookmarked;
      if (!list[idx].bookmarked && !list[idx].favorited) list.splice(idx, 1);
    }
    writeJSON(KEYS.SAVED, list);
    return getSaved();
  }

  function toggleFavorite(verse) {
    const list = getSaved();
    const key = verseKey(verse);
    const idx = list.findIndex((s) => verseKey(s) === key);
    if (idx === -1) {
      list.push({ ...verse, bookmarked: false, favorited: true, timestamp: Date.now() });
    } else {
      list[idx].favorited = !list[idx].favorited;
      if (!list[idx].bookmarked && !list[idx].favorited) list.splice(idx, 1);
    }
    writeJSON(KEYS.SAVED, list);
    return getSaved();
  }

  function removeSaved(verse) {
    const list = getSaved().filter((s) => verseKey(s) !== verseKey(verse));
    writeJSON(KEYS.SAVED, list);
    return list;
  }

  // ---------- Notes ----------
  function getNotes() {
    return readJSON(KEYS.NOTES, []);
  }

  function getNoteFor(verse) {
    return getNotes().find((n) => verseKey(n) === verseKey(verse)) || null;
  }

  function saveNote(verse, text) {
    const list = getNotes();
    const idx = list.findIndex((n) => verseKey(n) === verseKey(verse));
    const trimmed = (text || '').trim();
    if (idx === -1) {
      if (trimmed) list.push({ ...verse, note: trimmed, timestamp: Date.now() });
    } else if (trimmed) {
      list[idx].note = trimmed;
      list[idx].timestamp = Date.now();
    } else {
      list.splice(idx, 1); // empty text deletes the note
    }
    writeJSON(KEYS.NOTES, list);
    return getNotes();
  }

  function deleteNote(verse) {
    const list = getNotes().filter((n) => verseKey(n) !== verseKey(verse));
    writeJSON(KEYS.NOTES, list);
    return list;
  }

  // ---------- Reading history / "continue reading" ----------
  function getHistory() {
    return readJSON(KEYS.HISTORY, { last: null, log: [] });
  }

  function recordVisit(location) {
    const history = getHistory();
    history.last = { ...location, timestamp: Date.now() };
    history.log = [history.last, ...history.log.filter((l) =>
      !(l.version === location.version && l.bookId === location.bookId && l.chapter === location.chapter)
    )].slice(0, 20);
    writeJSON(KEYS.HISTORY, history);
    recordChapterRead(location);
    return history;
  }

  // ---------- Reading stats ----------
  function getStats() {
    return readJSON(KEYS.STATS, { chaptersRead: [], lastReadDate: null, streak: 0 });
  }

  function recordChapterRead(location) {
    const stats = getStats();
    const chapterKey = `${location.version}/${location.bookId}/${location.chapter}`;
    if (!stats.chaptersRead.includes(chapterKey)) {
      stats.chaptersRead.push(chapterKey);
    }

    const today = new Date().toDateString();
    if (stats.lastReadDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      stats.streak = stats.lastReadDate === yesterday ? stats.streak + 1 : 1;
      stats.lastReadDate = today;
    }

    writeJSON(KEYS.STATS, stats);
    return stats;
  }

  return {
    getSettings, updateSettings,
    getSaved, findSaved, toggleBookmark, toggleFavorite, removeSaved,
    getNotes, getNoteFor, saveNote, deleteNote,
    getHistory, recordVisit,
    getStats,
    verseKey,
  };
})();
