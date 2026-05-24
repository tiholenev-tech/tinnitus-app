#!/usr/bin/env python3
"""
AURALIS Audio Normalize Tool
============================
EBU R128 двупасов loudness normalization за тинитус-безопасност.

ТАРГЕТИ (от AURALIS_BIBLE v2.1 Appendix, Част 5.4):
  - Integrated: -23 LUFS
  - True peak:  ≤ -1 dBTP
  - LRA:        < 5 LU

Защо -23 LUFS (не -14/-16 streaming standard):
  - Дълги sessions (часове)
  - Sleep mode (8 часа подред)
  - 50+ потребители със слух претоварен от тинитус
  - Тихата норма пази слуха при дълго слушане

ЗАВИСИМОСТИ:
  pip install ffmpeg-normalize
  + ffmpeg в PATH (https://ffmpeg.org/download.html)

УПОТРЕБА:
  python audio_normalize.py "C:\\Users\\USER\\Desktop\\auralis\\audio_files"
  python audio_normalize.py audio_files --dry-run        # само анализ
  python audio_normalize.py audio_files --ext .mp3       # mp3 192kbps output
  python audio_normalize.py audio_files --target-lufs -16  # custom target

OUTPUT:
  audio_files_normalized/        ← нормализирани файлове (по подразбиране)
  normalize_report_YYYYMMDD_HHMMSS.csv  ← преди/след loudness per файл

Source of truth: docs/bibles/AURALIS_BIBLE_v2_1_APPENDIX.md (Част 5.4)
"""

import argparse
import csv
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# ═══ DEFAULTS (от Bible Appendix Част 5.4) ═══
DEFAULT_TARGET_LUFS = -23.0
DEFAULT_TRUE_PEAK = -1.0
DEFAULT_LRA = 5.0
SUPPORTED_INPUT = {'.wav', '.mp3', '.flac', '.aiff', '.aif', '.m4a', '.ogg'}


