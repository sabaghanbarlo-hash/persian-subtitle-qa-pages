// ============================================================
// Plain JS, no modules — loaded as a regular <script> before app.js,
// so everything here becomes available as a global.
// ============================================================

// ---------------- Storage (localStorage) ----------------

const SQA_PROVIDER_KEY = 'sqa_provider_config';
const SQA_SESSION_KEY = 'sqa_last_session';

function sqaGetProviderConfig() {
  try {
    const raw = localStorage.getItem(SQA_PROVIDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function sqaSaveProviderConfig(config) {
  try {
    localStorage.setItem(SQA_PROVIDER_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    return false;
  }
}

function sqaGetLastSession() {
  try {
    const raw = localStorage.getItem(SQA_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function sqaSaveLastSession(summary) {
  try { localStorage.setItem(SQA_SESSION_KEY, JSON.stringify(summary)); } catch (e) { /* ignore */ }
}

// ---------------- SRT parsing / export / pairing ----------------

function timeToMs(str) {
  const m = str.trim().match(/(\d+):(\d{2}):(\d{2})[.,](\d+)/);
  if (!m) return 0;
  const h = parseInt(m[1], 10), mi = parseInt(m[2], 10), se = parseInt(m[3], 10);
  const frac = m[4].padEnd(3, '0').slice(0, 3);
  return ((h * 3600 + mi * 60 + se) * 1000) + parseInt(frac, 10);
}

function msToSrtTime(ms) {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000); ms -= h * 3600000;
  const mi = Math.floor(ms / 60000); ms -= mi * 60000;
  const se = Math.floor(ms / 1000); ms -= se * 1000;
  const pad = (n, l) => String(n).padStart(l || 2, '0');
  return `${pad(h)}:${pad(mi)}:${pad(se)},${pad(ms, 3)}`;
}

function parseSRT(text) {
  const clean = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!clean) return [];
  const blocks = clean.split(/\n\s*\n/);
  const entries = [];
  blocks.forEach((block, i) => {
    const lines = block.split('\n');
    if (lines.length < 2) return;
    let indexLine = lines[0].trim();
    let idx, timeLine, textLines;
    if (/^\d+$/.test(indexLine)) {
      idx = parseInt(indexLine, 10);
      timeLine = lines[1];
      textLines = lines.slice(2);
    } else {
      idx = i + 1;
      timeLine = lines[0];
      textLines = lines.slice(1);
    }
    const timeMatch = timeLine && timeLine.match(/(\d+:\d{2}:\d{2}[.,]\d+)\s*-+>\s*(\d+:\d{2}:\d{2}[.,]\d+)/);
    if (!timeMatch) return;
    entries.push({
      index: idx,
      start: timeToMs(timeMatch[1]),
      end: timeToMs(timeMatch[2]),
      text: textLines.join('\n').trim(),
    });
  });
  return entries;
}

function exportSRT(entries, textField) {
  textField = textField || 'text';
  return entries.map((e, i) => (
    `${i + 1}\n${msToSrtTime(e.start)} --> ${msToSrtTime(e.end)}\n${(e[textField] || '').trim()}\n`
  )).join('\n');
}

// ---------------- ASS parsing ----------------
// Reads [Events] Dialogue lines into the same {index, start, end, text}
// shape as parseSRT (plus rawText/assFields for a lossless export — see
// parseASS below), so ASS files can be paired and reviewed exactly like SRT.

function stripAssTags(text) {
  return (text || '')
    .replace(/\{[^}]*\}/g, '')        // override tags like {\i1}, {\pos(...)}
    .replace(/\\N/gi, '\n')           // ASS hard line break
    .replace(/\\n/g, '\n')            // ASS soft line break
    .replace(/\\h/g, ' ')             // ASS hard space
    .trim();
}

// Parses ASS/SSA. Each Dialogue entry keeps its original tagged text
// (`rawText`) and its non-timing fields (`assFields`, keyed by field name
// from the Format: line) directly on the entry — not as a reference to a
// line index. That makes export independent of array position, so it keeps
// working correctly even after the user reorders, splits, merges, adds, or
// deletes subtitles: any untouched entry re-emits its original tags
// byte-for-byte; any new/edited entry is synthesized from its fields.
// Everything before the first Dialogue line (Script Info, Styles, Format
// line, etc.) is kept verbatim as `header` and is never touched.
const ASS_DEFAULT_FIELDS = ['Layer', 'Start', 'End', 'Style', 'Name', 'MarginL', 'MarginR', 'MarginV', 'Effect', 'Text'];

function parseASS(text) {
  const clean = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n');
  let inEvents = false;
  let fields = null;
  const headerLines = [];
  const entries = [];
  let dialogueIdx = 0;
  let seenFirstDialogue = false;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (/^\[Events\]/i.test(trimmed)) inEvents = true;
    else if (/^\[/.test(trimmed)) inEvents = false;

    if (inEvents && /^Format:/i.test(trimmed)) {
      fields = trimmed.replace(/^Format:\s*/i, '').split(',').map((s) => s.trim());
    }

    if (inEvents && /^Dialogue:/i.test(trimmed)) {
      seenFirstDialogue = true;
      const activeFields = fields || ASS_DEFAULT_FIELDS;
      const prefixMatch = line.match(/^(\s*Dialogue:\s*)/i);
      const prefix = prefixMatch ? prefixMatch[1] : 'Dialogue: ';
      const rest = line.slice(prefix.length);
      const textFieldPos = activeFields.length - 1;
      const parts = rest.split(',');
      const head = parts.slice(0, textFieldPos);
      const rawText = parts.slice(textFieldPos).join(',');

      const assFields = {};
      activeFields.forEach((name, i) => { if (name !== 'Text') assFields[name] = head[i] !== undefined ? head[i] : ''; });

      const startStr = assFields.Start;
      const endStr = assFields.End;
      if (!startStr || !endStr) return;

      dialogueIdx += 1;
      entries.push({
        index: dialogueIdx,
        start: timeToMs(startStr),
        end: timeToMs(endStr),
        text: stripAssTags(rawText),
        rawText,
        assFields,
      });
      return;
    }

    if (!seenFirstDialogue) headerLines.push(line);
  });

  return { entries, header: headerLines.join('\n'), fields: fields || ASS_DEFAULT_FIELDS };
}

function msToAssTime(ms) {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000); ms -= h * 3600000;
  const mi = Math.floor(ms / 60000); ms -= mi * 60000;
  const se = Math.floor(ms / 1000); ms -= se * 1000;
  const cs = Math.floor(ms / 10);
  const pad = (n, l) => String(n).padStart(l || 2, '0');
  return `${h}:${pad(mi)}:${pad(se)}.${pad(cs)}`;
}

// Rebuilds a full ASS file: original header verbatim, then one Dialogue
// line per current entry (in current order). An entry whose text and
// timing are both unchanged from when it was parsed re-emits its original
// `rawText` (preserving override tags); anything new or edited is
// synthesized as plain text using that entry's assFields (or sane
// defaults for subtitles added in the editor, which have none).
// Works correctly across reordering, splitting, merging, inserting and
// deleting — nothing here depends on original line positions.
function exportASS(entries, assMeta) {
  if (!assMeta) return '';
  const fields = assMeta.fields || ASS_DEFAULT_FIELDS;
  const lines = [assMeta.header];
  entries.forEach((entry) => {
    const assFields = entry.assFields || { Layer: '0', Style: 'Default', Name: '', MarginL: '0', MarginR: '0', MarginV: '0', Effect: '' };
    const textUnedited = entry.assFields && entry.fa === entry.originalFa;
    const textPart = textUnedited ? entry.rawText : (entry.fa || '').replace(/\n/g, '\\N');
    const row = fields.map((f) => {
      if (f === 'Start') return msToAssTime(entry.start);
      if (f === 'End') return msToAssTime(entry.end);
      if (f === 'Text') return textPart;
      return assFields[f] !== undefined ? assFields[f] : '';
    });
    lines.push('Dialogue: ' + row.join(','));
  });
  return lines.join('\n');
}

// Detect format from filename and parse into the normalized entry shape
// used everywhere else in the app: {index, start, end, text, ...}. For
// ASS, `assMeta` carries the header/fields exportASS() needs; each entry
// itself carries its own rawText/assFields for a lossless round-trip.
function parseSubtitleFile(filename, text) {
  const lower = (filename || '').toLowerCase();
  if (lower.endsWith('.ass') || lower.endsWith('.ssa')) {
    const parsed = parseASS(text);
    return { format: 'ass', entries: parsed.entries, assMeta: { header: parsed.header, fields: parsed.fields } };
  }
  return { format: 'srt', entries: parseSRT(text), assMeta: null };
}

function pairSubtitles(enEntries, faEntries) {
  const enByIndex = new Map(enEntries.map(e => [e.index, e]));
  const faByIndex = new Map(faEntries.map(e => [e.index, e]));
  const allIndices = Array.from(new Set([...enByIndex.keys(), ...faByIndex.keys()])).sort((a, b) => a - b);

  const paired = [];
  const unmatchedEn = [];
  const unmatchedFa = [];
  const countMismatch = enEntries.length !== faEntries.length;

  allIndices.forEach((idx) => {
    const en = enByIndex.get(idx);
    const fa = faByIndex.get(idx);
    if (en && fa) {
      // Timing and (for ASS) formatting come from the Persian file itself —
      // that's the file being corrected and re-exported, so it stays the
      // source of truth for anything beyond the text comparison.
      paired.push({
        id: sqaUid('sub'),
        index: idx,
        start: fa.start,
        end: fa.end,
        originalStart: fa.start,
        originalEnd: fa.end,
        en: en.text,
        fa: fa.text,
        originalFa: fa.text,
        rawText: fa.rawText || null,
        assFields: fa.assFields || null,
        status: 'unreviewed',
        review: null,
        userDecision: null,
      });
    } else if (en && !fa) {
      unmatchedEn.push(en);
    } else if (fa && !en) {
      unmatchedFa.push(fa);
    }
  });

  return { paired, unmatchedEn, unmatchedFa, countMismatch };
}

// ---------------- Word-level diff ----------------

function tokenize(str) {
  return (str || '').split(/(\s+)/).filter((t) => t.length > 0);
}

function wordDiff(oldStr, newStr) {
  const a = tokenize(oldStr);
  const b = tokenize(newStr);
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { result.push({ type: 'same', text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: 'del', text: a[i] }); i++; }
    else { result.push({ type: 'add', text: b[j] }); j++; }
  }
  while (i < n) { result.push({ type: 'del', text: a[i] }); i++; }
  while (j < m) { result.push({ type: 'add', text: b[j] }); j++; }
  return result;
}

// ---------------- Review prompt + validation ----------------

const REVIEW_SYSTEM_PROMPT = `You are an expert English-to-Persian subtitle editor specializing in anime dialogue.

Review the existing Persian translation against the English source. Do not rewrite the translation unnecessarily.

Check:
- meaning
- missing information
- added information
- mistranslation
- terminology
- consistency
- natural Persian
- conversational tone
- slang
- idioms
- emotion
- character voice
- grammar
- punctuation

Do NOT automatically prefer formal Persian. Conversational Persian (e.g. "می‌خوام" instead of "می‌خواهم") is often preferable for anime dialogue and must not be flagged just for being informal.

Do not report an error merely because another Persian wording is also possible — only report a real, meaningful problem.

If the translation is already accurate and natural, mark it as correct.

If there is a real problem, explain it clearly and provide a corrected Persian translation.

Respond with ONLY a single JSON object, no markdown fences, no extra commentary, matching exactly this schema:
{
  "status": "correct" | "issue",
  "severity": "critical" | "major" | "minor" | "consistency" | null,
  "issue_type": string | null,
  "explanation": string,
  "suggested_translation": string | null,
  "confidence": number
}`;

function buildReviewUserPrompt({ en, fa, prevEn, prevFa, nextEn, nextFa }) {
  const prevBlock = (prevEn || []).map((line, i) => `EN: ${line}\nFA: ${(prevFa || [])[i] || ''}`).join('\n');
  const nextBlock = (nextEn || []).map((line, i) => `EN: ${line}\nFA: ${(nextFa || [])[i] || ''}`).join('\n');

  return `CURRENT SUBTITLE
English source: "${en}"
Persian translation: "${fa}"

${prevBlock ? `PREVIOUS LINES (context only — do not review these):\n${prevBlock}\n` : ''}
${nextBlock ? `FOLLOWING LINES (context only — do not review these):\n${nextBlock}\n` : ''}

Review only the CURRENT SUBTITLE above and respond with the JSON object only.`;
}

const VALID_SEVERITIES = new Set(['critical', 'major', 'minor', 'consistency']);

function parseAndValidateReview(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { valid: false, error: 'Empty response from model' };
  }
  let cleaned = rawText.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace >= firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return { valid: false, error: 'Model did not return valid JSON', raw: rawText };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Model response was not a JSON object', raw: rawText };
  }

  // Some models (especially reasoning models like openai/gpt-oss) are loose
  // about the exact schema even when the JSON itself is valid. Infer status
  // when it's missing rather than failing outright: a present, non-empty
  // suggested_translation implies an issue was found.
  let status = parsed.status;
  if (status !== 'correct' && status !== 'issue') {
    if (typeof parsed.suggested_translation === 'string' && parsed.suggested_translation.trim()) status = 'issue';
    else if (status === undefined || status === null || status === '') status = 'correct';
    else return { valid: false, error: `Invalid "status" value: ${parsed.status}`, raw: rawText };
  }

  // Severity only matters for issues, and only as a display hint — an
  // unrecognized value degrades to "minor" instead of failing the review.
  let severity = null;
  if (status === 'issue') severity = VALID_SEVERITIES.has(parsed.severity) ? parsed.severity : 'minor';

  if (status === 'issue' && (typeof parsed.suggested_translation !== 'string' || !parsed.suggested_translation.trim())) {
    return { valid: false, error: 'Issue reported but no "suggested_translation" provided', raw: rawText };
  }

  // A missing/empty explanation is cosmetic, not a reason to discard an
  // otherwise-usable review (this was previously a hard failure and was the
  // single most common cause of "Review failed" errors in practice).
  const explanation = (typeof parsed.explanation === 'string' && parsed.explanation.trim())
    ? parsed.explanation.trim()
    : (status === 'issue' ? 'The model flagged this line but did not provide an explanation.' : 'No issues found (model did not provide an explanation).');

  return {
    valid: true,
    data: {
      status,
      severity,
      issue_type: parsed.issue_type || null,
      explanation,
      suggested_translation: status === 'issue' ? parsed.suggested_translation.trim() : null,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.7,
    },
  };
}

