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
import csv
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
DEFAULT_SOURCE = REPO_ROOT / 'library_staging_normalized'
LIBRARY_DIR = REPO_ROOT / 'audio' / 'library'
MANIFEST_PATH = LIBRARY_DIR / 'manifest.json'
I18N_BG = REPO_ROOT / 'i18n' / 'bg.json'

# Opus's categorization CSV (P3 wire-up).
# Очаквана структура (header row):
#   sound_id, categories_use, recommended_noise, recommended_mix_ratio
# categories_use е comma-separated list (e.g. "sleep_deep,relaxation").
# recommended_mix_ratio е "70/30" (Layer 1 / Layer 2).
CSV_CATEGORIZATION = REPO_ROOT / 'tools' / 'auralis_library_categorization.csv'

# Valid use category ids (за CSV validation)
VALID_USE_CATEGORIES = {
    'sleep_deep', 'falling_asleep', 'relaxation',
    'daily', 'anxiety', 'meditation'
}

# Canonical noise ids (audio-engine.js NOISE_MAP + noise-picker.js NOISE_IDS use тези)
VALID_NOISES = {
    'none', 'brown_pure', 'brown_lp1000', 'brown_lp500',
    'pink_pure', 'pink_lp2000', 'pink_lp4000'
}

# CSV може да ползва verbose алиаси (Opus's спецификация) — normalize към canonical.
# Both written and canonical names are accepted без warning.
NOISE_ALIASES = {
    'brown_lowpass_1000': 'brown_lp1000',
    'brown_lowpass_500':  'brown_lp500',
    'pink_lowpass_2000':  'pink_lp2000',
    'pink_lowpass_4000':  'pink_lp4000',
    'brown_lowpass_4000': 'brown_lp1000',  # няма точно съответствие, най-близко
    'pink_lowpass_1000':  'pink_lp2000',   # няма точно съответствие, най-близко
}

# Profile codes (matchват quiz-engine.js TINNITUS_PROFILES) — за scoring columns
PROFILE_CODES = ['TH_C', 'DN_S', 'SS_R', 'SM_F', 'HB_M']


def normalize_noise(noise_id: str) -> str:
    """Map verbose CSV noise ids към canonical audio-engine ids.
    Returns canonical id или original string (caller must validate)."""
    if not noise_id:
        return ''
    nid = noise_id.strip().lower()
    return NOISE_ALIASES.get(nid, nid)

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


# ============================================================
# БГ title generation (Wave2-A)
# ============================================================
# Tokens се извличат от sound_id, премахват се generic noise / dupes,
# превеждат се чрез BG_TOKEN_MAP. Финалното заглавие е MAX 4 думи.

# Base category title — fallback ако modifier-и не са намерени.
BG_CATEGORY_BASE = {
    'ocean':      'Океан',
    'rain':       'Дъжд',
    'river':      'Река',
    'underwater': 'Под вода',
    'wind':       'Вятър',
    'forest':     'Гора',
    'fire':       'Огън',
    'meditation': 'Медитация',
    'noise':      'Фонов шум',
    'ambient':    'Атмосфера',
}

# Modifier tokens — "REPLACE" заменят base изцяло (по-конкретен noun),
# "FEATURE" се добавят преди base (характеристика на сцената).
BG_REPLACE_MODIFIERS = [
    ('waterfall',  'Водопад'),
    ('creek',      'Поток'),
    ('stream',     'Поток'),
    ('campfire',   'Огнище'),
    ('fireplace',  'Камина'),
    ('cave',       'Пещера'),
    ('tunnel',     'Тунел'),
    ('beach',      'Бряг'),
    ('seaside',    'Бряг'),
    ('shore',      'Бряг'),
    ('coast',      'Бряг'),
    ('underwater', 'Под вода'),
    ('storm',      'Буря'),
    ('thunder',    'Гръм'),
]

