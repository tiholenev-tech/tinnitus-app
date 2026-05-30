#!/usr/bin/env python3
"""
AURALIS — Master Library Organizer
====================================
Систематизира ВСИЧКИ audio файлове в проекта в една чиста структура.

ВХОДНИ ДАННИ (auto-discovery):
  audio-report.csv                            (стар, 230 файла)
  audio_files_new_new/audio-report.csv        (нов, 222 файла)
  audio_files/                                (всички оригинали)
  audio_files_new_new/                        (нови оригинали)
  meditation_loop_ready/                      (45 готови meditation, fade+normalize)

ФИЛТРИРА:
  - Само score ≥ 70 (safe)
  - Само duration ≥ 60 sec (loop-friendly)
  - Meditation файлове минават директно (вече prep-нати)

ИЗХОДНА СТРУКТУРА:
  library_staging/
    01_ocean/        # морски вълни, далечни вълни
    02_rain/         # дъжд (без буря)
    03_river/        # реки, потоци, водопади
    04_underwater/   # подводни, низкочестотни
    05_wind/         # вятър без бури
    06_forest/       # горска амбиенция, листа
    07_fire/         # тихи огнища
    08_meditation/   # медитации, купи (от meditation_loop_ready)
    09_noise/        # filtered noise (brown, pink filtered)
    10_ambient/      # ambient drone, pads
  library_manifest_raw.json
  library_organize_report.csv

УПОТРЕБА:
  cd C:\\Users\\USER\\Desktop\\auralis
  python tools\\organize_library.py
  
  # Custom score / duration threshold:
  python tools\\organize_library.py --min-score 80 --min-duration 120

СЛЕДВАЩА СТЪПКА след organize:
  python tools\\prep_loop.py library_staging --skip-existing
  → ВСИЧКО на еднаква сила (-23 LUFS) + loop-ready
"""

import argparse
import csv
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

DEFAULT_MIN_SCORE = 70
DEFAULT_MIN_DURATION = 60

# Категории + ключови думи + папка номер
CATEGORIES = [
    ('01_ocean',      ['water_ocean', 'ocean', 'sea', 'wave', 'shore', 'surf', 'beach', 'tide']),
    ('02_rain',       ['water_rain', 'rain', 'rainfall', 'drizzle', 'shower']),
    ('03_river',      ['water_river', 'river', 'stream', 'creek', 'brook', 'waterfall', 'cascade', 'gargle']),
    ('04_underwater', ['water_other', 'underwater', 'submarine', 'dive']),
    ('05_wind',       ['wind', 'breeze', 'gust', 'howling']),
    ('06_forest',     ['forest', 'leaves', 'jungle', 'wetland', 'tree', 'woods', 'meadow']),
    ('07_fire',       ['fire', 'campfire', 'fireplace', 'crackle']),
    ('08_meditation', ['meditation', 'bowl', 'gong', 'bell', 'chime', 'binaural', 'delta',
                       'theta', 'om', 'mantra', 'tibetan', 'crystal', 'singing']),
    ('09_noise',      ['noise', 'pink', 'brown', 'static']),
    ('10_ambient',    ['ambient', 'drone', 'pad', 'space', 'celestial', 'ambience', 'other',
                       'mandala', 'sound']),
]

# Забранени keywords (Bible §5) — изключваме категорично
FORBIDDEN_KEYWORDS = [
    'thunder', 'lightning', 'storm', 'hail',
    'white noise',  # без filtered
    'loud', 'heavy', 'crash',
    'crackling', 'popping',
    'distortion',
]


def safe_filename(name):
    """Преобразува имена с запетаи/спец symboli в чисти snake_case."""
    base = Path(name).stem
    
    # Махаме често срещани суфикси
    base = re.sub(r'\s*-\s*Epidemic Sound', '', base, flags=re.I)
    base = re.sub(r'\s*\(1\)$', '', base)
    base = re.sub(r'\s*\(\d+\)$', '', base)
    
    # Машане на prefix-и
    base = re.sub(r'^ES_', '', base)
    base = re.sub(r'^\d+__\w+__', '', base)  # Freesound pattern: 350957__user__name
    
    # Заместване на спец chars
    base = re.sub(r'[\'"`]', '', base)
    base = re.sub(r'[,;:!?]', '', base)
    base = re.sub(r'[\s\-]+', '_', base)
    base = re.sub(r'_+', '_', base)
    base = base.strip('_').lower()
    
    # Транслитерация (само ASCII за safety)
    base = re.sub(r'[^a-z0-9_]', '', base)
    
    if not base:
        base = 'sound'
    return base + Path(name).suffix.lower()


