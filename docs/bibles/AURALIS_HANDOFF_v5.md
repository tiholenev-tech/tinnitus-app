# AURALIS HANDOFF v5 — ФИНАЛЕН
## За новия чат + Claude Code Desktop
## 23.05.2026, готови за разработка

---

## 🎯 КОНТЕКСТ ЗА НОВИЯ ЧАТ

Здравей! Аз съм Тихол. Започваме разработка на AURALIS — PWA приложение за хроничен тинитус. 

**Какво е направено до сега:**
- 25 научни документа от Gemini Deep Research (в Project Knowledge)
- AURALIS BIBLE v2.0 написана (синтез на всичко)
- Архитектура решена
- Pricing finalized: €2.99/€6.99/€19.99
- Първи клиент: баща, 50+, тежък тинитус

**ПРАВИЛО №1:** Прочети `AURALIS_BIBLE_v2.md` от Project Knowledge ПРЕДИ всичко.

**ПРАВИЛО №2:** Аз НЕ съм програмист. Давай ми прост код + кратки обяснения къде да го сложа.

**ПРАВИЛО №3:** Когато нещо е визуално или логическо решение — ПИТАЙ ме преди да правиш.

---

## 📋 ЧАСТ 1: КОИ СМЕ НИЕ

```
ТИХОЛ:
- Founder, не developer
- Има Claude Max план
- БГ език (caps = спешност)
- Тест със баща (50+, THI 62, спи 4ч)
- Сървър: 104.248.19.8 (DigitalOcean)
- Друг проект: RunMyStore.AI (paralelelen)

БАЩА (първи клиент):
- 50+ години
- Тежък тинитус (THI 62)
- Спи 4 часа
- Полусънлив в легло
- НЕ пише на телефон
- БГ, уважителен тон ("Вие")
```

---

## 🎯 ЧАСТ 2: AURALIS КРАТКО

```
ПРОДУКТ: PWA приложение за хроничен тинитус
ФИЛОСОФИЯ: Wellness инструмент, НЕ медицински
ЦЕНА: €2.99/мес | €6.99/3мес | €19.99/година
ЦЕЛ: 1000 клиенти = €2400/мес печалба
TIMELINE: 2 седмици MVP, beta launch с баща

КЛИЕНТСКИ FLOW:
1. Първо отваряне → Welcome
2. Quiz 15 въпроса (5 мин)
3. Резултат: 1 от 5 профила + персонал микс
4. Free trial 7 дни (с карта)
5. €2.99/мес след trial
6. Дневен ритъм: вечер микс + sleep mode
7. Анализ: THI спад, по-добър сън
```

---

## 🔒 ЧАСТ 3: ЖЕЛЕЗНИ ЗАКОНИ

### ЗАКОН №1: WELLNESS, НЕ HEALTHCARE
```
❌ "Лечение", "диагностика", "лекарство"
✅ "Релаксация", "слухово обогатяване", "хабитуация"
```

### ЗАКОН №2: NEVER HEALTH ADVICE
```
❌ AI казва: "Имаш депресия", "Вземи магнезий"
✅ AI казва: "Според Sereda 2018...", "Графиката показва..."
```

### ЗАКОН №3: 50+ UX
```
- Шрифт 16px+, Montserrat
- Бутони 44×44px+
- Контраст 7:1
- БЕЗ native keyboard
- Voice-first
- Уважителен тон ("Вие")
```

### ЗАКОН №4: VOICE FIRST
```
Микрофон активен САМО:
✅ Дневно при Mixer
❌ НЕ нощно (батерия!)
❌ НЕ заключен екран

Voice output: OpenAI TTS женски глас БГ
```

### ЗАКОН №5: БАТЕРИЯ
```
8ч сън без батерия drain:
- AudioBufferSourceNode (не AudioWorklet)
- System sample rate
- Suspend при пауза
- Silent MP3 trick за lock screen
```

