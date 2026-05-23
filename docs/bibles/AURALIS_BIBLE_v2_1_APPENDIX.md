# AURALIS BIBLE v2.1 — APPENDIX (23.05.2026)

**Дата:** 23.05.2026
**Статус:** ✅ Заключено
**Предишна версия:** AURALIS_BIBLE_v2.md (база)

Този документ съдържа ВСИЧКИ решения взети през първата development сесия (23.05.2026). Допълва base Bible-а, не го заменя.

---

## Част 1: ИНТЕРФЕЙСНИ ПРАВИЛА

### 1.1 — Бутони и tap behavior

**Правило 1.1.1: Tap (НЕ Hold)**
- Всички основни действия в AURALIS се правят с tap, никога с long-press/hold
- Long-press = лош за 50+ (тремор, accidental)
- Изключение: drag слайдъри (volume, etc.)
- **Източник решение:** docs/research/14-sensory-behavioral-dynamics.md

**Правило 1.1.2: Минимални размери (50+ UX)**
- Бутони: минимум 44×44px (Apple HIG стандарт)
- CTAs: 52px height
- Quiz отговори: 64px height (КЛЮЧОВИ действия)
- Padding между бутони: 12px минимум

**Правило 1.1.3: Auto-advance**
- При Quiz: tap отговор → 400ms delay → auto-next въпрос
- БЕЗ "Next" бутон (по-малко friction)
- Изключения: критични decisions (commit, delete, payment) — explicit бутон + confirm

### 1.2 — Цветова семантика

**Правило 1.2.1: Цветове за scoring (Quiz, DI, прогрес)**

❌ ЗАБРАНЕНО:
- Червено за "тежък" / "danger"
- Светофар pattern (red/yellow/green)

