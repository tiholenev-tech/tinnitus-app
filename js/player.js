/**
 * AURALIS Player — full-screen 2-layer playback UI (Task P)
 * ===========================================================
 * Per BIBLE v3.1 §P: full-screen overlay когато sound играе.
 * Заменя mini-player за detailed control с 2 layer volumes.
 *
 * 2 layer model:
 *   Layer 1 = главен sound (от Library) с volume 0-100
 *   Layer 2 = background noise (от NoisePicker) с volume 0-100
 *
 * Audio engine API (mocked ако Code 1 още не e имплементирал):
 *   AudioEngine.playLayer2(noiseId)
 *   AudioEngine.setLayer1Volume(0-100)
 *   AudioEngine.setLayer2Volume(0-100)
 *
 * Back button (←) → връща в Library; sound ПРОДЪЛЖАВА и mini-player
 * автоматично се появява обратно (Library.refresh re-render-ва mini).
 *
 * Public API:
 *   Player.open(soundId, opts?)  — opts: { fromLibrary: true }
 *   Player.close()                — back to Library
 *   Player.render()               — router hook (rare)
 *
 * Не state machine phase — Player работи като modal-like overlay над
 * Library. AppState.transition('player') добавено за browser history.
 */

window.Player = (function () {
  'use strict';

  // ============================================================
  // Mock AudioEngine extensions (Code 1 ще ги override-не реално)
  // ============================================================

  if (window.AudioEngine) {
    if (!window.AudioEngine.playLayer2) {
      window.AudioEngine.playLayer2 = function (id) {
        console.log('[mock] AudioEngine.playLayer2:', id);
      };
    }
    if (!window.AudioEngine.setLayer1Volume) {
      window.AudioEngine.setLayer1Volume = function (v) {
        // Fallback: ползваме master volume докато няма реален layer split
        if (window.AudioEngine.setMasterVolume) {
          window.AudioEngine.setMasterVolume(v);
        }
      };
    }
    if (!window.AudioEngine.setLayer2Volume) {
      window.AudioEngine.setLayer2Volume = function (v) {
        console.log('[mock] AudioEngine.setLayer2Volume:', v);
      };
    }
  }

  // ============================================================
  // STATE
  // ============================================================

  var STORAGE_NOISE = 'auralis_player_noise_id';
  var STORAGE_L1_VOL = 'auralis_player_layer1_vol';
  var STORAGE_L2_VOL = 'auralis_player_layer2_vol';

  var activeSoundId = null;
  var noiseId = 'none';
  var layer1Vol = 100;  // A2.1: L1 default 100% — главен звук доминантен
  var layer2Vol = 50;   // A2.1: L2 default 50% — фон под L1
  var noiseChangedHandler = null;
  var progressTickId = null;
  // A2.6: flight token за single-flight Player.open — предотвратява
  // паралелни playLayer1 promise-и при бързи tap-ове на 2-3 sound-а.
  var openFlightToken = 0;

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

  function loadPersistedState() {
    try {
      var n = localStorage.getItem(STORAGE_NOISE);
      if (n) noiseId = n;
      var v1 = parseInt(localStorage.getItem(STORAGE_L1_VOL), 10);
      if (!isNaN(v1) && v1 >= 0 && v1 <= 100) layer1Vol = v1;
      var v2 = parseInt(localStorage.getItem(STORAGE_L2_VOL), 10);
      if (!isNaN(v2) && v2 >= 0 && v2 <= 100) layer2Vol = v2;
    } catch (e) { /* ignore */ }
  }

  function persist(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) { /* ignore */ }
  }

  function fmtTime(sec) {
    if (!sec || sec < 0 || !isFinite(sec)) return '0:00';
    sec = Math.floor(sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function findSound(soundId) {
    if (!soundId) return null;
    // 1) Library's loaded manifest (preferred — има всичките enrichment)
    if (window.Library && window.Library.getSoundById) {
      var s = window.Library.getSoundById(soundId);
      if (s) return s;
    }
    // 2) Global manifest (Home/CategoryView/SoundDetail го popull-ват)
    if (window.AURALIS_MANIFEST && Array.isArray(window.AURALIS_MANIFEST.sounds)) {
      var sounds = window.AURALIS_MANIFEST.sounds;
      for (var i = 0; i < sounds.length; i++) {
        if (sounds[i].id === soundId) return sounds[i];
      }
    }
    // 3) Currently active в AudioEngine
    var ps = window.Library && window.Library.getPlayingSound ?
      window.Library.getPlayingSound() : null;
    return ps && ps.id === soundId ? ps : null;
  }

  function soundTitle(sound) {
    return sound ? t(sound.title_key, sound.bg_title || sound.id) : '';
  }

  function soundSubtitle(sound) {
    return sound ? t(sound.subtitle_key, sound.category || '') : '';
  }

  function noiseLabel(id) {
    if (id === 'none') return t('components.player.noLayer2', 'Без фон');
    return t('noises.' + id + '.title', t('components.noisePicker.options.' + id, id));
  }

  // ============================================================
  // SVG icons
  // ============================================================

  var SVG = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>' +
      '<rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    sos: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>' +
      '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    waves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>' +
      '<path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>'
  };

  // ============================================================
  // HTML builders
  // ============================================================

  function buildSlider(id, label, value, ariaLabel) {
    return (
      '<div class="pl-slider-row">' +
        '<div class="pl-slider-head">' +
          '<span class="pl-slider-label">' + escapeHtml(label) + '</span>' +
          '<span class="pl-slider-value" id="' + id + 'Value">' + value + '%</span>' +
        '</div>' +
        '<input type="range" class="pl-slider" id="' + id + '"' +
          ' min="0" max="100" step="1" value="' + value + '"' +
          ' aria-label="' + escapeHtml(ariaLabel) + '">' +
      '</div>'
    );
  }

  function buildPlayerHtml(sound, isPlaying) {
    var title = soundTitle(sound);
    var subtitle = soundSubtitle(sound);
    var duration = (sound && sound.duration_sec) ? sound.duration_sec : 0;
    var backAria = t('components.player.backAria', 'Назад към библиотеката');
    var l1Label = t('components.player.layer1Label', 'Основен звук');
    var l2Label = t('components.player.layer2Label', 'Фонов шум');
    var noiseChangeLabel = t('components.player.noiseChange', 'Смени фон');
    var playAria = isPlaying
      ? t('components.player.pauseAria', 'Пауза')
      : t('components.player.playAria', 'Пусни');
    var sleepAria = t('components.player.sleepAria', 'Нощен режим');
    var sosAria = t('components.player.sosAria', 'SOS дишане');

    return (
      '<div class="pl-screen" data-screen="player"' +
        ' role="region" aria-label="' + escapeHtml(title) + '">' +

        '<header class="pl-header">' +
          '<button class="pl-back" type="button" data-action="back"' +
            ' aria-label="' + escapeHtml(backAria) + '">' + SVG.back +
          '</button>' +
          '<div class="pl-header-spacer"></div>' +
        '</header>' +

        '<div class="pl-art" aria-hidden="true">' +
          '<div class="pl-art-orb"></div>' +
        '</div>' +

        '<div class="pl-info">' +
          '<h1 class="pl-title">' + escapeHtml(title) + '</h1>' +
          '<div class="pl-subtitle">' + escapeHtml(subtitle) + '</div>' +
        '</div>' +

        '<div class="pl-progress">' +
          '<div class="pl-progress-bar" role="progressbar"' +
            ' aria-valuemin="0" aria-valuemax="' + duration + '" aria-valuenow="0">' +
            '<div class="pl-progress-fill" id="plProgressFill" style="width: 0%"></div>' +
          '</div>' +
          '<div class="pl-progress-times">' +
            '<span id="plCurTime">0:00</span>' +
            '<span id="plTotalTime">' + (duration > 0 ? fmtTime(duration) : '∞') + '</span>' +
          '</div>' +
        '</div>' +

        '<div class="pl-layers">' +
          '<div class="pl-layer">' +
            '<div class="pl-layer-name pl-layer-name--main">' +
              '<span class="pl-layer-icon" aria-hidden="true">' + SVG.speaker + '</span>' +
              '<span class="pl-layer-name-text">' + escapeHtml(l1Label) + '</span>' +
            '</div>' +
            buildSlider('plL1', escapeHtml(title), layer1Vol,
              l1Label + ' 0-100') +
          '</div>' +
          '<div class="pl-layer">' +
            '<button class="pl-layer-name pl-layer-name--noise" type="button"' +
              ' data-action="open-noise"' +
              ' aria-label="' + escapeHtml(noiseChangeLabel) + '">' +
              '<span class="pl-layer-icon" aria-hidden="true">' + SVG.waves + '</span>' +
              '<span class="pl-layer-name-text">' + escapeHtml(noiseLabel(noiseId)) + '</span>' +
              '<span class="pl-layer-chevron" aria-hidden="true">›</span>' +
            '</button>' +
            buildSlider('plL2', escapeHtml(noiseLabel(noiseId)), layer2Vol,
              l2Label + ' 0-100') +
          '</div>' +
        '</div>' +

        '<div class="pl-controls">' +
          '<button class="pl-ctrl pl-ctrl--secondary" type="button" data-action="sos"' +
            ' aria-label="' + escapeHtml(sosAria) + '">' +
            SVG.sos +
          '</button>' +
          '<button class="pl-ctrl pl-ctrl--play" type="button" data-action="toggle"' +
            ' aria-label="' + escapeHtml(playAria) + '">' +
            (isPlaying ? SVG.pause : SVG.play) +
          '</button>' +
          '<button class="pl-ctrl pl-ctrl--secondary" type="button" data-action="sleep"' +
            ' aria-label="' + escapeHtml(sleepAria) + '">' +
            SVG.moon +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Progress tick
  // ============================================================

  function startProgressTick() {
    stopProgressTick();
    progressTickId = setInterval(updateProgress, 300);
  }
  function stopProgressTick() {
    if (progressTickId) { clearInterval(progressTickId); progressTickId = null; }
  }
  function updateProgress() {
    if (!window.AudioEngine || !window.AudioEngine.getPlaybackInfo) return;
    var info = window.AudioEngine.getPlaybackInfo();
    if (!info) { stopProgressTick(); return; }
    var fill = el('plProgressFill');
    var curEl = el('plCurTime');
    if (info.duration > 0) {
      var pct = info.isLooping
        ? ((info.currentTime % info.duration) / info.duration) * 100
        : Math.min(100, (info.currentTime / info.duration) * 100);
      if (fill) fill.style.width = pct.toFixed(1) + '%';
    }
    if (curEl) curEl.textContent = fmtTime(info.currentTime);
  }

  // ============================================================
  // Interactions
  // ============================================================

  // SAFETY-4: throttle volume warnings (макс 1 toast на 8s да не спами).
  var lastVolumeWarnTs = 0;
  function checkVolumeWarning(level) {
    var now = Date.now();
    if (now - lastVolumeWarnTs < 8000) return;
    var hour = new Date().getHours();
    var isNight = hour >= 22 || hour < 7;
    var msg = null;
    if (isNight && level > 55) {
      msg = 'Над 55% нощем не се препоръчва — риск за слуха при дълго слушане.';
    } else if (!isNight && level > 70) {
      msg = 'Над 70% може да увреди слуха при дълго слушане.';
    }
    if (msg && window.Toast) {
      lastVolumeWarnTs = now;
      if (window.Toast.warning) {
        window.Toast.warning(msg);
      } else if (window.Toast.show) {
        window.Toast.show(msg, { variant: 'warning', durationMs: 4000 });
      }
    }
  }

  function onL1Input(e) {
    var v = parseInt(e.currentTarget.value, 10);
    if (isNaN(v)) return;
    layer1Vol = Math.max(0, Math.min(100, v));
    persist(STORAGE_L1_VOL, layer1Vol);
    var lbl = el('plL1Value');
    if (lbl) lbl.textContent = layer1Vol + '%';
    if (window.AudioEngine && window.AudioEngine.setLayer1Volume) {
      window.AudioEngine.setLayer1Volume(layer1Vol);
    }
    checkVolumeWarning(layer1Vol);
  }
  function onL2Input(e) {
    var v = parseInt(e.currentTarget.value, 10);
    if (isNaN(v)) return;
    layer2Vol = Math.max(0, Math.min(100, v));
    persist(STORAGE_L2_VOL, layer2Vol);
    var lbl = el('plL2Value');
    if (lbl) lbl.textContent = layer2Vol + '%';
    if (window.AudioEngine && window.AudioEngine.setLayer2Volume) {
      window.AudioEngine.setLayer2Volume(layer2Vol);
    }
    checkVolumeWarning(layer2Vol);
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'back') close();
    else if (action === 'toggle') togglePlayPause();
    else if (action === 'open-noise') openNoisePicker();
    else if (action === 'sleep') openSleep();
    else if (action === 'sos') openSos();
  }

  function togglePlayPause() {
    if (!window.AudioEngine) return;
    var wasPlaying = window.AudioEngine.isPlaying();
    if (wasPlaying) {
      window.AudioEngine.pause();
      stopProgressTick();
      // A2.3: optimistic update — пейтменим иконата НА Pause→Play незабавно.
      setPlayButtonIcon(false);
    } else if (activeSoundId) {
      // A2.3: optimistic update — пейтменим иконата на Play→Pause незабавно.
      setPlayButtonIcon(true);
      startProgressTick();
      // Direct AudioEngine.play (вместо Library.openSound — който не е
      // нужен сега защото state е готов).
      if (window.AudioEngine.play) {
        window.AudioEngine.play(activeSoundId).catch(function (err) {
          console.warn('[player] play failed:', err && err.message);
          // Failed → revert to play icon
          setPlayButtonIcon(false);
        });
      } else if (window.Library && window.Library.openSound) {
        window.Library.openSound(activeSoundId);
      }
    }
    // Sanity check — verify state ~250ms по-късно (audio promise може да fail).
    setTimeout(updatePlayButtonState, 250);
  }

  function setPlayButtonIcon(isPlaying) {
    var btn = document.querySelector('.pl-ctrl--play');
    if (!btn) return;
    btn.innerHTML = isPlaying ? SVG.pause : SVG.play;
    btn.setAttribute('aria-label',
      isPlaying ? t('components.player.pauseAria', 'Пауза')
                : t('components.player.playAria', 'Пусни'));
  }

  function updatePlayButtonState() {
    var isPlaying = window.AudioEngine && window.AudioEngine.isPlaying();
    setPlayButtonIcon(!!isPlaying);
  }

  function openNoisePicker() {
    if (window.NoisePicker && window.NoisePicker.open) {
      window.NoisePicker.open(noiseId);
    }
  }

  function openSleep() {
    if (window.Sleep && window.Sleep.open) window.Sleep.open();
  }

  function openSos() {
    if (window.SOS && window.SOS.open) window.SOS.open();
  }

  function onNoiseChanged(e) {
    var newId = e.detail && e.detail.noiseId;
    if (!newId) return;
    noiseId = newId;
    persist(STORAGE_NOISE, noiseId);
    if (window.AudioEngine && window.AudioEngine.playLayer2) {
      window.AudioEngine.playLayer2(noiseId);
    }
    // Re-render layer 2 row only
    refreshLayer2();
  }

  function refreshLayer2() {
    var noiseBtn = document.querySelector('.pl-layer-name--noise .pl-layer-name-text');
    if (noiseBtn) noiseBtn.textContent = noiseLabel(noiseId);
  }

  // ============================================================
  // Render / bind / open / close
  // ============================================================

  // A2.2: touch-action: pan-x в CSS handles scroll vs drag natively.
  // JS preventDefault е премахнат — конфликтваше с native range input.

  function bindEvents(container) {
    container.addEventListener('click', onClick);
    var l1 = container.querySelector('#plL1');
    var l2 = container.querySelector('#plL2');
    if (l1) {
      l1.addEventListener('input', onL1Input);
      l1.addEventListener('change', onL1Input);
    }
    if (l2) {
      l2.addEventListener('input', onL2Input);
      l2.addEventListener('change', onL2Input);
    }
  }

  function open(soundId) {
    if (!soundId) return;
    var sound = findSound(soundId);
    if (!sound) { console.warn('[player] sound not found:', soundId); return; }

    // SAFETY-3: показваме HeadphonesWarning при първото отваряне.
    // Bottom sheet с educational съдържание (in-ear contraindication,
    // mixing point, night exposure limit). След dismiss → продължава.
    if (window.HeadphonesWarning && window.HeadphonesWarning.showIfFirstTime
        && !window.HeadphonesWarning.hasBeenSeen()) {
      window.HeadphonesWarning.showIfFirstTime(function () {
        openCore(soundId);
      });
      return;
    }
    openCore(soundId);
  }

  function openCore(soundId) {
    var sound = findSound(soundId);
    if (!sound) return;

    // A2.6: single-flight token + sequential pipeline.
    // Симптом: tap нов звук → 60s забавяне + стар продължава + понякога паралелни.
    // Причина: множествени Player.open() извиквания пускаха паралелни playLayer1
    // promise-и; стария Layer 1 source не беше явно спрян преди новия.
    var myToken = ++openFlightToken;
    var prevSoundId = activeSoundId;
    console.log('[player] open:', soundId, 'prev:', prevSoundId, 'token:', myToken);

    loadPersistedState();

    // PROFILE-CONFIG: apply mix + master volume per profile × scenario × time.
    // User overrides per soundId take precedence (state.userOverrides).
    applyProfileConfig(sound);

    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('player');
    }
    history.pushState({ phase: 'player', soundId: soundId }, '');

    var app = el('app');
    if (app) {
      app.innerHTML = buildPlayerHtml(sound, true);
      bindEvents(app);
    }

    // Sync volumes ВЕДНАГА (без значение от async pipeline).
    if (window.AudioEngine) {
      if (window.AudioEngine.setLayer1Volume) window.AudioEngine.setLayer1Volume(layer1Vol);
      if (window.AudioEngine.setLayer2Volume) window.AudioEngine.setLayer2Volume(layer2Vol);
    }

    // Layer 2 (noise) async setup — не блокира Layer 1.
    if (window.AudioEngine && noiseId !== 'none' && window.AudioEngine.playLayer2) {
      try { window.AudioEngine.playLayer2(noiseId); } catch (e) {}
    }

    // Layer 1 pipeline — stop old → wait → play new.
    var engine = window.AudioEngine;
    if (engine) {
      var activePreset = engine.getActivePreset ? engine.getActivePreset() : null;

      if (activePreset === soundId) {
        // Същия sound вече свири — само update state.
        console.log('[player] Layer 1 already playing same preset, no restart');
        activeSoundId = soundId;
      } else {
        var stopPromise = Promise.resolve();
        if (prevSoundId && prevSoundId !== soundId && engine.stopLayer1) {
          console.log('[player] stopping prev Layer 1:', prevSoundId);
          try { engine.stopLayer1(); } catch (e) {}
          // stopLayer1 schedules fadeout ~250ms; чакаме малко преди play.
          stopPromise = new Promise(function (r) { setTimeout(r, 280); });
        }

        stopPromise.then(function () {
          // Verify flight token — user-ът може да е tap-нал друг sound вече.
          if (myToken !== openFlightToken) {
            console.log('[player] flight cancelled (token mismatch):', soundId);
            return;
          }
          activeSoundId = soundId;
          if (!engine.playLayer1) return;
          console.log('[player] Layer 1 starting:', soundId);
          return engine.playLayer1(soundId);
        }).then(function () {
          if (myToken !== openFlightToken) return;
          console.log('[player] Layer 1 started:', soundId);
          updatePlayButtonState();
        }).catch(function (err) {
          if (myToken !== openFlightToken) return;
          console.warn('[player] Layer 1 failed:', soundId, err && err.message);
          setPlayButtonIcon(false);
        });
      }
    } else {
      activeSoundId = soundId;
    }

    // Subscribe noise-changed (single mount)
    if (!noiseChangedHandler) {
      noiseChangedHandler = onNoiseChanged;
      window.addEventListener('noise-changed', noiseChangedHandler);
    }

    startProgressTick();
  }

  function close() {
    stopProgressTick();
    if (noiseChangedHandler) {
      window.removeEventListener('noise-changed', noiseChangedHandler);
      noiseChangedHandler = null;
    }
    // Д5: suppress error banner за 1.5s — in-flight fetch грешки от
    // самото close да не вдигат banner на следващия екран.
    if (window.AudioErrorBanner && window.AudioErrorBanner.suppress) {
      window.AudioErrorBanner.suppress(1500);
    }
    // Д4: HARD STOP двата слоя при close — преди това sound продължаваше
    // да върви като orphan playback (UI на home/diary, sound в background).
    if (window.AudioEngine) {
      if (window.AudioEngine.stopLayer1) {
        try { window.AudioEngine.stopLayer1(); } catch (e) {}
      }
      if (window.AudioEngine.stopLayer2) {
        try { window.AudioEngine.stopLayer2(); } catch (e) {}
      }
      // Fallback: pause() ако stopLayer* липсват
      if (!window.AudioEngine.stopLayer1 && window.AudioEngine.pause) {
        try { window.AudioEngine.pause(); } catch (e) {}
      }
    }
    activeSoundId = null;

    // NAV-STACK: popPhase връща последния phase (без re-push). Безсмислени
    // back targets (player, thi_baseline) се пропускат, продължава с home.
    var s = window.AppState;
    if (!s) return;
    var BLOCK = ['player', 'thi_baseline'];
    var back = s.popPhase ? s.popPhase() : null;
    while (back && BLOCK.indexOf(back) !== -1) {
      back = s.popPhase();
    }
    if (!back) {
      back = 'home';
      if (s.transition) s.transition('home');
    }
    // popPhase вече сетва s.current = back; не правим повторно transition().
    console.log('[player] close → back to:', back);
    // A2.4: replaceState (не pushState) consume-ва player history entry.
    // Иначе browser back → popstate с {phase:'player'} → loop.
    history.replaceState({ phase: back }, '');

    var renderers = {
      'home':            window.Home,
      'category':        window.CategoryView,
      'sound':           window.SoundDetail,
      'diary_hub':       window.DiaryHub,
      'profile_results': window.ProfileResults,
      'library':         window.Library
    };
    var r = renderers[back];
    if (r && r.render) {
      r.render();
    } else if (window.Home && window.Home.render) {
      window.Home.render();
    }
  }

  function render() {
    // Router hook — rare; popstate landing на 'player' phase
    if (!activeSoundId && window.AudioEngine && window.AudioEngine.getActivePreset) {
      activeSoundId = window.AudioEngine.getActivePreset();
    }
    if (!activeSoundId) {
      if (window.Library && window.Library.render) window.Library.render();
      return;
    }
    var sound = findSound(activeSoundId);
    if (!sound) { close(); return; }
    var app = el('app');
    if (app) {
      app.innerHTML = buildPlayerHtml(sound, true);
      bindEvents(app);
    }
    startProgressTick();
  }

  return {
    open: open,
    close: close,
    render: render
  };
})();
