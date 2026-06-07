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

## 🕳️ Какво беше пропуснато и поправено (07.06.2026, it+ro)

| Източник | Проблем | Поправка |
|---|---|---|
| `manifest.json bg_title` (280) | заглавия на звуци raw BG | `library.sounds.<id>.title` в bg/it/ro |
| `category-view.js` | име на елемент-категория `library.cat_audio` (без `ui.`) | → `ui.library.cat_audio` |
| `home.js` / category subtitle | `home.cat.<el>.subtitle` липсва | нов `ui.library.cat_sub.<id>` (11) |
| `diary-hub.js` | карти hardcoded (Вечерен дневник…) | `ui.diaryHub.*` |
| `sleep.js` | timer ключове `sleep.timer.*` (без `ui.`) | → `ui.sleep.timer.*` |
| `player.js` | sleep пресети + „Таймер за сън" hardcoded | `ui.player.*` |
| `diary.js` | history range `diary.history.range` (без `ui.`) | → `ui.diary.history.range*` |
| `favorites.js` | заглавие `sounds.<id>` (грешен префикс) | → `library.sounds.<id>.title` |
| (по-рано) pitch-test.js | 0 t() — целият тест hardcoded | `ui.pitchTest.*` |
| (по-рано) settings/sos/library/… | `t()` без `ui.` префикс | Клас A префикс |

`source_note` (137) в manifest — вътрешни метаданни, НЕ се рендират → не се превеждат.

## ➕ Нов език (напр. el) — ред

1. `i18n_fill.py <lang> init` + преведи bg.json ключовете (вкл. `ui.pitchTest`,
   `ui.library.cat_sub`, `ui.diaryHub`, `library.sounds.*.title` — 280-те заглавия!).
2. Регистрирай (picker/SUPPORTED/version bump).
3. Пусни **четирите гейта** горе. Едва при 0/зелено навсякъде → готово.
