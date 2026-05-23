#!/usr/bin/env python3
"""
AURALIS — Copy 38 Safe+Loop Audio Files (v2 — точни имена)
===========================================================
Копира 38-те loop-friendly + safe audio файла от audio_files/
в audio_files_safe39/.

Бележка: документ казва 39, но реално Mediterranean 02 не съществува
(има само 01). Затова 38, не 39.

УПОТРЕБА:
  cd C:\\Users\\USER\\Desktop\\auralis
  python tools\\copy_safe39.py
"""

import shutil
import sys
from pathlib import Path

# Точни имена на файловете в audio_files/ (verified срещу audio_files_list.txt)
SAFE_FILES = [
    # WATER_OTHER (6)
    "ES_Ambience, Underwater, Deep, Low - Epidemic Sound.wav",
    "ES_Designed, Drone, Sub, Deep, Underwater - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Complex 05 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Complex 03 - Epidemic Sound.wav",
    "ES_Water, Underwater, Movement, Underwater Texture, Submarine, Ship, Underwater Earthquake, Heavy Deep Bubbles, Rumble - Epidemic Sound.wav",
    "ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.wav",
    # WATER_OCEAN (5 — Mediterranean 02 не съществува)
    "ES_Ambience, Urban, Black Sea, Distant Waves Roar, Condominium, Neighborhod, Black Sea, Batumi, Georgia 01 - Epidemic Sound.wav",
    "ES_Ambience, Urban, Black Sea, Distant Waves Roar, Condominium, Neighborhod, Black Sea, Batumi, Georgia 02 - Epidemic Sound.wav",
    "ES_Water, Surf, Waves, Bay, Calm Waves, Rocks, Wash, Evening, Mediterranean Sea, Selmun Bay, Malta 01 - Epidemic Sound.wav",
    "ES_Genetic Waves - Joseph Beg.wav",
    "ES_Ocean Meditation - Joseph Beg.wav",
    # WATER_RIVER (7)
    "ES_Ambience, Underwater, Gargle, River, Flow, Bubbles, Water, Telluride, USA 03 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Gargle, River, Flow, Bubbles, Water, Telluride, USA 05 - Epidemic Sound.wav",
    "ES_Ambience, Forest, Wetlands, River, Water, Wind, Ship - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Gargle, River, Flow, Bubbles, Water, Telluride, USA 02 - Epidemic Sound.wav",
    "ES_Water, Flow, River, Flow, Strong, Bubbles, Nature, Forest, Telluride - Epidemic Sound.wav",
    "ES_Water, Flow, River, Run, Flow, Valley, Bubbles, Calm, Nature, San Miguel River, Telluride - Epidemic Sound.wav",
    "ES_Water, Waterfall, Strong Flow, People, Forest, Lower Waterfall, Evening, Zenny Fall, Telluride - Epidemic Sound.wav",
    # WATER_RAIN (3)
    "ES_Ambience, Forest, Ukraine, Morning, Birds, Nature, Trees, Calm, Breeze, Wildlife - Epidemic Sound.wav",
    "ES_Ambience, Swamp, Wetland After Rain, Water Dripping, Humid, Distant Fowl - Epidemic Sound.wav",
    "ES_Rain, Concrete, City Rain, Soft, Thunder, Lightning, Residential Neighborhood 03 - Epidemic Sound.wav",
    # WIND (1)
    "ES_Wind, Gust, Winter, Snow, Cold, Nearby Movement - Epidemic Sound.wav",
    # FOREST (3)
    "ES_Ambience, Forest, Wetlands, Snowing, Droplets, Distant - Epidemic Sound.wav",
    "ES_Ambience, Forest, Wetlands, Winter, Wildlife, Birds - Epidemic Sound.wav",
    "ES_Ambience, Forest, Wetlands, Forest, Birds, Birdsong - Epidemic Sound.wav",
    # MEDITATION (10)
    "ES_Meditation Aquatic - 369.wav",
    "ES_Celestial Spheres - Ave Air.wav",
    "ES_Komorebi - Shuta Yasukochi.wav",
    "ES_Crystal Haze - Shuta Yasukochi.wav",
    "ES_Epic Mirage - Hanna Lindgren.wav",
    "ES_369 Seconds Of Bliss - 369.wav",
    "ES_Namucuo - By Lotus.wav",
    "ES_Resonance - Luba Hilman.wav",
    "ES_Field of Horses - Joseph Beg.wav",
    "ES_Silver Woodlands - Cora Zea.wav",
    # AMBIENCE (1)
    "ES_Designed, Rumble, Low, Sub, Slight Air - Epidemic Sound.wav",
    # OTHER (2)
    "ES_Lay Down with Me - Hanna Lindgren.wav",
    "ES_Opposite to Destruction - Hanna Lindgren.wav",
]


def main():
    source_dir = Path("audio_files").resolve()
    target_dir = Path("audio_files_safe39").resolve()

    if not source_dir.is_dir():
        print(f"❌ Папката {source_dir} не съществува.")
        sys.exit(1)

    target_dir.mkdir(exist_ok=True)

    print(f"📂 Source: {source_dir}")
    print(f"📂 Target: {target_dir}")
    print(f"🎵 Търся: {len(SAFE_FILES)} файла")
    print("─" * 60)

    all_files = {p.name: p for p in source_dir.rglob("*.wav")}
    print(f"📦 Намерени общо: {len(all_files)} wav файла")
    print()

    found = 0
    missing = []

    for idx, name in enumerate(SAFE_FILES, 1):
        if name in all_files:
            src = all_files[name]
            dst = target_dir / name
            if dst.exists():
                print(f"[{idx:>2}/{len(SAFE_FILES)}] ⏭  вече има: {name[:60]}...")
            else:
                shutil.copy2(src, dst)
                print(f"[{idx:>2}/{len(SAFE_FILES)}] ✅ {name[:60]}...")
            found += 1
        else:
            print(f"[{idx:>2}/{len(SAFE_FILES)}] ❌ ЛИПСВА: {name}")
            missing.append(name)

    print()
    print("═" * 60)
    print(f"✅ Копирани: {found} / {len(SAFE_FILES)}")
    if missing:
        print(f"❌ Липсват:  {len(missing)}")
        for name in missing:
            print(f"  • {name}")
    print("═" * 60)


if __name__ == "__main__":
    main()
