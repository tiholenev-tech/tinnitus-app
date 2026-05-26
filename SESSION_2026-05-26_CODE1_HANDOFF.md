# AURALIS — Session Handoff (Code 1 → Code 1-next)
**Date:** 2026-05-26
**Branch:** `main` @ `45beb6c`
**Last working state:** Phone test ongoing, audio infrastructure mostly stable, ProfileResults flow just restored. ProfileConfig matrix is live.

---

## 0. DESIGN SYSTEM — где да гледаш преди да правиш нова страница

**САКРАЛНО правило:** chat.php 1:1 tokens. Не интерпретирай, не подобрявай.
Източник: `runmystore/chat.php` редове 540–578 (mentioned в `css/tokens.css` header).

### Tokens (CSS variables)
- **`css/tokens.css`** — design tokens (hues, radii, transitions, neumorphism shadows, light/dark variants).
- HSL hue trio: `--hue1: 255` (indigo), `--hue2: 222`, `--hue3: 180` (teal).
- Radii: `--radius` (22px cards), `--radius-sm` (14px subsections), `--radius-pill` (999px buttons), `--radius-icon` (50%).
- Animations: `--ease` (cubic-bezier(0.5, 1, 0.89, 1)), `--ease-spring`, `--dur` 250ms, `--dur-fast` 150ms.
- **Light theme = neumorphism** (двойни shadow box: dark + light) на `#e0e5ec` базов фон.
- **Dark theme = blur + glass** на `#08090d` базов фон с `--border-color` визибилен.

### Primitives (винаги re-use, не дублирай)
- **`.glass`** в `css/base.css:186` — `glass + shine + glow` контейнер.
  Usage: `<div class="glass"><span class="shine"></span><span class="glow"></span><content/></div>`
- **`.aurora` + `.aurora-blob`** в `css/base.css:38` — 3 blurred animated background blobs (само dark theme).
- **Header** е в `index.html` (brand left + spacer + back-button/theme-toggle + settings right). НЕ render-ваш header в screen modules.

### Component library — къде са building blocks
| Component | File | Public API |
|-----------|------|------------|
| BottomSheet | `js/components/bottom-sheet.js` | `BottomSheet.open({ title, content, actions, height, showGrip, closeOnBackdrop, onClose })` |
| InfoPanel | `js/components/info-panel.js` | `InfoPanel.create({ title, body, faq, icon, expandable })` |
| ScaleSlider | `js/components/scale-slider.js` | `ScaleSlider.create({ labels, value, onChange }).mount(parent)` |
| ProgressDay | `js/components/progress-day.js` | `ProgressDay.render({ currentDay, completedDays })` |
| StreakBadge | `js/components/streak-badge.js` | `StreakBadge.render({ activeDays, freezesRemaining })` |
| BreathingOrb | `js/components/breathing-orb.js` | exhale/inhale animated circle |
| BackButton | `js/components/back-button.js` | popPhase from state.phaseHistory |
| Toast | `js/toast.js` | `Toast.show / success / warning / error` |

### Screen pattern (boilerplate за нова страница)
```js
window.MyScreen = (function () {
  'use strict';
  function el(id) { return document.getElementById(id); }
  function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function buildHtml() {
    return '<div class="ms-screen" data-screen="my_screen">' +
      '<h1 class="ms-title">...</h1>' +
      '<section class="ms-section">...</section>' +
    '</div>';
  }

  function render() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildHtml();
    app.addEventListener('click', onClick);
  }

  function open() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('my_screen');
    }
    history.pushState({ phase: 'my_screen' }, '');
    render();
  }

  return { open: open, render: render };
})();
```

### CSS naming pattern (BEM-lite, screen prefix)
- `.ms-screen` (root), `.ms-title`, `.ms-section`, `.ms-section-title`, `.ms-body`, `.ms-btn`, `.ms-btn--primary`, `.ms-btn--ghost`.
- Always include `[data-theme="light"]`, `:root:not([data-theme])`, `[data-theme="dark"]` variants for surface backgrounds.
- Light: `background: var(--surface); box-shadow: var(--shadow-card-sm);`
- Dark: `background: hsl(220 25% 6% / 0.5); backdrop-filter: blur(8px); border: 1px solid var(--border-color);`

