/**
 * app.js
 * Small hash-based router + global setup (theme, offline banner, nav highlight).
 * Each page module (Home, Reader, Search, Bookmarks, Settings) exposes a
 * `render(container)` function that fills #page-content.
 */

const App = (() => {
  const pageContent = document.getElementById('page-content');
  const navLinks = () => document.querySelectorAll('[data-nav-link]');
  const offlineBanner = document.getElementById('offline-banner');

  const routes = {
    home: () => Home.render(pageContent),
    bible: () => Reader.render(pageContent),
    search: () => Search.render(pageContent),
    bookmarks: () => Bookmarks.render(pageContent),
    more: () => Settings.render(pageContent),
  };

  function currentRoute() {
    const hash = (location.hash || '#home').replace('#', '');
    return routes[hash] ? hash : 'home';
  }

  function highlightNav(route) {
    navLinks().forEach((link) => {
      link.classList.toggle('active', link.dataset.navLink === route);
    });
  }

  function renderRoute() {
    const route = currentRoute();
    highlightNav(route);
    pageContent.setAttribute('aria-busy', 'true');
    routes[route]();
    pageContent.setAttribute('aria-busy', 'false');
    pageContent.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function applyTheme() {
    const settings = Storage.getSettings();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('theme-dark', isDark);
  }

  function applyReaderPrefs() {
    const settings = Storage.getSettings();
    document.documentElement.dataset.fontSize = settings.fontSize;
    document.documentElement.dataset.lineSpacing = settings.lineSpacing;
  }

  function updateOnlineStatus() {
    offlineBanner.hidden = navigator.onLine;
  }

  function init() {
    applyTheme();
    applyReaderPrefs();
    updateOnlineStatus();

    window.addEventListener('hashchange', renderRoute);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

    if (!location.hash) location.hash = '#home';
    renderRoute();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch((err) => {
        console.error('Service worker registration failed:', err);
      });
    }
  }

  return { init, applyTheme, applyReaderPrefs, goTo: (route) => { location.hash = `#${route}`; } };
})();

document.addEventListener('DOMContentLoaded', App.init);
