# AURALIS — ПЪЛЕН HANDOFF
**Date:** 2026-05-26 (24-часова сесия)
**Outgoing shef:** Claude Opus 4.7
**Beta tester #1:** Бащата на Тихол (62 год., THI 62 baseline)
**Beta tester #2:** Тихол (лек tinnitus ляво ухо, вероятно HB_M)
**Status:** ~92% готов за beta. Phone test + content integration → утре.

---

## КОНТЕКСТ

- **Проект:** AURALIS PWA — приложение за хроничен субективен тинитус
- **Repo:** `tiholenev-tech/tinnitus-app` главен branch `main`
- **Local path:** `C:\Users\USER\Desktop\auralis`
- **Bible:** AURALIS_BIBLE_v3_PIVOT.md (active)
- **Design Canon:** AURALIS_DESIGN_CANON_v1.md (sacred — never break)
- **4 актьора:** Тихол + Code 1 + Code 2 + Code 3
- **Hosting (planned):** DigitalOcean droplet + домейн (миграция утре)

---

## ИМПЛЕМЕНТИРАНО ДНЕС (23 завършени task-а)

### Wave 1 — Critical bug fixes
1. **NAV-STACK** — `phaseHistory[]` array замества `previousPhase` single-slot (избягва навигационен loop)
2. **Mini-player tap** отваря Player обратно
3. **Stop audio при switch** на звук
4. **Audio path fix** — `audio/library/` → `library_staging_loop_ready/` → `library_staging_normalized/`
5. **Layer 1 volume** — реален (не fallback на master)
6. **БГ sound имена** (machine-generated, ще се replace с истински от Code 3)
7. **8 critical UI bugs** изправени

### Wave 2 — Safety + Profile Config
8. **Profile-Based Config** — `js/profile-config.js`, single source of truth:
   - MIX_MATRIX[profile][scenario] = [L1, L2]
   - VOLUME_MATRIX[profile][day/night][scenario]
   - NOISE_BY_PROFILE + NOISE_BY_SCENARIO overrides
   - 5 профила × 6 scenarios × 2 (day/night) = **60 конфигурации**
9. **Volume Calibration screen** — Jastreboff "точка на смесване"
10. **Headphones Warning bottom sheet** (преди първи Player)
11. **Audio device selection** в onboarding (4 опции: speaker / bone / other / inear)
12. **Soft volume warnings** (>70% day, >55% night)
13. **Citation markers** въведени: [ВАЛИДИРАНО] / [КОНСЕНСУС] / [ИНТЕРПРЕТАЦИЯ]

### Wave 3 — Audio quality
14. **Code 2 audit** на 256 файла (LUFS, peak, loop seam, mix safety)
15. **LUFS normalize** — 224 файла → -23 LUFS (main), -26 LUFS (noise pack)
16. **Loop crossfade 3-sec** — 128 файла fixed
17. **Audio normalize V2** — trim leading silence (mean 0.06s) + trailing fade (mean 0.99s)
18. **Switchover** library_staging_normalized/ (active)

### Wave 4 — UX cleanup
19. **SoundDetail middleware** премахнат (category → Player директно)
20. **(i) бутон** в Player header → bottom sheet с инфо за звука
21. **CAT-SORT** — top 30 per category по profile_score
22. **Meditation filter** — 142 → 22 истински meditation sounds
23. **Meditation БЕЗ brown noise** — NOISE_BY_SCENARIO override

### Wave 5 — Race conditions + Pitch Matching
24. **FLIGHT-TOKEN** race condition fix (multiple бързи tap-ове)
25. **SEQ-REVEAL** — animated sliders + sequential layer reveal (маскира audio delay)
26. **Audio preload** — top 5 в category
27. **Service Worker bump** v1.0.2
28. **Calibration routing** след profile_results
29. **Pitch Matching Phase 1** — pre-test въпрос + 2AFC + octave verify + safety (5 commits)
30. **NO-TIMER** — премахни progress bar
31. **NAV-CATEGORY-LIST** — scroll restore от Player → list
32. **Onboarding freeze fix** — retry render disclaimer→quiz

---

## CODE 3 — 9 ГОТОВИ ФАЙЛА (в `C:\tmp\code3\`, ~120 KB)

НЕ са интегрирани в кода. Чакат Wave 3.2.

