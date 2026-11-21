import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorageModel, garbageCollect, logicalDelete, restoreFile, storageStats, writeFile } from '../apps/web/src/core/storage.js';

const bytes = length => new Uint8Array(Array.from({ length }, (_, index) => index & 0xff));

test('phone file workflow keeps valid pages through garbage collection', () => {
  let model = createStorageModel();
  const photo = writeFile(model, { name: 'photo.svg', size: 640, bytes: bytes(640), kind: 'photo' });
  assert.equal(photo.ok, true);
  model = photo.model;
  const note = writeFile(model, { name: 'note.txt', size: 30, bytes: bytes(30), kind: 'document' });
  assert.equal(note.ok, true);
  model = note.model;

  const deleted = logicalDelete(model, photo.file.id);
  assert.equal(deleted.ok, true);
  assert.equal(storageStats(deleted.model).invalidPages, 3);

  const collected = garbageCollect(deleted.model);
  assert.equal(collected.ok, true);
  const liveNote = collected.model.files.find(file => file.id === note.file.id);
  const oldPhoto = collected.model.files.find(file => file.id === photo.file.id);
  assert.equal(liveNote.status, 'valid');
  assert.equal(liveNote.physicalPages[0].blockId, 1);
  assert.equal(oldPhoto.status, 'collected');
  assert.equal(storageStats(collected.model).invalidPages, 0);
  assert.equal(collected.model.blocks[0].eraseCount, 1);
});

test('logical deletion can be restored before physical reclamation', () => {
  const initial = writeFile(createStorageModel(), { name: 'draft.txt', size: 20, bytes: bytes(20), kind: 'document' });
  const deleted = logicalDelete(initial.model, initial.file.id);
  const restored = restoreFile(deleted.model, initial.file.id);
  assert.equal(restored.ok, true);
  assert.equal(restored.file.status, 'valid');
  assert.equal(storageStats(restored.model).invalidPages, 0);
  assert.ok(restored.file.bytes instanceof Uint8Array);
});
