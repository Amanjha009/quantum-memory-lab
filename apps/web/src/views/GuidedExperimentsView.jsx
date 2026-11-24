import React, { useState } from 'react';
import { EXPERIMENTS_LIST, CHALLENGES_LIST } from '../core/guidedData.js';

export default function GuidedExperimentsView({
  onLoadExperimentParams,
  onNavigateToLab,
}) {
  const [selectedExpId, setSelectedExpId] = useState(1);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'challenges'
  const [userAnswers, setUserAnswers] = useState({});
  const [challengeState, setChallengeState] = useState({
    activeChallengeId: 'ch-1',
    userVt: 1.45,
    userMaxV: 20.0,
    status: 'idle', // 'idle' | 'pass' | 'fail'
  });

  const activeExp = EXPERIMENTS_LIST.find((e) => e.id === selectedExpId) || EXPERIMENTS_LIST[0];

  const handleSelectAnswer = (expId, optionIdx) => {
    setUserAnswers((prev) => ({
      ...prev,
      [expId]: optionIdx,
    }));
  };

  const handleTestChallenge = (ch) => {
    if (ch.id === 'ch-1') {
      const passed = challengeState.userVt >= ch.targetVt && challengeState.userMaxV <= ch.maxVAllowed;
      setChallengeState((prev) => ({ ...prev, status: passed ? 'pass' : 'fail' }));
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="qml-badge qml-badge-cyan">MODULE 08 · GUIDED SCIENTIFIC EXPERIMENTS</span>
          <span className="qml-badge qml-badge-violet">10 LABS + ENGINEERING CHALLENGES</span>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
          Guided Experiments & Engineering Challenges
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, maxWidth: '780px' }}>
          Follow structured scientific inquiries from single-electron wavepacket tunnelling to semiconductor memory
          engineering, or test your engineering skills in interactive constraint challenges.
        </p>
      </div>

      {/* Main Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('curriculum')}
          className="qml-btn"
          style={{
            background: activeTab === 'curriculum' ? 'var(--cyan-500)' : 'var(--bg-elevated)',
            color: activeTab === 'curriculum' ? '#041017' : 'var(--text-muted)',
            borderColor: activeTab === 'curriculum' ? 'var(--cyan-400)' : 'var(--border-subtle)',
            padding: '10px 22px',
          }}
        >
          10 GUIDED EXPERIMENTS CURRICULUM
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className="qml-btn"
          style={{
            background: activeTab === 'challenges' ? 'var(--amber-500)' : 'var(--bg-elevated)',
            color: activeTab === 'challenges' ? '#041017' : 'var(--text-muted)',
            borderColor: activeTab === 'challenges' ? 'var(--amber-400)' : 'var(--border-subtle)',
            padding: '10px 22px',
          }}
        >
          ENGINEERING CHALLENGES 🏆
        </button>
      </div>

      {/* Mode 1: 10 Guided Experiments Curriculum */}
      {activeTab === 'curriculum' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) minmax(0, 1fr)',
          gap: '20px',
          alignItems: 'start'
        }} className="experiments-grid-main">
          
          {/* Left Column: Experiments Menu */}
          <aside className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '10px' }}>
              SCIENTIFIC CURRICULUM (10 EXPERIMENTS):
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {EXPERIMENTS_LIST.map((exp) => {
                const isSelected = exp.id === selectedExpId;
                const answered = userAnswers[exp.id] != null;
                const correct = answered && userAnswers[exp.id] === exp.assessment.correctIndex;

                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelectedExpId(exp.id)}
                    style={{
                      background: isSelected ? 'rgba(0, 240, 255, 0.18)' : 'rgba(16, 26, 48, 0.5)',
                      border: `1px solid ${isSelected ? 'var(--cyan-400)' : 'var(--border-subtle)'}`,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: isSelected ? '#fff' : 'var(--text-normal)',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--cyan-400)' }}>
                        {exp.category.toUpperCase()}
                      </span>
                      {answered && (
                        <span style={{ fontSize: '11px', color: correct ? 'var(--emerald-400)' : 'var(--rose-400)' }}>
                          {correct ? '✓ PASS' : '✕'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.3 }}>
                      {exp.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Column: Active Experiment Worksheet */}
          <section className="glass-panel" style={{ padding: '28px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span className="qml-badge qml-badge-cyan" style={{ marginBottom: '6px' }}>
                  EXPERIMENT {String(activeExp.id).padStart(2, '0')} · {activeExp.category.toUpperCase()}
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', margin: '4px 0 0 0' }}>
                  {activeExp.title}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    onLoadExperimentParams?.(activeExp.defaultParams);
                  }}
                  className="qml-btn qml-btn-secondary"
                  style={{ fontSize: '11px' }}
                >
                  ⚙ LOAD EXPERIMENT PRESET
                </button>
                <button
                  onClick={() => onNavigateToLab?.('quantum-lab')}
                  className="qml-btn qml-btn-primary"
                  style={{ fontSize: '11px' }}
                >
                  OPEN IN WORKSTATION ➔
                </button>
              </div>
            </div>

            {/* Objective */}
            <div style={{
              background: 'rgba(5, 8, 15, 0.65)',
              borderLeft: '3px solid var(--cyan-400)',
              padding: '12px 16px',
              borderRadius: '0 8px 8px 0',
              marginBottom: '20px'
            }}>
              <strong style={{ color: 'var(--cyan-300)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                SCIENTIFIC OBJECTIVE:
              </strong>
              <div style={{ fontSize: '13px', color: '#fff', lineHeight: 1.5 }}>
                {activeExp.objective}
              </div>
            </div>

            {/* Background */}
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Theoretical Background
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--text-normal)', margin: 0 }}>
                {activeExp.background}
              </p>
            </div>

            {/* Step-by-Step Instructions */}
            <div style={{ marginBottom: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Step-by-Step Experimental Procedure
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeExp.steps.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(16, 26, 48, 0.5)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '10px',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan-400)' }}>
                      0{idx + 1}.
                    </span>
                    <span style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Observations & Conclusion Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '24px'
            }} className="principles-grid">
              <div style={{
                background: 'rgba(5, 8, 15, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--amber-400)', fontWeight: 600, marginBottom: '6px' }}>
                  EXPECTED OBSERVATIONS
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-normal)', lineHeight: 1.5 }}>
                  {activeExp.expected}
                </div>
              </div>

              <div style={{
                background: 'rgba(5, 8, 15, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px'
              }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)', fontWeight: 600, marginBottom: '6px' }}>
                  SCIENTIFIC CONCLUSION
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-normal)', lineHeight: 1.5 }}>
                  {activeExp.conclusion}
                </div>
              </div>
            </div>

            {/* Assessment Question */}
            <div style={{
              background: 'rgba(12, 19, 36, 0.85)',
              border: '1px solid var(--border-medium)',
              borderRadius: '10px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--violet-400)', fontWeight: 600, marginBottom: '8px' }}>
                KNOWLEDGE ASSESSMENT
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '14px' }}>
                {activeExp.assessment.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeExp.assessment.options.map((opt, oIdx) => {
                  const isChosen = userAnswers[activeExp.id] === oIdx;
                  const isAnswered = userAnswers[activeExp.id] != null;
                  const isCorrect = oIdx === activeExp.assessment.correctIndex;

                  let borderStyle = 'var(--border-subtle)';
                  let bgStyle = 'rgba(255, 255, 255, 0.02)';

                  if (isAnswered) {
                    if (isCorrect) {
                      borderStyle = 'var(--emerald-400)';
                      bgStyle = 'rgba(16, 185, 129, 0.15)';
                    } else if (isChosen) {
                      borderStyle = 'var(--rose-400)';
                      bgStyle = 'rgba(244, 63, 94, 0.15)';
                    }
                  } else if (isChosen) {
                    borderStyle = 'var(--cyan-400)';
                    bgStyle = 'rgba(0, 240, 255, 0.1)';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(activeExp.id, oIdx)}
                      style={{
                        background: bgStyle,
                        border: `1px solid ${borderStyle}`,
                        borderRadius: '6px',
                        padding: '10px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: isChosen || (isAnswered && isCorrect) ? '#fff' : 'var(--text-normal)',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginRight: '8px' }}>
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

        </div>
      )}

      {/* Mode 2: Engineering Challenges */}
      {activeTab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)', gap: '20px' }}>
          {CHALLENGES_LIST.map((ch) => (
            <div key={ch.id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="qml-badge qml-badge-amber">ENGINEERING CHALLENGE</span>
                <span style={{ fontSize: '20px' }}>🏆</span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 10px 0' }}>
                {ch.title}
              </h3>

              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-normal)', margin: '0 0 16px 0' }}>
                {ch.objective}
              </p>

              <div style={{
                background: 'rgba(5, 8, 15, 0.75)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '16px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)'
              }}>
                <div style={{ color: 'var(--cyan-400)', fontWeight: 600, marginBottom: '6px' }}>CHALLENGE CONSTRAINTS:</div>
                {ch.targetVt && <div>• Target Threshold: <strong>Vt ≥ {ch.targetVt} V</strong></div>}
                {ch.maxVAllowed && <div>• Maximum Voltage Budget: <strong>Vmax ≤ {ch.maxVAllowed} V</strong></div>}
                {ch.maxLossFraction && <div>• Maximum Allowed Loss: <strong>&lt; {(ch.maxLossFraction * 100).toFixed(0)} %</strong></div>}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '16px', fontStyle: 'italic' }}>
                💡 Hint: {ch.hint}
              </div>

              <button
                onClick={() => onNavigateToLab?.(ch.id === 'ch-1' ? 'nand-lab' : 'reliability')}
                className="qml-btn qml-btn-primary"
                style={{ width: '100%' }}
              >
                ENTER LAB TO SOLVE CHALLENGE ➔
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
