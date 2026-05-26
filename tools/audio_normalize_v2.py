#!/usr/bin/env python3
"""
AURALIS Audio Normalize V2 — aggressive trim + seamless loop crossfade.

Phases per file:
  1. Trim leading silence (amplitude > -40 dB), keep 100ms buffer
  2. Trim trailing fade (amplitude > -40 dB), strip 500ms extra
  3. Cut last 5s, crossfade them into the new start (seamless loop)
  4. Re-normalize LUFS (-23 main, -26 noise pack)

Usage:
    python tools/audio_normalize_v2.py \
        --input library_staging_normalized/ \
        --output library_staging_loop_v2/ [--limit N]

Requires: pyloudnorm, soundfile, numpy
"""

import argparse
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf

try:
    import pyloudnorm as pyln
except ImportError:
    print("ERROR: pip install pyloudnorm soundfile numpy")
    sys.exit(1)


# ============================================================
# Constants
# ============================================================

TARGET_LUFS_MAIN = -23.0
TARGET_LUFS_NOISE = -26.0
SILENCE_THRESHOLD_DB = -40.0
SILENCE_THRESHOLD_LIN = 10 ** (SILENCE_THRESHOLD_DB / 20.0)  # ≈ 0.01
LEADING_BUFFER_SEC = 0.100
TRAILING_STRIP_SEC = 0.500
CROSSFADE_SEC = 5.0


def is_noise_file(filepath):
    name = filepath.name.lower()
    return 'brown' in name or 'pink' in name


def _to_mono_envelope(y):
    """Return |y| collapsed across channels for threshold detection."""
    if y.ndim == 1:
        return np.abs(y)
    return np.max(np.abs(y), axis=1)


def trim_leading_silence(y, sr):
    """Phase 1 — cut everything before first sample > threshold, keep 100ms buffer."""
    env = _to_mono_envelope(y)
    above = np.where(env > SILENCE_THRESHOLD_LIN)[0]
    if len(above) == 0:
        return y, 0
    first = above[0]
    buf = int(sr * LEADING_BUFFER_SEC)
    start = max(0, first - buf)
    if start == 0:
        return y, 0
    return y[start:], start


def trim_trailing_fade(y, sr):
    """Phase 2 — cut after last sample > threshold, then strip extra 500ms."""
    env = _to_mono_envelope(y)
    above = np.where(env > SILENCE_THRESHOLD_LIN)[0]
    if len(above) == 0:
        return y, 0
    last = above[-1] + 1  # exclusive
    strip = int(sr * TRAILING_STRIP_SEC)
    end = max(1, last - strip)
    if end >= len(y):
        return y, 0
    removed = len(y) - end
    return y[:end], removed


def crossfade_loop_seam(y, sr, fade_sec=CROSSFADE_SEC):
    """
    Phase 3 — take last fade_sec, remove it, crossfade it into the first fade_sec
    of what remains. Produces a seamless loop point because the file's "end content"
    fades out exactly while the new "start content" fades in.
    """
    n = int(sr * fade_sec)
    if len(y) < n * 3:
        n = len(y) // 4
    if n < 100:
        return y

    tail = y[-n:].copy()
    body = y[:-n].copy()
    fade_in = np.linspace(0.0, 1.0, n, dtype=np.float64)
    fade_out = np.linspace(1.0, 0.0, n, dtype=np.float64)

    if body.ndim == 1:
        body[:n] = body[:n] * fade_in + tail * fade_out
    else:
        for ch in range(body.shape[1]):
            body[:n, ch] = body[:n, ch] * fade_in + tail[:, ch] * fade_out
    return body


def normalize_lufs(y, sr, target_lufs):
    meter = pyln.Meter(sr)
    current = meter.integrated_loudness(y)
    if np.isinf(current) or np.isnan(current):
        return y, current
    out = pyln.normalize.loudness(y, current, target_lufs)
    peak = np.max(np.abs(out))
    if peak > 0.99:
        out = out * (0.99 / peak)
    return out, current


