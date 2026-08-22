/**
 * bible-data.js
 * Static reference data: the 66 canonical books (with correct chapter counts
 * and the 3-letter book IDs used by the bible-api.com data endpoint), and the
 * list of supported translations.
 *
 * This file has NO network calls and NO UI code — it is pure data, so the
 * rest of the app can rely on it being correct and instantly available.
 */

const BIBLE_BOOKS = [
  // Old Testament
  { id: 'GEN', name: 'Genesis', testament: 'OT', chapters: 50 },
  { id: 'EXO', name: 'Exodus', testament: 'OT', chapters: 40 },
  { id: 'LEV', name: 'Leviticus', testament: 'OT', chapters: 27 },
  { id: 'NUM', name: 'Numbers', testament: 'OT', chapters: 36 },
  { id: 'DEU', name: 'Deuteronomy', testament: 'OT', chapters: 34 },
  { id: 'JOS', name: 'Joshua', testament: 'OT', chapters: 24 },
  { id: 'JDG', name: 'Judges', testament: 'OT', chapters: 21 },
  { id: 'RUT', name: 'Ruth', testament: 'OT', chapters: 4 },
  { id: '1SA', name: '1 Samuel', testament: 'OT', chapters: 31 },
  { id: '2SA', name: '2 Samuel', testament: 'OT', chapters: 24 },
  { id: '1KI', name: '1 Kings', testament: 'OT', chapters: 22 },
  { id: '2KI', name: '2 Kings', testament: 'OT', chapters: 25 },
  { id: '1CH', name: '1 Chronicles', testament: 'OT', chapters: 29 },
  { id: '2CH', name: '2 Chronicles', testament: 'OT', chapters: 36 },
  { id: 'EZR', name: 'Ezra', testament: 'OT', chapters: 10 },
  { id: 'NEH', name: 'Nehemiah', testament: 'OT', chapters: 13 },
  { id: 'EST', name: 'Esther', testament: 'OT', chapters: 10 },
  { id: 'JOB', name: 'Job', testament: 'OT', chapters: 42 },
  { id: 'PSA', name: 'Psalms', testament: 'OT', chapters: 150 },
  { id: 'PRO', name: 'Proverbs', testament: 'OT', chapters: 31 },
  { id: 'ECC', name: 'Ecclesiastes', testament: 'OT', chapters: 12 },
  { id: 'SNG', name: 'Song of Solomon', testament: 'OT', chapters: 8 },
  { id: 'ISA', name: 'Isaiah', testament: 'OT', chapters: 66 },
  { id: 'JER', name: 'Jeremiah', testament: 'OT', chapters: 52 },
  { id: 'LAM', name: 'Lamentations', testament: 'OT', chapters: 5 },
  { id: 'EZK', name: 'Ezekiel', testament: 'OT', chapters: 48 },
  { id: 'DAN', name: 'Daniel', testament: 'OT', chapters: 12 },
  { id: 'HOS', name: 'Hosea', testament: 'OT', chapters: 14 },
  { id: 'JOL', name: 'Joel', testament: 'OT', chapters: 3 },
  { id: 'AMO', name: 'Amos', testament: 'OT', chapters: 9 },
  { id: 'OBA', name: 'Obadiah', testament: 'OT', chapters: 1 },
  { id: 'JON', name: 'Jonah', testament: 'OT', chapters: 4 },
  { id: 'MIC', name: 'Micah', testament: 'OT', chapters: 7 },
  { id: 'NAM', name: 'Nahum', testament: 'OT', chapters: 3 },
  { id: 'HAB', name: 'Habakkuk', testament: 'OT', chapters: 3 },
  { id: 'ZEP', name: 'Zephaniah', testament: 'OT', chapters: 3 },
  { id: 'HAG', name: 'Haggai', testament: 'OT', chapters: 2 },
  { id: 'ZEC', name: 'Zechariah', testament: 'OT', chapters: 14 },
  { id: 'MAL', name: 'Malachi', testament: 'OT', chapters: 4 },
  // New Testament
  { id: 'MAT', name: 'Matthew', testament: 'NT', chapters: 28 },
  { id: 'MRK', name: 'Mark', testament: 'NT', chapters: 16 },
  { id: 'LUK', name: 'Luke', testament: 'NT', chapters: 24 },
  { id: 'JHN', name: 'John', testament: 'NT', chapters: 21 },
  { id: 'ACT', name: 'Acts', testament: 'NT', chapters: 28 },
  { id: 'ROM', name: 'Romans', testament: 'NT', chapters: 16 },
  { id: '1CO', name: '1 Corinthians', testament: 'NT', chapters: 16 },
  { id: '2CO', name: '2 Corinthians', testament: 'NT', chapters: 13 },
  { id: 'GAL', name: 'Galatians', testament: 'NT', chapters: 6 },
  { id: 'EPH', name: 'Ephesians', testament: 'NT', chapters: 6 },
  { id: 'PHP', name: 'Philippians', testament: 'NT', chapters: 4 },
  { id: 'COL', name: 'Colossians', testament: 'NT', chapters: 4 },
  { id: '1TH', name: '1 Thessalonians', testament: 'NT', chapters: 5 },
  { id: '2TH', name: '2 Thessalonians', testament: 'NT', chapters: 3 },
  { id: '1TI', name: '1 Timothy', testament: 'NT', chapters: 6 },
  { id: '2TI', name: '2 Timothy', testament: 'NT', chapters: 4 },
  { id: 'TIT', name: 'Titus', testament: 'NT', chapters: 3 },
  { id: 'PHM', name: 'Philemon', testament: 'NT', chapters: 1 },
  { id: 'HEB', name: 'Hebrews', testament: 'NT', chapters: 13 },
  { id: 'JAS', name: 'James', testament: 'NT', chapters: 5 },
  { id: '1PE', name: '1 Peter', testament: 'NT', chapters: 5 },
  { id: '2PE', name: '2 Peter', testament: 'NT', chapters: 3 },
  { id: '1JN', name: '1 John', testament: 'NT', chapters: 5 },
  { id: '2JN', name: '2 John', testament: 'NT', chapters: 1 },
  { id: '3JN', name: '3 John', testament: 'NT', chapters: 1 },
  { id: 'JUD', name: 'Jude', testament: 'NT', chapters: 1 },
  { id: 'REV', name: 'Revelation', testament: 'NT', chapters: 22 },
];

