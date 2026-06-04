# AURALIS — HANDOFF за нов чат (Capacitor + deploy) — 2026-06-04

> Предишен чат построи Capacitor обвивката (Фаза 1 + Фаза 2 + два device fix-а).
> Новият чат има **remote/droplet достъп** — затова №1 задача е **DEPLOY** (виж §3).
> Език: български. Аудиото НЕ е в git (rsync отделно).

---

## 1. ПРОЧЕТИ ПЪРВО (по ред)
1. **`AURALIS_BIBLE_PHASE2.md`** (repo root) — ВОДЕЩ Фаза-2 bible (дистрибуция, пазари, цена, SEO/GEO, checklist). Помирява старите доки (06-02 води: Capacitor СЕ ПРАВИ, BG→Италия, €19.99 еднократно).
2. **`CAPACITOR_TEST_GUIDE.md`** (repo root) — как се тества APK + дебъг (chrome://inspect).
3. **`AURALIS_MASTER_2026-06-02.md`** §1+§3 — аудио бъг диагноза + Capacitor план.
4. **`HANDOFF_MASTER_2026-06-01.md`** — техническата архитектура на кода (audio engine, layers, state).
5. Памет: `memory/project_capacitor_phase1.md`, `memory/MEMORY.md`.

⚠️ Старите библии (`docs/bibles/`, `AURALIS_BIBLE_v3_PIVOT.md`) са ОСТАРЕЛИ по дистрибуция/цена. Научната част е валидна.

---

## 2. КАКВО Е СВЪРШЕНО (branch `feat/capacitor-android`, PR #3 — ОТВОРЕН, НЕ мерджнат)

### Capacitor обвивка (server-served, зарежда живия сайт)
- `mobile/` — Capacitor 6. `server.url = https://tinnitus-app.help`, appId `help.tinnitusapp.app`, appName AURALIS.
- `mobile/android/` — native проект, комитнат.
- **Build: GitHub Actions** (`.github/workflows/android-build.yml`) → debug APK артефакт. Java НЕ е нужна локално. Тригери: push към main, PR към main, workflow_dispatch.
- Свали APK: `gh run download <run-id> -n AURALIS-APK -D <dir>`.

### Фаза 2 — foreground service (реалния fix за заключен екран)
- `AudioKeepAliveService.java` — foreground service (type mediaPlayback, START_STICKY, тиха нотификация). Държи процеса жив; НЕ свири сам (звукът е от WebView).
- `ForegroundAudioPlugin.java` — Capacitor plugin start()/stop(). Регистриран в `MainActivity`.
- `AndroidManifest.xml` — permissions: FOREGROUND_SERVICE(+_MEDIA_PLAYBACK), POST_NOTIFICATIONS, WAKE_LOCK + декларация на service-а.
- `js/capacitor-native.js` — закача service-а за `auralis-session-start/end`. **Инертен за web/PWA** (строг `isNativePlatform` guard, проверен в preview).

### Device fix-ове (от пръв тест на Samsung Z Flip6)
- **Back бутон** излизаше от app-а → добавен `@capacitor/app` plugin + handler в `capacitor-native.js`: затвори bottom-sheet → history.back() → exitApp.
- **Headphones warning бутон под екрана** → `css/components/bottom-sheet.css`: `max-height: 85dvh` (+ 85vh fallback). vh в WebView се смяташе спрямо по-голям viewport.

### Версия: 1.0.109 (index.html CODE_VERSION + service-worker.js VERSION — бъмпват се ЗАЕДНО).

### Документи създадени: `AURALIS_BIBLE_PHASE2.md`, `CAPACITOR_TEST_GUIDE.md`, този файл.

### Последно APK (всички fix-ове): `mobile/apk-out/v109/AURALIS-1.0.109-backfix.apk`

---

## 3. 🔴 №1 ЗАДАЧА: DEPLOY (новият чат има remote достъп!)
**Живият сайт е още 1.0.107.** Capacitor зарежда живия сайт → нито foreground service-ът, нито back-fix-ът, нито safe-area-fix-ът работят на телефона, докато 1.0.109 не е на живо.

Стъпки:
1. Merge PR #3 в `main` (web промените са безопасни: `capacitor-native.js` е инертен за web, CSS-ът е само подобрение).
2. На droplet (`/var/www/auralis`): `git pull`. Аудиото е rsync, не git.
3. Провери: `https://tinnitus-app.help/js/capacitor-native.js` да НЕ е 404; CODE_VERSION = 1.0.109; update барът да изскочи в PWA.
4. ⚠️ Apache сервира `service-worker.js` с no-cache. „Не е deploy-нато" е единствената причина да не се обнови.

---

## 4. СЛЕДВАЩИ ЗАДАЧИ (по приоритет)
1. **Deploy 1.0.109** (§3) — отпушва всичко.
2. **Тест на телефон след deploy** (Тихол, Z Flip6):
   - Back бутон = безплатен §5 диагностик: ако back връща назад → `window.Capacitor` работи → §5 капанът НЕ важи + foreground service работи (тиха нотификация „Звукова терапия се възпроизвежда"). Ако back ВСЕ ОЩЕ излиза → `window.Capacitor` undefined = §5 капан → прави **hosted bridge** (CAPACITOR_TEST_GUIDE + AURALIS_MASTER §3 / RunMyStore §5).
   - Заключен екран 15-30 мин → звукът да не спира.
3. **Постоянен debug keystore** — сега GitHub Actions генерира НОВ ключ при всеки build → всяко ново APK иска деинсталиране на старото. Фиксиран keystore (committed/secret) + signingConfig в `mobile/android/app/build.gradle` → install-over без uninstall. Изисква еднократен `keytool` (CI или машина с JDK).
4. **Cloud sync + login (magic link)** — следващият голям blocker ПРЕДИ Capacitor финал (иначе губят localStorage при миграция). MySQL: profiles/favorites/pitch/thi/diary/streak. БЕЗ SMS. Anti-fraud: 1 email=1 trial, IP лимит 3/IP/30дни.
5. Stripe (€19.99 еднократно + 14дн trial) + изи пей + anti-fraud.
6. Landing PHP + вграден тест + 1-2 звука + SEO/GEO от ден 1.
7. ~25 проучвания → 10-15 pillar статии BG → УНГ рецензент → DeepL за IT. (НЕ пиши статии без проучванията — Scaled Content Abuse/YMYL риск.)
8. Условия → юрист (`AURALIS_TERMS_DRAFT.md`).

---

## 5. ПРАВИЛА / КАПАНИ
- **server-served:** промяна в JS/CSS → deploy + reopen app (БЕЗ reinstall). Промяна в native (mobile/android, нов plugin) → rebuild APK + reinstall.
- **§5 bridge капан** (Z Flip6 е точно проблемното устройство от RunMyStore): при server.url + native plugins `window.Capacitor` може да е undefined → нужен ръчно hosted bridge. Текущо разчитаме на стандартна auto-injection + 6s изчакване; `capacitor-native.js` логва ясно ако bridge липсва.
- **Версия:** при всяка code промяна → bump `CODE_VERSION` (index.html) + `VERSION` (service-worker.js) ЗАЕДНО и равни.
- **Wellness, НЕ медицинско** — никъде „лекува"/„диагностицира".
- Аудиото не влиза в git. Език: български.
- `package-lock.json` глобално gitignore-нат → `!mobile/package-lock.json` изключение (нужен за CI `npm ci`). gradlew = LF (`mobile/android/.gitattributes`).
- Не можех да чета `logs/audio.log` (на сървъра) — новият чат с remote достъп МОЖЕ → провери дали телеметрията е хванала заключения-екран случай.

---

## 6. ТЕКУЩО СЪСТОЯНИЕ — едно изречение
Capacitor обвивката + foreground service + back/safe-area fix-ове са построени и компилират (зелен CI, PR #3), APK е свален; **липсва само DEPLOY на 1.0.109** за да заработят на телефона — това е първото нещо за новия чат с remote достъп.
