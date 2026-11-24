import React from 'react';

export const MAIN_NAV_ITEMS = [
  { id: 'explore', label: 'Explore', subtitle: '3D Transistor Observatory' },
  { id: 'journey', label: 'File ➔ Electron', subtitle: '12-Stage Storage Journey' },
  { id: 'experiment', label: 'Quantum Experiment', subtitle: '6-Stage Guided Lab' },
  { id: 'operations', label: 'Memory Operations', subtitle: 'NAND Storage & Phone' },
  { id: 'learn', label: 'Learn', subtitle: 'Equations & References' },
];

export default function Navbar({ activeTab = 'explore', onSelectTab }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Project Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--text-main)',
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              fontSize: '15px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Q
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--text-main)' }}>
              QUANTUM MEMORY LAB
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Explore the Physics Inside Flash Memory
            </div>
          </div>
        </div>

        {/* 4 Clean Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '4px' }}>
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  background: isActive ? 'var(--bg-main)' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
