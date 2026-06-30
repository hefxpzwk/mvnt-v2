import test from 'node:test';
import assert from 'node:assert/strict';
import { projectFilters, projectWorks } from '../projects.js';

test('projectWorks centralizes project table rows used by ProjectsPage', () => {
  assert.equal(projectWorks.length, 12);
  assert.equal(projectWorks[0].workTitle, 'BLACKPINK GO hook motion');
  assert.equal(projectWorks[0].src, '/community/milkshake.mp4');
});

test('projectFilters preserve existing Korean project filter labels', () => {
  assert.deepEqual(projectFilters, ['전체', 'AI 생성', '리믹스']);
});
