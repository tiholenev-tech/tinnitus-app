#!/usr/bin/env python3
"""
AURALIS Library Manifest Builder v2.0 (N5)
============================================
Scan library_staging_loop_ready/ (Тихол's source), build audio/library/manifest.json
с v2 schema (categories_audio + categories_use + noises sections).

Folder convention:
  library_staging_loop_ready/01_ocean/*.wav
  library_staging_loop_ready/02_rain/*.wav
  library_staging_loop_ready/03_river/*.wav
  library_staging_loop_ready/04_underwater/*.wav
  library_staging_loop_ready/05_wind/*.wav
  library_staging_loop_ready/06_forest/*.wav
  library_staging_loop_ready/07_fire/*.wav
  library_staging_loop_ready/08_meditation/*.wav
  library_staging_loop_ready/09_noise/*.wav
  library_staging_loop_ready/10_ambient/*.wav

Filename → sound id (lowercase snake_case).

Categories USE (6 hardcoded — placeholder, ще се обнови след content research):
  sleep_deep / falling_asleep / relaxation / daily / anxiety / meditation

Noises (7 — 1 "none" + 6 generated/file-based variants):
  brown_pure / brown_lp1000 / brown_lp500 / pink_pure / pink_lp2000 / pink_lp4000

Usage:
  python tools/build_manifest.py                # builds manifest.json
  python tools/build_manifest.py --source DIR   # override source folder
  python tools/build_manifest.py --validate     # cross-check i18n
  python tools/build_manifest.py --dry-run      # preview без write
  python tools/build_manifest.py --strict       # exit 1 при warnings
  python tools/build_manifest.py --force        # write дори при 0 sounds
"""

import argparse
import io
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# Windows: UTF-8 stdout (cp1252 чупи Cyrillic)
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass

REPO_ROOT = Path(__file__).parent.parent.resolve()
DEFAULT_SOURCE = REPO_ROOT / 'library_staging_loop_ready'
LIBRARY_DIR = REPO_ROOT / 'audio' / 'library'
MANIFEST_PATH = LIBRARY_DIR / 'manifest.json'
I18N_BG = REPO_ROOT / 'i18n' / 'bg.json'

AUDIO_EXTS = {'.wav', '.mp3', '.m4a', '.ogg', '.flac', '.aac'}
CATEGORY_FOLDER_PATTERN = re.compile(r'^\d{1,2}_(?P<id>[a-z][a-z0-9_]*)$')

# Audio categories — folder name → display metadata
CATEGORIES_AUDIO = [
    {'id': 'ocean',      'name_key': 'library.cat_audio.ocean',      'icon': 'wave'},
    {'id': 'rain',       'name_key': 'library.cat_audio.rain',       'icon': 'rain'},
    {'id': 'river',      'name_key': 'library.cat_audio.river',      'icon': 'stream'},
    {'id': 'underwater', 'name_key': 'library.cat_audio.underwater', 'icon': 'deep'},
    {'id': 'wind',       'name_key': 'library.cat_audio.wind',       'icon': 'wind'},
    {'id': 'forest',     'name_key': 'library.cat_audio.forest',     'icon': 'tree'},
    {'id': 'fire',       'name_key': 'library.cat_audio.fire',       'icon': 'fire'},
    {'id': 'meditation', 'name_key': 'library.cat_audio.meditation', 'icon': 'bowl'},
    {'id': 'noise',      'name_key': 'library.cat_audio.noise',      'icon': 'waves'},
    {'id': 'ambient',    'name_key': 'library.cat_audio.ambient',    'icon': 'drone'},
]

# Use-case categories — 6 hardcoded placeholder per Bible v3.1 §N2.
# Content team (Opus) ще ги override-не със scientific selection в RESEARCH_DRIVEN_LIBRARY_SPEC_v1.md.
CATEGORIES_USE = [
    {'id': 'sleep_deep',     'emoji': '🌙', 'name_key': 'home.cat.sleep_deep.name',     'subtitle_key': 'home.cat.sleep_deep.subtitle'},
    {'id': 'falling_asleep', 'emoji': '😴', 'name_key': 'home.cat.falling_asleep.name', 'subtitle_key': 'home.cat.falling_asleep.subtitle'},
    {'id': 'relaxation',     'emoji': '🛋', 'name_key': 'home.cat.relaxation.name',     'subtitle_key': 'home.cat.relaxation.subtitle'},
    {'id': 'daily',          'emoji': '☕', 'name_key': 'home.cat.daily.name',          'subtitle_key': 'home.cat.daily.subtitle'},
    {'id': 'anxiety',        'emoji': '🆘', 'name_key': 'home.cat.anxiety.name',        'subtitle_key': 'home.cat.anxiety.subtitle'},
    {'id': 'meditation',     'emoji': '🧘', 'name_key': 'home.cat.meditation.name',     'subtitle_key': 'home.cat.meditation.subtitle'},
]

