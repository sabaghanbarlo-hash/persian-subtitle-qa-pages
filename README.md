# Persian Subtitle QA (client-only)

AI-assisted quality review for English → Persian anime subtitle translations —
running entirely as a static site, deployed on GitHub Pages, no server required.

This is the client-only counterpart to `persian-subtitle-qa` (the Next.js/Vercel
version). Same core workflow, but your AI provider's API key is entered once in
the **AI Models & Settings** page and stored only in your browser's local
storage — it's sent directly from your browser to the provider you pick, and
never committed to this repo or sent anywhere else.

## How to use it

1. Open the live site (enable GitHub Pages on this repo: **Settings → Pages →
   Deploy from branch `main` / root**, then visit the URL GitHub gives you).
2. Go to **AI Models & Settings**, pick a provider, paste your API key, hit
   **Test connection**, then **Save**.
   - **Groq** (default) is known to work well for direct browser calls and has
     a generous free tier — get a key at console.groq.com.
   - Gemini and OpenRouter generally work too. Anthropic works with a
     browser-access header already included. OpenAI and DeepSeek are untested
     for direct browser calls — use "Test connection" to check.
3. Go to **New Review**, upload an English `.srt` and a Persian `.srt` for the
   same episode, click **Pair subtitles**, then **Analyze episode**.
4. Work through flagged lines: **Apply**, **Edit**, or **Ignore** each
   suggestion. Nothing is destroyed — **Revert to original** brings back the
   untouched Persian line at any point.
5. **Download corrected SRT** when you're done.

## Why client-only instead of the Next.js version

GitHub Pages only serves static files — it can't run a server-side API route,
so there's no way to hide an API key behind a backend here. This version
accepts that tradeoff in exchange for a plain URL with nothing to deploy or
configure beyond pasting a key into Settings, matching how the rest of the
GitHub Pages projects in this account work.

## Project structure

```
index.html              — loads vendor libs, lib.js, then app.js
css/style.css           — dark theme, design tokens
js/lib.js               — storage, SRT parse/export/pairing, diff, prompt,
                          browser-side AI provider calls (Groq/OpenAI-
                          compatible/Anthropic/Gemini/OpenRouter/DeepSeek)
js/app.js               — compiled React app (do not hand-edit)
src/app.jsx             — human-editable JSX source for js/app.js
vendor/                 — self-hosted React + ReactDOM UMD builds
                          (unpkg and some other CDNs are blocked on this
                          network, so these are committed directly)
```

To change the UI, edit `src/app.jsx`, then recompile with Babel (classic JSX
runtime, not the automatic runtime) into `js/app.js`:

```bash
npx babel src/app.jsx --presets=@babel/preset-react --plugins=@babel/plugin-transform-react-jsx --no-babelrc \
  -o js/app.js
```

(Or ask Claude to do it — this is exactly how `js/app.js` was generated.)

## What's implemented

Same MVP feature set as the Next.js version: upload + pair by subtitle number
with a clear mismatch warning, one AI reviewer per line with 2-line context on
each side, structured JSON validation, progressive results with a progress
bar, status badges + filtering, word-level diff on suggestions, Apply / Edit /
Ignore / Revert, and corrected SRT export.

## What's deliberately not built yet

Translation memory/glossary, multiple AI providers running side by side, a
judge model, projects/episode history, character memory, `.ass`/`.vtt`
support, and episode-wide consistency checking — all planned for later phases.
