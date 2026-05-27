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
  var INITIAL_VOLUME = 30;
  var MAX_VOLUME = 75;
  var WARN_THRESHOLD = 70;

  var currentVolume = INITIAL_VOLUME;
  var isPlaying = false;
  var lastWarnTs = 0;
  var doneCallback = null;

  function el(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ============================================================
  // HTML
  // ============================================================

  function buildHtml() {
    // Copy от Code 3: volume_calibration_text_bg.md v1.0 (26.05.2026, ~149 думи).
    // Заглавие / подзаглавие / кратко обяснение / 3 стъпки / какво НЕ / disclaimer.
    var warningHtml = (currentVolume >= WARN_THRESHOLD)
      ? '<div class="vc-warning">Над 70% може да увреди слуха при дълго слушане.</div>'
      : '';

    var playLabel = isPlaying ? 'Спрете тестовия звук' : 'Пуснете тестовия звук';
    var playAction = isPlaying ? 'stop-test' : 'play-test';

    return (
      '<div class="vc-screen" data-screen="calibration">' +
        '<h1 class="vc-title">Настройка на силата</h1>' +
        '<p class="vc-subtitle">Намерете нивото, което работи за Вас.</p>' +

        '<section class="vc-section vc-explain">' +
          '<p class="vc-line">Звуковата терапия работи най-добре, когато фоновият звук е малко по-тих от Вашия тинитус — двата звука се смесват частично, а не се заглушават. Това се нарича „точка на смесване" и е принципът, който позволява на мозъка постепенно да привикне.</p>' +
        '</section>' +

        '<section class="vc-section vc-steps">' +
          '<h2 class="vc-section-title">Три стъпки</h2>' +
          '<ol class="vc-steps-list">' +
            '<li><strong>Седнете в тиха стая.</strong> Уверете се, че няма телевизор, разговор или шум от пътя.</li>' +
            '<li><strong>Пуснете тестовия звук.</strong> Слушайте на ниско ниво в продължение на 20 секунди.</li>' +
            '<li><strong>Постепенно увеличавайте силата.</strong> Спрете в момента, в който чувате едновременно и тинитуса, и фоновия звук. Те трябва да съществуват заедно.</li>' +
          '</ol>' +
        '</section>' +

        '<section class="vc-section vc-test">' +
          '<button class="vc-test-btn" type="button" data-action="' + playAction + '">' +
            escapeHtml(playLabel) +
          '</button>' +
        '</section>' +

        '<section class="vc-section vc-slider-section">' +
          '<div class="vc-slider-head">' +
            '<span class="vc-slider-label">Сила</span>' +
            '<span class="vc-slider-value" id="vcVolValue">' + currentVolume + '%</span>' +
          '</div>' +
          '<input type="range" class="vc-slider" id="vcVolSlider"' +
            ' min="0" max="' + MAX_VOLUME + '" step="1"' +
            ' value="' + currentVolume + '"' +
            ' aria-label="Сила на звука от 0 до ' + MAX_VOLUME + ' процента"' +
            ' aria-valuetext="' + currentVolume + ' от ' + MAX_VOLUME + '" />' +
          '<div class="vc-slider-hint">Макс ' + MAX_VOLUME + '% — над това = риск за слуха</div>' +
          warningHtml +
        '</section>' +

        '<section class="vc-section vc-warn-block">' +
          '<h2 class="vc-section-title">Какво да НЕ правите</h2>' +
          '<p class="vc-line">Не увеличавайте до пълно заглушаване на тинитуса. Това натоварва слуха и тренира мозъка да очаква пълна тишина — обратното на нашата цел.</p>' +
        '</section>' +

        '<div class="vc-actions">' +
          '<button class="vc-btn vc-btn--primary" type="button" data-action="confirm">' +
            'Това е добре' +
          '</button>' +
          '<button class="vc-btn vc-btn--ghost" type="button" data-action="skip">' +
            'По-късно' +
          '</button>' +
        '</div>' +

        '<p class="vc-disclaimer">AURALIS е инструмент за общо благополучие, не медицински продукт.</p>' +
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
    // Toggle warning visibility (cheap re-render на section)
    var section = document.querySelector('.vc-slider-section');
    if (section) {
      var existing = section.querySelector('.vc-warning');
      if (currentVolume >= WARN_THRESHOLD && !existing) {
        var warn = document.createElement('div');
        warn.className = 'vc-warning';
        warn.textContent = 'Над 70% може да увреди слуха при дълго слушане.';
        section.appendChild(warn);
      } else if (currentVolume < WARN_THRESHOLD && existing) {
        existing.parentNode.removeChild(existing);
      }
    }
    // Throttled toast for >WARN_THRESHOLD
    if (currentVolume >= WARN_THRESHOLD) {
      var now = Date.now();
      if (now - lastWarnTs > 8000) {
        lastWarnTs = now;
        if (window.Toast && window.Toast.warning) {
          window.Toast.warning('Внимание: висока сила може да увреди слуха.');
        }
      }
    }
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'play-test') {
      startTest();
      refresh();
    } else if (action === 'stop-test') {
      stopTest();
      refresh();
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
      var needsThi = s && (typeof s.thiBaseline !== 'number')
                       && window.ThiBaseline && window.ThiBaseline.open;
      var needsPitch = s && s.isPitchTestDone && !s.isPitchTestDone()
                        && window.PitchTest && window.PitchTest.render;
      if (needsThi) {
        // ThiBaseline.open() сам прави transition + history push + render.
        window.ThiBaseline.open();
      } else if (needsPitch) {
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
