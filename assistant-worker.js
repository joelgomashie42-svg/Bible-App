/**
 * assistant-worker.js
 *
 * A Cloudflare Worker that acts as a secure proxy between Bible App (running
 * on GitHub Pages) and Google's Gemini API. This exists for ONE reason:
 * Gemini API keys must not be embedded in client-side JavaScript. Anyone
 * viewing the page source could steal a key embedded there and run up a
 * bill on your account, and Google has been actively locking this down
 * through 2026. This Worker holds the real key as a secret and never sends
 * it to the browser.
 *
 * DEPLOY: Paste this whole file into a new Worker via the Cloudflare
 * dashboard's "Quick Edit" screen (Workers & Pages -> Create application ->
 * Hello World -> Deploy -> Edit code). No command line needed.
 *
 * CONFIGURE (Settings -> Variables and Secrets on your Worker):
 *   - GEMINI_API_KEY   (Secret)  Your Gemini API key from Google AI Studio.
 *   - ALLOWED_ORIGIN   (Text)    Your GitHub Pages URL, e.g.
 *                                https://yourusername.github.io
 *                                (no trailing slash). This stops OTHER
 *                                websites' JavaScript from using your
 *                                Worker via a browser. It does NOT stop
 *                                someone who has your Worker URL from
 *                                calling it directly with a tool like curl
 *                                — CORS only restricts browsers. Keep an
 *                                eye on usage in Google AI Studio and the
 *                                Cloudflare dashboard as your safety net;
 *                                both free tiers cap the worst case.
 *   - GEMINI_MODEL     (Text, optional) Defaults to gemini-2.5-flash if
 *                                unset. Check Google AI Studio for the
 *                                current recommended free-tier model —
 *                                Gemini model names change over time and
 *                                older ones get retired.
 */

// Keeps the assistant on-topic and matches the app's tone. Edited here,
// not in the client, so it can't be tampered with from the browser.
const SYSTEM_INSTRUCTION = `You are the built-in assistant inside "Bible App" (tagline: "Grow in Grace & Truth"), a Bible reading PWA. You help people understand and discuss Scripture: explaining verses or chapters in context, answering general Bible questions, and discussing Christian faith topics respectfully.

Guidelines:
- Be warm, clear, and reverent — not preachy or robotic.
- When a passage is provided as context, ground your answer in that specific text.
- Different Christian traditions read some passages differently. When a question touches a genuinely disputed or denominational topic, briefly note that reasonable interpretations differ rather than presenting one view as the only one.
- You are not a substitute for a pastor, priest, or counselor. For questions about someone's personal life situation, gently encourage them to also talk to a trusted pastor or community, without refusing to engage.
- Keep answers reasonably concise unless the person asks for depth.
- If asked something entirely unrelated to the Bible, faith, or this app, answer briefly and helpfully but steer back to what you're there for.`;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || '*';

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    if (!env.GEMINI_API_KEY) {
      return jsonResponse({ error: 'Assistant is not configured yet (missing API key).' }, 500, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid request body.' }, 400, origin);
    }

    const history = Array.isArray(body && body.history) ? body.history : null;
    if (!history || history.length === 0) {
      return jsonResponse({ error: 'Missing message history.' }, 400, origin);
    }

    // Basic sanity limits so a misbehaving client can't send a huge payload.
    if (history.length > 40) {
      return jsonResponse({ error: 'Conversation is too long — please start a new chat.' }, 400, origin);
    }

    const contents = history.map((turn) => ({
      role: turn && turn.role === 'model' ? 'model' : 'user',
      parts: [{ text: String((turn && turn.text) || '').slice(0, 4000) }],
    }));

    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    let geminiRes;
    try {
      geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
        }),
      });
    } catch (err) {
      return jsonResponse({ error: 'Could not reach the AI service.' }, 502, origin);
    }

    if (!geminiRes.ok) {
      let detail = '';
      try { detail = (await geminiRes.text()).slice(0, 300); } catch {}
      console.error('Gemini API error', geminiRes.status, detail);
      return jsonResponse({ error: 'The AI service returned an error. Please try again shortly.' }, 502, origin);
    }

    let data;
    try {
      data = await geminiRes.json();
    } catch {
      return jsonResponse({ error: 'The AI service returned an unreadable response.' }, 502, origin);
    }

    const parts = data?.candidates?.[0]?.content?.parts;
    const reply = Array.isArray(parts) ? parts.map((p) => p.text || '').join('') : '';

    if (!reply) {
      return jsonResponse({ error: 'The assistant had no response. Please try again.' }, 502, origin);
    }

    return jsonResponse({ reply }, 200, origin);
  },
};
