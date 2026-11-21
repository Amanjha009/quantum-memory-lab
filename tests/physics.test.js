import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTunneling, injectBitErrors, secdedDecode, secdedEncodeNibble, secdedRecover, sha256 } from '../apps/web/src/core/physics.js';

test('lossless scattering probabilities stay bounded and conserve flux', () => {
  const r = calculateTunneling({ gateV: 10, oxideNm: 9, barrierEv: 3.1, energyEv: 1 });
  assert.ok(r.transmission >= 0 && r.transmission <= 1);
  assert.ok(r.reflection >= 0 && r.reflection <= 1);
  assert.ok(Math.abs(r.transmission + r.reflection - 1) < 1e-12);
  assert.ok(r.points.every(p => p.density >= 0 && Number.isFinite(p.density)));
  for (const gateV of [0, 5, 10, 20]) for (const oxideNm of [5, 9, 15]) for (const energyEv of [.1, 1, 3, 5]) {
    const sample = calculateTunneling({ gateV, oxideNm, energyEv });
    assert.ok(sample.transmission >= 0 && sample.transmission <= 1);
    assert.ok(sample.reflection >= 0 && sample.reflection <= 1);
    assert.ok(sample.fluxResidual < 1e-8);
  }
});

test('WKB decreases as barrier thickness increases', () => {
  const thin = calculateTunneling({ gateV: 5, oxideNm: 5, barrierEv: 3, energyEv: .5 });
  const thick = calculateTunneling({ gateV: 5, oxideNm: 15, barrierEv: 3, energyEv: .5 });
  assert.ok(thick.wkb < thin.wkb);
});

test('Fowler–Nordheim current uses the calculated oxide field', () => {
  const low = calculateTunneling({ gateV: 8, oxideNm: 9, barrierEv: 3.1, energyEv: 1 });
  const high = calculateTunneling({ gateV: 16, oxideNm: 9, barrierEv: 3.1, energyEv: 1 });
  assert.ok(high.fieldVm > low.fieldVm);
  assert.ok(high.fnCurrent > low.fnCurrent);
});

test('SECDED round-trips each nibble and corrects any single-bit error', () => {
  for (let n = 0; n < 16; n++) {
    const code = secdedEncodeNibble(n);
    assert.equal(secdedDecode(code).value, n);
    for (let bit = 0; bit < 8; bit++) {
      const damaged = code.slice(); damaged[bit] ^= 1;
      const decoded = secdedDecode(damaged);
      assert.equal(decoded.status, 'corrected');
      assert.equal(decoded.value, n);
    }
  }
});

test('SECDED detects every two-bit error in a codeword', () => {
  const clean = secdedEncodeNibble(0b1010);
  for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
    const damaged = clean.slice(); damaged[a] ^= 1; damaged[b] ^= 1;
    assert.equal(secdedDecode(damaged).status, 'uncorrectable');
  }
});

test('SHA-256 uses the actual byte sequence', async () => {
  assert.equal(await sha256(new TextEncoder().encode('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('seeded error injection is reproducible and keeps the source unchanged', () => {
  const source = new Uint8Array([0, 1, 2, 3, 4]);
  const one = injectBitErrors(source, .1, 123);
  const two = injectBitErrors(source, .1, 123);
  assert.deepEqual(one.corrupted, two.corrupted);
  assert.deepEqual(one.flips, two.flips);
  assert.deepEqual(source, new Uint8Array([0, 1, 2, 3, 4]));
});

test('SECDED recovers bytes with one error per codeword and flags two in one codeword', () => {
  const source = new Uint8Array([0xa5]);
  const singleEachNibble = source.slice(); singleEachNibble[0] ^= 0b10001000;
  const recovered = secdedRecover(source, singleEachNibble);
  assert.deepEqual(recovered.bytes, source);
  assert.equal(recovered.corrected, 2);
  assert.equal(recovered.uncorrectable, 0);
  const doubleInNibble = source.slice(); doubleInNibble[0] ^= 0b11000000;
  const detected = secdedRecover(source, doubleInNibble);
  assert.equal(detected.uncorrectable, 1);
});
