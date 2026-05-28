/**
 * AURALIS Onboarding Tour — micro-tooltips for first-time users (Task OO)
 * =========================================================================
 * 4 steps with spotlight overlay + tooltip. Skip-all always visible.
 * Triggers once after first Home render (auralis_tour_done != true).
 *
 * Public API:
 *   OnboardingTour.start()   — manually trigger tour
 *   OnboardingTour.tryStart() — auto-check if needed, call from Home.render
 */

window.OnboardingTour = (function () {
  'use strict';

  var STORAGE_KEY = 'auralis_tour_done';
  var overlay = null;
  var currentStep = 0;

  var STEPS = [
    {
      selector: '.home-cat:first-child, .cat-card:first-child, [data-cat-id]',
      text: 'tourStep1',
      fallbackText: 'Tap да изпробвате',
      position: 'bottom'
    },
    {
      selector: '.pl-ctrl--play, .mini-play-btn, [data-action="toggle"]',
      text: 'tourStep2',
      fallbackText: 'Натиснете да чуете',
      position: 'top'
    },
    {
      selector: '#settingsBtn',
      text: 'tourStep3',
      fallbackText: 'Тук променяте всичко',
      position: 'bottom'
    },
    {
      selector: '[data-nav="diary"], .nav-diary',
      text: 'tourStep4',
      fallbackText: 'Дневник за прогрес',
      position: 'top'
    }
  ];

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function isDone() {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch (e) { return true; }
  }

  function markDone() {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (e) { /* ignore */ }
  }

  function tryStart() {
    if (isDone()) return;
    // Don't start if user has history (returning user)
    if (window.history && window.history.length > 3) { markDone(); return; }
    setTimeout(start, 1500);
  }

  function start() {
    if (overlay) return;
    currentStep = 0;
    showStep();
  }

  function showStep() {
    if (currentStep >= STEPS.length) {
      finish();
      return;
    }

    var step = STEPS[currentStep];

    // P0-11 FIX: querySelector може да хвърли (invalid selector) и
    // getBoundingClientRect може да fail-не на detached node. Wrap-ваме
    // целия probe в try-catch; при грешка skip-ваме step тихо.
    var target = null;
    var rect = null;
    try {
      target = document.querySelector(step.selector);
      if (target && typeof target.getBoundingClientRect === 'function') {
        rect = target.getBoundingClientRect();
      }
    } catch (e) {
      target = null;
      rect = null;
    }

    // Skip step if target not found OR rect inaccessible.
    if (!target || !rect) {
      currentStep++;
      showStep();
      return;
    }

    removeOverlay();

    overlay = document.createElement('div');
    overlay.className = 'tour-overlay';

    // Spotlight hole (rect ще е валиден до тук — guard-нат по-горе)
    var pad = 8;
    var hole = document.createElement('div');
    hole.className = 'tour-hole';
    hole.style.top = (rect.top - pad) + 'px';
    hole.style.left = (rect.left - pad) + 'px';
    hole.style.width = (rect.width + pad * 2) + 'px';
    hole.style.height = (rect.height + pad * 2) + 'px';
    overlay.appendChild(hole);

    // Tooltip
    var tooltip = document.createElement('div');
    tooltip.className = 'tour-tooltip tour-tooltip--' + step.position;
    var tooltipTop = step.position === 'bottom'
      ? (rect.bottom + 12) + 'px'
      : (rect.top - 12) + 'px';
    tooltip.style.top = tooltipTop;
    tooltip.style.left = Math.max(16, Math.min(rect.left, window.innerWidth - 260)) + 'px';
    if (step.position === 'top') {
      tooltip.style.transform = 'translateY(-100%)';
    }

    var text = t('tour.' + step.text, step.fallbackText);
    tooltip.innerHTML =
      '<div class="tour-text">' + text + '</div>' +
      '<div class="tour-actions">' +
        '<button class="tour-btn tour-btn--skip" type="button" data-tour="skip">' +
          t('tour.skip', 'Пропусни') +
        '</button>' +
        '<button class="tour-btn tour-btn--next" type="button" data-tour="next">' +
          (currentStep < STEPS.length - 1
            ? t('tour.next', 'Разбрах')
            : t('tour.finish', 'Готово!')) +
        '</button>' +
      '</div>' +
      '<div class="tour-counter">' + (currentStep + 1) + ' / ' + STEPS.length + '</div>';

    overlay.appendChild(tooltip);
    document.body.appendChild(overlay);

    // Bind
    overlay.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tour]');
      if (!btn) return;
      var action = btn.getAttribute('data-tour');
      if (action === 'skip') finish();
      else if (action === 'next') { currentStep++; showStep(); }
    });
  }

  function finish() {
    markDone();
    removeOverlay();
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  return {
    start: start,
    tryStart: tryStart
  };
})();
