/**
 * settings.js — the "More" page: reader preferences, theme, and app info.
 */

const Settings = (() => {
  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const btn = document.getElementById('install-btn');
    if (btn) btn.hidden = false;
  });

  function shell(settings) {
    return `
      <h1 class="page-title">More</h1>

      <section class="card">
        <h2>Default Translation</h2>
        <div class="control-group">
          <select id="setting-version">
            ${BIBLE_VERSIONS.map((v) => `<option value="${v.id}" ${v.id === settings.version ? 'selected' : ''}>${UI.escapeHTML(v.short)} — ${UI.escapeHTML(v.name)}</option>`).join('')}
          </select>
        </div>
      </section>

      <section class="card" id="offline-card">
        <h2>Download for Offline Use</h2>
        <p class="hint-text">
          Download a translation once and Bible App will work with <strong>zero internet connection</strong>
          from then on for that translation — reading, search, everything. Uses about 4–5&nbsp;MB per translation.
        </p>
        <div id="offline-list"></div>
      </section>

      <section class="card">
        <h2>Text Size</h2>
        <div class="segmented" data-setting="fontSize">
          ${['small', 'medium', 'large', 'xlarge'].map((s) => `
            <button class="segment ${settings.fontSize === s ? 'active' : ''}" data-value="${s}">${s[0].toUpperCase() + s.slice(1)}</button>
          `).join('')}
        </div>
      </section>

      <section class="card">
        <h2>Line Spacing</h2>
        <div class="segmented" data-setting="lineSpacing">
          ${['compact', 'normal', 'relaxed'].map((s) => `
            <button class="segment ${settings.lineSpacing === s ? 'active' : ''}" data-value="${s}">${s[0].toUpperCase() + s.slice(1)}</button>
          `).join('')}
        </div>
      </section>

      <section class="card">
        <h2>Appearance</h2>
        <div class="segmented" data-setting="theme">
          ${['light', 'dark', 'system'].map((s) => `
            <button class="segment ${settings.theme === s ? 'active' : ''}" data-value="${s}">${s[0].toUpperCase() + s.slice(1)}</button>
          `).join('')}
        </div>
      </section>

      <section class="card">
        <h2>Install App</h2>
        <p class="hint-text">Install Bible App to your home screen for quick, offline-friendly access.</p>
        <button class="btn btn-primary" id="install-btn" hidden>Install Bible App</button>
      </section>

      <section class="card">
        <h2>About</h2>
        <p class="hint-text">Bible App — Grow in Grace &amp; Truth.<br>
        Scripture text served by <a href="https://bible-api.com" target="_blank" rel="noopener">bible-api.com</a>,
        using public-domain translations (KJV, ASV, WEB). See the README for full licensing notes.</p>
      </section>
    `;
  }

  const unsubscribers = [];

  async function renderOfflineList(container) {
    const listEl = container.querySelector('#offline-list');
    const rows = await Promise.all(BIBLE_VERSIONS.map(async (v) => {
      const progress = await OfflineLibrary.getProgress(v.id);
      return { version: v, progress };
    }));

    listEl.innerHTML = rows.map(({ version, progress }) => `
      <div class="offline-row" data-version="${version.id}">
        <div class="offline-row-info">
          <span class="offline-row-name">${UI.escapeHTML(version.short)}</span>
          <span class="offline-row-status">
            ${progress.complete
              ? '\u2713 Downloaded — fully offline'
              : progress.downloading
                ? `Downloading… ${progress.downloaded}/${progress.total} chapters`
                : `${progress.downloaded}/${progress.total} chapters cached`}
          </span>
        </div>
        ${progress.complete ? '' : `
          <button class="btn btn-secondary offline-action-btn" data-action="${progress.downloading ? 'stop' : 'download'}">
            ${progress.downloading ? 'Stop' : 'Download'}
          </button>
        `}
      </div>
    `).join('');

    listEl.querySelectorAll('.offline-action-btn').forEach((btn) => {
      const row = btn.closest('.offline-row');
      const versionId = row.dataset.version;
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'download') {
          OfflineLibrary.startDownload(versionId);
        } else {
          OfflineLibrary.cancelDownload(versionId);
        }
      });
    });
  }

  function wireSegments(container) {
    container.querySelectorAll('.segmented').forEach((group) => {
      const settingKey = group.dataset.setting;
      group.querySelectorAll('.segment').forEach((btn) => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.segment').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          Storage.updateSettings({ [settingKey]: btn.dataset.value });
          App.applyTheme();
          App.applyReaderPrefs();
        });
      });
    });
  }

  function render(container) {
    const settings = Storage.getSettings();
    container.innerHTML = shell(settings);

    container.querySelector('#setting-version').addEventListener('change', (e) => {
      Storage.updateSettings({ version: e.target.value });
    });

    wireSegments(container);

    // Clean up any listeners from a previous render of this page, then
    // re-render the offline list whenever a download makes progress.
    unsubscribers.forEach((fn) => fn());
    unsubscribers.length = 0;
    renderOfflineList(container);
    BIBLE_VERSIONS.forEach((v) => {
      unsubscribers.push(OfflineLibrary.onProgress(v.id, () => renderOfflineList(container)));
    });

    const installBtn = container.querySelector('#install-btn');
    installBtn.hidden = !deferredInstallPrompt;
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.hidden = true;
    });
  }

  return { render };
})();
