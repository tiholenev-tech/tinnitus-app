# SESSION HANDOFF — 23.05.2026

**Сесия:** "AURALIS — Първи задачи"
**Продължителност:** ~10 часа
**Статус:** ЗАКЛЮЧЕНА

---

## 🎯 ЦЕЛ НА ТОЗИ ДОКУМЕНТ

Следващият Claude чат прочита ТОЗИ файл ПЪРВО. Покрива всичко взето през деня — решения, готов код, отворени въпроси, какво следва.

---

## 📖 РЕД НА ЧЕТЕНЕ ЗА НОВ CLAUDE

1. **ТОЗИ файл** (handoff)
2. `docs/bibles/AURALIS_BIBLE_v2.md` (base)
3. `docs/bibles/AURALIS_BIBLE_v2_1_APPENDIX.md` (нови правила от днес)
4. `docs/decisions/` (всички решения)
5. `docs/research/` (научни — по нужда)

---

## ✅ ЗАВЪРШЕНО ДНЕС

### Repo setup
- Repo `tiholenev-tech/tinnitus-app` създаден (private)
- 27+ файла качени: 25 research + 2 bibles + decisions + legacy
- `.gitignore` правилно настроен (audio_files/ изключен)

### PWA Skeleton (commit 9a87852)
- HTML/CSS/JS архитектура
- Bichromatic theme (dark + light) с toggle
- Design tokens — пълен набор
- Service Worker skeleton
- Manifest.json

### Onboarding Flow (commit 247b4e8)
- 3 екрана: Welcome / Value / Consent
- Wave pulse animation (4s)
- prefers-reduced-motion respect (50+)
- Browser back integration (history API)
- LocalStorage persistence
- Disabled CTA state на Consent

### Quiz Wizard (commit 4d23dd4)
- 15 въпроса от docs/research/01
- Auto-advance (400ms delay)
- Progress bar 1/15 → 15/15
- DI calculation (Q10+Q11+Q12)
- 5 profiles (TH_C/DN_S/SS_R/SM_F/HB_M)
- Results screen с DI bar (muted→champagne→indigo)
- Browser back + refresh persistence

### PWA Icons (commit 4d23dd4)
- 192, 512, 180, maskable-512
- Concentric circles design (indigo + champagne)
- `tools/icon-generator.html` за бъдещи regenerations

### Audio Engine (Pink/Brown/Green)
- `js/audio-engine.js` — 3 noise generators (Paul Kellet, DC-removed, bandpass)
- `tools/audio-test.html` — standalone test page
- Тестван на телефон — работи

### Audio Library Analysis
- 230 аудио файла анализирани (Epidemic Sound)
- 92 безопасни (score ≥ 80)
- 39 loop-friendly + safe
- Tool: `tools/audio_check.py` (Python скрипт)
- Outputs: `audio-report.csv` + `audio-report.html` (gitignored)

### Decision Logs (3)
- `2026-05-23-quiz-vs-thi-split.md`
- `2026-05-23-calm-meditation-section.md`
- `2026-05-23-behavioral-tips-info-panels.md`

### Research Document Add
- `docs/research/25-behavioral-management-extra-app.md` (Deep Research резултат, 490 реда)

### BIBLE v2.1 APPENDIX
- `docs/bibles/AURALIS_BIBLE_v2_1_APPENDIX.md`
- Всички решения от деня структурирани в 11 части

---

## 🟡 В РАБОТА (НЕ COMMIT-НАТО)

### Mixer UI (Claude Home на компа на Тихол)

**Готово в локалния копия (Desktop/auralis/):**
- `js/mixer.js`
- `js/mixer-engine.js`
- `js/mixer-presets.js`
- `css/mixer.css`
- `js/info-panel.js` (универсална система)
- `js/info-content.js`
- `css/info-panel.css`

**Защо НЕ е commit-нато:**
Тихол реши да реструктурираме UI на **2 tabs** (Препоръчани / Всички звуци) вместо Simple/Advanced toggle. Текущата имплементация е с Simple/Advanced — трябва restructure.

**Status на текущия код:**
- ✅ Audio engine integration работи
- ✅ "Дълбоко спокойствие" preset работи (Pink+Brown)
- ✅ Advanced mode работи (5 канала с slider-и)
- ✅ Sleep timer работи (1 мин test до 60 мин)
- ✅ Master volume slider работи
- ✅ Theme toggle работи в Mixer
- ✅ First-time coachmarks (3 стъпки) имплементирани
- ✅ Info panels (3 типа: tooltip/bottom-sheet/coachmark) имплементирани
- ❌ Sample channels failват тихо (404 на placeholder filenames)
- ❌ Screen flash при tap (известен Web Audio bug — изисква поправка)

---

## ❗ КРИТИЧНО РЕШЕНИЕ ЗА СЛЕДВАЩАТА СЕСИЯ

