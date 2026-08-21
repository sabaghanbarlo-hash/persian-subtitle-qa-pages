const { useState, useEffect, useMemo } = React;

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'review', label: 'New Review' },
  { key: 'projects', label: 'Projects' },
  { key: 'tm', label: 'Translation Memory' },
  { key: 'settings', label: 'AI Models & Settings' },
];

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">Subtitle QA</span>
        <span className="brand-tc">00:00:01,000</span>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button key={item.key} className={`nav-item${page === item.key ? ' active' : ''}`} onClick={() => setPage(item.key)}>
            <span className="dot" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        English → Persian anime subtitle QA.
        <br />
        Runs entirely in this browser — your API key is sent straight to your
        chosen provider and never touches this site's code or repo.
      </div>
    </aside>
  );
}

function Row({ label, value, mono, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-soft)' }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'inherit', color: color || 'var(--text)' }}>{value}</span>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: color || 'var(--text)' }}>{value ?? 0}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

// ---------------- Dashboard ----------------
function DashboardPage({ goReview, providerConfig }) {
  const [lastSession, setLastSession] = useState(null);
  useEffect(() => { setLastSession(sqaGetLastSession()); }, []);

  const preset = PROVIDER_PRESETS[(providerConfig && providerConfig.kind) || 'groq'];

  return (
    <div>
      <div className="page-head">
        <div className="page-eyebrow">Dashboard</div>
        <h1 className="page-title">Subtitle QA overview</h1>
        <p className="page-sub">
          Upload an English/Persian subtitle pair, run an AI review, and work through the flagged lines.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 16 }}>Last review session</h3>
          {lastSession ? (
            <div style={{ display: 'flex', gap: 28, marginTop: 14, flexWrap: 'wrap' }}>
              <Stat label="Subtitles" value={lastSession.total} />
              <Stat label="Correct" value={lastSession.correct} color="var(--correct)" />
              <Stat label="Minor" value={lastSession.minor} color="var(--minor)" />
              <Stat label="Major" value={lastSession.major} color="var(--major)" />
              <Stat label="Critical" value={lastSession.critical} color="var(--critical)" />
              <Stat label="Errors" value={lastSession.errors} color="var(--text-faint)" />
            </div>
          ) : (
            <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginTop: 8 }}>No review has been run in this browser yet.</p>
          )}
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={goReview}>Start a new review →</button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 16 }}>AI provider</h3>
          {providerConfig && providerConfig.apiKey ? (
            <div style={{ marginTop: 10, fontSize: 13.5 }}>
              <Row label="Provider" value={preset.label} />
              <Row label="Model" value={providerConfig.model || preset.defaultModel} mono />
              <Row label="Status" value="API key set in this browser" color="var(--correct)" />
            </div>
          ) : (
            <p style={{ color: 'var(--critical)', fontSize: 13.5, marginTop: 8 }}>
              No API key configured yet. Go to AI Models &amp; Settings to add one (Groq's free tier works well).
            </p>
          )}
        </div>
      </div>

      <div className="empty-state">
        <h3>Projects, translation memory, and multi-model review are next</h3>
        <p>This runs a single AI reviewer against one English/Persian subtitle pair at a time. Persistent projects, a glossary, and a judge model are planned for later.</p>
      </div>
    </div>
  );
}

