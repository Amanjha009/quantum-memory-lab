import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

export const COMPONENT_DETAILS = {
  control_gate: {
    id: 'control_gate',
    name: 'Control Gate',
    shortName: 'Control Gate',
    material: 'Poly-2 / Tungsten Silicide (WSiₓ) Strap',
    spec: '70 nm Word Line thickness · 0.86 metalness',
    color: '#cbd5e1', // Brushed silver
    colorHex: 0xcbd5e1,
    side: 'right',
    slotIndex: 0,
    func: 'Continuous Word Line electrode running perpendicular to the bitline strings, wrapping into inter-cell valleys.',
    role: 'Applies ISPP programming pulses (14V–20V) to establish a vertical electric field across the oxide for Fowler–Nordheim tunneling.',
    desc: 'Top electrode connected to the memory Word Line. Wraps around the floating gate shoulders to provide a high gate coupling ratio (GCR ≈ 0.65–0.75).',
  },
  ipd: {
    id: 'ipd',
    name: 'Inter-Poly Dielectric (IPD)',
    shortName: 'Inter-Poly Dielectric',
    material: 'Oxide-Nitride-Oxide (ONO) Composite Sandwich',
    spec: '17.0 nm Physical (5nm SiO₂ / 7nm Si₃N₄ / 5nm SiO₂) · 13.6 nm EOT',
    color: '#c4b5fd', // Pale lavender
    colorHex: 0xc4b5fd,
    side: 'right',
    slotIndex: 1,
    func: 'Conformal saddle dielectric wrapping the top face and upper shoulders of the floating gate.',
    role: 'Provides high capacitive coupling to the control gate while preventing stored electrons from leaking upward during retention.',
    desc: 'High-integrity ONO composite stack. The middle Si₃N₄ layer provides a high dielectric constant (κ ≈ 7.5), yielding an Effective Oxide Thickness (EOT) of ~13.6 nm from 17.0 nm of physical material.',
  },
  floating_gate: {
    id: 'floating_gate',
    name: 'Floating Gate',
    shortName: 'Floating Gate',
    material: 'Phosphorus-doped Polycrystalline Silicon (Poly-1)',
    spec: '45 nm physical gate length · 40 nm height · Isolated Conductor',
    color: '#d97706', // Metallic bronze-gold
    colorHex: 0xd97706,
    side: 'right',
    slotIndex: 2,
    func: 'Electrically isolated conductive charge reservoir completely surrounded by high-integrity dielectrics.',
    role: 'Stores negative electrical charge (electrons). Trapped charge screens the channel, shifting the transistor threshold voltage (Vt) to encode binary data.',
    desc: 'Isolated doped polysilicon island with slightly tapered sidewalls (86°–88° RIE profile) and rounded shoulders. Trapped electrons remain contained for long-term retention without continuous power.',
  },
  drain: {
    id: 'drain',
    name: 'Drain Region',
    shortName: 'Drain',
    material: 'n+ Arsenic-doped Silicon Diffusion Well',
    spec: '100 nm junction depth · Gaussian straggle · Bit Line contact',
    color: '#1e3a8a', // Deep electric blue
    colorHex: 0x1e3a8a,
    side: 'right',
    slotIndex: 3,
    func: 'Heavily doped n-type carrier collector embedded inside the monocrystalline silicon substrate.',
    role: 'Connects to the column sense amplifier via vertical tungsten contact plugs, sensing whether drain current conducts during read operations.',
    desc: 'Self-aligned n+ diffusion region with realistic curved metallurgical junction contours formed by high-temperature thermal annealing.',
  },
  source: {
    id: 'source',
    name: 'Source Region',
    shortName: 'Source',
    material: 'n+ Arsenic-doped Silicon Diffusion Well',
    spec: '100 nm junction depth · Gaussian straggle · Common Source Line',
    color: '#1e3a8a', // Deep electric blue
    colorHex: 0x1e3a8a,
    side: 'left',
    slotIndex: 0,
    func: 'Heavily doped n-type electron reservoir embedded inside the silicon substrate.',
    role: 'Supplies electrons into the channel during read operations and supports self-boost channel inhibit during unselected write cycles.',
    desc: 'Self-aligned n+ diffusion region with curved sub-junction boundaries extending laterally underneath the gate oxide edges.',
  },
  channel: {
    id: 'channel',
    name: 'Silicon Inversion Channel',
    shortName: 'Channel',
    material: 'p-Type Silicon Surface Inversion Layer',
    spec: '10 nm inversion depth · 45 nm effective channel length (Leff)',
    color: '#0d9488', // Teal
    colorHex: 0x0d9488,
    side: 'left',
    slotIndex: 1,
    func: 'Surface semiconductor conduction bridge formed between Source and Drain beneath the gate oxide.',
    role: 'Supplies cold conduction electrons for Fowler–Nordheim tunneling under high gate bias, and conducts read current when gate voltage exceeds Vt.',
    desc: 'The active inversion region formed at the continuous substrate surface when the vertical electric field inverts p-type silicon to n-type conductivity.',
  },
  tunnel_oxide: {
    id: 'tunnel_oxide',
    name: 'Tunnel Oxide',
    shortName: 'Tunnel Oxide',
    material: 'Thermally Grown Silicon Dioxide (SiO₂)',
    spec: '9.0 nm physical thickness · 3.1 eV barrier height (φB) · IOR 1.46',
    color: '#38bdf8', // Transparent pale cyan
    colorHex: 0xa5f3fc,
    side: 'left',
    slotIndex: 2,
    func: 'Ultra-thin, atomically uniform insulating barrier separating the silicon channel from the floating gate.',
    role: 'Under low read bias, it prevents charge leakage. Under high programming bias (>0.8 GV/m), the conduction band tilts into a triangular barrier permitting Fowler–Nordheim tunneling.',
    desc: 'Atomically uniform thermal SiO₂ layer. In our 3D view, vertical thickness is magnified ~3.5× relative to wafer bulk for educational clarity.',
  },
  substrate: {
    id: 'substrate',
    name: 'Silicon Substrate',
    shortName: 'Silicon Substrate',
    material: 'p-Type Monocrystalline Silicon (100) Wafer',
    spec: 'Wafer bulk · Boron-doped (10¹⁶ cm⁻³) · Recessed STI Trenches',
    color: '#475569', // Slate blue-grey
    colorHex: 0x475569,
    side: 'left',
    slotIndex: 3,
    func: 'Continuous monocrystalline semiconductor wafer body supporting all active regions and STI isolation.',
    role: 'Forms p-n junctions with source/drain wells and maintains substrate ground bias (0V) during programming to establish the vertical oxide drop.',
    desc: 'Continuous monocrystalline silicon body featuring recessed Shallow Trench Isolation (STI) oxide trenches flanking the active channel mesa.',
  },
};

/**
 * 6-Stage Educational Animation Stages
 */
