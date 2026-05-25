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

  // Phase hierarchy for manual fallback when history is unreliable
  var BACK_MAP = {
    sound: 'category',
    player: 'sound',
    category: 'home',
    profile_results: 'home',
    calm: 'home',
    diary: 'home',
    sleep: 'home',
    library: 'home',
    mixer: 'home',
    settings: 'home'
  };

  function onBack() {
    if (window.Haptics) window.Haptics.light();

    // Strategy 1: Use AppState.previousPhase if available and meaningful
    if (window.AppState && window.AppState.previousPhase) {
      var prev = window.AppState.previousPhase;
      // Navigate to previous phase
      if (prev === 'category') {
        window.AppState.transition('category');
        if (window.CategoryView && window.CategoryView.render) {
          window.CategoryView.render();
        } else if (window.Home && window.Home.render) {
          window.AppState.transition('home');
          window.Home.render();
        }
        return;
      }
      if (prev === 'home') {
        window.AppState.transition('home');
        if (window.Home && window.Home.render) window.Home.render();
        return;
      }
      if (prev === 'sound') {
        window.AppState.transition('sound');
        if (window.SoundDetail && window.SoundDetail.render) window.SoundDetail.render();
        return;
      }
      // Generic previous
      window.AppState.transition(prev);
      // Try history.back as renderer
      if (window.history && window.history.length > 1) {
        window.history.back();
        return;
      }
    }

    // Strategy 2: browser history
    if (window.history && window.history.length > 2) {
      window.history.back();
      return;
    }

    // Strategy 3: phase hierarchy fallback
    if (window.AppState) {
      var current = window.AppState.current;
      var target = BACK_MAP[current] || 'home';
      window.AppState.transition(target);
      if (target === 'home' && window.Home && window.Home.render) {
        window.Home.render();
      }
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
