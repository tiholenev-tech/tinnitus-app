// AURALIS entry point — wires DOM handlers, theme toggle, init

(function () {
  'use strict';

  const STORAGE_KEY = 'auralis-theme';
  const THEME_COLOR_DARK  = '#080813';
  const THEME_COLOR_LIGHT = '#E8E3EE';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? THEME_COLOR_LIGHT : THEME_COLOR_DARK);
    }

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function toggleTheme() {
    const next = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // localStorage недостъпен (private mode и т.н.) — игнорираме
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
    applyTheme(currentTheme());

    console.log('[auralis] app.js loaded · phase:',
      (window.AppState && window.AppState.current) || 'unknown');
  });
})();
