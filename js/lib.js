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
      paired.push({
        id: `sub_${idx}`,
        index: idx,
        start: en.start,
        end: en.end,
        en: en.text,
        fa: fa.text,
        originalFa: fa.text,
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

const VALID_SEVERITIES = new Set(['critical', 'major', 'minor', 'consistency', null, undefined]);

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
  if (parsed.status !== 'correct' && parsed.status !== 'issue') {
    return { valid: false, error: `Invalid "status" value: ${parsed.status}`, raw: rawText };
  }
  if (!VALID_SEVERITIES.has(parsed.severity)) {
    return { valid: false, error: `Invalid "severity" value: ${parsed.severity}`, raw: rawText };
  }
  if (typeof parsed.explanation !== 'string' || !parsed.explanation) {
    return { valid: false, error: 'Missing "explanation"', raw: rawText };
  }
  if (parsed.status === 'issue' && (typeof parsed.suggested_translation !== 'string' || !parsed.suggested_translation)) {
    return { valid: false, error: 'Issue reported but no "suggested_translation" provided', raw: rawText };
  }

  return {
    valid: true,
    data: {
      status: parsed.status,
      severity: parsed.status === 'correct' ? null : (parsed.severity || 'minor'),
      issue_type: parsed.issue_type || null,
      explanation: parsed.explanation,
      suggested_translation: parsed.status === 'issue' ? parsed.suggested_translation : null,
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.7,
    },
  };
}

// ---------------- AI providers (called directly from the browser) ----------------
// The API key lives only in this browser's localStorage. It is sent directly
// to the provider you choose, exactly like any other web app that calls an
// AI API from client-side JS — it never touches the GitHub repo or any
// server of ours.

const PROVIDER_PRESETS = {
  groq: {
    label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', kind: 'openai_compatible',
    defaultModel: 'llama-3.3-70b-versatile', corsNote: 'known to work directly from the browser',
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
