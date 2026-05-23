# AURALIS BIBLE v3.0 — PIVOT
## One-Time · Library-First · No-AI · Global
## 23.05.2026 — след стратегическо проучване и дискусия

---

## 🎯 КРАТКО

**v2.0 беше:** Subscription wellness app с AI асистент, voice control, 10 звука + 8 микса, БГ focus.

**v3.0 е:** One-time €2.99 PWA с 300-звукова библиотека, без AI, без server, без subscription, 12 езика, глобален launch.

Това НЕ е минорна корекция. Това е стратегически pivot.

---

## 📊 КОНТЕКСТ — ЗАЩО PIVOT

### Какво показа конкурентният анализ (23.05.2026)

- 17 водещи tinnitus apps анализирани
- **Pareto:** 80% downloads = 3 app-а (BetterSleep, ReSound, myNoise)
- ReSound е **безплатен** (mixer от GN Group)
- Beltone Tinnitus Calmer е **напълно безплатен**
- Subscription медиана: €15-23/мес → пациенти отказват
- One-time медиана: €19.99 (myNoise lifetime)
- **Никой няма** all-in-one (library + quiz + diary + meditation + sleep)
- **Никой няма** 12+ езика на independent app
- **Никой няма** offline-first PWA за 50+

### Реалният market gap

> "На пазара напълно липсва PWA без AI, без абонаменти, €2.99 one-time, 12 езика, 50+ оптимизирано, offline-first."

Това е нашата позиция. Не "още един mixer". А **all-in-one за €2.99 завинаги**.

---

## 💰 НОВ ФИНАНСОВ МОДЕЛ

### Pricing

| Параметър | Решение |
|---|---|
| **Цена** | €2.99 one-time завинаги |
| **Trial** | 14-дневен пълен trial БЕЗ карта |
| **Free tier** | НЯМА (само trial) |
| **Refund** | През Google Play / App Store standard |
| **Регионални вариации** | Auto (Google handle-ва) |

### Защо €2.99 one-time

- Под психологическата граница за impulse buy
- Subscription = customer service ад (€2.99 е "не им пука" territory)
- No server → 0 running costs → всеки евро е чиста печалба
- Tinnitus Pro е €2.99/мес — ние сме €2.99 **завинаги**

### Sales projections (реалистични, не оптимистични)

| Сценарий | Year 1 нет | Year 2 нет |
|---|---|---|
| Песимистично | €800 | €2,145 |
| **Реалистично** | **€2,500** | **€8,947** |
| Оптимистично | €5,000 | €15,000 |
| Виралност веднъж | €15,000+ | €30,000+ |

### Cost structure (drastically reduced от v2)

| Item | v2.0 | **v3.0** |
|---|---|---|
| Gemini API | €27/мес | €0 |
| OpenAI TTS | €12/мес | €0 |
| Whisper | €50/мес | €0 |
| Server | €40/мес | €0 |
| Stripe | €295 на 1000 | €0 (Google handle-ва) |
| Backup | €10/мес | €0 |
| DeepL (само първи месец) | €0 | €30 (once) |
| **Total running cost** | **€587/мес** | **€0/мес** |

---

## 🎨 НОВ ПРОДУКТ — АРХИТЕКТУРА

### Структура (5 ядра)

```
📚 Library          → 300 звука, категории, search, favorites
🌊 Препоръчани      → 10 готови плейлисти + 5 препоръчани за профил
🧘 Медитация (Calm) → 5-6 записани медитации (5-15 мин)
📖 Дневник (Diary)  → 3 въпроса дневно, LocalStorage, Chart.js
🌙 Sleep + SOS      → Sleep timer, fade-out, 4-7-8 дишане
⚙ Profile          → Quiz, settings, language, theme
```

### Какво пада от v2.0

- ❌ AI assistant (Gemini)
- ❌ Voice control (Web Speech + Whisper)
- ❌ OpenAI TTS женски глас
- ❌ Personalization engine (Bayesian)
- ❌ Stripe integration
- ❌ PHP backend
- ❌ MySQL database (8 таблици)
- ❌ Server requirements
- ❌ Subscription tiers
- ❌ Free trial със карта
- ❌ AI Classes A-E hybrid

### Какво остава валидно от v2.0

