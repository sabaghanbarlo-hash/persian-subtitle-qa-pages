// Compiled from src/app.jsx via Babel (react preset, classic runtime). Do not hand-edit — edit src/app.jsx and recompile.
const {
  useState,
  useEffect,
  useMemo
} = React;
const NAV_ITEMS = [{
  key: 'dashboard',
  label: 'Dashboard'
}, {
  key: 'review',
  label: 'New Review'
}, {
  key: 'projects',
  label: 'Projects'
}, {
  key: 'tm',
  label: 'Translation Memory'
}, {
  key: 'settings',
  label: 'AI Models & Settings'
}];
function Sidebar({
  page,
  setPage
}) {
  return /*#__PURE__*/React.createElement("aside", {
    className: "sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark"
  }, "Subtitle QA"), /*#__PURE__*/React.createElement("span", {
    className: "brand-tc"
  }, "00:00:01,000")), /*#__PURE__*/React.createElement("nav", {
    className: "nav"
  }, NAV_ITEMS.map(item => /*#__PURE__*/React.createElement("button", {
    key: item.key,
    className: `nav-item${page === item.key ? ' active' : ''}`,
    onClick: () => setPage(item.key)
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), item.label))), /*#__PURE__*/React.createElement("div", {
    className: "sidebar-footer"
  }, "English → Persian anime subtitle QA.", /*#__PURE__*/React.createElement("br", null), "Runs entirely in this browser — your API key is sent straight to your chosen provider and never touches this site's code or repo."));
}
function Row({
  label,
  value,
  mono,
  color
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '6px 0',
      borderBottom: '1px solid var(--border-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-dim)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      color: color || 'var(--text)'
    }
  }, value));
}
function Stat({
  label,
  value,
  color
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 22,
      fontWeight: 600,
      color: color || 'var(--text)'
    }
  }, value ?? 0), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'var(--text-faint)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }
  }, label));
}

// ---------------- Dashboard ----------------
function DashboardPage({
  goReview,
  providerConfig
}) {
  const [lastSession, setLastSession] = useState(null);
  useEffect(() => {
    setLastSession(sqaGetLastSession());
  }, []);
  const preset = PROVIDER_PRESETS[providerConfig && providerConfig.kind || 'groq'];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-eyebrow"
  }, "Dashboard"), /*#__PURE__*/React.createElement("h1", {
    className: "page-title"
  }, "Subtitle QA overview"), /*#__PURE__*/React.createElement("p", {
    className: "page-sub"
  }, "Upload an English/Persian subtitle pair, run an AI review, and work through the flagged lines.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.3fr 1fr',
      gap: 20,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 4px',
      fontFamily: 'var(--font-display)',
      fontSize: 16
    }
  }, "Last review session"), lastSession ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 28,
      marginTop: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Subtitles",
    value: lastSession.total
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Correct",
    value: lastSession.correct,
    color: "var(--correct)"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Minor",
    value: lastSession.minor,
    color: "var(--minor)"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Major",
    value: lastSession.major,
    color: "var(--major)"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Critical",
    value: lastSession.critical,
    color: "var(--critical)"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Errors",
    value: lastSession.errors,
    color: "var(--text-faint)"
  })) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-dim)',
      fontSize: 13.5,
      marginTop: 8
    }
  }, "No review has been run in this browser yet."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: goReview
  }, "Start a new review →"))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 4px',
      fontFamily: 'var(--font-display)',
      fontSize: 16
    }
  }, "AI provider"), providerConfig && providerConfig.apiKey ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement(Row, {
    label: "Provider",
    value: preset.label
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Model",
    value: providerConfig.model || preset.defaultModel,
    mono: true
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Status",
    value: "API key set in this browser",
    color: "var(--correct)"
  })) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--critical)',
      fontSize: 13.5,
      marginTop: 8
    }
  }, "No API key configured yet. Go to AI Models & Settings to add one (Groq's free tier works well)."))), /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("h3", null, "Projects, translation memory, and multi-model review are next"), /*#__PURE__*/React.createElement("p", null, "This runs a single AI reviewer against one English/Persian subtitle pair at a time. Persistent projects, a glossary, and a judge model are planned for later.")));
}

