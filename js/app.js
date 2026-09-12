const {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback
} = React;
const NAV_ITEMS = [{
  key: 'dashboard',
  label: 'Dashboard'
}, {
  key: 'editor',
  label: 'Editor'
}, {
  key: 'projects',
  label: 'Projects & Glossary'
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
  }, "English \u2192 Persian anime subtitle QA + editing.", /*#__PURE__*/React.createElement("br", null), "Runs entirely in this browser \u2014 your API key is sent straight to your chosen provider and never touches this site's code or repo. Your subtitle files and glossary stay in this browser's local storage."));
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
  goEditor,
  providerConfig,
  activeProject
}) {
  const [lastSession, setLastSession] = useState(null);
  const [recoverable, setRecoverable] = useState(null);
  useEffect(() => {
    setLastSession(sqaGetLastSession());
    setRecoverable(sqaGetWorkingSession());
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
  }, "Upload an English/Persian subtitle pair, run an AI review, edit and QA the whole episode, then export.")), recoverable && recoverable.subtitles && recoverable.subtitles.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner"
  }, "There's an unsaved editing session from last time (", recoverable.subtitles.length, " subtitles, \"", recoverable.faFileName || 'untitled', "\").", ' ', /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      marginLeft: 8
    },
    onClick: goEditor
  }, "Resume it in the editor \u2192")), /*#__PURE__*/React.createElement("div", {
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
    onClick: goEditor
  }, "Open the editor \u2192"))), /*#__PURE__*/React.createElement("div", {
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
    className: "card"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 4px',
      fontFamily: 'var(--font-display)',
      fontSize: 16
    }
  }, "Active project"), activeProject ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement(Row, {
    label: "Name",
    value: activeProject.name
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Glossary terms",
    value: (activeProject.glossary || []).length
  }), /*#__PURE__*/React.createElement(Row, {
    label: "Style",
    value: `${activeProject.style.formality}, ${activeProject.style.punctuation} punctuation`
  })) : /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-dim)',
      fontSize: 13.5,
      marginTop: 8
    }
  }, "No project yet.")));
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
  }, "This app has no server \u2014 your API key is stored only in this browser's local storage and sent directly from your browser to the provider you choose below.")), /*#__PURE__*/React.createElement("div", {
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
  }, "(optional \u2014 defaults to ", preset.defaultModel, ")")), /*#__PURE__*/React.createElement("input", {
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
  }, "Currently saved: ", PROVIDER_PRESETS[providerConfig.kind].label, " \xB7 ", providerConfig.model || PROVIDER_PRESETS[providerConfig.kind].defaultModel)), /*#__PURE__*/React.createElement("div", {
    className: "empty-state",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("h3", null, "Multi-model review comes later"), /*#__PURE__*/React.createElement("p", null, "Running several models per line, comparing their opinions, and an optional judge model are planned for a later phase.")));
}

