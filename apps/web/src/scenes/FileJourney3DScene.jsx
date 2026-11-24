import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * FileJourney3DScene
 * Multiscale 3D Three.js environment that transitions camera and visual focus
 * across the physical scales of solid-state storage:
 * - Macro: Monolithic NAND Chip package & Block 0
 * - Mid: Wordline Page & 8 Bitline Memory Cells
 * - Micro: Complete Floating-Gate MOSFET Cross-Section (Substrate, Wells, Channel,
 *   Tunnel Oxide, Floating Gate, IPD, Control Gate)
 * - Quantum: Electric field lines, violet tunneling wavepacket, and amber stored charge
 */
export default function FileJourney3DScene({
  stage = 1, // 1 to 12
  activeCell = 0, // 0 to 7
  targetBits = '01000001',
  pulseIndex = 0,
  isTunnelling = false,
  isVerified = false,
  storedChargeFc = 0,
}) {
  const containerRef = useRef(null);
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    targetCamPos: new THREE.Vector3(0, 4.0, 7.5),
    targetLookAt: new THREE.Vector3(0, 0.5, 0),
    currentLookAt: new THREE.Vector3(0, 0.5, 0),
    reqId: null,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f6f4); // Light neutral workspace
    scene.fog = new THREE.FogExp2(0xf5f6f4, 0.03);

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 4.0, 7.5);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // Cross-section clipping plane (Z > 0 cutaway for transistor)
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.08);

    // 2. Lighting - Natural Clean Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffbf5, 2.0);
    keyLight.position.set(8, 14, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.1);
    fillLight.position.set(-8, 6, 4);
    scene.add(fillLight);

    // Soft ground grid
    const grid = new THREE.GridHelper(16, 24, 0xcbd5e1, 0xe2e8f0);
    grid.position.y = -0.01;
    scene.add(grid);

    // ==========================================
    // 3. GROUP A: MACRO SCALE — NAND CHIP & 4 BLOCKS
    // ==========================================
    const chipGroup = new THREE.Group();
    chipGroup.position.set(-6, 0, 0);
    scene.add(chipGroup);

    // BGA Package Substrate (Emerald Green Solder Mask)
    const pcbGeo = new THREE.BoxGeometry(4.8, 0.14, 4.8);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0f3a2c, metalness: 0.3, roughness: 0.5 });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.position.y = 0.07;
    pcbMesh.receiveShadow = true;
    chipGroup.add(pcbMesh);

    // Monolithic Silicon Die
    const dieGeo = new THREE.BoxGeometry(3.6, 0.22, 3.6);
    const dieMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const dieMesh = new THREE.Mesh(dieGeo, dieMat);
    dieMesh.position.y = 0.25;
    dieMesh.castShadow = true;
    chipGroup.add(dieMesh);

    // 4 Physical Blocks on the Die (B0, B1, B2, B3)
    const blockMeshes = [];
    const blockPositions = [
      [-0.85, 0.38, -0.85], // Block 0 (Target)
      [0.85, 0.38, -0.85],  // Block 1
      [-0.85, 0.38, 0.85],  // Block 2
      [0.85, 0.38, 0.85],   // Block 3
    ];

    blockPositions.forEach((pos, bIdx) => {
      const isTarget = bIdx === 0;
      const bMat = new THREE.MeshStandardMaterial({
        color: isTarget ? 0x2563eb : 0x334155,
        metalness: 0.6,
        roughness: 0.3,
        emissive: isTarget ? 0x1d4ed8 : 0x000000,
        emissiveIntensity: isTarget ? 0.35 : 0.0,
      });
      const bMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 1.4), bMat);
      bMesh.position.set(pos[0], pos[1], pos[2]);
      bMesh.castShadow = true;
      chipGroup.add(bMesh);
      blockMeshes.push(bMesh);

      // Label outline
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(bMesh.geometry),
        new THREE.LineBasicMaterial({ color: isTarget ? 0x60a5fa : 0x64748b })
      );
      bMesh.add(wire);
    });

    // High-Voltage 18V Charge Pump Coils on Chip
    for (let c = 0; c < 3; c++) {
      const coil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2, emissive: 0xd97706, emissiveIntensity: 0.4 })
      );
      coil.position.set(-1.2 + c * 0.5, 0.42, 2.0);
      chipGroup.add(coil);
    }

    // ==========================================
    // 4. GROUP B: MID SCALE — WORDLINE PAGE & 8 CELLS
    // ==========================================
    const pageGroup = new THREE.Group();
    pageGroup.position.set(0, 0, 0);
    scene.add(pageGroup);

    // Page carrier substrate
    const pageBoard = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.08, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 })
    );
    pageBoard.position.y = 0.04;
    pageGroup.add(pageBoard);

    // Wordline conductive bus trace (Silver)
    const wlTrace = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.02, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2, emissive: 0x94a3b8, emissiveIntensity: 0.3 })
    );
    wlTrace.position.set(0, 0.09, -0.6);
    pageGroup.add(wlTrace);

    // 8 SLC Transistor Cell Pins on the Page
    const pageCellMeshes = [];
    for (let i = 0; i < 8; i++) {
      const xPos = -1.75 + i * 0.5;
      const bitVal = targetBits[i] || '0';
      const isTargetProgram = bitVal === '0';

      const cellMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.22, 0.65),
        new THREE.MeshStandardMaterial({
          color: isTargetProgram ? 0x2563eb : 0x64748b,
          metalness: 0.6,
          roughness: 0.3,
          emissive: isTargetProgram ? 0x1d4ed8 : 0x000000,
          emissiveIntensity: isTargetProgram ? 0.3 : 0.0,
        })
      );
      cellMesh.position.set(xPos, 0.18, 0.1);
      cellMesh.castShadow = true;
      pageGroup.add(cellMesh);
      pageCellMeshes.push(cellMesh);

      // Bit Line Contact Via
      const via = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.3, 12),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
      );
      via.position.set(0, 0.2, 0.2);
      cellMesh.add(via);
    }

    // ==========================================
    // 5. GROUP C: MICRO SCALE — 3D FLOATING-GATE MOSFET
    // ==========================================
    const transistorGroup = new THREE.Group();
    transistorGroup.position.set(6, 0, 0);
    scene.add(transistorGroup);

    // Material generator with local clipping plane support
    const allMaterials = [];
    const createTransistorMat = (params) => {
      const mat = new THREE.MeshStandardMaterial({
        ...params,
        clippingPlanes: [clipPlane],
        clipShadows: true,
      });
      allMaterials.push(mat);
      return mat;
    };

    // 1. Silicon Substrate (p-type monocrystalline silicon, blue-grey #475569)
    const subMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.7, 2.4),
      createTransistorMat({ color: 0x475569, metalness: 0.20, roughness: 0.50 })
    );
    subMesh.position.y = 0.35;
    subMesh.receiveShadow = true;
    transistorGroup.add(subMesh);

    // 2. Embedded Source & Drain Wells (n+ diffusion, deep blue #1e3a8a)
    const wellMat = createTransistorMat({ color: 0x1e3a8a, metalness: 0.35, roughness: 0.38, emissive: 0x172554, emissiveIntensity: 0.2 });
    const sWell = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.32, 2.0), wellMat);
    sWell.position.set(-1.15, 0.54, 0);
    transistorGroup.add(sWell);

    const dWell = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.32, 2.0), wellMat);
    dWell.position.set(1.15, 0.54, 0);
    transistorGroup.add(dWell);

    // Metal Contacts for Source and Drain (Tungsten plugs)
    const contactMat = createTransistorMat({ color: 0xcbd5e1, metalness: 0.88, roughness: 0.22 });
    const sContact = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16), contactMat);
    sContact.position.set(-1.15, 0.85, 0);
    transistorGroup.add(sContact);

    const dContact = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 16), contactMat);
    dContact.position.set(1.15, 0.85, 0);
    transistorGroup.add(dContact);

    // 3. Silicon Surface Channel (Teal #0d9488)
    const chanMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.06, 1.8),
      createTransistorMat({ color: 0x0d9488, metalness: 0.28, roughness: 0.30 })
    );
    chanMesh.position.set(0, 0.72, 0);
    transistorGroup.add(chanMesh);

    // 4. Tunnel Oxide (9.0 nm SiO₂ — transparent pale cyan #a5f3fc, n=1.46)
    const toxMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      metalness: 0.02,
      roughness: 0.08,
      transmission: 0.88,
      transparent: true,
      opacity: 0.55,
      ior: 1.46,
      clearcoat: 1.0,
      clippingPlanes: [clipPlane],
      clipShadows: true,
    });
    allMaterials.push(toxMat);
    const toxMesh = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.1, 1.8), toxMat);
    toxMesh.position.set(0, 0.80, 0);
    transistorGroup.add(toxMesh);

    // 5. Floating Gate (Polysilicon conductor — metallic gold #d97706)
    const fgMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.38, 1.65),
      createTransistorMat({ color: 0xd97706, metalness: 0.88, roughness: 0.22, clearcoat: 0.4 })
    );
    fgMesh.position.set(0, 1.04, 0);
    fgMesh.castShadow = true;
    transistorGroup.add(fgMesh);

    // 6. Inter-Poly Dielectric (IPD — Oxide-Nitride-Oxide sandwich cap, pale lavender #c4b5fd)
    const ipdMat = new THREE.MeshPhysicalMaterial({
      color: 0xc4b5fd,
      roughness: 0.18,
      metalness: 0.08,
      transmission: 0.65,
      transparent: true,
      opacity: 0.72,
      clippingPlanes: [clipPlane],
    });
    allMaterials.push(ipdMat);
    const ipdMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 1.8), ipdMat);
    ipdMesh.position.set(0, 1.29, 0);
    transistorGroup.add(ipdMesh);

    // 7. Control Gate (Word Line electrode — brushed silver #cbd5e1)
    const cgMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.42, 1.9),
      createTransistorMat({ color: 0xcbd5e1, metalness: 0.84, roughness: 0.30 })
    );
    cgMesh.position.set(0, 1.56, 0);
    cgMesh.castShadow = true;
    transistorGroup.add(cgMesh);

    // Control Gate Top Contact Pad
    const cgContact = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.12, 0.7),
      createTransistorMat({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 })
    );
    cgContact.position.set(0, 1.83, 0);
    transistorGroup.add(cgContact);

    // 8. Dynamic Electric Field Lines across Tunnel Oxide (Blue vertical lines)
    const fieldLinesGroup = new THREE.Group();
    const fMat = new THREE.LineBasicMaterial({ color: 0x2563eb, linewidth: 2, transparent: true, opacity: 0.8 });
    for (let x = -0.55; x <= 0.55; x += 0.25) {
      for (let z = -0.5; z <= 0.5; z += 0.35) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, 0.74, z),
          new THREE.Vector3(x, 0.86, z),
        ]);
        fieldLinesGroup.add(new THREE.Line(lineGeo, fMat));
      }
    }
    fieldLinesGroup.visible = false;
    transistorGroup.add(fieldLinesGroup);

    // 9. Quantum Wavepacket Ribbons (Soft violet #8b5cf6)
    const waveSegments = 36;
    const waveGeo = new THREE.BufferGeometry();
    const wavePosArray = new Float32Array(waveSegments * 3);
    waveGeo.setAttribute('position', new THREE.BufferAttribute(wavePosArray, 3));
    const waveLine = new THREE.Line(
      waveGeo,
      new THREE.LineBasicMaterial({ color: 0x8b5cf6, linewidth: 3 })
    );
    waveLine.position.set(0, 0.77, 0);
    waveLine.visible = false;
    transistorGroup.add(waveLine);

    // 10. Trapped Charge Cloud in Floating Gate (Warm amber #f59e0b particles)
    const chargeGroup = new THREE.Group();
    const chargeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const chargeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const chargeParticles = [];
    for (let c = 0; c < 14; c++) {
      const p = new THREE.Mesh(chargeGeo, chargeMat);
      p.position.set(
        (Math.random() - 0.5) * 1.1,
        1.04 + (Math.random() - 0.5) * 0.24,
        (Math.random() - 0.5) * 1.2
      );
      p.userData = {
        baseY: p.position.y,
        speed: 1.5 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
      };
      chargeGroup.add(p);
      chargeParticles.push(p);
    }
    chargeGroup.visible = false;
    transistorGroup.add(chargeGroup);

    // 11. Mouse Drag Controls (Manual Orbit)
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const spherical = { radius: 7.5, theta: 0, phi: Math.PI / 4 };

    const onPointerDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      prevMousePos = { x: e.clientX, y: e.clientY };

      spherical.theta -= dx * 0.006;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.006));
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 12. Animation Loop with Smooth Camera Transitions
    let clock = new THREE.Clock();

    const animate = () => {
      threeRef.current.reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate wavepacket
      if (waveLine.visible) {
        const arr = waveLine.geometry.attributes.position.array;
        for (let i = 0; i < waveSegments; i++) {
          const x = (i / waveSegments) * 1.6 - 0.8;
          const y = Math.sin(x * 10 - elapsed * 5) * 0.06;
          arr[i * 3] = x;
          arr[i * 3 + 1] = y;
          arr[i * 3 + 2] = 0;
        }
        waveLine.geometry.attributes.position.needsUpdate = true;
      }

      // Animate trapped charge gentle float
      if (chargeGroup.visible) {
        chargeParticles.forEach((p) => {
          p.position.y = p.userData.baseY + Math.sin(elapsed * p.userData.speed + p.userData.phase) * 0.015;
        });
      }

      // Smooth camera interpolation
      if (!isDragging) {
        camera.position.lerp(threeRef.current.targetCamPos, 0.045);
        threeRef.current.currentLookAt.lerp(threeRef.current.targetLookAt, 0.045);
        camera.lookAt(threeRef.current.currentLookAt);
      } else {
        const x = threeRef.current.targetLookAt.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        const y = threeRef.current.targetLookAt.y + spherical.radius * Math.cos(spherical.phi);
        const z = threeRef.current.targetLookAt.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
        camera.position.set(x, y, z);
        camera.lookAt(threeRef.current.targetLookAt);
      }

      renderer.render(scene, camera);
    };

    animate();

    threeRef.current.scene = scene;
    threeRef.current.camera = camera;
    threeRef.current.renderer = renderer;
    threeRef.current.fieldLinesGroup = fieldLinesGroup;
    threeRef.current.waveLine = waveLine;
    threeRef.current.chargeGroup = chargeGroup;
    threeRef.current.blockMeshes = blockMeshes;
    threeRef.current.pageCellMeshes = pageCellMeshes;

    // Resize handling
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(threeRef.current.reqId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Visuals and Camera Target on Stage Change
  useEffect(() => {
    if (!threeRef.current.camera) return;

    const { targetCamPos, targetLookAt, fieldLinesGroup, waveLine, chargeGroup, pageCellMeshes } = threeRef.current;

    // Update active cell highlighting in Page Group
    if (pageCellMeshes && pageCellMeshes.length > 0) {
      pageCellMeshes.forEach((mesh, idx) => {
        const isCurrent = idx === activeCell;
        mesh.material.color.setHex(isCurrent ? 0x2563eb : 0x475569);
        mesh.material.emissive.setHex(isCurrent ? 0x1d4ed8 : 0x000000);
        mesh.material.emissiveIntensity = isCurrent ? 0.4 : 0.0;
      });
    }

    // Camera viewpoints by stage
    if (stage <= 5) {
      // Stages 1–5: Broad view of system/pipeline
      targetCamPos.set(0, 4.0, 7.5);
      targetLookAt.set(0, 0.5, 0);
      if (fieldLinesGroup) fieldLinesGroup.visible = false;
      if (waveLine) waveLine.visible = false;
      if (chargeGroup) chargeGroup.visible = false;
    } else if (stage === 6) {
      // Stage 6: Zoom into NAND Chip & Block 0
      targetCamPos.set(-6, 3.2, 4.2);
      targetLookAt.set(-6, 0.4, 0);
      if (fieldLinesGroup) fieldLinesGroup.visible = false;
      if (waveLine) waveLine.visible = false;
      if (chargeGroup) chargeGroup.visible = false;
    } else if (stage === 7) {
      // Stage 7: Zoom into Wordline Page & 8 Memory Cells
      targetCamPos.set(0, 2.2, 3.0);
      targetLookAt.set(0, 0.3, 0);
      if (fieldLinesGroup) fieldLinesGroup.visible = false;
      if (waveLine) waveLine.visible = false;
      if (chargeGroup) chargeGroup.visible = false;
    } else if (stage === 8) {
      // Stage 8: Zoom into Selected Memory Transistor Cross-Section
      targetCamPos.set(6, 2.4, 3.8);
      targetLookAt.set(6, 0.95, 0);
      if (fieldLinesGroup) fieldLinesGroup.visible = false;
      if (waveLine) waveLine.visible = false;
      if (chargeGroup) chargeGroup.visible = false;
    } else if (stage === 9) {
      // Stage 9: Quantum Tunnelling (High Field & Wavepacket)
      targetCamPos.set(6, 1.8, 2.8);
      targetLookAt.set(6, 0.95, 0);
      if (fieldLinesGroup) fieldLinesGroup.visible = true;
      if (waveLine) waveLine.visible = true;
      if (chargeGroup) chargeGroup.visible = false;
    } else if (stage === 10) {
      // Stage 10: Stored Charge in Floating Gate
      targetCamPos.set(6, 1.8, 2.8);
      targetLookAt.set(6, 1.05, 0);
      if (fieldLinesGroup) fieldLinesGroup.visible = true;
      if (waveLine) waveLine.visible = false;
      if (chargeGroup) chargeGroup.visible = true;
    } else if (stage >= 11) {
      // Stages 11 & 12: Read Verification & File Saved
      targetCamPos.set(6, 2.2, 3.4);
      targetLookAt.set(6, 0.95, 0);
      if (fieldLinesGroup) fieldLinesGroup.visible = false;
      if (waveLine) waveLine.visible = false;
      if (chargeGroup) chargeGroup.visible = true;
    }
  }, [stage, activeCell, targetBits]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />

      {/* 3D Scale Watermark HUD */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-main)',
          pointerEvents: 'none',
        }}
      >
        {stage <= 5 && '📍 SYSTEM SCALE · CONSUMER DEVICE & CHIP'}
        {stage === 6 && '📍 MACRO SCALE · NAND DIE (6.5 × 8.2 mm) · BLOCK 0'}
        {stage === 7 && '📍 MID SCALE · WORDLINE PAGE WL0 · 8 SLC CELLS'}
        {stage === 8 && `📍 MICRO SCALE · TRANSISTOR CELL C${activeCell} CROSS-SECTION`}
        {stage === 9 && '📍 QUANTUM SCALE · 9.0 nm SIO₂ TUNNEL OXIDE · E_OX = 1.02 GV/m'}
        {stage === 10 && '📍 CHARGE SCALE · POLYSILICON FLOATING GATE · Q ≈ -24 aC'}
        {stage >= 11 && '📍 READ/VERIFY SCALE · BITLINE SENSE COMPARATOR'}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          fontSize: '10px',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.8)',
          padding: '3px 8px',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      >
        💡 Click & drag to rotate 3D view freely
      </div>
    </div>
  );
}
