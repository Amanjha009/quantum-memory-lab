import React from 'react';

export default function SimulationController({
  stages = [],
  currentStage = 1,
  isPlaying = false,
  speed = 1,
  onRun,
  onPause,
  onResume,
  onStep,
  onReset,
  onReplay,
  onSetSpeed,
  onSelectStage,
  eventLog = [],
}) {
  const activeStageObj = stages.find((s) => s.id === currentStage) || stages[0] || {};
  const progressPercent = stages.length > 1 ? ((currentStage - 1) / (stages.length - 1)) * 100 : 0;

  return (
    <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
      {/* Top Bar: Title & Transport Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="qml-badge qml-badge-cyan">
            <span className={`status-dot ${isPlaying ? 'emerald pulse' : 'cyan'}`} />
            {isPlaying ? 'SIMULATION RUNNING' : currentStage === stages.length ? 'COMPLETED' : 'PAUSED / READY'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            STAGE <strong style={{ color: '#fff' }}>{String(currentStage).padStart(2, '0')}</strong> OF {String(stages.length).padStart(2, '0')}
          </span>
        </div>

        {/* Transport Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isPlaying ? (
            <button
              onClick={onPause}
              className="qml-btn qml-btn-secondary"
              style={{ minWidth: '90px', borderColor: 'var(--amber-400)', color: 'var(--amber-400)' }}
            >
              ❚❚ PAUSE
            </button>
          ) : (
            <button
              onClick={currentStage === stages.length ? onReplay : currentStage > 1 ? onResume : onRun}
              className="qml-btn qml-btn-primary"
              style={{ minWidth: '90px' }}
            >
              ▶ {currentStage === stages.length ? 'REPLAY' : currentStage > 1 ? 'RESUME' : 'RUN'}
            </button>
          )}

          <button
            onClick={onStep}
            disabled={isPlaying || currentStage >= stages.length}
            className="qml-btn qml-btn-secondary"
            title="Advance exactly one logical simulation stage"
          >
            ⏭ STEP
          </button>

          <button
            onClick={onReset}
            className="qml-btn qml-btn-ghost"
            title="Reset simulation to initial conditions"
          >
            ↺ RESET
          </button>

          <button
            onClick={onReplay}
            className="qml-btn qml-btn-ghost"
            title="Replay from stage 1 with current parameters"
          >
            ↻ REPLAY
          </button>

          {/* Speed Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-elevated)',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            padding: '2px',
            marginLeft: '6px'
          }}>
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                style={{
                  background: speed === s ? 'var(--cyan-500)' : 'transparent',
                  color: speed === s ? '#041017' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Scrubber Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          position: 'relative',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '2px',
          marginBottom: '10px',
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, var(--cyan-500), var(--violet-500))',
            borderRadius: '2px',
            transition: 'width 0.25s ease'
          }} />
        </div>

        {/* Stage Nodes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${stages.length}, 1fr)`,
          gap: '4px',
        }}>
          {stages.map((stage) => {
            const isCurrent = stage.id === currentStage;
            const isPassed = stage.id < currentStage;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                style={{
                  background: isCurrent ? 'rgba(0, 240, 255, 0.15)' : isPassed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isCurrent ? 'var(--cyan-400)' : isPassed ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)'}`,
                  borderRadius: '6px',
                  padding: '6px 4px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  color: isCurrent ? 'var(--cyan-300)' : isPassed ? 'var(--emerald-400)' : 'var(--text-dim)',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600 }}>
                  {isPassed ? '✓ ' : ''}ST {stage.id}
                </div>
                <div style={{
                  fontSize: '9px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'none',
                }} className="scrubber-stage-name">
                  {stage.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Scientific Explanation Card */}
      <div style={{
        background: 'rgba(8, 14, 26, 0.75)',
        border: '1px solid var(--border-medium)',
        borderRadius: '8px',
        padding: '14px 18px',
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 1.4fr) minmax(240px, 0.9fr)',
        gap: '20px',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--cyan-400)', fontWeight: 600 }}>
              LOGICAL STAGE 0{activeStageObj.id}:
            </span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
              {activeStageObj.name}
            </span>
            {activeStageObj.subtitle && (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                — {activeStageObj.subtitle}
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', lineHeight: '1.6', color: 'var(--text-normal)' }}>
            {activeStageObj.description}
          </p>
          {activeStageObj.physicalInsight && (
            <div style={{
              fontSize: '11px',
              fontStyle: 'italic',
              color: 'var(--cyan-300)',
              borderLeft: '2px solid var(--cyan-400)',
              paddingLeft: '8px'
            }}>
              💡 {activeStageObj.physicalInsight}
            </div>
          )}
        </div>

        {/* Governing Equation for this stage */}
        {activeStageObj.equation && (
          <div style={{
            background: 'rgba(5, 8, 15, 0.85)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '10px 14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px'
          }}>
            <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
              GOVERNING RELATION
            </div>
            <div style={{ color: 'var(--cyan-300)', fontWeight: 600, marginBottom: '4px' }}>
              {activeStageObj.equation}
            </div>
            {activeStageObj.equationNote && (
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                {activeStageObj.equationNote}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
