#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ingest нови водопади: WAV (Downloads) → loudnorm -23 + 48k → opus + mp3,
+ manifest записи (category_audio='waterfall'). Output: tools/_wf_out/.
Usage: python tools/ingest_waterfalls.py [--limit N] [--manifest]
  без --manifest = само encode (за валидация); с --manifest = пише и в manifest.json
"""
import json, re, glob, os, subprocess, sys

HOME = os.path.expanduser('~/Downloads')
OUT = 'tools/_wf_out'
MANIFEST = 'audio/library/manifest.json'
os.makedirs(OUT, exist_ok=True)
LIMIT = None
WRITE_MANIFEST = '--manifest' in sys.argv
if '--limit' in sys.argv:
    LIMIT = int(sys.argv[sys.argv.index('--limit')+1])

def mkid(fn):
    b = os.path.basename(fn)
    b = re.sub(r'^ES[_,\s]+', '', b, flags=re.I)
    b = re.sub(r'\s*-\s*Epidemic Sound', '', b, flags=re.I)
    b = os.path.splitext(b)[0].lower()
    return re.sub(r'[^a-z0-9]+', '_', b).strip('_')

# Човешки БГ имена (водещ елемент „Водопад"), по id
NAMES = {
 'water_turbulent_river_small_waterfall': 'Малък бурен водопад',
 'water_waterfall_at_top_water_falling_into_creek_below': 'Водопад над поточето',
 'water_waterfall_creek_from_waterfall_close': 'Водопад над поток',
 'water_waterfall_distant_iceland_close': 'Исландски водопад отблизо',
 'water_waterfall_distant_iceland_high_perspective': 'Исландски водопад отвисоко',
 'water_waterfall_distant_iceland_semi_close': 'Далечен исландски водопад',
 'water_waterfall_forest_ambience_birds_chirp': 'Горски водопад с птици',
 'water_waterfall_grand_marais_minnesota': 'Водопад в Минесота',
 'water_waterfall_into_shallow_pool_forest': 'Горски водопад в плитчина',
 'water_waterfall_large': 'Голям водопад',
 'water_waterfall_large_waterfall_10_meters_constant_hum_mkh8040_4_0': 'Голям 10-метров водопад',
 'water_waterfall_loud_waterfall': 'Гръмък водопад',
 'water_waterfall_niagra_falls_distant': 'Ниагарският водопад отдалеч',
 'water_waterfall_river_creek_australia': 'Австралийски водопад над поток',
 'water_waterfall_small_birds': 'Малък водопад с птици',
 'water_waterfall_small_burbling_in_forest': 'Бълбукащ горски водопад',
 'water_waterfall_small_long_fall_flowing_trickle': 'Тънък дълъг водопад',
 'water_waterfall_strong_flow_forest_lower_waterfall_people_chatter_evening_zenny_fall_telluride': 'Силен горски водопад',
 'water_waterfall_top_deep_water_flowing_before_falling': 'Водата преди водопада',
 'water_waterfall_water_big_waterfall_little_andaman': 'Голям водопад на Андаман',
 'water_waterfall_waterfall_200m_distant_strong_flow_forest_light_wind_evening_sunset_zenny_fall_telluride': 'Далечен горски водопад',
 'water_waterfall_waterfall_medium_flow_02': 'Среден водопад',
 'water_waterfall_waterfalls_30_feet_away_pyrenees_france': 'Водопад в Пиренеите',
 'waterfall_underneath_river_splashing_loud_big': 'Под водопада',
}

m = json.load(open(MANIFEST, encoding='utf-8'))
have = set(x['id'] for x in m['sounds'])
wavs = sorted(f for f in glob.glob(HOME + '/*.wav') if 'waterfall' in f.lower())
new = [(mkid(f), f) for f in wavs if mkid(f) not in have]
if LIMIT: new = new[:LIMIT]
print('processing', len(new), 'new waterfalls')

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def dur(path):
    r = run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0', path])
    try: return round(float(r.stdout.strip()), 1)
    except: return 0

entries = []
for idx, (sid, wav) in enumerate(new, 1):
    opus = os.path.join(OUT, sid + '.opus')
    mp3 = os.path.join(OUT, sid + '.mp3')
    af = 'loudnorm=I=-23:TP=-1:LRA=11,aresample=48000'
    print('[%d/%d] %s' % (idx, len(new), sid))
    r1 = run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',wav,
              '-af',af,'-ac','2','-c:a','libopus','-b:a','96k', opus])
    r2 = run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',wav,
              '-af',af,'-ac','2','-c:a','libmp3lame','-b:a','128k', mp3])
    if r1.returncode != 0:
        print('   OPUS FAIL:', r1.stderr[:200]); continue
    if r2.returncode != 0:
        print('   MP3 FAIL:', r2.stderr[:200])
    d = dur(opus)
    osz = os.path.getsize(opus)//1024 if os.path.exists(opus) else 0
    print('   ok  %.1fs  %dKB opus' % (d, osz))
    entries.append({
        'id': sid,
        'filename': '03_river/' + sid + '.opus',
        'category_audio': 'waterfall',
        'categories_use': ['relaxation', 'sleep_deep', 'daily'],
        'duration_sec': d,
        'bg_title': NAMES.get(sid, 'Водопад'),
        'title_key': 'library.sounds.' + sid + '.title',
        'subtitle_key': 'library.sounds.' + sid + '.subtitle',
        'description_key': 'library.sounds.' + sid + '.description',
        'why_key': 'library.sounds.' + sid + '.why',
        'faq_keys': [],
        'recommended_noise': 'pink_lp4000',
        'recommended_mix_ratio': [80, 20],
        'loop': True, 'lufs': -23.0,
        'tags': ['loop', 'tinnitus_safe', 'waterfall'],
        'TH_C_score': 6.0, 'DN_S_score': 6.0, 'SS_R_score': 6.0,
        'SM_F_score': 6.0, 'HB_M_score': 6.0,
        'source_note': '[INGESTED 1.0.99: Epidemic Sound waterfall, loudnorm -23, opus+mp3]'
    })

print('\\nencoded:', len(entries), '| out:', OUT)
if WRITE_MANIFEST and entries:
    m['sounds'].extend(entries)
    m['soundCount'] = len(m['sounds'])
    json.dump(m, open(MANIFEST,'w',encoding='utf-8'), ensure_ascii=False, indent=1)
    print('manifest updated → soundCount', m['soundCount'])
else:
    print('(dry — manifest NOT written; add --manifest)')
