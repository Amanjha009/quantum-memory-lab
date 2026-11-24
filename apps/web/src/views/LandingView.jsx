import React, { lazy, Suspense } from 'react';

const LandingScene = lazy(() => import('../scenes/LandingScene.jsx'));

const JOURNEY_STEPS = [
  { step: '01', title: 'SMARTPHONE', target: 'smartphone', desc: 'Camera sensor captures photons & writes raw binary bytes into virtual memory.' },
  { step: '02', title: 'FILE SYSTEM', target: 'architecture', desc: 'VFS allocates logical inodes, 256-byte clusters, and prepares storage metadata.' },
  { step: '03', title: 'UFS CONTROLLER', target: 'architecture', desc: 'Flash Translation Layer (FTL) routes logical addresses to physical flash blocks.' },
  { step: '04', title: 'NAND ARRAY', target: 'nand-lab', desc: 'Dense 3D monolithic die with intersecting Word Lines and Bit Lines.' },
  { step: '05', title: 'MEMORY BLOCK', target: 'nand-lab', desc: 'Smallest erasable unit. Pages must be written sequentially; erase is block-wide.' },
  { step: '06', title: 'MEMORY TRANSISTOR', target: 'quantum-lab', desc: 'Floating-gate MOSFET with isolated conductor sandwiched by dielectrics.' },
  { step: '07', title: 'OXIDE BARRIER', target: 'quantum-lab', desc: '9-nanometre SiO₂ insulator with 3.1 eV barrier height preventing classical escape.' },
  { step: '08', title: 'ELECTRON TUNNELLING', target: 'quantum-lab', desc: 'High field tilts band; wavepackets penetrate classically forbidden region.' },
  { step: '09', title: 'STORED CHARGE', target: 'nand-lab', desc: 'Electrons trapped in floating gate shift threshold voltage Vt, encoding digital bits.' },
];

const LAB_CARDS = [
  {
    id: 'smartphone',
    title: 'Live Smartphone Digital Twin',
    tag: 'SYSTEM INTEGRATION',
    icon: '▯',
    desc: 'Operate a virtual smartphone: capture photos, save documents, delete files, restore from trash, and trigger real garbage collection. Watch every file-system operation propagate live to physical NAND blocks.',
    badge: 'INTERACTIVE TWIN',
    stats: ['VFS Inodes', 'UFS DMA', 'Garbage Collection'],
  },
  {
    id: 'quantum-lab',
    title: 'Quantum Tunnelling Lab',
    tag: 'MICROSCOPIC PHYSICS',
    icon: '⌁',
    desc: '1D Schrödinger finite-difference wave solver. Adjust oxide thickness (5–15 nm), barrier height (2–4 eV), and electric field. Compare numerical transmission against semiclassical WKB and calculate Fowler–Nordheim current density in SI units.',
    badge: 'NUMERICAL SOLVER',
    stats: ['1D Schrödinger', 'WKB Integral', 'Fowler–Nordheim J_FN'],
  },
  {
    id: 'nand-lab',
    title: 'NAND Engineering Workstation',
    tag: 'DEVICE ENGINEERING',
    icon: '▦',
    desc: 'Step pulse-by-pulse through Incremental Step Pulse Programming (ISPP). Observe high-voltage programming pulses (14V–24V), verify thresholds, reverse-field block erase, and SLC sensing margin comparisons.',
    badge: 'ISPP & VERIFY',
    stats: ['Pulse-by-Pulse ISPP', 'Verify Senses', 'Block Erase'],
  },
  {
    id: 'reliability',
    title: 'Retention & Endurance Laboratory',
    tag: 'DEVICE RELIABILITY',
    icon: '⏳',
    desc: 'Model accelerated oxide wear over 10,000 P/E cycles. Inspect threshold voltage distribution widening (σ_Vt), defect generation, and Arrhenius thermal charge loss over decades of storage at room and elevated temperatures.',
    badge: 'ARRHENIUS & WEAR',
    stats: ['P/E Cycle Wear', 'Threshold Widening', '10-Year Retention'],
  },
  {
    id: 'integrity',
    title: 'File Integrity & SECDED ECC',
    tag: 'INFORMATION THEORY',
    icon: '🛡',
    desc: 'Inject stochastic bit errors into payload bytes using reproducible linear congruential seeds. Run extended Hamming (8,4) SECDED syndrome decoding to correct single-bit flips, detect double-bit faults, and verify SHA-256 hashes.',
    badge: 'ERROR CORRECTION',
    stats: ['SECDED (8,4)', 'Syndrome Decoding', 'SHA-256 Digest'],
  },
  {
    id: 'comparison',
    title: 'Architecture Comparison',
    tag: 'SEMICONDUCTOR ARCHITECTURE',
    icon: '▥',
    desc: 'Side-by-side comparative analysis of classic planar conductive Floating-Gate cells versus modern 3D Charge-Trap Nitride (CTN) vertical NAND strings used in multi-terabyte smartphone storage chips.',
    badge: '3D V-NAND',
    stats: ['Floating Gate', 'Charge Trap Nitride', '128-Layer Strings'],
  },
  {
    id: 'guided',
    title: '10 Guided Experiments & Challenges',
    tag: 'EDUCATIONAL LAB',
    icon: '🧪',
    desc: 'Structured scientific curriculum from quantum wave mechanics to memory device physics. Includes live parameter manipulation, guided observation steps, quantitative questions, and practical semiconductor engineering challenges.',
    badge: '10 EXPERIMENTS',
    stats: ['Step-by-Step Curriculum', 'Engineering Challenges', 'Interactive Quizzes'],
  },
  {
    id: 'references',
    title: 'Scientific References & Mathematics',
    tag: 'THEORETICAL FOUNDATION',
    icon: '∑',
    desc: 'Complete mathematical formulations: time-independent Schrödinger equation, Thomas tridiagonal scattering solver, Fowler–Nordheim field emission constants, and SI unit dimensional derivations.',
    badge: 'FORMAL MATH',
    stats: ['Equations & Limits', 'RSC Constants', 'Peer-Reviewed Sources'],
  },
];

