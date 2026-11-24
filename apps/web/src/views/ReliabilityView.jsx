import React, { useState, useMemo } from 'react';
import { cellThresholdV, enduranceEstimate, retentionCharge } from '../core/flash.js';

export default function ReliabilityView({
  nandCells = [],
  setNandCells,
  selectedCell = 0,
  blockCycles = 0,
  setBlockCycles,
  readReferenceV = 1.2,
  onReadBlock,
}) {
  const [activeSubTab, setActiveSubTab] = useState('endurance'); // 'endurance' | 'retention'
  
  // Endurance state
  const [cyclesToAdd, setCyclesToAdd] = useState(250);
  
  // Retention state
  const [years, setYears] = useState(5.0);
  const [temperatureK, setTemperatureK] = useState(300);
  const [fieldStressGVm, setFieldStressGVm] = useState(0.5);
  const [defectDensity, setDefectDensity] = useState(1e16);

  // Derived endurance model outputs
  const wear = useMemo(() => enduranceEstimate(blockCycles), [blockCycles]);

  // Active cell charge and retention calculation
  const targetCell = nandCells[selectedCell] || { chargeFc: 0.42 };
  const initialQ = targetCell.retentionBaseChargeFc ?? targetCell.chargeFc ?? 0.42;

  const retentionResult = useMemo(() => {
    return retentionCharge({
      q0: initialQ,
      years,
      temperatureK,
      cycles: blockCycles,
      defects: defectDensity,
      fieldStressGVm,
    });
  }, [initialQ, years, temperatureK, blockCycles, defectDensity, fieldStressGVm]);

  const projectedVt = cellThresholdV(retentionResult.chargeFc);
  const readMargin = projectedVt - readReferenceV;

  const handleApplyWear = () => {
    setBlockCycles((prev) => prev + cyclesToAdd);
  };

  const handleResetWear = () => {
    setBlockCycles(0);
  };

  const handleApplyRetentionToBlock = () => {
    const updated = nandCells.map((cell) => {
      const q0 = cell.retentionBaseChargeFc ?? cell.chargeFc;
      const aged = retentionCharge({
        q0,
        years,
        temperatureK,
        cycles: blockCycles,
        defects: defectDensity,
        fieldStressGVm,
      });
      return {
        ...cell,
        chargeFc: aged.chargeFc,
      };
    });
    setNandCells(updated);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="qml-badge qml-badge-amber">MODULE 05 · DEVICE RELIABILITY</span>
          <span className="qml-badge qml-badge-cyan">ACCELERATED DEGRADATION MODELING</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Retention & Endurance Laboratory
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, maxWidth: '780px' }}>
          Explore the physical limits of non-volatile solid-state storage. Model tunnel oxide defect generation under repetitive
          Program/Erase (P/E) cycling stress, and calculate multi-year charge leakage using Arrhenius thermal activation.
        </p>
      </div>

      {/* Subtab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveSubTab('endurance')}
          className="qml-btn"
          style={{
            background: activeSubTab === 'endurance' ? 'var(--cyan-500)' : 'var(--bg-elevated)',
            color: activeSubTab === 'endurance' ? '#041017' : 'var(--text-muted)',
            borderColor: activeSubTab === 'endurance' ? 'var(--cyan-400)' : 'var(--border-subtle)',
            padding: '10px 22px',
          }}
        >
          P/E CYCLING & ENDURANCE (WEAR)
        </button>
        <button
          onClick={() => setActiveSubTab('retention')}
          className="qml-btn"
          style={{
            background: activeSubTab === 'retention' ? 'var(--amber-500)' : 'var(--bg-elevated)',
            color: activeSubTab === 'retention' ? '#041017' : 'var(--text-muted)',
            borderColor: activeSubTab === 'retention' ? 'var(--amber-400)' : 'var(--border-subtle)',
            padding: '10px 22px',
          }}
        >
          ARRHENIUS RETENTION (THERMAL LEAKAGE)
        </button>
      </div>

      {/* View 1: Endurance Workstation */}
      {activeSubTab === 'endurance' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'start'
        }}>
          {/* Controls */}
          <aside className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--cyan-400)', textTransform: 'uppercase' }}>
              CYCLING STRESS CONTROLS
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '4px 0 16px 0' }}>
              Accelerated Program / Erase Stress
            </div>

            <div className="telemetry-rack" style={{ marginBottom: '16px' }}>
              <div className="telemetry-channel">
                <span className="telemetry-channel-label">CURRENT P/E</span>
                <span className="telemetry-channel-val text-cyan">{blockCycles.toLocaleString()} Cycles</span>
              </div>
              <div className="telemetry-channel">
                <span className="telemetry-channel-label">WEAR FRACTION</span>
                <span className="telemetry-channel-val text-amber">{(wear.wearFraction * 100).toFixed(1)} %</span>
              </div>
              <div className="telemetry-channel">
                <span className="telemetry-channel-label">Vt JITTER (σ)</span>
                <span className="telemetry-channel-val text-violet">{(wear.thresholdSigmaV * 1000).toFixed(0)} mV</span>
              </div>
            </div>

            <div className="qml-slider-row">
              <div className="qml-slider-header">
                <span className="qml-slider-label">P/E Cycles to Inject</span>
                <span className="qml-slider-val">+{cyclesToAdd}</span>
              </div>
              <div className="qml-slider-controls">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={cyclesToAdd}
                  onChange={(e) => setCyclesToAdd(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <button onClick={handleApplyWear} className="qml-btn qml-btn-primary" style={{ width: '100%' }}>
                ⚡ APPLY +{cyclesToAdd} ACCELERATED P/E CYCLES
              </button>
              <button onClick={() => onReadBlock?.()} className="qml-btn qml-btn-secondary" style={{ width: '100%' }}>
                🔍 SENSE BLOCK READ UNDER NOISE
              </button>
              <button onClick={handleResetWear} className="qml-btn qml-btn-ghost" style={{ width: '100%' }}>
                ↺ RESET WEAR MODEL TO 0 CYCLES
              </button>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              ⚠ <em>Physical degradation:</em> Every program and erase cycle forces high-energy electrons through the 9 nm oxide, generating interface traps and fixed oxide charges. This progressively widens the threshold distribution and degrades the read window.
            </div>
          </aside>

          {/* Visualization: Threshold Voltage Distributions (Erased vs Programmed) */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan-400)', fontWeight: 600 }}>
                  THRESHOLD VOLTAGE DISTRIBUTIONS P(Vt)
                </span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                  Distribution Widening & Read Window Collapse
                </div>
              </div>
              <span className="qml-badge qml-badge-amber">
                Read Window: {wear.thresholdWindowV.toFixed(2)} V
              </span>
            </div>

            <ThresholdDistributionPlot
              wear={wear}
              readReferenceV={readReferenceV}
            />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '14px',
              padding: '10px 14px',
              borderRadius: '6px',
              background: 'rgba(5, 8, 15, 0.65)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)'
            }}>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>DEFECT TRAP DENSITY: </span>
                <strong style={{ color: 'var(--rose-400)' }}>{wear.defectDensityM3.toExponential(2)} m⁻³</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-dim)' }}>RETENTION RATE ACCELERATOR: </span>
                <strong style={{ color: 'var(--amber-400)' }}>{wear.retentionMultiplier.toFixed(2)}×</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Retention Workstation */}
      {activeSubTab === 'retention' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'start'
        }}>
          {/* Controls */}
          <aside className="glass-panel" style={{ padding: '20px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--amber-400)', textTransform: 'uppercase' }}>
              RETENTION ENVIRONMENT STRESS
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: '4px 0 16px 0' }}>
              Thermal & Field Decay Parameters
            </div>

            {/* Years */}
            <div className="qml-slider-row">
              <div className="qml-slider-header">
                <span className="qml-slider-label">Storage Duration</span>
                <span className="qml-slider-val">{years.toFixed(1)} Years</span>
              </div>
              <div className="qml-slider-controls">
                <input
                  type="range"
                  min="0.1"
                  max="20.0"
                  step="0.5"
                  value={years}
                  onChange={(e) => setYears(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Temperature */}
            <div className="qml-slider-row">
              <div className="qml-slider-header">
                <span className="qml-slider-label">Storage Temperature</span>
                <span className="qml-slider-val">{temperatureK} K ({(temperatureK - 273.15).toFixed(0)} °C)</span>
              </div>
              <div className="qml-slider-controls">
                <input
                  type="range"
                  min="250"
                  max="420"
                  step="5"
                  value={temperatureK}
                  onChange={(e) => setTemperatureK(parseInt(e.target.value))}
                />
              </div>
              <div className="qml-slider-bounds">
                <span>250 K (-23°C)</span>
                <span>Room (300 K / 27°C)</span>
                <span>420 K (147°C)</span>
              </div>
            </div>

            {/* Electric Field Stress */}
            <div className="qml-slider-row">
              <div className="qml-slider-header">
                <span className="qml-slider-label">Oxide Field Stress</span>
                <span className="qml-slider-val">{fieldStressGVm.toFixed(2)} GV/m</span>
              </div>
              <div className="qml-slider-controls">
                <input
                  type="range"
                  min="0.0"
                  max="2.5"
                  step="0.05"
                  value={fieldStressGVm}
                  onChange={(e) => setFieldStressGVm(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <button
              onClick={handleApplyRetentionToBlock}
              className="qml-btn qml-btn-primary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              APPLY PROJECTED RETENTION TO MEMORY BLOCK
            </button>
          </aside>

          {/* Visualization: Arrhenius Charge Decay Curve */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--amber-400)', fontWeight: 600 }}>
                  ARRHENIUS CHARGE DECAY: Q(t) = Q₀ exp(−Γt)
                </span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                  Projected Floating-Gate Charge over {years.toFixed(1)} Years
                </div>
              </div>

              <span className="qml-badge qml-badge-emerald">
                Remaining: {((1 - retentionResult.lossFraction) * 100).toFixed(1)} %
              </span>
            </div>

            <RetentionDecayPlot
              q0={initialQ}
              gammaPerS={retentionResult.gammaPerS}
              years={years}
            />

            <div className="telemetry-rack" style={{ marginTop: '14px' }}>
              <div className="telemetry-channel">
                <span className="telemetry-channel-label">INITIAL CHARGE Q₀</span>
                <span className="telemetry-channel-val text-cyan">{initialQ.toFixed(3)} fC</span>
              </div>
              <div className="telemetry-channel">
                <span className="telemetry-channel-label">PROJECTED Q(t)</span>
                <span className="telemetry-channel-val text-amber">{retentionResult.chargeFc.toFixed(3)} fC</span>
              </div>
              <div className="telemetry-channel">
                <span className="telemetry-channel-label">LEAKAGE RATE Γ</span>
                <span className="telemetry-channel-val text-violet">{retentionResult.gammaPerS.toExponential(2)} s⁻¹</span>
              </div>
              <div className="telemetry-channel">
                <span className="telemetry-channel-label">PROJECTED Vt</span>
                <span className="telemetry-channel-val text-bright">{projectedVt.toFixed(3)} V</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component: Gaussian Threshold Distribution Plot
function ThresholdDistributionPlot({ wear, readReferenceV }) {
  const W = 680;
  const H = 220;
  const pad = { top: 20, right: 30, bottom: 35, left: 50 };

  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const minV = 0.0;
  const maxV = 2.8;

  const scaleX = (v) => pad.left + ((v - minV) / (maxV - minV)) * plotW;
  const scaleY = (p) => pad.top + plotH - p * plotH;

  // Erased State (State '1'): centered at Vt ~ 0.55V, sigma = wear.thresholdSigmaV
  const erasedMean = 0.55 + wear.wearFraction * 0.25;
  // Programmed State (State '0'): centered at Vt ~ 1.85V, shifts left with wear
  const progMean = 1.85 - wear.wearFraction * 0.35;
  const sigma = Math.max(0.04, wear.thresholdSigmaV);

  const gaussian = (v, mu, sig) => {
    const exponent = -0.5 * Math.pow((v - mu) / sig, 2);
    return Math.exp(exponent);
  };

  const steps = 80;
  const erasedPts = [];
  const progPts = [];

  for (let i = 0; i <= steps; i++) {
    const v = minV + (i / steps) * (maxV - minV);
    erasedPts.push({ v, p: gaussian(v, erasedMean, sigma) });
    progPts.push({ v, p: gaussian(v, progMean, sigma) });
  }

  const erasedPath = erasedPts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.v).toFixed(1)} ${scaleY(pt.p).toFixed(1)}`).join(' ');
  const progPath = progPts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.v).toFixed(1)} ${scaleY(pt.p).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* Vref Vertical Line */}
      <line
        x1={scaleX(readReferenceV)}
        x2={scaleX(readReferenceV)}
        y1={pad.top}
        y2={H - pad.bottom}
        stroke="var(--amber-400)"
        strokeWidth="2"
        strokeDasharray="4,3"
      />
      <text
        x={scaleX(readReferenceV)}
        y={pad.top - 6}
        fill="var(--amber-400)"
        fontSize="10"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        fontWeight="bold"
      >
        Vref = {readReferenceV.toFixed(2)} V
      </text>

      {/* Erased Distribution (Emerald) */}
      <path d={erasedPath} fill="none" stroke="var(--emerald-400)" strokeWidth="2.5" />
      <text
        x={scaleX(erasedMean)}
        y={scaleY(1.05)}
        fill="var(--emerald-400)"
        fontSize="11"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        fontWeight="bold"
      >
        ERASED "1"
      </text>

      {/* Programmed Distribution (Cyan) */}
      <path d={progPath} fill="none" stroke="var(--cyan-400)" strokeWidth="2.5" />
      <text
        x={scaleX(progMean)}
        y={scaleY(1.05)}
        fill="var(--cyan-400)"
        fontSize="11"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
        fontWeight="bold"
      >
        PROGRAMMED "0"
      </text>

      {/* Base Axis */}
      <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} stroke="rgba(255, 255, 255, 0.15)" />

      {[0.0, 0.5, 1.0, 1.5, 2.0, 2.5].map((val) => (
        <text
          key={val}
          x={scaleX(val)}
          y={H - 12}
          fill="var(--text-dim)"
          fontSize="10"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
        >
          {val.toFixed(1)} V
        </text>
      ))}
    </svg>
  );
}

// Sub-component: Retention Decay Plot
function RetentionDecayPlot({ q0 = 0.42, gammaPerS = 1e-9, years = 5.0 }) {
  const W = 680;
  const H = 200;
  const pad = { top: 20, right: 30, bottom: 35, left: 50 };

  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const secondsPerYear = 365.25 * 24 * 3600;
  const totalSeconds = years * secondsPerYear;

  const pointsCount = 60;
  const points = Array.from({ length: pointsCount }, (_, i) => {
    const tSec = (i / (pointsCount - 1)) * totalSeconds;
    const tYear = tSec / secondsPerYear;
    const q = q0 * Math.exp(-gammaPerS * tSec);
    return { tYear, q };
  });

  const scaleX = (t) => pad.left + (t / years) * plotW;
  const scaleY = (q) => pad.top + plotH - (q / Math.max(1e-3, q0)) * plotH;

  const path = points.map((pt, idx) => {
    return `${idx === 0 ? 'M' : 'L'} ${scaleX(pt.tYear).toFixed(1)} ${scaleY(pt.q).toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* Horizontal Guideline at 50% charge */}
      <line
        x1={pad.left}
        x2={W - pad.right}
        y1={scaleY(q0 * 0.5)}
        y2={scaleY(q0 * 0.5)}
        stroke="rgba(255, 255, 255, 0.08)"
        strokeDasharray="2,2"
      />
      <text x={W - pad.right} y={scaleY(q0 * 0.5) - 4} fill="var(--text-dim)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
        50% Charge Margin
      </text>

      {/* Decay Curve */}
      <path d={path} fill="none" stroke="var(--amber-400)" strokeWidth="2.5" />

      {/* End Point Dot */}
      <circle
        cx={scaleX(years)}
        cy={scaleY(points.at(-1)?.q || q0)}
        r="4.5"
        fill="var(--amber-400)"
        stroke="#fff"
        strokeWidth="1.5"
      />

      {/* Base Line */}
      <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} stroke="rgba(255, 255, 255, 0.15)" />

      {/* X Ticks */}
      <text x={pad.left} y={H - 12} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)">
        0 Years
      </text>
      <text x={W - pad.right} y={H - 12} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
        {years.toFixed(1)} Years
      </text>
      <text x={pad.left + plotW / 2} y={H - 12} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
        Retention Time (Years)
      </text>
    </svg>
  );
}
