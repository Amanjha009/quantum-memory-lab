import React from 'react';
import { pagesForDisplay, storageStats } from '../core/storage.js';
import './SmartphoneSimulation.css';

const PIPELINE = [
  ['app', 'Smartphone app', 'Photos, Files and Storage issue a real simulated request.'],
  ['fs', 'File system', 'Assigns or removes logical pages and directory entries.'],
  ['ufs', 'UFS controller', 'Translates logical addresses to a free physical NAND page.'],
  ['map', 'NAND mapping', 'Shows the live logical-to-physical page relationship.'],
  ['nand', 'NAND pages & blocks', 'Valid, invalid and free page state is retained between phone actions.'],
  ['cell', 'Memory transistor', 'The selected byte uses the same SLC cell and threshold model as the lab.'],
  ['quantum', 'Quantum tunnelling', 'FN current, charge transfer and threshold verification underpin programming.'],
];

function FileGlyph({ kind = 'file' }) {
  return <span className={`file-glyph ${kind}`} aria-hidden="true">{kind === 'photo' ? '▧' : '≡'}</span>;
}

function PhoneScreen({ powered, tab, setTab, selectedFile, files, onSelect, onOpen, onDownloadPhoto, onCreateDocument, onDelete, onRestore, onPower, onStorage }) {
  const visibleFiles = tab === 'Photos' ? files.filter(file => file.kind === 'photo') : tab === 'Files' ? files : [];
  const selectedDeleted = selectedFile?.status === 'deleted';
  return <section className="panel live-phone-panel">
    <div className="panel-top"><div><div className="eyebrow small">LIVE SMARTPHONE</div><h2>Everyday phone, real storage state</h2></div><span className="device-chip"><i className={powered ? 'green' : 'gray'}/>{powered ? 'ON' : 'OFF'}</span></div>
    <div className={`live-phone-frame ${powered ? '' : 'phone-off'}`}>
      <div className="live-phone-screen">
        <div className="phone-island"/>
        <div className="phone-status"><span>9:41</span><span>●●● ▰</span></div>
        {powered ? <>
          <div className="phone-welcome"><small>LOCAL DEVICE</small><b>Good morning</b><span>Storage actions are connected to the NAND model.</span></div>
          <div className="phone-apps"><button onClick={() => setTab('Photos')} className={tab === 'Photos' ? 'chosen' : ''}><span className="app-icon gallery">▧</span>Photos</button><button onClick={() => setTab('Files')} className={tab === 'Files' ? 'chosen' : ''}><span className="app-icon files">≡</span>Files</button><button onClick={() => { setTab('Storage'); onStorage(); }} className={tab === 'Storage' ? 'chosen' : ''}><span className="app-icon settings">▦</span>Storage</button></div>
          {tab === 'Storage' ? <div className="phone-storage-view"><b>Storage manager</b><span>{files.filter(file => file.status === 'valid').length} live file(s)</span><button onClick={onStorage}>Inspect NAND pages</button></div> : <div className="phone-file-list">
            <div className="phone-content-head"><b>{tab}</b><span>{selectedFile?.name || 'No selected file'}</span></div>
            {visibleFiles.length ? visibleFiles.map(file => <button key={file.id} className={`phone-file-row ${file.id === selectedFile?.id ? 'selected' : ''} ${file.status !== 'valid' ? 'deleted' : ''}`} onClick={() => onSelect(file.id)}><FileGlyph kind={file.kind}/><span><b>{file.name}</b><small>{file.status === 'valid' ? `${file.pageCount} representative page${file.pageCount === 1 ? '' : 's'}` : file.status === 'deleted' ? 'Deleted · recoverable before GC' : 'Physically reclaimed'}</small></span></button>) : <div className="phone-empty">No files yet. Download a photograph or create a document.</div>}
          </div>}
          <div className="phone-file-actions">
            <button onClick={onDownloadPhoto}>Download photo</button>
            <button onClick={onCreateDocument}>Save document</button>
            <button disabled={!selectedFile || selectedFile.status !== 'valid'} onClick={onOpen}>Open file</button>
            <button disabled={!selectedFile || selectedFile.status !== 'valid'} onClick={onDelete}>Delete</button>
            <button disabled={!selectedDeleted} onClick={onRestore}>Restore</button>
          </div>
        </> : <div className="live-phone-off"><span>⏻</span><b>Phone is switched off</b><small>NAND charge and page state remain available without power.</small></div>}
      </div>
    </div>
    <div className="phone-actions"><button className="btn secondary" onClick={onPower}>{powered ? 'SWITCH OFF' : 'RESTART PHONE'}</button><span>{selectedFile?.status === 'deleted' ? 'Logical deletion pending reclamation' : selectedFile ? 'Selected file maps to NAND' : 'No file stored yet'}</span></div>
  </section>;
}