export const STAGE_DESCRIPTIONS = [
  {
    stage: 1,
    title: 'Stage 1 — Thermodynamic Equilibrium',
    desc: 'Unbiased device at zero gate voltage. Flat energy bands, zero electric field, channel non-conducting.',
    subtitle: 'Zero gate bias · Neutral floating gate · Vt ≈ 0.60 V (Logical Erased "1")',
  },
  {
    stage: 2,
    title: 'Stage 2 — High-Field Formation',
    desc: 'High gate voltage (14V–18V) applied to Control Gate. Capacitive divider drops ~70% across the 9.0 nm oxide, generating an electric field > 0.8 GV/m.',
    subtitle: 'Vox = 0.72 · (Vg - 1.2) · Band tilting bends rectangular barrier into triangular profile',
  },
  {
    stage: 3,
    title: 'Stage 3 — Channel Inversion & Wavepacket Approach',
    desc: 'Strong vertical field inverts the p-type silicon surface into an n-type electron channel. Electron wavepackets assemble at the oxide interface.',
    subtitle: 'Inversion layer formed · Wavefunctions approach classical turning point at x = 0',
  },
  {
    stage: 4,
    title: 'Stage 4 — Quantum Fowler–Nordheim Tunneling',
    desc: 'The triangular barrier allows cold electrons to tunnel directly into the conduction band of the SiO₂ oxide via quantum wave penetration.',
    subtitle: 'J_FN = A_FN · F² · exp(-B_FN / F) · Evanescent wave attenuation inside barrier',
  },
  {
    stage: 5,
    title: 'Stage 5 — Floating-Gate Charge Accumulation',
    desc: 'Tunneled electrons accumulate within the isolated poly-Si island, shifting the transistor threshold voltage from 0.60V up to >1.50V.',
    subtitle: 'ΔQ = J_FN · A_eff · tpulse · ΔVt = ΔQ / Ccg · Cell state switches to Programmed "0"',
  },
  {
    stage: 6,
    title: 'Stage 6 — Retention & Permanent Charge Storage',
    desc: 'Gate voltage removed (Vg = 0V). The electric field collapses and the energy barrier returns to a tall 3.1 eV rectangular wall, trapping stored charge for retention.',
    subtitle: 'Thermally stable quantum potential well · Programmed state verified by sense amplifier',
  },
];

/**
 * Creates precision beveled rounded geometry for clean specular highlight catching
 */