// ---------------- Persian-only review (no English source available) ----------------
// Same JSON contract as the EN/FA reviewer above, but judges Persian text on
// its own terms: grammar, spelling, typography, naturalness, consistency.

const PERSIAN_ONLY_SYSTEM_PROMPT = `You are an expert Persian-language editor specializing in anime subtitle dialogue.

No English source is available for this line — judge the Persian text on its own merits only. Check:
- grammar
- spelling
- Persian typography (spacing, half-space/ZWNJ usage, punctuation)
- natural, conversational Persian phrasing
- internal consistency with the surrounding lines (tone, character voice, terminology)

Do NOT automatically prefer formal Persian. Conversational Persian (e.g. "می‌خوام" instead of "می‌خواهم") is often preferable for anime dialogue and must not be flagged just for being informal.

Do not report an error merely because another Persian wording is also possible — only report a real, meaningful problem.

If the line is already clean and natural, mark it as correct.

Respond with ONLY a single JSON object, no markdown fences, no extra commentary, matching exactly this schema:
{
  "status": "correct" | "issue",
  "severity": "critical" | "major" | "minor" | "consistency" | null,
  "issue_type": string | null,
  "explanation": string,
  "suggested_translation": string | null,
  "confidence": number
}`;

function buildPersianOnlyUserPrompt({ fa, prevFa, nextFa }) {
  const prevBlock = (prevFa || []).map((line) => `FA: ${line}`).join('\n');
  const nextBlock = (nextFa || []).map((line) => `FA: ${line}`).join('\n');
  return `CURRENT SUBTITLE
Persian text: "${fa}"

${prevBlock ? `PREVIOUS LINES (context only — do not review these):\n${prevBlock}\n` : ''}
${nextBlock ? `FOLLOWING LINES (context only — do not review these):\n${nextBlock}\n` : ''}

Review only the CURRENT SUBTITLE above and respond with the JSON object only.`;
}

