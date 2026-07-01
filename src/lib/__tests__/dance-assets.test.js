import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { danceRigBoneNames } from '../danceRig.js';

const mannequinGlbPath = new URL('../../../static/models/M4_Actor_Glb_NOFACE.glb', import.meta.url);

function readGlbJson(bytes) {
  assert.equal(bytes.subarray(0, 4).toString('utf8'), 'glTF');
  let offset = 12;
  while (offset < bytes.length) {
    const chunkLength = bytes.readUInt32LE(offset);
    const chunkType = bytes.readUInt32LE(offset + 4);
    offset += 8;
    const chunk = bytes.subarray(offset, offset + chunkLength);
    offset += chunkLength;
    if (chunkType === 0x4e4f534a) return JSON.parse(chunk.toString('utf8'));
  }
  throw new Error('GLB JSON chunk not found');
}

test('Dance page ships a real compatible GLB mannequin rig for the Three.js scene', () => {
  const bytes = readFileSync(mannequinGlbPath);
  assert.ok(bytes.length > 1_000_000, 'expected a real GLB asset, not a placeholder');

  const gltf = readGlbJson(bytes);
  const nodeNames = new Set((gltf.nodes || []).map((node) => node.name).filter(Boolean));
  assert.deepEqual(danceRigBoneNames.filter((name) => !nodeNames.has(name)), []);
  assert.ok((gltf.skins || []).length >= 1, 'expected a skinned mannequin rig');
});
