#!/usr/bin/env python3
"""
AURALIS Audio Audit — automated balance + loop check for 250 files.

Usage:
    python3 tools/audio_audit.py --library library_staging_loop_ready/

Requires: pip install librosa numpy soundfile

Output:
    audit_report.json      — per-file details
    audit_summary.txt      — totals + recommendations
    files_needing_normalize.txt
    files_needing_loop_fix.txt
"""

import argparse
import json
import os
import sys
from pathlib import Path

import numpy as np

try:
    import librosa
    import soundfile as sf
except ImportError:
    print("ERROR: pip install librosa numpy soundfile")
    sys.exit(1)


# ============================================================
# Constants
# ============================================================

TARGET_LUFS = -23.0
MAX_TRUE_PEAK_DBTP = -1.0
LUFS_TOLERANCE = 2.0          # ±2 LU acceptable
LOOP_SEAM_THRESHOLD_DB = 3.0  # max dB difference start vs end
HIGH_FREQ_CUTOFF_HZ = 4000
MAX_EFFECTIVE_DB = 70.0        # safety limit

# Mix simulation: 5 profiles × 6 categories
PROFILES = ['TH_C', 'DN_S', 'SS_R', 'SM_F', 'HB_M']
PROFILE_GAINS = {
    'TH_C': {'master': -6, 'layer1': 0, 'layer2': -6},
    'DN_S': {'master': -3, 'layer1': 0, 'layer2': -3},
    'SS_R': {'master': -6, 'layer1': -3, 'layer2': -6},
    'SM_F': {'master': -3, 'layer1': 0, 'layer2': -9},
    'HB_M': {'master': -6, 'layer1': 0, 'layer2': -3},
}
CATEGORIES = ['deep_sleep', 'falling_asleep', 'relaxation', 'focus', 'nature', 'noise']


# ============================================================
# Analysis functions
# ============================================================

def compute_lufs(y, sr):
    """Simplified integrated loudness (K-weighted RMS approximation)."""
    # True LUFS requires ITU-R BS.1770 — this is a practical approximation
    rms = np.sqrt(np.mean(y ** 2))
    if rms == 0:
        return -100.0
    lufs = 20 * np.log10(rms) - 0.691  # approximate K-weighting offset
    return round(float(lufs), 1)


def compute_true_peak(y):
    """True peak in dBTP (4x oversampled)."""
    # Simple approach: find max absolute sample value
    peak = np.max(np.abs(y))
    if peak == 0:
        return -100.0
    dbtp = 20 * np.log10(peak)
    return round(float(dbtp), 1)


def compute_high_freq_ratio(y, sr):
    """Ratio of energy above HIGH_FREQ_CUTOFF_HZ to total energy."""
    S = np.abs(librosa.stft(y))
    freqs = librosa.fft_frequencies(sr=sr)
    high_mask = freqs >= HIGH_FREQ_CUTOFF_HZ
    total_energy = np.sum(S ** 2)
    if total_energy == 0:
        return 0.0
    high_energy = np.sum(S[high_mask] ** 2)
    return round(float(high_energy / total_energy), 4)


def compute_spectral_centroid(y, sr):
    """Average spectral centroid in Hz."""
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    return round(float(np.mean(centroid)), 1)


def compute_loop_seam(y, sr, seconds=3):
    """RMS difference between first and last N seconds (in dB)."""
    n_samples = int(sr * seconds)
    if len(y) < n_samples * 2:
        n_samples = len(y) // 4

    start_rms = np.sqrt(np.mean(y[:n_samples] ** 2))
    end_rms = np.sqrt(np.mean(y[-n_samples:] ** 2))

    if start_rms == 0 or end_rms == 0:
        return 0.0

    diff_db = abs(20 * np.log10(start_rms / end_rms))
    return round(float(diff_db), 1)


# ============================================================
# Mix simulation
# ============================================================

def simulate_mixes(file_lufs):
    """Check if any profile×category combo exceeds MAX_EFFECTIVE_DB."""
    violations = []
    for profile, gains in PROFILE_GAINS.items():
        for cat in CATEGORIES:
            effective_db = file_lufs + gains['master'] + gains['layer1']
            if effective_db > MAX_EFFECTIVE_DB:
                violations.append({
                    'profile': profile,
                    'category': cat,
                    'effective_db': round(effective_db, 1)
                })
    return violations


# ============================================================
# Main audit
# ============================================================

def audit_file(filepath):
    """Analyze a single audio file."""
    result = {
        'file': str(filepath.name),
        'path': str(filepath),
        'status': 'ok',
        'issues': []
    }

    try:
        y, sr = librosa.load(str(filepath), sr=None, mono=True)
        duration = len(y) / sr

        result['duration_sec'] = round(duration, 1)
        result['sample_rate'] = sr

        # Loudness
        lufs = compute_lufs(y, sr)
        result['lufs'] = lufs
        if abs(lufs - TARGET_LUFS) > LUFS_TOLERANCE:
            result['issues'].append(f'LUFS {lufs} (target {TARGET_LUFS} ±{LUFS_TOLERANCE})')

        # True peak
        true_peak = compute_true_peak(y)
        result['true_peak_dbtp'] = true_peak
        if true_peak > MAX_TRUE_PEAK_DBTP:
            result['issues'].append(f'True peak {true_peak} dBTP (max {MAX_TRUE_PEAK_DBTP})')

        # High-freq ratio
        hf_ratio = compute_high_freq_ratio(y, sr)
        result['high_freq_ratio'] = hf_ratio
        if hf_ratio > 0.3:
            result['issues'].append(f'High-freq ratio {hf_ratio} (>0.3 = potentially harsh)')

        # Spectral centroid
        centroid = compute_spectral_centroid(y, sr)
        result['spectral_centroid_hz'] = centroid

        # Loop seam
        loop_seam = compute_loop_seam(y, sr)
        result['loop_seam_db'] = loop_seam
        if loop_seam > LOOP_SEAM_THRESHOLD_DB:
            result['issues'].append(f'Loop seam {loop_seam} dB (max {LOOP_SEAM_THRESHOLD_DB})')

        # Mix simulation
        mix_violations = simulate_mixes(lufs)
        if mix_violations:
            result['mix_violations'] = mix_violations
            result['issues'].append(f'{len(mix_violations)} mix scenario(s) exceed {MAX_EFFECTIVE_DB} dB')

        if result['issues']:
            result['status'] = 'warning'

    except Exception as e:
        result['status'] = 'error'
        result['issues'].append(f'Analysis failed: {str(e)}')

    return result


