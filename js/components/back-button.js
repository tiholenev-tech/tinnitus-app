/**
 * AURALIS BackButton — header back navigation (Task А)
 * ======================================================
 * When NOT on Home → replaces theme toggle with back chevron.
 * On Home → theme toggle visible.
 *
 * Public API:
 *   BackButton.init()     — call at bootstrap, watches state changes
 *   BackButton.update()   — manual refresh (call after route change)
 */

window.BackButton = (function () {
  'use strict';

  var backBtn = null;
  var initialized = false;

  var SVG_BACK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="15 18 9 12 15 6"/></svg>';

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function isHome() {
    if (window.AppState) {
      var phase = window.AppState.current;
      return phase === 'home' || phase === 'onboarding' || phase === 'quiz';
    }
    return true;
  }

  function createBackBtn() {
    if (backBtn) return backBtn;
    backBtn = document.createElement('button');
    backBtn.className = 'icon-btn back-btn';
    backBtn.id = 'headerBackBtn';
    backBtn.type = 'button';
    backBtn.setAttribute('aria-label', t('ui.header.backAria', 'Назад'));
    backBtn.innerHTML = SVG_BACK;
    backBtn.addEventListener('click', onBack);
    return backBtn;
  }

  function onBack() {
    if (window.Haptics) window.Haptics.light();
    // Try history.back first, fallback to Home
    if (window.history && window.history.length > 1) {
      window.history.back();
    } else if (window.AppState && window.AppState.transition) {
      window.AppState.transition('home');
      if (window.Home && window.Home.render) window.Home.render();
    }
  }

  function update() {
    var themeBtn = document.getElementById('themeBtn');
    if (!themeBtn) return;
    var parent = themeBtn.parentElement;
    if (!parent) return;

    if (isHome()) {
      // Show theme, hide back
      themeBtn.style.display = '';
      if (backBtn && backBtn.parentNode) backBtn.parentNode.removeChild(backBtn);
    } else {
      // Show back, hide theme
      themeBtn.style.display = 'none';
      createBackBtn();
      if (!backBtn.parentNode) {
        parent.insertBefore(backBtn, themeBtn);
      }
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    // Watch popstate for route changes
    window.addEventListener('popstate', function () {
      setTimeout(update, 50);
    });
    // Initial check
    setTimeout(update, 100);
  }

  return {
    init: init,
    update: update
  };
})();