# Noise variants (7) — IDs match NoisePicker NOISE_IDS
# filename remains None за runtime-generated; populated ако файл exists в 09_noise/
NOISES = [
    {'id': 'none',         'name_key': 'noises.none.title'},
    {'id': 'brown_pure',   'name_key': 'noises.brown_pure.title',   'gen': 'brown', 'filter': None},
    {'id': 'brown_lp1000', 'name_key': 'noises.brown_lp1000.title', 'gen': 'brown', 'filter': 1000},
    {'id': 'brown_lp500',  'name_key': 'noises.brown_lp500.title',  'gen': 'brown', 'filter': 500},
    {'id': 'pink_pure',    'name_key': 'noises.pink_pure.title',    'gen': 'pink',  'filter': None},
    {'id': 'pink_lp2000',  'name_key': 'noises.pink_lp2000.title',  'gen': 'pink',  'filter': 2000},
    {'id': 'pink_lp4000',  'name_key': 'noises.pink_lp4000.title',  'gen': 'pink',  'filter': 4000},
]

# Categories where sounds are 1-shot (long meditation, не loop)
ONE_SHOT_CATEGORIES = {'meditation'}


# ============================================================
# ffprobe duration
# ============================================================

def probe_duration(file_path: Path) -> float:
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'error',
             '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1',
             str(file_path)],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode != 0:
            return 0.0
        return round(float(result.stdout.strip()), 1)
    except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        return 0.0


# ============================================================
# Scanning
# ============================================================

def parse_category_id(folder_name: str):
    m = CATEGORY_FOLDER_PATTERN.match(folder_name)
    return m.group('id') if m else None


def filename_to_id(filename: str) -> str:
    stem = Path(filename).stem
    stem = stem.lower().replace(' ', '_').replace('-', '_')
    stem = re.sub(r'[^a-z0-9_]', '', stem)
    return stem


def scan_library(source_dir: Path):
    """Return list of sound dicts."""
    if not source_dir.exists():
        return []
    sounds = []
    for entry in sorted(source_dir.iterdir()):
        if not entry.is_dir():
            continue
        cat_id = parse_category_id(entry.name)
        if not cat_id:
            continue
        for file_path in sorted(entry.rglob('*')):
            if not file_path.is_file():
                continue
            if file_path.suffix.lower() not in AUDIO_EXTS:
                continue
            sound_id = filename_to_id(file_path.name)
            if not sound_id:
                continue
            rel = file_path.relative_to(source_dir).as_posix()
            duration = probe_duration(file_path)
            is_loop = cat_id not in ONE_SHOT_CATEGORIES
            entry_obj = {
                'id': sound_id,
                'filename': rel,
                'category_audio': cat_id,
                'categories_use': [],          # populated by content team
                'duration_sec': duration,
                'title_key': f'library.sounds.{sound_id}.title',
                'subtitle_key': f'library.sounds.{sound_id}.subtitle',
                'description_key': f'library.sounds.{sound_id}.description',
                'why_key': f'library.sounds.{sound_id}.why',
                'faq_keys': [],                # populated by content team
                'recommended_noise': None,     # populated by content team
                'recommended_mix_ratio': None, # populated by content team
                'loop': is_loop,
                'lufs': -23.0,
                'tags': ['loop' if is_loop else 'one_shot', 'tinnitus_safe'],
            }
            if cat_id == 'meditation':
                entry_obj['author_key'] = f'library.sounds.{sound_id}.author'
            sounds.append(entry_obj)
    return sounds


# ============================================================
# i18n validation
# ============================================================

def load_i18n_keys() -> set:
    if not I18N_BG.exists():
        return set()
    try:
        with I18N_BG.open(encoding='utf-8') as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        return set()
    keys = set()

    def walk(node, prefix=''):
        if isinstance(node, dict):
            for k, v in node.items():
                walk(v, f'{prefix}.{k}' if prefix else k)
        else:
            keys.add(prefix)
    walk(data)
    return keys