def categorize(filename, csv_category):
    """Намира коректна категория за файл — CSV има приоритет."""
    lower = filename.lower()
    
    # Forbidden check
    for forbidden in FORBIDDEN_KEYWORDS:
        if forbidden in lower:
            return None  # Изключваме
    
    # CSV category map
    csv_map = {
        'water_ocean': '01_ocean',
        'water_rain':  '02_rain',
        'water_river': '03_river',
        'water_other': '04_underwater',
        'wind':        '05_wind',
        'forest':      '06_forest',
        'fire':        '07_fire',
        'meditation':  '08_meditation',
        'ambience':    '10_ambient',
        'other':       '10_ambient',
    }
    if csv_category and csv_category.strip() in csv_map:
        return csv_map[csv_category.strip()]
    
    # Filename categorization
    for cat_id, keywords in CATEGORIES:
        if any(kw in lower for kw in keywords):
            return cat_id
    
    return '10_ambient'  # default catch-all


def read_csv_safe(csv_path):
    """Чете CSV безопасно с BOM handling."""
    files = {}
    if not csv_path.is_file():
        return files
    with csv_path.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('filename') or row.get('\ufefffilename', '')
            if not name:
                continue
            try:
                score = int(row.get('safety_score', 0))
                duration = float(row.get('duration_sec', 0))
            except ValueError:
                continue
            files[name] = {
                'filename': name,
                'score': score,
                'duration': duration,
                'category': row.get('category', '').strip(),
                'recommendation': row.get('recommendation', '').strip(),
                'loop_friendly': row.get('loop_friendly', 'False') == 'True',
            }
    return files


