# User guide

1. On **Your device**, upload a JPG, PNG or TXT (up to 10 MB), or use the sample note. The browser reads actual bytes and shows a SHA-256 digest. Files stay local.
2. Select **Save to phone** to copy the bytes into the simulated memory buffer and enter the transistor model.
3. Drag the transistor model to orbit, scroll to zoom, or select a layer. The eight-cell SLC sample displays the first byte using programmed=0 / erased=1.
4. Open **Quantum lab** and adjust gate voltage, oxide thickness, barrier height and incident energy. The chart and numerical metrics recalculate. A local Python/NumPy service is optional; the JavaScript solver is the fallback.
5. Open **Power & retention**, turn the simulated phone off, and vary temperature, time and cycles. Powering on checks the memory buffer hash before reconstructing the image preview.
6. In **Recover data**, set a read-error probability and seed, inject errors, run SECDED, verify the recovered SHA-256, and download the recovered output. The original payload remains separate.

The educational SECDED code corrects a single bit per 8-bit codeword and detects a two-bit error. It does not guarantee recovery for arbitrary error patterns.
