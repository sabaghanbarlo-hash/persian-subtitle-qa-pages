const { useState, useEffect, useMemo, useRef, useCallback } = React;

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'editor', label: 'Editor' },
  { key: 'projects', label: 'Projects & Glossary' },
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
        English → Persian anime subtitle QA + editing.
        <br />
        Runs entirely in this browser — your API key is sent straight to your
        chosen provider and never touches this site's code or repo. Your
        subtitle files and glossary stay in this browser's local storage.
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
function DashboardPage({ goEditor, providerConfig, activeProject }) {
  const [lastSession, setLastSession] = useState(null);
  const [recoverable, setRecoverable] = useState(null);
  useEffect(() => {
    setLastSession(sqaGetLastSession());
    setRecoverable(sqaGetWorkingSession());
  }, []);

  const preset = PROVIDER_PRESETS[(providerConfig && providerConfig.kind) || 'groq'];

  return (
    <div>
      <div className="page-head">
        <div className="page-eyebrow">Dashboard</div>
        <h1 className="page-title">Subtitle QA overview</h1>
        <p className="page-sub">
          Upload an English/Persian subtitle pair, run an AI review, edit and QA the whole episode, then export.
        </p>
      </div>

      {recoverable && recoverable.subtitles && recoverable.subtitles.length > 0 && (
        <div className="warning-banner">
          There's an unsaved editing session from last time ({recoverable.subtitles.length} subtitles, "{recoverable.faFileName || 'untitled'}").{' '}
          <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={goEditor}>Resume it in the editor →</button>
        </div>
      )}

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
            <button className="btn btn-primary" onClick={goEditor}>Open the editor →</button>
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

      <div className="card">
        <h3 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 16 }}>Active project</h3>
        {activeProject ? (
          <div style={{ marginTop: 10, fontSize: 13.5 }}>
            <Row label="Name" value={activeProject.name} />
            <Row label="Glossary terms" value={(activeProject.glossary || []).length} />
            <Row label="Style" value={`${activeProject.style.formality}, ${activeProject.style.punctuation} punctuation`} />
          </div>
        ) : (
          <p style={{ color: 'var(--text-dim)', fontSize: 13.5, marginTop: 8 }}>No project yet.</p>
        )}
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

