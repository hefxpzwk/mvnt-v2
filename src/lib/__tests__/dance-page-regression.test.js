import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Dance bottom bar icons are imported before rendering the page', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');

  assert.match(source, /ChevronUp,/);
  assert.match(source, /<ChevronUp\b/);
  assert.match(source, /className="dance-bottom-bar-handle"/);
});

test('Dance status messages render as temporary top-center toasts', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /const \[danceToast, setDanceToast\]/);
  assert.match(source, /setTimeout\(\(\) => setDanceToast\(null\), 2400\)/);
  assert.match(source, /<span>\{danceToast\}<\/span>/);
  assert.match(styles, /\.dance-active-template\s*\{[^}]*top: 22px;/s);
  assert.match(styles, /@keyframes dance-toast-pop/);
});

test('Dance edit panel shrinks the 3D stage when opened', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /dance-page[^`]*\$\{bottomBarOpen \? 'is-editing-open' : ''\}/);
  assert.match(source, /aria-label="댄스 편집 하단 바"/);
  assert.match(source, /Dance Timeline/);
  assert.match(styles, /\.dance-page\.is-editing-open \.dance-stage\s*\{[^}]*height: calc\(100% - var\(--dance-editor-open-height\)\);/s);
  assert.match(styles, /\.dance-bottom-bar\s*\{[^}]*height: var\(--dance-editor-open-height\);/s);
  assert.match(styles, /\.dance-bottom-bar-panel\s*\{[^}]*width: 100%;[^}]*height: 100%;/s);
});

test('Dance edit panel exposes selectable and removable background and dance clips', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /const \[selectedTimelineItem, setSelectedTimelineItem\]/);
  assert.match(source, /const \[timelineTracks, setTimelineTracks\]/);
  assert.match(source, /label: '배경'/);
  assert.match(source, /label: '춤'/);
  assert.match(source, /deleteTimelineItem/);
  assert.match(source, /className="dance-timeline-shell"/);
  assert.match(source, /className=\{`dance-timeline-clip/);
  assert.match(styles, /\.dance-timeline-track\s*\{/);
  assert.match(styles, /\.dance-timeline-clip\.is-selected/);
  assert.match(styles, /\.dance-timeline-delete/);
});
