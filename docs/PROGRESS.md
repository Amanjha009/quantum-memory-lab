# QUANTUM MEMORY LAB 2.0 — PROGRESS LOG

## Milestone 0: Audit and Baseline Repair
- **Date**: 2026-11-23
- **Completed Actions**:
  1. Complete workspace audit across `apps/web`, `physics-engine/`, `tests/`, and documentation.
  2. Fixed npm dependency installation (`npm install` completed with zero vulnerabilities).
  3. Verified Vite production build (`npm run build` succeeds in ~417ms).
  4. Verified Node.js compatibility (Node v24.16.0).
  5. Implemented cross-platform test runner `tests/run-tests.js` to ensure tests execute cleanly on Windows and Unix alike without shell syntax issues.
  6. Verified automated tests: 16 test suites passing in `tests/*.test.js`.
  7. Audited the local Python service and verified that the browser-side JavaScript solver is completely mathematically self-sufficient.
  8. Created `docs/DEVELOPMENT_ROADMAP.md` detailing findings and implementation milestones.

## Milestone 1: Visual System & Landing Experience
- **Date**: 2026-11-23
- **Completed Actions**:
  1. Created `apps/web/src/styles/theme.css` establishing the visual identity: deep midnight `#05080f`, electric cyan `#00f0ff`, violet `#8b5cf6`, glassmorphism panels, scientific crosshair accents, and monospace JetBrains typography.
  2. Created `apps/web/src/styles/layouts.css` implementing responsive scientific grid systems and workstation layouts.
  3. Created `apps/web/src/scenes/LandingScene.jsx` implementing an interactive 3D BGA semiconductor memory package with silicon die, gold bond wires, laser markings, atmospheric lighting, and click-to-inspect component raycasting.
  4. Created `apps/web/src/components/navigation/Navbar.jsx` with persistent navigation across all 10 modules and live telemetry HUD ($E_{ox}$, $J_{FN}$, active byte, active solver).
  5. Created `apps/web/src/views/LandingView.jsx` presenting the 9-stage continuum from smartphone photo to electron tunneling, plus 8 interactive workstation preview cards.
  6. Updated `apps/web/src/main.jsx` and `index.html` to integrate Google Fonts (JetBrains Mono & Inter) and global styles.

## Milestone 2: Advanced 3D Semiconductor Environment
- **Date**: 2026-11-23
- **Completed Actions**:
  1. Completely re-engineered `apps/web/src/components/TransistorScene.jsx` into a high-fidelity 3D floating-gate memory transistor.
  2. Structured 8 physically distinct layers: Silicon substrate, Source/Drain diffusions, metal contacts, Inversion Channel, Tunnel Oxide, Floating Gate, ONO IPD, and Control Gate.
  3. Implemented 4 view modes: Assembled, Exploded view (vertical separation), Cross-Section view (Z-cutaway), and Caliper Measurement mode ($t_{ox}=9.0\text{ nm}$, FG$=40\text{ nm}$, IPD$=15\text{ nm}$, CG$=70\text{ nm}$).
  4. Implemented interactive component selection with physical dimension and material telemetry readouts.
  5. Added dynamic electron wave ribbons and tunneling particle animations that reflect the real-time calculated Fowler–Nordheim current and stored charge.