// Appends a project's style-guide preferences to either reviewer's system
// prompt, so AI suggestions follow project-level choices instead of
// hard-coded defaults.
function styleGuideBlock(style) {
  if (!style) return '';
  const lines = [];
  if (style.formality) lines.push(`Preferred register: ${style.formality}.`);
  if (style.punctuation) lines.push(`Preferred punctuation style: ${style.punctuation}.`);
  if (style.avoidWords) lines.push(`Avoid these words/phrases where possible: ${style.avoidWords}.`);
  if (style.preferredExpressions) lines.push(`Prefer these expressions where natural: ${style.preferredExpressions}.`);
  if (!lines.length) return '';
  return `\n\nPROJECT STYLE GUIDE (apply these preferences):\n${lines.join('\n')}`;
}

// ---------------- AI providers (called directly from the browser) ----------------
// The API key lives only in this browser's localStorage. It is sent directly
// to the provider you choose, exactly like any other web app that calls an
// AI API from client-side JS — it never touches the GitHub repo or any
// server of ours.

const PROVIDER_PRESETS = {
  groq: {
    label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', kind: 'openai_compatible',
    defaultModel: 'openai/gpt-oss-120b', corsNote: 'known to work directly from the browser',
  },
  openrouter: {
    label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', kind: 'openai_compatible',
    defaultModel: 'anthropic/claude-sonnet-4.6', corsNote: 'generally works from the browser',
    extraHeaders: { 'HTTP-Referer': location.origin, 'X-Title': 'Persian Subtitle QA' },
  },
  gemini: {
    label: 'Google Gemini', kind: 'gemini', defaultModel: 'gemini-2.5-flash', corsNote: 'generally works from the browser',
  },
  anthropic: {
    label: 'Anthropic', kind: 'anthropic', defaultModel: 'claude-sonnet-4-6', corsNote: 'works with a direct-browser-access header',
  },
  openai: {
    label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', kind: 'openai_compatible',
    defaultModel: 'gpt-5.1-mini', corsNote: 'often blocked for direct browser calls — test first',
  },
  deepseek: {
    label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', kind: 'openai_compatible',
    defaultModel: 'deepseek-chat', corsNote: 'untested for direct browser calls — test first',
  },
};

