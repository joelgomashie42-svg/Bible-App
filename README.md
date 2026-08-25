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
- Optional AI Bible Assistant (floating chat button) — off by default, see "AI Assistant Setup" below

## Technology used

Vanilla HTML, CSS, and JavaScript. No build step, no frameworks, no npm dependencies. Data persistence uses `localStorage` (settings, bookmarks, favorites, notes, history, stats) and `IndexedDB` (cached Bible chapters, for offline reading and search).

## Bible data source & translation licensing

Scripture text is served live from **[bible-api.com](https://bible-api.com)**, a free, no-key-required, CORS-enabled JSON API maintained by Tim Morgan (open source at [github.com/seven1m/bible_api](https://github.com/seven1m/bible_api)).

This app only requests translations that bible-api.com's own `/data` endpoint itself marks **"Public Domain"** (verified directly against that endpoint, not assumed):

| Translation | ID | Coverage | Status |
|---|---|---|---|
| King James Version | `kjv` | Full Bible | Public Domain |
| American Standard Version (1901) | `asv` | Full Bible | Public Domain |
| World English Bible | `web` | Full Bible | Public Domain |
| World English Bible, British Edition | `webbe` | Full Bible | Public Domain |
| Bible in Basic English | `bbe` | Full Bible | Public Domain |
| Darby Bible | `darby` | Full Bible | Public Domain |
| Douay-Rheims 1899 American Edition | `dra` | Full Bible | Public Domain |
| Open English Bible, Commonwealth Edition | `oeb-cw` | Full Bible | Public Domain |
| Open English Bible, US Edition | `oeb-us` | Full Bible | Public Domain |
| Young's Literal Translation | `ylt` | **New Testament only** | Public Domain |

The app hides Old Testament books automatically when YLT is selected, since bible-api.com doesn't have OT data for it. One more known quirk: the Douay-Rheims (`dra`) traditionally numbers Psalms slightly differently from the Protestant versification used elsewhere in the app (a Vulgate/Septuagint numbering difference); if a Psalms chapter looks off by one under DRA, that's why — the reader's existing "Unable to load Scripture / Try Again" error state handles a missing chapter gracefully rather than showing broken content. No copyrighted translation (NIV, ESV, NLT, etc.) is requested or bundled — those aren't in bible-api.com's public-domain list, so they're intentionally left out. If you want to add another translation later, only add one that bible-api.com's `/data` endpoint itself marks as public domain — check `https://bible-api.com/data` for the current list before adding it to `js/bible-data.js`. A number of non-English public-domain translations are also available there (Cherokee, Chinese, Czech, Latin, Portuguese, Romanian, Russian) but aren't included here since the app's book names and UI are English-only.

**Fair use note:** bible-api.com asks that it not be used to bulk-download the entire Bible in one burst, and rate-limits to 15 requests/30 seconds. This app respects that: chapters are fetched one at a time as the user reads, and the optional "Build offline library" feature (in Search settings) deliberately waits between requests instead of firing them all at once.

## Going fully offline

Every chapter opened in the reader is automatically cached (IndexedDB), so re-reading it never needs the network again. For **complete** offline use — reading and search, with zero network requests — open **More → Download for Offline Use** and tap "Download" next to a translation. It downloads all 1,189 chapters once (a few MB, throttled to respect bible-api.com's fair-use rate limit — takes a little while), and after that, that translation works entirely offline forever.

**Why this is a download instead of being bundled in the app already:** KJV/ASV/WEB are public domain and *could* in principle ship as local JSON files needing no download at all. I looked into building the app that way, but reliably fetching and verifying ~15–20MB of Scripture text (66 books × 3 translations) isn't something I could do safely with the tools available while building this — a test fetch of even one book got cut short by a response-size limit, and I didn't want to risk shipping truncated or corrupted Scripture. The one-time in-app download is the safer path to the same end result: a fully offline Bible, verified chapter-by-chapter as it downloads. If you'd like to revisit bundling static JSON files directly into the repo later (so there's no download step at all), `js/bible-api.js` is written so that swap wouldn't require rewriting the rest of the app.

Search runs against whatever is cached — everything you've read, plus anything downloaded via the feature above.

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
│   ├── bible-data.js       (66 books, chapter counts, translation list)
│   ├── bible-api.js        (fetch + normalize + IndexedDB cache)
│   ├── offline-library.js  (throttled full-Bible download for offline use)
│   ├── storage.js          (localStorage: settings, bookmarks, notes, history, stats)
│   ├── ui-helpers.js       (escaping, toast, copy, share)
│   ├── config.js           (paste your AI Assistant Worker URL here)
│   ├── ai-assistant.js     (floating AI chat button + panel)
│   ├── app.js              (router, theme, offline banner, service worker registration)
│   ├── home.js
│   ├── reader.js
│   ├── search.js
│   ├── bookmarks.js
│   └── settings.js
├── cloudflare-worker/
│   └── worker.js        (paste into a Cloudflare Worker — see AI Assistant Setup)
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

## AI Assistant Setup

The app has an optional floating chat button (the sparkle icon, bottom-right) that lets people ask an AI about the verse or chapter they're reading, or general Bible questions. **It's off by default** — the button won't appear until you complete this setup.

### Why this needs an extra step (please read before skipping)

Google's Gemini API used to let developers put an API key directly in client-side JavaScript. That's no longer safe: Google itself has been locking this down through 2026 because leaked keys were being used to run up other people's bills, and by September 2026 the old "standard" key type stops working for Gemini entirely. So instead of putting your key in this app's code (which anyone could view and steal), the key lives in a small, free **Cloudflare Worker** that acts as a secure go-between: your app → Worker (holds the secret key) → Google. This is a one-time, ~10 minute setup.

### Step 1 — Get a Gemini API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey) and sign in with a Google account.
2. Click **Create API key**, create it in a new project (don't reuse a project that has other Google APIs enabled, for safety).
3. Copy the key somewhere safe temporarily — you'll paste it once in Step 2 and never need to put it in this app's code.

### Step 2 — Deploy the Cloudflare Worker

1. Go to [Cloudflare](https://dash.cloudflare.com/sign-up) and create a free account.
2. In the dashboard sidebar, click **Workers & Pages**, then **Create**, then **Create Worker**.
3. Give it any name (e.g. `bible-app-assistant`) and click **Deploy** to create it with the default code.
4. Click **Edit code**. Delete everything in the editor, and paste in the entire contents of this project's `cloudflare-worker/worker.js` file.
5. Click **Deploy** (or **Save and Deploy**) to publish your changes.
6. Go to the Worker's **Settings → Variables and Secrets**.
7. Add a **Secret** named `GEMINI_API_KEY` with the key you copied in Step 1.
8. Add a plain **Variable** named `ALLOWED_ORIGIN` set to your GitHub Pages URL, e.g. `https://yourusername.github.io` (this stops other websites from using your Worker/key — use the origin only, no trailing slash or path).
9. Save. On the Worker's main page, copy its URL — it looks like `https://bible-app-assistant.yourname.workers.dev`.

### Step 3 — Connect the app to your Worker

1. Open `js/config.js` in your repository.
2. Change `null` to your Worker's URL in quotes:
   ```js
   const AI_ASSISTANT_ENDPOINT = 'https://bible-app-assistant.yourname.workers.dev';
   ```
3. Commit the change (see "How to deploy to GitHub Pages" above for the upload steps if you're not sure how).
4. **Important:** because this app caches itself for offline use, if you ever edit `js/config.js` again after your first deploy, also bump `CACHE_NAME` in `service-worker.js` (e.g. `bible-app-v5` → `bible-app-v6`) in the same commit — otherwise people who already installed the app may keep seeing the old value until their cache naturally clears.
5. Reload your live site. The sparkle chat button should now appear in the bottom-right corner.

### Notes on cost, limits, and behavior

- Google's Gemini free tier has its own request-rate and daily limits; if the assistant says it "couldn't get a response," that's often why — it will work again shortly.
- Set a billing alert in your Google Cloud project as a safety net, even on the free tier, in case usage grows.
- The assistant is instructed (in `cloudflare-worker/worker.js`) to stay warm and Bible-focused, present differing denominational views fairly rather than picking one as "correct," and to point people to a pastor or trusted person for serious personal matters — you can edit the `SYSTEM_INSTRUCTION` text in that file to change its tone or scope.
- Chat history is kept only in memory in the browser tab — it's not saved anywhere, and clears on page reload.
- If Google retires the model this app uses (`gemini-2.5-flash` is scheduled to retire October 16, 2026), update the single `MODEL` constant near the top of `cloudflare-worker/worker.js` and redeploy the Worker — check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) for the current recommended model.

## Known limitations

- Search only covers cached chapters (see above) unless you run "Build offline library."
- Verse of the Day is chosen from a small curated pool of well-known verses, rotated by date — not a large external list.
- Reading stats (chapters read, streak) are stored only in your browser's local storage; they are not synced across devices.
- No user accounts, cloud sync, audio Bible, or reading plans yet — the codebase is structured (see `js/bible-data.js` and `js/bible-api.js`) so these can be added later without a rewrite.
