// Browser-side numerical model. Energies are eV, distance is nm, field is V/m.
import { fnCurrentDensity, retentionCharge } from './flash.js';
const HBAR = 1.054571817e-34;
const QE = 1.602176634e-19;
const ME = 9.1093837015e-31;

export function potentialAt(xNm, oxideNm, barrierEv, fieldVm) {
  const x = Math.max(0, Math.min(oxideNm, xNm));
  return Math.max(0, barrierEv - fieldVm * x * 1e-9);
}

export function calculateTunneling({ gateV = 10, oxideNm = 9, barrierEv = 3.1, energyEv = 1, effectiveMass = 0.5 }) {
  const oxideDropV = Math.max(0, 0.72 * (gateV - 1.2));
  const fieldVm = oxideDropV / Math.max(oxideNm, 0.1) * 1e9;
  const count = 180;
  const dxM = oxideNm * 1e-9 / count;
  const potential = Array.from({ length: count + 1 }, (_, i) => potentialAt(i * oxideNm / count, oxideNm, barrierEv, fieldVm));
  // The incident and transmitted leads are both referenced to the silicon band edge (V=0).
  const rightEnergy = energyEv;
  const a = new Float64Array(count + 1), b = new Float64Array(count + 1), c = new Float64Array(count + 1);
  const rhsR = new Float64Array(count + 1), rhsI = new Float64Array(count + 1);
  const d = dxM;
  // Discretized stationary Schrödinger equation with incoming + reflected waves at x=0.
  for (let i = 1; i < count; i++) {
    a[i] = 1; c[i] = 1;
    b[i] = -2 + 2 * effectiveMass * ME * d * d * (energyEv - potential[i]) * QE / (HBAR * HBAR);
  }
  const thetaL = Math.acos(Math.max(-1, Math.min(1, 1 - effectiveMass * ME * energyEv * QE * d * d / (HBAR * HBAR))));
  b[0] = -Math.cos(thetaL); c[0] = 1;
  rhsR[0] = Math.cos(thetaL) - Math.cos(thetaL);
  rhsI[0] = 2 * Math.sin(thetaL);
  const thetaR = Math.acos(Math.max(-1, Math.min(1, 1 - effectiveMass * ME * rightEnergy * QE * d * d / (HBAR * HBAR))));
  a[count] = 1; b[count] = -Math.cos(thetaR);
  // Solve two real tridiagonal systems (complex right-hand side).
  function solve(rhs) {
    const aa = a.slice(), bb = b.slice(), cc = c.slice(), rr = rhs.slice();
    // Boundary rows include complex outgoing-wave terms; solve using complex arithmetic below instead.
    return { aa, bb, cc, rr };
  }
  // Complex tridiagonal Thomas algorithm.
  const lowerR = new Float64Array(count + 1), lowerI = new Float64Array(count + 1);
  const diagR = new Float64Array(count + 1), diagI = new Float64Array(count + 1);
  const upperR = new Float64Array(count + 1), upperI = new Float64Array(count + 1);
  const br = new Float64Array(count + 1), bi = new Float64Array(count + 1);
  for (let i = 0; i <= count; i++) { lowerR[i] = a[i]; upperR[i] = c[i]; diagR[i] = b[i]; br[i] = rhsR[i]; bi[i] = rhsI[i]; }
  diagI[0] = Math.sin(thetaL); diagI[count] = Math.sin(thetaR);
  for (let i = 1; i <= count; i++) {
    const den = diagR[i - 1] ** 2 + diagI[i - 1] ** 2;
    const mr = (lowerR[i] * diagR[i - 1] + lowerI[i] * diagI[i - 1]) / den;
    const mi = (lowerI[i] * diagR[i - 1] - lowerR[i] * diagI[i - 1]) / den;
    diagR[i] -= mr * upperR[i - 1] - mi * upperI[i - 1];
    diagI[i] -= mr * upperI[i - 1] + mi * upperR[i - 1];
    br[i] -= mr * br[i - 1] - mi * bi[i - 1];
    bi[i] -= mr * bi[i - 1] + mi * br[i - 1];
  }
  const pr = new Float64Array(count + 1), pi = new Float64Array(count + 1);
  for (let i = count; i >= 0; i--) {
    let xr = br[i], xi = bi[i];
    if (i < count) { xr -= upperR[i] * pr[i + 1] - upperI[i] * pi[i + 1]; xi -= upperR[i] * pi[i + 1] + upperI[i] * pr[i + 1]; }
    const den = diagR[i] ** 2 + diagI[i] ** 2;
    pr[i] = (xr * diagR[i] + xi * diagI[i]) / den;
    pi[i] = (xi * diagR[i] - xr * diagI[i]) / den;
  }
  const rr = pr[0] - 1, ri = pi[0];
  const t2 = pr[count] ** 2 + pi[count] ** 2;
  const R = Math.min(1, Math.max(0, rr * rr + ri * ri));
  const T = Math.max(0, (Math.sin(thetaR) / Math.sin(thetaL)) * t2);
  const fluxResidual = Math.abs(R + T - 1);
  const transmission = Math.min(1, T), reflection = Math.min(1, R);
  const points = Array.from({ length: count + 1 }, (_, i) => ({ x: i * oxideNm / count, v: potential[i], re: pr[i], im: pi[i], density: pr[i] ** 2 + pi[i] ** 2 }));
  const forbidden = points.filter(p => p.v > energyEv);
  const wkbIntegral = forbidden.reduce((sum, p, i) => i === 0 ? sum : sum + (Math.sqrt(Math.max(0, forbidden[i - 1].v - energyEv)) + Math.sqrt(Math.max(0, p.v - energyEv))) / 2 * (p.x - forbidden[i - 1].x) * Math.sqrt(2 * effectiveMass * ME * QE) * 1e-9 / HBAR, 0);
  const wkb = Math.exp(Math.max(-745, Math.min(0, -2 * wkbIntegral)));
  const phiJ = barrierEv * QE;
  const fn = fnCurrentDensity(fieldVm, barrierEv);
  return { oxideDropV, fieldVm, transmission, reflection, fluxResidual, wkb, fnCurrent: fn, points, phiJ, energyEv };
}

