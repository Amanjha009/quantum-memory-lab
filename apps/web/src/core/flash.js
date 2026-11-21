// Educational floating-gate NAND operations. SI units are used internally.
// FN current is integrated over an effective cell area and pulse width to
// estimate transferred charge; the effective area is a teaching parameter.
const QE = 1.602176634e-19;
const KB = 1.380649e-23;
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;
const FN_A = 1.541434e-6; // A eV V^-2
const FN_B = 6.83089e9; // V m^-1 eV^-3/2

export function oxideField(gateVoltageV, oxideNm, coupling = 0.72, offsetV = 1.2) {
  const thicknessM = Math.max(0.1, Number(oxideNm)) * 1e-9;
  const oxideDropV = Math.max(0, coupling * (Number(gateVoltageV) - offsetV));
  return { oxideDropV, fieldVm: oxideDropV / thicknessM };
}

export function fnCurrentDensity(fieldVm, barrierEv = 3.1) {
  const field = Math.max(0, Number(fieldVm));
  const barrier = Math.max(0.1, Number(barrierEv));
  if (!field) return 0;
  const exponent = Math.min(745, FN_B * barrier ** 1.5 / field);
  return FN_A * field * field / barrier * Math.exp(-exponent);
}

export function fnChargeIncrementFc({ fieldVm, barrierEv = 3.1, pulseWidthUs = 5, areaUm2 = 0.02 }) {
  const currentDensity = fnCurrentDensity(fieldVm, barrierEv);
  const areaM2 = Math.max(0, Number(areaUm2)) * 1e-12;
  const durationS = Math.max(0, Number(pulseWidthUs)) * 1e-6;
  const chargeC = currentDensity * areaM2 * durationS;
  return { currentDensity, chargeC, chargeFc: chargeC * 1e15 };
}

export function cellThresholdV(chargeFc, { erasedVtV = 0.45, capacitanceFf = 0.25 } = {}) {
  return erasedVtV + Math.max(0, Number(chargeFc)) / Math.max(1e-6, capacitanceFf);
}

export function runIsppProgram({
  initialChargeFc = 0,
  vpgmStartV = 14,
  vpgmMaxV = 24,
  vpgmStepV = 0.5,
  oxideNm = 9,
  barrierEv = 3.1,
  pulseWidthUs = 5,
  areaUm2 = 0.02,
  verifyVtV = 1.5,
  erasedVtV = 0.45,
  capacitanceFf = 0.25,
  coupling = 0.72,
  offsetV = 1.2,
  maxPulses = 128,
}) {
  let chargeFc = Math.max(0, Number(initialChargeFc));
  const pulses = [];
  const step = Math.max(0.05, Number(vpgmStepV));
  const start = Math.max(0, Number(vpgmStartV));
  const max = Math.max(start, Number(vpgmMaxV));
  for (let voltage = start, index = 1; voltage <= max + 1e-9 && index <= maxPulses; voltage += step, index++) {
    const { oxideDropV, fieldVm } = oxideField(voltage, oxideNm, coupling, offsetV);
    const { currentDensity, chargeFc: deltaChargeFc } = fnChargeIncrementFc({ fieldVm, barrierEv, pulseWidthUs, areaUm2 });
    chargeFc += deltaChargeFc;
    const vtV = cellThresholdV(chargeFc, { erasedVtV, capacitanceFf });
    const verified = vtV >= verifyVtV;
    pulses.push({ index, voltageV: voltage, oxideDropV, fieldVm, currentDensity, deltaChargeFc, chargeFc, vtV, verified });
    if (verified) break;
  }
  return { chargeFc, vtV: cellThresholdV(chargeFc, { erasedVtV, capacitanceFf }), verified: chargeFc >= (verifyVtV - erasedVtV) * capacitanceFf, pulses };
}

