import React, { useState, useEffect, useRef } from 'react';

export default function CompactScientificPanel({
  oxideThicknessNm = 9.0,
  barrierEv = 3.1,
  incidentEnergyEv = 1.0,
  gateVoltageV = 10,
  physics = {},
  storedChargeFc = 0,
  activeVt = 1.20,
}) {
  const [activeTab, setActiveTab] = useState('barrier'); // 'barrier' | 'wave' | 'density' | 'numerical'
  const canvasRef = useRef(null);

  const T = physics.transmission || 1e-12;
  const R = physics.reflection || 1.0;
  const fieldGVm = (physics.fieldVm || 0) / 1e9;
  const oxideDropV = physics.oxideDropV || 0;

  // Real-time animation loop for wave and density canvas
  useEffect(() => {
    if (activeTab === 'numerical') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const render = () => {
      time += 0.04;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const W = rect.width;
      const H = rect.height;

      // Clean warm laboratory background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      // Coordinate boundaries
      const leftPad = 60;
      const rightPad = 30;
      const topPad = 25;
      const botPad = 35;
      const plotW = W - leftPad - rightPad;
      const plotH = H - topPad - botPad;

      // X mapping: -4 nm (Silicon) to + (oxideThicknessNm + 4 nm) (Floating Gate)
      const totalSpanNm = 4 + oxideThicknessNm + 4;
      const nmToPx = (nm) => leftPad + ((nm + 4) / totalSpanNm) * plotW;
      const xSiEnd = nmToPx(0);
      const xOxEnd = nmToPx(oxideThicknessNm);

      // Y mapping: 0.0 eV to 4.2 eV
      const maxEv = 4.2;
      const evToPy = (ev) => topPad + (1 - ev / maxEv) * plotH;
      const yZero = evToPy(0);
      const yE = evToPy(incidentEnergyEv);

      // 1. Grid lines and Y-axis labels (eV)
      ctx.strokeStyle = '#ECEEEB';
      ctx.lineWidth = 1;
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#68727C';
      for (let ev = 0; ev <= 4; ev += 1) {
        const y = evToPy(ev);
        ctx.beginPath();
        ctx.moveTo(leftPad, y);
        ctx.lineTo(W - rightPad, y);
        ctx.stroke();
        ctx.fillText(`${ev}.0 eV`, leftPad - 46, y + 3);
      }

      // X-axis baseline
      ctx.strokeStyle = '#20262D';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftPad, yZero);
      ctx.lineTo(W - rightPad, yZero);
      ctx.stroke();

      // X-axis nanometre ticks & labels
      ctx.fillStyle = '#68727C';
      ctx.fillText('-4 nm (Si)', leftPad, H - 12);
      ctx.fillText('0 nm', xSiEnd - 12, H - 12);
      ctx.fillText(`${oxideThicknessNm.toFixed(1)} nm`, xOxEnd - 18, H - 12);
      ctx.fillText(`+${(oxideThicknessNm + 4).toFixed(1)} nm (FG)`, W - rightPad - 80, H - 12);

      // Region vertical dashed dividers
      ctx.strokeStyle = '#D0D5DD';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xSiEnd, topPad);
      ctx.lineTo(xSiEnd, yZero);
      ctx.moveTo(xOxEnd, topPad);
      ctx.lineTo(xOxEnd, yZero);
      ctx.stroke();
      ctx.setLineDash([]);

      // Region name headers
      ctx.font = '700 10px Inter, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('SILICON SUBSTRATE', leftPad + 10, topPad - 8);
      ctx.fillStyle = '#0284c7';
      ctx.fillText('TUNNEL OXIDE (SiO₂)', xSiEnd + 10, topPad - 8);
      ctx.fillStyle = '#c59b27';
      ctx.fillText('FLOATING GATE', xOxEnd + 10, topPad - 8);

      // TAB 1: Energy Barrier V(x)
      if (activeTab === 'barrier') {
        const barrierLeftY = evToPy(barrierEv);
        const barrierRightEv = Math.max(0, barrierEv - oxideDropV);
        const barrierRightY = evToPy(barrierRightEv);

        // Shaded barrier profile
        ctx.fillStyle = 'rgba(2, 132, 199, 0.12)';
        ctx.beginPath();
        ctx.moveTo(xSiEnd, yZero);
        ctx.lineTo(xSiEnd, barrierLeftY);
        ctx.lineTo(xOxEnd, barrierRightY);
        ctx.lineTo(xOxEnd, yZero);
        ctx.closePath();
        ctx.fill();

        // Thick blue outline of the potential barrier
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(leftPad, yZero);
        ctx.lineTo(xSiEnd, yZero);
        ctx.lineTo(xSiEnd, barrierLeftY);
        ctx.lineTo(xOxEnd, barrierRightY);
        ctx.lineTo(xOxEnd, yZero);
        ctx.lineTo(W - rightPad, yZero);
        ctx.stroke();

        // Electron Incident Energy level (dashed amber)
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(leftPad, yE);
        ctx.lineTo(W - rightPad, yE);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#d97706';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.fillText(`Electron Kinetic Energy E = ${incidentEnergyEv.toFixed(2)} eV`, leftPad + 12, yE - 8);

        // Classical Turning Point Xt
        const slopeEvNm = oxideDropV / oxideThicknessNm;
        let xtNm = -1;
        if (incidentEnergyEv < barrierEv && slopeEvNm > 0) {
          xtNm = (barrierEv - incidentEnergyEv) / slopeEvNm;
        }
        if (xtNm > 0 && xtNm < oxideThicknessNm) {
          const xtPx = nmToPx(xtNm);
          ctx.strokeStyle = '#dc2626';
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.moveTo(xtPx, yE - 10);
          ctx.lineTo(xtPx, yZero);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(xtPx, yE, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(`Turning Pt Xt = ${xtNm.toFixed(1)} nm`, xtPx - 35, yE + 18);
        }
      }

      // TAB 2: Wavefunction Re(ψ)
      if (activeTab === 'wave') {
        const deltaE = Math.max(0.1, barrierEv - incidentEnergyEv);
        const kappaNm = 0.75 * Math.sqrt(deltaE);
        const tAmp = Math.max(0.02, Math.min(0.85, Math.sqrt(Math.max(1e-12, T)) * 3.5));
        const ampPx = 28;

        // Wave baseline
        const midY = topPad + plotH * 0.55;
        ctx.strokeStyle = '#E2E5E8';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(leftPad, midY);
        ctx.lineTo(W - rightPad, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Soft violet wave curve
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        // Silicon: Standing wave
        for (let px = leftPad; px <= xSiEnd; px += 2) {
          const nm = ((px - leftPad) / plotW) * totalSpanNm - 4;
          const incident = Math.cos(1.2 * nm - time);
          const reflected = Math.cos(-1.2 * nm - time + 0.8) * Math.sqrt(R);
          const psi = (incident + reflected) * 0.5;
          const py = midY - psi * ampPx;
          if (px === leftPad) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Inside oxide: Exponential evanescent decay
        const boundaryPsi = (Math.cos(0 - time) + Math.cos(0 - time + 0.8) * Math.sqrt(R)) * 0.5;
        for (let px = xSiEnd; px <= xOxEnd; px += 2) {
          const xInOxNm = ((px - xSiEnd) / (xOxEnd - xSiEnd)) * oxideThicknessNm;
          const decay = Math.exp(-kappaNm * xInOxNm);
          const psi = boundaryPsi * decay * Math.cos(-time * 0.3);
          const py = midY - psi * ampPx;
          ctx.lineTo(px, py);
        }

        // Floating Gate: Transmitted propagating wave
        for (let px = xOxEnd; px <= W - rightPad; px += 2) {
          const nmInFg = ((px - xOxEnd) / plotW) * totalSpanNm;
          const transmitted = Math.cos(1.5 * nmInFg - time) * tAmp;
          const py = midY - transmitted * ampPx;
          ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = '#8b5cf6';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.fillText('Real Wavefunction Re(ψ) · Animated Propagation & Attenuation', leftPad + 12, topPad + 16);
      }

      // TAB 3: Probability Density |ψ|²
      if (activeTab === 'density') {
        const deltaE = Math.max(0.1, barrierEv - incidentEnergyEv);
        const kappaNm = 0.75 * Math.sqrt(deltaE);
        const tAmp = Math.max(0.02, Math.min(0.85, Math.sqrt(Math.max(1e-12, T)) * 3.5));
        const ampPx = 36;

        ctx.strokeStyle = '#0284c7';
        ctx.fillStyle = 'rgba(2, 132, 199, 0.1)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        // Silicon interference envelope
        for (let px = leftPad; px <= xSiEnd; px += 2) {
          const nm = ((px - leftPad) / plotW) * totalSpanNm - 4;
          const incident = Math.cos(1.2 * nm);
          const reflected = Math.cos(-1.2 * nm + 0.8) * Math.sqrt(R);
          const prob = ((incident + reflected) * 0.5) ** 2;
          const py = yZero - prob * ampPx;
          if (px === leftPad) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Inside Oxide exponential decay
        for (let px = xSiEnd; px <= xOxEnd; px += 2) {
          const xInOxNm = ((px - xSiEnd) / (xOxEnd - xSiEnd)) * oxideThicknessNm;
          const decay = Math.exp(-2 * kappaNm * xInOxNm);
          const prob = 0.8 * decay;
          const py = yZero - prob * ampPx;
          ctx.lineTo(px, py);
        }

        // Floating gate flat transmitted probability
        const tProb = Math.max(0.005, tAmp ** 2);
        for (let px = xOxEnd; px <= W - rightPad; px += 2) {
          const py = yZero - tProb * ampPx;
          ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.fillStyle = '#0284c7';
        ctx.font = '700 11px Inter, sans-serif';
        ctx.fillText('Probability Density |ψ(x)|² Envelope', leftPad + 12, topPad + 16);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab, oxideThicknessNm, barrierEv, incidentEnergyEv, gateVoltageV, T, R, oxideDropV]);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '16px 20px',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Switchable View Tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '6px' }}>
          {[
            { id: 'barrier', label: '1. Energy Barrier V(x)' },
            { id: 'wave', label: '2. Wavefunction ψ(x)' },
            { id: 'density', label: '3. Probability Density |ψ|²' },
            { id: 'numerical', label: '4. Numerical Results' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  borderRadius: '4px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Readout Badges */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span className="qml-badge qml-badge-cyan">Field: {fieldGVm.toFixed(2)} GV/m</span>
          <span className="qml-badge qml-badge-violet">T: {T.toExponential(2)}</span>
          <span className="qml-badge qml-badge-amber">Vt: {activeVt.toFixed(2)} V</span>
        </div>
      </div>

      {/* Canvas for Barrier, Wavefunction, and Density */}
      {activeTab !== 'numerical' ? (
        <div style={{ width: '100%', height: '145px', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '145px', display: 'block', borderRadius: '6px' }}
          />
        </div>
      ) : (
        /* Numerical Results Table */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '8px 0',
          }}
        >
          <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Electric Field (F)</div>
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{fieldGVm.toFixed(3)} GV/m</strong>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Scattering T</div>
            <strong style={{ fontSize: '13px', color: '#0284c7' }}>{T.toExponential(3)}</strong>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)' }}>WKB Estimate</div>
            <strong style={{ fontSize: '13px', color: '#7c3aed' }}>{(physics.wkb || 0).toExponential(3)}</strong>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Fowler–Nordheim J</div>
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{(physics.fnCurrent || 0).toExponential(2)} A/m²</strong>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Stored Charge Q</div>
            <strong style={{ fontSize: '13px', color: '#d97706' }}>{storedChargeFc.toFixed(3)} fC</strong>
          </div>
          <div style={{ background: 'var(--bg-elevated)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Threshold Vt</div>
            <strong style={{ fontSize: '13px', color: '#16a34a' }}>{activeVt.toFixed(2)} V</strong>
          </div>
        </div>
      )}
    </div>
  );
}