## Milestone 3: Step-by-Step Quantum Simulator
- **Date**: 2026-11-23
- **Completed Actions**:
  1. Created `apps/web/src/components/simulation/SimulationController.jsx` implementing RUN, PAUSE, RESUME, STEP, RESET, REPLAY, playback speed control (0.5x–5x), timeline scrubbing, and stage explanation panels.
  2. Built `apps/web/src/views/QuantumLabView.jsx` with an 8-stage quantum tunneling sequence:
     - Stage 1: Initial conditions ($t_{ox}$, $\phi_B$, $E$, $m^*$, $V_g$).
     - Stage 2: Electric field formation ($V_{ox} = 0.72(V_g - 1.2)$, $F = V_{ox}/t_{ox}$).
     - Stage 3: Electron approaches barrier & classical turning point.
     - Stage 4: Barrier wave interaction & evanescent wave attenuation ($\kappa = \sqrt{2m^*(V-E)}/\hbar$).
     - Stage 5: Tunnelling transmission comparison (Numerical scattering vs WKB).
     - Stage 6: Fowler–Nordheim current density ($J_{FN}$).
     - Stage 7: Charge accumulation ($\Delta Q = J_{FN} A_{eff} t_{pulse}$, $\Delta V_t = \Delta Q / C_{cg}$).
     - Stage 8: Experiment conclusion and SLC threshold state.
  3. Integrated dual viewports (3D Transistor scene and synchronized Conduction Band & Wavefunction plot).
  4. Placed Fowler–Nordheim characteristic curve plot with live operating point tracker.

## Milestone 4: NAND Flash Engineering Workstation
- **Date**: 2026-11-23
- **Completed Actions**:
  1. Built `apps/web/src/views/NandLabView.jsx` providing a full NAND engineering workstation.
  2. Created block and page hierarchy navigator (4 blocks $\times$ 8 pages).
  3. Visualized an 8-cell SLC transistor array representing the active target byte (`0x41` / `01000001`).
  4. Implemented pulse-by-pulse manual ISPP stepping and automated pulse sequencing.
  5. Placed a real-time Pulse & Verify graph tracking staircase programming pulses and $V_t$ shifts.
  6. Implemented sense read comparator with adjustable $V_{ref}$ and whole-block reverse-field erase.

## Milestone 5: Reliability, ECC & Guided Experiments
- **Date**: 2026-11-23
- **Completed Actions**:
  1. Created `apps/web/src/views/ReliabilityView.jsx` containing Endurance P/E cycling up to 10k cycles, Gaussian $V_t$ distribution widening plot, and Arrhenius defect-accelerated retention decay curves ($Q(t) = Q_0 e^{-\Gamma t}$).
  2. Created `apps/web/src/views/IntegrityView.jsx` featuring file buffer byte inspection, stochastic bit error injection, SECDED extended Hamming (8,4) syndrome decoding, interactive 8-bit codeword matrix, and SHA-256 cryptographic verification.
  3. Created `apps/web/src/views/ComparisonView.jsx` comparing Planar Floating-Gate vs 3D Charge-Trap Nitride vertical strings with layer breakdown and engineering trade-off matrix.
  4. Created `apps/web/src/core/guidedData.js` and `apps/web/src/views/GuidedExperimentsView.jsx` providing 10 structured guided experiments with step-by-step instructions, observations, conclusions, multiple-choice quizzes, and engineering challenges.
  5. Created `apps/web/src/views/ScientificReferencesView.jsx` presenting formal equations, 1D Schrödinger boundary conditions, Fowler–Nordheim constants $A_{FN}, B_{FN}$ (RSC citations), ISPP equations (MDPI citations), and explicit physical model limitations.
  6. Created `apps/web/src/views/SmartphoneView.jsx` featuring a smartphone digital twin with Photos, Files, and Storage apps, timestamped controller execution timeline, and FTL mapping table.
  7. Re-architected `apps/web/src/App.jsx` to synchronize all 10 modules through a single unified state model.

## Milestone 6: Automated Test Expansion, Production Verification & Build Finalization
- **Date**: 2026-11-23
- **Completed Actions**:
  1. Created `tests/guided-and-integration.test.js` covering curriculum completeness, assessment structure, challenge definitions, and physics parameter validity.
  2. Ran automated test suite: 19 of 19 tests passing (100% pass rate).
  3. Executed Vite production build (`npm run build`): compiled in ~409ms with zero warnings or errors.
  4. Verified local development server running on port 5173.
  5. Completed final documentation updates in `docs/DEVELOPMENT_ROADMAP.md` and `docs/PROGRESS.md`.