async function callOpenAICompatible(baseUrl, apiKey, model, systemPrompt, userPrompt, extraHeaders) {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, extraHeaders || {}),
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.error && (data.error.message || JSON.stringify(data.error))) || `HTTP ${res.status}`);
  }
  const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
  if (!text) throw new Error('Empty response from model');
  return text;
}

async function callAnthropic(apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model, max_tokens: 1024, system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data && data.error && data.error.message) || `HTTP ${res.status}`);
  const block = (data.content || []).find((b) => b.type === 'text');
  if (!block) throw new Error('Empty response from model');
  return block.text;
}

async function callGemini(apiKey, model, systemPrompt, userPrompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data && data.error && data.error.message) || `HTTP ${res.status}`);
  const cand = data.candidates && data.candidates[0];
  const text = cand && cand.content && cand.content.parts && cand.content.parts.map((p) => p.text || '').join('');
  if (!text) throw new Error('Empty response from model');
  return text;
}

async function callConfiguredModel(systemPrompt, userPrompt) {
  const config = sqaGetProviderConfig();
  if (!config || !config.apiKey) throw new Error('No API key configured. Go to Settings and add one.');
  const preset = PROVIDER_PRESETS[config.kind] || PROVIDER_PRESETS.groq;
  const model = config.model || preset.defaultModel;

  if (preset.kind === 'anthropic') return callAnthropic(config.apiKey, model, systemPrompt, userPrompt);
  if (preset.kind === 'gemini') return callGemini(config.apiKey, model, systemPrompt, userPrompt);
  const baseUrl = config.baseUrl || preset.baseUrl;
  return callOpenAICompatible(baseUrl, config.apiKey, model, systemPrompt, userPrompt, preset.extraHeaders);
}

