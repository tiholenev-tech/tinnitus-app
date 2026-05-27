# AURALIS — i18n ключове за Дневник + CBT 14-дневен модул

**Скоуп:** Всички UI текстове за Дневник, Сутрешен/Вечерен въпросник, CBT day екран, THI wrapper, streak freeze, edge case съобщения.
**Език на резултата:** Български (canonical локал — за останалите 11 локала ще се преведе с DeepL Pro и ръчен преглед, Bible v3 §"Локализация").
**Тон:** Bible §1 — "Вие", без emoji, без удивителни > 1, без англицизми, без страх език.
**Структура:** `ключ.за.namespace = превод`.

---

## 1. Navigation / Hub (15 ключа)

```
diary.hub.title = Дневник
diary.hub.subtitle = 14-дневен път към по-спокойни дни
diary.hub.day_counter = Ден {N} от 14
diary.hub.card.morning = Сутрешен дневник
diary.hub.card.morning_subtitle = 3 кратки въпроса · 1 минута
diary.hub.card.evening = Вечерен дневник
diary.hub.card.evening_subtitle = 5 въпроса · 2 минути
diary.hub.card.cbt = Тема на деня
diary.hub.card.cbt_subtitle = 5–10 минути упражнение
diary.hub.status.pending = Все още не е попълнен
diary.hub.status.completed = Попълнен
diary.hub.status.late = Попълнен със закъснение
diary.hub.thi.start = Стартирайте THI въпросника
diary.hub.thi.day14 = Време е за повторно попълване на THI
diary.hub.greeting.morning = Добро утро. Как започвате деня?
diary.hub.greeting.evening = Добър вечер. Време е за отчет на деня.
diary.hub.greeting.night = Тиха нощ. Какво Ви чака сега?
```

---

## 2. Сутрешен дневник — 3 въпроса (12 ключа)

```
morning.title = Сутрешен дневник
morning.intro = Три кратки въпроса за изминалата нощ.

morning.q1.question = Как преценявате качеството на съня си тази нощ?
morning.q1.scale.1 = Много лош сън
morning.q1.scale.2 = Лош
morning.q1.scale.3 = Среден
morning.q1.scale.4 = Добър
morning.q1.scale.5 = Отличен

morning.q2.question = Колко пъти се събуждахте през нощта?
morning.q2.scale.1 = Нито веднъж
morning.q2.scale.2 = Веднъж
morning.q2.scale.3 = Два пъти
morning.q2.scale.4 = Три пъти
morning.q2.scale.5 = Четири или повече пъти

morning.q3.question = Колко натрапчив е тинитусът тази сутрин?
morning.q3.scale.1 = Едва доловим
morning.q3.scale.2 = Слаб
morning.q3.scale.3 = Умерен
morning.q3.scale.4 = Силен
morning.q3.scale.5 = Изключително силен
```

---

## 3. Вечерен дневник — 5 въпроса (28 ключа)

```
evening.title = Вечерен дневник
evening.intro = Пет въпроса за изминалия ден.

evening.q1.question = Колко натрапчив беше тинитусът Ви днес?
evening.q1.scale.1 = Почти не го забелязах
evening.q1.scale.2 = Слаб, лесно се игнорира
evening.q1.scale.3 = Умерен, понякога ми пречеше
evening.q1.scale.4 = Силен, често ми пречеше
evening.q1.scale.5 = Постоянно ме безпокоеше

evening.q2.question = Как се чувствахте емоционално днес?
evening.q2.scale.1 = Силно напрегнат или тревожен
evening.q2.scale.2 = Леко напрегнат
evening.q2.scale.3 = Неутрално
evening.q2.scale.4 = Спокоен
evening.q2.scale.5 = Много спокоен и в баланс

evening.q3.question = Колко добре успяхте да се концентрирате?
evening.q3.scale.1 = Много трудно
evening.q3.scale.2 = С усилие
evening.q3.scale.3 = Средно
evening.q3.scale.4 = Добре
evening.q3.scale.5 = Отлично

evening.q4.question = Колко стресиращ беше денят Ви?
evening.q4.scale.1 = Никакъв стрес
evening.q4.scale.2 = Лек стрес
evening.q4.scale.3 = Умерен стрес
evening.q4.scale.4 = Висок стрес
evening.q4.scale.5 = Изключително стресиращ

evening.q5.question = Колко използвахте звуковата терапия днес?
evening.q5.scale.1 = Не съм слушал нищо
evening.q5.scale.2 = Под 30 минути
evening.q5.scale.3 = 30 минути до 1 час
evening.q5.scale.4 = 1 до 4 часа
evening.q5.scale.5 = Над 4 часа

evening.note.placeholder = По избор: бележка за деня (1 ред)
evening.summary.title = Потвърдете записа за днес
evening.summary.confirm = Да, запиши
evening.summary.edit = Поправи
```

