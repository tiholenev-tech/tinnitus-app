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
  // Два режима:
  //   'quick'   (Ден 1 онбординг) — фиксирани QUICK_MEAS замервания, предвидим
  //             прогрес „Замерване X от 5", бързо до наградата.
  //   'precise' (Ден 2 „уточни честотата") — адаптивен Bayes 4–20 със стоп ±0.25.
  var QUICK_MEAS = 5;

  var GRID = buildGrid();            // честоти 250→16000 на 1/12 октава

  // ============================================================
  // STATE
  // ============================================================

  var STORAGE_ACTIVE = 'auralis-pitch-active';   // resume: недовършен тест

  var phase = 'pretest';
  var testMode = 'quick';            // 'quick' (Ден 1) | 'precise' (Ден 2)
  var stimulusType = 'tone';         // 'tone' (тонален) | 'noise' (шумов) — по pretest
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
    if (testMode === 'quick') return bayes.n >= QUICK_MEAS;
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

  // Чист синусов ТОН (за тонален тинитус — ясна, точна височина, по-малко
  // октавно объркване от съскащия NBN). Безопасен cap (тоновете са по-пиърсинг).
  function playTone(freqHz, durationMs, fadeInMs) {
    var c = ensureContext();
    if (!c) return { stop: function () {}, promise: Promise.resolve() };
    if (c.state === 'suspended') c.resume().catch(function () {});
    var osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freqHz;
    var gain = c.createGain();
    var fadeInSec = (typeof fadeInMs === 'number' ? fadeInMs : FADE_MS) / 1000;
    var fadeOutSec = FADE_MS / 1000;
    var totalSec = durationMs / 1000;
    var nowT = c.currentTime;
    var target = Math.min(0.5, clampGain(calibGain * 0.6));   // hearing-safety за тон
    gain.gain.setValueAtTime(0, nowT);
    gain.gain.linearRampToValueAtTime(target, nowT + fadeInSec);
    gain.gain.setValueAtTime(target, nowT + Math.max(fadeInSec, totalSec - fadeOutSec));
    gain.gain.linearRampToValueAtTime(0, nowT + totalSec);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(nowT);
    try { osc.stop(nowT + totalSec + 0.05); } catch (e) {}
    var settled = false, resolveFn = null;
    var promise = new Promise(function (res) { resolveFn = res; });
    function cleanup() {
      if (settled) return; settled = true;
      try { osc.disconnect(); } catch (e) {}
      try { gain.disconnect(); } catch (e) {}
      if (resolveFn) resolveFn();
    }
    osc.onended = cleanup;
    setTimeout(cleanup, durationMs + 80);
    return {
      stop: function () {
        if (settled) return;
        try {
          var ns = c.currentTime;
          gain.gain.cancelScheduledValues(ns);
          gain.gain.setValueAtTime(gain.gain.value, ns);
          gain.gain.linearRampToValueAtTime(0, ns + 0.04);
          osc.stop(ns + 0.05);
        } catch (e) { try { osc.stop(); } catch (e2) {} }
        setTimeout(cleanup, 90);
      },
      promise: promise
    };
  }

  // Стимул според типа тинитус: тонален → чист тон; шумов/друго → NBN.
  function playStimulus(freq, durationMs, fadeInMs) {
    return (stimulusType === 'tone')
      ? playTone(freq, durationMs, fadeInMs)
      : playNBN(freq, durationMs, fadeInMs);
  }

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
      clearPitchActive();
      phase = 'done';
      renderSkip('Препоръчваме преглед при УНГ специалист',
        'Пулсиращ тинитус (в ритъм със сърдечния пулс) изисква медицинска ' +
        'консултация — може да има съдов произход. Препоръчваме посещение ' +
        'преди да продължите.');
      return;
    }
    // СТИМУЛ ПО ТИП (поправя октавно объркване): тонален → чист ТОН (ясна
    // височина); шумов/друго → теснолентов ШУМ (прилича на техния тинитус).
    stimulusType = (value === 'tonal') ? 'tone' : 'noise';
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

  // 70+ ВОДЕН РЕЖИМ: без плъзгач. Звукът сам се усилва бавно от тихо; голям
  // пулсиращ СПРИ бутон — потребителят натиска, щом го чува удобно. Нула четене,
  // нула решения. Силата в този момент става нивото за целия тест.
  var calibRiseRAF = null;
  var CALIB_RISE_MS = 13000;   // бавно усилване тихо → max за ~13 сек

  function renderCalibration() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Чувате ли звука?</h1>' +
          '<p class="pt-subtitle">Звукът бавно се усилва.<br>Натиснете <b>СПРИ</b>, щом го чувате удобно.</p>' +
        '</header>' +
        '<div class="pt-calib-wrap">' +
          '<button class="pt-calib-stop" type="button" data-action="calib-stop"' +
            ' aria-label="Спри — силата е удобна">' +
            '<span class="pt-calib-pulse" aria-hidden="true"></span>' +
            '<span class="pt-calib-stop-label">СПРИ</span>' +
          '</button>' +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
    startCalibRise();
  }

  function startCalibRise() {
    var c = ensureContext();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(function () {});
    var src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c);
    src.loop = true;
    var bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 4000; bp.Q.value = NBN_Q;
    calibGainNode = c.createGain();
    calibGainNode.gain.value = clampGain(CALIB_GAIN_MIN);
    src.connect(bp); bp.connect(calibGainNode); calibGainNode.connect(masterGain);
    try { src.start(); } catch (e) {}
    calibHandle = { src: src, bp: bp };

    var startT = now();
    var wrap = document.querySelector('.pt-calib-stop');
    function tick() {
      if (!calibHandle) return;   // спряно
      var p = Math.min(1, (now() - startT) / CALIB_RISE_MS);
      calibGain = CALIB_GAIN_MIN + p * (CALIB_GAIN_MAX - CALIB_GAIN_MIN);
      try { calibGainNode.gain.value = clampGain(calibGain); } catch (e) {}
      if (wrap) wrap.style.setProperty('--p', p.toFixed(3));
      calibRiseRAF = (p < 1) ? requestAnimationFrame(tick) : null;  // достигна max → задръж
    }
    calibRiseRAF = requestAnimationFrame(tick);
  }

  function now() { return (window.performance && performance.now) ? performance.now() : 0; }

  function stopCalibTone() {
    if (calibRiseRAF) { cancelAnimationFrame(calibRiseRAF); calibRiseRAF = null; }
    if (!calibHandle) return;
    var h = calibHandle, gn = calibGainNode;
    calibHandle = null; calibGainNode = null;
    try {
      if (gn && ctx) {
        var nt = ctx.currentTime;
        gn.gain.cancelScheduledValues(nt);
        gn.gain.setValueAtTime(gn.gain.value, nt);
        gn.gain.linearRampToValueAtTime(0, nt + 0.12);
      }
    } catch (e) {}
    setTimeout(function () {
      try { h.src.stop(); } catch (e) {}
      try { h.src.disconnect(); } catch (e) {}
      try { h.bp.disconnect(); } catch (e) {}
      if (gn) { try { gn.disconnect(); } catch (e) {} }
    }, 160);
  }

  function onCalibStop() {
    // calibGain вече държи текущата (чута) сила. Спираме и започваме теста.
    stopCalibTone();
    phase = 'measure';
    bayesReset();
    startMeasurement();
  }

  // ============================================================
  // 2AFC measurement (един staircase → едно PM_i)
  // ============================================================

  var compHistory = [];   // снимки на meas преди всеки избор → „Назад"

  function startMeasurement() {
    meas = { lo: 0, hi: GRID.length - 1, step: 0 };
    compHistory = [];
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
      compHistory.push({ lo: meas.lo, hi: meas.hi, step: meas.step });
      meas.step += 1;
      if (which === 'lower') meas.hi = meas.cut;
      else meas.lo = meas.cut + 1;
      if (meas.lo > meas.hi) meas.lo = meas.hi;
      nextComparison();
    });
  }

  // „Назад" — върни предишния звук (в рамките на текущото замерване).
  function goBackComparison() {
    if (!compHistory.length) return;
    var prev = compHistory.pop();
    meas.lo = prev.lo; meas.hi = prev.hi; meas.step = prev.step;
    cancelAutoPlay();
    nextComparison();
  }

  function finishMeasurement() {
    var idx = Math.round((meas.lo + meas.hi) / 2);
    idx = Math.max(0, Math.min(GRID.length - 1, idx));
    var pm = GRID[idx];
    bayesAdd(pm);
    if (bayesShouldStop()) {
      phase = 'octave';
      savePitchActive();   // resume точка: всички замервания готови, остава октава
      renderBravoThen(function () { startOctaveVerification(bayesMeanHz()); }, true);
    } else {
      savePitchActive();   // resume точка: завършено замерване bayes.n
      renderBravoThen(function () { startMeasurement(); }, false);
    }
  }

  // „Браво" между замерванията — ясен сигнал че едно свърши, следващо започва.
  // Авто-напред след кратка пауза (без излишни натискания за 70+).
  function renderBravoThen(next, isLast) {
    var app = el('app');
    if (!app) { next(); return; }
    stopCurrentTone();
    var doneN = bayes.n;
    var msg = isLast
      ? 'Чудесно! Почти готово…'
      : (testMode === 'quick'
          ? ('Браво! ' + doneN + ' от ' + QUICK_MEAS + ' готови')
          : ('Браво! Замерване ' + doneN + ' готово'));
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<div class="pt-bravo">' +
          '<div class="pt-bravo-check" aria-hidden="true">✓</div>' +
          '<div class="pt-bravo-msg">' + escapeHtml(msg) + '</div>' +
        '</div>' +
      '</div>'
    );
    setTimeout(next, 1150);
  }

  function measureMeta() {
    if (testMode === 'quick') {
      return {
        progressLabel: 'Замерване ' + (bayes.n + 1) + ' от ' + QUICK_MEAS,
        sub: '',
        pct: Math.round((bayes.n / QUICK_MEAS) * 100)
      };
    }
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
    cancelHold();
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
        '<p class="pt-help-one">Чуйте двата звука. Изберете кой е по-близо до Вашия.</p>' +
        '<section class="pt-tones">' +
          toneCardHtml('A') + toneCardHtml('B') +
        '</section>' +
        // „Назад" — само в режим замерване и ако има предишен звук.
        ((phase === 'measure' && compHistory.length > 0)
          ? '<button class="pt-back" type="button" data-action="back-comparison">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"' +
              ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<polyline points="15 18 9 12 15 6"/></svg>' +
              'Назад към предишния' +
            '</button>'
          : '') +
        '<button class="pt-quit" type="button" data-action="quit">' +
          '<span class="pt-quit-main">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
              '<rect x="6" y="5" width="4" height="14" rx="1"/>' +
              '<rect x="14" y="5" width="4" height="14" rx="1"/></svg>' +
            'Спри засега' +
          '</span>' +
          '<span class="pt-quit-sub">Запазваме докъде стигнахте</span>' +
        '</button>' +
      '</div>'
    );
    bindClicks(app);
    scheduleAutoPlay();
  }

  // Икони (inline SVG, без emoji — design canon).
  var SVG_SPEAKER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
    '<path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>';
  var SVG_REPLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M3 12a9 9 0 1 0 2.6-6.4"/><polyline points="3 3 3 9 9 9"/></svg>';
  var SVG_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"' +
    ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="20 6 9 17 4 12"/></svg>';

  // Карта за един звук: голям бутон „чуй" + (след прослушване) действия
  // „Чуй пак" / „Това е моят". БЕЗ задържане — изборът е ясно натискане,
  // а звукът спира щом свърши → не пищи докато потребителят решава (Тихол UX).
  function toneCardHtml(letter) {
    return (
      '<div class="pt-tone-card" data-tone-card="' + letter + '">' +
        '<button class="pt-tone-btn" type="button" data-action="hear" data-tone="' + letter + '"' +
          ' aria-label="Звук ' + letter + ' — натиснете, за да чуете">' +
          '<span class="pt-tone-icon" aria-hidden="true">' + SVG_SPEAKER + '</span>' +
          '<span class="pt-tone-label">Звук ' + letter + '</span>' +
          '<span class="pt-tone-hint" data-tone-hint="' + letter + '">Натиснете, за да чуете</span>' +
        '</button>' +
        '<div class="pt-tone-actions" data-tone-actions="' + letter + '">' +
          '<button class="pt-tone-replay" type="button" data-action="replay" data-tone="' + letter + '">' +
            SVG_REPLAY + '<span>Чуй пак</span></button>' +
          '<button class="pt-tone-choose" type="button" data-action="choose" data-tone="' + letter + '">' +
            SVG_CHECK + '<span>Това е моят</span></button>' +
        '</div>' +
      '</div>'
    );
  }

  // Auto-play A → после B (и двата сами, без натискане).
  function scheduleAutoPlay() {
    var c = ensureContext();
    if (c && c.state === 'suspended') c.resume().catch(function () {});
    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
    autoPlayTimer = setTimeout(function () {
      autoPlayTimer = null;
      if (!onTrial() || isPlayingTone || holdState) return;
      playLetter('A', true, function () {
        if (!onTrial() || holdState || isPlayingTone) return;
        playLetter('B', true);
      });
    }, AUTO_PLAY_DELAY_MS);
  }

  function onTrial() { return !!document.querySelector('.pt-tone-btn[data-tone]'); }
  function freqForLetter(letter) { return pair ? (letter === 'A' ? pair.fA : pair.fB) : 0; }

  function setHint(letter, html) {
    var hint = document.querySelector('[data-tone-hint="' + letter + '"]');
    if (hint) hint.innerHTML = html;
  }

  function clearToneVisual(letter) {
    var btn = document.querySelector('[data-tone="' + letter + '"]');
    if (btn) btn.classList.remove('pt-tone-btn--playing');
  }

  function stopCurrentTone() {
    if (currentToneHandle && currentToneHandle.stop) { try { currentToneHandle.stop(); } catch (e) {} }
    clearToneVisual(currentToneLetter);
    currentToneHandle = null; currentToneLetter = null; isPlayingTone = false;
  }

  // Принудително пуска стимула за letter (без toggle). onDone → след пълния край.
  function playLetter(letter, gentle, onDone) {
    if (!pair) return;
    if (isPlayingTone) stopCurrentTone();
    var freq = freqForLetter(letter);
    if (!freq) return;
    isPlayingTone = true;
    currentToneLetter = letter;
    var btn = document.querySelector('.pt-tone-btn[data-tone="' + letter + '"]');
    if (btn) btn.classList.add('pt-tone-btn--playing');
    // Щом звукът е чут → разкрий действията „Чуй пак" / „Това е моят" на тази карта.
    var card = document.querySelector('[data-tone-card="' + letter + '"]');
    if (card) card.classList.add('is-heard');
    var handle = playStimulus(freq, NBN_DURATION_MS, gentle === true ? AUTO_FADE_IN_MS : FADE_MS);
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
      if (typeof onDone === 'function') onDone();
    });
  }

  // ── Hold-to-select: натисни = чуй · задръж ~1.4с = избери (пръстен се пълни) ──
  // Pointer capture → пръстът може да трепери/мърда, без да прекъсва (70+ tremor).
  var holdState = null;
  var HOLD_MS = 1400;

  function bindHold(app) {
    var btns = app.querySelectorAll('.pt-tone-btn[data-tone]');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        var letter = btn.getAttribute('data-tone');
        btn.addEventListener('pointerdown', function (e) {
          if (e.cancelable) e.preventDefault();
          try { btn.setPointerCapture(e.pointerId); } catch (x) {}
          onHoldStart(letter, btn);
        });
        btn.addEventListener('pointerup', onHoldEnd);
        btn.addEventListener('pointercancel', onHoldEnd);
      })(btns[i]);
    }
  }

  function onHoldStart(letter, btn) {
    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
    cancelHold();
    playLetter(letter, false);                 // чуй го (и докато държиш)
    var ring = btn.querySelector('.pt-hold-ring');
    holdState = { letter: letter, btn: btn, ring: ring, start: now(), raf: null, timer: null };
    btn.classList.add('pt-tone-btn--holding');
    setHint(letter, 'Задръж…');
    // Завършването е през setTimeout (надеждно), НЕ през rAF — за да работи
    // и когато rAF е throttled (фон/енергоспестяване). rAF само за визуалния пълнеж.
    holdState.timer = setTimeout(completeHold, HOLD_MS);
    holdState.raf = requestAnimationFrame(holdTick);
  }

  function holdTick() {
    if (!holdState) return;
    var p = Math.min(1, (now() - holdState.start) / HOLD_MS);
    if (holdState.ring) holdState.ring.style.setProperty('--fill', p.toFixed(3));
    if (p < 1) holdState.raf = requestAnimationFrame(holdTick);
  }

  function cancelHold() {
    if (!holdState) return;
    if (holdState.raf) cancelAnimationFrame(holdState.raf);
    if (holdState.timer) clearTimeout(holdState.timer);
    if (holdState.btn) holdState.btn.classList.remove('pt-tone-btn--holding');
    if (holdState.ring) holdState.ring.style.setProperty('--fill', '0');
    setHint(holdState.letter, 'Натисни = чуй<br>Задръж = избери');
    holdState = null;
  }

  function onHoldEnd() {
    // Пуснато преди пълнене → беше леко натискане (чуване). Reset, без избор.
    cancelHold();
  }

  function completeHold() {
    var letter = holdState ? holdState.letter : null;
    cancelHold();
    if (!letter) return;
    try { if (navigator.vibrate) navigator.vibrate(30); } catch (e) {}
    selectLetter(letter);
  }

  function selectLetter(letter) {
    if (!pair || typeof pair.onPick !== 'function') return;
    stopCurrentTone();
    var chosenFreq = freqForLetter(letter);
    var which = (chosenFreq === pair.fLow) ? 'lower' : 'higher';
    var cb = pair.onPick;
    pair = null;
    cb(which);
  }

  // ── НОВА интеракция (Тихол): натисни „Звук X" → чуй (спира сам) → изскачат
  // „Чуй пак" + „Това е моят". Изборът е натискане, не задържане; звукът не
  // продължава да пищи докато решаваш. ──
  function cancelAutoPlay() {
    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
  }

  function onHearTone(letter) {
    if (!letter) return;
    cancelAutoPlay();
    playLetter(letter, false);
  }

  function onChooseTone(letter) {
    if (!letter) return;
    cancelAutoPlay();
    selectLetter(letter);
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
        if (which === 'lower' && octaveState.shifts < 3) {   // избрал 0.5F → надолу
          octaveState.base = halfF; octaveState.shifts += 1; octaveState.step = 0;
        }
        nextOctaveStep();
      });
    } else if (octaveState.step === 2) {
      var dblF = octaveState.base * 2;
      if (dblF > F_MAX) { return nextOctaveStep(); }
      presentPair(octaveState.base, dblF, { progressLabel: 'Проверка на октава', sub: 'горна октава', pct: 100 }, function (which) {
        octaveState.trials.push({ pair: 'F_vs_2F', choice: which });
        if (which === 'higher' && octaveState.shifts < 3) {  // избрал 2F → нагоре
          octaveState.base = dblF; octaveState.shifts += 1; octaveState.step = 0;
        }
        nextOctaveStep();
      });
    } else {
      // Честотата е намерена → ЗАПАЗИ ВЕДНАГА (надеждно — дори потребителят да
      // не довърши слайдера, тестът се отчита), после финален слайдер за контрол.
      saveResult(octaveState.base);
      renderFineTune(lastResultFreq);
    }
  }

  // ============================================================
  // ФИНАЛЕН СЛАЙДЕР — „нагласи точно своя тон" (усещане за контрол).
  // Анкорван на намерената честота (±1 октава); live тон/NBN докато плъзга.
  // ============================================================
  var fineHandle = null, fineIdleTimer = null, fineFreq = 0, fineLo = 0, fineHi = 0;

  function renderFineTune(measuredFreq) {
    phase = 'finetune';
    var f0 = (measuredFreq && isFinite(measuredFreq) && measuredFreq > 0)
      ? measuredFreq : Math.round(bayesMeanHz());
    f0 = Math.max(F_MIN, Math.min(F_MAX, f0));
    fineFreq = f0;
    fineLo = Math.log(Math.max(F_MIN, f0 / 2)) / Math.log(2);
    fineHi = Math.log(Math.min(F_MAX, f0 * 2)) / Math.log(2);
    var pct = Math.round((Math.log(f0) / Math.log(2) - fineLo) / (fineHi - fineLo) * 100);
    var app = el('app');
    if (!app) { renderReward(f0, bayesCIHalfOct()); return; }   // вече е запазено
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Нагласи точно своя тон</h1>' +
          '<p class="pt-subtitle">Плъзгай бавно, докато звукът стане<br>точно като твоя тинитус.</p>' +
        '</header>' +
        '<div class="pt-finetune">' +
          '<div class="pt-finetune-val" id="ptFineVal">' + escapeHtml(fmtFreq(f0)) + '</div>' +
          '<input type="range" class="pt-finetune-slider" id="ptFineSlider" min="0" max="100" step="1"' +
            ' value="' + pct + '" aria-label="Фина настройка на честотата">' +
          '<div class="pt-finetune-hint"><span>по-ниско</span><span>по-високо</span></div>' +
        '</div>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="finetune-done">Това е моят тон</button>' +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
    var sl = el('ptFineSlider');
    if (sl) { sl.addEventListener('input', onFineInput); sl.addEventListener('change', onFineInput); }
  }

  function onFineInput(e) {
    var p = parseInt(e.currentTarget.value, 10);
    if (isNaN(p)) return;
    var lg = fineLo + (p / 100) * (fineHi - fineLo);
    fineFreq = Math.round(Math.pow(2, lg));
    var lbl = el('ptFineVal'); if (lbl) lbl.textContent = fmtFreq(fineFreq);
    playFineTone(fineFreq);
  }

  function playFineTone(freq) {
    var c = ensureContext();
    if (!c || !masterGain) return;
    if (c.state === 'suspended') c.resume().catch(function () {});
    if (fineIdleTimer) { clearTimeout(fineIdleTimer); fineIdleTimer = null; }
    if (fineHandle) {
      try {
        if (fineHandle.osc) fineHandle.osc.frequency.setTargetAtTime(freq, c.currentTime, 0.02);
        if (fineHandle.bp) fineHandle.bp.frequency.setTargetAtTime(freq, c.currentTime, 0.02);
      } catch (e) {}
    } else {
      var gain = c.createGain(); gain.gain.value = 0;
      if (stimulusType === 'tone') {
        var osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
        osc.connect(gain); try { osc.start(); } catch (e) {}
        fineHandle = { osc: osc, gain: gain };
      } else {
        var src = c.createBufferSource(); src.buffer = getNoiseBuffer(c); src.loop = true;
        var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = NBN_Q;
        src.connect(bp); bp.connect(gain); try { src.start(); } catch (e) {}
        fineHandle = { src: src, bp: bp, gain: gain };
      }
      gain.connect(masterGain);
      var target = (stimulusType === 'tone') ? Math.min(0.5, clampGain(calibGain * 0.6)) : clampGain(calibGain);
      gain.gain.linearRampToValueAtTime(target, c.currentTime + 0.15);
    }
    // спри при бездействие (плъзгането спряло) → не звучи вечно
    fineIdleTimer = setTimeout(stopFineTone, 1800);
  }

  function stopFineTone() {
    if (fineIdleTimer) { clearTimeout(fineIdleTimer); fineIdleTimer = null; }
    if (!fineHandle) return;
    var h = fineHandle; fineHandle = null;
    try {
      if (ctx) {
        var n = ctx.currentTime;
        h.gain.gain.cancelScheduledValues(n);
        h.gain.gain.setValueAtTime(h.gain.gain.value, n);
        h.gain.gain.linearRampToValueAtTime(0, n + 0.15);
      }
    } catch (e) {}
    setTimeout(function () {
      try { if (h.osc) h.osc.stop(); } catch (e) {}
      try { if (h.src) h.src.stop(); } catch (e) {}
      try { if (h.osc) h.osc.disconnect(); } catch (e) {}
      try { if (h.src) h.src.disconnect(); } catch (e) {}
      try { if (h.bp) h.bp.disconnect(); } catch (e) {}
      try { h.gain.disconnect(); } catch (e) {}
    }, 200);
  }

  function onFineTuneDone() {
    stopFineTone();
    // Обнови запазената честота с фино-настроената (мутирай последния запис).
    var freq = Math.round(fineFreq);
    if (!freq || freq <= 0 || !isFinite(freq)) freq = lastResultFreq || 4000;
    freq = Math.max(F_MIN, Math.min(F_MAX, freq));
    lastResultFreq = freq;
    var s = window.AppState;
    if (s && s.pitchTests && s.pitchTests.length) {
      s.pitchTests[s.pitchTests.length - 1].freq = freq;
      try { localStorage.setItem('auralis-pitch-tests', JSON.stringify(s.pitchTests)); } catch (e) {}
    }
    phase = 'done';
    renderReward(freq, bayesCIHalfOct());   // ВИНАГИ награда
  }

  // ============================================================
  // Finalize / save — ЗАПАЗВА веднага щом честотата е намерена (преди слайдера).
  // ============================================================

  function saveResult(measuredFreq) {
    var freq = Math.round(measuredFreq);
    if (!freq || freq <= 0 || !isFinite(freq)) freq = Math.round(bayesMeanHz()) || 4000;
    freq = Math.max(F_MIN, Math.min(F_MAX, freq));
    lastResultFreq = freq;
    phase = 'done';
    clearPitchActive();   // резултатът е запазен → вече не е „недовършен"
    var ciOct = bayesCIHalfOct();
    var s = window.AppState;
    if (s && s.addPitchTest) {
      s.addPitchTest({
        freq: freq,
        trials: measurements,
        octaveCheck: {
          method: (stimulusType === 'tone' ? 'tone' : 'NBN') + '-2AFC-bayesian+finetune',
          measurements: bayes.n,
          ciHalfOct: isFinite(ciOct) ? Number(ciOct.toFixed(3)) : null,
          meanHz: Math.round(bayesMeanHz()),
          octaveTrials: octaveState ? octaveState.trials : []
        }
      });
    }
  }

  // ============================================================
  // 🪝 НАГРАДАТА — notched звук (остатъчно инхибиране) = „първото облекчение"
  // ============================================================
  // Розов шум с изрязана точно намерената честота (doc 06). Engine-ът сам
  // прилага notch на реалните звуци после; тук е демонстрацията на ефекта.
  // Warming lowpass sweep към края → топъл „природен" завършек („и двете").
  var rewardHandle = null;
  var rewardTimer = null;
  var lastResultFreq = 0;
  var REWARD_MS = 34000;

  function renderReward(freq, ciOct) {
    var app = el('app');
    if (!app) { goNext(); return; }
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Намерихме Вашата честота</h1>' +
          '<p class="pt-subtitle">Слушайте спокойно — звукът е настроен за Вас.<br>Дишайте бавно.</p>' +
        '</header>' +
        '<div class="pt-reward">' +
          '<div class="pt-breathe" aria-hidden="true"><span></span></div>' +
          '<div class="pt-reward-freq">' + escapeHtml(fmtFreq(freq)) + '</div>' +
        '</div>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--ghost" type="button" data-action="reward-done">Готово</button>' +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
    playReward(freq);
    if (rewardTimer) clearTimeout(rewardTimer);
    rewardTimer = setTimeout(function () { rewardTimer = null; finishReward(); }, REWARD_MS);
  }

  function playReward(freq) {
    var c = ensureContext();
    if (!c || !masterGain) return;
    if (c.state === 'suspended') c.resume().catch(function () {});
    var src = c.createBufferSource();
    src.buffer = getNoiseBuffer(c); src.loop = true;
    var notch = c.createBiquadFilter();
    notch.type = 'notch'; notch.frequency.value = freq; notch.Q.value = 2.0;
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 16000; lp.Q.value = 0.7;
    var gain = c.createGain(); gain.gain.value = 0;
    src.connect(notch); notch.connect(lp); lp.connect(gain); gain.connect(masterGain);
    try { src.start(); } catch (e) {}
    var n = c.currentTime;
    var lvl = clampGain(NBN_LEVEL() * calibGain * 1.15);
    gain.gain.linearRampToValueAtTime(lvl, n + 2.2);              // нежно влизане
    try {
      lp.frequency.setValueAtTime(16000, n + 20);                 // 20с ясен шум
      lp.frequency.exponentialRampToValueAtTime(650, n + 32);     // топъл „природен" завършек
    } catch (e) {}
    rewardHandle = { src: src, notch: notch, lp: lp, gain: gain };
  }

  function stopReward() {
    if (rewardTimer) { clearTimeout(rewardTimer); rewardTimer = null; }
    if (!rewardHandle) return;
    var h = rewardHandle; rewardHandle = null;
    try {
      if (ctx) {
        var n = ctx.currentTime;
        h.gain.gain.cancelScheduledValues(n);
        h.gain.gain.setValueAtTime(h.gain.gain.value, n);
        h.gain.gain.linearRampToValueAtTime(0, n + 0.6);
      }
    } catch (e) {}
    setTimeout(function () {
      try { h.src.stop(); } catch (e) {}
      try { h.src.disconnect(); } catch (e) {}
      try { h.notch.disconnect(); } catch (e) {}
      try { h.lp.disconnect(); } catch (e) {}
      try { h.gain.disconnect(); } catch (e) {}
    }, 700);
  }

  function finishReward() {
    stopReward();
    renderRewardAsk();
  }

  function renderRewardAsk() {
    var app = el('app');
    if (!app) { goNext(); return; }
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Усетихте ли разлика?</h1>' +
          '<p class="pt-subtitle">При мнозина писъкът утихва за няколко минути след това.</p>' +
        '</header>' +
        '<div class="pt-pretest-options">' +
          ptOption('reward-felt', 'yes', 'Да, по-тихо е', 'Писъкът намаля') +
          ptOption('reward-felt', 'little', 'Малко', 'Лека промяна') +
          ptOption('reward-felt', 'no', 'Не усетих', 'Няма промяна сега') +
        '</div>' +
        (testMode === 'quick'
          ? '<p class="pt-finish-note">За още по-точна честота можете да ' +
            'довършите теста по-късно — когато Ви е удобно.</p>'
          : '') +
      '</div>'
    );
    bindClicks(app);
  }

  function onRewardFelt(value) {
    try {
      var s = window.AppState;
      if (s) { s.pitchRewardFelt = value; if (s.persist) s.persist(); }
    } catch (e) {}
    goNext();
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
      case 'calib-stop': onCalibStop(); break;
      case 'hear':       onHearTone(btn.getAttribute('data-tone')); break;
      case 'replay':     onHearTone(btn.getAttribute('data-tone')); break;
      case 'choose':     onChooseTone(btn.getAttribute('data-tone')); break;
      case 'back-comparison': goBackComparison(); break;
      case 'retest':     open({ mode: 'precise' }); break;
      case 'quit':       onQuit(); break;
      case 'reward-done': finishReward(); break;
      case 'reward-felt': onRewardFelt(btn.getAttribute('data-value')); break;
      case 'finetune-done': onFineTuneDone(); break;
      case 'skip-continue': goNext(); break;
    }
  }

  // „Спри засега" — спокоен изход по всяко време, без вина. Нищо не се губи.
  function onQuit() {
    cleanupAudio();
    var app = el('app');
    if (!app) { goNext(); return; }
    app.innerHTML = (
      '<div class="pt-screen" data-screen="pitch_test">' +
        '<header class="pt-header">' +
          '<h1 class="pt-title">Няма проблем 🙂</h1>' +
          '<p class="pt-subtitle">Спряхте теста. Можете да го направите по-късно, ' +
            'когато Ви е удобно — отнема само минута.</p>' +
        '</header>' +
        '<div class="pt-actions">' +
          '<button class="pt-btn pt-btn--primary" type="button" data-action="skip-continue">Към началото</button>' +
        '</div>' +
      '</div>'
    );
    bindClicks(app);
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
    cancelHold();
    stopCurrentTone();
    stopCalibTone();
    stopFineTone();
    stopReward();
  }

  // ============================================================
  // Resume persistence — недовършен тест (запазва на граница на замерване)
  // ============================================================
  // Pitch тестът е аудио state machine; пазим прогреса на ниво „завършено
  // замерване" (НЕ по средата на едно 2AFC сравнение). На resume продължаваме
  // от следващото замерване — вече направените НЕ се повтарят.

  function savePitchActive() {
    try {
      localStorage.setItem(STORAGE_ACTIVE, JSON.stringify({
        v: 1,
        mode: testMode,
        stim: stimulusType,
        calibGain: calibGain,
        phase: phase,
        bayes: bayes,
        meas: measurements,
        ts: Date.now()
      }));
    } catch (e) { /* ignore */ }
  }

  function clearPitchActive() {
    try { localStorage.removeItem(STORAGE_ACTIVE); } catch (e) { /* ignore */ }
  }

  function readPitchActive() {
    try { var raw = localStorage.getItem(STORAGE_ACTIVE); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }

  // Public за Home: докъде стигна недовършеният тест (или null).
  // { n: завършени замервания, total, phase, mode }
  function activeProgress() {
    var a = readPitchActive();
    if (!a || !a.bayes || !(a.bayes.n > 0)) return null;
    if (a.phase === 'finetune' || a.phase === 'done') return null;  // вече има резултат
    var total = (a.mode === 'precise') ? MIN_MEAS : QUICK_MEAS;
    return { n: a.bayes.n, total: total, phase: a.phase, mode: a.mode || 'quick' };
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

  function open(opts) {
    cleanupAudio();
    clearPitchActive();                 // нов тест → захвърли стар недовършен
    testMode = (opts && opts.mode === 'precise') ? 'precise' : 'quick';
    phase = 'pretest';
    bayesReset();
    calibGain = CALIB_GAIN_DEFAULT;
    var s = window.AppState;
    if (s && s.transition) s.transition('pitch_test');
    history.pushState({ phase: 'pitch_test' }, '');
    refresh();
    scrollTop();
  }

  // Resume — продължи недовършен тест от следващото замерване (вече
  // направените замервания се пазят; не се повтарят). Викан от Home бутон
  // (user gesture → audio context може да стартира).
  function resume() {
    var a = readPitchActive();
    if (!a || !a.bayes || !(a.bayes.n > 0) || a.phase === 'finetune' || a.phase === 'done') {
      open();   // няма какво смислено да продължим → чист тест
      return;
    }
    cleanupAudio();
    testMode = a.mode || 'quick';
    stimulusType = a.stim || 'tone';
    calibGain = (typeof a.calibGain === 'number') ? a.calibGain : CALIB_GAIN_DEFAULT;
    bayes = (a.bayes && typeof a.bayes.n === 'number') ? a.bayes : { n: 0, mean: 0, M2: 0 };
    measurements = Array.isArray(a.meas) ? a.meas : [];
    octaveState = null;
    var s = window.AppState;
    if (s && s.transition) s.transition('pitch_test');
    history.pushState({ phase: 'pitch_test' }, '');
    scrollTop();
    if (a.phase === 'octave') {
      phase = 'octave';
      startOctaveVerification(bayesMeanHz());
    } else {
      phase = 'measure';
      startMeasurement();
    }
  }

  // Router/onboarding entry hook — започва теста чисто (reset на engine state).
  // Онбординг Ден 1 = quick режим (кратък, предвидим прогрес).
  function render() {
    cleanupAudio();
    clearPitchActive();
    testMode = 'quick';
    phase = 'pretest';
    bayesReset();
    calibGain = CALIB_GAIN_DEFAULT;
    refresh();
    scrollTop();
  }

  return {
    open: open,
    render: render,
    resume: resume,
    activeProgress: activeProgress,
    _GRID: GRID,
    _bayes: function () { return { n: bayes.n, meanHz: bayesMeanHz(), ciOct: bayesCIHalfOct() }; },
    _pair: function () { return pair ? { fA: pair.fA, fB: pair.fB, fLow: pair.fLow, fHigh: pair.fHigh } : null; },
    _phase: function () { return phase; }
  };
})();
