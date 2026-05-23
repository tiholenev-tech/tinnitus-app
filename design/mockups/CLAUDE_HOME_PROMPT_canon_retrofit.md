# PROMPT за нов Claude Home чат — Canon Retrofit

**Копирай ВСИЧКО отдолу в нов Claude чат на claude.ai. Project: tinnitus-app.**

---

Здравей. Аз съм Тихол. Започваме нова сесия по AURALIS (tinnitus-app). Цялата сесия е **визуален retrofit** на съществуващите екрани към новия design canon.

## §0 PRIME DIRECTIVE — ПРОЧЕТИ И ПРИЕМИ ПРЕДИ ВСИЧКО ДРУГО

**Има само ДВА източника на истината за визия:**

1. **`docs/canon/AURALIS_DESIGN_CANON_v1.md`** — категорични правила. Следваш ги **1:1**, без интерпретация.
2. **`design/mockups/mixer-2tabs-v3-cards.html`** — SACRED визуален reference. Копираш CSS и HTML pattern-и **1:1**, не преписваш по памет, не "подобряваш".

**Правила за работата с тях:**
- При всяко съмнение — отвори mixer-v3 source code и копирай блока 1:1
- Никога не казваш "мисля че може и така" — четеш canon-а
- Никога не "оптимизираш" или "опростяваш" CSS от v3
- Ако нещо в съществуващия код противоречи на canon-а — canon-а печели (без дискусия)
- Ако нещо в canon-а противоречи на v3 mockup-а — питаш Тихол (не решаваш)
- НЕ измисляш свои tokens, цветове, размери, анимации
- НЕ казваш "това е стандартен подход" — стандартът е v3, нищо друго

**Преди да напишеш и един ред CSS — отвори mixer-2tabs-v3-cards.html и виж как е направено там.**

Това е §0 защото е fundament. Ако се отклониш — цялата сесия е напразна.

## 1. ПРОЧЕТИ ПЪРВО (без скимане, в този ред)

Repo: `tiholenev-tech/tinnitus-app` (публично, чети с curl от raw.githubusercontent.com):

1. `docs/canon/AURALIS_DESIGN_CANON_v1.md` — **водещ документ, 12 секции, категорични правила**
2. `design/mockups/mixer-2tabs-v3-cards.html` — **SACRED visual reference, копирай 1:1**
3. `js/info-content.js` — 25 канонични текстове (mixer:6, general:5, categories:6, navigation:3, mechanics:5)
4. `tools/audio-library-status.md` — 39 одобрени audio файла + 6 препоръчителни preset-и
5. `docs/SESSION_2026-05-23_HANDOFF.md` — статус на проекта
6. `docs/bibles/AURALIS_BIBLE_v2.md` + `AURALIS_BIBLE_v2_1_APPENDIX.md` — продуктова библия

После кажи "прочетох всичко + готов за Task 1" и чакай.

## 2. МИСИЯ

Преправи **целия съществуващ visual layer** към canon-а. Запази функционалността (audio engine, quiz logic, state, localStorage). Промени само CSS + HTML markup където е нужно за shine spans и canon pattern.

**SACRED reference:** mixer-2tabs-v3-cards.html. Когато имаш съмнение — отвори го и копирай 1:1. Никога не интерпретирай.

## 3. SCOPE — какво ПИПАШ и какво НЕ

### ✅ ПИПАШ (visual layer)
- `css/tokens.css` — REWRITE с canon tokens (soft night + pastel light)
- `css/base.css` — REWRITE с body bg recipe + header pattern
- `css/onboarding.css` — REFACTOR 3 екрана към glass cards + shine spans
- `css/quiz.css` — REFACTOR quiz wizard
- `index.html` — UPDATE link tags, Montserrat 400-900, theme toggle в header
- HTML template strings в `js/onboarding.js` + `js/quiz.js` — wrap glass cards с 2 shine spans
- `design/mockups/mixer-2tabs-v1.html` — PRETT TO ПРЕНАПИШИ (моя стар е грешен, копирай v3)

### ❌ НЕ ПИПАШ (functional layer)
- `js/audio-engine.js` — работи, тестван на phone
- `js/quiz-data.js` — 15 въпроса заключено
- `js/quiz-engine.js` — scoring logic
- `js/state.js` — localStorage persistence
- `js/app.js` — main controller
- `js/info-content.js` — канонични текстове, не пиши нови
- `service-worker.js`, `manifest.json`
- `docs/`, `tools/`, `audio/`, `icons/`