### ЗАКОН №6: НИКАКВИ ВРЕДНИ ЗВУЦИ
```
❌ Бял шум (cobra effect)
❌ Пикове >8kHz
❌ Силен дъжд / буря
✅ Spectral analysis ПРЕДИ deploy
```

---

## 🛠️ ЧАСТ 4: ТЕХНИЧЕСКИ СТЕК

```
Backend: PHP 8.3 + MySQL 8
Frontend: Vanilla JS (NO React)
Audio: Web Audio API
Voice STT: Web Speech + Whisper fallback
Voice TTS: OpenAI TTS женски (Nova/Shimmer)
AI: Gemini 2.5 Flash-Lite (Class A-E hybrid)
Auth: Google + Email (Firebase)
Payments: Stripe (SEPA + Smart Retries)
Hosting: DigitalOcean 104.248.19.8
Path: /var/www/auralis/
Repo: tiholenev-tech/tinnitus-app
Domain: auralis.bg (TBD) или tinnitus.runmystore.ai
```

---

## 📊 ЧАСТ 5: DATABASE SCHEMA

```sql
-- USERS
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  google_id VARCHAR(255),
  password_hash VARCHAR(255),
  age INT,
  trial_started_at TIMESTAMP,
  subscription_status ENUM('trial','active','paused','canceled'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QUIZ ANSWERS
CREATE TABLE quiz_answers (
  user_id INT,
  question_id INT,
  answer_id VARCHAR(5),
  answered_at TIMESTAMP,
  PRIMARY KEY (user_id, question_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- USER PROFILE
CREATE TABLE user_profile (
  user_id INT PRIMARY KEY,
  profile_type ENUM('TH_C','DN_S','SS_R','SM_F','HB_M'),
  distress_index INT (0-20),
  primary_frequency_hz INT,
  notch_active BOOLEAN DEFAULT FALSE,
  preferred_mix JSON,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- DAILY LOG
CREATE TABLE daily_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  log_date DATE,
  hours_slept DECIMAL(3,1),
  tinnitus_intensity INT (0-10),
  distress_level INT (0-10),
  sounds_used JSON,
  listening_minutes INT,
  night_wake_count INT,
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- THI/TFI WEEKLY
CREATE TABLE weekly_scores (
  score_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  measured_date DATE,
  thi_score INT (0-100),
  tfi_score INT (0-100),
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- AI INTERACTIONS
CREATE TABLE ai_interactions (
  interaction_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  query TEXT,
  ai_response TEXT,
  action_taken JSON,
  confidence DECIMAL(3,2),
  cost_usd DECIMAL(8,6),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- CONSENT LOG (GDPR)
CREATE TABLE consent_log (
  consent_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  consent_type VARCHAR(50),
  granted BOOLEAN,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- AUDIT LOG
CREATE TABLE audit_log (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100),
  details JSON,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP
);
```

---

## 🎵 ЧАСТ 6: ЗВУКОВА БИБЛИОТЕКА (10 за MVP)

### ГЕНЕРИРАМЕ (Web Audio API)
```javascript
S01: Розов шум (Paul Kellet 1/f¹)
S02: Кафяв шум (1/f² + DC removal)
S03: Зелен шум (bandpass 500Hz, Q=1.0)
S13: Делта (4Hz pulse, 150Hz carrier)
S14: Алфа (10Hz pulse, 250Hz carrier)
S15: Фрактални Aqua Zen (пентатоника)
```

### СВАЛЯМЕ (от научни източници)
```
S05: Spring Rain — ATA Library (FREE!)
S08: Deschutes River — ATA Library (FREE!)
S07: Smooth ocean waves — Pond5
S09: Wind in leaves — Freesound CC0
S12: Soft campfire — Epidemic Sound
```