BG_FEATURE_MODIFIERS = [
    ('cricket',    'Щурци'),
    ('birds',      'Птици'),
    ('chirp',      'Птици'),
    ('swells',     'Вълни'),
    ('swell',      'Вълни'),
    ('waves',      'Вълни'),
    ('wave',       'Вълни'),
    ('leaves',     'Листа'),
    ('whisper',    'Шепот'),
    ('drizzle',    'Ситен'),
    ('whirring',   'Бучене'),
    ('rumble',     'Тътен'),
    ('mountain',   'Планински'),
    ('alpine',     'Алпийски'),
    ('night',      'Нощен'),
    ('morning',    'Утринен'),
    ('evening',    'Вечерен'),
    ('summer',     'Летен'),
    ('winter',     'Зимен'),
    ('crackle',    'Пукане'),
    ('crackling',  'Пукане'),
]

BG_MODIFIER_TOKENS = BG_REPLACE_MODIFIERS + BG_FEATURE_MODIFIERS

# Adjective qualifiers — поставят се най-отпред като прилагателно.
BG_ADJECTIVE_TOKENS = [
    ('distant', 'Далечен'),
    ('gentle',  'Лек'),
    ('soft',    'Лек'),
    ('light',   'Лек'),
    ('heavy',   'Силен'),
    ('strong',  'Силен'),
    ('deep',    'Дълбок'),
    ('calm',    'Спокоен'),
    ('warm',    'Топъл'),
    ('bunker',  'Подземен'),
]

# Tokens to skip напълно (не носят семантика за title).
BG_SKIP_TOKENS = {
    'ambience', 'ambient', 'sound', 'sounds', 'audio', 'noise', 'recording', 'wav',
    'mp3', 'mono', 'stereo', 'loop', 'session', 'mix', 'final',
    'from', 'inside', 'outside', 'with', 'and', 'the', 'of', 'a', 'an',
    'pass', 'by', 'people', 'man', 'woman', 'human', 'human_voice',
    'microphone', 'mic', 'distant_voice',
    # Cyrillic-irrelevant city / country tokens
    'china', 'athens', 'greece', 'tokyo', 'paris', 'london', 'bulgaria',
    'sofia', 'plovdiv', 'dalian', 'siberia', 'arctic', 'antarctic',
    # Generic numeric suffixes handled separately
}


_BG_ADJ_MAP = dict(BG_ADJECTIVE_TOKENS)
_BG_MOD_MAP = dict(BG_MODIFIER_TOKENS)


def generate_bg_title(sound_id: str, category_audio: str) -> str:
    """Generate short БГ title (max 4 думи) от sound_id + category."""
    tokens = [t for t in sound_id.split('_') if t and not t.isdigit()]
    tokens = [t for t in tokens if t not in BG_SKIP_TOKENS]
    base = BG_CATEGORY_BASE.get(category_audio, 'Звук')

    # 1. Find first adjective
    adj_word = None
    for src, bg in BG_ADJECTIVE_TOKENS:
        if src in tokens:
            adj_word = bg
            break

    # 2. Find first REPLACE modifier (по-конкретен noun → замества base)
    replace_word = None
    for src, bg in BG_REPLACE_MODIFIERS:
        if src in tokens:
            replace_word = bg
            break

    # 3. Find first FEATURE modifier (характеристика → preцeди base)
    feature_word = None
    for src, bg in BG_FEATURE_MODIFIERS:
        if src in tokens:
            feature_word = bg
            break

    parts = []
    if adj_word:
        parts.append(adj_word)
    if feature_word:
        parts.append(feature_word)
    if replace_word:
        parts.append(replace_word)
    else:
        parts.append(base)

    # Dedupe consecutive same words; truncate до 4 думи.
    out = []
    for w in parts:
        if not out or out[-1] != w:
            out.append(w)
    return ' '.join(out[:4])


def scan_library(source_dir: Path):
    """Return list of sound dicts.

    Само файлове които съществуват physically на диска влизат в manifest —
    Player findSound иначе би показал "sound not found" runtime warning."""
    if not source_dir.exists():
        return []
    sounds = []
    skipped_missing = 0
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
            # Final existence + size check (защита от truncated/empty files)
            try:
                if file_path.stat().st_size < 1024:  # под 1 KB → corrupt/empty
                    skipped_missing += 1
                    continue
            except OSError:
                skipped_missing += 1
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
                'bg_title': generate_bg_title(sound_id, cat_id),
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
    if skipped_missing:
        print(f'[scan] skipped {skipped_missing} corrupt/empty audio файла')
    return sounds


