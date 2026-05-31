#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AURALIS — APPLY element re-categorize + targeted renames (Тихол, launch).
- category_audio за всеки звук → реалния елемент (поправя river=underwater и т.н.)
- bg_title: сменя САМО проблемните (подводни, кръстени като реки → явно „под водата";
  чуждици; Атина). Добрите човешки имена се ПАЗЯТ.
- categories_audio → нова елемент-схема; ambient → „Атмосфера" (на български).
- i18n bg.json + en.json: имена на категориите.
Прави backup на manifest преди запис.
"""
import json, re
from pathlib import Path

def kws(fid): return set(re.split(r'[_\W]+', fid.lower()))
def detect(fid, folder):
    k = kws(fid); has = lambda *w: any(x in k for x in w)
    # ВАЖНО: пазим съществуващите id-та (ocean, meditation) — кодът разчита на тях
    # (no-noise арбитър = category_audio==='meditation'; player-art = 'ocean').
    # Само ДИСПЛЕЙ имената им стават „Вълни"/„Медитация".
    if has('brown','pink') and has('lowpass','pure','noise'): return 'noise'
    if folder == '08_meditation': return 'meditation'
    if folder == '10_ambient' or has('scifi','alien','drone','space','rumble','subsonic'): return 'ambient'
    if has('waterfall'): return 'waterfall'
    if has('underwater','submarine','aquarium','aquatic','propeller','sub','subsonic','submerged'): return 'underwater'
    if has('fire','fireplace','campfire'): return 'fire'
    if has('surf'): return 'ocean'
    if has('rain','raining'):
        if has('forest') and has('birds') and not has('rain','raining'): return 'forest'
        return 'rain'
    if has('forest','birdsong','wetlands','woods') and not has('wind'): return 'forest'
    if has('wind','gust','gusts','breeze','whistling'): return 'wind'
    if has('sea','ocean','beach','seaside','seafront','seashore','wave','waves','tide',
           'swell','swells','shore','coast','bay','seagulls'): return 'ocean'
    if has('river','stream','creek','brook','flow','flowing','current','trickle','gutter','rapids'): return 'river'
    fb = {'01_ocean':'waves','02_rain':'rain','03_river':'river','04_underwater':'underwater',
          '05_wind':'wind','06_forest':'forest','07_fire':'fire','08_meditation':'music',
          '09_noise':'noise','10_ambient':'ambient'}
    return fb.get(folder, 'ambient')

# Само ПРОМЕНИ (old bg_title -> ново). Останалите се пазят.
NAME_MAP = {
    # Подводни записи, кръстени като реки → да личи „под водата"
    'Тиха река': 'Тиха река под водата',
    'Бистра река': 'Бистра подводна река',
    'Спокойно течение': 'Спокойно подводно течение',
    'Кристален поток': 'Кристален подводен поток',
    'Сребриста река': 'Сребриста подводна река',
    'Прохладен поток': 'Прохладно подводно течение',
    'Светлинен поток': 'Светъл подводен поток',
    'Безмълвен поток': 'Безмълвие под водата',
    'Тих воден ход': 'Тихо подводно течение',
    'Тъмен поток': 'Тъмно подводно течение',
    'Дълбок ритъм': 'Дълбок подводен ритъм',
    'Кристална планинска вода': 'Подводна планинска вода',
    'Бистра ледникова река': 'Ледникова подводна река',
    'Аметистова река': 'Аметистови дълбини',
    'Дълбоко гърголене': 'Подводно гърголене',
    # Скрит елемент / урбан
    'Тих квартал в Атина': 'Морски бриз край Атина',
    # Чуждици в музиката → български
    'Дхарапани': 'Хималайско спокойствие',
    'Намуцуо': 'Планинско езеро',
    'Перленомайчин блясък': 'Седефен блясък',
}

# Нова елемент-схема (ред = реда на показване). ambient → „Атмосфера".
# id-тата ocean/meditation се ПАЗЯТ (код-зависимости); сменя се само дисплей името.
CATS = [
    ('ocean', 'Вълни', 'wave'),
    ('river', 'Река', 'stream'),
    ('waterfall', 'Водопад', 'stream'),
    ('underwater', 'Подводно', 'deep'),
    ('rain', 'Дъжд', 'rain'),
    ('wind', 'Вятър', 'wind'),
    ('forest', 'Гора', 'tree'),
    ('fire', 'Огън', 'fire'),
    ('meditation', 'Медитация', 'bowl'),
    ('noise', 'Шум', 'waves'),
    ('ambient', 'Атмосфера', 'drone'),
]
EN = {'ocean':'Waves','river':'River','waterfall':'Waterfall','underwater':'Underwater',
      'rain':'Rain','wind':'Wind','forest':'Forest','fire':'Fire','meditation':'Meditation',
      'noise':'Noise','ambient':'Atmosphere'}

# --- manifest ---
mp = Path('audio/library/manifest.json')
m = json.loads(mp.read_text(encoding='utf-8'))
Path('audio/library/manifest.backup.preElement.json').write_text(
    json.dumps(m, ensure_ascii=False, indent=1), encoding='utf-8')

changed = renamed = 0
for x in m['sounds']:
    folder = x['filename'].split('/')[0]
    nc = detect(x['id'], folder)
    if x.get('category_audio') != nc: changed += 1
    x['category_audio'] = nc
    old = x.get('bg_title')
    if old in NAME_MAP:
        x['bg_title'] = NAME_MAP[old]; renamed += 1

# dedup safety — ако се получат еднакви имена, добави човешки квалификатор
QUAL = ['по здрач', 'на разсъмване', 'отблизо', 'в далечината', 'привечер', 'нощем', 'призори']
seen = {}
for x in m['sounds']:
    t = x.get('bg_title') or ''
    if t in seen:
        seen[t] += 1
        x['bg_title'] = t + ' ' + QUAL[(seen[t]-2) % len(QUAL)]
    else:
        seen[t] = 1

m['categories_audio'] = [{'id': i, 'name_key': 'library.cat_audio.' + i, 'icon': ic} for i, nm, ic in CATS]
mp.write_text(json.dumps(m, ensure_ascii=False, indent=1), encoding='utf-8')

# --- i18n ---
for path, table in (('i18n/bg.json', {i: nm for i, nm, ic in CATS}),
                    ('i18n/en.json', EN)):
    p = Path(path)
    if not p.exists(): continue
    j = json.loads(p.read_text(encoding='utf-8'))
    ca = j.setdefault('ui', {}).setdefault('library', {}).setdefault('cat_audio', {})
    for k, v in table.items(): ca[k] = v
    p.write_text(json.dumps(j, ensure_ascii=False, indent=1), encoding='utf-8')

from collections import Counter
dist = Counter(x['category_audio'] for x in m['sounds'])
print('category changes:', changed, '| renamed:', renamed)
print('distribution:', dict(dist))