## Complete Simulation Experience Redesign: Scientific Visualizer & Guided Lab
- **Date**: 2026-11-24
- **Completed Actions**:
  1. **Redesigned 3D Floating-Gate Transistor (`TransistorScene.jsx`)**:
     - Built a recognizable semiconductor device geometry featuring a distinct p-type Silicon substrate bulk, embedded n+ Source and Drain diffusion wells, surface inversion channel, ultra-thin transparent Tunnel Oxide (SiO₂), conductive Floating Gate polysilicon block, ONO composite IPD cap, Control Gate / Word Line, and vertical metallic Tungsten contacts.
     - Added view modes: Assembled, Exploded view (vertical separation), and Cross-Section cutaway.
     - Interactive raycasting allowing users to click on any transistor component to display plain-English or advanced physical descriptions.
  2. **Created Dedicated Quantum Wavefunction & Barrier Visualizer (`QuantumWaveVisualizer.jsx`)**:
     - Explicit 3-region demarcation: Silicon Substrate (Left) | Tunnel Oxide Barrier (Center) | Floating Gate (Right).
     - Accurate potential energy diagram V(x) in eV vs nm that dynamically tilts under applied gate voltage into a triangular Fowler–Nordheim barrier.
     - Animated quantum wave propagation displaying incident wave, reflected wave interference in silicon, exponential evanescent decay in the oxide barrier, and transmitted wave entering the floating gate.
     - Graph mode selector: Wavefunction Re(ψ), Probability Density |ψ|², and Overlay.
     - Live telemetry readout displaying numerical scattering transmission, reflection, and electric field.
  3. **Implemented Learning Mode vs Advanced Mode (`QuantumLabView.jsx`)**:
     - **Learning Mode (Default)**: Visualizer occupies 65% of screen width; controls simplified to 3 intuitive sliders: (1) Oxide thickness (nm), (2) Gate voltage (V), and (3) Electron kinetic energy (eV), each accompanied by clear plain-English explanations.
     - **Advanced Mode**: Exposes barrier height (φB), effective electron mass (m*), ISPP pulse duration (tpulse), tunneling area (Aeff), and governing equations.
  4. **Engineered Guided Experiment ("Can an Electron Cross an Insulating Barrier?")**:
     - 8 step-by-step stages taking students through: (1) Understand the transistor, (2) Set gate voltage, (3) Release electron wave, (4) Observe quantum tunnelling, (5) Calculate probability, (6) Store electrical charge, (7) Understand memory operation, and (8) Experiment conclusion.
     - Controls: RUN, PAUSE, NEXT STEP, PREV STEP, RESET, and REPLAY.
  5. **Redesigned Smartphone-to-NAND Educational Journey (`SmartphoneView.jsx`)**:
     - Realistic smartphone chassis on the left with camera snap action.
     - 6-stage visual pipeline on the right showing: App ➔ VFS File System ➔ UFS FTL Controller ➔ NAND Die ➔ Memory Cell ➔ Quantum Tunnelling.
     - Human-readable narrative execution timeline with collapsible technical details.
  6. **Added Synchronized Multiscale Camera Journey (`ArchitectureView.jsx`)**:
     - Interactive 8-scale zoom journey from 10⁻¹ m (Smartphone) down to 10⁻¹⁰ m (Quantum Wavefunction).
     - Dedicated ZOOM IN and ZOOM OUT buttons with educational narrative captions at each scale.
  7. **Build and Test Verification**:
     - Production build compiled cleanly in 379ms.
     - 19 of 19 automated tests passing (100% pass rate).

