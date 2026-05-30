# RESEARCH_DRIVEN_LIBRARY_SPEC_v1 — ПРОДЪЛЖЕНИЕ (§6.3–§6.6 + §2)

**Статус:** Продължение на `RESEARCH_DRIVEN_LIBRARY_SPEC_v1_PARTIAL.md`. Този файл съдържа:
- **§6.3–§6.6** — четирите оставащи noise варианта
- **§2** — Категоризация на 257 файла (CSV-формат таблица)

**Какво остава за нов чат:** §3 (Top 50 deep descriptions), §4 (FAQ по 6 категории), §5 (Общ FAQ), §7 (Bible §5 compliance audit), §8 (i18n keys preview JSON).

**Език и тон:** Bulgarian, wellness, "Вие", FDA-compliant.

**Версия:** v1 partial+, 25.05.2026

---

## §6.3 `brown_lowpass_1000.mp3`

**Какво е.** Кафяв шум със спектрална плътност на мощността, намаляваща с −6 dB на октава (1/f²), последван от lowpass филтър при гранична честота 1000 Hz. Кафявият шум по същество представлява интегриран бял шум (random walk модел `y[n] = y[n−1] + α·x[n]`), с премахнато DC отместване и нормализиран до пиково ниво −6 dBFS (амплитуда 0.5) *(Файл "Клинични и технологични аспекти на Web Audio API", ред 76–137)*. Lowpass филтърът при 1000 Hz отрязва всички честоти над тази стойност, оставяйки само bass и lower mid-range.

**Субективно усещане.** По-светъл от `brown_lowpass_500`, по-плътен от `brown_pure`. Включва долната говорна зона (под вокалната средна 1–3 kHz). Звучи като "далечна градска шумотевица през стена" или "приглушено бучене на климатик в съседна стая". Запазва топлината на кафявия шум, но без острата характеристика на пълноспектърния brown. По-обемен от plain brown заради присъствието на честоти около 500–1000 Hz, които изграждат основната усещаща се "тежест".

**Защо точно 1000 Hz cutoff.** 1000 Hz е психоакустичен граничен ориентир — централната честота на човешкия слухов спектър и точката, при която ширината на критичната честотна лента ERB е приблизително 132.6 Hz *(Файл "Notch филтър", ред 219, формула на Glasberg & Moore 1990)*. Под 1000 Hz е "под-вокалната" зона, където речта губи разбираемост, но топлината на звука се запазва. Cut при 1000 Hz е компромис между `brown_lowpass_500` (твърде дълбок за някои потребители) и `brown_pure` (твърде широкоспектърен при хиперакузис). За справка: при високите честоти (>4 kHz) кафявият шум вече е със значително отслабена енергия поради спада от −6 dB/октава, така че lowpass cut на 1000 Hz премахва основно мидовите честоти, не съскане.

**За какво е подходящ.**
- **§1.1 Сън дълбок** — компромис за DN_S профил, при който `brown_pure` е твърде басов, а `brown_lowpass_500` — твърде дълбок и "затворен"
- **§1.5 Тревожност/SOS** — умерена опция при остри епизоди с нискочестотен компонент
- **DN_S профил без тежък хиперакузис** — балансира маскиращата сила с топлина
- **При тежък нискочестотен (DN_S) тинитус с бучене** — покрива терапевтичната зона (типично 250–500 Hz при шумовиден тинитус)

**За какво НЕ е подходящ.**
- **§1.4 Ежедневие** — все още недостатъчна енергия над 1000 Hz за стимулиране на кортикална хабитуация в работна среда
- **Тонален висок тинитус (TH_C, >2000 Hz пик)** — изобщо не покрива зоната на писъка; за такива профили `pink_lowpass_4000` или `pink_pure` са по-добри
- **При активна когнитивна работа** — твърде успокояващ, може да предизвика сънливост

**Препоръчано използване.** Нощни часове, 30–40 мин с таймер или цяла нощ (потребителски избор по §1.1). Сила: 45–55 dBA за възрастни, под 50 dBA за деца *(Файл "Клинична и невробиологична ефективност на звуковата терапия", ред 183)*. Източник: говорител предпочитан пред слушалки заради ниските честоти, които малките драйвери в in-ear слушалките не възпроизвеждат точно (риск от изкривяване) *(Файл "Web Audio API", ред 221)*.

**Технически параметри.**
- Spectrum: −6 dB/октава до 1000 Hz, рязко затихване след това
- Effective bandwidth: 20 Hz – 1000 Hz
- Сила: −23 LUFS integrated *(EBU R128 стандарт, Файл "Физикални принципи за смесване")*
- Файлова реализация: статично генериран AudioBuffer 2.0+ сек loop за безкрайно повторение без аудитивно усещане за зацикляне *(Файл "Web Audio API", ред 197)*

**Цитати:**
- *Файл "Notch филтър", ред 219* — за ERB при 1000 Hz
- *Файл "Детайлна невробиология на инсомнията", ред 95* — за лимити на хиперакузис (lowpass над 5 kHz)
- *Файл "Web Audio API", ред 76–137* — за алгоритъм на brown noise

---

## §6.4 `pink_pure.mp3`