function Pipeline({ operation, model, selectedFile, nandBits, currentDensity, onEnterMemory }) {
  const stats = storageStats(model);
  const activeStep = operation?.type || 'idle';
  return <section className="panel live-storage-panel">
    <div className="panel-top"><div><div className="eyebrow small">LIVE INTERNAL STORAGE SIMULATION</div><h2>What the chip is doing now</h2></div><span className="model-chip">{operation?.title || 'READY'}</span></div>
    <div className="storage-operation" aria-live="polite"><b>{operation?.title || 'Ready for a phone action'}</b><span>{operation?.detail || 'Download a photo or save a document to program representative NAND pages.'}</span></div>
    <ol className="storage-pipeline" aria-label="Storage operation sequence">{PIPELINE.map(([id, label, detail], index) => <li key={id} className={activeStep === 'idle' || operation?.steps?.some(step => step.toLowerCase().includes(label.split(' ')[0].toLowerCase())) || (activeStep === 'program' && index >= 2) || (activeStep === 'garbage-collect' && index >= 2) ? 'active' : ''}><span>{String(index + 1).padStart(2, '0')}</span><div><b>{label}</b><small>{detail}</small></div></li>)}</ol>
    <div className="storage-map-heading"><b>UFS logical mapping</b><span>{selectedFile?.logicalAddress != null ? `L${selectedFile.logicalAddress} → ${selectedFile.physicalPages.map(page => page.address).join(', ')}` : 'No live file mapping'}</span></div>
    <div className="nand-block-map" aria-label="Representative NAND pages and blocks">{pagesForDisplay(model).map(block => <div className="nand-block" key={block.id}><div><b>BLOCK {block.id}</b><span>{block.eraseCount} P/E</span></div><div className="page-row">{block.pages.map(page => <span key={page.address} className={page.state} title={`${page.address}: ${page.state}`}>{page.index}</span>)}</div></div>)}</div>
    <div className="storage-state-grid"><div><span>VALID</span><b>{stats.validPages}</b></div><div><span>INVALID</span><b>{stats.invalidPages}</b></div><div><span>FREE</span><b>{stats.freePages}</b></div><div><span>NAND BYTE</span><b>{nandBits || '────────'}</b></div></div>
    <div className="chip-bridge"><div><span>SELECTED SLC BYTE</span><b>{nandBits || 'Erase / program state pending'}</b><small>FN current: {Number.isFinite(currentDensity) ? currentDensity.toExponential(2) : '0'} A/m²</small></div><button className="btn primary" onClick={onEnterMemory}>ENTER MEMORY CHIP ↗</button></div>
  </section>;
}

export default function SmartphoneSimulation(props) {
  const selectedFile = props.model.files.find(file => file.id === props.selectedFileId) || null;
  return <div className="live-simulation-grid">
    <PhoneScreen powered={props.powered} tab={props.phoneTab} setTab={props.setPhoneTab} selectedFile={selectedFile} files={props.model.files.filter(file => file.status !== 'collected')} onSelect={props.onSelectFile} onOpen={props.onOpen} onDownloadPhoto={props.onDownloadPhoto} onCreateDocument={props.onCreateDocument} onDelete={props.onDelete} onRestore={props.onRestore} onPower={props.onPower} onStorage={props.onStorage}/>
    <Pipeline operation={props.operation} model={props.model} selectedFile={selectedFile} nandBits={props.nandBits} currentDensity={props.currentDensity} onEnterMemory={props.onEnterMemory}/>
    <section className="phone-workbench panel"><div><div className="eyebrow small">FILE WORKBENCH</div><h2>{props.candidateFile ? props.candidateFile.name : 'Choose something to store'}</h2><p>{props.candidateFile ? `${props.candidateFile.size.toLocaleString()} local bytes · ready for file-system allocation and ISPP programming.` : 'Use Download photo for a representative image or Save document to create a local text file.'}</p></div><div className="workbench-actions"><button className="btn secondary" onClick={props.onDownloadPhoto}>DOWNLOAD A PHOTOGRAPH</button><button className="btn secondary" onClick={props.onCreateDocument}>CREATE DOCUMENT</button><button className="btn secondary" onClick={props.onChooseLocal}>CHOOSE LOCAL FILE</button><button className="btn primary" disabled={!props.candidateFile} onClick={props.onSave}>SAVE TO PHONE</button><button className="btn danger" disabled={!storageStats(props.model).invalidPages} onClick={props.onGarbageCollect}>RUN GARBAGE COLLECTION</button></div><small>Delete marks pages invalid first. Garbage collection relocates valid pages, removes invalid pages, then physically erases a NAND block.</small></section>
  </div>;
}
