#!/usr/bin/env python3
"""
AURALIS Audio Compact — batch WAV -> Opus 96 kbps encoder.

Shrinks ~7.7 GB of normalized .wav to ~120 MB of .opus for fast PWA
downloads and tolerable mobile network behavior.

Usage:
    python tools/audio_compact.py \
        --input library_staging_normalized/ \
        --output library_staging_compact/ [--limit N]

Requires: ffmpeg with libopus on PATH.
"""

import argparse
import json
import shutil
import subprocess
import sys
import time
from pathlib import Path


OPUS_BITRATE = '96k'
OPUS_SAMPLE_RATE = 48000


def check_ffmpeg():
    exe = shutil.which('ffmpeg')
    if not exe:
        print("ERROR: ffmpeg not found on PATH. Install ffmpeg (winget install Gyan.FFmpeg).")
        sys.exit(1)
    try:
        out = subprocess.run([exe, '-encoders'], capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError:
        print("ERROR: ffmpeg -encoders failed.")
        sys.exit(1)
    if 'libopus' not in out.stdout:
        print("ERROR: this ffmpeg was built without libopus. Reinstall a build that includes libopus.")
        sys.exit(1)
    return exe


def encode_one(ffmpeg, src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        ffmpeg, '-y', '-hide_banner', '-loglevel', 'error',
        '-i', str(src),
        '-c:a', 'libopus',
        '-b:a', OPUS_BITRATE,
        '-vbr', 'on',
        '-application', 'audio',
        '-ar', str(OPUS_SAMPLE_RATE),
        str(dst),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip() or 'ffmpeg failed')


def fmt_mb(n):
    return f'{n / 1024 / 1024:.2f} MB'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--limit', type=int, default=None)
    args = ap.parse_args()

    in_dir = Path(args.input)
    out_dir = Path(args.output)
    if not in_dir.is_dir():
        print(f"ERROR: {in_dir} not found")
        sys.exit(1)

    ffmpeg = check_ffmpeg()
    out_dir.mkdir(parents=True, exist_ok=True)

    wavs = sorted(in_dir.glob('**/*.wav'))
    if args.limit:
        wavs = wavs[:args.limit]
    total = len(wavs)

    print(f"AURALIS Audio Compact — {total} files -> Opus {OPUS_BITRATE}")
    print("=" * 60)

    ok = err = 0
    in_bytes = out_bytes = 0
    results = []
    t0 = time.time()

    for i, src in enumerate(wavs, 1):
        rel = src.relative_to(in_dir).with_suffix('.opus')
        dst = out_dir / rel
        src_size = src.stat().st_size
        print(f"  [{i}/{total}] {src.name[:55]}  {fmt_mb(src_size)} ->", end=' ', flush=True)

        # Resume support: skip if output already exists and is non-trivial.
        if dst.exists() and dst.stat().st_size > 1024:
            dst_size = dst.stat().st_size
            in_bytes += src_size
            out_bytes += dst_size
            ok += 1
            results.append({
                'file': src.name,
                'rel': str(rel).replace('\\', '/'),
                'status': 'skip-existing',
                'src_bytes': src_size,
                'dst_bytes': dst_size,
            })
            print(f"{fmt_mb(dst_size)}  (skip)")
            continue

        try:
            encode_one(ffmpeg, src, dst)
            dst_size = dst.stat().st_size
            ratio = 1.0 - dst_size / src_size if src_size else 0
            in_bytes += src_size
            out_bytes += dst_size
            ok += 1
            results.append({
                'file': src.name,
                'rel': str(rel).replace('\\', '/'),
                'status': 'ok',
                'src_bytes': src_size,
                'dst_bytes': dst_size,
            })
            print(f"{fmt_mb(dst_size)}  (-{ratio*100:.0f}%)")
        except Exception as e:
            err += 1
            results.append({
                'file': src.name,
                'rel': str(rel).replace('\\', '/'),
                'status': 'error',
                'error': str(e),
            })
            print(f"ERR: {e}")

    dt = time.time() - t0
    print("\n" + "=" * 60)
    print(f"DONE in {dt:.1f}s ({dt/max(total,1):.2f}s/file avg)")
    print(f"  OK: {ok}    ERR: {err}")
    if ok:
        print(f"  Input total:  {in_bytes / 1024 / 1024 / 1024:.2f} GB")
        print(f"  Output total: {out_bytes / 1024 / 1024:.1f} MB")
        print(f"  Compression: {(1 - out_bytes / in_bytes) * 100:.1f}%")
    print(f"  Output: {out_dir}/")

    report = out_dir.parent / 'compact_results.json'
    with open(report, 'w', encoding='utf-8') as f:
        json.dump({
            'codec': 'opus',
            'bitrate': OPUS_BITRATE,
            'sample_rate': OPUS_SAMPLE_RATE,
            'input_dir': str(in_dir),
            'output_dir': str(out_dir),
            'totals': {
                'files_ok': ok,
                'files_err': err,
                'input_bytes': in_bytes,
                'output_bytes': out_bytes,
                'elapsed_sec': round(dt, 1),
            },
            'results': results,
        }, f, indent=2, ensure_ascii=False)
    print(f"  Report: {report}")


if __name__ == '__main__':
    main()
