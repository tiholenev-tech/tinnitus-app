ЗАДАЧА ЗА CODE 1: PACK C — Therapeutic Tests Live Integration

═══════════════════════════════════════════════════════════════════
КОНТЕКСТ
═══════════════════════════════════════════════════════════════════

Бета launch днес вечер за бащата на Тихол (62г, THI ~62 baseline).

Сегашен проблем: 3 теста в onboarding имат "научен look" но не
правят реално нищо в дневния experience:

- THI 25 въпр → save в state.thiBaseline → НЕ се показва никъде
- Pitch test → save в state.pitchTests → НЕ влияе на звуците
- Audio device избор → само cap volume → ОК (не пипай)

Цел: всеки тест да има ВИДИМО терапевтично действие.

═══════════════════════════════════════════════════════════════════
АРХИТЕКТУРА — ВАЖНО ЗА КОНТЕКСТ
═══════════════════════════════════════════════════════════════════

THI state (вече съществува, не го пипай):
  state.thiBaseline       // 0..100 (Day 1)
  state.thiDay14          // 0..100 (Day 14 retest)
  s.setThiBaseline(score)
  s.setThiDay14(score)

Pitch state (вече съществува):
  state.pitchTests        // [{ day, freq, timestamp, trials, octaveCheck? }]
  state.pitchSkipped      // true ако user избра skip
  state.pitchSkipReason   // 'noise_type' | 'pulsing' | 'other'

Audio engine layer 2 (ред 791-794 в audio-engine.js):
  - ВЕЧЕ има BiquadFilter за noise types (lowpass)
  - Само Layer 2 има филтър
  - Layer 1 (главния звук) НЕМА филтър — тук добавяме notch

═══════════════════════════════════════════════════════════════════
ЗАДАЧА T1 — THI LIVE INTEGRATION (1ч)
═══════════════════════════════════════════════════════════════════

T1.1 — Home badge "THI: X / цел < 40"

Файл: js/home.js
Действие: Добави THI badge в горната секция (близо до welcome или
        deepHero). Винаги видим ако state.thiBaseline ≠ null.

Visual:
  [НОВО THI Badge]
    "THI: 62"  (large number)
    "цел < 40" (small subtitle)
    [progress bar 62/100, gradient]

Tap → отвори modal с:
  - Subscores: Functional / Emotional / Catastrophic с числа
  - AI интерпретация per subscore (виж T1.2)
  - "Тест отново на ден 14" button (или countdown)

i18n keys в bg.json:
  thi.badge.label: "THI"
  thi.badge.goal: "цел < {goal}"
  thi.detail.title: "Резултат от THI теста"
  thi.detail.functional: "Функционален"
  thi.detail.emotional: "Емоционален"
  thi.detail.catastrophic: "Катастрофичен"
  thi.detail.retest_label: "Тест отново на ден 14"
  thi.detail.retest_countdown: "Тест отново след {days} дни"

T1.2 — Subscore интерпретация (AI insight)

Файл: js/thi-baseline.js (или нов js/thi-interpret.js)

Логика:
  - Изчисли F/E/C от QUESTIONS_META (вече има в thi-baseline.js)
  - Определи "доминантна" категория (highest)
  - Покажи insight в Home badge modal:

Insights (4 категории на интерпретация):

  IF F > E AND F > C (functional доминира):
    "Тинитусът Ви създава най-вече ПРАКТИЧЕСКИ проблеми
     (концентрация, сън, работа). Препоръчваме фокус върху
     daily/sleep сценариите в програмата."

  IF E > F AND E > C (emotional доминира):
    "Тинитусът Ви създава най-вече ЕМОЦИОНАЛНО натоварване
     (тревожност, раздразнение). CBT упражненията във вашата
     14-дневна програма ще са особено полезни."

  IF C ≥ 12 (catastrophic значителен — independent of others):
    "Имате тенденция към КАТАСТРОФИЗИРАЩИ мисли за тинитуса
     ('никога няма да си тръгне', 'животът ми е разрушен').
     Това е често срещано и поддающо се на работа.
     Препоръчително: говорете с професионалист (психотерапевт,
     специалист по тинитус) ако усещанията Ви се засилят."
     ← Тиха формулировка, не "ВНИМАНИЕ" banner.
     Champagne цвят, не червено.

  IF balanced (no dominant):
    "Тинитусът Ви се проявява във ВСИЧКИ аспекти равномерно.
     Препоръчителна е цялата 14-дневна програма без специален
     фокус."

T1.3 — Day-14 retest automatic prompt

Файл: js/diary-hub.js или js/home.js

Логика:
  - При render на Home: if (day === 14 && state.thiDay14 === null)
    → показва banner: "Време е за вторично THI измерване"
    → Tap → отваря THI quiz отново
    → THI saves в setThiDay14()