// Only translations verified as public domain / freely redistributable on
// bible-api.com (see README for the verification notes and source link).
const BIBLE_VERSIONS = [
  { id: 'kjv', name: 'King James Version', short: 'KJV' },
  { id: 'asv', name: 'American Standard Version', short: 'ASV' },
  { id: 'web', name: 'World English Bible', short: 'WEB' },
];

function getBookById(bookId) {
  return BIBLE_BOOKS.find((b) => b.id === bookId) || null;
}

function getVersionById(versionId) {
  return BIBLE_VERSIONS.find((v) => v.id === versionId) || null;
}

// Given a book + chapter, return the previous and next {bookId, chapter}
// locations, correctly crossing book boundaries. Returns null at the very
// start (Genesis 1) or very end (Revelation 22).
function getAdjacentChapter(bookId, chapter, direction) {
  const index = BIBLE_BOOKS.findIndex((b) => b.id === bookId);
  if (index === -1) return null;
  const book = BIBLE_BOOKS[index];

  if (direction === 'prev') {
    if (chapter > 1) return { bookId: book.id, chapter: chapter - 1 };
    const prevBook = BIBLE_BOOKS[index - 1];
    if (!prevBook) return null;
    return { bookId: prevBook.id, chapter: prevBook.chapters };
  }

  if (direction === 'next') {
    if (chapter < book.chapters) return { bookId: book.id, chapter: chapter + 1 };
    const nextBook = BIBLE_BOOKS[index + 1];
    if (!nextBook) return null;
    return { bookId: nextBook.id, chapter: 1 };
  }

  return null;
}
