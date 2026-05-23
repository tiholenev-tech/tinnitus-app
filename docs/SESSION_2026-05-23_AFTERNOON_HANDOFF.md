# SESSION HANDOFF — 23.05.2026 (afternoon/evening)

**Сесия:** "AURALIS — Mixer Retrofit Kickoff"
**Продължителност:** ~5 часа
**Статус:** В работа (retrofit Tasks 1-6 в Claude Home чат, в момента Task 2-3)
**Чат:** Този handoff е за **трети чат** (ако сесията се прекъсне). Активен retrofit чат е **отделен Claude Home чат** в claude.ai.

---

## 🎯 ЦЕЛ НА ТОЗИ HANDOFF

Това е продължение на `SESSION_2026-05-23_HANDOFF.md` (сутрешна сесия). Покрива какво се случи следобед/вечер: получаване на design canon, push в repo, стартиране на retrofit в отделен Claude Home чат, всички решения и pending въпроси.

**Reading order за нов Claude:**
1. `docs/SESSION_2026-05-23_HANDOFF.md` — сутрешна сесия (статус преди canon)
2. **ТОЗИ файл** — следобедна сесия (canon + retrofit kickoff)
3. `docs/canon/AURALIS_DESIGN_CANON_v1.md` — водещ дизайн документ
4. `design/mockups/mixer-2tabs-v3-cards.html` — SACRED visual reference
5. `js/info-content.js` — 25 канонични текстове
6. `tools/audio-library-status.md` — 39 audio файла
7. `docs/bibles/AURALIS_BIBLE_v2.md` + Appendix — продуктова библия

---

## ✅ ЗАВЪРШЕНО В ТАЗИ СЕСИЯ

### 1. Прочетени материали (без скимане)

- 25 от ~80 файла в проекта систематично прочетени
- AURALIS_BIBLE_v2 + Appendix + 3-те decisions от GitHub
- HANDOFF_v5 (775 реда — финален handoff от сутрешна сесия)
- DESIGN_SYSTEM_v4_0_BICHROMATIC parts 1-9 от 22 (~1400 от 2511 реда)
- TINNITUS_BIBLE v1.0 (502 реда — initial concept преди AURALIS rebranding)
- runmystore design-kit (tokens.css + components.css glass recipe)
- Card_light_neon.html (~100 реда от 496)
- Info-content.js целия (1244 реда, 25 entries в 5 секции)
- Audio-library-status.md (200 реда, 39 файла + 6 препоръчителни preseta)
- AURALIS_DESIGN_CANON_v1.md целия (572 реда)
- mixer-2tabs-v3-cards.html целия (843 реда — SACRED reference)

### 2. Mockup итерации (3 опита преди canon)

| Файл | Статус | Защо |
|---|---|---|
| `mixer-2tabs-v1-flat.html.archive` | Архивиран | Първи опит — flat dark UI, нямаше нищо общо с bichromatic |
| `mixer-2tabs-v2-bichromatic-singlecard.html.archive` | Архивиран | Имаше bichromatic основа (.glass + .shine), НО единствена огромна аналитична карта — Тихол отхвърли "audio не е акцент, а текст" |
| `mixer-2tabs-v1.html` (нов след canon, преди sacred) | Остарял (отхвърлен) | 3 cards вместо 5, card 1 expanded by default = нарушение на canon §9, header order грешен |

**Lesson learned:** Аз правих mockups без да отворя `runmystore/design-kit/components.css` (.glass recipe) и без да прочета DESIGN_SYSTEM_v4. Това беше losing time.

### 3. Push в repo (commit 93a7fdc)

```
DOCS: AURALIS DESIGN CANON v1 RIGID + sacred mockup v3
 2 files changed, 1415 insertions(+)
 create mode 100644 design/mockups/mixer-2tabs-v3-cards.html
 create mode 100644 docs/canon/AURALIS_DESIGN_CANON_v1.md
```

**Push метод:** Тихол даде временен GitHub PAT, аз push-нах с него, после Тихол го revoke-на (`tinnitus-app-canon-push` token deleted).

### 4. Memory обновено

Memory entry #30 обновено: старият "TINNITUS-APP general info" заменен с canon правилата (10 правила, soft night tokens, header pattern, expandable rules, забранени неща).

### 5. Подготвен prompt за нов Claude Home чат

Файл: `design/mockups/CLAUDE_HOME_PROMPT_canon_retrofit.md` (158 реда)

