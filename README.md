# Persian Subtitle QA + Editing Studio (client-only)

AI-assisted quality review **and editing** for English → Persian anime subtitle
translations — running entirely as a static site, deployed on GitHub Pages, no
server required.

Your AI provider's API key is entered once in the **AI Models & Settings**
page and stored only in your browser's local storage — it's sent directly
from your browser to the provider you pick, and never committed to this repo
or sent anywhere else. Everything else (subtitles, glossary, projects, your
in-progress edits) also lives only in this browser's local storage.

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
3. (Optional) Go to **Projects & Glossary** and set up a project for the show
   you're working on — preferred character names/terms and a style guide, so
   AI suggestions and terminology checks are consistent across episodes.
4. Go to **Editor**, upload an English `.srt`/`.ass` and a Persian `.srt`/
   `.ass` for the same episode (mix and match freely), click **Pair
   subtitles**. Deterministic Persian QA checks (spacing, Arabic/Persian
   character confusion, repeated punctuation, timing overlaps, readability,
   glossary terminology) run automatically and instantly, no API calls
   needed. Click **Run AI QA** to also run the line-by-line AI translation
   review.
5. Work through flagged lines from the **QA issues** panel on the right —
   clicking one jumps straight to that subtitle. **Accept**, **Edit**, or
   **Reject/Ignore** each suggestion. Edit text and timestamps directly,
   add/duplicate/delete/split/merge subtitles, use **Find & Replace** for
   bulk text changes, and **Undo/Redo** (Ctrl+Z / Ctrl+Shift+Z) any of it.
   Nothing is destroyed — **Reset to original** brings back the untouched
   file at any point.
6. **Download corrected SRT**, or **Download corrected ASS** if you uploaded
   an `.ass` file (this preserves the original `[Script Info]`/`[V4+ Styles]`
   and any override tags on lines you didn't touch — see limitations below).
   Your work also autosaves to this browser as you go, so a refresh or crash
   offers to resume where you left off.

## Why client-only instead of a Next.js version

GitHub Pages only serves static files — it can't run a server-side API route,
so there's no way to hide an API key behind a backend here. This version
accepts that tradeoff in exchange for a plain URL with nothing to deploy or
configure beyond pasting a key into Settings.

## Project structure

```
index.html              — loads vendor libs, lib.js, then app.js
css/style.css           — dark theme, design tokens, editor/QA-panel styles
js/lib.js               — storage, SRT/ASS parse & lossless export, subtitle
                          pairing, local (non-AI) Persian QA engine, glossary/
                          project storage, autosave, diff, AI review prompts,
                          browser-side AI provider calls (Groq/OpenAI-
                          compatible/Anthropic/Gemini/OpenRouter/DeepSeek)
js/app.js               — compiled React app (do not hand-edit)
src/app.jsx             — human-editable JSX source for js/app.js
vendor/                 — self-hosted React + ReactDOM UMD builds
                          (unpkg and some other CDNs are blocked on this
                          network, so these are committed directly)
tests/                  — node-based regression tests (jsdom); see below
package.json            — dev-only tooling (build + test scripts); not
                          needed to just view the deployed site
babel.config.json       — forces Babel's *classic* JSX runtime; without this,
                          modern @babel/preset-react defaults to the
                          automatic runtime, which emits an `import` that
                          breaks in a plain <script> tag
```

To change the UI, edit `src/app.jsx`, then recompile:

```bash
npm install       # one-time, installs Babel + jsdom as dev tooling
npm run build     # compiles src/app.jsx -> js/app.js
npm test          # runs the regression suite (see tests/)
```

(Or ask Claude to do it.)

## What's implemented

**Core review workflow (unchanged from the original):** upload + pair EN/FA
by subtitle number with a clear mismatch warning, one AI reviewer per line
with 2-line context on each side, structured JSON validation, progressive
results with a progress bar, status badges + filtering, word-level diff on
suggestions, Apply / Edit / Ignore / Revert.

**New in this version:**
- Full subtitle editor: inline text + timestamp editing, add/duplicate/
  delete/split/merge subtitles, all undoable (Ctrl+Z/Ctrl+Shift+Z)
- `.ass`/`.ssa` import with **lossless, structure-preserving export** —
  Script Info/Styles are never touched, and any Dialogue line you didn't
  edit is re-emitted with its original override tags ({\i1}, {\pos(...)},
  etc.) intact. Lines you *do* edit lose their tags (the editor works on
  plain text) — this is a known limitation, not a bug; unedited lines are
  fully preserved regardless of how much reordering/splitting/merging you do
  elsewhere in the file.
- Local, instant, non-AI Persian QA: Arabic/Persian character confusion
  (ي/ك vs ی/ک), spacing, repeated punctuation, half-space (ZWNJ) hints,
  line-length/readability limits, timing validation (overlaps, too
  short/long, invalid), and glossary-driven terminology consistency
- Interactive QA panel unifying local + AI issues — click an issue to jump
  straight to its subtitle, Accept/Reject inline
- Find & Replace (whole-word/case options, live match list, confirm-before-
  bulk-apply)
- Projects & Glossary: reusable per-show glossary (preferred character
  names/terms + known wrong spellings to flag), a style guide (formality,
  punctuation, avoid-words, preferred expressions) that's fed into the AI
  system prompt, and readability limits — all stored locally and reusable
  across episodes; JSON import/export for the glossary
- "Apply glossary fixes" bulk action (with a confirmation + count) for
  terminology issues
- Autosave every change to local storage, with a resume/discard banner if
  you reload or come back later
- Download original / corrected SRT / corrected ASS, each behind a
  confirmation if QA issues are still open

## What's deliberately not built yet

- **Persian-only mode** (no English source): the QA/local-check engine
  already supports this in `js/lib.js` (`PERSIAN_ONLY_SYSTEM_PROMPT`,
  `runLocalQA` works without an English pair), but there's no upload path
  for it in the UI — the main workflow stays EN+FA pairing by design.
- AI-assisted "smart" find & replace that rewrites surrounding grammar
  (only literal find/replace and glossary-driven fixes are implemented)
- Multiple AI providers running side-by-side + a judge model
- Character-by-character virtualization for very large files (hundreds of
  subtitles render fine; extremely large files may feel less snappy since
  every row is in the DOM at once)
- SRT ⇄ ASS format conversion (you can still export ASS as SRT — you just
  lose styling, which is inherent to SRT, not a missing feature)

## Testing

`tests/` has four node scripts (no browser needed — they use `jsdom`):

- `test-lib.js` — unit tests for ASS parse/export losslessness (including
  after structural edits) and the local QA engine, run directly against
  `js/lib.js` in a `vm` context
- `smoke-test.js` — mounts the real compiled app in jsdom, checks all four
  pages render with no runtime errors
- `integration-test.js` — full EN+FA SRT upload → pair → local QA → glossary
  → bulk fix → undo/redo → find & replace → row edit → SRT export
- `integration-test-2.js` — EN+ASS upload → pair → mocked AI review → merge/
  split/duplicate/delete → ASS export → reset-to-original

Run all of them with `npm test`. These aren't exhaustive (no real browser,
no visual/CSS checks, no huge-file performance testing), but they cover the
workflows described above end-to-end with a real DOM and catch regressions
in the parsing/export/QA logic, which is where correctness matters most.
