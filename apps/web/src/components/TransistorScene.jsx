import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const layers = [
  { id: 'control', name: 'Control gate', color: '#8a9daf', size: [3.4, .42, 1.65], y: 1.95, desc: 'Receives the programming pulse and couples an electric field into the gate stack.' },
  { id: 'ipd', name: 'Inter-poly dielectric', color: '#91adbd', size: [2.85, .18, 1.35], y: 1.63, desc: 'Electrically insulates the floating gate from the control gate.' },
  { id: 'floating', name: 'Floating gate', color: '#54d6c7', size: [2.45, .38, 1.15], y: 1.34, desc: 'An isolated conductor whose stored electrons shift the transistor threshold voltage.' },
  { id: 'oxide', name: 'Tunnel oxide (SiO₂)', color: '#55aaff', size: [2.8, .2, 1.38], y: 1.05, desc: 'A thin insulating barrier. Electrons can cross it by quantum tunneling under an applied field.' },
  { id: 'channel', name: 'Semiconductor channel', color: '#d4a970', size: [2.4, .38, 1.12], y: .72, desc: 'The channel conducts between source and drain when the gate bias exceeds threshold.' },
  { id: 'substrate', name: 'Silicon substrate', color: '#647b9d', size: [3.6, .45, 1.8], y: .28, desc: 'The silicon body supporting the transistor channel.' },
];