### 8 МИКСА (готови от научен документ)
```
1. Deep Sleep: 60% кафяв + 30% вълни + 10% Делта
2. Light Sleep: 50% зелен + 40% дъжд + 10% Тета(6Hz)
3. Daytime Relax: 50% фрактали + 30% вятър + 20% Алфа
4. Focus: 60% розов + 30% река + 10% Бета(15Hz)
5. High Tinnitus: 70% розов(notched) + 30% дъжд
6. Low Tinnitus: 60% кафяв + 40% фрактали
7. Anxiety: 50% Алфа(8Hz) + 30% река + 20% вятър
8. Morning: 50% зелен + 30% птици + 20% Алфа(12Hz)
```

---

## 📁 ЧАСТ 7: СТРУКТУРА НА ПРОЕКТА

```
/var/www/auralis/
├── index.html
├── manifest.json (PWA)
├── service-worker.js (offline)
├── silent.mp3 (lock screen trick)
│
├── css/
│   ├── variables.css (tokens от RunMyStore)
│   ├── components.css
│   ├── app.css
│   └── 50plus.css (large fonts, contrast)
│
├── js/
│   ├── app.js (main controller)
│   ├── audio-engine.js (Web Audio API)
│   ├── mixer.js (UI mixer)
│   ├── quiz.js (15 въпроса flow)
│   ├── sleep-mode.js (fade + Night Wake)
│   ├── monitoring.js (daily input)
│   ├── charts.js (Chart.js wrapper)
│   ├── voice-control.js (Web Speech)
│   ├── command-parser.js (PHP regex bridge)
│   ├── ai-fallback.js (Gemini)
│   ├── tts.js (OpenAI TTS женски)
│   ├── auth.js (Google + Email)
│   ├── payment.js (Stripe)
│   └── pwa-controls.js (background audio)
│
├── audio/
│   ├── generated/ (Web Audio params)
│   ├── nature/
│   │   ├── rain/ (5-10 файла)
│   │   ├── ocean/ (5-10)
│   │   ├── forest/ (5-10)
│   │   ├── wind/ (5-10)
│   │   ├── fire/ (3-5)
│   │   └── river/ (3-5)
│   └── LICENSE.md
│
├── api/ (PHP endpoints)
│   ├── auth.php
│   ├── quiz.php
│   ├── daily-log.php
│   ├── thi-test.php
│   ├── ai-query.php (Gemini)
│   ├── tts.php (OpenAI proxy)
│   ├── stripe-webhook.php
│   ├── gdpr-export.php
│   ├── gdpr-delete.php
│   ├── config.php
│   └── db.php
│
├── docs/
│   ├── AURALIS_BIBLE_v2.md
│   ├── HANDOFF_v5.md
│   ├── PRIVACY_POLICY.md
│   ├── TERMS_OF_SERVICE.md
│   └── API_REFERENCE.md
│
└── tools/
    ├── spectral_analysis.py (анализ звуци)
    └── seed_data.sql (тест данни за баща)
```

---

## 🚀 ЧАСТ 8: РАЗРАБОТКА ПЛАН (2 СЕДМИЦИ)

### СЕДМИЦА 1: CORE FUNCTIONALITY

**ДЕН 1-2 (24-25 май): Setup + Audio Engine**
```
☐ Git repo: tiholenev-tech/tinnitus-app
☐ MySQL: всички таблици
☐ PWA: manifest.json + service-worker.js
☐ HTML/CSS skeleton (от RunMyStore tokens)
☐ Web Audio API класове (всички 8)
  - PinkNoiseGenerator
  - BrownNoiseGenerator
  - GreenNoiseGenerator
  - BinauralToneGenerator
  - FractalZenEngine
  - SleepFadeController
  - TinnitusMixer
  - HeadphoneDetector
  - AudioFocusManager
  - PWAControlCenter
☐ Auth: Google + Email (Firebase)
☐ Тест: Mixer работи, генерира розов шум
```

**ДЕН 3-4 (26-27 май): UI + Sleep Mode**
```
☐ Mixer UI (5 слайдера + visual feedback)
☐ Sleep Mode screen
  - 30/45/60 мин избор
  - Експоненциална fade
☐ Night Wake SOS button (80×80px)
☐ 4-7-8 breathing animation
☐ Audio focus handling
☐ Headphones detection (iOS workaround)
☐ Background audio (lock screen)
☐ Тест: 30 мин sleep работи
```

