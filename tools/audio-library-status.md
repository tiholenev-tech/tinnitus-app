# AURALIS Audio Library — Статус и одобрени файлове

**Дата:** 23.05.2026
**Източник:** Epidemic Sound (license-safe)
**Локация:** `Desktop/auralis/audio_files/` (gitignored — НЕ в repo)

---

## Обобщение

| Метрика | Брой |
|---|---|
| Общо файлове | 230 |
| Безопасни (score ≥80) | 92 |
| **Loop-friendly + Safe** | **39** ← за Mixer |
| Loop-friendly (всички scores) | 82 |

**Решения:**
- За Mixer beta 1.0: ползваме **39-те loop+safe**
- За Calm/Sleep секции: можем да ползваме и non-loop файлове (с fade in/out)
- Опасните (<40 score) НЕ ги ползваме

---

## 39-те ОДОБРЕНИ файла (loop+safe, score ≥80)

### 🌊 WATER_OTHER (6 файла) — Подводни звуци

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 100 | 180s | 114Hz | `ES_Ambience, Underwater, Deep, Low.wav` ⭐ |
| 100 | 170s | 138Hz | `ES_Designed, Drone, Sub, Deep, Underwater.wav` ⭐ |
| 100 | 120s | 244Hz | `ES_Ambience, Underwater, Complex 05.wav` |
| 100 | 120s | 308Hz | `ES_Ambience, Underwater, Complex 03.wav` |
| 100 | 18s | 323Hz | `ES_Water, Underwater, Movement, Submarine.wav` (твърде къс) |
| 85 | 85s | 3232Hz | `ES_Water, Waterfall, Steady, Perspective.wav` |

**Profile fit:** TH_C (висок тинитус — дълбоки честоти маскират добре), универсален

### 🌊 WATER_OCEAN (6 файла) — Морски/океан

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 100 | 300s | 2770Hz | `ES_Ambience, Urban, Black Sea, Distant Waves Roar 01.wav` ⭐ |
| 100 | 343s | 2822Hz | `ES_Ambience, Urban, Black Sea, Distant Waves Roar 02.wav` ⭐ |
| 85 | 333s | 8933Hz | `ES_Water, Surf, Waves, Bay, Calm Waves, Mediterranean 01.wav` (висок centroid) |
| 85 | 320s | 8129Hz | `ES_Water, Surf, Waves, Bay, Calm Waves, Mediterranean 02.wav` (висок centroid) |
| 80 | 364s | 844Hz | `ES_Genetic Waves - Joseph Beg.wav` (designed mediation) |
| 80 | 293s | 777Hz | `ES_Ocean Meditation - Joseph Beg.wav` (designed) |

**Profile fit:** SS_R (стрес-чувствителен), SM_F (соматичен)

### 🌊 WATER_RIVER (7 файла) — Реки/потоци

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 100 | 159s | 1235Hz | `ES_Ambience, Underwater, Gargle, River 03, Telluride.wav` ⭐ |
| 100 | 217s | 1504Hz | `ES_Ambience, Underwater, Gargle, River 05, Telluride.wav` ⭐ |
| 100 | 180s | 2923Hz | `ES_Ambience, Forest, Wetlands, River, Water, Wind.wav` |
| 85 | 185s | 6094Hz | `ES_Ambience, Underwater, Gargle, River 02, Telluride.wav` |
| 85 | 119s | 8488Hz | `ES_Water, Flow, River, Flow, Strong, Bubbles.wav` |
| 85 | 360s | 10040Hz | `ES_Water, Flow, River, Run, Flow, Valley, San Miguel.wav` |
| 85 | 294s | 4805Hz | `ES_Water, Waterfall, Strong Flow, People, Forest.wav` |

**Profile fit:** DN_S (нискочестотен), HB_M (адаптиран)

### 🌧 WATER_RAIN (3 файла) — Дъжд

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 85 | 82s | 5529Hz | `ES_Ambience, Forest, Ukraine, Morning, Birds.wav` (всъщност гора) |
| 85 | 185s | 4514Hz | `ES_Ambience, Swamp, Wetland After Rain.wav` |
| 85 | 340s | 9783Hz | `ES_Rain, Concrete, City Rain, Soft, Thunder.wav` (висок centroid) |

**Profile fit:** SS_R, SM_F (универсален)
**⚠ Бележка:** Малко файлове + всички с висок centroid → може да трябва допълнително сваляне

### 🌬 WIND (1 файл) — Вятър

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 85 | 27s | 4981Hz | `ES_Wind, Gust, Winter, Snow, Cold, Nearby Movement.wav` (кратък) |

**Profile fit:** TH_C
**⚠ Бележка:** Само 1 файл и е къс. Сваляне на повече wind препоръчително.