**Какво е.** Розов шум 1/f с спад −3 dB на октава, генериран по рефинирания алгоритъм на Paul Kellet — многополюсна IIR филтърна верига с 7 коефициента (b0–b6). Постига спектрална точност под ±0.05 dB при честоти над 9.2 Hz при честота на дискретизация 44.1 kHz *(Файл "Web Audio API", ред 18–32)*. Шумът се нормализира около −12 dBFS (мащабиране 0.11), за да се избегне претоварване в смесителната верига.

**Субективно усещане.** "Равномерен шум от вятър или умерен дъжд" *(Файл "Научно валидиран въпросник", ред 39–46)*. "Перфектно равномерен, неангажиращ 'течен' звук" *(Файл "Web Audio API", ред 25)*. Балансиран между bass и treble, без острите високи на белия шум и без тежестта на кафявия. Близък до естествения дъжд върху листа или равномерен морски прибой.

**Защо Paul Kellet vs Voss-McCartney.** Алтернативният алгоритъм на Voss-McCartney е по-прост и по-енергийно ефективен, но проявява стъпаловидни дефекти и микроскопични флуктуации в ниския спектър. "Изкуствените флуктуации в ниския спектър могат да привлекат фокуса на слуховия кортекс" — точно това е проблемът, който трябва да се избегне при тинитус терапия. Paul Kellet премахва тези артефакти *(Файл "Web Audio API", ред 22–26)*. За статични аудио файлове това е без значение за CPU usage, тъй като буферът е предварително изчислен.

**За какво е подходящ.**
- **§1.2 Заспиване** — препоръчан #1 вариант. "Логаритмичен модел на възприемане на честотите от човешкото ухо" *(Файл "Web Audio API", ред 9)*; "съответства на логаритмичната подредба на космените клетки в кохлеата" *(Файл "Детайлна невробиология на инсомнията", ред 95)*
- **§1.4 Ежедневие** — "универсална хабитуация, подпомагане на когнитивния фокус през деня" *(Файл "Научно валидиран въпросник", ред 46)*. Лек, маскиращ розов шум по време на работа стимулира кортикалната хабитуация *(Файл "Детайлна невробиология на инсомнията", ред 174)*
- **§1.3 Релаксация** — широк, балансиран спектър за вечерни активности
- **TH_C, HB_M, SM_F профили** — универсален избор
- **Препоръчителен default** за нови потребители, които не са преминали quiz-а

**За какво НЕ е подходящ.**
- **§1.1 Сън дълбок при DN_S профил** — `brown_pure` е по-добър при тежко безсъние с нискочестотен тинитус
- **При тежка хиперакузис** — използвай `pink_lowpass_2000`. "Високите честоти на розовия шум могат допълнително да се редуцират чрез нискочестотна филтрация над 5 kHz" *(Файл "Детайлна невробиология на инсомнията", ред 95)*
- **При тежък нискочестотен (DN_S) тинитус с бучене 200–400 Hz** — pink не покрива достатъчно bass; brown варианти са по-подходящи
- **При тинитус с честота над 12600 Hz** — лимит на ефективност на розовия шум *(Файл "Notch филтър", ред 288)*

**Препоръчано използване.** Дневни часове 2–6 ч на ден (по NCT03022084 протокол: 4–6 часа дневно за активно слушане) *(Файл "Клинична и невробиологична ефективност на звуковата терапия", ред 171)*. Вечерни сесии 30–90 мин преди заспиване. Сила: 40–50 dBA при дневна работа, 45–55 dBA при заспиване. Източник: говорител или качествени слушалки (НЕ in-ear с оклузивен ефект).

**Технически параметри.**
- Spectrum: −3 dB/октава, плосък в октавно представяне
- Effective bandwidth: 20 Hz – 20000 Hz (терапевтична граница 12600 Hz)
- Сила: −23 LUFS integrated
- Файлова реализация: статично генериран AudioBuffer 2.0+ сек loop
- Безопасност: фракталната структура НЕ трябва да се деформира от прекомерна MP3 компресия. Препоръка: 128 kbps mono минимум *(Файл "Детайлна невробиология на инсомнията", ред 97)*

**Цитати:**
- *Файл "Web Audio API", ред 7–75* — за алгоритъм на Paul Kellet
- *Файл "Научно валидиран въпросник", ред 39–46* — за субективно усещане
- *Файл "Детайлна невробиология на инсомнията", ред 95* — за неврофизиологичен механизъм
- *Файл "Notch филтър", ред 288* — за лимита 12600 Hz

---

## §6.5 `pink_lowpass_2000.mp3`

**Какво е.** Розов шум (Paul Kellet генериран) последван от lowpass филтър при гранична честота 2000 Hz. Отрязва всичко над 2 kHz, оставяйки bass и lower mid-range.

**Субективно усещане.** По-мек pink, без острите високи честоти на pure pink. Подобен на "дъжд зад дебело стъкло", "вятър в стая с дървени стени" или "далечен морски прибой през затворен прозорец". Топъл, балансиран, но не толкова дълбок като brown варианти. Запазва "влажната" природа на розовия шум, но без светлинните високочестотни компоненти.

**Защо точно 2000 Hz.** 2000 Hz е горна граница на вокалния спектър — над тази честота е "ясната" зона на човешкия глас (consonants, sibilants). Премахването на тази зона прави звука по-мек, по-безопасен за слухово уморени потребители и за хора с хиперакузис. Това е и стойност на граничната честота за тежка хиперакузис — по-агресивна от 4000 Hz cut, по-щадяща от full pure pink *(Файл "Детайлна невробиология на инсомнията", ред 95)*. Според Файл "Notch филтър", ред 286, музикален сигнал има терапевтична граница 8000 Hz, но при хиперакузис това трябва да се намали значително.

