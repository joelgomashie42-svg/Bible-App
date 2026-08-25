/**
 * ai-assistant.js
 * Floating chat button + panel, available on every page. Talks to the
 * Cloudflare Worker configured in js/config.js (never calls Gemini
 * directly — the Worker holds the real API key). If the person is
 * currently reading a chapter, that passage is sent along as context so
 * the assistant can discuss it directly; otherwise it answers general
 * Bible questions.
 *
 * Conversation history is kept in memory only (cleared on page reload) —
 * simple and avoids storing chat content in the person's browser storage.
 */

const AIAssistant = (() => {
  let history = []; // { role: 'user' | 'model', text: string }[]
  let panelEl = null;
  let sending = false;

  function isConfigured() {
    return typeof AI_ASSISTANT_ENDPOINT === 'string' && AI_ASSISTANT_ENDPOINT.trim().length > 0;
  }

  function buildButton() {
    const btn = document.createElement('button');
    btn.id = 'ai-assistant-fab';
    btn.className = 'ai-fab';
    btn.setAttribute('aria-label', 'Ask the Bible Assistant');
    btn.innerHTML = '<span aria-hidden="true">\u2728</span>';
    btn.addEventListener('click', openPanel);
    document.body.appendChild(btn);
  }

  function messageBubbleHTML(msg) {
    const roleClass = msg.role === 'user' ? 'ai-msg-user' : 'ai-msg-model';
    return `<div class="ai-msg ${roleClass}">${UI.escapeHTML(msg.text)}</div>`;
  }

  function renderMessages() {
    const list = panelEl.querySelector('#ai-messages');
    if (history.length === 0) {
      list.innerHTML = `
        <div class="ai-msg ai-msg-model ai-msg-intro">
          Hi! I'm the Bible Assistant. Ask me about a verse, a chapter, or any Bible question.
          I'm AI-generated, so always check what I say against Scripture — and for personal or
          serious matters, please talk to a pastor or someone you trust.
        </div>
      `;
    } else {
      list.innerHTML = history.map(messageBubbleHTML).join('');
    }
    list.scrollTop = list.scrollHeight;
  }

  function setSending(isSending) {
    sending = isSending;
    const sendBtn = panelEl.querySelector('#ai-send-btn');
    const input = panelEl.querySelector('#ai-input');
    sendBtn.disabled = isSending;
    input.disabled = isSending;
    if (isSending) {
      const list = panelEl.querySelector('#ai-messages');
      list.insertAdjacentHTML('beforeend', '<div class="ai-msg ai-msg-model ai-msg-thinking" id="ai-thinking">Thinking…</div>');
      list.scrollTop = list.scrollHeight;
    } else {
      const thinking = panelEl.querySelector('#ai-thinking');
      if (thinking) thinking.remove();
    }
  }

  async function sendMessage() {
    if (sending) return;
    const input = panelEl.querySelector('#ai-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    history.push({ role: 'user', text });
    renderMessages();
    setSending(true);

    const context = (typeof Reader !== 'undefined' && Reader.getCurrentContext) ? Reader.getCurrentContext() : null;
    updateContextBadge(context);

    try {
      const res = await fetch(AI_ASSISTANT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: context || '',
          // Send prior turns only (not the message just pushed — the
          // Worker appends that itself alongside the context).
          history: history.slice(0, -1),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.reply) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      history.push({ role: 'model', text: data.reply });
    } catch (err) {
      console.error('AI Assistant request failed:', err);
      history.push({
        role: 'model',
        text: navigator.onLine
          ? 'Sorry, I couldn\u2019t get a response just now. Please try again in a moment.'
          : 'You\u2019re offline — the AI Assistant needs an internet connection.',
      });
    } finally {
      setSending(false);
      renderMessages();
    }
  }

  function updateContextBadge(context) {
    const badge = panelEl.querySelector('#ai-context-badge');
    if (context) {
      const label = context.split(':')[0]; // "Book Chapter (VERSION)"
      badge.textContent = `Chatting about ${label}`;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  function buildPanel() {
    const el = document.createElement('div');
    el.id = 'ai-assistant-panel';
    el.className = 'ai-panel';
    el.hidden = true;
    el.innerHTML = `
      <div class="ai-panel-backdrop"></div>
      <div class="ai-panel-window" role="dialog" aria-label="Bible Assistant chat">
        <div class="ai-panel-header">
          <span class="ai-panel-title">Bible Assistant</span>
          <span class="pill ai-context-badge" id="ai-context-badge" hidden></span>
          <button class="ai-panel-close" id="ai-panel-close" aria-label="Close chat">&times;</button>
        </div>
        <div class="ai-messages" id="ai-messages"></div>
        <div class="ai-panel-input-row">
          <input type="text" id="ai-input" placeholder="Ask about a verse or the Bible…" autocomplete="off" />
          <button class="btn btn-primary" id="ai-send-btn">Send</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    panelEl = el;

    el.querySelector('.ai-panel-backdrop').addEventListener('click', closePanel);
    el.querySelector('#ai-panel-close').addEventListener('click', closePanel);
    el.querySelector('#ai-send-btn').addEventListener('click', sendMessage);
    el.querySelector('#ai-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !sending) sendMessage();
    });
  }

  function openPanel() {
    if (!panelEl) buildPanel();
    panelEl.hidden = false;
    renderMessages();
    const context = (typeof Reader !== 'undefined' && Reader.getCurrentContext) ? Reader.getCurrentContext() : null;
    updateContextBadge(context);
    panelEl.querySelector('#ai-input').focus();
  }

  function closePanel() {
    if (panelEl) panelEl.hidden = true;
  }

  function init() {
    if (!isConfigured()) return; // AI Assistant stays off until config.js has a Worker URL
    buildButton();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', AIAssistant.init);