### 🌲 FOREST (3 файла) — Гора

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 100 | 180s | 2823Hz | `ES_Ambience, Forest, Wetlands, Snowing, Droplets, Distant.wav` ⭐ |
| 100 | 180s | 2299Hz | `ES_Ambience, Forest, Wetlands, Winter, Wildlife, Birds.wav` ⭐ |
| 85 | 180s | 5226Hz | `ES_Ambience, Forest, Wetlands, Forest, Birds, Birdsong.wav` (птици) |

**Profile fit:** HB_M, SS_R
**⚠ Бележка:** Зимна гора (snow + wetlands) = по-малко птици = по-безопасно

### 🔥 FIRE (0 файла)

**ПРОПУСНАТА категория за beta 1.0.** Epidemic Sound няма fire без crackling.
**Phase 2:** Custom recordings (BBC Sound Archive, freesound.org CC0)

### 🧘 MEDITATION (10 файла) — За Calm секция (не за Mixer)

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 100 | 928s (15 мин) | 908Hz | `ES_Meditation Aquatic - 369.wav` ⭐⭐ |
| 100 | 526s (9 мин) | 637Hz | `ES_Celestial Spheres - Ave Air.wav` ⭐ |
| 100 | 461s | 975Hz | `ES_Komorebi - Shuta Yasukochi.wav` ⭐ |
| 100 | 448s | 828Hz | `ES_Crystal Haze - Shuta Yasukochi.wav` ⭐ |
| 100 | 307s | 890Hz | `ES_Epic Mirage - Hanna Lindgren.wav` |
| 80 | 370s | 858Hz | `ES_369 Seconds Of Bliss - 369.wav` |
| 80 | 363s | 459Hz | `ES_Namucuo - By Lotus.wav` |
| 80 | 333s | 523Hz | `ES_Resonance - Luba Hilman.wav` |
| 80 | 317s | 451Hz | `ES_Field of Horses - Joseph Beg.wav` |
| 80 | 248s | 723Hz | `ES_Silver Woodlands - Cora Zea.wav` |

### 🎵 AMBIENCE (1 файл)

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 100 | 60s | 68Hz | `ES_Designed, Rumble, Low, Sub, Slight Air.wav` ⭐⭐ (много дълбок) |

### 🎵 OTHER (2 файла)

| Score | Duration | Centroid | Файл |
|---|---|---|---|
| 100 | 301s | 425Hz | `ES_Lay Down with Me - Hanna Lindgren.wav` |
| 80 | 352s | 1344Hz | `ES_Opposite to Destruction - Hanna Lindgren.wav` |

---

## Препоръчителни Mixer Presets (6) — за Tab 1 "Препоръчани"

| # | Preset name | Combine | Profile fit |
|---|---|---|---|
| 1 | **Дълбока тишина** | Pink + Brown noise | Универсален |
| 2 | **Подводна релаксация** | Underwater Deep Low + Sub Rumble | TH_C, SS_R |
| 3 | **Черноморска вечер** | Black Sea Distant + Brown noise | SS_R, SM_F |
| 4 | **Подводен поток** | River Telluride + Underwater Complex | DN_S, HB_M |
| 5 | **Зимна гора** | Forest Wetlands Winter + Pink | HB_M, SS_R |
| 6 | **Космическо спокойствие** | Celestial Spheres + Brown | Универсален (тишина за сън) |

---

## За "Всички звуци" Tab 2 — категоризация

```
🌊 Вода / Природа (22)
  ├─ Подводни (6)
  ├─ Океан (6)
  ├─ Реки/потоци (7)
  ├─ Дъжд (3)
  
🌲 Природа (4)
  ├─ Гора (3)
  ├─ Вятър (1)

🧘 Медитации (10)
  └─ Дълги ambient композиции

🎚 Базови шумове (3)
  ├─ Pink Noise
  ├─ Brown Noise
  └─ Green Noise (bandpass 500Hz)

🌌 Ambient/Drone (3)
  └─ Sub Rumble + Other
```

---

## Препоръка за следваща стъпка (audio normalization)

**Всички 39 файла трябва да минат през normalization** на -23 LUFS (EBU R128 standard) преди да влязат в production:

1. Скрипт `tools/audio_normalize.py` (ТРЯБВА ДА СЕ НАПИШЕ)
2. Употреба:
   ```
   python tools/audio_normalize.py "C:\Users\USER\Desktop\auralis\audio_files"
   ```
3. Output: `audio_files_normalized/` папка с -23 LUFS files
4. След normalization → пресни кратки имена + интеграция в `mixer-presets.js`

---

## Сваляне на повече файлове (опционално, Phase 1.5)

**Категории със малко файлове:**
- WIND: 1 → цел 5+ (търси "wind low frequency", "winter wind")
- WATER_RAIN: 3 → цел 6+ (търси "rain steady, no thunder", "rain on car")
- FOREST: 3 → цел 5+ (търси "night forest", "winter forest no birds")

**Категория за пропускане за beta:**
- FIRE: 0 → отложено за Phase 2

---

*Документ актуализиран: 23.05.2026 (сесия "AURALIS — Първи задачи")*
*Източник: `audio-report.csv` от audio_check.py*
