# 🧭 AURALIS — MASTER HANDOFF (цялостна визия, логики, техника)

**Дата:** 2026-06-01 · **Версия:** 1.0.106 · **Статус:** pre-launch (бета затворена откъм бъгове)
**Аудитория на документа:** Тихол (да си спомни) + всеки нов шеф-чат (пълен контекст при технически проблем).

> Този документ НЕ е списък с бъгове. Той описва **какво е приложението, как мисли, какви логики има вътре и как е построено технически**. Чети първо при влизане в проекта.

---

## 0. БЪРЗ СТАРТ за нов чат

- **Какво е:** AURALIS — PWA за тинитус. Помага на хора с тинитус (шум/звънене в ушите) чрез звукова среда + личен notch филтър + 14-дневен навик. **Wellness инструмент, НЕ медицински продукт** (така е и в copy-то).
- **Аудитория:** възрастни **70+**, целият UI е на български. Воден принцип: едно действие на екран, минимум четене, едри бутони, без жаргон.
- **Tech:** **vanilla JS, без framework**, статичен PWA. Данни в `localStorage`. Сервира се на **https://tinnitus-app.help** (Apache на droplet 104.248.19.8). Бъдеще: Capacitor нативна обвивка (Android-first).
- **Deploy:** `git push origin main` → `ssh root@104.248.19.8 "cd /var/www/auralis && git pull origin main"`.
- **ВАЖНО при всеки release:** бъмпни `var VERSION` в `service-worker.js` И `var CODE_VERSION` в `index.html` (трябва да са еднакви) → SW дърпа свежи файлове + показва бутон „Обнови".
- **Аудио файловете** (`library_staging_compact/*.opus` + `.mp3`) са **gitignored, само на сървъра**. Manifest-ът (`audio/library/manifest.json`) Е в git.

---

## 1. ВИЗИЯ И ФИЛОСОФИЯ

### Продуктова цел
Тинитусът е **неврологично** състояние (мозъкът усилва вътрешния шум при сензорна загуба), не периферен ушен дефект. AURALIS не „лекува" — помага на мозъка да **привикне** (habituation) и да обърне по-малко внимание на шума, чрез:
1. **Звукова среда** (природни звуци / шум) на „точката на смесване".
2. **Личен notch филтър** — изрязва точно честотата на тинитуса от всеки звук.
3. **14-дневен навик** (дневник + CBT микро-стъпки) за редовност.

### Канон (НЕ нарушавай)
- **Никога „терапия"/„лечение"** в copy-то. Винаги „благополучие/wellness". Дисклеймърът е навсякъде.
- **70+ воден режим:** без четене, едно действие/екран, ясна индикация „докъде си + кога свършва", „Спри засега" винаги.
- **Без обещания за точност/резултат** (тинитус честотата е принципно неточна — виж §6).

### Научна основа (docs/research/)
- **Точка на смесване (mixing point, TRT):** звукът да е малко ПОД нивото на тинитуса — да се смесят, НЕ да заглушава. По-силно = срещу метода.
- **Остатъчно инхибиране (residual inhibition):** след слушане (особено на/около честотата) тинитусът временно утихва.
- **Предпочитание = придържане:** RCT (Searchfield 2017) — лек дъжд > синтетичен шум по ефект И предпочитание. Затова библиотеката е подредена по **вид звук** (човек да намери каквото обича).
- **Спектър > повод:** клиничната стойност на звука е във физическата му структура (равномерен, без транзиенти, мек), не в етикет „за сън/тревожност".
- **THI степени (Newman):** 0–16 много леко · 18–36 леко · 38–56 умерено · 58–76 тежко · 78–100 катастрофално. MCID ≥7 точки = значимо подобрение.

---

## 2. ТЕХНИЧЕСКА АРХИТЕКТУРА