### Mixer 2 tabs реструктуриране

**Финална архитектура (одобрена):**

```
[Препоръчани] [Всички звуци]  ← 2 tabs

ПРЕПОРЪЧАНИ:
- 3-5 микса според Quiz профила
- ⭐ icon на най-препоръчания
- "За Вашия профил: [TH_C]" tag

ВСИЧКИ ЗВУЦИ:
🌊 Вода / Природа (15)
🧘 Медитации (10)
🌬 Атмосферни (5)
🎚 Базови шумове Pink/Brown/Green (3)
```

**Detail card на всеки звук съдържа:**
- Какъв е звукът (описание)
- За кого е (✅ / ⚠ профили)
- Кога да се пуска
- Какво да очаквате (timeline: седмица 1-2, 3-4, месец 2-3)
- Защо работи (научно)
- Цитат на проучване
- Бутон Play

### Info panels content writing

11 entries нужни:

**Mixer presets (6):**
1. `preset_deep_calm` — Дълбока вода (Pink + Brown)
2. `preset_sea_shore` — Морски бряг (Brown + Ocean sample)
3. `preset_underwater` — Подводен свят
4. `preset_forest_stream` — Горски поток (Green + River)
5. `preset_pink_pure` — Розов шум
6. `preset_brown_pure` — Кафяв шум

**General topics (5):**
7. `why_no_white_noise` — Защо нямаме бял шум
8. `why_habituation` — Защо хабитуация, не лечение
9. `what_is_di_score` — Какво е DI
10. `how_long_to_listen` — Колко време всеки ден
11. `why_no_volume_max` — Защо силата е важна

**Всеки entry трябва да следва 5-те правила (виж BIBLE v2.1 Appendix Част 2.1):**
1. Прост език (4-5 клас)
2. Без жаргон
3. Реални проучвания с числа
4. "Какво да очаквате" timeline (3 етапа)
5. БГ език, уважителен Вие

---

## 📋 ОТВОРЕНИ ВЪПРОСИ

### 1. Sample файлове — реални имена
**Status:** Placeholder `sample_01.mp3`...`sample_05.mp3`
**Действие:** Преименуване скрипт или промяна в mixer-presets.js (предпочитано второто).
**Файлове за първи 5:**
- `sample_01.mp3` → Underwater Deep Low
- `sample_02.mp3` → Black Sea Distant Waves
- `sample_03.mp3` → Underwater Complex 03
- `sample_04.mp3` → Underwater Gargle River
- `sample_05.mp3` → Mediterranean Calm

### 2. Mixer screen flash bug
**Симптом:** При tap на preset → целия екран проблясва
**Причина (theory):** ctx.resume() или body CSS transition
**Решение:** Изолирай audio state от CSS transitions, използвай transform: translateZ(0) на animated елементи

### 3. Audio normalization (loudness)
**Решено:** Стандарт -23 LUFS (EBU R128 broadcast)
**Status:** Скрипт `tools/audio_normalize.py` НЕ е написан още
**Кога:** Преди финален Mixer integration (когато имаме крайния списък файлове)

### 4. Fire категория
**Решено:** Пропускаме за beta 1.0 (Epidemic Sound няма fire без crackling)
**Phase 2:** Custom recordings (BBC Sound Archive, freesound.org CC0)

### 5. Mixer кода — restructure или start over?
**Решение от Тихол:** Start over с правилния plan (2 tabs + info panels + sample integration)
**Causes:** Текущият има wrong UI architecture (Simple/Advanced)

---

## 🛠 INSTRUMENTS И СКРИПТОВЕ

### audio_check.py
**Path:** `tools/audio_check.py`
**Употреба:**
```
python tools/audio_check.py "C:\Users\USER\Desktop\auralis\audio_files"
```
**Output:** audio-report.csv + audio-report.html в parent папка

### icon-generator.html
**Path:** `tools/icon-generator.html`
**Употреба:** Отвори в браузер → Свали 4 PNG → Сложи в `icons/`

### audio-test.html
**Path:** `tools/audio-test.html`
**Употреба:** Standalone test за Pink/Brown/Green generators
**URL:** http://localhost:8000/tools/audio-test.html

---

## 🔧 WORKFLOW ЗА РАЗРАБОТКА

**Винаги отворени 2 CMD прозореца:**

CMD #1:
```
cd C:\Users\USER\Desktop\auralis
python -m http.server 8000
```

CMD #2:
```
ngrok http 8000
```

**Тестове:**
- Compu: http://localhost:8000
- Phone: ngrok HTTPS URL
- Local WiFi: http://192.168.2.4:8000

**Reset на потребителски data за тест:**
```javascript
localStorage.clear();
location.reload();
```

**Reset само на onboarding:**
```javascript
localStorage.removeItem('auralis-onboarding-done');
localStorage.removeItem('auralis-quiz-done');
location.reload();
```

