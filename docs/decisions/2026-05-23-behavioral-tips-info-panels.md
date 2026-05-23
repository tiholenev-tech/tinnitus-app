# DECISION: Поведенчески съвети — кога, къде, как

**Дата:** 23.05.2026
**Решено от:** Тихол (founder) + Claude (Opus 4.7)
**Статус:** ✅ Заключено за beta 1.0 + Phase 2 план

## Контекст

Документ `25-behavioral-management-extra-app.md` (490 реда) съдържа научно валидирани съвети за управление на тинитус **извън** приложението. Покрива:

1. Хранене (тригери + хранителни добавки с дози)
2. Хидратация
3. Физическа активност (упражнения за/против)
4. Йога пози (специфични за тинитус)
5. TMJ/цервикални техники (chin tucks, стречинг)
6. Денонощни ритуали
7. CBT и mindfulness техники
8. Социален контекст

## Решение

### Какво ИЗПОЛЗВАМЕ в beta 1.0

**Само non-medical секциите:**

| Категория | За къде |
|---|---|
| TMJ self-massage + стречинг (Chin Tucks, стречинг) | Calm секция, отделни упражнения |
| Йога пози (Триконасана, Бхуджангасана, и т.н.) | Calm секция, info cards |
| Денонощни ритуали (сутрешен/вечерен) | Sleep Mode + Daily Diary onboarding |
| CBT техники (cognitive reframing) | Calm секция + SOS button |
| Mindfulness (4-7-8 дишане, ПМР) | Calm секция, audio-guided упражнения |
| Социална комуникация (как да обясните на близки) | Profile секция, "Ресурси" подсекция |
| Sleep hygiene (без лекарства) | Sleep Mode onboarding |

### Какво НЕ използваме в beta 1.0

**Медицинско съдържание (Тихол изрично каза НЕ):**

- ❌ Конкретни дози на хранителни добавки (Гинко 120-240mg, Мелатонин 1.9-3.0mg, и т.н.)
- ❌ "Избягвайте кафе/алкохол/сол" (звучи като диета)
- ❌ MSG, аспартам тригери (медицински детайл)
- ❌ Витамин B12, цинк, магнезий препоръки
- ❌ Каквото и да е prescription-like съдържание

**Защо:** AURALIS = wellness инструмент, **НЕ медицински продукт** (ЗАКОН №1). Препоръчването на конкретни добавки = регулаторен риск + загуба на доверие.

### За Phase 2 (бета 2.0+)

Когато имаме клинично партньорство или БГ лекар:
- Медицинска секция може да се добави като "Консултирайте с лекар" формат
- Линкове към специалисти (otorhinolaryngologist, audiolog)
- Reference към научните дози (без "ние препоръчваме")

## Архитектура на info panels (системно)

### 3 типа info компоненти

**Тип 1: 🤔 Tooltip (микро-context)**
- Малка ⓘ иконка до елемента
- Tap → 1-3 изречения overlay
- Auto-dismiss 5 сек или tap навсякъде

**Тип 2: 📚 Bottom sheet (full context)**
- Trigger: "Прочетете повече" от Тип 1
- Bottom sheet 70% от екрана
- Структура: заглавие + 2-4 параграфа + source attribution
- Source format: "Източник: [Author] et al. [Year], [Journal]"

**Тип 3: 💡 First-time coachmarks**
- Първи път в модул → 2-3 sequential tooltips
- Skip + Got it бутони
- localStorage flag за dismiss

### Файлова структура

```
js/
├── info-panel.js        # Компонент логика
├── info-content.js      # Централна база с цялото съдържание
└── ...

css/
├── info-panel.css       # Стилове
```

### INFO_CONTENT структура

```javascript
const INFO_CONTENT = {
  mixer: {
    'preset_deep_calm': {
      title: 'Защо този микс?',
      micro: 'Активира парасимпатиковата нервна система.',
      full: '...пълен текст с научно обяснение...',
      source: 'Henry et al. 2023, Tinnitus and Hearing Sciences'
    },
    // ... за всеки preset
  },
  calm: {
    'exercise_478_breathing': {
      title: 'Защо 4-7-8 дишане?',
      ...
    },
    'yoga_triangle_pose': {
      title: 'Защо Триконасана?',
      micro: 'Подобрява кръвотока в съдовете на врата.',
      full: '...',
      source: 'docs/research/25, секция Йога'
    },
    // ...
  },
  general: {
    'why_no_white_noise': {
      title: 'Защо нямаме бял шум?',
      ...
    },
    'why_tinnitus_not_cured': {
      title: 'Защо тинитус не се лекува, а се хабитуира?',
      ...
    }
  }
};
```

### Принципи на info content

1. **Език:** само български, уважителен тон ("Вие")
2. **Стил:** прости думи, без академичен жаргон (50+ четат)
3. **Цитати:** ВИНАГИ cite source (увереност + доверие)
4. **Тон:** positive framing — БЕЗ "опасно", "вредно", "забранено"
5. **Структура:** научно наблюдение → как се прилага → защо работи
6. **БЕЗ medical advise:** ние НЕ казваме "вземете X", казваме "проучванията показват"
7. **Дължина:** micro = 1-3 изречения, full = 2-4 параграфа max

## Имплементация — последователност

**Phase 1 (СЕГА, с Mixer):**
- info-panel.js компонент
- info-content.js със съдържание за 4-те Mixer preseta + 2 general
- Първи coachmarks за Mixer (3 стъпки)

**Phase 2 (с Calm секцията):**
- Info за всяко audio-guided упражнение
- Йога пози описания
- TMJ техники

**Phase 3 (с Daily Diary):**
- Info за защо THI questions
- Объяснение на DI bar

**Phase 4 (с Sleep Mode):**
- Sleep hygiene info
- Защо тишината е лоша

**Phase 5 (Profile / Resources):**
- "Ресурси" секция с full content от документ 25
- Йога видео tutorials (linkove)
- Социална комуникация съвети

## Източници които цитираме

Всеки info text трябва да cite source. Топ цитирани документи:

| Source ID | Файл |
|---|---|
| `research/02` | Web Audio API algorithms |
| `research/11` | Sound therapy effectiveness |
| `research/19` | Sound model evidence-based |
| `research/25` | Behavioral management (само non-medical) |
| `research/07` | CBT 2-weeks protocol |
| `research/21` | ACT therapy 50+ |

## Audio файлове статус (актуализация)

След третия audio_check.py:
- **230 файла** в audio_files/
- **92 безопасни** (score ≥80)
- **39 loop-friendly + безопасни** ← база за Mixer + Calm

Категории:
- meditation: 10 loop+safe ✅ (за Calm)
- water_river: 7 loop+safe ✅
- water_ocean: 6 loop+safe ✅
- water_other: 6 loop+safe ✅
- water_rain: 3 loop+safe ⚠
- forest: 3 loop+safe ⚠
- wind: 1 loop+safe ⚠
- fire: 0 loop+safe ❌ (Epidemic Sound няма fire без crackling)

Решение: **Fire категория се пропуска за beta 1.0.**

---

*Решено в Claude чат сесия "AURALIS — Първи задачи", 23.05.2026.*