**ДЕН 5-7 (28-30 май): Monitoring + Onboarding**
```
☐ Daily input form (30 сек)
☐ PHP daily-log.php endpoint
☐ Chart.js графики (7-14 дни)
☐ THI mini test (5 въпроса)
☐ Onboarding hibridna (3 опции)
☐ Welcome + Trust screen
☐ FIRST WIN moment (демо звук)
☐ Dashboard главния екран
☐ Тест: дневни данни се събират, графика рисува
```

### СЕДМИЦА 2: INTELLIGENCE + LAUNCH

**ДЕН 8-9 (31 май - 1 юни): Quiz + Profiles**
```
☐ 15 въпроса JSON (от научен документ)
☐ Quiz UI (1-tap pills, прогрес)
☐ Scoring algorithm (5 профила)
☐ Distress Index (DI 0-20)
☐ Personal Mix recommendations
☐ Резултатен екран
☐ Тест: Quiz изчислява правилно профил
```

**ДЕН 10-11 (2-3 юни): Voice + AI**
```
☐ Web Speech API (БГ)
☐ PHP regex parser (30+ команди)
☐ Gemini fallback (Class C-D)
☐ OpenAI TTS женски глас
☐ Confidence routing
☐ Voice output потвърждения
☐ Тест: "Дай ми дъжд" работи voice
```

**ДЕН 12-14 (4-6 юни): Polish + Launch**
```
☐ Spectral analysis на 200+ звука
☐ Махаме вредните файлове
☐ Stripe subscription setup
  - €2.99/€6.99/€19.99 plans
  - SEPA Direct Debit
  - 7 дни trial
☐ GDPR screens
  - Privacy Policy
  - Cookie consent
  - "Изтрий данните"
☐ Test със баща
☐ Baseline measurements (THI, TFI, GAD-7)
☐ Bug fixes
☐ Deploy на production
☐ Domain setup
```

---

## 🎤 ЧАСТ 9: VOICE COMMANDS (за PHP regex)

```javascript
// ПРОСТИ КОМАНДИ (Class A - PHP regex)
const COMMANDS = {
  // Звуци
  "дъжд|пусни дъжд|искам дъжд": play('rain'),
  "океан|вълни|море": play('ocean'),
  "огън|камина|лагерен огън": play('fire'),
  "лес|гора|природа": play('forest'),
  "вятър": play('wind'),
  "розов шум|розов": play('pink'),
  "кафяв шум|кафяв": play('brown'),
  "зелен шум|зелен": play('green'),
  
  // Volume
  "намали|по-тихо|тихо": volume(-10),
  "увеличи|по-силно|силно": volume(+10),
  "стоп|спри|пауза": stop(),
  "пусни|play": play_current(),
  
  // Sleep
  "спи 30|sleep 30|тридесет минути": sleep(30),
  "спи 45|sleep 45|четиридесет и пет": sleep(45),
  "спи 60|sleep 60|един час": sleep(60),
  
  // Night Wake
  "събуди ме|не мога да спя|помощ": night_wake(),
  "дишане|4-7-8": breathing(),
  
  // Mixes
  "за сън|deep sleep": preset('deep_sleep'),
  "релакс|релаксация": preset('daytime_relax'),
  "фокус|концентрация": preset('focus'),
  "стрес|анксиозност": preset('anxiety'),
};

// СЛОЖНИ КОМАНДИ (Class D - Gemini)
// "дай ми нещо за дълбок сън"
// "искам по-дълбок звук"
// "чувствам стрес"
// "как се справям тази седмица"
```

---

## 💳 ЧАСТ 10: STRIPE SETUP