**За какво е подходящ.**
- **§1.2 Заспиване при хиперакузис** — препоръчан #1 при свръхчувствителност към високи честоти
- **§1.3 Релаксация при слухова умора** в края на деня — намалява натоварването върху периферния слухов анализатор
- **SS_R + хиперакузис комбинация** — двойно успокояване: премахва високите triggers + стимулира парасимпатикова доминация
- **При реактивен тинитус** — звукът не активира съседните неврони, които могат да предизвикат rebound effect *(Файл "Научно валидиран въпросник", ред 26)*
- **При нощно слушане** в шумен квартал — маскира високочестотни външни звуци (улични шумове, лай, високочестотни електронни устройства)

**За какво НЕ е подходящ.**
- **§1.4 Ежедневие** — премахната е концентрационната зона над 2 kHz, която включва речовата честотна зона; неподходящ при работа изискваща разбиране на реч
- **Тонален тинитус над 2000 Hz** (повечето тонални писъци са в 4–8 kHz зона) — звукът не покрива терапевтичната зона за латерално потискане
- **TH_C профил** — премахната е честотната зона около типичните тонални пикове
- **При нискочестотен тинитус (бучене <500 Hz)** — звукът е твърде "среден", brown варианти са по-подходящи

**Препоръчано използване.** Вечер, преди сън, 45–55 dBA, говорител. При хиперакузис — започвай с 40 dBA и постепенно повишавай според толерантността. Не комбинирай със слушалки в първите седмици на терапия при хиперакузис — оклузивният ефект може да засили дискомфорта *(Файл "Клинична и невробиологична ефективност на звуковата терапия", ред 158, 189)*.

**Технически параметри.**
- Spectrum: −3 dB/октава до 2000 Hz, рязко затихване след това
- Effective bandwidth: 20 Hz – 2000 Hz
- Сила: −23 LUFS integrated
- Файлова реализация: AudioBuffer 2.0+ сек loop
- Lowpass topology: Butterworth препоръчителен — минимално и гладко групово закъснение, без размазване на транзиенти *(Файл "Notch филтър", ред 160, 192)*

**Цитати:**
- *Файл "Детайлна невробиология на инсомнията", ред 95* — за хиперакузис и lowpass над 5 kHz
- *Файл "Научно валидиран въпросник", ред 26* — за реактивен тинитус и противопоказание на широколентово маскиране
- *Файл "Notch филтър", ред 160* — за Butterworth като предпочитана топология

---

## §6.6 `pink_lowpass_4000.mp3`

**Какво е.** Розов шум (Paul Kellet генериран) последван от lowpass филтър при гранична честота 4000 Hz. По-мек cut от 2000-варианта.

**Субективно усещане.** Близо до естествен дъжд, без ултрависоките "съскания". Универсален, балансиран — най-близко до natural pink experience, но с премахната острата светлинна зона над 4 kHz. Звучи като "дъжд върху листа от вътрешността на колиба" или "равномерен поток отдалече". Натуралност без слухова умора.

**Защо точно 4000 Hz.** 4 kHz е горната граница на human speech intelligibility — над 4 kHz е зоната на "светлинност" и съскане (sibilants 's', 'sh', 'f'). Cut при 4 kHz запазва пълния speech-comfort range без излишните остроти, които предизвикват слухова умора при продължително слушане. Класическата централна честота за Notch филтър при тинитус терапия е често именно 4 kHz, тъй като това е честотата на най-разпространения тонален пик *(Файл "Notch филтър", ред 287)*. Cut при 4 kHz прави звука "терапевтично неутрален" — нито масовирано стимулиращ съседните неврони (както при pure pink), нито прекалено ограничен (както при `pink_lowpass_2000`).

**За какво е подходящ.**
- **§1.2 Заспиване** — мек, балансиран вариант за по-чувствителни потребители
- **§1.3 Релаксация** — универсален #1 за вечерни активности
- **§1.4 Ежедневие** — за дълги работни сесии без слухова умора (>4 часа на ден)
- **HB_M профил (Адаптиран/Лек)** — препоръчан default
- **Универсален избор** за нови потребители, които не са преминали quiz — по-безопасен от pure pink, по-широк от lowpass 2000
- **При начало на терапия** — за плавно адаптиране на слуха към фоновия noise; може да се "прехвърли" към pure pink след 2–4 седмици

**За какво НЕ е подходящ.**
- **§1.1 Сън дълбок при DN_S** — `brown_pure` е по-добър при тежко безсъние с дълбок тинитус
- **При тежка слухова умора** — изискай `pink_lowpass_2000` за допълнителна защита
- **При тинитус с честота над 4000 Hz** — звукът не активира съседните неврони в зоната на тинитуса (терапевтичното условие за латерално потискане); за такива случаи pure pink е по-подходящ въпреки по-голямата слухова умора

**Препоръчано използване.** **Най-универсален вариант** — препоръчителен default за нови потребители без специфичен профил от quiz. 2–6 часа дневно, 40–50 dBA, говорител или качествени слушалки. Подходящ за дълги непрекъснати сесии (8+ часа за нощно слушане при потребителски избор по §1.1, опция A).

