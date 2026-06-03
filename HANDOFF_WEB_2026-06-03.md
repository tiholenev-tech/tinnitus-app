# AURALIS — HANDOFF от Web сесия → локален CC чат — 2026-06-03

> Тази сесия беше в **Claude Code on the web** (cloud контейнер, branch+PR flow,
> БЕЗ достъп до droplet-а). Ти си локалният CC чат на машината на Тихол.
> **Първо: `git pull` на `main`** — там е целият нов код (1.0.107).
>
> Допълва: `HANDOFF_MASTER_2026-06-01.md` (код/архитектура) и
> `AURALIS_MASTER_2026-06-02.md` (водеща стратегия).

---

## 0. TL;DR — какво стана тази сесия (2026-06-03)
1. Качени 4 стратегически документа в repo root (виж §5).
2. **Решен аудио бъгът „звукът спира на заключен екран"** — на PWA ниво, два fix-а (виж §2).
3. Bump **1.0.106 → 1.0.107**, merge-нато в `main` (merge commit `d59db03`), deploy-нато на droplet-а (`git pull`).
4. Live сега = **1.0.107**. Чака се **нощен тест** за потвърждение на fix-а.

---

## 1. Версия и деплой състояние
- `main` = **1.0.107**. Droplet (`/var/www/auralis`) е дръпнат на 1.0.107.
- Деплой модел (от `DEPLOYMENT.md`): `git push origin main` → на droplet `git pull`.
  **Аудиото НЕ е в git** — ships отделно през `rsync` (`library_staging_*/`).
- 🔴 **НАЙ-ВАЖНИЯТ капан при всяка code промяна:** service worker-ът е **cache-first**.
  Без bump на версията **стар JS се сервира от кеша** и промените са **невидими на
  телефона**. Трябва да се бъмпват **ДВЕ места едновременно и да са равни**:
  - `service-worker.js` → `var VERSION`
  - `index.html` → `var CODE_VERSION`
  (Update прозорецът „Налична е нова версия" се появява само когато сървърът върне
  нов SW с различна VERSION от CODE_VERSION на заредената страница.)
- Apache сервира `service-worker.js` с `no-cache` → SW-ът винаги е свеж от сървъра
  (кеш на SW файла не е проблем; „не е deploy-нато" е единствената причина да не
  изскочи update барът).

---

## 2. Аудио бъг — диагноза + fix (ГОТОВО, чака нощен тест)

**Симптом (потвърден с тест 02.06):** на **отключен** екран свири >1ч; на
**заключен** спира за ~5 мин, при отключване приложението се презарежда от нула.

**Две независими причини, и двете на PWA ниво:**

### а) „Призрачен L2" — реален код бъг (FIXED)
`startLayer1Source` имаше `src.onended`, `startLayer2Source` — **не**. При
OS-прекъсване нощем `layer2.source` оставаше ненулев → `getActiveLayers().layer2.playing`
лъжеше `true` → watchdog-ът в `audio-resilience.js` не рестартираше L2.
**Fix:** добавен `src.onended` в `startLayer2Source()` (преди `src.start(0)`),
огледален на L1 — `clearLayer2State()` + dispatch на `auralis-sound-ended`.

### б) OS suspend на заключен екран — PWA кръпка (FIXED, best-effort)
Нямаше Media Session → Android не третира таба като активен плейър → suspend-ва го.
**Fix:** нов модул **`js/media-session.js`** — безшумна `<audio>` котва (PCM-нули,
loop) държи audio focus + Media Session (lock-screen контрол), докато AudioEngine
свири. Задвижва се от **нови събития `auralis-session-start` / `auralis-session-end`**,
които `audio-resilience.js` вече dispatch-ва в `beginSession`/`endSession`.
Всичко е в `try/catch` — при грешка аудиото е непокътнато.

> ⚠️ Media Session е **кръпка, НЕ гаранция** (точно както пише в мастер документа).
> **Реалното решение остава Capacitor** (native foreground service) — §4, т.3. НЕ сега.

**Пипнати файлове:** `js/audio-engine.js`, `js/audio-resilience.js`,
`js/media-session.js` (нов), `index.html` (script tag + CODE_VERSION),
`service-worker.js` (VERSION + `media-session.js` в `SHELL_FILES`).

