#!/usr/bin/env python3
"""
AURALIS — Loop-gap audit
========================
Проверява всеки .opus файл за fade-in/fade-out към тишина (което при
loop=true създава доловима пауза/спад на мястото на повтаряне).

Метод: измерва mean_volume (ffmpeg volumedetect) в три прозореца:
  • lead  = първите 0.30s
  • mid   = 1.0s от вътрешността (референция)
  • trail = последните 0.30s (-sseof)
Ако lead или trail са по-тихи от mid с > THRESH dB → има fade → loop gap.
"""
import subprocess, re, sys, os
from pathlib import Path

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('library_staging_compact')
THRESH_DB = 8.0          # колко по-тихо от mid = fade
WIN_EDGE = 0.30
WIN_MID = 1.0

vol_re = re.compile(r'mean_volume:\s*(-?\d+(?:\.\d+)?)\s*dB')

def mean_vol(args):
    cmd = ['ffmpeg', '-hide_banner', '-nostats'] + args + ['-af', 'volumedetect', '-f', 'null', '-']
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, errors='replace')
        m = vol_re.search(r.stderr or '')
        return float(m.group(1)) if m else None
    except Exception:
        return None

def dur(f):
    try:
        r = subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
                            '-of','default=nw=1:nk=1', str(f)], capture_output=True, text=True)
        return float(r.stdout.strip())
    except Exception:
        return None

files = sorted(ROOT.rglob('*.opus'))
print(f'Files: {len(files)}  | threshold: lead/trail > {THRESH_DB} dB по-тихи от mid = fade')
print('=' * 78)

gap_in = gap_out = both = clean = errors = 0
worst = []

for i, f in enumerate(files, 1):
    d = dur(f)
    if not d or d < 3:
        errors += 1
        continue
    mid_ss = max(1.0, d / 2 - WIN_MID / 2)
    lead = mean_vol(['-t', str(WIN_EDGE), '-i', str(f)])
    mid  = mean_vol(['-ss', str(mid_ss), '-t', str(WIN_MID), '-i', str(f)])
    trail= mean_vol(['-sseof', f'-{WIN_EDGE}', '-i', str(f)])
    if mid is None or lead is None or trail is None:
        errors += 1
        continue
    di = mid - lead    # >0 → lead по-тихо (fade-in)
    do = mid - trail   # >0 → trail по-тихо (fade-out)
    has_in = di > THRESH_DB
    has_out = do > THRESH_DB
    if has_in and has_out: both += 1
    elif has_in: gap_in += 1
    elif has_out: gap_out += 1
    else: clean += 1
    worst.append((max(di, do), di, do, str(f.relative_to(ROOT))))

worst.sort(reverse=True)
print(f'\nРЕЗУЛТАТ ({len(files)} файла):')
print(f'  fade В НАЧАЛОТО И КРАЯ (gap и от двете): {both}')
print(f'  само fade-in:  {gap_in}')
print(f'  само fade-out: {gap_out}')
print(f'  ЧИСТИ (без fade, seamless):            {clean}')
print(f'  грешки/пропуснати:                     {errors}')
affected = both + gap_in + gap_out
print(f'\n  ЗАСЕГНАТИ ОБЩО: {affected} / {len(files)} ({100*affected//max(1,len(files))}%)')
print('\nВСИЧКИ ЗАСЕГНАТИ (in/out спад спрямо mid, dB):')
for mx, di, do, name in worst:
    if mx > THRESH_DB:
        print(f'  in -{di:5.1f}dB  out -{do:5.1f}dB   {name}')