### Products / Prices
```
Product: AURALIS Subscription
├── Price 1: €2.99/month (recurring monthly)
├── Price 2: €6.99/3 months (recurring quarterly)
└── Price 3: €19.99/year (recurring yearly)
```

### Trial
```
- 7 дни безплатен trial
- ИЗИСКВА карта/SEPA от ден 1 (anti-abuse)
- Email reminder ден 5 ("Free trial завършва след 2 дни")
- Auto-charge на ден 7
```

### Защити срещу неволно прекъсване
```
- SEPA Direct Debit (за EU 50+)
- Smart Retries (auto-retry при fail)
- Card Account Updater (auto-update изтекли карти)
- Pause subscription (1 месец, €0)
```

### Webhook events
```
- customer.subscription.created → активирай user
- customer.subscription.updated → промяна на план
- customer.subscription.deleted → cancel
- invoice.payment_failed → email + retry
- invoice.payment_succeeded → лог
```

---

## 🔐 ЧАСТ 11: GDPR

### Privacy Policy (must have)
```
1. Какво събираме:
   - Email (auth)
   - THI/TFI scores (sensitive - Article 9!)
   - Daily logs (sleep, tinnitus 0-10)
   - Voice queries (transcribed)

2. Защо:
   - Personalization (legitimate interest)
   - THI tracking (explicit consent)
   - Voice (explicit consent)

3. Колко време:
   - Активен акаунт: forever
   - След cancel: 30 дни (grace period)
   - След delete request: 7 дни (purge)
   - Logs: 12 месеца

4. Кой има достъп:
   - Тихол (data controller)
   - Stripe (payments)
   - Google (auth)
   - OpenAI (TTS - НЕ stored)
   - Gemini API (queries - НЕ stored)

5. Права:
   - Access (export JSON)
   - Rectification (in app)
   - Erasure ("Изтрий ми данните")
   - Portability (export JSON)
   - Restriction
```

### Disclaimer (ПРИ ПЪРВО ОТВАРЯНЕ)
```
[ВАЖНО]

AURALIS е инструмент за слухова релаксация.

❌ НЕ заменя медицинска консултация
❌ НЕ лекува тинитус
✅ Помага за хабитуация и релаксация
✅ Резултатите варират индивидуално

При остри симптоми → консултирай се с лекар.

[РАЗБРАХ И СЪГЛАСЯВАМ СЕ]
```

---

## 🤝 ЧАСТ 12: РАЗПРЕДЕЛЕНИЕ НА РАБОТАТА

### CLAUDE CODE DESKTOP (mass production)
```
Задачи (по подред):
1. PWA skeleton (HTML + manifest)
2. Web Audio API класове (всичките 8)
3. Mixer UI
4. Sleep Mode + Night Wake
5. Daily input form
6. Chart.js integration
7. Quiz JSON + UI
8. PHP API endpoints
9. Database migrations
10. Stripe integration code

Cheatkey:
1 = Yes (cp, cat, grep, git, php)
2 = No (rm, chmod, DROP, TRUNCATE)
```

### CLAUDE (новия чат, тук)
```
Задачи:
- Архитектурни решения когато има въпрос
- Ревизия на Claude Code output
- Bug analysis
- UI/UX critique
- Code review за качество
- Помощ когато Claude Code запъне
```

### ТИХОЛ
```
Задачи:
- Дизайн решения (визуални)
- Тест със баща (всеки ден)
- Финални approvals
- Git review
- Качване на звуци
- Stripe account setup
- Domain config
```

---

## 📊 ЧАСТ 13: SUCCESS КРИТЕРИИ (Day 14)

### За баща
```
BASELINE:
- THI: 62
- Сън: 4ч
- Тинитус 0-10: 8
- Дистрес 0-10: 7

TARGET:
- THI: ≤55 (-7) ✅
- Сън: ≥5ч (+1) ✅
- Тинитус: 5-6 ✅
- Дистрес: 4-5 ✅

УСПЕХ: 2+ метрики ✅
```

