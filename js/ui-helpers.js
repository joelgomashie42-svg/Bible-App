/**
 * ui-helpers.js
 * Small shared helpers used across page modules. Kept separate so every
 * module that renders user-entered text (notes) goes through escapeHTML,
 * per the "never use unsafe innerHTML with user content" requirement.
 */

const UI = (() => {
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  let toastTimer = null;
  function toast(message) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 2200);
  }

  function referenceLabel(bookName, chapter, verse) {
    return verse ? `${bookName} ${chapter}:${verse}` : `${bookName} ${chapter}`;
  }

  async function copyVerse(bookName, chapter, verse, text, versionShort) {
    const ref = referenceLabel(bookName, chapter, verse);
    const payload = `"${text}"\n\n${ref} — ${versionShort}`;
    try {
      await navigator.clipboard.writeText(payload);
      toast('Copied!');
    } catch (err) {
      console.error('Copy failed:', err);
      toast('Could not copy — please copy manually.');
    }
  }

  async function shareVerse(bookName, chapter, verse, text, versionShort) {
    const ref = referenceLabel(bookName, chapter, verse);
    const shareText = `"${text}"\n\n${ref} — ${versionShort}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${ref} (${versionShort})`, text: shareText });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      await copyVerse(bookName, chapter, verse, text, versionShort);
      toast('Sharing isn\u2019t supported here — copied instead.');
    }
  }

  return { escapeHTML, toast, referenceLabel, copyVerse, shareVerse };
})();
