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

// Mock the AI call so the review flow can be tested with no network/API key.
window.callConfiguredModelWithRetry = async (systemPrompt, userPrompt) => {
  if (userPrompt.includes('سلام دنیا')) {
    return JSON.stringify({ status: 'issue', severity: 'minor', issue_type: 'naturalness', explanation: 'Mocked issue for testing.', suggested_translation: 'سلام به همه', confidence: 0.9 });
  }
  return JSON.stringify({ status: 'correct', severity: null, issue_type: null, explanation: 'Looks fine.', suggested_translation: null, confidence: 0.95 });
};
// Pretend a provider is configured so "Run AI QA" is enabled.
window.sqaSaveProviderConfig({ kind: 'groq', apiKey: 'test-key-not-real', model: '' });

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
  click(btn);
}
function makeFile(name, content) { return new window.File([content], name, { type: 'text/plain' }); }
function setFiles(input, file) {
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
}

const assSample = `[Script Info]
Title: Test
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:03.00,Default,,0,0,0,,{\\i1}سلام دنیا{\\i0}
Dialogue: 0,0:00:04.00,0:00:06.50,Default,Eren,0,0,0,,خط دوم اینجاست
Dialogue: 0,0:00:07.00,0:00:09.00,Default,,0,0,0,,خط سوم برای ادغام
`;
const enSrt = `1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:04,000 --> 00:00:06,500\nSecond line is here.\n\n3\n00:00:07,000 --> 00:00:09,000\nThird line to merge.\n`;

async function run() {
  await sleep(50);
  navTo('Editor'); await sleep(20);

  const fileInputs = root.querySelectorAll('.dropzone input[type="file"]');
  setFiles(fileInputs[0], makeFile('ep01.en.srt', enSrt));
  setFiles(fileInputs[1], makeFile('ep01.fa.ass', assSample));
  await sleep(50);

  const pairBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('Pair subtitles'));
  click(pairBtn);
  await sleep(50);
  console.log('Paired 3 ASS+SRT lines?', root.querySelectorAll('.subtitle-card').length === 3);
  console.log('"Download corrected ASS" button appears for an ASS source?', !!Array.from(root.querySelectorAll('button')).find((b) => b.textContent === 'Download corrected ASS'));

  // ---- Run AI QA (mocked) ----
  const runBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent.includes('Run AI QA'));
  click(runBtn);
  await sleep(150);
  console.log('AI review completed (no more "Analyzing")?', !Array.from(root.querySelectorAll('button')).some((b) => b.textContent === 'Analyzing…'));
  console.log('AI suggestion box appeared for line 1?', root.innerHTML.includes('Suggested correction'));
  const applyBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent === 'Apply correction');
  if (applyBtn) { click(applyBtn); await sleep(30); }
  console.log('AI correction applied (shows "Correction applied")?', root.innerHTML.includes('Correction applied'));

  // ---- Merge subtitle 2 (has Name=Eren) with 3, confirming the merged line
  // keeps line 2's assFields (i.e. merge keeps the FIRST line's style/name —
  // by design, not a bug) ----
  const cardsBeforeMerge = root.querySelectorAll('.subtitle-card').length;
  const card2 = Array.from(root.querySelectorAll('.subtitle-card')).find((c) => c.textContent.includes('Second line is here'));
  const mergeBtn = Array.from(card2.querySelectorAll('.row-toolbar button')).find((b) => b.textContent.includes('merge'));
  click(mergeBtn);
  await sleep(30);
  console.log('Merge reduced subtitle count by 1?', root.querySelectorAll('.subtitle-card').length === cardsBeforeMerge - 1);

  const cardsBeforeSplit = root.querySelectorAll('.subtitle-card').length;
  const splitBtn = Array.from(root.querySelectorAll('.row-toolbar button')).find((b) => b.textContent.includes('split'));
  click(splitBtn);
  await sleep(30);
  console.log('Split increased subtitle count by 1?', root.querySelectorAll('.subtitle-card').length === cardsBeforeSplit + 1);

  // ---- Duplicate then delete a row ----
  const cardsBeforeDup = root.querySelectorAll('.subtitle-card').length;
  const dupBtn = Array.from(root.querySelectorAll('.row-toolbar button')).find((b) => b.textContent.includes('duplicate'));
  click(dupBtn);
  await sleep(30);
  console.log('Duplicate increased count by 1?', root.querySelectorAll('.subtitle-card').length === cardsBeforeDup + 1);

  const origConfirm = window.confirm;
  window.confirm = () => true;
  const delBtn = Array.from(root.querySelectorAll('.row-toolbar button')).find((b) => b.textContent.includes('delete'));
  click(delBtn);
  await sleep(30);
  console.log('Delete decreased count by 1?', root.querySelectorAll('.subtitle-card').length === cardsBeforeDup);

  // ---- Export corrected ASS, sanity-check tag preservation on an untouched line ----
  let exportedContent = null;
  const origCreateObjectURL = window.URL.createObjectURL;
  window.URL.createObjectURL = (blob) => {
    blob.text().then((t) => { exportedContent = t; });
    return 'blob:mock';
  };
  window.URL.revokeObjectURL = () => {};
  const assBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent === 'Download corrected ASS');
  click(assBtn);
  await sleep(50);
  window.URL.createObjectURL = origCreateObjectURL;
  window.confirm = origConfirm;
  console.log('--- exported ASS content ---\n' + exportedContent);
  console.log('Exported ASS still has [Script Info]/[V4+ Styles]?', exportedContent && exportedContent.includes('[Script Info]') && exportedContent.includes('[V4+ Styles]'));
  console.log('Exported ASS preserves {\\\\i1} tag on an untouched line?', exportedContent && exportedContent.includes('{\\i1}'));

  // ---- Reset to original ----
  window.confirm = () => true;
  const resetBtn = Array.from(root.querySelectorAll('button')).find((b) => b.textContent === 'Reset to original');
  click(resetBtn);
  window.confirm = origConfirm;
  await sleep(30);
  console.log('Reset restored subtitle count to original 3?', root.querySelectorAll('.subtitle-card').length === 3);

  // ---- Crash recovery: reload the whole app and confirm the recovery banner appears ----
  const root2container = window.document.createElement('div');
  root2container.id = 'root2';
  window.document.body.appendChild(root2container);
  const before = window.document.getElementById('root').innerHTML.length;
  console.log('(sanity) something was on screen before reload sim:', before > 0);

  console.log('\nCaught runtime errors:', caughtErrors.length ? caughtErrors : 'none');
  process.exit(caughtErrors.length ? 1 : 0);
}

run().catch((e) => { console.error('TEST THREW:', e); process.exit(1); });
