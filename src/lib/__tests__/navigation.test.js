import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPageUrl, defaultPage, readPageFromLocation } from '../navigation.js';

test('readPageFromLocation returns credits route from pathname', () => {
  assert.equal(readPageFromLocation({ pathname: '/credits', hash: '' }), 'Credits');
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
