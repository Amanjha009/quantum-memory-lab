import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPERIMENTS_LIST, CHALLENGES_LIST } from '../apps/web/src/core/guidedData.js';
import { calculateTunneling } from '../apps/web/src/core/physics.js';

test('guided experiments suite contains all 10 documented curriculum topics', () => {
  assert.equal(EXPERIMENTS_LIST.length, 10, 'Must have exactly 10 guided experiments');

  EXPERIMENTS_LIST.forEach((exp, idx) => {
    assert.equal(exp.id, idx + 1, `Experiment index ${idx + 1} ID mismatch`);
    assert.ok(exp.title && exp.title.length > 5, `Experiment ${exp.id} missing title`);
    assert.ok(exp.category && exp.category.length > 3, `Experiment ${exp.id} missing category`);
    assert.ok(exp.objective && exp.objective.length > 10, `Experiment ${exp.id} missing objective`);
    assert.ok(exp.background && exp.background.length > 20, `Experiment ${exp.id} missing background`);
    assert.ok(Array.isArray(exp.steps) && exp.steps.length >= 3, `Experiment ${exp.id} must have >= 3 steps`);
    assert.ok(exp.expected && exp.expected.length > 10, `Experiment ${exp.id} missing expected observation`);
    assert.ok(exp.conclusion && exp.conclusion.length > 10, `Experiment ${exp.id} missing conclusion`);

    // Assessment validation
    assert.ok(exp.assessment, `Experiment ${exp.id} missing assessment`);
    assert.ok(exp.assessment.question && exp.assessment.question.length > 10, `Experiment ${exp.id} question missing`);
    assert.ok(Array.isArray(exp.assessment.options) && exp.assessment.options.length >= 3, `Experiment ${exp.id} requires >= 3 options`);
    assert.ok(
      exp.assessment.correctIndex >= 0 && exp.assessment.correctIndex < exp.assessment.options.length,
      `Experiment ${exp.id} correctIndex out of range`
    );
  });
});

test('guided experiments default parameters compute valid physical quantities', () => {
  EXPERIMENTS_LIST.forEach((exp) => {
    if (exp.defaultParams) {
      const { oxideNm, barrierEv, energyEv, gateV } = exp.defaultParams;
      const physics = calculateTunneling({
        oxideNm,
        barrierEv,
        energyEv,
        gateV,
        effectiveMass: 0.5,
      });

      assert.ok(Number.isFinite(physics.fieldVm), `Oxide field must be finite for exp ${exp.id}`);
      assert.ok(physics.fieldVm >= 0, `Oxide field must be non-negative for exp ${exp.id}`);
      assert.ok(physics.wkb >= 0 && physics.wkb <= 1.0, `WKB transmission must be in [0, 1] for exp ${exp.id}`);
      assert.ok(Number.isFinite(physics.fnCurrent), `FN current density must be finite for exp ${exp.id}`);
      assert.ok(physics.fnCurrent >= 0, `FN current density must be non-negative for exp ${exp.id}`);
    }
  });
});

test('engineering challenges list is populated with valid thresholds', () => {
  assert.ok(CHALLENGES_LIST.length >= 2, 'Must have at least 2 engineering challenges');
  CHALLENGES_LIST.forEach((ch) => {
    assert.ok(ch.id, 'Challenge must have ID');
    assert.ok(ch.title, 'Challenge must have title');
    assert.ok(ch.objective, 'Challenge must have objective');
    assert.ok(ch.hint, 'Challenge must have hint');
  });
});
