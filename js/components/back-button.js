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

  // NAV-STACK: рендеринг dispatch по phase name.
  // popPhase() в state.js връща предишния phase без да го re-push-ва.
  function rendererFor(phase) {
    var renderers = {
      'home': window.Home,
      'category': window.CategoryView,
      'sound': window.SoundDetail,
      'player': window.Player,
      'profile_results': window.ProfileResults,
      'diary_hub': window.DiaryHub,
      'diary_evening': window.DiaryEvening,
      'diary_morning': window.DiaryMorning,
      'cbt_day': window.CbtDay,
      'thi_baseline': window.ThiBaseline,
      // DIARY-MERGE: legacy 'diary' phase → новия DiaryHub.
      'diary': window.DiaryHub,
      'calm': window.Calm,
      'sleep': window.Sleep,
      'library': window.Library,
      'mixer': window.Mixer,
      'settings': window.Settings
    };
    return renderers[phase] || null;
  }

  function onBack() {
    if (window.Haptics) window.Haptics.light();

    if (!window.AppState) {
      window.history.back();
      return;
    }

    var prev = window.AppState.popPhase();

    if (!prev) {
      // Empty stack — go home.
      console.log('[back-button] empty stack → home');
      window.AppState.transition('home');
      if (window.Home && window.Home.render) window.Home.render();
      return;
    }

    console.log('[back-button] BACK to:', prev);

    var renderer = rendererFor(prev);
    if (renderer && renderer.render) {
      renderer.render();
    } else {
      // Renderer missing → fallback Home.
      console.warn('[back-button] no renderer for:', prev, '→ home');
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
