/**
 * AURALIS Settings v1.0 — bottom sheet с 5 секции
 * ==================================================
 * Per BIBLE v3.1 §H:
 *  1. 🌍 Език (12 езика; BG/EN активни, останалите TODO)
 *  2. 🌙 Тема (Светла / Тъмна / Авто)
 *  3. 🔊 Master volume slider (mirror на AudioEngine)
 *  4. 📊 Моите данни (export JSON / delete all / debug reset)
 *  5. ℹ За приложението (версия + disclaimer + privacy link)
 *
 * UI: bottom sheet slide-up с semi-transparent backdrop (Library виден).
 * Tap извън sheet / ESC / X → close.
 *
 * Public API:
 *   Settings.open() | close() | toggle()
 */

window.Settings = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================

  var APP_VERSION = '0.1.0';
  var STORAGE_THEME = 'auralis-theme';
  var STORAGE_LOCALE = 'auralis_locale';
  var STORAGE_VOLUME = 'auralis-master-volume';
  var DEBUG_FLAG = 'debug_mode';

  // P0-FIX 2026-05-28 (LAUNCH BLOCKER): тези списъци overrode-ваха
  // i18n.SUPPORTED + LanguagePicker.LANGUAGES — Settings езиков toggle
  // имаше СОБСТВЕН enumerator, който показваше EN като "preview". Това
  // беше истинският източник на EN-stub leak за launch (не i18n.js, не
  // language-picker.js). Mirror към i18n.SUPPORTED=['bg'].
  // Когато EN е production-ready → разшири ВСИЧКИ ТРИ места едновременно:
  // i18n.js SUPPORTED + language-picker.js LANGUAGES + settings.js LOCALES.
  var LOCALES = ['bg'];
  var COMPLETE_LOCALES = ['bg'];
  var PREVIEW_LOCALES = []; // EN stub скрит за launch (Google audit risk)

  // ============================================================
  // STATE
  // ============================================================

  var overlay = null;
  var currentView = 'main'; // 'main' | 'privacy' | 'terms'
  var escHandlerBound = false;
  var trialResetMessage = '';

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

  function getCurrentLocale() {
    if (window.i18n && window.i18n.getLocale) return window.i18n.getLocale();
    try { return localStorage.getItem(STORAGE_LOCALE) || 'bg'; } catch (e) { return 'bg'; }
  }

  function getCurrentTheme() {
    try {
      var saved = localStorage.getItem(STORAGE_THEME);
      if (saved === 'light' || saved === 'dark') return saved;
      return 'auto';
    } catch (e) { return 'auto'; }
  }

  function getCurrentVolume() {
    if (window.AudioEngine && window.AudioEngine.getMasterVolume) {
      return window.AudioEngine.getMasterVolume();
    }
    try {
      var saved = localStorage.getItem(STORAGE_VOLUME);
      if (saved !== null) {
        var n = parseInt(saved, 10);
        if (!isNaN(n)) return n;
      }
    } catch (e) {}
    return 50;
  }

  function isDebugMode() {
    // КРИТИЧНО (audit 1.0.104): Capacitor нативната обвивка сервира на
    // host 'localhost' → старият auto-enable показваше деструктивните debug
    // бутони на реални 70+ потребители. Затова: под Capacitor → ВИНАГИ off;
    // auto-enable само на ngrok dev тунели; 'localhost'/'.local' махнати.
    try {
      if (window.Capacitor) return false;
    } catch (e) { /* ignore */ }
    // Manual override (изричен флаг — за dev на localhost: set debug_mode=true)
    try {
      if (localStorage.getItem(DEBUG_FLAG) === 'true') return true;
    } catch (e) { /* ignore */ }
    try {
      var host = window.location && window.location.hostname || '';
      if (host.indexOf('.ngrok') !== -1) return true;
    } catch (e) { /* ignore */ }
    return false;
  }

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
  }
  function svgBack() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>' +
      '</svg>';
  }
  function svgGlobe() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>' +
      '<path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>' +
      '</svg>';
  }
  function svgMoon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  }
  function svgSpeaker() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>' +
      '<path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/>' +
      '</svg>';
  }
  function svgChart() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>' +
      '<line x1="6" y1="20" x2="6" y2="14"/></svg>';
  }
  function svgInfo() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>' +
      '<line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }
  function svgBell() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
      '<path d="M13.73 21a2 2 0 01-3.46 0"/></svg>';
  }
  function svgChevron() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="9 18 15 12 9 6"/></svg>';
  }

  // ============================================================
  // HTML builders — Main view
  // ============================================================

  function buildLanguageSection() {
    var currentLocale = getCurrentLocale();
    // Phone test cleanup: показваме САМО налични езици (BG + EN preview).
    // Останалите 10 езика са planned Phase 2 — не ги пишем с "(TODO)" badge
    // за да не объркваме user-а.
    var activeLocales = LOCALES.filter(function (code) {
      return COMPLETE_LOCALES.indexOf(code) !== -1 ||
             PREVIEW_LOCALES.indexOf(code) !== -1;
    });
    var options = activeLocales.map(function (code) {
      var name = t('settings.lang.names.' + code, code.toUpperCase());
      var badge = (PREVIEW_LOCALES.indexOf(code) !== -1)
        ? ' (' + t('settings.lang.preview', 'preview') + ')' : '';
      return '<option value="' + escapeHtml(code) + '"' +
        (code === currentLocale ? ' selected' : '') + '>' +
        escapeHtml(name) + escapeHtml(badge) +
        '</option>';
    }).join('');

    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgGlobe() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.lang.label', 'Език')) +
          '</h3>' +
        '</div>' +
        '<select class="set-select" id="setLangSelect" aria-label="' +
          escapeHtml(t('settings.lang.label', 'Език')) + '">' +
          options +
        '</select>' +
      '</section>'
    );
  }

  function buildThemeSection() {
    var current = getCurrentTheme();
    var opts = [
      { id: 'light', label: t('settings.theme.light', 'Светла') },
      { id: 'dark',  label: t('settings.theme.dark',  'Тъмна') },
      { id: 'auto',  label: t('settings.theme.auto',  'Автоматична') }
    ];
    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgMoon() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.theme.label', 'Тема')) +
          '</h3>' +
        '</div>' +
        '<div class="set-segmented" role="radiogroup"' +
          ' aria-label="' + escapeHtml(t('settings.theme.label', 'Тема')) + '">' +
          opts.map(function (o) {
            var isActive = o.id === current;
            return (
              '<button class="set-seg-btn' + (isActive ? ' is-active' : '') + '"' +
                ' type="button" role="radio" data-theme-id="' + o.id + '"' +
                ' aria-checked="' + (isActive ? 'true' : 'false') + '">' +
                escapeHtml(o.label) +
              '</button>'
            );
          }).join('') +
        '</div>' +
      '</section>'
    );
  }

  function buildVolumeSection() {
    var vol = getCurrentVolume();
    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgSpeaker() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.volume.label', 'Сила на звука')) +
          '</h3>' +
          '<span class="set-volume-value" id="setVolValue">' + vol + '%</span>' +
        '</div>' +
        '<input type="range" class="set-volume-slider" id="setVolSlider"' +
          ' min="0" max="100" step="1" value="' + vol + '"' +
          ' aria-label="' + escapeHtml(t('settings.volume.aria', 'Сила на звука 0-100')) + '">' +
      '</section>'
    );
  }

  function buildDataSection() {
    var debug = isDebugMode();
    var debugHtml = '';
    if (debug) {
      debugHtml =
        '<div class="set-debug-divider" aria-hidden="true">— DEBUG —</div>' +
        '<button class="set-action set-action--debug" type="button" data-action="data-debug-trial">' +
          escapeHtml(t('settings.data.debugResetTrial', 'Reset trial period (debug)')) +
        '</button>' +
        '<button class="set-action set-action--debug" type="button" data-action="data-debug-skip-onboarding">' +
          escapeHtml(t('settings.data.debugSkipOnboarding', 'Skip onboarding → Library (debug)')) +
        '</button>' +
        '<button class="set-action set-action--debug" type="button" data-action="data-debug-reset-onboarding">' +
          escapeHtml(t('settings.data.debugResetOnboarding', 'Reset onboarding (debug)')) +
        '</button>' +
        '<button class="set-action set-action--debug" type="button" data-action="data-debug-mock-quiz">' +
          escapeHtml(t('settings.data.debugMockQuiz', 'Mock quiz: TH_C → Library (debug)')) +
        '</button>' +
        '<button class="set-action set-action--debug" type="button" data-action="data-debug-show-analytics">' +
          'Show raw analytics JSON (debug)' +
        '</button>' +
        '<button class="set-action set-action--debug" type="button" data-action="data-debug-clear-analytics">' +
          'Clear analytics (debug)' +
        '</button>' +
        '<button class="set-action set-action--debug" type="button" data-action="data-debug-fake-analytics">' +
          'Generate fake analytics data (debug)' +
        '</button>';
    }
    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgChart() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.data.label', 'Моите данни')) +
          '</h3>' +
        '</div>' +
        '<div class="set-data-actions">' +
          '<button class="set-action" type="button" data-action="data-export">' +
            escapeHtml(t('settings.data.export', 'Изтегли всичко (JSON)')) +
          '</button>' +
          // „Импорт на дневник" СКРИТ (audit 1.0.105): importFromJson пише в
          // мъртвия legacy '_' store (не в реалния дневник) → нищо не се появява.
          // „Изтегли всичко (JSON)" пак прави backup. Връща се след пренапис.
          '<button class="set-action set-action--danger" type="button" data-action="data-delete">' +
            escapeHtml(t('settings.data.delete', 'Изтрий всички данни')) +
          '</button>' +
          debugHtml +
          (trialResetMessage
            ? '<div class="set-data-msg">' + escapeHtml(trialResetMessage) + '</div>'
            : '') +
        '</div>' +
      '</section>'
    );
  }

  function buildAboutSection() {
    return (
      '<section class="set-section set-section--about">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgInfo() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.about.label', 'За приложението')) +
          '</h3>' +
        '</div>' +
        '<div class="set-about-version">' +
          escapeHtml(t('settings.about.version',
            'AURALIS · версия ' + APP_VERSION + ' (beta) · 2026', { v: APP_VERSION })) +
        '</div>' +
        '<div class="set-about-disclaimer">' +
          escapeHtml(t('settings.about.disclaimer',
            'Wellness инструмент, не заместител на лекар.')) +
        '</div>' +
        '<div class="set-about-links">' +
          '<button class="set-link" type="button" data-action="open-privacy">' +
            escapeHtml(t('settings.about.privacyLink', 'Политика за поверителност')) +
          '</button>' +
          /* P0 LAUNCH 2026-05-28: terms бутон скрит — content съществува в
             bg.json под ui.terms.* но buildTermsViewHtml търси по path
             terms.* → render-ваше празен прозорец. Re-enable след Шеф
             review на съдържанието + path correction в buildTermsViewHtml:
             '<button class="set-link" type="button" data-action="open-terms">' +
               escapeHtml(t('ui.terms.title', 'Условия за ползване')) +
             '</button>' + */
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // BB1: Granular data deletion
  // ============================================================

  function buildGranularDeleteSection() {
    var items = [
      { action: 'del-quiz', label: t('settings.data.deleteOnly', 'Изтрий само') + ': ' + t('settings.data.quizAnswers', 'Quiz отговори') },
      { action: 'del-diary', label: t('settings.data.deleteOnly', 'Изтрий само') + ': ' + t('settings.data.diary', 'Дневник') },
      { action: 'del-favorites', label: t('settings.data.deleteOnly', 'Изтрий само') + ': ' + t('settings.data.favorites', 'Любими') },
      { action: 'del-history', label: t('settings.data.deleteOnly', 'Изтрий само') + ': ' + t('settings.data.history', 'Listening history') }
    ];
    return items.map(function (item) {
      return '<button class="set-action set-action--secondary" type="button" data-action="' +
        item.action + '">' + escapeHtml(item.label) + '</button>';
    }).join('');
  }

  // ============================================================
  // BB2: Per-section export
  // ============================================================

  function buildSectionExportButtons() {
    var items = [
      { action: 'export-quiz', label: t('settings.data.exportSection', 'Експорт раздел') + ': Quiz' },
      { action: 'export-diary', label: t('settings.data.exportSection', 'Експорт раздел') + ': ' + t('settings.data.diary', 'Дневник') },
      { action: 'export-favorites', label: t('settings.data.exportSection', 'Експорт раздел') + ': ' + t('settings.data.favorites', 'Любими') }
    ];
    return items.map(function (item) {
      return '<button class="set-action set-action--secondary" type="button" data-action="' +
        item.action + '">' + escapeHtml(item.label) + '</button>';
    }).join('');
  }

  // ============================================================
  // BB3: Reminders (UI only — stub for Capacitor push)
  // ============================================================

  function buildRemindersSection() {
    var reminders = loadReminders();
    var intro = t('settings.reminders.intro',
      'Нежни напомняния, които Ви помагат да задържите ежедневния навик. ' +
      'Редовността е по-важна от продължителността — затова леко побутване всеки ден помага.');
    var dailyLabel = t('settings.reminders.dailyLabel', 'Вечерно напомняне за дневника');
    var dailyHelp = t('settings.reminders.dailyHelp',
      'Известие всяка вечер да отбележите как мина денят. Дневникът проследява напредъка Ви.');
    var weeklyLabel = t('settings.reminders.weeklyLabel', 'Седмично резюме');
    var weeklyHelp = t('settings.reminders.weeklyHelp',
      'Кратък преглед на седмицата Ви — изпраща се в понеделник сутрин.');
    var note = t('settings.reminders.note',
      'Известията изискват разрешение и приложението да е добавено на началния екран.');
    var timeLabel = t('settings.reminders.timeLabel', 'Час на напомнянето');

    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgBell() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.reminders.title', 'Напомняния')) +
          '</h3>' +
        '</div>' +
        '<p class="set-desc">' + escapeHtml(intro) + '</p>' +
        '<div class="set-reminders">' +
          '<label class="set-switch">' +
            '<span class="set-switch-text">' +
              '<span class="set-switch-label">' + escapeHtml(dailyLabel) + '</span>' +
              '<span class="set-switch-help">' + escapeHtml(dailyHelp) + '</span>' +
            '</span>' +
            '<input type="checkbox" class="set-switch-input" id="setReminderDaily"' +
              (reminders.daily ? ' checked' : '') + '>' +
            '<span class="set-switch-track"><span class="set-switch-thumb"></span></span>' +
          '</label>' +
          '<div class="set-time-row" id="setDailyTimeRow"' + (reminders.daily ? '' : ' style="display:none"') + '>' +
            '<span class="set-time-label">' + escapeHtml(timeLabel) + '</span>' +
            '<input type="time" class="set-time-input" id="setDailyTime" value="' +
              escapeHtml(reminders.dailyTime || '21:00') + '">' +
          '</div>' +
          '<label class="set-switch">' +
            '<span class="set-switch-text">' +
              '<span class="set-switch-label">' + escapeHtml(weeklyLabel) + '</span>' +
              '<span class="set-switch-help">' + escapeHtml(weeklyHelp) + '</span>' +
            '</span>' +
            '<input type="checkbox" class="set-switch-input" id="setReminderWeekly"' +
              (reminders.weekly ? ' checked' : '') + '>' +
            '<span class="set-switch-track"><span class="set-switch-thumb"></span></span>' +
          '</label>' +
        '</div>' +
        '<p class="set-note">' + escapeHtml(note) + '</p>' +
      '</section>'
    );
  }

  function loadReminders() {
    try {
      var raw = localStorage.getItem('auralis_reminders');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { daily: false, dailyTime: '21:00', weekly: false };
  }

  function saveReminders(obj) {
    try { localStorage.setItem('auralis_reminders', JSON.stringify(obj)); } catch (e) { /* ignore */ }
  }

  // Поискай разрешение за известия когато потребителят включи напомняне.
  // Честно поведение: ако API не се поддържа или е отказано — кажи му.
  function requestNotifyPermission() {
    try {
      if (!('Notification' in window)) {
        if (window.Toast && window.Toast.info) {
          window.Toast.info(t('settings.reminders.unsupported',
            'Това устройство не поддържа известия в браузъра.'));
        }
        return;
      }
      if (Notification.permission === 'granted') return;
      if (Notification.permission === 'denied') {
        if (window.Toast && window.Toast.info) {
          window.Toast.info(t('settings.reminders.denied',
            'Известията са блокирани. Разрешете ги от настройките на устройството.'));
        }
        return;
      }
      Notification.requestPermission().then(function (res) {
        if (res !== 'granted' && window.Toast && window.Toast.info) {
          window.Toast.info(t('settings.reminders.denied',
            'Известията са блокирани. Разрешете ги от настройките на устройството.'));
        }
      }).catch(function () {});
    } catch (e) { /* ignore */ }
  }

  // ============================================================
  // BB4: Volume profiles
  // ============================================================

  function buildVolumeProfilesSection() {
    var profiles = [
      { id: 'quiet', label: t('settings.volume.quiet', 'Тих режим'), master: 30, l1: 30, l2: 20 },
      { id: 'normal', label: t('settings.volume.normal', 'Нормален'), master: 50, l1: 50, l2: 30 },
      { id: 'loud', label: t('settings.volume.loud', 'Силен'), master: 70, l1: 70, l2: 40 }
    ];
    var btns = profiles.map(function (p) {
      return '<button class="set-vol-profile" type="button" data-action="vol-profile"' +
        ' data-master="' + p.master + '" data-l1="' + p.l1 + '" data-l2="' + p.l2 + '">' +
        escapeHtml(p.label) + '</button>';
    }).join('');
    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgSpeaker() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.volume.profile', 'Профил на сила')) +
          '</h3>' +
        '</div>' +
        '<div class="set-vol-profiles">' + btns + '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // JJ: Advanced Audio Settings
  // ============================================================

  function getAudioSetting(key, def) {
    try {
      var val = localStorage.getItem('auralis_audio_' + key);
      if (val !== null) return parseFloat(val);
    } catch (e) { /* ignore */ }
    return def;
  }

  function setAudioSetting(key, val) {
    try { localStorage.setItem('auralis_audio_' + key, String(val)); } catch (e) { /* ignore */ }
  }

  function buildAdvancedAudioSection() {
    var crossfade = getAudioSetting('crossfade', 2);
    var l2Default = getAudioSetting('l2_default_vol', 30);
    var sleepFade = getAudioSetting('sleep_fade', 30);

    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">🎛</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.audio.title', 'Advanced Audio')) +
          '</h3>' +
        '</div>' +

        // JJ1: Crossfade
        '<div class="set-slider-group">' +
          '<div class="set-slider-head">' +
            '<span class="set-slider-label">' + escapeHtml(t('settings.audio.crossfade', 'Преходи между звуци')) + '</span>' +
            '<span class="set-slider-val" id="setXfadeVal">' + crossfade.toFixed(1) + 's</span>' +
          '</div>' +
          '<input type="range" class="set-volume-slider" id="setXfadeSlider"' +
            ' min="0.5" max="5" step="0.5" value="' + crossfade + '">' +
        '</div>' +

        // JJ2: Layer 2 default volume
        '<div class="set-slider-group">' +
          '<div class="set-slider-head">' +
            '<span class="set-slider-label">' + escapeHtml(t('settings.audio.layer2Default', 'Сила на фонов шум (по подразбиране)')) + '</span>' +
            '<span class="set-slider-val" id="setL2DefVal">' + l2Default + '%</span>' +
          '</div>' +
          '<input type="range" class="set-volume-slider" id="setL2DefSlider"' +
            ' min="0" max="100" step="5" value="' + l2Default + '">' +
        '</div>' +

        // JJ3: Sleep fade
        '<div class="set-slider-group">' +
          '<div class="set-slider-head">' +
            '<span class="set-slider-label">' + escapeHtml(t('settings.audio.sleepFade', 'Затихване при сън')) + '</span>' +
            '<span class="set-slider-val" id="setSleepFadeVal">' + sleepFade + 's</span>' +
          '</div>' +
          '<input type="range" class="set-volume-slider" id="setSleepFadeSlider"' +
            ' min="10" max="60" step="5" value="' + sleepFade + '">' +
        '</div>' +

      '</section>'
    );
  }

  // ============================================================
  // GG: Favorites button in Settings
  // ============================================================

  function buildFavoritesButton() {
    return (
      '<section class="set-section">' +
        '<div class="set-data-actions">' +
          '<button class="set-action" type="button" data-action="open-favorites">' +
            escapeHtml(t('favorites.title', 'Моите любими')) +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // FAQ button (Wave 3.2)
  // ============================================================

  function buildFaqButton() {
    return (
      '<section class="set-section">' +
        '<div class="set-data-actions">' +
          '<button class="set-action" type="button" data-action="open-faq">' +
            '<span class="set-action-label">' +
              escapeHtml(t('faq.openLabel', 'Често задавани въпроси')) +
            '</span>' +
            '<span class="set-action-chevron" aria-hidden="true">' + svgChevron() + '</span>' +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  // Science Info entry point — fullscreen научен прозорец (7 секции).
  function buildScienceInfoButton() {
    return (
      '<section class="set-section">' +
        '<div class="set-data-actions">' +
          '<button class="set-action" type="button" data-action="open-science">' +
            '<span class="set-action-label">' +
              escapeHtml(t('science.openLabel', 'Научна основа')) +
            '</span>' +
            '<span class="set-action-chevron" aria-hidden="true">' + svgChevron() + '</span>' +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  // Pitch retest entry — позволява повторно изпълнение на звуковия тест
  // от Settings (без да чакаме Day 14 prompt).
  function buildPitchRetestButton() {
    return (
      '<section class="set-section">' +
        '<div class="set-data-actions">' +
          '<button class="set-action" type="button" data-action="pitch-retest">' +
            escapeHtml(t('settings.pitchRetest', 'Направи звуков тест отново')) +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // Voice dictation privacy reset (Wave 3.2+)
  // ============================================================

  function buildVoicePrivacyButton() {
    // Скрий бутона напълно ако Web Speech API не се поддържа на устройството.
    if (!window.VoiceDictation || !window.VoiceDictation.isSupported()) return '';
    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('voice.settings.section', 'Поверителност')) +
          '</h3>' +
        '</div>' +
        '<div class="set-data-actions">' +
          '<button class="set-action" type="button" data-action="voice-reset-privacy">' +
            escapeHtml(t('voice.settings.resetPrivacy', 'Покажи отново инфото за диктовка')) +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // BB: Analytics stats button
  // ============================================================

  function buildAnalyticsButton() {
    var desc = t('settings.stats.desc',
      'Преглед на напредъка Ви: колко минути слушате, любими звуци и серията ' +
      'от поредни дни (streak). Помага Ви да видите дали навикът се задържа. ' +
      'Всичко се изчислява само на това устройство — нищо не напуска телефона Ви.');
    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgChart() + '</span>' +
          '<h3 class="set-section-title">' +
            escapeHtml(t('settings.stats.title', 'Вашата статистика')) +
          '</h3>' +
        '</div>' +
        '<p class="set-desc">' + escapeHtml(desc) + '</p>' +
        '<div class="set-data-actions">' +
          '<button class="set-action set-action--primary" type="button" data-action="open-stats">' +
            '<span class="set-action-label">' +
              escapeHtml(t('settings.stats.cta', 'Покажи статистиката')) +
            '</span>' +
            '<span class="set-action-chevron" aria-hidden="true">' + svgChevron() + '</span>' +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // PACK C T3: Личната честотна терапия (notch filter toggle)
  // ============================================================
  function buildNotchSection() {
    var s = window.AppState;
    if (!s) return '';
    // Renders САМО ако има pitch data (иначе toggle-ът няма смисъл).
    var tests = Array.isArray(s.pitchTests) ? s.pitchTests : [];
    if (tests.length === 0) return '';
    var last = tests[tests.length - 1];
    if (!last || typeof last.freq !== 'number' || last.freq <= 0) return '';

    var freq = last.freq;
    var freqLabel = freq >= 1000
      ? (freq / 1000).toFixed(1).replace(/\.0$/, '') + ' kHz'
      : freq + ' Hz';
    var enabled = !s.notchDisabled;

    var title = t('settings.notch.title', 'Лична честотна терапия');
    // Какво е и защо — обяснение разбираемо за всеки потребител.
    var what = t('settings.notch.what',
      'От всеки звук премахваме точно Вашата тинитус честота (' + freqLabel + '). ' +
      'Така ушите Ви получават по-малко стимулация около досадния тон — това е в основата на метода.');
    // ВАЖНО: ясно съобщение, че изключването не е препоръчително.
    var caution = enabled
      ? t('settings.notch.keepOn',
          'Препоръчваме да остане включена. Изключете я само ако звукът Ви е неприятен — иначе губите главното предимство на терапията.')
      : t('settings.notch.offWarn',
          'Терапията е спряна. Звуците се възпроизвеждат без личния филтър — за пълен ефект включете я отново.');
    var stateLabel = enabled
      ? t('settings.notch.on', 'Включена')
      : t('settings.notch.off', 'Изключена');
    var recommended = t('settings.notch.recommended', 'Препоръчва се');

    return (
      '<section class="set-section">' +
        '<div class="set-section-head">' +
          '<span class="set-section-icon" aria-hidden="true">' + svgChart() + '</span>' +
          '<h3 class="set-section-title">' + escapeHtml(title) + '</h3>' +
          '<span class="set-badge set-badge--rec">' + escapeHtml(recommended) + '</span>' +
        '</div>' +
        '<p class="set-desc">' + escapeHtml(what) + '</p>' +
        '<label class="set-switch">' +
          '<span class="set-switch-text">' +
            '<span class="set-switch-label">' + escapeHtml(stateLabel) + '</span>' +
          '</span>' +
          '<input type="checkbox" class="set-switch-input" id="setNotchToggle"' +
            (enabled ? ' checked' : '') + '>' +
          '<span class="set-switch-track"><span class="set-switch-thumb"></span></span>' +
        '</label>' +
        '<p class="set-caution' + (enabled ? '' : ' set-caution--strong') + '">' +
          escapeHtml(caution) + '</p>' +
      '</section>'
    );
  }

  function buildMainViewHtml() {
    var closeAria = t('settings.closeAria', 'Затвори настройки');
    var title = t('settings.title', 'Настройки');
    // Phone test cleanup: преструктурирано за яснота. Премахнати:
    // - Advanced Audio (експертно, объркваше end-user)
    // - Phase 2 placeholders (Audio output, Equalizer)
    // - Per-section export + granular delete (cryptic за normal user)
    // - "Phase 2" reminder note
    // Сега ред е по приоритет: theme, lang, volume, reminders, quick links, data, about.
    return (
      '<div class="set-sheet" role="dialog" aria-modal="true"' +
        ' aria-label="' + escapeHtml(title) + '">' +
        '<div class="set-sheet-grip" aria-hidden="true"></div>' +
        '<div class="set-header">' +
          '<h2 class="set-title">' + escapeHtml(title) + '</h2>' +
          '<button class="set-close" type="button" data-action="close"' +
            ' aria-label="' + escapeHtml(closeAria) + '">' + svgClose() + '</button>' +
        '</div>' +
        '<div class="set-body">' +
          buildThemeSection() +
          buildLanguageSection() +
          // Master volume + volume profiles преместени на началния екран
          // (Home → buildVolumeCard). Виж js/home.js.
          buildNotchSection() +
          // „Вашата статистика" СКРИТО (audit 1.0.105): екранът е изключен от
          // реалните данни (нищо не track-ва слушане/sos/sleep + чете мъртъв
          // legacy diary store). Връща се след правилно свързване post-launch.
          // buildAnalyticsButton() +
          // „Напомняния" МАХНАТО (1.0.103): toggle-ите не правеха истинско
          // известие (PWA не може scheduled push при затворено приложение;
          // седмичното беше напълно мъртво). Напомнянето е честно през
          // Дневник-картата на началния екран. Истински push → с Capacitor.
          buildScienceInfoButton() +
          buildFaqButton() +
          buildVoicePrivacyButton() +
          buildDataSection() +
          buildAboutSection() +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // HTML builders — Privacy view
  // ============================================================

  function buildDocSection(title, text) {
    if (!title && !text) return '';
    return (
      '<section class="set-doc-section">' +
        (title ? '<h3 class="set-doc-title">' + escapeHtml(title) + '</h3>' : '') +
        (text ? '<p class="set-doc-text">' + escapeHtml(text) + '</p>' : '') +
      '</section>'
    );
  }

  function buildPrivacyViewHtml() {
    var closeAria = t('settings.closeAria', 'Затвори настройки');
    var backLabel = t('settings.back', 'Назад');
    var title = t('privacy.title', 'Политика за поверителност');
    var lastUpdated = t('privacy.lastUpdated', '');
    var intro = t('privacy.intro', '');

    var sections = [
      ['privacy.collection.title', 'privacy.collection.text'],
      ['privacy.storage.title',    'privacy.storage.text'],
      ['privacy.sharing.title',    'privacy.sharing.text'],
      ['privacy.gdpr.title',       'privacy.gdpr.text'],
      ['privacy.platform.title',   'privacy.platform.text']
    ];
    var sectionsHtml = sections.map(function (pair) {
      return buildDocSection(t(pair[0], ''), t(pair[1], ''));
    }).join('');

    var contactTitle = t('privacy.contact.title', 'Контакт');
    var contactEmail = t('privacy.contact.email', '');
    var contactHtml = contactEmail
      ? '<section class="set-doc-section">' +
          '<h3 class="set-doc-title">' + escapeHtml(contactTitle) + '</h3>' +
          '<p class="set-doc-text"><a href="mailto:' + escapeHtml(contactEmail) +
            '" class="set-doc-link">' + escapeHtml(contactEmail) + '</a></p>' +
        '</section>'
      : '';

    return (
      '<div class="set-sheet" role="dialog" aria-modal="true"' +
        ' aria-label="' + escapeHtml(title) + '">' +
        '<div class="set-sheet-grip" aria-hidden="true"></div>' +
        '<div class="set-header">' +
          '<button class="set-back" type="button" data-action="back"' +
            ' aria-label="' + escapeHtml(backLabel) + '">' + svgBack() + '</button>' +
          '<h2 class="set-title">' + escapeHtml(title) + '</h2>' +
          '<button class="set-close" type="button" data-action="close"' +
            ' aria-label="' + escapeHtml(closeAria) + '">' + svgClose() + '</button>' +
        '</div>' +
        '<div class="set-body set-body--doc">' +
          (lastUpdated ? '<div class="set-doc-meta">' + escapeHtml(lastUpdated) + '</div>' : '') +
          (intro ? '<p class="set-doc-intro">' + escapeHtml(intro) + '</p>' : '') +
          sectionsHtml +
          contactHtml +
        '</div>' +
      '</div>'
    );
  }

  function buildTermsViewHtml() {
    var closeAria = t('settings.closeAria', 'Затвори настройки');
    var backLabel = t('settings.back', 'Назад');
    var title = t('terms.title', 'Условия за ползване');
    var lastUpdated = t('terms.lastUpdated', '');
    var intro = t('terms.intro', '');

    var sections = [
      ['terms.wellness.title',     'terms.wellness.text'],
      ['terms.disclaimer.title',   'terms.disclaimer.text'],
      ['terms.volume.title',       'terms.volume.text'],
      ['terms.noWarranty.title',   'terms.noWarranty.text'],
      ['terms.license.title',      'terms.license.text'],
      ['terms.changes.title',      'terms.changes.text']
    ];
    var sectionsHtml = sections.map(function (pair) {
      return buildDocSection(t(pair[0], ''), t(pair[1], ''));
    }).join('');

    return (
      '<div class="set-sheet" role="dialog" aria-modal="true"' +
        ' aria-label="' + escapeHtml(title) + '">' +
        '<div class="set-sheet-grip" aria-hidden="true"></div>' +
        '<div class="set-header">' +
          '<button class="set-back" type="button" data-action="back"' +
            ' aria-label="' + escapeHtml(backLabel) + '">' + svgBack() + '</button>' +
          '<h2 class="set-title">' + escapeHtml(title) + '</h2>' +
          '<button class="set-close" type="button" data-action="close"' +
            ' aria-label="' + escapeHtml(closeAria) + '">' + svgClose() + '</button>' +
        '</div>' +
        '<div class="set-body set-body--doc">' +
          (lastUpdated ? '<div class="set-doc-meta">' + escapeHtml(lastUpdated) + '</div>' : '') +
          (intro ? '<p class="set-doc-intro">' + escapeHtml(intro) + '</p>' : '') +
          sectionsHtml +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Theme apply (sync с index.html logic)
  // ============================================================

  function applyTheme(themeId) {
    var actual = themeId;
    if (themeId === 'auto') {
      var prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      actual = prefersDark ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', actual);

    // Update header theme icons (index.html JS)
    var moon = document.getElementById('themeIconMoon');
    var sun = document.getElementById('themeIconSun');
    if (moon && sun) {
      if (actual === 'light') { moon.style.display = 'none'; sun.style.display = 'block'; }
      else { moon.style.display = 'block'; sun.style.display = 'none'; }
    }

    if (themeId === 'auto') {
      try { localStorage.removeItem(STORAGE_THEME); } catch (e) {}
    } else {
      try { localStorage.setItem(STORAGE_THEME, actual); } catch (e) {}
    }
  }

  // ============================================================
  // Data export
  // ============================================================

  function collectAllData() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && (key.indexOf('auralis_') === 0 || key.indexOf('auralis-') === 0)) {
          var val = localStorage.getItem(key);
          try { data[key] = JSON.parse(val); }
          catch (e) { data[key] = val; }
        }
      }
    } catch (e) { /* ignore */ }
    return data;
  }

  function exportData() {
    var payload = {
      version: '1.0',
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      locale: getCurrentLocale(),
      data: collectAllData()
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var filename = t('settings.data.exportFilename',
      'auralis-data-' + todayKey() + '.json', { date: todayKey() });
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // P0-7 FIX (2026-05-28): пълно изтриване за Google Play health-app privacy
  // claim. Преди това разчитахме само на 'auralis_'/'auralis-' prefix match;
  // тук добавяме explicit known-keys list като primary mechanism (audit-ready
  // документация за всички данни които приложението пази). Pattern fallback
  // остава catch-all за бъдещи keys и dynamic такива (drafts, audio-toggles).
  //
  // ИНВАРИАНТ: всеки нов module който call-ва localStorage.setItem ТРЯБВА
  // да добави своя key в DATA_KEYS_ALL по-долу.
  var DATA_KEYS_ALL = [
    // Theme + i18n
    'auralis-theme', 'auralis_locale',
    // Onboarding + consent + phase routing
    'auralis-onboarding-done', 'auralis-consent-granted',
    'auralis-phase', 'auralis-subphase',
    // Quiz
    'auralis-quiz-subphase', 'auralis-quiz-answers', 'auralis-quiz-done',
    'auralis-quiz-profile', 'auralis-quiz-di',
    // 14-day program + THI
    'auralis-program-start-date', 'auralis-program-current-day',
    'auralis-thi-baseline', 'auralis-thi-day14',
    'auralis-thi-baseline-breakdown', 'auralis-thi-day14-breakdown',
    'auralis-thi-active-index', 'auralis-thi-active-scores',
    // Diary + streak (legacy + current)
    'auralis-diary-entries', 'auralis_diary_entries',
    'auralis-diary-soft-check',
    'auralis-streak-active-days', 'auralis-streak-freezes-remaining',
    'auralis-streak-last-entry-date', 'auralis-streak-frozen-dates',
    // Nudges + timezone
    'auralis-listen-nudge-dismissed-at',
    'auralis-tz-last', 'auralis-tz-banner-dismissed-at',
    // SAFETY-2 calibration
    'auralis-calibration-done', 'auralis-mixing-point-volume',
    // PROFILE-CONFIG + NAV
    'auralis-user-overrides', 'auralis-last-category-view',
    // PITCH-1 + PACK C T3 notch
    'auralis-pitch-tests', 'auralis-pitch-skip-reason',
    'auralis-pitch-skipped', 'auralis-audio-device',
    'auralis-notch-disabled',
    // Player / Mixer / Sleep
    'auralis_player_noise_id', 'auralis_player_layer1_vol', 'auralis_player_layer2_vol',
    'auralis-master-volume', 'auralis_sleep_timer_minutes',
    // Library / Favorites
    'auralis_library_favorites', 'auralis_favorites',
    // Misc UI state
    'auralis_haptics_enabled', 'auralis-headphones-warning-seen',
    'auralis_voice_privacy_acknowledged',
    'auralis_tour_done', 'auralis_notif_last_shown',
    'auralis_category_autoplay', 'auralis-profile-welcome-seen',
    'auralis-science-last-section', 'auralis-science-reminders',
    'auralis_reminders',
    // Analytics + error log
    'auralis_analytics_sessions', 'auralis_analytics_summary',
    'auralis_error_log',
    // Trial gating
    'auralis_trial_start', 'auralis_unlocked'
  ];

  function deleteAllData() {
    var ok = window.confirm(
      t('settings.data.deleteConfirm',
        'Сигурни ли сте? Това ще изтрие всичко. Действието е необратимо.')
    );
    if (!ok) return;
    // Stop audio преди reset за да не остане suspended source
    if (window.AudioEngine && window.AudioEngine.stop) window.AudioEngine.stop();
    try {
      var toRemove = DATA_KEYS_ALL.slice();
      // Pattern fallback: catch dynamic keys (audio toggles, drafts, etc.)
      // или keys въведени от нови modules които пропуснаха да обновят
      // DATA_KEYS_ALL. Покрива auralis_audio_*, auralis_diary_draft_*, etc.
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf('auralis_') === 0 || k.indexOf('auralis-') === 0)) {
          if (toRemove.indexOf(k) === -1) toRemove.push(k);
        }
      }
      toRemove.forEach(function (k) {
        try { localStorage.removeItem(k); } catch (_) {}
      });
    } catch (e) { /* ignore */ }
    window.location.reload();
  }

  function debugResetTrial() {
    try {
      localStorage.removeItem('auralis_trial_start');
      localStorage.removeItem('auralis_unlocked');
    } catch (e) {}
    trialResetMessage = t('settings.data.debugResetDone', 'Trial reset ✓');
    refresh();
  }

  function debugSkipOnboarding() {
    // Mark onboarding done + jump към Library (без quiz още — Mock quiz е separate)
    try {
      localStorage.setItem('auralis-onboarding-done', 'true');
      localStorage.setItem('auralis-consent-granted', 'true');
    } catch (e) {}
    if (window.AudioEngine && window.AudioEngine.stop) window.AudioEngine.stop();
    // Стопи всички phase + redirect
    close();
    window.location.reload();
  }

  function debugResetOnboarding() {
    // Изтрий onboarding + quiz state — потребителят минава отначало
    try {
      var keys = [
        'auralis-onboarding-done', 'auralis-consent-granted',
        'auralis-phase', 'auralis-subphase',
        'auralis-quiz-subphase', 'auralis-quiz-answers',
        'auralis-quiz-done', 'auralis-quiz-profile', 'auralis-quiz-di'
      ];
      keys.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
    if (window.AudioEngine && window.AudioEngine.stop) window.AudioEngine.stop();
    close();
    window.location.reload();
  }

  function debugShowAnalytics() {
    if (!window.Analytics) return;
    var data = window.Analytics.exportAll();
    if (window.BottomSheet) {
      window.BottomSheet.open({
        title: 'Raw Analytics',
        content: '<pre style="font-size:11px;overflow:auto;max-height:60vh;white-space:pre-wrap;color:var(--text);">' +
          data.replace(/</g, '&lt;') + '</pre>',
        height: '80vh'
      });
    }
  }

  function debugClearAnalytics() {
    if (!window.Analytics) return;
    window.Analytics.clear();
    if (window.Toast) window.Toast.success('Analytics cleared');
  }

  function debugFakeAnalytics() {
    if (!window.Analytics) return;
    window.Analytics.generateFakeData();
  }

  function debugMockQuiz() {
    // Set onboarding + consent + quiz done с TH_C profile, DI=8 (умерен).
    try {
      localStorage.setItem('auralis-onboarding-done', 'true');
      localStorage.setItem('auralis-consent-granted', 'true');
      // Fake answers: всички 'a' (опростено за mock)
      var fakeAnswers = {};
      for (var i = 1; i <= 15; i++) fakeAnswers['q' + i] = 'a';
      localStorage.setItem('auralis-quiz-answers', JSON.stringify(fakeAnswers));
      localStorage.setItem('auralis-quiz-done', 'true');
      localStorage.setItem('auralis-quiz-profile', 'TH_C');
      localStorage.setItem('auralis-quiz-di', '8');
      localStorage.setItem('auralis-phase', 'library');
    } catch (e) {}
    if (window.AudioEngine && window.AudioEngine.stop) window.AudioEngine.stop();
    close();
    window.location.reload();
  }

  // ============================================================
  // BB1: Granular deletion
  // ============================================================

  var SECTION_KEYS = {
    quiz: ['auralis-quiz-answers', 'auralis-quiz-done', 'auralis-quiz-profile', 'auralis-quiz-di', 'auralis-quiz-subphase'],
    // audit 1.0.104: реалният 14-дневен дневник е 'auralis-diary-entries' (тире,
    // state.js KEY_DIARY_ENTRIES); старият '_' ключ е мъртъв. Трием и двата.
    diary: ['auralis-diary-entries', 'auralis_diary_entries', 'auralis-diary-soft-check'],
    favorites: ['auralis_favorites', 'auralis_library_favorites'],
    history: ['auralis_analytics_sessions']
  };

  function deleteSection(section) {
    var keys = SECTION_KEYS[section];
    if (!keys) return;
    var ok = window.confirm(t('settings.data.deleteConfirmSection',
      'Изтрий ' + section + '? Действието е необратимо.', { section: section }));
    if (!ok) return;
    try { keys.forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { /* ignore */ }
    if (window.Toast) window.Toast.success(t('settings.data.deletedSection', 'Изтрито: ' + section, { section: section }));
  }

  // ============================================================
  // BB2: Per-section export
  // ============================================================

  function exportSection(section) {
    var keys = SECTION_KEYS[section];
    if (!keys) return;
    var data = {};
    try {
      keys.forEach(function (k) {
        var val = localStorage.getItem(k);
        if (val !== null) {
          try { data[k] = JSON.parse(val); } catch (e) { data[k] = val; }
        }
      });
    } catch (e) { /* ignore */ }
    var payload = { section: section, exportedAt: new Date().toISOString(), data: data };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var filename = 'auralis-' + section + '-' + todayKey() + '.json';
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    if (window.Toast) window.Toast.success(t('settings.data.exported', 'Експортирано'));
  }

  // ============================================================
  // BB4: Volume profile apply
  // ============================================================

  function applyVolumeProfile(btn) {
    var master = parseInt(btn.getAttribute('data-master'), 10);
    var l1 = parseInt(btn.getAttribute('data-l1'), 10);
    var l2 = parseInt(btn.getAttribute('data-l2'), 10);
    if (window.AudioEngine) {
      if (window.AudioEngine.setMasterVolume) window.AudioEngine.setMasterVolume(master);
      if (window.AudioEngine.setLayer1Volume) window.AudioEngine.setLayer1Volume(l1);
      if (window.AudioEngine.setLayer2Volume) window.AudioEngine.setLayer2Volume(l2);
    }
    try { localStorage.setItem(STORAGE_VOLUME, String(master)); } catch (e) { /* ignore */ }
    var label = el('setVolValue');
    if (label) label.textContent = master + '%';
    var slider = el('setVolSlider');
    if (slider) slider.value = master;
    if (window.Toast) window.Toast.info(btn.textContent.trim());
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onLangChange(e) {
    var newLocale = e.currentTarget.value;
    if (!newLocale) return;
    if (window.i18n && window.i18n.setLocale) {
      window.i18n.setLocale(newLocale).then(function () {
        // Reload за full UI refresh
        window.location.reload();
      });
    }
  }

  function onThemeClick(themeId) {
    applyTheme(themeId);
    refresh();
  }

  // P0 SLIDER-CLICK v2: isFinal pattern + localStorage debounce.
  // Виж player.js за context. 'input' = direct gain.value; 'change' = ramp.
  var masterPersistTimer = null;

  function onVolumeInput(e) {
    var val = parseInt(e.currentTarget.value, 10);
    if (isNaN(val)) return;
    val = Math.max(0, Math.min(100, val));
    var label = el('setVolValue');
    if (label) label.textContent = val + '%';
    if (window.AudioEngine && window.AudioEngine.setMasterVolume) {
      window.AudioEngine.setMasterVolume(val, e.type === 'change');
    }
    // Debounce localStorage save.
    if (masterPersistTimer) clearTimeout(masterPersistTimer);
    masterPersistTimer = setTimeout(function () {
      masterPersistTimer = null;
      try { localStorage.setItem(STORAGE_VOLUME, String(val)); } catch (e2) {}
    }, 300);
    return;
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      var action = actionBtn.getAttribute('data-action');
      if (action === 'close') close();
      else if (action === 'back') showMainView();
      else if (action === 'data-export') exportData();
      else if (action === 'data-delete') deleteAllData();
      else if (action === 'data-debug-trial') debugResetTrial();
      else if (action === 'data-debug-skip-onboarding') debugSkipOnboarding();
      else if (action === 'data-debug-reset-onboarding') debugResetOnboarding();
      else if (action === 'data-debug-mock-quiz') debugMockQuiz();
      else if (action === 'data-debug-show-analytics') debugShowAnalytics();
      else if (action === 'data-debug-clear-analytics') debugClearAnalytics();
      else if (action === 'data-debug-fake-analytics') debugFakeAnalytics();
      else if (action === 'del-quiz') deleteSection('quiz');
      else if (action === 'del-diary') deleteSection('diary');
      else if (action === 'del-favorites') deleteSection('favorites');
      else if (action === 'del-history') deleteSection('history');
      else if (action === 'export-quiz') exportSection('quiz');
      else if (action === 'export-diary') exportSection('diary');
      else if (action === 'export-favorites') exportSection('favorites');
      else if (action === 'vol-profile') applyVolumeProfile(actionBtn);
      else if (action === 'open-stats') { if (window.Analytics) window.Analytics.showStats(); }
      else if (action === 'open-favorites') { if (window.Favorites) window.Favorites.showSheet(); }
      else if (action === 'open-faq') {
        // Close Settings first, then open FAQ overlay.
        close();
        if (window.FAQ && window.FAQ.open) window.FAQ.open();
      }
      else if (action === 'open-science') {
        // Close Settings first, then open ScienceInfo overlay.
        close();
        if (window.ScienceInfo && window.ScienceInfo.open) window.ScienceInfo.open();
      }
      else if (action === 'pitch-retest') {
        // Close Settings → open PitchTest fresh run (user-initiated retest).
        close();
        if (window.PitchTest && window.PitchTest.open) window.PitchTest.open();
      }
      else if (action === 'diary-import-trigger') {
        var input = el('setDiaryImportInput');
        if (input) input.click();
      }
      else if (action === 'voice-reset-privacy') {
        if (window.VoiceDictation && window.VoiceDictation.resetPrivacyFlag) {
          window.VoiceDictation.resetPrivacyFlag();
          if (window.Toast && window.Toast.success) {
            window.Toast.success(t('voice.settings.resetDoneToast',
              'Готово. При следваща употреба ще видите инфото отново.'));
          }
        }
      }
      else if (action === 'open-privacy') {
        // P0 REGULATORY (2026-05-28): отваряме publicly-hosted privacy.html
        // (Google Play submission изисква public URL). In-app
        // buildPrivacyViewHtml остава като dead-code fallback за
        // backward-compat но primary entry е external page.
        window.open('privacy.html', '_blank', 'noopener,noreferrer');
      }
      else if (action === 'open-terms') showTermsView();
      return;
    }
    var themeBtn = e.target.closest('[data-theme-id]');
    if (themeBtn) {
      onThemeClick(themeBtn.getAttribute('data-theme-id'));
    }
  }

  function onDiaryImportFile(e) {
    var input = e.target;
    var file = input && input.files && input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var text = (reader.result || '') + '';
      if (!text) {
        if (window.Toast && window.Toast.warning) {
          window.Toast.warning(t('ui.diary.import.errorEmpty', 'Файлът е празен или невалиден.'));
        }
        input.value = '';
        return;
      }
      if (!window.Diary || !window.Diary.importFromJson) {
        if (window.Toast && window.Toast.warning) {
          window.Toast.warning(t('ui.diary.import.errorFormat',
            'Файлът не съдържа очаквания формат на дневник.'));
        }
        input.value = '';
        return;
      }
      var result = window.Diary.importFromJson(text);
      if (result.error === 'parse') {
        if (window.Toast && window.Toast.warning) {
          window.Toast.warning(t('ui.diary.import.errorParse',
            'Файлът не е валиден JSON. Проверете формата и опитайте отново.'));
        }
      } else if (result.error === 'format' || result.error === 'empty') {
        if (window.Toast && window.Toast.warning) {
          window.Toast.warning(t('ui.diary.import.errorFormat',
            'Файлът не съдържа очаквания формат на дневник.'));
        }
      } else {
        var msg = t('ui.diary.import.successFmt',
          'Импортирани {imported} записа ({skipped} пропуснати).',
          { imported: result.imported, skipped: result.skipped });
        if (window.Toast && window.Toast.success) window.Toast.success(msg);
      }
      input.value = '';
    };
    reader.onerror = function () {
      if (window.Toast && window.Toast.warning) {
        window.Toast.warning(t('ui.diary.import.errorEmpty', 'Файлът е празен или невалиден.'));
      }
      input.value = '';
    };
    reader.readAsText(file);
  }

  function onOverlayClick(e) {
    if (e.target === overlay) close();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  // ============================================================
  // Render
  // ============================================================

  function refresh() {
    if (!overlay) return;
    var html;
    if (currentView === 'privacy') html = buildPrivacyViewHtml();
    else if (currentView === 'terms') html = buildTermsViewHtml();
    else html = buildMainViewHtml();
    overlay.innerHTML = html;
    bindEvents();
  }

  function showMainView() {
    currentView = 'main';
    refresh();
  }

  function showPrivacyView() {
    currentView = 'privacy';
    refresh();
  }

  function showTermsView() {
    currentView = 'terms';
    refresh();
  }

  function bindEvents() {
    if (!overlay) return;
    overlay.removeEventListener('click', onOverlayClick);   // audit 1.0.105: refresh() вика bindEvents → без remove listener-ите се трупат
    overlay.addEventListener('click', onOverlayClick);

    // Action buttons + theme + back/close
    var sheet = overlay.querySelector('.set-sheet');
    if (sheet) sheet.addEventListener('click', onClick);

    var langSel = overlay.querySelector('#setLangSelect');
    if (langSel) langSel.addEventListener('change', onLangChange);

    var volSlider = overlay.querySelector('#setVolSlider');
    if (volSlider) {
      volSlider.addEventListener('input', onVolumeInput);
      volSlider.addEventListener('change', onVolumeInput);
    }

    // (Reminders toggles МАХНАТИ 1.0.103 — секцията вече не се рендерира.)

    // PACK C T3: notch filter toggle (Лична честотна терапия)
    var notchToggle = overlay.querySelector('#setNotchToggle');
    if (notchToggle) {
      notchToggle.addEventListener('change', function () {
        var s = window.AppState;
        if (!s || !s.setNotchDisabled) return;
        // checked = ON = NOT disabled
        var enabled = !!notchToggle.checked;
        // Изключването НЕ е препоръчително — питай за потвърждение и при
        // отказ върни toggle-а обратно на включено.
        if (!enabled) {
          var ok = window.confirm(t('settings.notch.confirmOff',
            'Сигурни ли сте? Личната честотна терапия е в основата на метода. ' +
            'Без нея звуците губят главното си предимство. Да я изключим ли все пак?'));
          if (!ok) {
            notchToggle.checked = true;
            return;
          }
        }
        s.setNotchDisabled(!enabled);
        if (window.Toast) {
          var msg = enabled
            ? t('settings.notch.toastOn', 'Личната терапия е активирана')
            : t('settings.notch.toastOff', 'Личната терапия е спряна. Звуците ще се възпроизвеждат без notch филтър.');
          if (window.Toast.show) window.Toast.show(msg, { durationMs: 2400 });
        }
        // Soft refresh само на тази секция — re-render целия sheet
        // за да обновим description и stateLabel.
        refresh();
      });
    }

    // Diary import (edge case #7)
    var diaryImport = overlay.querySelector('#setDiaryImportInput');
    if (diaryImport) {
      diaryImport.addEventListener('change', onDiaryImportFile);
    }

    // JJ: Advanced Audio sliders
    var xfadeSlider = overlay.querySelector('#setXfadeSlider');
    if (xfadeSlider) {
      xfadeSlider.addEventListener('input', function () {
        var v = parseFloat(xfadeSlider.value);
        setAudioSetting('crossfade', v);
        var lbl = overlay.querySelector('#setXfadeVal');
        if (lbl) lbl.textContent = v.toFixed(1) + 's';
      });
    }
    var l2DefSlider = overlay.querySelector('#setL2DefSlider');
    if (l2DefSlider) {
      l2DefSlider.addEventListener('input', function () {
        var v = parseInt(l2DefSlider.value, 10);
        setAudioSetting('l2_default_vol', v);
        var lbl = overlay.querySelector('#setL2DefVal');
        if (lbl) lbl.textContent = v + '%';
      });
    }
    var sleepFadeSlider = overlay.querySelector('#setSleepFadeSlider');
    if (sleepFadeSlider) {
      sleepFadeSlider.addEventListener('input', function () {
        var v = parseInt(sleepFadeSlider.value, 10);
        setAudioSetting('sleep_fade', v);
        var lbl = overlay.querySelector('#setSleepFadeVal');
        if (lbl) lbl.textContent = v + 's';
      });
    }
  }

  // ============================================================
  // Open / close / toggle
  // ============================================================

  function open() {
    if (overlay) return;
    currentView = 'main';
    trialResetMessage = '';
    overlay = document.createElement('div');
    overlay.className = 'set-overlay';
    overlay.innerHTML = buildMainViewHtml();
    document.body.appendChild(overlay);
    bindEvents();
    if (!escHandlerBound) {
      window.addEventListener('keydown', onKeyDown);
      escHandlerBound = true;
    }
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    currentView = 'main';
    if (escHandlerBound) {
      window.removeEventListener('keydown', onKeyDown);
      escHandlerBound = false;
    }
  }

  function toggle() {
    if (overlay) close();
    else open();
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    open: open,
    close: close,
    toggle: toggle
  };
})();
