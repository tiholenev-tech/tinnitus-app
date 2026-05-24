#!/usr/bin/env python3
"""
AURALIS Library Manifest Builder
=================================
Scan audio/library/ recursive, generate audio/library/manifest.json.

Folder convention:
  audio/library/01_ocean/...    -> category "ocean"
  audio/library/02_rain/...     -> category "rain"
  audio/library/03_river/...    -> category "river"
  audio/library/04_underwater/  -> category "underwater"
  audio/library/05_wind/        -> category "wind"
  audio/library/06_forest/      -> category "forest"
  audio/library/07_fire/        -> category "fire"
  audio/library/08_meditation/  -> category "meditation"
  audio/library/09_noise/       -> category "noise"
  audio/library/10_ambient/     -> category "ambient"

File naming convention:
  ocean_distant_01.wav       -> id "ocean_distant_01"
  rain_soft_forest_02.mp3    -> id "rain_soft_forest_02"

Output: audio/library/manifest.json

Usage:
  python tools/build_manifest.py                # builds manifest.json
  python tools/build_manifest.py --validate     # cross-check i18n
  python tools/build_manifest.py --dry-run      # preview without writing
  python tools/build_manifest.py --strict       # fail on any warning

Requires: ffprobe (part of ffmpeg). Falls back to 0 if missing.
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

# Windows console: force UTF-8 stdout/stderr (cp1252 чупи Cyrillic)
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass

REPO_ROOT = Path(__file__).parent.parent.resolve()
LIBRARY_DIR = REPO_ROOT / 'audio' / 'library'
MANIFEST_PATH = LIBRARY_DIR / 'manifest.json'
I18N_BG = REPO_ROOT / 'i18n' / 'bg.json'

AUDIO_EXTS = {'.wav', '.mp3', '.m4a', '.ogg', '.flac', '.aac'}

# Folder prefix → category id (e.g. "01_ocean" → "ocean")
CATEGORY_FOLDER_PATTERN = re.compile(r'^\d{1,2}_(?P<id>[a-z][a-z0-9_]*)$')

CATEGORY_ICON_MAP = {
    'ocean': 'wave',
    'rain': 'rain',
    'river': 'stream',
    'underwater': 'deep',
    'wind': 'wind',
    'forest': 'tree',
    'fire': 'fire',
    'meditation': 'bowl',
    'noise': 'waves',
    'ambient': 'drone',
}

# Categories where loop=false (long-form)
ONE_SHOT_CATEGORIES = {'meditation'}


# ============================================================
# ffprobe
# ============================================================

def probe_duration(file_path: Path) -> int:
    """Return duration in seconds (int) или 0 ако ffprobe липсва/fail-не."""
    try:
        result = subprocess.run(
            ['ffprobe', '-v', 'error',
             '-show_entries', 'format=duration',
             '-of', 'default=noprint_wrappers=1:nokey=1',
             str(file_path)],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode != 0:
            return 0
        return int(round(float(result.stdout.strip())))
    except (FileNotFoundError, subprocess.TimeoutExpired, ValueError):
        return 0


# ============================================================
# Scanning
# ============================================================

def parse_category_id(folder_name: str) -> str | None:
    """01_ocean → 'ocean'; non-matching folder → None."""
    m = CATEGORY_FOLDER_PATTERN.match(folder_name)
    return m.group('id') if m else None


def filename_to_id(filename: str) -> str:
    """ocean_distant_01.wav → 'ocean_distant_01'. Lowercase, snake_case."""
    stem = Path(filename).stem
    # Normalize: lowercase, replace spaces/dashes with underscore, strip non-alnum_
    stem = stem.lower().replace(' ', '_').replace('-', '_')
    stem = re.sub(r'[^a-z0-9_]', '', stem)
    return stem


def scan_library() -> tuple[list[dict], list[dict]]:
    """Return (sounds, categories) lists."""
    if not LIBRARY_DIR.exists():
        return [], []

    sounds = []
    categories = []
    seen_category_ids = set()

    # Discover top-level category folders
    for entry in sorted(LIBRARY_DIR.iterdir()):
        if not entry.is_dir():
            continue
        cat_id = parse_category_id(entry.name)
        if not cat_id:
            continue

        if cat_id not in seen_category_ids:
            categories.append({
                'id': cat_id,
                'name_key': f'library.cat.{cat_id}',
                'icon': CATEGORY_ICON_MAP.get(cat_id, 'waves'),
            })
            seen_category_ids.add(cat_id)

        # Scan files in this category folder (recursive)
        for file_path in sorted(entry.rglob('*')):
            if not file_path.is_file():
                continue
            if file_path.suffix.lower() not in AUDIO_EXTS:
                continue

            sound_id = filename_to_id(file_path.name)
            if not sound_id:
                continue

            rel_filename = file_path.relative_to(LIBRARY_DIR).as_posix()
            duration = probe_duration(file_path)
            is_loop = cat_id not in ONE_SHOT_CATEGORIES

            entry_obj = {
                'id': sound_id,
                'filename': rel_filename,
                'title_key': f'library.sounds.{sound_id}.title',
                'subtitle_key': f'library.sounds.{sound_id}.subtitle',
                'category': cat_id,
                'duration_sec': duration,
                'lufs': -23.0,
                'loop': is_loop,
                'tags': [
                    'loop' if is_loop else 'one_shot',
                    'tinnitus_safe',
                ],
            }
            # Meditation gets author_key by convention
            if cat_id == 'meditation':
                entry_obj['author_key'] = f'library.sounds.{sound_id}.author'

            sounds.append(entry_obj)

    return sounds, categories


# ============================================================
# i18n validation
# ============================================================

def load_i18n_keys() -> set[str]:
    """Flatten i18n/bg.json keys → set of dot-paths."""
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
        elif isinstance(node, list):
            keys.add(prefix)
        else:
            keys.add(prefix)

    walk(data)
    return keys


def validate_i18n(sounds: list[dict], categories: list[dict]) -> list[str]:
    """Return list of missing i18n key paths."""
    keys = load_i18n_keys()
    missing = []

    for cat in categories:
        if cat['name_key'] not in keys:
            missing.append(cat['name_key'])

    for s in sounds:
        for keyname in ['title_key', 'subtitle_key', 'author_key']:
            if keyname not in s:
                continue
            if s[keyname] not in keys:
                missing.append(s[keyname])

    return missing


# ============================================================
# Manifest write
# ============================================================

def build_manifest(sounds: list[dict], categories: list[dict]) -> dict:
    return {
        'version': '1.0',
        'generated': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'soundCount': len(sounds),
        'categoryCount': len(categories),
        'sounds': sounds,
        'categories': categories,
    }


def write_manifest(manifest: dict, dry_run: bool) -> None:
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
    parser = argparse.ArgumentParser(description='Build AURALIS library manifest.json')
    parser.add_argument('--validate', action='store_true',
                        help='Check that i18n/bg.json has entries for all sounds/categories')
    parser.add_argument('--dry-run', action='store_true',
                        help='Print manifest to stdout, do not write file')
    parser.add_argument('--strict', action='store_true',
                        help='Exit code 1 if warnings exist (missing i18n etc.)')
    parser.add_argument('--force', action='store_true',
                        help='Write manifest even if 0 sounds found')
    args = parser.parse_args()

    sounds, categories = scan_library()
    print(f'[scan] found {len(sounds)} sounds in {len(categories)} categories')

    if not sounds and not args.force:
        print('[scan] WARNING: no audio files found in audio/library/<NN_category>/')
        print('       Expected structure: audio/library/01_ocean/, 02_rain/, etc.')
        print('       Skipping manifest write (Library will fall back to manifest_template.json).')
        print('       Use --force to write an empty manifest anyway.')
        return 0

    manifest = build_manifest(sounds, categories)
    write_manifest(manifest, args.dry_run)

    warnings = 0

    if args.validate:
        missing = validate_i18n(sounds, categories)
        if missing:
            warnings += len(missing)
            print(f'\n[validate] {len(missing)} missing i18n keys in bg.json:')
            for k in missing:
                print(f'  - {k}')
            print('\nAdd these keys to i18n/bg.json under the matching namespace.')
        else:
            print('\n[validate] OK — all i18n keys exist.')

    if args.strict and warnings > 0:
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