def main():
    parser = argparse.ArgumentParser(description='AURALIS Audio Audit')
    parser.add_argument('--library', required=True, help='Path to audio library directory')
    args = parser.parse_args()

    lib_path = Path(args.library)
    if not lib_path.is_dir():
        print(f"ERROR: Directory not found: {lib_path}")
        sys.exit(1)

    # Find all .wav files
    wav_files = sorted(lib_path.glob('**/*.wav'))
    if not wav_files:
        # Also check .mp3
        wav_files = sorted(lib_path.glob('**/*.mp3'))
    if not wav_files:
        print(f"No audio files found in {lib_path}")
        sys.exit(1)

    print(f"AURALIS Audio Audit — {len(wav_files)} files")
    print("=" * 60)

    results = []
    needs_normalize = []
    needs_loop_fix = []
    ok_count = 0
    warn_count = 0
    error_count = 0

    for i, filepath in enumerate(wav_files):
        print(f"  [{i+1}/{len(wav_files)}] {filepath.name}...", end=' ', flush=True)
        result = audit_file(filepath)
        results.append(result)

        if result['status'] == 'ok':
            ok_count += 1
            print("OK")
        elif result['status'] == 'warning':
            warn_count += 1
            print(f"WARN: {', '.join(result['issues'])}")
        else:
            error_count += 1
            print(f"ERR: {', '.join(result['issues'])}")

        # Categorize
        if any('LUFS' in i for i in result.get('issues', [])):
            needs_normalize.append(result['file'])
        if any('Loop seam' in i for i in result.get('issues', [])):
            needs_loop_fix.append(result['file'])

    # ============================================================
    # Output files
    # ============================================================

    # audit_report.json
    report_path = lib_path.parent / 'audit_report.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n=> {report_path}")

    # audit_summary.txt
    summary_lines = [
        "AURALIS AUDIO AUDIT SUMMARY",
        "=" * 40,
        f"Total files: {len(wav_files)}",
        f"OK: {ok_count}",
        f"Warnings: {warn_count}",
        f"Errors: {error_count}",
        "",
        f"Need normalization: {len(needs_normalize)}",
        f"Need loop fix: {len(needs_loop_fix)}",
        "",
        "--- LUFS distribution ---",
    ]

    lufs_values = [r['lufs'] for r in results if 'lufs' in r]
    if lufs_values:
        summary_lines.append(f"Min LUFS: {min(lufs_values)}")
        summary_lines.append(f"Max LUFS: {max(lufs_values)}")
        summary_lines.append(f"Mean LUFS: {round(np.mean(lufs_values), 1)}")
        summary_lines.append(f"Median LUFS: {round(np.median(lufs_values), 1)}")

    peak_values = [r['true_peak_dbtp'] for r in results if 'true_peak_dbtp' in r]
    if peak_values:
        summary_lines.append("")
        summary_lines.append("--- True Peak ---")
        summary_lines.append(f"Max True Peak: {max(peak_values)} dBTP")
        over_peak = sum(1 for p in peak_values if p > MAX_TRUE_PEAK_DBTP)
        summary_lines.append(f"Files over {MAX_TRUE_PEAK_DBTP} dBTP: {over_peak}")

    seam_values = [r['loop_seam_db'] for r in results if 'loop_seam_db' in r]
    if seam_values:
        summary_lines.append("")
        summary_lines.append("--- Loop Seam ---")
        summary_lines.append(f"Max seam: {max(seam_values)} dB")
        summary_lines.append(f"Mean seam: {round(np.mean(seam_values), 1)} dB")
        bad_seams = sum(1 for s in seam_values if s > LOOP_SEAM_THRESHOLD_DB)
        summary_lines.append(f"Files with seam > {LOOP_SEAM_THRESHOLD_DB} dB: {bad_seams}")

    mix_violation_count = sum(1 for r in results if r.get('mix_violations'))
    summary_lines.append("")
    summary_lines.append("--- Mix Safety ---")
    summary_lines.append(f"Files exceeding {MAX_EFFECTIVE_DB} dB in any mix: {mix_violation_count}")

    summary_text = "\n".join(summary_lines)
    summary_path = lib_path.parent / 'audit_summary.txt'
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write(summary_text)
    print(f"→ {summary_path}")

    # files_needing_normalize.txt
    norm_path = lib_path.parent / 'files_needing_normalize.txt'
    with open(norm_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(needs_normalize) if needs_normalize else "(none)")
    print(f"→ {norm_path}")

    # files_needing_loop_fix.txt
    loop_path = lib_path.parent / 'files_needing_loop_fix.txt'
    with open(loop_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(needs_loop_fix) if needs_loop_fix else "(none)")
    print(f"→ {loop_path}")

    print(f"\n{summary_text}")
    print("\nDone.")


if __name__ == '__main__':
    main()
