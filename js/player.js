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
  // NO-TIMER: progressTickId премахнат — няма progress bar/timer logic.
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

  // NO-TIMER: fmtTime() премахнат — не показваме duration.

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
    // NO-TIMER: премахнат progress bar — всички звуци са infinite loop,
    // duration няма смисъл за UI. Запазен duration_sec в manifest за
    // future analytics, но не се показва.
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
          '<button class="pl-info-btn" type="button" data-action="info"' +
            ' aria-label="' + escapeHtml(t('components.player.infoAria', 'Информация за звука')) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
              ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<circle cx="12" cy="12" r="10"/>' +
              '<line x1="12" y1="16" x2="12" y2="12"/>' +
              '<line x1="12" y1="8" x2="12.01" y2="8"/>' +
            '</svg>' +
          '</button>' +
        '</header>' +

        '<div class="pl-art" aria-hidden="true">' +
          '<div class="pl-art-orb"></div>' +
        '</div>' +

        '<div class="pl-info">' +
          '<h1 class="pl-title">' + escapeHtml(title) + '</h1>' +
          '<div class="pl-subtitle">' + escapeHtml(subtitle) + '</div>' +
        '</div>' +

        // NO-TIMER: progress bar премахнат — всички звуци са infinite loop.

        '<div class="pl-layers">' +
          '<div class="pl-layer">' +
            '<div class="pl-layer-name pl-layer-name--main">' +
              '<span class="pl-layer-icon" aria-hidden="true">' + SVG.speaker + '</span>' +
              '<span class="pl-layer-name-text">' + escapeHtml(l1Label) + '</span>' +
            '</div>' +
            buildSlider('plL1', escapeHtml(title), layer1Vol,
              l1Label + ' 0-100') +
          '</div>' +
          // BUG2: ако noise === 'none' (meditation scenario) — скрий L2 row.
          (noiseId === 'none' ? '' :
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
          '</div>') +
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

  // NO-TIMER: progress tick logic премахнат — infinite loop, нямаме
  // currentTime/duration display. startProgressTick/stopProgressTick са
  // запазени като no-op за backward compat (call sites в openCore/render/
  // close/togglePlayPause не трябва да се пипат до по-голям рефактор).
  function startProgressTick() { /* no-op (NO-TIMER) */ }
  function stopProgressTick()  { /* no-op (NO-TIMER) */ }

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

  // PROFILE-CONFIG: запис на user override (debounced 800ms — не спами при drag).
  var overrideSaveTimer = null;
  function scheduleUserOverrideSave() {
    if (!activeSoundId || !window.ProfileConfig || !window.ProfileConfig.setUserOverride) return;
    if (overrideSaveTimer) clearTimeout(overrideSaveTimer);
    overrideSaveTimer = setTimeout(function () {
      var master = (window.AudioEngine && window.AudioEngine.getMasterVolume)
        ? window.AudioEngine.getMasterVolume() : 50;
      window.ProfileConfig.setUserOverride(activeSoundId, layer1Vol, layer2Vol, master);
      console.log('[profile-config] user override saved:', activeSoundId,
        { l1: layer1Vol, l2: layer2Vol, master: master });
    }, 800);
  }

  // CRITICAL: flag за programmatic slider value updates (SEQ-REVEAL animation).
  // На mobile browser-и `slider.value = X` понякога fire-ва 'input' event →
  // onL1Input/onL2Input → setLayer1Volume(animatedValue) → kill-ваше
  // SEQ-REVEAL fade (audio gain се override-ваше с anim value).
  // Сега onL*Input ignore-ва events когато programmaticAnimation === true.
  var programmaticAnimation = false;

  function onL1Input(e) {
    if (programmaticAnimation) return; // SEQ-REVEAL animation е active
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
    scheduleUserOverrideSave();
  }
  function onL2Input(e) {
    if (programmaticAnimation) return;
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
    scheduleUserOverrideSave();
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
    else if (action === 'info') openSoundInfo();
  }

  // SKIP-MIDDLEWARE: bottom sheet с inline инфо за активния звук.
  // Замества SoundDetail screen (премахнато middleware).
  function openSoundInfo() {
    if (!activeSoundId) return;
    var sound = findSound(activeSoundId);
    if (!sound) return;

    var profile = (window.AppState && window.AppState.profile) || 'SS_R';
    var scenario = (window.ProfileConfig && window.ProfileConfig.pickScenarioFromSound)
      ? window.ProfileConfig.pickScenarioFromSound(sound)
      : 'relaxation';

    var title = soundTitle(sound);
    var description = '';
    if (window.i18n && window.i18n.t) {
      var descKey = sound.description_key;
      if (descKey) {
        var d = window.i18n.t(descKey, null);
        if (typeof d === 'string' && d !== descKey && d.indexOf('TODO:') !== 0) {
          description = d;
        }
      }
    }
    if (!description) {
      description = 'Звук от категория ' + (sound.category_audio || 'природа') + '.';
    }

    // P0.2: pass scenario — meditation scenario връща 'none' (per BUG2 spec —
    // 044733a). Без scenario, sheet показваше brown noise за meditation →
    // противоречи на "медитация = само чист звук" promise.
    var recommendedNoise = window.ProfileConfig
      ? window.ProfileConfig.getRecommendedNoise(profile, scenario)
      : 'brown_lp500';
    var noiseLabelText = recommendedNoise === 'none'
      ? 'Без фонов шум (само чист звук)'
      : noiseLabel(recommendedNoise);

    var whyKey = 'profile_results.profiles.' + profile + '.reasons.' + scenario;
    var why = '';
    if (window.i18n && window.i18n.t) {
      var w = window.i18n.t(whyKey, null);
      if (typeof w === 'string' && w !== whyKey && w.indexOf('TODO:') !== 0) why = w;
    }

    var content =
      '<div class="pl-info-sheet">' +
        '<section class="pl-info-section">' +
          '<h3>За звука</h3>' +
          '<p>' + escapeHtml(description) + '</p>' +
        '</section>' +
        '<section class="pl-info-section">' +
          '<h3>Препоръчителен фон за вашия профил</h3>' +
          '<p>' + escapeHtml(noiseLabelText) + '</p>' +
        '</section>' +
        (why
          ? '<section class="pl-info-section">' +
              '<h3>Защо този звук е добър за вас</h3>' +
              '<p>' + escapeHtml(why) + '</p>' +
            '</section>'
          : '') +
      '</div>';

    if (window.BottomSheet && window.BottomSheet.open) {
      window.BottomSheet.open({
        title: title,
        content: content,
        height: 'auto',
        showGrip: true,
        closeOnBackdrop: true
      });
    }
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
  // PROFILE-CONFIG application
  // ============================================================
  // Resolve mix + master volume + noise per profile × scenario × time.
  // User override per soundId takes precedence over matrix defaults.
  function applyProfileConfig(sound) {
    if (!sound || !window.ProfileConfig || !window.ProfileConfig.resolveFor) return;
    var cfg = window.ProfileConfig.resolveFor(sound, sound.id);
    console.log('[profile-config] resolved:', cfg);

    layer1Vol = cfg.layer1Vol;
    layer2Vol = cfg.layer2Vol;
    // Auto-pick recommended noise per profile само ако потребителят не е сменял
    // (не override-ваме existing user choice от NoisePicker)
    if (!cfg.fromOverride && cfg.noise) {
      noiseId = cfg.noise;
      persist(STORAGE_NOISE, noiseId);
    }
    persist(STORAGE_L1_VOL, layer1Vol);
    persist(STORAGE_L2_VOL, layer2Vol);

    // Master volume → AudioEngine.setMasterVolume
    if (window.AudioEngine && window.AudioEngine.setMasterVolume) {
      window.AudioEngine.setMasterVolume(cfg.masterVol);
    }
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
    console.log('[player.open] called with soundId:', soundId);
    if (!soundId) {
      console.warn('[player.open] no soundId given — abort');
      return;
    }
    var sound = findSound(soundId);
    console.log('[player.open] findSound returned:', sound ? sound.id : 'NULL');
    if (!sound) {
      console.warn('[player] sound not found:', soundId, '— manifest loaded?',
        !!(window.AURALIS_MANIFEST && window.AURALIS_MANIFEST.sounds),
        'count:', (window.AURALIS_MANIFEST && window.AURALIS_MANIFEST.sounds || []).length);
      return;
    }

    // SAFETY-3: показваме HeadphonesWarning при първото отваряне.
    if (window.HeadphonesWarning && window.HeadphonesWarning.showIfFirstTime
        && !window.HeadphonesWarning.hasBeenSeen()) {
      console.log('[player.open] HeadphonesWarning first-time → showing sheet');
      window.HeadphonesWarning.showIfFirstTime(function () {
        console.log('[player.open] HeadphonesWarning dismissed → openCore');
        openCore(soundId);
      });
      return;
    }
    console.log('[player.open] direct → openCore');
    try {
      openCore(soundId);
    } catch (e) {
      console.error('[player.open] openCore THREW:', e && e.message, e && e.stack);
    }
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

    // SEQ-REVEAL: layered fade-in pipeline (replaces ad-hoc playLayer1/playLayer2).
    // Маскира audio loading delay + UX educator: чист звук първо, после фон.
    var engine = window.AudioEngine;
    if (engine && engine.playSequentialReveal) {
      var activePreset = engine.getActivePreset ? engine.getActivePreset() : null;
      if (activePreset === soundId) {
        console.log('[player] same preset already playing — skip reveal');
        activeSoundId = soundId;
      } else {
        // Stop old → wait 280ms → SEQ-REVEAL.
        var stopPromise = Promise.resolve();
        if (prevSoundId && prevSoundId !== soundId && engine.stopLayer1) {
          console.log('[player] stopping prev Layer 1:', prevSoundId);
          try { engine.stopLayer1(); } catch (e) {}
          stopPromise = new Promise(function (r) { setTimeout(r, 280); });
        }
        // Get reveal timing per profile.
        var timing = (window.ProfileConfig && window.ProfileConfig.getRevealTiming)
          ? window.ProfileConfig.getRevealTiming(window.AppState && window.AppState.profile)
          : { layer1FadeSec: 2.5, layer2DelaySec: 2.5, layer2FadeSec: 4.0 };
        stopPromise.then(function () {
          if (myToken !== openFlightToken) {
            console.log('[player] flight cancelled (token mismatch):', soundId);
            return;
          }
          activeSoundId = soundId;
          console.log('[player] seq-reveal starting:', soundId, 'noise:', noiseId);
          return engine.playSequentialReveal(soundId, noiseId, timing);
        }).then(function () {
          if (myToken !== openFlightToken) return;
          updatePlayButtonState();
        }).catch(function (err) {
          if (myToken !== openFlightToken) return;
          console.warn('[player] seq-reveal failed:', soundId, err && err.message);
          setPlayButtonIcon(false);
        });
      }
    } else if (engine) {
      // Fallback (старо поведение): директен playLayer1 без reveal.
      activeSoundId = soundId;
      if (engine.playLayer1) engine.playLayer1(soundId).catch(function () {});
      if (noiseId !== 'none' && engine.playLayer2) {
        try { engine.playLayer2(noiseId); } catch (e) {}
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

    // NAV-PLAYER-HOME: попщи stack debug + force home if empty/invalid.
    var s = window.AppState;
    if (!s) return;
    var stackSnapshot = s.phaseHistory ? s.phaseHistory.slice() : [];
    console.log('[player] close — stack BEFORE pop:', stackSnapshot);

    var BLOCK = ['player', 'thi_baseline', 'onboarding', 'quiz', 'results'];
    var back = s.popPhase ? s.popPhase() : null;
    while (back && BLOCK.indexOf(back) !== -1) {
      console.log('[player] skip stale stack entry:', back);
      back = s.popPhase ? s.popPhase() : null;
    }

    // Empty stack ИЛИ unresolved phase → force Home.
    if (!back) {
      back = 'home';
      console.log('[player] empty/blocked stack → force home');
      if (s.clearPhaseHistory) s.clearPhaseHistory();
      if (s.transition) s.transition('home');
    }
    console.log('[player] close → back to:', back, 'stack AFTER:',
      s.phaseHistory ? s.phaseHistory.slice() : []);

    // A2.4: replaceState (не pushState) consume-ва player history entry.
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
    } else {
      // Defensive: render-ерът липсва → force Home transition + render.
      console.warn('[player] no renderer for', back, '→ home fallback');
      if (s.transition) s.transition('home');
      history.replaceState({ phase: 'home' }, '');
      if (window.Home && window.Home.render) window.Home.render();
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

  // ============================================================
  // SEQ-REVEAL slider animation (animated slider при fade-in)
  // ============================================================
  // Listen за audio:reveal-l1 / audio:reveal-l2 → animate native <input>
  // value smoothly от 0 до target за duration ms. Slider thumb визуално
  // расте докато audio gain ramps. Reduce-motion users скачат на target.

  // BUG3: cancel stale slider animations при flight-token mismatch.
  // Без cancel-ване анимациите продължаваха да движат slider thumb-овете
  // дори след user-ът да е tap-нал друг звук.
  var currentL1AnimRAF = null;
  var currentL2AnimRAF = null;
  var currentL1AnimToken = 0;
  var currentL2AnimToken = 0;

  function animateSlider(opts) {
    // opts: { sliderId, fromVal, toVal, durationMs, labelId, animSlot, expectedToken }
    var slider = el(opts.sliderId);
    if (!slider) return;
    var lbl = opts.labelId ? el(opts.labelId) : null;

    // Cancel previous animation on this slot (RAF + token check).
    if (opts.animSlot === 'l1' && currentL1AnimRAF != null) {
      cancelAnimationFrame(currentL1AnimRAF);
      currentL1AnimRAF = null;
    } else if (opts.animSlot === 'l2' && currentL2AnimRAF != null) {
      cancelAnimationFrame(currentL2AnimRAF);
      currentL2AnimRAF = null;
    }

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      programmaticAnimation = true;
      slider.value = opts.toVal;
      if (lbl) lbl.textContent = Math.round(opts.toVal) + '%';
      programmaticAnimation = false;
      return;
    }

    var myAnimToken = (opts.animSlot === 'l1' ? ++currentL1AnimToken : ++currentL2AnimToken);
    var start = performance.now();
    var fromVal = opts.fromVal, toVal = opts.toVal, durationMs = opts.durationMs;

    function step(now) {
      // Abort ако нов animation е started на този slot.
      var activeAnimToken = (opts.animSlot === 'l1' ? currentL1AnimToken : currentL2AnimToken);
      if (myAnimToken !== activeAnimToken) {
        console.log('[reveal-anim] stale token', myAnimToken, 'current:', activeAnimToken, '— abort');
        return;
      }
      // Abort ако flight token се е сменил (нов sound е заявен в engine).
      if (typeof opts.expectedToken === 'number'
          && window.AudioEngine && window.AudioEngine.getCurrentFlightToken
          && window.AudioEngine.getCurrentFlightToken() !== opts.expectedToken) {
        console.log('[reveal-anim] engine flight token changed — abort animation');
        return;
      }
      var elapsed = now - start;
      var progress = Math.min(elapsed / durationMs, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var v = fromVal + (toVal - fromVal) * eased;
      // CRITICAL: set flag за да блокираме onL1/L2Input при този programmatic update.
      programmaticAnimation = true;
      slider.value = v;
      if (lbl) lbl.textContent = Math.round(v) + '%';
      programmaticAnimation = false;
      if (progress < 1) {
        var rafId = requestAnimationFrame(step);
        if (opts.animSlot === 'l1') currentL1AnimRAF = rafId;
        else currentL2AnimRAF = rafId;
      } else {
        if (opts.animSlot === 'l1') currentL1AnimRAF = null;
        else currentL2AnimRAF = null;
      }
    }
    var rafId = requestAnimationFrame(step);
    if (opts.animSlot === 'l1') currentL1AnimRAF = rafId;
    else currentL2AnimRAF = rafId;
  }

  window.addEventListener('audio:reveal-l1', function (e) {
    if (!e || !e.detail) return;
    var token = (window.AudioEngine && window.AudioEngine.getCurrentFlightToken)
      ? window.AudioEngine.getCurrentFlightToken() : null;
    animateSlider({
      sliderId: 'plL1', labelId: 'plL1Value', animSlot: 'l1',
      fromVal: 0, toVal: e.detail.targetVol, durationMs: e.detail.duration,
      expectedToken: token
    });
  });
  window.addEventListener('audio:reveal-l2', function (e) {
    if (!e || !e.detail) return;
    var token = (window.AudioEngine && window.AudioEngine.getCurrentFlightToken)
      ? window.AudioEngine.getCurrentFlightToken() : null;
    animateSlider({
      sliderId: 'plL2', labelId: 'plL2Value', animSlot: 'l2',
      fromVal: 0, toVal: e.detail.targetVol, durationMs: e.detail.duration,
      expectedToken: token
    });
  });

  return {
    open: open,
    close: close,
    render: render
  };
})();
