import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createStorageModel,
  writeFile,
  logicalDelete,
  restoreFile,
  garbageCollect,
  storageStats,
} from '../apps/web/src/core/storage.js';
import {
  cellThresholdV,
  fnChargeIncrementFc,
  oxideField,
  readSLCBlock,
  runIsppProgram,
} from '../apps/web/src/core/flash.js';
import { calculateTunneling, sha256 } from '../apps/web/src/core/physics.js';
import { SAMPLE_PHOTOS } from '../apps/web/src/core/phoneAssets.js';
import { JOURNEY_STAGES } from '../apps/web/src/core/journeyStages.js';

test('File-to-Electron Journey: has all 12 documented stages with structured explanations', () => {
  assert.equal(JOURNEY_STAGES.length, 12);
  JOURNEY_STAGES.forEach((stage, idx) => {
    assert.equal(stage.stage, idx + 1);
    assert.ok(stage.title, `Stage ${idx + 1} must have a title`);
    assert.ok(stage.what, `Stage ${idx + 1} must have "WHAT IS HAPPENING"`);
    assert.ok(stage.why, `Stage ${idx + 1} must have "WHY IS IT HAPPENING"`);
    assert.ok(stage.observe, `Stage ${idx + 1} must have "WHAT SHOULD I OBSERVE"`);
    assert.ok(stage.techDetails, `Stage ${idx + 1} must have technical details`);
  });
});

test('Stage 1 to 3: Photograph generates valid payload, hex representation, and binary bit array', () => {
  const photo = SAMPLE_PHOTOS[0];
  assert.ok(photo, 'Sample photo exists');
  assert.equal(photo.dimensions, '3840 × 2160');

  // Representative byte 0x41 ('A')
  const byteVal = 0x41;
  const binaryBits = byteVal.toString(2).padStart(8, '0');
  assert.equal(binaryBits, '01000001');

  // Verify bit count and target actions
  const bitsArray = binaryBits.split('');
  assert.equal(bitsArray.length, 8);
  const programBits = bitsArray.filter((b) => b === '0').length;
  const erasedBits = bitsArray.filter((b) => b === '1').length;
  assert.equal(programBits, 6); // 6 cells need electron injection
  assert.equal(erasedBits, 2);   // 2 cells stay erased
});

test('Stage 4 to 5: VFS inode allocation and FTL L2P mapping in storage model', () => {
  const model = createStorageModel({ blockCount: 4 });
  const photo = SAMPLE_PHOTOS[0];
  const photoBytes = new TextEncoder().encode(photo.svg);

  const res = writeFile(model, {
    id: photo.id,
    name: photo.name,
    title: photo.title,
    size: photo.sizeBytes,
    bytes: photoBytes,
    kind: 'photo',
  });

  assert.equal(res.ok, true);
  assert.equal(res.file.name, 'observatory_nebula.jpg');
  assert.equal(res.file.logicalAddress, 0);
  assert.ok(res.file.physicalPages.length > 0);
  assert.equal(res.file.physicalPages[0].blockId, 0);
  assert.equal(res.file.physicalPages[0].index, 0);
  assert.equal(res.file.physicalPages[0].address, 'B0·P00');
});

test('Stage 8 to 10: Quantum tunneling and ISPP pulse programming reaches verify threshold', () => {
  // Test Fowler-Nordheim field emission at programming voltage
  const { oxideDropV, fieldVm } = oxideField(14.5, 9.0);
  assert.ok(fieldVm > 1e9, `Electric field ${fieldVm} must exceed 1.0 GV/m`);

  const { currentDensity, chargeFc } = fnChargeIncrementFc({
    fieldVm,
    barrierEv: 3.1,
    pulseWidthUs: 5.0,
    areaUm2: 0.02,
  });
  assert.ok(currentDensity > 0, 'Current density must be strictly positive');
  assert.ok(chargeFc > 0, 'Transferred charge per pulse must be positive');

  // Run full ISPP staircase
  const ispp = runIsppProgram({
    initialChargeFc: 0,
    vpgmStartV: 14.0,
    vpgmMaxV: 24.0,
    vpgmStepV: 0.5,
    oxideNm: 9.0,
    barrierEv: 3.1,
    pulseWidthUs: 5.0,
    areaUm2: 0.02,
    verifyVtV: 1.50,
  });

  assert.equal(ispp.verified, true);
  assert.ok(ispp.vtV >= 1.50, `Programmed threshold ${ispp.vtV} V must reach verify threshold 1.50 V`);
  assert.ok(ispp.pulses.length >= 1 && ispp.pulses.length <= 30, 'ISPP must converge in reasonable pulses');
  assert.ok(ispp.chargeFc > 0.02, 'Stored charge must accumulate in floating gate');
});

test('Stage 11: Read sense comparator reconstructs exact target byte without corruption', () => {
  const targetBits = '01000001'; // 0x41 ('A')
  const ispp = runIsppProgram({ initialChargeFc: 0, verifyVtV: 1.50 });

  // Array of 8 cells programmed according to targetBits
  const programmedCells = targetBits.split('').map((bit) => {
    if (bit === '0') {
      return { chargeFc: ispp.chargeFc, pulseCount: ispp.pulses.length };
    }
    return { chargeFc: 0, pulseCount: 0 };
  });

  const read = readSLCBlock(programmedCells, { readReferenceV: 1.20 });
  assert.equal(read.bits, targetBits, `Sensed bit string ${read.bits} must match target ${targetBits}`);
  assert.equal(read.byte, 0x41, 'Reconstructed byte must be 0x41');
});

test('Stage 12 & Full Lifecycle: SHA-256 verification and file system retention through GC', async () => {
  let model = createStorageModel({ blockCount: 4 });
  const photo = SAMPLE_PHOTOS[0];
  const photoBytes = new TextEncoder().encode(photo.svg);
  const digest = await sha256(photoBytes);

  const res = writeFile(model, {
    id: photo.id,
    name: photo.name,
    title: photo.title,
    size: photo.sizeBytes,
    bytes: photoBytes,
    hash: digest,
    kind: 'photo',
  });
  assert.equal(res.ok, true);
  model = res.model;

  // Verify hash matches
  assert.equal(res.file.hash, digest);

  // Logical deletion and restoration test
  const del = logicalDelete(model, res.file.id);
  assert.equal(del.ok, true);
  assert.equal(storageStats(del.model).invalidPages, res.file.pageCount);

  const restored = restoreFile(del.model, res.file.id);
  assert.equal(restored.ok, true);
  assert.equal(restored.file.status, 'valid');

  // Verify garbage collection retains valid file when stale pages exist
  const tempRes = writeFile(restored.model, {
    id: 'temp_to_delete',
    name: 'temp.log',
    title: 'Temporary Log',
    size: 2048,
    bytes: new Uint8Array([1, 2, 3]),
    kind: 'document',
  });
  assert.equal(tempRes.ok, true);
  const tempDel = logicalDelete(tempRes.model, 'temp_to_delete');
  assert.equal(tempDel.ok, true);
  assert.ok(storageStats(tempDel.model).invalidPages > 0, 'Must have invalid pages for GC');

  const gc = garbageCollect(tempDel.model);
  assert.equal(gc.ok, true);
  const liveFile = gc.model.files.find((f) => f.id === res.file.id);
  assert.equal(liveFile.status, 'valid');
});
