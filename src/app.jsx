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
