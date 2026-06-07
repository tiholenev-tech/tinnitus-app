/**
 * AURALIS i18n v1.0 — внутрешен модул за 12 езика
 * ================================================
 * Per BIBLE v3 §i18n: en/zh/hi/es/ar/pt/ru/fr/de/ja/ko/bg = 70% global market.
 *
 * Storage:
 *   i18n/<locale>.json  — translations (JSON)
 *   localStorage 'auralis_locale'  — user override (един от SUPPORTED)
 *
 * Public API:
 *   i18n.init()                  — async load на initial locale; resolve преди render
 *   i18n.t('key.path', fallback) — returns string; supports {placeholder} interpolation
 *   i18n.tArr('key.path')        — returns array (за списъци)
 *   i18n.tObj('key.path')        — returns nested object (за content entries)
 *   i18n.setLocale(code)         — async load + dispatch 'i18n-locale-changed' event
 *   i18n.getLocale()
 *   i18n.getSupported()          — array of locale codes
 *   i18n.applyToDOM(root)        — заменя [data-i18n] / [data-i18n-aria-label] / [data-i18n-title]
 */

window.i18n = (function () {
  'use strict';

  var STORAGE_KEY = 'auralis_locale';
  // P0-FIX (2026-05-28): SUPPORTED = ['bg'] single-lang launch.
  // Reasoning: en.json съществува но НЕ е production-ready (regulatory
  // risk да stigne incomplete EN до Google Play submission). EN кодова
  // инфраструктура остава за бъдеще, но НЕ е достъпна от UI и
  // setLocale('en') ще reject-не. Когато EN е готов — върни 'en' в array
  // + добави го в LANGUAGES list на language-picker.js едновременно.
  var SUPPORTED = ['bg', 'it', 'ro', 'el', 'en', 'es'];
  var DEFAULT_FALLBACK = 'bg';  // beta: BG complete, IT в процес на превод (вълни), EN stub

  var locale = DEFAULT_FALLBACK;
  var translations = {};

  // ============================================================
  // Locale detection
  // ============================================================

  function detectInitial() {
    // 0. URL ?lang= override — сайтът подава езика на апа при вход (/it/ → ?lang=it).
    //    Печели над запазения избор И го записва, за да остане при следващи отваряния.
    //    Без параметър (напр. инсталираният ап на заварен потребител) — стъпка 1 пази избора му.
    try {
      var qp = (new URLSearchParams(window.location.search)).get('lang');
      if (qp) qp = qp.toLowerCase();
      if (qp && SUPPORTED.indexOf(qp) !== -1) {
        try { localStorage.setItem(STORAGE_KEY, qp); } catch (e) { /* ignore */ }
        // изчистваме параметъра от URL, за да не „залепне" при reload/споделяне
        try {
          if (window.history && history.replaceState) {
            history.replaceState(null, '', window.location.pathname + window.location.hash);
          }
        } catch (e) { /* ignore */ }
        return qp;
      }
    } catch (e) { /* ignore */ }

    // 1. localStorage override
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) { /* ignore */ }

    // 2. navigator.language — DISABLED during beta (en.json не е готов)
    // var nav = ((navigator.language || navigator.userLanguage || '') + '').split('-')[0].toLowerCase();
    // if (SUPPORTED.indexOf(nav) !== -1) return nav;

    // 3. Default fallback (during beta: BG)
    return DEFAULT_FALLBACK;
  }

  // ============================================================
  // Load (fetch JSON)
  // ============================================================

  function loadLocale(localeCode) {
    return fetch('i18n/' + localeCode + '.json', { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + localeCode);
        return res.json();
      })
      .then(function (data) {
        translations = data;
        locale = localeCode;
        document.documentElement.setAttribute('lang', localeCode);
        // RTL за арабски (Phase 2)
        if (localeCode === 'ar') {
          document.documentElement.setAttribute('dir', 'rtl');
        } else {
          document.documentElement.setAttribute('dir', 'ltr');
        }
        console.log('[i18n] loaded:', localeCode);
        return data;
      });
  }

  // ============================================================
  // Resolve key path (dot-notation)
  // ============================================================

  function resolve(keyPath) {
    if (!keyPath) return undefined;
    var parts = keyPath.split('.');
    var node = translations;
    for (var i = 0; i < parts.length; i++) {
      if (!node || typeof node !== 'object') return undefined;
      node = node[parts[i]];
    }
    return node;
  }

  function interpolate(str, params) {
    if (!params || typeof str !== 'string') return str;
    return str.replace(/\{(\w+)\}/g, function (match, name) {
      return (params[name] !== undefined) ? String(params[name]) : match;
    });
  }

  function t(keyPath, fallback, params) {
    // Допуска t(key, params) ако вторият арг е object без fallback
    if (typeof fallback === 'object' && fallback !== null && !params) {
      params = fallback;
      fallback = null;
    }
    var val = resolve(keyPath);
    // P0 FIX 2026-05-28 (launch blocker):
    //   (A) "TODO:" prefix detection — централизирано тук вместо ad-hoc
    //       tOrNull() helpers в 5+ модула. Когато се loadне en.json
    //       (например stale SW cache от преди ['bg']-only commit), всичките
    //       'TODO: Choose a mode' / 'TODO: 49 sounds' tab-ове щяха да
    //       стигнат до UI. Третираме ги като missing key → fallback.
    //   (B) Fallback също минава през interpolate() — преди това
    //       t('thi.badge.goal', 'цел < {goal}', {goal:80}) при missing
    //       връщаше литерален 'цел < {goal}' (без замяна).
    if (typeof val !== 'string' || val.indexOf('TODO:') === 0) {
      return interpolate(fallback != null ? fallback : keyPath, params);
    }
    return interpolate(val, params);
  }

  function tArr(keyPath) {
    var val = resolve(keyPath);
    return Array.isArray(val) ? val : [];
  }

  function tObj(keyPath) {
    var val = resolve(keyPath);
    return (val && typeof val === 'object' && !Array.isArray(val)) ? val : null;
  }

  // ============================================================
  // DOM helper — за HTML-declarative замени
  // ============================================================

  function applyToDOM(root) {
    root = root || document;

    // textContent
    var textEls = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < textEls.length; i++) {
      var key = textEls[i].getAttribute('data-i18n');
      var txt = t(key);
      if (txt !== key) textEls[i].textContent = txt;
    }

    // aria-label
    var ariaEls = root.querySelectorAll('[data-i18n-aria-label]');
    for (var j = 0; j < ariaEls.length; j++) {
      var ak = ariaEls[j].getAttribute('data-i18n-aria-label');
      var av = t(ak);
      if (av !== ak) ariaEls[j].setAttribute('aria-label', av);
    }

    // title attr
    var titleEls = root.querySelectorAll('[data-i18n-title]');
    for (var k = 0; k < titleEls.length; k++) {
      var tk = titleEls[k].getAttribute('data-i18n-title');
      var tv = t(tk);
      if (tv !== tk) titleEls[k].setAttribute('title', tv);
    }

    // placeholder attr
    var phEls = root.querySelectorAll('[data-i18n-placeholder]');
    for (var l = 0; l < phEls.length; l++) {
      var pk = phEls[l].getAttribute('data-i18n-placeholder');
      var pv = t(pk);
      if (pv !== pk) phEls[l].setAttribute('placeholder', pv);
    }
  }

  // ============================================================
  // Locale switching
  // ============================================================

  function setLocale(localeCode) {
    if (SUPPORTED.indexOf(localeCode) === -1) {
      console.warn('[i18n] unsupported locale:', localeCode);
      return Promise.reject(new Error('Unsupported: ' + localeCode));
    }
    try { localStorage.setItem(STORAGE_KEY, localeCode); } catch (e) { /* ignore */ }
    return loadLocale(localeCode).then(function () {
      window.dispatchEvent(new CustomEvent('i18n-locale-changed', {
        detail: { locale: localeCode }
      }));
    });
  }

  function getLocale() { return locale; }
  function getSupported() { return SUPPORTED.slice(); }

  // ============================================================
  // Bootstrap
  // ============================================================

  function init() {
    var initialLocale = detectInitial();
    return loadLocale(initialLocale).catch(function (e) {
      console.warn('[i18n] failed loading', initialLocale, '— falling back to', DEFAULT_FALLBACK, e);
      if (initialLocale !== DEFAULT_FALLBACK) {
        return loadLocale(DEFAULT_FALLBACK);
      }
      throw e;
    });
  }

  return {
    init: init,
    t: t,
    tArr: tArr,
    tObj: tObj,
    setLocale: setLocale,
    getLocale: getLocale,
    getSupported: getSupported,
    applyToDOM: applyToDOM
  };
})();