### i18n
- Keys в `i18n/bg.json` (live) + `i18n/en.json` (TODO placeholders).
- `window.i18n.t(key, fallback, params)` за strings.
- `window.i18n.tObj(key)` за nested objects/arrays.
- TODO marker pattern: `"TODO: ..."` strings get stripped via `tOrNull()` helper:
  ```js
  function tOrNull(key) {
    if (!window.i18n || !window.i18n.t) return null;
    var v = window.i18n.t(key, null);
    if (typeof v !== 'string' || v === key || v.indexOf('TODO:') === 0) return null;
    return v;
  }
  ```

### Wire нова страница
1. `index.html` — добави `<link rel="stylesheet" href="css/my-screen.css">` + `<script src="js/my-screen.js"></script>` преди `js/app.js`.
2. `js/state.js` — добави phase string в `PHASES` array + (ако restorable след reload) в `RESTORE_OK` whitelist.
3. `js/app.js` — `route()` handler за phase: `if (phase === 'my_screen' && window.MyScreen) { window.MyScreen.render(); return; }`.
4. `js/components/back-button.js` — `rendererFor()` dispatch table: `'my_screen': window.MyScreen`.

### Audio (ако screen-ът ще пуска звук)
- **НИКОГА** не извиквай `AudioEngine.playLayer1` директно. Минавай през `Player.open(soundId)` или `Player.openCore(soundId)`.
- ProfileConfig е single source of truth за mix/volume/noise — виж `js/profile-config.js`.

---

## 1. Commits направени днес (newest first)

```
45beb6c DEBUG: aggressive Player.open logging за phone test diagnosis
32386fd FIX 3-IN-1: restore ProfileResults flow + expand preload + cap bump
2a957e8 FIX SLIDER-INTERFERENCE: programmatic slider value не trigger-ва audio reset
40e64fc FIX SEQ-REVEAL-TIMERS: cancel pending L2 setTimeout + L1-then-L2 ordering
044733a FIX MEDITATION-NO-NOISE + SLIDER-CANCEL (BUG2 + BUG3)
e5e3abc FIX FLIGHT-TOKEN: правилен race condition guard в playLayer1 (BUG1)
bff36fc FIX SEQ-REVEAL-BUG: Layer 1 inaudible — exponential ramp → linear
fff0eb6 FIX MEDITATION-FILTER-V2: by-CSV category (not filename keywords)
fec2a5b FEAT SEQ-REVEAL: layered fade-in + animated sliders
d64ccd6 FEAT AUDIO-PRELOAD: prefetch top 5 в category
c17cb8d FIX NOISE-CAP: temp 30% cap на Layer 2 (later removed by Code 2)
3147968 FIX MEDITATION-STRICT: whitelist + blacklist филтър
2a69fc3 FIX SKIP-MIDDLEWARE: category → Player директно
64ee6ba FIX NAV-PLAYER-HOME: Player back винаги стига до валиден phase
65f0a95 FIX CAT-SORT + CAT-MEDITATION: profile-score sort + real meditation filter
dd6520f FEAT PROFILE-CONFIG: 60-scenario matrix per profile
601b0b3 REVERT SAFETY-1: remove category-based mix inverse
b11a2e0 FIX SAFETY-3: Headphones warning bottom sheet при първо отваряне на Player
f4bdc01 FIX SAFETY-4: Soft warning при високи нива (>55% нощем, >70% денем)
3d05a9a FIX A2.6: sound switch sequential pipeline + flight token + phantom audio
57315f6 FIX A2.5: mini-player body tap — explicit button reset + 48px tap target
8983874 FIX A2.4: Back от Player вече не loop-ва обратно в Player
8ad57bc FIX A2.3: Play button optimistic icon update + verify timer
9686829 FIX A2.2: slider drag — touch-action: pan-x вместо none
809b28e FIX NAV-STALE: skip completed quiz/onboarding from BACK history
2d84c54 FIX DIARY-MERGE: redirect old diary → diary_hub
469a53e FIX NAV-STACK: history stack replaces single previousPhase slot
79c64f6 FIX A2.1: volume balance — perceptual curve (pow 2.5) + L2 default 50%
53ea2ac FIX Д5: error banner UX — silent retry x3 + close suppression + no counter
b5c6e41 FIX Д4: Player.close hard-stop + slider touch fix + mini-player body tap
d747b55 FIX Д1-Д3: audio URL пътища + debug logging (root cause: 404)
91d43e6 FEAT 3.1E: js/cbt-day.js
4b8f41d FEAT 3.1D: js/diary-evening.js
a6ff569 FEAT 3.1C: js/diary-hub.js
cc84cdd FEAT 3.1B: js/thi-baseline.js
5d1262e FEAT 3.1A: state model + route() handlers за 14-day program
42c5d9f FIX BUG2-H: Дневник X close handler → Home
5d48085 FIX BUG2-G: "Към звуците" CTA → Home + replaceState
5a0ef2d FIX BUG2-F: Profile Results показва САМО Badge + meaning + timeline
b778867 FIX BUG2-E: премахни "Кога НЕ се ползва" от sheet
0ebc05f FIX BUG2-D: премахни duration display от sound UI
8a33f9c FIX BUG2-C: Layer 1 (main sound) сега се стартира при Player.open
bb911e3 FIX BUG2-B: filter corrupt/empty audio files + robust Player findSound
0f363f8 FIX BUG2-A: human-readable БГ sound titles (бутана от sound_id)
87dc5c8 FIX BUG F: route() falls back to Home (not Quiz) when quiz е приключен
514484f FIX BUG D: clear quiz state when returning to onboarding welcome
3352b12 FIX BUG C: post-quiz finish → ProfileResults (not Library)
2afa5c0 FIX BUG B: round duration seconds
f4d32d1 FIX BUG A: i18n force BG by disabling navigator.language detect
507048e Add Opus content + scoring CSV
3807c99 CHORE: I1.2.C — i18n coverage verifier
aef373a FEAT: I1.2.B — integrate Opus profile advice
7bc142e FEAT: I1.3 — TopSoundsCarousel Strategy 0 (per-profile scoring)
ace0580 FEAT: I1.2.A — integrate Opus category info JSON into i18n
72cf6fc FIX: I1.1 — manifest CSV warnings + per-profile scoring
```

