/**
 * AURALIS PitchTest — research-grade tinnitus frequency profiler
 * ============================================================================
 * Пълна имплементация по проучванията в проекта (НЕ опростена бета):
 *   docs/research/24-frequency-profiler-systematic.md
 *   docs/research/06-frequency-profiler-notch-filter.md
 *
 * Метод (всичко достижимо през телефон + слушалки, без мед. апаратура):
 *   1. Скрининг тип тинитус (тонален/шумов → продължи с NBN; пулсиращ → ЛОР).
 *   2. Слушалки задължителни (високоговорителят не покрива 250 Hz–16 kHz).
 *   3. Биологична калибрация на нивото (self-adjustment) → тоновете чуваеми
 *      и на високите честоти, където често е загубата + тинитусът.
 *   4. Стимул = ТЕСНОЛЕНТОВ ШУМ (NBN), не чист тон — по-малка вариабилност
 *      между замерванията (Korth & Wollbrink 2021; doc 24).
 *   5. Обхват 250 Hz–16 kHz, решетка 1/12 октава (doc 24).
 *   6. 2AFC адаптивно търсене за всяко замерване (елиминира criterion bias).
 *   7. БАЙЕСОВО секвенциално усредняване в log2 пространство, динамичен стоп
 *      при 90% доверителен интервал ≤ ±0.25 октава (4–20 замервания) (doc 24).
 *   8. Октавна проверка F vs 0.5F vs 2F (octave confusion ~50%).
 *
 * Резултатът е честота + доверителен интервал (честно: „приблизителна").
 * Notch терапията (doc 06) ползва тази честота с ШИРОК прорез (1/2–1 октава),
 * който нарочно поема остатъчната неточност на субективното измерване.
 *
 * Public API: PitchTest.open() / PitchTest.render()
 * State: AppState.pitchTests[] / pitchSkipped / audioDevice.
 */