### Стек
- Vanilla JS (ES5-ish, IIFE модули, `window.ModuleName`). Без build стъпка. Скриптовете се зареждат с `<script>` тагове в `index.html` (ред ~145+).
- CSS: токени (`css/tokens.css`) + `base.css` (glassmorphism: `.glass`+`.shine`+`.glow`) + по модул.
- PWA: `service-worker.js` + `manifest.json` (PWA манифест в root, различен от audio манифеста).

### Модули (живите, по роля)
| Модул | Роля |
|---|---|
| `js/state.js` | **AppState** — single source of truth; цялата persistence (localStorage), program/streak/THI/pitch/diary, transitions, phaseHistory |
| `js/app.js` | bootstrap, routing, `onPopstate` (история/back), phase → модул mapping |
| `js/i18n.js` | locale (само `bg` активен), `t(key, fallback, params)` |
| `js/onboarding.js` | първи екрани (welcome/consent) |
| `js/quiz.js` + `quiz-engine.js` + `quiz-data.js` | 15-въпросен профил-куиз → profile (TH_C…) + DI (distress index) |
| `js/profile-results.js` | резултат от куиза + „Към звуците" |
| `js/profile-config.js` | mix/volume матрици по профил + recommended noise + „no-noise за meditation" |
| `js/home.js` | начален екран — **елемент-карти** + „Моите тестове" секция + master volume + долен ред |
| `js/category-view.js` | списък звуци по **елемент** (category_audio) |
| `js/library.js` | „Всички звуци" (legacy, но жив) — групиране по category_audio, любими, search |
| `js/favorites.js` | **window.Favorites** — единен store за любими (`auralis_favorites`) |
| `js/player.js` + `player-art.js` | плеър (2 слоя, sliders, notch indicator, sleep timer) |
| `js/audio-engine.js` | **сърцето на звука** (виж §4) |
| `js/audio-resilience.js` | recovery слой — пази звука жив (wakeLock, watchdog). **НЕ пипай логиката.** |
| `js/pitch-test.js` | тон-тест (2AFC + Bayes + октава + notch награда + resume) |
| `js/thi-baseline.js` | 25-въпросен THI (baseline + Ден-14) |
| `js/diary*.js` + `cbt-day.js` | дневник + 14-дневна програма + CBT |
| `js/settings.js` | Настройки (bottom sheet) |
| `js/science-info.js`, `faq`, `favorites`, `analytics`, `notifications-mock`, `voice-dictation` | помощни |

### Persistence — ВСИЧКИ localStorage ключове
Префикси `auralis_` И `auralis-` (внимание: смесени!). Пълен списък: `settings.js` → `DATA_KEYS_ALL` (audit-ready за GDPR пълно изтриване). Ключови:
- `auralis-quiz-done/profile/di/answers`, `auralis-onboarding-done`, `auralis-consent-granted`
- `auralis-program-start-date`, `auralis-program-current-day`
- `auralis-thi-baseline/day14` (+breakdown), `auralis-thi-active-index/scores` (resume)
- `auralis-pitch-tests`, `auralis-pitch-skipped`, `auralis-pitch-active` (resume), `auralis-notch-disabled`, `auralis-audio-device`
- `auralis-diary-entries` (**тире — реалният дневник**), `auralis-streak-*`
- `auralis-master-volume`, `auralis_player_*`, `auralis_favorites`
- ⚠️ **Капан:** `auralis_diary_entries` (долна черта) е МЪРТЪВ legacy store. Реалният е с **тире**. (analytics + старият diary import четат грешния — затова са скрити, §9.)

---

## 3. ОСНОВНИТЕ ЛОГИКИ (heart of the app)

### 3.1 Поток на нов потребител
`onboarding (welcome/consent) → quiz (15q) → profile_results → pitch_test (quick) → home`
- **THI и калибрацията НЕ са в онбординга** (махнати — твърде дълго за 70+). Старата `volume-calibration` е премахната (pitch тестът има своя авто-калибрация + Home има master плъзгач).
- `programStartDate` се сетва при **първия дневник запис** (`ensureProgramStarted`, не destructive).

