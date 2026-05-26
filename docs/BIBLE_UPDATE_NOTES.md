# BIBLE UPDATE NOTES — какво да добавиш в AURALIS_BIBLE_v3_PIVOT.md
**Дата:** 2026-05-26
**От:** Claude Opus 4.7 (outgoing)

Това е summary на промени които НЕ са в Bible v3 PIVOT и трябва да се добавят.
Не пиша direct патч защото може Bible да е променен от тогава.

---

## §0 — Архитектурни промени (НОВА секция)

### Profile-Based Configuration (single source of truth)
- Файл: `js/profile-config.js`
- Replace категория-based mix logic с PROFILE-based
- 5 profiles × 6 scenarios × 2 (day/night) = 60 конфигурации
- User overrides persistent в localStorage `auralis-user-overrides`

### Navigation Stack
- `state.phaseHistory[]` (cap 20) replaces single `previousPhase` slot
- `popPhase()` — pop без re-push (избягва навигационен loop)
- 16 phases в dispatch table

### Audio Engine Architecture
- Layer 1 (main audio) + Layer 2 (therapeutic noise) — НЕЗАВИСИМИ
- НЯМА sidechain compression в кода
- DynamicsCompressor bypass добавен (предотвратява iOS auto-gain)
- FLIGHT-TOKEN race condition guard
- SEQ-REVEAL sequential fade-in (маскира audio decode delay)

---

## §1 — Safety Protocols (РАЗШИРИ)

### Volume Calibration
- Subjective Jastreboff "точка на смесване" в onboarding
- Преди първи Player open
- Max cap 75% (по проучвания, >70% при дълго слушане увреждa)
- Save in `state.mixingPointVolume`
- Once-per-user, повторим от Settings

### Audio Device Selection
- 4 опции в onboarding: speaker / bone / other / inear
- In-ear → hard warning bottom sheet
- Volume limits per device:
  - speaker / bone: day 75%, night 55%
  - other: day 65%, night 50%
  - inear: day 45%, night 40%
- [ИНТЕРПРЕТАЦИЯ] — конкретните % са моя interpolation. Проучванията дават dBA, не %. Reлативна калибрация.

### Headphones Warning
- Bottom sheet преди първи Player open
- Текст: in-ear contraindication, mixing point reminder, night exposure
- Persistent flag (показва се веднъж)

---

## §2 — Audio Quality Requirements (НОВА)

### LUFS Normalization
- Main audio target: **-23 LUFS** integrated
- Noise pack (brown/pink) target: **-26 LUFS** (фоново ниво)
- True peak ≤ -1 dBTP
- Hi-freq energy ratio проверявано

### Loop Seamness
- 3-sec crossfade на всеки файл
- Math: body[-1] → body[0] adjacent samples
- Audit metric може да show false positive — реален loop test = phone test

### File Format
- WAV → OGG Opus 96 kbps (planned, Code 2 working on it)
- 10× размер reduction (~120 MB total)
- Perceptually transparent (Spotify standard)
- Web Audio API decodeAudioData supports на всички modern browsers

---

## §3 — Pitch Matching Protocol (НОВА)

### Source
- [ВАЛИДИРАНО] — "Клиничен и технологичен рамков протокол за честотно профилиране"
- [ВАЛИДИРАНО] — "Систематичен анализ ... високоточен честотен профилатор"

### Pre-test Question (КРИТИЧНО)
"Какво чувате най-точно?
а) ЧИСТ тон → продължи към pitch test
б) ШУМ → skip (pitch не помага за шумов)
в) ПУЛСИРАНЕ → препоръка УНГ преглед
г) ДРУГО → optional later from Settings"

### Test Protocol
- 12 честоти (1000-12700 Hz, 1/3 octave stepping)
- 2AFC bayesian narrowing — 8 trials
- Тон 2.5 сек + 1 сек тишина (residual inhibition guard)
- Max amplitude 0.3 (≈70 dB SPL relative)
- Octave verification (F vs 0.5F vs 2F)

### Validation (Phase 2)
- 3 теста за 4 дни (Day 1, Day 3, Day 4)
- Variance check: log2(F_max/F_min) ≤ 0.33 octave
- Median computation за финална стойност
- Ако variance > 0.33 → unstable, fallback to standard noise

### Safety Guards
- Block ако `audioDevice === 'inear'`
- Volume cap 70% during test
- Post-test: "Усещате ли по-силен тинитус сега?" → 24h pause ако да
- Discomfort interrupt при всяка проба

### Notch Filter (Phase 3, след validation)
- BiquadFilterNode type='notch'
- Q = 2.871 (1/2 octave width)
- Само на noise pack (Layer 2)
- НЕ на музика / sound recordings (Layer 1)

---

## §4 — Категории (CORRECTION)

В Bible v3 PIVOT може да имаше различни числа. Reality:

### 6 scenario categories (валидирани)
1. sleep_deep
2. falling_asleep
3. relaxation
4. daily
5. anxiety
6. meditation

### Specials
- **meditation = БЕЗ brown noise** (NOISE_BY_SCENARIO override)
- meditation = САМО sing bowls, gongs, mantra, chant, music (no ambience)
- anxiety = по-силен Layer 2 ratio (SOS режим)

### Sound Library
- 256 файла обработени
- 250 уникални (variants обединени)
- LUFS normalized, loop crossfaded, leading/trailing trimmed

---

## §5 — Изключения от Bible v3 PIVOT (РЕЗПОРТ)

Възможни divergences днес:
- 27 категории / per-category анимация → ОТКАЗАНО за beta
- Subscription €0.99/мес → ОТКАЗАНО, остава €2.99 еднократно
- Marketing AI sales agent → НЕ за beta

---

## §6 — Hosting (planned)

- Cloudflare quick tunnels — flaky, само за dev
- **DigitalOcean droplet** — production, миграция утре
- HTTPS via Certbot (Let's Encrypt)
- Audio files отделно от git (rsync/scp), не Git LFS

---

## ЗА НОВ ШЕФ

Когато обновяваш Bible:
1. Прочети първо текущия Bible v3 PIVOT
2. Виж кое от тук НЕ е там
3. Питай Тихол преди да правиш голямо preпиcuvaне
4. Запази §1-9 структурата (Тихол е свикнал)

Винаги питай Тихол ПРЕДИ да override-ваш Bible. Той е sacred document.
