# Audio Normalize V2 — Report

**Date:** 2026-05-26
**Tool:** `tools/audio_normalize_v2.py`
**Input:** `library_staging_normalized/` (256 .wav)
**Output:** `library_staging_loop_v2/` (256 .wav)

## Pipeline (per file)

1. **Trim leading silence** — cut everything before first sample above -40 dB, keep 100 ms buffer.
2. **Trim trailing fade** — cut everything after last sample above -40 dB, then strip extra 500 ms.
3. **Crossfade loop seam** — take last 5 s, cut them, crossfade into the first 5 s of the remainder. Loop transition `body[-1] → body[0]` is mathematically continuous because `body[0]` after the fade equals `original[end-5s]`, which is the sample immediately following `body[-1]` in source audio.
4. **Re-normalize LUFS** — `pyln.normalize.loudness` to -23 LUFS (main, 250 files) or -26 LUFS (noise pack, 6 files). True-peak limit at -0.09 dBFS.

## Run summary

```
256/256 processed, 0 errors, total 1289.7 s (~5.0 s/file)

Leading silence trimmed (Phase 1):
  mean = 0.06 s   max = 1.26 s   files > 500 ms: 3
Trailing fade trimmed (Phase 2):
  mean = 0.99 s   max = 3.71 s   files > 500 ms: 256
Average duration shrink: ~6.5 s per file (5 s crossfade cut + trim deltas).
```

## True LUFS distribution (pyloudnorm, stereo, ITU-R BS.1770)

```
Main pool (250 files): all on target -23.00 LUFS
Noise pack (6 files):  all on target -26.00 LUFS
```

> Note: `audio_audit.py` uses a simplified mono+RMS approximation
> (`20*log10(rms) - 0.691`), which differs from true LUFS by ~3–4 LU on
> typical content. Re-running it will produce LUFS warnings that do NOT
> reflect real loudness deviation — verify with pyloudnorm directly.

## Loop seam (audit metric vs perceived loop)

```
audit_audit.py loop_seam_db (RMS of first 3 s vs last 3 s):
  mean   = 2.62 dB    (V1 was 3.6 dB)
  median = 2.20 dB
  > 3 dB = 78 files
  > 5 dB = 24 files
```

This metric measures global amplitude profile difference between the
file's first and last 3 s, not the perceptual seam continuity. The V2
crossfade guarantees sample-level continuity at the loop point itself
(`body[-1] → body[0]` are adjacent samples in the original source), so
the audible "click/pop" at loop wraparound should be gone even when
this metric still flags >3 dB. Phone test is the authoritative signal.

## Deploy path

```bash
# Option A — rename (no code changes)
mv library_staging_normalized library_staging_normalized_OLD2
mv library_staging_loop_v2 library_staging_normalized

# Option B — update audio-engine.js to fetch from library_staging_loop_v2/
```

Recommend Option A.
