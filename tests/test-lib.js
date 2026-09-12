global.location = { origin: 'https://example.com' };
const fs = require('fs');
const path = require('path');
const vm = require('vm');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '..', 'js', 'lib.js'), 'utf8'), { filename: 'lib.js' });

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
`;

const parsed = parseASS(assSample);
console.log('Parsed entries:', JSON.stringify(parsed.entries, null, 2));

// simulate the app's entry shape: index/start/end/fa/originalFa (+ass-native fields)
const entries = parsed.entries.map((e) => ({
  index: e.index, start: e.start, end: e.end,
  fa: e.text, originalFa: e.text, originalStart: e.start, originalEnd: e.end,
  rawText: e.rawText, assFields: e.assFields,
}));
const assMeta = { header: parsed.header, fields: parsed.fields };

// Case 1: no edits -> tags preserved exactly
const untouched = exportASS(entries, assMeta);
console.log('\n--- Untouched export ---\n' + untouched);

// Case 2: edit only the second line's text
entries[1].fa = 'خط دوم ویرایش شده';
console.log('\n--- After editing line 2 text only ---\n' + exportASS(entries, assMeta));

// Case 3: also shift timing of line 1
entries[0].start = 1500;
console.log('\n--- After also shifting line 1 start time ---\n' + exportASS(entries, assMeta));

// Case 4: structural edit — delete line 1, add a brand-new line (no assFields), reorder
const structuralEntries = [
  entries[1], // kept, edited text — should still show tags-lost only on this one (already edited)
  { index: 3, start: 7000, end: 8000, fa: 'یک خط کاملاً جدید', originalFa: null, originalStart: null, originalEnd: null, rawText: null, assFields: null },
];
console.log('\n--- After delete + reorder + insert new line (structural edit) ---\n' + exportASS(structuralEntries, assMeta));


// ---- Local QA checks ----
const subtitles = [
  { id: 's1', index: 1, start: 1000, end: 3000, fa: 'اين  متن  با كاف عربي و مشکل فاصله است!!!' },
  { id: 's2', index: 2, start: 2500, end: 4000, fa: 'خط دوم' }, // overlaps s1
  { id: 's3', index: 3, start: 5000, end: 5050, fa: 'خیلی کوتاه' }, // too short
];
const glossary = [{ id: 'g1', source: 'Captain', preferred: 'کاپیتان', alternates: ['فرمانده'], enabled: true }];
const localIssues = runLocalQA(
  [subtitles[0], subtitles[1], { ...subtitles[1], fa: 'فرمانده به سمت در رفت' }, subtitles[2]],
  { glossary, maxCharsPerLine: 42, maxLinesPerSub: 2 }
);
console.log('\n--- Local QA issues ---');
localIssues.forEach((i) => console.log(`[${i.severity}] ${i.category} (sub ${i.subIndex}): ${i.message}${i.suggestedText ? ' -> ' + i.suggestedText : ''}`));

// ---- Glossary JSON roundtrip ----
const simple = glossaryToSimpleJSON(glossary);
console.log('\n--- Glossary export ---\n' + simple);
const reimported = simpleJSONToGlossary(simple);
console.log('\n--- Reimported ---', JSON.stringify(reimported));
