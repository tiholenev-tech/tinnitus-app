/**
 * AURALIS PitchTest — pitch matching test (Phase 1)
 * ============================================================================
 * Намира централната честота на тиналисния тон чрез 2AFC bayesian narrowing
 * (12 frequencies, 1000–12700 Hz, ~log spacing на 4 тона/octave).
 *
 * Phase 1 = САМО първи pitch test + save в state. Phase 2 (Day 2/3 retest)
 * и Phase 3 (notch filter) са за следваща итерация.
 *
 * Public API:
 *   PitchTest.open()    — entry от calibration flow (routing в app.js)
 *   PitchTest.render()  — router hook
 *
 * State: AppState.pitchTests[] / pitchSkipped / pitchSkipReason / audioDevice.
 *
 * Source: research docs "Клиничен и технологичен рамков протокол за честотно
 *         профилиране" + "Систематичен анализ ... високоточен честотен профилатор".
 */

window.PitchTest = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================

  // 12 frequencies, ~log spacing (4 tones per octave), 1–12.7 kHz.
  var FREQUENCIES = [
    1000, 1259, 1587, 2000, 2520, 3175, 4000,
    5040, 6350, 8000, 10079, 12700
  ];
  var MAX_TRIALS = 8;
  var TONE_DURATION_MS = 2500;   // 2.5s per tone
  var SILENCE_BETWEEN_MS = 1000; // 1s residual inhibition guard
  var TONE_AMPLITUDE = 0.3;      // ≈70 dB SPL relative — safety cap
  var FADE_MS = 50;              // tone fade-in/out (click avoidance)

  // ============================================================
  // STATE (module-scoped)
  // ============================================================

  var phase = 'pretest';  // 'pretest' | 'device_warn' | 'test' | 'octave' | 'post' | 'done'
  var ctx = null;
  var masterGain = null;

  // Test progress
  var trials = [];
  var currentLow = 0;
  var currentHigh = FREQUENCIES.length - 1;
  var trialIndex = 0;
  var pendingChoiceCallback = null;
  var isPlayingTone = false;

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function ensureContext() {
    if (ctx) return ctx;
    // Reuse AudioEngine context ако вече init-нат (за consistency на masterGain).
    if (window.AudioEngine && window.AudioEngine._getContext) {
      var sharedCtx = window.AudioEngine._getContext();
      if (sharedCtx) {
        ctx = sharedCtx;
        // Own gain bus в shared context (тестовите тонове не минават през
        // L1/L2 chains — independent volume control via TONE_AMPLITUDE).
        masterGain = ctx.createGain();
        masterGain.gain.value = 1.0;
        masterGain.connect(ctx.destination);
        return ctx;
      }
    }
    // Fallback own context
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      console.error('[pitch-test] Web Audio API not supported');
      return null;
    }
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  // ============================================================
  // PRE-TEST: tinnitus type screening
  // ============================================================
  // Pitch matching работи САМО за tonal tinnitus. Шумов / pulsing trigger-ат
  // alternative paths (skip + recommend appropriately).

  function buildPretestHtml() {
    return (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Какво чувате най-точно?</h1>' +
          '<p class="pt-subtitle">Опишете звука в главата Ви — това определя ' +
            'дали тестът за честота ще е подходящ за Вас.</p>' +
        '</header>' +

        '<div class="pt-pretest-options">' +
          buildPretestOption('tonal',
            'Чист тон',
            'Като пищене „и-и-и" — постоянна височина') +
          buildPretestOption('noise',
            'Шум',
            'Като „ш-ш-ш" или вода — без определена височина') +
          buildPretestOption('pulsing',
            'Пулсиране',
            'В ритъм със сърдечния пулс') +
          buildPretestOption('other',
            'Друго / Не съм сигурен',
            'Не съответства на горните') +
        '</div>' +
      '</div>'
    );
  }

  function buildPretestOption(value, label, description) {
    return (
      '<button class="pt-option-card" type="button" data-action="pretest" data-value="' + value + '">' +
        '<div class="pt-option-label">' + escapeHtml(label) + '</div>' +
        '<div class="pt-option-desc">' + escapeHtml(description) + '</div>' +
      '</button>'
    );
  }

  function buildSkipMessageHtml(title, body) {
    return (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">' + escapeHtml(title) + '</h1>' +
        '</header>' +
        '<section class="pt-skip-body">' +
          '<p>' + escapeHtml(body) + '</p>' +
        '</section>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="skip-continue">' +
            'Продължете' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function onPretestChoice(value) {
    var s = window.AppState;
    if (value === 'tonal') {
      // Продължи към pitch test (Phase 1B+).
      phase = 'test';
      // Phase 1B/1C/1D не са имплементирани в този commit — placeholder.
      renderPlaceholderTestStart();
      return;
    }
    if (value === 'noise') {
      s.setPitchSkip('noise_type');
      phase = 'done';
      renderSkipMessage(
        'Тестът не е подходящ за шумов тинитус',
        'Pitch matching се прилага за тонален (тип „пищене") тинитус. ' +
        'За шумов тип препоръчваме стандартните noise настройки, които ' +
        'AURALIS избира спрямо Вашия профил.'
      );
      return;
    }
    if (value === 'pulsing') {
      s.setPitchSkip('pulsing');
      phase = 'done';
      renderSkipMessage(
        'Препоръчваме преглед при УНГ специалист',
        'Пулсиращ тинитус (в ритъм със сърдечния пулс) изисква медицинска ' +
        'консултация, тъй като може да има съдов или друг физиологичен ' +
        'произход. Препоръчваме посещение преди да продължите със звукова ' +
        'терапия.'
      );
      return;
    }
    // 'other' / Не съм сигурен
    s.setPitchSkip('other');
    phase = 'done';
    renderSkipMessage(
      'Без тест за честота засега',
      'Можете да направите теста по-късно от Настройки, ако решите. AURALIS ' +
      'ще работи със стандартни настройки за Вашия профил.'
    );
  }

  function renderPlaceholderTestStart() {
    // Phase 1B/1C/1D ще заменят това. За сега — placeholder confirm-екран.
    var app = el('app');
    if (!app) return;
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Тест за честота</h1>' +
          '<p class="pt-subtitle">Тестът ще бъде наличен в следваща версия.</p>' +
        '</header>' +
        '<section class="pt-skip-body">' +
          '<p>Благодарим, че идентифицирахте тиналисния си звук като тонален. ' +
          'Същинският тест с 8 сравнения на тонове е в подготовка.</p>' +
        '</section>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="skip-continue">' +
            'Продължете' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderSkipMessage(title, body) {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildSkipMessageHtml(title, body);
  }

  // ============================================================
  // Click router
  // ============================================================

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'pretest') {
      var value = btn.getAttribute('data-value');
      onPretestChoice(value);
    } else if (action === 'skip-continue') {
      goNext();
    }
  }

  function goNext() {
    // PITCH-1 routing exit: → home (или profile_results ако не е stable post-quiz).
    // Final routing decision взаимстван от calibration flow — pitch_test е после
    // calibration, преди home.
    var s = window.AppState;
    if (s && s.transition) s.transition('home');
    history.replaceState({ phase: 'home' }, '');
    if (window.Home && window.Home.render) window.Home.render();
  }

  // ============================================================
  // Render / open
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    if (phase === 'pretest') {
      app.innerHTML = buildPretestHtml();
    } else if (phase === 'test') {
      renderPlaceholderTestStart();
    }
    app.addEventListener('click', onClick);
  }

  function open() {
    phase = 'pretest';
    trials = [];
    currentLow = 0;
    currentHigh = FREQUENCIES.length - 1;
    trialIndex = 0;
    var s = window.AppState;
    if (s && s.transition) s.transition('pitch_test');
    history.pushState({ phase: 'pitch_test' }, '');
    refresh();
  }

  function render() { refresh(); }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    open: open,
    render: render,
    // Exposed за бъдеща integration (Settings → "Преразглеждане на честотата")
    _FREQUENCIES: FREQUENCIES,
    _MAX_TRIALS: MAX_TRIALS
  };
})();
