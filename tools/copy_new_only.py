#!/usr/bin/env python3
"""
AURALIS — Copy ONLY New Audio Files
====================================
Копира файлове от audio_files/ КОИТО НЕ СА в audio-report.csv
(т.е. свалени след първия анализ) в audio_files_new/.

После пускаш audio_check.py само върху новите.

УПОТРЕБА:
  cd C:\\Users\\USER\\Desktop\\auralis
  python tools\\copy_new_only.py
"""

import csv
import shutil
import sys
from pathlib import Path


def main():
    source_dir = Path("audio_files").resolve()
    target_dir = Path("audio_files_new").resolve()
    report_csv = Path("audio-report.csv").resolve()

    if not source_dir.is_dir():
        print(f"❌ {source_dir} не съществува.")
        sys.exit(1)

    if not report_csv.is_file():
        print(f"❌ {report_csv} не съществува.")
        print("   Това е CSV-то от първия audio_check.py run.")
        sys.exit(1)

    # Прочитам старите имена от CSV
    old_files = set()
    with report_csv.open('r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row.get('filename') or row.get('\ufefffilename')
            if name:
                old_files.add(name)

    # Списвам текущите wav файлове
    current = {p.name: p for p in source_dir.rglob("*.wav")}

    new_files = {name: path for name, path in current.items() if name not in old_files}

    print(f"📊 Стари (в audio-report.csv): {len(old_files)}")
    print(f"📊 Текущи в audio_files/:      {len(current)}")
    print(f"📊 НОВИ (за копиране):         {len(new_files)}")
    print()

    if not new_files:
        print("ℹ Няма нови файлове. Нищо за копиране.")
        sys.exit(0)

    target_dir.mkdir(exist_ok=True)
    print(f"📂 Target: {target_dir}")
    print("─" * 60)

    copied = 0
    skipped = 0
    for idx, (name, src) in enumerate(sorted(new_files.items()), 1):
        dst = target_dir / name
        if dst.exists():
            print(f"[{idx:>3}/{len(new_files)}] ⏭  {name[:60]}")
            skipped += 1
        else:
            shutil.copy2(src, dst)
            print(f"[{idx:>3}/{len(new_files)}] ✅ {name[:60]}")
            copied += 1

    print()
    print("═" * 60)
    print(f"✅ Копирани: {copied}")
    if skipped:
        print(f"⏭ Прескочени (вече има): {skipped}")
    print()
    print("СЛЕДВАЩА СТЪПКА:")
    print(f"  python tools\\audio_check.py audio_files_new")
    print("═" * 60)


if __name__ == "__main__":
    main()
