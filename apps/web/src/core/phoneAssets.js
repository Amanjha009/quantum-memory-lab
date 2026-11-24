import { createStorageModel, writeFile } from './storage.js';

const toBytes = (text) => new TextEncoder().encode(text);

// 1. High-Quality SVG Sample Photographs
const NEBULA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <radialGradient id="nebula" cx="60%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.8"/>
      <stop offset="40%" stop-color="#3b82f6" stop-opacity="0.6"/>
      <stop offset="70%" stop-color="#0284c7" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#050811" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="#030712"/>
  <rect width="600" height="400" fill="url(#nebula)"/>
  <!-- Stars -->
  <circle cx="90" cy="60" r="1.5" fill="#fff"/>
  <circle cx="210" cy="110" r="1.2" fill="#fff"/>
  <circle cx="450" cy="70" r="2" fill="#fff"/>
  <circle cx="340" cy="160" r="1.8" fill="#a78bfa"/>
  <circle cx="510" cy="190" r="1.4" fill="#38bdf8"/>
  <circle cx="120" cy="220" r="1.5" fill="#fff"/>
  <!-- Telescope Dome Silhouette -->
  <path d="M420,400 L420,330 Q470,270 520,330 L520,400 Z" fill="url(#ground)"/>
  <rect x="460" y="275" width="20" height="55" fill="#1e293b" transform="rotate(-25 470 300)"/>
  <circle cx="470" cy="305" r="45" fill="none" stroke="#334155" stroke-width="2"/>
  <text x="30" y="375" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="16">Deep Space Observatory</text>
  <text x="30" y="392" fill="#94a3b8" font-family="monospace" font-size="11">Exposure: 120s · ISO 1600 · 3840×2160</text>
</svg>`;

const WAFER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <radialGradient id="wafer" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
      <stop offset="45%" stop-color="#0284c7" stop-opacity="0.7"/>
      <stop offset="75%" stop-color="#1e293b" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <rect width="600" height="400" fill="#0b0f19"/>
  <!-- Silicon Wafer Disc -->
  <circle cx="300" cy="200" r="160" fill="url(#wafer)" stroke="#64748b" stroke-width="4"/>
  <!-- Grid of Die Reticles -->
  <g stroke="rgba(255,255,255,0.25)" stroke-width="1">
    <line x1="160" y1="120" x2="440" y2="120"/>
    <line x1="140" y1="160" x2="460" y2="160"/>
    <line x1="140" y1="200" x2="460" y2="200"/>
    <line x1="140" y1="240" x2="460" y2="240"/>
    <line x1="160" y1="280" x2="440" y2="280"/>
    <line x1="220" y1="60" x2="220" y2="340"/>
    <line x1="260" y1="45" x2="260" y2="355"/>
    <line x1="300" y1="40" x2="300" y2="360"/>
    <line x1="340" y1="45" x2="340" y2="355"/>
    <line x1="380" y1="60" x2="380" y2="340"/>
  </g>
  <!-- Highlight notch -->
  <path d="M290,360 L310,360 L300,352 Z" fill="#0b0f19"/>
  <text x="30" y="375" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="16">300mm Silicon NAND Wafer</text>
  <text x="30" y="392" fill="#94a3b8" font-family="monospace" font-size="11">SEM Die Inspection · 232-Layer V-NAND</text>
</svg>`;

const MOUNTAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="50%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#skyGrad)"/>
  <!-- Sun -->
  <circle cx="460" cy="130" r="36" fill="#fff7ed"/>
  <!-- Distant Peak -->
  <polygon points="120,400 310,180 500,400" fill="#0c4a6e"/>
  <polygon points="310,180 270,230 350,230" fill="#f8fafc"/>
  <!-- Foreground Ridge -->
  <polygon points="0,400 160,260 380,400" fill="#075985"/>
  <polygon points="260,400 450,230 600,400" fill="#0369a1"/>
  <polygon points="450,230 420,270 480,270" fill="#f8fafc"/>
  <text x="30" y="375" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="16">Alpine Sunrise Panorama</text>
  <text x="30" y="392" fill="#f8fafc" font-family="monospace" font-size="11">Shutter: 1/800s · f/4.0 · HDR Capture</text>
</svg>`;

const LASER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#050811"/>
  <!-- Optical table grid -->
  <g stroke="#1e293b" stroke-width="1">
    <line x1="0" y1="280" x2="600" y2="280"/>
    <line x1="0" y1="320" x2="600" y2="320"/>
    <line x1="0" y1="360" x2="600" y2="360"/>
  </g>
  <!-- Optical Mounts -->
  <rect x="80" y="240" width="30" height="40" fill="#475569"/>
  <polygon points="280,270 310,230 340,270" fill="#64748b"/>
  <rect x="490" y="235" width="25" height="45" fill="#475569"/>
  <!-- Violet Coherent Laser Beam -->
  <line x1="95" y1="245" x2="295" y2="245" stroke="#a855f7" stroke-width="4"/>
  <line x1="95" y1="245" x2="295" y2="245" stroke="#f3e8ff" stroke-width="1.5"/>
  <!-- Refracted beam -->
  <line x1="295" y1="245" x2="500" y2="250" stroke="#00f0ff" stroke-width="3"/>
  <text x="30" y="375" fill="#f8fafc" font-family="sans-serif" font-weight="700" font-size="16">Coherent Laser Optics Lab</text>
  <text x="30" y="392" fill="#94a3b8" font-family="monospace" font-size="11">Wavelength: 405 nm · Continuous Wave</text>
</svg>`;

