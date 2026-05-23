// AURALIS entry point — wires theme toggle + bootstraps onboarding

(function () {
  'use strict';

  var STORAGE_KEY = 'auralis-theme';
  var THEME_COLOR_DARK  = '#080813';
  var THEME_COLOR_LIGHT = '#E8E3EE';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? THEME_COLOR_LIGHT : THEME_COLOR_DARK);
    }

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function toggleTheme() {
    var next = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // localStorage недостъпен (private mode) — игнорираме
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
    applyTheme(currentTheme());

    if (window.Onboarding && typeof window.Onboarding.start === 'function') {
      window.Onboarding.start();
    }

    console.log('[auralis] app.js loaded · phase:', window.AppState.current,
      '· sub:', window.AppState.subphase,
      '· done:', window.AppState.isOnboardingDone());
  });
})();
