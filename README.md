# Bible App

**Grow in Grace & Truth**

A modern, installable Progressive Web App (PWA) for reading, searching, and reflecting on Scripture — built with plain HTML, CSS, and JavaScript so it's easy to host on GitHub Pages and easy to maintain.

## Features

- Read all 66 books of the Bible, in King James Version (KJV), American Standard Version (ASV), or World English Bible (WEB)
- Chapter-by-chapter reading with Previous/Next navigation that correctly crosses book boundaries
- Bookmark verses, favorite verses, and attach personal notes
- Copy or share any verse (with graceful fallback if the Web Share API isn't available)
- Search Scripture (see "How search works" below)
- Adjustable text size and line spacing, plus light/dark/system theme
- "Continue Reading," a Verse of the Day, and basic reading stats on the Home page
- Installable as a PWA, with offline reading for any chapter you've already opened
- Clean error states — the app never shows "undefined" if data fails to load

## Technology used

Vanilla HTML, CSS, and JavaScript. No build step, no frameworks, no npm dependencies. Data persistence uses `localStorage` (settings, bookmarks, favorites, notes, history, stats) and `IndexedDB` (cached Bible chapters, for offline reading and search).

## Bible data source & translation licensing

Scripture text is served live from **[bible-api.com](https://bible-api.com)**, a free, no-key-required, CORS-enabled JSON API maintained by Tim Morgan (open source at [github.com/seven1m/bible_api](https://github.com/seven1m/bible_api)).

This app only requests translations that bible-api.com itself marks **"Public Domain"**:

| Translation | ID | Status |
|---|---|---|
| King James Version | `kjv` | Public Domain |
| American Standard Version (1901) | `asv` | Public Domain |
| World English Bible | `web` | Public Domain |

No copyrighted translation is requested or bundled. If you want to add another translation later, only add one that bible-api.com's own `/data` endpoint marks as public domain or freely licensed — check `https://bible-api.com/data` for the current list before adding it to `js/bible-data.js`.

**Fair use note:** bible-api.com asks that it not be used to bulk-download the entire Bible in one burst, and rate-limits to 15 requests/30 seconds. This app respects that: chapters are fetched one at a time as the user reads, and the optional "Build offline library" feature (in Search settings) deliberately waits between requests instead of firing them all at once.

## How search works (and its current limitation)

Search runs against Scripture that's already cached on your device (every chapter you open in the reader is saved locally for offline use). There is no first-party, redistribution-safe endpoint for full-Bible text search, so search coverage starts small and grows as you read.

To search more broadly right away, open **More → (or Search page) → "Build offline library"**, which slowly downloads the rest of the Bible in the background (respecting the rate limit above) so it becomes searchable and available offline.

## Project structure

```
/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── bible-data.js    (66 books, chapter counts, translation list)
│   ├── bible-api.js     (fetch + normalize + IndexedDB cache)
│   ├── storage.js       (localStorage: settings, bookmarks, notes, history, stats)
│   ├── ui-helpers.js    (escaping, toast, copy, share)
│   ├── app.js           (router, theme, offline banner, service worker registration)
│   ├── home.js
│   ├── reader.js
│   ├── search.js
│   ├── bookmarks.js
│   └── settings.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## How to run locally

You don't need Node.js or any install step. Because browsers restrict some PWA features (like the service worker) on the `file://` protocol, run a tiny local server instead:

1. Open a terminal in this folder.
2. If you have Python installed, run: `python3 -m http.server 8000`
3. Open `http://localhost:8000` in your browser.

## How to deploy to GitHub Pages

1. Create a new GitHub repository (for example, `Bible-App`).
2. Upload all these files and folders, keeping the same structure.
3. In your repository, click **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to "Deploy from a branch," pick the `main` branch and `/ (root)` folder, then click **Save**.
5. Wait a minute or two, then visit `https://USERNAME.github.io/Bible-App/` (replace `USERNAME` and `Bible-App` with your actual GitHub username and repository name).

All paths in this project are relative (`./css/style.css`, `./js/app.js`, etc.), so it works correctly from a project subpath like `/Bible-App/` — it does not assume it's hosted at your domain's root.

## Known limitations

- Search only covers cached chapters (see above) unless you run "Build offline library."
- Verse of the Day is chosen from a small curated pool of well-known verses, rotated by date — not a large external list.
- Reading stats (chapters read, streak) are stored only in your browser's local storage; they are not synced across devices.
- No user accounts, cloud sync, audio Bible, or reading plans yet — the codebase is structured (see `js/bible-data.js` and `js/bible-api.js`) so these can be added later without a rewrite.