def validate_i18n(sounds, manifest):
    keys = load_i18n_keys()
    missing = []
    # Sound keys
    for s in sounds:
        for k_name in ['title_key', 'subtitle_key', 'description_key', 'why_key', 'author_key']:
            if k_name in s and s[k_name] not in keys:
                missing.append(s[k_name])
    # Category keys
    for cat in manifest.get('categories_audio', []):
        if cat['name_key'] not in keys:
            missing.append(cat['name_key'])
    for cat in manifest.get('categories_use', []):
        for k in ['name_key', 'subtitle_key']:
            if k in cat and cat[k] not in keys:
                missing.append(cat[k])
    # Noise keys
    for n in manifest.get('noises', []):
        if n['name_key'] not in keys:
            missing.append(n['name_key'])
    return missing


# ============================================================
# Manifest build / write
# ============================================================

def build_manifest(sounds: list, source_label: str) -> dict:
    # Count sounds per audio category (за UI display)
    used_audio_cats = set(s['category_audio'] for s in sounds)
    cats_audio = [c for c in CATEGORIES_AUDIO if c['id'] in used_audio_cats]
    # Counts per use case (placeholder = 0 докато content team не popull-не)
    cats_use = []
    for c in CATEGORIES_USE:
        count = sum(1 for s in sounds if c['id'] in s.get('categories_use', []))
        cats_use.append({**c, 'sound_count': count})
    return {
        'version': '2.0',
        'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'source': source_label,
        'soundCount': len(sounds),
        'sounds': sounds,
        'categories_audio': cats_audio,
        'categories_use': cats_use,
        'noises': NOISES,
    }


def write_manifest(manifest: dict, dry_run: bool):
    payload = json.dumps(manifest, ensure_ascii=False, indent=2) + '\n'
    if dry_run:
        print(payload)
        return
    LIBRARY_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(payload, encoding='utf-8')
    print(f'[manifest] wrote {MANIFEST_PATH.relative_to(REPO_ROOT)}')


# ============================================================
# CLI
# ============================================================

def main() -> int:
    parser = argparse.ArgumentParser(description='Build AURALIS library manifest.json v2')
    parser.add_argument('--source', type=str, default=str(DEFAULT_SOURCE),
                        help='Source folder (default: library_staging_loop_ready/)')
    parser.add_argument('--validate', action='store_true',
                        help='Cross-check i18n/bg.json для missing keys')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print to stdout без write')
    parser.add_argument('--strict', action='store_true',
                        help='Exit 1 if warnings')
    parser.add_argument('--force', action='store_true',
                        help='Write дори при 0 sounds')
    args = parser.parse_args()

    source_dir = Path(args.source).resolve()
    print(f'[scan] source: {source_dir}')

    if not source_dir.exists():
        print(f'[scan] WARNING: source directory does not exist')
        print(f'       Expected: {source_dir}')
        print(f'       Tihol places audio files in subfolders 01_ocean/ ... 10_ambient/')
        if not args.force:
            return 0

    sounds = scan_library(source_dir)
    print(f'[scan] found {len(sounds)} sounds')

    if not sounds and not args.force:
        print('[scan] No audio files found in <NN_category>/ subfolders.')
        print('       Skipping manifest write (Library falls back to manifest_template.json).')
        print('       Use --force to write empty manifest anyway.')
        return 0

    try:
        source_label = source_dir.relative_to(REPO_ROOT).as_posix()
    except ValueError:
        source_label = str(source_dir)

    manifest = build_manifest(sounds, source_label)
    write_manifest(manifest, args.dry_run)

    warnings = 0
    if args.validate:
        missing = validate_i18n(sounds, manifest)
        if missing:
            warnings += len(missing)
            print(f'\n[validate] {len(missing)} missing i18n keys in bg.json:')
            for k in sorted(set(missing))[:50]:
                print(f'  - {k}')
            if len(set(missing)) > 50:
                print(f'  ... ({len(set(missing)) - 50} more)')
            print('\nAdd these keys to i18n/bg.json under the matching namespace.')
        else:
            print('\n[validate] OK — all i18n keys exist.')

    if args.strict and warnings > 0:
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
