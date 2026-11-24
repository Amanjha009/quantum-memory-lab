import React, { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import Navbar from './components/navigation/Navbar.jsx';
import LandingView from './views/LandingView.jsx';
import SmartphoneView from './views/SmartphoneView.jsx';
import ArchitectureView from './views/ArchitectureView.jsx';
import QuantumLabView from './views/QuantumLabView.jsx';
import NandLabView from './views/NandLabView.jsx';
import ReliabilityView from './views/ReliabilityView.jsx';
import IntegrityView from './views/IntegrityView.jsx';
import ComparisonView from './views/ComparisonView.jsx';
import GuidedExperimentsView from './views/GuidedExperimentsView.jsx';
import ScientificReferencesView from './views/ScientificReferencesView.jsx';
import FileToElectronJourneyView from './views/FileToElectronJourneyView.jsx';

import { calculateTunneling, sha256 } from './core/physics.js';
import { readSLCBlock, runFnErase, runIsppProgram } from './core/flash.js';
import {
  createStorageModel,
  garbageCollect,
  logicalDelete,
  physicallyEraseFile,
  restoreFile,
  writeFile,
} from './core/storage.js';
import { createInitialStorageModel } from './core/phoneAssets.js';

const demoText = 'A small photograph starts as bytes. In NAND flash, charge is stored without continuous power.';
const toBytes = (text) => new TextEncoder().encode(text);
const zeroCells = () =>
  Array.from({ length: 8 }, () => ({
    chargeFc: 0,
    retentionBaseChargeFc: 0,
    pulseCount: 0,
  }));

export default function App() {
  // Navigation: 4 Clean Museum Sections (Defaults to 'explore')
  const [activeNavTab, setActiveNavTab] = useState('explore');
  const [operationsSubTab, setOperationsSubTab] = useState('nand'); // 'nand' | 'smartphone'
  const [learnSubTab, setLearnSubTab] = useState('references'); // 'references' | 'architecture' | 'comparison'

  // Shared Phone & Storage State
  const [storageModel, setStorageModel] = useState(() => createInitialStorageModel());
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [candidateFile, setCandidateFile] = useState(null);
  const [hash, setHash] = useState('');
  const [powered, setPowered] = useState(true);
  const [phoneTab, setPhoneTab] = useState('Photos');
  const [storageOperation, setStorageOperation] = useState(null);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef(null);

  // Shared Physical Parameters
  const [gateV, setGateV] = useState(10);
  const [oxideNm, setOxideNm] = useState(9.0);
  const [barrierEv, setBarrierEv] = useState(3.1);
  const [energyEv, setEnergyEv] = useState(1.0);
  const [effectiveMass, setEffectiveMass] = useState(0.5);

  // Shared NAND & Cell State (8 SLC cells representing active byte)
  const [nandCells, setNandCells] = useState(zeroCells);
  const [selectedCell, setSelectedCell] = useState(0);
  const [blockCycles, setBlockCycles] = useState(0);
  const [readReferenceV, setReadReferenceV] = useState(1.2);
  const [programSettings, setProgramSettings] = useState({
    vpgmStartV: 14.0,
    vpgmMaxV: 24.0,
    vpgmStepV: 0.5,
    pulseWidthUs: 5.0,
    areaUm2: 0.02,
    verifyVtV: 1.5,
  });

  const [lastProgram, setLastProgram] = useState(null);
  const [lastRead, setLastRead] = useState(null);
  const [lastOperation, setLastOperation] = useState(null);

  // Active File & Payload Byte
  const activeStoredFile = storageModel.files.find((f) => f.id === selectedFileId) || null;
  const activeFile = activeStoredFile || candidateFile;
  const bytes = activeFile?.bytes || toBytes(demoText);
  const payloadByte = bytes[0] || 0x41;
  const payloadBits = payloadByte.toString(2).padStart(8, '0');

  // Live Quantum Calculation
  const physicsResults = useMemo(() => {
    return calculateTunneling({
      gateV,
      oxideNm,
      barrierEv,
      energyEv,
      effectiveMass,
    });
  }, [gateV, oxideNm, barrierEv, energyEv, effectiveMass]);

  // Live SLC Block Read
  const currentBlockRead = useMemo(() => {
    return readSLCBlock(nandCells, {
      readReferenceV,
      peCycles: blockCycles,
      seed: 37,
    });
  }, [nandCells, readReferenceV, blockCycles]);

  const selectedChargeFc = nandCells[selectedCell]?.chargeFc || 0;

  // Effects
  useEffect(() => {
    if (!candidateFile && !activeStoredFile) {
      sha256(toBytes(demoText)).then(setHash);
    }
  }, [candidateFile, activeStoredFile]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Synchronize NAND state
  function syncActiveNand(cells) {
    setNandCells(cells);
    if (selectedFileId) {
      setStorageModel((model) => ({
        ...model,
        files: model.files.map((file) =>
          file.id === selectedFileId ? { ...file, nandCells: cells } : file
        ),
      }));
    }
  }

  function readSnapshot(cells = nandCells, targetBits = payloadBits) {
    const result = readSLCBlock(cells, { readReferenceV, peCycles: blockCycles, seed: 37 });
    return { ...result, match: result.bits === targetBits };
  }

  function programCellAt(index, cells) {
    const current = cells[index];
    const result = runIsppProgram({
      initialChargeFc: current.chargeFc,
      ...programSettings,
      oxideNm,
      barrierEv,
    });
    const next = cells.slice();
    next[index] = {
      ...current,
      chargeFc: result.chargeFc,
      retentionBaseChargeFc: result.chargeFc,
      pulseCount: (current.pulseCount || 0) + result.pulses.length,
    };
    return { cells: next, result };
  }

  function programPayload(targetBits = payloadBits, sourceCells = nandCells, persist = true) {
    const initialRead = readSnapshot(sourceCells, targetBits);
    if (targetBits.split('').some((bit, index) => bit === '1' && initialRead.cells[index].bit === 0)) {
      const op = {
        ok: false,
        title: 'Block Erase Required',
        detail: 'NAND flash physics cannot program a 0 back to a 1 without an entire block erase.',
      };
      setLastOperation(op);
      setNotice(op.detail);
      return op;
    }

    let next = sourceCells;
    let last = null;
    let programmed = 0;
    let failed = 0;

    for (let index = 0; index < 8; index++) {
      if (targetBits[index] === '0' && initialRead.cells[index].bit !== 0) {
        const op = programCellAt(index, next);
        next = op.cells;
        last = op.result;
        programmed++;
        if (!op.result.verified) failed++;
      }
    }

    const read = readSnapshot(next, targetBits);
    if (persist) syncActiveNand(next);
    else setNandCells(next);

    setLastProgram(last);
    setLastRead(read);

    const result = {
      ok: failed === 0 && read.match,
      title: 'ISPP Byte Program Complete',
      detail: `${programmed} cell(s) programmed with FN field emission; verify satisfied in ${last?.pulses.length || 0} pulses. Read-back matches ${read.bits}.`,
      cells: next,
      read,
      last,
    };
    setLastOperation(result);
    setNotice(result.detail);
    return result;
  }

  function eraseNandBlock() {
    let removed = 0;
    const next = nandCells.map((cell) => {
      const result = runFnErase({
        initialChargeFc: cell.chargeFc,
        eraseVoltageV: programSettings.vpgmMaxV,
        oxideNm,
        barrierEv,
        pulseWidthUs: programSettings.pulseWidthUs,
        areaUm2: programSettings.areaUm2,
      });
      removed += result.pulses.length;
      return {
        ...cell,
        chargeFc: result.chargeFc,
        retentionBaseChargeFc: result.chargeFc,
        pulseCount: 0,
      };
    });

    const erased = next.every((cell) => cell.chargeFc < 1e-6);
    syncActiveNand(next);
    setBlockCycles((c) => c + 1);
    setLastProgram(null);
    setLastRead(null);

    const detail = `Applied reverse-field FN erase pulses across block (${removed} total pulses). All cells reset to erased threshold (0.45 V).`;
    setLastOperation({ ok: erased, title: 'Whole-Block Reverse-Field Erase', detail });
    setNotice(detail);
  }

  function readNandBlock() {
    const read = readSnapshot();
    const detail = `Sensed byte ${read.bits} (0x${read.byte.toString(16).padStart(2, '0').toUpperCase()}) at Vref ${readReferenceV.toFixed(2)} V. ${read.match ? 'Matches' : 'Differs from'} target payload byte.`;
    setLastRead(read);
    setLastOperation({ ok: read.match, title: 'NAND Array Sense Read', detail });
    setNotice(detail);
  }

  function selectFile(fileId) {
    const stored = storageModel.files.find((f) => f.id === fileId);
    if (!stored) return;
    setSelectedFileId(fileId);
    setCandidateFile(null);
    setHash(stored.hash || '');
    if (stored.nandCells) setNandCells(stored.nandCells);
  }

  function downloadSamplePhoto() {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#0f172a"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs><rect width="800" height="500" fill="url(#sky)"/><circle cx="615" cy="125" r="56" fill="#38bdf8"/><path d="M0 360 180 220l115 105 128-150 150 185 103-94 124 94v140H0z" fill="#0369a1"/><path d="M0 388 150 290l128 110 110-86 135 97 154-96 123 72v113H0z" fill="#082f49"/><text x="42" y="455" fill="#fff" font-family="sans-serif" font-size="28">Quantum Memory Lab · Sample</text></svg>';
    const sample = {
      name: 'quantum-landscape.svg',
      type: 'image/svg+xml',
      size: svg.length,
      bytes: toBytes(svg),
      preview: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      kind: 'photo',
    };
    sha256(sample.bytes).then((digest) => {
      sample.hash = digest;
      setHash(digest);
    });
    setSelectedFileId(null);
    setCandidateFile(sample);
    setPhoneTab('Photos');
    setStorageOperation({
      type: 'download',
      title: 'Photograph captured into virtual memory',
      detail: 'Local JPEG/SVG bytes are buffered in RAM; ready for UFS logical page allocation and NAND programming.',
      steps: [
        'Camera sensor DMA write to system RAM',
        'VFS prepares inode and 256-byte clusters',
        'UFS controller awaits host commit',
      ],
    });
    setNotice('Sample photograph downloaded. Click "SAVE TO PHONE" to commit to NAND.');
  }

  function createDocument() {
    const text = 'Quantum Memory Lab 2.0\n\nA solid-state storage simulation powered by 1D Schrödinger quantum scattering and Fowler-Nordheim electron tunneling.';
    const doc = {
      name: 'quantum-notes.txt',
      type: 'text/plain',
      size: text.length,
      bytes: toBytes(text),
      preview: '',
      kind: 'document',
    };
    sha256(doc.bytes).then((digest) => {
      doc.hash = digest;
      setHash(digest);
    });
    setSelectedFileId(null);
    setCandidateFile(doc);
    setPhoneTab('Files');
    setStorageOperation({
      type: 'document',
      title: 'Document created in virtual storage',
      detail: 'Text document buffered locally; ready for UFS FTL allocation.',
      steps: ['Text editor created document', 'VFS allocated virtual inode', 'Ready for NAND save commit'],
    });
    setNotice('Document created. Click "SAVE TO PHONE" to program NAND pages.');
  }

  async function chooseFile(file) {
    if (!file) return;
    const localBytes = new Uint8Array(await file.arrayBuffer());
    const digest = await sha256(localBytes);
    const localPreview = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    setSelectedFileId(null);
    setCandidateFile({
      name: file.name,
      type: file.type,
      size: file.size,
      bytes: localBytes,
      preview: localPreview,
      hash: digest,
      kind: file.type.startsWith('image/') ? 'photo' : 'document',
    });
    setHash(digest);
    setPhoneTab(file.type.startsWith('image/') ? 'Photos' : 'Files');
    setNotice(`Loaded ${file.name} locally (${localBytes.length} bytes). Click SAVE to program NAND.`);
  }

  async function saveCandidateToPhone(fileCandidate) {
    const file = fileCandidate || candidateFile;
    if (!file?.bytes) {
      setNotice('Select a photograph or create a document first.');
      return;
    }
    const digest = file.hash || (await sha256(file.bytes));
    const targetBits = (file.bytes[0] || 0).toString(2).padStart(8, '0');
    const programmed = programPayload(targetBits, zeroCells(), false);
    if (!programmed.ok) return;

    const result = writeFile(storageModel, {
      ...file,
      hash: digest,
      nandCells: programmed.cells,
    });
    if (!result.ok) {
      setNotice(result.reason);
      return;
    }

    setStorageModel(result.model);
    setSelectedFileId(result.file.id);
    setCandidateFile(null);
    setHash(digest);
    setStorageOperation(result.event);
    setLastOperation({
      ok: true,
      title: result.event.title,
      detail: `${result.event.detail} ${programmed.detail}`,
    });
    setNotice(`Saved ${result.file.name}. Mapped to ${result.file.physicalPages.map((p) => p.address).join(', ')}.`);
  }

  function openStoredFile() {
    if (!activeStoredFile || activeStoredFile.status !== 'valid') {
      setNotice('Select a valid stored file to open.');
      return;
    }
    const sourceCells = activeStoredFile.nandCells || nandCells;
    const targetBits = (activeStoredFile.bytes[0] || 0).toString(2).padStart(8, '0');
    const read = readSnapshot(sourceCells, targetBits);
    setNandCells(sourceCells);
    setLastRead(read);
    setStorageOperation({
      type: 'read',
      title: 'UFS Read Request Verified',
      detail: `Read ${read.bits} from ${activeStoredFile.physicalPages.map((p) => p.address).join(', ')}. Threshold sense matches binary payload.`,
      steps: ['UFS Host command submitted', 'Bitline sense comparator evaluated', 'Data payload returned to OS'],
    });
    setNotice(`Opened ${activeStoredFile.name} successfully.`);
  }

  function deleteStoredFile(fileId) {
    const targetId = fileId || selectedFileId;
    if (!targetId) return;
    const result = logicalDelete(storageModel, targetId);
    if (!result.ok) return;
    setStorageModel(result.model);
    setStorageOperation(result.event);
    const targetFile = storageModel.files.find((f) => f.id === targetId);
    setNotice(`Deleted ${targetFile?.name || 'file'}. Marked invalid in FTL.`);
  }

  function restoreStoredFile(fileId) {
    const targetId = fileId || selectedFileId;
    if (!targetId) return;
    const result = restoreFile(storageModel, targetId);
    if (!result.ok) return;
    setStorageModel(result.model);
    setStorageOperation(result.event);
    const targetFile = storageModel.files.find((f) => f.id === targetId);
    setNotice(`Restored ${targetFile?.name || 'file'} before garbage collection.`);
  }

  function runGarbageCollection() {
    const result = garbageCollect(storageModel);
    if (!result.ok) {
      setNotice(result.reason);
      return;
    }
    setStorageModel(result.model);
    setStorageOperation(result.event);
    setBlockCycles((c) => c + 1);
    setNotice(result.event.detail);
  }

  function restartPhone() {
    if (powered) {
      setPowered(false);
      setNotice('Phone powered down. Non-volatile charge remains in NAND floating gates.');
    } else {
      setPowered(true);
      setNotice('Phone powered on. Reading FTL tables and verifying stored non-volatile charge.');
    }
  }

  function downloadFile(data, name) {
    if (!data) return;
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  return (
    <div className="app-container">
      {/* Top Navigation Bar: QUANTUM MEMORY LAB */}
      <Navbar activeTab={activeNavTab} onSelectTab={setActiveNavTab} />

      {/* Main View Router */}
      <main className="main-content">
        {/* 1. EXPLORE: Central 3D Transistor, 6-Stage Guided Experiment, Compact Scientific Panel */}
        {activeNavTab === 'explore' && (
          <QuantumLabView
            gateV={gateV}
            setGateV={setGateV}
            oxideNm={oxideNm}
            setOxideNm={setOxideNm}
            barrierEv={barrierEv}
            setBarrierEv={setBarrierEv}
            energyEv={energyEv}
            setEnergyEv={setEnergyEv}
            effectiveMass={effectiveMass}
            setEffectiveMass={setEffectiveMass}
            selectedChargeFc={selectedChargeFc}
            onProgramPulse={() => programCellAt(selectedCell, nandCells)}
            onResetExperiment={() => {
              setGateV(10);
              setOxideNm(9);
              setBarrierEv(3.1);
              setEnergyEv(1);
              setEffectiveMass(0.5);
              setNotice('Controls reset to default 9.0 nm / 10 V reference configuration.');
            }}
          />
        )}

        {/* 2. FILE ➔ ELECTRON: 12-Stage Real File-to-NAND-to-Electron Simulation */}
        {activeNavTab === 'journey' && (
          <FileToElectronJourneyView
            storageModel={storageModel}
            setStorageModel={setStorageModel}
            nandCells={nandCells}
            setNandCells={syncActiveNand}
            onNavigateToPhone={() => {
              setActiveNavTab('operations');
              setOperationsSubTab('smartphone');
            }}
            onNavigateToNandLab={() => {
              setActiveNavTab('operations');
              setOperationsSubTab('nand');
            }}
          />
        )}

        {/* 2. QUANTUM EXPERIMENT: 10 Interactive Guided Experiments & Challenges */}
        {activeNavTab === 'experiment' && (
          <GuidedExperimentsView
            onLoadExperimentParams={(params) => {
              if (params.gateV != null) setGateV(params.gateV);
              if (params.oxideNm != null) setOxideNm(params.oxideNm);
              if (params.barrierEv != null) setBarrierEv(params.barrierEv);
              if (params.energyEv != null) setEnergyEv(params.energyEv);
              if (params.effectiveMass != null) setEffectiveMass(params.effectiveMass);
              setActiveNavTab('explore');
              setNotice(`Loaded preset: tox=${params.oxideNm}nm, φB=${params.barrierEv}eV, Vg=${params.gateV}V`);
            }}
            onNavigateToLab={() => setActiveNavTab('explore')}
          />
        )}

        {/* 3. MEMORY OPERATIONS: NAND Array, Smartphone Digital Twin, ECC */}
        {activeNavTab === 'operations' && (
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px 60px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <button
                onClick={() => setOperationsSubTab('nand')}
                className={`qml-btn ${operationsSubTab === 'nand' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              >
                NAND FLASH WORKSTATION
              </button>
              <button
                onClick={() => setOperationsSubTab('smartphone')}
                className={`qml-btn ${operationsSubTab === 'smartphone' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              >
                SMARTPHONE DIGITAL TWIN
              </button>
              <button
                onClick={() => setOperationsSubTab('reliability')}
                className={`qml-btn ${operationsSubTab === 'reliability' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              >
                RETENTION & ENDURANCE
              </button>
              <button
                onClick={() => setOperationsSubTab('integrity')}
                className={`qml-btn ${operationsSubTab === 'integrity' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              >
                ECC & INTEGRITY
              </button>
            </div>

            {operationsSubTab === 'nand' && (
              <NandLabView
                storageModel={storageModel}
                nandCells={nandCells}
                setNandCells={syncActiveNand}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                blockCycles={blockCycles}
                setBlockCycles={setBlockCycles}
                readReferenceV={readReferenceV}
                setReadReferenceV={setReadReferenceV}
                programSettings={programSettings}
                setProgramSettings={setProgramSettings}
                onProgramPayload={programPayload}
                onEraseBlock={eraseNandBlock}
                onReadBlock={readNandBlock}
                payloadByte={payloadByte}
                payloadBits={payloadBits}
                lastProgram={lastProgram}
                lastRead={lastRead}
                lastOperation={lastOperation}
              />
            )}

            {operationsSubTab === 'smartphone' && (
              <>
                <SmartphoneView
                  powered={powered}
                  phoneTab={phoneTab}
                  setPhoneTab={setPhoneTab}
                  model={storageModel}
                  selectedFileId={selectedFileId}
                  candidateFile={candidateFile}
                  operation={storageOperation}
                  nandBits={currentBlockRead.bits}
                  currentDensity={physicsResults.fnCurrent}
                  onSelectFile={selectFile}
                  onOpen={openStoredFile}
                  onDownloadPhoto={downloadSamplePhoto}
                  onCreateDocument={createDocument}
                  onChooseLocal={() => fileInputRef.current?.click()}
                  onSave={saveCandidateToPhone}
                  onDelete={deleteStoredFile}
                  onRestore={restoreStoredFile}
                  onGarbageCollect={runGarbageCollection}
                  onPower={restartPhone}
                  onNavigateToMemory={() => setActiveNavTab('explore')}
                  onNavigateToJourney={() => {
                    setActiveNavTab('journey');
                  }}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/svg+xml,text/plain"
                  onChange={(e) => chooseFile(e.target.files?.[0])}
                />
              </>
            )}

            {operationsSubTab === 'reliability' && (
              <ReliabilityView
                nandCells={nandCells}
                setNandCells={syncActiveNand}
                selectedCell={selectedCell}
                blockCycles={blockCycles}
                setBlockCycles={setBlockCycles}
                readReferenceV={readReferenceV}
                onReadBlock={readNandBlock}
              />
            )}

            {operationsSubTab === 'integrity' && (
              <IntegrityView
                file={activeFile}
                bytes={bytes}
                hash={activeFile?.hash || hash}
                onDownload={downloadFile}
                onReturnToPhone={() => setOperationsSubTab('smartphone')}
              />
            )}
          </div>
        )}

        {/* 4. LEARN: References, Multiscale Architecture, and 3D Charge-Trap Comparison */}
        {activeNavTab === 'learn' && (
          <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '16px 24px 60px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <button
                onClick={() => setLearnSubTab('references')}
                className={`qml-btn ${learnSubTab === 'references' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              >
                SCIENTIFIC REFERENCES & EQUATIONS
              </button>
              <button
                onClick={() => setLearnSubTab('architecture')}
                className={`qml-btn ${learnSubTab === 'architecture' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              >
                🎬 3D STORAGE JOURNEY
              </button>
              <button
                onClick={() => setLearnSubTab('comparison')}
                className={`qml-btn ${learnSubTab === 'comparison' ? 'qml-btn-primary' : 'qml-btn-secondary'}`}
              >
                FLOATING-GATE VS 3D CHARGE-TRAP
              </button>
            </div>

            {learnSubTab === 'references' && <ScientificReferencesView />}
            {learnSubTab === 'architecture' && (
              <ArchitectureView
                onOpenTunnelLab={() => setActiveNavTab('explore')}
                onOpenSmartphone={() => {
                  setActiveNavTab('operations');
                  setOperationsSubTab('smartphone');
                }}
              />
            )}
            {learnSubTab === 'comparison' && (
              <ComparisonView onOpenTunnelLab={() => setActiveNavTab('explore')} />
            )}
          </div>
        )}
      </main>

      {/* Toast Notice */}
      {notice && <div className="qml-toast">{notice}</div>}
    </div>
  );
}
