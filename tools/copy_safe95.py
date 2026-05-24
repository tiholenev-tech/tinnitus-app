#!/usr/bin/env python3
"""
AURALIS — Copy 95 Safe Audio Files (score ≥70)
================================================
Копира 95-те safe файла (score ≥70) от audio_files/
в audio_files_safe95/ — за нормализация и library.

Source of truth: audio-report.csv (safety_score >= 70)

УПОТРЕБА:
  cd C:\\Users\\USER\\Desktop\\auralis
  python tools\\copy_safe95.py
"""

import shutil
import sys
from pathlib import Path

SAFE_95 = [
    "ES_369 Seconds Of Bliss - 369.wav",
    "ES_Ambience, Air, Inside Bunker, Sea Ambience From Outside 02 - Epidemic Sound.wav",
    "ES_Ambience, Forest, Ukraine, Morning, Birds, Nature, Trees, Calm, Breeze, Wildlife - Epidemic Sound.wav",
    "ES_Ambience, Forest, Wetlands, Forest, Birds, Birdsong - Epidemic Sound.wav",
    "ES_Ambience, Forest, Wetlands, River, Water, Wind, Ship - Epidemic Sound.wav",
    "ES_Ambience, Forest, Wetlands, Snowing, Droplets, Distant - Epidemic Sound.wav",
    "ES_Ambience, Forest, Wetlands, Winter, Wildlife, Birds - Epidemic Sound.wav",
    "ES_Ambience, Forest, Winter, Calm, Light Wind, Oslo, Ostmarka 01 - Epidemic Sound.wav",
    "ES_Ambience, Forest, Winter, Calm, Light Wind, Single Bird, Distant, Oslo, Ostmarka 01 - Epidemic Sound.wav",
    "ES_Ambience, Nautical, Wetlands, Distant Factory Birds 01 - Epidemic Sound.wav",
    "ES_Ambience, Residential, Abandoned Building, Gentle Wind, Distant Boat Engine, Distant Traffic, People Pass By, Helicopter, Distant Sea, Athens, Greece - Epidemic Sound.wav",
    "ES_Ambience, Seaside, Bungalow, Koh Lipe, Balcony, Koh Lipe, Thailand - Epidemic Sound.wav",
    "ES_Ambience, Seaside, Dalian Beach, Waves, People Footsteps, Distant Boats, China - Epidemic Sound.wav",
    "ES_Ambience, Swamp, Wetland After Rain, Water Dripping, Humid, Distant Fowl - Epidemic Sound.wav",
    "ES_Ambience, Tropical, Water Source, Palm Leaves, Wind, Soothing - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Complex 01 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Complex 03 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Complex 05 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Deep, Low - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Gargle, River, Flow, Bubbles, Water, Telluride, USA 02 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Gargle, River, Flow, Bubbles, Water, Telluride, USA 03 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Gargle, River, Flow, Bubbles, Water, Telluride, USA 05 - Epidemic Sound.wav",
    "ES_Ambience, Underwater, Submarine Underwater - Epidemic Sound.wav",
    "ES_Ambience, Urban, Black Sea, Distant Waves Roar, Condominium, Neighborhod, Black Sea, Batumi, Georgia 01 - Epidemic Sound.wav",
    "ES_Ambience, Urban, Black Sea, Distant Waves Roar, Condominium, Neighborhod, Black Sea, Batumi, Georgia 02 - Epidemic Sound.wav",
    "ES_Angelica (Instrumental Version) - David Edward.wav",
    "ES_Celestial Spheres - Ave Air.wav",
    "ES_Crystal Haze - Shuta Yasukochi.wav",
    "ES_Designed, Drone, Atmospheric Space Drone, Tonal, Rumble - Epidemic Sound.wav",
    "ES_Designed, Drone, Deep Bass - Epidemic Sound.wav",
    "ES_Designed, Drone, Sub, Deep, Underwater - Epidemic Sound.wav",
    "ES_Designed, Rumble, Drone, Bass, Pulse, Low Rumble 01 - Epidemic Sound.wav",
    "ES_Designed, Rumble, Drone, Bass, Pulse, Low Rumble 02 - Epidemic Sound.wav",
    "ES_Designed, Rumble, Drone, Bass, Pulse, Low Rumble 03 - Epidemic Sound.wav",
    "ES_Designed, Rumble, Low Sub Bass, Moving Slowly - Epidemic Sound.wav",
    "ES_Designed, Rumble, Low, Sub, Slight Air - Epidemic Sound.wav",
    "ES_Dharapani - DEX 1200.wav",
    "ES_Epic Mirage - Hanna Lindgren.wav",
    "ES_Field of Horses - Joseph Beg.wav",
    "ES_Fire, Burning, Fireplace, Glass Front, Wood Burning Intense - Epidemic Sound.wav",
    "ES_Fire, Burning, Fireplace, Glass Front, Wood Burning Medium - Epidemic Sound (1).wav",
    "ES_Fire, Burning, Fireplace, Glass Front, Wood Burning Medium - Epidemic Sound.wav",
    "ES_Genetic Waves - Joseph Beg.wav",
    "ES_Komorebi - Shuta Yasukochi.wav",
    "ES_Lay Down with Me - Hanna Lindgren.wav",
    "ES_Meditation Aquatic - 369.wav",
    "ES_Namucuo - By Lotus.wav",
    "ES_Ocean Meditation - Joseph Beg.wav",
    "ES_Opposite to Destruction - Hanna Lindgren.wav",
    "ES_Rain, Concrete, City Rain, Soft, Thunder, Lightning, Residential Neighborhood 03 - Epidemic Sound.wav",
    "ES_Rain, General, Heavy Rain, Multiple Materials, Tin Roof, Distant Thunder, Brazil, AB 03 - Epidemic Sound (1).wav",
    "ES_Rain, General, Heavy Rain, Multiple Materials, Tin Roof, Distant Thunder, Brazil, AB 03 - Epidemic Sound.wav",
    "ES_Rain, Plastic, Rain Water On Plastic - Epidemic Sound.wav",
    "ES_Rain, Wood, Rain, Front Porch, Rain On Door, Medium - Epidemic Sound.wav",
    "ES_Resonance - Luba Hilman.wav",
    "ES_Silver Woodlands - Cora Zea.wav",
    "ES_Teegarden C - By Lotus.wav",
    "ES_The Sleep - Joseph Beg.wav",
    "ES_Water, Flow, Deep Mountain Stream, Creek, Bubble - Epidemic Sound.wav",
    "ES_Water, Flow, River, Calm, Running, Medium Distance 01 - Epidemic Sound.wav",
    "ES_Water, Flow, River, Calm, Running, Medium Distance 02 - Epidemic Sound.wav",
    "ES_Water, Flow, River, Close, Gentle 01 - Epidemic Sound.wav",
    "ES_Water, Flow, River, Close, Gentle 02 - Epidemic Sound.wav",
    "ES_Water, Flow, River, Current, Fast, Distant - Epidemic Sound.wav",
    "ES_Water, Flow, River, Current, Small, Fast Flow - Epidemic Sound.wav",
    "ES_Water, Flow, River, Flow, Strong, Bubbles, Nature, Forest, Telluride - Epidemic Sound.wav",
    "ES_Water, Flow, River, Run, Flow, Valley, Bubbles, Calm, Nature, San Miguel River, Telluride - Epidemic Sound.wav",
    "ES_Water, Flow, River, Small Mountain Stream - Epidemic Sound.wav",
    "ES_Water, Surf, Beach, Ocean, Waves, Sand, Wind - Epidemic Sound.wav",
    "ES_Water, Surf, Water, Ocean, Seashore, Waves Roar, Distant, Llandudno, Cape Town, South Africa - Epidemic Sound.wav",
    "ES_Water, Surf, Waves, Bay, Calm Waves, Rocks, Wash, Evening, Mediterranean Sea, Selmun Bay, Malta - Epidemic Sound.wav",
    "ES_Water, Surf, Waves, Bay, Calm Waves, Rocks, Wash, Evening, Mediterranean Sea, Selmun Bay, Malta 01 - Epidemic Sound.wav",
    "ES_Water, Surf, Waves, Ocean, Distant, On Beach, Distant Boat Motor 03 - Epidemic Sound.wav",
    "ES_Water, Underwater, Movement, Underwater Texture, Submarine, Ship, Underwater Earthquake, Heavy Deep Bubbles, Rumble - Epidemic Sound.wav",
    "ES_Water, Waterfall, Large Waterfall, 10 Meters, Constant Hum, MKH8040 (4.0) - Epidemic Sound.wav",
    "ES_Water, Waterfall, Steady, Perspective - Epidemic Sound.wav",
    "ES_Water, Waterfall, Strong Flow, People, Forest, Lower Waterfall, Evening, Zenny Fall, Telluride - Epidemic Sound.wav",
    "ES_Water, Waterfall, Waterfall, Medium Flow 01 - Epidemic Sound.wav",
    "ES_Water, Waterfall, Waterfall, Powerful - Epidemic Sound.wav",
    "ES_Water, Waterfall, Waterfall, The Trolls Road, 20m From River - Epidemic Sound.wav",
    "ES_Water, Wave, Crashing Waves, On Large Rocks (4.0) - Epidemic Sound.wav",
    "ES_Wind, General, Heavy, Builds Up, Forest 02 - Epidemic Sound.wav",
    "ES_Wind, General, Large Tree Foliage 01 - Epidemic Sound.wav",
    "ES_Wind, General, Light Whistling, Gusts, Alto Patache, Chile - Epidemic Sound.wav",
    "ES_Wind, General, Steady Wind, Light Movement, Cold - Epidemic Sound.wav",
    "ES_Wind, General, Wilderness, Medium Movement, Cold 01 - Epidemic Sound.wav",
    "ES_Wind, Gust, Cold, Mountain Wind, Gusts, Varied Intensity 01 - Epidemic Sound.wav",
    "ES_Wind, Gust, Whistling, Garden, Alto Patache, Chile - Epidemic Sound.wav",
    "ES_Wind, Gust, Winter, Snow, Cold, Nearby Movement - Epidemic Sound.wav",
    "ES_Wind, Tonal, Light Pole Whistling, Wind Gusts, Desert, Alto Patache - Epidemic Sound.wav",
    "ES_Wind, Tonal, Wind Howling, Barbed Wire Fence, Tierra Del Fuego, Argentina 01 - Epidemic Sound.wav",
    "ES_Wind, Vegetation, Desert Wind, Grass Blowing In Wind, Gusts, Distant Traffic Hum, Outskirts 01 - Epidemic Sound.wav",
    "ES_Wind, Vegetation, Desert Wind, Grass Blowing In Wind, Gusts, Distant Traffic Hum, Outskirts 02 - Epidemic Sound.wav",
    "ES_Wind, Vegetation, Desert Wind, Grass Blowing In Wind, Gusts, Distant Traffic Hum, Outskirts 03 - Epidemic Sound.wav",
    "ES_Wind, Vegetation, Mixed Forest, Mountainside Gentle Wind, Through Birches Pines Firs, Spruces, Distant Birds (4.0) - Epidemic Sound.wav",
]


