import React, { useState } from 'react';

const ARCHITECTURES = {
  floating: {
    id: 'floating',
    name: 'Floating-Gate NAND (FG)',
    storageMedium: 'Isolated Polycrystalline Silicon Conductor',
    trappingMechanism: 'Conductive continuous potential well; stored electrons move freely throughout the isolated poly-Si island.',
    scalingLimit: 'Physical cell-to-cell capacitive cross-talk limits planar scaling below ~15 nm.',
    endurance: '~1,000 to 10,000 P/E cycles before oxide defect leakage discharges the continuous conductor.',
    stackability: 'Primarily planar (2D). Difficult to manufacture vertically due to high aspect ratio floating-gate etching.',
    layers: [
      { name: 'Control Gate (CG)', color: '#7b95a8', desc: 'Applies ISPP pulses (14V–24V) to couple electric field into the floating gate.' },
      { name: 'Inter-Poly Dielectric (IPD)', color: '#8baac4', desc: 'Oxide-Nitride-Oxide (ONO) dielectric preventing charge loss upward into control gate.' },
      { name: 'Floating Gate (FG)', color: '#38bdf8', desc: 'Conductive poly-Si island holding stored charge packets.' },
      { name: 'Tunnel Oxide (SiO₂)', color: '#00f0ff', desc: '9 nm thermal oxide layer supporting Fowler–Nordheim tunneling.' },
      { name: 'Silicon Substrate / Channel', color: '#475569', desc: 'Bulk semiconductor substrate forming source/drain inversion channel.' },
    ],
  },
  trap: {
    id: 'trap',
    name: '3D Charge-Trap NAND (CTN / V-NAND)',
    storageMedium: 'Insulating Silicon Nitride (Si₃N₄) Layer',
    trappingMechanism: 'Localized discrete electron trap sites. Electrons remain pinned in atomic defect traps; a defect in the oxide only leaks localized electrons rather than discharging the entire gate.',
    scalingLimit: 'Overcomes planar cross-talk limits by stacking 128 to 300+ vertical wordline layers in a 3D cylindrical hole.',
    endurance: 'Higher endurance (~3,000 to 30,000 P/E cycles) due to thinner effective tunnel oxide and discrete trap isolation.',
    stackability: 'Native 3D monolithic architecture. Drilled as high-aspect-ratio vertical channel pillars through hundreds of alternating oxide/nitride layers.',
    layers: [
      { name: 'Word Line Metal (WL)', color: '#cbd5e1', desc: 'Tungsten metallization wrapping around the vertical cylindrical channel.' },
      { name: 'Blocking Dielectric Layer', color: '#93c5fd', desc: 'High-κ dielectric (Al₂O₃) blocking electron flow from the charge-trap layer outward into wordline.' },
      { name: 'Silicon Nitride (Si₃N₄) Trap', color: '#a855f7', desc: 'Insulating nitride layer holding electrons in discrete, localized quantum defect traps.' },
      { name: 'Tunnel Oxide (SiO₂ / ONO)', color: '#00f0ff', desc: 'Ultra-thin engineered dielectric through which electrons tunnel during programming.' },
      { name: 'Vertical Poly-Si Channel', color: '#e2b86f', desc: 'Hollow or core-filled vertical semiconductor cylinder conducting current vertically.' },
    ],
  },
};