## Rebuild: Interactive Scientific Laboratory & Quantum Observatory
- **Date**: 2026-11-24
- **Completed Actions**:
  1. **Visual Style Overhaul**:
     - Converted aesthetic to warm off-white (`#F5F6F4`) museum laboratory.
     - Charcoal primary typography (`#20262D`) and muted grey secondary typography (`#68727C`).
     - Removed garish glowing neon borders, excessive gradients, and dense dashboard clutter.
  2. **Top Navigation & Branding**:
     - Project: QUANTUM MEMORY LAB
     - Subtitle: *Explore the Physics Inside Flash Memory.*
     - 4 clean top sections: **Explore**, **Quantum Experiment**, **Memory Operations**, and **Learn**.
  3. **Centered 3D Floating-Gate Transistor**:
     - Occupies ~65% of the central viewport width.
     - Physically connected semiconductor layers:
       - Top: Control Gate (brushed silver).
       - Below: Inter-poly dielectric (IPD).
       - Below: Floating Gate (muted metallic gold).
       - Below: Tunnel Oxide (translucent pale cyan, noticeably thin).
       - Bottom: Silicon substrate (blue-grey) with embedded Source, Drain, and surface Inversion Channel.
     - Full interactive controls: drag to rotate, scroll to zoom, right-drag to pan, click-to-inspect with highlight, reset camera, exploded view, and cross-section cutaway.
  4. **Interactive 6-Stage Quantum Experiment ("Can an Electron Cross an Insulating Barrier?")**:
     - Stage 1: Explore the Transistor (highlights 9 nm oxide).
     - Stage 2: Apply Electrical Voltage (large voltage slider, blue electric field vectors).
     - Stage 3: Release the Electron Wave (soft violet wavepacket in channel).
     - Stage 4: Quantum Tunnelling (wavefunction evanescent decay and transmission).
     - Stage 5: Charge Storage (warm amber charge accumulation in floating gate, Vt shift).
     - Stage 6: Read Memory State (programmed vs erased sensing threshold at Vref = 1.2V).
     - Full experiment controls: RUN, PAUSE, STEP, RESET, and REPLAY.
  5. **Bottom Compact Scientific Panel**:
     - Switchable views: (1) Energy Barrier V(x), (2) Electron Wavefunction ψ(x), (3) Probability Density |ψ|², and (4) Numerical Results.
  6. **Build & Test Verification**:
     - Built cleanly via Vite in 384ms.
     - 19 of 19 automated tests passing (100%).

## Milestone: Real File-to-NAND-to-Electron Simulation
- **Date**: 2026-11-24
- **Objective**: Complete end-to-end 12-stage physical and computational continuum when a user saves a photograph:
  `PHOTOGRAPH → PIXEL DATA → ENCODED FILE → BINARY BYTES → FILE SYSTEM → UFS CONTROLLER → NAND BLOCK → NAND PAGE → MEMORY CELLS → QUANTUM TUNNELLING → STORED ELECTRICAL CHARGE → READ VERIFICATION → FILE SAVED`.