---

## 4. CBT day екран (12 ключа)

```
cbt.title = Тема на деня
cbt.day_label = Ден {N}
cbt.section.theme = Тема
cbt.section.explanation = Защо това е важно
cbt.section.exercise = Упражнение за днес
cbt.section.exercise_duration = 5–10 минути
cbt.section.reflection = Въпрос за вечерта
cbt.button.start = Започнете упражнението
cbt.button.complete = Завърших
cbt.button.skip = Прескочи за днес
cbt.button.repeat = Повтори
cbt.completed_label = Завършено
```

---

## 5. THI въпросник — wrapper (15 ключа)

```
thi.day1.title = Първоначална оценка (THI)
thi.day1.intro = 25 кратки въпроса. Това ще ни помогне да измерим Вашия напредък след 14 дни.
thi.day1.duration = Около 5 минути.
thi.day1.start = Започнете
thi.day1.disclaimer = Това е инструмент за самооценка, не за диагностика. Резултатите няма да напуснат Вашия телефон.

thi.day14.title = Повторна оценка (THI)
thi.day14.intro = Същите въпроси като на Ден 1. Така ще видим как се чувствате сега.
thi.day14.compare = Сравнение с Ден 1
thi.day14.improved = Спад в скора: {diff} точки
thi.day14.same = Резултатът остава близък до първоначалния
thi.day14.worse = Резултатът е малко по-висок от първоначалния

thi.scale.0 = Не
thi.scale.2 = Понякога
thi.scale.4 = Да
thi.progress = Въпрос {current} от {total}
```

---

## 6. Бутони и общи действия (10 ключа)

```
common.save = Запиши
common.continue = Продължете
common.back = Назад
common.cancel = Отказ
common.close = Затвори
common.next = Напред
common.previous = Предишен
common.start = Започнете
common.finish = Завърши
common.try_again = Опитайте отново
```

---

## 7. Streak / Freeze (10 ключа)

```
streak.label = Поредни дни
streak.count = {N} дни поред
streak.freeze_label = Дни на почивка
streak.freeze_available = Налични „дни почивка": {N}
streak.freeze_used_today = Днес използвахте „ден почивка" — стрикът остава непокътнат
streak.encourage_after_break = Добре дошли отново. Започваме от мястото, на което спряхте.
streak.no_punishment = Пропускането на ден не отнема прогрес. AURALIS не наказва.
streak.longest = Най-дълъг период досега: {N} дни
streak.today_active = Днес сте активен
streak.rest_day = Ден на почивка
```

---

## 8. Edge case съобщения (15 ключа)

```
edge.missed_yesterday.title = Вчера не успяхте да попълните дневника
edge.missed_yesterday.body = Това е напълно нормално. Ден {N} Ви чака.
edge.missed_yesterday.fill_late = Попълни Ден {N} със закъснение
edge.missed_yesterday.skip = Прескочи към Ден {N+1}

edge.late_night.title = Не успявате да заспите?
edge.late_night.body = Това е чест момент при тинитус. Какво желаете сега?
edge.late_night.option_sound = Слушай звук за заспиване
edge.late_night.option_breathing = Дихателно упражнение
edge.late_night.option_diary = Попълни вечерен дневник

edge.partial_save.title = Имате незавършен запис
edge.partial_save.body = Прекъснахте на въпрос {N} от {total}. Желаете ли да продължите?
edge.partial_save.continue = Продължи от въпрос {N}
edge.partial_save.restart = Започни отначало
edge.partial_save.keep = Запази както е

edge.locked_module.title = Този модул ще е достъпен утре
edge.locked_module.body = Тази тема работи най-добре, когато оставите време между дните.
```

---

## 9. Червени флагове и насочване към специалист (8 ключа)

```
redflag.high_distress.title = Бихме искали да Ви предложим нещо
redflag.high_distress.body = През последните 3 дни сте отчели висок дистрес. AURALIS е инструмент за общо благополучие, не медицински продукт. Ако се чувствате претоварен, моля разгледайте възможността да говорите с лекар или психотерапевт.
redflag.high_distress.dismiss = Разбрах
redflag.high_distress.helpline_bg = Линия за психологична помощ (БГ): {number}

redflag.when_to_seek.title = Кога да потърся специалист
redflag.when_to_seek.unilateral = Тинитусът е само в едното ухо
redflag.when_to_seek.pulsing = Шумът пулсира със сърдечния ритъм
redflag.when_to_seek.sudden = Внезапна загуба на слуха през последните дни
```

