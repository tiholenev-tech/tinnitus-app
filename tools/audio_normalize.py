#!/usr/bin/env python3
"""
AURALIS Audio Normalize — batch LUFS + loop seam fix.

Usage:
    python tools/audio_normalize.py --input library_staging_loop_ready/ \
        --output library_staging_normalized/ --report audit_report.json

Requires: pip install pyloudnorm soundfile numpy
"""

import argparse
import json
import shutil
import sys
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
TARGET_LUFS_NOISE = -26.0  # brown/pink noise = background, quieter
CROSSFADE_SEC = 3.0


def is_noise_file(filepath):
    """Check if file is from noise pack (brown/pink)."""
    name = filepath.name.lower()
    return 'brown' in name or 'pink' in name


def normalize_lufs(y, sr, target_lufs):
    """Normalize audio to target LUFS using pyloudnorm."""
    meter = pyln.Meter(sr)
    current_lufs = meter.integrated_loudness(y)
    if current_lufs == float('-inf') or np.isinf(current_lufs) or np.isnan(current_lufs):
        return y, current_lufs, target_lufs
    normalized = pyln.normalize.loudness(y, current_lufs, target_lufs)
    # Clip to prevent digital overs
    peak = np.max(np.abs(normalized))
    if peak > 0.99:
        normalized = normalized * (0.99 / peak)
    return normalized, current_lufs, target_lufs


def fix_loop_seam(y, sr, crossfade_sec=3.0):
    """Crossfade last N seconds into first N seconds for seamless loop."""
    n_samples = int(sr * crossfade_sec)
    if len(y) < n_samples * 3:
        n_samples = len(y) // 4
    if n_samples < 100:
        return y

    fade_in = np.linspace(0, 1, n_samples)
    fade_out = np.linspace(1, 0, n_samples)

    if y.ndim == 1:
        tail = y[-n_samples:].copy()
        head = y[:n_samples].copy()
        y[:n_samples] = head * fade_in + tail * fade_out
    else:
        for ch in range(y.shape[1]):
            tail = y[-n_samples:, ch].copy()
            head = y[:n_samples, ch].copy()
            y[:n_samples, ch] = head * fade_in + tail * fade_out

    return y


def process_file(filepath, output_dir, input_root, needs_normalize, needs_loop_fix):
    """Process a single audio file."""
    try:
        y, sr = sf.read(str(filepath))
        if y.dtype != np.float64:
            y = y.astype(np.float64)

        target = TARGET_LUFS_NOISE if is_noise_file(filepath) else TARGET_LUFS_MAIN
        original_lufs = None

        if needs_normalize:
            y, original_lufs, _ = normalize_lufs(y, sr, target)

        if needs_loop_fix:
            y = fix_loop_seam(y, sr, CROSSFADE_SEC)

        # Preserve directory structure
        rel_path = filepath.relative_to(input_root)
        out_path = output_dir / rel_path
        out_path.parent.mkdir(parents=True, exist_ok=True)
        sf.write(str(out_path), y, sr)

        return {
            'file': filepath.name,
            'status': 'ok',
            'normalized': needs_normalize,
            'loop_fixed': needs_loop_fix,
            'original_lufs': round(original_lufs, 1) if original_lufs and not np.isinf(original_lufs) else None,
            'target_lufs': target
        }
    except Exception as e:
        return {'file': filepath.name, 'status': 'error', 'error': str(e)}


def main():
    parser = argparse.ArgumentParser(description='AURALIS Audio Normalize')
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--report', required=True)
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    report_path = Path(args.report)

    if not input_dir.is_dir():
        print(f"ERROR: {input_dir} not found"); sys.exit(1)
    if not report_path.is_file():
        print(f"ERROR: {report_path} not found"); sys.exit(1)

    output_dir.mkdir(parents=True, exist_ok=True)

    with open(report_path, 'r', encoding='utf-8') as f:
        audit_data = json.load(f)

    file_issues = {}
    for entry in audit_data:
        fname = entry.get('file', '')
        issues = entry.get('issues', [])
        file_issues[fname] = {
            'normalize': any('LUFS' in i for i in issues),
            'loop_fix': any('Loop seam' in i for i in issues)
        }

    wav_files = sorted(input_dir.glob('**/*.wav'))
    print(f"AURALIS Audio Normalize - {len(wav_files)} files")
    print("=" * 60)

    results = []
    norm_count = 0
    loop_count = 0
    ok_count = 0
    err_count = 0

    for i, filepath in enumerate(wav_files):
        fname = filepath.name
        info = file_issues.get(fname, {'normalize': False, 'loop_fix': False})
        needs_norm = info['normalize']
        needs_loop = info['loop_fix']

        action = ""
        if needs_norm: action += "N"
        if needs_loop: action += "L"
        if not action: action = "-"

        print(f"  [{i+1}/{len(wav_files)}] [{action}] {fname}...", end=' ', flush=True)

        if not needs_norm and not needs_loop:
            rel_path = filepath.relative_to(input_dir)
            out_path = output_dir / rel_path
            out_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(str(filepath), str(out_path))
            results.append({'file': fname, 'status': 'copied'})
            ok_count += 1
            print("copied")
            continue

        result = process_file(filepath, output_dir, input_dir, needs_norm, needs_loop)
        results.append(result)

        if result['status'] == 'ok':
            ok_count += 1
            if needs_norm: norm_count += 1
            if needs_loop: loop_count += 1
            print("OK")
        else:
            err_count += 1
            print(f"ERR: {result.get('error', '?')}")

    print("\n" + "=" * 60)
    print(f"DONE: {ok_count} OK, {err_count} errors")
    print(f"  Normalized: {norm_count}")
    print(f"  Loop fixed: {loop_count}")
    print(f"  Output: {output_dir}/")

    results_path = output_dir.parent / 'normalize_results.json'
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"  Results: {results_path}")


if __name__ == '__main__':
    main()