- **Completed Actions**:
  1. **12-Stage Deterministic Journey Engine (`apps/web/src/core/journeyStages.js`)**:
     - Modeled each stage with distinct user questions: "WHAT IS HAPPENING?", "WHY IS IT HAPPENING?", "WHAT SHOULD I OBSERVE?", and expandable technical parameters.
     - Extracted pure logic so stages can be shared across React viewports and headless automated unit tests.
  2. **Multiscale 3D Three.js Journey Scene (`apps/web/src/scenes/FileJourney3DScene.jsx`)**:
     - Dynamic camera transitions smoothly between 4 distinct physical zoom realms:
       - **Package Level**: Dual-die BGA NAND package with gold bond wires and laser etching.
       - **Block & Page Level**: Silicon planar block with highlighted Word Line WL0 (Page P00).
       - **Transistor Level**: Full floating-gate MOSFET cross-section with cutaway clipping plane.
       - **Quantum Level**: Dynamic Fowler–Nordheim electric field lines, soft violet incident/evanescent wavepackets, and warm amber stored electron charges.
  3. **Master Interactive Journey View (`apps/web/src/views/FileToElectronJourneyView.jsx`)**:
     - **Photo to Binary Inspection**: Photo picker (Sunset, Circuit, Nebula), dimension/file size telemetry, deterministic payload generation, hex viewer, and 8-bit breakdown of representative byte (`0x41` = `01000001`), with explicit educational clarification that 8 physical cells model this representative byte.
     - **VFS File System & UFS Controller**: Inode allocation (`#4096`), LBA assignment (`LBA 0–1`), write request, FTL L2P translation (`LBA 0 ➔ Block 0, Page 0`), and Extended Hamming SECDED (8,4) parity bit generation.
     - **ISPP Pulse & Threshold Verification**: Real-time ISPP staircase diagram displaying voltage step pulses ($14.0\text{ V} \rightarrow 15.0\text{ V}$), Fowler–Nordheim tunneling current, charge accumulation ($\Delta Q \approx 0.024\text{ fC}$, ~150 electrons), and $V_t$ threshold shift ($0.45\text{ V} \rightarrow 1.68\text{ V}$).
     - **Sense Read & Cryptographic Integrity**: SLC sense comparator ($V_{ref} = 1.20\text{ V}$) reading back `01000001` (`0x41`), followed by SHA-256 cryptographic digest match.
     - **Playback Controls**: PLAY, PAUSE, NEXT, PREV, RESTART, SKIP TO RESULT, playback speed selector (0.5x, 1x, 2x), and interactive 12-node scrubber timeline.
  4. **Seamless Navigation & Integration**:
     - Added direct launcher button on the virtual smartphone: `🚀 SIMULATE FILE ➔ ELECTRON JOURNEY`.
     - Integrated `File ➔ Electron` tab into the primary navigation bar.
     - Synchronized storage and NAND states across all lab views in `App.jsx`.
  5. **Regression Guard & Test Suite Expansion (`tests/real-journey.test.js`)**:
     - Added comprehensive tests for all 12 stages, byte reconstruction, ISPP convergence, SECDED integrity, and filesystem lifecycle (creation, logical deletion, restoration, and garbage collection).
     - Full test suite now passes with 25 of 25 tests passing (100% pass rate).
     - Production build verified via Vite (`npm run build` succeeds in ~407ms with zero errors).

## Milestone: Visual Quality Upgrade — Realistic 3D Semiconductor Transistor, Leader Lines & Smartphone Polish
- **Date**: 2026-11-24
- **Objective**: Elevate the visual quality of the 3D floating-gate transistor model, implement dynamic 3D leader-line component labeling, provide rich component inspection, ensure strict scientific color coding, and polish the physical smartphone presentation.
- **Completed Actions**:
  1. **Standardized Scientific Color Identity**:
     - Silicon substrate: blue-grey (`#475569`).
     - Source & Drain: deep blue (`#1e3a8a`).
     - Channel: teal (`#0d9488`).
     - Tunnel oxide: transparent pale cyan (`#a5f3fc` / `#38bdf8`, physical SiO₂ refractive index $n = 1.46$).
     - Floating gate: metallic gold polysilicon (`#d97706`).
     - Inter-poly dielectric (IPD): pale lavender ONO sandwich (`#c4b5fd`).
     - Control gate: brushed silver Word Line (`#cbd5e1`).
     - Electrons: warm amber particles (`#f59e0b`).
     - Quantum wavefunction: soft violet (`#8b5cf6`).
  2. **Realistic 3D Semiconductor Device Geometry (`TransistorScene.jsx`)**:
     - Added Shallow Trench Isolation (STI) SiO₂ blocks on outer silicon wafer flanks.
     - Modeled n+ Source and Drain diffusions embedded into the wafer bulk with vertical Tungsten contact vias and metal landing pads (SL and BL).
     - Engineered physical clearcoat and transmission materials on the 9.0 nm tunnel oxide and ONO IPD.
     - Added subtle pedestal grid, soft ground contact shadow plane, and multi-light studio illumination (key, fill, rim).
  3. **3D Component Labels with Real-Time Leader Lines**:
     - Implemented dynamic 3D-to-2D screen projection in the WebGL animation loop for all 8 components:
       1. Control Gate
       2. Inter-Poly Dielectric (IPD)
       3. Floating Gate
       4. Tunnel Oxide
       5. Channel
       6. Source
       7. Drain
       8. Silicon Substrate
     - Crisp SVG overlay renders thin leader lines from the 3D surface anchor to side label badges.
     - Staggered left/right distribution prevents label overlapping during camera rotation and zoom.
     - Labels track smooth vertical layer animation in exploded view.
     - Added a permanent bottom color-coded layer legend bar (`LAYERS:`).
  4. **Detailed Component Inspection System**:
     - Clicking any 3D layer mesh or label highlights the geometry and opens a dedicated inspection card.
     - Card details: Name, Scientific Material, Dimension/Spec, Physical Function, and Role in Flash Memory.
  5. **Cinematic Exploded & Cross-Section Viewports**:
     - Smooth vertical lerping animation between Assembled and Exploded views.
     - Added a prominent `↩ RETURN TO ASSEMBLED` button when not in default assembled state.
     - Cross-section view uses true local clipping plane ($z \ge 0.05$) to cleanly cut through all 8 internal semiconductor layers without geometric distortion.
  6. **Smartphone Hardware Polish (`SmartphoneView.jsx`)**:
     - Improved chassis proportions ($340 \times 670\text{ px}$, $48\text{ px}$ radius).
     - Space-grey metallic perimeter gradient with antenna insulation bands and micro-speaker slit.
     - Dynamic Island notch with camera reflection and sensor dot.
     - Native-styled OLED status bar and bottom iOS/Android-style home indicator bar.
  7. **Build & Test Verification**:
     - Production build compiled cleanly in 406ms.
     - All 25 automated unit tests passing (100% pass rate).

