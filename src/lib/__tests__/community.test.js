import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCommunityVideos, getCommunityVideoTags, getVisibleCommunityTags } from '../community.js';

test('community tags preserve default and derived categories', () => {
  assert.deepEqual(getCommunityVideoTags({ title: 'BLACKPINK Hook', creator: 'crew' }, 2), ['All', 'Trending', 'K-pop']);
});

test('filterCommunityVideos combines tag and query filters', () => {
  const results = filterCommunityVideos({ activeTag: 'Street', query: 'arcade' });
  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'Arcade Shuffle');
});


test('visible community tags reveal filters one by one from All', () => {
  assert.deepEqual(getVisibleCommunityTags(1), ['All']);
  assert.deepEqual(getVisibleCommunityTags(3), ['All', 'Trending', 'K-pop']);
  assert.deepEqual(getVisibleCommunityTags(99), ['All', 'Trending', 'K-pop', 'Street', 'Loop', 'Ballad']);
});