### За приложението
```
✅ PWA install работи
✅ Mixer + 6 звука работят
✅ Sleep Mode + SOS работят
✅ Voice контрол работи
✅ Daily input събира данни
✅ Графики рисуват
✅ Quiz изчислява профил
✅ Stripe trial setup
✅ GDPR consent flow
✅ Deploy на production
```

---

## 🚨 ЧАСТ 14: КРИТИЧНИ НАПОМНЯНИЯ

### КОГА ДА ПИТАШ ПРЕДИ ДА ПРАВИШ
```
✅ Визуални промени (цветове, layout)
✅ Логически промени във flow
✅ Code който мени architecture
✅ Промени по pricing
✅ Промени по AI prompts
✅ Промени по GDPR/consent
```

### КОГА МОЖЕШ САМ
```
✅ Bug fixes (явни грешки)
✅ Code formatting
✅ Comment добавки
✅ Optimization (запазваща логика)
✅ Test cases
```

### ABSOLUTE NO-GO
```
❌ Health advice в AI отговори
❌ Бял шум (доказано вреден)
❌ Native клавиатура за тинитус
❌ Микрофон винаги ВКЛ (батерия!)
❌ Promised "лечение"/"диагностика"
❌ Dark patterns (pre-ticked, hidden cancel)
```

---

## 📞 ЧАСТ 15: КОГАТО НЕЩО НЕ Е ЯСНО

### СТЪПКИ
```
1. Първо: чети AURALIS_BIBLE_v2.md (Project Knowledge)
2. После: чети HANDOFF_v5.md (този файл)
3. Ако всичко still неясно: ПИТАЙ ме директно

ВЪПРОСИ ОТ MEНЕ:
- "Тихол, кое е важно тук - X или Y?"
- "Тихол, имам конфликт в документите за..."
- "Тихол, не намирам инфо за..."
```

### КОГАТО МАШИНАТА ГРЕШИ
```
1. CAPS LOCK от мен = спешност/раздразнение
2. "Ти луд ли си" = забравил си критичен контекст
3. Дълги обяснения от теб = аз се отказвам да чета
4. "Прав си, коригирам" вместо "извинявай"
```

---

## 🎯 ПЪРВА ЗАДАЧА ЗА CLAUDE CODE

```
Задача 1: Setup проекта

1. git clone https://github.com/tiholenev-tech/tinnitus-app.git
2. cd tinnitus-app
3. Създай структурата:
   /css /js /audio /api /docs /tools
4. index.html (базов skeleton, PWA-ready)
5. manifest.json
6. service-worker.js (offline mode)
7. css/variables.css (от Project Knowledge tokens)
8. silent.mp3 (за lock screen trick - 2 сек tишина)
9. README.md с инструкции

ПРАВИЛА:
- Mobile-first 375px
- Dark mode по default
- Montserrat font
- 16px+ шрифт
- 44×44px минимум бутони

КОГА Е ГОТОВО:
- git push origin main
- Кажи на Тихол да види
- Чакай feedback преди следваща задача
```

---

## ✅ HANDOFF CHECKLIST (за Тихол)

```
☑ Bible v2.0 готова
☑ HANDOFF v5 написан
☐ Качване в Project Knowledge (двата файла)
☐ Git repo setup (tiholenev-tech/tinnitus-app)
☐ Claude Code Desktop отворен
☐ Първа задача дадена на Claude Code
☐ Stripe акаунт готов (имаме!)
☐ Google Cloud project (Firebase Auth)
☐ Domain закупен (auralis.bg или подобен)

ЗАПОЧВАМЕ РАЗРАБОТКА:
🚀 24 май - 6 юни (2 седмици)
🎯 7 юни - test със баща
📊 21 юни - първи резултати (ден 14)
🚀 Юли - beta launch
```

---

**HANDOFF v5 ЗАВЪРШЕН**
**Готов за разработка с Claude Code Desktop**
**Източник на истината: AURALIS_BIBLE_v2.md**

🚀 **READY TO BUILD!**