---

## 2. Архитектурни промени (концепции)

### NAV-STACK (`commit 469a53e`)
- Преди: `state.previousPhase` single slot → BACK loop-ваше.
- Сега: `state.phaseHistory[]` array (cap 20). `transition(to)` push-ва `from`. Нов метод `popPhase()` pop-ва БЕЗ re-push.
- `state.previousPhase` остава като getter (top of stack) за backward compat.
- `reset()` clear-ва history.
- `back-button.js onBack()` ползва popPhase + renderer dispatch table.

### PROFILE-CONFIG (`commit dd6520f`)
- Single source of truth: `js/profile-config.js`.
- 5 profile × 6 scenarios × 2 (day/night) = 60 hard-coded configs.
- API: `ProfileConfig.resolveFor(sound, soundId)` → `{ layer1Vol, layer2Vol, masterVol, noise, reveal, profile, scenario, isNight, fromOverride }`.
- User overrides per soundId (slider drag debounced 800ms saves to `state.userOverrides[soundId]`).
- `NOISE_BY_SCENARIO['meditation'] = 'none'` override (без фонов шум при meditation).
- Mix matrix per profile:
  - TH_C: 0.65–0.70 / 0.30–0.35 (тонален високочестотен, дoминантен главен звук)
  - DN_S: 0.40–0.55 / 0.45–0.60 (сън, фон по-силен)
  - SS_R: 0.30–0.50 / 0.50–0.70 (стрес, balanced + SOS anxiety dominant noise)
  - SM_F: 0.50–0.85 / 0.15–0.50 (соматичен)
  - HB_M: 0.60–0.95 / 0.05–0.40 (адаптиран лек)

### FLIGHT-TOKEN (audio-engine.js, `commit e5e3abc`)
- `currentFlightToken` глобален counter incremented на `playLayer1` / `playUrl`.
- `playLayer1Spec(presetId, spec, opts, myToken)` проверки на 2 места:
  1. След `resumeContext` (преди fetch) — cached buffer scenario
  2. След `fetchAndDecode` resolves — late buffer scenario
