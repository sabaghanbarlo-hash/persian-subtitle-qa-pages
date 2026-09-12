const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'https://sabaghanbarlo-hash.github.io/persian-subtitle-qa-pages/',
  runScripts: 'dangerously', pretendToBeVisual: true,
});
const { window } = dom;
global.window = window; global.document = window.document; global.navigator = window.navigator; global.localStorage = window.localStorage;

let caughtErrors = [];
window.addEventListener('error', (e) => caughtErrors.push(e.error ? (e.error.stack || e.error.message) : e.message));

const combined = [
  fs.readFileSync(path.join(__dirname, '..', 'vendor', 'react.production.min.js'), 'utf8'),
  fs.readFileSync(path.join(__dirname, '..', 'vendor', 'react-dom.production.min.js'), 'utf8'),
  fs.readFileSync(path.join(__dirname, '..', 'js', 'lib.js'), 'utf8'),
  fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8'),
].join('\n;\n');
window.eval(combined);

const root = window.document.getElementById('root');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function click(el) { el.dispatchEvent(new window.Event('click', { bubbles: true })); }
function setValue(el, value) {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
  el.dispatchEvent(new window.Event('change', { bubbles: true }));
}
function navTo(label) {
  const btn = Array.from(root.querySelectorAll('.nav-item')).find((b) => b.textContent.trim().startsWith(label));
  if (!btn) throw new Error(`nav item not found: ${label}`);
  click(btn);
}

