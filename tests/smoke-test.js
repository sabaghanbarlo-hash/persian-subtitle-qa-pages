const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const html = `<!doctype html><html><body><div id="root"></div></body></html>`;
const dom = new JSDOM(html, { url: 'https://sabaghanbarlo-hash.github.io/persian-subtitle-qa-pages/', runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;

// minimal localStorage polyfill (jsdom's is fine actually, but ensure present)
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.localStorage = window.localStorage;

let caughtErrors = [];
window.addEventListener('error', (e) => caughtErrors.push(e.error ? e.error.stack || e.error.message : e.message));

try {
  const combined = [
    fs.readFileSync(path.join(__dirname, '..', 'vendor', 'react.production.min.js'), 'utf8'),
    fs.readFileSync(path.join(__dirname, '..', 'vendor', 'react-dom.production.min.js'), 'utf8'),
    fs.readFileSync(path.join(__dirname, '..', 'js', 'lib.js'), 'utf8'),
    fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8'),
  ].join('\n;\n');
  // Concatenated like real <script> tags sharing one global scope (separate
  // window.eval() calls don't share top-level const/let bindings in jsdom).
  window.eval(combined);
} catch (e) {
  console.error('FATAL during initial load:', e);
  process.exit(1);
}

// Give React a tick to render (createRoot render is sync for initial mount in this UMD build typically)
setTimeout(() => {
  const root = window.document.getElementById('root');
  console.log('--- Root innerHTML length after mount ---', root.innerHTML.length);
  console.log('--- Contains "Dashboard"? ---', root.innerHTML.includes('Dashboard'));
  console.log('--- Contains nav items (Editor/Projects/Settings)? ---',
    root.innerHTML.includes('Editor'), root.innerHTML.includes('Projects'), root.innerHTML.includes('AI Models'));

  // Check a project was auto-created in localStorage
  const projects = JSON.parse(window.localStorage.getItem('sqa_projects') || '[]');
  console.log('--- Auto-created project? ---', projects.length, projects[0] && projects[0].name);

  // Try clicking nav to Editor page
  const navButtons = Array.from(root.querySelectorAll('.nav-item'));
  console.log('--- Nav buttons found ---', navButtons.map((b) => b.textContent.trim()));
  const editorBtn = navButtons.find((b) => b.textContent.trim() === 'Editor');
  if (editorBtn) {
    editorBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  }

  setTimeout(() => {
    console.log('--- After clicking Editor, contains upload dropzone? ---', root.innerHTML.includes('dropzone'));
    console.log('--- Contains "English .srt / .ass"? ---', root.innerHTML.includes('English .srt'));

    // Nav to Projects
    const navButtons2 = Array.from(root.querySelectorAll('.nav-item'));
    const projBtn = navButtons2.find((b) => b.textContent.trim().startsWith('Projects'));
    if (projBtn) projBtn.dispatchEvent(new window.Event('click', { bubbles: true }));

    setTimeout(() => {
      console.log('--- After clicking Projects, contains glossary table? ---', root.innerHTML.includes('Glossary'));
      console.log('--- Caught runtime errors ---', caughtErrors);
      console.log(caughtErrors.length === 0 ? 'SMOKE TEST PASSED' : 'SMOKE TEST HAD ERRORS');
      process.exit(caughtErrors.length === 0 ? 0 : 1);
    }, 50);
  }, 50);
}, 50);