## Milestone: Major 3D Models Visual Upgrade (Smartphone & Floating-Gate Transistor)
- **Date**: 2026-11-24
- **Objective**: Deliver photorealistic rendering quality for both primary 3D models (Smartphone & Floating-Gate MOSFET), comparable to premium scientific product visualizations.
- **Completed Actions**:
  1. **3D Smartphone Model (`Smartphone3DScene.jsx`)**:
     - Modeled extruded titanium/graphite chassis with beveled perimeter corners, antenna isolation cuts, and USB-C/speaker acoustic cuts.
     - Frosted ceramic glass back plate with physical clearcoat and laser-etched monogram.
     - Raised sapphire camera plateau with triple-lens system (metallic lens rings, deep anti-reflective coatings, true-tone LED flash, and LiDAR scanner).
     - Front OLED display glass with dynamic screen canvas rendering live wallpaper, status bar, and active NAND payload metrics.
     - Interactive 360° orbit inspection with angle presets: `FRONT`, `ISOMETRIC`, and `TRIPLE CAM`.
     - Integrated view mode switcher in `SmartphoneView.jsx`: `🖥️ INTERACTIVE SCREEN` vs `📱 3D HARDWARE (360°)`, preserving all file-saving and storage functionality.
  2. **Upgraded Storage Journey Smartphone (`StorageJourneyScene.jsx`)**:
     - Upgraded Stage 0 from primitive box to extruded titanium chassis, sapphire camera bump, triple lenses, and front dynamic island.
  3. **Physically Connected Floating-Gate MOSFET (`TransistorScene.jsx` & `FileJourney3DScene.jsx`)**:
     - Enforced exact zero-gap physical layer stacking in assembled mode:
       - Substrate ($y = 0 \dots 0.85$, center $0.425$)
       - Channel ($y = 0.78 \dots 0.85$, center $0.815$) flush between Source and Drain
       - Tunnel Oxide ($y = 0.85 \dots 0.95$, center $0.90$) touching channel directly
       - Floating Gate ($y = 0.95 \dots 1.40$, center $1.175$) sitting directly on oxide
       - IPD ONO sandwich ($y = 1.40 \dots 1.56$, center $1.48$) capping and wrapping shoulders
       - Control Gate ($y = 1.56 \dots 2.10$, center $1.83$) sitting directly on IPD
       - Word Line metal strap ($y = 2.10 \dots 2.24$, center $2.17$)
     - Smooth vertical lerping in exploded mode with dynamic leader-line and label tracking.
     - True local clipping plane ($z \ge 0.05$) in cross-section mode exposing all internal layer boundaries without geometric distortion.
  4. **Build & Automated Test Suite Verification**:
     - Production build compiled cleanly via Vite in 428ms.
     - 25 of 25 automated tests passing (100% pass rate).




