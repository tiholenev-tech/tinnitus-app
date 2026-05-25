/**
 * AURALIS Haptics — tactile feedback (Task XX)
 * ================================================
 * Web Vibration API. iOS fallback: silent (no support).
 * Settings toggle: auralis_haptics_enabled (default true).
 *
 * Public API:
 *   Haptics.light()    — 10ms (card tap, tour next)
 *   Haptics.medium()   — 25ms (play button)
 *   Haptics.success()  — 10-50-10 pattern (favorite toggle)
 *   Haptics.error()    — 50-50-50 pattern (audio error)
 *   Haptics.isEnabled() → boolean
 *   Haptics.setEnabled(bool)
 */

window.Haptics = (function () {
  'use strict';

  var STORAGE_KEY = 'auralis_haptics_enabled';

  function isSupported() {
    return 'vibrate' in navigator;
  }

  function isEnabled() {
    try {
      var val = localStorage.getItem(STORAGE_KEY);
      if (val === 'false') return false;
    } catch (e) { /* ignore */ }
    return true; // default on
  }

  function setEnabled(enabled) {
    try { localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false'); } catch (e) { /* ignore */ }
  }

  function vibrate(pattern) {
    if (!isEnabled() || !isSupported()) return;
    try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
  }

  function light()   { vibrate(10); }
  function medium()  { vibrate(25); }
  function success() { vibrate([10, 50, 10]); }
  function error()   { vibrate([50, 50, 50]); }

  return {
    light: light,
    medium: medium,
    success: success,
    error: error,
    isEnabled: isEnabled,
    setEnabled: setEnabled
  };
})();