**Съдържание:**
- §0 PRIME DIRECTIVE (canon + sacred copy 1:1, без интерпретация)
- §1 Reading order (6 файла)
- §2 Мисия (визуален retrofit)
- §3 Scope (DO list + DON'T list)
- §4 Категорични правила (canon §1+§9 compressed)
- §5 Workflow (1 task/съобщение, чакай feedback)
- §6 Test workflow (CMD#1/CMD#2, phone, localStorage reset)
- §7 6 atomic tasks в строг ред
- §8 Acceptance criteria
- §9-10 Кога да пита + комуникация

**ВАЖНО:** Този prompt НЕ е push-нат в repo. Файлът е в `/home/claude/tinnitus-app/design/mockups/` локално (Тихол има копие). Препоръчителен commit за бъдеще:
```bash
git add design/mockups/CLAUDE_HOME_PROMPT_canon_retrofit.md
git commit -m "DOCS: handoff prompt for canon retrofit session"
git push
```

### 6. Retrofit стартиран в отделен Claude Home чат

Тихол paste-на prompt-а в нов чат на claude.ai. Той започна работа.

**Прогрес в retrofit чата:**

| Task | Статус | Файлове | Бележки |
|---|---|---|---|
| **Task 1** — Foundation | 🟡 Fix в процес | `css/tokens.css` + `css/base.css` | Light mode `--bg-base` беше грешен — fix-ва се |
| **Task 2** — Header | ✅ Готов | `index.html` | Theme ляво / brand център / settings дясно, brand "tinnitus-app" с indigo "-app" suffix, theme toggle работи + localStorage |
| **Task 3** — Onboarding refactor | ⏳ Pending | `css/onboarding.css` + `js/onboarding.js` HTML wrappers | Чака след Task 1 fix |
| **Task 4** — Quiz refactor | ⏳ Pending | `css/quiz.css` + `js/quiz.js` HTML wrappers | |
| **Task 5** — Mixer mockup HYBRID | ⏳ Pending | `design/mockups/mixer-2tabs-v1.html` (пренапиши) | **Hybrid logic пуснат към Code чата** (виж раздел "Решения") |
| **Task 6** — QA pass | ⏳ Pending | — | Phone test пълен flow |

---

## 🟡 АКТИВНИ ВЪПРОСИ В RETROFIT ЧАТА

### Task 1 fix (в момента се прави)

Light mode token-и не следваха canon §2. Конкретно:
- `--bg-base` беше `#fafbff` или подобно → трябва **`#f7f5ef`** (warm white)
- Останалите 15 light tokens трябва да match-ват canon §2 list 1:1

**Аз грешах в първия fix request:** Казах му да добави "3-ти champagne radial + linear gradient" в body bg. Това НЕ съществува в v3 sacred. Извиних се. Реалният fix е малък — само `--bg-base` ако още не е `#f7f5ef`.

### Task 5 hybrid logic (пусната към Code чата)

Оригиналният prompt §7 Task 5 казва "копирай v3 1:1". Това беше **грешно** — Code щеше да загуби inline expandable card логиката.

**Реален Task 5 е hybrid:**

**Дизайн (от v3 sacred 1:1):**
- 5 compact cards (Подводна тишина featured + 4 обикновени)
- Header pattern (theme/brand/settings)
- Soft night tokens
- Общ expandable отдолу "Искате ли да знаете повече?" → Защо тези миксове + timeline + disclaimer

**Логика (от моя стар `mixer-2tabs-v1.html`):**
- На всяка card има (i) бутон (chevron)
- Tap на (i) → разгъва **inline expanded view вътре в самата card** (не bottom sheet)
- Показва пълния canonical `mixer.[preset_id].full` от `js/info-content.js` с `white-space: pre-line`
- Source citation отдолу в champagne tile
- Само 1 expanded в момента — отваряне затваря предишната

**Mapping 5 cards → info-content.js entries:**
- "Подводна тишина" → `mixer.preset_underwater`
- "Дълбок сън" → `mixer.preset_deep_calm` (Pink+Brown универсален)
- "Морски бряг" → `mixer.preset_sea_shore`
- "Тих дъжд" → `mixer.preset_pink_pure`
- "Розов шум" → `mixer.preset_pink_pure` ⚠ **дублира с "Тих дъжд"** — pending decision от Тихол: или `mixer.preset_brown_pure`, или различно име за един от тях

**Tap behavior:**
- Tap на body на card-а = audio play (console.log за сега)
- Tap на ▶ = audio play (същото)
- Tap на (i) = expand/collapse БЕЗ play

**Hybrid инструкцията е пусната към Code чата** (преди да започне Task 5).

---

## 📋 PENDING DECISIONS (за обсъждане в следваща сесия)

### A) Логики за 4-те нови екрана (за beta launch с бащата)

Само Mixer е в работата сега. За beta трябва още 4 екрана. **Решения нужни:**

#### A1. Calm секция (3 audio упражнения)
- **Voice-over кой?** OpenAI TTS женски (Nova/Shimmer) / Ти записваш / Eleven Labs / Без voice (само visual)
- Background music под voice — да или не? Кои файлове от 10-те meditation?
- UI: списък с 3 упражнения с play на всяко, или 3 големи cards?

#### A2. Daily Diary
- Кога pop-up? Сутрин при отваряне? Push notification?
- Slider 0-10 или 11 pills? (Quiz използва pills)
- Без писане задължително (BIBLE §1)

#### A3. Sleep Mode + SOS
- SOS бутон → какво прави? Пуска специфичен звук? 4-7-8 дишане? Светва нежно?
- Auto-start sleep mode когато стане късно?
- Lock screen controls (iOS специално)

#### A4. Profile / Settings
- Re-take quiz опция?
- Export на данни (за лекар)?
- Какви настройки за бащата vs. advanced потребители?

### B) Текстове — какво още липсва

`info-content.js` има 25 entries. За следващите екрани липсват ~10:

**Calm exercises (3):** `exercise_478_breathing`, `exercise_pmr`, `exercise_acceptance`
**Daily diary (2-3):** `why_track_sleep`, `why_tinnitus_scale`
**Sleep mode (2):** `sleep_mode_explained`, `sos_button_explained`
**Onboarding (3 screens):** welcome/value/consent — кой ги пише, канонично ли са?

**Кой пише новите 10?** — pending (Тихол / Gemini / друг чат)

### C) Audio architecture

**Hosting** (РЕШЕНО конкретно):
- **Beta тест с бащата:** локално в `Desktop\auralis\audio\` → ngrok URL
- **Production:** droplet 104.248.19.8, `/var/www/auralis/audio/` (Apache static serve, SSL през Certbot за domain `tinnitus-app.help`)

**Pending decisions:**
1. **Audio формат** — MP3 192kbps (универсален, iOS Safari) или другo?
2. **Naming convention** — `ES_Ambience, Underwater, Deep, Low.wav` → `underwater_deep_low.mp3` (snake_case)?
3. **`mixer-presets.js` структура** — JSON или JS array?
4. **Service Worker — кога?** За offline (downloads всички audio веднъж). Beta или production?
5. **Кога audio integration се прави** — след Task 6 retrofit ИЛИ след още някой нов екран?
6. **Кой пише `audio_normalize.py`** — следваща сесия или нов чат?

---

## 📁 FILES INVENTORY

### В repo (push-нати)

| Файл | Commit | Размер | Бележка |
|---|---|---|---|
| `docs/canon/AURALIS_DESIGN_CANON_v1.md` | 93a7fdc | 21KB | Водещ дизайн документ |
| `design/mockups/mixer-2tabs-v3-cards.html` | 93a7fdc | 29KB | SACRED visual reference |
| `docs/SESSION_2026-05-23_HANDOFF.md` | предишен | 14KB | Сутрешна сесия handoff |
| `docs/decisions/2026-05-23-*.md` (4 файла) | предишни | ~15KB total | Включително domain decision |
| `js/info-content.js` | предишен | 50KB | 25 канонични текстове |
| `tools/audio-library-status.md` | предишен | 7KB | 39 audio файла |
| Audio engine + Quiz + Onboarding | предишни | — | Functional layer (не пипа Code) |

### В моя workspace (не push-нати — Тихол може да реши)

| Файл | Размер | Препоръка |
|---|---|---|
| `design/mockups/CLAUDE_HOME_PROMPT_canon_retrofit.md` | 158 реда | Push в repo за history (`DOCS: handoff prompt for canon retrofit`) |
| `design/mockups/mixer-2tabs-v1.html` (мой стар, с info-content data) | 869 реда | **НЕ push** — Task 5 ще го пренапише |
| `design/mockups/mixer-2tabs-v1-flat.html.archive` | 792 реда | Архив, не нужен |
| `design/mockups/mixer-2tabs-v2-bichromatic-singlecard.html.archive` | 1010 реда | Архив, не нужен |
| `design/mockups/CLAUDE_CODE_PROMPT_bichromatic_refactor.md` | 289 реда | Outdated (било за Claude Code, не Home) |
| `design/mockups/DESIGNER_BRIEF_mixer-cards.md` | 254 реда | Outdated (било за външен дизайн чат, заменен от canon) |

**Препоръка:** изтрий outdated файлове, push само `CLAUDE_HOME_PROMPT_canon_retrofit.md`.

### В /mnt/user-data/outputs/ (за изтегляне)

- `CLAUDE_HOME_PROMPT_canon_retrofit.md` (актуалният handoff prompt)
- `mixer-2tabs-v1.html` (мой стар, отхвърлен)
- `mixer-2tabs-v2.html` (мой по-стар, отхвърлен)
- `DESIGNER_BRIEF_mixer-cards.md` (outdated)
- `CLAUDE_CODE_PROMPT_bichromatic_refactor.md` (outdated)

---

## 🎯 LESSONS LEARNED ПРЕЗ СЕСИЯТА

1. **Преди да правя mockup → отвори design-kit + DESIGN_SYSTEM референции** (а не да импровизирам). Загубих ~2 часа с 2 опита (v1 flat + v2 single card) преди да отворя runmystore design-kit.

2. **Skimming е лош** — Тихол ме поправи 2 пъти за това. "Без скимане" значи РЕАЛНО прочети целия файл, не view първите 100 реда + последните 50.

3. **Питай за clarification на ambiguous команди** — "качи документа" значеше commit в repo, не memory edit. Аз изтълкувах грешно първия път.

4. **Claude Home ≠ Claude Code** — Тихол ме поправи. Този чат работи с Claude Home (chat app, не CLI). Workflow е "Code → Тихол paste-ва", не "Code пише и run-ва сам".

5. **Не интерпретирай дизайн от паметта** — Когато казах "3-ти champagne radial" в light mode fix, аз си спомних от моя стар v2, не от v3 sacred. Code ме хвана и попита. Резултат: трябваше да се извиня.

6. **§0 PRIME DIRECTIVE в prompts** — Категоричните правила трябва да са В НАЧАЛОТО, не заровени в §2 или §5. Code пропуска или интерпретира заровени правила.

7. **Token-и в plain text = опасно** — Тихол сподели PAT в чата, аз го използвах за един push, после трябваше да го revoke веднага. **За бъдеще: SSH key auth или GitHub Actions, не PAT в chat.**

---

## 🚀 СЛЕДВАЩА СЕСИЯ — ПРИОРИТЕТИ

### Приоритет 1: Чакай retrofit чата

Retrofit Tasks 1-6 продължават в отделния Claude Home чат. Не пипай Mixer файлове, не push нищо което може да конфликтира.

### Приоритет 2: Calm секция — gather requirements

Започни обсъждане на A1-A4 декizions (Calm/Diary/Sleep/Profile). Първо Calm (най-критичен за бащата, заедно с Mixer).

### Приоритет 3: Audio normalization скрипт

След retrofit Task 6 — нов task за `tools/audio_normalize.py` (Python + ffmpeg). Може в текущ чат или нов.

### Приоритет 4: Push outdated files cleanup

Изтрий outdated mockup-и от `design/mockups/`. Push само актуалното.

### Приоритет 5: Audio decisions (C1-C6) → mixer-presets.js

След като Mixer mockup е готов (Task 5) и аудио файловете са нормализирани → wire-ни ги в `js/mixer-presets.js`. Това е голяма работа, вероятно отделен чат.

---

## 💬 НАПОМНЯНЕ ЗА КОМУНИКАЦИЯ С ТИХОЛ

(От base bibles + lessons learned през сесията)

- БГ, кратко, без "може би"
- CAPS = спешност или раздразнение
- "Ти луд ли си" = забравил си критичен контекст → препрочети canon + handoff
- Дълги обяснения = Тихол спира да чете → максимум 5-6 реда + конкретен код/действие
- "Прав си, коригирам" вместо "извинявай"
- Не питай за технически решения (file naming, git workflow, backup) — реши сам
- Питай за логически/продуктови (UX, текстове, нови features)
- Един въпрос/въпросник на път — НЕ batch-ваш 5 въпроса
- Тихол не е developer — давай Python скриптове за paste, не CLI workflows

---

## ⚠ STATUS ЗА RETROFIT ЧАТА (за следване отвън)

Retrofit чатът е активен и в момента работи Task 1 fix + Task 2 готов. **НЕ му пиши нови инструкции освен:**
1. Hybrid Task 5 logic (вече пуснат)
2. Phone test feedback ("ОК" за следваща task)
3. Bug reports ако нещо счупи

Когато стигне Task 5 → Тихол ще го попита за preset_pink_pure / preset_brown_pure mapping decision за "Розов шум".

Когато стигне Task 6 → пълен phone test + git push.

---

*Handoff заключен 23.05.2026 (вечер). Следваща сесия има пълен контекст.*
*Автор: Claude (Opus 4.7) с Тихол.*
*Active retrofit chat: отделен Claude Home в claude.ai.*
