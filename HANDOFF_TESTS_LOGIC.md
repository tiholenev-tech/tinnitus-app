# HANDOFF — Логика на тестовете (кога се показват / запазват) + бъгове

**Дата:** 2026-05-31 · **Версия в момента:** 1.0.87 · **Launch:** ~седмица (за реални клиенти, НЕ бета)

> Свеж чат: прочети това + `memory/MEMORY.md` (auto-memory). Целта на Тихол:
> **изясни и поправи логиката „кой тест кога се показва и кога се запазва"**,
> сложи **ясни имена/индикация** на тестовете, и поправи 2 бъга (долу).

---

## 0. Бързи факти за средата
- **Deploy:** `git push origin main` → `ssh root@104.248.19.8 "cd /var/www/auralis && git pull origin main"`. Served на **https://tinnitus-app.help** (Apache, DocumentRoot `/var/www/auralis`).
- **При всеки release:** бъмпни `var VERSION` в `service-worker.js` И `var CODE_VERSION` в `index.html` (трябва да са еднакви) → SW cache:'reload' дърпа свежи файлове.
- **Аудиото** (`library_staging_compact/*.opus` + `.mp3` fallback) е gitignored, само на сървъра. Не го пипай.
- **Потребители 70+**, целият copy е на български. **Canon: никога „терапия"/„лечение"** в copy (виж memory).
- **Преглед/тест:** Claude_Preview MCP (python http.server :8099). ВНИМАНИЕ: preview-ът често сервира **стар cached `<script>`** при reload — тествай като инжектираш свеж модул с cache-bust (`js/x.js?v=Date.now()`) + клонирай `#app` за да махнеш стари listeners. Дългите hold-жестове в pitch теста НЕ се тестват добре (requestAnimationFrame throttle в background tab).

---

## 1. Трите „теста" — файлове, вход, запазване

| # | Тест | Файл | Запазва в state | localStorage ключ | „Направен?" проверка |
|---|------|------|-----------------|-------------------|----------------------|
| 1 | **Quiz (15 въпроса)** — профил | `js/quiz.js`, `quiz-engine.js`, `quiz-data.js` | `AppState.profile` (TH_C/DN_S/SS_R/SM_F/HB_M) | — | има профил |
| 2 | **THI baseline (25 въпроса)** — тежест на тинитуса | `js/thi-baseline.js` | `AppState.thiBaseline` (0..100) | `auralis-thi-baseline` | `typeof thiBaseline === 'number'` |
| 3 | **Pitch тест (честота)** — за notch | `js/pitch-test.js` | `AppState.pitchTests[]` (всеки `{freq, ...}`) | `auralis-pitch-tests` | `isPitchTestDone()` = `pitchSkipped || pitchTests.length>0`; **честота:** `getNotchFreq()` (последен запис, freq>0, не skipped, не disabled) |

state методи (в `js/state.js`): `setThiBaseline`, `addPitchTest` (ред ~497), `isPitchTestDone` (~523), `getNotchFreq` (~548), `isNotchActive` (~539).

---

## 2. ТЕКУЩА логика „какво се показва кога" (объркана — за изчистване)

### Онбординг (нов потребител), routing в `js/app.js` + модулите:
`quiz (15q) → profile_results → calibration (VolumeCalibration) → pitch_test → home`

