# I18N — линия на работа (за да няма пак „полу-преведено")

> Урок (07.06.2026): `i18n_validate.py` (само JSON↔JSON паритет) и първата версия
> на `i18n_audit.py` обявиха IT „чисто", но на телефона имаше много български:
> заглавия на звуци, подзаглавия на категории, diary-hub карти, sleep таймер.
> Причина: цели UI/данни **не минаваха през `t()` с СЪЩЕСТВУВАЩ ключ**, а
> validate-ът не вижда кода. Този документ е задължителният конвейер за всеки език.

## ⛔ Гейтове ПРЕДИ да обявиш език за готов (ВСИЧКИТЕ да са 0/зелено)

```bash
python3 tools/i18n_validate.py <lang>   # JSON паритет с bg (0 проблема)
python3 tools/check_claims.py  <lang>   # MDR (0 BLOCK)
python3 tools/i18n_audit.py --strict    # КОД: A=0 (липсващи t-ключове) · C-блокер=0 (hardcoded UI)
python3 tools/i18n_leak.py     <lang>   # 0 кирилски leak · 0 звука без преведено заглавие
```

- **`i18n_validate`** — гарантира, че всеки ключ в bg.json е преведен в `<lang>`.
- **`i18n_audit`** — сканира `js/*.js`: всеки `t()/tArr/tObj/tOrNull/tObjOrNull/
  tOrPrettify/sectionTitle('key')` сочи ли към съществуващ ключ; hardcoded
  кирилица в UI markup. (B-warnings = динамични ключове, проверявай ръчно.)
- **`i18n_leak`** — РЕАЛНО рендиращата се българщина: кирилски leak в `<lang>.json`
  + всеки звук с `bg_title` има ли `library.sounds.<id>.title` в езика.

## 📐 Правила (за да минават гейтовете по дизайн)

1. **Никакъв видим низ без `t('ключ', 'BG fallback')`.** Fallback-ът е само
   аварийна мрежа — ключът ТРЯБВА да съществува в bg.json (иначе всички езици
   падат на BG).
2. **Префикс `ui.`** — UI низовете живеят под `ui.*` в JSON. Викай `t('ui.…')`,
   НЕ `t('settings.…')`. (Това беше Клас A дефектът.)
3. **Без директни литерали в data-масиви** (`{title:'…'}`, `{label:'…'}`),
   които после се рендират суров. Дай им ключ: `t('ui.comp.x', '…')`.
4. **Данни (manifest.json):** заглавия се четат през `title_key →
   library.sounds.<id>.title`. При нов звук → попълни ключа във ВСИЧКИ езика.
5. **Нов компонент/файл → добави `t()` wrapper + ключове в bg/it/ro/…
   едновременно.** После пусни 4-те гейта.

## 🕳️ ПЪЛЕН регистър на пропуснатото (07.06.2026, it+ro) — да НЕ се повтаря

Всичко долу се „виждаше чисто" от `i18n_validate` (само JSON паритет), но
рендираше българщина. Класове дефекти + всички конкретни места:

### Клас 1 — `t()` без `ui.` префикс (ключът е под `ui.*`, кодът викаше без него)
`settings.js`, `sos.js`, `sleep.js`, `diary.js`, `library.js`, `player.js`,
`calm.js`, `home.js`, `category-view.js` (вкл. `tOrNull('library.cat_audio')`).

