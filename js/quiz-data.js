// AURALIS Quiz Data — 15 въпроса в 4 категории
// Извлечено директно от docs/research/01-quiz-15-questions-validated.md
// Тон: уважителен ("Вие"). Формулировки адаптирани от оригинала (от "ти" към "Вие").
//
// Профил тегла:
//   TH_C = Тонален високочестотен / Когнитивен
//   DN_S = Шумов нискочестотен / Сън
//   SS_R = Стрес-чувствителен / Реактивен
//   SM_F = Соматичен / Флуктуиращ
//   HB_M = Адаптиран / Лек
//
// DI (Distress Index) — само въпроси 10-12.

window.QUIZ_QUESTIONS = [
  // -------------------------------------------------- Категория 1: Профил на тинитуса
  {
    id: 1,
    category: 'profile',
    question: 'Какъв звук чувате?',
    options: [
      { key: 'a', label: 'Звънене (висок тон)',         weights: { TH_C: 3 } },
      { key: 'b', label: 'Бръмчене (нисък тон)',         weights: { DN_S: 3 } },
      { key: 'c', label: 'Съскане (като пара)',          weights: { DN_S: 2, TH_C: 1 } },
      { key: 'd', label: 'Пулсиращ',                     weights: { SM_F: 3 } },
      { key: 'e', label: 'Друг / не съм сигурен/а',      weights: { SM_F: 1, HB_M: 1 } }
    ]
  },
  {
    id: 2,
    category: 'profile',
    question: 'Каква е височината на звука?',
    options: [
      { key: 'a', label: 'Висок (като свирка)',          weights: { TH_C: 3 } },
      { key: 'b', label: 'Среден (като комар)',          weights: { TH_C: 1, SM_F: 1 } },
      { key: 'c', label: 'Нисък (като бучене)',          weights: { DN_S: 3 } },
      { key: 'd', label: 'Не съм сигурен/а',             weights: { SM_F: 1, HB_M: 1 } }
    ]
  },
  {
    id: 3,
    category: 'profile',
    question: 'В кое ухо го чувате?',
    options: [
      { key: 'a', label: 'Само в лявото',                weights: { SM_F: 1, TH_C: 1 } },
      { key: 'b', label: 'Само в дясното',               weights: { SM_F: 1, TH_C: 1 } },
      { key: 'c', label: 'И в двете',                    weights: { DN_S: 1, HB_M: 1 } },
      { key: 'd', label: 'В главата (не от ушите)',      weights: { SS_R: 2, TH_C: 1 } }
    ]
  },
  {
    id: 4,
    category: 'profile',
    question: 'Кога чувате звука?',
    options: [
      { key: 'a', label: 'Постоянно',                    weights: { TH_C: 2, DN_S: 2 } },
      { key: 'b', label: 'Идва и си отива',              weights: { SM_F: 3 } },
      { key: 'c', label: 'Само в тишина',                weights: { HB_M: 3 } },
      { key: 'd', label: 'Само вечер',                   weights: { DN_S: 2, SS_R: 1 } }
    ]
  },
  {
    id: 5,
    category: 'profile',
    question: 'Кога е НАЙ-СИЛЕН?',
    options: [
      { key: 'a', label: 'Сутрин',                       weights: { SS_R: 2, SM_F: 1 } },
      { key: 'b', label: 'През деня',                    weights: { TH_C: 3 } },
      { key: 'c', label: 'Вечер',                        weights: { SS_R: 2, HB_M: 1 } },
      { key: 'd', label: 'През нощта',                   weights: { DN_S: 3 } },
      { key: 'e', label: 'Без значение',                 weights: { TH_C: 1, DN_S: 1, SS_R: 1 } }
    ]
  },

  // -------------------------------------------------- Категория 2: История
  {
    id: 6,
    category: 'history',
    question: 'Откога имате тинитус?',
    options: [
      { key: 'a', label: 'По-малко от 6 месеца',         weights: { SS_R: 2, HB_M: 1 } },
      { key: 'b', label: '6 месеца – 2 години',          weights: { SM_F: 1, TH_C: 1 } },
      { key: 'c', label: '2 – 5 години',                 weights: { DN_S: 1, TH_C: 1 } },
      { key: 'd', label: 'Повече от 5 години',           weights: { TH_C: 2, HB_M: 1 } }
    ]
  },
  {
    id: 7,
    category: 'history',
    question: 'Имало ли е силен звук преди появата?',
    options: [
      { key: 'a', label: 'Концерт / силна музика',       weights: { TH_C: 2 } },
      { key: 'b', label: 'Експлозия / стрелба',          weights: { TH_C: 3 } },
      { key: 'c', label: 'Работа в шумна среда',         weights: { TH_C: 2 } },
      { key: 'd', label: 'Не помня нищо специално',      weights: { HB_M: 2 } }
    ]
  },
  {
    id: 8,
    category: 'history',
    question: 'Имате ли загуба на слуха?',
    options: [
      { key: 'a', label: 'Да, явно',                     weights: { TH_C: 2 } },
      { key: 'b', label: 'Може би леко',                 weights: { HB_M: 1, TH_C: 1 } },
      { key: 'c', label: 'Не',                           weights: { SS_R: 1, SM_F: 1 } },
      { key: 'd', label: 'Не съм проверявал/а',          weights: { HB_M: 1 } }
    ]
  },
  {
    id: 9,
    category: 'history',
    question: 'Имате ли други състояния? (само информативно)',
    options: [
      { key: 'a', label: 'Високо кръвно',                weights: { SM_F: 2 } },
      { key: 'b', label: 'Диабет',                       weights: { SM_F: 1 } },
      { key: 'c', label: 'Тревожност / стрес',           weights: { SS_R: 3 } },
      { key: 'd', label: 'Нищо особено',                 weights: { HB_M: 2 } },
      { key: 'e', label: 'Не искам да отговарям',        weights: { HB_M: 1 } }
    ]
  },

  // -------------------------------------------------- Категория 3: Влияние върху живота (DI)
  {
    id: 10,
    category: 'impact',
    question: 'Колко силно тинитусът влияе на съня Ви?',
    options: [
      { key: 'a', label: 'Изобщо',                       weights: { HB_M: 3 },                 di: 0 },
      { key: 'b', label: 'Малко',                        weights: { SS_R: 1, DN_S: 1 },        di: 2 },
      { key: 'c', label: 'Доста',                        weights: { DN_S: 2 },                 di: 4 },
      { key: 'd', label: 'Не мога да спя',               weights: { DN_S: 3, SS_R: 1 },        di: 6 }
    ]
  },
  {
    id: 11,
    category: 'impact',
    question: 'Колко силно влияе на концентрацията Ви?',
    options: [
      { key: 'a', label: 'Изобщо',                       weights: { HB_M: 3 },                 di: 0 },
      { key: 'b', label: 'Малко',                        weights: { SM_F: 1 },                 di: 2 },
      { key: 'c', label: 'Доста',                        weights: { TH_C: 2 },                 di: 4 },
      { key: 'd', label: 'Не мога да се фокусирам',      weights: { TH_C: 3, SS_R: 1 },        di: 6 }
    ]
  },
  {
    id: 12,
    category: 'impact',
    question: 'Колко е стресиращ за Вас (0-10)?',
    options: [
      { key: 'a', label: '0 – 2 (минимален стрес)',      weights: { HB_M: 3 },                 di: 0 },
      { key: 'b', label: '3 – 5 (лек до умерен стрес)',  weights: { SM_F: 1, TH_C: 1 },        di: 3 },
      { key: 'c', label: '6 – 8 (силен стрес)',          weights: { SS_R: 2 },                 di: 6 },
      { key: 'd', label: '9 – 10 (непоносим стрес)',     weights: { SS_R: 3, TH_C: 1 },        di: 8 }
    ]
  },

  // -------------------------------------------------- Категория 4: Текущи стратегии
  {
    id: 13,
    category: 'strategies',
    question: 'Какво сте опитвали досега?',
    options: [
      { key: 'a', label: 'Лекарства',                    weights: { SS_R: 1 } },
      { key: 'b', label: 'Слухови апарати',              weights: { TH_C: 2 } },
      { key: 'c', label: 'Звукова терапия',              weights: { DN_S: 2 } },
      { key: 'd', label: 'Медитация',                    weights: { SS_R: 2 } },
      { key: 'e', label: 'Нищо още',                     weights: { HB_M: 2 } }
    ]
  },
  {
    id: 14,
    category: 'strategies',
    question: 'Какво Ви помага най-много?',
    options: [
      { key: 'a', label: 'Тишина',                       weights: { SS_R: 2 } },
      { key: 'b', label: 'Слаб шум',                     weights: { HB_M: 2, SM_F: 1 } },
      { key: 'c', label: 'Силен шум',                    weights: { DN_S: 3 } },
      { key: 'd', label: 'Природа',                      weights: { HB_M: 1, SM_F: 1 } },
      { key: 'e', label: 'Нищо не помага',               weights: { SS_R: 2, TH_C: 1 } }
    ]
  },
  {
    id: 15,
    category: 'strategies',
    question: 'Какво очаквате от приложението?',
    options: [
      // тегла + tie-breaker мапинг (всеки отговор сочи към един основен профил)
      { key: 'a', label: 'По-добър сън',                 weights: { DN_S: 3 }, tieBreaker: 'DN_S' },
      { key: 'b', label: 'Маскиране на шума',            weights: { TH_C: 3 }, tieBreaker: 'TH_C' },
      { key: 'c', label: 'По-малко стрес',               weights: { SS_R: 3 }, tieBreaker: 'SS_R' },
      { key: 'd', label: 'Дълготрайна промяна',          weights: { HB_M: 3 }, tieBreaker: 'HB_M' }
    ]
  }
];

