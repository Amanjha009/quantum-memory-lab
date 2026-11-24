import React, { useState, useEffect, useMemo, useRef } from 'react';
import FileJourney3DScene from '../scenes/FileJourney3DScene.jsx';
import { SAMPLE_PHOTOS } from '../core/phoneAssets.js';
import { JOURNEY_STAGES } from '../core/journeyStages.js';
import {
  cellThresholdV,
  fnChargeIncrementFc,
  oxideField,
  readSLCBlock,
  runIsppProgram,
} from '../core/flash.js';
import { sha256 } from '../core/physics.js';
import { writeFile } from '../core/storage.js';

export { JOURNEY_STAGES };

export default function FileToElectronJourneyView({
  storageModel,
  setStorageModel,
  nandCells,
  setNandCells,
  onNavigateToPhone,
  onNavigateToNandLab,
}) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeCellIdx, setActiveCellIdx] = useState(0);
  const [selectedPixel, setSelectedPixel] = useState({ x: 300, y: 200, r: 56, g: 189, b: 248 });
  const [expandedTech, setExpandedTech] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const photo = SAMPLE_PHOTOS[selectedPhotoIndex] || SAMPLE_PHOTOS[0];
  const activeStage = JOURNEY_STAGES[currentStageIndex];

  // Deterministic 8-bit sequence for this photograph
  // Active byte: 0x41 ('A') = [0, 1, 0, 0, 0, 0, 0, 1]
  const targetByte = 0x41;
  const targetBits = '01000001';

  // Run real ISPP simulation for Cell 0 (requires programming to 0)
  const isppResult = useMemo(() => {
    return runIsppProgram({
      initialChargeFc: 0,
      vpgmStartV: 14.0,
      vpgmMaxV: 20.0,
      vpgmStepV: 0.5,
      oxideNm: 9.0,
      barrierEv: 3.1,
      verifyVtV: 1.50,
    });
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(1000, 3600 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev >= JOURNEY_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // When Stage 12 is reached, commit to the actual real storage model
  useEffect(() => {
    if (currentStageIndex === 11 && !saveSuccessNotice) {
      // Program real cells
      const programmedCells = nandCells.map((c, idx) => {
        const bit = targetBits[idx];
        if (bit === '0') {
          return { ...c, chargeFc: isppResult.chargeFc, pulseCount: isppResult.pulses.length };
        }
        return { ...c, chargeFc: 0, pulseCount: 0 };
      });
      if (setNandCells) setNandCells(programmedCells);

      // Write to actual storageModel
      if (storageModel && setStorageModel) {
        const res = writeFile(storageModel, {
          id: `${photo.id}-saved-${Date.now()}`,
          name: photo.name,
          title: photo.title,
          size: photo.sizeBytes,
          bytes: new TextEncoder().encode(photo.svg),
          preview: photo.preview,
          kind: 'photo',
          dimensions: photo.dimensions,
          date: 'Just now',
          nandCells: programmedCells,
        });
        if (res.ok) {
          setStorageModel(res.model);
        }
      }
      setSaveSuccessNotice(true);
    }
  }, [currentStageIndex]);

  // Controls Handlers
  const handlePlayPause = () => {
    if (currentStageIndex >= JOURNEY_STAGES.length - 1 && !isPlaying) {
      setCurrentStageIndex(0);
      setSaveSuccessNotice(false);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => Math.min(JOURNEY_STAGES.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
    setSaveSuccessNotice(false);
  };

  const handleSkipToResult = () => {
    setIsPlaying(false);
    setCurrentStageIndex(JOURNEY_STAGES.length - 1);
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px 60px' }}>
      
      {/* Top Header & Educational Mission */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="qml-badge qml-badge-cyan">12-STAGE SIMULATION CONTINUUM</span>
            <span className="qml-badge qml-badge-violet">PHOTO ➔ NAND ➔ QUANTUM TUNNELLING</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 0', color: 'var(--text-main)' }}>
            Real File-to-NAND-to-Electron Simulation
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Trace how human photograph photons become digital binary bits, pass through kernel and controller, and become trapped electrical charges.
          </p>
        </div>

        {/* Source Photo Selector & Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              INPUT PHOTO:
            </span>
            <select
              value={selectedPhotoIndex}
              onChange={(e) => {
                setSelectedPhotoIndex(parseInt(e.target.value));
                handleRestart();
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-main)',
                cursor: 'pointer',
              }}
            >
              {SAMPLE_PHOTOS.map((p, idx) => (
                <option key={p.id} value={idx}>
                  {p.title} ({p.name})
                </option>
              ))}
            </select>
          </div>

          {onNavigateToPhone && (
            <button onClick={onNavigateToPhone} className="qml-btn qml-btn-secondary" style={{ fontSize: '11px', padding: '6px 12px' }}>
              📱 Open Phone Twin
            </button>
          )}
          {onNavigateToNandLab && (
            <button onClick={onNavigateToNandLab} className="qml-btn qml-btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }}>
              ▦ NAND Workstation
            </button>
          )}
        </div>
      </div>

      {/* 12-STAGE PROGRESS TIMELINE BAR */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '16px',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '980px', gap: '4px' }}>
          {JOURNEY_STAGES.map((s, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStageIndex(idx);
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  background: isCurrent ? '#2563eb' : isCompleted ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  border: isCurrent ? '1px solid #2563eb' : isCompleted ? '1px solid #bfdbfe' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '6px 4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    color: isCurrent ? '#FFFFFF' : isCompleted ? '#2563eb' : 'var(--text-secondary)',
                  }}
                >
                  {isCompleted ? '✓ ' : ''}ST.{idx + 1}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: isCurrent ? 800 : 500,
                    color: isCurrent ? '#FFFFFF' : isCompleted ? 'var(--text-main)' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.shortName.split('. ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN DUAL-PANE WORKSPACE: LEFT 3D/DATA VIEWPORT (62%), RIGHT SCIENTIFIC NARRATIVE (38%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(360px, 1fr)',
          gap: '20px',
          alignItems: 'start',
          marginBottom: '20px',
        }}
      >
        {/* LEFT VIEWPORT: Dedicated visual representation based on current stage */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Main Visual Display Container */}
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              height: '460px',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            {/* VIEW A: Stages 1 to 5 (Photograph, Pixel Loupe, File Bytes, VFS, Controller) */}
            {currentStageIndex === 0 && (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{photo.title} ({photo.dimensions})</div>
                  <span className="qml-badge qml-badge-cyan">CMOS Pixel Array</span>
                </div>

                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'center', overflow: 'hidden' }}>
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0d14', borderRadius: '10px', padding: '8px' }}>
                    <img
                      src={photo.preview}
                      alt={photo.title}
                      style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', borderRadius: '6px' }}
                    />
                  </div>

                  {/* Pixel Loupe Magnifier */}
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      OPTICAL SENSOR PIXEL SAMPLING
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Sample Pixel at (X: {selectedPixel.x}, Y: {selectedPixel.y}):
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: `rgb(${selectedPixel.r}, ${selectedPixel.g}, ${selectedPixel.b})`,
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      />
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        <div>R: <strong style={{ color: '#dc2626' }}>{selectedPixel.r}</strong> ({selectedPixel.r.toString(2).padStart(8, '0')})</div>
                        <div>G: <strong style={{ color: '#16a34a' }}>{selectedPixel.g}</strong> ({selectedPixel.g.toString(2).padStart(8, '0')})</div>
                        <div>B: <strong style={{ color: '#2563eb' }}>{selectedPixel.b}</strong> ({selectedPixel.b.toString(2).padStart(8, '0')})</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      Each photodiode converts incident photons into electrons. An ADC measures the analog charge and quantizes it into an 8-bit integer between 0 and 255.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStageIndex === 1 && (
              <div style={{ width: '100%', height: '100%', padding: '18px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>File Container Format & Byte Stream</div>
                  <span className="qml-badge qml-badge-violet">{photo.name}</span>
                </div>

                <div
                  style={{
                    background: '#0f172a',
                    color: '#e2e8f0',
                    borderRadius: '8px',
                    padding: '14px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    lineHeight: 1.6,
                    overflowY: 'auto',
                    flex: 1,
                  }}
                >
                  <div style={{ color: '#38bdf8', marginBottom: '8px' }}>
                    // RAW FILE BYTE STREAM DUMP (HEX OFFSET · BYTES · ASCII)
                  </div>
                  <div>00000000: 3C 73 76 67 20 78 6D 6C 6E 73 3D 22 68 74 74 70  | &lt;svg xmlns="http |</div>
                  <div>00000010: 3A 2F 2F 77 77 77 2E 77 33 2E 6F 72 67 2F 32 30  | ://www.w3.org/20 |</div>
                  <div style={{ background: 'rgba(37, 99, 235, 0.3)', padding: '2px 4px', borderRadius: '4px' }}>
                    00000020: 30 30 2F 73 76 67 22 20 <strong style={{ color: '#f59e0b' }}>41</strong> 6C 70 69 6E 65 20 53  | 00/svg" Alpine S | ➔ Representative Byte 0x41
                  </div>
                  <div>00000030: 75 6E 72 69 73 65 20 50 68 6F 74 6F 67 72 61 70  | unrise Photograp |</div>
                  <div>00000040: 68 79 20 4E 4F 4E 2D 56 4F 4C 41 54 49 4C 45 20  | hy NON-VOLATILE  |</div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  📌 <em>Educational Model Note:</em> A real 2.4 MB photo spans 150+ NAND pages. Here we trace the first representative byte stream down to individual quantum wavepackets and electrons.
                </div>
              </div>
            )}

            {currentStageIndex === 2 && (
              <div style={{ width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>Bit-by-Bit Logic Level Breakdown</div>
                  <span className="qml-badge qml-badge-cyan">Byte: 0x41 (ASCII 'A')</span>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Click on any of the 8 bits below to inspect its memory cell assignment and required quantum tunneling action:
                </div>

                {/* 8 Bits Interactive Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  {targetBits.split('').map((bit, idx) => {
                    const isSelected = activeCellIdx === idx;
                    const requiresElectrons = bit === '0';
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveCellIdx(idx)}
                        style={{
                          background: isSelected ? '#2563eb' : requiresElectrons ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-elevated)',
                          border: isSelected ? '2px solid #2563eb' : requiresElectrons ? '1px solid #bfdbfe' : '1px solid var(--border-light)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                          borderRadius: '8px',
                          padding: '14px 6px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>Bit {7 - idx}</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '4px 0' }}>
                          {bit}
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: isSelected ? '#e0f2fe' : requiresElectrons ? '#2563eb' : '#64748b' }}>
                          Cell {idx}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Bit Detail Box */}
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '13px' }}>
                      Selected: Bit {7 - activeCellIdx} ➔ Value: "{targetBits[activeCellIdx]}" ➔ Memory Transistor C{activeCellIdx}
                    </strong>
                    <span className={`qml-badge ${targetBits[activeCellIdx] === '0' ? 'qml-badge-emerald' : 'qml-badge-cyan'}`}>
                      {targetBits[activeCellIdx] === '0' ? 'Requires Electron Injection' : 'Remains Erased (No Electrons)'}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {targetBits[activeCellIdx] === '0'
                      ? 'Because this bit is "0", the UFS controller must apply a 14.5V Fowler–Nordheim pulse to inject negative electrons into the floating gate, raising threshold voltage Vt above 1.50V.'
                      : 'Because this bit is "1", this memory transistor will NOT receive tunneling electrons. It stays in the erased state with threshold voltage Vt = 0.45V.'}
                  </p>
                </div>
              </div>
            )}

            {currentStageIndex === 3 && (
              <div style={{ width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>Kernel VFS Inode & Logical Cluster Allocator</div>
                  <span className="qml-badge qml-badge-violet">Virtual File System</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', flex: 1 }}>
                  {/* Inode Record */}
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      VFS INODE RECORD DESCRIPTOR
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.7 }}>
                      <div>INODE_ID: <strong>#4096 (POSIX Regular File)</strong></div>
                      <div>FILE_NAME: <strong>{photo.name}</strong></div>
                      <div>FILE_SIZE: <strong>{photo.sizeBytes} Bytes</strong></div>
                      <div>PERMISSIONS: <strong>-rw-r--r-- (0644)</strong></div>
                      <div>TIMESTAMPS: <strong>Modified Today, 09:15:02</strong></div>
                      <div>LBA_SPAN: <strong>LBA 0x00 – LBA 0x01 (2 Clusters)</strong></div>
                    </div>
                  </div>

                  {/* LBA Mapping Pipeline */}
                  <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                      VFS WRITE PIPELINE
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-main)' }}>
                      1. Inode created in RAM buffer<br/>
                      2. Logical 256-byte clusters assigned<br/>
                      3. Kernel driver queues DMA request<br/>
                      4. Dispatched to UFS HCI Controller ASIC
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStageIndex === 4 && (
              <div style={{ width: '100%', height: '100%', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>UFS Controller Flash Translation Layer (FTL)</div>
                  <span className="qml-badge qml-badge-cyan">ASIC Translation Table</span>
                </div>

                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '16px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    FTL LOGICAL-TO-PHYSICAL (L2P) MAPPING TABLE
                  </div>
                  <table style={{ width: '100%', fontSize: '11px', fontFamily: 'var(--font-mono)', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '6px' }}>LOGICAL LBA</th>
                        <th style={{ padding: '6px' }}>PHYSICAL DIE</th>
                        <th style={{ padding: '6px' }}>BLOCK</th>
                        <th style={{ padding: '6px' }}>PAGE</th>
                        <th style={{ padding: '6px' }}>ECC CODE</th>
                        <th style={{ padding: '6px' }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: 'rgba(37, 99, 235, 0.08)', fontWeight: 700, color: '#2563eb' }}>
                        <td style={{ padding: '8px 6px' }}>LBA 0x0000</td>
                        <td style={{ padding: '8px 6px' }}>Die 0</td>
                        <td style={{ padding: '8px 6px' }}>Block 0</td>
                        <td style={{ padding: '8px 6px' }}>Page P00</td>
                        <td style={{ padding: '8px 6px' }}>SECDED (8,4)</td>
                        <td style={{ padding: '8px 6px' }}>ALLOCATED</td>
                      </tr>
                      <tr style={{ color: 'var(--text-secondary)' }}>
                        <td style={{ padding: '8px 6px' }}>LBA 0x0001</td>
                        <td style={{ padding: '8px 6px' }}>Die 0</td>
                        <td style={{ padding: '8px 6px' }}>Block 0</td>
                        <td style={{ padding: '8px 6px' }}>Page P01</td>
                        <td style={{ padding: '8px 6px' }}>SECDED (8,4)</td>
                        <td style={{ padding: '8px 6px' }}>ALLOCATED</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  💡 The FTL assigns free physical pages dynamically so write cycles are distributed evenly across the entire chip (wear leveling), preventing early device failure.
                </div>
              </div>
            )}

            {/* VIEW B: Stages 6 to 12 (3D Interactive Three.js Scene) */}
            {currentStageIndex >= 5 && (
              <FileJourney3DScene
                stage={currentStageIndex + 1}
                activeCell={activeCellIdx}
                targetBits={targetBits}
                pulseIndex={isppResult.pulses.length}
                isTunnelling={currentStageIndex === 8}
                isVerified={currentStageIndex >= 9}
                storedChargeFc={currentStageIndex >= 9 ? isppResult.chargeFc : 0}
              />
            )}
          </div>

          {/* Sub-Panel: Synchronized Scientific Graph (Visible in Stages 9, 10, 11) */}
          {currentStageIndex >= 8 && currentStageIndex <= 10 && (
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  SYNCHRONIZED ISPP VOLTAGE STAIRCASE & THRESHOLD EVOLUTION
                </span>
                <span className="qml-badge qml-badge-emerald" style={{ fontSize: '10px' }}>
                  ISPP Verified in 3 Pulses (Target ≥ 1.50V)
                </span>
              </div>

              {/* Mini SVG ISPP Curve */}
              <svg viewBox="0 0 600 110" style={{ width: '100%', height: '110px', overflow: 'visible' }}>
                <line x1="40" x2="560" y1="90" y2="90" stroke="var(--border-light)" strokeWidth="1" />
                <line x1="40" x2="560" y1="35" y2="35" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="560" y="30" fill="#b45309" fontSize="9" fontFamily="var(--font-mono)" textAnchor="end">
                  Verify Target Vverify = 1.50 V
                </text>

                {/* Voltage staircase (Cyan) */}
                <path d="M 60 85 L 180 75 L 320 65 L 460 55" fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="2,2" />

                {/* Threshold Vt curve (Blue) */}
                <path d="M 60 80 Q 200 65 320 48 T 460 25" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                <circle cx="60" cy="80" r="4" fill="#64748b" stroke="#fff" strokeWidth="1" />
                <circle cx="200" cy="65" r="4" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                <circle cx="340" cy="48" r="4" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                <circle cx="460" cy="25" r="5" fill="#059669" stroke="#fff" strokeWidth="1.5" />

                <text x="60" y="104" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">Pulse 0 (0.45V)</text>
                <text x="200" y="104" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">P1: 14.0V (0.85V)</text>
                <text x="340" y="104" fill="var(--text-secondary)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">P2: 14.5V (1.25V)</text>
                <text x="460" y="104" fill="#059669" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fontWeight="700">P3: 15.0V (1.68V ✓)</text>
              </svg>
            </div>
          )}

          {/* Sub-Panel: Final Success Confirmation Banner (Stage 12) */}
          {currentStageIndex === 11 && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.12))',
                border: '2px solid #059669',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669' }}>
                  ✓ PHYSICAL STORAGE COMPLETE & CONFIRMED
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  FILE SAVED SUCCESSFULLY TO PHYSICAL FLASH MEMORY
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Representative byte verified in B0·P00 · SHA-256 cryptographic match · 10-year non-volatile retention confirmed.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {onNavigateToPhone && (
                  <button onClick={onNavigateToPhone} className="qml-btn qml-btn-primary" style={{ fontSize: '11px' }}>
                    📱 View in Phone Gallery
                  </button>
                )}
                {onNavigateToNandLab && (
                  <button onClick={onNavigateToNandLab} className="qml-btn qml-btn-secondary" style={{ fontSize: '11px' }}>
                    🔍 Inspect in NAND Array
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EDUCATIONAL NARRATIVE & PLAYBACK CONTROLLER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Card 1: Stage Title & Subtitle */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                STAGE {currentStageIndex + 1} OF 12
              </span>
              <span className="qml-badge qml-badge-cyan">{activeStage.scale}</span>
            </div>

            <h2 style={{ fontSize: '19px', fontWeight: 800, margin: '2px 0 4px 0', color: 'var(--text-main)' }}>
              {activeStage.title}
            </h2>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563eb', marginBottom: '16px' }}>
              {activeStage.tag}
            </div>

            {/* THREE MANDATORY EDUCATIONAL SECTIONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* SECTION 1: WHAT IS HAPPENING? */}
              <div style={{ background: 'var(--bg-elevated)', borderLeft: '4px solid #2563eb', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', marginBottom: '2px' }}>
                  WHAT IS HAPPENING?
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {activeStage.what}
                </div>
              </div>

              {/* SECTION 2: WHY IS IT HAPPENING? */}
              <div style={{ background: 'var(--bg-elevated)', borderLeft: '4px solid #f59e0b', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#b45309', marginBottom: '2px' }}>
                  WHY IS IT HAPPENING?
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeStage.why}
                </div>
              </div>

              {/* SECTION 3: WHAT SHOULD I OBSERVE? */}
              <div style={{ background: 'var(--bg-elevated)', borderLeft: '4px solid #059669', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#059669', marginBottom: '2px' }}>
                  WHAT SHOULD I OBSERVE?
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {activeStage.observe}
                </div>
              </div>

            </div>

            {/* Expandable Technical Deep Dive */}
            <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
              <button
                onClick={() => setExpandedTech(!expandedTech)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{expandedTech ? '▼ Hide' : '▶ Show'} Technical Specifications & Equations</span>
              </button>

              {expandedTech && (
                <div
                  style={{
                    marginTop: '8px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '10px',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {Object.entries(activeStage.techDetails).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-light)', paddingBottom: '3px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{k}:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{v}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Interactive Playback Controller */}
          <div
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                SIMULATION CONTROLLER
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>SPEED:</span>
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    style={{
                      background: playbackSpeed === spd ? '#2563eb' : 'var(--bg-elevated)',
                      color: playbackSpeed === spd ? '#FFFFFF' : 'var(--text-secondary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper Buttons Row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handlePrev}
                disabled={currentStageIndex === 0}
                className="qml-btn qml-btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '11px' }}
              >
                ◀ PREVIOUS
              </button>
              <button
                onClick={handlePlayPause}
                className="qml-btn qml-btn-primary"
                style={{ flex: 1.2, padding: '8px', fontSize: '12px', fontWeight: 800 }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>
              <button
                onClick={handleNext}
                disabled={currentStageIndex === JOURNEY_STAGES.length - 1}
                className="qml-btn qml-btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '11px' }}
              >
                NEXT ▶
              </button>
            </div>

            {/* Secondary Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRestart}
                className="qml-btn qml-btn-ghost"
                style={{ flex: 1, padding: '6px', fontSize: '11px' }}
              >
                ↺ RESTART
              </button>
              <button
                onClick={handleSkipToResult}
                className="qml-btn qml-btn-ghost"
                style={{ flex: 1, padding: '6px', fontSize: '11px' }}
              >
                ⏭ SKIP TO RESULT
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
