import test from 'node:test';
import assert from 'node:assert/strict';
import { cellThresholdV, enduranceEstimate, fnChargeIncrementFc, fnCurrentDensity, oxideField, readSLCBlock, retentionCharge, runFnErase, runIsppProgram } from '../apps/web/src/core/flash.js';

test('oxide divider and FN constants reproduce the documented reference values', () => {
  const field = oxideField(10, 9);
  assert.ok(Math.abs(field.oxideDropV - 6.336) < 1e-12);
  assert.ok(Math.abs(field.fieldVm - 7.04e8) < 1e-3);
  assert.ok(Math.abs(fnCurrentDensity(2e9, 3.1) - 15942.4554946) < 1e-4);
});

test('FN current grows with field and decreases with barrier height', () => {
  assert.equal(fnCurrentDensity(0, 3.1), 0);
  assert.ok(fnCurrentDensity(2.5e9, 3.1) > fnCurrentDensity(2e9, 3.1));
  assert.ok(fnCurrentDensity(2e9, 3.5) < fnCurrentDensity(2e9, 3.1));
});

test('integrated FN charge has consistent area and time units', () => {
  const fieldVm = 2e9, areaUm2 = .02, pulseWidthUs = 5;
  const transfer = fnChargeIncrementFc({ fieldVm, areaUm2, pulseWidthUs, barrierEv: 3.1 });
  const expectedC = fnCurrentDensity(fieldVm, 3.1) * areaUm2 * 1e-12 * pulseWidthUs * 1e-6;
  assert.ok(Math.abs(transfer.chargeC - expectedC) <= expectedC * 1e-12);
  assert.ok(Math.abs(transfer.chargeFc - expectedC * 1e15) <= expectedC * 1e3);
});

test('ISPP applies rising pulses and stops only after threshold verify', () => {
  const result = runIsppProgram({ oxideNm: 9, vpgmStartV: 14, vpgmMaxV: 24, vpgmStepV: .5, pulseWidthUs: 5, areaUm2: .02, verifyVtV: 1.5 });
  assert.ok(result.verified);
  assert.ok(result.pulses.length > 1);
  assert.ok(result.pulses.every((pulse, index) => index === 0 || pulse.voltageV > result.pulses[index - 1].voltageV));
  assert.ok(result.pulses.at(-1).vtV >= 1.5);
  assert.ok(result.pulses.slice(0, -1).every(pulse => pulse.vtV < 1.5));
  const thicker = runIsppProgram({ oxideNm: 12, vpgmStartV: 14, vpgmMaxV: 24, pulseWidthUs: 5, areaUm2: .02 });
  assert.ok(thicker.chargeFc < result.chargeFc);
});

test('reverse-field erase removes charge; SLC reads use a reference voltage', () => {
  const initial = runIsppProgram({ oxideNm: 9 }).chargeFc;
  const erased = runFnErase({ initialChargeFc: initial, oxideNm: 9, eraseVoltageV: 24, pulseWidthUs: 5, areaUm2: .02 });
  assert.ok(erased.chargeFc < initial);
  assert.ok(erased.erased);
  assert.ok(erased.pulses.length > 0);
  const sensed = readSLCBlock([{ chargeFc: initial }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }], { readReferenceV: 1.2, peCycles: 0, seed: 17 });
  assert.equal(sensed.bits, '01111111');
  assert.equal(sensed.cells[0].logicalState, 'programmed');
  const worn = readSLCBlock([{ chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }, { chargeFc: 0 }], { readReferenceV: 1.2, peCycles: 10000, seed: 17 });
  const repeat = readSLCBlock(Array.from({length:8},()=>({chargeFc:0})), { readReferenceV: 1.2, peCycles: 10000, seed: 17 });
  assert.notEqual(worn.bits, '11111111');
  assert.equal(worn.bits, repeat.bits);
});

test('wear increases threshold spread and accelerates illustrative retention loss', () => {
  const fresh = enduranceEstimate(0), worn = enduranceEstimate(5000);
  assert.ok(worn.thresholdSigmaV > fresh.thresholdSigmaV);
  assert.ok(worn.defectDensityM3 > fresh.defectDensityM3);
  assert.ok(worn.retentionMultiplier > fresh.retentionMultiplier);
  const freshCharge = retentionCharge({ q0: .42, years: 5, temperatureK: 373, cycles: 0, defects: 1e16 });
  const wornCharge = retentionCharge({ q0: .42, years: 5, temperatureK: 373, cycles: 5000, defects: 1e16 });
  assert.ok(wornCharge.chargeFc < freshCharge.chargeFc);
  assert.ok(cellThresholdV(wornCharge.chargeFc) >= .45);
});
