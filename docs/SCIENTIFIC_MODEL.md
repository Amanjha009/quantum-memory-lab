# Scientific Model Notes

Quantum Memory is a teaching simulator. Its calculations connect tunnelling and charge storage concepts, but outputs are not calibrated predictions for a commercial chip.

## Physics in the lab

- A complex finite-difference scattering solver calculates incident, reflected, and transmitted states for a one-dimensional oxide barrier. The Python/NumPy implementation is used when the local service responds; the browser solver is the fallback and is the engine used on the static Vercel deployment.
- Born probability density `|ψ|²` and the real and imaginary wavefunction components are read from the scattering solution.
- WKB tunnelling probability is integrated over the classically forbidden part of the calculated potential.
- The ideal triangular-barrier FN-type equation calculates current density from oxide field and effective barrier. The standard first and second FN constants are documented in [equations.md](equations.md).
- ISPP converts FN current density to charge per pulse with `ΔQ = J × area × pulse width`, updates the cell threshold estimate, and performs verify after each rising program pulse. Reverse-field erase removes charge from each cell in a selected block.
- SLC read compares each cell's calculated threshold with Vref. The displayed convention is programmed = 0 and erased = 1.
- An Arrhenius charge-loss estimate and an accelerated wear model modify charge and read distributions under temperature, time, stress, defects, and P/E cycling.

## Interpretation and limits

The triangular-barrier FN formula omits image-force lowering, oxide band structure, traps, and self-consistent electrostatics. The scattering model is one-dimensional, coherent, elastic, and lossless. Program/erase parameters such as effective area, pulse width, coupling ratio, and cell capacitance are illustrative. The endurance/retention coefficients do not reproduce a measured memory product.

Eight SLC cells map the first byte of the selected local payload for a visible operation trace. The full file stays in a separate browser-local simulated buffer; it is not physically encoded into eight cells.

## Verification

Automated checks cover the FN reference point and unit conversion, FN monotonicity, scattering flux conservation and nonnegative density, WKB thickness trends, ISPP verify behavior, reverse-field erase, Vref reads, repeatable wear-induced threshold errors, retention trends, and SECDED. Passing these checks demonstrates internal consistency, not agreement with silicon measurements.

## Sources

- FN constants and field-emission form: [Royal Society of Chemistry](https://pubs.rsc.org/en/content/articlehtml/2021/na/d0na00687d).
- NAND ISPP pulse-and-verify description: [Electronics, 3D NAND ISPP study](https://www.mdpi.com/2079-9292/11/3/424).
- Cycling and retention shift context: [NAND threshold-voltage instability study](https://re.public.polimi.it/handle/11311/594481).