// -------------------------------------------------- Профили

window.QUIZ_PROFILES = {
  TH_C: {
    code: 'TH_C',
    shortName: 'Тонален високочестотен',
    fullName: 'Тонален високочестотен / Когнитивен',
    description:
      'Този профил включва субективно усещане за висок, пищящ и тонален тинитус, ' +
      'който оказва сериозно влияние върху когнитивните процеси и ежедневната концентрация. ' +
      'При него се препоръчват високочестотни звуци като филтриран дъжд и балансиран розов шум, ' +
      'настроени близо до точката на смесване, за да улеснят хабитуацията на ниво мозъчна кора.',
    recommendedMixes: [
      'tonal_comfort_rain',
      'focus_brown_noise',
      'enriched_pink_noise',
      'alpine_river_organic'
    ]
  },
  DN_S: {
    code: 'DN_S',
    shortName: 'Шумов нискочестотен',
    fullName: 'Шумов нискочестотен / Сън',
    description:
      'Профил, дефиниран от наличието на плътни, нискочестотни звуци и сериозни проблеми ' +
      'със заспиването или поддържането на съня. При него водещи са по-дълбоките акустични ' +
      'среди (кафяв шум, плътни водопади), които силно маскират субективното бучене и ' +
      'успокояват ума вечер, подпомагайки плавния и здравословен преход към сън.',
    recommendedMixes: [
      'deep_sleep_brown',
      'heavy_rain_waterfall',
      'mountain_stream_pink',
      'waterfall_heavy_mask'
    ]
  },
  SS_R: {
    code: 'SS_R',
    shortName: 'Стрес-чувствителен',
    fullName: 'Стрес-чувствителен / Реактивен',
    description:
      'При този профил възприятието на тинитус е силно свързано с активността на ' +
      'вегетативната нервна система и лимбичната структура. Дори леки звукови дразнители ' +
      'или ежедневен стрес засилват усещането за шум. Акустичният отговор изисква ' +
      'терапевтичен зелен шум и изключително нежни природни блендове за намаляване на ' +
      'кортикалната възбудимост.',
    recommendedMixes: [
      'green_anxiety_relief',
      'crisis_green_ambient',
      'calming_ocean_waves',
      'meditative_green_flow'
    ]
  },
  SM_F: {
    code: 'SM_F',
    shortName: 'Соматичен / Флуктуиращ',
    fullName: 'Соматичен / Флуктуиращ',
    description:
      'Профил, съответстващ на тинитус с променлива сила и честота, често проявяващ се ' +
      'на цикли или силно свързан с физическо напрежение във врата и челюстта. Използват се ' +
      'силно динамични и непериодични природни среди, като океански приливи и отливи, които ' +
      'ангажират слуховия апарат без риск от привикване към статичен сигнал.',
    recommendedMixes: [
      'ocean_pulse_modulated',
      'modulated_ocean_breeze',
      'binaural_ambient_relaxation',
      'somatic_deep_release'
    ]
  },
  HB_M: {
    code: 'HB_M',
    shortName: 'Адаптиран / Лек',
    fullName: 'Адаптиран / Лек',
    description:
      'Този профил показва високо ниво на естествено привикване. Шумът се чува предимно в ' +
      'условия на абсолютна тишина и няма съществено влияние върху качеството на живот. ' +
      'Акустичната препоръка цели единствено обогатяване на тихата среда с минимални природни ' +
      'звуци за дългосрочно предотвратяване на сензорния контраст.',
    recommendedMixes: [
      'nature_whisper_leaves',
      'soft_summer_rain',
      'nature_summer_wind',
      'rain_behind_window'
    ]
  }
};
