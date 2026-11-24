import React, { useState, useMemo, useEffect } from 'react';
import TransistorScene from '../components/TransistorScene.jsx';
import ExperimentGuide, { SIX_STAGES } from '../components/ExperimentGuide.jsx';
import CompactScientificPanel from '../components/CompactScientificPanel.jsx';
import { calculateTunneling } from '../core/physics.js';
import { fnChargeIncrementFc, cellThresholdV } from '../core/flash.js';

export default function QuantumLabView({
  gateV = 10,
  setGateV,
  oxideNm = 9.0,
  setOxideNm,
  barrierEv = 3.1,
  setBarrierEv,
  energyEv = 1.0,
  setEnergyEv,
  effectiveMass = 0.5,
  selectedChargeFc = 0,
  onProgramPulse,
  onResetExperiment,
}) {
  // Transistor View Mode
  const [transistorViewMode, setTransistorViewMode] = useState('assembled'); // 'assembled' | 'exploded' | 'cross_section'
  const [selectedCompId, setSelectedCompId] = useState('tunnel_oxide');
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);
  const [pulseTrigger, setPulseTrigger] = useState(0);

  // 6-Stage Experiment State
  const [currentStage, setCurrentStage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  // Core Physics Engine Calculations
  const physics = useMemo(() => {
    return calculateTunneling({
      gateV,
      oxideNm,
      barrierEv,
      energyEv,
      effectiveMass,
    });
  }, [gateV, oxideNm, barrierEv, energyEv, effectiveMass]);

  const activeVt = cellThresholdV(selectedChargeFc);

  const handleInjectCharge = () => {
    setPulseTrigger((c) => c + 1);
    if (onProgramPulse) onProgramPulse();
  };

  // Auto-play timer for RUN
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev >= SIX_STAGES.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 3800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStage(1);
    setTransistorViewMode('assembled');
    setSelectedCompId('tunnel_oxide');
    setResetCameraTrigger((c) => c + 1);
    if (onResetExperiment) onResetExperiment();
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px 60px' }}>

      {/* Main Laboratory Layout: 65% Central 3D Canvas, 35% Experiment Guide */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.85fr) minmax(360px, 1fr)',
          gap: '24px',
          alignItems: 'stretch',
          marginBottom: '20px',
        }}
        className="observatory-main-grid"
      >

        {/* CENTRE: Large Interactive 3D Transistor (~65% width) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* 3D Mode Bar */}
          <div
            className="glass-panel"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                SEMICONDUCTOR VIEW:
              </span>
              <button
                onClick={() => setTransistorViewMode('assembled')}
                className={`qml-btn ${transistorViewMode === 'assembled' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                ASSEMBLED
              </button>
              <button
                onClick={() => setTransistorViewMode('exploded')}
                className={`qml-btn ${transistorViewMode === 'exploded' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                EXPLODED VIEW
              </button>
              <button
                onClick={() => setTransistorViewMode('cross_section')}
                className={`qml-btn ${transistorViewMode === 'cross_section' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                CROSS-SECTION
              </button>
            </div>

            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              Gate: <strong>{gateV.toFixed(1)}V</strong> · Oxide: <strong>{oxideNm.toFixed(1)}nm</strong>
            </div>
          </div>

          {/* 3D Canvas Box */}
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              height: '520px',
              overflow: 'hidden',
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
            }}
          >
            <TransistorScene
              oxideThicknessNm={oxideNm}
              gateVoltageV={gateV}
              storedChargeFc={selectedChargeFc}
              selectedComponent={selectedCompId}
              onSelectComponent={setSelectedCompId}
              viewMode={transistorViewMode}
              onViewModeChange={setTransistorViewMode}
              stage={currentStage}
              showField={currentStage === 2 || gateV >= 12}
              showWave={currentStage === 3 || currentStage === 4}
              isTunnelling={currentStage === 4 || gateV >= 14}
              pulseTrigger={pulseTrigger}
              resetTrigger={resetCameraTrigger}
            />
          </div>
        </div>

        {/* RIGHT: Experiment Guide with Current Stage, Explanation & Actions */}
        <div style={{ height: '100%' }}>
          <ExperimentGuide
            currentStage={currentStage}
            onSetStage={setCurrentStage}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={handleReset}
            gateVoltageV={gateV}
            onChangeGateVoltage={setGateV}
            oxideThicknessNm={oxideNm}
            onChangeOxideThickness={setOxideNm}
            incidentEnergyEv={energyEv}
            onChangeIncidentEnergy={setEnergyEv}
            transmission={physics.transmission}
            selectedComponent={selectedCompId}
            onSelectComponent={setSelectedCompId}
            onInjectCharge={handleInjectCharge}
            storedChargeFc={selectedChargeFc}
            activeVt={activeVt}
          />
        </div>
      </div>

      {/* BOTTOM: Compact Scientific Panel with Switchable Views */}
      <CompactScientificPanel
        oxideThicknessNm={oxideNm}
        barrierEv={barrierEv}
        incidentEnergyEv={energyEv}
        gateVoltageV={gateV}
        physics={physics}
        storedChargeFc={selectedChargeFc}
        activeVt={activeVt}
      />
    </div>
  );
}
