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
  // Noise pack normalized to -26 LUFS (audio_normalize.py done) — cap removed.
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

  // ============================================================
  // PRELOAD CACHE (AUDIO-PRELOAD)
  // ============================================================
  // Top sounds в category се prefetch-ват → fetch+decode завършват докато
  // user-ът разглежда списъка → tap Play стартира моментално.
  // LRU cache от 5 most recently preloaded.

  var preloadOrder = []; // [soundId, soundId, ...] oldest → newest
  var PRELOAD_LIMIT = 20;

  function findSoundInManifest(soundId) {
    if (!soundId) return null;
    if (!window.AURALIS_MANIFEST || !window.AURALIS_MANIFEST.sounds) return null;
    var arr = window.AURALIS_MANIFEST.sounds;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === soundId) return arr[i];
    }
    return null;
  }

  function preloadSound(soundId) {
    if (!soundId) return Promise.reject(new Error('no soundId'));
    init();
    var sound = findSoundInManifest(soundId);
    if (!sound || !sound.filename) {
      return Promise.reject(new Error('sound not in manifest'));
    }
    var url = 'library_staging_compact/' + sound.filename;
    if (bufferCache[url]) {
      // Already decoded — bump LRU order.
      var idx = preloadOrder.indexOf(soundId);
      if (idx !== -1) preloadOrder.splice(idx, 1);
      preloadOrder.push(soundId);
      return Promise.resolve(bufferCache[url]);
    }
    return fetchAndDecode(url, soundId).then(function (buffer) {
      preloadOrder.push(soundId);
      while (preloadOrder.length > PRELOAD_LIMIT) {
        var oldest = preloadOrder.shift();
        var oldSnd = findSoundInManifest(oldest);
        if (oldSnd && oldSnd.filename) {
          var oldUrl = 'library_staging_compact/' + oldSnd.filename;
          delete bufferCache[oldUrl];
        }
      }
      console.log('[preload] Cached:', soundId, '(' + buffer.duration.toFixed(1) + 's)');
      return buffer;
    }).catch(function (err) {
      console.log('[preload] Failed:', soundId, err && err.message);
      throw err;
    });
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

  // FLIGHT-TOKEN guard в audio-engine (BUG1 fix):
  // Preload LRU cache + paralelni playLayer1 promises → буферите се
  // resolve-ваха в реда на decode, не в реда на user заявките → грешен
  // звук играеше + неочаквани автоматични switch-ове.
  // ++currentFlightToken на всяко playLayer1 → старите buffer promises
  // се проверяват преди да започнат playback → abort ако stale.
  var currentFlightToken = 0;
  // Exposed за SEQ-REVEAL animation cancel.
  function getCurrentFlightToken() { return currentFlightToken; }

  // P0.1: L2 flight token — mirror на L1 protection срещу fetch race.
  // Scenario: user spam-ва NoisePicker → playLayer2(A) → playLayer2(B).
  // Без token B може да resolve преди A → A фетч-ът завършва по-късно →
  // startLayer2Source(A) overwrites B. Wrong noise plays.
  // Used и в SEQ-REVEAL setTimeout — ако user смени noise през NoisePicker
  // между L1 reveal и L2 delay window → captured token mismatches → ABORT.
  var currentL2FlightToken = 0;

  function playLayer1(presetId, opts) {
    var myToken = ++currentFlightToken;
    console.log('[audio-engine] playLayer1 token:', myToken, 'presetId:', presetId, opts || '');
    var spec = resolveSpec(presetId);
    if (!spec) {
      console.error('[audio-engine] L1 unknown preset (resolveSpec → null):', presetId);
      return Promise.reject(new Error('Unknown preset: ' + presetId));
    }
    return playLayer1Spec(presetId, spec, opts, myToken);
  }

  // ============================================================
  // SEQ-REVEAL: layered fade-in (L1 → wait → L2)
  // ============================================================
  // Маскира audio loading delay + UX educator (потребителят чува първо
  // чистия звук, после как се добавя терапевтичния шум).
  //
  // Dispatches:
  //   audio:reveal-l1 { targetVol, duration }   — start на Layer 1 ramp
  //   audio:reveal-l2 { targetVol, duration }   — start на Layer 2 ramp
  //
  // timing = { layer1FadeSec, layer2DelaySec, layer2FadeSec } от ProfileConfig.

  // CRITICAL FIX: pending L2 reveal timer-ите се натрупваха. Всяко
  // playSequentialReveal call queue-ваше setTimeout без да cancel-ва
  // предишните → 30-60s по-късно стари timer-и fire-ваха → audio
  // се сменяше "сам". Сега track-ваме pending timer и го cancel-ваме.
  var pendingL2RevealTimer = null;
  // Снимка на active SEQ-REVEAL request (за L1-then-L2 ordering).
  var activeRevealRequest = 0;

  function playSequentialReveal(soundId, noiseId, timing) {
    timing = timing || { layer1FadeSec: 2.5, layer2DelaySec: 2.5, layer2FadeSec: 4.0 };
    var revealReq = ++activeRevealRequest;
    console.log('[seq-reveal] start req:', revealReq, {
      soundId: soundId, noiseId: noiseId, timing: timing,
      l1Vol: layer1.volume, l2Vol: layer2.volume, masterVol: masterVolume
    });

    // CRITICAL: cancel pending L2 reveal от предишен SEQ-REVEAL call.
    if (pendingL2RevealTimer) {
      clearTimeout(pendingL2RevealTimer);
      pendingL2RevealTimer = null;
      console.log('[seq-reveal] cancelled pending L2 timer from prev request');
    }

    // Stop L2 first — не искаме L2 да продължи играе докато L1 започне reveal.
    if (layer2.source) {
      try { hardStopLayer2(); } catch (e) {}
    }

    var l1Promise = playLayer1(soundId, { fadeInSec: timing.layer1FadeSec });

    // L1 RESOLVED → emit reveal event + schedule L2 (NOT before L1 actually plays).
    // Преди това L2 setTimeout fire-ваше при 2.5s от заявката, но L1 fetch отнема
    // 5-15s → L2 audible преди L1. Now we chain L2 to L1 promise.
    l1Promise.then(function (l1Started) {
      // Stale check — нов SEQ-REVEAL вече е стартиран.
      if (revealReq !== activeRevealRequest) {
        console.log('[seq-reveal] L1 resolved but req', revealReq, 'is stale (current:', activeRevealRequest + ') — skip L2 schedule');
        return;
      }
      // P1.3: L1 abort check — startLayer1Source може да върне false от
      // re-entrancy guard (same presetId restart <500ms) или token check
      // може да върне false. Преди това L2 setTimeout все пак schedule-ваше
      // → L2 свири без L1 (audio leak).
      if (l1Started === false) {
        console.log('[seq-reveal] L1 NOT started (aborted by guard/token) — skip L2 schedule');
        return;
      }
      console.log('[seq-reveal] req', revealReq, 'L1 STARTED — gain target', volumeToGain(layer1.volume).toFixed(3));
      try {
        window.dispatchEvent(new CustomEvent('audio:reveal-l1', {
          detail: { targetVol: layer1.volume, duration: timing.layer1FadeSec * 1000 }
        }));
      } catch (e) {}

      // Now schedule L2 — chained to L1 actual start (not Player.open call).
      if (noiseId && noiseId !== 'none') {
        // P0.1: capture L2 flight token at schedule time. Ако user смени
        // noise през NoisePicker (директен playLayer2 call от Player) преди
        // timer да fire-не → currentL2FlightToken ще е incremented → ABORT
        // scheduled L2 (защото user already picked друг звук).
        var l2TokenAtSchedule = currentL2FlightToken;
        var delayMs = (timing.layer2DelaySec || 0) * 1000;
        pendingL2RevealTimer = setTimeout(function () {
          pendingL2RevealTimer = null;
          // Stale check inside timer fire — req може да е сменено.
          if (revealReq !== activeRevealRequest) {
            console.log('[seq-reveal] L2 timer fire for stale req', revealReq, '(current:', activeRevealRequest + ') — ABORT');
            return;
          }
          // P0.1: L2 flight token check — user changed noise during delay window.
          if (currentL2FlightToken !== l2TokenAtSchedule) {
            console.log('[seq-reveal] L2 flight token changed (', l2TokenAtSchedule, '→', currentL2FlightToken, ') — user noise change — ABORT scheduled L2');
            return;
          }
          // P1.3: secondary L1 health check — между schedule и fire,
          // L1 source може да е спрял (stopLayer1, source ended, нов
          // sound switch). Не schedule L2 ако L1 не свири the requested sound.
          if (layer1.presetId !== soundId || !layer1.source) {
            console.log('[seq-reveal] L1 не active during L2 delay (presetId:', layer1.presetId, 'requested:', soundId, 'source:', !!layer1.source, ') — ABORT L2');
            return;
          }
          playLayer2(noiseId, { fadeInSec: timing.layer2FadeSec }).then(function () {
            if (revealReq !== activeRevealRequest) return;
            try {
              window.dispatchEvent(new CustomEvent('audio:reveal-l2', {
                detail: { targetVol: layer2.volume, duration: timing.layer2FadeSec * 1000 }
              }));
            } catch (e) {}
          }).catch(function (err) {
            console.warn('[seq-reveal] L2 failed:', err && err.message);
          });
        }, delayMs);
      }
    }).catch(function (err) {
      console.warn('[seq-reveal] L1 FAILED req', revealReq + ':', err && err.message);
    });

    return l1Promise;
  }

  function playUrl(id, url, opts) {
    if (!id || !url) return Promise.reject(new Error('playUrl requires id+url'));
    var spec = { type: 'file', url: url };
    PRESET_MAP[id] = spec;
    var myToken = ++currentFlightToken;
    return playLayer1Spec(id, spec, opts, myToken);
  }

  function resolveSpec(presetId) {
    if (PRESET_MAP[presetId]) return PRESET_MAP[presetId];
    // Manifest-based lookup (set by Library/Home loader)
    if (window.AURALIS_MANIFEST && window.AURALIS_MANIFEST.sounds) {
      var sounds = window.AURALIS_MANIFEST.sounds;
      for (var i = 0; i < sounds.length; i++) {
        if (sounds[i].id === presetId) {
          var s = { type: 'file', url: 'library_staging_compact/' + sounds[i].filename };
          PRESET_MAP[presetId] = s;
          return s;
        }
      }
    }
    return null;
  }

  // P1.3: playLayer1Spec resolves to boolean — true ако L1 source actually
  // started (or already playing same preset), false ако aborted (stale token
  // or re-entrancy guard). SEQ-REVEAL чете тази стойност за да реши дали да
  // schedule-не L2.
  function playLayer1Spec(presetId, spec, opts, myToken) {
    init();
    unlock();
    opts = opts || {};

    if (layer1.presetId === presetId && layer1.source) {
      console.log('[audio] L1 already playing:', presetId);
      return Promise.resolve(true); // P1.3: L1 IS playing the requested sound
    }

    return resumeContext().then(function () {
      // FLIGHT-TOKEN: check before starting heavy work (буфер може да дойде от cache).
      if (typeof myToken === 'number' && myToken !== currentFlightToken) {
        console.log('[playLayer1] STALE token', myToken, 'current:', currentFlightToken, '— ABORT pre-decode');
        return false;
      }
      if (spec.type === 'file') {
        return fetchAndDecode(spec.url, presetId).then(function (buffer) {
          // FLIGHT-TOKEN: re-check след decode (LRU може да върне cached buffer мигновено
          // докато по-нов user tap е incremented token-а).
          if (typeof myToken === 'number' && myToken !== currentFlightToken) {
            console.log('[playLayer1] STALE token', myToken, 'current:', currentFlightToken, '— ABORT post-decode');
            return false;
          }
          return startLayer1Source(presetId, buffer, opts);
        });
      } else if (spec.type === 'generated') {
        var buffer = (spec.gen === 'brown')
          ? getOrGenerateBrownBuffer()
          : getOrGeneratePinkBuffer();
        if (typeof myToken === 'number' && myToken !== currentFlightToken) {
          console.log('[playLayer1] STALE token', myToken, 'current:', currentFlightToken, '— ABORT generated');
          return false;
        }
        return startLayer1Source(presetId, buffer, opts);
      }
      return Promise.reject(new Error('Bad spec: ' + JSON.stringify(spec)));
    });
  }

  // Belt-and-suspenders: блокирай startLayer1Source за SAME presetId в
  // рамките на 500ms (защита от случайно double-trigger от late buffer
  // resolves). Различен presetId винаги преминава.
  var lastL1Start = { presetId: null, ts: 0 };

  // P1.3: return true ако source actually started, false ако early-return от
  // re-entrancy guard. playLayer1Spec пропагира това към promise resolution
  // value → SEQ-REVEAL може да проверява дали L1 наистина свири преди да
  // schedule-не L2.
  function startLayer1Source(presetId, buffer, opts) {
    opts = opts || {};
    var loop = opts.loop !== false;

    // Re-entrancy guard: блокирай ако SAME presetId стартиран преди <500ms.
    var nowMs = Date.now();
    if (lastL1Start.presetId === presetId && (nowMs - lastL1Start.ts) < 500) {
      console.log('[audio] L1 re-entrancy blocked for', presetId, '(', (nowMs - lastL1Start.ts), 'ms ago)');
      return false; // P1.3: explicit abort signal
    }
    lastL1Start.presetId = presetId;
    lastL1Start.ts = nowMs;

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
      // SEQ-REVEAL-BUG fix: exponential ramp от 0.0001 → target за 2.5s
      // оставяше L1 inaudible за първия ~1.5s (exp curve heavily back-loaded).
      // → linearRampToValueAtTime е perceptually OK + audible от началото.
      var fadeIn = (typeof opts.fadeInSec === 'number' && opts.fadeInSec > 0)
        ? opts.fadeInSec : 0.1;
      console.log('[audio] L1 fade-in: 0 →', targetGain.toFixed(3), 'over', fadeIn, 's');
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(targetGain, now + fadeIn);
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
    return true; // P1.3: source actually started
  }

  function crossfadeLayer1(newPresetId) {
    return playLayer1(newPresetId); // crossfade is automatic if L1 active
  }

  function stopLayer1() {
    // CRITICAL: invalidate any pending SEQ-REVEAL request + cancel L2 timer.
    // Иначе старите setTimeout-и продължават да fire-ват L2 → audio leakage.
    activeRevealRequest++;
    if (pendingL2RevealTimer) {
      clearTimeout(pendingL2RevealTimer);
      pendingL2RevealTimer = null;
    }
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

  function playLayer2(noiseId, opts) {
    // P0.1: ++ на ВСЯКО влизане — включително за 'none' (stop е валидна заявка
    // която трябва да invalidate-не in-flight fetches с по-стар token).
    var myToken = ++currentL2FlightToken;
    init();
    unlock();
    opts = opts || {};

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
            spec = { type: 'file', url: 'library_staging_compact/' + n.filename };
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
      // P0.1: pre-fetch token check (cached buffer scenario / quick spam).
      if (myToken !== currentL2FlightToken) {
        console.log('[playLayer2] STALE token', myToken, 'current:', currentL2FlightToken, '— ABORT pre-fetch');
        return;
      }
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
        // P0.1: post-decode token check (по-нов playLayer2 може да е startнал
        // докато fetch+decode се изпълнява).
        if (myToken !== currentL2FlightToken) {
          console.log('[playLayer2] STALE token', myToken, 'current:', currentL2FlightToken, '— ABORT post-decode');
          return;
        }
        startLayer2Source(noiseId, buffer, spec.filter || null, { fadeInSec: opts.fadeInSec });
      });
    });
  }

  function startLayer2Source(noiseId, buffer, filterFreq, opts) {
    opts = opts || {};
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
    // SEQ-REVEAL-BUG fix: linear (audible от началото) вместо exponential
    // (back-loaded — inaudible за първия ~60% от fadeIn).
    var fadeIn = (typeof opts.fadeInSec === 'number' && opts.fadeInSec > L2_FADE_SEC)
      ? opts.fadeInSec : L2_FADE_SEC;
    console.log('[audio] L2 fade-in: 0 →', targetGain.toFixed(3), 'over', fadeIn, 's');
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(targetGain, now + fadeIn);

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
    // Cancel pending SEQ-REVEAL L2 timer.
    activeRevealRequest++;
    if (pendingL2RevealTimer) {
      clearTimeout(pendingL2RevealTimer);
      pendingL2RevealTimer = null;
    }
    if (!ctx) return;
    var hadL1 = !!layer1.source;
    var hadL2 = !!layer2.source;
    if (hadL1) stopLayer1();
    if (hadL2) stopLayer2();
    // suspendContext се извиква от per-layer timeouts
  }

  function stop() {
    // Cancel pending SEQ-REVEAL L2 timer.
    activeRevealRequest++;
    if (pendingL2RevealTimer) {
      clearTimeout(pendingL2RevealTimer);
      pendingL2RevealTimer = null;
    }
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

    // Preload + sequential reveal
    preloadSound: preloadSound,
    playSequentialReveal: playSequentialReveal,
    getCurrentFlightToken: getCurrentFlightToken,

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