- При mismatch → return (skip startLayer1Source).
- `getCurrentFlightToken()` exposed за SEQ-REVEAL animation cancel.
- Допълнителен Player-level token `openFlightToken` (`A2.6`) — двупластова защита.

### SEQ-REVEAL (audio-engine.js, `commit fec2a5b` + последващи)
- Layered fade-in: L1 starts → L1 promise resolves → schedule L2 setTimeout (delay-Sec) → L2 starts.
- `pendingL2RevealTimer` global tracker; cancel-ва се при нов SEQ-REVEAL call, stopLayer1, pause, stop.
- `activeRevealRequest` counter; stale revealReq → ABORT във всеки phase.
- Dispatches `audio:reveal-l1` / `audio:reveal-l2` events с `{ targetVol, duration }`.
- Player listens → `animateSlider()` с `programmaticAnimation` flag (предотвратява onInput trigger от animated value change).
- Fade type: `linearRampToValueAtTime` (НЕ exponential — exponential е back-loaded → inaudible първите ~60% от fade).

### AUDIO-PRELOAD (audio-engine.js + category-view.js)
- `AudioEngine.preloadSound(soundId)` — public API. Lookup в manifest → fetchAndDecode → cache.
- LRU queue, `PRELOAD_LIMIT = 20`.
- CategoryView render → setTimeout(500) → preload top 15 sounds staggered (300ms gaps).

### Audio path (Д1-Д3, `commit d747b55`)
- Audio files са в **`library_staging_loop_ready/<filename>`**.
- `audio/library/` съдържа САМО `manifest.json`.
- Fetch URL: `library_staging_loop_ready/01_ocean/...wav`.

### Volume curve (A2.1, `commit 79c64f6`)
- `volumeToGain(vol) = Math.pow(vol/100, 2.5)` (perceptual, не linear).
- Brown noise (1/f² spectrum) има огромна low-freq energy → линеен 50% звучи като 80% perceived.

---

## 3. Файлове създадени днес (нови modules)

### JS
- `js/profile-config.js` — ProfileConfig 60-scenario matrix
- `js/thi-baseline.js` — 25-question THI assessment (Wave 3.1-B)
- `js/diary-hub.js` — 14-day program central hub (Wave 3.1-C)
- `js/diary-evening.js` — 5-question evening diary (Wave 3.1-D)
- `js/cbt-day.js` — daily CBT exercise screen (Wave 3.1-E)
- `js/category-info-sheet.js` — учебен bottom sheet за категории (P4.2)
- `js/headphones-warning.js` — SAFETY-3 educational sheet
- `js/volume-calibration.js` — SAFETY-2 mixing point calibration

### CSS
- `css/category-info-sheet.css`, `css/thi-baseline.css`, `css/diary-hub.css`, `css/diary-evening.css`, `css/cbt-day.css`, `css/headphones-warning.css`, `css/volume-calibration.css`

### Tools (Python)
- `tools/merge_category_info.py` — Opus JSON → i18n integration
- `tools/merge_profile_advice.py` — Profile advice markdown → i18n (LINTER MODIFIED — re-check)
- `tools/audio_audit.py` — automated balance/loop check (Code 2 added)
- `tools/audio_normalize.py` — batch LUFS + loop fix (Code 2 added)

### Docs / Content (от Opus content team)
- `docs/content/AURALIS_CATEGORY_INFO_JSON.json`
- `docs/content/AURALIS_PROFILE_ADVICE_v1.md`
- `docs/content/AURALIS_USE_CASES_S1_S4.md`
- `docs/content/AURALIS_S5_S6_FINAL.md`

---

## 4. Файлове активно модифицирани

