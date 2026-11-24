import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function LandingScene({ onInspectPart }) {
  const containerRef = useRef(null);
  const [activeHotspot, setActiveHotspot] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambient = new THREE.AmbientLight(0x0e1b2e, 1.8);
    scene.add(ambient);

    const cyanKey = new THREE.DirectionalLight(0x00f0ff, 3.5);
    cyanKey.position.set(5, 7, 4);
    scene.add(cyanKey);

    const violetRim = new THREE.DirectionalLight(0x8b5cf6, 3.0);
    violetRim.position.set(-6, -3, -4);
    scene.add(violetRim);

    const goldAccent = new THREE.PointLight(0xffd700, 15, 8);
    goldAccent.position.set(0, 1.8, 0);
    scene.add(goldAccent);

    // 4. Chip Group
    const chipGroup = new THREE.Group();
    scene.add(chipGroup);

    // Materials
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x0c2522, // Deep matte emerald/cyan solder mask
      roughness: 0.35,
      metalness: 0.2,
    });

    const dieMat = new THREE.MeshPhysicalMaterial({
      color: 0x111c2a,
      metalness: 0.85,
      roughness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      reflectivity: 0.95,
      emissive: 0x071524,
      emissiveIntensity: 0.4,
    });

    const goldWireMat = new THREE.MeshStandardMaterial({
      color: 0xffd043,
      metalness: 0.95,
      roughness: 0.25,
      emissive: 0x553d00,
      emissiveIntensity: 0.2,
    });

    const solderBallMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.2,
    });

    const labelMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });

    // Substrate PCB (Package Board)
    const subGeo = new THREE.BoxGeometry(4.2, 0.25, 4.2);
    const substrateMesh = new THREE.Mesh(subGeo, substrateMat);
    substrateMesh.position.y = -0.125;
    substrateMesh.userData = { id: 'substrate', name: 'BGA Package Substrate', desc: 'Multi-layer organic laminate routing high-density UFS signals and power distribution networks.' };
    chipGroup.add(substrateMesh);

    // Substrate Gold Trace Ring
    const ringGeo = new THREE.RingGeometry(1.6, 1.9, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xecb43c, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide });
    const traceRing = new THREE.Mesh(ringGeo, ringMat);
    traceRing.rotation.x = -Math.PI / 2;
    traceRing.position.y = 0.002;
    chipGroup.add(traceRing);

    // Silicon Die (The NAND flash memory stack)
    const dieGeo = new THREE.BoxGeometry(2.4, 0.18, 2.4);
    const dieMesh = new THREE.Mesh(dieGeo, dieMat);
    dieMesh.position.y = 0.09;
    dieMesh.userData = { id: 'die', name: '3D NAND Silicon Die', desc: 'High-density monolithic silicon die housing billions of vertical floating-gate / charge-trap memory cells.' };
    chipGroup.add(dieMesh);

    // Laser Engraving Canvas Texture on Silicon Die
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111c2a';
    ctx.fillRect(0, 0, 512, 512);

    // Grid lines for memory bank representation
    ctx.strokeStyle = '#1d354d';
    ctx.lineWidth = 2;
    for (let i = 40; i < 512; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 40);
      ctx.lineTo(i, 472);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, i);
      ctx.lineTo(472, i);
      ctx.stroke();
    }

    // Laser Text
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM MEMORY', 256, 210);
    ctx.font = '500 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('QML-2026-NAND 128L', 256, 245);
    ctx.fillText('TUNNEL OXIDE: 9.0 nm', 256, 275);
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('● 10¹⁴ ELECTRONS / WR', 256, 310);

    const dieTexture = new THREE.CanvasTexture(canvas);
    dieMat.map = dieTexture;
    dieMat.needsUpdate = true;

    // Gold Bond Wires (Quadratic Beziers)
    const bondWires = [];
    const wireSegments = 24;
    const perimeterCount = 10;
    
    // Create wires around the four perimeter edges
    for (let side = 0; side < 4; side++) {
      const angle = (side * Math.PI) / 2;
      for (let i = 0; i < perimeterCount; i++) {
        const t = (i / (perimeterCount - 1) - 0.5) * 1.8;
        let pStart = new THREE.Vector3(t, 0.18, 1.15); // On die pad
        let pEnd = new THREE.Vector3(t * 1.6, 0.01, 1.85); // On substrate ring
        
        // Rotate around Y for the 4 sides
        pStart.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        pEnd.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        
        const pMid = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
        pMid.y += 0.35; // Wire loop height

        const curve = new THREE.QuadraticBezierCurve3(pStart, pMid, pEnd);
        const tubeGeo = new THREE.TubeGeometry(curve, wireSegments, 0.014, 6, false);
        const wireMesh = new THREE.Mesh(tubeGeo, goldWireMat);
        wireMesh.userData = { id: 'wires', name: 'Gold Wire Bonds (25 µm)', desc: 'Carries high-voltage ISPP programming pulses (up to 24V) from the controller to the memory array word lines.' };
        chipGroup.add(wireMesh);
        bondWires.push(wireMesh);
      }
    }

    // BGA Solder Balls underneath
    const ballGeo = new THREE.SphereGeometry(0.08, 10, 10);
    for (let x = -1.8; x <= 1.8; x += 0.45) {
      for (let z = -1.8; z <= 1.8; z += 0.45) {
        if (Math.abs(x) < 0.6 && Math.abs(z) < 0.6) continue; // Thermal relief center
        const ball = new THREE.Mesh(ballGeo, solderBallMat);
        ball.position.set(x, -0.29, z);
        chipGroup.add(ball);
      }
    }

    // Coordinate Grid Floor
    const gridHelper = new THREE.GridHelper(14, 28, 0x00f0ff, 0x142033);
    gridHelper.position.y = -1.2;
    scene.add(gridHelper);

    // Subtle Particle Dust (Quantum Fluctuations)
    const particleCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 12;
      pPos[i + 1] = Math.random() * 5 - 1;
      pPos[i + 2] = (Math.random() - 0.5) * 12;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // 5. Interaction (Pointer & Raycaster)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.35;
    let rotY = 0.6;
    let targetRotX = 0.35;
    let targetRotY = 0.6;

    const handlePointerDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const inspectableObjects = [dieMesh, substrateMesh, ...bondWires];
      const hits = raycaster.intersectObjects(inspectableObjects);
      if (hits.length > 0) {
        const hitData = hits[0].object.userData;
        setActiveHotspot(hitData);
        onInspectPart?.(hitData);
      }
    };

    const handlePointerMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.007;
        targetRotX = Math.max(-0.2, Math.min(1.1, targetRotX + deltaY * 0.007));
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // 6. Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Idle auto-rotation when not dragging
      if (!isDragging) {
        targetRotY += delta * 0.25;
      }

      // Smooth interpolation (damping)
      rotX += (targetRotX - rotX) * 0.08;
      rotY += (targetRotY - rotY) * 0.08;

      chipGroup.rotation.x = rotX;
      chipGroup.rotation.y = rotY;

      // Gentle floating levitation
      chipGroup.position.y = Math.sin(time * 1.5) * 0.08;

      // Pulse gold light
      goldAccent.intensity = 12 + Math.sin(time * 3) * 4;

      // Slowly rotate background particles
      particles.rotation.y = time * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const ro = new ResizeObserver(() => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    ro.observe(container);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      // Recursive disposal
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    };
  }, [onInspectPart]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '20px',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(5, 8, 15, 0.75)',
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: 'var(--cyan-300)'
      }}>
        <span className="status-dot cyan pulse" />
        <span>3D PACKAGE MODEL · DRAG TO ROTATE · CLICK DIE OR WIRES TO INSPECT</span>
      </div>
      {activeHotspot && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          maxWidth: '320px',
          background: 'rgba(14, 22, 39, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-bright)',
          borderRadius: '10px',
          padding: '14px 18px',
          boxShadow: 'var(--shadow-cyan)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)', textTransform: 'uppercase' }}>COMPONENT INSPECTION</span>
            <button
              onClick={() => setActiveHotspot(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
            >
              ✕
            </button>
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#fff' }}>{activeHotspot.name}</h4>
          <p style={{ margin: '0', fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5' }}>{activeHotspot.desc}</p>
        </div>
      )}
    </div>
  );
}