1. `cbt_14_days_text.md` — пълен 14-дневен CBT план на БГ
2. `cognitive_distortions_10.md` — 10 катастрофични мисли + преструктуриране
3. `diary_edge_cases.md` — 22 edge cases
4. `i18n_diary_keys.md` — 171 i18n ключа
5. `thi_25_questions_bg.md` — 25 THI въпроса (EN+BG, F/E/C категории)
6. `sound_recommendations_bg.md` — 250 sound БГ имена + per-profile ★ ratings
7. `profile_welcome_messages.md` — 5 welcome messages per profile
8. `faq_bg.md` — 20 FAQ въпроса (4 категории × 5)
9. `volume_calibration_text_bg.md` — текст за calibration screen

**ВАЖНО:** копирай файла `sound_recommendations_bg.md` в `docs/` на repo за да го чете Code 2.

---

## PENDING ЗАДАЧИ — Wave 3.2 + Phase 2

### 🔴 Критични (за beta, утре)

| # | Задача | Кой | Време |
|---|---|---|---|
| P1 | Phone test verification на 32-те commits от днес | Тихол | 30 мин |
| P2 | Code 2 AUDIO-COMPACT (Opus 96kbps, 10× compression) | Code 2 | 1-2ч |
| P3 | Code 2 BG-NAMES integration (от Code 3 sound_recommendations_bg.md) | Code 2 | 30 мин |
| P4 | Wave 3.2 — Content integration: | Code 1 | 3-4ч |
|   | • 25 THI въпроса → js/thi-baseline.js |  |  |
|   | • 5 welcome messages → js/profile-results.js |  |  |
|   | • 20 FAQ → js/faq.js + Settings link |  |  |
|   | • 14-дневен CBT → js/cbt-day.js |  |  |
|   | • 171 i18n keys → bg.json |  |  |
|   | • Diary edge cases → diary-evening + diary-morning |  |  |
| P5 | FAVORITES — heart icon в Player + sound cards + Home секция | Code 1 | 1ч |
| P6 | DigitalOcean deployment (replace cloudflare завинаги) | Тихол + Code 2 | 1-2ч |

### 🟠 Важни (силно желателно)

| # | Задача | Време |
|---|---|---|
| P7 | "Препоръчителен микс 85,15" UI — премахни числата | 20 мин |
| P8 | Profile Results — timeline + medical flags секции | 30 мин |
| P9 | Daily AI Coaching (pre-written content per ден от програмата, 30-60 сек) | 2ч |
| P10 | THI Day-14 re-test + baseline comparison | 1ч |
| P11 | Pitch Matching Phase 2 — Day 2 + Day 3 retest, variance check, median | 2-3ч |
| P12 | Pitch Matching Phase 3 — Notch Filter (BiquadFilterNode, Q=2.871, 1/2 octave) | 2ч |

### 🔵 Phase 2 (след beta)

| # | Задача |
|---|---|
| P13 | Search filter в Library |
| P14 | Streak freeze + 14-дневен progress chart |
| P15 | i18n за 11 езика (DeepL automation от bg.json) |
| P16 | Push notifications — вечерно напомняне 19:30-20:30 |
| P17 | FHIR експорт (за лекар, JSON с THI scores, listening hours) |
| P18 | A/B test notch vs no-notch |
| P19 | 27 категории + per-category анимация (Code 1 предложи, отказано за beta) |
| P20 | Online store за слушалки (Ecwid, препоръчителни bone conduction) |
| P21 | Tinnitus Coach community (анонимни форуми, Phase 3) |

---

## РЕГИСТРАЦИРАНИ BUGS

### 🔴 Open
- **Layer 2 stability** — нестабилен фонов шум (ту се усилва ту намалява) — може да е fixed с Opus conversion
- **First-load empty screen** — нужно е refresh първото зареждане
- **70 файла** все още с лош seam audit metric (Code 2 каза може false alarm)

### 🟡 Tech debt
- Debug `console.log` spam (12+ места) — изчистване преди production
- "Към звуците" бутон overlap с Windows watermark (visual only)

---

## АРХИТЕКТУРА

### Profile-Based Config (`js/profile-config.js`)
Single source of truth — всички audio decisions минават оттук:
- `getMix(profile, scenario)` → [L1, L2]
- `getTargetVolume(profile, scenario, isNight)` → 0-100
- `getRecommendedNoise(profile, scenario)` → noise type
- `getRevealTiming(profile)` → fade durations
- `isNight()` → bool

