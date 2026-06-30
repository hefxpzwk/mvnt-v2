import test from 'node:test';
import assert from 'node:assert/strict';
import { describeSource, estimateTokenUse, getFileKind, getYouTubeId, inferModeFromSource } from '../source.js';

test('getYouTubeId supports watch, short, and embed URLs', () => {
  assert.equal(getYouTubeId('https://www.youtube.com/watch?v=abc123'), 'abc123');
  assert.equal(getYouTubeId('https://youtu.be/shortid'), 'shortid');
  assert.equal(getYouTubeId('https://www.youtube.com/embed/embedid'), 'embedid');
});

test('source helpers safely classify malformed or plain text input', () => {
  assert.equal(getYouTubeId('not a url'), '');
  assert.equal(describeSource({ type: 'link', label: 'plain text' }).kind, 'text');
});

test('file and token helpers preserve media classifications', () => {
  const audio = { name: 'track.mp3', type: '', size: 2048 };
  assert.equal(getFileKind(audio), 'audio');
  assert.equal(inferModeFromSource({ type: 'file', file: audio, label: audio.name }), 'Audio');
  assert.equal(estimateTokenUse({ type: 'file', file: audio }, 'YouTube'), 45);
});

test('describeSource returns serializable icon keys for UI mapping', () => {
  assert.equal(describeSource({ type: 'link', label: 'https://soundcloud.com/demo/track' }).icon, 'AudioLines');
  assert.equal(describeSource({ type: 'link', label: 'https://example.com/a' }).icon, 'Link');
});