| Файл | Защо |
|------|------|
| `js/audio-engine.js` | Flight token, SEQ-REVEAL, preload, path fix (library_staging_loop_ready/), perceptual curve, linear fade |
| `js/player.js` | SEQ-REVEAL integration, slider animation, programmaticAnimation flag, openFlightToken (A2.6), HeadphonesWarning gate, openSoundInfo bottom sheet, mini-player tap |
| `js/state.js` | NAV-STACK phaseHistory, 14-day program state nodes, userOverrides, popPhase/clearPhaseHistory |
| `js/app.js` | route() handlers за нови phases, popstate handlers (player→replaceState), bootstrap auto-start DISABLED |
| `js/category-view.js` | profile-score sort, top 30 cap, meditation strict filter, preload top 15, openSound→Player |
| `js/components/back-button.js` | popPhase usage, renderer dispatch table, STALE skip list |
| `js/components/audio-error-banner.js` | silent retry x3, suppress API |
| `js/components/top-sounds-carousel.js` | Strategy 0 — per-profile scoring |
| `js/profile-results.js` | Само Badge + meaning + timeline visible (BUG2-F) |
| `js/library.js` | bg_title fallback, мini-player body tap action |
| `js/diary.js` | Redirect Diary.open → DiaryHub.open (DIARY-MERGE) |
| `js/sound-detail.js` | bg_title, премахната category-mix-inverse (REVERT SAFETY-1) |
| `js/calm.js, js/sleep.js, js/mixer.js` | bg_title fallback в title accessors |
| `js/i18n.js` | navigator.language detect DISABLED (force BG) |
| `tools/build_manifest.py` | bg_title generation, profile scoring columns, normalize verbose noise IDs, file size check |
| `i18n/bg.json` | Opus content integrated: categoryInfo + profile_results.profiles |
| `index.html` | 8+ new script + CSS includes |

---

## 5. ❗ Известни bugs които НЕ са fix-нати

### Critical (phone test confirmed)
1. **Player не се отваря от sound list** (user report от 2026-05-26 morning).
   - Симптом: tap sound в CategoryView → нищо не става. Debug logs добавени в `45beb6c`.
   - Hypothesis: Може да е HeadphonesWarning sheet блокираш, или silent throw в openCore. Не verified.
   - **Action:** User да отвори DevTools console на phone, tap sound, прати logs.

2. **30s delay при play на non-preloaded sounds.**
   - Root cause: fetch + decodeAudioData на 5-15 MB .wav е bavно на mobile network.
   - Mitigation: preload top 15 в CategoryView. НЕ пълно решение за tap на sound 16-30.
   - **Action:** Code 2 audio_normalize.py трябва да compress-не файлове или конвертира към .mp3/.opus за по-малък размер.

3. **Back от Player не винаги връща в CategoryView** (user observation).
   - Изглежда връща Home директно. NAV-STACK logic правилен на хартия.
   - Не reproduced на desktop. Може да е timing-specific (state.phaseHistory cleared somewhere).
   - **Action:** Прибавена е stack snapshot logging — read console.

### Medium
4. **Първият Player.open може да задължава HeadphonesWarning sheet** — ако user не може да тапне "Разбрах", buttons appear unresponsive. closeOnBackdrop=false. Sheet height='auto'.
5. **TopSoundsCarousel е disabled** в ProfileResults (BUG2-F). Manifest scoring е готов (Strategy 0), но карусел-секцията е коментирана.
6. **SoundDetail screen е deprecated**. Тапна звук в CategoryView отваря Player директно (SKIP-MIDDLEWARE). Модулът остава intact като fallback, но няма entry point.
7. **Stale `auralis-phase` localStorage** от стари версии. `state.load()` migrate-ва legacy phases към 'home'.

### Low / Cosmetic
8. **i18n EN е TODO placeholders** — DeepL Phase 2 ще ги попълни.
9. **CBT day content е placeholder** ("TODO 3.2: ..."). Wave 3.2 ще донесе real CBT content.
10. **THI baseline questions** са "ВЪПРОС N: TODO 3.2". Wave 3.2.

---

## 6. Pending tasks (TODO comments в кода)

```
js/cbt-day.js:6:    Content е placeholder ("TODO 3.2") до Wave 3.2.
js/cbt-day.js:44–51: TODO 3.2 за day title / description / steps / reflection
js/diary-hub.js:118: TODO 3.2 за action card description
js/thi-baseline.js:89: TODO 3.2 за question texts
js/mixer.js:30: TODO(Task 7d): брой файлове от tools/audio-library-status.md
js/mixer.js:653: TODO(future): open category drilldown
js/settings.js:5,171: TODO за multi-language support (12 езика)
js/profile-results.js: secondary sections коментирани, очакват Wave 3.2 content
```