**Телеметрия:** `tlog()` в `audio-resilience.js` е **ВКЛ**, праща beacon към
`/api/log.php` → пише ред в **`logs/audio.log` НА СЪРВЪРА** (`logs/` е gitignore-нат,
празен в repo — затова не го търси локално). Ако бъгът пак се появи → чети
**сървърния** `logs/audio.log`: търси `wakelock_released` + повторен `session_start`
(= презареждане), или `recover` редове с паднал L1/L2.

---

## 3. Странична находка (НЕ пипана — за преценка)
`manifest.json` и `index.html` сочат иконите към **`app-icons/`**, но в repo PNG-ите
са в **`icons/`** (няма `app-icons/` в repo). Понеже бетата работи инсталирана,
вероятно на **сървъра** `app-icons/` съществува. Ако PWA иконата/apple-touch е
счупена — провери сървъра. (`media-session.js` artwork нарочно ползва `app-icons/`
за консистентност с останалото.)

---

## 4. Следващи стъпки (от мастер документите, по приоритет)
1. **Потвърди аудио fix-а** с нощен тест. Ако пак спира → сървърен `logs/audio.log`.
2. **Cloud sync + login (magic link)** — ПРЕДИ Capacitor (иначе PWA юзърите губят
   localStorage при native миграция). MySQL: profiles/favorites/pitch/thi/diary/streak.
   Без SMS (скъпо за 50+). Същият droplet, разход ≈ само email услуга.
3. **Capacitor** — истинският fix за заключен екран + audio focus при обаждане +
   дистрибуция. Server-served модел (`server.url = https://tinnitus-app.help`).
   ⚠️ Капан: native plugins → ръчно инжектиране на bridge (`window.Capacitor`
   undefined). Виж `AURALIS_MASTER_2026-06-02.md` §3.
4. **Stripe** (€19.99 еднократно + 14-дн trial) + **изи пей** + **anti-fraud**
   (server-side: 1 email=1 trial, magic link verify, IP лимит 3/IP/30дни — НЕ cookie).
5. **Landing (PHP)** + вграден pitch тест + 1-2 звука на самата страница, SEO/GEO
   от ден 1 (server-side HTML, INP<200ms, Schema.org, YMYL „Рецензирано от" УНГ).
6. ~25 проучвания → 10-15 pillar статии на **BG** → УНГ рецензент → DeepL за IT.
7. **Условия → български юрист** (`AURALIS_TERMS_DRAFT.md`).

**Пазари:** BG първо (тест/валидиране) → Италия (приходен). Германия+английски ИЗБЯГВАЙ.
**Цена:** €19.99 еднократно, не абонамент. Оптимизирай по **приход на посетител**.

---

## 5. Документи в repo (ориентир)
| Файл | Какво |
|---|---|
| `AURALIS_MASTER_2026-06-02.md` | **Водещ** стратегически документ (вкл. аудио бъг + Capacitor план) |
| `AURALIS_PHASE2_MASTER_2026-06-01.md` | Комерсиализация (Фаза 2) |
| `HANDOFF_SOLO_2026-06-01.md` | Пазари, SEO/GEO, robots.txt, anti-fraud |
| `AURALIS_TERMS_DRAFT.md` | Чернова Условия (чака юрист) |
| `HANDOFF_MASTER_2026-06-01.md` | Код/архитектура (CC) |
| `docs/AURALIS_BIBLE_v3_PIVOT.md` и др. | Стари библии: **научната част валидна**; дистрибуция/цена ОСТАРЕЛИ |

---

## 6. Правила / конвенции (не нарушавай)
- **Wellness, НЕ медицинско изделие** — никъде „лекува"/„диагностицира" (удържа извън EU MDR).
- **При всяка code промяна → bump `VERSION` + `CODE_VERSION` заедно** (иначе fix-ът е невидим — §1).
- **Аудиото не влиза в git** (rsync отделно).
- Звукова безопасност: предупреждаваме, не ограничаваме (master volume +3dB, до +6).
- Език: **български първо**.
- Branch workflow (web сесиите): отделен branch + PR. Локално ти работиш на `main` или собствени branch-ове по преценка на Тихол.