После, в badge modal:
  IF state.thiDay14 !== null:
    Покажи:
      Day 1: 62
      Day 14: 48
      Промяна: -14 (намаление 22.6%)

      AI insight (premium feel):
      "Намалили сте THI с 14 точки за 14 дни — клинично значимо
       подобрение. Продължавайте програмата."

═══════════════════════════════════════════════════════════════════
ЗАДАЧА T2 — PITCH REVEAL В PROFILE RESULTS (30 мин)
═══════════════════════════════════════════════════════════════════

T2.1 — Добави pitch info в Profile Results

Файл: js/profile-results.js

След welcome section, преди timeline:

  [НОВА секция: "Вашата тинитус честота"]

  IF state.pitchTests.length > 0:
    var lastTest = state.pitchTests[state.pitchTests.length - 1];
    var freq = lastTest.freq;

    Показва:
      "Вашата честота: {freq} Hz"
      Visual: малка spectrum визуализация (виж по-долу)

      Категоризация:
      - 250-1000 Hz → "Нискочестотен тинитус"
      - 1000-3000 Hz → "Среднен честотен тинитус"
      - 3000-6000 Hz → "Високочестотен тинитус"
      - 6000-12000 Hz → "Много висок честотен тинитус"
      - 12000+ Hz → "Изключително висок тинитус"

      Препоръка per range:
      - Low (250-1000): "Препоръчителни звуци с богат среден и
        висок спектър за маскиране — препоръчваме категория
        'Гора', 'Дъжд'"
      - Mid (1000-3000): "Препоръчителни звуци с балансиран
        спектър — препоръчваме 'Океан', 'Река'"
      - High (3000-6000): "Препоръчителни звуци с акцент върху
        ниски и средни честоти — препоръчваме 'Подводен'
        и 'Кафяв шум'"
      - Very high (6000+): "Препоръчителни наситено basov звук
        за оптимална маска — препоръчваме 'Дълбок кафяв шум'
        или 'Подводна тишина'"

  IF state.pitchSkipped:
    Показва тих message:
      "Не сте завършили pitch теста. Можете да го направите по-
       късно от Settings."
    Без визуализация.

T2.2 — Малка spectrum визуализация

Файл: нов css в css/profile-results.css или nepoшено

SVG bar от 250 до 16000 Hz (log scale).
На pitch freq → champagne marker.
20px височина, 100% ширина на section.