// ---------------- Settings ----------------
function SettingsPage({
  providerConfig,
  setProviderConfig
}) {
  const [kind, setKind] = useState(providerConfig && providerConfig.kind || 'groq');
  const [apiKey, setApiKey] = useState(providerConfig && providerConfig.apiKey || '');
  const [model, setModel] = useState(providerConfig && providerConfig.model || '');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const preset = PROVIDER_PRESETS[kind];
  function save() {
    const config = {
      kind,
      apiKey: apiKey.trim(),
      model: model.trim()
    };
    sqaSaveProviderConfig(config);
    setProviderConfig(config);
    setTestResult(null);
  }
  async function test() {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        error: 'Enter an API key first.'
      });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await testProviderConnection(kind, apiKey.trim(), model.trim() || preset.defaultModel);
    setTestResult(result);
    setTesting(false);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-eyebrow"
  }, "Settings"), /*#__PURE__*/React.createElement("h1", {
    className: "page-title"
  }, "AI models & settings"), /*#__PURE__*/React.createElement("p", {
    className: "page-sub"
  }, "This app has no server — your API key is stored only in this browser's local storage and sent directly from your browser to the provider you choose below.")), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      maxWidth: 520
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Provider"), /*#__PURE__*/React.createElement("select", {
    className: "select-input",
    value: kind,
    onChange: e => {
      setKind(e.target.value);
      setModel('');
      setTestResult(null);
    }
  }, Object.entries(PROVIDER_PRESETS).map(([k, p]) => /*#__PURE__*/React.createElement("option", {
    key: k,
    value: k
  }, p.label))), /*#__PURE__*/React.createElement("p", {
    className: "field-hint"
  }, preset.corsNote, "."), /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "API key"), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    type: "password",
    value: apiKey,
    onChange: e => setApiKey(e.target.value),
    placeholder: "Paste your API key"
  }), /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Model ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.6
    }
  }, "(optional — defaults to ", preset.defaultModel, ")")), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    value: model,
    onChange: e => setModel(e.target.value),
    placeholder: preset.defaultModel
  }), /*#__PURE__*/React.createElement("div", {
    className: "action-row",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: save
  }, "Save"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: test,
    disabled: testing
  }, testing ? 'Testing…' : 'Test connection')), testResult && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 10,
      fontSize: 13,
      color: testResult.success ? 'var(--correct)' : 'var(--critical)'
    }
  }, testResult.success ? '✓ Connected successfully.' : `✗ ${testResult.error}`), providerConfig && providerConfig.apiKey && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 10,
      fontSize: 12,
      color: 'var(--text-faint)'
    }
  }, "Currently saved: ", PROVIDER_PRESETS[providerConfig.kind].label, " · ", providerConfig.model || PROVIDER_PRESETS[providerConfig.kind].defaultModel)), /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("h3", null, "Multi-model review comes later"), /*#__PURE__*/React.createElement("p", null, "Running several models per line, comparing their opinions, and an optional judge model are planned for a later phase.")));
}

// ---------------- Stub pages ----------------
function StubPage({
  eyebrow,
  title,
  sub,
  note
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-eyebrow"
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    className: "page-title"
  }, title), /*#__PURE__*/React.createElement("p", {
    className: "page-sub"
  }, sub)), /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("h3", null, "Coming after the MVP"), /*#__PURE__*/React.createElement("p", null, note)));
}

