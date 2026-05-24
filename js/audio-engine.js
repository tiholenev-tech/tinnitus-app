/**
 * AURALIS Audio Engine v1.0
 * ============================
 * Web Audio API engine за production (Task 7b).
 *
 * Per BIBLE v3 §4 (батерия):
 *   - AudioBufferSourceNode (НЕ AudioWorklet)
 *   - Suspend AudioContext при pause
 *   - iOS lock screen unlock trick
 *   - System sample rate
 *
 * Per BIBLE v3 §1 (safety):
 *   - Default master volume 50% (НЕ 70)
 *   - Linear gain (user знае какво получава)
 *
 * Преди тази версия: pink/brown/green генератори (запазени за runtime).
 * Сега добавено: file-based presets + crossfade + sleep timer + iOS unlock.
 *
 * Public API:
 *   AudioEngine.init()            — създава AudioContext (lazy)
 *   AudioEngine.unlock()          — iOS silent buffer (call от user gesture)
 *   AudioEngine.play(presetId)    — start/crossfade към preset
 *   AudioEngine.pause()           — fade out + suspend
 *   AudioEngine.stop()            — hard stop + suspend
 *   AudioEngine.setMasterVolume(0..100)
 *   AudioEngine.getMasterVolume()
 *   AudioEngine.setSleepTimer(minutes)  — 0 = cancel
 *   AudioEngine.cancelSleepTimer()
 *   AudioEngine.getSleepTimerInfo()     — { active, totalMinutes, fadeOutSec }
 *   AudioEngine.isPlaying()
 *   AudioEngine.getActivePreset()
 */