---

## 10. Експорт / Импорт / Privacy (8 ключа)

```
export.title = Експорт на дневник
export.body = Запазете записите си като файл, който можете да изпратите по имейл или да съхраните локално.
export.button = Експортирай
export.success = Файлът е готов
export.note = Файлът остава на Вашия телефон. AURALIS не изпраща нищо на сървър.

import.title = Импорт на стар дневник
import.button = Изберете файл
import.success = Записите са възстановени
```

---

## 11. Empty states / Loading (6 ключа)

```
empty.no_entries_yet = Все още няма записи. Започнете с първия си ден.
empty.no_thi_yet = Все още не сте попълнили THI въпросника.
loading.diary = Зарежда дневника...
loading.thi = Зарежда въпросника...
error.save_failed = Записът не успя. Опитайте отново.
error.invalid_input = Моля попълнете всички въпроси, за да продължите.
```

---

## 12. Accessibility — aria-labels (10 ключа)

```
a11y.slider.morning_q1 = Качество на съня от 1 до 5
a11y.slider.morning_q2 = Брой събуждания от 1 до 5
a11y.slider.morning_q3 = Сила на тинитуса сутрин от 1 до 5
a11y.slider.evening_q1 = Натрапчивост на тинитуса от 1 до 5
a11y.slider.evening_q2 = Емоционално състояние от 1 до 5
a11y.slider.evening_q3 = Концентрация от 1 до 5
a11y.slider.evening_q4 = Ниво на стрес от 1 до 5
a11y.slider.evening_q5 = Използване на звукова терапия от 1 до 5
a11y.button.complete_cbt = Маркирай днешното CBT упражнение като завършено
a11y.icon.streak = Брояч на поредните дни
```

---

## 13. Wellness disclaimer (4 ключа)

```
disclaimer.short = AURALIS е инструмент за общо благополучие, не медицински продукт.
disclaimer.no_diagnosis = Това приложение не диагностицира, не лекува и не замества консултация с лекар.
disclaimer.local_only = Всички Ваши данни остават на Вашия телефон.
disclaimer.results_vary = Индивидуалните резултати винаги варират.
```

---

## 14. Дни на седмицата (за чарт/история) (7 ключа)

```
weekday.mon = Пон
weekday.tue = Вт
weekday.wed = Ср
weekday.thu = Чет
weekday.fri = Пет
weekday.sat = Съб
weekday.sun = Нед
```

---

## Обща статистика

| Категория | Ключове |
|---|---|
| Navigation / Hub | 17 |
| Сутрешен дневник | 18 |
| Вечерен дневник | 30 |
| CBT day екран | 13 |
| THI wrapper | 15 |
| Общи бутони | 10 |
| Streak / Freeze | 10 |
| Edge case съобщения | 15 |
| Червени флагове | 8 |
| Експорт / Импорт | 8 |
| Empty states | 6 |
| Accessibility | 10 |
| Wellness disclaimer | 4 |
| Дни на седмицата | 7 |
| **Общо** | **171** |

---

## Бележки за превод на 12-те езика

1. **DeepL Pro качество за БГ → EN, DE, FR, ES, PT, IT:** 88–95% (Bible v3 §"Локализация").
2. **Манекенско ревю задължително за:** медицински термини (тинитус, дистрес, хабитуация), скални labels (нюансите 1–5 често се губят при автоматичен превод).
3. **RTL за арабски:** проверете че плъзгачите 1–5 не объркват посоката.
4. **Дължини за JA/KO/ZH:** Labels „Изключително силен" могат да станат 2-3 символа в CJK — flex layout трябва да издържи.
5. **„Вие" еквивалент:** За EN използваме просто "you" (естествено уважително). За DE — "Sie". За RU — "Вы" (с главно В). За FR — "vous". За JA — учтива форма "ます/です".

---

**Източници:**
- `docs/canon/AURALIS_DESIGN_CANON_v1.md` §6 — текстови правила, "Вие", без emoji.
- `docs/bibles/AURALIS_BIBLE_v3_PIVOT.md` — Локализация workflow, 12 езика launch.
- `docs/research/07-cbt-2-weeks-protocol.md` — 5-показателен дневен мониторинг (VAS дистрес, VAS сила, селективно внимание, сън, придържане).

**Версия:** 1.0 · 25.05.2026