def process_file(filepath, input_root, output_dir):
    info = {'file': filepath.name, 'status': 'ok'}
    try:
        y, sr = sf.read(str(filepath))
        if y.dtype != np.float64:
            y = y.astype(np.float64)
        orig_len = len(y)

        y, lead_cut = trim_leading_silence(y, sr)
        info['leading_cut_samples'] = int(lead_cut)
        info['leading_cut_sec'] = round(lead_cut / sr, 3)

        y, trail_cut = trim_trailing_fade(y, sr)
        info['trailing_cut_samples'] = int(trail_cut)
        info['trailing_cut_sec'] = round(trail_cut / sr, 3)

        if len(y) < int(sr * (CROSSFADE_SEC * 3)):
            info['warning'] = f'short after trim ({len(y)/sr:.1f}s) — crossfade scaled'

        y = crossfade_loop_seam(y, sr)

        target = TARGET_LUFS_NOISE if is_noise_file(filepath) else TARGET_LUFS_MAIN
        y, pre_lufs = normalize_lufs(y, sr, target)
        info['pre_lufs'] = round(float(pre_lufs), 2) if not (np.isinf(pre_lufs) or np.isnan(pre_lufs)) else None
        info['target_lufs'] = target
        info['final_duration_sec'] = round(len(y) / sr, 2)
        info['original_duration_sec'] = round(orig_len / sr, 2)

        rel = filepath.relative_to(input_root)
        out_path = output_dir / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(str(out_path), y, sr)
        return info
    except Exception as e:
        info['status'] = 'error'
        info['error'] = str(e)
        return info


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--limit', type=int, default=None, help='Process only first N files (sanity)')
    args = ap.parse_args()

    in_dir = Path(args.input)
    out_dir = Path(args.output)
    if not in_dir.is_dir():
        print(f"ERROR: {in_dir} not found")
        sys.exit(1)
    out_dir.mkdir(parents=True, exist_ok=True)

    wavs = sorted(in_dir.glob('**/*.wav'))
    if args.limit:
        wavs = wavs[:args.limit]
    total = len(wavs)
    print(f"AURALIS Audio Normalize V2 - {total} files")
    print("=" * 60)

    ok = err = 0
    lead_cuts = []
    trail_cuts = []
    results = []
    t0 = time.time()

    for i, fp in enumerate(wavs, 1):
        print(f"  [{i}/{total}] {fp.name}...", end=' ', flush=True)
        r = process_file(fp, in_dir, out_dir)
        results.append(r)
        if r['status'] == 'ok':
            ok += 1
            lead_cuts.append(r['leading_cut_sec'])
            trail_cuts.append(r['trailing_cut_sec'])
            print(f"OK  lead={r['leading_cut_sec']:.2f}s  trail={r['trailing_cut_sec']:.2f}s  "
                  f"dur {r['original_duration_sec']:.1f}->{r['final_duration_sec']:.1f}s")
        else:
            err += 1
            print(f"ERR: {r.get('error', '?')}")

    dt = time.time() - t0
    print("\n" + "=" * 60)
    print(f"DONE in {dt:.1f}s: {ok} OK, {err} errors")
    if lead_cuts:
        print(f"Leading silence trimmed:  mean={np.mean(lead_cuts):.2f}s  "
              f"max={np.max(lead_cuts):.2f}s  >500ms: {sum(1 for x in lead_cuts if x > 0.5)}")
    if trail_cuts:
        print(f"Trailing fade trimmed:    mean={np.mean(trail_cuts):.2f}s  "
              f"max={np.max(trail_cuts):.2f}s  >500ms: {sum(1 for x in trail_cuts if x > 0.5)}")
    print(f"Output: {out_dir}/")

    import json
    res_path = out_dir.parent / 'normalize_v2_results.json'
    with open(res_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"Report: {res_path}")


if __name__ == '__main__':
    main()