// ---------------- Projects & Glossary ----------------
function ProjectsPage({ projects, setProjects, activeProjectId, setActiveProjectId }) {
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  const [newName, setNewName] = useState('');
  const [termSource, setTermSource] = useState('');
  const [termPreferred, setTermPreferred] = useState('');
  const [termAlternates, setTermAlternates] = useState('');
  const [termSearch, setTermSearch] = useState('');
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);

  function refreshFromStorage() { setProjects(sqaGetProjects()); }

  function createProject() {
    const p = sqaCreateProject(newName || 'Untitled project');
    setNewName('');
    refreshFromStorage();
    setActiveProjectId(p.id);
  }

  function renameProject(id, name) {
    sqaUpdateProject(id, { name });
    refreshFromStorage();
  }

  function deleteProject(id) {
    if (!window.confirm('Delete this project and its glossary? This cannot be undone.')) return;
    sqaDeleteProject(id);
    refreshFromStorage();
    const remaining = sqaGetProjects();
    setActiveProjectId(remaining[0] ? remaining[0].id : null);
  }

  function patchProject(updates) {
    if (!activeProject) return;
    sqaUpdateProject(activeProject.id, updates);
    refreshFromStorage();
  }

  function addTerm() {
    if (!activeProject || !termSource.trim() || !termPreferred.trim()) return;
    const alternates = [termSource.trim(), ...termAlternates.split(',').map((s) => s.trim()).filter(Boolean)];
    const term = { id: sqaUid('term'), source: termSource.trim(), preferred: termPreferred.trim(), alternates, enabled: true, category: 'term' };
    patchProject({ glossary: [...(activeProject.glossary || []), term] });
    setTermSource(''); setTermPreferred(''); setTermAlternates('');
  }

  function updateTerm(id, updates) {
    patchProject({ glossary: (activeProject.glossary || []).map((t) => (t.id === id ? { ...t, ...updates } : t)) });
  }
  function deleteTerm(id) {
    patchProject({ glossary: (activeProject.glossary || []).filter((t) => t.id !== id) });
  }

  function exportGlossary() {
    if (!activeProject) return;
    const json = glossaryToSimpleJSON(activeProject.glossary || []);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${(activeProject.name || 'glossary').replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function importGlossary(file) {
    setImportError('');
    if (!file || !activeProject) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = simpleJSONToGlossary(String(reader.result));
        patchProject({ glossary: [...(activeProject.glossary || []), ...imported] });
      } catch (e) {
        setImportError(`Couldn't import glossary: ${e.message}`);
      }
    };
    reader.readAsText(file);
  }

  const visibleTerms = useMemo(() => {
    const list = (activeProject && activeProject.glossary) || [];
    if (!termSearch.trim()) return list;
    const q = termSearch.trim().toLowerCase();
    return list.filter((t) => t.source.toLowerCase().includes(q) || t.preferred.toLowerCase().includes(q) || (t.alternates || []).some((a) => a.toLowerCase().includes(q)));
  }, [activeProject, termSearch]);

  return (
    <div>
      <div className="page-head">
        <div className="page-eyebrow">Projects</div>
        <h1 className="page-title">Projects &amp; glossary</h1>
        <p className="page-sub">
          Group episodes of the same show under one project so its glossary (preferred character names, terms, places)
          and style guide are reused automatically across episodes. Stored only in this browser.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {projects.map((p) => (
            <button key={p.id} className={`filter-chip${activeProject && p.id === activeProject.id ? ' active' : ''}`} onClick={() => setActiveProjectId(p.id)}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="action-row" style={{ marginTop: 12 }}>
          <input className="text-input" style={{ maxWidth: 240 }} placeholder="New project name (e.g. Attack on Titan)" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button className="btn" onClick={createProject}>+ New project</button>
          {activeProject && <button className="btn btn-ghost" onClick={() => deleteProject(activeProject.id)}>Delete current project</button>}
        </div>
      </div>

      {activeProject && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <label className="field-label">Project name</label>
            <input className="text-input" style={{ maxWidth: 360 }} value={activeProject.name} onChange={(e) => renameProject(activeProject.id, e.target.value)} />

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: '18px 0 4px' }}>Style guide</h3>
            <p className="field-hint" style={{ marginTop: 0 }}>Used to steer AI suggestions for this project's episodes.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Formality</label>
                <select className="select-input" value={activeProject.style.formality} onChange={(e) => patchProject({ style: { ...activeProject.style, formality: e.target.value } })}>
                  <option value="conversational">Conversational Persian</option>
                  <option value="formal">Formal Persian</option>
                  <option value="mixed">Mixed (character-dependent)</option>
                </select>
              </div>
              <div>
                <label className="field-label">Punctuation style</label>
                <select className="select-input" value={activeProject.style.punctuation} onChange={(e) => patchProject({ style: { ...activeProject.style, punctuation: e.target.value } })}>
                  <option value="persian">Persian punctuation (، ؛ ؟)</option>
                  <option value="standard">Standard/Latin punctuation</option>
                </select>
              </div>
            </div>
            <label className="field-label">Words/phrases to avoid <span style={{ opacity: 0.6 }}>(comma-separated)</span></label>
            <input className="text-input" value={activeProject.style.avoidWords} onChange={(e) => patchProject({ style: { ...activeProject.style, avoidWords: e.target.value } })} />
            <label className="field-label">Preferred expressions <span style={{ opacity: 0.6 }}>(comma-separated)</span></label>
            <input className="text-input" value={activeProject.style.preferredExpressions} onChange={(e) => patchProject({ style: { ...activeProject.style, preferredExpressions: e.target.value } })} />

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: '18px 0 4px' }}>Readability limits</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Max characters per line</label>
                <input className="text-input" type="number" min="10" value={activeProject.maxCharsPerLine} onChange={(e) => patchProject({ maxCharsPerLine: parseInt(e.target.value, 10) || 42 })} />
              </div>
              <div>
                <label className="field-label">Max lines per subtitle</label>
                <input className="text-input" type="number" min="1" value={activeProject.maxLinesPerSub} onChange={(e) => patchProject({ maxLinesPerSub: parseInt(e.target.value, 10) || 2 })} />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, margin: 0 }}>Glossary <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({(activeProject.glossary || []).length} terms)</span></h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="text-input" style={{ maxWidth: 180 }} placeholder="Search terms…" value={termSearch} onChange={(e) => setTermSearch(e.target.value)} />
                <button className="btn btn-sm" onClick={exportGlossary}>Export JSON</button>
                <button className="btn btn-sm" onClick={() => fileRef.current && fileRef.current.click()}>Import JSON</button>
                <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => importGlossary(e.target.files[0])} />
              </div>
            </div>
            {importError && <div className="warning-banner" style={{ marginTop: 10 }}>{importError}</div>}

            <div className="glossary-table" style={{ marginTop: 14 }}>
              <div className="glossary-row glossary-head">
                <span>Source term</span><span>Preferred Persian</span><span>Alternate spellings</span><span>On</span><span></span>
              </div>
              {visibleTerms.map((t) => (
                <div className="glossary-row" key={t.id}>
                  <input className="text-input" value={t.source} onChange={(e) => updateTerm(t.id, { source: e.target.value })} />
                  <input className="text-input" value={t.preferred} onChange={(e) => updateTerm(t.id, { preferred: e.target.value })} />
                  <input className="text-input" value={(t.alternates || []).join(', ')} onChange={(e) => updateTerm(t.id, { alternates: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
                  <input type="checkbox" checked={t.enabled !== false} onChange={(e) => updateTerm(t.id, { enabled: e.target.checked })} />
                  <button className="btn btn-ghost btn-sm" onClick={() => deleteTerm(t.id)}>✕</button>
                </div>
              ))}
            </div>

            <div className="glossary-row glossary-add" style={{ marginTop: 10 }}>
              <input className="text-input" placeholder="e.g. Captain" value={termSource} onChange={(e) => setTermSource(e.target.value)} />
              <input className="text-input" placeholder="e.g. کاپیتان" value={termPreferred} onChange={(e) => setTermPreferred(e.target.value)} />
              <input className="text-input" placeholder="alt spellings, comma-separated" value={termAlternates} onChange={(e) => setTermAlternates(e.target.value)} />
              <span />
              <button className="btn btn-sm btn-primary" onClick={addTerm}>+ Add</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------- Shared helpers ----------------
function msToClock(ms) { return msToSrtTime(ms); }

const SEVERITY_LABEL = {
  correct: '✓ Correct', minor: '⚠ Minor', major: '⚠ Major', critical: '🔴 Critical',
  consistency: 'Consistency', error: 'Failed', unreviewed: 'Unreviewed',
};

const LOCAL_CATEGORY_LABEL = {
  'char-confusion': 'Arabic/Persian characters', spacing: 'Spacing', punctuation: 'Punctuation',
  typography: 'Typography', 'line-length': 'Readability', timing: 'Timing', terminology: 'Terminology',
};

function issueKey(issue) {
  return `${issue.subId}:${issue.category}:${issue.message}`;
}

function localSeverityColor(sev) {
  if (sev === 'HIGH') return 'var(--critical)';
  if (sev === 'MEDIUM') return 'var(--major)';
  if (sev === 'LOW') return 'var(--minor)';
  return 'var(--text-faint)';
}

function renumber(list) { return list.map((s, i) => ({ ...s, index: i + 1 })); }

function splitTextRoughlyInHalf(text) {
  const t = text || '';
  const mid = Math.floor(t.length / 2);
  let cut = t.lastIndexOf(' ', mid);
  if (cut <= 0) cut = t.indexOf(' ', mid);
  if (cut <= 0) cut = mid;
  return [t.slice(0, cut).trim(), t.slice(cut).trim()];
}

// ---------------- Timestamp field ----------------
function TimeField({ ms, onCommit }) {
  const [value, setValue] = useState(msToSrtTime(ms));
  useEffect(() => { setValue(msToSrtTime(ms)); }, [ms]);

  function commit() {
    if (/^\d+:\d{2}:\d{2}[.,]\d+$/.test(value.trim())) {
      const parsedMs = timeToMs(value.trim());
      if (parsedMs !== ms) onCommit(parsedMs);
    } else {
      setValue(msToSrtTime(ms)); // invalid — revert
    }
  }

  return (
    <input
      className="time-input"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
    />
  );
}

// ---------------- Subtitle card ----------------
function SubtitleCard({ item, derivedStatus, active, cardRef, localIssues,
  onApply, onIgnore, onSaveEdit, onRevert, onTimingChange, onTextChange,
  onAcceptLocal, onRejectLocal, onDuplicate, onDelete, onSplit, onMergeNext, onAddBelow, canMergeNext }) {
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
    <div ref={cardRef} className={`subtitle-card sev-${derivedStatus}${active ? ' active' : ''}`}>
      <div className="sub-head">
        <span className="sub-id">#{item.index}</span>
        <span className={`badge badge-${derivedStatus}`}>{SEVERITY_LABEL[derivedStatus] || derivedStatus}</span>
        <span className="sub-time">
          <TimeField ms={item.start} onCommit={(v) => onTimingChange(item.id, { start: v })} /> →{' '}
          <TimeField ms={item.end} onCommit={(v) => onTimingChange(item.id, { end: v })} />
        </span>
        <span className="row-toolbar">
          <button className="btn btn-ghost btn-xs" title="Add subtitle below" onClick={() => onAddBelow(item.id)}>+ below</button>
          <button className="btn btn-ghost btn-xs" title="Duplicate" onClick={() => onDuplicate(item.id)}>duplicate</button>
          <button className="btn btn-ghost btn-xs" title="Split in two" onClick={() => onSplit(item.id)}>split</button>
          {canMergeNext && <button className="btn btn-ghost btn-xs" title="Merge with next" onClick={() => onMergeNext(item.id)}>merge ↓</button>}
          <button className="btn btn-ghost btn-xs danger" title="Delete" onClick={() => onDelete(item.id)}>delete</button>
        </span>
      </div>

      <div className="sub-lang-grid">
        <div className="lang-block">
          <div className="lang-label">English</div>
          <div className="en-text">{item.en}</div>
        </div>
        <div className="lang-block">
          <div className="lang-label">Persian {wasEdited && '· corrected'}</div>
          {editing ? null : (
            <textarea
              className={`fa-text-input${wasEdited ? ' edited' : ''}`}
              value={item.fa}
              onChange={(e) => onTextChange(item.id, e.target.value)}
              dir="rtl"
            />
          )}
        </div>
      </div>

      {localIssues.length > 0 && (
        <div className="local-issues">
          {localIssues.map((li) => (
            <div key={li.id} className="local-issue-row">
              <span className="local-issue-dot" style={{ background: localSeverityColor(li.severity) }} />
              <span className="local-issue-cat">{LOCAL_CATEGORY_LABEL[li.category] || li.category}:</span>
              <span className="local-issue-msg">{li.message}</span>
              {li.suggestedText && (
                <span className="local-issue-actions">
                  <button className="btn btn-ghost btn-xs" onClick={() => onAcceptLocal(li)}>fix</button>
                  <button className="btn btn-ghost btn-xs" onClick={() => onRejectLocal(li)}>dismiss</button>
                </span>
              )}
              {!li.suggestedText && (
                <button className="btn btn-ghost btn-xs" onClick={() => onRejectLocal(li)}>dismiss</button>
              )}
            </div>
          ))}
        </div>
      )}

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
              <textarea className="edit-textarea" value={editValue} onChange={(e) => setEditValue(e.target.value)} dir="rtl" />
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

// ---------------- QA issues panel (click an issue → jump to its subtitle) ----------------
function IssuesPanel({ issues, onJump, onAcceptLocal, onRejectLocal, onApplyAi, onIgnoreAi }) {
  if (!issues.length) {
    return <div className="empty-state"><h3>No open QA issues</h3><p>Run the AI analysis, or this file is already clean.</p></div>;
  }
  return (
    <div className="issues-panel">
      {issues.map((issue) => (
        <div key={issue.id} className="issue-item" onClick={() => onJump(issue.subId)}>
          <div className="issue-item-head">
            <span className="issue-sub-num">#{issue.subIndex}</span>
            <span className="issue-severity" style={{ color: localSeverityColor(issue.severity) }}>{issue.severity}</span>
            <span className="issue-cat">{issue.source === 'ai' ? (issue.category || 'translation') : (LOCAL_CATEGORY_LABEL[issue.category] || issue.category)}</span>
          </div>
          <p className="issue-msg">{issue.message}</p>
          <div className="action-row" onClick={(e) => e.stopPropagation()}>
            {issue.source === 'local' ? (
              <>
                {issue.suggestedText && <button className="btn btn-sm btn-primary" onClick={() => onAcceptLocal(issue)}>Accept</button>}
                <button className="btn btn-ghost btn-sm" onClick={() => onRejectLocal(issue)}>Reject</button>
              </>
            ) : (
              <>
                <button className="btn btn-sm btn-primary" onClick={() => onApplyAi(issue.subId)}>Accept</button>
                <button className="btn btn-ghost btn-sm" onClick={() => onIgnoreAi(issue.subId)}>Reject</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------- Find & Replace ----------------
function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function FindReplacePanel({ subtitles, onJump, onReplaceAll, onClose }) {
  const [query, setQuery] = useState('');
  const [replaceWith, setReplaceWith] = useState('');
  const [wholeWord, setWholeWord] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [confirmingAll, setConfirmingAll] = useState(false);

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    let pattern;
    try {
      pattern = new RegExp((wholeWord ? '\\b' : '') + escapeRegExp(query) + (wholeWord ? '\\b' : ''), caseSensitive ? '' : 'i');
    } catch (e) { return []; }
    return subtitles.filter((s) => pattern.test(s.fa || ''));
  }, [subtitles, query, wholeWord, caseSensitive]);

  function doReplaceAll() {
    onReplaceAll(query, replaceWith, { wholeWord, caseSensitive });
    setConfirmingAll(false);
  }

  return (
    <div className="find-panel">
      <div className="find-panel-head">
        <strong>Find &amp; Replace</strong>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
      </div>
      <input className="text-input" placeholder="Find in Persian text…" value={query} onChange={(e) => setQuery(e.target.value)} dir="rtl" autoFocus />
      <input className="text-input" placeholder="Replace with…" value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)} dir="rtl" />
      <label style={{ fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
        <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} /> Match whole word
      </label>
      <label style={{ fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'center' }}>
        <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Case sensitive
      </label>

      <p className="field-hint">{query.trim() ? `Found ${matches.length} match(es)` : 'Type to search'}</p>

      {!confirmingAll ? (
        <div className="action-row">
          <button className="btn btn-sm btn-primary" disabled={!matches.length || !replaceWith} onClick={() => setConfirmingAll(true)}>Replace all</button>
        </div>
      ) : (
        <div className="warning-banner" style={{ fontSize: 12.5 }}>
          Replace "{query}" with "{replaceWith}" in {matches.length} subtitle(s)?
          <div className="action-row" style={{ marginTop: 8 }}>
            <button className="btn btn-sm btn-primary" onClick={doReplaceAll}>Apply</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmingAll(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="find-results">
        {matches.map((m) => (
          <div key={m.id} className="find-result-row" onClick={() => onJump(m.id)}>
            <span className="issue-sub-num">#{m.index}</span>
            <span className="find-result-text">{m.fa}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- Editor page ----------------
const FILTERS = [
  { key: 'all', label: 'All' }, { key: 'unreviewed', label: 'Unreviewed' }, { key: 'correct', label: 'Correct' },
  { key: 'minor', label: 'Minor' }, { key: 'major', label: 'Major' }, { key: 'critical', label: 'Critical' },
  { key: 'consistency', label: 'Consistency' }, { key: 'error', label: 'Errors' },
];
const CONCURRENCY = 2;
const HISTORY_LIMIT = 60;

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

function EditorPage({ providerConfig, goSettings, activeProject }) {
  const [enName, setEnName] = useState(''); const [faName, setFaName] = useState('');
  const [enEntries, setEnEntries] = useState(null); const [faEntries, setFaEntries] = useState(null);
  const [faRawText, setFaRawText] = useState('');
  const [faFormat, setFaFormat] = useState('srt');
  const [assMeta, setAssMeta] = useState(null);
  const [pairInfo, setPairInfo] = useState(null);
  const [subtitles, setSubtitlesRaw] = useState([]);
  const [filter, setFilter] = useState('all');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [parseError, setParseError] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [findOpen, setFindOpen] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState(() => new Set());
  const [historyTick, setHistoryTick] = useState(0);
  const [recovered, setRecovered] = useState(null);

  const historyRef = useRef({ past: [], future: [] });
  const rowRefs = useRef({});
  const isConfigured = providerConfig && providerConfig.apiKey;

  // Structural / text edits go through commit() so they're undoable.
  // Background AI-review writes (status/review fields) go through rawUpdate()
  // so a running analysis doesn't flood the undo stack.
  function commit(updater) {
    setSubtitlesRaw((prev) => {
      historyRef.current.past.push(prev);
      if (historyRef.current.past.length > HISTORY_LIMIT) historyRef.current.past.shift();
      historyRef.current.future = [];
      setHistoryTick((t) => t + 1);
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }
  function rawUpdate(updater) {
    setSubtitlesRaw((prev) => (typeof updater === 'function' ? updater(prev) : updater));
  }
  function undo() {
    setSubtitlesRaw((prev) => {
      const past = historyRef.current.past;
      if (!past.length) return prev;
      const prevState = past.pop();
      historyRef.current.future.push(prev);
      setHistoryTick((t) => t + 1);
      return prevState;
    });
  }
  function redo() {
    setSubtitlesRaw((prev) => {
      const future = historyRef.current.future;
      if (!future.length) return prev;
      const nextState = future.pop();
      historyRef.current.past.push(prev);
      setHistoryTick((t) => t + 1);
      return nextState;
    });
  }
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  // ---- Recover an unsaved session from a previous visit ----
  useEffect(() => {
    const saved = sqaGetWorkingSession();
    if (saved && saved.subtitles && saved.subtitles.length) setRecovered(saved);
  }, []);
  function resumeRecovered() {
    if (!recovered) return;
    setSubtitlesRaw(recovered.subtitles);
    setFaFormat(recovered.format || 'srt');
    setAssMeta(recovered.assMeta || null);
    setFaName(recovered.faFileName || '');
    setEnName(recovered.enFileName || '');
    setPairInfo({ countMismatch: false, unmatchedEn: [], unmatchedFa: [] });
    historyRef.current = { past: [], future: [] };
    setRecovered(null);
  }
  function discardRecovered() { sqaClearWorkingSession(); setRecovered(null); }

  // ---- Upload & pairing (unchanged core concept: EN + FA pair, compared line by line) ----
  async function handleUpload(side, file) {
    setParseError('');
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const parsed = parseSubtitleFile(file.name, text);
      if (!parsed.entries.length) {
        setParseError(`Couldn't find any valid subtitle entries in ${file.name}. Make sure it's a well-formed .srt or .ass file.`);
        return;
      }
      if (side === 'en') { setEnName(file.name); setEnEntries(parsed.entries); }
      else {
        setFaName(file.name); setFaEntries(parsed.entries);
        setFaRawText(text); setFaFormat(parsed.format); setAssMeta(parsed.assMeta);
      }
    } catch (e) {
      setParseError(`Failed to read ${file.name}: ${e.message}`);
    }
  }

  function buildSession() {
    if (!enEntries || !faEntries) return;
    const result = pairSubtitles(enEntries, faEntries);
    setPairInfo(result);
    historyRef.current = { past: [], future: [] };
    setSubtitlesRaw(result.paired);
  }

  const counts = useMemo(() => {
    const c = { all: subtitles.length, unreviewed: 0, correct: 0, minor: 0, major: 0, critical: 0, consistency: 0, error: 0 };
    subtitles.forEach((s) => { c[deriveStatus(s)] = (c[deriveStatus(s)] || 0) + 1; });
    return c;
  }, [subtitles]);

  const visible = useMemo(() => (filter === 'all' ? subtitles : subtitles.filter((s) => deriveStatus(s) === filter)), [subtitles, filter]);

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

  // Autosave the working session on every change (crash/refresh recovery).
  useEffect(() => {
    if (!subtitles.length) return;
    saveSummary(subtitles);
    sqaSaveWorkingSession({
      subtitles, format: faFormat, assMeta, faFileName: faName, enFileName: enName,
      projectId: activeProject && activeProject.id, savedAt: Date.now(),
    });
  }, [subtitles]);

  async function reviewOne(item, index, snapshot) {
    const prevEn = snapshot.slice(Math.max(0, index - 2), index).map((s) => s.en);
    const prevFa = snapshot.slice(Math.max(0, index - 2), index).map((s) => s.fa);
    const nextEn = snapshot.slice(index + 1, index + 3).map((s) => s.en);
    const nextFa = snapshot.slice(index + 1, index + 3).map((s) => s.fa);
    const userPrompt = buildReviewUserPrompt({ en: item.en, fa: item.fa, prevEn, prevFa, nextEn, nextFa });
    const systemPrompt = REVIEW_SYSTEM_PROMPT + styleGuideBlock(activeProject && activeProject.style);

    try {
      const rawText = await callConfiguredModelWithRetry(systemPrompt, userPrompt, 4);
      const result = parseAndValidateReview(rawText);
      if (!result.valid) rawUpdate((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'error', error: result.error } : s)));
      else rawUpdate((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'reviewed', review: result.data } : s)));
    } catch (e) {
      rawUpdate((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: 'error', error: e.message || 'Request failed' } : s)));
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

  // ---- User-driven edits (all undoable) ----
  function applyCorrection(id) {
    commit((prev) => prev.map((s) => (s.id === id && s.review && s.review.status === 'issue')
      ? { ...s, fa: s.review.suggested_translation, userDecision: 'applied' } : s));
  }
  function ignoreIssue(id) { commit((prev) => prev.map((s) => (s.id === id ? { ...s, userDecision: 'ignored' } : s))); }
  function saveEdit(id, value) { commit((prev) => prev.map((s) => (s.id === id ? { ...s, fa: value, userDecision: 'edited' } : s))); }
  function revertOriginal(id) {
    commit((prev) => prev.map((s) => (s.id === id ? { ...s, fa: s.originalFa, start: s.originalStart, end: s.originalEnd, userDecision: null } : s)));
  }
  function handleTextChange(id, value) { commit((prev) => prev.map((s) => (s.id === id ? { ...s, fa: value, userDecision: s.userDecision || 'edited' } : s))); }
  function handleTimingChange(id, patch) { commit((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))); }

  function acceptLocal(issue) {
    commit((prev) => prev.map((s) => (s.id === issue.subId ? { ...s, fa: issue.suggestedText, userDecision: s.userDecision || 'edited' } : s)));
  }
  function rejectLocal(issue) { setDismissedKeys((prev) => new Set(prev).add(issueKey(issue))); }

  function addBelow(id) {
    commit((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const anchor = prev[idx];
      const start = anchor.end + 10;
      const end = start + 1200;
      const fresh = {
        id: sqaUid('sub'), index: 0, start, end, en: '', fa: '', originalFa: '',
        originalStart: start, originalEnd: end, rawText: null, assFields: anchor.assFields || null,
        status: 'unreviewed', review: null, userDecision: null,
      };
      return renumber([...prev.slice(0, idx + 1), fresh, ...prev.slice(idx + 1)]);
    });
  }
  function duplicateSub(id) {
    commit((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const dup = { ...prev[idx], id: sqaUid('sub') };
      return renumber([...prev.slice(0, idx + 1), dup, ...prev.slice(idx + 1)]);
    });
  }
  function deleteSub(id) {
    if (!window.confirm('Delete this subtitle? This can be undone with Ctrl+Z.')) return;
    commit((prev) => renumber(prev.filter((s) => s.id !== id)));
    if (activeId === id) setActiveId(null);
  }
  function splitSub(id) {
    commit((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const s = prev[idx];
      const mid = Math.round((s.start + s.end) / 2);
      const [t1, t2] = splitTextRoughlyInHalf(s.fa);
      const [e1, e2] = splitTextRoughlyInHalf(s.en || '');
      const first = { ...s, end: mid, fa: t1, en: e1 };
      const second = { ...s, id: sqaUid('sub'), start: mid, end: s.end, fa: t2, en: e2, rawText: null };
      return renumber([...prev.slice(0, idx), first, second, ...prev.slice(idx + 1)]);
    });
  }
  function mergeNext(id) {
    commit((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const a = prev[idx]; const b = prev[idx + 1];
      const merged = {
        ...a, end: b.end, fa: `${a.fa} ${b.fa}`.trim(), en: `${a.en || ''} ${b.en || ''}`.trim(),
        review: null, status: 'unreviewed', userDecision: null, rawText: null,
      };
      return renumber([...prev.slice(0, idx), merged, ...prev.slice(idx + 2)]);
    });
  }

  function replaceAll(query, replaceWith, opts) {
    const testPattern = new RegExp((opts.wholeWord ? '\\b' : '') + escapeRegExp(query) + (opts.wholeWord ? '\\b' : ''), opts.caseSensitive ? '' : 'i');
    const replacePattern = new RegExp((opts.wholeWord ? '\\b' : '') + escapeRegExp(query) + (opts.wholeWord ? '\\b' : ''), opts.caseSensitive ? 'g' : 'gi');
    commit((prev) => prev.map((s) => (testPattern.test(s.fa || '')
      ? { ...s, fa: (s.fa || '').replace(replacePattern, replaceWith), userDecision: s.userDecision || 'edited' } : s)));
  }

  function applyAllTerminologyFixes() {
    const termIssues = localIssuesAll.filter((i) => i.category === 'terminology');
    if (!termIssues.length) return;
    if (!window.confirm(`Apply ${termIssues.length} terminology fix(es) across the episode?`)) return;
    const bySub = {};
    termIssues.forEach((i) => { bySub[i.subId] = i.suggestedText; });
    commit((prev) => prev.map((s) => (bySub[s.id] ? { ...s, fa: bySub[s.id], userDecision: s.userDecision || 'edited' } : s)));
  }

  function resetAllToOriginal() {
    if (!window.confirm('Reset ALL subtitles to their original text and timing? Applied/edited changes will be lost (this can be undone with Ctrl+Z).')) return;
    commit((prev) => prev.map((s) => ({ ...s, fa: s.originalFa, start: s.originalStart, end: s.originalEnd, userDecision: null })));
  }

  // ---- QA issues (local, instant + AI, on demand) ----
  const localIssuesAll = useMemo(() => {
    if (!activeProject || !subtitles.length) return [];
    return runLocalQA(subtitles, {
      glossary: activeProject.glossary || [],
      maxCharsPerLine: activeProject.maxCharsPerLine || 42,
      maxLinesPerSub: activeProject.maxLinesPerSub || 2,
    }).filter((i) => !dismissedKeys.has(issueKey(i)));
  }, [subtitles, activeProject, dismissedKeys]);

  const localIssuesBySub = useMemo(() => {
    const m = {};
    localIssuesAll.forEach((i) => { (m[i.subId] = m[i.subId] || []).push(i); });
    return m;
  }, [localIssuesAll]);

  const aiIssues = useMemo(() => subtitles.filter((s) => s.review && s.review.status === 'issue' && !s.userDecision).map((s) => ({
    id: `ai_${s.id}`, subId: s.id, subIndex: s.index, source: 'ai',
    category: s.review.issue_type || 'translation', severity: (s.review.severity || 'minor').toUpperCase(),
    message: s.review.explanation, currentText: s.fa, suggestedText: s.review.suggested_translation,
  })), [subtitles]);

  const allIssues = useMemo(() => [...aiIssues, ...localIssuesAll].sort((a, b) => a.subIndex - b.subIndex), [aiIssues, localIssuesAll]);

  function jumpTo(subId) { setFilter('all'); setActiveId(subId); }
  useEffect(() => {
    if (activeId && rowRefs.current[activeId]) rowRefs.current[activeId].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeId]);

  // ---- Export ----
  function confirmExportIfIssues() {
    if (allIssues.length === 0) return true;
    return window.confirm(`There are ${allIssues.length} unresolved QA issue(s). Export anyway?`);
  }
  function downloadBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
  function downloadCorrectedSRT() {
    if (!confirmExportIfIssues()) return;
    downloadBlob(exportSRT(subtitles, 'fa'), 'corrected.srt');
  }
  function downloadCorrectedASS() {
    if (!assMeta) return;
    if (!confirmExportIfIssues()) return;
    downloadBlob(exportASS(subtitles, assMeta), 'corrected.ass');
  }
  function downloadOriginal() {
    downloadBlob(faRawText, faName || `original.${faFormat}`);
  }

  const stats = useMemo(() => {
    const totalChars = subtitles.reduce((sum, s) => sum + (s.fa || '').length, 0);
    const longest = subtitles.reduce((m, s) => Math.max(m, (s.fa || '').length), 0);
    const resolved = subtitles.filter((s) => s.userDecision).length;
    return { total: subtitles.length, totalChars, avgChars: subtitles.length ? Math.round(totalChars / subtitles.length) : 0, longest, resolved };
  }, [subtitles]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    function onKeyDown(e) {
      const inField = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !inField) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) && !inField) { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); setFindOpen(true); }
      else if (e.key === 'Escape') { setFindOpen(false); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const hasSession = subtitles.length > 0;

  return (
    <div>
      <div className="page-head">
        <div className="page-eyebrow">Editor</div>
        <h1 className="page-title">Subtitle review &amp; editing</h1>
        <p className="page-sub">Upload the English and Persian subtitle files for one episode (.srt or .ass, mix and match freely). Lines are paired by subtitle/dialogue order, then reviewed with 2 lines of context on either side. Deterministic Persian QA checks (spacing, characters, timing, terminology) run automatically as you edit.</p>
      </div>

      {!isConfigured && (
        <div className="warning-banner">
          No AI provider configured yet. <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={goSettings}>Go to Settings</button>
        </div>
      )}

      {recovered && !hasSession && (
        <div className="warning-banner">
          Found an unsaved session from last time ({recovered.subtitles.length} subtitles, "{recovered.faFileName || 'untitled'}").
          <button className="btn btn-sm" style={{ marginLeft: 8 }} onClick={resumeRecovered}>Resume</button>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 6 }} onClick={discardRecovered}>Discard</button>
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
          English has {enEntries ? enEntries.length : '?'} lines, Persian has {faEntries ? faEntries.length : '?'} lines.{' '}
          {pairInfo.unmatchedEn.length > 0 && `${pairInfo.unmatchedEn.length} English line(s) had no matching Persian number. `}
          {pairInfo.unmatchedFa.length > 0 && `${pairInfo.unmatchedFa.length} Persian line(s) had no matching English number. `}
          These were left out rather than guessed.
        </div>
      )}

      {hasSession && (
        <>
          <div className="stats-bar">
            <Stat label="Subtitles" value={stats.total} />
            <Stat label="Total chars" value={stats.totalChars} />
            <Stat label="Avg chars/line" value={stats.avgChars} />
            <Stat label="Longest line" value={stats.longest} />
            <Stat label="Open issues" value={allIssues.length} color={allIssues.length ? 'var(--major)' : 'var(--correct)'} />
            <Stat label="Resolved" value={stats.resolved} color="var(--correct)" />
          </div>

          <div className="toolbar">
            <div className="filter-row">
              {FILTERS.map((f) => (
                <button key={f.key} className={`filter-chip${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
                  {f.label} <span className="count">{counts[f.key] || 0}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm" onClick={undo} disabled={!canUndo} title="Ctrl+Z">↶ Undo</button>
              <button className="btn btn-sm" onClick={redo} disabled={!canRedo} title="Ctrl+Shift+Z">↷ Redo</button>
              <button className="btn btn-sm" onClick={() => setFindOpen((v) => !v)} title="Ctrl+F">🔍 Find &amp; Replace</button>
              {localIssuesAll.some((i) => i.category === 'terminology') && (
                <button className="btn btn-sm" onClick={applyAllTerminologyFixes}>Apply glossary fixes</button>
              )}
              <button className="btn btn-primary" onClick={runAnalysis} disabled={analyzing || !isConfigured}>
                {analyzing ? 'Analyzing…' : counts.unreviewed === subtitles.length ? 'Run AI QA' : 'Re-run AI QA'}
              </button>
            </div>
          </div>

          <div className="toolbar" style={{ marginTop: -6 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn" onClick={downloadOriginal}>Download original</button>
              <button className="btn" onClick={downloadCorrectedSRT}>Download corrected SRT</button>
              {assMeta && <button className="btn" onClick={downloadCorrectedASS}>Download corrected ASS</button>}
              <button className="btn btn-ghost" onClick={resetAllToOriginal}>Reset to original</button>
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

          <div className="editor-layout">
            <div className="editor-main">
              {visible.length === 0 ? (
                <div className="empty-state"><h3>Nothing matches this filter</h3><p>Try a different filter, or run the analysis if you haven't yet.</p></div>
              ) : (
                <div className="subtitle-list">
                  {visible.map((item, i) => {
                    const globalIdx = subtitles.findIndex((s) => s.id === item.id);
                    return (
                      <SubtitleCard key={item.id} item={item} derivedStatus={deriveStatus(item)}
                        active={item.id === activeId}
                        cardRef={(node) => { rowRefs.current[item.id] = node; }}
                        localIssues={localIssuesBySub[item.id] || []}
                        onApply={applyCorrection} onIgnore={ignoreIssue} onSaveEdit={saveEdit} onRevert={revertOriginal}
                        onTimingChange={handleTimingChange} onTextChange={handleTextChange}
                        onAcceptLocal={acceptLocal} onRejectLocal={rejectLocal}
                        onDuplicate={duplicateSub} onDelete={deleteSub} onSplit={splitSub} onMergeNext={mergeNext} onAddBelow={addBelow}
                        canMergeNext={globalIdx >= 0 && globalIdx < subtitles.length - 1}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            <div className="editor-side">
              {findOpen && <FindReplacePanel subtitles={subtitles} onJump={jumpTo} onReplaceAll={replaceAll} onClose={() => setFindOpen(false)} />}
              <div className="qa-panel-wrap">
                <h3 className="qa-panel-title">QA issues <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>({allIssues.length} open)</span></h3>
                <IssuesPanel issues={allIssues} onJump={jumpTo}
                  onAcceptLocal={acceptLocal} onRejectLocal={rejectLocal}
                  onApplyAi={applyCorrection} onIgnoreAi={ignoreIssue} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------- Root ----------------
function App() {
  const [page, setPage] = useState('dashboard');
  const [providerConfig, setProviderConfig] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  useEffect(() => {
    setProviderConfig(sqaGetProviderConfig());
    let list = sqaGetProjects();
    if (!list.length) {
      const def = sqaCreateProject('Default project');
      list = sqaGetProjects();
      sqaSetActiveProjectId(def.id);
      setActiveProjectId(def.id);
    } else {
      const saved = sqaGetActiveProjectId();
      setActiveProjectId(saved && list.some((p) => p.id === saved) ? saved : list[0].id);
    }
    setProjects(list);
  }, []);

  function selectProject(id) { setActiveProjectId(id); sqaSetActiveProjectId(id); }

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  return (
    <div className="shell">
      <Sidebar page={page} setPage={setPage} />
      <main className="main">
        <div style={{ display: page === 'dashboard' ? 'block' : 'none' }}>
          <DashboardPage goEditor={() => setPage('editor')} providerConfig={providerConfig} activeProject={activeProject} />
        </div>
        <div style={{ display: page === 'editor' ? 'block' : 'none' }}>
          <EditorPage providerConfig={providerConfig} goSettings={() => setPage('settings')} activeProject={activeProject} />
        </div>
        <div style={{ display: page === 'settings' ? 'block' : 'none' }}>
          <SettingsPage providerConfig={providerConfig} setProviderConfig={setProviderConfig} />
        </div>
        <div style={{ display: page === 'projects' ? 'block' : 'none' }}>
          <ProjectsPage projects={projects} setProjects={setProjects} activeProjectId={activeProjectId} setActiveProjectId={selectProject} />
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
