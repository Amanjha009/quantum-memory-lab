import React, { useState } from 'react';
import './ArchitectureComparison.css';

const ARCHITECTURES = {
  floating: {
    name: 'Floating-gate NAND',
    storage: 'Conductive floating gate',
    path: 'Electrons tunnel through SiO₂ and remain on an isolated conductor.',
    benefit: 'Direct charge storage gives a clear threshold-voltage shift in this lab.',
    limitation: 'The teaching model uses a planar SLC floating-gate cell.',
    layers: ['Control gate', 'Inter-poly dielectric', 'Floating gate', 'Tunnel oxide', 'Silicon channel'],
  },
  trap: {
    name: 'Charge-trap NAND',
    storage: 'Silicon-nitride charge-trap layer',
    path: 'Electrons tunnel into localized traps inside an insulating stack.',
    benefit: 'The vertical stack can be repeated through many 3D NAND layers.',
    limitation: 'This comparison is structural; its trap kinetics are not calibrated in the FN program model.',
    layers: ['Word line', 'Blocking oxide', 'Charge-trap nitride', 'Tunnel oxide', 'Vertical channel'],
  },
};

function CellStack({ architecture, selectedLayer, onSelect }) {
  const item = ARCHITECTURES[architecture];
  return <div className={`architecture-stack ${architecture}`} role="group" aria-label={`${item.name} layer stack`}>{item.layers.map((layer, index) => <button key={layer} className={selectedLayer === layer ? 'selected' : ''} onClick={() => onSelect(layer)} style={{ '--layer': index }}><span>{layer}</span><i/></button>)}</div>;
}

function NandTower({ architecture }) {
  const layers = architecture === 'floating' ? ['CG', 'FG', 'Ox', 'Ch'] : ['WL', 'BO', 'CT', 'TO', 'VC'];
  return <div className="nand-tower" aria-label="Illustrated 3D NAND string"><div className="tower-caption">Representative vertical NAND string</div>{Array.from({ length: 7 }, (_, index) => <div className="tower-layer" key={index}><span>WL {index}</span><div>{layers.map(layer => <i key={layer}>{layer}</i>)}</div></div>)}<b>Vertical channel</b></div>;
}

export default function ArchitectureComparison({ onOpenTunnelLab }) {
  const [architecture, setArchitecture] = useState('floating');
  const [selectedLayer, setSelectedLayer] = useState(ARCHITECTURES.floating.layers[2]);
  const item = ARCHITECTURES[architecture];
  function selectArchitecture(next) {
    setArchitecture(next);
    setSelectedLayer(ARCHITECTURES[next].layers[2]);
  }
  return <div className="architecture-page">
    <div className="architecture-intro"><span>DEVICE ARCHITECTURES</span><h2>Where the charge lives changes the memory stack.</h2><p>Compare the existing floating-gate physics model with a charge-trap architecture used in many vertical NAND devices. The interactive FN lab remains the calibrated teaching model.</p></div>
    <div className="architecture-tabs" role="tablist" aria-label="Memory architecture comparison"><button role="tab" aria-selected={architecture === 'floating'} className={architecture === 'floating' ? 'active' : ''} onClick={() => selectArchitecture('floating')}>Floating gate</button><button role="tab" aria-selected={architecture === 'trap'} className={architecture === 'trap' ? 'active' : ''} onClick={() => selectArchitecture('trap')}>Charge trap</button></div>
    <div className="architecture-grid">
      <section className="panel architecture-card"><div className="flash-panel-heading"><div><span>SELECTED ARCHITECTURE</span><b>{item.name}</b></div></div><CellStack architecture={architecture} selectedLayer={selectedLayer} onSelect={setSelectedLayer}/><div className="layer-explanation"><b>{selectedLayer}</b><span>{selectedLayer === item.storage ? item.path : `${selectedLayer} is one part of the gate stack shown in the architecture comparison.`}</span></div></section>
      <section className="panel architecture-card"><div className="flash-panel-heading"><div><span>3D NAND STRUCTURE</span><b>Stacked memory string</b></div></div><NandTower architecture={architecture}/><div className="architecture-key"><span><i/>Word-line layers</span><span><i/>One vertical channel</span><span><i/>Repeated storage stack</span></div></section>
      <section className="panel architecture-summary"><div><span>STORAGE MEDIUM</span><b>{item.storage}</b></div><div><span>PROGRAM / ERASE</span><b>Field-driven tunnelling</b></div><div><span>WHAT THIS APP CALCULATES</span><b>Floating-gate FN current, charge, Vt and SLC read state</b></div><div><span>COMPARISON NOTE</span><b>{item.limitation}</b></div><button className="btn primary" onClick={onOpenTunnelLab}>OPEN FN TUNNEL LAB ↗</button></section>
    </div>
  </div>;
}
