import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

// 5 PHYSICAL STAGES DEFINITIONS
export const JOURNEY_STAGES = [
  {
    id: 'app',
    index: 0,
    title: '1. Smartphone Application',
    subtitle: 'RAM Buffer & CMOS Sensor',
    scale: '~150 mm (Consumer Device)',
    pos: [-10, 0, 0],
    camTarget: [-10, 0.5, 0],
    camPos: [-10, 3.2, 5.5],
    function: 'Captures photons on the CMOS camera sensor, encodes raw image data into JPEG or binary byte streams in volatile LPDDR5 RAM.',
    currentActivity: 'User tapped "SAVE". The camera buffer has prepared a 256-byte payload (active representative byte: 0x41 / "A"). The data is currently held in volatile capacitor memory that will disappear if power is cut.',
    whyNextStage: 'Volatile RAM requires constant refresh power and lacks physical file hierarchy. The data must be handed off to the operating system kernel to receive file system metadata and an inode address.',
    advancedDetails: {
      busRate: 'LPDDR5 @ 6400 Mbps (64-bit bus)',
      voltage: '1.1 V Core / 0.5 V I/O',
      dataState: 'Dynamic capacitive DRAM charge (~25 fF / cell)',
      duration: '~1.2 microseconds',
    },
  },
  {
    id: 'filesystem',
    index: 1,
    title: '2. OS File System (VFS)',
    subtitle: 'Kernel Inode & Logical Cluster Allocator',
    scale: 'Software Architecture / Kernel Space',
    pos: [-5, 0, 0],
    camTarget: [-5, 0.5, 0],
    camPos: [-5, 3.2, 5.5],
    function: 'Organizes raw bytes into human-readable directory trees, assigns file permissions, timestamps, and segments the stream into fixed-size logical block addresses (LBAs).',
    currentActivity: 'The Virtual File System (VFS) allocates a 64-byte inode record and maps the file across logical 256-byte clusters (L0 through L7). It issues an asynchronous write command over the UFS kernel driver.',
    whyNextStage: 'The file system understands directory trees and linear LBAs, but solid-state flash memory has severe physical limitations: it cannot overwrite data in place and must erase in massive blocks. A dedicated hardware controller must translate these logical requests.',
    advancedDetails: {
      lbaRange: 'LBA 0x00000000 – 0x00000007',
      clusterSize: '256 Bytes (Teaching Lab Standard)',
      driverProtocol: 'Universal Flash Storage (UFS) HCI 4.0',
      duration: '~4.5 microseconds',
    },
  },
  {
    id: 'controller',
    index: 2,
    title: '3. UFS Storage Controller',
    subtitle: 'Flash Translation Layer (FTL) ASIC',
    scale: '11.5 × 13.0 mm (BGA Semiconductor Package)',
    pos: [0, 0, 0],
    camTarget: [0, 0.5, 0],
    camPos: [0, 3.2, 5.5],
    function: 'An embedded high-performance multi-core ARM/RISC-V ASIC running the Flash Translation Layer (FTL). It performs logical-to-physical address mapping, wear leveling, garbage collection, and ECC parity calculation.',
    currentActivity: 'The FTL intercepts LBA 0x00, consults its internal mapping RAM table, identifies free physical pages in Block 0, and appends a 16-bit SECDED Hamming parity code to protect against future bit flips.',
    whyNextStage: 'The controller produces command descriptors and digital bit patterns, but NAND flash memory requires high analog programming voltages (14 V to 24 V) to physically force electrons through insulating oxides.',
    advancedDetails: {
      asicCores: 'Dual-core RISC-V @ 800 MHz',
      eccScheme: 'SECDED Extended Hamming + LDPC Engine',
      ftlLookup: 'Page-level mapping table in 32 MB SRAM buffer',
      duration: '~15 microseconds',
    },
  },
  {
    id: 'nand',
    index: 3,
    title: '4. NAND Flash Memory Die',
    subtitle: '3D Array Planes & 18V Charge Pump',
    scale: '6.5 × 8.2 mm (Monolithic Silicon Die)',
    pos: [5, 0, 0],
    camTarget: [5, 0.5, 0],
    camPos: [5, 3.2, 5.5],
    function: 'Houses billions of 3D stacked memory cells organized into erase blocks and wordline pages. Contains integrated Dickson charge pumps to multiply the phone’s 3.3V power supply up to the ~18V needed for quantum tunneling.',
    currentActivity: 'The row decoder energizes Word Line 0 (WL0). The on-chip charge pump steps up to 14.5 V, preparing the first ISPP (Incremental Step Pulse Programming) pulse. The column bitline sense lines are pre-charged.',
    whyNextStage: 'The chip plane directs high voltages to the selected row, but the actual quantum mechanical storage happens at the single transistor gate level: tunneling electrons across a 9 nm insulating barrier.',
    advancedDetails: {
      arrayType: '3D Charge-Trap / BiCS Floating-Gate Array',
      pumpVoltage: 'Dickson 4-stage pump: 3.3 V ➔ 18.0 V',
      pageBufferSize: '16 KB dynamic latch registers',
      duration: '~25 microseconds',
    },
  },
  {
    id: 'transistor',
    index: 4,
    title: '5. Memory Transistor (FG-MOSFET)',
    subtitle: 'Fowler–Nordheim Quantum Injection',
    scale: '30 nm Cell / 9.0 nm Oxide Barrier',
    pos: [10, 0, 0],
    camTarget: [10, 0.5, 0],
    camPos: [10, 3.2, 5.5],
    function: 'The fundamental physical unit of information storage. Traps an exact packet of negative charge (electrons) in an electrically isolated floating gate or silicon nitride layer, shifting the transistor threshold voltage.',
    currentActivity: 'A massive 1.0 GV/m electric field bends the conduction band of the 9.0 nm SiO₂ tunnel oxide into a triangular barrier. Electron wavefunctions tunnel through via Fowler–Nordheim emission, accumulating ~0.024 fC of charge. The cell state permanently switches from Erased ("1") to Programmed ("0").',
    whyNextStage: 'Journey complete! The data is now physically trapped by quantum mechanics and will persist for 10+ years without any continuous power supply.',
    advancedDetails: {
      electricField: 'E_ox ≈ 1.02 GV/m (10.2 MV/cm)',
      tunnelMechanism: 'Fowler–Nordheim field emission',
      trappedCharge: 'Q ≈ -24.1 aC (~150 electrons)',
      retentionLife: '> 10 years @ 55 °C',
    },
  },
];