async function run() {
  await sleep(50);
  // ---- go to Editor, upload EN + FA files ----
  navTo('Editor'); await sleep(20);

  const enSrt = `1\n00:00:01,000 --> 00:00:03,000\nI don't know what you're talking about.\n\n2\n00:00:04,000 --> 00:00:06,000\nThe Captain gave the order.\n\n3\n00:00:07,000 --> 00:00:09,000\nWe need to move now.\n`;
  const faSrt = `1\n00:00:01,000 --> 00:00:03,000\nنمیدونم  داری  درباره چی حرف میزنی!!!\n\n2\n00:00:04,000 --> 00:00:06,000\nفرمانده دستور را داد.\n\n3\n00:00:07,000 --> 00:00:09,000\nباید همین الان حرکت کنیم.\n`;

  const fileInputs = root.querySelectorAll('.dropzone input[type="file"]');
  if (fileInputs.length !== 2) throw new Error(`expected 2 file inputs, found ${fileInputs.length}`);

  function makeFile(name, content) {
    return new window.File([content], name, { type: 'text/plain' });
  }
  function setFiles(input, file) {
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new window.Event('change', { bubbles: true }));
  }

  setFiles(fileInputs[0], makeFile('episode01.en.srt', enSrt));
  setFiles(fileInputs[1], makeFile('episode01.fa.srt', faSrt));
  await sleep(50);

  console.log('EN parsed shown?', root.innerHTML.includes('episode01.en.srt'));
  console.log('FA parsed shown?', root.innerHTML.includes('episode01.fa.srt'));

  const pairBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('Pair subtitles'));
  if (!pairBtn || pairBtn.disabled) throw new Error('Pair subtitles button missing or disabled');
  click(pairBtn);
  await sleep(50);

  console.log('Subtitle cards rendered?', root.querySelectorAll('.subtitle-card').length, '(expect 3)');
  console.log('Local QA caught char-confusion/spacing/repeated punctuation?', root.innerHTML.includes('local-issue-row'));
  console.log('QA panel shows open issues?', /QA issues.*\(\d+ open\)/.test(root.textContent));

  // ---- glossary: add "Captain" -> "کاپیتان" via Projects page, then check terminology flag appears back in Editor ----
  navTo('Projects'); await sleep(20);
  const sourceInput = Array.from(root.querySelectorAll('input')).find((i) => i.placeholder === 'e.g. Captain');
  const preferredInput = Array.from(root.querySelectorAll('input')).find((i) => i.placeholder === 'e.g. کاپیتان');
  const alternatesInput = Array.from(root.querySelectorAll('input')).find((i) => i.placeholder === 'alt spellings, comma-separated');
  setValue(sourceInput, 'Captain');
  setValue(preferredInput, 'کاپیتان');
  setValue(alternatesInput, 'فرمانده');
  const addTermBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('+ Add'));
  click(addTermBtn);
  await sleep(30);
  console.log('Glossary term added?', Array.from(root.querySelectorAll('.glossary-row input')).some((i) => i.value === 'کاپیتان'));

  navTo('Editor'); await sleep(30);
  console.log('Terminology issue now shown for "فرمانده"?', root.textContent.includes('کاپیتان') && root.textContent.includes('Preferred term'));

  // ---- apply glossary fixes bulk button ----
  const applyGlossaryBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('Apply glossary fixes'));
  if (applyGlossaryBtn) {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    click(applyGlossaryBtn);
    window.confirm = originalConfirm;
    await sleep(30);
  } else {
    console.log('WARNING: Apply glossary fixes button not found');
  }
  console.log('After bulk glossary fix, فرمانده replaced with کاپیتان in a textarea?',
    Array.from(root.querySelectorAll('.fa-text-input')).some((t) => t.value.includes('کاپیتان')));

  // ---- undo the bulk fix ----
  const undoBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('Undo'));
  console.log('Undo button enabled after edits?', undoBtn && !undoBtn.disabled);
  click(undoBtn);
  await sleep(30);
  console.log('After undo, فرمانده restored?',
    Array.from(root.querySelectorAll('.fa-text-input')).some((t) => t.value.includes('فرمانده')));

  const redoBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('Redo'));
  click(redoBtn);
  await sleep(30);
  console.log('After redo, کاپیتان back?',
    Array.from(root.querySelectorAll('.fa-text-input')).some((t) => t.value.includes('کاپیتان')));

  // ---- find & replace ----
  const findBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('Find & Replace'));
  click(findBtn);
  await sleep(20);
  const findInput = root.querySelector('.find-panel input[placeholder="Find in Persian text…"]');
  const replaceInput = root.querySelector('.find-panel input[placeholder="Replace with…"]');
  setValue(findInput, 'حرکت');
  setValue(replaceInput, 'حمله');
  await sleep(20);
  console.log('Find shows match count?', /Found \d+ match/.test(root.textContent));
  const replaceAllBtn = Array.from(root.querySelectorAll('.find-panel button')).find((b) => b.textContent === 'Replace all');
  click(replaceAllBtn);
  await sleep(20);
  const confirmApplyBtn = Array.from(root.querySelectorAll('.warning-banner button')).find((b) => b.textContent === 'Apply');
  click(confirmApplyBtn);
  await sleep(30);
  console.log('After replace-all, حمله present?', Array.from(root.querySelectorAll('.fa-text-input')).some((t) => t.value.includes('حمله')));

  // ---- add / duplicate / delete / split / merge row ops ----
  const beforeCount = root.querySelectorAll('.subtitle-card').length;
  const addBelowBtn = root.querySelector('.subtitle-card .row-toolbar button');
  click(addBelowBtn); // first toolbar button is "+ below"
  await sleep(30);
  console.log('Add-below increased count?', root.querySelectorAll('.subtitle-card').length, 'was', beforeCount);

  // ---- timestamp edit ----
  const timeInputs = root.querySelectorAll('.time-input');
  setValue(timeInputs[0], '00:00:00,500');
  timeInputs[0].dispatchEvent(new window.Event('blur', { bubbles: true }));
  await sleep(20);
  console.log('Timestamp field reflects edit?', timeInputs[0].value === '00:00:00,500');

  // ---- export (SRT) ----
  let downloadTriggered = false;
  const origCreateObjectURL = window.URL.createObjectURL;
  window.URL.createObjectURL = (blob) => { downloadTriggered = true; return 'blob:mock'; };
  window.URL.revokeObjectURL = () => {};
  const originalConfirm2 = window.confirm;
  window.confirm = () => true; // there will be open issues; auto-confirm export
  const srtBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent === 'Download corrected SRT');
  click(srtBtn);
  window.confirm = originalConfirm2;
  window.URL.createObjectURL = origCreateObjectURL;
  console.log('SRT export triggered a download?', downloadTriggered);

  console.log('\nCaught runtime errors:', caughtErrors.length ? caughtErrors : 'none');
  process.exit(caughtErrors.length ? 1 : 0);
}

run().catch((e) => { console.error('TEST THREW:', e); process.exit(1); });