export default function LandingView({ onNavigate }) {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Hero Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1.15fr) minmax(320px, 0.85fr)',
        gap: '36px',
        alignItems: 'center',
        minHeight: '520px',
        marginBottom: '64px'
      }} className="landing-hero-grid">
        
        {/* Left Column: Headlines & Call to Action */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <span className="qml-badge qml-badge-cyan">
              <span className="status-dot cyan pulse" />
              SCIENTIFIC SIMULATOR · SOLID STATE PHYSICS
            </span>
            <span className="qml-badge qml-badge-violet">SI UNITS THROUGHOUT</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(34px, 4.2vw, 54px)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            color: '#fff',
            margin: '0 0 18px 0'
          }}>
            Explore the <span style={{
              background: 'linear-gradient(135deg, var(--cyan-400), var(--violet-400))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Quantum Physics</span> Inside Your Digital World.
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.65,
            color: 'var(--text-normal)',
            maxWidth: '620px',
            margin: '0 0 28px 0'
          }}>
            Every photograph, document, and app stored on your phone depends on a phenomenon that classical physics says is impossible.
            Billions of electrons quantum-tunnel through a solid 9-nanometre silicon dioxide insulator to store your data without continuous power.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <button
              onClick={() => onNavigate('smartphone')}
              className="qml-btn qml-btn-primary"
              style={{ padding: '14px 28px', fontSize: '13px' }}
            >
              START EXPLORATION ➔
            </button>
            <button
              onClick={() => onNavigate('quantum-lab')}
              className="qml-btn qml-btn-secondary"
              style={{ padding: '14px 22px', fontSize: '13px' }}
            >
              LAUNCH QUANTUM LAB ⌁
            </button>
            <button
              onClick={() => onNavigate('guided')}
              className="qml-btn qml-btn-ghost"
              style={{ padding: '14px 18px', fontSize: '13px' }}
            >
              GUIDED EXPERIMENTS 🧪
            </button>
          </div>

          {/* Micro Telemetry Bar */}
          <div className="telemetry-rack">
            <div className="telemetry-channel">
              <span className="telemetry-channel-label">BARRIER THICKNESS</span>
              <span className="telemetry-channel-val text-cyan">9.00 nm SiO₂</span>
            </div>
            <div className="telemetry-channel">
              <span className="telemetry-channel-label">ELECTRIC FIELD</span>
              <span className="telemetry-channel-val text-violet">~1.10 GV/m</span>
            </div>
            <div className="telemetry-channel">
              <span className="telemetry-channel-label">FN CURRENT DENSITY</span>
              <span className="telemetry-channel-val text-emerald">1.59×10⁴ A/m²</span>
            </div>
            <div className="telemetry-channel">
              <span className="telemetry-channel-label">CHARGE RETENTION</span>
              <span className="telemetry-channel-val text-amber">&gt; 10 Years</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Semiconductor Chip Viewport */}
        <div className="glass-panel crosshair-corners" style={{
          height: '460px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Suspense fallback={
            <div style={{
              display: 'grid',
              placeItems: 'center',
              height: '100%',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--cyan-400)'
            }}>
              INITIALIZING 3D SEMICONDUCTOR MODEL…
            </div>
          }>
            <LandingScene />
          </Suspense>
        </div>
      </section>

      {/* The 9-Stage Continuum Journey */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ marginBottom: '22px' }}>
          <div className="qml-badge qml-badge-cyan" style={{ marginBottom: '8px' }}>THE PHYSICAL CONTINUUM</div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>
            From Classical Bytes to Quantum Wavepackets
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, maxWidth: '780px' }}>
            Every level of digital storage is connected. Click any stage to jump directly into the simulation:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }} className="journey-grid">
          {JOURNEY_STEPS.map((item, idx) => (
            <button
              key={item.step}
              onClick={() => onNavigate(item.target)}
              className="glass-panel"
              style={{
                padding: '16px 12px',
                textAlign: 'left',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(14, 22, 39, 0.75)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.2s ease',
                color: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan-400)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan-400)' }}>
                  STAGE {item.step}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.4 }}>➔</span>
              </div>
              <b style={{ fontSize: '12px', color: '#fff', lineHeight: 1.3, letterSpacing: '0.2px' }}>
                {item.title}
              </b>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Laboratory Modules Overview Grid */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ marginBottom: '24px' }}>
          <div className="qml-badge qml-badge-violet" style={{ marginBottom: '8px' }}>EXPLORATION MODULES</div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>
            Interactive Scientific Workstations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Dedicated workstations with rigorous mathematical models, interactive 3D visualizations, and precision controls:
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {LAB_CARDS.map((card) => (
            <div
              key={card.id}
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="qml-badge qml-badge-cyan" style={{ fontSize: '10px' }}>
                    {card.tag}
                  </span>
                  <span style={{ fontSize: '18px' }}>{card.icon}</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 10px 0' }}>
                  {card.title}
                </h3>

                <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-normal)', margin: '0 0 18px 0' }}>
                  {card.desc}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {card.stats.map((s) => (
                    <span key={s} style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(255, 255, 255, 0.04)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)'
                    }}>
                      • {s}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate(card.id)}
                className="qml-btn qml-btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>OPEN WORKSTATION</span>
                <span>➔</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Scientific Principles Section */}
      <section className="glass-panel crosshair-corners" style={{ padding: '36px', background: 'rgba(10, 16, 30, 0.85)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '32px' }} className="principles-grid">
          <div>
            <div className="qml-badge qml-badge-emerald" style={{ marginBottom: '12px' }}>PHYSICAL RIGOR & INTEGRITY</div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 14px 0' }}>
              True Numerical Modeling, Not Decorative Visuals
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-normal)', margin: '0 0 14px 0' }}>
              Unlike generic educational animations, Quantum Memory Lab runs actual numerical solutions on every parameter change.
              Changing the oxide thickness immediately recalculates the 1D stationary Schrödinger wave solution, evaluates the semiclassical
              WKB integral, computes the Fowler–Nordheim field emission current density, and updates the cell threshold voltage.
            </p>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-muted)', margin: 0 }}>
              All equations, boundary conditions, and illustrative assumptions are completely transparent and documented according to peer-reviewed solid-state semiconductor physics.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            background: 'rgba(5, 8, 15, 0.65)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ color: 'var(--cyan-400)', fontWeight: 600 }}>GOVERNING EQUATIONS IN ENGINE:</div>
            <div style={{ color: '#cbd5e1' }}>1. Schrödinger 1D: <code style={{ color: 'var(--cyan-300)' }}>-(ℏ²/2m*) ∂²ψ/∂x² + V(x)ψ = Eψ</code></div>
            <div style={{ color: '#cbd5e1' }}>2. WKB Transmission: <code style={{ color: 'var(--violet-300)' }}>T ≈ exp(-2 ∫ κ(x) dx)</code></div>
            <div style={{ color: '#cbd5e1' }}>3. Fowler–Nordheim: <code style={{ color: 'var(--emerald-400)' }}>J_FN = (A F²/φ) exp(-B φ^1.5 / F)</code></div>
            <div style={{ color: '#cbd5e1' }}>4. Transferred Charge: <code style={{ color: 'var(--amber-400)' }}>ΔQ = J_FN · A_eff · t_pulse</code></div>
            <div style={{ color: '#cbd5e1' }}>5. Threshold Shift: <code style={{ color: '#fff' }}>ΔV_t = ΔQ / C_cg</code></div>
          </div>
        </div>
      </section>

    </div>
  );
}
