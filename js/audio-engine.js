/**
 * AURALIS Audio Engine v2.0 — 2-layer playback (Task N1)
 * ========================================================
 * Layer 1 = главен звук (природа/мелодия от Library)
 * Layer 2 = постоянен фонов noise (brown/pink + lowpass variants)
 *
 * Per BIBLE v3 §4 (батерия):
 *   AudioBufferSourceNode (НЕ AudioWorklet), suspend on idle,
 *   iOS unlock trick, system sample rate.
 * Per BIBLE v3 §1 (safety):
 *   Default master volume 50% (НЕ 70). Linear gain.
 *
 * Public API:
 *   AudioEngine.init() | unlock()
 *
 *   // 2-layer playback
 *   AudioEngine.playLayer1(soundId)         — main sound (crossfade при смяна)
 *   AudioEngine.playLayer2(noiseId)         — background noise (HARD swap)
 *   AudioEngine.stopLayer1()                — fade out + cleanup layer 1
 *   AudioEngine.stopLayer2()
 *   AudioEngine.setLayer1Volume(0..100)
 *   AudioEngine.setLayer2Volume(0..100)
 *   AudioEngine.getLayer1Volume()
 *   AudioEngine.getLayer2Volume()
 *   AudioEngine.crossfadeLayer1(newSoundId) — explicit crossfade
 *   AudioEngine.getActiveLayers()           — { layer1: {id, gain}, layer2: {id, gain}, master }
 *
 *   // Backward compat
 *   AudioEngine.play(id, opts)        → playLayer1
 *   AudioEngine.playUrl(id, url, opts) → playLayer1 с custom url
 *   AudioEngine.pause()               — pause BOTH layers + suspend
 *   AudioEngine.stop()                — hard stop BOTH + suspend
 *   AudioEngine.getActivePreset()     → layer1 presetId
 *   AudioEngine.getPlaybackInfo()     → layer1 progress info
 *   AudioEngine.isPlaying()           → true ако layer1 OR layer2 свири
 *
 *   // Master + sleep timer (single per app)
 *   AudioEngine.setMasterVolume(0..100) | getMasterVolume()
 *   AudioEngine.setSleepTimer(min) | cancelSleepTimer() | getSleepTimerInfo()
 *
 * Manifest integration (N5): playLayer1/Layer2 lookup PRESET_MAP first
 * (compat) → ако липсва, опитва manifest.sounds / manifest.noises
 * (populated lazy от Library/Home loader). Това позволява runtime
 * registration без code change.
 */