### Wave 3.2 expectations (content team):
- 14 CBT дни (БГ съдържание)
- 25 THI questions (БГ + EN)
- Profile advice timeline detail
- Real meditation library audit (singing bowls, gongs, mantra mp3-ове)

### Wave 3.3 expectations (Code 1):
- Enrollment бутон в Settings (старт на 14-day program — manually, без auto-trigger от bootstrap)
- Progress screen (`js/progress.js`) — 14-day visualisation
- Diary morning screen (`js/diary-morning.js`)
- Streak freeze UI

---

## 7. Стратегия която следвах

1. **Mocks → Real** — започвах с placeholder data (TODO markers), след това content team (Opus) попълваше през CSV/JSON, integration tools (`tools/merge_*.py`) насипваха в i18n.
2. **Race fixes via flight tokens** — двойнa защита: Player.openFlightToken + AudioEngine.currentFlightToken. Stale promises се cancel-ват на 3-4 нива (pre-fetch, post-decode, pre-startLayer, animation RAF).
3. **Profile-based personalization** — ProfileConfig е single source of truth. Нула изчисления в runtime — всичко hardcoded.
4. **Defense-in-depth fallbacks** — всеки text accessor има 3+ fallback нива (i18n key → manifest field → hardcoded constant → raw id).
5. **CSS theme isolation** — всеки светъл/тъмен стил е отделен; никога не разчитай на default.
6. **History stack (NAV-STACK)** — реално dual-tracking: AppState.phaseHistory (програмен) + browser history.state (popstate). replaceState за consumed entries (player, profile_results).

---

## 8. Каквото ХОТЕЛОСЕ да направя, но не успях

1. **Phone test diagnosis за "Player не се отваря"** — debug logs push-нати, чакаме console output.
2. **Code 2 audio_normalize.py integration** — noise pack -18 LUFS → -26 LUFS. Code 2 направи tool-а, аз temporary cap-нах L2 на 30%. Linter след това removed cap, но не verified дали normalization е applied на disk.
3. **30s delay → preload aggressive** — направи 5→15 sounds. Но същинският fix е mp3/opus encoding (5x smaller files).
4. **SoundDetail middleware cleanup** — модулът остава intact като dead code. Wave 3.2 трябва да го изтрие.
5. **Settings enrollment бутон за 14-day program** — auto-start е disabled, но няма manual entry. User не може да стартира програмата.
6. **TopSoundsCarousel re-enable** — Strategy 0 (scoring) готов, но секцията е коментирана в ProfileResults (BUG2-F). Hand-curated content нужен преди re-enable.
7. **Real meditation library audit** — meditation filter blocks ambient/natural keywords, but library е predominantly natural. ~20 sounds passing filter. Need real sing-bowl/gong/mantra files.
8. **Progress screen (`window.Progress`)** — DiaryHub action "Прогрес" опитва window.Progress.render → fallback Toast. Module не съществува.
9. **DiaryMorning screen** — phase declared в state.js, route handler exists, but `window.DiaryMorning` module не съществува.

---

## 9. ⚠️ WARNING-и за следващия Claude instance

### Audio engine
1. **НЕ пипай SEQ-REVEAL без да четеш ProfileConfig първо.** Timing идва от `ProfileConfig.getRevealTiming(profile)`. L1FadeSec / L2DelaySec / L2FadeSec са профил-specific.
2. **НЕ използвай `exponentialRampToValueAtTime` за fade-IN от 0.** Е back-loaded → първите 60% от fade time звукът е inaudible. ВИНАГИ `linearRampToValueAtTime` за fade-in.
3. **НЕ извиквай `playLayer1` директно от screen-и.** Player.open е единственият entry point. Иначе няма flight token + applyProfileConfig + UI rendering + state transition.
4. **НЕ track-ваш `setTimeout` без cancel.** Виж `pendingL2RevealTimer` pattern — track + cancel на всеки нов call + при stopLayer1/pause/stop.
5. **НЕ присвоявай `slider.value = X` без `programmaticAnimation` flag.** Mobile browsers (някои) fire-ват `input` event → onL1Input → setLayer1Volume → kill audio fade.

