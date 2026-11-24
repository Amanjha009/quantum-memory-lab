import React, { useState } from 'react';
import StorageJourneyScene from '../scenes/StorageJourneyScene.jsx';

const SCALES = [
  {
    id: 'phone',
    step: 1,
    name: '1. Smartphone Scale',
    dimension: '~150 mm (10⁻¹ m)',
    icon: '📱',
    title: 'Consumer Device & Operating System',
    cameraCaption: 'You are viewing the entire consumer smartphone. Here, human actions capture images and generate digital file requests.',
    description: 'The macroscopic starting point. User actions in the Photos or Files app produce virtual memory byte streams requesting durable non-volatile persistence.',
    role: 'Captures photons on CMOS camera sensor, encodes JPEG compressed raster bytes, and issues asynchronous block write commands via the kernel virtual file system (VFS).',
  },
  {
    id: 'package',
    step: 2,
    name: '2. Storage Chip (UFS BGA)',
    dimension: '11.5 × 13.0 mm (10⁻² m)',
    icon: '🔲',
    title: 'Universal Flash Storage (UFS) Module',
    cameraCaption: 'Zooming inside the phone: we are looking at the surface-mounted BGA semiconductor package soldered to the logic board.',
    description: 'The multi-chip package soldered onto the smartphone motherboard. Encapsulates a multi-core controller ASIC alongside multiple stacked NAND dies.',
    role: 'Implements the UFS 4.0 differential M-PHY serial bus, protocol engine, high-speed SRAM buffers, and TurboWrite SLC acceleration cache.',
  },
  {
    id: 'die',
    step: 3,
    name: '3. NAND Memory Array',
    dimension: '6.5 × 8.2 mm',
    icon: '▦',
    title: '3D NAND Monolithic Die & Array Planes',
    cameraCaption: 'Entering the silicon die: we see the massive array of memory planes containing billions of interconnected bit lines and word lines.',
    description: 'A single silicon chip housing multiple memory planes, high-voltage charge pumps (generating 14V–24V on-chip), page buffers, and sense amplifiers.',
    role: 'Coordinates high-voltage wordline decoding, bitline sensing, and block management across billions of memory cells.',
  },
  {
    id: 'block',
    step: 4,
    name: '4. Memory Block',
    dimension: '~500 µm (10⁻⁴ m)',
    icon: '◫',
    title: 'Physical NAND Erase Block',
    cameraCaption: 'Focusing into one memory block: this is the smallest unit of flash memory that can be erased simultaneously.',
    description: 'The fundamental physical unit of erasure. In solid-state physics, memory transistors cannot be erased individually; an entire block must receive reverse-field pulses simultaneously.',
    role: 'Contains a group of pages (typically 128 to 512 pages in commercial chips; 8 representative pages in this teaching lab).',
  },
  {
    id: 'page',
    step: 5,
    name: '5. Memory Page & Cell',
    dimension: '~100 µm to 30 nm',
    icon: '≡',
    title: 'Physical Memory Page & Word Line',
    cameraCaption: 'We are now looking at one active memory cell inside the selected wordline page.',
    description: 'The fundamental physical unit of reading and programming. Memory cells sharing the same word line are programmed in parallel using ISPP pulses.',
    role: 'Holds 4 KB to 16 KB of user payload plus ECC parity spare area (256 representative bytes in this simulator).',
  },
  {
    id: 'transistor',
    step: 6,
    name: '6. Floating-Gate Transistor',
    dimension: '~30 nm (10⁻⁸ m)',
    icon: '⌁',
    title: 'Floating-Gate MOSFET Device',
    cameraCaption: 'We are now examining the complete 3D floating-gate transistor with its Source, Drain, Channel, and isolated Floating Gate.',
    description: 'The core physical unit of information storage. A modified field-effect transistor with an electrically isolated polysilicon conductor sandwiched between dielectrics.',
    role: 'Transfers electrons through the tunnel oxide under high fields; trapped electrons screen the control gate and shift the transistor threshold voltage Vt.',
  },
  {
    id: 'oxide',
    step: 7,
    name: '7. Tunnel Oxide Barrier',
    dimension: '9.0 nm (10⁻⁹ m)',
    icon: '☵',
    title: 'Silicon Dioxide (SiO₂) Potential Barrier',
    cameraCaption: 'We are now examining the ultra-thin 9 nm oxide separating the silicon channel from the floating gate.',
    description: 'A thin, atomically smooth amorphous layer of SiO₂ (~30 silicon atom layers thick) with a 3.1 eV conduction band energy barrier.',
    role: 'Classical insulator preventing charge escape. Under high electric fields (~1 GV/m), band bending allows wavepacket penetration via Fowler–Nordheim emission.',
  },
  {
    id: 'wavefunction',
    step: 8,
    name: '8. Quantum Wavefunction',
    dimension: 'λ_dB ≈ 1.2 nm (10⁻¹⁰ m)',
    icon: 'ψ',
    title: 'Electron Wavepacket & Quantum Scattering',
    cameraCaption: 'At the fundamental quantum limit: electrons behave as probability amplitude waves governed by the Schrödinger equation.',
    description: 'At the sub-nanometre scale, the electron behaves not as a hard billiard ball, but as a complex probability amplitude wave described by the Schrödinger equation.',
    role: 'The non-zero tail of the wavefunction penetrates the classically forbidden potential barrier, giving a finite probability of emergence on the opposite side.',
  },
];