// ---------------- Settings ----------------
function SettingsPage({ providerConfig, setProviderConfig }) {
  const [kind, setKind] = useState((providerConfig && providerConfig.kind) || 'groq');
  const [apiKey, setApiKey] = useState((providerConfig && providerConfig.apiKey) || '');
  const [model, setModel] = useState((providerConfig && providerConfig.model) || '');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const preset = PROVIDER_PRESETS[kind];

  function save() {
    const config = { kind, apiKey: apiKey.trim(), model: model.trim() };
    sqaSaveProviderConfig(config);
    setProviderConfig(config);
    setTestResult(null);
  }

  async function test() {
    if (!apiKey.trim()) { setTestResult({ success: false, error: 'Enter an API key first.' }); return; }
    setTesting(true);
    setTestResult(null);
    const result = await testProviderConnection(kind, apiKey.trim(), model.trim() || preset.defaultModel);
    setTestResult(result);
    setTesting(false);
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-eyebrow">Settings</div>
        <h1 className="page-title">AI models &amp; settings</h1>
        <p className="page-sub">
          This app has no server — your API key is stored only in this browser's local storage and sent
          directly from your browser to the provider you choose below.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 520 }}>
        <label className="field-label">Provider</label>
        <select className="select-input" value={kind} onChange={(e) => { setKind(e.target.value); setModel(''); setTestResult(null); }}>
          {Object.entries(PROVIDER_PRESETS).map(([k, p]) => (
            <option key={k} value={k}>{p.label}</option>
          ))}
        </select>
        <p className="field-hint">{preset.corsNote}.</p>

        <label className="field-label">API key</label>
        <input className="text-input" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Paste your API key" />

        <label className="field-label">Model <span style={{ opacity: 0.6 }}>(optional — defaults to {preset.defaultModel})</span></label>
        <input className="text-input" value={model} onChange={(e) => setModel(e.target.value)} placeholder={preset.defaultModel} />

        <div className="action-row" style={{ marginTop: 14 }}>
          <button className="btn btn-primary" onClick={save}>Save</button>
          <button className="btn" onClick={test} disabled={testing}>{testing ? 'Testing…' : 'Test connection'}</button>
        </div>

        {testResult && (
          <p style={{ marginTop: 10, fontSize: 13, color: testResult.success ? 'var(--correct)' : 'var(--critical)' }}>
            {testResult.success ? '✓ Connected successfully.' : `✗ ${testResult.error}`}
          </p>
        )}

        {providerConfig && providerConfig.apiKey && (
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--text-faint)' }}>
            Currently saved: {PROVIDER_PRESETS[providerConfig.kind].label} · {providerConfig.model || PROVIDER_PRESETS[providerConfig.kind].defaultModel}
          </p>
        )}
      </div>

      <div className="empty-state" style={{ marginTop: 20 }}>
        <h3>Multi-model review comes later</h3>
        <p>Running several models per line, comparing their opinions, and an optional judge model are planned for a later phase.</p>
      </div>
    </div>
  );
}

// ---------------- Stub pages ----------------
function StubPage({ eyebrow, title, sub, note }) {
  return (
    <div>
      <div className="page-head">
        <div className="page-eyebrow">{eyebrow}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{sub}</p>
      </div>
      <div className="empty-state">
        <h3>Coming after the MVP</h3>
        <p>{note}</p>
      </div>
    </div>
  );
}

// ---------------- Subtitle card ----------------
function msToClock(ms) {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000); ms -= h * 3600000;
  const mi = Math.floor(ms / 60000); ms -= mi * 60000;
  const se = Math.floor(ms / 1000); ms -= se * 1000;
  const pad = (n, l) => String(n).padStart(l || 2, '0');
  return `${pad(h)}:${pad(mi)}:${pad(se)},${pad(ms, 3)}`;
}

const SEVERITY_LABEL = {
  correct: '✓ Correct', minor: '⚠ Minor', major: '⚠ Major', critical: '🔴 Critical',
  consistency: 'Consistency', error: 'Failed', unreviewed: 'Unreviewed',
};

