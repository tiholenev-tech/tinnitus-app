#!/usr/bin/env python3
"""
AURALIS — List Audio Files
==========================
Списва всички wav файлове в audio_files/ и записва списъка
в audio_files_list.txt — за да можем да сравним истинските
имена със списъка в audio-library-status.md.

УПОТРЕБА:
  cd C:\\Users\\USER\\Desktop\\auralis
  python tools\\list_audio.py
"""

from pathlib import Path
import sys


def main():
    source_dir = Path("audio_files").resolve()
    output_file = Path("audio_files_list.txt").resolve()

    if not source_dir.is_dir():
        print(f"❌ Папката {source_dir} не съществува.")
        sys.exit(1)

    wav_files = sorted([p.name for p in source_dir.rglob("*.wav")])

    if not wav_files:
        print(f"❌ Няма wav файлове в {source_dir}")
        sys.exit(1)

    with output_file.open("w", encoding="utf-8") as f:
        for name in wav_files:
            f.write(name + "\n")

    print(f"✅ Записани {len(wav_files)} имена в:")
    print(f"   {output_file}")
    print()
    print("Първи 5 имена за preview:")
    for name in wav_files[:5]:
        print(f"  • {name}")


if __name__ == "__main__":
    main()