def main():
    parser = argparse.ArgumentParser(
        description='AURALIS master library organizer',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument('--min-score', type=int, default=DEFAULT_MIN_SCORE,
                        help=f'Минимум safety score (default: {DEFAULT_MIN_SCORE})')
    parser.add_argument('--min-duration', type=int, default=DEFAULT_MIN_DURATION,
                        help=f'Минимум duration сек (default: {DEFAULT_MIN_DURATION})')
    parser.add_argument('--output', default='library_staging',
                        help='Output папка (default: library_staging)')
    parser.add_argument('--force', action='store_true', help='Презапиши output')
    parser.add_argument('--dry-run', action='store_true',
                        help='Само анализ, без копиране')
    args = parser.parse_args()
    
    cwd = Path('.').resolve()
    
    # Auto-discovery на входни файлове
    csv_old = cwd / 'audio-report.csv'
    csv_new = cwd / 'audio_files_new_new' / 'audio-report.csv'
    if not csv_new.is_file():
        csv_new = cwd / 'audio_files_new' / 'audio-report.csv'
    
    audio_files = cwd / 'audio_files'
    audio_files_new = cwd / 'audio_files_new_new'
    if not audio_files_new.is_dir():
        audio_files_new = cwd / 'audio_files_new'
    meditation_ready = cwd / 'meditation_loop_ready'
    
    output_dir = cwd / args.output
    
    print('═' * 70)
    print('🎵 AURALIS Master Library Organizer')
    print('═' * 70)
    print(f'📄 CSV old:   {csv_old}     → {"✓" if csv_old.is_file() else "✗"}')
    print(f'📄 CSV new:   {csv_new}     → {"✓" if csv_new.is_file() else "✗"}')
    print(f'📂 Audio old: {audio_files} → {"✓" if audio_files.is_dir() else "✗"}')
    print(f'📂 Audio new: {audio_files_new} → {"✓" if audio_files_new.is_dir() else "✗"}')
    print(f'📂 Meditation:{meditation_ready} → {"✓" if meditation_ready.is_dir() else "✗"}')
    print(f'📂 Output:    {output_dir}')
    print(f'⚙ Min score: {args.min_score}')
    print(f'⚙ Min dur:   {args.min_duration} sec')
    print('═' * 70)
    
    if not csv_old.is_file() and not csv_new.is_file():
        print('❌ Няма CSV отчети. Пусни audio_check.py първо.')
        sys.exit(1)
    
    # Output prep
    if output_dir.exists() and not args.dry_run:
        if not args.force and any(output_dir.iterdir()):
            print(f'❌ {output_dir} съществува и не е празна. Употреби --force.')
            sys.exit(1)
        if args.force:
            print(f'🗑 Изтриване на {output_dir}...')
            shutil.rmtree(output_dir)
    
    if not args.dry_run:
        for cat_id, _ in CATEGORIES:
            (output_dir / cat_id).mkdir(parents=True, exist_ok=True)
    
    # Чета двата CSV
    files_old = read_csv_safe(csv_old)
    files_new = read_csv_safe(csv_new)
    
    print(f'\n📊 Стари файлове в CSV: {len(files_old)}')
    print(f'📊 Нови файлове в CSV:  {len(files_new)}')
    
    # Индекс на физическите файлове
    physical_files = {}
    if audio_files.is_dir():
        for p in audio_files.rglob('*.wav'):
            physical_files[p.name] = p
    if audio_files_new.is_dir():
        for p in audio_files_new.rglob('*.wav'):
            physical_files.setdefault(p.name, p)
    
    print(f'📦 Физически .wav общо: {len(physical_files)}')
    
    # Build candidate list
    rows = []
    
    # 1) Стари + нови от CSV
    for source_label, files_dict in [('old', files_old), ('new', files_new)]:
        for name, info in files_dict.items():
            if info['score'] < args.min_score:
                continue
            if info['duration'] < args.min_duration:
                continue
            cat = categorize(name, info['category'])
            if cat is None:
                continue  # forbidden
            
            physical = physical_files.get(name)
            if not physical:
                rows.append({
                    'source': source_label,
                    'orig_name': name,
                    'safe_name': '',
                    'category': cat,
                    'score': info['score'],
                    'duration': info['duration'],
                    'status': 'missing_physical'
                })
                continue
            
            rows.append({
                'source': source_label,
                'orig_name': name,
                'safe_name': safe_filename(name),
                'category': cat,
                'score': info['score'],
                'duration': info['duration'],
                'status': 'pending',
                '_src_path': physical,
            })
    
    # 2) Meditation от meditation_loop_ready (вече готови)
    if meditation_ready.is_dir():
        for p in sorted(meditation_ready.rglob('*.wav')):
            rows.append({
                'source': 'meditation',
                'orig_name': p.name,
                'safe_name': safe_filename(p.name),
                'category': '08_meditation',
                'score': 100,  # assumed (already prepped)
                'duration': 0,  # unknown
                'status': 'pending',
                '_src_path': p,
            })
    
    # Дедупликация — едно safe_name на category
    seen = set()
    dedup_rows = []
    for r in rows:
        if r['status'] == 'missing_physical':
            dedup_rows.append(r)
            continue
        key = (r['category'], r['safe_name'])
        if key in seen:
            r['status'] = 'duplicate'
            dedup_rows.append(r)
            continue
        seen.add(key)
        dedup_rows.append(r)
    rows = dedup_rows
    
    # Статистика по категории
    print('\n📊 РАЗПРЕДЕЛЕНИЕ ПО КАТЕГОРИЯ (преди copy):')
    print('─' * 70)
    cat_stats = {cat_id: 0 for cat_id, _ in CATEGORIES}
    for r in rows:
        if r['status'] in ('pending', 'duplicate'):
            if r['status'] == 'pending':
                cat_stats[r['category']] = cat_stats.get(r['category'], 0) + 1
    for cat_id, _ in CATEGORIES:
        n = cat_stats[cat_id]
        bar = '█' * min(n // 2, 30)
        print(f'  {cat_id:18s} {n:>4d}  {bar}')
    print(f'  {"":18s} {"─":>4s}')
    total = sum(cat_stats.values())
    print(f'  {"ОБЩО":18s} {total:>4d}')
    
    # Копиране
    if args.dry_run:
        print('\n🧪 DRY-RUN — без копиране.')
    else:
        print(f'\n📂 Копиране в {output_dir}...')
        print('─' * 70)
        copied = 0
        failed = 0
        for r in rows:
            if r['status'] != 'pending':
                continue
            src = r['_src_path']
            dst = output_dir / r['category'] / r['safe_name']
            try:
                # При collision добавя _01, _02, etc
                counter = 1
                while dst.exists():
                    stem = Path(r['safe_name']).stem
                    suffix = Path(r['safe_name']).suffix
                    dst = output_dir / r['category'] / f'{stem}_{counter:02d}{suffix}'
                    counter += 1
                shutil.copy2(src, dst)
                r['status'] = 'ok'
                r['final_path'] = str(dst.relative_to(cwd))
                copied += 1
            except Exception as e:
                r['status'] = f'error: {str(e)[:60]}'
                failed += 1
        print(f'✅ Копирани: {copied}')
        print(f'❌ Грешки:   {failed}')
    
    # CSV report
    report_path = cwd / 'library_organize_report.csv'
    with report_path.open('w', encoding='utf-8', newline='') as f:
        fields = ['source', 'orig_name', 'safe_name', 'category', 'score', 'duration', 'status']
        if not args.dry_run:
            fields.append('final_path')
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(rows)
    
    print(f'\n📊 Report: {report_path}')
    
    # Statuses
    status_counter = {}
    for r in rows:
        status_counter[r['status']] = status_counter.get(r['status'], 0) + 1
    print('\nSTATUSES:')
    for status, n in sorted(status_counter.items(), key=lambda x: -x[1]):
        print(f'  {status:25s} {n}')
    
    print('\n' + '═' * 70)
    if not args.dry_run:
        print('СЛЕДВАЩА СТЪПКА — нормализирай ВСИЧКО на -23 LUFS:')
        print(f'  python tools\\prep_loop.py {args.output} --skip-existing')
        print('  → output ще е в: library_staging_loop_ready/')
        print()
        print('След това → копираш в audio/library/ за production.')
    print('═' * 70)


if __name__ == '__main__':
    main()