# ============================================================
# CSV categorization (Opus output → P3 wire-up)
# ============================================================

def _parse_ratio_value(raw: str):
    """Parse '0.85' → 85, '70' → 70, '70%' → 70. None if invalid."""
    if not raw:
        return None
    s = raw.strip().rstrip('%')
    try:
        v = float(s)
    except ValueError:
        return None
    if v <= 1.0:
        v = v * 100
    return int(round(v))


def load_categorization_csv(csv_path: Path) -> dict:
    """Parse Opus's categorization CSV.

    Expected columns:
      sound_id, category_audio, categories_use, recommended_noise,
      mix_ratio_layer1, mix_ratio_layer2,
      needs_review, source_note,
      TH_C_score, DN_S_score, SS_R_score, SM_F_score, HB_M_score, profile_score_note

    Backward-compat: supports единичната колона `recommended_mix_ratio` (e.g. "70/30").

    Returns dict { sound_id: { categories_use:[], recommended_noise,
                               recommended_mix_ratio:[l1,l2], profile_scores:{...},
                               needs_review, source_note } }
    """
    if not csv_path.exists():
        return {}
    parsed = {}
    skipped = 0
    try:
        with csv_path.open(encoding='utf-8', newline='') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sid = (row.get('sound_id') or '').strip()
                if not sid:
                    skipped += 1
                    continue
                # categories_use — accept comma/pipe/semicolon
                raw_cats = (row.get('categories_use') or '').strip()
                cats = []
                if raw_cats:
                    parts = re.split(r'[,|;]', raw_cats)
                    for p in parts:
                        p = p.strip().lower()
                        if not p:
                            continue
                        if p in VALID_USE_CATEGORIES:
                            cats.append(p)
                        else:
                            print(f'[csv] WARN: unknown use_category "{p}" for {sid}')

                # recommended_noise — normalize verbose → canonical
                raw_noise = (row.get('recommended_noise') or '').strip()
                noise = None
                if raw_noise:
                    norm = normalize_noise(raw_noise)
                    if norm in VALID_NOISES:
                        noise = norm
                    else:
                        print(f'[csv] WARN: unknown noise "{raw_noise}" for {sid}')

                # mix ratio — new layered columns OR legacy единична колона
                ratio = None
                l1_raw = (row.get('mix_ratio_layer1') or '').strip()
                l2_raw = (row.get('mix_ratio_layer2') or '').strip()
                if l1_raw or l2_raw:
                    l1 = _parse_ratio_value(l1_raw)
                    l2 = _parse_ratio_value(l2_raw)
                    if l1 is not None and l2 is not None and 0 <= l1 <= 100 and 0 <= l2 <= 100:
                        ratio = [l1, l2]
                    elif l1_raw or l2_raw:
                        print(f'[csv] WARN: bad mix_ratio "{l1_raw}/{l2_raw}" for {sid}')
                else:
                    raw_ratio = (row.get('recommended_mix_ratio') or '').strip()
                    if raw_ratio:
                        parts = re.split(r'[/\s,]', raw_ratio)
                        nums = [_parse_ratio_value(p) for p in parts if p.strip()]
                        nums = [n for n in nums if n is not None]
                        if len(nums) == 2 and 0 <= nums[0] <= 100 and 0 <= nums[1] <= 100:
                            ratio = nums
                        else:
                            print(f'[csv] WARN: bad mix_ratio "{raw_ratio}" for {sid}')

                # Per-profile scores (TH_C_score / DN_S_score / ...)
                scores = {}
                for code in PROFILE_CODES:
                    raw_s = (row.get(code + '_score') or '').strip()
                    if not raw_s:
                        continue
                    try:
                        scores[code] = round(float(raw_s), 2)
                    except ValueError:
                        pass

                # Review flags
                needs_review = (row.get('needs_review') or '').strip().lower() in ('true', '1', 'yes')
                source_note = (row.get('source_note') or '').strip() or None

                parsed[sid] = {
                    'categories_use': cats,
                    'recommended_noise': noise,
                    'recommended_mix_ratio': ratio,
                    'profile_scores': scores,
                    'needs_review': needs_review,
                    'source_note': source_note,
                }
    except Exception as e:
        print(f'[csv] ERROR reading {csv_path.name}: {e}')
        return {}
    if skipped:
        print(f'[csv] skipped {skipped} rows without sound_id')
    return parsed