export default function StorageJourneyScene({ onOpenQuantumLab, onReturnToPhone }) {
  const containerRef = useRef(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [presentationMode, setPresentationMode] = useState('learning'); // 'learning' | 'advanced'
  
  // Ref for Three.js state
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    packetMesh: null,
    targetCamPos: new THREE.Vector3(-10, 3.2, 5.5),
    targetCamLookAt: new THREE.Vector3(-10, 0.5, 0),
    currentCamLookAt: new THREE.Vector3(-10, 0.5, 0),
    stageMeshes: [],
    animProgress: 0,
    reqId: null,
  });

  const activeStage = JOURNEY_STAGES[currentStageIndex];

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f6f4); // Light neutral scientific workspace
    scene.fog = new THREE.FogExp2(0xf5f6f4, 0.025);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(-10, 3.2, 5.5);
    camera.lookAt(-10, 0.5, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 3. Lighting - Clean Natural Scientific Laboratory
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainKeyLight.position.set(10, 15, 12);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 2048;
    mainKeyLight.shadow.mapSize.height = 2048;
    mainKeyLight.shadow.camera.near = 0.5;
    mainKeyLight.shadow.camera.far = 40;
    mainKeyLight.shadow.camera.left = -16;
    mainKeyLight.shadow.camera.right = 16;
    mainKeyLight.shadow.camera.top = 10;
    mainKeyLight.shadow.camera.bottom = -10;
    mainKeyLight.shadow.bias = -0.0005;
    scene.add(mainKeyLight);

    const softFillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    softFillLight.position.set(-15, 8, -5);
    scene.add(softFillLight);

    // 4. Laboratory Floor Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const floorGeo = new THREE.PlaneGeometry(60, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.02;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 5. Interconnecting Bus Traces (Gold & Copper Traces)
    const traceGeo = new THREE.BoxGeometry(22, 0.04, 0.35);
    const traceMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.25,
    });
    const busTrace = new THREE.Mesh(traceGeo, traceMat);
    busTrace.position.set(0, 0.02, 0);
    busTrace.receiveShadow = true;
    scene.add(busTrace);

    // Ground line pairs
    const traceGroundMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.8,
      roughness: 0.4,
    });
    [-0.35, 0.35].forEach((zOffset) => {
      const gTrace = new THREE.Mesh(new THREE.BoxGeometry(22, 0.02, 0.1), traceGroundMat);
      gTrace.position.set(0, 0.01, zOffset);
      scene.add(gTrace);
    });

    // 6. BUILD THE 5 PHYSICAL 3D STAGE MODELS

    // --- STAGE 0: SMARTPHONE APP (Realistic Titanium Chassis & Triple-Camera SoC) ---
    const stage0Group = new THREE.Group();
    stage0Group.position.set(-10, 0, 0);
    stage0Group.userData = { stageIndex: 0 };

    // Phone body: extruded rounded shape
    const pShape = new THREE.Shape();
    const pw = 2.1, ph = 3.8, pr = 0.28;
    pShape.moveTo(-pw/2 + pr, -ph/2);
    pShape.lineTo(pw/2 - pr, -ph/2);
    pShape.quadraticCurveTo(pw/2, -ph/2, pw/2, -ph/2 + pr);
    pShape.lineTo(pw/2, ph/2 - pr);
    pShape.quadraticCurveTo(pw/2, ph/2, pw/2 - pr, ph/2);
    pShape.lineTo(-pw/2 + pr, ph/2);
    pShape.quadraticCurveTo(-pw/2, ph/2, -pw/2, ph/2 - pr);
    pShape.lineTo(-pw/2, -ph/2 + pr);
    pShape.quadraticCurveTo(-pw/2, -ph/2, -pw/2 + pr, -ph/2);

    const phoneBody = new THREE.Mesh(
      new THREE.ExtrudeGeometry(pShape, { depth: 0.18, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.02, bevelThickness: 0.02 }),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.88, roughness: 0.25 })
    );
    phoneBody.rotation.x = -Math.PI / 2;
    phoneBody.position.y = 0.1;
    phoneBody.castShadow = true;
    phoneBody.receiveShadow = true;
    stage0Group.add(phoneBody);

    // Screen surface (OLED display with subtle blue active glow)
    const phoneScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(1.95, 3.55),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.45,
        roughness: 0.12,
        metalness: 0.15,
      })
    );
    phoneScreen.rotation.x = -Math.PI / 2;
    phoneScreen.position.y = 0.205;
    stage0Group.add(phoneScreen);

    // Front Dynamic Island pill
    const frontIsland = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.02, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x05070a })
    );
    frontIsland.position.set(0, 0.21, -1.55);
    stage0Group.add(frontIsland);

    // Rear Camera Module: Sapphire bump plateau with triple lenses
    const camBump = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.06, 0.72),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 })
    );
    camBump.position.set(-0.55, 0.23, -1.35);
    stage0Group.add(camBump);

    const sRingGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.04, 20);
    const sRingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.95, roughness: 0.15 });
    const sLensGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.045, 20);
    const sLensMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.85, ior: 1.55, roughness: 0.05 });

    [[-0.72, -1.52], [-0.72, -1.22], [-0.42, -1.37]].forEach(([cx, cz]) => {
      const ring = new THREE.Mesh(sRingGeo, sRingMat);
      ring.position.set(cx, 0.26, cz);
      stage0Group.add(ring);
      const lens = new THREE.Mesh(sLensGeo, sLensMat);
      lens.position.set(cx, 0.265, cz);
      stage0Group.add(lens);
    });

    scene.add(stage0Group);

    // --- STAGE 1: OS FILE SYSTEM (VFS Logical Inode Grid) ---
    const stage1Group = new THREE.Group();
    stage1Group.position.set(-5, 0, 0);
    stage1Group.userData = { stageIndex: 1 };

    // Silicon carrier PCB
    const vfsBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.1, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x0f3a2c, metalness: 0.4, roughness: 0.4 })
    );
    vfsBoard.position.y = 0.05;
    vfsBoard.castShadow = true;
    vfsBoard.receiveShadow = true;
    stage1Group.add(vfsBoard);

    // 8 Logical sector clusters (L0 - L7)
    const clusterMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.3,
    });
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        const clusterBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.15, 0.55), clusterMat);
        clusterBox.position.set(-0.9 + c * 0.6, 0.15, -0.4 + r * 0.8);
        clusterBox.castShadow = true;
        stage1Group.add(clusterBox);
      }
    }

    // Inode controller chip
    const inodeChip = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.2, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 })
    );
    inodeChip.position.set(0, 0.2, -0.9);
    inodeChip.castShadow = true;
    stage1Group.add(inodeChip);

    scene.add(stage1Group);

    // --- STAGE 2: UFS STORAGE CONTROLLER (FTL ASIC & Wirebonds) ---
    const stage2Group = new THREE.Group();
    stage2Group.position.set(0, 0, 0);
    stage2Group.userData = { stageIndex: 2 };

    // Substrate Package
    const ufsSubstrate = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.12, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.3, roughness: 0.5 })
    );
    ufsSubstrate.position.y = 0.06;
    ufsSubstrate.castShadow = true;
    ufsSubstrate.receiveShadow = true;
    stage2Group.add(ufsSubstrate);

    // Silicon ASIC Die (Flip-chip)
    const asicDie = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.25, 1.8),
      new THREE.MeshPhysicalMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
      })
    );
    asicDie.position.y = 0.22;
    asicDie.castShadow = true;
    stage2Group.add(asicDie);

    // Embedded SRAM Cache blocks on the die
    const sramMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    for (let i = 0; i < 4; i++) {
      const sram = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 0.35), sramMat);
      sram.position.set(-0.45 + (i % 2) * 0.9, 0.35, -0.45 + Math.floor(i / 2) * 0.9);
      stage2Group.add(sram);
    }

    // Gold Bond Wires from die to package
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0xb45309,
      emissiveIntensity: 0.2,
    });
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8), wireMat);
      wire.rotation.z = Math.PI / 3;
      wire.rotation.y = angle;
      wire.position.set(Math.cos(angle) * 1.1, 0.18, Math.sin(angle) * 1.1);
      stage2Group.add(wire);
    }

    scene.add(stage2Group);

    // --- STAGE 3: NAND FLASH MEMORY DIE (3D Array & Charge Pump) ---
    const stage3Group = new THREE.Group();
    stage3Group.position.set(5, 0, 0);
    stage3Group.userData = { stageIndex: 3 };

    // NAND Silicon Package
    const nandPackage = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.12, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    nandPackage.position.y = 0.06;
    nandPackage.castShadow = true;
    nandPackage.receiveShadow = true;
    stage3Group.add(nandPackage);

    // Stacked 3D Memory Die Array
    const nandDieStack = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.45, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x334155, // Blue-grey silicon
        metalness: 0.85,
        roughness: 0.2,
      })
    );
    nandDieStack.position.y = 0.34;
    nandDieStack.castShadow = true;
    stage3Group.add(nandDieStack);

    // Dickson Charge Pump Coils (High-Voltage 18V generator)
    const coilMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber high voltage
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.5,
    });
    for (let c = 0; c < 3; c++) {
      const pumpCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16), coilMat);
      pumpCap.position.set(-0.7 + c * 0.7, 0.45, 1.25);
      pumpCap.castShadow = true;
      stage3Group.add(pumpCap);
    }

    // Wordline Pillars (Vertical memory holes)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
    });
    for (let x = -0.7; x <= 0.7; x += 0.35) {
      for (let z = -0.7; z <= 0.7; z += 0.35) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), pillarMat);
        pillar.position.set(x, 0.4, z);
        stage3Group.add(pillar);
      }
    }

    scene.add(stage3Group);

    // --- STAGE 4: MEMORY TRANSISTOR (Floating-Gate MOSFET Cross-Section) ---
    const stage4Group = new THREE.Group();
    stage4Group.position.set(10, 0, 0);
    stage4Group.userData = { stageIndex: 4 };

    // 1. Silicon Substrate Base (p-type silicon)
    const subMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.6, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x334155, // Blue-grey silicon
        metalness: 0.4,
        roughness: 0.35,
      })
    );
    subMesh.position.y = 0.3;
    subMesh.castShadow = true;
    subMesh.receiveShadow = true;
    stage4Group.add(subMesh);

    // 2. Embedded Source & Drain Regions (n+ wells)
    const wellMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Distinct n+ diffusion
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0x0369a1,
      emissiveIntensity: 0.2,
    });
    const sourceWell = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.3, 1.8), wellMat);
    sourceWell.position.set(-0.95, 0.45, 0);
    stage4Group.add(sourceWell);

    const drainWell = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.3, 1.8), wellMat);
    drainWell.position.set(0.95, 0.45, 0);
    stage4Group.add(drainWell);

    // 3. Tunnel Oxide Layer (9.0 nm SiO₂ - translucent pale cyan)
    const toxMat = new THREE.MeshPhysicalMaterial({
      color: 0x67e8f9,
      transmission: 0.75,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      emissive: 0x0891b2,
      emissiveIntensity: 0.3,
    });
    const toxMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.6), toxMat);
    toxMesh.position.set(0, 0.64, 0);
    stage4Group.add(toxMesh);

    // 4. Floating Gate (Polysilicon conductor - muted gold)
    const fgMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0xb45309,
      emissiveIntensity: 0.35,
    });
    const fgMesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.25, 1.5), fgMat);
    fgMesh.position.set(0, 0.81, 0);
    fgMesh.castShadow = true;
    stage4Group.add(fgMesh);

    // 5. Inter-Poly Dielectric (IPD / ONO - dielectric barrier)
    const ipdMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.3,
      roughness: 0.5,
    });
    const ipdMesh = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.08, 1.6), ipdMat);
    ipdMesh.position.set(0, 0.98, 0);
    stage4Group.add(ipdMesh);

    // 6. Control Gate (Polysilicon / Metal Wordline - brushed silver)
    const cgMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x475569,
      emissiveIntensity: 0.2,
    });
    const cgMesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 1.7), cgMat);
    cgMesh.position.set(0, 1.18, 0);
    cgMesh.castShadow = true;
    stage4Group.add(cgMesh);

    // Stored Electrons inside Floating Gate (amber glowing charge spheres)
    const chargeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.0,
      metalness: 0.2,
      roughness: 0.2,
    });
    for (let e = 0; e < 6; e++) {
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), chargeMat);
      electron.position.set(-0.35 + (e % 3) * 0.35, 0.81, -0.25 + Math.floor(e / 3) * 0.5);
      stage4Group.add(electron);
    }

    scene.add(stage4Group);

    // Keep track of stage groups for raycasting
    const stageMeshes = [stage0Group, stage1Group, stage2Group, stage3Group, stage4Group];

    // 7. THE MOVING DATA PACKET (Violet/Cyan Energy Sphere)
    const packetGroup = new THREE.Group();
    
    // Core photon/electron sphere
    const packetCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6, // Violet for quantum/data packet
        emissive: 0x7c3aed,
        emissiveIntensity: 1.2,
        roughness: 0.1,
      })
    );
    packetGroup.add(packetCore);

    // Aura ring
    const packetAura = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.03, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
      })
    );
    packetAura.rotation.x = Math.PI / 2;
    packetGroup.add(packetAura);

    // Light attached to packet
    const packetLight = new THREE.PointLight(0x8b5cf6, 6, 4);
    packetGroup.add(packetLight);

    packetGroup.position.set(-10, 0.8, 0);
    scene.add(packetGroup);

    // 8. RAYCASTER FOR CLICKING ON 3D STAGES
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let parent = hit.object;
        while (parent && !parent.userData?.stageIndex && parent.userData?.stageIndex !== 0) {
          parent = parent.parent;
        }
        if (parent && parent.userData?.stageIndex !== undefined) {
          setCurrentStageIndex(parent.userData.stageIndex);
          break;
        }
      }
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);

    // 9. ANIMATION LOOP
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Rotate packet aura
      packetAura.rotation.z += delta * 2.5;

      // Animate packet position smoothly along X
      const targetX = JOURNEY_STAGES[currentStageIndex].pos[0];
      packetGroup.position.x += (targetX - packetGroup.position.x) * 0.08;
      packetGroup.position.y = 0.75 + Math.sin(time * 3) * 0.08;

      // Smooth camera motion
      camera.position.lerp(threeRef.current.targetCamPos, 0.05);
      threeRef.current.currentCamLookAt.lerp(threeRef.current.targetCamLookAt, 0.05);
      camera.lookAt(threeRef.current.currentCamLookAt);

      renderer.render(scene, camera);
      threeRef.current.reqId = requestAnimationFrame(animate);
    };

    threeRef.current.scene = scene;
    threeRef.current.camera = camera;
    threeRef.current.renderer = renderer;
    threeRef.current.packetMesh = packetGroup;
    threeRef.current.stageMeshes = stageMeshes;

    animate();

    // 10. RESIZE HANDLER
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(threeRef.current.reqId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Camera Target when Stage changes
  useEffect(() => {
    const stage = JOURNEY_STAGES[currentStageIndex];
    if (stage && threeRef.current.targetCamPos) {
      threeRef.current.targetCamPos.set(stage.camPos[0], stage.camPos[1], stage.camPos[2]);
      threeRef.current.targetCamLookAt.set(stage.camTarget[0], stage.camTarget[1], stage.camTarget[2]);
    }
  }, [currentStageIndex]);

  // Handle Play/Pause Auto-Advancing Loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(800, 3200 / playbackSpeed);
    const timer = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev >= JOURNEY_STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Controls Handlers
  const handlePlayPause = () => {
    if (currentStageIndex >= JOURNEY_STAGES.length - 1 && !isPlaying) {
      setCurrentStageIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => Math.min(JOURNEY_STAGES.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* Header & Sub-Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
            CINEMATIC ARCHITECTURE PIPELINE
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-main)' }}>
            Physical Storage Journey
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Follow a single photograph byte from camera memory down to the quantum floating-gate transistor.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Learning Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#FFFFFF',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '3px',
            }}
          >
            <button
              onClick={() => setPresentationMode('learning')}
              style={{
                background: presentationMode === 'learning' ? '#2563eb' : 'transparent',
                color: presentationMode === 'learning' ? '#FFFFFF' : 'var(--text-main)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🎓 Learning Mode
            </button>
            <button
              onClick={() => setPresentationMode('advanced')}
              style={{
                background: presentationMode === 'advanced' ? '#2563eb' : 'transparent',
                color: presentationMode === 'advanced' ? '#FFFFFF' : 'var(--text-main)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔬 Advanced Physics
            </button>
          </div>

          {onReturnToPhone && (
            <button onClick={onReturnToPhone} className="qml-btn qml-btn-secondary" style={{ fontSize: '11px' }}>
              📱 Return to Phone
            </button>
          )}
          {onOpenQuantumLab && (
            <button onClick={onOpenQuantumLab} className="qml-btn qml-btn-primary" style={{ fontSize: '11px' }}>
              ⚛️ Open Quantum Lab
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '520px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          background: '#f5f6f4',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

        {/* 3D Scene Overlay: Stage Breadcrumb Pills */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            padding: '6px 10px',
            borderRadius: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            zIndex: 10,
          }}
        >
          {JOURNEY_STAGES.map((s, idx) => {
            const isActive = idx === currentStageIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStageIndex(idx);
                }}
                style={{
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {idx + 1}. {s.title.split('. ')[1]}
              </button>
            );
          })}
        </div>

        {/* 3D Scene Overlay: Interactive Playback Controller */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(8px)',
            padding: '8px 16px',
            borderRadius: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
            zIndex: 10,
          }}
        >
          <button
            onClick={handleRestart}
            title="Restart Journey"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px 6px',
              color: 'var(--text-secondary)',
            }}
          >
            ⏮
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStageIndex === 0}
            title="Previous Stage"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: currentStageIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStageIndex === 0 ? 0.4 : 1,
              fontSize: '14px',
              padding: '4px 6px',
              color: 'var(--text-main)',
            }}
          >
            ◀
          </button>
          <button
            onClick={handlePlayPause}
            className="qml-btn qml-btn-primary"
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              borderRadius: '16px',
              fontWeight: 800,
              minWidth: '85px',
            }}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          <button
            onClick={handleNext}
            disabled={currentStageIndex === JOURNEY_STAGES.length - 1}
            title="Next Stage"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: currentStageIndex === JOURNEY_STAGES.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentStageIndex === JOURNEY_STAGES.length - 1 ? 0.4 : 1,
              fontSize: '14px',
              padding: '4px 6px',
              color: 'var(--text-main)',
            }}
          >
            ▶
          </button>
          <div style={{ width: '1px', height: '18px', background: 'var(--border-light)', margin: '0 4px' }} />
          <button
            onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {playbackSpeed}x
          </button>
        </div>

        {/* 3D Scene Overlay: Camera hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            background: 'rgba(255, 255, 255, 0.8)',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
        >
          💡 Click any component in 3D to inspect
        </div>
      </div>

      {/* STAGE EDUCATIONAL EXPLANATION CARDS (Structured Scientific Breakdown) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: What is this Component & Function? */}
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              STAGE {currentStageIndex + 1} OF 5
            </span>
            <span className="qml-badge qml-badge-cyan">{activeStage.scale}</span>
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            {activeStage.title}
          </h2>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#2563eb', marginBottom: '12px' }}>
            {activeStage.subtitle}
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            PHYSICAL FUNCTION:
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
            {activeStage.function}
          </p>
        </div>

        {/* Card 2: What is Happening Right Now? */}
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            borderRadius: '12px',
            borderLeft: '4px solid #2563eb',
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#2563eb', marginBottom: '8px' }}>
            LIVE OPERATION IN PROGRESS
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
            What is happening right now:
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
            {activeStage.currentActivity}
          </p>

          {presentationMode === 'advanced' && (
            <div
              style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-light)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {Object.entries(activeStage.advancedDetails).map(([key, value]) => (
                <div key={key}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{key.toUpperCase()}</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 3: Why is the Next Stage Necessary? */}
        <div
          className="glass-panel"
          style={{
            padding: '20px',
            borderRadius: '12px',
            borderLeft: '4px solid #f59e0b',
          }}
        >
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#b45309', marginBottom: '8px' }}>
            PHYSICAL ARCHITECTURE CONTINUUM
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
            Why the next stage is necessary:
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
            {activeStage.whyNextStage}
          </p>

          {currentStageIndex < JOURNEY_STAGES.length - 1 ? (
            <button
              onClick={handleNext}
              className="qml-btn qml-btn-secondary"
              style={{ width: '100%', padding: '8px', fontSize: '12px' }}
            >
              Proceed to {JOURNEY_STAGES[currentStageIndex + 1].title.split('. ')[1]} ➔
            </button>
          ) : (
            <button
              onClick={onOpenQuantumLab}
              className="qml-btn qml-btn-primary"
              style={{ width: '100%', padding: '8px', fontSize: '12px' }}
            >
              🔬 Inspect Quantum Tunnelling at the Transistor Gate ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