function createBeveledBoxGeometry(w, h, d, r = 0.035, segments = 2) {
  const shape = new THREE.Shape();
  const hw = Math.max(0.01, w / 2 - r);
  const hh = Math.max(0.01, h / 2 - r);

  shape.moveTo(-hw, -hh - r);
  shape.lineTo(hw, -hh - r);
  shape.quadraticCurveTo(hw + r, -hh - r, hw + r, -hh);
  shape.lineTo(hw + r, hh);
  shape.quadraticCurveTo(hw + r, hh + r, hw, hh + r);
  shape.lineTo(-hw, hh + r);
  shape.quadraticCurveTo(-hw - r, hh + r, -hw - r, hh);
  shape.lineTo(-hw - r, -hh);
  shape.quadraticCurveTo(-hw - r, -hh - r, -hw, -hh - r);

  const depth = Math.max(0.02, d - 2 * r);
  const extrudeSettings = {
    depth,
    bevelEnabled: true,
    bevelSegments: segments,
    steps: 1,
    bevelSize: r,
    bevelThickness: r,
  };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

/**
 * Creates a parametric curved diffusion well geometry (Gaussian metallurgical profile)
 */
function createCurvedDiffusionGeometry(width, peakDepth, length, zCenter, sigma = 0.32) {
  const geom = new THREE.BufferGeometry();
  const xSegs = 16;
  const zSegs = 24;

  const positions = [];
  const normals = [];
  const indices = [];

  const hw = width / 2;
  const hl = length / 2;

  // Grid of vertices representing top surface and curved bottom junction
  for (let iz = 0; iz <= zSegs; iz++) {
    const zNorm = iz / zSegs; // 0 to 1
    const z = -hl + zNorm * length;
    const distFromCenter = z - (zCenter || 0);
    // Gaussian depth curve
    const depth = peakDepth * Math.exp(-(distFromCenter * distFromCenter) / (2 * sigma * sigma));

    for (let ix = 0; ix <= xSegs; ix++) {
      const xNorm = ix / xSegs;
      const x = -hw + xNorm * width;
      // Top vertex (surface)
      positions.push(x, 0.85, z);
      normals.push(0, 1, 0);

      // Bottom curved junction vertex
      positions.push(x, 0.85 - depth, z);
      normals.push(0, -1, 0);
    }
  }

  // Construct side and bottom faces
  const stride = (xSegs + 1) * 2;
  for (let iz = 0; iz < zSegs; iz++) {
    for (let ix = 0; ix < xSegs; ix++) {
      const p1 = iz * stride + ix * 2;
      const p2 = p1 + 2;
      const p3 = (iz + 1) * stride + ix * 2;
      const p4 = p3 + 2;

      // Top surface triangles
      indices.push(p1, p3, p2);
      indices.push(p2, p3, p4);

      // Bottom curved junction triangles
      const b1 = p1 + 1;
      const b2 = p2 + 1;
      const b3 = p3 + 1;
      const b4 = p4 + 1;
      indices.push(b1, b2, b3);
      indices.push(b2, b4, b3);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates conformal ONO Saddle Geometry wrapping the top and shoulders of the floating gate
 */
function createOnoSaddleGeometry(fgWidth, fgHeight, fgDepth, onoThickness, wrapDownHeight) {
  const shape = new THREE.Shape();
  const hw = fgWidth / 2;
  const ot = onoThickness;

  // Outer profile
  shape.moveTo(-hw - ot, -wrapDownHeight);
  shape.lineTo(-hw - ot, ot);
  shape.quadraticCurveTo(-hw - ot, ot + ot, -hw, ot + ot);
  shape.lineTo(hw, ot + ot);
  shape.quadraticCurveTo(hw + ot, ot + ot, hw + ot, ot);
  shape.lineTo(hw + ot, -wrapDownHeight);

  // Inner profile (conformal to FG top & shoulders)
  shape.lineTo(hw, -wrapDownHeight);
  shape.lineTo(hw, 0);
  shape.lineTo(-hw, 0);
  shape.lineTo(-hw, -wrapDownHeight);
  shape.closePath();

  const extrudeSettings = {
    depth: fgDepth + 0.08,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.015,
    bevelThickness: 0.015,
  };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geom.center();
  return geom;
}

export default function TransistorScene({
  oxideThicknessNm = 9.0,
  gateVoltageV = 10,
  storedChargeFc = 0,
  selectedComponent = 'tunnel_oxide',
  onSelectComponent,
  viewMode = 'assembled', // 'assembled' | 'exploded' | 'cross_section'
  onViewModeChange,
  stage = 1,
  showField = false,
  showWave = false,
  isTunnelling = false,
  pulseTrigger = 0,
  resetTrigger = 0,
  // Backward compatibility
  selected,
  onSelect,
  resetKey,
  currentDensity = 0,
}) {
  const containerRef = useRef(null);

  // Unify props
  const activeSelected = selectedComponent || selected || 'tunnel_oxide';
  const handleSelectCallback = onSelectComponent || onSelect;
  const selectCallbackRef = useRef(handleSelectCallback);
  selectCallbackRef.current = handleSelectCallback;
  const lastStageRef = useRef(stage);

  // 3 Viewing Experiences state
  // 'manufacturing' (assembled) | 'cross_section' | 'quantum'
  const [internalViewType, setInternalViewType] = useState('manufacturing');
  const [crossSectionAxis, setCrossSectionAxis] = useState('bitline'); // 'bitline' | 'wordline' | 'quarter'
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeStageIndex, setActiveStageIndex] = useState(Math.max(0, Math.min(5, stage - 1)));

  // Label coordinates in 2D container pixels
  const [labelCoords, setLabelCoords] = useState({});
  const [containerSize, setContainerSize] = useState({ width: 800, height: 560 });
  const [showInspectionCard, setShowInspectionCard] = useState(true);
  const [showPlaybackController, setShowPlaybackController] = useState(true);

  // Active inspected component details
  const activeComp = useMemo(() => {
    return COMPONENT_DETAILS[activeSelected] || COMPONENT_DETAILS.tunnel_oxide;
  }, [activeSelected]);

  // Current stage data
  const currentStageInfo = STAGE_DESCRIPTIONS[activeStageIndex] || STAGE_DESCRIPTIONS[0];

  // Real-time calculated physics metrics
  const physicsHud = useMemo(() => {
    const vOxide = Math.max(0, 0.72 * (gateVoltageV - 1.2));
    const eFieldGvm = (vOxide / Math.max(1.0, oxideThicknessNm)).toFixed(3);
    const vtShiftV = (storedChargeFc / 0.05).toFixed(3); // Gate coupling cap C_cg = 50 aF
    return {
      vOxide: vOxide.toFixed(2),
      eFieldGvm,
      vtShiftV,
    };
  }, [gateVoltageV, oxideThicknessNm, storedChargeFc]);

  // Sync external stage prop with internal stage
  useEffect(() => {
    if (stage >= 1 && stage <= 6) {
      setActiveStageIndex(stage - 1);
    }
  }, [stage]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(1200, 4200 / playbackSpeed);
    const timer = setInterval(() => {
      setActiveStageIndex((prev) => {
        if (prev >= STAGE_DESCRIPTIONS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f7f5); // Studio warm off-white exhibition backdrop

    const camera = new THREE.PerspectiveCamera(34, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(5.4, 3.8, 6.8);
    camera.lookAt(0, 1.20, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // Dual-axis clipping planes
    const clipPlaneBL = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.05); // Slices along Bitline (reveals gate stack & junctions)
    const clipPlaneWL = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.02); // Slices along Wordline (reveals STI trenches & FG shoulders)

    // 2. Cinematic 4-Point Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(7.5, 13.0, 8.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.radius = 2.5;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    fillLight.position.set(-8.0, 5.5, 4.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.5);
    rimLight.position.set(0.0, 4.5, -8.0);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0xffedd5, 0.4);
    bounceLight.position.set(0, -6.0, 3.0);
    scene.add(bounceLight);

    // Studio floor pedestal grid
    const floorGrid = new THREE.GridHelper(16, 32, 0xcbd5e1, 0xe2e8f0);
    floorGrid.position.y = -0.01;
    scene.add(floorGrid);

    // Soft contact shadow circle beneath device
    const shadowGeo = new THREE.PlaneGeometry(6.8, 4.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.008, 0);
    scene.add(shadowMesh);

    // 3. Device Root Group
    const deviceGroup = new THREE.Group();
    scene.add(deviceGroup);

    const meshesMap = new Map();
    const outlinesMap = new Map();
    const anchorPointsMap = new Map();
    const allMaterials = [];

    const registerMat = (mat) => {
      allMaterials.push(mat);
      return mat;
    };

    // A. Substrate: Monocrystalline p-Type Silicon Wafer Bulk (#334155)
    // Continuous semiconductor body with recessed STI trenches on outer flanks
    const subGeo = createBeveledBoxGeometry(5.4, 0.85, 3.0, 0.04, 3);
    const subMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.46,
        metalness: 0.24,
      })
    );
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.set(0, 0.425, 0);
    subMesh.receiveShadow = true;
    subMesh.castShadow = true;
    subMesh.userData = { id: 'substrate' };
    deviceGroup.add(subMesh);
    meshesMap.set('substrate', subMesh);
    anchorPointsMap.set('substrate', new THREE.Vector3(-2.5, 0.425, 0));

    // A2. Shallow Trench Isolation (STI) Oxide blocks seated in outer trenches
    const stiGeo = createBeveledBoxGeometry(1.32, 0.36, 2.96, 0.02, 2);
    const stiMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x64748b, // Dense isolation oxide
        roughness: 0.52,
        metalness: 0.08,
      })
    );
    const stiLeft = new THREE.Mesh(stiGeo, stiMat);
    stiLeft.position.set(-2.04, 0.68, 0); // Recessed 0.05 below active channel mesa
    deviceGroup.add(stiLeft);

    const stiRight = new THREE.Mesh(stiGeo, stiMat);
    stiRight.position.set(2.04, 0.68, 0);
    deviceGroup.add(stiRight);

    // B. Source & Drain Wells: Embedded curved Gaussian diffusion profiles (#1e3a8a deep blue)
    const wellMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        roughness: 0.38,
        metalness: 0.32,
      })
    );

    // Parametric curved diffusion profiles with lateral straggle
    const sourceGeo = createCurvedDiffusionGeometry(2.50, 0.34, 1.25, 0.0, 0.30);
    const sourceMesh = new THREE.Mesh(sourceGeo, wellMat);
    sourceMesh.position.set(0, 0, -1.05); // Centered at z = -1.05
    sourceMesh.castShadow = true;
    sourceMesh.receiveShadow = true;
    sourceMesh.userData = { id: 'source' };
    deviceGroup.add(sourceMesh);
    meshesMap.set('source', sourceMesh);
    anchorPointsMap.set('source', new THREE.Vector3(-1.80, 0.74, -1.05));

    const drainGeo = createCurvedDiffusionGeometry(2.50, 0.34, 1.25, 0.0, 0.30);
    const drainMesh = new THREE.Mesh(drainGeo, wellMat);
    drainMesh.position.set(0, 0, 1.05); // Centered at z = +1.05
    drainMesh.castShadow = true;
    drainMesh.receiveShadow = true;
    drainMesh.userData = { id: 'drain' };
    deviceGroup.add(drainMesh);
    meshesMap.set('drain', drainMesh);
    anchorPointsMap.set('drain', new THREE.Vector3(1.80, 0.74, 1.05));

    // B2. Contacts directly attached to Source and Drain (Tungsten plugs with Ti/TiN liners)
    const tinMat = registerMat(
      new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.85, roughness: 0.30 }) // Golden-brass TiN
    );
    const viaMat = registerMat(
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.90, roughness: 0.20 }) // Refractory CVD Tungsten
    );

    // Source via assembly
    const viaCoreGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.65, 24);
    const viaLinerGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.65, 24);

    const sViaLiner = new THREE.Mesh(viaLinerGeo, tinMat);
    sViaLiner.position.set(0, 0.85 + 0.325, -1.05);
    deviceGroup.add(sViaLiner);

    const sViaCore = new THREE.Mesh(viaCoreGeo, viaMat);
    sViaCore.position.set(0, 0.85 + 0.325, -1.05);
    deviceGroup.add(sViaCore);

    // Drain via assembly
    const dViaLiner = new THREE.Mesh(viaLinerGeo, tinMat);
    dViaLiner.position.set(0, 0.85 + 0.325, 1.05);
    deviceGroup.add(dViaLiner);

    const dViaCore = new THREE.Mesh(viaCoreGeo, viaMat);
    dViaCore.position.set(0, 0.85 + 0.325, 1.05);
    deviceGroup.add(dViaCore);

    // Metal landing pads on top
    const padGeo = createBeveledBoxGeometry(0.44, 0.08, 0.44, 0.02, 2);
    const sPad = new THREE.Mesh(padGeo, viaMat);
    sPad.position.set(0, 0.85 + 0.65 + 0.04, -1.05);
    deviceGroup.add(sPad);

    const dPad = new THREE.Mesh(padGeo, viaMat);
    dPad.position.set(0, 0.85 + 0.65 + 0.04, 1.05);
    deviceGroup.add(dPad);

    // C. Inversion Channel: Teal surface layer formed between source and drain
    const chanGeo = createBeveledBoxGeometry(2.48, 0.07, 0.90, 0.015, 2);
    const chanMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0x0d9488,
        roughness: 0.28,
        metalness: 0.26,
      })
    );
    const chanMesh = new THREE.Mesh(chanGeo, chanMat);
    chanMesh.position.set(0, 0.815, 0); // Flush in substrate surface
    chanMesh.castShadow = true;
    chanMesh.receiveShadow = true;
    chanMesh.userData = { id: 'channel' };
    deviceGroup.add(chanMesh);
    meshesMap.set('channel', chanMesh);
    anchorPointsMap.set('channel', new THREE.Vector3(-1.20, 0.815, 0));

    // D. Tunnel Oxide: Thermal SiO₂, physical transmission & refraction
    const oxHeight = Math.max(0.06, (oxideThicknessNm / 9.0) * 0.10);
    const oxGeo = createBeveledBoxGeometry(2.48, oxHeight, 1.05, 0.015, 2);
    const oxMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xa5f3fc,
        metalness: 0.02,
        roughness: 0.06,
        transmission: 0.88,
        transparent: true,
        opacity: 0.58,
        ior: 1.46, // Accurate thermal SiO2 refractive index
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        attenuationColor: new THREE.Color(0x38bdf8),
        attenuationDistance: 0.5,
      })
    );
    const oxMesh = new THREE.Mesh(oxGeo, oxMat);
    oxMesh.position.set(0, 0.85 + oxHeight / 2, 0);
    oxMesh.castShadow = false;
    oxMesh.receiveShadow = true;
    oxMesh.userData = { id: 'tunnel_oxide' };
    deviceGroup.add(oxMesh);
    meshesMap.set('tunnel_oxide', oxMesh);
    anchorPointsMap.set('tunnel_oxide', new THREE.Vector3(-1.20, 0.90, 0));

    // E. Floating Gate: Doped polysilicon island (Poly-1, #d97706 metallic bronze)
    const fgGeo = createBeveledBoxGeometry(2.40, 0.45, 1.00, 0.035, 3);
    const fgMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.26,
        metalness: 0.84,
      })
    );
    const fgMesh = new THREE.Mesh(fgGeo, fgMat);
    fgMesh.position.set(0, 1.175, 0);
    fgMesh.castShadow = true;
    fgMesh.receiveShadow = true;
    fgMesh.userData = { id: 'floating_gate' };
    deviceGroup.add(fgMesh);
    meshesMap.set('floating_gate', fgMesh);
    anchorPointsMap.set('floating_gate', new THREE.Vector3(1.15, 1.175, 0));

    // F. Inter-Poly Dielectric (IPD): Conformal ONO Saddle capping FG top and shoulders
    // Physical thickness = 17 nm (EOT = 13.6 nm)
    const ipdGeo = createOnoSaddleGeometry(2.40, 0.45, 1.00, 0.16, 0.26);
    const ipdMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xc4b5fd,
        roughness: 0.16,
        metalness: 0.08,
        transparent: true,
        opacity: 0.74,
        transmission: 0.65,
        clearcoat: 0.8,
        clearcoatRoughness: 0.06,
      })
    );
    const ipdMesh = new THREE.Mesh(ipdGeo, ipdMat);
    ipdMesh.position.set(0, 1.48, 0);
    ipdMesh.castShadow = true;
    ipdMesh.receiveShadow = true;
    ipdMesh.userData = { id: 'ipd' };
    deviceGroup.add(ipdMesh);
    meshesMap.set('ipd', ipdMesh);
    anchorPointsMap.set('ipd', new THREE.Vector3(1.30, 1.48, 0));

    // G. Control Gate: Poly-2 + WSi Strap Word Line (#cbd5e1 brushed silver)
    // Wrap-around saddle filling inter-cell valleys along X-axis
    const cgGeo = createBeveledBoxGeometry(3.10, 0.54, 1.10, 0.04, 3);
    const cgMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.28,
        metalness: 0.86,
      })
    );
    const cgMesh = new THREE.Mesh(cgGeo, cgMat);
    cgMesh.position.set(0, 1.83, 0);
    cgMesh.castShadow = true;
    cgMesh.receiveShadow = true;
    cgMesh.userData = { id: 'control_gate' };
    deviceGroup.add(cgMesh);
    meshesMap.set('control_gate', cgMesh);
    anchorPointsMap.set('control_gate', new THREE.Vector3(1.40, 1.83, 0));

    // G2. Top Control Gate Contact Pad (Word Line WSi silicide strap)
    const cgViaGeo = createBeveledBoxGeometry(3.10, 0.14, 0.80, 0.02, 2);
    const cgVia = new THREE.Mesh(cgViaGeo, viaMat);
    cgVia.position.set(0, 0.34, 0);
    cgVia.castShadow = true;
    cgMesh.add(cgVia);

    // Subtle edge wireframes for high-end CAD definition
    meshesMap.forEach((mesh, id) => {
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.18 })
      );
      mesh.add(wire);
      outlinesMap.set(id, wire);
    });

    // 5. Electric Field Vectors across Tunnel Oxide (Stage 2)
    const fieldGroup = new THREE.Group();
    const fieldLineMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    for (let x = -0.95; x <= 0.95; x += 0.32) {
      for (let z = -0.35; z <= 0.35; z += 0.35) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0.85, z),
          new THREE.Vector3(x, 0.97, z),
        ]);
        const line = new THREE.Line(lineGeo, fieldLineMat);
        fieldGroup.add(line);
      }
    }
    fieldGroup.visible = false;
    deviceGroup.add(fieldGroup);

    // 6. Electron Wavepacket in Channel (Stage 3 & 4: Coherent wave)
    const waveGroup = new THREE.Group();
    const waveSegments = 48;
    const waveGeo = new THREE.BufferGeometry();
    const wavePositions = new Float32Array(waveSegments * 3);
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePositions, 3));
    const waveMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 3 });
    const waveLine = new THREE.Line(waveGeo, waveMat);
    waveGroup.add(waveLine);
    waveGroup.position.set(0, 0.82, 0);
    waveGroup.visible = false;
    deviceGroup.add(waveGroup);

    // 7. Stored Charge Cloud in Floating Gate (Stage 5 & 6)
    const chargeGroup = new THREE.Group();
    const chargeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const chargeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const chargeParticles = [];
    const maxChargeCount = 28;

    for (let i = 0; i < maxChargeCount; i++) {
      const p = new THREE.Mesh(chargeGeo, chargeMat);
      p.position.set(
        (Math.random() - 0.5) * 1.8,
        1.175 + (Math.random() - 0.5) * 0.32,
        (Math.random() - 0.5) * 0.8
      );
      p.userData = {
        basePos: p.position.clone(),
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 1.8,
      };
      chargeGroup.add(p);
      chargeParticles.push(p);
    }
    chargeGroup.visible = false;
    deviceGroup.add(chargeGroup);

    // 8. Tunnelling Pulse Stream (Through oxide into FG)
    const injectionStreamGroup = new THREE.Group();
    const streamGeo = new THREE.SphereGeometry(0.04, 10, 10);
    const streamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const streamParticles = [];
    for (let i = 0; i < 22; i++) {
      const sp = new THREE.Mesh(streamGeo, streamMat);
      sp.position.set((Math.random() - 0.5) * 1.8, 0.82, (Math.random() - 0.5) * 0.7);
      sp.userData = {
        progress: Math.random(),
        speed: 0.024 + Math.random() * 0.028,
        baseX: sp.position.x,
        baseZ: sp.position.z,
      };
      injectionStreamGroup.add(sp);
      streamParticles.push(sp);
    }
    injectionStreamGroup.visible = false;
    deviceGroup.add(injectionStreamGroup);

    // 9. Interactive Orbit & Pan Controls
    let isDragging = false;
    let isPanning = false;
    let prevMouse = { x: 0, y: 0 };

    const cameraPresets = {
      manufacturing: { radius: 7.6, phi: 1.16, theta: 0.65, lookAt: new THREE.Vector3(0, 1.25, 0) },
      cross_section: { radius: 6.6, phi: 1.22, theta: 0.42, lookAt: new THREE.Vector3(0, 1.15, 0) },
      quantum: { radius: 4.8, phi: 1.25, theta: 0.55, lookAt: new THREE.Vector3(0, 1.05, 0) },
      exploded: { radius: 9.4, phi: 1.08, theta: 0.72, lookAt: new THREE.Vector3(0, 1.85, 0) },
    };

    let spherical = { radius: 7.6, phi: 1.16, theta: 0.65 };
    let panOffset = new THREE.Vector3(0, 1.25, 0);

    let targetSpherical = { ...spherical };
    let targetLookAt = panOffset.clone();

    const updateCamera = () => {
      camera.position.x = panOffset.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = panOffset.y + spherical.radius * Math.cos(spherical.phi);
      camera.position.z = panOffset.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(panOffset);
    };
    updateCamera();

    const onPointerDown = (e) => {
      if (e.button === 2) {
        isPanning = true;
      } else {
        isDragging = true;
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      const dx = (e.clientX - prevMouse.x) * 0.0055;
      const dy = (e.clientY - prevMouse.y) * 0.0055;

      if (isDragging) {
        spherical.theta -= dx;
        spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy));
        targetSpherical.theta = spherical.theta;
        targetSpherical.phi = spherical.phi;
        updateCamera();
      } else if (isPanning) {
        panOffset.x -= dx;
        panOffset.y += dy;
        targetLookAt.copy(panOffset);
        updateCamera();
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
      isPanning = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius = Math.max(3.2, Math.min(16.0, spherical.radius + e.deltaY * 0.005));
      targetSpherical.radius = spherical.radius;
      updateCamera();
    };

    const onContextMenu = (e) => e.preventDefault();

    // Raycast click component inspection
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseCoord, camera);
      const meshes = [];
      meshesMap.forEach((m) => {
        if (m.isMesh) meshes.push(m);
      });

      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length > 0) {
        const hit = hits[0].object;
        const compId = hit.userData.id;
        if (compId && selectCallbackRef.current) {
          selectCallbackRef.current(compId);
        }
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('contextmenu', onContextMenu);
    container.addEventListener('click', onClick);

    // Target positions for smooth vertical layer lerping in exploded mode
    // Notice: Substrate, STI, Source, Drain and Channel remain physically integrated at base!
    const targetYOffsets = {
      assembled: { substrate: 0.425, source: 0.0, drain: 0.0, channel: 0.815, tunnel_oxide: 0.90, floating_gate: 1.175, ipd: 1.48, control_gate: 1.83 },
      exploded: { substrate: 0.425, source: 0.0, drain: 0.0, channel: 0.815, tunnel_oxide: 1.50, floating_gate: 2.25, ipd: 3.00, control_gate: 3.85 },
      cross_section: { substrate: 0.425, source: 0.0, drain: 0.0, channel: 0.815, tunnel_oxide: 0.90, floating_gate: 1.175, ipd: 1.48, control_gate: 1.83 },
    };

    let targetPositions = targetYOffsets[viewMode] || targetYOffsets.assembled;

    // Projected 2D screen positions for labels
    const tempVec = new THREE.Vector3();

    // 10. Animation Loop
    let animId;
    let clock = new THREE.Clock();
    let frameCounter = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      frameCounter++;

      // Smooth vertical lerping for exploded view transitions
      meshesMap.forEach((mesh, id) => {
        const ty = targetPositions[id];
        if (ty !== undefined) {
          if (id === 'source' || id === 'drain') {
            mesh.position.y += (ty - mesh.position.y) * 0.12;
          } else {
            mesh.position.y += (ty - mesh.position.y) * 0.12;
          }
        }
      });

      // Smooth camera interpolation towards target preset
      if (!isDragging && !isPanning) {
        spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;
        spherical.phi += (targetSpherical.phi - spherical.phi) * 0.08;
        spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;
        panOffset.lerp(targetLookAt, 0.08);

        // Gentle museum idle turntable rotation in Stage 1 assembled mode
        if (lastStageRef.current === 1 && internalViewType === 'manufacturing') {
          spherical.theta += 0.0006;
          targetSpherical.theta = spherical.theta;
        }
        updateCamera();
      }

      // Animate electron wavepacket in channel (Stage 3 & 4)
      if (waveGroup.visible) {
        const positions = waveLine.geometry.attributes.position.array;
        for (let i = 0; i < waveSegments; i++) {
          const x = (i / waveSegments) * 2.4 - 1.2;
          const y = Math.sin(x * 8 - elapsed * 4) * 0.08;
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = 0;
        }
        waveLine.geometry.attributes.position.needsUpdate = true;
      }

      // Animate warm amber stored charge in floating gate (Stage 5 & 6)
      if (chargeGroup.visible && meshesMap.has('floating_gate')) {
        const fgY = meshesMap.get('floating_gate').position.y;
        chargeParticles.forEach((p) => {
          p.position.y = fgY + (p.userData.basePos.y - 1.175) + Math.sin(elapsed * p.userData.speed + p.userData.phase) * 0.02;
        });
      }

      // Animate tunneling injection stream
      if (injectionStreamGroup.visible) {
        streamParticles.forEach((sp) => {
          sp.userData.progress += sp.userData.speed;
          if (sp.userData.progress > 1.0) sp.userData.progress = 0;
          sp.position.y = 0.82 + sp.userData.progress * (1.22 - 0.82);
          sp.position.x = sp.userData.baseX + Math.sin(sp.userData.progress * Math.PI * 4) * 0.035;
        });
      }

      // Project 3D anchor points to 2D container pixel coordinates every 2 frames
      if (frameCounter % 2 === 0 && container.clientWidth > 0 && container.clientHeight > 0) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const newCoords = {};

        anchorPointsMap.forEach((baseAnchor, compId) => {
          const mesh = meshesMap.get(compId);
          if (mesh) {
            tempVec.copy(baseAnchor);
            tempVec.y = mesh.position.y + (baseAnchor.y - (targetYOffsets.assembled[compId] || baseAnchor.y));
            tempVec.project(camera);

            const x = (tempVec.x * 0.5 + 0.5) * w;
            const y = (-(tempVec.y * 0.5) + 0.5) * h;
            const visible = tempVec.z < 1.0;
            newCoords[compId] = { x, y, visible };
          }
        });

        setLabelCoords(newCoords);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      setContainerSize({ width: w, height: h });
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Cleanup & methods attached to container
    container._cleanup = () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('contextmenu', onContextMenu);
      container.removeEventListener('click', onClick);
      resizeObserver.disconnect();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };

    // Update viewing modes and clipping planes
    container._updateViewMode = (mode, csAxis) => {
      targetPositions = targetYOffsets[mode] || targetYOffsets.assembled;
      const isCrossSection = mode === 'cross_section';

      let activePlanes = [];
      if (isCrossSection) {
        if (csAxis === 'bitline') {
          activePlanes = [clipPlaneBL];
        } else if (csAxis === 'wordline') {
          activePlanes = [clipPlaneWL];
        } else {
          // Quarter-cutaway
          activePlanes = [clipPlaneBL, clipPlaneWL];
        }
      }

      allMaterials.forEach((mat) => {
        mat.clippingPlanes = activePlanes;
        mat.clipShadows = isCrossSection;
      });

      // Camera preset glide
      let preset = cameraPresets.manufacturing;
      if (mode === 'exploded') {
        preset = cameraPresets.exploded;
      } else if (isCrossSection) {
        preset = cameraPresets.cross_section;
      }
      targetSpherical.radius = preset.radius;
      targetSpherical.phi = preset.phi;
      targetSpherical.theta = preset.theta;
      targetLookAt.copy(preset.lookAt);
    };

    // Highlight selected component
    container._updateHighlight = (selectedId) => {
      meshesMap.forEach((mesh, id) => {
        const outline = outlinesMap.get(id);
        const isSel = id === selectedId;
        if (outline) {
          outline.material.color.set(isSel ? 0x2563eb : 0x1e293b);
          outline.material.opacity = isSel ? 0.95 : 0.18;
        }
      });
    };

    // Smooth stage transitions
    container._onStageTransition = (newStage) => {
      lastStageRef.current = newStage;

      if (newStage === 2 || newStage === 3 || newStage === 4) {
        // Zoom closer towards oxide barrier & channel
        targetSpherical.radius = 6.2;
        targetLookAt.set(0, 1.05, 0);
      } else if (newStage === 5 || newStage === 6) {
        // View floating gate and full device
        targetSpherical.radius = 7.6;
        targetLookAt.set(0, 1.25, 0);
      }
    };

    container._updateStageVisuals = (stg, volt, chg, tunneling) => {
      fieldGroup.visible = stg === 2 || volt >= 12;
      waveGroup.visible = stg === 3 || stg === 4;

      const hasCharge = chg > 0.05 || stg >= 5;
      chargeGroup.visible = hasCharge;
      if (hasCharge) {
        const count = Math.min(maxChargeCount, Math.max(4, Math.round((chg / 0.42) * maxChargeCount)));
        chargeParticles.forEach((p, i) => { p.visible = i < count; });
      }

      injectionStreamGroup.visible = tunneling || stg === 4;
    };

    container._triggerPulseAnimation = () => {
      injectionStreamGroup.visible = true;
      setTimeout(() => {
        injectionStreamGroup.visible = false;
      }, 1400);
    };

    container._resetCamera = () => {
      const preset = cameraPresets.manufacturing;
      targetSpherical.radius = preset.radius;
      targetSpherical.phi = preset.phi;
      targetSpherical.theta = preset.theta;
      targetLookAt.copy(preset.lookAt);
    };

    return () => {
      if (container._cleanup) container._cleanup();
    };
  }, []); // Mount

  // Update viewMode and cross section
  useEffect(() => {
    if (containerRef.current?._updateViewMode) {
      containerRef.current._updateViewMode(viewMode, crossSectionAxis);
    }
  }, [viewMode, crossSectionAxis]);

  // Update highlight
  useEffect(() => {
    if (containerRef.current?._updateHighlight) {
      containerRef.current._updateHighlight(activeSelected);
    }
  }, [activeSelected]);

  // Stage transition
  useEffect(() => {
    if (containerRef.current?._onStageTransition) {
      containerRef.current._onStageTransition(activeStageIndex + 1);
    }
  }, [activeStageIndex]);

  // Visual effects
  useEffect(() => {
    if (containerRef.current?._updateStageVisuals) {
      containerRef.current._updateStageVisuals(
        activeStageIndex + 1,
        gateVoltageV,
        storedChargeFc,
        isTunnelling
      );
    }
  }, [activeStageIndex, gateVoltageV, storedChargeFc, isTunnelling]);

  // Pulse animation trigger
  useEffect(() => {
    if (pulseTrigger > 0 && containerRef.current?._triggerPulseAnimation) {
      containerRef.current._triggerPulseAnimation();
    }
  }, [pulseTrigger]);

  // Camera reset trigger
  useEffect(() => {
    const rKey = resetTrigger || resetKey || 0;
    if (rKey > 0 && containerRef.current?._resetCamera) {
      containerRef.current._resetCamera();
    }
  }, [resetTrigger, resetKey]);

  // Group components by side for stable non-overlapping vertical label slots
  const leftItems = [
    COMPONENT_DETAILS.source,
    COMPONENT_DETAILS.channel,
    COMPONENT_DETAILS.tunnel_oxide,
    COMPONENT_DETAILS.substrate,
  ];

  const rightItems = [
    COMPONENT_DETAILS.control_gate,
    COMPONENT_DETAILS.ipd,
    COMPONENT_DETAILS.floating_gate,
    COMPONENT_DETAILS.drain,
  ];

  const getSlotY = (slotIndex, totalSlots = 4) => {
    const topMargin = 85;
    const availableHeight = Math.max(260, containerSize.height - 200);
    const step = availableHeight / (totalSlots - 1);
    return topMargin + slotIndex * step;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '560px', userSelect: 'none' }}>
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '560px' }} />

      {/* Real-time Scientific Telemetry HUD Overlay (Top Center) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          padding: '6px 16px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#f8fafc',
          fontSize: '11px',
          fontFamily: 'var(--font-mono, monospace)',
          zIndex: 15,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#94a3b8' }}>GATE:</span>
          <strong style={{ color: '#38bdf8' }}>{gateVoltageV.toFixed(1)} V</strong>
        </div>
        <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#94a3b8' }}>E_OX:</span>
          <strong style={{ color: '#f59e0b' }}>{physicsHud.eFieldGvm} GV/m</strong>
        </div>
        <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#94a3b8' }}>Q_TRAP:</span>
          <strong style={{ color: '#10b981' }}>{storedChargeFc.toFixed(4)} fC</strong>
        </div>
        <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#94a3b8' }}>ΔVt:</span>
          <strong style={{ color: '#c084fc' }}>+{physicsHud.vtShiftV} V</strong>
        </div>
      </div>

      {/* SVG Leader Lines Overlay */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {/* Left Side Leader Lines */}
        {leftItems.map((item) => {
          const coord = labelCoords[item.id];
          if (!coord || !coord.visible) return null;
          const isSelected = activeSelected === item.id;
          const labelBoxX = 145;
          const labelBoxY = getSlotY(item.slotIndex, leftItems.length);
          const elbowX = Math.min(coord.x - 20, (labelBoxX + coord.x) / 2);

          return (
            <g key={`leader-${item.id}`}>
              <path
                d={`M ${coord.x} ${coord.y} L ${elbowX} ${labelBoxY} L ${labelBoxX} ${labelBoxY}`}
                fill="none"
                stroke={isSelected ? '#2563eb' : item.color}
                strokeWidth={isSelected ? 2 : 1.25}
                strokeDasharray={isSelected ? 'none' : '3,2'}
                opacity={isSelected ? 0.95 : 0.65}
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={isSelected ? 4 : 2.5}
                fill={isSelected ? '#2563eb' : item.color}
                stroke="#ffffff"
                strokeWidth={1}
              />
            </g>
          );
        })}

        {/* Right Side Leader Lines */}
        {rightItems.map((item) => {
          const coord = labelCoords[item.id];
          if (!coord || !coord.visible) return null;
          const isSelected = activeSelected === item.id;
          const labelBoxX = containerSize.width - 155;
          const labelBoxY = getSlotY(item.slotIndex, rightItems.length);
          const elbowX = Math.max(coord.x + 20, (labelBoxX + coord.x) / 2);

          return (
            <g key={`leader-${item.id}`}>
              <path
                d={`M ${coord.x} ${coord.y} L ${elbowX} ${labelBoxY} L ${labelBoxX} ${labelBoxY}`}
                fill="none"
                stroke={isSelected ? '#2563eb' : item.color}
                strokeWidth={isSelected ? 2 : 1.25}
                strokeDasharray={isSelected ? 'none' : '3,2'}
                opacity={isSelected ? 0.95 : 0.65}
              />
              <circle
                cx={coord.x}
                cy={coord.y}
                r={isSelected ? 4 : 2.5}
                fill={isSelected ? '#2563eb' : item.color}
                stroke="#ffffff"
                strokeWidth={1}
              />
            </g>
          );
        })}
      </svg>

      {/* LEFT COLUMN: 3D Labels (Source, Channel, Tunnel Oxide, Substrate) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {leftItems.map((item) => {
          const isSelected = activeSelected === item.id;
          const slotY = getSlotY(item.slotIndex, leftItems.length);

          return (
            <div
              key={item.id}
              onClick={() => {
                if (selectCallbackRef.current) selectCallbackRef.current(item.id);
                setShowInspectionCard(true);
              }}
              style={{
                position: 'absolute',
                top: `${slotY - 14}px`,
                left: 0,
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isSelected ? 'rgba(37, 99, 235, 0.10)' : 'rgba(255, 255, 255, 0.94)',
                border: `1.5px solid ${isSelected ? '#2563eb' : 'var(--border-light, #e2e8f0)'}`,
                boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
              title={`Click to inspect ${item.name}`}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 4px ${item.color}88`,
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? '#1e3a8a' : '#1e293b',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.shortName}
              </span>
            </div>
          );
        })}
      </div>

      {/* RIGHT COLUMN: 3D Labels (Control Gate, IPD, Floating Gate, Drain) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: '14px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {rightItems.map((item) => {
          const isSelected = activeSelected === item.id;
          const slotY = getSlotY(item.slotIndex, rightItems.length);

          return (
            <div
              key={item.id}
              onClick={() => {
                if (selectCallbackRef.current) selectCallbackRef.current(item.id);
                setShowInspectionCard(true);
              }}
              style={{
                position: 'absolute',
                top: `${slotY - 14}px`,
                right: 0,
                pointerEvents: 'auto',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isSelected ? 'rgba(37, 99, 235, 0.10)' : 'rgba(255, 255, 255, 0.94)',
                border: `1.5px solid ${isSelected ? '#2563eb' : 'var(--border-light, #e2e8f0)'}`,
                boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
              title={`Click to inspect ${item.name}`}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isSelected ? 700 : 600,
                  color: isSelected ? '#1e3a8a' : '#1e293b',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.shortName}
              </span>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 4px ${item.color}88`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Top Left: Viewing Experiences Switcher & Camera Controls */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          zIndex: 20,
        }}
      >
        <button
          onClick={() => {
            if (containerRef.current?._resetCamera) containerRef.current._resetCamera();
          }}
          className="qml-btn qml-btn-secondary"
          style={{ fontSize: '10px', padding: '4px 8px' }}
          title="Reset Camera Angle & Distance"
        >
          RESET CAM
        </button>

        {onViewModeChange && (
          <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.94)', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '2px', gap: '2px' }}>
            <button
              onClick={() => {
                onViewModeChange('assembled');
                setInternalViewType('manufacturing');
              }}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'assembled' ? '#2563eb' : 'transparent',
                color: viewMode === 'assembled' ? '#ffffff' : '#475569',
                fontWeight: viewMode === 'assembled' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              ASSEMBLED
            </button>
            <button
              onClick={() => {
                onViewModeChange('exploded');
                setInternalViewType('manufacturing');
              }}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'exploded' ? '#2563eb' : 'transparent',
                color: viewMode === 'exploded' ? '#ffffff' : '#475569',
                fontWeight: viewMode === 'exploded' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              EXPLODED
            </button>
            <button
              onClick={() => {
                onViewModeChange('cross_section');
                setInternalViewType('cross_section');
              }}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'cross_section' ? '#2563eb' : 'transparent',
                color: viewMode === 'cross_section' ? '#ffffff' : '#475569',
                fontWeight: viewMode === 'cross_section' ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              CROSS-SECTION
            </button>
          </div>
        )}

        {/* Cross-section sub-axis selector when in cross-section view */}
        {viewMode === 'cross_section' && (
          <div style={{ display: 'inline-flex', background: 'rgba(255, 255, 255, 0.94)', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '2px', gap: '2px' }}>
            <button
              onClick={() => setCrossSectionAxis('bitline')}
              style={{
                fontSize: '9px',
                padding: '3px 6px',
                borderRadius: '3px',
                border: 'none',
                background: crossSectionAxis === 'bitline' ? '#0284c7' : 'transparent',
                color: crossSectionAxis === 'bitline' ? '#ffffff' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Cut parallel to Bitline (reveals channel & junctions)"
            >
              BITLINE (BL)
            </button>
            <button
              onClick={() => setCrossSectionAxis('wordline')}
              style={{
                fontSize: '9px',
                padding: '3px 6px',
                borderRadius: '3px',
                border: 'none',
                background: crossSectionAxis === 'wordline' ? '#0284c7' : 'transparent',
                color: crossSectionAxis === 'wordline' ? '#ffffff' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Cut parallel to Wordline (reveals STI trenches & FG shoulders)"
            >
              WORDLINE (WL)
            </button>
            <button
              onClick={() => setCrossSectionAxis('quarter')}
              style={{
                fontSize: '9px',
                padding: '3px 6px',
                borderRadius: '3px',
                border: 'none',
                background: crossSectionAxis === 'quarter' ? '#0284c7' : 'transparent',
                color: crossSectionAxis === 'quarter' ? '#ffffff' : '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Combined corner cutaway (isometric dual cross-section)"
            >
              CORNER CUT
            </button>
          </div>
        )}
      </div>

      {/* Educational Dimension Disclaimer Tag (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(4px)',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '4px 10px',
          fontSize: '9px',
          color: '#475569',
          zIndex: 10,
          fontFamily: 'var(--font-mono, monospace)',
          pointerEvents: 'none',
          lineHeight: 1.4,
        }}
      >
        <div><strong>DIMENSION NORMALIZATION:</strong> 1 Unit ≈ 50 nm · ONO IPD = 17 nm (EOT 13.6 nm)</div>
        <div style={{ color: '#0284c7' }}>📐 9.0 nm oxide magnified ~3.5× for educational dielectric visibility</div>
      </div>

      {/* Advanced Educational Playback Controller (Bottom Center Panel) */}
      {showPlaybackController && (
        <div
          style={{
            position: 'absolute',
            bottom: '42px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '92%',
            maxWidth: '680px',
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
            padding: '10px 16px',
            zIndex: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Top row: Stage Title and Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                {currentStageInfo.title}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                {currentStageInfo.subtitle}
              </div>
            </div>

            {/* Playback Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setActiveStageIndex((s) => Math.max(0, s - 1))}
                disabled={activeStageIndex === 0}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: activeStageIndex === 0 ? '#64748b' : '#f8fafc',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: activeStageIndex === 0 ? 'not-allowed' : 'pointer',
                }}
                title="Previous Stage"
              >
                ◀ PREV
              </button>

              <button
                onClick={() => setIsPlaying((p) => !p)}
                style={{
                  background: isPlaying ? '#f59e0b' : '#2563eb',
                  border: 'none',
                  color: '#ffffff',
                  padding: '3px 12px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY SIM'}
              </button>

              <button
                onClick={() => setActiveStageIndex((s) => Math.min(STAGE_DESCRIPTIONS.length - 1, s + 1))}
                disabled={activeStageIndex === STAGE_DESCRIPTIONS.length - 1}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: activeStageIndex === STAGE_DESCRIPTIONS.length - 1 ? '#64748b' : '#f8fafc',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: activeStageIndex === STAGE_DESCRIPTIONS.length - 1 ? 'not-allowed' : 'pointer',
                }}
                title="Next Stage"
              >
                NEXT ▶
              </button>

              <button
                onClick={() => {
                  setActiveStageIndex(0);
                  setIsPlaying(false);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#94a3b8',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
                title="Replay from Stage 1"
              >
                ↺ REPLAY
              </button>

              {/* Speed Toggle */}
              <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', padding: '1px' }}>
                {[0.5, 1, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    style={{
                      border: 'none',
                      background: playbackSpeed === spd ? 'rgba(255,255,255,0.2)' : 'transparent',
                      color: playbackSpeed === spd ? '#ffffff' : '#64748b',
                      fontSize: '9px',
                      padding: '2px 5px',
                      cursor: 'pointer',
                    }}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', display: 'flex', gap: '3px' }}>
              {STAGE_DESCRIPTIONS.map((stg, idx) => (
                <div
                  key={stg.stage}
                  onClick={() => setActiveStageIndex(idx)}
                  style={{
                    flex: 1,
                    height: '100%',
                    background: idx <= activeStageIndex ? '#38bdf8' : 'transparent',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title={`Jump to ${stg.title}`}
                />
              ))}
            </div>
            <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8' }}>
              {activeStageIndex + 1}/6
            </span>
          </div>

          {/* Detailed Physical Stage Explanation */}
          <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.4 }}>
            {currentStageInfo.desc}
          </div>
        </div>
      )}

      {/* Bottom Floating Component Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          padding: '3px 12px',
          borderRadius: '20px',
          border: '1px solid var(--border-light, #e2e8f0)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          zIndex: 20,
          maxWidth: '92%',
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary, #64748b)', marginRight: '2px' }}>
          LAYERS:
        </span>
        {Object.values(COMPONENT_DETAILS).map((c) => {
          const isSel = activeSelected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                if (selectCallbackRef.current) selectCallbackRef.current(c.id);
                setShowInspectionCard(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: isSel ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                border: isSel ? '1px solid #2563eb' : '1px solid transparent',
                borderRadius: '12px',
                padding: '2px 7px',
                cursor: 'pointer',
                fontSize: '10px',
                color: isSel ? '#1e3a8a' : 'var(--text-main, #0f172a)',
                fontWeight: isSel ? 700 : 500,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color }} />
              <span>{c.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Floating Detailed Component Inspection Card (Top Right, when selected) */}
      {showInspectionCard && activeComp && (
        <div
          style={{
            position: 'absolute',
            top: '46px',
            right: '14px',
            width: '270px',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            border: '1.5px solid var(--border-medium, #cbd5e1)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            padding: '12px 14px',
            zIndex: 25,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: activeComp.color }} />
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>{activeComp.name}</strong>
            </div>
            <button
              onClick={() => setShowInspectionCard(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0,
                lineHeight: 1,
              }}
              title="Close card"
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', lineHeight: 1.4 }}>
            <div><strong>Material:</strong> {activeComp.material}</div>
            <div><strong>Spec:</strong> {activeComp.spec}</div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginBottom: '6px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Physical Function:
            </div>
            <div style={{ fontSize: '10px', color: '#1e293b', lineHeight: 1.4, marginTop: '2px' }}>
              {activeComp.func}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              Role in Flash Memory:
            </div>
            <div style={{ fontSize: '10px', color: '#475569', lineHeight: 1.4, marginTop: '2px' }}>
              {activeComp.role}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