- ✅ Wellness positioning (НЕ medical, Phase 5 CE Mark остава бъдеще)
- ✅ 50+ UX правила (44×44 tap, 16px+ font, Montserrat, "Вие")
- ✅ Bichromatic design (Canon v1 RIGID)
- ✅ Battery rules (AudioBufferSourceNode, suspend, lock screen)
- ✅ Sound safety rules (no white noise, no >8kHz peaks)
- ✅ Spectral analysis pipeline (audio_check.py)
- ✅ Loudness standard (-23 LUFS EBU R128)
- ✅ 5 потребителски профила (TH_C/DN_S/SS_R/SM_F/HB_M)
- ✅ Quiz 15 въпроса
- ✅ Disclaimer (wellness, не медицински)
- ✅ GDPR consent (само cookies + local data — много по-просто без server)

---

## 🎵 ЗВУКОВА БИБЛИОТЕКА

### Цел: 300 звука за launch

| Категория | Score | Брой | Достъп в UI |
|---|---|---|---|
| ⭐ Препоръчани | 90-100 | ~50 | "Най-добри за Вас" |
| ✅ Безопасни | 70-89 | ~150 | Стандартни |
| ⚠ Експериментални | 50-69 | ~100 | С warning label |
| ❌ Опасни | <50 | 0 | НЕ влизат |

### Конкретни забранени (Bible v2 ЗАКОН №6)

- Бял шум (cobra effect, доказано вреден)
- Пикове >8 kHz
- Силен дъжд / буря
- Бурни океански вълни
- Камина с пукащи дърва
- Резки transients

### Източници

| Източник | Цена | Брой възможни |
|---|---|---|
| Epidemic Sound | Имаме subscription | 100-150 |
| Freesound CC0 | Безплатно | 50-100 |
| Pond5 | €5-25 per | 30-50 |
| BBC Sound Archive | Безплатно (non-commercial!) | 20-30 |
| ATA Library | Безплатно | 10-20 |
| Splice | $7.99/мес | 50-100 |

### Audio specs

| | |
|---|---|
| Format | mp3 128 kbps mono |
| Loudness | -23 LUFS integrated |
| True peak | ≤ -1 dBTP |
| LRA | < 5 LU |
| App size | ~100-150 MB |
| Offline | Всичко локално (PWA cache + Capacitor assets) |

### Naming convention

Универсални EN имена (НЕ "Черноморска вечер"). Преводимо на 12 езика.

Примери:
- `underwater_silence_low.mp3`
- `mountain_stream_calm.mp3`
- `forest_winter_distant.mp3`
- `pink_noise_filtered.mp3`

---

## 🌍 ЛОКАЛИЗАЦИЯ

### 12 езика за launch

| # | Език | Speakers | Tier |
|---|---|---|---|
| 1 | English | 1.5B | T1 |
| 2 | Chinese (Simplified) | 1.1B | T1 |
| 3 | Hindi | 600M | T1 |
| 4 | Spanish | 550M | T1 |
| 5 | Arabic (RTL!) | 420M | T1 |
| 6 | Portuguese | 260M | T1 |
| 7 | Russian | 260M | T1 |
| 8 | French | 280M | T1 |
| 9 | German | 130M | T1 |
| 10 | Japanese | 125M | T1 |
| 11 | Korean | 80M | T1 |
| 12 | Bulgarian | 7M | Naš |

**Coverage:** ~5.3 милиарда души = 70% от глобалния tinnitus пазар

### Phase 2 (3 месеца после launch, на база analytics)

IT, PL, NL, TR, VI, ID, GR, RO, TH, BN

### Превод workflow

| | |
|---|---|
| Общо думи | ~7,500 |
| Тул | DeepL Pro (€30/мес един месец) |
| Качество за Tier 1 | 88-95% |
| Manual review за медицински термини | ~3ч/език (Тихол + речник) |
| Time to localize | 1 седмица за всичките 12 |

### i18n структура

```
i18n/
├── en.json
├── es.json
├── zh.json
├── hi.json
├── ar.json   (RTL handling!)
├── pt.json
├── ru.json
├── fr.json
├── de.json
├── ja.json
├── ko.json
└── bg.json
```

### Технически специфики

- RTL за арабски: `dir="rtl"` + flex reverse
- CJK fonts: Noto Sans CJK добавка
- Дължини варират (8 chars EN ↔ 4 chars JA) → flex layouts
- `Intl.NumberFormat` + `Intl.DateTimeFormat`

---

## 📱 ПЛАТФОРМА

### Ден 1: Google Play