def main():
    source_dir = Path("audio_files").resolve()
    target_dir = Path("audio_files_safe95").resolve()

    if not source_dir.is_dir():
        print(f"❌ Папката {source_dir} не съществува.")
        print(f"   Стартирай скрипта от C:\\Users\\USER\\Desktop\\auralis\\")
        sys.exit(1)

    target_dir.mkdir(exist_ok=True)

    print(f"📂 Source: {source_dir}")
    print(f"📂 Target: {target_dir}")
    print(f"🎵 Търся: {len(SAFE_95)} файла")
    print("─" * 60)

    all_files = {p.name: p for p in source_dir.rglob("*.wav")}
    print(f"📦 Намерени общо: {len(all_files)} wav файла")
    print()

    found = 0
    missing = []

    for idx, name in enumerate(SAFE_95, 1):
        if name in all_files:
            src = all_files[name]
            dst = target_dir / name
            if dst.exists():
                print(f"[{idx:>2}/{len(SAFE_95)}] ⏭  вече има: {name[:55]}...")
            else:
                shutil.copy2(src, dst)
                print(f"[{idx:>2}/{len(SAFE_95)}] ✅ {name[:55]}...")
            found += 1
        else:
            print(f"[{idx:>2}/{len(SAFE_95)}] ❌ ЛИПСВА: {name}")
            missing.append(name)

    print()
    print("═" * 60)
    print(f"✅ Копирани: {found} / {len(SAFE_95)}")
    if missing:
        print(f"❌ Липсват:  {len(missing)}")
        for name in missing:
            print(f"  • {name}")
    print("═" * 60)
    print()
    print("СЛЕДВАЩА СТЪПКА — нормализация:")
    print("  python tools\\audio_normalize.py audio_files_safe95")


if __name__ == "__main__":
    main()
