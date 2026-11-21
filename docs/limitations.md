# Limitations

- The modeled device is an idealized floating-gate SLC transistor. Many modern NAND products use charge-trap stacks, multi-level cells, 3D structures, adaptive read thresholds, wear levelling and controller-level LDPC/BCH.
- The oxide voltage divider, effective mass, barrier profile, retention activation energy, leakage prefactor, damage multipliers and threshold coupling are illustrative. They are not measured parameters for a particular product.
- Fowler–Nordheim current is an idealized high-field equation; low-field outputs are extrapolations. Current density does not directly determine the number of stored electrons without an area and time-integrated device model.
- The numerical scattering model is one-dimensional, coherent, elastic, single-channel and lossless. It does not model phonons, image-force lowering, defects, trap-assisted tunneling, self-consistent electrostatics or band structure.
- The retention model is intentionally simplified and must not be used to predict a real phone's or SSD's retention lifetime.
- Error injection applies stochastic flips to copied bytes. The teaching ECC path uses extended Hamming (8,4) codewords; the simulated SLC display shows only eight representative bits, while recovery processes actual payload bytes.
- USB flash drive and laptop SSD choices currently reuse the shared save/memory path; distinct hardware form factors and device-specific wear/read models are not implemented. Native OS file manager integration, platform installers, and production signing are also outstanding.
- Electron source has not yet been installed or packaged in this environment. Cross-platform release artifacts are not included.