export const SAMPLE_PHOTOS = [
  {
    id: 'photo-nebula',
    name: 'observatory_nebula.jpg',
    title: 'Deep Space Nebula',
    sizeBytes: 640,
    dimensions: '3840 × 2160',
    date: 'Today, 09:15',
    svg: NEBULA_SVG,
    preview: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(NEBULA_SVG)}`,
    desc: 'Astrophotography long exposure captured at mountain summit observatory.',
  },
  {
    id: 'photo-wafer',
    name: 'silicon_wafer.jpg',
    title: '300mm Silicon Wafer',
    sizeBytes: 512,
    dimensions: '3000 × 2000',
    date: 'Yesterday, 16:42',
    svg: WAFER_SVG,
    preview: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(WAFER_SVG)}`,
    desc: 'Cleanroom SEM micrograph of 3D NAND flash memory dies.',
  },
  {
    id: 'photo-mountain',
    name: 'alpine_summit.jpg',
    title: 'Alpine Sunrise',
    sizeBytes: 768,
    dimensions: '4000 × 2250',
    date: 'Nov 21, 07:04',
    svg: MOUNTAIN_SVG,
    preview: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(MOUNTAIN_SVG)}`,
    desc: 'High dynamic range dawn panorama over alpine mountain ranges.',
  },
  {
    id: 'photo-laser',
    name: 'optics_laser.jpg',
    title: 'Quantum Laser Cavity',
    sizeBytes: 480,
    dimensions: '2560 × 1440',
    date: 'Nov 19, 14:20',
    svg: LASER_SVG,
    preview: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(LASER_SVG)}`,
    desc: 'Coherent violet laser refraction experiment on vibration-isolated optical bench.',
  },
];

export const SAMPLE_DOCUMENTS = [
  {
    id: 'doc-notes',
    name: 'Research_Notes.txt',
    title: 'Quantum Tunneling Principles',
    sizeBytes: 320,
    date: 'Today, 08:30',
    content: `QUANTUM TUNNELLING IN FLASH MEMORY
===================================
1. The tunnel oxide (SiO2, tox = 9.0 nm) acts as a quantum barrier (phiB = 3.1 eV).
2. Fowler-Nordheim field emission occurs when electric field F > 0.8 GV/m.
3. Transferred charge Q = J_FN * A_eff * t_pulse accumulates in the isolated polysilicon floating gate.
4. Trapped negative electrons screen the control gate and shift the transistor threshold voltage:
   Delta Vt = Delta Q / C_cg.
5. In Single-Level Cell (SLC) mode:
   - Programmed cell (Vt >= 1.50V) represents logical '0'.
   - Erased cell (Vt < 1.20V) represents logical '1'.`,
  },
  {
    id: 'doc-ufs',
    name: 'UFS_Config.json',
    title: 'Universal Flash Storage Config',
    sizeBytes: 256,
    date: 'Nov 20, 11:15',
    content: `{
  "ufs_standard": "4.0 M-PHY Gear 5",
  "ftl_mapping": "Page-Level L2P Translation",
  "block_count": 4,
  "pages_per_block": 8,
  "page_size_bytes": 256,
  "wear_leveling": "Dynamic + Static Pool",
  "gc_watermark": 0.20,
  "ecc_scheme": "SECDED Extended Hamming (8,4)"
}`,
  },
  {
    id: 'doc-log',
    name: 'Experiment_Log.md',
    title: 'ISPP Voltage Step Log',
    sizeBytes: 192,
    date: 'Nov 18, 17:50',
    content: `# ISPP PROGRAM VERIFY LOG
- Target Byte: 0x41 ('A')
- Bit Sequence: 01000001
- Vstart: 14.0 V
- Vstep: 0.5 V
- Pulse Duration: 5.0 microseconds
- Verify Threshold: 1.50 V
- Result: Cells verified in 4 pulses.
- Non-volatile charge retention confirmed.`,
  },
];

export function createInitialStorageModel() {
  let model = createStorageModel({ blockCount: 4 });

  // Pre-load sample photos into the file system
  SAMPLE_PHOTOS.forEach((photo) => {
    const res = writeFile(model, {
      id: photo.id,
      name: photo.name,
      title: photo.title,
      size: photo.sizeBytes,
      bytes: toBytes(photo.svg),
      preview: photo.preview,
      kind: 'photo',
      dimensions: photo.dimensions,
      date: photo.date,
    });
    if (res.ok) model = res.model;
  });

  // Pre-load sample documents into the file system
  SAMPLE_DOCUMENTS.forEach((doc) => {
    const res = writeFile(model, {
      id: doc.id,
      name: doc.name,
      title: doc.title,
      size: doc.sizeBytes,
      bytes: toBytes(doc.content),
      content: doc.content,
      kind: 'document',
      date: doc.date,
    });
    if (res.ok) model = res.model;
  });

  return model;
}
