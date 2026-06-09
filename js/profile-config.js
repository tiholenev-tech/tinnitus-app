/**
 * AURALIS ProfileConfig — single source of truth за mix / volume / noise
 * ===========================================================================
 * 5 ПРОФИЛА × 6 SCENARIOS × 2 ВРЕМЕНА = 60 конфигурации.
 * Всички жестoк-coded — нула изчисляване в runtime.
 *
 * Източник: AURALIS_PROFILE_ADVICE_v1.md (Opus validated).
 *
 * Public API:
 *   ProfileConfig.getMix(profile, scenario)            → [l1, l2] (0..1)
 *   ProfileConfig.getTargetVolume(profile, scenario, isNight) → 0..100
 *   ProfileConfig.getRecommendedNoise(profile)         → noise id
 *   ProfileConfig.getRevealTiming(profile)             → { layer1FadeSec, layer2DelaySec, layer2FadeSec }
 *   ProfileConfig.isNight()                            → bool (22:00–07:00)
 *   ProfileConfig.applyForSound(sound, soundId?)       → resolves профил → applies
 *
 * User overrides са в AppState.userOverrides[soundId].
 */

window.ProfileConfig = (function () {
  'use strict';

  // ============================================================
  // MIX MATRIX — [Layer1 ratio, Layer2 ratio] (0..1)
  // ============================================================
  var MIX_MATRIX = {
    // Тонален високочестотен / Когнитивен — главен звук доминантен
    'TH_C': {
      'sleep_deep':     [0.65, 0.35],
      'falling_asleep': [0.70, 0.30],
      'relaxation':     [0.70, 0.30],
      'daily':          [0.70, 0.30],
      'anxiety':        [0.40, 0.60],
      'meditation':     [0.70, 0.30]
    },
    // Нискочестотен / Сън — фонът терапевтично активен
    'DN_S': {
      'sleep_deep':     [0.40, 0.60],
      'falling_asleep': [0.45, 0.55],
      'relaxation':     [0.50, 0.50],
      'daily':          [0.55, 0.45],
      'anxiety':        [0.30, 0.70],
      'meditation':     [0.50, 0.50]
    },
    // Стрес-реактивен — балансиран, SOS noise-dominant
    'SS_R': {
      'sleep_deep':     [0.40, 0.60],
      'falling_asleep': [0.45, 0.55],
      'relaxation':     [0.50, 0.50],
      'daily':          [0.50, 0.50],
      'anxiety':        [0.30, 0.70], // SOS режим
      'meditation':     [0.50, 0.50]
    },
    // Соматичен / Флуктуиращ — динамика на природен звук ангажира внимание
    'SM_F': {
      'sleep_deep':     [0.75, 0.25],
      'falling_asleep': [0.80, 0.20],
      'relaxation':     [0.85, 0.15],
      'daily':          [0.85, 0.15],
      'anxiety':        [0.50, 0.50],
      'meditation':     [0.85, 0.15]
    },
    // Адаптиран / Лек — звукът едва доловим, носещият доминира напълно
    'HB_M': {
      'sleep_deep':     [0.85, 0.15],
      'falling_asleep': [0.90, 0.10],
      'relaxation':     [0.92, 0.08],
      'daily':          [0.95, 0.05],
      'anxiety':        [0.60, 0.40],
      'meditation':     [0.92, 0.08]
    }
  };

  // ============================================================
  // VOLUME MATRIX — target master volume (0..100) per profile × time × scenario
  // ============================================================
  var VOLUME_MATRIX = {
    'TH_C': {
      day:   { sleep_deep: 35, falling_asleep: 40, relaxation: 50, daily: 55, anxiety: 45, meditation: 50 },
      night: { sleep_deep: 30, falling_asleep: 35, relaxation: 40, daily: 45, anxiety: 40, meditation: 40 }
    },
    'DN_S': {
      day:   { sleep_deep: 40, falling_asleep: 45, relaxation: 55, daily: 60, anxiety: 50, meditation: 55 },
      night: { sleep_deep: 35, falling_asleep: 40, relaxation: 45, daily: 50, anxiety: 45, meditation: 45 }
    },
    'SS_R': {
      day:   { sleep_deep: 40, falling_asleep: 45, relaxation: 50, daily: 55, anxiety: 50, meditation: 50 },
      night: { sleep_deep: 35, falling_asleep: 40, relaxation: 45, daily: 50, anxiety: 45, meditation: 45 }
    },
    'SM_F': {
      day:   { sleep_deep: 45, falling_asleep: 50, relaxation: 60, daily: 65, anxiety: 55, meditation: 60 },
      night: { sleep_deep: 40, falling_asleep: 45, relaxation: 50, daily: 55, anxiety: 50, meditation: 50 }
    },
    'HB_M': {
      day:   { sleep_deep: 50, falling_asleep: 55, relaxation: 65, daily: 70, anxiety: 60, meditation: 65 },
      night: { sleep_deep: 45, falling_asleep: 50, relaxation: 55, daily: 60, anxiety: 55, meditation: 55 }
    }
  };

  // ============================================================
  // NOISE per profile
  // ============================================================
  var NOISE_BY_PROFILE = {
    'TH_C': 'pink_lp4000',
    'DN_S': 'brown_lp500',
    'SS_R': 'brown_lp500',
    'SM_F': 'brown_lp1000',
    'HB_M': 'brown_lp500'
  };

  // SCENARIO override на profile noise.
  // Phone test fix: преди това NOISE_BY_SCENARIO['meditation']='none' махаше
  // фоновия шум за ВСЕКИ sound където scenario picker избираше 'meditation'
  // (например rain sound с categories_use=['meditation','relaxation'] → не
  // съдържа anxiety/sleep_deep/falling_asleep → priority loop спира на
  // 'meditation' → noise=none за rain). Грешно.
  //
  // Сега единственият arbiter за "no noise" е sound.category_audio === 'meditation'
  // (виж resolveFor override по-долу). Това е истинският критерий — meditation
  // music файлове (08_meditation/ folder). Scenario priority вече не влияе.
  var NOISE_BY_SCENARIO = {};

  // ============================================================
  // SEQUENTIAL REVEAL timing — Layer 1 → wait → Layer 2 fade-in
  // ============================================================
  var REVEAL_TIMING = {
    // HB_M / SM_F: шумът е тих → reveal-ът на L2 може да е по-кратък
    'HB_M':   { layer1FadeSec: 2.0, layer2DelaySec: 3.5, layer2FadeSec: 3.0 },
    'SM_F':   { layer1FadeSec: 2.0, layer2DelaySec: 3.5, layer2FadeSec: 3.0 },
    // TH_C / DN_S / SS_R: фоновият шум е терапевтично важен → по-дълъг reveal
    'default':{ layer1FadeSec: 2.5, layer2DelaySec: 2.5, layer2FadeSec: 4.0 }
  };

  var DEFAULT_PROFILE = 'SS_R';
  var DEFAULT_SCENARIO = 'relaxation';

  // ============================================================
  // Resolvers
  // ============================================================

  function resolveProfile(profile) {
    if (profile && MIX_MATRIX[profile]) return profile;
    return DEFAULT_PROFILE;
  }

  function resolveScenario(scenario, profile) {
    var p = MIX_MATRIX[profile];
    if (p && scenario && p[scenario]) return scenario;
    return DEFAULT_SCENARIO;
  }

  function getMix(profile, scenario) {
    var p = resolveProfile(profile);
    var s = resolveScenario(scenario, p);
    return MIX_MATRIX[p][s];
  }

  function getTargetVolume(profile, scenario, isNightFlag) {
    var p = resolveProfile(profile);
    var s = resolveScenario(scenario, p);
    var time = isNightFlag ? 'night' : 'day';
    var tab = VOLUME_MATRIX[p][time];
    return (typeof tab[s] === 'number') ? tab[s] : tab[DEFAULT_SCENARIO];
  }

  function getRecommendedNoise(profile, scenario) {
    // Scenario override — например meditation = 'none' (без фон).
    if (scenario && Object.prototype.hasOwnProperty.call(NOISE_BY_SCENARIO, scenario)) {
      return NOISE_BY_SCENARIO[scenario];
    }
    var p = resolveProfile(profile);
    return NOISE_BY_PROFILE[p];
  }

  function getRevealTiming(profile) {
    var p = resolveProfile(profile);
    return REVEAL_TIMING[p] || REVEAL_TIMING['default'];
  }

  function isNight() {
    var hour = new Date().getHours();
    return hour >= 22 || hour < 7;
  }

  // ============================================================
  // High-level: resolve scenario от sound + apply user override
  // ============================================================

  function pickScenarioFromSound(sound) {
    if (!sound) return DEFAULT_SCENARIO;
    var cats = sound.categories_use;
    if (Array.isArray(cats) && cats.length > 0) {
      // Priority: anxiety > sleep_deep > falling_asleep > meditation > relaxation > daily
      var PRIORITY = ['anxiety', 'sleep_deep', 'falling_asleep', 'meditation', 'relaxation', 'daily'];
      for (var i = 0; i < PRIORITY.length; i++) {
        if (cats.indexOf(PRIORITY[i]) !== -1) return PRIORITY[i];
      }
      return cats[0];
    }
    return DEFAULT_SCENARIO;
  }

  function getUserOverride(soundId) {
    if (!soundId) return null;
    var s = window.AppState;
    if (!s || !s.userOverrides) return null;
    return s.userOverrides[soundId] || null;
  }

  function setUserOverride(soundId, layer1Vol, layer2Vol, masterVol) {
    if (!soundId) return;
    var s = window.AppState;
    if (!s) return;
    if (!s.userOverrides) s.userOverrides = {};
    s.userOverrides[soundId] = {
      l1: Math.round(layer1Vol),
      l2: Math.round(layer2Vol),
      master: Math.round(masterVol),
      ts: Date.now()
    };
    if (s.saveUserOverrides) s.saveUserOverrides();
  }

  // „Върни настройките" (Player reset button): трие user override-а за този
  // звук → resolveFor пада обратно на матричните (оригинални) стойности.
  // Връща true ако е имало override за триене (за да реши викащият дали да
  // покаже toast/haptic).
  function clearUserOverride(soundId) {
    if (!soundId) return false;
    var s = window.AppState;
    if (!s || !s.userOverrides) return false;
    if (!Object.prototype.hasOwnProperty.call(s.userOverrides, soundId)) return false;
    delete s.userOverrides[soundId];
    if (s.saveUserOverrides) s.saveUserOverrides();
    return true;
  }

  // Resolve effective config за конкретен sound. User override > Profile matrix.
  function resolveFor(sound, soundId) {
    var s = window.AppState || {};
    var profile = resolveProfile(s.profile);
    var scenario = pickScenarioFromSound(sound);
    var night = isNight();

    var mix = getMix(profile, scenario);
    var targetVol = getTargetVolume(profile, scenario, night);
    var noise = getRecommendedNoise(profile, scenario);
    var reveal = getRevealTiming(profile);

    // Phone test: "медитации които са МУЗИКА — да се махне фоновия шум".
    // category_audio === 'meditation' = singing bowls, gongs, chants, instrumental.
    // Тези sounds не трябва да имат brown/pink noise overlay — независимо от
    // scenario priority (sound може да има 'sleep_deep' преди 'meditation' в
    // categories_use → scenario='sleep_deep' → но е still meditation music).
    if (sound && sound.category_audio === 'meditation') {
      noise = 'none';
    }

    var override = getUserOverride(soundId || (sound && sound.id));
    if (override) {
      return {
        profile: profile,
        scenario: scenario,
        isNight: night,
        layer1Vol: override.l1,
        layer2Vol: override.l2,
        masterVol: override.master,
        noise: noise,
        reveal: reveal,
        fromOverride: true
      };
    }

    return {
      profile: profile,
      scenario: scenario,
      isNight: night,
      layer1Vol: Math.round(mix[0] * 100),
      layer2Vol: Math.round(mix[1] * 100),
      masterVol: targetVol,
      noise: noise,
      reveal: reveal,
      fromOverride: false
    };
  }

  return {
    getMix: getMix,
    getTargetVolume: getTargetVolume,
    getRecommendedNoise: getRecommendedNoise,
    getRevealTiming: getRevealTiming,
    isNight: isNight,
    pickScenarioFromSound: pickScenarioFromSound,
    resolveFor: resolveFor,
    getUserOverride: getUserOverride,
    setUserOverride: setUserOverride,
    clearUserOverride: clearUserOverride,
    // Expose matrices за тестове / Settings debug
    _MIX_MATRIX: MIX_MATRIX,
    _VOLUME_MATRIX: VOLUME_MATRIX
  };
})();
