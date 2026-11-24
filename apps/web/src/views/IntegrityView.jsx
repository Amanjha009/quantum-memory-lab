import React, { useState, useMemo } from 'react';
import { injectBitErrors, secdedDecode, secdedEncodeNibble, secdedRecover, sha256 } from '../core/physics.js';

export default function IntegrityView({
  file,
  bytes,
  hash,
  onDownload,
  onReturnToPhone,
}) {
  const [rer, setRer] = useState(0.02);
  const [seed, setSeed] = useState(37);
  const [corrupted, setCorrupted] = useState(null);
  const [recovered, setRecovered] = useState(null);
  const [eccInfo, setEccInfo] = useState(null);
  const [recoveredHash, setRecoveredHash] = useState('');
  const [hashMatch, setHashMatch] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // SECDED interactive nibble explorer
  const [testNibble, setTestNibble] = useState(0b1010);
  const [flippedBitIndex, setFlippedBitIndex] = useState(null);

  const encodedCodeword = useMemo(() => secdedEncodeNibble(testNibble), [testNibble]);

  const damagedCodeword = useMemo(() => {
    const arr = encodedCodeword.slice();
    if (flippedBitIndex != null && flippedBitIndex >= 0 && flippedBitIndex < 8) {
      arr[flippedBitIndex] ^= 1;
    }
    return arr;
  }, [encodedCodeword, flippedBitIndex]);

  const decodedResult = useMemo(() => secdedDecode(damagedCodeword), [damagedCodeword]);

  // Inject bit errors using physics LCG engine
  const handleInjectErrors = () => {
    const result = injectBitErrors(bytes, rer, seed);
    setCorrupted(result.corrupted);
    setRecovered(null);
    setRecoveredHash('');
    setHashMatch(null);
    setEccInfo(result);
  };

  // Run hardware-level SECDED recovery
  const handleRunSECDED = () => {
    if (!corrupted) return;
    const result = secdedRecover(bytes, corrupted);
    setRecovered(result.bytes);
    setEccInfo((prev) => ({
      ...prev,
      ...result,
      code: 'Extended Hamming SECDED (8,4)',
    }));
  };

  // Cryptographic SHA-256 verification
  const handleVerifyHash = async () => {
    if (!recovered) return;
    setIsVerifying(true);
    const digest = await sha256(recovered);
    setRecoveredHash(digest);
    setHashMatch(digest === hash);
    setIsVerifying(false);
  };

  // Quick seed randomizer
  const handleRandomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 9999) + 1);
  };

  const prettySize = (size) =>
    size < 1024
      ? `${size} B`
      : size < 1048576
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / 1048576).toFixed(2)} MB`;

  // Render byte bits with highlighted error bits
  const renderBinaryStream = (originalArr, corruptedArr = null, maxBytes = 16) => {
    const sliceLen = Math.min(originalArr.length, maxBytes);
    const byteRows = [];

    for (let i = 0; i < sliceLen; i++) {
      const origByte = originalArr[i];
      const origBits = origByte.toString(2).padStart(8, '0');
      const corrByte = corruptedArr ? corruptedArr[i] : null;
      const corrBits = corrByte != null ? corrByte.toString(2).padStart(8, '0') : null;
      const hasFlip = corrByte != null && corrByte !== origByte;

      byteRows.push({
        byteIndex: i,
        origBits,
        corrBits,
        hasFlip,
        hex: `0x${origByte.toString(16).padStart(2, '0').toUpperCase()}`,
        ascii: origByte >= 32 && origByte <= 126 ? String.fromCharCode(origByte) : '·',
      });
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
        {byteRows.map((row) => (
          <div
            key={row.byteIndex}
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 40px 180px 180px 30px',
              gap: '12px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: row.hasFlip ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              borderLeft: row.hasFlip ? '3px solid #f59e0b' : '3px solid transparent',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#64748b' }}>B{String(row.byteIndex).padStart(2, '0')}</span>
            <span style={{ color: '#38bdf8' }}>{row.hex}</span>
            <span style={{ color: '#94a3b8', letterSpacing: '1px' }}>{row.origBits}</span>
            {corruptedArr ? (
              <span style={{ letterSpacing: '1px' }}>
                {row.corrBits.split('').map((bit, bitIdx) => {
                  const bitFlipped = bit !== row.origBits[bitIdx];
                  return (
                    <span
                      key={bitIdx}
                      style={{
                        color: bitFlipped ? '#f59e0b' : '#64748b',
                        fontWeight: bitFlipped ? 800 : 400,
                        textDecoration: bitFlipped ? 'underline' : 'none',
                        background: bitFlipped ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                        borderRadius: '2px',
                        padding: '0 1px',
                      }}
                    >
                      {bit}
                    </span>
                  );
                })}
              </span>
            ) : (
              <span style={{ color: '#475569' }}>────────</span>
            )}
            <span style={{ color: '#cbd5e1', textAlign: 'center' }}>{row.ascii}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '20px 24px 80px',
        background: '#0d121d',
        minHeight: '100vh',
        color: '#f8fafc',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* 1. Header & Module Description */}
      <div style={{ marginBottom: '22px', borderBottom: '1px solid #1e293b', paddingBottom: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            SEMICONDUCTOR RELIABILITY
          </span>
          <span
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            INFORMATION THEORY & ERROR CORRECTION
          </span>
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
          File Integrity & ECC Recovery Workstation
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, maxWidth: '860px', lineHeight: 1.5 }}>
          Raw NAND flash cells are inherently noisy and suffer wear-induced bit flips from oxide stress, charge leakage, and read disturb.
          Hardware Error Correcting Code (ECC) engines append calculated mathematical parity to detect and correct physical transmission errors
          transparently before data reaches the host operating system.
        </p>
      </div>

      {/* Main Two-Column Scientific Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.45fr) minmax(380px, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
        className="ecc-workstation-grid"
      >
        {/* ======================================================== */}
        {/* LEFT COLUMN: End-to-End File Error Injection & Recovery */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 2. Active Payload Byte Buffer Card */}
          <div
            style={{
              background: '#131b2a',
              border: '1px solid #1f2c42',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                  ACTIVE PAYLOAD BYTE BUFFER
                </span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                  {file?.name || 'sample-memory-note.txt'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 8px',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    borderRadius: '4px',
                  }}
                >
                  {prettySize(bytes.length)} · {bytes.length.toLocaleString()} bytes
                </span>
                {file?.kind && (
                  <span
                    style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: '#cbd5e1',
                      borderRadius: '4px',
                    }}
                  >
                    {file.kind}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Distinct SHA-256 Hash Triad */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: '#0a0e17',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
              }}
            >
              {/* Row 1: Original Hash */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>1. ORIGINAL SHA-256 (GROUND TRUTH):</span>
                  <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>SOURCE PRISTINE</span>
                </div>
                <code style={{ color: '#38bdf8', wordBreak: 'break-all', fontSize: '11px', background: '#0f172a', padding: '6px 8px', borderRadius: '4px' }}>
                  {hash || 'Computing hash…'}
                </code>
              </div>

              {/* Row 2: Corrupted Read */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>2. PHYSICAL READ BUFFER (POST-CHANNEL):</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: corrupted ? '#f59e0b' : '#64748b',
                    }}
                  >
                    {corrupted ? `⚠ ${eccInfo?.flips?.length} BIT FLIPS INJECTED` : 'CLEAN (NO NOISE INJECTED)'}
                  </span>
                </div>
                <code
                  style={{
                    color: corrupted ? '#f59e0b' : '#64748b',
                    wordBreak: 'break-all',
                    fontSize: '11px',
                    background: corrupted ? 'rgba(245, 158, 11, 0.08)' : '#0f172a',
                    border: corrupted ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid transparent',
                    padding: '6px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {corrupted
                    ? `${eccInfo?.flips?.length} stochastic bit errors introduced across ${(corrupted.length * 8).toLocaleString()} bits (Seed ${seed})`
                    : 'Awaiting stochastic noise injection below…'}
                </code>
              </div>

              {/* Row 3: Recovered Hash */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: 700 }}>3. POST-ECC RECONSTRUCTED SHA-256:</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: hashMatch === true ? '#10b981' : hashMatch === false ? '#ef4444' : '#64748b',
                    }}
                  >
                    {hashMatch === true ? '✓ 100% BIT-FOR-BIT MATCH' : hashMatch === false ? '✕ HASH MISMATCH' : 'WAITING FOR RECOVERY'}
                  </span>
                </div>
                <code
                  style={{
                    color: hashMatch === true ? '#10b981' : hashMatch === false ? '#ef4444' : '#64748b',
                    wordBreak: 'break-all',
                    fontSize: '11px',
                    background: hashMatch === true ? 'rgba(16, 185, 129, 0.08)' : '#0f172a',
                    border: hashMatch === true ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    padding: '6px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {recoveredHash
                    ? `${recoveredHash}`
                    : recovered
                    ? 'Ready for cryptographic SHA-256 verification (Click Verify below)'
                    : 'Waiting for SECDED engine execution…'}
                </code>
              </div>
            </div>

            {/* 4. Binary Stream Comparison */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8', fontWeight: 600 }}>
                  RAW DATA STREAM (BYTE 00 TO 15):
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                  OFFSET · HEX · ORIGINAL · READ · ASCII
                </span>
              </div>
              <div
                style={{
                  background: '#0a0e17',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '10px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}
              >
                {renderBinaryStream(bytes, corrupted, 16)}
              </div>
            </div>

            {/* 5. Stochastic Raw Bit Error Rate (RBER) Controls */}
            <div
              style={{
                marginTop: '18px',
                background: '#0a0e17',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                  STOCHASTIC RAW BIT ERROR RATE (RBER)
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f59e0b' }}>
                  {(rer * 100).toFixed(2)} % ({Math.round(bytes.length * 8 * rer)} expected bit flips)
                </span>
              </div>

              {/* RBER Range Slider */}
              <input
                type="range"
                min="0.001"
                max="0.08"
                step="0.001"
                value={rer}
                onChange={(e) => setRer(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#f59e0b',
                  cursor: 'pointer',
                  marginBottom: '10px',
                }}
              />

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {[
                  { label: '0.50% (Normal Wear)', val: 0.005 },
                  { label: '2.00% (Endurance Limit)', val: 0.02 },
                  { label: '5.00% (Severe Defect Stress)', val: 0.05 },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setRer(p.val)}
                    style={{
                      background: Math.abs(rer - p.val) < 0.0001 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${Math.abs(rer - p.val) < 0.0001 ? '#f59e0b' : '#334155'}`,
                      color: Math.abs(rer - p.val) < 0.0001 ? '#f59e0b' : '#94a3b8',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Seed Configuration & Prominent Inject Noise Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                  <span>Reproducible Seed:</span>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value) || 1)}
                    style={{
                      width: '70px',
                      padding: '4px 8px',
                      background: '#131b2a',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      color: '#f8fafc',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                  />
                  <button
                    onClick={handleRandomizeSeed}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid #334155',
                      color: '#cbd5e1',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                    title="Randomize seed"
                  >
                    🎲 New Seed
                  </button>
                </div>

                {/* 6. Prominent Inject Noise Button */}
                <button
                  onClick={handleInjectErrors}
                  style={{
                    background: '#f59e0b',
                    color: '#0f172a',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  ⚡ INJECT READ NOISE
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
              <button
                onClick={handleRunSECDED}
                disabled={!corrupted}
                style={{
                  flex: 1.5,
                  minWidth: '180px',
                  background: corrupted ? '#2563eb' : '#1e293b',
                  color: corrupted ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: corrupted ? 'pointer' : 'not-allowed',
                }}
              >
                🛠 RUN SECDED CORRECTION
              </button>
              <button
                onClick={handleVerifyHash}
                disabled={!recovered || isVerifying}
                style={{
                  flex: 1,
                  background: recovered ? '#059669' : '#1e293b',
                  color: recovered ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: recovered ? 'pointer' : 'not-allowed',
                }}
              >
                {isVerifying ? 'VERIFYING…' : '✓ VERIFY SHA-256'}
              </button>
              <button
                onClick={() => onDownload(bytes, file?.name || 'payload.txt')}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                }}
              >
                DOWNLOAD ORIGINAL
              </button>
            </div>

            {/* Execution Result Banner */}
            {eccInfo?.corrected != null && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: eccInfo.uncorrectable === 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${eccInfo.uncorrectable === 0 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: eccInfo.uncorrectable === 0 ? '#10b981' : '#ef4444',
                    marginBottom: '4px',
                  }}
                >
                  SECDED EXECUTION RESULT: {eccInfo.corrected} BIT FLIPS CORRECTED · {eccInfo.uncorrectable} UNCORRECTABLE DOUBLE FAULTS
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: 1.4 }}>
                  {eccInfo.uncorrectable === 0
                    ? 'All single-bit errors in codewords were successfully corrected by syndrome inversion. The recovered file matches the original byte-for-byte.'
                    : 'One or more codewords sustained 2 bit flips. The Extended Hamming code detected the double-bit fault and flagged it as uncorrectable, preventing silent corruption.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Interactive SECDED Codeword & Matrix      */}
        {/* ======================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* 7. SECDED Codeword Inspector Card */}
          <div
            style={{
              background: '#131b2a',
              border: '1px solid #1f2c42',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            }}
          >
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#c4b5fd' }}>
                SECDED CODEWORD INSPECTOR
              </span>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: '2px 0 4px 0' }}>
                Extended Hamming (8,4) Interactive Matrix
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
                Click any bit in the 8-bit codeword below to flip it. Observe real-time syndrome calculation, parity inversion, and error classification.
              </p>
            </div>

            {/* Input Data Nibble Selector */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b', marginBottom: '6px' }}>
                INPUT DATA NIBBLE (4 BITS):
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[0b0000, 0b0101, 0b1010, 0b1100, 0b1111].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setTestNibble(val);
                      setFlippedBitIndex(null);
                    }}
                    style={{
                      background: testNibble === val ? '#2563eb' : '#0a0e17',
                      color: testNibble === val ? '#ffffff' : '#94a3b8',
                      border: `1px solid ${testNibble === val ? '#3b82f6' : '#1e293b'}`,
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: testNibble === val ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {val.toString(2).padStart(4, '0')}
                  </button>
                ))}
              </div>
            </div>

            {/* 8. 8-Bit Codeword Grid (Clickable Individual Bits) */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                  8-BIT CODEWORD (CLICK ANY BIT TO FLIP):
                </span>
                {flippedBitIndex != null && (
                  <button
                    onClick={() => setFlippedBitIndex(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f59e0b',
                      fontSize: '10px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    ↺ Reset bit
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                {Array.from(damagedCodeword).map((bit, idx) => {
                  const isData = [2, 4, 5, 6].includes(idx);
                  const isParity = [0, 1, 3].includes(idx);
                  const isOverall = idx === 7;
                  const isFlipped = flippedBitIndex === idx;

                  let roleLabel = 'DATA';
                  if (idx === 0) roleLabel = 'P1';
                  if (idx === 1) roleLabel = 'P2';
                  if (idx === 2) roleLabel = 'D3';
                  if (idx === 3) roleLabel = 'P4';
                  if (idx === 4) roleLabel = 'D2';
                  if (idx === 5) roleLabel = 'D1';
                  if (idx === 6) roleLabel = 'D0';
                  if (idx === 7) roleLabel = 'P_ALL';

                  return (
                    <button
                      key={idx}
                      onClick={() => setFlippedBitIndex(flippedBitIndex === idx ? null : idx)}
                      style={{
                        background: isFlipped
                          ? 'rgba(245, 158, 11, 0.22)'
                          : isData
                          ? 'rgba(56, 189, 248, 0.1)'
                          : isParity
                          ? 'rgba(196, 181, 253, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: `1.5px solid ${
                          isFlipped
                            ? '#f59e0b'
                            : isData
                            ? 'rgba(56, 189, 248, 0.35)'
                            : isParity
                            ? 'rgba(196, 181, 253, 0.35)'
                            : 'rgba(255, 255, 255, 0.15)'
                        }`,
                        borderRadius: '6px',
                        padding: '8px 2px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        color: 'inherit',
                        boxShadow: isFlipped ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      title={`Click to flip bit ${idx} (${roleLabel})`}
                    >
                      <div
                        style={{
                          fontSize: '8px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: isFlipped ? '#f59e0b' : isData ? '#38bdf8' : isParity ? '#c4b5fd' : '#cbd5e1',
                        }}
                      >
                        {roleLabel}
                      </div>
                      <div
                        style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          color: isFlipped ? '#f59e0b' : '#f8fafc',
                          margin: '2px 0',
                        }}
                      >
                        {bit}
                      </div>
                      <div style={{ fontSize: '8px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                        b{idx}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 9. Decoder Syndrome Status Panel */}
            <div
              style={{
                background: '#0a0e17',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>DECODER SYNDROME STATUS:</span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 800,
                    background:
                      decodedResult.status === 'clean'
                        ? 'rgba(16, 185, 129, 0.15)'
                        : decodedResult.status === 'corrected'
                        ? 'rgba(245, 158, 11, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                    color:
                      decodedResult.status === 'clean'
                        ? '#10b981'
                        : decodedResult.status === 'corrected'
                        ? '#f59e0b'
                        : '#ef4444',
                    border: `1px solid ${
                      decodedResult.status === 'clean'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : decodedResult.status === 'corrected'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                  }}
                >
                  {decodedResult.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#cbd5e1' }}>
                <div>• Syndrome Vector (S4, S2, S1) Index: <strong style={{ color: decodedResult.syndrome > 0 ? '#f59e0b' : '#38bdf8' }}>{decodedResult.syndrome}</strong></div>
                <div>• Overall Parity Sum (P_ALL): <strong style={{ color: decodedResult.overallParity > 0 ? '#f59e0b' : '#38bdf8' }}>{decodedResult.overallParity}</strong></div>
                <div>
                  • Error Location: <strong>
                    {decodedResult.status === 'clean'
                      ? 'None (Codeword matches parity rules)'
                      : decodedResult.syndrome > 0 && decodedResult.overallParity
                      ? `Bit position b${decodedResult.syndrome - 1} inverted and corrected`
                      : !decodedResult.syndrome && decodedResult.overallParity
                      ? 'Overall parity bit b7 inverted and corrected'
                      : 'Double bit fault detected (Uncorrectable)'}
                  </strong>
                </div>
                <div>
                  • Recovered Output Nibble: <strong style={{ color: '#10b981' }}>{decodedResult.value.toString(2).padStart(4, '0')}</strong>{' '}
                  (Input was: {testNibble.toString(2).padStart(4, '0')})
                </div>
              </div>
            </div>

            {/* 10. Industrial Context Explanation Card */}
            <div
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                lineHeight: 1.5,
                background: '#0a0e17',
                borderLeft: '3px solid #38bdf8',
                padding: '12px 14px',
                borderRadius: '0 8px 8px 0',
              }}
            >
              <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '2px' }}>
                💡 Industrial Semiconductor Context:
              </strong>
              Extended Hamming SECDED (8,4) is an instructional linear block code capable of 1-bit correction and 2-bit detection.
              In commercial high-density TLC/QLC 3D NAND flash, production UFS 4.0 and PCIe 5.0 SSD controllers employ massive hardware{' '}
              <strong style={{ color: '#38bdf8' }}>LDPC (Low-Density Parity-Check)</strong> or{' '}
              <strong style={{ color: '#38bdf8' }}>BCH engines</strong> with soft-decision iterative decoders capable of resolving 40 to 120 bit errors per 4 KB sector.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
