#!/usr/bin/env python3
"""
AURALIS — Merge audio_files_safe95_normalized в library_staging
================================================================
Добавя 95-те вече нормализирани файла от audio_files_safe95_normalized/
в съответните категории на library_staging/.

Тези файлове са:
  - Вече нормализирани на -23 LUFS
  - Score ≥ 70 (по дефиниция)
  - Готови за production

УПОТРЕБА:
  cd C:\\Users\\USER\\Desktop\\auralis
  python tools\\merge_safe95.py

ВАЖНО: пуска СЕ СЛЕД organize_library.py (за да съществува library_staging/)
"""

import re
import shutil
import sys
from pathlib import Path


# Категории + ключови думи (same as organize_library.py)
CATEGORIES = [
    ('01_ocean',      ['ocean', 'sea', 'wave', 'shore', 'surf', 'beach', 'tide']),
    ('02_rain',       ['rain', 'rainfall', 'drizzle', 'shower']),
    ('03_river',      ['river', 'stream', 'creek', 'brook', 'waterfall', 'cascade', 'gargle']),
    ('04_underwater', ['underwater', 'submarine', 'dive']),
    ('05_wind',       ['wind', 'breeze', 'gust', 'howling']),
    ('06_forest',     ['forest', 'leaves', 'jungle', 'wetland', 'tree', 'woods', 'meadow']),
    ('07_fire',       ['fire', 'campfire', 'fireplace', 'crackle']),
    ('08_meditation', ['meditation', 'bowl', 'gong', 'bell', 'chime', 'binaural',
                       'theta', 'om', 'mantra', 'tibetan', 'crystal',
                       'mandala', 'celestial', 'spheres']),
    ('09_noise',      ['brown_noise', 'pink_noise', 'brown_pure', 'pink_pure',
                       'brown_lowpass', 'pink_lowpass']),
    ('10_ambient',    ['ambient', 'drone', 'pad', 'space', 'rumble', 'sub',
                       'designed', 'air']),
]

FORBIDDEN = ['thunder', 'lightning', 'storm', 'hail']


def safe_filename(name):
    """Convert to clean snake_case."""
    base = Path(name).stem
    base = re.sub(r'\s*-\s*Epidemic Sound', '', base, flags=re.I)
    base = re.sub(r'\s*\(\d+\)$', '', base)
    base = re.sub(r'^ES_', '', base)
    base = re.sub(r'[\'"`,;:!?]', '', base)
    base = re.sub(r'[\s\-]+', '_', base)
    base = re.sub(r'_+', '_', base)
    base = base.strip('_').lower()
    base = re.sub(r'[^a-z0-9_]', '', base)
    if not base:
        base = 'sound'
    return base + Path(name).suffix.lower()


def categorize(filename):
    lower = filename.lower()
    for f in FORBIDDEN:
        if f in lower:
            return None
    for cat_id, kws in CATEGORIES:
        if any(kw in lower for kw in kws):
            return cat_id
    return '10_ambient'


def main():
    cwd = Path('.').resolve()
    source_dir = cwd / 'audio_files_safe95_normalized'
    staging_dir = cwd / 'library_staging'

    if not source_dir.is_dir():
        print(f'❌ {source_dir} не съществува.')
        sys.exit(1)

    if not staging_dir.is_dir():
        print(f'❌ {staging_dir} не съществува. Пусни organize_library.py първо.')
        sys.exit(1)

    # Намери .wav файлове в source
    wav_files = sorted(source_dir.rglob('*.wav'))

    print('═' * 70)
    print(f'📂 Source:  {source_dir}')
    print(f'📂 Target:  {staging_dir}')
    print(f'🎵 Файлове: {len(wav_files)}')
    print('═' * 70)
    print()

    cat_count = {cat_id: 0 for cat_id, _ in CATEGORIES}
    copied = 0
    skipped_existing = 0
    skipped_forbidden = 0

    for idx, src in enumerate(wav_files, 1):
        cat = categorize(src.name)
        if cat is None:
            print(f'[{idx:>3}/{len(wav_files)}] ⛔ FORBIDDEN: {src.name[:55]}')
            skipped_forbidden += 1
            continue

        safe_name = safe_filename(src.name)
        target_cat_dir = staging_dir / cat
        target_cat_dir.mkdir(parents=True, exist_ok=True)
        dst = target_cat_dir / safe_name

        # Collision resolve
        counter = 1
        while dst.exists():
            stem = Path(safe_name).stem
            suffix = Path(safe_name).suffix
            dst = target_cat_dir / f'{stem}_{counter:02d}{suffix}'
            counter += 1

        try:
            shutil.copy2(src, dst)
            cat_count[cat] += 1
            print(f'[{idx:>3}/{len(wav_files)}] ✅ {cat} ← {src.name[:50]}')
            copied += 1
        except Exception as e:
            print(f'[{idx:>3}/{len(wav_files)}] ❌ {e}')

    print()
    print('═' * 70)
    print('РЕЗУЛТАТ:')
    for cat_id, _ in CATEGORIES:
        if cat_count[cat_id] > 0:
            print(f'  {cat_id:18s} +{cat_count[cat_id]}')
    print(f'  ─────────────────────')
    print(f'  ✅ Копирани:     {copied}')
    print(f'  ⛔ Forbidden:    {skipped_forbidden}')
    print('═' * 70)
    print()
    print('СЛЕДВАЩА СТЪПКА:')
    print('  • Сложи 6-те noise mp3 файла в library_staging\\09_noise\\')
    print('  • НЕ е нужен prep_loop за audio_files_safe95_normalized — те са готови')
    print('  • За НОВИТЕ 110 файла → python tools\\prep_loop.py library_staging --skip-existing')


if __name__ == '__main__':
    main()
