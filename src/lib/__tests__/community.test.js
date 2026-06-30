import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCommunityVideos, getCommunityVideoTags } from '../community.js';

test('community tags preserve default and derived categories', () => {
  assert.deepEqual(getCommunityVideoTags({ title: 'BLACKPINK Hook', creator: 'crew' }, 2), ['All', 'Trending', 'K-pop']);
});

test('filterCommunityVideos combines tag and query filters', () => {
  const results = filterCommunityVideos({ activeTag: 'Street', query: 'arcade' });
  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'Arcade Shuffle');
});
