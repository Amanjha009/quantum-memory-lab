import React, { useState } from 'react';
import { storageStats } from '../core/storage.js';
import { SAMPLE_PHOTOS, SAMPLE_DOCUMENTS } from '../core/phoneAssets.js';
import Smartphone3DScene from '../components/Smartphone3DScene.jsx';

export default function SmartphoneView({
  powered = true,
  phoneTab = 'Photos',
  setPhoneTab,
  model,
  selectedFileId,
  operation,
  onSelectFile,
  onSave,
  onDelete,
  onRestore,
  onGarbageCollect,
  onPower,
  onNavigateToMemory,
  onNavigateToJourney,
}) {
  const [activeApp, setActiveApp] = useState(phoneTab);
  const [phoneDisplayMode, setPhoneDisplayMode] = useState('screen'); // 'screen' | '3d'
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('My_Notes.txt');
  const [newDocText, setNewDocText] = useState('Quantum memory stores information using electron wavefunctions.');

  const stats = storageStats(model);
  const validFiles = model.files.filter((f) => f.status === 'valid');
  const deletedFiles = model.files.filter((f) => f.status === 'deleted');

  const photosList = validFiles.filter((f) => f.kind === 'photo');
  const docsList = validFiles.filter((f) => f.kind === 'document');

  // Currently inspected file
  const activeFile = model.files.find((f) => f.id === selectedFileId) || photosList[0] || null;

  // Handle saving a photo to flash storage
  const handleSavePhotoToFlash = (photo) => {
    if (onSave) {
      onSave(photo);
    }
    if (onSelectFile) {
      onSelectFile(photo.id);
    }
  };

  // Handle creating a new document inside the phone
  const handleCreateDocument = () => {
    if (!newDocName.trim()) return;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(newDocText);
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: newDocName.trim(),
      title: newDocName.replace(/\.[^/.]+$/, ''),
      size: bytes.length,
      bytes,
      content: newDocText,
      kind: 'document',
      date: 'Just now',
    };
    if (onSave) {
      onSave(newDoc);
    }
    setIsCreatingDoc(false);
    setViewingDoc(newDoc);
  };

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '20px 24px 60px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="qml-badge qml-badge-cyan">PHASE 1 · INTERACTIVE SMARTPHONE</span>
          <span className="qml-badge qml-badge-violet">PHYSICAL FLASH TRANSLATION LAYER</span>
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Virtual Smartphone Experience
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '6px 0 0', maxWidth: '820px' }}>
          Interact with the smartphone on the left. Open photographs, save documents, or manage storage.
          Every action issues real file-system operations and allocates physical NAND flash memory blocks.
        </p>
      </div>

      {/* Main Grid: Left Convincing Virtual Smartphone, Right Storage Architecture Context */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr)',
          gap: '36px',
          alignItems: 'start',
        }}
        className="smartphone-journey-grid"
      >

        {/* LEFT COLUMN: Realistic Physical Smartphone */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Display Mode Switcher */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '14px',
              background: 'var(--bg-elevated)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
            }}
          >
            <button
              onClick={() => setPhoneDisplayMode('screen')}
              className={`qml-btn ${phoneDisplayMode === 'screen' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              style={{ fontSize: '11px', padding: '4px 12px' }}
            >
              🖥️ INTERACTIVE SCREEN
            </button>
            <button
              onClick={() => setPhoneDisplayMode('3d')}
              className={`qml-btn ${phoneDisplayMode === '3d' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              style={{ fontSize: '11px', padding: '4px 12px' }}
            >
              📱 3D HARDWARE (360°)
            </button>
          </div>

          {/* VIEW MODE 1: 3D Hardware View in WebGL */}
          {phoneDisplayMode === '3d' ? (
            <div
              className="glass-panel"
              style={{
                width: '340px',
                height: '670px',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.22)',
              }}
            >
              <Smartphone3DScene
                powered={powered}
                activePhoto={viewingPhoto || activeFile}
                activeTab={activeApp}
              />
            </div>
          ) : (
            /* VIEW MODE 2: Interactive Smartphone Chassis & Screen */
            <div
              style={{
                width: '340px',
                height: '670px',
                borderRadius: '48px',
                background: 'linear-gradient(145deg, #374151, #1f2937 35%, #111827)',
                padding: '11px',
                boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.16) inset, 0 12px 24px -8px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                userSelect: 'none',
              }}
            >
            {/* Top Speaker Micro-Slit */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '48px',
                height: '3.5px',
                borderRadius: '2px',
                background: '#111827',
                border: '0.5px solid rgba(255, 255, 255, 0.1)',
                zIndex: 60,
              }}
            />

            {/* Antenna Bands on side frame */}
            <div style={{ position: 'absolute', left: '-1px', top: '70px', width: '2px', height: '4px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', left: '-1px', bottom: '70px', width: '2px', height: '4px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', right: '-1px', top: '70px', width: '2px', height: '4px', background: 'rgba(255,255,255,0.2)' }} />
            <div style={{ position: 'absolute', right: '-1px', bottom: '70px', width: '2px', height: '4px', background: 'rgba(255,255,255,0.2)' }} />

            {/* Physical Side Buttons: Left Volume */}
            <div
              style={{
                position: 'absolute',
                left: '-3px',
                top: '115px',
                width: '3px',
                height: '36px',
                background: 'linear-gradient(to right, #4b5563, #374151)',
                borderRadius: '2px 0 0 2px',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '-3px',
                top: '162px',
                width: '3px',
                height: '36px',
                background: 'linear-gradient(to right, #4b5563, #374151)',
                borderRadius: '2px 0 0 2px',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
              }}
            />
            {/* Physical Side Button: Right Power Lock */}
            <div
              onClick={onPower}
              title="Power Lock"
              style={{
                position: 'absolute',
                right: '-3px',
                top: '135px',
                width: '3px',
                height: '48px',
                background: 'linear-gradient(to left, #4b5563, #374151)',
                borderRadius: '0 2px 2px 0',
                cursor: 'pointer',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
              }}
            />

            {/* Screen Glass Container */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '38px',
                background: powered ? '#FFFFFF' : '#0a0d12',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
              }}
            >
              {/* Dynamic Island / Selfie Camera Pill Notch */}
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '92px',
                  height: '24px',
                  borderRadius: '16px',
                  background: '#000000',
                  zIndex: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                {/* Micro Sensor dot */}
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#1e293b',
                  }}
                />
                {/* Camera lens reflection */}
                <div
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #38bdf8 0%, #0369a1 40%, #020617 100%)',
                  }}
                />
              </div>

              {powered ? (
                <>
                  {/* Status Bar */}
                  <div
                    style={{
                      height: '42px',
                      padding: '12px 22px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-sans)',
                      zIndex: 40,
                    }}
                  >
                    <span>09:41</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', letterSpacing: '-0.5px' }}>5G ▰▰▰</span>
                      <span style={{ fontSize: '10px' }}>94%</span>
                    </div>
                  </div>

                  {/* App Screen Content */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                    {/* VIEW A: Full-Screen Photo Viewer */}
                    {viewingPhoto && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0d14', color: '#fff' }}>
                        <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            onClick={() => setViewingPhoto(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#38bdf8',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ◀ Gallery
                          </button>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{viewingPhoto.name}</span>
                        </div>

                        {/* Image Preview */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                          <img
                            src={viewingPhoto.preview}
                            alt={viewingPhoto.title}
                            style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '8px' }}
                          />
                        </div>

                        {/* Photo Details & Actions */}
                        <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.06)' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{viewingPhoto.title}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
                            {viewingPhoto.dimensions} · {viewingPhoto.sizeBytes || viewingPhoto.size} Bytes
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                              onClick={() => {
                                if (onNavigateToJourney) onNavigateToJourney(viewingPhoto);
                              }}
                              className="qml-btn qml-btn-primary"
                              style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '11px',
                                background: '#2563eb',
                                borderColor: '#2563eb',
                                fontWeight: 800,
                              }}
                            >
                              🚀 SIMULATE FILE ➔ ELECTRON JOURNEY
                            </button>
                            <button
                              onClick={() => handleSavePhotoToFlash(viewingPhoto)}
                              className="qml-btn qml-btn-secondary"
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '11px',
                              }}
                            >
                              💾 Direct Save to Flash
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIEW B: Document Reader */}
                    {!viewingPhoto && viewingDoc && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <button
                            onClick={() => setViewingDoc(null)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#2563eb',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            ◀ Files
                          </button>
                          <button
                            onClick={() => {
                              if (onDelete) onDelete(viewingDoc.id);
                              setViewingDoc(null);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#dc2626',
                              fontSize: '11px',
                              cursor: 'pointer',
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{viewingDoc.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          {viewingDoc.date} · {viewingDoc.sizeBytes || viewingDoc.size} Bytes
                        </div>

                        {/* Text reader */}
                        <div
                          style={{
                            flex: 1,
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-light)',
                            borderRadius: '8px',
                            padding: '10px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '11px',
                            lineHeight: 1.5,
                            overflowY: 'auto',
                            color: 'var(--text-main)',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {viewingDoc.content || new TextDecoder().decode(viewingDoc.bytes)}
                        </div>
                      </div>
                    )}

                    {/* VIEW C: Main App Views (Photos, Files, Storage) */}
                    {!viewingPhoto && !viewingDoc && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                        {/* Tab Content: Photos App */}
                        {activeApp === 'Photos' && (
                          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Photos</h2>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {photosList.length} photos
                              </span>
                            </div>

                            {/* 2x2 Photo Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                              {photosList.map((photo) => (
                                <div
                                  key={photo.id}
                                  onClick={() => {
                                    setViewingPhoto(photo);
                                    if (onSelectFile) onSelectFile(photo.id);
                                  }}
                                  style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border-light)',
                                    cursor: 'pointer',
                                    background: '#000',
                                    transition: 'transform 0.15s ease',
                                  }}
                                >
                                  <img
                                    src={photo.preview}
                                    alt={photo.title || photo.name}
                                    style={{ width: '100%', height: '88px', objectFit: 'cover', display: 'block' }}
                                  />
                                  <div style={{ padding: '6px 8px', background: '#FFFFFF' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {photo.title || photo.name}
                                    </div>
                                    <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                      {photo.sizeBytes || photo.size} B
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Capture action prompt */}
                            <div
                              style={{
                                background: 'var(--bg-elevated)',
                                borderRadius: '8px',
                                padding: '10px',
                                border: '1px solid var(--border-light)',
                                textAlign: 'center',
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              Tap any photo to view full resolution and commit its byte payload into physical flash memory.
                            </div>
                          </div>
                        )}

                        {/* Tab Content: Files App */}
                        {activeApp === 'Files' && (
                          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Documents</h2>
                              <button
                                onClick={() => setIsCreatingDoc(true)}
                                style={{
                                  background: 'var(--text-main)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                ➕ New File
                              </button>
                            </div>

                            {/* Document Creation Inline Form */}
                            {isCreatingDoc && (
                              <div
                                style={{
                                  background: 'var(--bg-elevated)',
                                  border: '1px solid var(--border-medium)',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  marginBottom: '12px',
                                }}
                              >
                                <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>Create New Document</div>
                                <input
                                  type="text"
                                  value={newDocName}
                                  onChange={(e) => setNewDocName(e.target.value)}
                                  placeholder="Filename.txt"
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-light)',
                                    marginBottom: '6px',
                                  }}
                                />
                                <textarea
                                  value={newDocText}
                                  onChange={(e) => setNewDocText(e.target.value)}
                                  rows={3}
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    fontSize: '11px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-light)',
                                    marginBottom: '8px',
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                  <button
                                    onClick={() => setIsCreatingDoc(false)}
                                    className="qml-btn qml-btn-secondary"
                                    style={{ fontSize: '10px', padding: '4px 8px' }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleCreateDocument}
                                    className="qml-btn qml-btn-primary"
                                    style={{ fontSize: '10px', padding: '4px 8px' }}
                                  >
                                    Save Document
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Active Files List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                              {docsList.map((doc) => (
                                <div
                                  key={doc.id}
                                  onClick={() => {
                                    setViewingDoc(doc);
                                    if (onSelectFile) onSelectFile(doc.id);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-light)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
                                      📄 {doc.name}
                                    </div>
                                    <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                                      {doc.date}
                                    </div>
                                  </div>
                                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                                    {doc.sizeBytes || doc.size} B
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Trash Section (Deleted Files) */}
                            {deletedFiles.length > 0 && (
                              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
                                  Trash ({deletedFiles.length} recoverable)
                                </div>
                                {deletedFiles.map((f) => (
                                  <div
                                    key={f.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '6px 8px',
                                      background: 'rgba(220, 38, 38, 0.05)',
                                      border: '1px solid rgba(220, 38, 38, 0.15)',
                                      borderRadius: '4px',
                                      marginBottom: '4px',
                                      fontSize: '10px',
                                    }}
                                  >
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-secondary)' }}>
                                      {f.name}
                                    </span>
                                    <button
                                      onClick={() => onRestore && onRestore(f.id)}
                                      style={{
                                        background: '#2563eb',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '3px',
                                        padding: '2px 6px',
                                        fontSize: '9px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      ↺ Restore
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tab Content: Storage App */}
                        {activeApp === 'Storage' && (
                          <div style={{ flex: 1, padding: '12px 14px', overflowY: 'auto' }}>
                            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 12px 0' }}>Storage Health</h2>

                            {/* Storage Capacity Bar */}
                            <div style={{ marginBottom: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                                <span>Used: <strong>{(stats.validPages * 256) / 1024} KB</strong></span>
                                <span style={{ color: 'var(--text-secondary)' }}>Capacity: 8 KB (Simulated)</span>
                              </div>
                              <div style={{ height: '10px', borderRadius: '5px', background: 'var(--bg-subtle)', overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: `${(photosList.length * 20)}%`, background: '#0284c7' }} title="Photos" />
                                <div style={{ width: `${(docsList.length * 10)}%`, background: '#2563eb' }} title="Documents" />
                                <div style={{ width: `${(stats.invalidPages * 3.1)}%`, background: '#d97706' }} title="Stale Pages" />
                              </div>
                            </div>

                            {/* NAND Metric Cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '11px' }}>
                                <span>Valid Active Pages:</span>
                                <strong>{stats.validPages} / 32</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '11px' }}>
                                <span>Free Erased Pages:</span>
                                <strong style={{ color: '#16a34a' }}>{stats.freePages}</strong>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '11px' }}>
                                <span>Dirty (Stale) Pages:</span>
                                <strong style={{ color: stats.invalidPages > 0 ? '#d97706' : 'var(--text-secondary)' }}>
                                  {stats.invalidPages}
                                </strong>
                              </div>
                            </div>

                            {/* Garbage Collector Action */}
                            <button
                              onClick={onGarbageCollect}
                              className="qml-btn qml-btn-secondary"
                              style={{ width: '100%', fontSize: '11px', padding: '8px' }}
                            >
                              🧹 Run Garbage Collection
                            </button>
                          </div>
                        )}

                      </div>
                    )}

                    {/* Bottom In-Phone Navigation Bar */}
                    <div
                      style={{
                        height: '50px',
                        background: '#FFFFFF',
                        borderTop: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-around',
                        padding: '0 8px',
                      }}
                    >
                      {[
                        { id: 'Photos', icon: '📷', label: 'Photos' },
                        { id: 'Files', icon: '📁', label: 'Files' },
                        { id: 'Storage', icon: '💾', label: 'Storage' },
                      ].map((tab) => {
                        const isTabActive = activeApp === tab.id && !viewingPhoto && !viewingDoc;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveApp(tab.id);
                              setViewingPhoto(null);
                              setViewingDoc(null);
                              if (setPhoneTab) setPhoneTab(tab.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isTabActive ? '#2563eb' : 'var(--text-secondary)',
                              fontSize: '11px',
                              fontWeight: isTabActive ? 700 : 500,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Bottom Home Indicator Bar */}
                    <div
                      style={{
                        height: '14px',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: '3px',
                      }}
                    >
                      <div
                        style={{
                          width: '108px',
                          height: '4px',
                          borderRadius: '2px',
                          background: '#1f2937',
                          opacity: 0.8,
                        }}
                      />
                    </div>

                  </div>
                </>
              ) : (
                /* Powered Off State */
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#68727c' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontSize: '12px' }}>Device is powered off</div>
                  <button
                    onClick={onPower}
                    className="qml-btn qml-btn-secondary"
                    style={{ marginTop: '12px', fontSize: '11px' }}
                  >
                    Power On
                  </button>
                </div>
              )}
            </div>
          </div>
          )}

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px', textAlign: 'center' }}>
            {phoneDisplayMode === '3d'
              ? 'Drag to orbit and inspect 3D titanium chassis, buttons and triple camera bump.'
              : 'Tap Photos or Files on the phone screen to interact with simulated storage.'}
          </div>
        </div>

        {/* RIGHT COLUMN: Educational Storage Continuum & FTL Bridge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Active File Inspection Card */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  ACTIVE FILE SYSTEM PAYLOAD
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 0' }}>
                  {activeFile ? activeFile.name : 'No file selected'}
                </h2>
              </div>
              {activeFile && (
                <span className="qml-badge qml-badge-cyan">
                  {activeFile.sizeBytes || activeFile.size} Bytes
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              When you save this item, the operating system converts the data into logical blocks.
              The UFS storage controller then calculates Fowler–Nordheim voltage pulses to inject electrons into physical NAND floating gates.
            </p>

            {/* Target Byte & Bit Translation */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Representative Stored Byte:</div>
                <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                  0x41 ('A')
                </strong>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SLC Bit Sequence:</div>
                <strong style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: '#2563eb' }}>
                  [0, 1, 0, 0, 0, 0, 0, 1]
                </strong>
              </div>
            </div>

            {/* Action to proceed to 3D Storage Journey */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onNavigateToJourney}
                className="qml-btn qml-btn-primary"
                style={{ flex: 1, padding: '10px', fontSize: '12px' }}
              >
                🎬 VIEW 3D CINEMATIC STORAGE JOURNEY ➔
              </button>
              <button
                onClick={onNavigateToMemory}
                className="qml-btn qml-btn-secondary"
                style={{ padding: '10px', fontSize: '12px' }}
              >
                🔬 GO TO QUANTUM LAB
              </button>
            </div>
          </div>

          {/* Flash Translation Layer (FTL) Mapping Details */}
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              PHYSICAL NAND ALLOCATION (FTL TABLE)
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
              NAND flash cannot overwrite data in place. When a file is updated, new pages are written out-of-place
              and the old physical pages are flagged as invalid.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {model.blocks.map((block) => (
                <div
                  key={block.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '6px',
                    padding: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>Block {block.id}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {block.pages.filter((p) => p.state === 'valid').length} / 8 valid
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    Erase: {block.eraseCount}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