### Navigation
6. **НЕ извиквай `state.transition(prev)` от back-handler.** Това push-ва back-target като нов entry → loop. Виж `popPhase()` — НЕ re-push-ва.
7. **НЕ преди-разваляй stack history** при quiz reset. `clearPhaseHistory()` е safe (reset() + back-empty case).
8. **`history.replaceState` за consumed phases** (player on close, profile_results след "Към звуците"). pushState за nested entries.

### State
9. **`AppState.programStartDate == null` означава не-enrolled.** Bootstrap auto-start DISABLED (виж `js/app.js`). Не енроли потребителя без explicit user action.
10. **`isQuizDone()` + profile state** — quiz.markQuizDone сетва profile + DI score. ProfileResults очаква `state.profile` truthy.

### CSS
11. **НЕ дублирай tokens.** Виж `css/tokens.css`. Add нови HSL hues с `--hue4` ако трябва.
12. **НЕ хардкодвай цветове.** Винаги `hsl(var(--hue1) X% Y%)` или `var(--surface)` etc.
13. **Light theme = neumorphism**, dark theme = blur + glass. НЕ копирай light shadows в dark.

### Audio files
14. **Runtime fetch path: `library_staging_normalized/<rel>`.** НЕ `audio/library/` (там е само manifest). НЕ `library_staging_loop_ready/` (това е build source за `build_manifest.py`, не runtime serve dir). Updated 2026-05-26 от P0.3 — преди това doc-ът беше outdated след DEPLOY normalize step.
    - `audio-engine.js` (canonical) → `library_staging_normalized/`
    - ⚠ `js/library.js:515` + `js/calm.js:247` все още имат hard-coded `library_staging_loop_ready/` — flagged за P1 cleanup.
    - `tools/build_manifest.py` DEFAULT_SOURCE сочи към `library_staging_loop_ready/` (curated master). Двете папки имат идентична file structure (256 .wav), но normalize pipeline може да въведе delta.
15. **Не decode-вай същия URL paralelно — fetchAndDecode cache-ва.** Multiple concurrent fetchAndDecode (url) → multiple fetches → wasteful (но не buggy).

### i18n
16. **TODO: prefix в bg.json означава placeholder.** `tOrNull()` strip-ва. Не render-ва "TODO:".
17. **EN е изцяло TODO.** Не интегрирай EN content докато DeepL Phase 2 не приключи.

### Manifest
18. **`auralis_library_categorization.csv` е source of truth за categories_use, recommended_noise, recommended_mix_ratio, и profile scores.**
19. **`build_manifest.py` нормализира verbose noise names** (`brown_lowpass_500` → `brown_lp500`). НЕ rename audio-engine NOISE_MAP keys без to update нормализация.

### Coordination с Code 2
20. **НЕ пипай `js/components/*` без проверка.** Code 2 territory. Изключения: top-sounds-carousel.js (mine), back-button.js (mine for NAV-STACK), audio-error-banner.js (mine for Д5).
21. **НЕ пипай `js/player.js` core mock-ове** в горната част на файла. Code 2 ги пишеше за дизайн testing преди audio-engine.js да съществува.

---

## 10. Quick re-orientation за следваща сесия

```bash
# Sanity check
git pull --no-rebase --no-edit
git log --oneline -5
node -c js/audio-engine.js && node -c js/player.js && echo OK

# Build manifest (if library files changed)
python tools/build_manifest.py

# Sanity audio path
ls audio/library/        # Should have ONLY manifest.json + template
ls library_staging_loop_ready/01_ocean/ | head -5  # Real files

# Run / serve
# python -m http.server 8000  → http://localhost:8000

# Phone test workflow
# 1. Hard refresh (Ctrl+F5)
# 2. Open DevTools console (Eruda widget if PWA)
# 3. Reproduce bug
# 4. Copy console logs → next Claude session
```

**HEAD = `45beb6c` on `main`.** Phone test чака потребителски console output за Player.open path tracing.

— Code 1, 2026-05-26