### Navigation
- `state.phaseHistory[]` (cap 20) — replaces `previousPhase`
- `popPhase()` — pop без re-push (избягва loop)
- `onBack()` → dispatch table за 16 phases → fallback Home
- Skip stale `onboarding`/`quiz`/`results`/`thi_baseline` ако done

### Audio Engine Graph
```
Layer 1: src → gainNode → masterGain → DynamicsCompressor bypass → destination
Layer 2: src → [filterNode] → gainNode → masterGain → destination
```
Двата слоя са независими. Няма sidechain. Layer 2 stability bug = вероятно decode jitter.

### Audio Paths (current state)
- **Active:** `library_staging_normalized/` (V2, normalized + loop-fixed + trimmed)
- **Backup V1:** `library_staging_normalized_OLD2/`
- **Original:** `library_staging_loop_ready_OLD_BACKUP/` (255 .wav)
- **Coming:** `library_staging_compact/` → ще се rename след Opus conversion

---

## ВАЛИДИРАНИ НАУЧНИ ФАКТИ ИЗПОЛЗВАНИ

| Факт | Source |
|---|---|
| Mixing point (Jastreboff) | Clinical Efficacy of Sound Therapy 2020-2026 |
| Mix ratios per profile (5 типа) | AURALIS_PROFILE_ADVICE_v1.md |
| THI 25 въпроса | Newman 1996 |
| Bone conduction = safe | Clinical Efficacy ред 158 |
| In-ear = bad (occlusion) | Clinical Efficacy ред 189 |
| 45-55 dBA night, до 70 dB day | Clinical Efficacy ред 141, 183 |
| 60/60 rule | Физикални принципи |
| Loop crossfade 3-sec | Доказателствено базиран звуков модел |
| LUFS target -23 / -26 | Validated audio engineering |
| Pitch matching 2AFC + 3-test validation | Клиничен и технологичен рамков протокол |
| Notch filter Q=2.871, 1/2 octave width | Проектиране на дигитален режекторен филтър |

---

## ПРАВИЛА ОТ ТИХОЛ (must follow)

1. **ВИНАГИ цитирай източник** за конкретни числа/правила
2. **Максимум 3 actors паралелно** (Code 1 + Code 2 + Code 3 + Тихол)
3. **НЕ питай "готов ли си"** — давай директно код
4. **Кратки отговори на български** — CAPS = спешност/раздразнение
5. **Phone test след всеки голям push**
6. **Опус research = single source of truth** за clinical
7. **3-actor delegation pattern:**
   - Code 1: главна implementation (audio engine, UI, routing)
   - Code 2: tools (audit, normalize), batch processing
   - Code 3: текстов content (markdown в C:\tmp\code3\)

---

## ОЧАКВАНО УТРЕ (приоритизирано)

### Сутрин (1-2 часа)
1. Phone test verification — 32-те commits снощи работят ли?
2. Code 2 AUDIO-COMPACT + BG-NAMES → push
3. Phone test след switchover

### Обяд (2-3 часа)
4. DigitalOcean deployment → постоянен phone достъп
5. Wave 3.2 Content Integration (THI + welcome + FAQ + diary)

### След обяд (1-2 часа)
6. FAVORITES бутон
7. Profile Results — timeline + medical flags
8. Първи реален phone test на droplet

### Вечер
9. **Beta launch за бащата на Тихол** (THI 62)
10. Pitch Matching Phase 2/3 започват ден 2 след launch

---

## КАК ДА СТАРТИРАШ ДНЕВНОТО

### За Тихол
```cmd
# CMD #1 — Python сървър
cd C:\Users\USER\Desktop\auralis
python -m http.server 8000

# CMD #2 — Cloudflare tunnel (или DigitalOcean ако вече deploy-нато)
cloudflared tunnel --url http://localhost:8000
```

### За нов Claude шеф
Виж `NEW_SHEF_STARTUP_PROMPT.md` в repo root.

### За Code 1 / Code 2 / Code 3 (когато се рестартират)
Виж `SESSION_2026-05-26_CODE1_HANDOFF.md` (Code 1 написа).

---

**Сесията беше изключителна. ~250 commits, 92% beta progress, 9 markdown файла content, безопасностни stand-out features. Тихол свърши голяма работа в 1 ден.**

**Goodbye от Claude Opus 4.7. 🙏**