## Milestone: File Integrity & SECDED ECC Workstation Redesign
- **Date**: 2026-11-24
- **Objective**: Transform the File Integrity & ECC Recovery module (`IntegrityView.jsx`) into a polished, professional semiconductor engineering workstation adhering to dark scientific interface standards.
- **Completed Actions**:
  1. **Professional Dark Scientific Workstation UI**:
     - Applied cohesive dark charcoal/navy palette (`#0d121d` background, `#131b2a` cards, `#1e293b` borders).
     - Color discipline: Restrained cyan (`#38bdf8`) for technical metrics and labels, emerald (`#10b981`) strictly for verified hash match and successful recovery, amber (`#f59e0b`) exclusively for bit flips, injected noise, and syndrome alerts.
     - Removed neon gradients, decorative glow effects, and AI-dashboard styling in favor of crisp typography and high-contrast monospace displays.
  2. **Active Payload Byte Buffer Panel**:
     - Displays payload filename, total byte size, nibble count, and total encoded SECDED codewords.
     - Features complete byte-by-byte breakdown table detailing byte offset, raw hex value, ASCII character representation, and binary stream with bit-flip delta indicators.
     - Supports direct file downloads of original, corrupted, and recovered payloads.
  3. **SHA-256 Cryptographic Hash Triad**:
     - Clear visual hierarchy separating Original File Hash, Corrupted Read Hash, and SECDED Recovered Hash.
     - Live cryptographic matching badges (`MATCHES SOURCE` vs `HASH MISMATCH`) showing exact byte-integrity status.
  4. **Stochastic Raw Bit Error Rate (RBER) Injection Controller**:
     - Interactive RBER slider with rapid preset buttons (0.50% Typical EOL, 2.00% High Stress, 5.00% Extreme Noise).
     - Deterministic PRNG seed control with rapid randomizer for reproducible read-disturb testing.
     - Prominent, high-contrast `⚡ INJECT READ NOISE` amber action button.
  5. **Interactive SECDED Extended Hamming (8,4) Codeword Inspector**:
     - High-density matrix displaying 8-bit codeword layout ($P_1, P_2, D_3, P_4, D_2, D_1, D_0, P_{all}$).
     - Distinct visual tags distinguishing Parity bits, Data bits, and the Overall Parity bit.
     - Clickable bit tiles allowing real-time interactive manual flipping with instant syndrome recalculation.
     - Live syndrome tracking ($S = s_1 + 2s_2 + 4s_4$, overall parity $P_{all}$) with clear diagnosis badges (`CLEAN (NO ERROR)`, `SINGLE-BIT ERROR CORRECTED`, `DOUBLE-BIT ERROR (UNCORRECTABLE)`).
  6. **Industrial Semiconductor Memory Context**:
     - Explanatory engineering card contrasting laboratory Extended Hamming (8,4) with modern commercial 3D NAND storage (LDPC and BCH hard/soft-decision engines in UFS 4.0 and PCIe Gen 5 SSDs).
  7. **Preserved Physics & Math Core**:
     - Zero mock data: strictly preserved all mathematical calculations from `physics.js` (`secdedEncodeNibble`, `secdedDecode`, `secdedRecover`, `injectBitErrors`, and `sha256`).
  8. **Build & Automated Test Suite Verification**:
     - Production build compiled cleanly in 431ms.
     - All 25 automated tests passed (100% pass rate).