---

## 🎨 DESIGN TOKENS — REFERENCE

```css
/* Палитра (от tokens.css) */
--bg-color: #080813 (dark) / #E8E3EE (light);
--card-color: #151026;
--accent-color: #4F46E5;
--accent-dim: #2A2547;
--champagne: #F1E6C8;
--text-color: #F8F5F0;
--muted-color: #8A82A8;

/* Spacing (8pt grid) */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 12px;
--space-lg: 16px;
--space-xl: 24px;
--space-xxl: 32px;
--space-xxxl: 48px;

/* Font sizes */
--font-xs: 13px;
--font-sm: 14px;
--font-base: 16px;  /* минимум за 50+ */
--font-lg: 20px;
--font-xl: 28px;
--font-xxl: 36px;

/* Font weights */
--fw-normal: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;

/* Line heights */
--lh-body: 1.5;     /* по-голям за 50+ */
--lh-heading: 1.2;

/* Border radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;   /* MAX */
--radius-pill: 100px;

/* Shadows */
/* Bichromatic Neon Glass (dark) + Neumorphism (light) */
```

---

## 📊 МЕТРИКИ ЗА УСПЕХ (НАПОМНЯНЕ)

От base Bible Част 13:
- THI: 62 → ≤55 (-7 точки) при бащата след 14 дни
- Sleep onset: 60 мин → ≤30 мин
- Subjective тинитус: 8/10 → ≤6/10

---

## 🚀 СЛЕДВАЩА СЕСИЯ — ПРИОРИТЕТИ

### Приоритет 1: Mixer UI restructure (2 tabs)
- Изхвърли Simple/Advanced toggle
- Имплементирай 2 tabs (Препоръчани / Всички звуци)
- Категории в "Всички звуци"
- Detail card шаблон с "Какво да очаквате"

### Приоритет 2: Info content за 11 entries
- Следвай 5-те правила (BIBLE v2.1 Appendix Част 2.1)
- Цитирай реални проучвания от research документите
- Не измисляй

### Приоритет 3: Sample integration
- Промяна на mixer-presets.js да чете истинските wav имена
- Тест с реалните 5 sample файла
- Sample dropdown в "Всички звуци" таб

### Приоритет 4: Screen flash bug fix
- Изолирай audio state
- transform: translateZ(0) на animated елементи

### Приоритет 5: Calm секция (start)
- Bottom nav с 4 секции
- 3 audio-guided упражнения

---

## 💬 ПРАВИЛА ЗА КОМУНИКАЦИЯ С ТИХОЛ

**От base Bible:**
- Само БГ, кратко, без "може би"
- CAPS LOCK = спешност/раздразнение
- "Ти луд ли си" = забравил си контекст → прочети bibles наново
- 60% плюсове + 40% честна критика — никога чиста валидация
- Технически → решавай сам. Логически/продуктови → питай

**Допълнителни от 23.05.2026:**
- Тихол не е developer — давай прости стъпки, без жаргон
- Той мрази да чака → винаги имай парала задача
- "Прав си, коригирам" вместо "извинявай"
- Кратки отговори (chat context limit мисли)
- Screenshots на компа/телефона = primary debug tool
- Възрастен баща Android testing → mobile-first приоритет

---

## ⚠️ КРИТИЧНИ ГРЕШКИ ДА ИЗБЯГНЕШ (lessons learned)

1. **Не пускай Claude Code в Linux bash** — той се хваща за prompt-а буквално. Claude Code Browser = в нов чат на claude.ai, не на droplet терминал.

2. **Не давай дълги промпти за content writing на Claude Home** — той ще се обърка с code. Content writing = в browser чат.

3. **Винаги проверявай къде Python http.server работи** — често е в грешна папка. Проверка: `cd C:\Users\USER\Desktop\auralis` ПРЕДИ `python -m http.server 8000`.

4. **ngrok URL се сменя при restart** — ако ngrok падне → нов URL → препрати на телефона.

5. **Не предполагай че `audio_files/` е в .gitignore** — провери. 230 wav = 1-3 GB.

6. **При `cd Desktop\auralis` грешка** → ползвай full path: `cd C:\Users\USER\Desktop\auralis`.

---

## 📞 ЗА НОВ CLAUDE — STARTUP RITUAL

```
1. Здравей, Тихол.
2. Прочетох SESSION_2026-05-23_HANDOFF.md.
3. Прочетох BIBLE v2 (base) + BIBLE v2.1 Appendix.
4. Прочетох 3-те decision logs от 23.05.2026.
5. Виждам че текущ статус е: Mixer restructure pending.
6. Готов съм за работа. Какво следва?
```

---

*Handoff заключен 23.05.2026. Следваща сесия може да започне с пълен контекст.*
*Author: Claude (Opus 4.7) с Тихол.*