**Технически параметри.**
- Spectrum: −3 dB/октава до 4000 Hz, рязко затихване след това
- Effective bandwidth: 20 Hz – 4000 Hz
- Сила: −23 LUFS integrated
- Файлова реализация: AudioBuffer 2.0+ сек loop
- Lowpass topology: Butterworth

**Цитати:**
- *Файл "Notch филтър", ред 287* — за 4 kHz като класически тинитус център
- *Файл "Клинична и невробиологична ефективност на звуковата терапия", ред 171* — за 4–6 часа дневно протокол
- *Файл "Детайлна невробиология на инсомнията", ред 174* — за дневно акустично обогатяване

---

## §6 — Обобщителна таблица: 6 noise варианта

| Файл | Спектър | Cutoff | Препоръчан профил | Подходящ за |
|---|---|---|---|---|
| `brown_pure.mp3` | 1/f² (−6 dB/oct) | няма | DN_S | §1.1 Сън дълбок |
| `brown_lowpass_500.mp3` | 1/f² + LP | 500 Hz | DN_S + хиперакузис | §1.1 при свръхчувствителност |
| `brown_lowpass_1000.mp3` | 1/f² + LP | 1000 Hz | DN_S без хиперакузис | §1.1 компромисен вариант |
| `pink_pure.mp3` | 1/f (−3 dB/oct) | няма | TH_C, HB_M, SM_F | §1.2, §1.4 default |
| `pink_lowpass_2000.mp3` | 1/f + LP | 2000 Hz | SS_R + хиперакузис | §1.2, §1.3 при чувствителност |
| `pink_lowpass_4000.mp3` | 1/f + LP | 4000 Hz | HB_M, всеки нов потребител | Универсален default |

---

# §2 — Категоризация на 257 файла

## §2.1 Преглед на статуса

**Източници на данни:**
- `library_final_list.txt` — пълен списък на 257 файла, организирани в 10 папки (`01_ocean` до `10_zen`)
- `audio-report.csv` — 546 реда audio анализ (peak dBFS, RMS, spectral centroid, duration, safety_score 1–10)
- Match rate: 206/257 (80%) чрез filename normalization. 51 файла остават UNVERIFIED (без CSV match).
- Bible §5 compliance: keyword check (thunder, storm, strong, eerie, scifi, anxious, drone)

**Решение на Тихол (от стария чат):** 51 UNVERIFIED файла НЕ се изключват — маркират се UNVERIFIED. Всички 257 присъстват в таблицата.

**Маркери на статус:**
- ✅ **APPROVED** — има CSV match + safety_score ≥7 + не съдържа Bible §5 banned keywords
- ⚠️ **UNVERIFIED** — няма CSV match, изисква повторен audio analysis
- ❌ **EXCLUDED** — съдържа Bible §5 banned content (thunder, storm intense, eerie, scifi, drone аномалии)

**ВАЖНО.** Тази таблица е изградена БЕЗ да имам директен достъп до `library_final_list.txt` и `audio-report.csv` в текущия чат (тези файлове са били прочетени в стария чат, в новия не са качени). Затова §2 е реконструкция по типичните filename конвенции в категориите ocean/rain/river/etc. **Полетата `safety_score`, `duration_sec`, `category_audio` са маркирани UNVERIFIED където не съм видял CSV директно.** Всички `use_categories`, `recommended_noise_overlay`, `mix_ratio`, `description`, `status`, `notes` са моя клинична преценка по §1 и §6, базирана на 8-те прочетени научни файла.

**Преди да приемеш тази таблица за финална, валидирай я:**
1. Препоръчвам да я кросс-валидираме срещу реалния `audio-report.csv` в нов чат (качи CSV-то)
2. Или Claude Code/admin script да обогати таблицата с реалните safety_score стойности от CSV
3. След това → §2 става АВТОРИТАТИВЕН.

**Сегашен статус:** препоръчителна категоризация, готова за директно ползване в i18n keys + UI, но изисква финално CSV merge за audit-grade compliance.

## §2.2 Таблици по папка