### Клас 2 — изцяло hardcoded компоненти (0 `t()` или зашити литерали)
`pitch-test.js` (целият тест), `account.js`, `volume-calibration.js`,
`headphones-warning.js`, `diary-hub.js` карти, `player.js` (mix-hint, sleep
пресети, „Таймер за сън"), спинъри „Зарежда се…" (`category-view`,
`sound-detail`, `favorites`).

### Клас 3 — липсващи ключове (код вика `t('key','BG fallback')`, ключ няма в JSON)
~140 ключа: `a11y.*`, `analytics.*`, `favorites.*`, `home.tests/diary/pitch.*`,
`settings.reminders/notch/audio/stats.*`, `notifications.*`, `tour.*`, `errors.*`,
`ui.onboarding.welcome.video*`.

### Клас 4 — ДАННИ (manifest.json), не UI
- `manifest.json bg_title` (280) → заглавия на звуци. Поправка: `library.sounds.<id>.title` в всеки език (кодът чете `title_key`).
- `manifest.json noises[].name_key` → Layer 2 шумове. `noises.<id>.title` в всеки език.
- `source_note` (137) — вътрешни метаданни, НЕ се рендират → НЕ се превеждат.

### Клас 5 — hardcoded BG таблица С ПРИОРИТЕТ пред i18n (най-коварно)
- `player.js NOISE_LABEL_BG[id]` връщаше се ПРЕДИ i18n → шумът винаги BG. Правило: **i18n първо, BG картата само fallback**.
- `home.js CAT_FALLBACK_BG`, `category-view ELEM_BG`, `profile-results` режими — fallback таблици (ОК докато ключът съществува и се чете ПЪРВИ).

### Клас 6 — динамичен ключ с грешен/липсващ път → BG fallback
- `diary.js` `t('diary.history.range'+r)` (без `ui.`) → „7 дни". → `ui.diary.history.range*`.
- `home.js`/`category-view` element subtitle `home.cat.<el>.subtitle` (нямаше) → `ui.library.cat_sub.<id>`.

### Клас 7 — данни-таблици с директен рендер (литерал в масив, не през t)
- `diary-hub.js` action карти (`{title:'Вечерен дневник'}`) → `ui.diaryHub.*`.
- `streak-badge.js` „дни" → `ui.streak.unit/aria`.
- `player.js` sound description „Звук от категория X" → `ui.player.soundDescFmt` (с локализирано име на категория).
- update банер в `app.html` „Налична нова версия"/„Обнови" → `ui.update.available/button`.

### Клас 8 — РЕГИСТРАЦИЯ на „3 места" (иначе езикът не се показва/сменя)
Нов език ТРЯБВА да се добави на ВСИЧКИТЕ ТРИ места ЕДНОВРЕМЕННО:
1. `js/i18n.js` → `var SUPPORTED = [...]`
2. `js/language-picker.js` → `LANGUAGES = [...]`
3. **`js/settings.js` → `LOCALES` И `COMPLETE_LOCALES`** ← този беше изпуснат → менюто за език показваше само BG.

### Клас 9 — SW кеш стратегия за локализирани страници
`/it/` `/ro/` (и бъдещи) ТРЯБВА да са в **networkFirst** листата на `service-worker.js`
(иначе cache-first → стари страници до version bump).

## ➕ Нов език (напр. el) — РЕЦЕПТА (покрива всички 9 класа)

1. **App i18n:** `tools/i18n_fill.py <lang> init` → преведи ВСИЧКИ bg.json ключове,
   вкл. новодобавените: `ui.pitchTest.*`, `ui.library.cat_sub.*`, `ui.diaryHub.*`,
   `ui.streak.*`, `ui.update.*`, `ui.player.soundDescFmt/bgNoise/sleep*`,
   `library.sounds.*.title` (280 заглавия), `noises.*.title` (7).
2. **Регистрация на 3-те места (Клас 8):** `js/i18n.js` SUPPORTED + `js/language-picker.js`
   LANGUAGES + `js/settings.js` LOCALES & COMPLETE_LOCALES. + version bump (SW + app.html).
3. **language-picker.js** LANGUAGES запис (code/name/native/flag).
4. **Сайт (ако правим):** нов chrome `inc/site-<lang>.php` + страници; добави
   `/<lang>/` в **networkFirst** на `service-worker.js` (Клас 9); добави езика в
   globe превключвателя (`inc/site*.php` `.lang-menu`) на ВСИЧКИ chrome-ове.
5. **Гейтове (всичките 0/зелено):**
   ```
   python3 tools/i18n_validate.py <lang>   # паритет
   python3 tools/check_claims.py  <lang>   # MDR
   python3 tools/i18n_audit.py --strict    # код: t()-ключове + hardcoded
   python3 tools/i18n_leak.py     <lang>   # кирилица leak + manifest title/noise покритие
   ```
6. Чак при 0/зелено навсякъде → езикът е готов.
