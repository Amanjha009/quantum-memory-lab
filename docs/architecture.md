# Architecture

## Browser application

- `apps/web/src/App.jsx` owns the seven-module journey, selected file, full simulated byte buffer, and cell/block state. The live smartphone is the entry point; the tunnelling, NAND, endurance, retention, integrity and architecture modules are deeper views of that same state.
- `apps/web/src/components/SmartphoneSimulation.jsx` presents the synchronized phone and storage pipeline. Its state comes from the flash-translation-layer model rather than from decorative animation.
- `apps/web/src/core/storage.js` models logical files, representative 256-byte pages, UFS mapping, logical deletion, restore, valid-page relocation, and block reclamation.
- `apps/web/src/components/FlashLab.jsx` is the engineering workstation for tunnelling, NAND, endurance, and retention. Its toolbar state machine, parameter controls, telemetry, program-pulse trace, reliability plots, and inspector are driven by the same shared physics and NAND state as the phone.
- `apps/web/src/components/TransistorScene.jsx` builds the Three.js transistor from independently selectable layer meshes. It supports assembled, exploded, and cross-section views, layer visibility, orbit/zoom/pan, camera reset, and program/erase charge motion. Stored-charge dots remain inside the floating gate; oxide glow responds to calculated FN current.
- `apps/web/src/core/physics.js` contains finite-difference scattering, WKB, SHA-256, ECC, and the retention facade.
- `apps/web/src/core/flash.js` contains the shared browser models for FN current, pulse-integrated charge, ISPP program/verify, reverse-field block erase, SLC sensing, endurance spread, and retention.

## Python numerical service

`physics-engine/app/server.py` is a standard-library HTTP service bound to `127.0.0.1:8765`. `physics-engine/app/physics.py` uses NumPy for scattering and mirrors the FN/ISPP/erase/read/retention equations. The Vite development server proxies `/api` to this service. The browser has matching JS equations so the hosted static site works without a Python function or remote service. Uploaded bytes are never sent to the physics API.

## Data path and NAND mapping

The browser reads supported JPG, PNG, SVG, or TXT bytes locally and hashes an immutable original. Saving creates a logical file and maps representative 256-byte teaching pages to physical pages in a four-block NAND model. The first input byte is shown in eight SLC cells. A program pulse computes oxide field, FN current, transferred charge, and threshold voltage; after each pulse it verifies the selected threshold and stops when the target is reached. Erase applies reverse field to all cells in the displayed block. Read compares measured threshold to Vref and assembles the byte. Full-file recovery uses the retained local byte buffer while the page map and eight-cell array make the storage sequence inspectable.

Deletion removes the file-system reference and marks its mapped NAND pages invalid; it does not immediately erase charge. Restore reverses that logical change while pages remain invalid and recoverable. Garbage collection relocates valid pages out of a selected block, removes invalid pages, then applies one physical block erase cycle. Power-off preserves the browser-resident model; restart reads the selected mapped byte and verifies the retained file hash.

Endurance stress changes deterministic read-threshold spread, modeled defects, and the retention multiplier. Applying retention updates the charge held by each cell and therefore can change a later read. All reliability coefficients are illustrative.

## Desktop

The Electron shell opens the same built frontend with Node integration off, context isolation and sandboxing on, navigation restrictions, and a restrictive content security policy. It starts the loopback physics service. Desktop installation and packaging have not been verified.
