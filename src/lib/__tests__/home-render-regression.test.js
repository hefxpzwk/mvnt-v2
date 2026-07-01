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
