/**
 * AURALIS AppStateManager — unified state wrapper (Task RR)
 * ============================================================
 * Wraps existing fragmented localStorage keys into unified API.
 * Backwards compatible — existing keys still work.
 * Adds: subscribe for reactive UI, export/import for backup.
 *
 * Public API:
 *   AppStateManager.get(path)              // 'profile.code' → 'TH_C'
 *   AppStateManager.set(path, value)
 *   AppStateManager.subscribe(path, cb)    → unsubscribe fn
 *   AppStateManager.export()               → JSON string (full snapshot)
 *   AppStateManager.import(snapshot)        → restore from backup
 */

window.AppStateManager = (function () {
  'use strict';

  // Map dot-path → localStorage key
  var KEY_MAP = {
    'theme':               'auralis-theme',
    'locale':              'auralis_locale',
    'onboarding.done':     'auralis-onboarding-done',
    'consent.granted':     'auralis-consent-granted',
    'phase':               'auralis-phase',
    'subphase':            'auralis-subphase',
    'quiz.subphase':       'auralis-quiz-subphase',
    'quiz.answers':        'auralis-quiz-answers',
    'quiz.done':           'auralis-quiz-done',
    'profile.code':        'auralis-quiz-profile',
    'profile.di':          'auralis-quiz-di',
    'volume.master':       'auralis-master-volume',
    'player.noise':        'auralis_player_noise_id',
    'player.layer1Vol':    'auralis_player_layer1_vol',
    'player.layer2Vol':    'auralis_player_layer2_vol',
    'favorites':           'auralis_favorites',
    'diary':               'auralis_diary_entries',
    'reminders':           'auralis_reminders',
    'analytics.sessions':  'auralis_analytics_sessions',
    'analytics.summary':   'auralis_analytics_summary',
    'tour.done':           'auralis_tour_done',
    // 'trial.start' (auralis_trial_start) премахнат: trial-ът е server-side вече
    // (devices.trial_started_at). Старият ключ остава само като legacy маркер за
    // разпознаване на заварени устройства — виж js/account.js detectLegacy().
    'audio.crossfade':     'auralis_audio_crossfade',
    'audio.l2DefaultVol':  'auralis_audio_l2_default_vol',
    'audio.sleepFade':     'auralis_audio_sleep_fade'
  };

  var subscribers = {}; // path → [callbacks]

  // ============================================================
  // Core
  // ============================================================

  function resolveKey(path) {
    return KEY_MAP[path] || ('auralis_' + path.replace(/\./g, '_'));
  }

  function get(path) {
    try {
      var raw = localStorage.getItem(resolveKey(path));
      if (raw === null) return undefined;
      try { return JSON.parse(raw); } catch (e) { return raw; }
    } catch (e) { return undefined; }
  }

  function set(path, value) {
    var key = resolveKey(path);
    try {
      var serialized = (typeof value === 'object') ? JSON.stringify(value) : String(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      if (window.ErrorHandler) window.ErrorHandler.handle(e, 'state-manager.set');
    }
    notify(path, value);
  }

  // ============================================================
  // Subscribe (reactive)
  // ============================================================

  function subscribe(path, callback) {
    if (!subscribers[path]) subscribers[path] = [];
    subscribers[path].push(callback);
    // Return unsubscribe function
    return function () {
      var arr = subscribers[path];
      if (!arr) return;
      var idx = arr.indexOf(callback);
      if (idx !== -1) arr.splice(idx, 1);
    };
  }

  function notify(path, value) {
    var cbs = subscribers[path];
    if (cbs) {
      cbs.forEach(function (cb) {
        try { cb(value, path); } catch (e) { /* ignore */ }
      });
    }
    // Also notify wildcard subscribers
    var parts = path.split('.');
    if (parts.length > 1) {
      var parentPath = parts[0] + '.*';
      var parentCbs = subscribers[parentPath];
      if (parentCbs) {
        parentCbs.forEach(function (cb) {
          try { cb(value, path); } catch (e) { /* ignore */ }
        });
      }
    }
  }

  // ============================================================
  // Export / Import
  // ============================================================

  function exportAll() {
    var snapshot = {};
    Object.keys(KEY_MAP).forEach(function (path) {
      var val = get(path);
      if (val !== undefined) snapshot[path] = val;
    });
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      state: snapshot
    }, null, 2);
  }

  function importSnapshot(jsonStr) {
    try {
      var data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      if (!data || !data.state) return false;
      Object.keys(data.state).forEach(function (path) {
        set(path, data.state[path]);
      });
      return true;
    } catch (e) {
      if (window.ErrorHandler) window.ErrorHandler.handle(e, 'state-manager.import');
      return false;
    }
  }

  return {
    get: get,
    set: set,
    subscribe: subscribe,
    export: exportAll,
    import: importSnapshot
  };
})();