✅ ПРАВИЛНО:
- Лек: `--muted-color` (#8A82A8)
- Умерен: `--champagne` (#F1E6C8)
- Тежък: `--accent-color` (#4F46E5 indigo)

**Защо:** Червеното активира амигдала реакция → изостря тинитуса (docs/research/03 — лимбична хиперактивност). AURALIS е wellness инструмент, не диагностичен светофар.

**Правило 1.2.2: Брандова консистентност**
- Indigo на края на скали = "вашето ниво", не "warning"
- Всеки прогрес е достижение, не алармен сигнал

### 1.3 — Тон на език

**Правило 1.3.1: Уважителен "Вие" (никога "ти")**
- Цял app: формално Вие
- Изключение: AI assistant casual моменти (на по-късен етап, ако се одобри)

**Правило 1.3.2: Без страх език**

❌ ЗАБРАНЕНО:
- "Опасно"
- "Вредно"
- "Забранено"
- "Алармa"
- "Внимание!"

✅ ПРАВИЛНО:
- "Не препоръчваме"
- "Може да изостри"
- "Препоръчителна продължителност"
- "Важно"

**Правило 1.3.3: Уверена + хумилна комуникация**
- Уверена: цитирай реални проучвания с конкретни числа
- Хумилна: винаги "резултатите варират", "не обещаваме лечение"

---

## Част 2: КОМУНИКАЦИОННА СТРАТЕГИЯ

### 2.1 — 5 правила за всеки потребителски текст

ЗАДЪЛЖИТЕЛНИ за info panels, descriptions, tooltips, заглавия:

**Правило 2.1.1: Прост език (4-5 клас четивен ниво)**
- ❌ "Активира парасимпатиковата нервна система"
- ✅ "Помага на тялото да се успокои"

**Правило 2.1.2: Без жаргон (или обяснява веднага)**
- ❌ "Спектрален centroid 114Hz"
- ✅ "Дълбок, басов звук"

**Правило 2.1.3: ВИНАГИ цитира проучване (с реални числа)**
- ❌ "Помага много"
- ✅ "Проучване от 2023 (240 пациента): 68% подобрен сън след 30 дни"

**Правило 2.1.4: Конкретни очаквания (timeline)**

Винаги покривай 3 етапа:
- Седмица 1-2
- Седмица 3-4
- Месец 2-3

**Правило 2.1.5: БГ език, уважителен**
- ❌ "Ти ще се почувстваш по-добре"
- ✅ "Ще се почувствате по-добре"

### 2.2 — "Какво да очаквате" формат

ЗАДЪЛЖИТЕЛНА секция във ВСЕКИ info panel за presetи/упражнения:

```
📈 КАКВО ДА ОЧАКВАТЕ

Ако спазвате препоръките (X минути дневно):

Седмица 1-2:
[Какво се случва]

Седмица 3-4:
[Какво се случва]

Месец 2-3:
[Какво се случва]

⚠ Важно:
• Резултатите варират
• НЕ обещаваме лечение
• Тинитусът не изчезва, но мозъкът се научава да го игнорира
```

### 2.3 — "Поведенческо изискване за резултат"

ЗАДЪЛЖИТЕЛЕН елемент: всеки info panel ОБЯСНЯВА какво потребителят трябва да направи за да получи описаните резултати.

**Формула:**
- "Ако слушате [X минути] [Y пъти седмично] в продължение на [Z седмици]..."

**Защо:** Без действие няма резултат. Установяваме навик чрез очаквания.

### 2.4 — Disclaimer (задължителен)

Във ВСЕКИ info panel:

```
⚠ Важно:
• Резултатите варират
• НЕ обещаваме лечение
• Тинитусът не изчезва, но мозъкът се научава да го игнорира
```

**Защо:** AURALIS = wellness, НЕ healthcare (ЗАКОН №1 от base Bible).

---

## Част 3: ИНФО ПАНЕЛИ — СИСТЕМА

### 3.1 — 3 типа info panels

**Тип 1 — TOOLTIP (микро-context)**
- Trigger: малка ⓘ иконка (16px, muted color) до елемент
- Tap → малък overlay tooltip
- Съдържание: 1-3 изречения micro text + "Прочетете повече →"
- Auto-dismiss: 5 секунди или tap навсякъде

**Тип 2 — BOTTOM SHEET (full context)**
- Trigger: "Прочетете повече" от Tooltip ИЛИ ⓘ върху ключови елементи
- Размер: 70-75% от екрана (height)
- Структура: H3 заглавие → meta (когa/продължителност) → 2-4 параграфа → source attribution
- Close: X / click outside / Escape / drag-down (опционално)

**Тип 3 — FIRST-TIME COACHMARKS**
- Trigger: localStorage `module-first-visit-{moduleName}` !== true
- 2-3 sequential tooltips с pulse glow
- Step indicator (1/3 → 2/3 → 3/3)
- Бутони: "Прескочи" + "Разбрах"
- На приключване → localStorage flag

### 3.2 — Източник на content

**Структура на info-content.js:**

```javascript
const INFO_CONTENT = {
  mixer: {
    'preset_id': {
      title: 'Защо този микс?',
      micro: '1-3 изречения за tooltip',
      full: '... structured content ...',
      source: 'Author et al. (Year). Journal.'
    }
  },
  calm: { /* ... */ },
  diary: { /* ... */ },
  general: {
    'why_no_white_noise': { /* ... */ },
    'why_habituation': { /* ... */ }
  }
};
```

### 3.3 — Имплементация по модули

| Module | Phase | Status |
|---|---|---|
| Mixer | Phase 1 | В работа |
| Calm | Phase 2 | Pending |
| Daily Diary | Phase 3 | Pending |
| Sleep Mode | Phase 4 | Pending |
| Profile/Resources | Phase 5 | Pending |

---

## Част 4: MIXER UI — РЕСТРУКТУРИРАНЕ

### 4.1 — Финална архитектура (одобрена 23.05.2026)

**ОТКАЗАНО:** 2 отделни режима (Simple / Advanced) с toggle в settings.
**ПРИЕТО:** 2 tabs горе — Препоръчани / Всички звуци.

```
╭─────────────────────────────╮
│ tinnitus-app    [☀/🌙] [⚙] │
│                             │
│ [Препоръчани] [Всички звуци]│  ← TABS
│                             │
│ ╭─────────────────────────╮ │
│ │ ⭐ Подводна тишина     │ │
│ │ Дълбоки честоти 60-120Hz│ │
│ │ За Вашия профил: TH_C   │ │
│ │              [ⓘ] [▶]    │ │
│ ╰─────────────────────────╯ │
╰─────────────────────────────╯
```

**Tab 1: ПРЕПОРЪЧАНИ**
- 3-5 микса според Quiz профила на потребителя
- Голяма карта на всеки
- Star icon (⭐) на най-препоръчания
- "За Вашия профил: [Profile Name]" tag

**Tab 2: ВСИЧКИ ЗВУЦИ**
- Категоризирани:
  - 🌊 Вода / Природа
  - 🧘 Медитации
  - 🌬 Атмосферни
  - 🎚 Базови шумове (Pink/Brown/Green)
- Filterable + searchable
- Всеки звук = analytical card с ⓘ

### 4.2 — Защо НЕ Simple/Advanced toggle

- "Advanced" страх — потребителят не знае какво е
- Зъбно колело иконка → 50+ не разбира
- 2 tabs = естествен flow
- "Препоръчани първо" = по-добра educational journey

### 4.3 — Pink/Brown/Green generators

**НЕ ги скриваме!** Те влизат в "Всички звуци" → категория "Базови шумове".

**Със собствени info panels:**
- "Защо Pink е по-добро от White noise?"
- "Какво е Brown noise и за кого е?"
- "Green noise — средночестотен релакс"

### 4.4 — Sleep timer

- Опции: 1 мин (test) / 15 / 30 / 60 / 90 / 120 мин
- Fade out последните 5 секунди
- При завършване: `ctx.suspend()` + status update
- Bottom indicator: "🎵 Активен: [име] · 03:24"

---

## Част 5: AUDIO БИБЛИОТЕКА

### 5.1 — Текущ статус (23.05.2026)

**Файлове в `Desktop/auralis/audio_files/`:**
- 230 файла общо (Epidemic Sound + меди тационни)
- 92 безопасни (safety score ≥ 80)
- **39 loop-friendly + safe** ← база за beta 1.0

**По категории (loop+safe):**
| Категория | Брой |
|---|---|
| meditation | 10 ✅ (за Calm) |
| water_river | 7 ✅ |
| water_ocean | 6 ✅ |
| water_other | 6 ✅ |
| water_rain | 3 ⚠ |
| forest | 3 ⚠ |
| wind | 1 ⚠ |
| fire | 0 ❌ (пропускаме) |

### 5.2 — Решение за fire категория

**ПРОПУСКАМЕ за beta 1.0.** Epidemic Sound почти всички fire файлове имат crackling/spit/pop = резки transients = триггерат тинитус.

**За Phase 2:** Custom recordings от природа (BBC Sound Archive, freesound.org с CC0 license).

### 5.3 — Audio файлове НЕ са в git

`audio_files/` е в `.gitignore`. Защо:
- Размер: 1-3 GB
- GitHub лимит: 1 GB per repo
- Не са код
- За beta launch → CDN (Cloudflare/S3)

### 5.4 — Loudness normalization (decision)

**Стандарт:** -23 LUFS integrated (EBU R128 broadcast)
**True peak:** ≤ -1 dBTP
**LRA:** < 5 LU (без скокове)

**Защо -23 LUFS (не -14 или -16):**
- Дълги sessions (часове)
- Sleep mode (8 часа)
- 50+ потребители
- Тинитус = слух претоварен

**Script:** `tools/audio_normalize.py` (TBD — ще се напише при нужда)

### 5.5 — Sample файлове за Mixer

5 топ файла за първи интеграция (placeholder имена → реални):

| Placeholder | Реално име | Категория |
|---|---|---|
| `sample_01.mp3` | Underwater Deep Low | water_other |
| `sample_02.mp3` | Black Sea Distant Waves | water_ocean |
| `sample_03.mp3` | Underwater Complex 03 | water_other |
| `sample_04.mp3` | Underwater Gargle River | water_river |
| `sample_05.mp3` | Mediterranean Calm | water_ocean |

**TODO:** Преименуване скрипт + интеграция в mixer-presets.js.

---

## Част 6: BEHAVIORAL TIPS — КАКВО ИЗПОЛЗВАМЕ И КАКВО НЕ

### 6.1 — От документ 25 (behavioral management)

**ИЗПОЛЗВАМЕ (non-medical):**
- TMJ self-massage (Chin Tucks, стречинг)
- Йога пози (Триконасана, Бхуджангасана, и т.н.)
- Денонощни ритуали (сутрешен/вечерен)
- CBT техники (cognitive reframing)
- Mindfulness (4-7-8 дишане, ПМР)
- Социална комуникация (как да обяснят на близки)
- Sleep hygiene (без лекарства)

**НЕ ИЗПОЛЗВАМЕ (medical):**
- ❌ Хранителни добавки и дози (Гинко 120-240mg, Магнезий, и т.н.)
- ❌ "Избягвайте кафе/алкохол/сол" (диета)
- ❌ MSG, аспартам тригери
- ❌ Витамин B12, цинк препоръки
- ❌ Каквото и да е prescription-like съдържание

**Защо:** AURALIS = wellness, НЕ healthcare. Препоръчването на добавки = регулаторен риск + загуба на доверие.

### 6.2 — Phase 2+: Медицинска секция

Ако имаме клинично партньорство или БГ лекар:
- "Консултирайте с лекар" формат
- Линкове към специалисти
- Reference към научните дози (без "ние препоръчваме")

---

## Част 7: QUIZ — ДОПЪЛНИТЕЛНИ ПРАВИЛА

### 7.1 — Tone адаптация (одобрено)

Конвертирани въпроси от документ 01 на формално Вие:
- "Какъв звук чуваш?" → "Какъв звук чувате?"
- Тон на отговорите остана първо лице: "не съм сигурен/а"

### 7.2 — "Защо ви питаме това?" link

**ПРОПУСНАТ** за beta 1.0. Не беше задължителен в spec-а.
Phase 2: добавяне като expandable `<details>`.

### 7.3 — Mix cards labels (debug)

Текущо: показват raw code + Title Case (`tonal_comfort_rain` + "Tonal Comfort Rain").
- За debug
- **TODO:** заменяне с човешки имена на БГ в Phase 4

### 7.4 — Reset бутон на results

Има, но с confirm dialog (production-grade).

### 7.5 — Mixer placeholder след results

След quiz results → "Продължи към Mixer" → води до Mixer-а.

---

## Част 8: AUDIO ENGINE — ТЕХНИЧЕСКИ ПРАВИЛА

### 8.1 — Pink/Brown/Green формули

**Pink (Paul Kellet, -3dB/oct):**
- Алгоритъм в `js/audio-engine.js`
- Тестван, клинично оптимален за хабитуация
- Cache на буфера (генериран веднъж на startup)

**Brown (1/f², -6dB/oct):**
- DC removal + нормализация до -6dBFS
- Дълбок тътен за заспиване

**Green (Pink → bandpass 500Hz, Q=1.0):**
- Фокусиран среден диапазон
- Pink буферът reused, само filter chain

### 8.2 — Web Audio батерия правила

КРИТИЧНО за 8-часов sleep mode:

**При pause:**
```javascript
ctx.suspend(); // не само source.stop()
```

**При resume:**
```javascript
ctx.resume();
```

**При смяна на preset:**
- Full stop + cleanup на старите sources
- Garbage collection на disconnected nodes

**Sleep timer:**
- `setTimeout` → fade out 5 sec → `stop` + `suspend`

### 8.3 — Visualization

- **БЕЗ progress bar** по време на звука (continuous, не песен)
- **БЕЗ "current track" timer** (не е плейлист)
- Лек breathing animation на play бутона (4s pulse)
- Bottom indicator: "🎵 Активен: [име]" на всички екрани

---

## Част 9: WORKFLOW — ТЕХНИЧЕСКА ОРГАНИЗАЦИЯ

### 9.1 — Development setup

**Винаги отворени 2 CMD прозореца:**

CMD #1 (Python http.server):
```
cd C:\Users\USER\Desktop\auralis
python -m http.server 8000
```

CMD #2 (ngrok HTTPS tunnel):
```
ngrok http 8000
```

**Тест на компа:** http://localhost:8000
**Тест на телефон:** ngrok HTTPS URL
**Local WiFi:** http://192.168.2.4:8000

### 9.2 — Git workflow

**Преди всеки commit:**
1. Проверка че `audio_files/` е в `.gitignore`
2. Verify: `git status` — никакви огромни файлове
3. Commit message format: `TYPE: Кратко описание` (FEAT/DOCS/DECISION/FIX/CHORE)
4. Push към main след одобрение

**Decisions винаги в decision log:**
- `docs/decisions/YYYY-MM-DD-topic.md`

### 9.3 — Folder structure

```
Desktop/auralis/                  # Git repo
├── docs/                         # Документация
├── js/                           # Application код
├── css/
├── icons/                        # PWA иконки
├── tools/                        # Scripts (audio_check.py, и т.н.)
└── audio_files/                  # 230+ wav (gitignored)
```

### 9.4 — Audio файлове правила

**audio_files/** е НЕ в git. Това е намерено:
- 230 файла → 92 safe → 39 loop+safe
- Локален backup на компа на Тихол
- За beta launch → CDN

**audio-report.html** + **audio-report.csv** също gitignored.

---

## Част 10: ROADMAP — ПОСЛЕДОВАТЕЛНОСТ

**Финален ред (от начало до край, БЕЗ прескачане):**

1. ✅ Setup (Bichromatic skeleton)
2. ✅ Onboarding (3 screens)
3. ✅ Quiz wizard (15 въпроса) + PWA icons
4. 🟡 **Mixer** (в работа — реструктуриране на 2 tabs)
5. ⏳ Info panels система (за всички модули)
6. ⏳ Calm секция (3 audio-guided упражнения)
7. ⏳ Daily Diary (sleep + тинитус 0-10)
8. ⏳ THI (Ден 2-3, separate активация)
9. ⏳ Sleep Mode + SOS BIG BUTTON
10. ⏳ AI assistant (Gemini, voice STT)
11. ⏳ Stripe + GDPR

---

## Част 11: ИЗТОЧНИЦИ ЦИТИРАНЕ — REFERENCE

Когато info panels цитират проучвания, използваме реални от research документите:

**Топ цитирани:**
| Source ID | Файл | За какво |
|---|---|---|
| `research/02` | Web Audio API algorithms | Pink/Brown/Green obоснования |
| `research/11` | Sound therapy effectiveness | RCT данни |
| `research/19` | Sound model evidence-based | TOP 10 sounds + 8 mixes |
| `research/03` | Onboarding strategy 50+ | Trust signals, first 30 sec |
| `research/04` | Retention strategy | Day 1-30 timeline |
| `research/07` | CBT 2-weeks protocol | За Calm секция |
| `research/13` | Touch targets 50+ | UI размери, WCAG AAA |
| `research/14` | Sensory behavioral dynamics | Защо tap не hold |
| `research/15` | Churn analysis | Защо потребителите напускат |
| `research/25` | Behavioral management | Йога, TMJ, ритуали |

**Цитат формат:** `Author, X. et al. (Year). "Title". Journal Name.`

---

*Версия: BIBLE v2.1 — Appendix. Заключено 23.05.2026.*
*Допълва AURALIS_BIBLE_v2.md (base).*
*За пълен контекст: чети първо base Bible, после този Appendix.*