[----------|----#----|---------|-------|]
250       1k       3k        8k     16kHz
                    ↑ Вашата честота

Цвят на marker = champagne (#F1E6C8).
Background = soft gradient (deep blue → champagne).

T2.3 — Pitch retest на Day 14

Файл: js/pitch-test.js или нов

Логика същата като THI Day-14:
- IF day === 14 AND state.pitchTests.length === 1 (само baseline):
  → Home banner "Време е за вторично pitch измерване"
  → Pitch retest
- Сравнение в Profile Results:
  Day 1: 6400 Hz
  Day 14: 6800 Hz
  Промяна: +400 Hz (тинитусът се е изместил — положителен знак
  при тинитус терапия е изместване на честотата, не намаление)

═══════════════════════════════════════════════════════════════════
ЗАДАЧА T3 — NOTCH FILTER АКТИВАЦИЯ (1.5-2ч) ← ГЛАВНА
═══════════════════════════════════════════════════════════════════

T3.1 — Audio engine notch filter

Файл: js/audio-engine.js

Сегашна graph:
  Layer 1 source → gainL1 → masterGain → ctx.destination
  Layer 2 source → [biquadLowpass?] → gainL2 → masterGain → ctx.destination

Нова graph:
  Layer 1 source → [notchFilter] → gainL1 → masterGain → ctx.destination
  Layer 2 source → [biquadLowpass?] → [notchFilter L2?] → gainL2 → ...

Notch filter параметри (от research):
  - Type: 'notch'
  - Frequency: state.pitchTests[last].freq (например 6400 Hz)
  - Q: 2.871 (1/2 octave bandwidth — стандарт за tinnitus)

Имплементация:
  function createNotchFilter(ctx, freq) {
    var notch = ctx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.value = freq;
    notch.Q.value = 2.871;
    return notch;
  }

В startLayer1Source(buffer, opts):
  - След source.connect(gain)
  - Проверка: if (state.pitchTests.length > 0 && !state.notchDisabled):
      var pitch = state.pitchTests[state.pitchTests.length - 1].freq;
      var notch = createNotchFilter(ctx, pitch);
      source.disconnect();
      source.connect(notch).connect(gain);

ВАЖНО — fallback и safety:
  - IF state.pitchTests.length === 0 → НЕ слагай notch (no-op)
  - IF state.pitchSkipped === true → НЕ слагай notch
  - IF state.notchDisabled === true → НЕ слагай notch
  - Логни в console: "[notch] Active at {freq} Hz, Q=2.871" или
                     "[notch] Inactive (no pitch data)"

T3.2 — Settings toggle "Лична честотна терапия"

Файл: js/settings.js

Добави НОВА секция (преди FAQ link):

  [Лична честотна терапия]
  ☑ Активна (default ON ако има pitch data)
  
  Description (small):
  "Премахваме Вашата тинитус честота ({freq} Hz) от всички звуци
   за подобрена терапия."
  
  IF user тукне off:
    Toast: "Личната терапия е спряна. Звуците ще се възпроизвеждат
    без notch филтър."
    state.notchDisabled = true (save в localStorage)

T3.3 — Visual indicator в Player

Файл: js/player.js

В Player, някъде дискретно (близо до Layer 1 заглавието):
  IF notch е active:
    Малка champagne икона + tooltip:
    "Лична честотна терапия активна — {freq} Hz премахната"

T3.4 — Profile Results показва статуса

Файл: js/profile-results.js

В секцията "Вашата тинитус честота" (от T2):
  IF notch active:
    Добави "✓ Активна лична терапия на {freq} Hz"

═══════════════════════════════════════════════════════════════════
SERVICE WORKER BUMP
═══════════════════════════════════════════════════════════════════

Service-worker.js VERSION:
  Текущо: 1.0.16 (или последна)
  Bump към 1.0.17 — force cache evict

═══════════════════════════════════════════════════════════════════
COMMITS — ПО ОТДЕЛНО ЗА ВСЕКИ
═══════════════════════════════════════════════════════════════════

Commit 1 (T1): "FEAT THI-LIVE: Home badge + subscore интерпретация
                + Day-14 retest hook"

Commit 2 (T2): "FEAT PITCH-REVEAL: показва pitch freq в Profile
                Results + категоризация + spectrum визуализация"

Commit 3 (T3): "FEAT NOTCH-FILTER: 1/2 octave notch (Q=2.871) на
                Layer 1 при pitch data + Settings toggle"

Push след всеки commit.

═══════════════════════════════════════════════════════════════════
ACCEPTANCE CRITERIA
═══════════════════════════════════════════════════════════════════

T1 ✓:
  - Home показва THI badge с number + goal
  - Tap → modal с subscores + AI insight
  - На ден 14 → banner за retest
  - След retest → сравнение Day 1 vs Day 14

T2 ✓:
  - Profile Results показва "Вашата честота: {freq} Hz"
  - Категория (low/mid/high/very high)
  - Препоръка на звуци per категория
  - Малка spectrum визуализация

T3 ✓:
  - Audio engine добавя notch при play (ако има pitch data)
  - Console.log потвърждава "[notch] Active at X Hz"
  - Settings toggle работи
  - Player показва indicator
  - Profile Results потвърждава "✓ Активна лична терапия"

═══════════════════════════════════════════════════════════════════
КРИТИЧНИ ПРАВИЛА
═══════════════════════════════════════════════════════════════════

⛔ НЕ пипай:
- audio/library/manifest.json (току-що update-нат с поетични имена)
- js/profile-config.js (стабилен)
- Никакви файлове извън списъка по-долу

✓ Файлове за update:
- js/home.js (T1.1)
- js/thi-baseline.js (T1.2, T1.3) — добави интерпретация
- js/profile-results.js (T2.1, T3.4)
- js/pitch-test.js (T2.3)
- js/audio-engine.js (T3.1) — главна промяна, внимавай!
- js/settings.js (T3.2)
- js/player.js (T3.3) — малка добавка
- js/state.js (добави notchDisabled flag)
- i18n/bg.json (нови keys)
- css/profile-results.css или нов css (T2.2 visualization)
- service-worker.js (VERSION bump)

❓ Питай Тихол ако:
- Audio engine breakage (notch чупи звука изобщо)
- Performance issue на старо устройство
- Visual inconsistency с Bible/Canon

═══════════════════════════════════════════════════════════════════
WORKFLOW — LOCAL ONLY (НЕ TOUCH droplet)
═══════════════════════════════════════════════════════════════════

1. Тихол работи локално
2. Code 1 push-ва в GitHub main
3. Тихол phone test на localhost:8000 (не на droplet)
4. ИСТЕ след Тихол потвърждение → droplet pull
5. БЕЗ droplet pull без потвърждение!

═══════════════════════════════════════════════════════════════════
ЗАПОЧВАЙ С ЗАДАЧА T1 (THI Live). СЛЕД PHONE TEST → T2 → T3.
═══════════════════════════════════════════════════════════════════
