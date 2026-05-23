# 🚀 START HERE — за нов Claude чат или developer

Здравей. Ако четеш това = ти си нов Claude чат който започва работа върху tinnitus-app (AURALIS), или developer който се присъединява.

## Какво да прочетеш ПРЕДИ всичко друго (по ред)

### Задължително (45 мин четене)

1. **`docs/bibles/AURALIS_BIBLE_v2.md`** ← source of truth, всички решения
2. **`docs/bibles/AURALIS_HANDOFF_v5.md`** ← план за разработка + правила
3. **`docs/decisions/`** ← лог на взетите решения с дата и обосновка

### Reference (чети при нужда)

4. **`docs/research/`** — 18 научни документа от Gemini Deep Research
   - Не четеш ги всичките наведнъж — отваряш ги когато ти трябва конкретен топик
   - Карта на съдържанието по-долу ↓

---

## Карта на research документите

| # | Файл | Кога ти трябва |
|---|---|---|
| 01 | `01-quiz-15-questions-validated.md` | Имплементация на quiz wizard |
| 02 | `02-web-audio-api-algorithms.md` | Mixer + sound generators (Pink/Brown/Green/Binaural/Fractal) |
| 03 | `03-onboarding-strategy-50plus.md` | Welcome flow, first 30 sec |
| 04 | `04-retention-strategy.md` | Push notifications, Day 1-30 timeline |
| 05 | `05-ai-recommendations-architecture.md` | AI assistant, 5 фенотипа, Bayesian |
| 06 | `06-frequency-profiler-notch-filter.md` | TMNMT notch filter, frequency detection |
| 07 | `07-cbt-2-weeks-protocol.md` | 14-day програма (Kalmeda-inspired) |
| 08 | `08-cbt-validated-digital-protocols.md` | Бенчмарк vs Kalmeda/Oto |
| 09 | `09-sleep-neuroscience-tinnitus.md` | Sleep Mode, нощни флоу |
| 10 | `10-sleep-diary-consensus.md` | Daily sleep input UI |
| 11 | `11-sound-therapy-effectiveness.md` | Защо тези звуци работят (RCT данни) |
| 12 | `12-antidepressants-tinnitus.md` | Какво AI НЕ препоръчва (закон) |
| 13 | `13-touch-targets-50plus.md` | UI размери, контраст, WCAG AAA |
| 14 | `14-sensory-behavioral-dynamics.md` | UX психология 50+ |
| 15 | `15-churn-analysis.md` | Защо потребителите напускат |
| 16 | `16-regulatory-strategy-mdr.md` | CE Mark, DiGA — за Phase 5+ |
| 17 | `17-n1-trial-pr-strategy.md` | PR кампания с бащата |
| 18 | `18-success-measurement-thi-tfi.md` | THI/TFI скали, MCID |

---

## Документи които НЕ са качени (липсват в repo)

Тези съществуват в Claude Project Knowledge на Тихол, но не са копирани тук поради token ограничения:

- Доказателствено базиран звуков модел (TOP 10 звуци + 8 микса — **ВАЖНО за MVP**)
- Каталог катастрофизирани мисли БГ (CBT cognitive restructuring)
- Терапия ACT за 50+ годишни пациенти
- Магнезий, нутрицевтици и хранителни фактори
- Анализ ефикасност звукова терапия 2020-2026 (RCT мета-анализи)
- Физикални психоакустични принципи (празен файл на диск)

**За първия от тях (звукова библиотека)** — основните данни вече са в `AURALIS_BIBLE_v2.md` Част 4. Достатъчно за MVP.

**Ако Тихол ги направи изтегли от Claude Projet Knowledge** — да ги качи в `docs/research/` с имена `19-sound-model-evidence-based.md`, `20-catastrophic-thoughts-bg.md`, `21-act-therapy-50plus.md`, `22-magnesium-nutrients.md`, `23-sound-therapy-2020-2026.md`.

---

## Правила за работа

### Когато Claude (нов чат) започва нова сесия:

```
1. Прочети README.md (root)
2. Прочети този файл (00-START-HERE.md)
3. Прочети AURALIS_BIBLE_v2.md
4. Прочети AURALIS_HANDOFF_v5.md
5. Прочети latest файл в docs/decisions/
6. Кажи на Тихол: "Прочетох всичко. Готов за [текуща задача]."
```

### Когато правиш промяна на план/архитектура:

```
1. Документирай в docs/decisions/ (нов .md файл с дата)
2. Update AURALIS_BIBLE_v2.md (ако е голяма промяна — v2.1)
3. Commit с описателно съобщение: "DECISION: [какво]"
```

### Когато пишеш промпт за Claude Code:

```
1. НЕ предполагай че Claude Code е чел repo-то — той е празен
2. Слагай ВСИЧКИ нужни правила директно в промпта
3. Реферирай към конкретни файлове ако трябва (с пълен path)
4. Винаги "manual mode" — никога full auto за този проект
```

---

## Комуникационни правила с Тихол

- **Език:** само български
- **Стил:** кратко, директно, без "може би"
- **CAPS LOCK от Тихол** = спешност или раздразнение
- **"Ти луд ли си"** = забравил си важен контекст → прочети bibles наново
- **60% конструктив + 40% честна критика** — никога чиста валидация
- **Технически решения** → решавай сам. **Логически/продуктови** → питай Тихол
- **"Прав си, коригирам"** вместо "извинявай"

---

## Текущо състояние (Ден 0 — 23.05.2026)

- ✅ AURALIS_BIBLE v2.0 готова
- ✅ HANDOFF v5 готов
- ✅ Repo създаден и попълнен с документация
- ✅ Решение: Quiz + THI разделени във времето (Quiz Ден 0, THI Ден 2-3)
- ⏳ Setup на PWA skeleton (Claude Code Desktop, в процес)
- ⏳ Сваляне на 5 звукови файла (Тихол паралелно)
- ⏳ Gemini Deep Research за GDPR

---

*Последна актуализация: 23.05.2026 — Тихол + Claude (Opus 4.7)*
