/**
 * AURALIS Audio Resilience — Path A (само защита срещу спиране)
 * ============================================================
 * Telemetry-то е изключено за сега — добавяме утре.
 *
 * Прави 3 неща:
 *   1. Wake Lock при play → пречи на OS да suspend-не таба/екрана.
 *   2. Watchdog на 2 мин → ако звукът е спрял без да си го спрял ти → рестартира.
 *   3. При visibility/statechange/onended → веднага проверява и възстановява.
 *
 * Wrap-ва публичното API на AudioEngine — НЕ пипа audio-engine.js internals.
 *
 * Слага се: /var/www/auralis/js/audio-resilience.js
 * В index.html: <script src="js/audio-resilience.js"></script> ВЕДНАГА СЛЕД
 *               <script src="js/audio-engine.js"></script> (ред 175 -> нов ред 176)
 */

(function () {
  'use strict';

  if (!window.AudioEngine) {
    console.error('[resilience] AudioEngine липсва — зареди audio-engine.js първо');
    return;
  }

  var WATCHDOG_INTERVAL_MS = 2 * 60 * 1000; // 2 мин (РЕШЕНО 29.05)
  var wakeLockSupported = ('wakeLock' in navigator);

  var intended = { playing: false, l1: null, l2: null };
  var wakeLock = null;
  var watchdogId = null;
  var restartInFlight = false;

  function log() {
    try { console.log.apply(console, ['[resilience]'].concat([].slice.call(arguments))); } catch (e) {}
  }

  // -- Telemetry (добавено 29.05 за дебъг на нощното спиране) --
  // sendBeacon оцелява при suspend/unload на таба → стига до сървъра дори
  // ако браузърът замразява JS таймерите нощем. Fire-and-forget: всичко в
  // try/catch, никога не хвърля, не чупи нищо ако offline.
  var SESSION_ID = (function () {
    try {
      return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    } catch (e) { return 'nosid'; }
  })();

  function tlog(event, reason) {
    try {
      var layers = {};
      try { layers = AudioEngine.getActiveLayers() || {}; } catch (e) {}
      var payload = {
        sid: SESSION_ID,
        event: event || '',
        reason: reason || '',
        l1: intended.l1 || '',
        l2: intended.l2 || '',
        ctx: (layers && layers.ctxState) ? layers.ctxState : ''
      };
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/log.php', blob);
      } else if (window.fetch) {
        fetch('/api/log.php', {
          method: 'POST', body: body, keepalive: true,
          headers: { 'Content-Type': 'application/json' }
        }).catch(function () {});
      }
    } catch (e) { /* fire-and-forget */ }
  }

  // -- Wake Lock --
  function requestWakeLock() {
    if (!wakeLockSupported || wakeLock) return;
    navigator.wakeLock.request('screen').then(function (s) {
      wakeLock = s;
      log('wakeLock acquired');
      wakeLock.addEventListener('release', function () {
        log('wakeLock released от OS');
        tlog('wakelock_released', 'os');
        wakeLock = null;
        if (intended.playing && document.visibilityState === 'visible') requestWakeLock();
      });
    }).catch(function (e) { log('wakeLock error', e && e.message); tlog('wakelock_fail', 'request'); wakeLock = null; });
  }
  function releaseWakeLock() {
    if (!wakeLock) return;
    var w = wakeLock; wakeLock = null;
    try { w.release(); } catch (e) {}
  }

  // -- Recovery --
  function checkAndRecover(trigger) {
    if (!intended.playing || restartInFlight) return;

    var ctxObj = null;
    try { ctxObj = AudioEngine._getContext && AudioEngine._getContext(); } catch (e) {}
    var ctxState = ctxObj ? ctxObj.state : 'closed';

    var layers = AudioEngine.getActiveLayers();
    var l1Down = intended.l1 && !layers.layer1.playing;
    var l2Down = intended.l2 && intended.l2 !== 'none' && !layers.layer2.playing;
    var ctxDown = (ctxState !== 'running');

    if (!l1Down && !l2Down && !ctxDown) return; // всичко наред

    restartInFlight = true;
    log('RECOVER', trigger, '| ctx:', ctxState, '| l1Down:', l1Down, '| l2Down:', l2Down);
    tlog('recover', trigger + '_ctx_' + ctxState + (l1Down ? '_l1' : '') + (l2Down ? '_l2' : ''));

    var resume = (ctxObj && ctxObj.state === 'suspended')
      ? ctxObj.resume().catch(function () {}) : Promise.resolve();

    resume.then(function () {
      if (l1Down) { try { AudioEngine.playLayer1(intended.l1); } catch (e) {} }
      if (l2Down) { try { AudioEngine.playLayer2(intended.l2); } catch (e) {} }
    }).then(function () {
      setTimeout(function () { restartInFlight = false; }, 600);
    });
  }

  function startWatchdog() {
    if (watchdogId) return;
    watchdogId = setInterval(function () { checkAndRecover('watchdog'); }, WATCHDOG_INTERVAL_MS);
  }
  function stopWatchdog() {
    if (watchdogId) { clearInterval(watchdogId); watchdogId = null; }
  }

  // -- State machinery --
  function beginSession() {
    if (!intended.playing) {
      intended.playing = true;
      tlog('session_start', 'begin');
      requestWakeLock();
      startWatchdog();
      attachStateChange();
    }
  }
  function endSession() {
    intended.playing = false;
    intended.l1 = null;
    intended.l2 = null;
    releaseWakeLock();
    stopWatchdog();
  }

  function attachStateChange() {
    try {
      var c = AudioEngine._getContext && AudioEngine._getContext();
      if (c && !c._resilienceHooked) {
        c._resilienceHooked = true;
        c.addEventListener('statechange', function () {
          log('ctx statechange ->', c.state);
          if (c.state !== 'running' && intended.playing) checkAndRecover('statechange');
        });
      }
    } catch (e) {}
  }

  // -- Event hooks --
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && intended.playing) {
      requestWakeLock();
      checkAndRecover('visibility');
    }
  });

  window.addEventListener('auralis-sound-ended', function () {
    if (intended.playing) {
      log('spurious onended — recover');
      tlog('onended', 'spurious');
      checkAndRecover('onended');
    }
  });

  // -- Wrap public API --
  var _play1 = AudioEngine.playLayer1;
  AudioEngine.playLayer1 = function (presetId) {
    var r = _play1.apply(AudioEngine, arguments);
    if (r !== false) { beginSession(); intended.l1 = presetId; attachStateChange(); }
    return r;
  };
  AudioEngine.play = AudioEngine.playLayer1;
  AudioEngine.crossfadeLayer1 = function (id) { return AudioEngine.playLayer1(id); };

  var _play2 = AudioEngine.playLayer2;
  AudioEngine.playLayer2 = function (noiseId) {
    var p = _play2.apply(AudioEngine, arguments);
    if (noiseId && noiseId !== 'none') { beginSession(); intended.l2 = noiseId; attachStateChange(); }
    else { intended.l2 = 'none'; }
    return p;
  };

  var _stop = AudioEngine.stop;
  AudioEngine.stop = function () { endSession(); return _stop.apply(AudioEngine, arguments); };

  var _pause = AudioEngine.pause;
  AudioEngine.pause = function () { endSession(); return _pause.apply(AudioEngine, arguments); };

  var _stop1 = AudioEngine.stopLayer1;
  AudioEngine.stopLayer1 = function () {
    intended.l1 = null;
    if (!intended.l2 || intended.l2 === 'none') endSession();
    return _stop1.apply(AudioEngine, arguments);
  };

  var _stop2 = AudioEngine.stopLayer2;
  AudioEngine.stopLayer2 = function () {
    intended.l2 = 'none';
    if (!intended.l1) endSession();
    return _stop2.apply(AudioEngine, arguments);
  };

  window.AudioResilience = {
    getIntended: function () { return { playing: intended.playing, l1: intended.l1, l2: intended.l2 }; },
    forceCheck: function () { checkAndRecover('manual'); }
  };

  log('loaded | wakeLock:', wakeLockSupported, '| watchdog: 2min | telemetry: OFF (утре)');
})();
