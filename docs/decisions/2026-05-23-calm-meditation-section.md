# DECISION: Медитация / Calm секция в AURALIS

**Дата:** 23.05.2026
**Решено от:** Тихол (founder) + Claude (Opus 4.7)
**Статус:** ✅ Заключено за beta 1.0

## Контекст

В научните документи има мощна основа за медитация/mindfulness като терапевтичен подход:
- `07-cbt-2-weeks-protocol.md` — Level 3 mindfulness от Kalmeda
- `08-cbt-validated-digital-protocols.md` — MBTSR клинично валидиран
- `21-act-therapy-50plus.md` — ACT за приемане на шума

## Решение

**ДА — добавяме отделна "Calm" секция, но НЕ в Mixer-а.**

## Архитектура

**Bottom navigation (4 секции):**
1. 🎵 **Микс** — звукова терапия (Web Audio API)
2. 🧘 **Спокойствие** — CBT/медитации/дихателни упражнения
3. 📊 **Дневник** — daily sleep + тинитус 0-10
4. 👤 **Профил** — settings + THI tracking

## Beta 1.0 — Calm секция съдържание

**3 кратки audio-guided упражнения (БГ глас):**
- "Дишане 4-7-8" (3 минути) — вагусова стимулация
- "Прогресивно мускулно отпускане" (5 минути) — ПМР от CBT протокола
- "Приемане на шума" (4 минути) — ACT упражнение

**Аудио източник:**
- Voice-over: OpenAI TTS женски глас БГ (или Eleven Labs)
- Фонова музика: най-меките звуци от нашата библиотека (slow ocean, soft rain)
- Mix: voice 60% + background 40%
- Изключваме всичко с пикове >4kHz, singing bowls, wind chimes (триггерат тинитус)

## Защо НЕ сваляме готови медитации от интернет

1. Singing bowls имат обертонове 4-8kHz → триггерат тинитус
2. Wind chimes (височини) → същият проблем
3. Тибетски звуци → риск
4. Английски/чужд voice = не работи за бащата (БГ език)
5. License проблеми за commercial use

## Beta 2.0 — Calm секция разширение

- **CBT 14-дневна програма** (Kalmeda-style, от `07-cbt-2-weeks-protocol.md`)
- **Когнитивно преструктуриране** workshop (от `20-catastrophic-thoughts-bg.md`)
- **TMNMT интегриран в Mixer-а** (notch filter — от `06-frequency-profiler-notch-filter.md`)
- Може и истински БГ психолог да запише voice-over

## Импликации за разработка

**Сега (бета 1.0 setup):**
- ✅ Onboarding-ът обещава "tinnitus-app + CBT" — НЕ променяме текста
- ✅ State machine ще има `calm` substate (заедно с onboarding/quiz/results/mixer)
- ⏳ Calm UI — задача след Mixer-а (приоритет 4-5)

**За audio testing (днес):**
- ❌ НЕ сваляме готови медитативни мелодии
- ✅ 98-те звука които Тихол има = достатъчно за първи spectral analysis

## Roadmap позиция

```
1. ✅ Setup (Bichromatic skeleton)
2. ⏳ Onboarding (в процес)
3. Quiz wizard (15 въпроса)
4. Mixer (Web Audio engine + 5 sliders)
5. → Calm секция (3 audio-guided упражнения)
6. Daily Diary (sleep + тинитус 0-10)
7. THI (Ден 2-3)
8. Sleep Mode + SOS
9. AI assistant
10. Stripe + GDPR
```

---

*Решено в Claude чат сесия "AURALIS — Първи задачи", 23.05.2026, по време на onboarding setup.*
