/**
 * AURALIS VolumeCalibration — mixing point calibration screen (SAFETY-2)
 * ===========================================================================
 * Показва се ПРЕДИ profile_results при първи post-quiz transition.
 * Учи потребителя как да намери своята "точка на смесване" (Jastreboff):
 * сила където ЧУВА тинитуса И звука едновременно, но звукът НЕ заглушава
 * тинитуса напълно.
 *
 * Flow:
 *   1. Educational копи
 *   2. Test play button → стартира brown_lp500 на 30% volume + L1/L2=70/30
 *   3. Master volume slider (0-75% MAX; soft warning >70%)
 *   4. "Това е правилната сила" → state.setCalibration(value), continue
 *
 * Public API:
 *   VolumeCalibration.open(onDone)  — explicit start (onDone callback)
 *   VolumeCalibration.render()       — router hook
 */

window.VolumeCalibration = (function () {
  'use strict';

  var TEST_NOISE_ID = 'brown_lp500';
  // UX FIX 2026-05-30 (Тихол): по презумпция НАЙ-силно, клиентите сами
  // намаляват. 70+ потребители оставяха default 30% и казваха "нищо не се
  // чува". Премахнат и 75% cap + warning toast — DSP safety limiter (-12 dBFS)
  // в audio-engine остава активен, така че защитата на слуха не е премахната.
  var INITIAL_VOLUME = 100;
  var MAX_VOLUME = 100;

  var currentVolume = INITIAL_VOLUME;
  var isPlaying = false;
  var doneCallback = null;

  function el(id) { return document.getElementById(id); }
  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ============================================================
  // HTML
  // ============================================================

  // FIX VC-BUTTON-FEEDBACK: SVG icons (Bible §1 #3 — не emoji). Inline
  // SVG за самостоятелна consistency без external sprite. Wave indicator
  // (3 bars) показва active playback подобно на pitch-test.
  var SVG_PLAY = '<svg class="vc-test-icon" viewBox="0 0 24 24" aria-hidden="true">' +
    '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  var SVG_STOP = '<svg class="vc-test-icon" viewBox="0 0 24 24" aria-hidden="true">' +
    '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>';
  var WAVE_BARS = '<span class="vc-test-wave" aria-hidden="true">' +
    '<span></span><span></span><span></span></span>';

  function buildTestBtnInner() {
    if (isPlaying) {
      return SVG_STOP +
        '<span class="vc-test-label">' + escapeHtml(t('ui.volumeCalib.testStop', 'Спри')) + '</span>' +
        WAVE_BARS;
    }
    return SVG_PLAY +
      '<span class="vc-test-label">' + escapeHtml(t('ui.volumeCalib.testPlay', 'Пуснете тестовия звук')) + '</span>';
  }

  // Partial update — само бутонът се променя (data-action + class + inner +
  // aria). Без full refresh() → vcEntry animation не se replay-ва → no flash.
  function updateTestButton() {
    var btn = document.querySelector('.vc-test-btn');
    if (!btn) return;
    btn.classList.toggle('is-playing', isPlaying);
    btn.setAttribute('data-action', isPlaying ? 'stop-test' : 'play-test');
    btn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    btn.setAttribute('aria-label', isPlaying ? t('ui.volumeCalib.testStopAria', 'Спри тестовия звук') : t('ui.volumeCalib.testPlayAria', 'Пусни тестовия звук'));
    btn.innerHTML = buildTestBtnInner();
  }

  // Haptic feedback (Vibration API) — supported на Android Chrome.
  // Кратко 20ms tap confirmation. iOS ignore-ва (no error).
  function hapticTap() {
    try {
      if (navigator.vibrate) navigator.vibrate(20);
    } catch (e) { /* ignore */ }
  }

  function buildHtml() {
    // Copy от Code 3: volume_calibration_text_bg.md v1.0 (26.05.2026, ~149 думи).
    // Заглавие / подзаглавие / кратко обяснение / 3 стъпки / какво НЕ / disclaimer.

    // FIX VC-BUTTON-FEEDBACK: button content builder (extracted за reuse в
    // updateTestButton partial render — избягва full screen re-render →
    // няма vcEntry animation flash на всеки tap).
    var btnInner = buildTestBtnInner();
    var btnClass = 'vc-test-btn' + (isPlaying ? ' is-playing' : '');
    var btnAction = isPlaying ? 'stop-test' : 'play-test';
    var btnAria = isPlaying ? t('ui.volumeCalib.testStopAria', 'Спри тестовия звук') : t('ui.volumeCalib.testPlayAria', 'Пусни тестовия звук');

    return (
      '<div class="vc-screen" data-screen="calibration">' +
        '<h1 class="vc-title">' + escapeHtml(t('ui.volumeCalib.title', 'Настройка на силата')) + '</h1>' +
        '<p class="vc-subtitle">' + escapeHtml(t('ui.volumeCalib.subtitle', 'Намерете нивото, което работи за Вас.')) + '</p>' +

        '<section class="vc-section vc-explain">' +
          '<p class="vc-line">' + escapeHtml(t('ui.volumeCalib.explain', 'Звуковата терапия работи най-добре, когато фоновият звук е малко по-тих от Вашия тинитус — двата звука се смесват частично, а не се заглушават. Това се нарича „точка на смесване" и е принципът, който позволява на мозъка постепенно да привикне.')) + '</p>' +
        '</section>' +

        '<section class="vc-section vc-steps">' +
          '<h2 class="vc-section-title">' + escapeHtml(t('ui.volumeCalib.stepsTitle', 'Три стъпки')) + '</h2>' +
          '<ol class="vc-steps-list">' +
            '<li>' + t('ui.volumeCalib.step1', '<strong>Седнете в тиха стая.</strong> Уверете се, че няма телевизор, разговор или шум от пътя.') + '</li>' +
            '<li>' + t('ui.volumeCalib.step2', '<strong>Пуснете тестовия звук.</strong> Слушайте на ниско ниво в продължение на 20 секунди.') + '</li>' +
            '<li>' + t('ui.volumeCalib.step3', '<strong>Намалявайте силата постепенно.</strong> Спрете в момента, в който чувате едновременно и тинитуса, и фоновия звук. Те трябва да съществуват заедно.') + '</li>' +
          '</ol>' +
        '</section>' +

        '<section class="vc-section vc-test">' +
          '<button class="' + btnClass + '" type="button" data-action="' + btnAction + '"' +
            ' aria-label="' + escapeHtml(btnAria) + '"' +
            ' aria-pressed="' + (isPlaying ? 'true' : 'false') + '">' +
            btnInner +
          '</button>' +
        '</section>' +

        '<section class="vc-section vc-slider-section">' +
          '<div class="vc-slider-head">' +
            '<span class="vc-slider-label">' + escapeHtml(t('ui.volumeCalib.sliderLabel', 'Сила')) + '</span>' +
            '<span class="vc-slider-value" id="vcVolValue">' + currentVolume + '%</span>' +
          '</div>' +
          '<input type="range" class="vc-slider" id="vcVolSlider"' +
            ' min="0" max="' + MAX_VOLUME + '" step="1"' +
            ' value="' + currentVolume + '"' +
            ' aria-label="' + escapeHtml(t('ui.volumeCalib.sliderAria', 'Сила на звука от 0 до {max} процента', { max: MAX_VOLUME })) + '"' +
            ' aria-valuetext="' + escapeHtml(t('ui.volumeCalib.sliderValuetext', '{v} от {max}', { v: currentVolume, max: MAX_VOLUME })) + '" />' +
          '<div class="vc-slider-hint">' + escapeHtml(t('ui.volumeCalib.sliderHint', 'Нагласете до ниво, което чувате удобно.')) + '</div>' +
        '</section>' +

        '<section class="vc-section vc-warn-block">' +
          '<h2 class="vc-section-title">' + escapeHtml(t('ui.volumeCalib.warnTitle', 'Какво да НЕ правите')) + '</h2>' +
          '<p class="vc-line">' + escapeHtml(t('ui.volumeCalib.warnBody', 'Не увеличавайте до пълно заглушаване на тинитуса. Това натоварва слуха и тренира мозъка да очаква пълна тишина — обратното на нашата цел.')) + '</p>' +
        '</section>' +

        '<div class="vc-actions">' +
          '<button class="vc-btn vc-btn--primary" type="button" data-action="confirm">' +
            escapeHtml(t('ui.volumeCalib.confirm', 'Това е добре')) +
          '</button>' +
          '<button class="vc-btn vc-btn--ghost" type="button" data-action="skip">' +
            escapeHtml(t('ui.volumeCalib.later', 'По-късно')) +
          '</button>' +
        '</div>' +

        '<p class="vc-disclaimer">' + escapeHtml(t('ui.volumeCalib.disclaimer', 'AURALIS е инструмент за общо благополучие, не медицински продукт.')) + '</p>' +
      '</div>'
    );
  }

  // ============================================================
  // Audio control
  // ============================================================

  function startTest() {
    if (!window.AudioEngine) return;
    isPlaying = true;
    // Layer 1: muted (tест е само на L2 фоновия шум — потребителят сравнява
    // силата на шума спрямо тинитуса)
    if (window.AudioEngine.setLayer1Volume) window.AudioEngine.setLayer1Volume(0);
    if (window.AudioEngine.setLayer2Volume) window.AudioEngine.setLayer2Volume(currentVolume);
    if (window.AudioEngine.setMasterVolume) window.AudioEngine.setMasterVolume(currentVolume);
    if (window.AudioEngine.playLayer2) {
      try { window.AudioEngine.playLayer2(TEST_NOISE_ID); }
      catch (e) { console.warn('[calibration] playLayer2 failed:', e); }
    }
  }

  function stopTest() {
    isPlaying = false;
    if (window.AudioEngine && window.AudioEngine.stopLayer2) {
      try { window.AudioEngine.stopLayer2(); } catch (e) {}
    }
  }

  function applyVolume(level) {
    currentVolume = Math.max(0, Math.min(MAX_VOLUME, level));
    if (window.AudioEngine) {
      if (window.AudioEngine.setLayer2Volume) window.AudioEngine.setLayer2Volume(currentVolume);
      if (window.AudioEngine.setMasterVolume) window.AudioEngine.setMasterVolume(currentVolume);
    }
    var lbl = el('vcVolValue');
    if (lbl) lbl.textContent = currentVolume + '%';
    // Update aria-valuetext за screen reader (TalkBack / VoiceOver)
    var slider = el('vcVolSlider');
    if (slider) slider.setAttribute('aria-valuetext', currentVolume + ' от ' + MAX_VOLUME);
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'play-test') {
      // FIX VC-BUTTON-FEEDBACK: partial update вместо refresh() — иначе
      // целият screen re-renders → vcEntry animation replay → flash.
      startTest();
      updateTestButton();
      hapticTap();
    } else if (action === 'stop-test') {
      stopTest();
      updateTestButton();
      hapticTap();
    } else if (action === 'confirm') {
      finishCalibration(currentVolume);
    } else if (action === 'skip') {
      // Записва default 50 + бележка че не е калибрирано explicitly.
      finishCalibration(50);
    }
  }

  function onSliderInput(e) {
    var v = parseInt(e.currentTarget.value, 10);
    if (isNaN(v)) return;
    applyVolume(v);
  }

  function finishCalibration(volume) {
    stopTest();
    var s = window.AppState;
    if (s && s.setCalibration) {
      s.setCalibration(volume);
      console.log('[calibration] saved mixing point volume:', volume);
    }
    var cb = doneCallback;
    doneCallback = null;
    if (typeof cb === 'function') {
      cb();
    } else {
      // CALIBRATION-ROUTING: profile_results → calibration → ...
      // Bug 5 fix (PACK C T1.5): THI-ENTRY insert. Преди това calibration
      // route скачаше директно на pitch_test или home → THI quiz никога
      // не беше достъпен → state.thiBaseline винаги null → THI badge на
      // Home не се показваше.
      //
      // Нов ред: thi_baseline (ако още не done) → pitch_test (ако не done)
      // → home. Това гарантира че всеки нов user попълва THI baseline
      // като част от onboarding.
      // ONBOARDING SIMPLIFICATION 2026-05-30 (Тихол): 25-те THI въпроса ИЗЛИЗАТ
      // от Ден-1 онбординга — твърде дълго за 70+. Ден 1 = калибрация → pitch
      // (quick) → награда → home. THI baseline се прави по-късно чрез нежен
      // banner на Home (търпеливо напомняне, не насила).
      var needsPitch = s && s.isPitchTestDone && !s.isPitchTestDone()
                        && window.PitchTest && window.PitchTest.render;
      if (needsPitch) {
        if (s.transition) s.transition('pitch_test');
        history.replaceState({ phase: 'pitch_test' }, '');
        window.PitchTest.render();
      } else {
        if (s && s.transition) s.transition('home');
        history.replaceState({ phase: 'home' }, '');
        if (window.Home && window.Home.render) {
          window.Home.render();
        }
      }
    }
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildHtml();
    app.addEventListener('click', onClick);
    var slider = el('vcVolSlider');
    if (slider) {
      slider.addEventListener('input', onSliderInput);
      slider.addEventListener('change', onSliderInput);
    }
  }

  // Bug 4 (PACK C): scroll-to-top при entry — preди това refresh() оставяше
  // window scroll position от предишен screen → user не виждаше title-а.
  function scrollToTop() {
    try {
      var supportsSmooth = 'scrollBehavior' in document.documentElement.style;
      var reduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (supportsSmooth && !reduced) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  function open(onDone) {
    doneCallback = typeof onDone === 'function' ? onDone : null;
    currentVolume = INITIAL_VOLUME;
    isPlaying = false;
    var s = window.AppState;
    if (s && s.transition) s.transition('calibration');
    history.pushState({ phase: 'calibration' }, '');
    refresh();
    scrollToTop();
  }

  function render() {
    refresh();
    scrollToTop();
  }

  return {
    open: open,
    render: render
  };
})();
