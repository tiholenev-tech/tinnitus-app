/**
 * AURALIS ErrorHandler — global error recovery (Task QQ)
 * =========================================================
 * Catches: audio errors (→ AudioErrorBanner), network (→ banner),
 * localStorage quota (→ toast), unknown JS errors (→ silent log).
 *
 * Public API:
 *   ErrorHandler.init()                    — bind global handlers
 *   ErrorHandler.handle(error, context)    — manual error handling
 *   ErrorHandler.reportSilent(error, meta) — log without UI
 */

window.ErrorHandler = (function () {
  'use strict';

  var MAX_LOG_SIZE = 50;
  var STORAGE_LOG = 'auralis_error_log';
  var networkBanner = null;

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  // ============================================================
  // Silent error log (localStorage)
  // ============================================================

  function logError(error, context) {
    try {
      var log = JSON.parse(localStorage.getItem(STORAGE_LOG) || '[]');
      log.push({
        time: new Date().toISOString(),
        message: error && error.message || String(error),
        context: context || 'unknown',
        stack: error && error.stack ? error.stack.substring(0, 200) : null
      });
      if (log.length > MAX_LOG_SIZE) log = log.slice(-MAX_LOG_SIZE);
      localStorage.setItem(STORAGE_LOG, JSON.stringify(log));
    } catch (e) { /* storage full — ignore */ }
  }

  // ============================================================
  // Handle by type
  // ============================================================

  function handle(error, context) {
    logError(error, context);
    var msg = error && error.message || String(error);

    // Audio errors
    if (context === 'audio' || msg.indexOf('audio') !== -1 || msg.indexOf('decode') !== -1) {
      // AudioErrorBanner handles this via event
      return;
    }

    // Storage quota
    if (msg.indexOf('QuotaExceeded') !== -1 || msg.indexOf('quota') !== -1) {
      handleStorageQuota();
      return;
    }

    // Network errors
    if (msg.indexOf('NetworkError') !== -1 || msg.indexOf('fetch') !== -1 ||
        msg.indexOf('Failed to fetch') !== -1) {
      showNetworkBanner();
      return;
    }

    // Unknown — silent
    console.warn('[auralis] Handled error:', context, msg);
  }

  function reportSilent(error, meta) {
    logError(error, meta && meta.context || 'silent');
  }

  // ============================================================
  // Storage quota recovery
  // ============================================================

  function handleStorageQuota() {
    // Try cleaning old analytics sessions
    try {
      var sessions = JSON.parse(localStorage.getItem('auralis_analytics_sessions') || '[]');
      if (sessions.length > 100) {
        sessions = sessions.slice(-50);
        localStorage.setItem('auralis_analytics_sessions', JSON.stringify(sessions));
      }
    } catch (e) { /* ignore */ }

    if (window.Toast) {
      window.Toast.error(t('errors.storageQuota', 'Паметта на устройството е пълна. Изтрийте стари данни.'));
    }
  }

  // ============================================================
  // Network banner
  // ============================================================

  function showNetworkBanner() {
    if (networkBanner) return;
    networkBanner = document.createElement('div');
    networkBanner.className = 'eh-network-banner';
    networkBanner.setAttribute('role', 'alert');
    networkBanner.innerHTML =
      '<span class="eh-network-text">' +
        t('errors.network', 'Без интернет връзка') +
      '</span>' +
      '<button class="eh-network-dismiss" type="button">×</button>';
    document.body.appendChild(networkBanner);
    requestAnimationFrame(function () { networkBanner.classList.add('is-visible'); });

    networkBanner.querySelector('.eh-network-dismiss').addEventListener('click', hideNetworkBanner);
  }

  function hideNetworkBanner() {
    if (!networkBanner) return;
    networkBanner.classList.remove('is-visible');
    setTimeout(function () {
      if (networkBanner && networkBanner.parentNode) networkBanner.parentNode.removeChild(networkBanner);
      networkBanner = null;
    }, 300);
  }

  // ============================================================
  // Online/offline events
  // ============================================================

  function onOffline() { showNetworkBanner(); }

  function onOnline() {
    hideNetworkBanner();
    if (window.Toast) window.Toast.success(t('errors.reconnected', 'Връзката е възстановена'));
  }

  // ============================================================
  // Global error handlers
  // ============================================================

  function onGlobalError(e) {
    handle(e.error || new Error(e.message), 'window.onerror');
  }

  function onUnhandledRejection(e) {
    handle(e.reason || new Error('Unhandled promise rejection'), 'unhandledrejection');
  }

  // ============================================================
  // Init
  // ============================================================

  function init() {
    window.addEventListener('error', onGlobalError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);

    // Check initial state
    if (!navigator.onLine) showNetworkBanner();
  }

  return {
    init: init,
    handle: handle,
    reportSilent: reportSilent
  };
})();