function SubtitleCard({ item, derivedStatus, onApply, onIgnore, onSaveEdit, onRevert }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const hasIssue = item.review && item.review.status === 'issue';
  const wasEdited = item.fa !== item.originalFa;

  function startEdit() {
    setEditValue((hasIssue && item.review.suggested_translation) || item.fa);
    setEditing(true);
  }
  function saveEdit() { onSaveEdit(item.id, editValue); setEditing(false); }

  return (
    <div className={`subtitle-card sev-${derivedStatus}`}>
      <div className="sub-head">
        <span className="sub-id">#{item.index}</span>
        <span className={`badge badge-${derivedStatus}`}>{SEVERITY_LABEL[derivedStatus] || derivedStatus}</span>
        <span className="sub-time">{msToClock(item.start)} → {msToClock(item.end)}</span>
      </div>

      <div className="sub-lang-grid">
        <div className="lang-block">
          <div className="lang-label">English</div>
          <div className="en-text">{item.en}</div>
        </div>
        <div className="lang-block">
          <div className="lang-label">Persian {wasEdited && '· corrected'}</div>
          <div className={`fa-text${wasEdited ? ' edited' : ''}`}>{item.fa}</div>
        </div>
      </div>

      {item.status === 'error' && (
        <div className="review-block"><div className="review-error">Review failed: {item.error}</div></div>
      )}

      {item.review && (
        <div className="review-block">
          <p className="review-explanation">{item.review.explanation}</p>

          {hasIssue && !editing && (
            <>
              <div className="suggestion-box">
                <div className="suggestion-label">Suggested correction</div>
                <div className="diff-line">
                  {wordDiff(item.fa, item.review.suggested_translation).map((tok, i) => {
                    if (tok.type === 'same') return <span key={i}>{tok.text}</span>;
                    if (tok.type === 'add') return <span key={i} className="diff-add">{tok.text}</span>;
                    return <span key={i} className="diff-del">{tok.text}</span>;
                  })}
                </div>
              </div>
              <div className="action-row">
                <button className="btn btn-primary btn-sm" onClick={() => onApply(item.id)}>Apply correction</button>
                <button className="btn btn-sm" onClick={startEdit}>Edit</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onIgnore(item.id)}>Ignore</button>
                <span className="confidence-pill">confidence {Math.round((item.review.confidence || 0) * 100)}%</span>
              </div>
            </>
          )}

          {editing && (
            <>
              <textarea className="edit-textarea" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
              <div className="action-row">
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </>
          )}

          {!hasIssue && !editing && (
            <div className="action-row">
              <button className="btn btn-sm" onClick={startEdit}>Edit anyway</button>
              <span className="confidence-pill">confidence {Math.round((item.review.confidence || 0) * 100)}%</span>
            </div>
          )}

          {item.userDecision === 'applied' && <div className="applied-tag" style={{ marginTop: 8 }}>✓ Correction applied</div>}
          {item.userDecision === 'ignored' && <div className="ignored-tag" style={{ marginTop: 8 }}>Issue ignored, original kept</div>}
          {item.userDecision === 'edited' && <div className="applied-tag" style={{ marginTop: 8 }}>✓ Manually edited</div>}

          {wasEdited && (
            <div className="action-row" style={{ marginTop: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => onRevert(item.id)}>Revert to original</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------- Review page ----------------
const FILTERS = [
  { key: 'all', label: 'All' }, { key: 'unreviewed', label: 'Unreviewed' }, { key: 'correct', label: 'Correct' },
  { key: 'minor', label: 'Minor' }, { key: 'major', label: 'Major' }, { key: 'critical', label: 'Critical' },
  { key: 'consistency', label: 'Consistency' }, { key: 'error', label: 'Errors' },
];
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

function ReviewPage({ providerConfig, goSettings }) {
  const [enName, setEnName] = useState(''); const [faName, setFaName] = useState('');
  const [enEntries, setEnEntries] = useState(null); const [faEntries, setFaEntries] = useState(null);
  const [pairInfo, setPairInfo] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [parseError, setParseError] = useState('');

  const isConfigured = providerConfig && providerConfig.apiKey;

  async function handleUpload(side, file) {
    setParseError('');
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const { format, entries } = parseSubtitleFile(file.name, text);
      if (!entries.length) {
        setParseError(`Couldn't find any valid subtitle entries in ${file.name}. Make sure it's a well-formed .srt or .ass file.`);
        return;
      }
      if (side === 'en') { setEnName(file.name); setEnEntries(entries); }
      else { setFaName(file.name); setFaEntries(entries); }
    } catch (e) {
      setParseError(`Failed to read ${file.name}: ${e.message}`);
    }
  }

  function buildSession() {
    if (!enEntries || !faEntries) return;
    const result = pairSubtitles(enEntries, faEntries);
    setPairInfo(result);
    setSubtitles(result.paired.map((p) => ({ ...p, status: 'unreviewed' })));
  }

  const counts = useMemo(() => {
    const c = { all: subtitles.length, unreviewed: 0, correct: 0, minor: 0, major: 0, critical: 0, consistency: 0, error: 0 };
    subtitles.forEach((s) => { c[deriveStatus(s)] = (c[deriveStatus(s)] || 0) + 1; });
    return c;
  }, [subtitles]);

  const visible = useMemo(() => (filter === 'all' ? subtitles : subtitles.filter((s) => deriveStatus(s) === filter)), [subtitles, filter]);

  function updateSubtitle(id, updates) {
    setSubtitles((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  function saveSummary(list) {
    const summary = { total: list.length, correct: 0, minor: 0, major: 0, critical: 0, errors: 0 };
    list.forEach((s) => {
      const st = deriveStatus(s);
      if (st === 'correct') summary.correct++;
      else if (st === 'minor') summary.minor++;
      else if (st === 'major') summary.major++;
      else if (st === 'critical') summary.critical++;
      else if (st === 'error') summary.errors++;
    });
    sqaSaveLastSession(summary);
  }

  async function reviewOne(item, index, snapshot) {
    const prevEn = snapshot.slice(Math.max(0, index - 2), index).map((s) => s.en);
    const prevFa = snapshot.slice(Math.max(0, index - 2), index).map((s) => s.fa);
    const nextEn = snapshot.slice(index + 1, index + 3).map((s) => s.en);
    const nextFa = snapshot.slice(index + 1, index + 3).map((s) => s.fa);
    const userPrompt = buildReviewUserPrompt({ en: item.en, fa: item.fa, prevEn, prevFa, nextEn, nextFa });

    try {
      const rawText = await callConfiguredModelWithRetry(REVIEW_SYSTEM_PROMPT, userPrompt, 4);
      const result = parseAndValidateReview(rawText);
      if (!result.valid) updateSubtitle(item.id, { status: 'error', error: result.error });
      else updateSubtitle(item.id, { status: 'reviewed', review: result.data });
    } catch (e) {
      updateSubtitle(item.id, { status: 'error', error: e.message || 'Request failed' });
    } finally {
      setProgress((p) => ({ ...p, completed: p.completed + 1 }));
    }
  }

  async function runAnalysis() {
    if (!subtitles.length || analyzing || !isConfigured) return;
    setAnalyzing(true);
    setProgress({ completed: 0, total: subtitles.length });
    const snapshot = subtitles;
    let cursor = 0;
    async function worker() {
      while (cursor < snapshot.length) {
        const myIndex = cursor; cursor += 1;
        await reviewOne(snapshot[myIndex], myIndex, snapshot);
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, snapshot.length) }, worker));
    setAnalyzing(false);
  }

  function applyCorrection(id) {
    setSubtitles((prev) => prev.map((s) => (s.id === id && s.review && s.review.status === 'issue')
      ? { ...s, fa: s.review.suggested_translation, userDecision: 'applied' } : s));
  }
  function ignoreIssue(id) { updateSubtitle(id, { userDecision: 'ignored' }); }
  function saveEdit(id, value) { updateSubtitle(id, { fa: value, userDecision: 'edited' }); }
  function revertOriginal(id) {
    setSubtitles((prev) => prev.map((s) => (s.id === id ? { ...s, fa: s.originalFa, userDecision: null } : s)));
  }

  function downloadCorrectedSRT() {
    const srt = exportSRT(subtitles, 'fa');
    const blob = new Blob([srt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'corrected.srt';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  useMemo(() => { if (subtitles.length) saveSummary(subtitles); }, [subtitles]);

  const hasSession = subtitles.length > 0;

  return (
    <div>
      <div className="page-head">
        <div className="page-eyebrow">New Review</div>
        <h1 className="page-title">Subtitle review</h1>
        <p className="page-sub">Upload the English and Persian subtitle files for one episode (.srt or .ass, mix and match freely). Lines are paired by subtitle/dialogue order, then reviewed with 2 lines of context on either side.</p>
      </div>

      {!isConfigured && (
        <div className="warning-banner">
          No AI provider configured yet. <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={goSettings}>Go to Settings</button>
        </div>
      )}

      {!hasSession && (
        <>
          <div className="upload-grid">
            <div className={`dropzone${enEntries ? ' filled' : ''}`}>
              <label>English .srt / .ass</label>
              <input type="file" accept=".srt,.ass,.ssa" onChange={(e) => handleUpload('en', e.target.files[0])} />
              {enEntries && (<><div className="filename">{enName}</div><div className="count">{enEntries.length} subtitle lines parsed</div></>)}
            </div>
            <div className={`dropzone${faEntries ? ' filled' : ''}`}>
              <label>Persian .srt / .ass</label>
              <input type="file" accept=".srt,.ass,.ssa" onChange={(e) => handleUpload('fa', e.target.files[0])} />
              {faEntries && (<><div className="filename">{faName}</div><div className="count">{faEntries.length} subtitle lines parsed</div></>)}
            </div>
          </div>
          {parseError && <div className="warning-banner">{parseError}</div>}
          <button className="btn btn-primary" disabled={!enEntries || !faEntries} onClick={buildSession}>Pair subtitles →</button>
        </>
      )}

      {pairInfo && hasSession && (pairInfo.countMismatch || pairInfo.unmatchedEn.length > 0 || pairInfo.unmatchedFa.length > 0) && (
        <div className="warning-banner">
          English has {enEntries.length} lines, Persian has {faEntries.length} lines.{' '}
          {pairInfo.unmatchedEn.length > 0 && `${pairInfo.unmatchedEn.length} English line(s) had no matching Persian number. `}
          {pairInfo.unmatchedFa.length > 0 && `${pairInfo.unmatchedFa.length} Persian line(s) had no matching English number. `}
          These were left out rather than guessed — only the {subtitles.length} lines that matched by subtitle number are shown below.
        </div>
      )}

      {hasSession && (
        <>
          <div className="toolbar">
            <div className="filter-row">
              {FILTERS.map((f) => (
                <button key={f.key} className={`filter-chip${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
                  {f.label} <span className="count">{counts[f.key] || 0}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={runAnalysis} disabled={analyzing || !isConfigured}>
                {analyzing ? 'Analyzing…' : counts.unreviewed === subtitles.length ? 'Analyze episode' : 'Re-run analysis'}
              </button>
              <button className="btn" onClick={downloadCorrectedSRT}>Download corrected SRT</button>
            </div>
          </div>

          {analyzing && (
            <div className="progress-wrap">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }} /></div>
              <div className="progress-meta">
                <span>Analyzing subtitle {Math.min(progress.completed + 1, progress.total)} / {progress.total}</span>
                <span>completed {progress.completed}</span>
                <span style={{ color: 'var(--major)' }}>issues found {counts.minor + counts.major + counts.critical + counts.consistency}</span>
                <span style={{ color: 'var(--critical)' }}>errors {counts.error}</span>
              </div>
            </div>
          )}

          {visible.length === 0 ? (
            <div className="empty-state"><h3>Nothing matches this filter</h3><p>Try a different filter, or run the analysis if you haven't yet.</p></div>
          ) : (
            <div className="subtitle-list">
              {visible.map((item) => (
                <SubtitleCard key={item.id} item={item} derivedStatus={deriveStatus(item)}
                  onApply={applyCorrection} onIgnore={ignoreIssue} onSaveEdit={saveEdit} onRevert={revertOriginal} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------- Root ----------------
function App() {
  const [page, setPage] = useState('dashboard');
  const [providerConfig, setProviderConfig] = useState(null);

  useEffect(() => { setProviderConfig(sqaGetProviderConfig()); }, []);

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="main">
        {page === 'dashboard' && <DashboardPage goReview={() => setPage('review')} providerConfig={providerConfig} />}
        {page === 'review' && <ReviewPage providerConfig={providerConfig} goSettings={() => setPage('settings')} />}
        {page === 'settings' && <SettingsPage providerConfig={providerConfig} setProviderConfig={setProviderConfig} />}
        {page === 'projects' && <StubPage eyebrow="Projects" title="Projects" sub="Group episodes by anime, keep per-project glossaries, and track review history." note="Right now each review is a one-off session in this browser. Persistent projects are planned for the next phase." />}
        {page === 'tm' && <StubPage eyebrow="Translation Memory" title="Translation memory" sub="A persistent glossary of preferred terms, character names, and forbidden translations." note="The reviewer doesn't use a glossary yet — it judges each line on meaning, tone, and naturalness alone." />}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