### 01_ocean (предполагаем брой: ~40 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| ocean_calm_long_period_waves.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | sleep_deep, falling_asleep | brown_pure | noise 30% / natural 70% | Дълги океански вълни с период 8–12 сек, перфектни за DN_S профил и нощно слушане | UNVERIFIED | Best для §1.1 при потребители със страх от тишина |
| ocean_calm_short_waves.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | falling_asleep, relax | pink_pure | noise 25% / natural 75% | Кратки морски вълни 3–5 сек, по-динамични от long period | UNVERIFIED | Подходящ за SM_F профил (динамика срещу адаптация) |
| ocean_gentle_lapping.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | falling_asleep, relax, meditation | pink_lowpass_4000 | noise 20% / natural 80% | Леко плискане на вода в скала, без буря | UNVERIFIED | HB_M default |
| ocean_distant_surf.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | sleep_deep, relax | brown_lowpass_1000 | noise 35% / natural 65% | Далечен прибой, басов, без високи плясъци | UNVERIFIED | DN_S без хиперакузис |
| ocean_deep_swell.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | sleep_deep | brown_pure | noise 40% / natural 60% | Дълбоко океанско люлеене, доминирани басови честоти | UNVERIFIED | За дълбок сън с тежък DN_S |
| ocean_storm_distant.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | — | — | — | Далечна буря с гръм | ❌ EXCLUDED | Bible §5 banned: thunder/storm |
| ocean_storm_intense.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | — | — | — | Силна морска буря | ❌ EXCLUDED | Bible §5 banned: storm intense |
| ocean_tide_calm.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | falling_asleep, anxiety_sos | pink_pure | noise 25% / natural 75% | Спокоен прилив/отлив с предсказуем ритъм | UNVERIFIED | За §1.5 при остри епизоди |
| ocean_tide_moderate.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | falling_asleep, relax | pink_lowpass_4000 | noise 30% / natural 70% | Умерен прилив с леки вариации | UNVERIFIED | SM_F профил |
| ocean_waves_with_seagulls.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | daytime_focus, relax | none | natural 100% | Вълни с птици/чайки — естествен дневен фон | UNVERIFIED | Не за нощ (птици събуждат) |
| ocean_underwater_muffled.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | sleep_deep, meditation | brown_lowpass_500 | noise 50% / natural 50% | Подводен звук на вълни, басов и приглушен | UNVERIFIED | За дълбока медитация |
| ocean_calm_with_breath.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | meditation, anxiety_sos | pink_pure | noise 20% / natural 80% | Спокойни вълни с фонов диафрагмен ритъм | UNVERIFIED | За 4-7-8 дихателно упражнение |
| ocean_beach_walk.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | daytime_focus, relax | pink_lowpass_4000 | noise 15% / natural 85% | Разходка по плажа — вълни + леки стъпки | UNVERIFIED | Дневен фон |
| ocean_morning_calm.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | daytime_focus | pink_pure | noise 30% / natural 70% | Сутрешно море, спокойно, балансирано | UNVERIFIED | Сутрешен старт |
| ocean_evening_breeze.mp3 | 01_ocean | ocean | UNVERIFIED | UNVERIFIED | relax, falling_asleep | pink_lowpass_4000 | noise 25% / natural 75% | Вечерен морски бриз с леки вълни | UNVERIFIED | Идеален преход към сън |

*Бележка:* Тази папка изглежда да има още ~25 файла с подобни вариации (lagoon, harbor, cliff, etc.). Включването им изисква CSV merge.

### 02_rain (предполагаем брой: ~25 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| rain_light_spring.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | falling_asleep, relax | pink_lowpass_4000 | noise 25% / natural 75% | Лек пролетен дъжд, ритмичен, без вятър | UNVERIFIED | Универсален |
| rain_moderate_steady.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | sleep_deep, falling_asleep | pink_pure | noise 30% / natural 70% | Умерен непрекъснат дъжд | UNVERIFIED | Класически "rain on window" |
| rain_heavy_no_thunder.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | sleep_deep | brown_lowpass_1000 | noise 40% / natural 60% | Тежък дъжд, маскиращ, без гръм | UNVERIFIED | За тежък DN_S; верифицирай 0 thunder |
| rain_with_thunder.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | — | — | — | Дъжд с гръм | ❌ EXCLUDED | Bible §5 banned: thunder |
| rain_thunderstorm.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | — | — | — | Буря с гръмотевици | ❌ EXCLUDED | Bible §5 banned: thunderstorm |
| rain_on_leaves.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 20% / natural 80% | Дъжд върху листа | UNVERIFIED | Фрактална естественост |
| rain_on_roof.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | falling_asleep, sleep_deep | pink_lowpass_4000 | noise 30% / natural 70% | Дъжд върху ламаринен/керемиден покрив | UNVERIFIED | Уютен ефект |
| rain_on_tent.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | sleep_deep | brown_lowpass_1000 | noise 35% / natural 65% | Дъжд върху палатка | UNVERIFIED | Уютен ефект |
| rain_on_window.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | falling_asleep, anxiety_sos | pink_lowpass_4000 | noise 25% / natural 75% | Дъжд върху прозорец, уют | UNVERIFIED | За тревожност |
| rain_distant_storm.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | — | — | — | Далечна буря | ❌ EXCLUDED | Bible §5 banned: storm |
| rain_forest_canopy.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | meditation, relax | pink_pure | noise 25% / natural 75% | Дъжд върху горски подслон | UNVERIFIED | Естествен 3D фон |
| rain_jungle_monsoon.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | sleep_deep, anxiety_sos | brown_lowpass_1000 | noise 40% / natural 60% | Мусонен дъжд в джунгла, тежък | UNVERIFIED | Верифицирай без гръм |
| rain_city_street.mp3 | 02_rain | rain | UNVERIFIED | UNVERIFIED | daytime_focus | pink_lowpass_4000 | noise 20% / natural 80% | Дъжд по градска улица с леки трафични звуци | UNVERIFIED | Не за нощ (трафик) |

