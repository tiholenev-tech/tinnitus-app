# HANDOFF — Румънски превод на приложението (i18n/ro.json)

> Статус към 2026-06-05. Клон: **`claude/zen-edison-X2rb1`**. Всичко по-долу е
> **PUSH-нато** на origin (последен RO commit: `1aa834e`).

## ⚠️ Урок №1 (защо съществува този файл)
Контейнерът е **ефемерен**. Веднъж загубих ~525 преведени низа, защото само
commit-вах локално без `git push`. **PUSH СЛЕД ВСЯКА ВЪЛНА.** Локален commit ≠ безопасно.

## Къде сме
- `i18n/ro.json` съществува, структура 1:1 с `bg.json` (1544 листа), `_meta` = ro/Română.
- **Готови ~525 уникални низа (~41%):** ui-обвивка/onboarding, библиотека+шумове,
  правни текстове (privacy/terms), дневник, SOS дишане, научна основа (THI/notched/RCT),
  гласова диктовка, заглавия на профилите + 5-те кратки профил-резюмета.
- **Остават ~743 уникални низа:** дългите клинични текстове в `categoryInfo`
  (тела на 5-те профила: „Защо имате този тип", „Препоръчителна стратегия" с
  backtick-ID-та, „Кога към лекар", очаквания по месеци), плюс `faq`, `cbt`,
  `quiz`, `content`, `thi`, остатъка от `profile_results`, `components`, `progress`.

## Конвейер (повтаряй до 0)
```bash
python3 tools/i18n_fill.py ro todo 120     # извежда {„бг":""} за следващите 120 непреведени
#   → преведи стойностите, после:
python3 tools/i18n_fill.py ro set <<'JSON'
{ "...бг...":"...ro...", ... }
JSON
git add i18n/ro.json && git commit -m "i18n(ro): вълна N" && git push origin claude/zen-edison-X2rb1   # ← ВСЕКИ ПЪТ
```

## Правила за превода (иначе чупиш t() или MDR)
- **Запазвай 1:1:** плейсхолдъри `{n} {total} {delta} {freq} {code} {name} {v} {date} {tz} {imported} {skipped}`;
  backtick-ID-та (`` `pink_lowpass_4000` ``, `` `daily` ``, `` `brown_lowpass_500` ``);
  emoji; `<br>`; кавички „ … \" ; en-dash – ; `\n\n`.
- **Не превеждай:** цитати/имена/термини (THI, RCT, FDA, Lenire, MCID, 2AFC, LUFS,
  dB SPL, Hz, notch, Pantev, Stein, Newman, Frontiers…). Статистики запазват точните
  стойности (`−8.6`, `2.871`).
- **MDR (медико-правно):** `ro` claim-думи = `vindec*`, `diagnostic*`. Винаги слагай
  отрицател **близо** (`nu` / `fără` / `nici`). Пример: „Nu vindecă tinitusul", „NU
  înlocuiește… nu pune diagnostic". „terapie/terapeutic/tratament" НЕ са claim-думи.
- Локализирай UI-езика: „Българският не се поддържа" → за RO стана „Limba română…".

## Двата гейта — ЗАДЪЛЖИТЕЛНО преди регистрация
```bash
python3 tools/i18n_validate.py ro     # трябва: 0 проблема (0 = всичко преведено + структура ok)
python3 tools/check_claims.py ro      # трябва: 0 BLOCK
```

## Регистрация — ЧАК на 100% (иначе RO потребител вижда полу-български UI)
1. `js/language-picker.js` → в `LANGUAGES` добави след it:
   `{ code: 'ro', name: 'Romanian', native: 'Română', flag: '🇷🇴' }`
2. `js/i18n.js` → `var SUPPORTED = ['bg', 'it', 'ro'];`
3. **Version bump И ДВЕТЕ** (app-shell JS се пипа):
   `service-worker.js` `VERSION` 1.0.116 → **1.0.117** И `app.html` `CODE_VERSION` → **1.0.117**.
4. (по избор) `i18n/bg.json` + `i18n/it.json` → `ui.settings.lang.names.ro` = `"Română"`.
5. PR draft → merge. (Сървърът авто-дърпа main → деплой ~1 мин.)

## Контекст
- Стратегия: `docs/AURALIS_STRATEGIA_FINAL_20260605.md` (чети пръв).
- Конвейер за езици: `docs/I18N_PIPELINE.md`.
- RO е **активен пазар** (реклами) → превеждай качествено, не „как да е".
