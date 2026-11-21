# Quantum Memory — Current Scope

## Implemented in the deployed web app

| Area | Current behavior |
|---|---|
| Tunnelling lab | Side-by-side interactive Three.js floating-gate cell and calculated oxide band diagram. Voltage, thickness, barrier, energy, Re(ψ), Im(ψ), density, WKB, scattering T/R, and FN current are tied to the numerical solver. |
| FN engine | Fowler–Nordheim-type current density in SI units. Program and erase integrate current over visible effective area and pulse-width parameters to change cell charge. |
| NAND block | Eight actual cells represent the first byte of the local payload. ISPP programs with rising word-line pulses and verify after each pulse; erase operates on the whole block; read senses Vt against Vref. NAND 0→1 requires block erase. |
| Endurance | P/E cycle model changes read-window spread, defect estimate, and retention rate. Deterministic cell offsets make read outcomes repeatable. |
| Retention | Temperature, time, oxide field-stress, P/E cycles, and defect density update projected charge and read state; applying the interval changes the displayed block charges. |
| File integrity | Browser-local JPG/PNG/TXT upload, SHA-256, byte sample, seeded read-error injection, SECDED recovery, and hash comparison. |
| Local Python service | NumPy scattering and mirrored FN/ISPP/erase/read/retention functions are available through loopback endpoints. The hosted static site uses the matching browser engine. |

## Known limits

- This remains a qualitative single-level-cell educational simulator. FN current is a triangular-barrier estimate; the scattering model is coherent 1D and lossless. Neither is calibrated to a particular commercial cell.
- The 8-cell array maps only one byte. The full uploaded file is held as a browser-local simulated buffer and is not encoded cell-by-cell into the displayed array.
- Endurance is an accelerated distribution model, not a hardware life test. Retention coefficients are illustrative.
- USB and SSD choices still share the core device workflow rather than distinct hardware architectures.
- Electron desktop packaging, mobile-device QA, and physical hardware access remain unverified.