### 3.2 Трите „теста" (на Home → секция „Моите тестове")
Само ДВА периодични теста се показват (профилът е еднократен → не се показва):
1. **Профил (15q):** еднократен. Дава `profile` (TH_C/DN_S/SS_R/SM_F/HB_M) + `DI` (distress → препоръчителна сила). НЕ е THI.
2. **THI (25q):** тежест 0–100. Показва се като **СТЕПЕН** (леко/умерено…), не число. Baseline + повторение на Ден-14 (MCID сравнение). Resume per въпрос. `thi-baseline.js`.
3. **Тон/честота (pitch):** дава Hz → notch филтър. Resume на ниво замерване. `pitch-test.js`.
- Всяка карта: име + статус + бутон; недовършен → „Продължи" + „Започни отначало"; THI на ден-14 → „Време за повторна оценка".
- **Дневник-карта** също тук, докато не е попълнен днешният запис (напомняне).

### 3.3 Pitch тест (тон) — детайли
- Поток: pretest (тип: тонален→чист ТОН / шумов→NBN; пулсиращ→ЛОР) → слушалки → авто-усилваща калибрация (СПРИ) → 5 замервания (quick) или 4–20 (precise „Уточни") → октавна проверка → **saveResult** → финален слайдер → **награда** (notched шум на честотата = остатъчно инхибиране).
- Метод: 2AFC staircase + Байесово усредняване в log2, стоп при CI ≤±0.25 окт. `docs/research/24+06`.
- Интеракция (1.0.91+): натисни „Звук А/Б" → чуе се и спира → изскачат „Чуй пак" + „Това е моят" (без задържане). „Назад към предишния" връща сравнение. Премиум glass бутони.
- Брой проби: quick=5 фикс; precise=4–20 (шумов/колеблив → до тавана 20).

### 3.4 Notch филтър (личната терапия)
- `category_audio === 'meditation'` звуците СВИРЯТ БЕЗ добавен шум (арбитър в profile-config). Останалите получават фонов шум по профила.
- Notch: `AppState.isNotchActive()` (има pitch freq + не skipped + не disabled) + `getNotchFreq()`. Прилага се в audio-engine L1 chain (biquad notch преди gain). Toggle в Настройки (с предупреждение да остане включен).

### 3.5 Библиотека по елемент
- Начален екран = **11 елемент-карти** (Вълни·Подводно·Река·Водопад·Дъжд·Вятър·Гора·Огън·Медитация·Шум·Атмосфера). Клик → CategoryView филтрира по `category_audio`.
- ⚠️ **id-та `ocean` и `meditation` са ЗАПАЗЕНИ** (код зависи: meditation=no-noise арбитър; ocean=player-art фон). Само дисплей имената им са „Вълни"/„Медитация".
- Имената на звуците водят с елемента („Морски вятър край Атина", „Подводна река").
- Library („Всички звуци") също групира по category_audio (динамично).

### 3.6 Дневник + 14-дневна програма + streak
- `saveDiaryEntry(dateKey, partial)` → `ensureProgramStarted()` (ден 1 = днес) + запис + streak update.
- `completedDays`/`missedDays` смятат program-day ключове чрез **календарна аритметика** (DST-устойчиво).
- Streak: активни дни + 2 freeze + frozen дни (ice-blue в ProgressChart).
- Вечерен дневник + CBT микро-стъпка на ден. Diary import/export: пълният „Изтегли всичко (JSON)" работи; granular import е скрит (четеше мъртъв store).

---

## 4. АУДИО ENGINE (`audio-engine.js`) — критично

### Сигнален път
`Layer1 (звук) + Layer2 (фонов шум) → masterGain → safetyLimiter (-12 dBFS, 20:1) → makeupCancelGain → destination`
- **Layer 1** = основният звук (library .opus, decode през Web Audio AudioBuffer, `loop=true`). Crossfade при смяна.
- **Layer 2** = фонов шум (генериран pink/brown ИЛИ file-based). „Hard swap" без crossfade.
- **safetyLimiter** = защита на слуха (никога не клипва над -12 dBFS). НЕ махай.
- **makeupCancelGain** = беше -6 dB (грешно — Web Audio compressor няма makeup gain); намален на **-3 dB** (1.0.105). Ако още е тихо → factor `0.0` = пълно махане.
- **volumeToGain:** master 100 → gain 1.0; perceptual крива (×2.2).

### Seamless loop (никаква граница)
- Някои файлове имат fade-in/out (от `prep_loop.py`) → пауза на шева при loop. `makeSeamlessLoop()` (при decode) прави overlap-add equal-power crossfade — запълва спада. Прилага се само ако открие fade (6 dB на 0.3s ръб); чистите файлове не се пипат.

### Resilience (`audio-resilience.js`) — НЕ пипай логиката
- Обвива публичните `AudioEngine.play/stop/pause/stopLayer1/2` → `beginSession`/`endSession` (intended state).
- Watchdog + statechange + visibility hooks → ако звукът „падне" докато `intended.playing` → го рестартира (wakeLock, фонова стабилност).
- ⚠️ **Капан:** всеки stop ТРЯБВА да мине през публичния `AudioEngine.stop` (не вътрешния), иначе watchdog съживява звука. (Sleep timer бъгът от 1.0.104.)

### Sleep timer
- `startSleepFade` → плавно затихване → `AudioEngine.stop()` (публичния!) при изтичане.

---

## 5. SERVICE WORKER / PWA / ОБНОВЯВАНЕ

- **Cache стратегии:** shell (HTML/CSS/JS) cache-first (версионен); i18n stale-while-revalidate; **manifest.json networkFirst** (ВАЖНО: проверката за manifest е ПРЕДИ `/audio/` правилото — иначе manifest заседва в постоянния CACHE_AUDIO; виж 1.0.98 fix); аудио cache-first (`auralis-audio-v3`, персистен).
- **Update механизъм:** index.html пита активния SW за версия → ако `SW.VERSION !== CODE_VERSION` → бутон „Обнови". Затова **двете версии трябва да са еднакви при release**.
- ⚠️ **Капан (важен!):** ако промени по библиотеката „не стигат" до устройство въпреки bump → провери дали нещо под `/audio/` се хваща от persistent cache (manifest.json е на `audio/library/manifest.json`). Виж `memory/project_sw_manifest_cache_bug.md`.

---

## 6. АУДИО БИБЛИОТЕКА — pipeline за добавяне на звуци

256+ звука (виж soundCount в manifest). Категории по елемент (category_audio).
**Добавяне на нов звук:**
1. Source WAV (Epidemic Sound) в `~/Downloads`.
2. `tools/ingest_waterfalls.py` (шаблон) → ffmpeg `loudnorm=I=-23:TP=-1:LRA=11,aresample=48000` → **Opus 96k + MP3 128k**.
3. Генерира manifest запис (id, filename `<NN_folder>/<id>.opus`, category_audio, categories_use, element-led bg_title, scores, recommended_noise/mix).
4. **scp** opus+mp3 → `root@104.248.19.8:/var/www/auralis/library_staging_compact/<NN_folder>/`. (Аудиото е gitignored — НЕ в git! Encode output в `tools/_wf_out/` също gitignored.)
5. Manifest → git → deploy.
- App fetch-ва на `library_staging_compact/<filename>` (audio-engine `audioUrl`).
- Одобрение/безопасност: `tools/audio_check.py` (peak < -3 dBFS, без спектрални пикове >4kHz, не бял шум, loop-годен; score ≥70). Seamless: `audio_normalize_v2.py` (trim + crossfade loop + -23 LUFS).
- Диагностика loop gap: `tools/check_loop_gap.py`. Прекатегоризация/имена: `tools/apply_library.py`, `apply_renames2.py`.

---

## 7. DEPLOY + ВЕРСИИ

```
git push origin main
ssh root@104.248.19.8 "cd /var/www/auralis && git pull origin main"
```
- Бъмпни `service-worker.js` VERSION + `index.html` CODE_VERSION ЗАЕДНО (еднакви).
- Без force push, без skip hooks. Commit co-author footer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Тестване: Claude_Preview MCP (python http.server :8099). ⚠️ Preview-ът сервира стар cached `<script>` при reload — тествай с cache-bust (`js/x.js?v=Date.now()`) + clone `#app`. Скрийншот блокира при активно аудио (headless) — ползвай DOM eval / preview_inspect.

---

## 8. STANDING CONSTRAINTS (НЕ нарушавай)
- НЕ пипай **audio-resilience.js** логиката (recovery). Само докладвай.
- Бъмпвай VERSION+CODE_VERSION заедно.
- id-та `ocean`/`meditation` в category_audio са код-зависими — не ги преименувай.
- 70+ + canon (no therapy claims).
- Тихол е продуктовият собственик; обича discuss → потвърждава → строиш. Технически решения → действай сам; продуктови/UX → питай.

---

## 9. ИЗВЕСТНИ / ОТЛОЖЕНИ (към 1.0.106)
- **Сила (#2 audit):** вдигната +3 dB; ако Тихол поиска по-силно → makeupCancelGain factor `0.0`. Чака финален ушен тест.
- **„Статистика" + „Импорт дневник"** — СКРИТИ (изключени от реалните данни: analytics не track-ва нищо реално + чете мъртвия `_` diary store). За връщане: свържи `Analytics.trackListen/SOS/Sleep/Profile` при реалните събития + пренапиши diary import/export към `AppState.diaryEntries` (тире, nested `{evening,morning,cbtCompleted}`).
- **Тема „Авто"** при cold boot пада на тъмна (boot скриптът в index.html + header toggle скриптът трябва да резолват matchMedia; рисково — отложено, козметично).
- **Двойна калибрация** в онбординга — вече махната (само да се знае).

---

## 10. ИСТОРИЯ НА СЕСИЯТА (1.0.87 → 1.0.106, 31.05–01.06)
- Тестове логика: единна „Моите тестове" секция (glass), THI степени, resume и за двата теста, „Спри засега"+„Започни отначало".
- Махната излишна калибрация от онбординг (1.0.90).
- Pitch A/B нова интеракция + премиум бутони + „Назад" (1.0.91, 1.0.101).
- Seamless loop fix (1.0.93).
- Библиотека по елемент + БГ имена + „Атмосфера" + 24 нови водопада (1.0.94–96, 99).
- SW manifest-cache fix (1.0.98) — критичен (промените не стигаха до устройства).
- Динамичен брой звуци в наука (1.0.100).
- Дневник автостарт + Home дневник-карта (1.0.102).
- Настройки cleanup — махнати мъртви „Напомняния" (1.0.103).
- **Pre-launch одит (workflow, 40 агента, 23 бъга): 1.0.104–106** — блокер (sleep timer) + 17 поправки + 3 скрити/отложени. Детайли в commit messages + `memory/project_current_phase.md`.

---

## 11. КЛЮЧОВИ ДОКОВЕ / ПАМЕТ
- `memory/MEMORY.md` (индекс) + `project_current_phase.md` (текущо състояние — чети!).
- `memory/project_sw_manifest_cache_bug.md` (важен капан).
- `docs/bibles/AURALIS_BIBLE_v3_PIVOT.md` (визия), `docs/research/*` (наука).
- `docs/canon/AURALIS_DESIGN_CANON_v1.md` (дизайн).

**— Край. Тихол: дръж това близо. Шеф-чат: чети §0 + §3 + §8 преди да пипаш код.**
