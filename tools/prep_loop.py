#!/usr/bin/env python3
"""
AURALIS — Prep Loop-Ready Audio
================================
Подготвя audio файлове за infinity loop в приложението:

  1. Махаме тихото начало и край (silence trim)
  2. Малък fade-in (0.5 сек) — плавно стартиране
  3. Малък fade-out (1.0 сек) — плавно сливане с loop
  4. Нормализация на -23 LUFS (EBU R128)

Резултат: файл който при `loop=true` се повтаря безшумно.

УПОТРЕБА:
  cd C:\\Users\\USER\\Desktop\\auralis
  
  # За папка meditation/
  python tools\\prep_loop.py meditation
  
  # За audio_files_new_new/
  python tools\\prep_loop.py audio_files_new_new
  
  # Custom тhresholds
  python tools\\prep_loop.py meditation --silence-db -45 --fade-in 1.0

OUTPUT:
  <input>_loop_ready/  — обработените файлове
  prep_report_<timestamp>.csv  — преди/след duration + LUFS

ЗАВИСИМОСТИ:
  - ffmpeg в PATH
  - ffmpeg-normalize (pip install ffmpeg-normalize)
"""

import argparse
import csv
import json
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path

DEFAULT_SILENCE_DB = -50
DEFAULT_SILENCE_MIN_DURATION = 0.3
DEFAULT_FADE_IN = 0.5
DEFAULT_FADE_OUT = 1.0
DEFAULT_TARGET_LUFS = -23.0
MIN_USEFUL_DURATION = 10.0  # секунди — под това пропускаме
SUPPORTED_INPUT = {'.wav', '.mp3', '.flac', '.aiff', '.aif', '.m4a', '.ogg'}


def check_dependencies():
    missing = []
    for tool in ['ffmpeg', 'ffprobe', 'ffmpeg-normalize']:
        try:
            subprocess.run([tool, '-version'] if tool != 'ffmpeg-normalize' else [tool, '--version'],
                           capture_output=True, check=True)
        except (FileNotFoundError, subprocess.CalledProcessError):
            missing.append(tool)
    if missing:
        print(f'❌ Липсват: {", ".join(missing)}')
        if 'ffmpeg' in missing or 'ffprobe' in missing:
            print('   ffmpeg: https://ffmpeg.org/download.html (добави в PATH)')
        if 'ffmpeg-normalize' in missing:
            print('   pip install ffmpeg-normalize')
        sys.exit(1)


def get_duration(filepath):
    """Връща duration в секунди или None."""
    cmd = ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
           '-of', 'default=noprint_wrappers=1:nokey=1', str(filepath)]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError):
        return None


def trim_silence(input_path, output_path, silence_db, min_duration):
    """Маха silence от начало и край с reverse trick."""
    # Trim от начало: silenceremove
    # Reverse → trim от начало (=оригинален край) → reverse обратно
    af = (
        f'silenceremove=start_periods=1:start_silence={min_duration}:'
        f'start_threshold={silence_db}dB:detection=peak,'
        f'areverse,'
        f'silenceremove=start_periods=1:start_silence={min_duration}:'
        f'start_threshold={silence_db}dB:detection=peak,'
        f'areverse'
    )
    cmd = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-i', str(input_path),
        '-af', af,
        '-c:a', 'pcm_s16le',
        str(output_path)
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        return False


def apply_fades(input_path, output_path, fade_in, fade_out):
    """Прилага fade-in и fade-out."""
    duration = get_duration(input_path)
    if duration is None or duration < (fade_in + fade_out + 1):
        return False, 0
    fade_out_start = duration - fade_out
    af = (
        f'afade=t=in:st=0:d={fade_in},'
        f'afade=t=out:st={fade_out_start}:d={fade_out}'
    )
    cmd = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-i', str(input_path),
        '-af', af,
        '-c:a', 'pcm_s16le',
        str(output_path)
    ]
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        return True, duration
    except subprocess.CalledProcessError:
        return False, 0