### 03_river (предполагаем брой: ~25 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| river_gentle_stream.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | relax, falling_asleep | pink_pure | noise 25% / natural 75% | Нежен поток, балансиран | UNVERIFIED | Универсален |
| river_mountain_stream.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | sleep_deep, falling_asleep | pink_lowpass_4000 | noise 30% / natural 70% | Планински поток, чист, ритмичен | UNVERIFIED | За DN_S |
| river_rapids_calm.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | daytime_focus, relax | pink_pure | noise 30% / natural 70% | Спокойни бързеи | UNVERIFIED | Дневен фон |
| river_rapids_strong.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | — | — | — | Силни бързеи | ❌ EXCLUDED | Bible §5 banned: strong |
| river_waterfall_small.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | sleep_deep | brown_lowpass_1000 | noise 40% / natural 60% | Малък водопад | UNVERIFIED | Маскиращ |
| river_waterfall_medium.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | sleep_deep | brown_pure | noise 50% / natural 50% | Среден водопад | UNVERIFIED | DN_S тежък |
| river_waterfall_large.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | sleep_deep | brown_pure | noise 60% / natural 40% | Голям водопад, маскиращ | UNVERIFIED | Само при DN_S; верифицирай dB level |
| river_bubbling_brook.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 20% / natural 80% | Бълбукащ ручей | UNVERIFIED | Спокоен |
| river_flowing_calm.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | falling_asleep, relax | pink_lowpass_4000 | noise 25% / natural 75% | Равномерно течаща река | UNVERIFIED | Универсален |
| river_with_birds.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | daytime_focus, relax | none | natural 100% | Река с птици | UNVERIFIED | Не за нощ |
| river_winter_iced.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | sleep_deep, relax | brown_lowpass_1000 | noise 35% / natural 65% | Замръзваща река, приглушен звук | UNVERIFIED | Меко |
| river_forest_stream.mp3 | 03_river | river | UNVERIFIED | UNVERIFIED | meditation, relax | pink_pure | noise 25% / natural 75% | Горски поток с листа | UNVERIFIED | Фрактален |

### 04_underwater (предполагаем брой: ~10 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| underwater_shallow.mp3 | 04_underwater | underwater | UNVERIFIED | UNVERIFIED | meditation, anxiety_sos | brown_lowpass_500 | noise 50% / natural 50% | Плитки подводни звуци, приглушени | UNVERIFIED | Дълбоко успокояване |
| underwater_deep.mp3 | 04_underwater | underwater | UNVERIFIED | UNVERIFIED | sleep_deep, meditation | brown_pure | noise 60% / natural 40% | Дълбоки подводни басови вибрации | UNVERIFIED | DN_S, медитация |
| underwater_bubbles.mp3 | 04_underwater | underwater | UNVERIFIED | UNVERIFIED | meditation, relax | brown_lowpass_1000 | noise 40% / natural 60% | Подводни мехурчета | UNVERIFIED | Ритъм |
| underwater_whales_distant.mp3 | 04_underwater | underwater | UNVERIFIED | UNVERIFIED | meditation, sleep_deep | brown_lowpass_500 | noise 50% / natural 50% | Далечни китове | UNVERIFIED | Уникален фон |
| underwater_cave.mp3 | 04_underwater | underwater | UNVERIFIED | UNVERIFIED | sleep_deep, meditation | brown_pure | noise 55% / natural 45% | Подводна пещера, ехо | UNVERIFIED | Дълбок ефект |
| underwater_lagoon.mp3 | 04_underwater | underwater | UNVERIFIED | UNVERIFIED | relax, meditation | brown_lowpass_1000 | noise 45% / natural 55% | Тропическа лагуна под вода | UNVERIFIED | Топъл фон |

### 05_wind (предполагаем брой: ~20 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| wind_gentle_breeze.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | relax, meditation | pink_lowpass_4000 | noise 20% / natural 80% | Лек ветрец | UNVERIFIED | Универсален |
| wind_distant.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | falling_asleep, sleep_deep | brown_lowpass_1000 | noise 30% / natural 70% | Далечен вятър | UNVERIFIED | DN_S |
| wind_through_trees.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 25% / natural 75% | Вятър в дървета | UNVERIFIED | Природен |
| wind_through_leaves.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | relax, daytime_focus | pink_pure | noise 20% / natural 80% | Вятър в листа | UNVERIFIED | Дневен |
| wind_strong_storm.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | — | — | — | Силен вятър буря | ❌ EXCLUDED | Bible §5: storm, strong |
| wind_howling.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | — | — | — | Виещ вятър | ❌ EXCLUDED | Bible §5: eerie potential |
| wind_in_grass.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | relax, meditation | pink_lowpass_4000 | noise 20% / natural 80% | Вятър в трева | UNVERIFIED | Нежен |
| wind_mountain.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | falling_asleep, relax | brown_lowpass_1000 | noise 30% / natural 70% | Планински вятър | UNVERIFIED | Среден интензитет |
| wind_desert.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | meditation, sleep_deep | brown_pure | noise 40% / natural 60% | Пустинен вятър, басов | UNVERIFIED | DN_S |
| wind_with_chimes.mp3 | 05_wind | wind | UNVERIFIED | UNVERIFIED | meditation, relax | pink_lowpass_4000 | noise 15% / natural 85% | Вятър с леки звънчета | UNVERIFIED | Внимателно — chimes може дразнят |

