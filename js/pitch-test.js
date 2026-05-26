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
  // Tone generation (Web Audio API, sine wave + linear fade)
  // ============================================================
  // Hard safety cap (TONE_AMPLITUDE = 0.3 ≈ −10 dBFS) — pitch tones играят
  // unobserved за volume slider. 50ms fade-in/out избягват click при start/stop.

  function playTone(freqHz, durationMs) {
    return new Promise(function (resolve) {
      var c = ensureContext();
      if (!c) { resolve(); return; }
      // Resume context ако suspended (iOS lock screen, autoplay policy).
      if (c.state === 'suspended') {
        c.resume().catch(function () {});
      }
      var osc = c.createOscillator();
      osc.frequency.value = freqHz;
      osc.type = 'sine';

      var gain = c.createGain();
      var fadeSec = FADE_MS / 1000;
      var totalSec = durationMs / 1000;
      var nowT = c.currentTime;

      // Linear ramps (audible immediately — same insight като SEQ-REVEAL-BUG fix).
      gain.gain.setValueAtTime(0, nowT);
      gain.gain.linearRampToValueAtTime(TONE_AMPLITUDE, nowT + fadeSec);
      gain.gain.setValueAtTime(TONE_AMPLITUDE, nowT + Math.max(0, totalSec - fadeSec));
      gain.gain.linearRampToValueAtTime(0, nowT + totalSec);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(nowT);
      osc.stop(nowT + totalSec);

      osc.onended = function () {
        try { osc.disconnect(); } catch (e) {}
        try { gain.disconnect(); } catch (e) {}
      };

      // Resolve малко след stop (даваме време за natural cleanup)
      setTimeout(resolve, durationMs + 30);
    });
  }

  function silence(durationMs) {
    return new Promise(function (r) { setTimeout(r, durationMs); });
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
      // Продължи към pitch test (Phase 1B — 2AFC bayesian narrowing).
      phase = 'test';
      startBayesianTest();
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

  // ============================================================
  // 2AFC bayesian narrowing (PITCH-1B)
  // ============================================================
  // Двуалтернативен принудителен избор: на всеки trial представяме 2 тона
  // в съседни bin-ове на FREQUENCIES; user избира кой е по-близо до своя
  // тинитус. Binary search свежда диапазона ~log2(N) trials (12 → ~4).
  // MAX_TRIALS=8 дава safety buffer (повторяемост в гранични случаи).

  function startBayesianTest() {
    trials = [];
    currentLow = 0;
    currentHigh = FREQUENCIES.length - 1;
    trialIndex = 0;
    ensureContext();
    nextTrial();
  }

  function nextTrial() {
    // Convergence: остана единичен bin (или 2 съседни — пробваме веднъж още).
    if (trialIndex >= MAX_TRIALS || currentHigh - currentLow <= 1) {
      return finalizeTest();
    }
    var mid = Math.floor((currentLow + currentHigh) / 2);
    var freqA = FREQUENCIES[mid];
    var freqB = FREQUENCIES[mid + 1];
    presentTrial(trialIndex + 1, freqA, freqB, function (userChoice) {
      trials.push({
        trial: trialIndex + 1,
        freqA: freqA, freqB: freqB,
        choice: userChoice,
        rangeBefore: [currentLow, currentHigh]
      });
      if (userChoice === 'A') {
        currentHigh = mid;       // A е по-близо → orient към lower half
      } else {
        currentLow = mid + 1;    // B е по-близо → orient към upper half
      }
      trialIndex++;
      nextTrial();
    });
  }

  function presentTrial(trialNum, freqA, freqB, choiceCallback) {
    pendingChoiceCallback = choiceCallback;
    var app = el('app');
    if (!app) return;
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Намиране на честотата на тинитуса</h1>' +
          '<p class="pt-subtitle">Слушайте 2 тона. Изберете кой е по-близо ' +
            'до Вашия шум.</p>' +
          '<div class="pt-progress">Тест ' + trialNum + ' от ' + MAX_TRIALS + '</div>' +
        '</header>' +

        '<section class="pt-tones">' +
          '<button class="pt-tone-btn" type="button" data-action="play-tone" data-tone="A">' +
            '<span class="pt-tone-label">Тон A</span>' +
            '<span class="pt-tone-hint">Натиснете за прослушване</span>' +
          '</button>' +
          '<button class="pt-tone-btn" type="button" data-action="play-tone" data-tone="B">' +
            '<span class="pt-tone-label">Тон B</span>' +
            '<span class="pt-tone-hint">Натиснете за прослушване</span>' +
          '</button>' +
        '</section>' +

        '<section class="pt-choice">' +
          '<p class="pt-choice-prompt">Кой тон е по-близо до Вашия тинитус?</p>' +
          '<div class="pt-choice-actions">' +
            '<button class="pt-btn pt-btn--primary" type="button" data-action="choose" data-choice="A">' +
              'A по-близо' +
            '</button>' +
            '<button class="pt-btn pt-btn--primary" type="button" data-action="choose" data-choice="B">' +
              'B по-близо' +
            '</button>' +
          '</div>' +
        '</section>' +
      '</div>'
    );
    // Запази freqA/freqB върху container за достъп от click handler.
    var screenEl = app.querySelector('.pt-screen');
    if (screenEl) {
      screenEl.setAttribute('data-freq-a', String(freqA));
      screenEl.setAttribute('data-freq-b', String(freqB));
    }
    app.addEventListener('click', onClick);
  }

  function onPlayToneRequest(toneLetter) {
    if (isPlayingTone) {
      console.log('[pitch-test] tone already playing — ignore');
      return;
    }
    var screenEl = document.querySelector('.pt-screen');
    if (!screenEl) return;
    var freq = (toneLetter === 'A')
      ? parseInt(screenEl.getAttribute('data-freq-a'), 10)
      : parseInt(screenEl.getAttribute('data-freq-b'), 10);
    if (isNaN(freq)) return;
    isPlayingTone = true;
    // Visually indicate active tone (CSS .pt-tone-btn--playing).
    var btn = document.querySelector('[data-tone="' + toneLetter + '"]');
    if (btn) btn.classList.add('pt-tone-btn--playing');
    playTone(freq, TONE_DURATION_MS).then(function () {
      if (btn) btn.classList.remove('pt-tone-btn--playing');
      // Residual inhibition guard — silence преди следващ tone.
      return silence(SILENCE_BETWEEN_MS);
    }).then(function () {
      isPlayingTone = false;
    });
  }

  function onChoice(letter) {
    if (isPlayingTone) {
      console.log('[pitch-test] tone playing — wait before choosing');
      return;
    }
    var cb = pendingChoiceCallback;
    pendingChoiceCallback = null;
    if (typeof cb === 'function') cb(letter);
  }

  function finalizeTest() {
    // Median frequency на финалния range.
    var finalIdx = Math.floor((currentLow + currentHigh) / 2);
    var finalFreq = FREQUENCIES[finalIdx];
    console.log('[pitch-test] converged on freq:', finalFreq, 'Hz (range:', currentLow, '-', currentHigh + ')');

    var s = window.AppState;
    if (s && s.addPitchTest) {
      s.addPitchTest({
        freq: finalFreq,
        trials: trials
      });
    }

    // Phase 1C/1D ще добавят octave verification + post-test safety check.
    // За сега директно показваме резултат + продължи.
    renderTestResult(finalFreq);
  }

  function renderTestResult(freqHz) {
    var app = el('app');
    if (!app) return;
    // Опитваме familiar reference ("около [инструмент/звук]") — но избягваме
    // strict claims. Просто числото в Hz + кратко обяснение.
    var freqLabel = freqHz >= 1000
      ? (freqHz / 1000).toFixed(freqHz >= 10000 ? 1 : 1).replace(/\.0$/, '') + ' kHz'
      : freqHz + ' Hz';

    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Готово</h1>' +
          '<p class="pt-subtitle">Намерихме приблизителната честота на Вашия ' +
            'тинитус.</p>' +
        '</header>' +
        '<section class="pt-result">' +
          '<div class="pt-result-freq">' + escapeHtml(freqLabel) + '</div>' +
          '<p class="pt-result-note">Този резултат е запазен и ще се ползва ' +
          'за персонализиране на звуковата терапия в бъдещи версии.</p>' +
        '</section>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="skip-continue">' +
            'Продължете' +
          '</button>' +
        '</div>' +
      '</div>'
    );
    app.addEventListener('click', onClick);
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
    } else if (action === 'play-tone') {
      var tone = btn.getAttribute('data-tone');
      onPlayToneRequest(tone);
    } else if (action === 'choose') {
      var choice = btn.getAttribute('data-choice');
      onChoice(choice);
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