function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function callConfiguredModelWithRetry(systemPrompt, userPrompt, maxRetries) {
  maxRetries = maxRetries == null ? 4 : maxRetries;
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callConfiguredModel(systemPrompt, userPrompt);
    } catch (e) {
      lastErr = e;
      const msg = (e.message || '').toLowerCase();
      // "Failed to fetch" / "NetworkError" / "Load failed" are the browser's generic
      // messages for a connection that never completed (dropped, blocked, DNS hiccup,
      // flaky VPN, etc.) rather than a real error from the provider — worth retrying,
      // same as rate limits and timeouts.
      const retryable = msg.includes('429') || msg.includes('rate') || msg.includes('timeout')
        || msg.includes('503') || msg.includes('overloaded') || msg.includes('failed to fetch')
        || msg.includes('networkerror') || msg.includes('load failed') || msg.includes('network request failed');
      if (!retryable || attempt === maxRetries) throw e;
      await sleep(800 * Math.pow(2, attempt));
    }
  }
  throw lastErr;
}

async function testProviderConnection(kindOverride, apiKeyOverride, modelOverride) {
  const preset = PROVIDER_PRESETS[kindOverride] || PROVIDER_PRESETS.groq;
  const model = modelOverride || preset.defaultModel;
  try {
    let text;
    if (preset.kind === 'anthropic') text = await callAnthropic(apiKeyOverride, model, 'Respond with exactly: {"ok": true}', 'Respond now.');
    else if (preset.kind === 'gemini') text = await callGemini(apiKeyOverride, model, 'Respond with exactly: {"ok": true}', 'Respond now.');
    else text = await callOpenAICompatible(preset.baseUrl, apiKeyOverride, model, 'Respond with exactly: {"ok": true}', 'Respond now.', preset.extraHeaders);
    return { success: true, raw: text };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

// ============================================================
// Local (non-AI) Persian QA checks — run instantly, no API calls,
// work even on Persian-only files with no English source.
// Heuristic, not a full NLP pipeline — see README limitations.
// ============================================================

function sqaUid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function checkCharConfusion(text) {
  const fixed = (text || '').replace(/\u064A/g, '\u06CC').replace(/\u0643/g, '\u06A9');
  return fixed !== text ? fixed : null;
}

function checkSpacing(text) {
  let fixed = (text || '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([،؛؟!.,:])/g, '$1')
    .replace(/([،؛؟!.,:])(?=[^\s،؛؟!.,:\n])/g, '$1 ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/^[ \t]+|[ \t]+$/gm, '');
  fixed = fixed.trim();
  return fixed !== (text || '').trim() ? fixed : null;
}

function checkPunctuationRepeat(text) {
  const fixed = (text || '')
    .replace(/([!؟?])\1{2,}/g, '$1$1$1')
    .replace(/\.{4,}/g, '...');
  return fixed !== text ? fixed : null;
}

function checkHalfSpace(text) {
  // Common informal-verb prefixes (می/نمی) written with a plain space
  // instead of ZWNJ (U+200C) before the verb stem — flagged as a
  // suggestion only, since a plain space is not "wrong", just less
  // standard typography.
  const fixed = (text || '').replace(/\b(نمی|می) ([آ-ی])/g, '$1\u200C$2');
  return fixed !== text ? fixed : null;
}

function checkLineLength(text, maxChars, maxLines) {
  const lines = (text || '').split('\n');
  const problems = [];
  if (lines.length > maxLines) problems.push(`more than ${maxLines} lines (${lines.length})`);
  lines.forEach((l, i) => { if (l.length > maxChars) problems.push(`line ${i + 1} exceeds ${maxChars} chars (${l.length})`); });
  return problems.length ? problems.join('; ') : null;
}

function checkTiming(entry, nextEntry, opts) {
  const problems = [];
  const dur = entry.end - entry.start;
  if (entry.end <= entry.start) {
    problems.push({ severity: 'HIGH', message: 'End time is at or before the start time' });
  } else {
    if (dur < (opts.minDurationMs || 300)) problems.push({ severity: 'LOW', message: `Duration is very short (${dur}ms)` });
    if (dur > (opts.maxDurationMs || 8000)) problems.push({ severity: 'LOW', message: `Duration is unusually long (${(dur / 1000).toFixed(1)}s)` });
  }
  if (nextEntry && entry.end > nextEntry.start) {
    problems.push({ severity: 'HIGH', message: `Overlaps the next subtitle (#${nextEntry.index})` });
  }
  return problems;
}

function checkTerminology(text, glossary) {
  const hits = [];
  (glossary || []).filter((g) => g.enabled !== false).forEach((term) => {
    (term.alternates || []).forEach((alt) => {
      const a = (alt || '').trim();
      if (a && (text || '').includes(a) && a !== term.preferred) {
        hits.push({ preferred: term.preferred, found: a });
      }
    });
  });
  return hits;
}

// Runs every local check across all subtitles and returns a flat issue
// list shaped like AI-sourced issues so both can share one QA panel.
function runLocalQA(subtitles, opts) {
  opts = opts || {};
  const maxChars = opts.maxCharsPerLine || 42;
  const maxLines = opts.maxLinesPerSub || 2;
  const glossary = opts.glossary || [];
  const issues = [];

  subtitles.forEach((s, i) => {
    const text = s.fa || '';
    const push = (category, severity, message, suggestedText) => {
      issues.push({
        id: sqaUid('local'), subId: s.id, subIndex: s.index, source: 'local',
        category, severity, message,
        currentText: text, suggestedText: suggestedText || null,
      });
    };

    const charFix = checkCharConfusion(text);
    if (charFix) push('char-confusion', 'MEDIUM', 'Arabic ي / ك used instead of Persian ی / ک', charFix);

    const spaceFix = checkSpacing(text);
    if (spaceFix) push('spacing', 'LOW', 'Extra, missing, or misplaced spacing around punctuation', spaceFix);

    const punctFix = checkPunctuationRepeat(text);
    if (punctFix) push('punctuation', 'LOW', 'Repeated punctuation marks', punctFix);

    const halfSpaceFix = checkHalfSpace(text);
    if (halfSpaceFix) push('typography', 'SUGGESTION', 'Missing half-space (ZWNJ) after می/نمی', halfSpaceFix);

    const lenIssue = checkLineLength(text, maxChars, maxLines);
    if (lenIssue) push('line-length', 'MEDIUM', `Readability: ${lenIssue}`, null);

    checkTiming(s, subtitles[i + 1], opts).forEach((t) => push('timing', t.severity, t.message, null));

    checkTerminology(text, glossary).forEach((t) => {
      push('terminology', 'MEDIUM', `Preferred term is "${t.preferred}", found "${t.found}"`, text.split(t.found).join(t.preferred));
    });
  });

  return issues;
}

// ---------------- Projects (glossary + style guide, reusable across episodes) ----------------

const SQA_PROJECTS_KEY = 'sqa_projects';

function sqaGetProjects() {
  try { const raw = localStorage.getItem(SQA_PROJECTS_KEY); return raw ? JSON.parse(raw) : []; }
  catch (e) { return []; }
}

function sqaSaveProjects(list) {
  try { localStorage.setItem(SQA_PROJECTS_KEY, JSON.stringify(list)); return true; }
  catch (e) { return false; }
}

function sqaCreateProject(name) {
  const projects = sqaGetProjects();
  const project = {
    id: sqaUid('proj'),
    name: (name || 'Untitled project').trim() || 'Untitled project',
    glossary: [],
    style: { formality: 'conversational', punctuation: 'persian', avoidWords: '', preferredExpressions: '' },
    maxCharsPerLine: 42,
    maxLinesPerSub: 2,
    createdAt: Date.now(),
  };
  projects.push(project);
  sqaSaveProjects(projects);
  return project;
}

function sqaUpdateProject(id, updates) {
  const projects = sqaGetProjects();
  const next = projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
  sqaSaveProjects(next);
  return next.find((p) => p.id === id);
}

function sqaDeleteProject(id) {
  sqaSaveProjects(sqaGetProjects().filter((p) => p.id !== id));
}

const SQA_ACTIVE_PROJECT_KEY = 'sqa_active_project';
function sqaGetActiveProjectId() {
  try { return localStorage.getItem(SQA_ACTIVE_PROJECT_KEY) || null; } catch (e) { return null; }
}
function sqaSetActiveProjectId(id) {
  try { localStorage.setItem(SQA_ACTIVE_PROJECT_KEY, id || ''); } catch (e) { /* ignore */ }
}

// ---------------- Working session autosave / crash recovery ----------------

const SQA_WORKING_KEY = 'sqa_working_session';

function sqaSaveWorkingSession(data) {
  try { localStorage.setItem(SQA_WORKING_KEY, JSON.stringify(data)); return true; }
  catch (e) { return false; }
}

function sqaGetWorkingSession() {
  try { const raw = localStorage.getItem(SQA_WORKING_KEY); return raw ? JSON.parse(raw) : null; }
  catch (e) { return null; }
}

function sqaClearWorkingSession() {
  try { localStorage.removeItem(SQA_WORKING_KEY); } catch (e) { /* ignore */ }
}

// ---------------- Glossary import/export (plain JSON, {source: preferred}) ----------------

function glossaryToSimpleJSON(glossary) {
  const obj = {};
  (glossary || []).forEach((t) => { obj[t.source || t.preferred] = t.preferred; });
  return JSON.stringify(obj, null, 2);
}

function simpleJSONToGlossary(jsonText) {
  const obj = JSON.parse(jsonText);
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Expected a flat {"term": "preferred"} JSON object');
  return Object.entries(obj).map(([source, preferred]) => ({
    id: sqaUid('term'), source, preferred: String(preferred), alternates: [source], enabled: true, category: 'term',
  }));
}