## 4. КАТЕГОРИЧНИ ПРАВИЛА (от canon §1 + §9)

- ВИНАГИ "Вие", НИКОГА "Ти"
- ВИНАГИ Montserrat, SVG icons (НЕ emoji в UI)
- ВИНАГИ champagne #F1E6C8 за warning, НЕ червено
- ВИНАГИ indigo (hue 255) за primary CTA
- tap ≥ 44×44px, font ≥ 13px
- Hues 255 + 222 фиксирани
- Soft Night: bg opacity 0.07, shine intensity 0.42, sat ≤ 65%
- Header order: theme **ЛЯВО**, brand **ЦЕНТЪР**, settings **ДЯСНО**
- Expandable default = свит + friendly въпрос ("Искате ли да знаете повече?")
- НЕ `.glow` / `.glow-bottom` (sensory comfort за 50+ с тинитус)
- НЕ pure black/white, НЕ "лекува"/"терапия"

## 5. WORKFLOW (КРИТИЧНО)

Аз НЕ съм developer. Ти даваш **един файл/задача в момента**, после **чакаш моята обратна връзка**. Не bombarda с 10 файла наведнъж.

За всяка задача:
1. Ти казваш кой файл правиш + защо (1 изречение)
2. Даваш ми пълния файл, copy-paste ready
3. Аз paste-вам в `C:\Users\USER\Desktop\auralis\[path]`
4. Тествам на phone (виж §6)
5. Казвам "ОК" или какво е счупено
6. Минаваме на следваща задача

**Никога не питай "готов ли си" — давай директно. Никога не предлагай "опция A / опция B" — реши и кажи защо.**

## 6. TEST WORKFLOW

```
CMD #1:
cd C:\Users\USER\Desktop\auralis
python -m http.server 8000

CMD #2:
ngrok http 8000
```

Тестова устройство: Samsung Z Flip6. Reset на потребителски data в конзолата:
```javascript
localStorage.clear(); location.reload();
```

## 7. ATOMIC TASKS (в този ред)

| # | Файл/-ове | Задача |
|---|---|---|
| 1 | `css/tokens.css` + `css/base.css` | Foundation: tokens (soft night + pastel), body bg recipe, header pattern, Montserrat 900 |
| 2 | `index.html` | Header markup (theme toggle ляво + brand център + settings дясно) + link tags |
| 3 | `css/onboarding.css` + HTML в `js/onboarding.js` | 3 екрана → glass cards + 2 shine spans + canon бутони |
| 4 | `css/quiz.css` + HTML в `js/quiz.js` | Quiz wizard → glass cards + 64px answer pills + indigo→champagne→indigo gradient на progress bar |
| 5 | `design/mockups/mixer-2tabs-v1.html` | Пренапиши = копие на v3 sacred (с adaptiv за info-content.js entries) |
| 6 | QA pass | Phone test dark+light на всички екрани, бутони ≥ 44px, прехвърляне между state-овете |

След всеки task → git commit + push (аз правя). Формат: `REFACTOR: Task N — [описание]`.

## 8. ACCEPTANCE

Сесията е завършена когато:
- Всички 5 екрана (onboarding 3 + quiz 15 + results) изглеждат **визуално като mixer-v3** (същия glass, shine, header pattern, palette)
- Theme toggle работи instant на всеки екран
- Phone test пълен flow без счупване
- Quiz auto-advance + browser back + localStorage persistence — непокътнати
- Нула `.glow` стилове, нула emoji в UI, нула "Ти" в текста

## 9. КОГА ДА ПИТАШ

Питаш **САМО** при:
- Конфликт между canon и съществуващ HTML structure
- Нещо което не е в canon / mockup / bibles
- Промяна на дизайн (НЕ техническо решение)

НЕ питаш за:
- File naming, code organization, backup стратегия
- Commit message wording
- Какъв git workflow
- Кога да тествам

## 10. КАК ДА КОМУНИКИРАМЕ

- БГ, кратко, без "може би"
- CAPS = спешност от мен
- "Ти луд ли си" = забравил си нещо критично от canon → препрочети
- Дълги обяснения = аз се отказвам да чета. Максимум 5-6 реда + код.
- "Прав си, коригирам" вместо "извинявай"

---

**Започваме с Task 1: foundation.** Дай ми пълни `css/tokens.css` + `css/base.css` копирани от mixer-v3 source, готови за paste. Не питай нищо предварително.