export default function ArchitectureView({ onOpenTunnelLab, onOpenSmartphone }) {
  const [viewMode, setViewMode] = useState('3d-journey'); // '3d-journey' | 'scales'
  const [activeScaleIndex, setActiveScaleIndex] = useState(5); // Default to Transistor

  const activeScale = SCALES[activeScaleIndex];

  const handlePrev = () => {
    setActiveScaleIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveScaleIndex((prev) => Math.min(SCALES.length - 1, prev + 1));
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px 60px' }}>

      {/* Top View Selector: 3D Storage Journey vs Multiscale Continuum */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('3d-journey')}
            className={`qml-btn ${viewMode === '3d-journey' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            🎬 3D CINEMATIC STORAGE JOURNEY
          </button>
          <button
            onClick={() => setViewMode('scales')}
            className={`qml-btn ${viewMode === 'scales' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
            style={{ fontSize: '12px', padding: '8px 16px' }}
          >
            📏 MULTISCALE REFERENCE (10⁻¹ m ➔ 10⁻¹⁰ m)
          </button>
        </div>

        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
          Physical Architecture · 5 Discrete Hardware Stages
        </div>
      </div>

      {/* MODE 1: 3D CINEMATIC STORAGE JOURNEY (Interactive Three.js scene) */}
      {viewMode === '3d-journey' && (
        <StorageJourneyScene
          onOpenQuantumLab={onOpenTunnelLab}
          onReturnToPhone={onOpenSmartphone}
        />
      )}

      {/* MODE 2: MULTISCALE REFERENCE TAXONOMY */}
      {viewMode === 'scales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
              Multiscale Spatial Reference Continuum
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Step through the 8 physical powers of ten connecting human interaction to quantum wave mechanics.
            </p>
          </div>

          {/* Stepper Navigation */}
          <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                ACTIVE SCALE LEVEL ({activeScale.step} OF {SCALES.length}):
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handlePrev}
                  disabled={activeScaleIndex === 0}
                  className="qml-btn qml-btn-secondary"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  ◀ PREVIOUS SCALE
                </button>
                <button
                  onClick={handleNext}
                  disabled={activeScaleIndex === SCALES.length - 1}
                  className="qml-btn qml-btn-primary"
                  style={{ fontSize: '11px', padding: '6px 14px' }}
                >
                  NEXT SCALE ▶
                </button>
              </div>
            </div>

            {/* 8-Scale Progress Tiles */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '8px',
              }}
            >
              {SCALES.map((scale, idx) => {
                const isCurrent = idx === activeScaleIndex;
                return (
                  <button
                    key={scale.id}
                    onClick={() => setActiveScaleIndex(idx)}
                    style={{
                      background: isCurrent ? '#2563eb' : 'var(--bg-elevated)',
                      border: isCurrent ? '1px solid #2563eb' : '1px solid var(--border-light)',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px' }}>{scale.icon}</span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontFamily: 'var(--font-mono)',
                          color: isCurrent ? '#FFFFFF' : 'var(--text-secondary)',
                        }}
                      >
                        {scale.dimension}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isCurrent ? '#FFFFFF' : 'var(--text-main)',
                        lineHeight: 1.3,
                      }}
                    >
                      {scale.name.split('. ')[1]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Focus Card */}
          <div
            className="glass-panel"
            style={{
              padding: '28px',
              borderRadius: '16px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)',
              gap: '28px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="qml-badge qml-badge-cyan" style={{ fontSize: '11px' }}>
                  SCALE {activeScale.step}: {activeScale.dimension}
                </span>
                <span className="qml-badge qml-badge-violet" style={{ fontSize: '11px' }}>
                  {activeScale.name.toUpperCase()}
                </span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 10px 0' }}>
                {activeScale.title}
              </h2>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  borderLeft: '4px solid #2563eb',
                  padding: '12px 16px',
                  borderRadius: '0 8px 8px 0',
                  fontSize: '13px',
                  color: 'var(--text-main)',
                  fontStyle: 'italic',
                  marginBottom: '16px',
                  lineHeight: 1.5,
                }}
              >
                "{activeScale.cameraCaption}"
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px 0' }}>
                {activeScale.description}
              </p>

              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                }}
              >
                <strong style={{ color: 'var(--text-main)' }}>Physical Function:</strong> {activeScale.role}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onOpenTunnelLab} className="qml-btn qml-btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  🔬 OPEN IN QUANTUM LAB ➔
                </button>
                <button onClick={onOpenSmartphone} className="qml-btn qml-btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  📱 GO TO SMARTPHONE TWIN ➔
                </button>
              </div>
            </div>

            {/* Right Coupling Card */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: '12px',
                padding: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                CROSS-SCALE COUPLING PIPELINE
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                1. User Application: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Photo Sensor ➔ Compressed JPEG Buffer</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                2. OS Kernel VFS: <span style={{ color: '#2563eb' }}>Inode File Metadata ➔ LBA Address</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                3. UFS Controller FTL: <span style={{ color: '#8b5cf6' }}>LBA ➔ Physical Block/Page PPA</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                4. NAND Row Decoder: <span style={{ color: '#059669' }}>Energizes Word Line (ISPP 18V)</span>
              </div>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                5. Quantum Transport: <span style={{ color: '#d97706' }}>J_FN ∝ F² exp(−B / F)</span>
              </div>
              <div>
                6. Trapped Charge Shift: <span style={{ color: '#0284c7' }}>ΔVt = ΔQ / Ccg (Stored Non-Volatile Bit)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