- **THI (25q) е МАХНАТ от онбординга** (commit `08c821f`, в `volume-calibration.js finishCalibration` — премахнат `needsThi` клон). Сега THI се прави по-късно по желание.
- ⚠️ **ОТКРИТ ПРОБЛЕМ (TODO):** в онбординга има **ДВЕ калибрации на силата** — старата `volume-calibration.js` (mixing point, плъзгач) + новата авто-усилваща в самия pitch тест (`pitch-test.js renderCalibration/startCalibRise`). Редундантно. Обмисли да махнеш `volume-calibration` от онбординг chain-а (app.js ред ~378 „SAFETY-2 calibration redirect" + `volume-calibration.js`), защото pitch тестът вече прави level calib + плеърът има master плъзгач.

### Начален екран (`js/home.js`), банерите се рендерят ~ред 720-733:
- `buildThiBanner()` (ред 362): ако `thiBaseline === null` → показва **„Кратка оценка на тинитуса (по желание)"** (data-action `thi-retest` → `openThiRetest` → `ThiBaseline.open()`). Ако baseline има + ден≥13 → retest банер.
- `buildPitchBanner()` (ред 446): 
  - done & има freq → **„Вашата честота / Намерена: {hz} Hz. Уточни честотата"** (data-action `pitch-retest` → `openPitchTest`).
  - done без freq → **„Тестът беше пропуснат / Направи тест"**.
  - не done → **„Открийте честотата… / Направи тест"**.
- `buildThiBadge()` (ред 400): само ако `thiBaseline` число.
- `buildThiRetestSectionHtml()` (ред 655) + `buildVolumeCard()` (ред 531, master сила) също се рендерят.

`openPitchTest()` (home.js ~498): precise/дълъг режим **само ако** `getNotchFreq()` връща валидна честота; иначе quick (кратък + награда). ✅ (вече поправено).

---

## 3. ПРОБЛЕМИТЕ (докладвани от Тихол, 31.05) — за решаване

### Бъг A — Pitch тестът „не запазва резултата"
Тихол: *„бях на 7-8 нещо кХц, връщам се в основното меню — не го запаметява. И при втори път пак ме пита „Уточни честотата" — значи не запаметява."*

- В **1.0.87** добавих `saveResult(octaveState.base)` в `pitch-test.js` **още щом честотата е намерена** (октавната проверка), ПРЕДИ финалния слайдер — за да се запазва дори без да довърши слайдера. (Преди това save беше само при бутона „Това е моят тон" на слайдера → ако напусне, нищо не се пазеше.)
- **ЗА ПРОВЕРКА от свежия чат:**
  1. Тихол на **1.0.87** ли е реално? (cache на телефона — да презареди). Възможно е да е тествал стара версия.
  2. Реално ли `saveResult` → `addPitchTest` персистира в `auralis-thi…` → `auralis-pitch-tests`? Провери в DevTools localStorage след тест.
  3. **UX объркване:** банерът за done&freq ВИНАГИ пише „Уточни честотата" → ИЗГЛЕЖДА сякаш „пита пак / не е запазено", въпреки че Е запазено. Може това да е възприятието на Тихол. → Покажи ясно „✓ Тестът е направен · Вашата честота: X kHz" + дискретен „уточни".
  4. Възможно: `octaveState.base` става null/NaN при някакъв път → freq=null → „skipped" банер. `saveResult` има fallback към `bayesMeanHz()`, но провери целия октавен flow (`nextOctaveStep`, `pitch-test.js` ~726-812).

### Бъг B — THI (25 въпроса) „въобще не излиза да го направя"
Тихол: *„третият тест с 25 въпроса въобще не ми излиза да го правя."*

- Трябва да се показва като home банер **„Кратка оценка на тинитуса (по желание)"** (`buildThiBanner`, когато `thiBaseline === null`). 
- **ЗА ПРОВЕРКА:** (1) рендерира ли се изобщо (`buildThiBanner()` се вика на ред ~726 в home render)? (2) `thiBaseline` дали случайно НЕ е null (т.е. вече има стойност от стар тест → банерът се крие)? (3) `ThiBaseline.open()` работи ли (отваря 25-те въпроса)? (4) Най-вероятно: банерът **не се разпознава като „тест"** — няма ясно име/секция. Тихол иска ясна индикация кои са тестовете.

### Заявка C — изясни логиката + сложи ИМЕНА
Тихол: *„трябва да се изясни логиката на тестовете — кога се показват кога не. Горе трябва да има в името кои тестове са. Дай да видим цялата логика, просто е."*

→ **Препоръка:** направи **една ясна секция „Моите тестове"** на началния екран със 3-те теста, всеки с **име + статус** („✓ направен" / „не е направен" / „по желание") + ясен бутон. Маха объркването от разпръснатите банери (`buildThiBanner` + `buildPitchBanner` + `buildThiBadge` + `buildThiRetestSection` + `buildVolumeCard` са твърде много отделни неща).

---

## 4. Скорошни промени (контекст за регресии)
- `1.0.78` SW desync fix (`{cache:'reload'}`). `1.0.79` калибрация default най-силно. `1.0.80` MP3 fallback за Opus. `1.0.81` research-grade pitch (NBN + Bayesian). `1.0.82` 70+ воден redesign (плеър master, авто-усилваща калибрация, ден-гейтинг, THI извън онбординг). `1.0.83` стимул-по-тип (тон за тонален / NBN за шумов) + hold-to-select (задръж=избери, без избор-бутони, без „− Сила +"). `1.0.85/86` mix-hint popup на плеъра. **`1.0.87` save-at-octave fix (Бъг A опит).**
- **Pitch тест поток сега:** pretest (тип) → device (слушалки) → авто-усилваща калибрация (СПРИ) → 5 hold-замервания (quick) → октавна проверка → **saveResult** → финален слайдер „нагласи точно своя тон" → **награда** (notched шум + „усетихте ли разлика") → home. Precise (Ден-2) = до 20 замервания.

## 5. Standing constraints (НЕ нарушавай)
- НЕ пипай audio recovery логиката (`audio-resilience.js`).
- Бъмпвай VERSION+CODE_VERSION заедно при всеки deploy.
- Без force push, без skip hooks. Commit co-author footer: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- Тихол е продуктовият собственик; обича да обсъжда → потвърждава → строиш. За големи решения питай.