window.AudioEngine = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================

  var DEFAULT_VOLUME    = 50;
  var DEFAULT_L1_VOL    = 100;  // Layer 1 default 100% (gain 1.0)
  var DEFAULT_L2_VOL    = 50;   // A2.1: gain 0.5 default — фон да не дави главния звук
  var CROSSFADE_SEC     = 2.0;
  var L2_FADE_SEC       = 0.25; // Hard swap но с малък fade за избягване на click
  var PAUSE_FADE_SEC    = 0.2;
  var SLEEP_FADE_SEC    = 30;
  var PINK_BUFFER_SEC   = 10;
  var BROWN_BUFFER_SEC  = 10;
  var VOL_RAMP_SEC      = 0.05;

  // Legacy PRESET_MAP — kept за compat с Library/Mixer/Calm
  var PRESET_MAP = {
    underwater:  { type: 'file', url: 'audio/presets/underwater.wav' },
    deep_calm:   { type: 'file', url: 'audio/presets/deep_sleep.wav' },
    sea_shore:   { type: 'file', url: 'audio/presets/sea_shore.wav' },
    pink_rain:   { type: 'file', url: 'audio/presets/soft_rain.wav' },
    brown_noise: { type: 'generated', gen: 'pink' }
  };

  // NOISE_MAP — Layer 2 specs (runtime generated за beta; manifest filenames Phase 2)
  var NOISE_MAP = {
    'none':         null,
    'brown_pure':   { gen: 'brown', filter: null },
    'brown_lp1000': { gen: 'brown', filter: 1000 },
    'brown_lp500':  { gen: 'brown', filter: 500 },
    'pink_pure':    { gen: 'pink',  filter: null },
    'pink_lp2000':  { gen: 'pink',  filter: 2000 },
    'pink_lp4000':  { gen: 'pink',  filter: 4000 }
  };

  // ============================================================
  // STATE
  // ============================================================

  var ctx = null;
  var masterGain = null;
  var masterVolume = DEFAULT_VOLUME;
  var iosUnlocked = false;

  var bufferCache = {};               // url → AudioBuffer
  var generatedPinkBuffer = null;
  var generatedBrownBuffer = null;

  // Layer state — duplicated structure за L1/L2
  function makeLayer() {
    return {
      presetId: null,
      source: null,
      gainNode: null,           // per-layer (chains към masterGain)
      filterNode: null,         // optional (за L2 lowpass)
      startCtxTime: 0,
      bufferDuration: 0,
      isLooping: true,
      volume: DEFAULT_L1_VOL    // overwritten при init
    };
  }
  var layer1 = makeLayer(); layer1.volume = DEFAULT_L1_VOL;
  var layer2 = makeLayer(); layer2.volume = DEFAULT_L2_VOL;

  var sleepTimerId = null;
  var sleepStopTimerId = null;
  var sleepTimerTotalMin = 0;

  // ============================================================
  // CONTEXT
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
    if (iosUnlocked) return;
    init();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function (e) { console.warn('[audio] resume:', e); });
    }
    try {
      var buf = ctx.createBuffer(1, 1, ctx.sampleRate);
      var src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) { console.warn('[audio] iOS unlock buffer:', e); }
    iosUnlocked = true;
    console.log('[audio] iOS unlocked');
  }

  function resumeContext() {
    if (ctx && ctx.state === 'suspended') return ctx.resume();
    return Promise.resolve();
  }

  function suspendContext() {
    if (ctx && ctx.state === 'running' && !layer1.source && !layer2.source) {
      ctx.suspend().catch(function () { /* ignore */ });
    }
  }

  // ============================================================
  // VOLUME
  // ============================================================

  function volumeToGain(vol) {
    // A2.1: Perceptual curve (pow 2.5) instead of linear vol/100.
    // Brown noise (1/f² спектър) има огромна low-freq енергия → линеен 50%
    // звучи като 80% perceived. Ocean natural sound → линеен 100% звучи
    // като 70% perceived. Power 2.5 прави slider responsive в долната
    // половина (по-естествено усещане).
    var linear = Math.max(0, Math.min(1, vol / 100));
    return Math.pow(linear, 2.5);
  }

  function setMasterVolume(vol) {
    masterVolume = Math.max(0, Math.min(100, vol));
    if (masterGain && ctx) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(volumeToGain(masterVolume),
        ctx.currentTime + VOL_RAMP_SEC);
    }
  }
  function getMasterVolume() { return masterVolume; }

  function applyLayerVolume(layer) {
    if (!layer.gainNode || !ctx) return;
    layer.gainNode.gain.cancelScheduledValues(ctx.currentTime);
    layer.gainNode.gain.linearRampToValueAtTime(volumeToGain(layer.volume),
      ctx.currentTime + VOL_RAMP_SEC);
  }

  function setLayer1Volume(vol) {
    layer1.volume = Math.max(0, Math.min(100, vol));
    applyLayerVolume(layer1);
  }
  function setLayer2Volume(vol) {
    layer2.volume = Math.max(0, Math.min(100, vol));
    applyLayerVolume(layer2);
  }
  function getLayer1Volume() { return layer1.volume; }
  function getLayer2Volume() { return layer2.volume; }

  // ============================================================
  // BUFFER LOADING / GENERATORS
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
    console.log('[audio-engine] fetch attempt:', url);
    return fetch(url)
      .then(function (res) {
        console.log('[audio-engine] fetch status:', res.status, 'for', url);
        if (!res.ok) {
          var kind = res.status === 404 ? 'notFound' : 'network';
          emitError(presetId, url, kind, res.status);
          throw new Error('HTTP ' + res.status + ' ' + url);
        }
        return res.arrayBuffer();
      })
      .catch(function (err) {
        if (err && err.name === 'TypeError') emitError(presetId, url, 'network', null);
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

  function getOrGeneratePinkBuffer() {
    if (generatedPinkBuffer) return generatedPinkBuffer;
    var sampleRate = ctx.sampleRate;
    var bufferSize = sampleRate * PINK_BUFFER_SEC;
    var buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    var data = buffer.getChannelData(0);
    // Paul Kellet pink (-3dB/oct)
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
      data[i] = pink * 0.11;
    }
    generatedPinkBuffer = buffer;
    console.log('[audio] generated pink buffer:', PINK_BUFFER_SEC + 's');
    return buffer;
  }

  function getOrGenerateBrownBuffer() {
    if (generatedBrownBuffer) return generatedBrownBuffer;
    var sampleRate = ctx.sampleRate;
    var bufferSize = sampleRate * BROWN_BUFFER_SEC;
    var buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    var data = buffer.getChannelData(0);
    var lastOut = 0, sum = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      sum += data[i];
    }
    // DC removal + normalize peak to 0.5 (standard). Perceptual curve в
    // volumeToGain (pow 2.5) handles cross-layer balance.
    var dc = sum / bufferSize;
    var maxVal = 0;
    for (var j = 0; j < bufferSize; j++) {
      data[j] -= dc;
      var abs = Math.abs(data[j]);
      if (abs > maxVal) maxVal = abs;
    }
    var scale = 0.5 / (maxVal || 1);
    for (var k = 0; k < bufferSize; k++) data[k] *= scale;
    generatedBrownBuffer = buffer;
    console.log('[audio] generated brown buffer:', BROWN_BUFFER_SEC + 's');
    return buffer;
  }

  // ============================================================
  // LAYER 1 — main sound (crossfade при смяна)
  // ============================================================

  function playLayer1(presetId, opts) {
    console.log('[audio-engine] playLayer1 called with:', presetId);
    var spec = resolveSpec(presetId);
    if (!spec) {
      console.error('[audio-engine] L1 unknown preset (resolveSpec → null):', presetId);
      return Promise.reject(new Error('Unknown preset: ' + presetId));
    }
    console.log('[audio-engine] resolved spec:', spec);
    return playLayer1Spec(presetId, spec, opts);
  }

  function playUrl(id, url, opts) {
    if (!id || !url) return Promise.reject(new Error('playUrl requires id+url'));
    var spec = { type: 'file', url: url };
    PRESET_MAP[id] = spec;
    return playLayer1Spec(id, spec, opts);
  }

  function resolveSpec(presetId) {
    if (PRESET_MAP[presetId]) return PRESET_MAP[presetId];
    // Manifest-based lookup (set by Library/Home loader)
    if (window.AURALIS_MANIFEST && window.AURALIS_MANIFEST.sounds) {
      var sounds = window.AURALIS_MANIFEST.sounds;
      for (var i = 0; i < sounds.length; i++) {
        if (sounds[i].id === presetId) {
          var s = { type: 'file', url: 'library_staging_loop_ready/' + sounds[i].filename };
          PRESET_MAP[presetId] = s;
          return s;
        }
      }
    }
    return null;
  }

  function playLayer1Spec(presetId, spec, opts) {
    init();
    unlock();
    opts = opts || {};

    if (layer1.presetId === presetId && layer1.source) {
      console.log('[audio] L1 already playing:', presetId);
      return Promise.resolve();
    }

    return resumeContext().then(function () {
      if (spec.type === 'file') {
        return fetchAndDecode(spec.url, presetId).then(function (buffer) {
          startLayer1Source(presetId, buffer, opts);
        });
      } else if (spec.type === 'generated') {
        var buffer = (spec.gen === 'brown')
          ? getOrGenerateBrownBuffer()
          : getOrGeneratePinkBuffer();
        startLayer1Source(presetId, buffer, opts);
        return Promise.resolve();
      }
      return Promise.reject(new Error('Bad spec: ' + JSON.stringify(spec)));
    });
  }

  function startLayer1Source(presetId, buffer, opts) {
    opts = opts || {};
    var loop = opts.loop !== false;

    // Mark old source as manually stopped (avoid onended emit)
    if (layer1.source) layer1.source._manualStop = true;

    var src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = loop;
    src._presetId = presetId;
    src._manualStop = false;

    var gainNode = ctx.createGain();
    src.connect(gainNode);
    gainNode.connect(masterGain);

    var now = ctx.currentTime;
    var targetGain = volumeToGain(layer1.volume);
    var hadActive = !!layer1.source;

    if (hadActive) {
      // Crossfade
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain),
        now + CROSSFADE_SEC);
      var oldGain = layer1.gainNode;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.exponentialRampToValueAtTime(0.0001, now + CROSSFADE_SEC);
      var oldSrc = layer1.source;
      setTimeout(function () {
        try { oldSrc.stop(); } catch (e) {}
        try { oldSrc.disconnect(); } catch (e) {}
        try { oldGain.disconnect(); } catch (e) {}
      }, CROSSFADE_SEC * 1000 + 50);
    } else {
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain), now + 0.1);
    }

    src.onended = function () {
      if (src._manualStop) return;
      if (layer1.source === src) {
        clearLayer1State();
      }
      try { src.disconnect(); } catch (e) {}
      try { gainNode.disconnect(); } catch (e) {}
      try {
        window.dispatchEvent(new CustomEvent('auralis-sound-ended', {
          detail: { presetId: src._presetId, layer: 1 }
        }));
      } catch (e) {}
    };

    src.start(0);
    layer1.source = src;
    layer1.gainNode = gainNode;
    layer1.presetId = presetId;
    layer1.startCtxTime = now;
    layer1.bufferDuration = buffer.duration || 0;
    layer1.isLooping = loop;
    console.log('[audio] L1 play:', presetId, hadActive ? '(crossfade)' : '', loop ? '(loop)' : '(one-shot)');
  }

  function crossfadeLayer1(newPresetId) {
    return playLayer1(newPresetId); // crossfade is automatic if L1 active
  }

  function stopLayer1() {
    if (!layer1.source || !ctx) return;
    var now = ctx.currentTime;
    var src = layer1.source;
    var gain = layer1.gainNode;
    src._manualStop = true;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + PAUSE_FADE_SEC);
    setTimeout(function () {
      try { src.stop(); } catch (e) {}
      try { src.disconnect(); } catch (e) {}
      try { gain.disconnect(); } catch (e) {}
      suspendContext();
    }, PAUSE_FADE_SEC * 1000 + 50);
    clearLayer1State();
    console.log('[audio] L1 stop');
  }

  function clearLayer1State() {
    layer1.source = null;
    layer1.gainNode = null;
    layer1.presetId = null;
    layer1.startCtxTime = 0;
    layer1.bufferDuration = 0;
    layer1.isLooping = true;
  }

  // ============================================================
  // LAYER 2 — background noise (HARD swap, без crossfade)
  // ============================================================

  function playLayer2(noiseId) {
    init();
    unlock();

    // 'none' / null → stop L2
    if (!noiseId || noiseId === 'none') {
      stopLayer2();
      layer2.presetId = 'none';
      return Promise.resolve();
    }

    var spec = NOISE_MAP[noiseId];
    if (!spec) {
      // Manifest-based noise lookup
      if (window.AURALIS_MANIFEST && window.AURALIS_MANIFEST.noises) {
        for (var i = 0; i < window.AURALIS_MANIFEST.noises.length; i++) {
          var n = window.AURALIS_MANIFEST.noises[i];
          if (n.id === noiseId && n.filename) {
            spec = { type: 'file', url: 'library_staging_loop_ready/' + n.filename };
            break;
          }
        }
      }
      if (!spec) {
        console.error('[audio] L2 unknown noise:', noiseId);
        return Promise.reject(new Error('Unknown noise: ' + noiseId));
      }
    }

    if (layer2.presetId === noiseId && layer2.source) {
      console.log('[audio] L2 already playing:', noiseId);
      return Promise.resolve();
    }

    return resumeContext().then(function () {
      var bufferPromise;
      if (spec.type === 'file') {
        bufferPromise = fetchAndDecode(spec.url, noiseId);
      } else {
        // Generated
        var buf = (spec.gen === 'brown')
          ? getOrGenerateBrownBuffer()
          : getOrGeneratePinkBuffer();
        bufferPromise = Promise.resolve(buf);
      }
      return bufferPromise.then(function (buffer) {
        startLayer2Source(noiseId, buffer, spec.filter || null);
      });
    });
  }

  function startLayer2Source(noiseId, buffer, filterFreq) {
    // Hard swap: stop old immediately (no crossfade — continuous noise context)
    if (layer2.source) hardStopLayer2();

    var src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src._noiseId = noiseId;
    src._manualStop = false;

    var gainNode = ctx.createGain();
    var lastNode = src;

    var filterNode = null;
    if (filterFreq && filterFreq > 0) {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = filterFreq;
      filterNode.Q.value = 0.707;
      src.connect(filterNode);
      filterNode.connect(gainNode);
    } else {
      src.connect(gainNode);
    }
    gainNode.connect(masterGain);

    var now = ctx.currentTime;
    var targetGain = volumeToGain(layer2.volume);
    // Small fade-in за избягване на click
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(0.001, targetGain),
      now + L2_FADE_SEC);

    src.start(0);
    layer2.source = src;
    layer2.gainNode = gainNode;
    layer2.filterNode = filterNode;
    layer2.presetId = noiseId;
    layer2.startCtxTime = now;
    layer2.bufferDuration = buffer.duration || 0;
    layer2.isLooping = true;
    console.log('[audio] L2 play:', noiseId, filterFreq ? '(lp ' + filterFreq + 'Hz)' : '');
  }

  function hardStopLayer2() {
    if (!layer2.source) return;
    var src = layer2.source;
    var gain = layer2.gainNode;
    var filter = layer2.filterNode;
    src._manualStop = true;
    try { src.stop(); } catch (e) {}
    try { src.disconnect(); } catch (e) {}
    if (filter) { try { filter.disconnect(); } catch (e) {} }
    if (gain) { try { gain.disconnect(); } catch (e) {} }
    clearLayer2State();
  }

  function stopLayer2() {
    if (!layer2.source || !ctx) return;
    var now = ctx.currentTime;
    var src = layer2.source;
    var gain = layer2.gainNode;
    var filter = layer2.filterNode;
    src._manualStop = true;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + L2_FADE_SEC);
    setTimeout(function () {
      try { src.stop(); } catch (e) {}
      try { src.disconnect(); } catch (e) {}
      if (filter) { try { filter.disconnect(); } catch (e) {} }
      try { gain.disconnect(); } catch (e) {}
      suspendContext();
    }, L2_FADE_SEC * 1000 + 50);
    clearLayer2State();
    console.log('[audio] L2 stop');
  }

  function clearLayer2State() {
    layer2.source = null;
    layer2.gainNode = null;
    layer2.filterNode = null;
    layer2.presetId = null;
    layer2.startCtxTime = 0;
    layer2.bufferDuration = 0;
  }

  // ============================================================
  // PAUSE / STOP (both layers)
  // ============================================================

  function pause() {
    if (!ctx) return;
    var hadL1 = !!layer1.source;
    var hadL2 = !!layer2.source;
    if (hadL1) stopLayer1();
    if (hadL2) stopLayer2();
    // suspendContext се извиква от per-layer timeouts
  }

  function stop() {
    if (layer1.source) {
      layer1.source._manualStop = true;
      try { layer1.source.stop(); } catch (e) {}
      try { layer1.source.disconnect(); } catch (e) {}
    }
    if (layer1.gainNode) { try { layer1.gainNode.disconnect(); } catch (e) {} }
    clearLayer1State();

    if (layer2.source) {
      layer2.source._manualStop = true;
      try { layer2.source.stop(); } catch (e) {}
      try { layer2.source.disconnect(); } catch (e) {}
    }
    if (layer2.filterNode) { try { layer2.filterNode.disconnect(); } catch (e) {} }
    if (layer2.gainNode) { try { layer2.gainNode.disconnect(); } catch (e) {} }
    clearLayer2State();

    suspendContext();
    console.log('[audio] stop (both layers)');
  }

  // ============================================================
  // SLEEP TIMER (operates on master gain — fades both layers)
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
    console.log('[audio] sleep timer:', minutes + 'min (fade@' + (fadeStartMs / 1000).toFixed(0) + 's)');
  }

  function startSleepFade() {
    sleepTimerId = null;
    if (!ctx || !masterGain) return;
    var now = ctx.currentTime;
    var cur = masterGain.gain.value;
    if (cur < 0.001) cur = 0.001;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(cur, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + SLEEP_FADE_SEC);
    sleepStopTimerId = setTimeout(function () {
      sleepStopTimerId = null;
      stop();
      if (masterGain) {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.value = volumeToGain(masterVolume);
      }
      sleepTimerTotalMin = 0;
      console.log('[audio] sleep timer expired → stop');
    }, SLEEP_FADE_SEC * 1000 + 100);
  }

  function cancelSleepTimer() {
    if (sleepTimerId) { clearTimeout(sleepTimerId); sleepTimerId = null; }
    if (sleepStopTimerId) { clearTimeout(sleepStopTimerId); sleepStopTimerId = null; }
    sleepTimerTotalMin = 0;
    if (ctx && masterGain) {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(volumeToGain(masterVolume),
        ctx.currentTime + 0.1);
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
  // QUERIES + Backward compat
  // ============================================================

  function isPlaying() { return !!(layer1.source || layer2.source); }
  function getActivePreset() { return layer1.presetId; }

  function getPlaybackInfo() {
    if (!layer1.source || !ctx) return null;
    var elapsed = ctx.currentTime - layer1.startCtxTime;
    var cur = (layer1.isLooping && layer1.bufferDuration > 0)
      ? (elapsed % layer1.bufferDuration)
      : elapsed;
    return {
      presetId: layer1.presetId,
      currentTime: cur,
      duration: layer1.bufferDuration,
      isLooping: layer1.isLooping
    };
  }

  function getActiveLayers() {
    return {
      layer1: {
        id: layer1.presetId,
        volume: layer1.volume,
        playing: !!layer1.source
      },
      layer2: {
        id: layer2.presetId,
        volume: layer2.volume,
        playing: !!layer2.source
      },
      master: masterVolume,
      ctxState: ctx ? ctx.state : 'closed'
    };
  }

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    init: init,
    unlock: unlock,

    // 2-layer playback
    playLayer1: playLayer1,
    playLayer2: playLayer2,
    stopLayer1: stopLayer1,
    stopLayer2: stopLayer2,
    setLayer1Volume: setLayer1Volume,
    setLayer2Volume: setLayer2Volume,
    getLayer1Volume: getLayer1Volume,
    getLayer2Volume: getLayer2Volume,
    crossfadeLayer1: crossfadeLayer1,
    getActiveLayers: getActiveLayers,

    // Backward compat
    play: playLayer1,
    playUrl: playUrl,
    pause: pause,
    stop: stop,
    isPlaying: isPlaying,
    getActivePreset: getActivePreset,
    getPlaybackInfo: getPlaybackInfo,

    // Master + sleep
    setMasterVolume: setMasterVolume,
    getMasterVolume: getMasterVolume,
    setSleepTimer: setSleepTimer,
    cancelSleepTimer: cancelSleepTimer,
    getSleepTimerInfo: getSleepTimerInfo,

    _getContext: function () { return ctx; }
  };
})();