export function runFnErase({
  initialChargeFc = 0,
  eraseVoltageV = 24,
  oxideNm = 9,
  barrierEv = 3.1,
  pulseWidthUs = 5,
  areaUm2 = 0.02,
  erasedVtV = 0.45,
  capacitanceFf = 0.25,
  coupling = 0.72,
  offsetV = 1.2,
  maxPulses = 64,
}) {
  let chargeFc = Math.max(0, Number(initialChargeFc));
  const pulses = [];
  const { oxideDropV, fieldVm } = oxideField(Math.abs(eraseVoltageV), oxideNm, coupling, offsetV);
  const transfer = fnChargeIncrementFc({ fieldVm, barrierEv, pulseWidthUs, areaUm2 });
  for (let index = 1; index <= maxPulses && chargeFc > 1e-6; index++) {
    const removedFc = Math.min(chargeFc, transfer.chargeFc);
    chargeFc -= removedFc;
    pulses.push({ index, eraseVoltageV: -Math.abs(eraseVoltageV), oxideDropV, fieldVm, currentDensity: transfer.currentDensity, removedFc, chargeFc, vtV: cellThresholdV(chargeFc, { erasedVtV, capacitanceFf }) });
  }
  return { chargeFc, vtV: cellThresholdV(chargeFc, { erasedVtV, capacitanceFf }), erased: chargeFc <= 1e-6, pulses, currentDensity: transfer.currentDensity, fieldVm };
}

export function enduranceEstimate(peCycles, maxCycles = 10000) {
  const cycles = Math.max(0, Number(peCycles));
  const limit = Math.max(1, Number(maxCycles));
  const wearFraction = Math.min(1, cycles / limit);
  return {
    peCycles: cycles,
    maxCycles: limit,
    wearFraction,
    remainingFraction: Math.max(0, 1 - wearFraction),
    thresholdSigmaV: 0.025 + 0.22 * wearFraction ** 0.8,
    thresholdWindowV: 2.0 - 1.4 * wearFraction,
    defectDensityM3: 1e16 + 4e17 * wearFraction ** 1.35,
    retentionMultiplier: 1 + 8 * wearFraction,
  };
}

export function readSLCBlock(cells, { readReferenceV = 1.2, peCycles = 0, maxCycles = 10000, seed = 17, erasedVtV = 0.45, capacitanceFf = 0.25 } = {}) {
  const wear = enduranceEstimate(peCycles, maxCycles);
  const readCells = cells.map((cell, index) => {
    // A reproducible, bounded threshold spread makes wear effects inspectable.
    let x = (Math.imul((Number(seed) + index + 1) >>> 0, 0x45d9f3b) ^ (peCycles >>> 0)) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x45d9f3b) >>> 0;
    x = (x ^ (x >>> 16)) >>> 0;
    const nominalVtV = cellThresholdV(cell.chargeFc, { erasedVtV, capacitanceFf });
    const programmed = nominalVtV >= erasedVtV + 0.4;
    const wearShift = (programmed ? -1 : 1) * 0.7 * wear.wearFraction;
    const offset = (x / 0xffffffff * 2 - 1) * wear.thresholdSigmaV + wearShift;
    const measuredVtV = nominalVtV + offset;
    const bit = measuredVtV >= readReferenceV ? 0 : 1;
    return { index, nominalVtV, measuredVtV, offsetV: offset, bit, logicalState: bit === 0 ? 'programmed' : 'erased' };
  });
  return { bits: readCells.map(cell => cell.bit).join(''), byte: parseInt(readCells.map(cell => cell.bit).join(''), 2), cells: readCells, wear };
}

export function retentionCharge({ q0 = 0.42, years = 1, temperatureK = 300, cycles = 0, defects = 1e16, fieldStressGVm = 0 }) {
  const temp = Math.min(450, Math.max(250, Number(temperatureK)));
  const timeS = Math.max(0, Number(years)) * SECONDS_PER_YEAR;
  const wear = enduranceEstimate(cycles);
  const defectFactor = 1 + Math.max(0, Number(defects)) / 8e17;
  const fieldFactor = 1 + 0.5 * Math.max(0, Number(fieldStressGVm) / 2) ** 2;
  const gamma = 850 * Math.exp(-(0.72 * QE) / (KB * temp)) * defectFactor * wear.retentionMultiplier * fieldFactor;
  const chargeFc = Math.max(0, Number(q0)) * Math.exp(Math.max(-745, -gamma * timeS));
  return { chargeFc, lossFraction: q0 > 0 ? 1 - chargeFc / q0 : 0, gammaPerS: gamma, vtShiftV: -0.35 * chargeFc, wear, fieldFactor };
}
