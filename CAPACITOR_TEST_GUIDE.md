# AURALIS — Capacitor тест ръководство (за Тихол при връщане)

> Създаден: 2026-06-03 (CC, автономна сесия). Branch: `feat/capacitor-android` · PR #3.
> Допълва `AURALIS_BIBLE_PHASE2.md` §3.

## TL;DR
Имаш 2 готови APK-та (построени в облака, компилират чисто):
- **Фаза 1** — `mobile/apk-out/AURALIS-debug.apk` — чиста обвивка, нула native.
- **Фаза 2** — `mobile/apk-out/phase2/AURALIS-phase2-fgservice.apk` — + foreground service (реалния fix за заключен екран).

Тествай Фаза 2. Но първо прочети „⚠️ КРИТИЧНО" долу — иначе тестът ще е невалиден.

---

## ⚠️ КРИТИЧНО: подреждане (иначе foreground service-ът няма да се извика)

Capacitor е **server-served** — APK-то зарежда ЖИВИЯ сайт (`tinnitus-app.help`), НЕ
вградени файлове. Foreground service-ът се пуска от `js/capacitor-native.js`, който е
нов файл. **Живият сайт още е 1.0.107 и НЯМА този файл.** Тоест:

> Ако инсталираш Фаза 2 APK сега (преди deploy), нищо няма да се промени —
> няма кой да извика native плъгина. Ще изглежда сякаш fix-ът не работи.

### Затова РЕДЪТ е:
1. **Deploy на сайта първо** (твоя стъпка, аз нямам droplet SSH):
   - Merge PR #3 в `main` (или само cherry-pick web файловете), после на droplet-а:
     `cd /var/www/auralis && git pull` (същият ти flow).
   - Провери че live е **1.0.108** (update барът трябва да изскочи в PWA-то).
   - Бързо потвърждение че файлът е там: отвори `https://tinnitus-app.help/js/capacitor-native.js` в браузър — трябва да върне кода, не 404.
2. **Чак тогава** инсталирай Фаза 2 APK и тествай.

---

## Инсталация на APK (Android)
1. Прехвърли `.apk` на телефона (USB / Drive / Telegram до себе си).
2. Settings → разреши „инсталиране от непознати източници" за съответното приложение.
3. Отвори файла → инсталирай. (Ако има стара версия — деинсталирай първо за чисто.)
4. При първо отваряне Android 13+ ще поиска разрешение за нотификации → **Разреши**
   (foreground service-ът показва тиха нотификация „AURALIS се възпроизвежда").

## Самият тест (заключен екран)
1. Отвори AURALIS, пусни звук за сън (Layer 1 + ако ползваш, Layer 2).
2. Трябва да видиш **тиха постоянна нотификация** „Звукова терапия се възпроизвежда".
3. Заключи екрана. Чакай **15-30 мин** (бъгът се проявяваше за ~5 мин).
4. Слушай: звукът трябва да продължи без прекъсване.
5. Отключи: app-ът НЕ трябва да се „презарежда" на начална страница.

## Какво значи резултатът
| Резултат | Извод | Следва |
|---|---|---|
| 🟢 Звукът държи 30+ мин | Foreground service работи | Merge PR #3, тествай ~1 месец, после Cloud sync |
| 🟡 Държи по-дълго от преди, но пак спира | Частичен ефект | Чети `chrome://inspect` логове (виж долу) |
| 🔴 Никаква разлика | Вероятно `window.Capacitor` undefined (§5 капан) ИЛИ сайтът не е deploy-нат | Виж „Дебъг" долу |

## Дебъг (ако не работи)
Свържи телефона с USB, отвори на десктоп Chrome → `chrome://inspect` → inspect на
AURALIS WebView → Console. Търси `[cap-native]` редове:
- `native bridge готов → закачам...` = ✅ плъгинът е намерен, service-ът се вика.
- `⚠️ Capacitor наличен, но ForegroundAudio plugin липсва` = §5 bridge капан →
  нужен ръчен hosted bridge (виж `AURALIS_BIBLE_PHASE2.md` §3 / CAPACITOR_BUILD_GUIDE §5).
- `не е Capacitor native (web/PWA режим)` = APK-то не е заредило native context
  (или тестваш в браузър, не в app-а), ИЛИ сайтът не е deploy-нат с новия файл.

## Технически детайли (какво построих)
- `AudioKeepAliveService.java` — foreground service, тип `mediaPlayback`, `START_STICKY`,
  тиха нотификация. Държи процеса жив; НЕ свири сам (звукът е от WebView).
- `ForegroundAudioPlugin.java` — Capacitor плъгин `start()`/`stop()`.
- `MainActivity.java` — регистрира плъгина.
- `AndroidManifest.xml` — permissions (FOREGROUND_SERVICE + _MEDIA_PLAYBACK,
  POST_NOTIFICATIONS, WAKE_LOCK) + декларация на service-а.
- `js/capacitor-native.js` — закача service-а за `auralis-session-start/end`.
  Инертен за web (проверено в preview: нула грешки, логва „web режим").

## Ребилд (ако променя нещо)
Push в branch/main с промяна в `mobile/**` → GitHub Actions билдва автоматично →
Actions → най-новия run → Artifacts → `AURALIS-APK`. Java НЕ е нужна локално.