| | |
|---|---|
| Wrap | Capacitor (имаме експертиза от RunMyStore) |
| Min Android | 8.0 (Oreo, 95% device coverage) |
| Submission | 1-7 дни review |
| Такса | 30% първа година, 15% след това |
| In-app billing | Google Play Billing Library |

### Phase 2 (1-2 месеца след launch): iOS App Store

| | |
|---|---|
| Wrap | Същия Capacitor проект |
| Min iOS | 14.0 |
| Submission | 1-4 седмици (по-строго) |
| Такса | 30% първа година, 15% след |

### НЯМА web версия

PWA в браузър = по-лоша UX за audio app. Capacitor packages PWA-та като native, по-добре.

---

## 🛍 МАРКЕТИНГ СТРАТЕГИЯ

### НЯМА Google Ads

CAC при one-time €2.99 = убива ROI. Customer Acquisition Cost > Customer Lifetime Value.

### 5 канала които работят

| Канал | Effort | Realistic per год |
|---|---|---|
| **ASO** (App Store Optimization) | 1 ден setup | 60-70% от downloads |
| **Reddit /r/tinnitus** (история на бащата) | 2-3 поста/месец | 300-500 платени/год |
| **B2B УНГ лекари в БГ + EU** | 10 партньорства | 200-400 платени/год |
| **Tinnitus Talk forum** | 2-3 thread-а | 100-200/год |
| **YouTube tutorials на 5 езика** | 5 видеа × 5 мин | 100-300/год |

### Unique angles

1. **История на бащата** — N=1 trial с реални данни, THI baseline + delta
2. **Quiz → персонализация** — никой друг конкурент няма това безплатно
3. **All-in-one** — единствено приложение което комбинира всичко
4. **€2.99 завинаги** — на пазар с €15-50/мес subscription

### App Store metadata (за SEO в всеки магазин)

- Keywords research per market: AppTweak free trial
- Title: "Tinnitus Relief — Sleep, Calm, Sound Therapy"
- Description: 12 езика, оптимизирано
- Screenshots: 8 на език с локализирани текстове
- Промоционно видео: 30 sec, sub-titled на 12 езика

---

## 📅 ROADMAP

### Phase 1: BUILD (10-15 работни дни)

**Седмица 1:**
- Day 1-2: Pivot документация (този файл) + repo cleanup
- Day 3-4: Library UI (нов модул)
- Day 5-6: 300 звука сваляне + analysis + normalize
- Day 7: Calm секция (запис на 5-6 медитации)

**Седмица 2:**
- Day 8: Daily Diary
- Day 9: Sleep Mode + SOS
- Day 10: Profile + Settings
- Day 11: i18n setup + DeepL превод на 12 езика
- Day 12: Capacitor wrap + Android APK
- Day 13: Test със бащата (full flow)
- Day 14-15: Bug fixes + Google Play submission

### Phase 2: LAUNCH (седмица 3-4)

- Google Play approval (1-7 дни)
- ASO setup
- First Reddit post с историята на бащата
- B2B outreach към 3-5 УНГ лекари в София

### Phase 3: SCALE (месец 2-3)

- iOS App Store submission
- Analytics review per market
- Phase 2 езици на база данни
- Допълнителни звуци (500+)

### Phase 4: OPTIMIZE (месец 4-6)

- App Store featured submissions
- YouTube content production
- 50+ Facebook groups outreach

### Phase 5: MEDICAL (Месец 12+, ако 5000+ платени)

- CE Mark consideration
- DiGA Germany application
- ISO 13485 + clinical trial

---

## ⚠️ КРИТИЧНИ ПРАВИЛА (запазени от v2)

### ЗАКОН №1: WELLNESS, НЕ HEALTHCARE
- ❌ "Лечение", "диагностика", "лекарство"
- ✅ "Релаксация", "хабитуация", "звуково обогатяване"

### ЗАКОН №2: NO MEDICAL ADVICE
- ❌ "Имаш депресия", "Вземи магнезий"
- ❌ Препоръки за добавки, диета, лекарства
- ✅ "Според проучване X..." (само цитати)

### ЗАКОН №3: 50+ UX
- Шрифт 16px+ Montserrat
- Бутони 44×44 px минимум
- Контраст 7:1
- БЕЗ native keyboard
- Уважителен "Вие"

### ЗАКОН №4: БАТЕРИЯ
- 8ч sleep mode без drain
- AudioBufferSourceNode (не AudioWorklet)
- System sample rate
- Suspend при пауза
- Silent MP3 trick за iOS lock screen