// ---------------- Projects & Glossary ----------------
function ProjectsPage({
  projects,
  setProjects,
  activeProjectId,
  setActiveProjectId
}) {
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;
  const [newName, setNewName] = useState('');
  const [termSource, setTermSource] = useState('');
  const [termPreferred, setTermPreferred] = useState('');
  const [termAlternates, setTermAlternates] = useState('');
  const [termSearch, setTermSearch] = useState('');
  const [importError, setImportError] = useState('');
  const fileRef = useRef(null);
  function refreshFromStorage() {
    setProjects(sqaGetProjects());
  }
  function createProject() {
    const p = sqaCreateProject(newName || 'Untitled project');
    setNewName('');
    refreshFromStorage();
    setActiveProjectId(p.id);
  }
  function renameProject(id, name) {
    sqaUpdateProject(id, {
      name
    });
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
    const alternates = [termSource.trim(), ...termAlternates.split(',').map(s => s.trim()).filter(Boolean)];
    const term = {
      id: sqaUid('term'),
      source: termSource.trim(),
      preferred: termPreferred.trim(),
      alternates,
      enabled: true,
      category: 'term'
    };
    patchProject({
      glossary: [...(activeProject.glossary || []), term]
    });
    setTermSource('');
    setTermPreferred('');
    setTermAlternates('');
  }
  function updateTerm(id, updates) {
    patchProject({
      glossary: (activeProject.glossary || []).map(t => t.id === id ? {
        ...t,
        ...updates
      } : t)
    });
  }
  function deleteTerm(id) {
    patchProject({
      glossary: (activeProject.glossary || []).filter(t => t.id !== id)
    });
  }
  function exportGlossary() {
    if (!activeProject) return;
    const json = glossaryToSimpleJSON(activeProject.glossary || []);
    const blob = new Blob([json], {
      type: 'application/json;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(activeProject.name || 'glossary').replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function importGlossary(file) {
    setImportError('');
    if (!file || !activeProject) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = simpleJSONToGlossary(String(reader.result));
        patchProject({
          glossary: [...(activeProject.glossary || []), ...imported]
        });
      } catch (e) {
        setImportError(`Couldn't import glossary: ${e.message}`);
      }
    };
    reader.readAsText(file);
  }
  const visibleTerms = useMemo(() => {
    const list = activeProject && activeProject.glossary || [];
    if (!termSearch.trim()) return list;
    const q = termSearch.trim().toLowerCase();
    return list.filter(t => t.source.toLowerCase().includes(q) || t.preferred.toLowerCase().includes(q) || (t.alternates || []).some(a => a.toLowerCase().includes(q)));
  }, [activeProject, termSearch]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-eyebrow"
  }, "Projects"), /*#__PURE__*/React.createElement("h1", {
    className: "page-title"
  }, "Projects & glossary"), /*#__PURE__*/React.createElement("p", {
    className: "page-sub"
  }, "Group episodes of the same show under one project so its glossary (preferred character names, terms, places) and style guide are reused automatically across episodes. Stored only in this browser.")), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, projects.map(p => /*#__PURE__*/React.createElement("button", {
    key: p.id,
    className: `filter-chip${activeProject && p.id === activeProject.id ? ' active' : ''}`,
    onClick: () => setActiveProjectId(p.id)
  }, p.name))), /*#__PURE__*/React.createElement("div", {
    className: "action-row",
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    style: {
      maxWidth: 240
    },
    placeholder: "New project name (e.g. Attack on Titan)",
    value: newName,
    onChange: e => setNewName(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: createProject
  }, "+ New project"), activeProject && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: () => deleteProject(activeProject.id)
  }, "Delete current project"))), activeProject && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Project name"), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    style: {
      maxWidth: 360
    },
    value: activeProject.name,
    onChange: e => renameProject(activeProject.id, e.target.value)
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 15,
      margin: '18px 0 4px'
    }
  }, "Style guide"), /*#__PURE__*/React.createElement("p", {
    className: "field-hint",
    style: {
      marginTop: 0
    }
  }, "Used to steer AI suggestions for this project's episodes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Formality"), /*#__PURE__*/React.createElement("select", {
    className: "select-input",
    value: activeProject.style.formality,
    onChange: e => patchProject({
      style: {
        ...activeProject.style,
        formality: e.target.value
      }
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "conversational"
  }, "Conversational Persian"), /*#__PURE__*/React.createElement("option", {
    value: "formal"
  }, "Formal Persian"), /*#__PURE__*/React.createElement("option", {
    value: "mixed"
  }, "Mixed (character-dependent)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Punctuation style"), /*#__PURE__*/React.createElement("select", {
    className: "select-input",
    value: activeProject.style.punctuation,
    onChange: e => patchProject({
      style: {
        ...activeProject.style,
        punctuation: e.target.value
      }
    })
  }, /*#__PURE__*/React.createElement("option", {
    value: "persian"
  }, "Persian punctuation (\u060C \u061B \u061F)"), /*#__PURE__*/React.createElement("option", {
    value: "standard"
  }, "Standard/Latin punctuation")))), /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Words/phrases to avoid ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.6
    }
  }, "(comma-separated)")), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    value: activeProject.style.avoidWords,
    onChange: e => patchProject({
      style: {
        ...activeProject.style,
        avoidWords: e.target.value
      }
    })
  }), /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Preferred expressions ", /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.6
    }
  }, "(comma-separated)")), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    value: activeProject.style.preferredExpressions,
    onChange: e => patchProject({
      style: {
        ...activeProject.style,
        preferredExpressions: e.target.value
      }
    })
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 15,
      margin: '18px 0 4px'
    }
  }, "Readability limits"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Max characters per line"), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    type: "number",
    min: "10",
    value: activeProject.maxCharsPerLine,
    onChange: e => patchProject({
      maxCharsPerLine: parseInt(e.target.value, 10) || 42
    })
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "field-label"
  }, "Max lines per subtitle"), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    type: "number",
    min: "1",
    value: activeProject.maxLinesPerSub,
    onChange: e => patchProject({
      maxLinesPerSub: parseInt(e.target.value, 10) || 2
    })
  })))), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 15,
      margin: 0
    }
  }, "Glossary ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      fontWeight: 400
    }
  }, "(", (activeProject.glossary || []).length, " terms)")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    style: {
      maxWidth: 180
    },
    placeholder: "Search terms\u2026",
    value: termSearch,
    onChange: e => setTermSearch(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: exportGlossary
  }, "Export JSON"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: () => fileRef.current && fileRef.current.click()
  }, "Import JSON"), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: ".json",
    style: {
      display: 'none'
    },
    onChange: e => importGlossary(e.target.files[0])
  }))), importError && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner",
    style: {
      marginTop: 10
    }
  }, importError), /*#__PURE__*/React.createElement("div", {
    className: "glossary-table",
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "glossary-row glossary-head"
  }, /*#__PURE__*/React.createElement("span", null, "Source term"), /*#__PURE__*/React.createElement("span", null, "Preferred Persian"), /*#__PURE__*/React.createElement("span", null, "Alternate spellings"), /*#__PURE__*/React.createElement("span", null, "On"), /*#__PURE__*/React.createElement("span", null)), visibleTerms.map(t => /*#__PURE__*/React.createElement("div", {
    className: "glossary-row",
    key: t.id
  }, /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    value: t.source,
    onChange: e => updateTerm(t.id, {
      source: e.target.value
    })
  }), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    value: t.preferred,
    onChange: e => updateTerm(t.id, {
      preferred: e.target.value
    })
  }), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    value: (t.alternates || []).join(', '),
    onChange: e => updateTerm(t.id, {
      alternates: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
    })
  }), /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: t.enabled !== false,
    onChange: e => updateTerm(t.id, {
      enabled: e.target.checked
    })
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => deleteTerm(t.id)
  }, "\u2715")))), /*#__PURE__*/React.createElement("div", {
    className: "glossary-row glossary-add",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    placeholder: "e.g. Captain",
    value: termSource,
    onChange: e => setTermSource(e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    placeholder: "e.g. \u06A9\u0627\u067E\u06CC\u062A\u0627\u0646",
    value: termPreferred,
    onChange: e => setTermPreferred(e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    placeholder: "alt spellings, comma-separated",
    value: termAlternates,
    onChange: e => setTermAlternates(e.target.value)
  }), /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-primary",
    onClick: addTerm
  }, "+ Add")))));
}