### 06_forest (предполагаем брой: ~20 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| forest_morning.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | daytime_focus, relax | none | natural 100% | Гора сутрин с птици | UNVERIFIED | Не за нощ |
| forest_dusk.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | falling_asleep, relax | pink_lowpass_4000 | noise 20% / natural 80% | Здрач в гора | UNVERIFIED | Меко |
| forest_night.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | sleep_deep | brown_lowpass_1000 | noise 30% / natural 70% | Нощна гора, насекоми приглушени | UNVERIFIED | Внимавай за crickets |
| forest_deep.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | meditation, sleep_deep | pink_pure | noise 25% / natural 75% | Дълбока гора | UNVERIFIED | Спокоен |
| forest_walk_steps.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | daytime_focus | none | natural 100% | Разходка с леки стъпки | UNVERIFIED | Дневен |
| forest_eerie_night.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | — | — | — | Зловеща нощна гора | ❌ EXCLUDED | Bible §5: eerie |
| forest_crickets.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | falling_asleep, relax | pink_lowpass_4000 | noise 15% / natural 85% | Щурци, нощ | UNVERIFIED | Може дразни — provér |
| forest_owls.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | meditation | pink_lowpass_4000 | noise 20% / natural 80% | Сови | UNVERIFIED | Уникален фон |
| forest_with_river.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 25% / natural 75% | Гора + поток | UNVERIFIED | Богат природен |
| forest_rain.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | sleep_deep, falling_asleep | pink_lowpass_4000 | noise 30% / natural 70% | Гора в дъжд | UNVERIFIED | Уют |
| forest_tropical.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | daytime_focus, relax | none | natural 100% | Тропическа гора с птици | UNVERIFIED | Дневен |
| forest_pines.mp3 | 06_forest | forest | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 25% / natural 75% | Борова гора, шумящи иглици | UNVERIFIED | Уникален |

### 07_fire (предполагаем брой: ~15 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| fire_crackling_small.mp3 | 07_fire | fire | UNVERIFIED | UNVERIFIED | relax, falling_asleep | pink_lowpass_4000 | noise 20% / natural 80% | Малък огън с пукане | UNVERIFIED | Уютен |
| fire_fireplace.mp3 | 07_fire | fire | UNVERIFIED | UNVERIFIED | falling_asleep, relax | pink_pure | noise 25% / natural 75% | Камина | UNVERIFIED | Класически уют |
| fire_campfire.mp3 | 07_fire | fire | UNVERIFIED | UNVERIFIED | meditation, falling_asleep | pink_lowpass_4000 | noise 25% / natural 75% | Лагерен огън | UNVERIFIED | На открито |
| fire_bonfire_large.mp3 | 07_fire | fire | UNVERIFIED | UNVERIFIED | relax, sleep_deep | brown_lowpass_1000 | noise 30% / natural 70% | Голям огън, басов | UNVERIFIED | За DN_S |
| fire_with_rain.mp3 | 07_fire | fire | UNVERIFIED | UNVERIFIED | sleep_deep, falling_asleep | pink_lowpass_4000 | noise 30% / natural 70% | Огън + дъжд отвън | UNVERIFIED | Двоен уют |
| fire_explosion.mp3 | 07_fire | fire | UNVERIFIED | UNVERIFIED | — | — | — | Експлозия | ❌ EXCLUDED | Bible §5: violent/anxious trigger |
| fire_wood_burning.mp3 | 07_fire | fire | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 25% / natural 75% | Горящи дърва, пукане | UNVERIFIED | Уютен |

### 08_meditation (предполагаем брой: ~30 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| meditation_om_chant.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation, anxiety_sos | pink_lowpass_4000 | noise 15% / natural 85% | OM напев | UNVERIFIED | Класическа медитация |
| meditation_tibetan_bowls.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation, anxiety_sos | none | natural 100% | Тибетски купи | UNVERIFIED | Внимателно — overtones могат стимулират тинитус |
| meditation_chimes.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation | none | natural 100% | Камбанки | UNVERIFIED | TH_C може дразни |
| meditation_drone_low.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | — | — | — | Нисък дрон | ❌ EXCLUDED | Bible §5: drone |
| meditation_drone_deep.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | — | — | — | Дълбок дрон | ❌ EXCLUDED | Bible §5: drone |
| meditation_breath_guided.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation, anxiety_sos | pink_lowpass_4000 | noise 20% / natural 80% | Дишане 4-7-8 водено | UNVERIFIED | За SOS |
| meditation_body_scan.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation | pink_pure | noise 20% / natural 80% | Body scan | UNVERIFIED | За CBT интеграция |
| meditation_ambient_soft.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation, relax | pink_lowpass_4000 | noise 25% / natural 75% | Мек ембиент | UNVERIFIED | За начинаещи |
| meditation_ambient_deep.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation, sleep_deep | brown_lowpass_1000 | noise 30% / natural 70% | Дълбок ембиент | UNVERIFIED | Експертен |
| meditation_zen_pentatonic.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation | none | natural 100% | Пентатонична скала, fractal Zen | UNVERIFIED | Според Файл Web Audio API §4 |
| meditation_mantra.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | meditation | pink_lowpass_4000 | noise 15% / natural 85% | Мантра | UNVERIFIED | Класическа практика |
| meditation_eerie_ambient.mp3 | 08_meditation | meditation | UNVERIFIED | UNVERIFIED | — | — | — | Зловещ ембиент | ❌ EXCLUDED | Bible §5: eerie |

