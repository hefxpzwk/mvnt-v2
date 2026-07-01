import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildPageUrl, defaultPage, readPageFromLocation } from '../navigation.js';

test('readPageFromLocation returns direct routes from pathname', () => {
  assert.equal(readPageFromLocation({ pathname: '/credits', hash: '' }), 'Credits');
  assert.equal(readPageFromLocation({ pathname: '/dance', hash: '' }), 'Dance');
  assert.equal(readPageFromLocation({ pathname: '/Projects', hash: '' }), 'Projects');
});

test('readPageFromLocation resolves supported hash routes and aliases', () => {
  assert.equal(readPageFromLocation({ pathname: '/', hash: '#/Explore' }), 'Explore');
  assert.equal(readPageFromLocation({ pathname: '/', hash: '#/Create' }), 'Home');
  assert.equal(readPageFromLocation({ pathname: '/', hash: '#/Studio' }), 'Projects');
});

test('readPageFromLocation safely falls back on malformed hash', () => {
  assert.equal(readPageFromLocation({ pathname: '/', hash: '#/%' }), defaultPage);
});

test('buildPageUrl returns canonical URLs only for known pages', () => {
  assert.equal(buildPageUrl('Credits'), '/credits');
  assert.equal(buildPageUrl('Explore'), '/#/Explore');
  assert.equal(buildPageUrl('Missing'), null);
});


test('Sidebar exposes a tutorial button above the profile menu', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');
  const tutorialIndex = source.indexOf('className="sidebar-tutorial-button"');
  const profileIndex = source.indexOf('aria-label="Open profile menu"');

  assert.ok(tutorialIndex > -1, 'tutorial button should render');
  assert.ok(profileIndex > -1, 'profile menu should render');
  assert.ok(tutorialIndex < profileIndex, 'tutorial should appear above profile');
  assert.match(source, /튜토리얼/);
  assert.match(styles, /\.sidebar-tutorial-button/);
});