def apply_categorization(sounds: list, cat_data: dict, verbose_missing: bool = False) -> int:
    """Merge CSV data into scanned sounds. Returns count of matched.

    Per-profile scores (TH_C_score etc.) и needs_review/source_note се
    flatten-ват в sound entry — за TopSoundsCarousel Strategy 1 (manifest scoring).

    Sounds в CSV без physical file are silently skipped (CSV не е авторитативен;
    physical library дава канонична версия).
    """
    if not cat_data:
        return 0
    matched = 0
    unmatched_csv = set(cat_data.keys())
    for s in sounds:
        if s['id'] in cat_data:
            row = cat_data[s['id']]
            if row.get('categories_use'):
                s['categories_use'] = row['categories_use']
            if row.get('recommended_noise'):
                s['recommended_noise'] = row['recommended_noise']
            if row.get('recommended_mix_ratio'):
                s['recommended_mix_ratio'] = row['recommended_mix_ratio']
            # Per-profile scoring — flatten към <code>_score keys
            scores = row.get('profile_scores') or {}
            for code, val in scores.items():
                s[code + '_score'] = val
            if row.get('needs_review'):
                s['needs_review'] = True
            if row.get('source_note'):
                s['source_note'] = row['source_note']
            unmatched_csv.discard(s['id'])
            matched += 1
    if unmatched_csv:
        # CSV може да съдържа sound_id-та които не съществуват physically — silently skip.
        # Verbose-mode за debug.
        if verbose_missing:
            print(f'[csv] {len(unmatched_csv)} CSV rows без matching physical sound (first 5):')
            for sid in sorted(unmatched_csv)[:5]:
                print(f'  - {sid}')
        else:
            print(f'[csv] skipped {len(unmatched_csv)} CSV rows без physical file '
                  f'(use --verbose-missing за list)')
    return matched


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
    parser.add_argument('--csv', type=str, default=str(CSV_CATEGORIZATION),
                        help='Categorization CSV path (default: tools/auralis_library_categorization.csv)')
    parser.add_argument('--no-csv', action='store_true',
                        help='Skip CSV categorization wire-up')
    parser.add_argument('--verbose-missing', action='store_true',
                        help='List CSV rows without matching physical sound')
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

    # P3: Apply Opus's categorization CSV (if present)
    if not args.no_csv:
        csv_path = Path(args.csv).resolve()
        if csv_path.exists():
            print(f'[csv] reading {csv_path.relative_to(REPO_ROOT) if csv_path.is_relative_to(REPO_ROOT) else csv_path}')
            cat_data = load_categorization_csv(csv_path)
            if cat_data:
                matched = apply_categorization(sounds, cat_data, verbose_missing=args.verbose_missing)
                print(f'[csv] applied categorization to {matched}/{len(sounds)} sounds '
                      f'({len(cat_data)} rows в CSV)')
            else:
                print('[csv] CSV beше четим но не извлече rows.')
        else:
            print(f'[csv] no categorization CSV at {csv_path.name} '
                  '— sounds remain без categories_use / recommended_noise '
                  '(Opus spec still pending).')

    try:
        source_label = source_dir.relative_to(REPO_ROOT).as_posix()
    except ValueError:
        source_label = str(source_dir)

    manifest = build_manifest(sounds, source_label)
    write_manifest(manifest, args.dry_run)
    print(f'[manifest] {len(sounds)} sounds available')

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
