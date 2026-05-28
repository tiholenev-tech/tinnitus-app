/**
 * AURALIS Language Picker — full-screen i18n selector (Task WW)
 * ================================================================
 * BottomSheet with 12 languages, search, current highlight.
 * Select → load i18n → reload UI without page refresh.
 *
 * Public API:
 *   LanguagePicker.open()
 */

window.LanguagePicker = (function () {
  'use strict';

  // P0-FIX (2026-05-28): single-lang launch — само BG в UI.
  // EN кодовата инфраструктура остава за бъдеще (en.json не се изтрива),
  // но не е достъпна от picker за да не stigne incomplete EN до Google
  // Play submission. Когато EN е production-ready → добави entry ТУК +
  // extend SUPPORTED в i18n.js едновременно.
  var LANGUAGES = [
    { code: 'bg', name: 'Български', native: 'Български', flag: '🇧🇬' }
  ];

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getCurrentLocale() {
    if (window.i18n && window.i18n.getLocale) return window.i18n.getLocale();
    try { return localStorage.getItem('auralis_locale') || 'bg'; } catch (e) { return 'bg'; }
  }

  function open() {
    if (!window.BottomSheet) return;

    var currentCode = getCurrentLocale();
    var content = document.createElement('div');
    content.className = 'lp-content';

    function render(filter) {
      filter = (filter || '').toLowerCase();
      var filtered = LANGUAGES.filter(function (lang) {
        if (!filter) return true;
        return lang.name.toLowerCase().indexOf(filter) !== -1 ||
               lang.native.toLowerCase().indexOf(filter) !== -1 ||
               lang.code.indexOf(filter) !== -1;
      });

      var currentLang = LANGUAGES.find(function (l) { return l.code === currentCode; });
      var currentHtml = currentLang
        ? '<div class="lp-current">' +
            '<span class="lp-current-label">' + escapeHtml(t('languagePicker.current', 'Текущ:')) + '</span>' +
            '<span class="lp-current-flag">' + currentLang.flag + '</span>' +
            '<span class="lp-current-name">' + escapeHtml(currentLang.native) + '</span>' +
          '</div>'
        : '';

      var listHtml = filtered.map(function (lang) {
        var isActive = lang.code === currentCode;
        return (
          '<button class="lp-item' + (isActive ? ' is-active' : '') + '"' +
            ' type="button" data-lang="' + lang.code + '">' +
            '<span class="lp-flag">' + lang.flag + '</span>' +
            '<span class="lp-name">' + escapeHtml(lang.native) + '</span>' +
            (isActive ? '<span class="lp-check">✓</span>' : '') +
          '</button>'
        );
      }).join('');

      content.innerHTML =
        '<div class="lp-search-wrap">' +
          '<input class="lp-search" type="search" placeholder="' +
            escapeHtml(t('languagePicker.search', 'Търсете...')) + '" id="lpSearch">' +
        '</div>' +
        currentHtml +
        '<div class="lp-section-label">' + escapeHtml(t('languagePicker.available', 'Достъпни:')) + '</div>' +
        '<div class="lp-list">' + listHtml + '</div>';

      // Bind search
      var searchInput = content.querySelector('#lpSearch');
      if (searchInput) {
        searchInput.value = filter;
        searchInput.addEventListener('input', function () {
          render(searchInput.value);
        });
        if (filter) searchInput.focus();
      }

      // Bind language buttons
      var buttons = content.querySelectorAll('[data-lang]');
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function (e) {
          var code = e.currentTarget.getAttribute('data-lang');
          selectLanguage(code);
        });
      }
    }

    render('');

    window.BottomSheet.open({
      title: t('languagePicker.title', 'Изберете език'),
      content: content,
      height: '80vh'
    });
  }

  function selectLanguage(code) {
    if (!code) return;
    if (window.Haptics) window.Haptics.light();
    if (window.BottomSheet) window.BottomSheet.closeAll();

    if (window.i18n && window.i18n.setLocale) {
      window.i18n.setLocale(code).then(function () {
        window.location.reload();
      });
    } else {
      try { localStorage.setItem('auralis_locale', code); } catch (e) { /* ignore */ }
      window.location.reload();
    }
  }

  return { open: open };
})();