// ---------------- Shared helpers ----------------
function msToClock(ms) {
  return msToSrtTime(ms);
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
const LOCAL_CATEGORY_LABEL = {
  'char-confusion': 'Arabic/Persian characters',
  spacing: 'Spacing',
  punctuation: 'Punctuation',
  typography: 'Typography',
  'line-length': 'Readability',
  timing: 'Timing',
  terminology: 'Terminology'
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
function renumber(list) {
  return list.map((s, i) => ({
    ...s,
    index: i + 1
  }));
}
function splitTextRoughlyInHalf(text) {
  const t = text || '';
  const mid = Math.floor(t.length / 2);
  let cut = t.lastIndexOf(' ', mid);
  if (cut <= 0) cut = t.indexOf(' ', mid);
  if (cut <= 0) cut = mid;
  return [t.slice(0, cut).trim(), t.slice(cut).trim()];
}

// ---------------- Timestamp field ----------------
function TimeField({
  ms,
  onCommit
}) {
  const [value, setValue] = useState(msToSrtTime(ms));
  useEffect(() => {
    setValue(msToSrtTime(ms));
  }, [ms]);
  function commit() {
    if (/^\d+:\d{2}:\d{2}[.,]\d+$/.test(value.trim())) {
      const parsedMs = timeToMs(value.trim());
      if (parsedMs !== ms) onCommit(parsedMs);
    } else {
      setValue(msToSrtTime(ms)); // invalid — revert
    }
  }
  return /*#__PURE__*/React.createElement("input", {
    className: "time-input",
    value: value,
    onChange: e => setValue(e.target.value),
    onBlur: commit,
    onKeyDown: e => {
      if (e.key === 'Enter') e.target.blur();
    }
  });
}

// ---------------- Subtitle card ----------------
function SubtitleCard({
  item,
  derivedStatus,
  active,
  cardRef,
  localIssues,
  onApply,
  onIgnore,
  onSaveEdit,
  onRevert,
  onTimingChange,
  onTextChange,
  onAcceptLocal,
  onRejectLocal,
  onDuplicate,
  onDelete,
  onSplit,
  onMergeNext,
  onAddBelow,
  canMergeNext
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
    ref: cardRef,
    className: `subtitle-card sev-${derivedStatus}${active ? ' active' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "sub-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sub-id"
  }, "#", item.index), /*#__PURE__*/React.createElement("span", {
    className: `badge badge-${derivedStatus}`
  }, SEVERITY_LABEL[derivedStatus] || derivedStatus), /*#__PURE__*/React.createElement("span", {
    className: "sub-time"
  }, /*#__PURE__*/React.createElement(TimeField, {
    ms: item.start,
    onCommit: v => onTimingChange(item.id, {
      start: v
    })
  }), " \u2192", ' ', /*#__PURE__*/React.createElement(TimeField, {
    ms: item.end,
    onCommit: v => onTimingChange(item.id, {
      end: v
    })
  })), /*#__PURE__*/React.createElement("span", {
    className: "row-toolbar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs",
    title: "Add subtitle below",
    onClick: () => onAddBelow(item.id)
  }, "+ below"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs",
    title: "Duplicate",
    onClick: () => onDuplicate(item.id)
  }, "duplicate"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs",
    title: "Split in two",
    onClick: () => onSplit(item.id)
  }, "split"), canMergeNext && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs",
    title: "Merge with next",
    onClick: () => onMergeNext(item.id)
  }, "merge \u2193"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs danger",
    title: "Delete",
    onClick: () => onDelete(item.id)
  }, "delete"))), /*#__PURE__*/React.createElement("div", {
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
  }, "Persian ", wasEdited && '· corrected'), editing ? null : /*#__PURE__*/React.createElement("textarea", {
    className: `fa-text-input${wasEdited ? ' edited' : ''}`,
    value: item.fa,
    onChange: e => onTextChange(item.id, e.target.value),
    dir: "rtl"
  }))), localIssues.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "local-issues"
  }, localIssues.map(li => /*#__PURE__*/React.createElement("div", {
    key: li.id,
    className: "local-issue-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "local-issue-dot",
    style: {
      background: localSeverityColor(li.severity)
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "local-issue-cat"
  }, LOCAL_CATEGORY_LABEL[li.category] || li.category, ":"), /*#__PURE__*/React.createElement("span", {
    className: "local-issue-msg"
  }, li.message), li.suggestedText && /*#__PURE__*/React.createElement("span", {
    className: "local-issue-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs",
    onClick: () => onAcceptLocal(li)
  }, "fix"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs",
    onClick: () => onRejectLocal(li)
  }, "dismiss")), !li.suggestedText && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-xs",
    onClick: () => onRejectLocal(li)
  }, "dismiss")))), item.status === 'error' && /*#__PURE__*/React.createElement("div", {
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
    onChange: e => setEditValue(e.target.value),
    dir: "rtl"
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
  }, "\u2713 Correction applied"), item.userDecision === 'ignored' && /*#__PURE__*/React.createElement("div", {
    className: "ignored-tag",
    style: {
      marginTop: 8
    }
  }, "Issue ignored, original kept"), item.userDecision === 'edited' && /*#__PURE__*/React.createElement("div", {
    className: "applied-tag",
    style: {
      marginTop: 8
    }
  }, "\u2713 Manually edited"), wasEdited && /*#__PURE__*/React.createElement("div", {
    className: "action-row",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onRevert(item.id)
  }, "Revert to original"))));
}

// ---------------- QA issues panel (click an issue → jump to its subtitle) ----------------
function IssuesPanel({
  issues,
  onJump,
  onAcceptLocal,
  onRejectLocal,
  onApplyAi,
  onIgnoreAi
}) {
  if (!issues.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "empty-state"
    }, /*#__PURE__*/React.createElement("h3", null, "No open QA issues"), /*#__PURE__*/React.createElement("p", null, "Run the AI analysis, or this file is already clean."));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "issues-panel"
  }, issues.map(issue => /*#__PURE__*/React.createElement("div", {
    key: issue.id,
    className: "issue-item",
    onClick: () => onJump(issue.subId)
  }, /*#__PURE__*/React.createElement("div", {
    className: "issue-item-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "issue-sub-num"
  }, "#", issue.subIndex), /*#__PURE__*/React.createElement("span", {
    className: "issue-severity",
    style: {
      color: localSeverityColor(issue.severity)
    }
  }, issue.severity), /*#__PURE__*/React.createElement("span", {
    className: "issue-cat"
  }, issue.source === 'ai' ? issue.category || 'translation' : LOCAL_CATEGORY_LABEL[issue.category] || issue.category)), /*#__PURE__*/React.createElement("p", {
    className: "issue-msg"
  }, issue.message), /*#__PURE__*/React.createElement("div", {
    className: "action-row",
    onClick: e => e.stopPropagation()
  }, issue.source === 'local' ? /*#__PURE__*/React.createElement(React.Fragment, null, issue.suggestedText && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-primary",
    onClick: () => onAcceptLocal(issue)
  }, "Accept"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onRejectLocal(issue)
  }, "Reject")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-primary",
    onClick: () => onApplyAi(issue.subId)
  }, "Accept"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => onIgnoreAi(issue.subId)
  }, "Reject"))))));
}

// ---------------- Find & Replace ----------------
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function FindReplacePanel({
  subtitles,
  onJump,
  onReplaceAll,
  onClose
}) {
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
    } catch (e) {
      return [];
    }
    return subtitles.filter(s => pattern.test(s.fa || ''));
  }, [subtitles, query, wholeWord, caseSensitive]);
  function doReplaceAll() {
    onReplaceAll(query, replaceWith, {
      wholeWord,
      caseSensitive
    });
    setConfirmingAll(false);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "find-panel"
  }, /*#__PURE__*/React.createElement("div", {
    className: "find-panel-head"
  }, /*#__PURE__*/React.createElement("strong", null, "Find & Replace"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: onClose
  }, "\u2715")), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    placeholder: "Find in Persian text\u2026",
    value: query,
    onChange: e => setQuery(e.target.value),
    dir: "rtl",
    autoFocus: true
  }), /*#__PURE__*/React.createElement("input", {
    className: "text-input",
    placeholder: "Replace with\u2026",
    value: replaceWith,
    onChange: e => setReplaceWith(e.target.value),
    dir: "rtl"
  }), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12.5,
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: wholeWord,
    onChange: e => setWholeWord(e.target.checked)
  }), " Match whole word"), /*#__PURE__*/React.createElement("label", {
    style: {
      fontSize: 12.5,
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: caseSensitive,
    onChange: e => setCaseSensitive(e.target.checked)
  }), " Case sensitive"), /*#__PURE__*/React.createElement("p", {
    className: "field-hint"
  }, query.trim() ? `Found ${matches.length} match(es)` : 'Type to search'), !confirmingAll ? /*#__PURE__*/React.createElement("div", {
    className: "action-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-primary",
    disabled: !matches.length || !replaceWith,
    onClick: () => setConfirmingAll(true)
  }, "Replace all")) : /*#__PURE__*/React.createElement("div", {
    className: "warning-banner",
    style: {
      fontSize: 12.5
    }
  }, "Replace \"", query, "\" with \"", replaceWith, "\" in ", matches.length, " subtitle(s)?", /*#__PURE__*/React.createElement("div", {
    className: "action-row",
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-primary",
    onClick: doReplaceAll
  }, "Apply"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    onClick: () => setConfirmingAll(false)
  }, "Cancel"))), /*#__PURE__*/React.createElement("div", {
    className: "find-results"
  }, matches.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.id,
    className: "find-result-row",
    onClick: () => onJump(m.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "issue-sub-num"
  }, "#", m.index), /*#__PURE__*/React.createElement("span", {
    className: "find-result-text"
  }, m.fa)))));
}

// ---------------- Editor page ----------------
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
function EditorPage({
  providerConfig,
  goSettings,
  activeProject
}) {
  const [enName, setEnName] = useState('');
  const [faName, setFaName] = useState('');
  const [enEntries, setEnEntries] = useState(null);
  const [faEntries, setFaEntries] = useState(null);
  const [faRawText, setFaRawText] = useState('');
  const [faFormat, setFaFormat] = useState('srt');
  const [assMeta, setAssMeta] = useState(null);
  const [pairInfo, setPairInfo] = useState(null);
  const [subtitles, setSubtitlesRaw] = useState([]);
  const [filter, setFilter] = useState('all');
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0
  });
  const [parseError, setParseError] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [findOpen, setFindOpen] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState(() => new Set());
  const [historyTick, setHistoryTick] = useState(0);
  const [recovered, setRecovered] = useState(null);
  const historyRef = useRef({
    past: [],
    future: []
  });
  const rowRefs = useRef({});
  const isConfigured = providerConfig && providerConfig.apiKey;

  // Structural / text edits go through commit() so they're undoable.
  // Background AI-review writes (status/review fields) go through rawUpdate()
  // so a running analysis doesn't flood the undo stack.
  function commit(updater) {
    setSubtitlesRaw(prev => {
      historyRef.current.past.push(prev);
      if (historyRef.current.past.length > HISTORY_LIMIT) historyRef.current.past.shift();
      historyRef.current.future = [];
      setHistoryTick(t => t + 1);
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }
  function rawUpdate(updater) {
    setSubtitlesRaw(prev => typeof updater === 'function' ? updater(prev) : updater);
  }
  function undo() {
    setSubtitlesRaw(prev => {
      const past = historyRef.current.past;
      if (!past.length) return prev;
      const prevState = past.pop();
      historyRef.current.future.push(prev);
      setHistoryTick(t => t + 1);
      return prevState;
    });
  }
  function redo() {
    setSubtitlesRaw(prev => {
      const future = historyRef.current.future;
      if (!future.length) return prev;
      const nextState = future.pop();
      historyRef.current.past.push(prev);
      setHistoryTick(t => t + 1);
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
    setPairInfo({
      countMismatch: false,
      unmatchedEn: [],
      unmatchedFa: []
    });
    historyRef.current = {
      past: [],
      future: []
    };
    setRecovered(null);
  }
  function discardRecovered() {
    sqaClearWorkingSession();
    setRecovered(null);
  }

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
      if (side === 'en') {
        setEnName(file.name);
        setEnEntries(parsed.entries);
      } else {
        setFaName(file.name);
        setFaEntries(parsed.entries);
        setFaRawText(text);
        setFaFormat(parsed.format);
        setAssMeta(parsed.assMeta);
      }
    } catch (e) {
      setParseError(`Failed to read ${file.name}: ${e.message}`);
    }
  }
  function buildSession() {
    if (!enEntries || !faEntries) return;
    const result = pairSubtitles(enEntries, faEntries);
    setPairInfo(result);
    historyRef.current = {
      past: [],
      future: []
    };
    setSubtitlesRaw(result.paired);
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

  // Autosave the working session on every change (crash/refresh recovery).
  useEffect(() => {
    if (!subtitles.length) return;
    saveSummary(subtitles);
    sqaSaveWorkingSession({
      subtitles,
      format: faFormat,
      assMeta,
      faFileName: faName,
      enFileName: enName,
      projectId: activeProject && activeProject.id,
      savedAt: Date.now()
    });
  }, [subtitles]);
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
    const systemPrompt = REVIEW_SYSTEM_PROMPT + styleGuideBlock(activeProject && activeProject.style);
    try {
      const rawText = await callConfiguredModelWithRetry(systemPrompt, userPrompt, 4);
      const result = parseAndValidateReview(rawText);
      if (!result.valid) rawUpdate(prev => prev.map(s => s.id === item.id ? {
        ...s,
        status: 'error',
        error: result.error
      } : s));else rawUpdate(prev => prev.map(s => s.id === item.id ? {
        ...s,
        status: 'reviewed',
        review: result.data
      } : s));
    } catch (e) {
      rawUpdate(prev => prev.map(s => s.id === item.id ? {
        ...s,
        status: 'error',
        error: e.message || 'Request failed'
      } : s));
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

  // ---- User-driven edits (all undoable) ----
  function applyCorrection(id) {
    commit(prev => prev.map(s => s.id === id && s.review && s.review.status === 'issue' ? {
      ...s,
      fa: s.review.suggested_translation,
      userDecision: 'applied'
    } : s));
  }
  function ignoreIssue(id) {
    commit(prev => prev.map(s => s.id === id ? {
      ...s,
      userDecision: 'ignored'
    } : s));
  }
  function saveEdit(id, value) {
    commit(prev => prev.map(s => s.id === id ? {
      ...s,
      fa: value,
      userDecision: 'edited'
    } : s));
  }
  function revertOriginal(id) {
    commit(prev => prev.map(s => s.id === id ? {
      ...s,
      fa: s.originalFa,
      start: s.originalStart,
      end: s.originalEnd,
      userDecision: null
    } : s));
  }
  function handleTextChange(id, value) {
    commit(prev => prev.map(s => s.id === id ? {
      ...s,
      fa: value,
      userDecision: s.userDecision || 'edited'
    } : s));
  }
  function handleTimingChange(id, patch) {
    commit(prev => prev.map(s => s.id === id ? {
      ...s,
      ...patch
    } : s));
  }
  function acceptLocal(issue) {
    commit(prev => prev.map(s => s.id === issue.subId ? {
      ...s,
      fa: issue.suggestedText,
      userDecision: s.userDecision || 'edited'
    } : s));
  }
  function rejectLocal(issue) {
    setDismissedKeys(prev => new Set(prev).add(issueKey(issue)));
  }
  function addBelow(id) {
    commit(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const anchor = prev[idx];
      const start = anchor.end + 10;
      const end = start + 1200;
      const fresh = {
        id: sqaUid('sub'),
        index: 0,
        start,
        end,
        en: '',
        fa: '',
        originalFa: '',
        originalStart: start,
        originalEnd: end,
        rawText: null,
        assFields: anchor.assFields || null,
        status: 'unreviewed',
        review: null,
        userDecision: null
      };
      return renumber([...prev.slice(0, idx + 1), fresh, ...prev.slice(idx + 1)]);
    });
  }
  function duplicateSub(id) {
    commit(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const dup = {
        ...prev[idx],
        id: sqaUid('sub')
      };
      return renumber([...prev.slice(0, idx + 1), dup, ...prev.slice(idx + 1)]);
    });
  }
  function deleteSub(id) {
    if (!window.confirm('Delete this subtitle? This can be undone with Ctrl+Z.')) return;
    commit(prev => renumber(prev.filter(s => s.id !== id)));
    if (activeId === id) setActiveId(null);
  }
  function splitSub(id) {
    commit(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0) return prev;
      const s = prev[idx];
      const mid = Math.round((s.start + s.end) / 2);
      const [t1, t2] = splitTextRoughlyInHalf(s.fa);
      const [e1, e2] = splitTextRoughlyInHalf(s.en || '');
      const first = {
        ...s,
        end: mid,
        fa: t1,
        en: e1
      };
      const second = {
        ...s,
        id: sqaUid('sub'),
        start: mid,
        end: s.end,
        fa: t2,
        en: e2,
        rawText: null
      };
      return renumber([...prev.slice(0, idx), first, second, ...prev.slice(idx + 1)]);
    });
  }
  function mergeNext(id) {
    commit(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const a = prev[idx];
      const b = prev[idx + 1];
      const merged = {
        ...a,
        end: b.end,
        fa: `${a.fa} ${b.fa}`.trim(),
        en: `${a.en || ''} ${b.en || ''}`.trim(),
        review: null,
        status: 'unreviewed',
        userDecision: null,
        rawText: null
      };
      return renumber([...prev.slice(0, idx), merged, ...prev.slice(idx + 2)]);
    });
  }
  function replaceAll(query, replaceWith, opts) {
    const testPattern = new RegExp((opts.wholeWord ? '\\b' : '') + escapeRegExp(query) + (opts.wholeWord ? '\\b' : ''), opts.caseSensitive ? '' : 'i');
    const replacePattern = new RegExp((opts.wholeWord ? '\\b' : '') + escapeRegExp(query) + (opts.wholeWord ? '\\b' : ''), opts.caseSensitive ? 'g' : 'gi');
    commit(prev => prev.map(s => testPattern.test(s.fa || '') ? {
      ...s,
      fa: (s.fa || '').replace(replacePattern, replaceWith),
      userDecision: s.userDecision || 'edited'
    } : s));
  }
  function applyAllTerminologyFixes() {
    const termIssues = localIssuesAll.filter(i => i.category === 'terminology');
    if (!termIssues.length) return;
    if (!window.confirm(`Apply ${termIssues.length} terminology fix(es) across the episode?`)) return;
    const bySub = {};
    termIssues.forEach(i => {
      bySub[i.subId] = i.suggestedText;
    });
    commit(prev => prev.map(s => bySub[s.id] ? {
      ...s,
      fa: bySub[s.id],
      userDecision: s.userDecision || 'edited'
    } : s));
  }
  function resetAllToOriginal() {
    if (!window.confirm('Reset ALL subtitles to their original text and timing? Applied/edited changes will be lost (this can be undone with Ctrl+Z).')) return;
    commit(prev => prev.map(s => ({
      ...s,
      fa: s.originalFa,
      start: s.originalStart,
      end: s.originalEnd,
      userDecision: null
    })));
  }

  // ---- QA issues (local, instant + AI, on demand) ----
  const localIssuesAll = useMemo(() => {
    if (!activeProject || !subtitles.length) return [];
    return runLocalQA(subtitles, {
      glossary: activeProject.glossary || [],
      maxCharsPerLine: activeProject.maxCharsPerLine || 42,
      maxLinesPerSub: activeProject.maxLinesPerSub || 2
    }).filter(i => !dismissedKeys.has(issueKey(i)));
  }, [subtitles, activeProject, dismissedKeys]);
  const localIssuesBySub = useMemo(() => {
    const m = {};
    localIssuesAll.forEach(i => {
      (m[i.subId] = m[i.subId] || []).push(i);
    });
    return m;
  }, [localIssuesAll]);
  const aiIssues = useMemo(() => subtitles.filter(s => s.review && s.review.status === 'issue' && !s.userDecision).map(s => ({
    id: `ai_${s.id}`,
    subId: s.id,
    subIndex: s.index,
    source: 'ai',
    category: s.review.issue_type || 'translation',
    severity: (s.review.severity || 'minor').toUpperCase(),
    message: s.review.explanation,
    currentText: s.fa,
    suggestedText: s.review.suggested_translation
  })), [subtitles]);
  const allIssues = useMemo(() => [...aiIssues, ...localIssuesAll].sort((a, b) => a.subIndex - b.subIndex), [aiIssues, localIssuesAll]);
  function jumpTo(subId) {
    setFilter('all');
    setActiveId(subId);
  }
  useEffect(() => {
    if (activeId && rowRefs.current[activeId]) rowRefs.current[activeId].scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, [activeId]);

  // ---- Export ----
  function confirmExportIfIssues() {
    if (allIssues.length === 0) return true;
    return window.confirm(`There are ${allIssues.length} unresolved QA issue(s). Export anyway?`);
  }
  function downloadBlob(content, filename) {
    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
    const resolved = subtitles.filter(s => s.userDecision).length;
    return {
      total: subtitles.length,
      totalChars,
      avgChars: subtitles.length ? Math.round(totalChars / subtitles.length) : 0,
      longest,
      resolved
    };
  }, [subtitles]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    function onKeyDown(e) {
      const inField = /^(INPUT|TEXTAREA)$/.test(document.activeElement && document.activeElement.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !inField) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || e.key.toLowerCase() === 'z' && e.shiftKey) && !inField) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFindOpen(true);
      } else if (e.key === 'Escape') {
        setFindOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const hasSession = subtitles.length > 0;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "page-head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "page-eyebrow"
  }, "Editor"), /*#__PURE__*/React.createElement("h1", {
    className: "page-title"
  }, "Subtitle review & editing"), /*#__PURE__*/React.createElement("p", {
    className: "page-sub"
  }, "Upload the English and Persian subtitle files for one episode (.srt or .ass, mix and match freely). Lines are paired by subtitle/dialogue order, then reviewed with 2 lines of context on either side. Deterministic Persian QA checks (spacing, characters, timing, terminology) run automatically as you edit.")), !isConfigured && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner"
  }, "No AI provider configured yet. ", /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      marginLeft: 8
    },
    onClick: goSettings
  }, "Go to Settings")), recovered && !hasSession && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner"
  }, "Found an unsaved session from last time (", recovered.subtitles.length, " subtitles, \"", recovered.faFileName || 'untitled', "\").", /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    style: {
      marginLeft: 8
    },
    onClick: resumeRecovered
  }, "Resume"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost btn-sm",
    style: {
      marginLeft: 6
    },
    onClick: discardRecovered
  }, "Discard")), !hasSession && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "upload-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: `dropzone${enEntries ? ' filled' : ''}`
  }, /*#__PURE__*/React.createElement("label", null, "English .srt / .ass"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".srt,.ass,.ssa",
    onChange: e => handleUpload('en', e.target.files[0])
  }), enEntries && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "filename"
  }, enName), /*#__PURE__*/React.createElement("div", {
    className: "count"
  }, enEntries.length, " subtitle lines parsed"))), /*#__PURE__*/React.createElement("div", {
    className: `dropzone${faEntries ? ' filled' : ''}`
  }, /*#__PURE__*/React.createElement("label", null, "Persian .srt / .ass"), /*#__PURE__*/React.createElement("input", {
    type: "file",
    accept: ".srt,.ass,.ssa",
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
  }, "Pair subtitles \u2192")), pairInfo && hasSession && (pairInfo.countMismatch || pairInfo.unmatchedEn.length > 0 || pairInfo.unmatchedFa.length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "warning-banner"
  }, "English has ", enEntries ? enEntries.length : '?', " lines, Persian has ", faEntries ? faEntries.length : '?', " lines.", ' ', pairInfo.unmatchedEn.length > 0 && `${pairInfo.unmatchedEn.length} English line(s) had no matching Persian number. `, pairInfo.unmatchedFa.length > 0 && `${pairInfo.unmatchedFa.length} Persian line(s) had no matching English number. `, "These were left out rather than guessed."), hasSession && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "stats-bar"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Subtitles",
    value: stats.total
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Total chars",
    value: stats.totalChars
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Avg chars/line",
    value: stats.avgChars
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Longest line",
    value: stats.longest
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Open issues",
    value: allIssues.length,
    color: allIssues.length ? 'var(--major)' : 'var(--correct)'
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Resolved",
    value: stats.resolved,
    color: "var(--correct)"
  })), /*#__PURE__*/React.createElement("div", {
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
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: undo,
    disabled: !canUndo,
    title: "Ctrl+Z"
  }, "\u21B6 Undo"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: redo,
    disabled: !canRedo,
    title: "Ctrl+Shift+Z"
  }, "\u21B7 Redo"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: () => setFindOpen(v => !v),
    title: "Ctrl+F"
  }, "\uD83D\uDD0D Find & Replace"), localIssuesAll.some(i => i.category === 'terminology') && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: applyAllTerminologyFixes
  }, "Apply glossary fixes"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-primary",
    onClick: runAnalysis,
    disabled: analyzing || !isConfigured
  }, analyzing ? 'Analyzing…' : counts.unreviewed === subtitles.length ? 'Run AI QA' : 'Re-run AI QA'))), /*#__PURE__*/React.createElement("div", {
    className: "toolbar",
    style: {
      marginTop: -6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: downloadOriginal
  }, "Download original"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: downloadCorrectedSRT
  }, "Download corrected SRT"), assMeta && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: downloadCorrectedASS
  }, "Download corrected ASS"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost",
    onClick: resetAllToOriginal
  }, "Reset to original"))), analyzing && /*#__PURE__*/React.createElement("div", {
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
  }, "errors ", counts.error))), /*#__PURE__*/React.createElement("div", {
    className: "editor-layout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "editor-main"
  }, visible.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty-state"
  }, /*#__PURE__*/React.createElement("h3", null, "Nothing matches this filter"), /*#__PURE__*/React.createElement("p", null, "Try a different filter, or run the analysis if you haven't yet.")) : /*#__PURE__*/React.createElement("div", {
    className: "subtitle-list"
  }, visible.map((item, i) => {
    const globalIdx = subtitles.findIndex(s => s.id === item.id);
    return /*#__PURE__*/React.createElement(SubtitleCard, {
      key: item.id,
      item: item,
      derivedStatus: deriveStatus(item),
      active: item.id === activeId,
      cardRef: node => {
        rowRefs.current[item.id] = node;
      },
      localIssues: localIssuesBySub[item.id] || [],
      onApply: applyCorrection,
      onIgnore: ignoreIssue,
      onSaveEdit: saveEdit,
      onRevert: revertOriginal,
      onTimingChange: handleTimingChange,
      onTextChange: handleTextChange,
      onAcceptLocal: acceptLocal,
      onRejectLocal: rejectLocal,
      onDuplicate: duplicateSub,
      onDelete: deleteSub,
      onSplit: splitSub,
      onMergeNext: mergeNext,
      onAddBelow: addBelow,
      canMergeNext: globalIdx >= 0 && globalIdx < subtitles.length - 1
    });
  }))), /*#__PURE__*/React.createElement("div", {
    className: "editor-side"
  }, findOpen && /*#__PURE__*/React.createElement(FindReplacePanel, {
    subtitles: subtitles,
    onJump: jumpTo,
    onReplaceAll: replaceAll,
    onClose: () => setFindOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: "qa-panel-wrap"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "qa-panel-title"
  }, "QA issues ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)',
      fontWeight: 400
    }
  }, "(", allIssues.length, " open)")), /*#__PURE__*/React.createElement(IssuesPanel, {
    issues: allIssues,
    onJump: jumpTo,
    onAcceptLocal: acceptLocal,
    onRejectLocal: rejectLocal,
    onApplyAi: applyCorrection,
    onIgnoreAi: ignoreIssue
  }))))));
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
      setActiveProjectId(saved && list.some(p => p.id === saved) ? saved : list[0].id);
    }
    setProjects(list);
  }, []);
  function selectProject(id) {
    setActiveProjectId(id);
    sqaSetActiveProjectId(id);
  }
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;
  return /*#__PURE__*/React.createElement("div", {
    className: "shell"
  }, /*#__PURE__*/React.createElement(Sidebar, {
    page: page,
    setPage: setPage
  }), /*#__PURE__*/React.createElement("main", {
    className: "main"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: page === 'dashboard' ? 'block' : 'none'
    }
  }, /*#__PURE__*/React.createElement(DashboardPage, {
    goEditor: () => setPage('editor'),
    providerConfig: providerConfig,
    activeProject: activeProject
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: page === 'editor' ? 'block' : 'none'
    }
  }, /*#__PURE__*/React.createElement(EditorPage, {
    providerConfig: providerConfig,
    goSettings: () => setPage('settings'),
    activeProject: activeProject
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: page === 'settings' ? 'block' : 'none'
    }
  }, /*#__PURE__*/React.createElement(SettingsPage, {
    providerConfig: providerConfig,
    setProviderConfig: setProviderConfig
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: page === 'projects' ? 'block' : 'none'
    }
  }, /*#__PURE__*/React.createElement(ProjectsPage, {
    projects: projects,
    setProjects: setProjects,
    activeProjectId: activeProjectId,
    setActiveProjectId: selectProject
  }))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
