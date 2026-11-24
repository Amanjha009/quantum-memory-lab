import React, { useState, useMemo } from 'react';
import {
  cellThresholdV,
  fnChargeIncrementFc,
  oxideField,
  readSLCBlock,
  runFnErase,
  runIsppProgram,
} from '../core/flash.js';
import { pagesForDisplay, storageStats } from '../core/storage.js';

export default function NandLabView({
  storageModel,
  nandCells,
  setNandCells,
  selectedCell,
  setSelectedCell,
  blockCycles,
  setBlockCycles,
  readReferenceV,
  setReadReferenceV,
  programSettings,
  setProgramSettings,
  onProgramPayload,
  onEraseBlock,
  onReadBlock,
  payloadByte = 0x41,
  payloadBits = '01000001',
  lastProgram,
  lastRead,
  lastOperation,
}) {
  // Hierarchical Navigation Level: 'package' | 'blocks' | 'pages' | 'cells'
  const [navLevel, setNavLevel] = useState('cells');
  const [selectedBlockId, setSelectedBlockId] = useState(0);
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('ispp'); // 'ispp' | 'read' | 'erase'

  // Pulse-by-pulse manual stepping state
  const [isppStepIndex, setIsppStepIndex] = useState(0);
  const [stepPulses, setStepPulses] = useState([]);
  const [isStepActive, setIsStepActive] = useState(false);

  const stats = useMemo(() => storageStats(storageModel), [storageModel]);
  const displayBlocks = useMemo(() => pagesForDisplay(storageModel), [storageModel]);
  const currentBlock = displayBlocks[selectedBlockId] || displayBlocks[0];
  const currentPage = currentBlock.pages[selectedPageIdx] || currentBlock.pages[0];

  const activeCellData = nandCells[selectedCell] || { chargeFc: 0, pulseCount: 0 };
  const activeVt = cellThresholdV(activeCellData.chargeFc);
  const isProgrammed = activeVt >= readReferenceV;

  // Single ISPP pulse stepping logic
  const handleStepPulse = () => {
    const startV = programSettings.vpgmStartV || 14.0;
    const stepV = programSettings.vpgmStepV || 0.5;
    const maxV = programSettings.vpgmMaxV || 24.0;
    const pulseWidthUs = programSettings.pulseWidthUs || 5.0;
    const areaUm2 = programSettings.areaUm2 || 0.02;
    const verifyVt = programSettings.verifyVtV || 1.50;

    const nextIndex = isStepActive ? isppStepIndex + 1 : 1;
    const voltageV = Math.min(maxV, startV + (nextIndex - 1) * stepV);

    const { oxideDropV, fieldVm } = oxideField(voltageV, 9.0);
    const { currentDensity, chargeFc: deltaChargeFc } = fnChargeIncrementFc({
      fieldVm,
      barrierEv: 3.1,
      pulseWidthUs,
      areaUm2,
    });

    const prevCharge = isStepActive && stepPulses.length > 0 ? stepPulses.at(-1).chargeFc : activeCellData.chargeFc;
    const newCharge = prevCharge + deltaChargeFc;
    const vtV = cellThresholdV(newCharge);
    const verified = vtV >= verifyVt;

    const newPulse = {
      index: nextIndex,
      voltageV,
      oxideDropV,
      fieldVm,
      currentDensity,
      deltaChargeFc,
      chargeFc: newCharge,
      vtV,
      verified,
    };

    const nextPulses = isStepActive ? [...stepPulses, newPulse] : [newPulse];
    setStepPulses(nextPulses);
    setIsppStepIndex(nextIndex);
    setIsStepActive(true);

    // Update target cell in array
    const updatedCells = nandCells.slice();
    updatedCells[selectedCell] = {
      ...activeCellData,
      chargeFc: newCharge,
      pulseCount: nextIndex,
    };
    setNandCells(updatedCells);
  };

  const handleResetPulseStepper = () => {
    setIsStepActive(false);
    setIsppStepIndex(0);
    setStepPulses([]);
  };

  const pulsesToDisplay = isStepActive && stepPulses.length > 0
    ? stepPulses
    : lastProgram?.pulses || [];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px 60px' }}>
      
      {/* Header & Hierarchy Breadcrumb Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              MULTISCALE SOLID-STATE MEMORY ARRAY
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-main)' }}>
              Interactive NAND Memory Exploration
            </h1>
          </div>

          {/* Breadcrumb Hierarchy Level Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: '24px',
              padding: '4px 8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <button
              onClick={() => setNavLevel('package')}
              style={{
                background: navLevel === 'package' ? '#2563eb' : 'transparent',
                color: navLevel === 'package' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              1. Chip Package
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>➔</span>
            <button
              onClick={() => setNavLevel('blocks')}
              style={{
                background: navLevel === 'blocks' ? '#2563eb' : 'transparent',
                color: navLevel === 'blocks' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              2. Blocks (B{selectedBlockId})
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>➔</span>
            <button
              onClick={() => setNavLevel('pages')}
              style={{
                background: navLevel === 'pages' ? '#2563eb' : 'transparent',
                color: navLevel === 'pages' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              3. Pages (P{String(selectedPageIdx).padStart(2, '0')})
            </button>
            <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>➔</span>
            <button
              onClick={() => setNavLevel('cells')}
              style={{
                background: navLevel === 'cells' ? '#2563eb' : 'transparent',
                color: navLevel === 'cells' ? '#FFFFFF' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              4. Transistor Cells (C{selectedCell})
            </button>
          </div>
        </div>

        {/* Physical Address Coordinate Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Physical Coordinates:</span>
          <strong style={{ color: '#2563eb' }}>
            Die 0 ➔ Block {selectedBlockId} ➔ Page P{String(selectedPageIdx).padStart(2, '0')} ➔ Cell C{selectedCell}
          </strong>
          <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
            Total Array: 4 Blocks · 32 Pages · 256 Transistor Cells
          </span>
        </div>
      </div>

      {/* LEVEL 1: CHIP PACKAGE OVERVIEW */}
      {navLevel === 'package' && (
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <span className="qml-badge qml-badge-cyan" style={{ fontSize: '11px' }}>
                MACROSCOPIC SILICON DIE PACKAGE
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0 2px 0', color: 'var(--text-main)' }}>
                NAND Flash Monolithic Die (6.5 × 8.2 mm)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                High-density solid-state memory package with integrated Dickson charge pump and row/column decoders.
              </p>
            </div>
            <button onClick={() => setNavLevel('blocks')} className="qml-btn qml-btn-primary" style={{ fontSize: '12px' }}>
              Inspect Memory Blocks ➔
            </button>
          </div>

          {/* Package Architecture Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>BLOCK ENDURANCE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                3,000 P/E Cycles
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Current wear: {blockCycles} cycles
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ARRAY CAPACITY</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                4 Blocks · 32 Pages
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {stats.validPages} Valid · {stats.freePages} Free · {stats.invalidPages} Invalid
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ON-CHIP CHARGE PUMP</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                18.0 V ISPP
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Multiplied from 3.3 V Vcc
              </div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>STORAGE CELL TYPE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                Single-Level Cell (SLC)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                1 Bit / Transistor (Highest Reliability)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 2: MEMORY BLOCKS OVERVIEW */}
      {(navLevel === 'blocks' || navLevel === 'package') && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                LEVEL 2: PHYSICAL ERASE BLOCKS
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                Select a Block to open its constituent Wordline Pages
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Click any block to drill down
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {displayBlocks.map((b) => {
              const isSelected = selectedBlockId === b.id;
              const validCount = b.pages.filter((p) => p.state === 'valid').length;
              const invalidCount = b.pages.filter((p) => p.state === 'invalid').length;
              const freeCount = b.pages.filter((p) => p.state === 'free').length;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBlockId(b.id);
                    setNavLevel('pages');
                  }}
                  style={{
                    background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-elevated)',
                    border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-light)',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>Block {b.id}</strong>
                    <span className="qml-badge qml-badge-cyan" style={{ fontSize: '10px' }}>
                      {b.eraseCount} Erases
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    {validCount} Valid · {invalidCount} Invalid · {freeCount} Free
                  </div>

                  {/* Page state mini-heatmap */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px' }}>
                    {b.pages.map((p) => {
                      const color = p.state === 'valid' ? '#2563eb' : p.state === 'invalid' ? '#f59e0b' : '#cbd5e1';
                      return (
                        <div
                          key={p.address}
                          title={`Page P${p.index}: ${p.state}`}
                          style={{
                            height: '16px',
                            background: color,
                            borderRadius: '3px',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 3: MEMORY PAGES OVERVIEW */}
      {(navLevel === 'pages' || navLevel === 'blocks') && (
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                LEVEL 3: MEMORY PAGES (BLOCK {selectedBlockId})
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                Pages sharing Wordlines inside Block {selectedBlockId}
              </div>
            </div>
            <button onClick={() => setNavLevel('cells')} className="qml-btn qml-btn-primary" style={{ fontSize: '11px' }}>
              Inspect Page {selectedPageIdx} Cells ➔
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            {currentBlock.pages.map((p) => {
              const isSelected = selectedPageIdx === p.index;
              const stateBadge = p.state === 'valid' ? '#2563eb' : p.state === 'invalid' ? '#d97706' : '#64748b';

              return (
                <button
                  key={p.address}
                  onClick={() => {
                    setSelectedPageIdx(p.index);
                    setNavLevel('cells');
                  }}
                  style={{
                    background: isSelected ? '#2563eb' : 'var(--bg-elevated)',
                    border: isSelected ? '1px solid #2563eb' : '1px solid var(--border-light)',
                    color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                    borderRadius: '8px',
                    padding: '12px 10px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800 }}>
                    P{String(p.index).padStart(2, '0')}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      color: isSelected ? '#e0f2fe' : stateBadge,
                      fontWeight: 700,
                      marginTop: '4px',
                    }}
                  >
                    {p.state}
                  </div>
                  <div style={{ fontSize: '9px', color: isSelected ? '#cbd5e1' : 'var(--text-secondary)', marginTop: '2px' }}>
                    Word Line {p.index}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* LEVEL 4: TRANSISTOR CELLS & LIVE WORKSTATION CONTROLS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Operation Controls (ISPP, Sense Read, Whole-Block Erase) */}
        <aside className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          {/* Operation Tab Switcher */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: 'var(--bg-elevated)', padding: '3px', borderRadius: '8px' }}>
            {[
              ['ispp', 'ISPP PROGRAM'],
              ['read', 'SENSE READ'],
              ['erase', 'BLOCK ERASE'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  background: activeTab === tab ? '#2563eb' : 'transparent',
                  color: activeTab === tab ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab 1: ISPP Programming */}
          {activeTab === 'ispp' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                ISPP PULSE PARAMETERS
              </div>

              <div className="qml-slider-row">
                <div className="qml-slider-header">
                  <span className="qml-slider-label">Start Pulse Voltage (Vstart)</span>
                  <span className="qml-slider-val">{programSettings.vpgmStartV.toFixed(1)} V</span>
                </div>
                <div className="qml-slider-controls">
                  <input
                    type="range"
                    min="12.0"
                    max="18.0"
                    step="0.5"
                    value={programSettings.vpgmStartV}
                    onChange={(e) => setProgramSettings((s) => ({ ...s, vpgmStartV: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="qml-slider-row">
                <div className="qml-slider-header">
                  <span className="qml-slider-label">Voltage Step (ΔVpgm)</span>
                  <span className="qml-slider-val">+{programSettings.vpgmStepV.toFixed(2)} V</span>
                </div>
                <div className="qml-slider-controls">
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={programSettings.vpgmStepV}
                    onChange={(e) => setProgramSettings((s) => ({ ...s, vpgmStepV: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="qml-slider-row">
                <div className="qml-slider-header">
                  <span className="qml-slider-label">Verify Target Voltage (Vverify)</span>
                  <span className="qml-slider-val">{programSettings.verifyVtV.toFixed(2)} V</span>
                </div>
                <div className="qml-slider-controls">
                  <input
                    type="range"
                    min="1.2"
                    max="2.2"
                    step="0.05"
                    value={programSettings.verifyVtV}
                    onChange={(e) => setProgramSettings((s) => ({ ...s, verifyVtV: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => onProgramPayload()}
                  className="qml-btn qml-btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                >
                  ⚡ RUN AUTOMATIC ISPP BYTE PROGRAM
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={handleStepPulse}
                    className="qml-btn qml-btn-secondary"
                    style={{ fontSize: '11px', padding: '8px' }}
                  >
                    ⏭ STEP 1 PULSE
                  </button>
                  <button
                    onClick={handleResetPulseStepper}
                    className="qml-btn qml-btn-ghost"
                    style={{ fontSize: '11px', padding: '8px' }}
                  >
                    ↺ RESET PULSES
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Sense Read */}
          {activeTab === 'read' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                SENSE REFERENCE & THRESHOLD COMPARATOR
              </div>

              <div className="qml-slider-row">
                <div className="qml-slider-header">
                  <span className="qml-slider-label">Read Reference Voltage (Vref)</span>
                  <span className="qml-slider-val">{readReferenceV.toFixed(2)} V</span>
                </div>
                <div className="qml-slider-controls">
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.025"
                    value={readReferenceV}
                    onChange={(e) => setReadReferenceV(parseFloat(e.target.value))}
                  />
                </div>
                <div className="qml-slider-bounds">
                  <span>0.60 V (Erased)</span>
                  <span>Decision Threshold</span>
                  <span>2.00 V (Programmed)</span>
                </div>
              </div>

              <button
                onClick={() => onReadBlock()}
                className="qml-btn qml-btn-primary"
                style={{ width: '100%', padding: '10px', marginTop: '16px', fontSize: '12px' }}
              >
                🔍 SENSE ALL 8 BITS AT Vref
              </button>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                }}
              >
                <div style={{ color: '#2563eb', fontWeight: 700, marginBottom: '4px' }}>
                  SLC COMPARATOR DECISION RULE:
                </div>
                <div>• Vt ≥ Vref ({readReferenceV.toFixed(2)} V) ➔ <strong>Bit = 0</strong> (No current)</div>
                <div>• Vt &lt; Vref ({readReferenceV.toFixed(2)} V) ➔ <strong>Bit = 1</strong> (Channel conducts)</div>
              </div>
            </div>
          )}

          {/* Tab 3: Whole-Block Erase */}
          {activeTab === 'erase' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '10px' }}>
                WHOLE-BLOCK REVERSE-FIELD ERASE
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                In solid-state physics, single cells cannot be erased in isolation. Erase is applied to all pages across the entire block simultaneously via reverse-field tunneling pulses.
              </p>

              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <div>TARGET: <strong>BLOCK {selectedBlockId}</strong></div>
                <div>AFFECTED: <strong>8 Pages (All cells reset)</strong></div>
                <div>CYCLE COUNT: <strong>{blockCycles} P/E</strong></div>
              </div>

              <button
                onClick={() => onEraseBlock()}
                className="qml-btn qml-btn-danger"
                style={{ width: '100%', padding: '10px', fontSize: '12px' }}
              >
                ⚠ REVERSE-FIELD ERASE BLOCK {selectedBlockId}
              </button>
            </div>
          )}

          {/* Last Operation Result */}
          {lastOperation && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 12px',
                borderRadius: '6px',
                background: lastOperation.ok ? 'rgba(37, 99, 235, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${lastOperation.ok ? '#2563eb' : '#f59e0b'}`,
                fontSize: '11px',
                color: 'var(--text-main)',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>{lastOperation.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lastOperation.detail}</div>
            </div>
          )}
        </aside>

        {/* Right Column: 8 Transistors Array & Threshold Voltage Distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section: The 8 SLC Transistors Array */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  ACTIVE WORD LINE ARRAY (8 SLC MEMORY TRANSISTORS)
                </span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Target Byte: 0x{payloadByte.toString(16).padStart(2, '0').toUpperCase()} ('{String.fromCharCode(payloadByte)}')
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  TARGET BITS:
                </span>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#2563eb', fontWeight: 700, letterSpacing: '2px' }}>
                  {payloadBits}
                </code>
              </div>
            </div>

            {/* 8-Cell Transistor Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              {nandCells.map((cell, idx) => {
                const cellRead = lastRead?.cells?.[idx];
                const vt = cellRead?.measuredVtV ?? cellThresholdV(cell.chargeFc);
                const bit = cellRead?.bit ?? (vt >= readReferenceV ? 0 : 1);
                const isSelected = selectedCell === idx;
                const programmed = bit === 0;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCell(idx)}
                    style={{
                      padding: '12px 6px',
                      textAlign: 'center',
                      background: isSelected ? '#2563eb' : programmed ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-elevated)',
                      border: isSelected ? '2px solid #2563eb' : programmed ? '1px solid #93c5fd' : '1px solid var(--border-light)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: isSelected ? '#e0f2fe' : 'var(--text-secondary)' }}>
                      C{idx}
                    </span>
                    <b style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 800 }}>
                      {bit}
                    </b>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isSelected ? '#e0f2fe' : programmed ? '#2563eb' : 'var(--text-secondary)' }}>
                      {vt.toFixed(2)} V
                    </span>

                    {/* Stored Charge Bar Indicator */}
                    <div style={{ width: '100%', height: '3px', background: isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(8, (vt / 2.5) * 100))}%`,
                          height: '100%',
                          background: programmed ? (isSelected ? '#FFFFFF' : '#f59e0b') : '#94a3b8',
                        }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Cell Detailed Physics Inspector */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  INSPECTED CELL: C{selectedCell} (COORDINATE: B{selectedBlockId}·P{String(selectedPageIdx).padStart(2, '0')}·Bit{selectedCell})
                </span>
                <div style={{ fontSize: '14px', fontWeight: 800, color: isProgrammed ? '#2563eb' : 'var(--text-main)' }}>
                  State: {isProgrammed ? 'PROGRAMMED (LOGICAL 0 · CHANNEL BLOCKED)' : 'ERASED (LOGICAL 1 · CHANNEL CONDUCTS)'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>STORED CHARGE: </span>
                  <strong style={{ color: '#f59e0b' }}>{activeCellData.chargeFc.toFixed(4)} fC</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>THRESHOLD Vt: </span>
                  <strong style={{ color: '#2563eb' }}>{activeVt.toFixed(3)} V</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>MARGIN vs Vref: </span>
                  <strong style={{ color: activeVt >= readReferenceV ? '#059669' : '#d97706' }}>
                    {(activeVt - readReferenceV).toFixed(3)} V
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Threshold Voltage Distribution Curve */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  STATISTICAL PHYSICS DISTRIBUTION
                </span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Threshold Voltage Distribution & Read Margin (Vref = {readReferenceV.toFixed(2)} V)
                </div>
              </div>
              <span className="qml-badge qml-badge-cyan" style={{ fontSize: '10px' }}>
                Gaussian Distribution Model
              </span>
            </div>

            <ThresholdDistributionChart
              cells={nandCells}
              readRefV={readReferenceV}
              selectedCellIdx={selectedCell}
            />
          </div>

          {/* Section: Pulse & Verify Stepper Chart */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  ISPP VOLTAGE STAIRCASE & VERIFY TELEMETRY
                </span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                  Pulse-by-Pulse Threshold Evolution
                </div>
              </div>

              {pulsesToDisplay.length > 0 && (
                <span className="qml-badge qml-badge-emerald" style={{ fontSize: '10px' }}>
                  {pulsesToDisplay.length} Pulses Applied · {pulsesToDisplay.at(-1)?.verified ? 'Verified ✓' : 'In Progress'}
                </span>
              )}
            </div>

            {pulsesToDisplay.length > 0 ? (
              <PulseVerifyChart pulses={pulsesToDisplay} verifyVt={programSettings.verifyVtV} />
            ) : (
              <div
                style={{
                  height: '140px',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-light)',
                }}
              >
                Run automatic ISPP or click "STEP 1 PULSE" to view pulse trajectory.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-component: Gaussian Threshold Voltage Distribution Chart
function ThresholdDistributionChart({ cells = [], readRefV = 1.2, selectedCellIdx = 0 }) {
  const W = 680;
  const H = 160;
  const pad = { top: 15, right: 30, bottom: 30, left: 45 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  // X scale: 0.0 V to 2.5 V
  const minV = 0.0;
  const maxV = 2.5;
  const scaleX = (v) => pad.left + ((v - minV) / (maxV - minV)) * plotW;
  const scaleY = (pdf) => pad.top + plotH - pdf * plotH;

  // Gaussian PDF helper
  const gaussian = (x, mu, sigma) => {
    return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  };

  // Generate curves for Erased state (mu = 0.45, sigma = 0.12) and Programmed state (mu = 1.75, sigma = 0.15)
  const pts = 80;
  const erasedPath = Array.from({ length: pts }, (_, i) => {
    const v = minV + (i / (pts - 1)) * (maxV - minV);
    const y = scaleY(gaussian(v, 0.45, 0.12) * 0.9);
    return `${i === 0 ? 'M' : 'L'} ${scaleX(v).toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const progPath = Array.from({ length: pts }, (_, i) => {
    const v = minV + (i / (pts - 1)) * (maxV - minV);
    const y = scaleY(gaussian(v, 1.75, 0.14) * 0.9);
    return `${i === 0 ? 'M' : 'L'} ${scaleX(v).toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* Background Floor */}
      <line x1={pad.left} x2={W - pad.right} y1={pad.top + plotH} y2={pad.top + plotH} stroke="var(--border-light)" strokeWidth="1" />

      {/* Erased State Bell Curve (Grey / Blue-Grey) */}
      <path d={erasedPath} fill="none" stroke="#64748b" strokeWidth="2" />
      <text x={scaleX(0.45)} y={pad.top + 20} fill="#64748b" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="700">
        Erased State ("1")
      </text>

      {/* Programmed State Bell Curve (Blue) */}
      <path d={progPath} fill="none" stroke="#2563eb" strokeWidth="2" />
      <text x={scaleX(1.75)} y={pad.top + 20} fill="#2563eb" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="700">
        Programmed State ("0")
      </text>

      {/* Vref Decision Boundary Line (Amber) */}
      <line
        x1={scaleX(readRefV)}
        x2={scaleX(readRefV)}
        y1={pad.top}
        y2={pad.top + plotH}
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="4,3"
      />
      <text x={scaleX(readRefV)} y={pad.top + 10} fill="#b45309" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="700">
        Vref = {readRefV.toFixed(2)} V
      </text>

      {/* Plot Active 8 Cells on the X axis */}
      {cells.map((cell, idx) => {
        const vt = cellThresholdV(cell.chargeFc);
        const x = scaleX(vt);
        const isSelected = idx === selectedCellIdx;
        const isProg = vt >= readRefV;

        return (
          <g key={idx}>
            <circle
              cx={x}
              cy={pad.top + plotH}
              r={isSelected ? 6 : 4}
              fill={isSelected ? '#2563eb' : isProg ? '#0284c7' : '#64748b'}
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {isSelected && (
              <text x={x} y={pad.top + plotH - 12} fill="#2563eb" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="800">
                C{idx}
              </text>
            )}
          </g>
        );
      })}

      {/* Axis Labels */}
      <text x={pad.left} y={H - 8} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">
        0.0 V
      </text>
      <text x={W - pad.right} y={H - 8} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
        2.5 V (Threshold Vt)
      </text>
    </svg>
  );
}

// Sub-component: Pulse and Verify Chart
function PulseVerifyChart({ pulses = [], verifyVt = 1.5 }) {
  const W = 680;
  const H = 160;
  const pad = { top: 15, right: 30, bottom: 25, left: 45 };

  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const maxVt = Math.max(2.2, ...pulses.map((p) => p.vtV));

  const scaleX = (idx) => pad.left + (idx / Math.max(1, pulses.length - 1)) * plotW;
  const scaleY = (vt) => pad.top + plotH - (vt / maxVt) * plotH;

  const thresholdPath = pulses.map((p, idx) => {
    return `${idx === 0 ? 'M' : 'L'} ${scaleX(idx).toFixed(1)} ${scaleY(p.vtV).toFixed(1)}`;
  }).join(' ');

  const pulseVPath = pulses.map((p, idx) => {
    const vFraction = (p.voltageV - 12) / (26 - 12);
    const yPulse = pad.top + plotH - vFraction * (plotH * 0.35);
    return `${idx === 0 ? 'M' : 'L'} ${scaleX(idx).toFixed(1)} ${yPulse.toFixed(1)}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      {/* Verify Target Line */}
      <line
        x1={pad.left}
        x2={W - pad.right}
        y1={scaleY(verifyVt)}
        y2={scaleY(verifyVt)}
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray="4,3"
      />
      <text
        x={W - pad.right}
        y={scaleY(verifyVt) - 5}
        fill="#b45309"
        fontSize="9"
        fontFamily="var(--font-mono)"
        textAnchor="end"
        fontWeight="700"
      >
        Vverify = {verifyVt.toFixed(2)} V
      </text>

      {/* Program Voltage Staircase Trace */}
      <path d={pulseVPath} fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3,3" />

      {/* Threshold Voltage Trajectory Trace */}
      <path d={thresholdPath} fill="none" stroke="#2563eb" strokeWidth="2.5" />

      {/* Pulse Nodes */}
      {pulses.map((p, idx) => (
        <circle
          key={p.index}
          cx={scaleX(idx)}
          cy={scaleY(p.vtV)}
          r={p.verified ? 4.5 : 3.0}
          fill={p.verified ? '#059669' : '#2563eb'}
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
      ))}

      {/* Baseline */}
      <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} stroke="var(--border-light)" />

      {/* Axis Labels */}
      <text x={pad.left} y={H - 8} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)">
        Pulse 1 ({pulses[0]?.voltageV.toFixed(1)} V)
      </text>
      <text x={W - pad.right} y={H - 8} fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
        Pulse {pulses.length} ({pulses.at(-1)?.voltageV.toFixed(1)} V)
      </text>
    </svg>
  );
}
