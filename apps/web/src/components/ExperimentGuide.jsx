import React from 'react';
import { COMPONENT_DETAILS } from './TransistorScene.jsx';

export const SIX_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Explore the Transistor',
    tag: 'ASSEMBLY & OXIDE',
    headline: 'An Insulating Barrier Separating Silicon from Metal',
    explanation:
      'Look at the 3D model. The thin layer highlighted in pale cyan is the Tunnel Oxide (SiO₂). In classical physics, an electrical insulator blocks all electron flow, keeping the floating gate completely isolated.',
    userAction: 'Click on the Tunnel Oxide or rotate the 3D model to inspect its thickness and position.',
    targetComp: 'tunnel_oxide',
  },
  {
    stage: 2,
    title: 'Stage 2 — Apply Electrical Voltage',
    tag: 'ELECTRIC FIELD FORMATION',
    headline: 'High Gate Bias Establishes a Powerful Electric Field',
    explanation:
      'When you apply a programming voltage (14V–18V) to the top Control Gate, a massive electric field forms across the thin oxide layer, tilting its rectangular potential-energy profile into a sharp triangle.',
    userAction: 'Drag the Gate Voltage slider below to increase voltage and observe the electric field forming.',
    targetComp: 'control_gate',
    hasVoltageSlider: true,
  },
  {
    stage: 3,
    title: 'Stage 3 — Release the Electron Wave',
    tag: 'QUANTUM WAVEPACKET',
    headline: 'Electrons Behave as Quantum Probability Waves',
    explanation:
      'Conduction electrons in the silicon channel possess kinetic energy (~1.0 eV), which is far below the 3.1 eV barrier height of the oxide. In classical mechanics, an electron would bounce off with 100% certainty.',
    userAction: 'Observe the soft violet wavepacket approaching the barrier in the 3D scene and graph below.',
    targetComp: 'channel',
  },
  {
    stage: 4,
    title: 'Stage 4 — Quantum Tunnelling',
    tag: 'WAVE PENETRATION',
    headline: 'The Wavefunction Decays Inside the Forbidden Region',
    explanation:
      'Unlike classical particles, quantum particles are described by wavefunctions. A wavefunction can extend into a classically forbidden region as an evanescent wave and produce a non-zero transmission probability.',
    userAction: 'Inspect the exponential decay in the bottom panel: a small transmitted wave emerges into the floating gate!',
    targetComp: 'tunnel_oxide',
  },
  {
    stage: 5,
    title: 'Stage 5 — Charge Storage',
    tag: 'FLOATING GATE ACCUMULATION',
    headline: 'Transferred Electrons Become Permanently Trapped',
    explanation:
      'Electrons that cross the oxide fall into the floating gate potential well. Surrounded by insulators on all sides, these trapped electrons remain stored for over 10 years without requiring any battery power.',
    userAction: 'Click "INJECT PROGRAM CHARGE" to model the transferred electron charge packet.',
    targetComp: 'floating_gate',
    hasChargeButton: true,
  },
  {
    stage: 6,
    title: 'Stage 6 — Read Memory State',
    tag: 'SENSING & CONCLUSION',
    headline: 'Stored Charge Shifts the Transistor Threshold Voltage',
    explanation:
      'The trapped negative charge raises the gate voltage required to turn ON the transistor (Vt shifts from 1.2V to 1.8V). A read operation simply tests whether current conducts at 1.2V: no current means programmed (0), current means erased (1)!',
    userAction: 'Experiment complete! You have verified how quantum mechanics makes non-volatile storage possible.',
    targetComp: 'floating_gate',
  },
];

