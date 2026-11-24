import React, { useRef, useEffect, useState } from 'react';

export default function QuantumWaveVisualizer({
  oxideThicknessNm = 9.0,
  barrierEv = 3.1,
  incidentEnergyEv = 1.0,
  gateVoltageV = 10,
  transmission = 1e-12,
  reflection = 1.0,
  fieldVm = 0.7e9,
  oxideDropV = 6.33,
  viewType = 'overlay', // 'wave' | 'density' | 'overlay'
  isPlaying = true,
}) {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState(viewType);

  useEffect(() => {
    setActiveTab(viewType);
  }, [viewType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const render = () => {
      if (isPlaying) {
        time += 0.05;
      }

      // High DPI resolution support
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

      // 1. Background
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, W, H);

      // Define horizontal geometry for the 3 physical zones
      // Total span: -5 nm (Silicon) to + (oxideThicknessNm + 5 nm) (Floating Gate)
      const totalSpanNm = 5 + oxideThicknessNm + 5;
      const nmToPx = (nm) => ((nm + 5) / totalSpanNm) * (W - 100) + 60;
      
      const xSiEnd = nmToPx(0);
      const xOxEnd = nmToPx(oxideThicknessNm);

      // Vertical energy scaling: 0 eV to 4.5 eV
      const maxEv = 4.5;
      const evToPy = (ev) => H - 70 - (ev / maxEv) * (H - 120);

      const yZero = evToPy(0);
      const yE = evToPy(incidentEnergyEv);

      // 2. Draw Region Backgrounds & Labels
      // Left: Silicon
      ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.fillRect(50, 40, xSiEnd - 50, H - 100);

      // Center: Oxide Barrier
      ctx.fillStyle = 'rgba(0, 240, 255, 0.07)';
      ctx.fillRect(xSiEnd, 40, xOxEnd - xSiEnd, H - 100);

      // Right: Floating Gate
      ctx.fillStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(xOxEnd, 40, W - 40 - xOxEnd, H - 100);

      // Region Dividers
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xSiEnd, 40);
      ctx.lineTo(xSiEnd, H - 60);
      ctx.moveTo(xOxEnd, 40);
      ctx.lineTo(xOxEnd, H - 60);
      ctx.stroke();
      ctx.setLineDash([]);

      // Region Titles
      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('SILICON SUBSTRATE (Channel)', 65, 58);
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.fillText('Ec = 0.0 eV · Inversion Leads', 65, 72);

      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`TUNNEL OXIDE (${oxideThicknessNm.toFixed(1)} nm SiO₂)`, xSiEnd + 14, 58);
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.fillText(`Barrier φB = ${barrierEv.toFixed(1)} eV`, xSiEnd + 14, 72);

      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('FLOATING GATE (Polysilicon)', xOxEnd + 14, 58);
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fillText('Quantum Potential Well', xOxEnd + 14, 72);

      // 3. Grid Lines & Axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let ev = 0; ev <= 4; ev += 1) {
        const y = evToPy(ev);
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(W - 40, y);
        ctx.stroke();

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillText(`${ev}.0 eV`, 15, y + 3);
      }

      // X-Axis Baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(50, yZero);
      ctx.lineTo(W - 40, yZero);
      ctx.stroke();

      // 4. Draw Conduction Band Potential Profile V(x)
      // Barrier drops across oxide due to gate voltage: V(x) = φB - Vox * (x / tox)
      const barrierLeftY = evToPy(barrierEv);
      const barrierRightEv = Math.max(0, barrierEv - oxideDropV);
      const barrierRightY = evToPy(barrierRightEv);
      const fgPotentialEv = Math.max(0, -oxideDropV * 0.4);
      const fgPotentialY = evToPy(fgPotentialEv);

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Silicon flat band (V = 0)
      ctx.moveTo(50, yZero);
      ctx.lineTo(xSiEnd, yZero);
      // Vertical step up at x = 0
      ctx.lineTo(xSiEnd, barrierLeftY);
      // Slope down across oxide (triangular band tilt)
      ctx.lineTo(xOxEnd, barrierRightY);
      // Drop into floating gate well
      ctx.lineTo(xOxEnd, fgPotentialY);
      ctx.lineTo(W - 40, fgPotentialY);
      ctx.stroke();

      // Shaded barrier polygon
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(xSiEnd, yZero);
      ctx.lineTo(xSiEnd, barrierLeftY);
      ctx.lineTo(xOxEnd, barrierRightY);
      ctx.lineTo(xOxEnd, yZero);
      ctx.closePath();
      ctx.fill();

      // 5. Draw Incident Electron Energy Level (Classical Level)
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(50, yE);
      ctx.lineTo(W - 40, yE);
      ctx.stroke();
      ctx.setLineDash([]);

      // Energy Label & Badge
      ctx.fillStyle = '#fbbf24';
      ctx.font = '700 11px JetBrains Mono, monospace';
      ctx.fillText(`Electron Energy E = ${incidentEnergyEv.toFixed(2)} eV`, 65, yE - 8);

      // Classical Turning Point Xt
      // V(Xt) = E => φB - (Vox / tox) * Xt = E => Xt = (φB - E) / (Vox / tox)
      const fieldSlopeEvPerNm = oxideDropV / oxideThicknessNm;
      let xtNm = 0;
      if (incidentEnergyEv < barrierEv && fieldSlopeEvPerNm > 0) {
        xtNm = (barrierEv - incidentEnergyEv) / fieldSlopeEvPerNm;
      }
      if (xtNm > 0 && xtNm < oxideThicknessNm) {
        const xtPx = nmToPx(xtNm);
        // Turning point vertical line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(xtPx, yE - 15);
        ctx.lineTo(xtPx, yZero);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(xtPx, yE, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`Turning Pt Xt = ${xtNm.toFixed(1)} nm`, xtPx - 40, yE + 22);

        // Classically forbidden label inside oxide
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.font = '600 11px Inter, sans-serif';
        const midForbidden = (xSiEnd + xtPx) / 2;
        ctx.fillText('CLASSICALLY FORBIDDEN (E < V)', midForbidden - 70, yZero - 16);
      }

      // 6. Draw Quantum Wavefunction ψ(x) and Probability Density |ψ(x)|²
      const waveAmplitude = 36;
      const kSi = 1.2; // Wavenumber in silicon
      const kTrans = 1.6; // Wavenumber in floating gate

      // Evanescent decay factor inside oxide
      // κ = sqrt(2 m* (V - E)) / hbar
      const avgBarrierV = (barrierEv + barrierRightEv) / 2;
      const deltaE = Math.max(0.1, avgBarrierV - incidentEnergyEv);
      const kappaNm = 0.8 * Math.sqrt(deltaE); // per nm
      const totalDecay = Math.exp(-kappaNm * oxideThicknessNm);
      const tAmp = Math.max(0.005, Math.min(0.9, Math.sqrt(Math.max(1e-12, transmission)) * 4.0));

      const showWave = activeTab === 'wave' || activeTab === 'overlay';
      const showDensity = activeTab === 'density' || activeTab === 'overlay';

      // Wavefunction: Re(ψ)
      if (showWave) {
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        // Silicon: Standing wave (incident + reflected)
        for (let px = 50; px <= xSiEnd; px += 2) {
          const xNm = ((px - 60) / (W - 100)) * totalSpanNm - 5;
          const incident = Math.cos(kSi * xNm - time);
          const reflected = Math.cos(-kSi * xNm - time + 0.8) * Math.sqrt(reflection);
          const psi = (incident + reflected) * 0.5;
          const py = yE - psi * waveAmplitude;
          if (px === 50) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }

        // Inside Oxide: Exponential decay
        const psiAtBoundary = Math.cos(kSi * 0 - time) + Math.cos(-kSi * 0 - time + 0.8) * Math.sqrt(reflection);
        for (let px = xSiEnd; px <= xOxEnd; px += 2) {
          const xInOxNm = ((px - xSiEnd) / (xOxEnd - xSiEnd)) * oxideThicknessNm;
          const decay = Math.exp(-kappaNm * xInOxNm);
          const phase = -time;
          const psi = (psiAtBoundary * 0.5) * decay * Math.cos(phase * 0.2);
          const py = yE - psi * waveAmplitude;
          ctx.lineTo(px, py);
        }

        // Floating Gate: Transmitted propagating wave
        for (let px = xOxEnd; px <= W - 40; px += 2) {
          const xInFgNm = ((px - xOxEnd) / (W - 100)) * totalSpanNm;
          const transmitted = Math.cos(kTrans * xInFgNm - time) * tAmp;
          const py = yE - transmitted * waveAmplitude;
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Probability Density |ψ|²
      if (showDensity) {
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Silicon: Standing wave interference envelope
        for (let px = 50; px <= xSiEnd; px += 2) {
          const xNm = ((px - 60) / (W - 100)) * totalSpanNm - 5;
          const incident = Math.cos(kSi * xNm);
          const reflected = Math.cos(-kSi * xNm + 0.8) * Math.sqrt(reflection);
          const prob = ((incident + reflected) * 0.5) ** 2;
          const py = yE - prob * (waveAmplitude * 1.3);
          if (px === 50) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }

        // Inside Oxide: Exponential attenuation of probability
        for (let px = xSiEnd; px <= xOxEnd; px += 2) {
          const xInOxNm = ((px - xSiEnd) / (xOxEnd - xSiEnd)) * oxideThicknessNm;
          const decay = Math.exp(-2 * kappaNm * xInOxNm);
          const prob = 0.8 * decay;
          const py = yE - prob * (waveAmplitude * 1.3);
          ctx.lineTo(px, py);
        }

        // Floating Gate: Flat transmitted probability density
        const tProb = Math.max(0.002, tAmp ** 2);
        for (let px = xOxEnd; px <= W - 40; px += 2) {
          const py = yE - tProb * (waveAmplitude * 1.3);
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // 7. Dynamic Scientific Readout Box inside Canvas
      ctx.fillStyle = 'rgba(6, 9, 17, 0.88)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      const infoBoxW = 280;
      const infoBoxH = 75;
      const infoX = W - infoBoxW - 50;
      const infoY = H - infoBoxH - 65;

      ctx.beginPath();
      ctx.roundRect(infoX, infoY, infoBoxW, infoBoxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 11px Inter, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText('QUANTUM TRANSMISSION TELEMETRY', infoX + 12, infoY + 18);

      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText(`T (Scattering) : ${transmission.toExponential(3)}`, infoX + 12, infoY + 36);

      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`R (Reflection) : ${reflection.toFixed(6)}`, infoX + 12, infoY + 52);

      ctx.fillStyle = '#10b981';
      ctx.fillText(`Electric Field : ${(fieldVm / 1e9).toFixed(3)} GV/m`, infoX + 12, infoY + 68);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [oxideThicknessNm, barrierEv, incidentEnergyEv, gateVoltageV, transmission, reflection, fieldVm, oxideDropV, activeTab, isPlaying]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', minHeight: '380px', display: 'block' }}
      />

      {/* Viewport Filter Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '6px',
          background: 'rgba(5, 8, 15, 0.85)',
          padding: '4px',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <button
          onClick={() => setActiveTab('overlay')}
          className={`qml-btn ${activeTab === 'overlay' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
          style={{ fontSize: '10px', padding: '4px 10px' }}
        >
          WAVE + DENSITY
        </button>
        <button
          onClick={() => setActiveTab('wave')}
          className={`qml-btn ${activeTab === 'wave' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
          style={{ fontSize: '10px', padding: '4px 10px' }}
        >
          WAVEFUNCTION ψ(x)
        </button>
        <button
          onClick={() => setActiveTab('density')}
          className={`qml-btn ${activeTab === 'density' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
          style={{ fontSize: '10px', padding: '4px 10px' }}
        >
          PROBABILITY |ψ|²
        </button>
      </div>

      {/* Explanatory Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '60px',
          display: 'flex',
          gap: '16px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '3px', background: '#00f0ff', display: 'inline-block' }} />
          <span>Oxide Potential V(x)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', background: '#fbbf24', borderTop: '1px dashed #fbbf24', display: 'inline-block' }} />
          <span>Electron Energy E</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', background: '#c084fc', display: 'inline-block' }} />
          <span>Wavefunction Re(ψ)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '2px', background: '#38bdf8', display: 'inline-block' }} />
          <span>Probability Density |ψ|²</span>
        </div>
      </div>
    </div>
  );
}
