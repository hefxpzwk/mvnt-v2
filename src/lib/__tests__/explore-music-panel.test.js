import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Explore music button opens a header-below song detail panel left of fixed arrows', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /function ExploreMusicPanel/);
  assert.match(source, /aria-label="음악 상세"/);
  assert.match(source, /bg-\[#080808\]\/94/);
  assert.match(source, /from-mvnt-orange via-pink-500 to-violet-600/);
  assert.match(source, /artist: 'Hearts2Hearts'/);
  assert.doesNotMatch(source, /<span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-mvnt-orange to-mvnt-yellow/);
  assert.doesNotMatch(source, /artist: '@/);
  assert.match(source, /top-12/);
  assert.match(source, /xl:bottom-0/);
  assert.match(source, /xl:right-\[84px\] xl:w-\[430px\]/);
  assert.match(source, /이 노래로 춤 만들기/);
  assert.match(source, /사용한 영상들/);
  assert.match(source, /<section className="min-h-0 flex-1 overflow-y-auto/);
  assert.match(source, /onClick=\{\(\) => onOpenVideo\?\.\(video,/);
  assert.match(source, /const \[selectedMusicVideo, setSelectedMusicVideo\]/);
  assert.match(source, /<TrendVideoModal/);
  assert.match(source, /const \[activeMusicIndex, setActiveMusicIndex\]/);
  assert.match(source, /onOpen=\{\(\) => openExploreMusic\(index\)\}/);
  assert.equal((source.match(/style=\{\{ transform: activeMusicIndex === index \? 'translateX\(-260px\)' : 'translateX\(0\)' \}\}/g) || []).length, 2);
  assert.match(source, /className="relative ml-\[max\(16px,calc\(50%-460px\)\)\]/);
  assert.doesNotMatch(source, /<article[\s\S]{0,260}style=\{\{ transform:/);
  assert.match(source, /className="fixed right-4 top-1\/2 z-30/);
  assert.match(source, /explore-music-panel fixed/);
  assert.match(source, /explore-music-panel fixed[^\n]*rounded-none/);
  assert.doesNotMatch(source, /h-\[72px\].*border-b border-black\/10/s);
  assert.match(source, /absolute right-5 top-5 z-20/);
  assert.match(styles, /@keyframes explore-music-panel-enter/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
