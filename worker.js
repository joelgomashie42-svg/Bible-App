/**
 * worker.js — Cloudflare Worker
 *
 * This is the ONLY piece of this project that isn't a static file served by
 * GitHub Pages. It runs on Cloudflare's free tier and does one job: hold
 * your real Gemini API key as a secret, and forward chat requests to Google
 * on the app's behalf. The key is never visible to anyone using the app.
 *
 * SETUP — see the "AI Assistant Setup" section of README.md for the full
 * step-by-step walkthrough. Short version:
 *   1. Paste this whole file into a new Cloudflare Worker.
 *   2. In the Worker's Settings -> Variables and Secrets, add a SECRET
 *      called GEMINI_API_KEY with your key from Google AI Studio.
 *   3. (Recommended) Add a plain variable ALLOWED_ORIGIN set to your
 *      GitHub Pages URL, e.g. https://yourusername.github.io
 *      so only your app can use this Worker.
 *   4. Deploy, copy the Worker's URL, and paste it into js/config.js.
 *
 * If you ever need to change the AI model (Google periodically retires old
 * ones), it's the single MODEL constant below.
 */

const MODEL = 'gemini-2.5-flash';
// ^ Google retires Gemini models on a rolling schedule (this one is
// scheduled to retire October 16, 2026). If the assistant stops working
// with a "model not found" error, check https://ai.google.dev/gemini-api/docs/models
// for the current recommended "flash" model and update this line.

const SYSTEM_INSTRUCTION = `You are the AI assistant inside "Bible App" (tagline: "Grow in Grace & Truth"), a Bible-reading app. You help people understand Scripture: explaining verses and chapters, answering general Bible questions, giving historical/cultural context, and discussing different Christian denominations' views on a topic fairly and neutrally when relevant.

Guidelines:
- Keep answers warm, clear, and reasonably concise (a few short paragraphs at most, unless the person asks for more depth).
- When discussing a specific verse or chapter the person is currently reading, ground your answer in that passage.
- On disputed theological questions (e.g. between denominations), present the main views fairly rather than declaring one correct, unless the person asks for your summary of majority consensus.
- You are not a substitute for pastoral counsel, therapy, or professional advice — say so briefly if someone brings a serious personal, medical, or crisis situation, and encourage them to talk to a pastor, counselor, or trusted person.
- If you don't know something or it's outside Scripture/Christian context, say so plainly rather than guessing.`;

function corsHeaders(request, env) {
  const allowedOrigin = env.ALLOWED_ORIGIN || '*';
  const origin = request.headers.get('Origin');
  const allow = allowedOrigin === '*' || origin === allowedOrigin ? (origin || '*') : 'null';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server is missing GEMINI_API_KEY. See README setup steps.' }), {
        status: 500,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const context = typeof body.context === 'string' ? body.context.trim() : '';
    const history = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Build the conversation for Gemini: prior turns (already role-tagged by
    // the client as 'user' | 'model'), then the new message. If the person
    // is currently reading a passage, prepend that as context on this turn.
    const contents = history
      .filter((turn) => turn && (turn.role === 'user' || turn.role === 'model') && typeof turn.text === 'string')
      .map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] }));

    const userText = context ? `[Currently reading: ${context}]\n\n${message}` : message;
    contents.push({ role: 'user', parts: [{ text: userText }] });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    let geminiResponse;
    try {
      geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
        }),
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Could not reach the AI service. Please try again.' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text().catch(() => '');
      console.error('Gemini API error:', geminiResponse.status, errText);
      return new Response(JSON.stringify({ error: 'The AI service returned an error. Please try again shortly.' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const data = await geminiResponse.json();
    const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';

    if (!reply) {
      return new Response(JSON.stringify({ error: 'The AI did not return a response. Please try again.' }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  },
};
