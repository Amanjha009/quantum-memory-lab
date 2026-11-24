import React from 'react';

export default function ScientificReferencesView() {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="qml-badge qml-badge-violet">MODULE 09 · SCIENTIFIC FOUNDATION</span>
          <span className="qml-badge qml-badge-cyan">GOVERNING EQUATIONS & LIMITATIONS</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Scientific References & Mathematical Formulation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, maxWidth: '780px' }}>
          All physics calculations in Quantum Memory Lab operate in strict SI units internally.
          Below is the complete mathematical and physical documentation of the implemented solvers, boundary conditions, and model limits.
        </p>
      </div>

      {/* Grid of Equations and Derivations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)', gap: '24px', marginBottom: '32px' }} className="principles-grid">
        
        {/* 1. 1D Schrödinger Scattering Solver */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="qml-badge qml-badge-cyan" style={{ marginBottom: '10px' }}>QUANTUM WAVE MECHANICS</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
            1. 1D Stationary Schrödinger Scattering Solver
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-normal)', margin: '0 0 14px 0' }}>
            The time-independent Schrödinger equation across the 1D oxide barrier of thickness tox is discretized using a 3-point complex finite-difference scheme over N = 180 spatial grid nodes with spacing Δx = tox / N:
          </p>

          <div style={{
            background: 'rgba(5, 8, 15, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--cyan-300)',
            marginBottom: '14px',
            lineHeight: 1.6
          }}>
            ψ[i+1] − 2ψ[i] + ψ[i−1] + (2 m* Δx² / ℏ²) [E − V[i]] ψ[i] = 0
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            <strong>Boundary Conditions:</strong> At x = 0 (silicon substrate lead), boundary conditions represent an incident plane wave plus reflected wave: ψ(0) = e^(ik_L x) + r e^(-ik_L x). At x = tox (floating gate lead), an outgoing transmitted wave boundary condition ψ(tox) = t e^(ik_R x) is enforced. The resulting complex tridiagonal matrix is solved exactly using the complex Thomas algorithm.
          </p>
        </div>

        {/* 2. Fowler–Nordheim Field Emission */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="qml-badge qml-badge-violet" style={{ marginBottom: '10px' }}>SOLID STATE FIELD EMISSION</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
            2. Fowler–Nordheim Field Emission Current
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-normal)', margin: '0 0 14px 0' }}>
            When electric field F across the oxide exceeds ~0.5 GV/m, the conduction band tilts into a triangular potential barrier V(x) = max(0, φB − e F x). Current density J_FN follows the standard field emission formula:
          </p>

          <div style={{
            background: 'rgba(5, 8, 15, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--violet-300)',
            marginBottom: '14px',
            lineHeight: 1.6
          }}>
            J_FN = (A_FN · F² / φB) × exp(−B_FN · φB^1.5 / F)
          </div>

          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div>• First FN Constant: <strong>A_FN = 1.541434 × 10⁻⁶ A·eV·V⁻²</strong></div>
            <div>• Second FN Constant: <strong>B_FN = 6.83089 × 10⁹ V·m⁻¹·eV⁻¹·⁵</strong></div>
            <div>• Effective Barrier Height: <strong>φB = 3.10 eV</strong> (Si / SiO₂ offset)</div>
          </div>
        </div>

        {/* 3. ISPP Charge Integration */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="qml-badge qml-badge-emerald" style={{ marginBottom: '10px' }}>DEVICE ELECTROSTATICS</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
            3. ISPP Charge Transfer & Threshold Shift
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-normal)', margin: '0 0 14px 0' }}>
            Incremental Step Pulse Programming (ISPP) applies voltage pulses Vpgm(k) = Vstart + k ΔVpgm. Transferred charge per pulse ΔQ is evaluated dimensionally:
          </p>

          <div style={{
            background: 'rgba(5, 8, 15, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--emerald-400)',
            marginBottom: '14px',
            lineHeight: 1.6
          }}>
            ΔQ(fC) = J_FN(A/m²) × A_eff(m²) × t_pulse(s) × 10¹⁵
            <br />
            Vt = V_erased + Q / C_cg
          </div>

          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <div>• Coupling Ratio: <strong>α = 0.72</strong></div>
            <div>• Control Gate Capacitance: <strong>C_cg = 0.25 fF</strong></div>
            <div>• Erased State Base Threshold: <strong>V_erased = 0.45 V</strong></div>
            <div>• Verify Target Threshold: <strong>V_verify = 1.50 V</strong></div>
          </div>
        </div>

        {/* 4. Arrhenius Retention & Wear Instability */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <span className="qml-badge qml-badge-amber" style={{ marginBottom: '10px' }}>RELIABILITY & RETENTION</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 12px 0' }}>
            4. Arrhenius Retention Loss & Wear Widening
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-normal)', margin: '0 0 14px 0' }}>
            Retention charge decay follows an Arrhenius thermally-activated model coupled with defect and field-stress multipliers:
          </p>

          <div style={{
            background: 'rgba(5, 8, 15, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--amber-400)',
            marginBottom: '14px',
            lineHeight: 1.6
          }}>
            Q(t) = Q₀ exp(−Γ · t),   where:
            <br />
            Γ(T) = Γ₀ exp(−Ea / kB T) × (1 + N_def/8×10¹⁷) × (1 + 8w) × [1 + 0.5(F_stress/2)²]
          </div>

          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <div>• Attempt Frequency: <strong>Γ₀ = 850 s⁻¹</strong></div>
            <div>• Activation Energy: <strong>Ea = 0.72 eV</strong></div>
            <div>• Boltzmann Constant: <strong>kB = 1.380649 × 10⁻²³ J/K</strong></div>
            <div>• Wear-induced Jitter: <strong>σ_Vt = 25 mV + 220 mV · (N/Nmax)⁰·⁸</strong></div>
          </div>
        </div>

      </div>

      {/* Model Limitations & Scientific Scope */}
      <section className="glass-panel crosshair-corners" style={{ padding: '28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="qml-badge qml-badge-amber">DISCLAIMERS & SCOPE</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
            Model Limitations & Classroom Educational Scope
          </h3>
        </div>

        <ul style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-normal)', margin: 0, paddingLeft: '20px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Idealized Triangular Barrier:</strong> The Fowler–Nordheim formulation omits image-force barrier lowering, band-structure effective mass anisotropy, dielectric phonon scattering, and trap-assisted tunneling (TAT). Treat current densities as qualitative educational estimates rather than measured foundry silicon.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>1D Coherent Scattering:</strong> The numerical finite-difference solver assumes elastic, phase-coherent, one-dimensional scattering across a flat potential well. It does not model 3D non-planar corner electric field enhancements.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Illustrative Reliability Coefficients:</strong> Endurance wear parameters (σ_Vt, defect density growth) and Arrhenius retention coefficients are calibrated for educational demonstration of trends, not product lifetime qualification tests.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>SECDED vs Commercial Controllers:</strong> The educational error-correction engine implements extended Hamming (8,4) SECDED. Commercial smartphone UFS 4.0 and NVMe SSD controllers use high-performance hardware LDPC and BCH engines capable of correcting 80+ bit errors per sector.
          </li>
          <li>
            <strong>Representative 8-Cell Array:</strong> The 8-cell SLC transistor display maps the first byte of the local file payload for inspectable demonstration. Full payload bytes are preserved in browser-local state.
          </li>
        </ul>
      </section>

      {/* Peer-Reviewed Sources & Academic Citations */}
      <section className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0' }}>
          Academic References & Peer-Reviewed Literature
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ padding: '10px 14px', background: 'rgba(5, 8, 15, 0.65)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>[1] Fowler–Nordheim Constants & Theory:</span>
            <div style={{ color: 'var(--text-normal)', marginTop: '4px' }}>
              Royal Society of Chemistry, <em>Nanoscale Advances</em> (2021). "Field emission and Fowler-Nordheim constants for standard free-electron emitters."
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(5, 8, 15, 0.65)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--violet-400)', fontWeight: 700 }}>[2] 3D NAND ISPP Programming & Verify:</span>
            <div style={{ color: 'var(--text-normal)', marginTop: '4px' }}>
              MDPI Electronics (2022). "EXPRESS: Exploiting Energy-Accuracy Tradeoffs in 3D NAND Flash Memory using Incremental Step Pulse Programming."
            </div>
          </div>

          <div style={{ padding: '10px 14px', background: 'rgba(5, 8, 15, 0.65)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ color: 'var(--amber-400)', fontWeight: 700 }}>[3] NAND Retention & Threshold Voltage Instability:</span>
            <div style={{ color: 'var(--text-normal)', marginTop: '4px' }}>
              Politecnico di Milano (re.public.polimi.it/handle/11311/594481). "Investigation of Threshold-Voltage Instability, Trap Generation, and Charge Retention in Floating-Gate and Charge-Trap NAND Flash Memories."
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