# ═══ Dependency check ═══
def check_dependencies():
    """Проверяваме ffmpeg + ffmpeg-normalize в PATH."""
    missing = []
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        missing.append('ffmpeg')
    try:
        subprocess.run(['ffmpeg-normalize', '--version'], capture_output=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        missing.append('ffmpeg-normalize')

    if missing:
        print('❌ Липсват зависимости: ' + ', '.join(missing))
        print()
        if 'ffmpeg' in missing:
            print('  ffmpeg: https://ffmpeg.org/download.html')
            print('         (на Windows: добави ffmpeg.exe в PATH, после рестартирай терминала)')
        if 'ffmpeg-normalize' in missing:
            print('  ffmpeg-normalize: pip install ffmpeg-normalize')
        sys.exit(1)


# ═══ Analysis (ffmpeg loudnorm dry-run за measure) ═══
def analyze_loudness(filepath):
    """Връща dict с integrated_lufs / true_peak_db / lra_lu или None при грешка."""
    cmd = [
        'ffmpeg', '-hide_banner', '-nostats',
        '-i', str(filepath),
        '-af', 'loudnorm=print_format=json',
        '-f', 'null', '-'
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    except Exception as e:
        return None

    output = result.stderr or ''
    # ffmpeg loudnorm JSON блок е в края на stderr — взимаме последния { ... }
    matches = list(re.finditer(r'\{[^{}]*"input_i"[^{}]*\}', output, re.DOTALL))
    if not matches:
        return None
    try:
        data = json.loads(matches[-1].group(0))
        return {
            'integrated_lufs': float(data.get('input_i', 0)),
            'true_peak_db': float(data.get('input_tp', 0)),
            'lra_lu': float(data.get('input_lra', 0)),
            'threshold': float(data.get('input_thresh', 0)),
        }
    except (json.JSONDecodeError, ValueError, TypeError):
        return None


# ═══ Normalize един файл ═══
def normalize_file(input_path, output_path, target_lufs, true_peak, lra, output_ext):
    """Извиква ffmpeg-normalize. Връща (ok: bool, stderr: str)."""
    cmd = [
        'ffmpeg-normalize', str(input_path),
        '-o', str(output_path),
        '-t', str(target_lufs),
        '-tp', str(true_peak),
        '-lrt', str(lra),
        '-f',  # overwrite output
        '-q',  # quiet
    ]
    if output_ext == '.mp3':
        cmd += ['-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '44100']
    elif output_ext == '.wav':
        cmd += ['-c:a', 'pcm_s16le', '-ar', '44100']
    elif output_ext == '.flac':
        cmd += ['-c:a', 'flac', '-ar', '44100']

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
        return result.returncode == 0, (result.stderr or '')
    except Exception as e:
        return False, str(e)


# ═══ Pretty print ═══
def fmt_loudness(d):
    if d is None:
        return '—'
    return f"{d['integrated_lufs']:>6.1f} LUFS · TP {d['true_peak_db']:>5.1f} dB · LRA {d['lra_lu']:>4.1f}"


# ═══ Main ═══
def main():
    parser = argparse.ArgumentParser(
        description='AURALIS audio normalize → EBU R128 (-23 LUFS default)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('input', help='Папка с audio файлове (recursive)')
    parser.add_argument('-o', '--output', help='Output папка (default: <input>_normalized)')
    parser.add_argument('--target-lufs', type=float, default=DEFAULT_TARGET_LUFS,
                        help=f'Integrated target LUFS (default: {DEFAULT_TARGET_LUFS})')
    parser.add_argument('--true-peak', type=float, default=DEFAULT_TRUE_PEAK,
                        help=f'True peak max dBTP (default: {DEFAULT_TRUE_PEAK})')
    parser.add_argument('--lra', type=float, default=DEFAULT_LRA,
                        help=f'Loudness range max LU (default: {DEFAULT_LRA})')
    parser.add_argument('--ext', choices=['.wav', '.mp3', '.flac'], default='.wav',
                        help='Output формат (default: .wav)')
    parser.add_argument('--dry-run', action='store_true',
                        help='Само анализ преди — без convert')
    parser.add_argument('--force', action='store_true',
                        help='Презапиши output папка ако съществува')
    parser.add_argument('--skip-existing', action='store_true',
                        help='Прескачай файлове които вече съществуват в output')
    args = parser.parse_args()

    check_dependencies()

    input_dir = Path(args.input).expanduser().resolve()
    if not input_dir.is_dir():
        print(f'❌ {input_dir} не е папка.')
        sys.exit(1)

    output_dir = (
        Path(args.output).expanduser().resolve()
        if args.output
        else input_dir.parent / (input_dir.name + '_normalized')
    )

    if not args.dry_run:
        if output_dir.exists() and not args.force:
            if any(output_dir.iterdir()):
                print(f'❌ {output_dir} съществува и НЕ е празна. Употреби --force.')
                sys.exit(1)
        output_dir.mkdir(parents=True, exist_ok=True)

    audio_files = sorted([
        p for p in input_dir.rglob('*')
        if p.is_file() and p.suffix.lower() in SUPPORTED_INPUT
    ])

    if not audio_files:
        print(f'❌ Няма audio файлове в {input_dir}')
        print(f'   Поддържани формати: {", ".join(sorted(SUPPORTED_INPUT))}')
        sys.exit(1)

    print('═' * 70)
    print(f'📂 Input:   {input_dir}')
    if not args.dry_run:
        print(f'📂 Output:  {output_dir}')
    print(f'🎯 Target:  {args.target_lufs} LUFS · TP ≤ {args.true_peak} dBTP · LRA < {args.lra} LU')
    print(f'🎵 Файлове: {len(audio_files)}')
    print(f'🔧 Format:  {args.ext}')
    print(f'🧪 Mode:    {"DRY-RUN (само анализ)" if args.dry_run else "NORMALIZE"}')
    print('═' * 70)
    print()

    rows = []
    ok_count = 0
    fail_count = 0
    skip_count = 0

    for idx, in_path in enumerate(audio_files, 1):
        rel = in_path.relative_to(input_dir)
        print(f'[{idx:>3}/{len(audio_files)}] {rel}')

        before = analyze_loudness(in_path)
        if before is None:
            print(f'         ⚠ Анализ неуспешен — прескочен.')
            skip_count += 1
            rows.append({
                'file': str(rel), 'status': 'analyze_failed',
                'before_lufs': '', 'before_tp_db': '', 'before_lra': '',
                'after_lufs': '', 'after_tp_db': '', 'after_lra': '',
                'delta_lufs': '',
            })
            continue

        print(f'         Преди: {fmt_loudness(before)}')

        row = {
            'file': str(rel),
            'before_lufs': f'{before["integrated_lufs"]:.2f}',
            'before_tp_db': f'{before["true_peak_db"]:.2f}',
            'before_lra': f'{before["lra_lu"]:.2f}',
            'after_lufs': '',
            'after_tp_db': '',
            'after_lra': '',
            'delta_lufs': '',
            'status': 'analyzed' if args.dry_run else 'pending',
        }

        if not args.dry_run:
            out_path = output_dir / rel.with_suffix(args.ext)
            out_path.parent.mkdir(parents=True, exist_ok=True)

            if args.skip_existing and out_path.exists():
                print(f'         ⏭  вече нормализиран — прескочен')
                row['status'] = 'skipped_existing'
                ok_count += 1
                rows.append(row)
                print()
                continue

            success, err = normalize_file(in_path, out_path,
                                          args.target_lufs, args.true_peak, args.lra, args.ext)
            if not success:
                err_snippet = err.strip().splitlines()[-1] if err.strip() else 'unknown error'
                print(f'         ❌ Грешка: {err_snippet[:120]}')
                row['status'] = 'failed'
                fail_count += 1
            else:
                after = analyze_loudness(out_path)
                if after:
                    print(f'         След:  {fmt_loudness(after)}')
                    delta = after['integrated_lufs'] - before['integrated_lufs']
                    row.update({
                        'after_lufs': f'{after["integrated_lufs"]:.2f}',
                        'after_tp_db': f'{after["true_peak_db"]:.2f}',
                        'after_lra': f'{after["lra_lu"]:.2f}',
                        'delta_lufs': f'{delta:+.2f}',
                        'status': 'ok',
                    })
                else:
                    row['status'] = 'ok_no_verify'
                ok_count += 1

        rows.append(row)
        print()

    # ═══ CSV report ═══
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    report_dir = output_dir if not args.dry_run else input_dir.parent
    report_path = report_dir / f'normalize_report_{timestamp}.csv'

    with report_path.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print('═' * 70)
    if args.dry_run:
        print(f'🧪 DRY-RUN завършен. Анализирани: {len(rows) - skip_count} · Прескочени: {skip_count}')
    else:
        print(f'✅ ОК:      {ok_count}')
        print(f'❌ Неуспех: {fail_count}')
        print(f'⚠ Skip:    {skip_count}')
    print(f'📊 Report:  {report_path}')
    print('═' * 70)


if __name__ == '__main__':
    main()
