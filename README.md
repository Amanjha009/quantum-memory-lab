# Quantum Memory

**Save a photograph. Enter the memory chip. Discover the physics that lets it stay.**

Live web simulator: [quantum-memory-lab.vercel.app](https://quantum-memory-lab.vercel.app). The home screen is a synchronized smartphone and NAND-storage simulation: save or open files, logically delete and restore them, run garbage collection, power-cycle the phone, and enter the quantum lab for side-by-side device and band views, FN-driven ISPP program/verify, block erase/read, endurance, retention, ECC, and architecture comparison.

Quantum Memory is an offline-first educational simulator connecting a local file, a virtual phone, a 3D floating-gate transistor, numerical tunneling, charge retention and error correction. Uploaded files remain in the browser; only simulation parameters can be sent to the optional loopback Python physics service.

## Run locally

Requirements: Node.js 20+ and Python 3.10+. NumPy is used by the optional Python solver.

1. Install frontend dependencies with `npm install`.
2. Install the Python dependency with `python3 -m pip install -r physics-engine/requirements.txt`.
3. Start the optional NumPy engine in one terminal: `python3 physics-engine/app/server.py`.
4. Start the web app in another terminal: `npm run dev`.
5. Open `http://127.0.0.1:5173`.

The browser includes a JavaScript numerical fallback, so the UI still works if the local service is stopped. When the service is available, the finite-difference scattering calculation comes from Python/NumPy. Both services bind to loopback addresses; the file itself is never sent to the Python service.

## Tests and build

- `npm test` runs the browser-physics/ECC tests and Python model tests.
- `npm run build` creates the static web build in `dist/`.
- Electron packaging source is in `apps/desktop/electron`. Install Electron with `npm install --prefix apps/desktop`, build the web app, then run `npm run desktop`.

The web app is a single React frontend. Desktop source uses the same built frontend in a hardened Electron window and launches the local Python engine; desktop packaging has not yet been validated. Native device access, paid APIs, and remote storage are not used.

This is an educational prototype created in this workspace, separate from the linked production reference. USB/SSD choices currently share the phone and simulated-memory flow. See [project status](docs/PROJECT_GAP_ANALYSIS.md) and [test report](docs/TEST_REPORT.md) for current coverage and limitations.

## Scope and scientific limits

This is an educational single-level-cell floating-gate model. It is not a model of every commercial NAND architecture or a predictor of SSD lifetime. See [scientific model](docs/SCIENTIFIC_MODEL.md), [equations](docs/equations.md), and [limitations](docs/limitations.md). A representative eight-cell view is not a claim that eight cells can hold the entire file. The data pipeline retains actual file bytes in browser memory for this experiment.

Open the web app through Vite (`npm run dev`) or the hosted URL. Opening the source `index.html` with a `file://` URL does not run React/Vite modules.