export default function ExperimentGuide({
  currentStage = 1,
  onSetStage,
  isPlaying = false,
  onTogglePlay,
  onReset,
  gateVoltageV = 10,
  onChangeGateVoltage,
  oxideThicknessNm = 9.0,
  onChangeOxideThickness,
  incidentEnergyEv = 1.0,
  onChangeIncidentEnergy,
  transmission = 1e-12,
  selectedComponent = 'tunnel_oxide',
  onSelectComponent,
  onInjectCharge,
  storedChargeFc = 0,
  activeVt = 1.20,
}) {
  const stageData = SIX_STAGES[currentStage - 1] || SIX_STAGES[0];
  const compInfo = COMPONENT_DETAILS[selectedComponent] || COMPONENT_DETAILS.tunnel_oxide;

  const handleNext = () => {
    onSetStage(Math.min(SIX_STAGES.length, currentStage + 1));
  };

  const handlePrev = () => {
    onSetStage(Math.max(1, currentStage - 1));
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        height: '100%',
      }}
    >
      {/* Stage Stepper Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            EXPERIMENT GUIDE ({currentStage} OF 6)
          </span>
          <span className="qml-badge qml-badge-cyan">{stageData.tag}</span>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          "Can an Electron Cross an Insulating Barrier?"
        </h2>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>
          {stageData.title}
        </div>
      </div>

      {/* Stage Headline & Simple Explanation */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          padding: '16px',
        }}
      >
        <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
          {stageData.headline}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
          {stageData.explanation}
        </p>

        {/* User Action Prompt */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '11px',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <strong style={{ color: '#0284c7' }}>ACTION:</strong>
          <span>{stageData.userAction}</span>
        </div>
      </div>

      {/* Interactive Controls within Active Stage */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Gate Voltage Slider (Primary control in Stage 2) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
              Gate Voltage (Vg)
            </label>
            <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: gateVoltageV >= 12 ? '#d97706' : 'var(--text-main)' }}>
              {gateVoltageV.toFixed(1)} V
            </strong>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={gateVoltageV}
            onChange={(e) => onChangeGateVoltage(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#20262D' }}
          />
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {gateVoltageV >= 12
              ? 'High field: triangular band bending enables Fowler–Nordheim emission.'
              : 'Low field: flat barrier blocks transmission.'}
          </div>
        </div>

        {/* Oxide Thickness Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
              Oxide Thickness (tox)
            </label>
            <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#0284c7' }}>
              {oxideThicknessNm.toFixed(1)} nm
            </strong>
          </div>
          <input
            type="range"
            min="5.0"
            max="14.0"
            step="0.2"
            value={oxideThicknessNm}
            onChange={(e) => onChangeOxideThickness(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#0284c7' }}
          />
        </div>

        {/* Electron Kinetic Energy Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
              Electron Kinetic Energy (E)
            </label>
            <strong style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#8b5cf6' }}>
              {incidentEnergyEv.toFixed(2)} eV
            </strong>
          </div>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            value={incidentEnergyEv}
            onChange={(e) => onChangeIncidentEnergy && onChangeIncidentEnergy(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#8b5cf6' }}
          />
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Barrier height Φb = 3.10 eV · Energy deficit: {(3.1 - incidentEnergyEv).toFixed(2)} eV
          </div>
        </div>

        {/* Live Quantum Tunnelling Probability Readout Badge */}
        <div
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>TUNNELING PROBABILITY (T):</div>
            <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: transmission > 1e-6 ? '#059669' : '#2563eb' }}>
              {transmission < 1e-15 ? '< 1.0 × 10⁻¹⁵' : transmission.toExponential(3)}
            </strong>
          </div>
          <span
            className={`qml-badge ${transmission > 1e-6 ? 'qml-badge-emerald' : 'qml-badge-cyan'}`}
            style={{ fontSize: '10px' }}
          >
            {transmission > 1e-6 ? 'FN EMISSION ACTIVE' : 'FORBIDDEN / EVANESCENT'}
          </span>
        </div>

        {/* Stage 5 Action Button */}
        {stageData.hasChargeButton && (
          <button
            onClick={onInjectCharge}
            className="qml-btn qml-btn-warning"
            style={{ width: '100%', padding: '10px', fontSize: '12px' }}
          >
            ⚡ INJECT PROGRAM CHARGE INTO FLOATING GATE
          </button>
        )}
      </div>

      {/* Component Inspector Card (Reflects 3D clicks) */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: compInfo.color || '#2563eb' }} />
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{compInfo.name}</strong>
          </div>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            {compInfo.spec || compInfo.thickness}
          </span>
        </div>
        {compInfo.func && (
          <div style={{ fontSize: '11px', color: 'var(--text-main)', lineHeight: 1.4, marginTop: '2px' }}>
            <strong>Function:</strong> {compInfo.func}
          </div>
        )}
        {compInfo.role && (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong>Flash Role:</strong> {compInfo.role}
          </div>
        )}
      </div>

      {/* Controls Bar: RUN, PAUSE, STEP, RESET, REPLAY */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handlePrev}
            disabled={currentStage <= 1}
            className="qml-btn qml-btn-secondary"
            style={{ flex: 1 }}
          >
            ◀ PREV
          </button>
          <button
            onClick={handleNext}
            disabled={currentStage >= SIX_STAGES.length}
            className="qml-btn qml-btn-primary"
            style={{ flex: 1 }}
          >
            NEXT ▶
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onTogglePlay}
            className={`qml-btn ${isPlaying ? 'qml-btn-warning' : 'qml-btn-secondary'}`}
            style={{ flex: 1.2, fontSize: '11px' }}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ RUN'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStage >= SIX_STAGES.length}
            className="qml-btn qml-btn-secondary"
            style={{ flex: 1, fontSize: '11px' }}
          >
            STEP ➔
          </button>
          <button
            onClick={onReset}
            className="qml-btn qml-btn-secondary"
            style={{ flex: 1, fontSize: '11px' }}
          >
            ↺ RESET
          </button>
          <button
            onClick={() => {
              onSetStage(1);
              if (!isPlaying) onTogglePlay();
            }}
            className="qml-btn qml-btn-secondary"
            style={{ flex: 1, fontSize: '11px' }}
          >
            ↻ REPLAY
          </button>
        </div>
      </div>
    </div>
  );
}
