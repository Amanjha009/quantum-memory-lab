# Equations and Operating Conventions

All core calculations run in SI units internally. Display units are shown beside controls and outputs.

## Oxide field and band tilt

`Vox = max(0, α(Vg − Voffset))`, with the illustrative coupling `α = 0.72` and offset `Voffset = 1.2 V`. Then `F = Vox/tox`. The conduction-band profile is `V(x) = max(0, φ − eFx)` when energies are expressed in eV; numerically `eFx` has the same value in eV when `F` is V/m and `x` is m.

## Schrödinger scattering and WKB

The finite-difference solver discretizes `ψ[i+1] − 2ψ[i] + ψ[i−1] + (2m* Δx²/ℏ²)(E − V[i])ψ[i] = 0`, with incident-plus-reflected source boundary conditions and an outgoing drain boundary condition. Flux-normalized `T` and `R` are reported separately; the lossless single-channel solver checks `|R + T − 1|`.

`T_WKB ≈ exp(−2∫κ dx)`, where `κ(x) = √(2m*(V(x)−E))/ℏ` over the classically forbidden interval. The band plot locates the energy crossing and shades the forbidden interval. Wavefunction traces use the calculated scattering amplitudes, rescaled only for plot visibility.

## Fowler–Nordheim-type current

`J_FN = (A_FN F²/φ) exp(−B_FN φ^(3/2)/F)`, where `A_FN = 1.541434×10⁻⁶ A·eV·V⁻²` and `B_FN = 6.83089×10⁹ V·m⁻¹·eV⁻³/²`. These constants match the standard free-electron FN constants reported in the field-emission literature ([RSC paper and supplement](https://pubs.rsc.org/en/content/articlehtml/2021/na/d0na00687d)). The implementation is an ideal triangular-barrier FN-type estimate; it omits image-force corrections, oxide band-structure effects, traps, and self-consistent electrostatics. Treat its current as an educational estimate, not measured SiO₂ device data.

## ISPP program, block erase, and read

For program pulse `k`, `Vpgm(k) = Vstart + k·ΔVpgm`; each pulse increases the selected word-line voltage, computes `F`, then integrates FN current over the effective area and pulse duration:

`ΔQ(fC) = J_FN(A/m²) × Aeff(m²) × tpulse(s) × 10¹⁵`.

Stored charge accumulates as `Q[k+1] = Q[k] + ΔQ`. The threshold estimate is `Vt = Verase + Q/Ccg`, where charge and capacitance are entered in matching fC and fF units. After every pulse the simulator performs a program-verify comparison and stops when the selected target is reached or the maximum program voltage is exhausted. This is the control sequence used by incremental step-pulse programming: apply a pulse, read/verify threshold, then continue or inhibit cells that passed. The educational model is consistent with descriptions of ISPP operation in NAND arrays ([peer-reviewed 3D NAND ISPP study](https://www.mdpi.com/2079-9292/11/3/424)).

Erase applies the reverse field to the block and integrates the same FN-type current to remove stored charge. A block erase changes the state of all eight displayed sample cells and increments the block's P/E cycle count. SLC read uses the convention `Vt ≥ Vread → programmed 0`; `Vt < Vread → erased 1`. A 1 cannot be programmed back to 0 without erasing its entire block first (here described using the conventional NAND logical-state mapping).

The effective cell area, pulse duration, coupling ratio, threshold capacitance, and verify target are exposed or documented as illustrative parameters. The 8-cell display maps the actual first payload byte; it does not claim that eight transistors store an entire file.

## Endurance and retention

The accelerated endurance model uses normalized wear `w = min(Npe/Nmax, 1)`, threshold spread `σVt = 25 mV + 220 mV·w^0.8`, a shrinking read window, a defect-density estimate, and a retention-rate multiplier `1 + 8w`. At high wear, programmed and erased distributions shift toward each other and a repeatable per-cell threshold offset is added; read outcomes are therefore reproducible for a fixed seed.

Retention uses `Q(t) = Q0 exp(−Γt)` and `Γ(T) = Γ0 exp(−Ea/kBT) × D × W × S`, with illustrative `Γ0 = 850 s⁻¹`, `Ea = 0.72 eV`, a defect multiplier `D`, endurance multiplier `W`, and field-stress factor `S = 1 + 0.5(Fstress/(2 GV/m))²`. This is a qualitative stress model, not a lifetime qualification method.

## References

- Fowler–Nordheim constants and field-emission form: [Royal Society of Chemistry source](https://pubs.rsc.org/en/content/articlehtml/2021/na/d0na00687d).
- NAND ISPP pulse-and-verify operation: [Electronics, “EXPRESS: Exploiting Energy–Accuracy Tradeoffs in 3D NAND Flash Memory”](https://www.mdpi.com/2079-9292/11/3/424).
- Retention and endurance effects depend on cycling and temperature; this prototype uses qualitative coefficients and is not calibrated to the measured distributions in [NAND threshold-voltage instability research](https://re.public.polimi.it/handle/11311/594481).