// ---------------- Subtitle card ----------------
function msToClock(ms) {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const mi = Math.floor(ms / 60000);
  ms -= mi * 60000;
  const se = Math.floor(ms / 1000);
  ms -= se * 1000;
  const pad = (n, l) => String(n).padStart(l || 2, '0');
  return `${pad(h)}:${pad(mi)}:${pad(se)},${pad(ms, 3)}`;
}
const SEVERITY_LABEL = {
  correct: '✓ Correct',
  minor: '⚠ Minor',
  major: '⚠ Major',
  critical: '🔴 Critical',
  consistency: 'Consistency',
  error: 'Failed',
  unreviewed: 'Unreviewed'
};
function SubtitleCard({
  item,
  derivedStatus,
  onApply,
  onIgnore,
  onSaveEdit,
  onRevert
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const hasIssue = item.review && item.review.status === 'issue';
  const wasEdited = item.fa !== item.originalFa;
  function startEdit() {
    setEditValue(hasIssue && item.review.suggested_translation || item.fa);
    setEditing(true);
  }
  function saveEdit() {
    onSaveEdit(item.id, editValue);
    setEditing(false);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: `subtitle-card sev-${derivedStatus}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "sub-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sub-id"
  }, "#", item.index), /*#__PURE__*/React.createElement("span", {
    className: `badge badge-${derivedStatus}`
  }, SEVERITY_LABEL[derivedStatus] || derivedStatus), /*#__PURE__*/React.createElement("span", {
    className: "sub-time"
  }, msToClock(item.start), " → ", msToClock(item.end))), /*#__PURE__*/React.createElement("div", {
    className: "sub-lang-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lang-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lang-label"
  }, "English"), /*#__PURE__*/React.createElement("div", {
    className: "en-text"
  }, item.en)), /*#__PURE__*/React.createElement("div", {
    className: "lang-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lang-label"
  }, "Persian ", wasEdited && '· corrected'), /*#__PURE__*/React.createElement("div", {
    className: `fa-text${wasEdited ? ' edited' : ''}`
  }, item.fa))), item.status === 'error' && /*#__PURE__*/React.createElement("div", {
    className: "review-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "review-error"
  }, "Review failed: ", item.error)), item.review && /*#__PURE__*/React.createElement("div", {
    className: "review-block"
  }, /*#__PURE__*/React.createElement("p", {
    className: "review-explanation"
  }, item.review.explanation), hasIssue && !editing && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "suggestion-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "suggestion-label"
  }, "Suggested correction"), /*#__PURE__*/React.createElement("div", {
    className: "diff-line"
  }, wordDiff(item.fa, item.review.suggested_translation).map((tok, i) => {
    if (tok.type === 'same') return /*#__PURE__*/React.createElement("span", {
      key: i
    }, tok.text);
    if (tok.type === 'add') return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "diff-add"
    }, tok.text);
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "diff-del"
    }, tok.text);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "action-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: () => onApply(item.id)
  }, "Apply correction"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: startEdit
  }, "Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onIgnore(item.id)
  }, "Ignore"), /*#__PURE__*/React.createElement("span", {
    className: "confidence-pill"
  }, "confidence ", Math.round((item.review.confidence || 0) * 100), "%"))), editing && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("textarea", {
    className: "edit-textarea",
    value: editValue,
    onChange: e => setEditValue(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "action-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary btn-sm",
    onClick: saveEdit
  }, "Save"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setEditing(false)
  }, "Cancel"))), !hasIssue && !editing && /*#__PURE__*/React.createElement("div", {
    className: "action-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: startEdit
  }, "Edit anyway"), /*#__PURE__*/React.createElement("span", {
    className: "confidence-pill"
  }, "confidence ", Math.round((item.review.confidence || 0) * 100), "%")), item.userDecision === 'applied' && /*#__PURE__*/React.createElement("div", {
    className: "applied-tag",
    style: {
      marginTop: 8
    }
  }, "✓ Correction applied"), item.userDecision === 'ignored' && /*#__PURE__*/React.createElement("div", {
    className: "ignored-tag",
    style: {
      marginTop: 8
    }
  }, "Issue ignored, original kept"), item.userDecision === 'edited' && /*#__PURE__*/React.createElement("div", {
    className: "applied-tag",
    style: {
      marginTop: 8
    }
  }, "✓ Manually edited"), wasEdited && /*#__PURE__*/React.createElement("div", {
    className: "action-row",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onRevert(item.id)
  }, "Revert to original"))));
}

// ---------------- Review page ----------------
const FILTERS = [{
  key: 'all',
  label: 'All'
}, {
  key: 'unreviewed',
  label: 'Unreviewed'
}, {
  key: 'correct',
  label: 'Correct'
}, {
  key: 'minor',
  label: 'Minor'
}, {
  key: 'major',
  label: 'Major'
}, {
  key: 'critical',
  label: 'Critical'
}, {
  key: 'consistency',
  label: 'Consistency'
}, {
  key: 'error',
  label: 'Errors'
}];
const CONCURRENCY = 2;
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
function deriveStatus(item) {
  if (item.status === 'error') return 'error';
  if (!item.review) return 'unreviewed';
  if (item.review.status === 'correct') return 'correct';
  return item.review.severity || 'minor';
}
function ReviewPage({
  providerConfig,
  goSettings
}) {
  const [enName, setEnName] = useState('');
  const [faName, setFaName] = useState('');
  const [enEntries, setEnEntries] = useState(null);
  const [faEntries, setFaEntries] = useState(null);
  const [pairInfo, setPairInfo] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0
  });
  const [parseError, setParseError] = useState('');
  const isConfigured = providerConfig && providerConfig.apiKey;
  async function handleUpload(side, file) {
    setParseError('');
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const entries = parseSRT(text);
      if (!entries.length) {
        setParseError(`Couldn't find any valid subtitle entries in ${file.name}. Make sure it's a well-formed .srt file.`);
        return;
      }
      if (side === 'en') {
        setEnName(file.name);
        setEnEntries(entries);
      } else {
        setFaName(file.name);
        setFaEntries(entries);
      }
    } catch (e) {
      setParseError(`Failed to read ${file.name}: ${e.message}`);
    }
  }
  function buildSession() {
    if (!enEntries || !faEntries) return;
    const result = pairSubtitles(enEntries, faEntries);
    setPairInfo(result);
    setSubtitles(result.paired.map(p => ({
      ...p,
      status: 'unreviewed'
    })));
  }
  const counts = useMemo(() => {
    const c = {
      all: subtitles.length,
      unreviewed: 0,
      correct: 0,
      minor: 0,
      major: 0,
      critical: 0,
      consistency: 0,
      error: 0
    };
    subtitles.forEach(s => {
      c[deriveStatus(s)] = (c[deriveStatus(s)] || 0) + 1;
    });
    return c;
  }, [subtitles]);
  const visible = useMemo(() => filter === 'all' ? subtitles : subtitles.filter(s => deriveStatus(s) === filter), [subtitles, filter]);
  function updateSubtitle(id, updates) {
    setSubtitles(prev => prev.map(s => s.id === id ? {
      ...s,
      ...updates
    } : s));
  }
  function saveSummary(list) {
    const summary = {
      total: list.length,
      correct: 0,
      minor: 0,
      major: 0,
      critical: 0,
      errors: 0
    };
    list.forEach(s => {
      const st = deriveStatus(s);
      if (st === 'correct') summary.correct++;else if (st === 'minor') summary.minor++;else if (st === 'major') summary.major++;else if (st === 'critical') summary.critical++;else if (st === 'error') summary.errors++;
    });
    sqaSaveLastSession(summary);
  }
  async function reviewOne(item, index, snapshot) {
    const prevEn = snapshot.slice(Math.max(0, index - 2), index).map(s => s.en);
    const prevFa = snapshot.slice(Math.max(0, index - 2), index).map(s => s.fa);
    const nextEn = snapshot.slice(index + 1, index + 3).map(s => s.en);
    const nextFa = snapshot.slice(index + 1, index + 3).map(s => s.fa);
    const userPrompt = buildReviewUserPrompt({
      en: item.en,
      fa: item.fa,
      prevEn,
      prevFa,
      nextEn,
      nextFa
    });
    try {
      const rawText = await callConfiguredModelWithRetry(REVIEW_SYSTEM_PROMPT, userPrompt, 4);
      const result = parseAndValidateReview(rawText);
      if (!result.valid) updateSubtitle(item.id, {
        status: 'error',
        error: result.error
      });else updateSubtitle(item.id, {
        status: 'reviewed',
        review: result.data
      });
    } catch (e) {
      updateSubtitle(item.id, {
        status: 'error',
        error: e.message || 'Request failed'
      });
    } finally {
      setProgress(p => ({
        ...p,
        completed: p.completed + 1
      }));
    }
  }
  async function runAnalysis() {
    if (!subtitles.length || analyzing || !isConfigured) return;
    setAnalyzing(true);
    setProgress({
      completed: 0,
      total: subtitles.length
    });
    const snapshot = subtitles;
    let cursor = 0;
    async function worker() {
      while (cursor < snapshot.length) {
        const myIndex = cursor;
        cursor += 1;
        await reviewOne(snapshot[myIndex], myIndex, snapshot);
      }
    }
    await Promise.all(Array.from({
      length: Math.min(CONCURRENCY, snapshot.length)
    }, worker));
    setAnalyzing(false);
  }
  function applyCorrection(id) {
    setSubtitles(prev => prev.map(s => s.id === id && s.review && s.review.status === 'issue' ? {
      ...s,
      fa: s.review.suggested_translation,
      userDecision: 'applied'
    } : s));
  }
  function ignoreIssue(id) {
    updateSubtitle(id, {
      userDecision: 'ignored'
    });
  }
  function saveEdit(id, value) {
    updateSubtitle(id, {
      fa: value,
      userDecision: 'edited'
    });
  }
  function revertOriginal(id) {
    setSubtitles(prev => prev.map(s => s.id === id ? {
      ...s,
      fa: s.originalFa,
      userDecision: null
    } : s));
  }
  function downloadCorrectedSRT() {
    const srt = exportSRT(subtitles, 'fa');
    const blob = new Blob([srt], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corrected.srt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  useMemo(() => {
    if (subtitles.length) saveSummary(subtitles);
  }, [subtitles]);
  const hasSession = subtitles.length > 0;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-eyebrow"
  }, "New Review"), /*#__PURE__*/React.createElement("h1", {
    className: "page-title"
  }, "Subtitle review"), /*#__PURE__*/React.createElement("p", {
    className: "page-sub"
  }, "Upload the English and Persian .srt files for one episode. Lines are paired by subtitle number, then reviewed with 2 lines of context on either side.")), !isConfigured && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner"
  }, "No AI provider configured yet. ", /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      marginLeft: 8
    },
    onClick: goSettings
  }, "Go to Settings")), !hasSession && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "upload-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: `dropzone${enEntries ? ' filled' : ''}`
  }, /*#__PURE__*/React.createElement("label", null, "English .srt"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".srt",
    onChange: e => handleUpload('en', e.target.files[0])
  }), enEntries && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "filename"
  }, enName), /*#__PURE__*/React.createElement("div", {
    className: "count"
  }, enEntries.length, " subtitle lines parsed"))), /*#__PURE__*/React.createElement("div", {
    className: `dropzone${faEntries ? ' filled' : ''}`
  }, /*#__PURE__*/React.createElement("label", null, "Persian .srt"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".srt",
    onChange: e => handleUpload('fa', e.target.files[0])
  }), faEntries && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "filename"
  }, faName), /*#__PURE__*/React.createElement("div", {
    className: "count"
  }, faEntries.length, " subtitle lines parsed")))), parseError && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner"
  }, parseError), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    disabled: !enEntries || !faEntries,
    onClick: buildSession
  }, "Pair subtitles →")), pairInfo && hasSession && (pairInfo.countMismatch || pairInfo.unmatchedEn.length > 0 || pairInfo.unmatchedFa.length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner"
  }, "English has ", enEntries.length, " lines, Persian has ", faEntries.length, " lines.", ' ', pairInfo.unmatchedEn.length > 0 && `${pairInfo.unmatchedEn.length} English line(s) had no matching Persian number. `, pairInfo.unmatchedFa.length > 0 && `${pairInfo.unmatchedFa.length} Persian line(s) had no matching English number. `, "These were left out rather than guessed — only the ", subtitles.length, " lines that matched by subtitle number are shown below."), hasSession && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "filter-row"
  }, FILTERS.map(f => /*#__PURE__*/React.createElement("button", {
    key: f.key,
    className: `filter-chip${filter === f.key ? ' active' : ''}`,
    onClick: () => setFilter(f.key)
  }, f.label, " ", /*#__PURE__*/React.createElement("span", {
    className: "count"
  }, counts[f.key] || 0)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: runAnalysis,
    disabled: analyzing || !isConfigured
  }, analyzing ? 'Analyzing…' : counts.unreviewed === subtitles.length ? 'Analyze episode' : 'Re-run analysis'), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: downloadCorrectedSRT
  }, "Download corrected SRT"))), analyzing && /*#__PURE__*/React.createElement("div", {
    className: "progress-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-track"
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill",
    style: {
      width: `${progress.total ? progress.completed / progress.total * 100 : 0}%`
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "progress-meta"
  }, /*#__PURE__*/React.createElement("span", null, "Analyzing subtitle ", Math.min(progress.completed + 1, progress.total), " / ", progress.total), /*#__PURE__*/React.createElement("span", null, "completed ", progress.completed), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--major)'
    }
  }, "issues found ", counts.minor + counts.major + counts.critical + counts.consistency), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--critical)'
    }
  }, "errors ", counts.error))), visible.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("h3", null, "Nothing matches this filter"), /*#__PURE__*/React.createElement("p", null, "Try a different filter, or run the analysis if you haven't yet.")) : /*#__PURE__*/React.createElement("div", {
    className: "subtitle-list"
  }, visible.map(item => /*#__PURE__*/React.createElement(SubtitleCard, {
    key: item.id,
    item: item,
    derivedStatus: deriveStatus(item),
    onApply: applyCorrection,
    onIgnore: ignoreIssue,
    onSaveEdit: saveEdit,
    onRevert: revertOriginal
  })))));
}

// ---------------- Root ----------------
function App() {
  const [page, setPage] = useState('dashboard');
  const [providerConfig, setProviderConfig] = useState(null);
  useEffect(() => {
    setProviderConfig(sqaGetProviderConfig());
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    page: page,
    setPage: setPage
  }), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, page === 'dashboard' && /*#__PURE__*/React.createElement(DashboardPage, {
    goReview: () => setPage('review'),
    providerConfig: providerConfig
  }), page === 'review' && /*#__PURE__*/React.createElement(ReviewPage, {
    providerConfig: providerConfig,
    goSettings: () => setPage('settings')
  }), page === 'settings' && /*#__PURE__*/React.createElement(SettingsPage, {
    providerConfig: providerConfig,
    setProviderConfig: setProviderConfig
  }), page === 'projects' && /*#__PURE__*/React.createElement(StubPage, {
    eyebrow: "Projects",
    title: "Projects",
    sub: "Group episodes by anime, keep per-project glossaries, and track review history.",
    note: "Right now each review is a one-off session in this browser. Persistent projects are planned for the next phase."
  }), page === 'tm' && /*#__PURE__*/React.createElement(StubPage, {
    eyebrow: "Translation Memory",
    title: "Translation memory",
    sub: "A persistent glossary of preferred terms, character names, and forbidden translations.",
    note: "The reviewer doesn't use a glossary yet — it judges each line on meaning, tone, and naturalness alone."
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));