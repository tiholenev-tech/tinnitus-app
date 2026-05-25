#!/usr/bin/env python3
"""
I1.2.A: Merge AURALIS_CATEGORY_INFO_JSON.json (Opus output) → i18n/bg.json.

Source: docs/content/AURALIS_CATEGORY_INFO_JSON.json
Target: i18n/bg.json — categoryInfo.<catId>.*

Source has flat keys (`recommendedNoiseDescription`, `mixRatioReasoning`).
Target needs structured (`recommendedNoise.{type,description}`, `mixRatio.{layer1,layer2,reasoning}`).

Mix ratio numbers са midpoints на ranges в JSON content. Noise types
са inferred от content text (всичките са pink-based per Opus's research).

Запазва title + subtitle (от placeholder), сменя останалите 9 fields.
EN-side получава TODO placeholders за Phase 2 DeepL.
"""

import io
import json
import sys
from pathlib import Path

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).parent.parent.resolve()
SOURCE_JSON = REPO_ROOT / 'docs' / 'content' / 'AURALIS_CATEGORY_INFO_JSON.json'
BG_JSON = REPO_ROOT / 'i18n' / 'bg.json'
EN_JSON = REPO_ROOT / 'i18n' / 'en.json'

# Mix ratios — midpoint на ranges от source content (verified ръчно срещу JSON).
MIX_RATIOS = {
    'sleep_deep':     {'layer1': 35, 'layer2': 65},
    'falling_asleep': {'layer1': 45, 'layer2': 55},
    'relaxation':     {'layer1': 45, 'layer2': 55},
    'daily':          {'layer1': 25, 'layer2': 75},
    'anxiety':        {'layer1': 55, 'layer2': 45},
    'meditation':     {'layer1': 65, 'layer2': 35},
}

# Noise types — inferred от content (всичките са fractal pink-based).
# При категории, които ползват филтриран pink за нощно safety: pink_lp2000.
# При категории за лек дневен fill: pink_pure.
NOISE_TYPES = {
    'sleep_deep':     'pink_lp2000',
    'falling_asleep': 'pink_lp2000',
    'relaxation':     'pink_pure',
    'daily':          'pink_pure',
    'anxiety':        'pink_lp2000',
    'meditation':     'pink_pure',
}


def load_json(path: Path) -> dict:
    with path.open(encoding='utf-8') as f:
        return json.load(f)


def write_json(path: Path, data: dict):
    text = json.dumps(data, ensure_ascii=False, indent=2) + '\n'
    path.write_text(text, encoding='utf-8')


def merge_category(target_cat: dict, source_cat: dict, cat_id: str) -> dict:
    """Return новата category entry: pull definition/whenUsed/.../faq от source,
    reconstruct recommendedNoise + mixRatio структурно, запази title + subtitle."""
    out = {
        'title':    target_cat.get('title', ''),
        'subtitle': target_cat.get('subtitle', ''),
        'definition':       source_cat.get('definition', ''),
        'whenUsed':         source_cat.get('whenUsed', {}),
        'whenNotUsed':      source_cat.get('whenNotUsed', []),
        'recommendedNoise': {
            'type':        NOISE_TYPES.get(cat_id, 'pink_pure'),
            'description': source_cat.get('recommendedNoiseDescription', ''),
        },
        'mixRatio': {
            'layer1':    MIX_RATIOS.get(cat_id, {'layer1': 50})['layer1'],
            'layer2':    MIX_RATIOS.get(cat_id, {'layer2': 50})['layer2'],
            'reasoning': source_cat.get('mixRatioReasoning', ''),
        },
        'expectedEffect':   source_cat.get('expectedEffect', ''),
        'safety':           source_cat.get('safety', []),
        'faq':              source_cat.get('faq', []),
        'scientificBasis':  source_cat.get('scientificBasis', []),
    }
    return out


def main():
    src = load_json(SOURCE_JSON)
    src_cats = src.get('categoryInfo', {})
    if not src_cats:
        print('[merge] SOURCE has no categoryInfo block — abort.')
        return 1

    bg = load_json(BG_JSON)
    bg_cats = bg.setdefault('categoryInfo', {})
    en = load_json(EN_JSON)
    en_cats = en.setdefault('categoryInfo', {})

    cat_ids = ['sleep_deep', 'falling_asleep', 'relaxation', 'daily', 'anxiety', 'meditation']
    for cat_id in cat_ids:
        if cat_id not in src_cats:
            print(f'[merge] WARN: source missing "{cat_id}" — keeping placeholder')
            continue
        merged = merge_category(bg_cats.get(cat_id, {}), src_cats[cat_id], cat_id)
        bg_cats[cat_id] = merged
        print(f'[merge] {cat_id}: definition={len(merged["definition"])} chars, '
              f'faq={len(merged["faq"])} items, safety={len(merged["safety"])} bullets')

    # EN: keep title/subtitle, mark всичко останало с TODO (Phase 2 DeepL).
    for cat_id in cat_ids:
        en_existing = en_cats.get(cat_id, {})
        en_cats[cat_id] = {
            'title':    en_existing.get('title', 'TODO: ' + cat_id),
            'subtitle': en_existing.get('subtitle', 'TODO'),
            'definition': 'TODO: translate from bg',
            'whenUsed': {
                'timeOfDay': 'TODO',
                'context':   'TODO',
                'duration':  'TODO',
            },
            'whenNotUsed': ['TODO'],
            'recommendedNoise': {
                'type':        NOISE_TYPES.get(cat_id, 'pink_pure'),
                'description': 'TODO',
            },
            'mixRatio': {
                'layer1':    MIX_RATIOS[cat_id]['layer1'],
                'layer2':    MIX_RATIOS[cat_id]['layer2'],
                'reasoning': 'TODO',
            },
            'expectedEffect': 'TODO',
            'safety': ['TODO'],
            'faq': [{'q': 'TODO', 'a': 'TODO'}],
            'scientificBasis': ['TODO'],
        }

    write_json(BG_JSON, bg)
    write_json(EN_JSON, en)
    print('[merge] DONE — wrote i18n/bg.json + i18n/en.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