export default function TransistorScene({ currentDensity = 0, storedChargeFc = 0, onSelect, selected, viewMode = 'assembled', visibleLayers = layers.map(layer => layer.id), resetKey = 0, runState = 'idle', simulationTick = 0 }) {
  const host = useRef(null); const sceneRef = useRef(null); const stateRef = useRef({ currentDensity, storedChargeFc, viewMode, visibleLayers, resetKey, runState, simulationTick });
  const selectRef=useRef(onSelect), selectedRef=useRef(selected);
  stateRef.current = { currentDensity, storedChargeFc, viewMode, visibleLayers, resetKey, runState, simulationTick };
  selectRef.current=onSelect; selectedRef.current=selected;
  useEffect(() => {
    const node = host.current; if (!node) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#111923');
    const camera = new THREE.PerspectiveCamera(38, node.clientWidth / node.clientHeight, .1, 100); camera.position.set(5, 3.6, 7.2); camera.lookAt(0, 1.1, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(node.clientWidth, node.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; node.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xd5eaff, 0x152033, 2));
    const key = new THREE.DirectionalLight(0x8de5ff, 2.5); key.position.set(4, 7, 4); scene.add(key);
    const fill = new THREE.PointLight(0x6655ff, 32, 12); fill.position.set(-3, 2, 3); scene.add(fill);
    const group = new THREE.Group(); scene.add(group); const meshes = new Map();
    for (const layer of layers) {
      const geo = new THREE.BoxGeometry(...layer.size);
      const transparent = layer.id === 'oxide' || layer.id === 'ipd';
      const material = new THREE.MeshPhysicalMaterial({ color: layer.color, metalness: ['control','floating'].includes(layer.id) ? .67 : .16, roughness: .3, transparent, opacity: layer.id === 'oxide' ? .38 : layer.id === 'ipd' ? .26 : 1, clearcoat: .35, emissive: layer.id === 'floating' ? '#0d4948' : '#000000' });
      const mesh = new THREE.Mesh(geo, material); mesh.position.y = layer.y; mesh.userData.layer = layer; mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh); meshes.set(layer.id, mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: layer.id === 'oxide' ? '#73bcff' : '#b4c6d8', transparent: true, opacity: .45 })); edges.position.copy(mesh.position); mesh.userData.edges = edges; group.add(edges);
    }
    // Source and drain contacts.
    for (const x of [-1.34, 1.34]) { const contact = new THREE.Mesh(new THREE.BoxGeometry(.54,.34,.9), new THREE.MeshStandardMaterial({color:'#b9c9d9',metalness:.68,roughness:.28})); contact.position.set(x,.72,0); group.add(contact); }
    const electronMat = new THREE.MeshBasicMaterial({ color: '#a7f8ff' });
    const electrons = Array.from({length: 8}, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.075,14,14), electronMat.clone()); m.userData.phase = i/8; scene.add(m); return m; });
    const floor = new THREE.GridHelper(9, 30, '#325064', '#213344'); floor.position.y = -.02; scene.add(floor);
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const click = e => { const rect = renderer.domElement.getBoundingClientRect(); pointer.set((e.clientX-rect.left)/rect.width*2-1, -((e.clientY-rect.top)/rect.height*2-1)); raycaster.setFromCamera(pointer,camera); const hit=raycaster.intersectObjects([...meshes.values()])[0]; if(hit) selectRef.current?.(hit.object.userData.layer); };
    renderer.domElement.addEventListener('pointerdown', click);
    let drag=null, rotY=.48, rotX=-.12, distance=8.3, panX=0, panY=0;
    const down=e=>{drag=[e.clientX,e.clientY,e.shiftKey?'pan':'orbit'];renderer.domElement.setPointerCapture(e.pointerId);};
    const move=e=>{if(!drag)return;const dx=e.clientX-drag[0],dy=e.clientY-drag[1];if(drag[2]==='pan'){panX-=dx*.012;panY+=dy*.01;}else{rotY+=dx*.008;rotX=Math.max(-.7,Math.min(.7,rotX+dy*.006));}drag=[e.clientX,e.clientY,drag[2]];};
    const up=()=>drag=null, wheel=e=>{distance=Math.max(5,Math.min(13,distance+Math.sign(e.deltaY)*.35));};
    renderer.domElement.addEventListener('pointerdown',down); renderer.domElement.addEventListener('pointermove',move); renderer.domElement.addEventListener('pointerup',up); renderer.domElement.addEventListener('wheel',wheel,{passive:true});
    const resize = new ResizeObserver(()=>{camera.aspect=node.clientWidth/node.clientHeight;camera.updateProjectionMatrix();renderer.setSize(node.clientWidth,node.clientHeight);}); resize.observe(node);
    sceneRef.current={scene,camera,renderer,group,electrons,meshes};
    let frame=0, previousReset=-1; const animate=()=>{frame=requestAnimationFrame(animate); const s=sceneRef.current;if(!s)return;
      if(stateRef.current.resetKey!==previousReset){previousReset=stateRef.current.resetKey;rotY=.48;rotX=-.12;distance=8.3;panX=0;panY=0;}
      group.rotation.set(rotX,rotY,0); camera.position.set(panX+Math.sin(.45)*distance,3.1+panY,Math.cos(.45)*distance);camera.lookAt(panX,1.1+panY,0);
      const storedCount=Math.max(0,Math.min(electrons.length,Math.round(stateRef.current.storedChargeFc/.42*electrons.length)));
      const currentGlow=Math.min(1.8,Math.max(0,Math.log10(1+stateRef.current.currentDensity)/6));
      for(const [id,mesh] of meshes){
        const layer=mesh.userData.layer, layerIndex=layers.findIndex(item=>item.id===id), mode=stateRef.current.viewMode;
        const separation=mode==='exploded'?(layerIndex-2.5)*.34:0;
        mesh.position.y=layer.y+separation;mesh.scale.z=mode==='cross-section'?.52:1;mesh.visible=stateRef.current.visibleLayers.includes(id);
        mesh.userData.edges.position.copy(mesh.position);mesh.userData.edges.scale.copy(mesh.scale);mesh.userData.edges.visible=mesh.visible;
        if(id==='oxide')mesh.material.emissiveIntensity=currentGlow;
        else if(id==='floating')mesh.material.emissiveIntensity=selectedRef.current?.id==='floating'||stateRef.current.runState==='programming'?1.8:.55;
        else mesh.material.emissiveIntensity=.25;
        if(selectedRef.current?.id===id)mesh.material.emissive.set('#1d6c74');
        else mesh.material.emissive.set(id==='floating'?'#0d4948':id==='oxide'?'#102941':'#000000');
      }
      // Particles show representative stored charge. They remain in the floating
      // gate; the calculated FN current is shown in the band diagram and metrics.
      const phase=(stateRef.current.simulationTick%24)/24;
      electrons.forEach((m,i)=>{m.visible=i<Math.max(storedCount,stateRef.current.runState==='programming'?4:0);let y=1.34+(Math.floor(i/4)-.5)*.17;if(stateRef.current.runState==='programming')y=.76+(1.34-.76)*Math.min(1,phase*1.5);if(stateRef.current.runState==='erasing')y=1.34-(1.34-.76)*Math.min(1,phase*1.5);m.position.set(-.9+(i%4)*.6,y,(i%2)*.36-.18);m.scale.setScalar(1);}); renderer.render(scene,camera);}; animate();
    return()=>{cancelAnimationFrame(frame);resize.disconnect();for(const object of scene.children){if(object.geometry)object.geometry.dispose();if(object.material){if(Array.isArray(object.material))object.material.forEach(m=>m.dispose());else object.material.dispose();}}renderer.dispose();node.removeChild(renderer.domElement);sceneRef.current=null;};
  },[]);
  return <div className="scene-wrap" ref={host}><div className="scene-chip">3D TRANSISTOR · drag to orbit · shift + drag to pan · scroll to zoom</div></div>;
}
