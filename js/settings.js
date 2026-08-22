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