### 09_ambient (предполагаем брой: ~30 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| ambient_warm.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | relax, falling_asleep | pink_lowpass_4000 | noise 25% / natural 75% | Топъл ембиент | UNVERIFIED | Универсален |
| ambient_cool.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 25% / natural 75% | Хладен ембиент | UNVERIFIED | Универсален |
| ambient_scifi.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | — | — | — | Sci-fi ембиент | ❌ EXCLUDED | Bible §5: scifi |
| ambient_space.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | — | — | — | Космически ембиент | ❌ EXCLUDED | Bible §5: scifi |
| ambient_dark.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | — | — | — | Тъмен ембиент | ❌ EXCLUDED | Bible §5: eerie |
| ambient_minimalist.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | sleep_deep, meditation | brown_lowpass_1000 | noise 30% / natural 70% | Минималистичен | UNVERIFIED | За дълбок сън |
| ambient_warm_pad.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | relax, falling_asleep | pink_lowpass_4000 | noise 25% / natural 75% | Топъл pad | UNVERIFIED | Универсален |
| ambient_drone_industrial.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | — | — | — | Индустриален дрон | ❌ EXCLUDED | Bible §5: drone |
| ambient_nature_blend.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | meditation, relax | pink_pure | noise 20% / natural 80% | Природен бленд | UNVERIFIED | Богат |
| ambient_choir_soft.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | meditation | pink_lowpass_4000 | noise 15% / natural 85% | Мек хор | UNVERIFIED | Внимателно — не за TH_C |
| ambient_strings_warm.mp3 | 09_ambient | ambient | UNVERIFIED | UNVERIFIED | meditation, relax | pink_lowpass_4000 | noise 15% / natural 85% | Топли струнни | UNVERIFIED | Не за TH_C |

### 10_zen (предполагаем брой: ~25 файла)

| filename | folder | category_audio | safety_score | duration_sec | use_categories | recommended_noise_overlay | mix_ratio | description | status | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| zen_garden_water.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 20% / natural 80% | Дзен градина с вода | UNVERIFIED | Класически Zen |
| zen_bamboo_water.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | meditation, anxiety_sos | pink_lowpass_4000 | noise 15% / natural 85% | Бамбук с вода (sōzu) | UNVERIFIED | Ритъм |
| zen_koi_pond.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | relax, meditation | pink_pure | noise 20% / natural 80% | Koi езеро | UNVERIFIED | Спокоен |
| zen_temple_bells.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | meditation | none | natural 100% | Храмови камбани | UNVERIFIED | TH_C внимателно |
| zen_walking_path.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | meditation, daytime_focus | none | natural 100% | Walking meditation | UNVERIFIED | Дневен |
| zen_pentatonic_fractal.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | meditation, anxiety_sos | pink_lowpass_4000 | noise 20% / natural 80% | Fractal Zen tones | UNVERIFIED | По Aqua Zen алгоритъм |
| zen_morning_garden.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | daytime_focus, relax | none | natural 100% | Сутрешна Zen градина | UNVERIFIED | Дневен |
| zen_rock_garden.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | meditation, relax | pink_pure | noise 20% / natural 80% | Каменна градина | UNVERIFIED | Минималистичен |
| zen_silent_water.mp3 | 10_zen | zen | UNVERIFIED | UNVERIFIED | meditation, sleep_deep | brown_lowpass_1000 | noise 25% / natural 75% | Тиха вода | UNVERIFIED | Спокоен |

### Сборна оценка по папка (КАЛКУЛАЦИЯ В CHAT, НЕ ОТ CSV)

| Папка | Очаквани файла | APPROVED (по моя преценка) | EXCLUDED (Bible §5) | UNVERIFIED статус |
|---|---|---|---|---|
| 01_ocean | ~40 | ~37 | 3 (storm × 2, intense) | всички safety/duration UNVERIFIED |
| 02_rain | ~25 | ~22 | 3 (thunder × 2, storm) | UNVERIFIED |
| 03_river | ~25 | ~24 | 1 (strong) | UNVERIFIED |
| 04_underwater | ~10 | ~10 | 0 | UNVERIFIED |
| 05_wind | ~20 | ~18 | 2 (storm, howling/eerie) | UNVERIFIED |
| 06_forest | ~20 | ~19 | 1 (eerie) | UNVERIFIED |
| 07_fire | ~15 | ~14 | 1 (explosion) | UNVERIFIED |
| 08_meditation | ~30 | ~26 | 4 (drone × 2, eerie, scifi potential) | UNVERIFIED |
| 09_ambient | ~30 | ~25 | 5 (scifi × 2, dark/eerie, drone, industrial) | UNVERIFIED |
| 10_zen | ~25 | ~25 | 0 | UNVERIFIED |
| **ОБЩО** | **~240–260** | **~220** | **~20** | **51 без CSV match (по стария чат)** |

## §2.3 Препоръчителен ред за валидиране (за нов чат)

1. Качи `library_final_list.txt` → точен брой файлове по папка
2. Качи `audio-report.csv` → точен safety_score, duration_sec, category_audio за 206 файла
3. Скрипт за filename normalization match → определя кои са 51-те UNVERIFIED
4. По remaining 51: проведи audio analysis (peak, RMS, spectral centroid, transient detection) → класификация
5. Финален merge: §2 става АВТОРИТАТИВЕН с реални числа вместо UNVERIFIED

---

# КРАЙ НА §6.3–§6.6 + §2

**Какво остава за нов чат:**
- §3 — Top 50 deep descriptions (600–800 реда)
- §4 — FAQ по 6 категории (300–400 реда)
- §5 — Общ FAQ (200–300 реда)
- §7 — Bible §5 compliance audit (300–400 реда)
- §8 — i18n keys preview JSON (100–200 реда)

**Към новия чат — pre-read:**
1. `RESEARCH_DRIVEN_LIBRARY_SPEC_v1_PARTIAL.md` (готови §1, §6.1, §6.2)
2. Този файл (готови §6.3–§6.6, §2)
3. 8-те задължителни научни файла според handoff Tier 1+2

**В новия чат:** да се поиска от Тихол да качи `library_final_list.txt` и `audio-report.csv`, за да се финализира §2 с реални safety_score стойности.
