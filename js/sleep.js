/**
 * AURALIS Sleep Mode — нощен екран с timer + SOS
 * ================================================
 * Per BIBLE v3 §E:
 *  - Full-screen takeover (renders into #app)
 *  - Тъмен фон (canon dark soft night)
 *  - Голям шрифт (50+ четат лесно)
 *  - Currently playing sound от AudioEngine
 *  - Timer chips: 15/30/60/90/120 min
 *  - Computed shutdown time ("Изключване: 19:45")
 *  - BIG SOS button → window.SOS.open()
 *
 * Entry points (wired в Library mini player):
 *  - Library mini player → "Sleep mode" button
 *  - Brand→home: НЕ — Sleep е modal-like screen, X връща към Library
 *
 * Public API:
 *   Sleep.render() — main render (от router)
 *   Sleep.open()   — entry point от Library / other modules
 *   Sleep.close()  — навигира към Library
 */

window.Sleep = (function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================

  var STORAGE_TIMER = 'auralis_sleep_timer_minutes';
  var TIMER_OPTIONS = [
    { min: 0,   key: 'sleep.timer.off',   label: 'Без таймер' },
    { min: 15,  key: 'sleep.timer.min15', label: '15 мин' },
    { min: 30,  key: 'sleep.timer.min30', label: '30 мин' },
    { min: 60,  key: 'sleep.timer.min60', label: '1 час' },
    { min: 90,  key: 'sleep.timer.min90', label: '1.5 ч' },
    { min: 120, key: 'sleep.timer.min120', label: '2 часа' }
  ];

  var selectedMinutes = 0;

  // ============================================================
  // Helpers
  // ============================================================

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

  function loadSavedTimer() {
    try {
      var raw = localStorage.getItem(STORAGE_TIMER);
      if (raw == null) return 0;
      var n = parseInt(raw, 10);
      return (isNaN(n) || n < 0) ? 0 : n;
    } catch (e) { return 0; }
  }

  function saveTimer(min) {
    try { localStorage.setItem(STORAGE_TIMER, String(min)); } catch (e) { /* ignore */ }
  }

  function computeStopTime(minutes) {
    if (!minutes) return null;
    var d = new Date(Date.now() + minutes * 60 * 1000);
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function getCurrentSound() {
    if (!window.Library || !window.Library.getPlayingSound) return null;
    return window.Library.getPlayingSound();
  }

  function soundTitle(sound) {
    if (!sound) return null;
    return t(sound.title_key, sound.bg_title || sound.id);
  }

  function soundSubtitle(sound) {
    if (!sound) return null;
    return t(sound.subtitle_key, sound.category);
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
  }

  function svgMoon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  }

  function svgHeart() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  }

  function buildSoundCard(sound) {
    if (!sound) {
      return (
        '<div class="sleep-no-sound">' +
          '<p class="sleep-no-sound-text">' +
            escapeHtml(t('sleep.nothingPlaying', 'Изберете звук от библиотеката')) +
          '</p>' +
          '<button class="sleep-open-library" type="button" data-action="close">' +
            escapeHtml(t('sleep.openLibrary', 'Към библиотеката')) +
          '</button>' +
        '</div>'
      );
    }
    return (
      '<div class="sleep-now-playing">' +
        '<div class="sleep-np-title">' + escapeHtml(soundTitle(sound)) + '</div>' +
        '<div class="sleep-np-subtitle">' + escapeHtml(soundSubtitle(sound)) + '</div>' +
      '</div>'
    );
  }

  function buildTimerChips() {
    return (
      '<div class="sleep-timer-section">' +
        '<div class="sleep-timer-label">' +
          escapeHtml(t('sleep.timer.label', 'Таймер за приключване')) +
        '</div>' +
        '<div class="sleep-timer-chips" role="radiogroup"' +
          ' aria-label="' + escapeHtml(t('sleep.timer.label', 'Таймер')) + '">' +
          TIMER_OPTIONS.map(function (opt) {
            var isActive = opt.min === selectedMinutes;
            return (
              '<button class="sleep-chip' + (isActive ? ' is-active' : '') + '"' +
                ' type="button" data-min="' + opt.min + '" role="radio"' +
                ' aria-checked="' + (isActive ? 'true' : 'false') + '">' +
                escapeHtml(t(opt.key, opt.label)) +
              '</button>'
            );
          }).join('') +
        '</div>' +
        buildStopTimeHtml() +
      '</div>'
    );
  }

  function buildStopTimeHtml() {
    var stopAt = computeStopTime(selectedMinutes);
    if (!stopAt) return '<div class="sleep-stop-time" id="sleepStopTime">&nbsp;</div>';
    return (
      '<div class="sleep-stop-time" id="sleepStopTime">' +
        escapeHtml(t('sleep.timer.stopTime', 'Изключване: ' + stopAt, { time: stopAt })) +
      '</div>'
    );
  }

  function buildSosButton() {
    return (
      '<button class="sleep-sos-btn" type="button" data-action="sos"' +
        ' aria-label="' + escapeHtml(t('sleep.sos.button', 'Дишане при паника')) + '">' +
        '<span class="sleep-sos-icon" aria-hidden="true">' + svgHeart() + '</span>' +
        '<span class="sleep-sos-text">' +
          '<span class="sleep-sos-title">' +
            escapeHtml(t('sleep.sos.button', 'Дишане при паника')) +
          '</span>' +
          '<span class="sleep-sos-sub">' +
            escapeHtml(t('sleep.sos.subtitle', 'Натиснете при тревога')) +
          '</span>' +
        '</span>' +
      '</button>'
    );
  }

  function buildSleepHtml() {
    var sound = getCurrentSound();
    var closeAria = t('sleep.closeAria', 'Изход от нощен режим');
    return (
      '<div class="sleep-screen" data-screen="sleep">' +
        '<button class="sleep-close" type="button" data-action="close"' +
          ' aria-label="' + escapeHtml(closeAria) + '">' + svgClose() + '</button>' +

        '<div class="sleep-header">' +
          '<span class="sleep-moon" aria-hidden="true">' + svgMoon() + '</span>' +
          '<h1 class="sleep-title">' +
            escapeHtml(t('sleep.title', 'Нощен режим')) +
          '</h1>' +
        '</div>' +

        buildSoundCard(sound) +
        buildTimerChips() +

        '<div class="sleep-spacer"></div>' +

        buildSosButton() +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function selectMinutes(min) {
    selectedMinutes = min;
    saveTimer(min);
    if (window.AudioEngine && window.AudioEngine.setSleepTimer) {
      window.AudioEngine.setSleepTimer(min);
    }
    // Re-render samo chips + stop time (cheap full re-render за simplicity)
    refresh();
  }

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildSleepHtml();
    bindEvents(app);
  }

  function bindEvents(container) {
    container.addEventListener('click', onClick);
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      var action = actionBtn.getAttribute('data-action');
      if (action === 'close') close();
      else if (action === 'sos') {
        if (window.SOS && window.SOS.open) window.SOS.open();
      }
      return;
    }

    var chip = e.target.closest('.sleep-chip');
    if (chip) {
      var min = parseInt(chip.getAttribute('data-min'), 10);
      if (!isNaN(min)) selectMinutes(min);
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  function open() {
    selectedMinutes = loadSavedTimer();
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('sleep');
    }
    history.pushState({ phase: 'sleep' }, '');
    render();
  }

  function close() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('library');
    }
    history.pushState({ phase: 'library' }, '');
    if (window.Library && window.Library.render) {
      window.Library.render();
    }
  }

  function render() {
    selectedMinutes = loadSavedTimer();
    refresh();
  }

  return {
    open: open,
    close: close,
    render: render
  };
})();
