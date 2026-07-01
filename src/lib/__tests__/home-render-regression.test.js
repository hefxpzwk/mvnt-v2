import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function extractFunctionBody(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  assert.notEqual(start, -1, `${functionName} should exist`);
  const bodyStart = source.indexOf(') {', start) + 2;
  assert.ok(bodyStart > 1, `${functionName} body should start`);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) return source.slice(bodyStart, index + 1);
  }
  throw new Error(`${functionName} body should close`);
}

test('Home trend cards render through the shared community card component', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const body = extractFunctionBody(source, 'CommunityExamples');

  assert.match(body, /<CommunityVideoCard\b/);
  assert.doesNotMatch(body, /manualPlayback\s*\?/);
  assert.doesNotMatch(body, /selected=\{selected\}/);
});


test('Home composer renders pasted music as the shared embed preview', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const body = extractFunctionBody(source, 'HomePage');

  assert.match(body, /className="stable-composer home-composer/);
  assert.match(body, /composerStep === 'details' \? \(/);
  assert.match(body, /: sourceDescription \? \(/);
  assert.match(body, /<MusicSourceEmbedPreview/);
  assert.match(body, /placeholder="붙여넣은 링크를 임베드했습니다"/);
});

test('Dance create composer uses the shared embed preview and file uploads do not crash', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const body = extractFunctionBody(source, 'DanceCreateComposerModal');

  assert.match(body, /function applyFile\(file\)/);
  assert.match(body, /setMusicSource\(\{ type: 'file', label: file\.name, file \}\)/);
  assert.match(body, /composerStep === 'details' \? \(/);
  assert.match(body, /<MusicSourceEmbedPreview description=\{sourceDescription\} metadata=\{sourceMetadata\}/);
});


test('Home and dance creation composers advance to a shared prompt and reference step', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
  const homeBody = extractFunctionBody(source, 'HomePage');
  const modalBody = extractFunctionBody(source, 'DanceCreateComposerModal');

  assert.match(homeBody, /useState\('Next'\)/);
  assert.match(modalBody, /useState\('Next'\)/);
  assert.match(homeBody, /setStatus\('Generate'\)/);
  assert.match(modalBody, /setStatus\('Generate'\)/);
  assert.match(homeBody, /setComposerStep\('details'\)/);
  assert.match(modalBody, /setComposerStep\('details'\)/);
  assert.match(homeBody, /returnToComposerMusic/);
  assert.match(modalBody, /returnToComposerMusic/);
  assert.match(homeBody, />\s*Previous\s*<\/button>/);
  assert.match(modalBody, />Previous<\/button>/);
  assert.match(homeBody, /<CreationDetailsStep \/>/);
  assert.match(modalBody, /<CreationDetailsStep \/>/);
  assert.match(source, /function CreationDetailsStep/);
  assert.match(source, /프롬프트 입력/);
  assert.match(source, /사진 붙여넣기 · 드래그 · 업로드/);
  assert.match(styles, /\.creation-details-step/);
  assert.match(styles, /\.creation-reference-drop/);
});


test('Home composer expansion pushes community trends instead of overlapping them', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const homeBody = extractFunctionBody(source, 'HomePage');
  const communityBody = extractFunctionBody(source, 'CommunityExamples');

  assert.match(homeBody, /min-h-\[clamp\(520px,68vh,720px\)\]/);
  assert.match(homeBody, /pb-8/);
  assert.doesNotMatch(homeBody, /-translate-y-8/);
  assert.match(communityBody, /mt-10/);
  assert.doesNotMatch(communityBody, /-mt-32/);
});
