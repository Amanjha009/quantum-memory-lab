import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Smartphone3DScene({
  powered = true,
  activePhoto = null,
  activeTab = 'Photos',
  onRotatePrompt,
}) {
  const containerRef = useRef(null);
  const [viewAngle, setViewAngle] = useState('front'); // 'front' | 'back' | 'iso'

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f6f4);

    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 50);
    camera.position.set(0, 0, 7.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Realistic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 2.4);
    keyLight.position.set(5, 8, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.8);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.0);
    fillLight.position.set(0, -6, 5);
    scene.add(fillLight);

    // Subtle floor pedestal shadow
    const floorShadowGeo = new THREE.PlaneGeometry(6, 6);
    const floorShadowMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const floorShadow = new THREE.Mesh(floorShadowGeo, floorShadowMat);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -2.25;
    scene.add(floorShadow);

    // 3. Complete 3D Smartphone Root Group
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    // Dimensions: Modern flagship phone scale (ratio ~19.5:9, height 3.6, width 1.75, depth 0.22)
    const phoneW = 1.82;
    const phoneH = 3.75;
    const phoneD = 0.20;
    const cornerR = 0.28;

    // Materials
    const titaniumFrameMat = new THREE.MeshStandardMaterial({
      color: 0x272c35, // Natural brushed titanium
      metalness: 0.88,
      roughness: 0.26,
    });

    const backGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x181e26, // Matte space grey frosted glass
      roughness: 0.38,
      metalness: 0.22,
      clearcoat: 0.7,
      clearcoatRoughness: 0.25,
    });

    const bezelMat = new THREE.MeshBasicMaterial({ color: 0x05070a });

    const screenOffMat = new THREE.MeshStandardMaterial({
      color: 0x080b10,
      roughness: 0.15,
      metalness: 0.3,
    });

    // Screen dynamic texture canvas
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 512;
    screenCanvas.height = 1024;
    const sCtx = screenCanvas.getContext('2d');

    const updateScreenTexture = () => {
      if (!sCtx) return;
      if (!powered) {
        sCtx.fillStyle = '#05070a';
        sCtx.fillRect(0, 0, 512, 1024);
        return;
      }

      // Elegant gradient wallpaper
      const grad = sCtx.createLinearGradient(0, 0, 512, 1024);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.4, '#1e293b');
      grad.addColorStop(0.7, '#0369a1');
      grad.addColorStop(1, '#0284c7');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 1024);

      // Status Bar
      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 28px Inter, sans-serif';
      sCtx.fillText('09:41', 40, 56);
      sCtx.font = '22px Inter, sans-serif';
      sCtx.fillText('5G ▰ 94%', 380, 56);

      // Photo preview or active view if available
      if (activePhoto && activePhoto.preview) {
        sCtx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        sCtx.roundRect(40, 180, 432, 432, 24);
        sCtx.fill();
        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 26px Inter, sans-serif';
        sCtx.fillText(activePhoto.title || activePhoto.name || 'Sample Photo', 60, 240);
        sCtx.font = '20px JetBrains Mono, monospace';
        sCtx.fillStyle = '#38bdf8';
        sCtx.fillText('256 KB · LBA 0-1 Assigned', 60, 280);
        sCtx.fillStyle = '#e2e8f0';
        sCtx.font = '20px Inter, sans-serif';
        sCtx.fillText('NAND Flash Memory Lab', 60, 540);
        sCtx.fillText('Quantum Fowler-Nordheim Ready', 60, 575);
      } else {
        // App Grid
        sCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        sCtx.roundRect(40, 160, 432, 260, 24);
        sCtx.fill();

        sCtx.fillStyle = '#ffffff';
        sCtx.font = 'bold 28px Inter, sans-serif';
        sCtx.fillText('Quantum Memory Lab', 60, 220);
        sCtx.fillStyle = '#94a3b8';
        sCtx.font = '22px Inter, sans-serif';
        sCtx.fillText('Active App: ' + activeTab, 60, 260);
        sCtx.font = '18px JetBrains Mono, monospace';
        sCtx.fillStyle = '#38bdf8';
        sCtx.fillText('UFS 4.0 · 3D BiCS NAND Active', 60, 310);
      }

      // Bottom Dock
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      sCtx.roundRect(40, 880, 432, 85, 42);
      sCtx.fill();

      // Home indicator bar
      sCtx.fillStyle = '#ffffff';
      sCtx.roundRect(176, 995, 160, 8, 4);
      sCtx.fill();
    };

    updateScreenTexture();
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.generateMipmaps = true;
    screenTexture.minFilter = THREE.LinearMipmapLinearFilter;

    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      roughness: 0.1,
      metalness: 0.1,
    });

    // A. Extruded Rounded Chassis Geometry for Real Metallic Frame
    const phoneShape = new THREE.Shape();
    const x0 = -phoneW / 2;
    const y0 = -phoneH / 2;
    const w = phoneW;
    const h = phoneH;
    const r = cornerR;

    phoneShape.moveTo(x0 + r, y0);
    phoneShape.lineTo(x0 + w - r, y0);
    phoneShape.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    phoneShape.lineTo(x0 + w, y0 + h - r);
    phoneShape.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
    phoneShape.lineTo(x0 + r, y0 + h);
    phoneShape.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    phoneShape.lineTo(x0, y0 + r);
    phoneShape.quadraticCurveTo(x0, y0, x0 + r, y0);

    const extrudeSettings = {
      depth: phoneD,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    };

    const chassisGeo = new THREE.ExtrudeGeometry(phoneShape, extrudeSettings);
    chassisGeo.center();
    const chassisMesh = new THREE.Mesh(chassisGeo, titaniumFrameMat);
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    phoneGroup.add(chassisMesh);

    // B. Back Frosted Glass Plate
    const backPlateGeo = new THREE.PlaneGeometry(phoneW - 0.06, phoneH - 0.06);
    const backPlate = new THREE.Mesh(backPlateGeo, backGlassMat);
    backPlate.position.set(0, 0, -phoneD / 2 - 0.026);
    backPlate.rotation.y = Math.PI;
    phoneGroup.add(backPlate);

    // C. Rear Camera Plateau (Flagship Triple Lens Island)
    const cameraPlateauGeo = new THREE.BoxGeometry(0.72, 0.72, 0.06);
    const cameraPlateauMat = new THREE.MeshStandardMaterial({
      color: 0x1e2530,
      roughness: 0.25,
      metalness: 0.75,
    });
    const cameraPlateau = new THREE.Mesh(cameraPlateauGeo, cameraPlateauMat);
    cameraPlateau.position.set(-phoneW / 2 + 0.48, phoneH / 2 - 0.52, -phoneD / 2 - 0.055);
    phoneGroup.add(cameraPlateau);

    // Triple Sapphire Camera Lenses with Metallic Rings
    const lensPositions = [
      [-phoneW / 2 + 0.35, phoneH / 2 - 0.38],
      [-phoneW / 2 + 0.35, phoneH / 2 - 0.66],
      [-phoneW / 2 + 0.61, phoneH / 2 - 0.52],
    ];

    const lensRingGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.05, 24);
    const lensRingMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.95,
      roughness: 0.15,
    });

    const lensGlassGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.055, 24);
    const lensGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.2,
      roughness: 0.05,
      transmission: 0.9,
      ior: 1.6,
      clearcoat: 1.0,
    });

    lensPositions.forEach(([lx, ly]) => {
      const ring = new THREE.Mesh(lensRingGeo, lensRingMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(lx, ly, -phoneD / 2 - 0.085);
      phoneGroup.add(ring);

      const glass = new THREE.Mesh(lensGlassGeo, lensGlassMat);
      glass.rotation.x = Math.PI / 2;
      glass.position.set(lx, ly, -phoneD / 2 - 0.088);
      phoneGroup.add(glass);
    });

    // Dual-tone LED Flash & LiDAR Sensor
    const flashGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.04, 16);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.rotation.x = Math.PI / 2;
    flash.position.set(-phoneW / 2 + 0.61, phoneH / 2 - 0.36, -phoneD / 2 - 0.085);
    phoneGroup.add(flash);

    const lidarGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16);
    const lidarMat = new THREE.MeshBasicMaterial({ color: 0x05070a });
    const lidar = new THREE.Mesh(lidarGeo, lidarMat);
    lidar.rotation.x = Math.PI / 2;
    lidar.position.set(-phoneW / 2 + 0.61, phoneH / 2 - 0.68, -phoneD / 2 - 0.085);
    phoneGroup.add(lidar);

    // D. Front Screen Display Glass
    const frontScreenGeo = new THREE.PlaneGeometry(phoneW - 0.08, phoneH - 0.08);
    const frontScreen = new THREE.Mesh(frontScreenGeo, powered ? screenMat : screenOffMat);
    frontScreen.position.set(0, 0, phoneD / 2 + 0.026);
    phoneGroup.add(frontScreen);

    // Front Dynamic Island Notch
    const islandGeo = new THREE.BoxGeometry(0.48, 0.12, 0.02);
    const islandMesh = new THREE.Mesh(islandGeo, bezelMat);
    islandMesh.position.set(0, phoneH / 2 - 0.14, phoneD / 2 + 0.028);
    phoneGroup.add(islandMesh);

    // Front Selfie Camera Micro-Lens
    const selfieGeo = new THREE.CircleGeometry(0.022, 16);
    const selfieMat = new THREE.MeshBasicMaterial({ color: 0x0369a1 });
    const selfieMesh = new THREE.Mesh(selfieGeo, selfieMat);
    selfieMesh.position.set(0.14, phoneH / 2 - 0.14, phoneD / 2 + 0.039);
    phoneGroup.add(selfieMesh);

    // E. Physical Side Buttons (Volume Rocker, Action, Power)
    const btnMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Left: Action button + Volume buttons
    const actionBtn = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.15, 0.06), btnMat);
    actionBtn.position.set(-phoneW / 2 - 0.035, phoneH / 2 - 0.65, 0);
    phoneGroup.add(actionBtn);

    const volUpBtn = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.06), btnMat);
    volUpBtn.position.set(-phoneW / 2 - 0.035, phoneH / 2 - 0.95, 0);
    phoneGroup.add(volUpBtn);

    const volDownBtn = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.06), btnMat);
    volDownBtn.position.set(-phoneW / 2 - 0.035, phoneH / 2 - 1.25, 0);
    phoneGroup.add(volDownBtn);

    // Right: Power lock button
    const pwrBtn = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.32, 0.06), btnMat);
    pwrBtn.position.set(phoneW / 2 + 0.035, phoneH / 2 - 0.95, 0);
    phoneGroup.add(pwrBtn);

    // Bottom: USB-C connector port & speaker acoustic slots
    const usbcMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.06), bezelMat);
    usbcMesh.position.set(0, -phoneH / 2 - 0.025, 0);
    phoneGroup.add(usbcMesh);

    // 4. Interactive Orbit Controls & Angle Presets
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };

    const setPresetAngle = (ang) => {
      setViewAngle(ang);
      if (ang === 'front') {
        targetRotation.x = 0;
        targetRotation.y = 0;
      } else if (ang === 'back') {
        targetRotation.x = 0;
        targetRotation.y = Math.PI;
      } else if (ang === 'iso') {
        targetRotation.x = 0.25;
        targetRotation.y = 0.65;
      }
    };

    const onPointerDown = (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = (e.clientX - prevMouse.x) * 0.008;
      const dy = (e.clientY - prevMouse.y) * 0.008;
      targetRotation.y += dx;
      targetRotation.x = Math.max(-0.8, Math.min(0.8, targetRotation.x + dy));
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 5. Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth interpolation to target rotation
      phoneGroup.rotation.y += (targetRotation.y - phoneGroup.rotation.y) * 0.1;
      phoneGroup.rotation.x += (targetRotation.x - phoneGroup.rotation.x) * 0.1;

      // Subtle float animation
      const t = Date.now() * 0.0015;
      phoneGroup.position.y = Math.sin(t) * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    container._setPreset = setPresetAngle;

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      resizeObserver.disconnect();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [powered, activePhoto, activeTab]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '580px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '580px' }} />

      {/* Floating 3D Angle Switcher */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(6px)',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', alignSelf: 'center' }}>
          3D HARDWARE:
        </span>
        <button
          onClick={() => containerRef.current?._setPreset?.('front')}
          className={`qml-btn ${viewAngle === 'front' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
          style={{ fontSize: '10px', padding: '3px 8px' }}
        >
          FRONT
        </button>
        <button
          onClick={() => containerRef.current?._setPreset?.('iso')}
          className={`qml-btn ${viewAngle === 'iso' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
          style={{ fontSize: '10px', padding: '3px 8px' }}
        >
          ISOMETRIC
        </button>
        <button
          onClick={() => containerRef.current?._setPreset?.('back')}
          className={`qml-btn ${viewAngle === 'back' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
          style={{ fontSize: '10px', padding: '3px 8px' }}
        >
          TRIPLE CAM
        </button>
      </div>

      {/* 3D Drag Tip */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '4px 12px',
          borderRadius: '14px',
          border: '1px solid var(--border-light)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}
      >
        Drag to inspect 360° titanium chassis, sapphire lenses & OLED glass
      </div>
    </div>
  );
}