window.PitchTest = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================

  var F_MIN = 250;
  var F_MAX = 16000;
  var STEPS_PER_OCT = 12;            // 1/12 октава решетка (doc 24)

  // NBN параметри
  var NBN_BW_OCT   = 1 / 3;          // ширина на лентата ~1/3 октава (ясен pitch)
  var NBN_Q        = qFromBwOct(NBN_BW_OCT);
  var NBN_DURATION_MS = 1800;
  var FADE_MS         = 60;          // click-avoidance
  var AUTO_FADE_IN_MS = 700;         // плавно усилване за auto-played звук
  var AUTO_PLAY_DELAY_MS = 350;
  var SILENCE_BETWEEN_MS = 500;      // residual inhibition guard

  // Калибрация на нивото
  var CALIB_GAIN_DEFAULT = 0.40;
  var CALIB_GAIN_MIN = 0.05;
  var CALIB_GAIN_MAX = 0.85;         // hearing-safety cap (NBN, own gain bus)

  // 2AFC замерване + Байес
  var STAIR_STEPS = 6;               // 2AFC стъпки за едно замерване
  var CI_TARGET_OCT = 0.25;          // динамичен стоп: 90% CI ≤ ±0.25 октава
  var MIN_MEAS = 4;
  var MAX_MEAS = 20;

  var GRID = buildGrid();            // честоти 250→16000 на 1/12 октава

  // ============================================================
  // STATE
  // ============================================================

  var phase = 'pretest';
  var ctx = null;
  var masterGain = null;
  var calibGain = CALIB_GAIN_DEFAULT;

  // Байес (в log2(Hz) пространство — единици = октави)
  var bayes = { n: 0, mean: 0, M2: 0 };
  var measurements = [];   // [{ pm, y }]

  // Текущо замерване (2AFC staircase)
  var meas = null;

  // Текуща двойка за прослушване
  var pair = null;         // { fLow, fHigh, roleA, onPick }
  var currentToneHandle = null;
  var currentToneLetter = null;
  var isPlayingTone = false;
  var autoPlayTimer = null;

  // Калибрационен непрекъснат NBN
  var calibHandle = null;
  var calibGainNode = null;

  // Октавна проверка
  var octaveState = null;

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function qFromBwOct(bw) {
    // Връзка октавна ширина → Q (Audio EQ Cookbook), doc 06.
    return 1 / (2 * Math.sinh((Math.log(2) / 2) * bw));
  }

  function buildGrid() {
    var grid = [];
    var nSteps = Math.round(Math.log(F_MAX / F_MIN) / Math.log(2) * STEPS_PER_OCT);
    for (var k = 0; k <= nSteps; k++) {
      grid.push(F_MIN * Math.pow(2, k / STEPS_PER_OCT));
    }
    return grid;
  }

  function fmtFreq(hz) {
    return hz >= 1000
      ? (hz / 1000).toFixed(hz >= 10000 ? 1 : 2).replace(/\.?0+$/, '') + ' kHz'
      : Math.round(hz) + ' Hz';
  }

  // t-стойност за 90% двустранен CI (0.95 квантил), df = n-1.
  function tValue(df) {
    var T = [Infinity, 6.314, 2.920, 2.353, 2.132, 2.015, 1.943, 1.895,
             1.860, 1.833, 1.812, 1.796, 1.782, 1.771, 1.761, 1.753,
             1.746, 1.740, 1.734, 1.729];
    if (df < 1) return Infinity;
    if (df >= T.length) return 1.725;
    return T[df];
  }

  // ============================================================
  // Bayesian sequential estimator (log2 space → октави)
  // ============================================================

  function bayesReset() { bayes = { n: 0, mean: 0, M2: 0 }; measurements = []; }

  function bayesAdd(pmHz) {
    var y = Math.log(pmHz) / Math.log(2);   // log2(Hz)
    measurements.push({ pm: pmHz, y: y });
    bayes.n += 1;
    var d = y - bayes.mean;
    bayes.mean += d / bayes.n;
    bayes.M2 += d * (y - bayes.mean);        // Welford
  }

  function bayesMeanHz() { return Math.pow(2, bayes.mean); }

  // Полуширина на 90% CI в октави.
  function bayesCIHalfOct() {
    if (bayes.n < 2) return Infinity;
    var variance = bayes.M2 / (bayes.n - 1);
    var se = Math.sqrt(variance / bayes.n);
    return tValue(bayes.n - 1) * se;
  }

  function bayesShouldStop() {
    if (bayes.n >= MAX_MEAS) return true;
    if (bayes.n >= MIN_MEAS && bayesCIHalfOct() <= CI_TARGET_OCT) return true;
    return false;
  }

  // ============================================================
  // Audio context + NBN generation
  // ============================================================

  function ensureContext() {
    if (ctx) return ctx;
    if (window.AudioEngine && window.AudioEngine._getContext) {
      var shared = window.AudioEngine._getContext();
      if (shared) {
        ctx = shared;
        masterGain = ctx.createGain();
        masterGain.gain.value = 1.0;
        masterGain.connect(ctx.destination);
        return ctx;
      }
    }
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { console.error('[pitch-test] Web Audio API not supported'); return null; }
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(ctx.destination);
    return ctx;
  }

  var noiseBuffer = null;
  function getNoiseBuffer(c) {
    if (noiseBuffer) return noiseBuffer;
    var len = Math.floor(c.sampleRate * 2);
    noiseBuffer = c.createBuffer(1, len, c.sampleRate);
    var d = noiseBuffer.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  // Изсвирва теснолентов шум центриран на centerFreq. Връща { stop, promise }.
  // fadeInMs опционален (auto-play → дълъг плавен ramp).
  function playNBN(centerFreq, durationMs, fadeInMs) {
    var c = ensureContext();
    if (!c) return { stop: function () {}, promise: Promise.resolve() };
    if (c.state === 'suspended') c.resume().catch(function () {});

    var src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c);
    src.loop = true;
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = centerFreq;
    bp.Q.value = NBN_Q;
    var gain = c.createGain();

    var fadeInSec = (typeof fadeInMs === 'number' ? fadeInMs : FADE_MS) / 1000;
    var fadeOutSec = FADE_MS / 1000;
    var totalSec = durationMs / 1000;
    var nowT = c.currentTime;
    var target = clampGain(NBN_LEVEL() * calibGain);

    gain.gain.setValueAtTime(0, nowT);
    gain.gain.linearRampToValueAtTime(target, nowT + fadeInSec);
    gain.gain.setValueAtTime(target, nowT + Math.max(fadeInSec, totalSec - fadeOutSec));
    gain.gain.linearRampToValueAtTime(0, nowT + totalSec);

    src.connect(bp); bp.connect(gain); gain.connect(masterGain);
    src.start(nowT);
    try { src.stop(nowT + totalSec + 0.05); } catch (e) {}

    var settled = false, resolveFn = null;
    var promise = new Promise(function (res) { resolveFn = res; });
    function cleanup() {
      if (settled) return; settled = true;
      try { src.disconnect(); } catch (e) {}
      try { bp.disconnect(); } catch (e) {}
      try { gain.disconnect(); } catch (e) {}
      if (resolveFn) resolveFn();
    }
    src.onended = cleanup;
    setTimeout(cleanup, durationMs + 80);

    return {
      stop: function () {
        if (settled) return;
        try {
          var ns = c.currentTime;
          gain.gain.cancelScheduledValues(ns);
          gain.gain.setValueAtTime(gain.gain.value, ns);
          gain.gain.linearRampToValueAtTime(0, ns + 0.04);
          src.stop(ns + 0.05);
        } catch (e) { try { src.stop(); } catch (e2) {} }
        setTimeout(cleanup, 90);
      },
      promise: promise
    };
  }

  function NBN_LEVEL() { return 1.0; }
  function clampGain(g) { return Math.max(0, Math.min(CALIB_GAIN_MAX, g)); }

  function silence(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // ============================================================
  // SCREEN 1 — Pretest (тип тинитус)
  // ============================================================

  function buildPretestHtml() {
    return (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Какво чувате най-точно?</h1>' +
          '<p class="pt-subtitle">Това определя как ще намерим Вашата честота.</p>' +
        '</header>' +
        '<div class="pt-pretest-options">' +
          ptOption('pretest', 'tonal', 'Чист тон / пищене',
            'Като „и-и-и" — постоянна височина') +
          ptOption('pretest', 'noise', 'Съскане / шум',
            'Като „ш-ш-ш", пара, вода') +
          ptOption('pretest', 'pulsing', 'Пулсиране',
            'В ритъм със сърдечния пулс') +
          ptOption('pretest', 'other', 'Друго / Не съм сигурен',
            'Не съответства на горните') +
        '</div>' +
      '</div>'
    );
  }

  function ptOption(action, value, label, desc) {
    return (
      '<button class="pt-option-card" type="button" data-action="' + action + '" data-value="' + value + '">' +
        '<div class="pt-option-label">' + escapeHtml(label) + '</div>' +
        '<div class="pt-option-desc">' + escapeHtml(desc) + '</div>' +
      '</button>'
    );
  }

  function onPretestChoice(value) {
    var s = window.AppState;
    if (value === 'pulsing') {
      if (s && s.setPitchSkip) s.setPitchSkip('pulsing');
      phase = 'done';
      renderSkip('Препоръчваме преглед при УНГ специалист',
        'Пулсиращ тинитус (в ритъм със сърдечния пулс) изисква медицинска ' +
        'консултация — може да има съдов произход. Препоръчваме посещение ' +
        'преди да продължите.');
      return;
    }
    // тонален И шумов → продължаваме (NBN е подходящ и за двата). other → пробваме.
    phase = 'device';
    renderDevice();
  }

  // ============================================================
  // SCREEN 2 — Device (слушалки задължителни)
  // ============================================================

  function renderDevice() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Сложете слушалки</h1>' +
          '<p class="pt-subtitle">Тестът покрива високи честоти, които ' +
            'високоговорителят на телефона не възпроизвежда точно. ' +
            'Кои да е слушалки (тапи или други) дават много по-верен резултат.</p>' +
        '</header>' +
        '<div class="pt-pretest-options">' +
          ptOption('device', 'headphones', 'Готово, със слушалки съм',
            'Тапи, безжични или кабелни — всякакви') +
          ptOption('device', 'speakers', 'Нямам — ще ползвам телефона',
            'Високоговорител (по-малко точно на високите)') +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
  }

  function onDeviceChoice(value) {
    var s = window.AppState;
    if (s && s.setAudioDevice) s.setAudioDevice(value === 'headphones' ? 'inear' : 'speakers');
    phase = 'calibration';
    renderCalibration();
  }

  // ============================================================
  // SCREEN 3 — Биологична калибрация на нивото
  // ============================================================
  // Self-adjustment (doc 24): потребителят сваля силата до „едва чуто",
  // после я вдига малко до комфортно ясно. Така NBN е чуваем и на високите
  // честоти (където е загубата + тинитусът) без да е силен.

  function renderCalibration() {
    var app = el('app');
    if (!app) return;
    var pct = Math.round((calibGain - CALIB_GAIN_MIN) / (CALIB_GAIN_MAX - CALIB_GAIN_MIN) * 100);
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Настройте удобна сила</h1>' +
          '<p class="pt-subtitle">Пуска се тих съскащ звук. Нагласете го така, ' +
            'че да го чувате <b>ясно, но меко</b> — нито едва доловим, нито силен. ' +
            'На тази сила ще слушате теста.</p>' +
        '</header>' +
        '<section class="pt-tones" style="justify-content:center;">' +
          '<button class="pt-tone-btn" type="button" data-action="calib-toggle" style="max-width:280px;">' +
            '<span class="pt-tone-label">Пусни звука</span>' +
            '<span class="pt-tone-hint" data-calib-hint>Натиснете за прослушване</span>' +
            '<span class="pt-tone-wave" aria-hidden="true"><span></span><span></span><span></span></span>' +
          '</button>' +
        '</section>' +
        '<section class="pt-slider-section vc-slider-section" style="margin-top:8px;">' +
          '<div class="vc-slider-head">' +
            '<span class="vc-slider-label">Сила</span>' +
            '<span class="vc-slider-value" id="ptCalibVal">' + pct + '%</span>' +
          '</div>' +
          '<input type="range" class="vc-slider" id="ptCalibSlider" min="0" max="100" step="1" value="' + pct + '"' +
            ' aria-label="Сила на тестовия звук">' +
        '</section>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="calib-done">Готово, започни теста</button>' +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
    var slider = el('ptCalibSlider');
    if (slider) slider.addEventListener('input', onCalibSlider);
  }

  function onCalibSlider(e) {
    var p = parseInt(e.currentTarget.value, 10);
    if (isNaN(p)) return;
    calibGain = CALIB_GAIN_MIN + (p / 100) * (CALIB_GAIN_MAX - CALIB_GAIN_MIN);
    var lbl = el('ptCalibVal'); if (lbl) lbl.textContent = p + '%';
    if (calibGainNode && ctx) {
      var now = ctx.currentTime;
      calibGainNode.gain.cancelScheduledValues(now);
      calibGainNode.gain.setValueAtTime(calibGainNode.gain.value, now);
      calibGainNode.gain.linearRampToValueAtTime(clampGain(calibGain), now + 0.05);
    }
  }

  function toggleCalibTone() {
    if (calibHandle) { stopCalibTone(); return; }
    var c = ensureContext();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(function () {});
    var src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c);
    src.loop = true;
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 4000; bp.Q.value = NBN_Q;
    calibGainNode = c.createGain();
    calibGainNode.gain.value = 0;
    src.connect(bp); bp.connect(calibGainNode); calibGainNode.connect(masterGain);
    src.start();
    var now = c.currentTime;
    calibGainNode.gain.linearRampToValueAtTime(clampGain(calibGain), now + 0.2);
    calibHandle = { src: src, bp: bp };
    setCalibBtn(true);
  }

  function stopCalibTone() {
    if (!calibHandle) return;
    var h = calibHandle, gn = calibGainNode;
    calibHandle = null; calibGainNode = null;
    try {
      if (gn && ctx) {
        var now = ctx.currentTime;
        gn.gain.cancelScheduledValues(now);
        gn.gain.setValueAtTime(gn.gain.value, now);
        gn.gain.linearRampToValueAtTime(0, now + 0.1);
      }
    } catch (e) {}
    setTimeout(function () {
      try { h.src.stop(); } catch (e) {}
      try { h.src.disconnect(); } catch (e) {}
      try { h.bp.disconnect(); } catch (e) {}
      if (gn) { try { gn.disconnect(); } catch (e) {} }
    }, 140);
    setCalibBtn(false);
  }

  function setCalibBtn(playing) {
    var btn = document.querySelector('[data-action="calib-toggle"]');
    if (btn) btn.classList.toggle('pt-tone-btn--playing', playing);
    var hint = document.querySelector('[data-calib-hint]');
    if (hint) hint.textContent = playing ? 'Свири… (натиснете за спиране)' : 'Натиснете за прослушване';
    var lbl = btn && btn.querySelector('.pt-tone-label');
    if (lbl) lbl.textContent = playing ? 'Спри звука' : 'Пусни звука';
  }

  function onCalibDone() {
    stopCalibTone();
    phase = 'measure';
    bayesReset();
    startMeasurement();
  }

  // ============================================================
  // 2AFC measurement (един staircase → едно PM_i)
  // ============================================================

  function startMeasurement() {
    meas = { lo: 0, hi: GRID.length - 1, step: 0 };
    nextComparison();
  }

  function nextComparison() {
    if (meas.step >= STAIR_STEPS || meas.hi - meas.lo <= 1) {
      finishMeasurement();
      return;
    }
    var span = meas.hi - meas.lo;
    var ai = meas.lo + Math.max(1, Math.floor(span * 0.25));
    var bi = meas.lo + Math.min(span - 1, Math.ceil(span * 0.75));
    if (bi <= ai) bi = Math.min(meas.hi, ai + 1);
    meas.cut = meas.lo + Math.floor(span / 2);
    presentPair(GRID[ai], GRID[bi], measureMeta(), function (which) {
      // which = 'lower' | 'higher' (коя честота е по-близо до тинитуса)
      meas.step += 1;
      if (which === 'lower') meas.hi = meas.cut;
      else meas.lo = meas.cut + 1;
      if (meas.lo > meas.hi) meas.lo = meas.hi;
      nextComparison();
    });
  }

  function finishMeasurement() {
    var idx = Math.round((meas.lo + meas.hi) / 2);
    idx = Math.max(0, Math.min(GRID.length - 1, idx));
    var pm = GRID[idx];
    bayesAdd(pm);
    if (bayesShouldStop()) {
      phase = 'octave';
      startOctaveVerification(bayesMeanHz());
    } else {
      startMeasurement();
    }
  }

  function measureMeta() {
    var ci = bayesCIHalfOct();
    var ciTxt = (bayes.n < 2 || !isFinite(ci)) ? '—' : ('±' + ci.toFixed(2) + ' окт');
    return {
      progressLabel: 'Замерване ' + (bayes.n + 1),
      sub: 'точност: ' + ciTxt + ' (цел ±' + CI_TARGET_OCT + ')',
      pct: Math.min(100, Math.round((bayes.n / MIN_MEAS) * 100))
    };
  }

  // ============================================================
  // Present a 2AFC pair (NBN A / NBN B) + auto-play + choice
  // ============================================================

  function presentPair(fLow, fHigh, meta, onPick) {
    // случайно разпределение коя честота е „A" (намалява order bias)
    var lowIsA = Math.random() < 0.5;
    pair = {
      fLow: fLow, fHigh: fHigh,
      fA: lowIsA ? fLow : fHigh,
      fB: lowIsA ? fHigh : fLow,
      lowIsA: lowIsA,
      onPick: onPick
    };
    stopCurrentTone();

    var app = el('app');
    if (!app) return;
    var pct = meta.pct != null ? meta.pct : 100;
    app.innerHTML = (
      '<div class="pt-screen pt-screen--trial" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Намиране на Вашата честота</h1>' +
          '<div class="pt-progress-row">' +
            '<div class="pt-progress">' + escapeHtml(meta.progressLabel || '') + '</div>' +
            '<div class="pt-progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
              '<div class="pt-progress-fill" style="width:' + pct + '%"></div>' +
            '</div>' +
          '</div>' +
          (meta.sub ? '<p class="pt-progress-sub">' + escapeHtml(meta.sub) + '</p>' : '') +
        '</header>' +
        '<section class="pt-help">' +
          '<p class="pt-help-lead">Чуйте двата съскащи звука и изберете онзи, ' +
            'чиято <b>височина</b> е по-близка до Вашия тинитус.</p>' +
          '<p class="pt-help-note">Първият тръгва сам. Няма грешен отговор — ' +
            'с всеки избор се доближаваме до Вашата честота.</p>' +
        '</section>' +
        '<section class="pt-tones">' +
          toneBtnHtml('A') + toneBtnHtml('B') +
        '</section>' +
        '<section class="pt-choice">' +
          '<p class="pt-choice-prompt">Кой е по-близо до Вашия тинитус?</p>' +
          '<div class="pt-choice-actions">' +
            '<button class="pt-btn pt-btn--primary pt-choice-btn" type="button" data-action="choose" data-choice="A">A по-близо</button>' +
            '<button class="pt-btn pt-btn--primary pt-choice-btn" type="button" data-action="choose" data-choice="B">B по-близо</button>' +
          '</div>' +
        '</section>' +
        '<section class="pt-vol-row">' +
          '<button class="pt-vol-btn" type="button" data-action="vol-down" aria-label="По-тихо">−</button>' +
          '<span class="pt-vol-label">Сила</span>' +
          '<button class="pt-vol-btn" type="button" data-action="vol-up" aria-label="По-силно">+</button>' +
        '</section>' +
      '</div>'
    );
    bindClicks(app);
    scheduleAutoPlay();
  }

  function toneBtnHtml(letter) {
    return (
      '<button class="pt-tone-btn" type="button" data-action="play-tone" data-tone="' + letter + '"' +
        ' aria-label="Звук ' + letter + '">' +
        '<span class="pt-tone-label">Звук ' + letter + '</span>' +
        '<span class="pt-tone-hint" data-tone-hint="' + letter + '">Натиснете за прослушване</span>' +
        '<span class="pt-tone-wave" aria-hidden="true"><span></span><span></span><span></span></span>' +
      '</button>'
    );
  }

  function scheduleAutoPlay() {
    var c = ensureContext();
    if (c && c.state === 'suspended') c.resume().catch(function () {});
    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
    autoPlayTimer = setTimeout(function () {
      autoPlayTimer = null;
      if (!document.querySelector('.pt-tone-btn[data-tone]')) return;
      if (isPlayingTone) return;
      onPlayToneRequest('A', true);
    }, AUTO_PLAY_DELAY_MS);
  }

  function freqForLetter(letter) { return letter === 'A' ? pair.fA : pair.fB; }

  function clearToneVisual(letter) {
    var btn = document.querySelector('[data-tone="' + letter + '"]');
    if (btn) btn.classList.remove('pt-tone-btn--playing');
    var hint = document.querySelector('[data-tone-hint="' + letter + '"]');
    if (hint) hint.textContent = 'Натиснете за прослушване';
  }

  function stopCurrentTone() {
    if (currentToneHandle && currentToneHandle.stop) { try { currentToneHandle.stop(); } catch (e) {} }
    clearToneVisual(currentToneLetter);
    currentToneHandle = null; currentToneLetter = null; isPlayingTone = false;
  }

  function onPlayToneRequest(letter, gentle) {
    if (!pair) return;
    if (isPlayingTone && currentToneLetter === letter) { stopCurrentTone(); return; }
    if (isPlayingTone) stopCurrentTone();
    var freq = freqForLetter(letter);
    if (!freq) return;
    isPlayingTone = true;
    currentToneLetter = letter;
    var btn = document.querySelector('[data-tone="' + letter + '"]');
    if (btn) btn.classList.add('pt-tone-btn--playing');
    var hint = document.querySelector('[data-tone-hint="' + letter + '"]');
    if (hint) hint.textContent = 'Свири… (натиснете за спиране)';
    var handle = playNBN(freq, NBN_DURATION_MS, gentle === true ? AUTO_FADE_IN_MS : FADE_MS);
    currentToneHandle = handle;
    var myLetter = letter;
    handle.promise.then(function () {
      if (currentToneLetter !== myLetter) return;
      clearToneVisual(myLetter);
      currentToneHandle = null; currentToneLetter = null;
      return silence(SILENCE_BETWEEN_MS);
    }).then(function () {
      if (currentToneLetter !== null) return;
      isPlayingTone = false;
    });
  }

  function onChoice(letter) {
    if (isPlayingTone) { stopCurrentTone(); }
    if (!pair || typeof pair.onPick !== 'function') return;
    var chosenFreq = freqForLetter(letter);
    var which = (chosenFreq === pair.fLow) ? 'lower' : 'higher';
    var cb = pair.onPick;
    pair = null;
    cb(which);
  }

  function adjustVolume(delta) {
    var p = (calibGain - CALIB_GAIN_MIN) / (CALIB_GAIN_MAX - CALIB_GAIN_MIN);
    p = Math.max(0, Math.min(1, p + delta));
    calibGain = CALIB_GAIN_MIN + p * (CALIB_GAIN_MAX - CALIB_GAIN_MIN);
  }

  // ============================================================
  // Octave verification (F vs 2F, F vs 0.5F) — doc 24
  // ============================================================

  function startOctaveVerification(freq) {
    octaveState = { base: freq, step: 0, shifts: 0, trials: [] };
    nextOctaveStep();
  }

  function nextOctaveStep() {
    octaveState.step += 1;
    var F = octaveState.base;
    if (octaveState.step === 1) {
      var halfF = F / 2;
      if (halfF < F_MIN) { return nextOctaveStep(); }
      presentPair(halfF, F, { progressLabel: 'Проверка на октава', sub: 'долна октава', pct: 100 }, function (which) {
        octaveState.trials.push({ pair: 'F_vs_halfF', choice: which });
        if (which === 'lower' && octaveState.shifts < 2) {   // избрал 0.5F → надолу
          octaveState.base = halfF; octaveState.shifts += 1; octaveState.step = 0;
        }
        nextOctaveStep();
      });
    } else if (octaveState.step === 2) {
      var dblF = octaveState.base * 2;
      if (dblF > F_MAX) { return nextOctaveStep(); }
      presentPair(octaveState.base, dblF, { progressLabel: 'Проверка на октава', sub: 'горна октава', pct: 100 }, function (which) {
        octaveState.trials.push({ pair: 'F_vs_2F', choice: which });
        if (which === 'higher' && octaveState.shifts < 2) {  // избрал 2F → нагоре
          octaveState.base = dblF; octaveState.shifts += 1; octaveState.step = 0;
        }
        nextOctaveStep();
      });
    } else {
      finalizeResult();
    }
  }

  // ============================================================
  // Finalize + result
  // ============================================================

  function finalizeResult() {
    var freq = Math.round(octaveState.base);
    var ciOct = bayesCIHalfOct();
    var s = window.AppState;
    if (s && s.addPitchTest) {
      s.addPitchTest({
        freq: freq,
        trials: measurements,
        octaveCheck: {
          method: 'NBN-2AFC-bayesian',
          measurements: bayes.n,
          ciHalfOct: isFinite(ciOct) ? Number(ciOct.toFixed(3)) : null,
          meanHz: Math.round(bayesMeanHz()),
          octaveTrials: octaveState.trials
        }
      });
    }
    phase = 'done';
    renderResult(freq, ciOct);
  }

  function renderResult(freq, ciOct) {
    var app = el('app');
    if (!app) return;
    var rangeTxt = '';
    if (isFinite(ciOct) && ciOct > 0) {
      var lo = Math.round(freq * Math.pow(2, -ciOct));
      var hi = Math.round(freq * Math.pow(2, ciOct));
      rangeTxt = 'Диапазон на надеждност: ' + fmtFreq(lo) + ' – ' + fmtFreq(hi) +
                 ' (±' + ciOct.toFixed(2) + ' октава).';
    }
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Готово</h1>' +
          '<p class="pt-subtitle">Намерихме приблизителната честота на Вашия тинитус.</p>' +
        '</header>' +
        '<section class="pt-result">' +
          '<div class="pt-result-freq">' + escapeHtml(fmtFreq(freq)) + '</div>' +
          '<p class="pt-result-note">' +
            (rangeTxt ? escapeHtml(rangeTxt) + ' ' : '') +
            'Това е приблизителна оценка, не клинично измерване — честотата на ' +
            'тинитуса естествено се променя. Затова звуковият подход използва ' +
            'широка лента около нея.' +
          '</p>' +
        '</section>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="skip-continue">Продължете</button>' +
          '<button class="pt-btn pt-btn--ghost" type="button" data-action="retest">Повторете теста</button>' +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
  }

  function renderSkip(title, body) {
    var app = el('app');
    if (!app) return;
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header"><h1 class="pt-title">' + escapeHtml(title) + '</h1></header>' +
        '<section class="pt-skip-body"><p>' + escapeHtml(body) + '</p></section>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="skip-continue">Продължете</button>' +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
  }

  // ============================================================
  // Click router
  // ============================================================

  // ВАЖНО: #app е персистентен контейнер (само innerHTML се сменя), затова
  // remove преди add гарантира ТОЧНО ЕДИН listener. Без това всеки render
  // трупа listener → един клик задейства onClick многократно → каскада.
  function bindClicks(app) {
    app = app || el('app');
    if (!app) return;
    app.removeEventListener('click', onClick);
    app.addEventListener('click', onClick);
  }

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    switch (action) {
      case 'pretest':    onPretestChoice(btn.getAttribute('data-value')); break;
      case 'device':     onDeviceChoice(btn.getAttribute('data-value')); break;
      case 'calib-toggle': toggleCalibTone(); break;
      case 'calib-done': onCalibDone(); break;
      case 'play-tone':  onPlayToneRequest(btn.getAttribute('data-tone')); break;
      case 'choose':     onChoice(btn.getAttribute('data-choice')); break;
      case 'vol-down':   adjustVolume(-0.12); break;
      case 'vol-up':     adjustVolume(0.12); break;
      case 'retest':     open(); break;
      case 'skip-continue': goNext(); break;
    }
  }

  function goNext() {
    cleanupAudio();
    var s = window.AppState;
    if (s && s.transition) s.transition('home');
    history.replaceState({ phase: 'home' }, '');
    if (window.Home && window.Home.render) window.Home.render();
  }

  function cleanupAudio() {
    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
    stopCurrentTone();
    stopCalibTone();
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildPretestHtml();
    bindClicks(app);
  }

  function scrollTop() {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function open() {
    cleanupAudio();
    phase = 'pretest';
    bayesReset();
    calibGain = CALIB_GAIN_DEFAULT;
    var s = window.AppState;
    if (s && s.transition) s.transition('pitch_test');
    history.pushState({ phase: 'pitch_test' }, '');
    refresh();
    scrollTop();
  }

  // Router/onboarding entry hook — започва теста чисто (reset на engine state).
  function render() {
    cleanupAudio();
    phase = 'pretest';
    bayesReset();
    calibGain = CALIB_GAIN_DEFAULT;
    refresh();
    scrollTop();
  }

  return {
    open: open,
    render: render,
    _GRID: GRID,
    _bayes: function () { return { n: bayes.n, meanHz: bayesMeanHz(), ciOct: bayesCIHalfOct() }; },
    _pair: function () { return pair ? { fA: pair.fA, fB: pair.fB, fLow: pair.fLow, fHigh: pair.fHigh } : null; },
    _phase: function () { return phase; }
  };
})();