export default function ComparisonView({ onOpenTunnelLab }) {
  const [activeArchId, setActiveArchId] = useState('floating');
  const [selectedLayerIndex, setSelectedLayerIndex] = useState(2);

  const arch = ARCHITECTURES[activeArchId];
  const activeLayer = arch.layers[selectedLayerIndex] || arch.layers[2];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="qml-badge qml-badge-violet">MODULE 07 · ARCHITECTURE COMPARISON</span>
          <span className="qml-badge qml-badge-cyan">FLOATING GATE VS 3D CHARGE-TRAP NITRIDE</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Semiconductor Memory Architectures
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, maxWidth: '780px' }}>
          Where charge lives fundamentally dictates memory scalability and reliability. Compare the classic planar
          conductive Floating-Gate architecture with modern 3D vertical Charge-Trap Nitride (CTN) structures.
        </p>
      </div>

      {/* Architecture Toggle Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => {
            setActiveArchId('floating');
            setSelectedLayerIndex(2);
          }}
          className="qml-btn"
          style={{
            background: activeArchId === 'floating' ? 'var(--cyan-500)' : 'var(--bg-elevated)',
            color: activeArchId === 'floating' ? '#041017' : 'var(--text-muted)',
            borderColor: activeArchId === 'floating' ? 'var(--cyan-400)' : 'var(--border-subtle)',
            padding: '10px 22px',
          }}
        >
          CLASSIC FLOATING GATE (PLANAR SLC)
        </button>
        <button
          onClick={() => {
            setActiveArchId('trap');
            setSelectedLayerIndex(2);
          }}
          className="qml-btn"
          style={{
            background: activeArchId === 'trap' ? 'var(--violet-500)' : 'var(--bg-elevated)',
            color: activeArchId === 'trap' ? '#fff' : 'var(--text-muted)',
            borderColor: activeArchId === 'trap' ? 'var(--violet-400)' : 'var(--border-subtle)',
            padding: '10px 22px',
          }}
        >
          3D CHARGE-TRAP NITRIDE (VERTICAL V-NAND)
        </button>
      </div>

      {/* Main Grid: Layer Stack & Vertical 3D NAND Tower */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(300px, 0.85fr)',
        gap: '24px',
        alignItems: 'start',
        marginBottom: '32px'
      }} className="principles-grid">
        
        {/* Layer Stack Interactive Inspector */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan-400)', fontWeight: 600 }}>
                LAYER STACK GEOMETRY
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>
                {arch.name}
              </h2>
            </div>
            <span className="qml-badge qml-badge-cyan">5 FUNCTIONAL LAYERS</span>
          </div>

          {/* Interactive Layer Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {arch.layers.map((layer, idx) => {
              const isSelected = selectedLayerIndex === idx;
              return (
                <button
                  key={layer.name}
                  onClick={() => setSelectedLayerIndex(idx)}
                  style={{
                    background: isSelected ? 'rgba(0, 240, 255, 0.18)' : 'rgba(16, 26, 48, 0.65)',
                    border: `1px solid ${isSelected ? 'var(--cyan-400)' : 'var(--border-subtle)'}`,
                    borderRadius: '8px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'inherit',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '3px',
                      background: layer.color,
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }} />
                    <b style={{ fontSize: '13px', color: isSelected ? '#fff' : '#cbd5e1' }}>
                      {layer.name}
                    </b>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan-400)' }}>
                    {isSelected ? 'INSPECTING ➔' : 'SELECT'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Layer Details Card */}
          <div style={{
            background: 'rgba(5, 8, 15, 0.75)',
            borderLeft: `3px solid ${activeLayer.color}`,
            borderRadius: '0 8px 8px 0',
            padding: '14px 18px'
          }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '4px' }}>
              SELECTED LAYER ROLE
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              {activeLayer.name}
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-normal)', lineHeight: 1.6 }}>
              {activeLayer.desc}
            </p>
          </div>
        </section>

        {/* 3D Vertical String Visual Representation */}
        <section className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--violet-400)', fontWeight: 600 }}>
              VERTICAL ARRAY REPRESENTATION
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>
              Stacked 3D Memory Column
            </h2>
          </div>

          {/* Vertical String Layers */}
          <div style={{
            background: 'rgba(5, 8, 15, 0.85)',
            border: '1px solid var(--border-medium)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)', marginBottom: '4px' }}>
              BIT LINE DRAIN SELECT GATE (SGD)
            </div>

            {Array.from({ length: 6 }, (_, i) => 5 - i).map((lvl) => (
              <div
                key={lvl}
                style={{
                  width: '90%',
                  background: 'rgba(16, 26, 48, 0.85)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px'
                }}
              >
                <span style={{ color: 'var(--violet-300)' }}>WORD LINE WL_{lvl}</span>
                <span style={{ color: 'var(--text-dim)' }}>
                  {activeArchId === 'floating' ? 'Planar Poly-Si FG' : 'Cylindrical Si₃N₄ Trap'}
                </span>
                <span style={{ color: 'var(--cyan-400)' }}>
                  {activeArchId === 'floating' ? 'Continuous Island' : 'Discrete Trap'}
                </span>
              </div>
            ))}

            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)', marginTop: '4px' }}>
              COMMON SOURCE LINE SELECT GATE (SGS)
            </div>
          </div>
        </section>

      </div>

      {/* Comparative Specification Matrix */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0' }}>
          Physical Architecture Comparison Matrix
        </h3>

        <div style={{
          overflowX: 'auto',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                <th style={{ padding: '10px 14px' }}>METRIC / PROPERTY</th>
                <th style={{ padding: '10px 14px', color: 'var(--cyan-400)' }}>FLOATING-GATE NAND (THIS LAB)</th>
                <th style={{ padding: '10px 14px', color: 'var(--violet-400)' }}>3D CHARGE-TRAP V-NAND</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 14px', color: '#fff' }}>Charge Storage Island</td>
                <td style={{ padding: '12px 14px', color: 'var(--cyan-300)' }}>Conductive Polysilicon</td>
                <td style={{ padding: '12px 14px', color: 'var(--violet-300)' }}>Insulating Silicon Nitride (Si₃N₄)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 14px', color: '#fff' }}>Charge Confinement</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-normal)' }}>Continuous potential well</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-normal)' }}>Deep localized atomic traps</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 14px', color: '#fff' }}>Oxide Defect Sensitivity</td>
                <td style={{ padding: '12px 14px', color: 'var(--amber-400)' }}>High (single oxide leak drains whole FG)</td>
                <td style={{ padding: '12px 14px', color: 'var(--emerald-400)' }}>Low (leak only drains adjacent local traps)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <td style={{ padding: '12px 14px', color: '#fff' }}>3D Vertical Scalability</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Severe aspect ratio limits</td>
                <td style={{ padding: '12px 14px', color: 'var(--emerald-400)' }}>128 to 300+ vertical layers</td>
              </tr>
              <tr>
                <td style={{ padding: '12px 14px', color: '#fff' }}>Typical P/E Endurance</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>1,000 – 10,000 P/E</td>
                <td style={{ padding: '12px 14px', color: 'var(--emerald-400)' }}>3,000 – 30,000 P/E</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