window.AudioEngine = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================

  var DEFAULT_VOLUME = 50;           // 0-100 scale (per BIBLE §1)
  var CROSSFADE_SEC = 2.0;           // smooth preset switch
  var PAUSE_FADE_SEC = 0.2;          // фаст fade при pause за избягване на click
  var SLEEP_FADE_SEC = 30;           // последните 30s от total таймер
  var PINK_BUFFER_SEC = 10;          // generated pink noise loop length

  // presetId → source mapping
  var PRESET_MAP = {
    underwater:  { type: 'file', url: 'audio/presets/underwater.wav' },
    deep_calm:   { type: 'file', url: 'audio/presets/deep_sleep.wav' },
    sea_shore:   { type: 'file', url: 'audio/presets/sea_shore.wav' },
    pink_rain:   { type: 'file', url: 'audio/presets/soft_rain.wav' },
    brown_noise: { type: 'generated', gen: 'pink' }
    // NOTE: brown_noise card title е "Розов шум" → mapping към pink generator (runtime).
  };

  // ============================================================
  // STATE
  // ============================================================

  var ctx = null;
  var masterGain = null;
  var masterVolume = DEFAULT_VOLUME;        // 0-100
  var activePreset = null;                  // current presetId or null
  var activeSource = null;                  // current BufferSource
  var activePresetGain = null;              // current preset's GainNode
  var activeStartCtxTime = 0;               // ctx.currentTime when source started
  var activeBufferDuration = 0;             // seconds (за loop=false progress)
  var activeIsLooping = true;

  var bufferCache = {};                     // url → AudioBuffer
  var generatedPinkBuffer = null;           // cached runtime pink noise

  var sleepTimerId = null;                  // setTimeout for fade-out start
  var sleepStopTimerId = null;              // setTimeout for stop after fade
  var sleepTimerTotalMin = 0;               // 0 = no timer

  var iosUnlocked = false;

  // ============================================================
  // CONTEXT MANAGEMENT
  // ============================================================

  function init() {
    if (ctx) return ctx;
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      console.error('[audio] Web Audio API not supported');
      return null;
    }
    ctx = new Ctx();
    masterGain = ctx.createGain();
    masterGain.gain.value = volumeToGain(masterVolume);
    masterGain.connect(ctx.destination);
    console.log('[audio] context init, sample rate:', ctx.sampleRate);
    return ctx;
  }

  function unlock() {
    // iOS Safari изисква user-initiated AudioContext.resume() + първи buffer play.
    if (iosUnlocked) return;
    init();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(function (e) {
        console.warn('[audio] resume failed:', e);
      });
    }

    // Silent buffer: 1 sample, 0 amplitude
    try {
      var buf = ctx.createBuffer(1, 1, ctx.sampleRate);
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) {
      console.warn('[audio] iOS unlock buffer failed:', e);
    }

    iosUnlocked = true;
    console.log('[audio] iOS unlocked');
  }

  function resumeContext() {
    if (ctx && ctx.state === 'suspended') {
      return ctx.resume();
    }
    return Promise.resolve();
  }

  function suspendContext() {
    if (ctx && ctx.state === 'running') {
      // Suspend след малък delay за да fade-ът завърши
      ctx.suspend().catch(function () { /* ignore */ });
    }
  }

  // ============================================================
  // VOLUME (linear 0-100 → gain 0.0-1.0)
  // ============================================================

  function volumeToGain(vol) {
    return Math.max(0, Math.min(1, vol / 100));
  }

  function setMasterVolume(vol) {
    masterVolume = Math.max(0, Math.min(100, vol));
    if (masterGain && ctx) {
      // Smooth ramp за избягване на zipper noise
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(
        volumeToGain(masterVolume),
        ctx.currentTime + 0.05
      );
    }
  }

  function getMasterVolume() {
    return masterVolume;
  }

  // ============================================================
  // BUFFER LOADING
  // ============================================================

  function emitError(presetId, url, kind, status) {
    try {
      window.dispatchEvent(new CustomEvent('auralis-sound-error', {
        detail: { presetId: presetId, url: url, kind: kind, status: status }
      }));
    } catch (e) { /* ignore */ }
  }

  function fetchAndDecode(url, presetId) {
    if (bufferCache[url]) return Promise.resolve(bufferCache[url]);
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          var kind = res.status === 404 ? 'notFound' : 'network';
          emitError(presetId, url, kind, res.status);
          throw new Error('HTTP ' + res.status + ' ' + url);
        }
        return res.arrayBuffer();
      })
      .catch(function (err) {
        // Network error (no res object) → emit network kind
        if (err && err.name === 'TypeError') {
          emitError(presetId, url, 'network', null);
        }
        throw err;
      })
      .then(function (arr) {
        return new Promise(function (resolve, reject) {
          ctx.decodeAudioData(arr,
            function (buffer) {
              bufferCache[url] = buffer;
              console.log('[audio] decoded:', url, '(' + buffer.duration.toFixed(1) + 's)');
              resolve(buffer);
            },
            function (err) {
              console.error('[audio] decode failed:', url, err);
              emitError(presetId, url, 'decode', null);
              reject(err);
            }
          );
        });
      });
  }

  // ============================================================
  // PINK NOISE GENERATOR (Paul Kellet -3dB/oct)
  // ============================================================

  function getOrGeneratePinkBuffer() {
    if (generatedPinkBuffer) return generatedPinkBuffer;

    var sampleRate = ctx.sampleRate;
    var bufferSize = sampleRate * PINK_BUFFER_SEC;
    var buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    var data = buffer.getChannelData(0);

    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      var pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11; // нормализация ~-12dBFS
    }

    generatedPinkBuffer = buffer;
    console.log('[audio] generated pink buffer:', PINK_BUFFER_SEC + 's');
    return buffer;
  }

  // ============================================================
  // PLAY (with crossfade)
  // ============================================================

  function play(presetId, opts) {
    var spec = PRESET_MAP[presetId];
    if (!spec) {
      console.error('[audio] unknown preset:', presetId);
      return Promise.reject(new Error('Unknown preset: ' + presetId));
    }
    return playSpec(presetId, spec, opts);
  }

  /**
   * playUrl(id, url, opts) — ad-hoc playback за Library sounds
   * Регистрира спецификацията в PRESET_MAP за бъдещи calls.
   * opts: { loop: bool } — default true.
   */
  function playUrl(id, url, opts) {
    if (!id || !url) {
      return Promise.reject(new Error('playUrl requires id and url'));
    }
    var spec = { type: 'file', url: url };
    PRESET_MAP[id] = spec;
    return playSpec(id, spec, opts);
  }

  function playSpec(presetId, spec, opts) {
    init();
    unlock();
    opts = opts || {};

    if (activePreset === presetId && activeSource) {
      console.log('[audio] already playing:', presetId);
      return Promise.resolve();
    }

    return resumeContext().then(function () {
      if (spec.type === 'file') {
        return fetchAndDecode(spec.url, presetId).then(function (buffer) {
          startSource(presetId, buffer, opts);
        });
      } else if (spec.type === 'generated' && spec.gen === 'pink') {
        var buffer = getOrGeneratePinkBuffer();
        startSource(presetId, buffer, opts);
        return Promise.resolve();
      } else {
        return Promise.reject(new Error('Bad spec: ' + JSON.stringify(spec)));
      }
    });
  }

  function startSource(presetId, buffer, opts) {
    opts = opts || {};
    var loop = opts.loop !== false; // default true

    // Manually-stopped previous source → mark стария за да не fire-не sound-ended
    if (activeSource) activeSource._manualStop = true;

    var src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = loop;
    src._presetId = presetId;
    src._manualStop = false;

    var presetGain = ctx.createGain();
    src.connect(presetGain);
    presetGain.connect(masterGain);

    var now = ctx.currentTime;
    var hadActive = !!activeSource;

    if (hadActive) {
      // Crossfade: new ramps up, old ramps down
      presetGain.gain.setValueAtTime(0.0001, now);
      presetGain.gain.exponentialRampToValueAtTime(1.0, now + CROSSFADE_SEC);

      activePresetGain.gain.cancelScheduledValues(now);
      activePresetGain.gain.setValueAtTime(activePresetGain.gain.value, now);
      activePresetGain.gain.exponentialRampToValueAtTime(0.0001, now + CROSSFADE_SEC);

      var oldSource = activeSource;
      var oldGain = activePresetGain;
      setTimeout(function () {
        try { oldSource.stop(); } catch (e) { /* ignore */ }
        try { oldSource.disconnect(); } catch (e) { /* ignore */ }
        try { oldGain.disconnect(); } catch (e) { /* ignore */ }
      }, CROSSFADE_SEC * 1000 + 50);
    } else {
      // First play: fade in от 0 към 1 за избягване на click
      presetGain.gain.setValueAtTime(0.0001, now);
      presetGain.gain.exponentialRampToValueAtTime(1.0, now + 0.1);
    }

    // onended handles natural completion (за loop=false) — НЕ trigger при manual stop()
    src.onended = function () {
      if (src._manualStop) return;
      // Natural end: clean state и emit event
      if (activeSource === src) {
        activeSource = null;
        activePresetGain = null;
        activePreset = null;
        activeStartCtxTime = 0;
        activeBufferDuration = 0;
        activeIsLooping = true;
      }
      try { src.disconnect(); } catch (e) { /* ignore */ }
      try { presetGain.disconnect(); } catch (e) { /* ignore */ }
      window.dispatchEvent(new CustomEvent('auralis-sound-ended', {
        detail: { presetId: src._presetId }
      }));
    };

    src.start(0);
    activeSource = src;
    activePresetGain = presetGain;
    activePreset = presetId;
    activeStartCtxTime = now;
    activeBufferDuration = buffer.duration || 0;
    activeIsLooping = loop;
    console.log('[audio] play:', presetId, hadActive ? '(crossfade)' : '', loop ? '(loop)' : '(one-shot)');
  }

  // ============================================================
  // PAUSE / STOP
  // ============================================================

  function pause() {
    if (!activeSource || !ctx) return;

    var now = ctx.currentTime;
    var src = activeSource;
    var gain = activePresetGain;
    src._manualStop = true; // НЕ trigger sound-ended event

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + PAUSE_FADE_SEC);

    setTimeout(function () {
      try { src.stop(); } catch (e) { /* ignore */ }
      try { src.disconnect(); } catch (e) { /* ignore */ }
      try { gain.disconnect(); } catch (e) { /* ignore */ }
      suspendContext();
    }, PAUSE_FADE_SEC * 1000 + 50);

    activeSource = null;
    activePresetGain = null;
    activePreset = null;
    activeStartCtxTime = 0;
    activeBufferDuration = 0;
    activeIsLooping = true;
    console.log('[audio] pause');
  }

  function stop() {
    if (activeSource) {
      activeSource._manualStop = true;
      try { activeSource.stop(); } catch (e) { /* ignore */ }
      try { activeSource.disconnect(); } catch (e) { /* ignore */ }
    }
    if (activePresetGain) {
      try { activePresetGain.disconnect(); } catch (e) { /* ignore */ }
    }
    activeSource = null;
    activePresetGain = null;
    activePreset = null;
    activeStartCtxTime = 0;
    activeBufferDuration = 0;
    activeIsLooping = true;
    suspendContext();
    console.log('[audio] stop');
  }

  /**
   * getPlaybackInfo() — used by Calm player для progress bar.
   * Returns: { presetId, currentTime, duration, isLooping } or null ако не свири.
   */
  function getPlaybackInfo() {
    if (!activeSource || !ctx) return null;
    var elapsed = ctx.currentTime - activeStartCtxTime;
    // За loop, currentTime е по modulo на duration
    var cur = activeIsLooping && activeBufferDuration > 0
      ? (elapsed % activeBufferDuration)
      : elapsed;
    return {
      presetId: activePreset,
      currentTime: cur,
      duration: activeBufferDuration,
      isLooping: activeIsLooping
    };
  }

  // ============================================================
  // SLEEP TIMER (fade-out последните 30s от total)
  // ============================================================

  function setSleepTimer(minutes) {
    cancelSleepTimer();

    if (!minutes || minutes <= 0) {
      sleepTimerTotalMin = 0;
      console.log('[audio] sleep timer cancelled');
      return;
    }

    sleepTimerTotalMin = minutes;
    var totalMs = minutes * 60 * 1000;
    var fadeStartMs = Math.max(0, totalMs - SLEEP_FADE_SEC * 1000);

    sleepTimerId = setTimeout(startSleepFade, fadeStartMs);
    console.log('[audio] sleep timer set:', minutes, 'min (fade starts at', (fadeStartMs / 1000).toFixed(0) + 's)');
  }

  function startSleepFade() {
    sleepTimerId = null;
    if (!ctx || !masterGain) return;

    var now = ctx.currentTime;
    var currentGain = masterGain.gain.value;
    if (currentGain < 0.001) currentGain = 0.001;

    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(currentGain, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + SLEEP_FADE_SEC);

    sleepStopTimerId = setTimeout(function () {
      sleepStopTimerId = null;
      stop();
      // Restore master gain за следващия play
      if (masterGain) {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.value = volumeToGain(masterVolume);
      }
      sleepTimerTotalMin = 0;
      console.log('[audio] sleep timer expired → stopped');
    }, SLEEP_FADE_SEC * 1000 + 100);

    console.log('[audio] sleep fade-out started (30s)');
  }

  function cancelSleepTimer() {
    if (sleepTimerId) {
      clearTimeout(sleepTimerId);
      sleepTimerId = null;
    }
    if (sleepStopTimerId) {
      clearTimeout(sleepStopTimerId);
      sleepStopTimerId = null;
    }
    sleepTimerTotalMin = 0;
    // Restore master gain ако сме били в fade
    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(
        volumeToGain(masterVolume),
        ctx.currentTime + 0.1
      );
    }
  }

  function getSleepTimerInfo() {
    return {
      active: sleepTimerTotalMin > 0,
      totalMinutes: sleepTimerTotalMin,
      fadeOutSec: SLEEP_FADE_SEC
    };
  }

  // ============================================================
  // QUERIES
  // ============================================================

  function isPlaying() {
    return !!activeSource;
  }

  function getActivePreset() {
    return activePreset;
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    init: init,
    unlock: unlock,
    play: play,
    playUrl: playUrl,
    pause: pause,
    stop: stop,
    setMasterVolume: setMasterVolume,
    getMasterVolume: getMasterVolume,
    setSleepTimer: setSleepTimer,
    cancelSleepTimer: cancelSleepTimer,
    getSleepTimerInfo: getSleepTimerInfo,
    isPlaying: isPlaying,
    getActivePreset: getActivePreset,
    getPlaybackInfo: getPlaybackInfo,
    // Internal exposed за debugging:
    _getContext: function () { return ctx; }
  };
})();
