/**
 * AURALIS SOS — 4-7-8 Breathing Exercise (safety-critical)
 * ==========================================================
 * ALWAYS accessible: даже при expired trial, no internet, audio not loaded,
 * i18n не зареден. SOS трябва да работи в най-лошия възможен сценарий.
 *
 * Per BIBLE v3 / handoff:
 *  - Full-screen takeover (НЕ модал върху модал)
 *  - НЕ auto-dismiss — потребителят излиза сам
 *  - Circle анимация чрез CSS transform (батерия — НЕ JS RAF)
 *  - 4-7-8 protocol: inhale 4s → hold 7s → exhale 8s → pause 1s (cycle = 20s)
 *  - 4 цикъла = 80 sec total
 *  - SOS може да се open() от навсякъде: window.SOS.open()
 *
 * Public API:
 *   SOS.open()  — full-screen takeover
 *   SOS.close() — close + cleanup
 *   SOS.restart() — нов 4-cycle run (за "Още един цикъл")
 */

window.SOS = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================

  var INHALE_SEC = 4;
  var HOLD_SEC = 7;
  var EXHALE_SEC = 8;
  var PAUSE_SEC = 1;
  var CYCLE_SEC = INHALE_SEC + HOLD_SEC + EXHALE_SEC + PAUSE_SEC; // 20
  var TOTAL_CYCLES = 4;
  var TOTAL_DURATION_SEC = CYCLE_SEC * TOTAL_CYCLES; // 80

  // ============================================================
  // STATE
  // ============================================================

  var overlay = null;
  var phaseTickId = null;
  var startTimeMs = 0;

  // ============================================================
  // i18n (graceful fallback ако i18n не е зареден)
  // ============================================================

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
  // HTML builders
  // ============================================================

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
  }

  function buildExerciseHtml() {
    return (
      '<button class="sos-close" type="button" data-action="close"' +
        ' aria-label="' + escapeHtml(t('ui.sos.closeAria', 'Спрете упражнението')) + '">' +
        svgClose() +
      '</button>' +

      '<div class="sos-instructions-top">' +
        escapeHtml(t('ui.sos.instructionsTop', 'Дишайте бавно през носа')) +
      '</div>' +

      '<div class="sos-stage">' +
        // CSS-only animated circle (transform → батерия-friendly)
        '<div class="sos-circle" aria-hidden="true">' +
          '<div class="sos-circle-inner"></div>' +
        '</div>' +
        '<div class="sos-text-overlay">' +
          '<div class="sos-phase" id="sosPhase">' +
            escapeHtml(t('ui.sos.inhale', 'ВДИШАЙТЕ')) +
          '</div>' +
          '<div class="sos-countdown" id="sosCountdown">' + INHALE_SEC + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="sos-cycle" id="sosCycle">' +
        escapeHtml(t('ui.sos.cycle', 'Цикъл 1 от 4', { n: 1, total: TOTAL_CYCLES })) +
      '</div>' +

      '<button class="sos-stop-btn" type="button" data-action="close">' +
        escapeHtml(t('ui.sos.stop', 'Спрете упражнението')) +
      '</button>'
    );
  }

  function buildEndHtml() {
    return (
      '<button class="sos-close" type="button" data-action="close"' +
        ' aria-label="' + escapeHtml(t('ui.sos.closeAria', 'Спрете упражнението')) + '">' +
        svgClose() +
      '</button>' +

      '<div class="sos-end">' +
        '<div class="sos-end-circle" aria-hidden="true"></div>' +
        '<h1 class="sos-end-title">' +
          escapeHtml(t('ui.sos.end.title', 'По-добре ли сте?')) +
        '</h1>' +
        '<div class="sos-end-actions">' +
          '<button class="sos-btn sos-btn--primary" type="button" data-action="close">' +
            escapeHtml(t('ui.sos.end.yes', 'Да, благодаря')) +
          '</button>' +
          '<button class="sos-btn sos-btn--ghost" type="button" data-action="restart">' +
            escapeHtml(t('ui.sos.end.again', 'Още един цикъл')) +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Exercise tick (1 sec interval — minimal overhead)
  // ============================================================

  function startExercise() {
    startTimeMs = Date.now();
    updatePhase();
    if (phaseTickId) clearInterval(phaseTickId);
    phaseTickId = setInterval(updatePhase, 250); // 4 ticks/sec за smooth countdown
  }

  function stopExercise() {
    if (phaseTickId) {
      clearInterval(phaseTickId);
      phaseTickId = null;
    }
  }

  function updatePhase() {
    var elapsedSec = (Date.now() - startTimeMs) / 1000;

    // Total duration past → switch към end screen
    if (elapsedSec >= TOTAL_DURATION_SEC) {
      stopExercise();
      showEndScreen();
      return;
    }

    var cycleIdx = Math.floor(elapsedSec / CYCLE_SEC);
    var inCycle = elapsedSec - cycleIdx * CYCLE_SEC;

    var phaseKey, secLeft;
    if (inCycle < INHALE_SEC) {
      phaseKey = 'inhale';
      secLeft = Math.ceil(INHALE_SEC - inCycle);
    } else if (inCycle < INHALE_SEC + HOLD_SEC) {
      phaseKey = 'hold';
      secLeft = Math.ceil(INHALE_SEC + HOLD_SEC - inCycle);
    } else if (inCycle < INHALE_SEC + HOLD_SEC + EXHALE_SEC) {
      phaseKey = 'exhale';
      secLeft = Math.ceil(INHALE_SEC + HOLD_SEC + EXHALE_SEC - inCycle);
    } else {
      phaseKey = 'pause';
      secLeft = 0;
    }

    var phaseEl = document.getElementById('sosPhase');
    var countEl = document.getElementById('sosCountdown');
    var cycleEl = document.getElementById('sosCycle');

    if (phaseEl) {
      var phaseLabel = t('ui.sos.' + phaseKey, phaseKey.toUpperCase());
      if (phaseEl.textContent !== phaseLabel) phaseEl.textContent = phaseLabel;
    }
    if (countEl) {
      var countText = (secLeft > 0 && phaseKey !== 'pause') ? String(secLeft) : '';
      if (countEl.textContent !== countText) countEl.textContent = countText;
    }
    if (cycleEl) {
      var cycleText = t('ui.sos.cycle', 'Цикъл ' + (cycleIdx + 1) + ' от ' + TOTAL_CYCLES,
        { n: cycleIdx + 1, total: TOTAL_CYCLES });
      if (cycleEl.textContent !== cycleText) cycleEl.textContent = cycleText;
    }
  }

  // ============================================================
  // End screen
  // ============================================================

  function showEndScreen() {
    if (!overlay) return;
    overlay.innerHTML = buildEndHtml();
    bindEvents();
  }

  // ============================================================
  // Open / close / restart
  // ============================================================

  function open() {
    if (overlay) return; // already open

    overlay = document.createElement('div');
    overlay.className = 'sos-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', t('ui.sos.openAria', 'SOS дишане'));
    overlay.innerHTML = buildExerciseHtml();

    document.body.appendChild(overlay);
    document.body.classList.add('sos-active'); // блокира scroll на background
    bindEvents();
    startExercise();
  }

  function close() {
    stopExercise();
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    document.body.classList.remove('sos-active');
  }

  function restart() {
    stopExercise();
    if (!overlay) {
      open();
      return;
    }
    overlay.innerHTML = buildExerciseHtml();
    bindEvents();
    startExercise();
  }

  function bindEvents() {
    if (!overlay) return;
    var actionEls = overlay.querySelectorAll('[data-action]');
    for (var i = 0; i < actionEls.length; i++) {
      actionEls[i].addEventListener('click', onAction);
    }
    // Escape key (desktop accessibility)
    if (!window._sosEscBound) {
      window.addEventListener('keydown', onKeyDown);
      window._sosEscBound = true;
    }
  }

  function onAction(e) {
    var action = e.currentTarget.getAttribute('data-action');
    if (action === 'close') close();
    else if (action === 'restart') restart();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape' && overlay) close();
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    open: open,
    close: close,
    restart: restart
  };
})();