def normalize_loudness(input_path, output_path, target_lufs):
    """ffmpeg-normalize за EBU R128."""
    cmd = [
        'ffmpeg-normalize', str(input_path),
        '-o', str(output_path),
        '-t', str(target_lufs),
        '-tp', '-1',
        '-lrt', '5',
        '-c:a', 'pcm_s16le',
        '-ar', '44100',
        '-f', '-q'
    ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        return result.returncode == 0
    except Exception:
        return False


def analyze_loudness(filepath):
    """ffmpeg loudnorm dry-run за measure."""
    cmd = ['ffmpeg', '-hide_banner', '-nostats', '-i', str(filepath),
           '-af', 'loudnorm=print_format=json', '-f', 'null', '-']
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
        output = result.stderr or ''
        matches = list(re.finditer(r'\{[^{}]*"input_i"[^{}]*\}', output, re.DOTALL))
        if not matches:
            return None
        data = json.loads(matches[-1].group(0))
        return float(data.get('input_i', 0))
    except Exception:
        return None


def main():
    parser = argparse.ArgumentParser(
        description='AURALIS prep loop-ready audio (trim silence + fade + normalize)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('input', help='Папка с audio файлове')
    parser.add_argument('-o', '--output', help='Output папка (default: <input>_loop_ready)')
    parser.add_argument('--silence-db', type=float, default=DEFAULT_SILENCE_DB,
                        help=f'Silence threshold dB (default: {DEFAULT_SILENCE_DB})')
    parser.add_argument('--silence-min', type=float, default=DEFAULT_SILENCE_MIN_DURATION,
                        help=f'Min silence duration в сек (default: {DEFAULT_SILENCE_MIN_DURATION})')
    parser.add_argument('--fade-in', type=float, default=DEFAULT_FADE_IN,
                        help=f'Fade-in duration в сек (default: {DEFAULT_FADE_IN})')
    parser.add_argument('--fade-out', type=float, default=DEFAULT_FADE_OUT,
                        help=f'Fade-out duration в сек (default: {DEFAULT_FADE_OUT})')
    parser.add_argument('--target-lufs', type=float, default=DEFAULT_TARGET_LUFS,
                        help=f'Target LUFS (default: {DEFAULT_TARGET_LUFS})')
    parser.add_argument('--force', action='store_true', help='Презапиши output')
    parser.add_argument('--skip-existing', action='store_true', help='Прескачай готови файлове')
    args = parser.parse_args()

    check_dependencies()

    input_dir = Path(args.input).expanduser().resolve()
    if not input_dir.is_dir():
        print(f'❌ {input_dir} не е папка.')
        sys.exit(1)

    output_dir = Path(args.output).expanduser().resolve() if args.output else \
                 input_dir.parent / (input_dir.name + '_loop_ready')

    if output_dir.exists() and not args.force and not args.skip_existing:
        if any(output_dir.iterdir()):
            print(f'❌ {output_dir} съществува и НЕ е празна. Употреби --force или --skip-existing.')
            sys.exit(1)
    output_dir.mkdir(parents=True, exist_ok=True)

    audio_files = sorted([p for p in input_dir.rglob('*')
                          if p.is_file() and p.suffix.lower() in SUPPORTED_INPUT])
    if not audio_files:
        print(f'❌ Няма audio файлове в {input_dir}')
        sys.exit(1)

    print('═' * 70)
    print(f'📂 Input:   {input_dir}')
    print(f'📂 Output:  {output_dir}')
    print(f'🎵 Файлове: {len(audio_files)}')
    print(f'⚙ Silence: trim < {args.silence_db} dB, min {args.silence_min}s')
    print(f'⚙ Fade:    in {args.fade_in}s · out {args.fade_out}s')
    print(f'⚙ LUFS:    {args.target_lufs} (EBU R128)')
    print('═' * 70)
    print()

    rows = []
    ok = 0
    failed = 0
    skipped_short = 0
    skipped_existing = 0

    tmp_dir = output_dir / '.tmp'
    tmp_dir.mkdir(exist_ok=True)

    for idx, src in enumerate(audio_files, 1):
        rel = src.relative_to(input_dir)
        print(f'[{idx:>3}/{len(audio_files)}] {rel.name}')

        final_out = output_dir / rel.with_suffix('.wav')
        if args.skip_existing and final_out.exists():
            print(f'         ⏭  готов')
            skipped_existing += 1
            continue

        final_out.parent.mkdir(parents=True, exist_ok=True)

        orig_duration = get_duration(src)
        orig_lufs = analyze_loudness(src)

        # Step 1: trim silence
        trimmed = tmp_dir / f'1_trimmed_{rel.name}.wav'
        if not trim_silence(src, trimmed, args.silence_db, args.silence_min):
            print(f'         ❌ Silence trim неуспешен')
            failed += 1
            continue

        trim_duration = get_duration(trimmed)
        if trim_duration is None or trim_duration < MIN_USEFUL_DURATION:
            print(f'         ⚠ След trim {trim_duration:.1f}s — твърде кратко, пропускаме')
            trimmed.unlink(missing_ok=True)
            skipped_short += 1
            continue

        # Step 2: apply fades
        faded = tmp_dir / f'2_faded_{rel.name}.wav'
        success, _ = apply_fades(trimmed, faded, args.fade_in, args.fade_out)
        trimmed.unlink(missing_ok=True)
        if not success:
            print(f'         ❌ Fade неуспешен')
            failed += 1
            continue

        # Step 3: normalize
        if not normalize_loudness(faded, final_out, args.target_lufs):
            print(f'         ❌ Normalize неуспешен')
            faded.unlink(missing_ok=True)
            failed += 1
            continue
        faded.unlink(missing_ok=True)

        final_duration = get_duration(final_out)
        final_lufs = analyze_loudness(final_out)

        delta_dur = (orig_duration or 0) - (final_duration or 0)
        print(f'         ✅ {orig_duration:.1f}s → {final_duration:.1f}s '
              f'(-{delta_dur:.1f}s silence) · '
              f'{orig_lufs:.1f} → {final_lufs:.1f} LUFS')

        rows.append({
            'file': str(rel),
            'orig_duration': f'{orig_duration:.2f}' if orig_duration else '',
            'final_duration': f'{final_duration:.2f}' if final_duration else '',
            'silence_trimmed': f'{delta_dur:.2f}',
            'orig_lufs': f'{orig_lufs:.2f}' if orig_lufs is not None else '',
            'final_lufs': f'{final_lufs:.2f}' if final_lufs is not None else '',
            'status': 'ok'
        })
        ok += 1

    # Cleanup
    try:
        tmp_dir.rmdir()
    except OSError:
        pass

    # Report
    if rows:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_path = output_dir / f'prep_report_{timestamp}.csv'
        with report_path.open('w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)

    print()
    print('═' * 70)
    print(f'✅ Готови:        {ok}')
    print(f'❌ Неуспешни:     {failed}')
    print(f'⚠ Твърде кратки: {skipped_short}')
    print(f'⏭ Вече готови:   {skipped_existing}')
    if rows:
        print(f'📊 Report: {report_path}')
    print('═' * 70)


if __name__ == '__main__':
    main()
