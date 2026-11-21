# Test Report

## Automated checks

| Check | Result | Coverage |
|---|---|---|
| `npm test` | Passed | Browser-side scattering, FN constants/units, FN charge integration, ISPP pulse-and-verify, reverse-field block erase, SLC reads, wear/retention trends, SECDED, byte hashing, and seeded error injection. Python suite checks the mirrored model behavior. |
| `npm run build` | Passed | Vite production bundle; Three.js is split into a vendor chunk. |

## Physics checks

- Divider at 10 V, 9 nm: `Vox = 6.336 V`, `F = 7.04×10⁸ V/m`.
- FN current at `F = 2.0×10⁹ V/m`, `φ = 3.1 eV`: `J = 1.5942455×10⁴ A/m²`, matching the implemented FN expression and constants.
- Program charge is calculated dimensionally from `J × area × pulse duration`; the ISPP loop stops at the first pulse whose threshold estimate reaches verify.
- Tests verify thinner oxides program more charge under matching pulse conditions, reverse-field erase reduces charge, and block reads use the selected Vref.
- At increased P/E wear, threshold spread, modeled defects, and retention leakage increase; deterministic read offsets keep outcomes repeatable.
- Scattering tests retain `0 ≤ T,R ≤ 1`, nonnegative density, and a small lossless flux residual across parameter sweeps.

## Browser verification

- Exercised the complete live-phone workflow locally: downloaded a sample photograph, saved it with FN-driven ISPP, opened it through a NAND threshold read, powered off and restarted with a successful hash verification.
- Created a document in the same model, logically deleted the photograph, restored it before collection, then deleted it again and ran garbage collection. The UI showed one valid-page relocation, three invalid-page removals, a physical erase of block B0, and an updated UFS mapping for the document to B1·P00.
- Opened the architecture comparison and entered the FN tunnel lab from it; the 3D device, energy-band diagram, WKB, wavefunction, FN current, and program-pulse controls loaded together.
- Opened the production URL and confirmed the side-by-side 3D device and calculated band diagram load, with the physics controls and readouts visible.
- In the local app, changed gate voltage and confirmed the oxide field, band, scattering, WKB, and FN readouts respond.
- Programmed sample byte `0x41`: six zero bits were written with FN-based ISPP; the final cell verified after 20 pulses. Read-back matched `01000001` on both local and production pages.
- Erased the local eight-cell block with reverse-field FN pulses and confirmed a subsequent read returned `0xFF`.
- Added 100 wear cycles in the production page; P/E count, Vt spread, defect density, and retention multiplier updated. The retention panel also loaded with a live selected-cell charge and threshold projection.
- In the local app, varied retention time and temperature, applied the projection, and confirmed enough stress moves the selected cell across the read threshold.
- Verified the refined workstation locally: all device parameters are editable, changing the gate from 10 V to 15 V updated Vox from 6.336 V to 9.936 V, Eox from 0.704 GV/m to 1.104 GV/m, WKB from 8.79×10⁻¹⁰ to 1.67×10⁻⁶, and JFN from 2.46×10⁻¹² to 1.31×10⁻³ A/m². RUN/PAUSE, exploded/cross-section/reset controls, and layer visibility were present.
- Ran the new NAND workstation against the shared cell state: the `0x41` payload programmed six zero cells, completed 20 calculated program/verify pulses on the final cell, displayed its pulse trace, and returned a matching threshold-sense read of `01000001`.

## Limits

The model is qualitative and not calibrated against a particular commercial NAND cell. FN oxide transport omits image-force lowering, traps, and material-specific corrections. Endurance/retention coefficients are educational. Electron desktop packaging and physical device behavior are not validated.