### ЗАКОН №5: НИКАКВИ ВРЕДНИ ЗВУЦИ
- Spectral analysis ПРЕДИ deploy
- Score <50 → НЕ влиза
- Бял шум → НИКОГА

### ЗАКОН №6: OFFLINE-FIRST
- Всичко локално на устройството
- LocalStorage за данни
- НЕ изпращаме данни към сървър
- НЕ имаме сървър

---

## 🔐 GDPR — DRASTICALLY SIMPLIFIED

### Защо много по-просто от v2

V2 имаше: server-side health data (Article 9), Stripe payment data, AI query logs.

V3 има: **нищо на сървър**. Всичко на устройството.

### Какво обработваме

| Data | Where | Article 9 sensitive? |
|---|---|---|
| Email | Google/Apple account | НЕ (handled от platform) |
| Payment | Google Play / App Store | НЕ (handled от platform) |
| Quiz answers | LocalStorage | ДА но локално |
| Diary entries | LocalStorage | ДА но локално |
| Listening history | LocalStorage | НЕ |
| Analytics | НИЩО (не пращаме) | — |

### Disclaimer (при първо отваряне)

```
AURALIS е инструмент за слухова релаксация.
- НЕ заменя медицинска консултация
- НЕ лекува тинитус
- Резултатите варират индивидуално

Всички Ваши данни остават на Вашия телефон.
Ние не събираме нищо.

[РАЗБРАХ И СЪГЛАСЯВАМ СЕ]
```

---

## 📊 SUCCESS METRICS

### За бащата (Day 14 trial завършване)

| Metric | Baseline | Target |
|---|---|---|
| THI | 62 | ≤55 |
| Сън | 4ч | ≥5ч |
| Тинитус 0-10 | 8 | 5-6 |

### За приложението (Year 1)

| Metric | Target |
|---|---|
| Downloads | 10,000-25,000 |
| Trial activation | 70% |
| Trial → Paid conversion | 8-15% |
| Год 1 нет приход | €2,000-5,000 |

### За приложението (Year 2)

| Metric | Target |
|---|---|
| Downloads cumulative | 50,000-100,000 |
| Платени cumulative | 4,000-8,000 |
| Год 2 нет приход | €8,000-15,000 |

---

## 🚀 СЛЕДВАЩИ СТЪПКИ (immediate)

1. **Този документ → review от Тихол**
2. **Commit + push** в `docs/bibles/AURALIS_BIBLE_v3_PIVOT.md`
3. **Архивиране на v2:** премести `AURALIS_BIBLE_v2.md` + Appendix в `docs/legacy/` (запазват се за reference, но v3 е authoritative)
4. **Audio normalize на 38-те файла** (текуща задача — изчакваме завършване)
5. **Сваляне на още звуци до 300** (отделна сесия)
6. **Library UI design** (нов mockup, още не съществува)
7. **Capacitor wrap research** (документация + setup)

---

## 📚 REFERENCES

- `docs/bibles/AURALIS_BIBLE_v2.md` — base (някои части остават валидни)
- `docs/bibles/AURALIS_BIBLE_v2_1_APPENDIX.md` — UI правила, текстови правила
- `docs/canon/AURALIS_DESIGN_CANON_v1.md` — design canon (НЕ се променя)
- `design/mockups/mixer-2tabs-v3-cards.html` — visual reference (НЕ се променя)
- `docs/SESSION_2026-05-23_AFTERNOON_HANDOFF.md` — afternoon session log
- Research документ за конкурентен анализ — добавя се като `docs/research/26-competitor-analysis-2026-05.md`

---

## 🔄 VERSION NOTES

**v3.0 (23.05.2026, вечер):**
- Pivot от subscription към one-time
- Премахване на AI слоя
- 300-звукова библиотека като ядро
- 12 езика launch
- Marketing стратегия без paid ads
- Reduced cost structure до €0/мес

**Какво НЕ е променено:**
- 50+ UX правила
- Design Canon v1 (Bichromatic, Montserrat, etc.)
- Sound safety rules
- Quiz + 5 профила
- Wellness positioning

---

*v3.0 заключено 23.05.2026 вечер.*
*Изготвен от Claude (Opus 4.7) на база дискусия с Тихол.*
*Authoritative версия. v2.0 остава като reference в `docs/legacy/`.*