export function retention({ q0 = 0.42, years = 1, temperatureK = 300, cycles = 0, defects = 1e16, fieldStressGVm = 0 }) {
  const result = retentionCharge({ q0, years, temperatureK, cycles, defects, fieldStressGVm });
  return { charge: result.chargeFc, loss: result.lossFraction, gamma: result.gammaPerS, vtShift: result.vtShiftV, fieldFactor: result.fieldFactor };
}

export function secdedEncodeNibble(n) {
  const d = [n >> 3 & 1, n >> 2 & 1, n >> 1 & 1, n & 1];
  const b = new Uint8Array(8);
  b[2] = d[0]; b[4] = d[1]; b[5] = d[2]; b[6] = d[3];
  b[0] = b[2] ^ b[4] ^ b[6]; b[1] = b[2] ^ b[5] ^ b[6]; b[3] = b[4] ^ b[5] ^ b[6];
  b[7] = b.slice(0, 7).reduce((x, y) => x ^ y, 0);
  return b;
}

export function secdedDecode(code) {
  const b = Uint8Array.from(code);
  const s1 = b[0] ^ b[2] ^ b[4] ^ b[6], s2 = b[1] ^ b[2] ^ b[5] ^ b[6], s4 = b[3] ^ b[4] ^ b[5] ^ b[6];
  const syndrome = s1 + 2 * s2 + 4 * s4, overall = b.reduce((x, y) => x ^ y, 0);
  let status = 'clean';
  if (syndrome && overall) { b[syndrome - 1] ^= 1; status = 'corrected'; }
  else if (!syndrome && overall) { b[7] ^= 1; status = 'corrected'; }
  else if (syndrome && !overall) status = 'uncorrectable';
  const value = (b[2] << 3) | (b[4] << 2) | (b[5] << 1) | b[6];
  return { bits: b, syndrome, overallParity: overall, status, value };
}

export function secdedRecover(original, retrieved) {
  const source = Uint8Array.from(original), read = Uint8Array.from(retrieved);
  if (source.length !== read.length) throw new RangeError('Original and retrieved data must have equal length.');
  const output = new Uint8Array(read), dataPositions = [2, 4, 5, 6];
  let corrected = 0, uncorrectable = 0;
  for (let i = 0; i < read.length; i++) {
    let rebuilt = 0;
    for (const shift of [4, 0]) {
      const originalNibble = (source[i] >> shift) & 15;
      const code = secdedEncodeNibble(originalNibble);
      const lo = shift === 4 ? 4 : 0, hi = shift === 4 ? 7 : 3;
      for (let bit = lo; bit <= hi; bit++) {
        if (((source[i] ^ read[i]) >> bit) & 1) {
          const dataIndex = shift === 4 ? 7 - bit : 3 - bit;
          code[dataPositions[dataIndex]] ^= 1;
        }
      }
      const decoded = secdedDecode(code);
      if (decoded.status === 'corrected') corrected++;
      if (decoded.status === 'uncorrectable') { uncorrectable++; rebuilt = (rebuilt << 4) | ((read[i] >> shift) & 15); }
      else rebuilt = (rebuilt << 4) | decoded.value;
    }
    output[i] = rebuilt;
  }
  return { bytes: output, corrected, uncorrectable };
}

export function injectBitErrors(bytes, rate = .015, seed = 37) {
  const corrupted = Uint8Array.from(bytes), flips = [];
  let state = (Number(seed) >>> 0) || 1;
  const probability = Math.max(0, Math.min(.1, Number(rate) || 0));
  for (let bit = 0; bit < corrupted.length * 8; bit++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    if (state / 4294967296 < probability) {
      corrupted[bit >> 3] ^= 1 << (7 - (bit & 7));
      flips.push(bit);
    }
  }
  return { corrupted, flips, seed: Number(seed) >>> 0, rate: probability };
}

export async function sha256(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
