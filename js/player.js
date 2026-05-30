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

  // PACK A change 4 (refined): описателни БГ имена базирани на character на звука,
  // не на технически параметри. Source: docs/content/code3/sound_recommendations_bg.md
  // + docs/content/AURALIS_PROFILE_ADVICE_v1.md.
  //
  // Pink noise (1/f spectrum) — равен спектър, прилича на постоянен дъжд.
  //   pure   = най-широк, най-ясен
  //   lp4000 = леко приглушен (оптимален за тинитус — научно потвърдено)
  //   lp2000 = по-силно приглушен, фокусиран нискочестотно
  //
  // Brown noise (1/f² spectrum) — bass-heavy, прилича на океан rumble.
  //   pure   = плътен, без филтър
  //   lp1000 = топъл, леко филтриран (за релакс)
  //   lp500  = най-дълбок (за сън + SOS)
  var NOISE_LABEL_BG = {
    'none':         'Без фон',
    'pink_pure':    'Ясен розов шум',
    'pink_lp2000':  'Приглушен розов шум',
    'pink_lp4000':  'Мек розов шум',
    'brown_pure':   'Плътен кафяв шум',
    'brown_lp1000': 'Топъл кафяв шум',
    'brown_lp500':  'Дълбок кафяв шум',
    'green_noise':  'Зелен шум'
  };
  function noiseLabel(id) {
    if (NOISE_LABEL_BG[id]) return NOISE_LABEL_BG[id];
    // Fallback: i18n key или generic "Фонов шум"
    if (window.i18n && window.i18n.t) {
      var v = window.i18n.t('noises.' + id + '.title', null);
      if (typeof v === 'string' && v.indexOf('noises.') !== 0 && v.indexOf('TODO') !== 0) return v;
    }
    return 'Фонов шум';
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
    // PACK A change 1: heart outline (unfavorited) + heart filled (favorited).
    heartOutline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    heartFilled: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    // PACK A change 2: alert icon за нов SOS бутон с текст (вместо heart).
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
      '<line x1="12" y1="9" x2="12" y2="13"/>' +
      '<line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
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

  // PACK C T3: notch indicator pill (показва се в Layer 1 заглавието).
  // Кратък champagne badge с честотата + tooltip за accessibility.
  function buildNotchIndicator() {
    var info = (window.AudioEngine && window.AudioEngine.getNotchInfo)
      ? window.AudioEngine.getNotchInfo() : null;
    if (!info || !info.active || !info.freq) return '';
    var freqLabel = info.freq >= 1000
      ? (info.freq / 1000).toFixed(1).replace(/\.0$/, '') + ' kHz'
      : info.freq + ' Hz';
    var aria = t('player.notch.aria',
      'Лична честотна терапия активна — {freq} премахната',
      { freq: freqLabel });
    return (
      '<span class="pl-notch-pill" title="' + escapeHtml(aria) + '"' +
        ' aria-label="' + escapeHtml(aria) + '">' +
        '<svg class="pl-notch-icon" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M4 12h4l3-8 3 16 3-8h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>' +
        '<span class="pl-notch-freq">' + escapeHtml(freqLabel) + '</span>' +
      '</span>'
    );
  }

  function buildSlider(id, label, value, ariaLabel) {
    // PACK A change 5: премахнат visible "65%" текст. ARIA aria-valuenow
    // запазва accessibility за screen readers. Анимациите от SEQ-REVEAL
    // продължават да update-ват slider.value без visible label.
    // Hidden span остава за internal animation hook (не показва UI текст).
    return (
      '<div class="pl-slider-row">' +
        '<div class="pl-slider-head">' +
          '<span class="pl-slider-label">' + escapeHtml(label) + '</span>' +
        '</div>' +
        '<input type="range" class="pl-slider" id="' + id + '"' +
          ' min="0" max="100" step="1" value="' + value + '"' +
          ' aria-label="' + escapeHtml(ariaLabel) + '"' +
          ' aria-valuenow="' + value + '">' +
        '<span class="pl-slider-value-hidden" id="' + id + 'Value" aria-hidden="true" hidden>' + value + '%</span>' +
      '</div>'
    );
  }

  // Вертикален „обща сила" плъзгач отстрани (Тихол: баща му „всичко е тихо").
  // Двата хоризонтални плъзгача = балансът между звуците; този = общата сила.
  function buildMasterVol() {
    var vol = (window.AudioEngine && window.AudioEngine.getMasterVolume)
      ? window.AudioEngine.getMasterVolume() : 70;
    return (
      '<div class="pl-master" aria-label="Обща сила на звука">' +
        '<span class="pl-master-icon" aria-hidden="true">' + SVG.speaker + '</span>' +
        '<input type="range" class="pl-master-slider" id="plMaster"' +
          ' min="0" max="100" step="1" value="' + vol + '"' +
          ' orient="vertical"' +
          ' aria-label="Обща сила на звука 0-100" aria-valuenow="' + vol + '">' +
        '<span class="pl-master-plus" aria-hidden="true">+</span>' +
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
    // PACK A change 1: favorite state определя heart icon variant + aria.
    var isFav = !!(window.Favorites && window.Favorites.has &&
      sound && window.Favorites.has(sound.id));
    var favAria = isFav ? 'Премахни от любими' : 'Добави в любими';

    return (
      '<div class="pl-screen" data-screen="player"' +
        ' role="region" aria-label="' + escapeHtml(title) + '">' +

        buildMasterVol() +

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

        // PLAYER-ART: category-specific анимация вместо generic orb.
        // PlayerArt.build връща full <div class="pl-art pa-<variant>">...</div>.
        // Fallback на orb ако модулът липсва.
        ((window.PlayerArt && window.PlayerArt.build)
          ? window.PlayerArt.build(sound)
          : '<div class="pl-art" aria-hidden="true"><div class="pl-art-orb"></div></div>') +

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
              // PACK C T3: notch indicator (champagne pill) — показва се само
              // когато notch активен (има pitch data + не disabled).
              buildNotchIndicator() +
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

        // PACK A: row 1 — favorite (heart) + play/pause + sleep timer (moon).
        // Heart icon вече toggle-ва favorite (не стартира SOS).
        '<div class="pl-controls">' +
          '<button class="pl-ctrl pl-ctrl--secondary pl-ctrl--fav' +
            (isFav ? ' is-fav' : '') + '" type="button" data-action="favorite"' +
            ' aria-label="' + escapeHtml(favAria) + '"' +
            ' aria-pressed="' + (isFav ? 'true' : 'false') + '">' +
            (isFav ? SVG.heartFilled : SVG.heartOutline) +
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

        // PACK A row 2 — SOS бутон с БГ текст (champagne, не червено).
        '<div class="pl-sos-row">' +
          '<button class="pl-sos-btn" type="button" data-action="sos"' +
            ' aria-label="' + escapeHtml(sosAria) + '">' +
            '<span class="pl-sos-icon" aria-hidden="true">' + SVG.alert + '</span>' +
            '<span class="pl-sos-text">' +
              '<span class="pl-sos-title">При паник атака · SOS</span>' +
              '<span class="pl-sos-sub">Дихателно упражнение, 60 сек</span>' +
            '</span>' +
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

  // P0 SLIDER-CLICK v2: isFinal pattern (replaces rAF throttle).
  //
  // 'input' event (drag в process) → setLayer*Volume(v, false) → direct
  // gain.value = X (no ramp, no overlap, no race condition).
  // 'change' event (slider release) → setLayer*Volume(v, true) → anchored
  // 50ms ramp за smooth final value.
  //
  // PLUS: localStorage.setItem дебоунсван (300ms) — fragmentation на main
  // thread при всеки input event causes audio underruns → clicks.
  var l1PersistTimer = null;
  var l2PersistTimer = null;

  function onL1Input(e) {
    if (programmaticAnimation) return; // SEQ-REVEAL animation е active
    var v = parseInt(e.currentTarget.value, 10);
    if (isNaN(v)) return;
    layer1Vol = Math.max(0, Math.min(100, v));
    var lbl = el('plL1Value');
    if (lbl) lbl.textContent = layer1Vol + '%';
    if (window.AudioEngine && window.AudioEngine.setLayer1Volume) {
      window.AudioEngine.setLayer1Volume(layer1Vol, e.type === 'change');
    }
    // Debounce localStorage save — НЕ блокирай main thread на всеки input.
    if (l1PersistTimer) clearTimeout(l1PersistTimer);
    l1PersistTimer = setTimeout(function () {
      l1PersistTimer = null;
      persist(STORAGE_L1_VOL, layer1Vol);
    }, 300);
    if (e.type === 'change') {
      checkVolumeWarning(layer1Vol);
      scheduleUserOverrideSave();
    }
  }
  function onL2Input(e) {
    if (programmaticAnimation) return;
    var v = parseInt(e.currentTarget.value, 10);
    if (isNaN(v)) return;
    layer2Vol = Math.max(0, Math.min(100, v));
    var lbl = el('plL2Value');
    if (lbl) lbl.textContent = layer2Vol + '%';
    if (window.AudioEngine && window.AudioEngine.setLayer2Volume) {
      window.AudioEngine.setLayer2Volume(layer2Vol, e.type === 'change');
    }
    if (l2PersistTimer) clearTimeout(l2PersistTimer);
    l2PersistTimer = setTimeout(function () {
      l2PersistTimer = null;
      persist(STORAGE_L2_VOL, layer2Vol);
    }, 300);
    if (e.type === 'change') {
      checkVolumeWarning(layer2Vol);
      scheduleUserOverrideSave();
    }
  }

  // Обща сила (master) — пише в същия ключ като Home slider-а → синхронни.
  var masterPersistTimer = null;
  function onMasterInput(e) {
    var v = parseInt(e.currentTarget.value, 10);
    if (isNaN(v)) return;
    v = Math.max(0, Math.min(100, v));
    if (window.AudioEngine && window.AudioEngine.setMasterVolume) {
      window.AudioEngine.setMasterVolume(v, e.type === 'change');
    }
    if (masterPersistTimer) clearTimeout(masterPersistTimer);
    masterPersistTimer = setTimeout(function () {
      masterPersistTimer = null;
      persist('auralis-master-volume', v);
    }, 300);
    if (e.type === 'change') { checkVolumeWarning(v); scheduleUserOverrideSave(); }
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'back') close();
    else if (action === 'toggle') togglePlayPause();
    else if (action === 'open-noise') openNoisePicker();
    else if (action === 'sleep') openSleepTimerSheet();
    else if (action === 'sos') openSos();
    else if (action === 'info') openSoundInfo();
    else if (action === 'favorite') toggleFavorite();
  }

  // PACK A change 1: heart icon → toggle favorite за активния звук.
  function toggleFavorite() {
    if (!activeSoundId || !window.Favorites || !window.Favorites.toggle) return;
    var sound = findSound(activeSoundId);
    var metadata = sound ? {
      category: sound.category_audio,
      title: sound.bg_title || sound.id
    } : {};
    var nowFav = window.Favorites.toggle(activeSoundId, metadata);
    // Update bottom button visual state без full re-render.
    var btn = document.querySelector('.pl-ctrl--fav');
    if (btn) {
      btn.classList.toggle('is-fav', nowFav);
      btn.setAttribute('aria-pressed', nowFav ? 'true' : 'false');
      btn.setAttribute('aria-label', nowFav ? 'Премахни от любими' : 'Добави в любими');
      btn.innerHTML = nowFav ? SVG.heartFilled : SVG.heartOutline;
    }
    if (window.Toast) {
      var msg = nowFav ? 'Добавен в любими' : 'Премахнат от любими';
      if (window.Toast.success) window.Toast.success(msg);
      else if (window.Toast.show) window.Toast.show(msg, { durationMs: 1800 });
    }
    if (window.Haptics && window.Haptics.light) window.Haptics.light();
  }

  // PACK A change 3: sleep timer bottom sheet с 4 preset + ръчна опция.
  function openSleepTimerSheet() {
    var current = (window.AudioEngine && window.AudioEngine.getSleepTimerInfo)
      ? window.AudioEngine.getSleepTimerInfo() : { active: false, totalMinutes: 0 };
    var activeMin = current.active ? current.totalMinutes : 0;

    var presets = [
      { mins: 15,  label: '15 минути' },
      { mins: 30,  label: '30 минути' },
      { mins: 60,  label: '1 час' },
      { mins: 480, label: '8 часа (цяла нощ)' }
    ];

    var presetHtml = presets.map(function (p) {
      var checked = (activeMin === p.mins) ? ' checked' : '';
      return (
        '<label class="pl-sleep-opt">' +
          '<input type="radio" name="pl-sleep" value="' + p.mins + '"' + checked + '>' +
          '<span class="pl-sleep-opt-label">' + escapeHtml(p.label) + '</span>' +
        '</label>'
      );
    }).join('');

    // Detect ако активното време е custom (не съвпада с preset).
    var presetMins = presets.map(function (p) { return p.mins; });
    var isCustomActive = activeMin > 0 && presetMins.indexOf(activeMin) === -1;
    var customVal = isCustomActive ? activeMin : '';
    var customChecked = isCustomActive ? ' checked' : '';

    var content =
      '<div class="pl-sleep-sheet">' +
        presetHtml +
        '<div class="pl-sleep-divider" aria-hidden="true"></div>' +
        '<label class="pl-sleep-opt pl-sleep-opt--manual">' +
          '<input type="radio" name="pl-sleep" value="manual"' + customChecked + ' id="plSleepManualRadio">' +
          '<span class="pl-sleep-opt-label">Ръчно:</span>' +
          '<input type="number" id="plSleepManualInput" class="pl-sleep-manual-input"' +
            ' min="1" max="480" step="1" placeholder="мин."' +
            ' value="' + customVal + '"' +
            ' aria-label="Ръчна продължителност в минути (1 до 480)">' +
          '<span class="pl-sleep-opt-unit">мин.</span>' +
        '</label>' +
        '<div class="pl-sleep-actions">' +
          (activeMin > 0
            ? '<button class="pl-sleep-btn pl-sleep-btn--ghost" type="button" data-sleep-action="cancel">Отмени таймер</button>'
            : '') +
          '<button class="pl-sleep-btn pl-sleep-btn--primary" type="button" data-sleep-action="apply">Запази</button>' +
        '</div>' +
      '</div>';

    if (window.BottomSheet && window.BottomSheet.open) {
      window.BottomSheet.open({
        title: 'Таймер за сън',
        content: content,
        height: 'auto',
        showGrip: true,
        closeOnBackdrop: true
      });
      // Bind sheet-specific interactions след next tick (sheet DOM mounted).
      setTimeout(bindSleepTimerSheet, 50);
    } else if (window.Sleep && window.Sleep.open) {
      window.Sleep.open();
    }
  }

  function bindSleepTimerSheet() {
    var sheet = document.querySelector('.pl-sleep-sheet');
    if (!sheet) return;

    // Manual input focus → auto-select радио бутона.
    var manualInput = document.getElementById('plSleepManualInput');
    var manualRadio = document.getElementById('plSleepManualRadio');
    if (manualInput && manualRadio) {
      manualInput.addEventListener('focus', function () {
        manualRadio.checked = true;
      });
      manualInput.addEventListener('input', function () {
        manualRadio.checked = true;
        // Soft validation visual
        var v = parseInt(manualInput.value, 10);
        if (!isNaN(v) && (v < 1 || v > 480)) {
          manualInput.classList.add('is-invalid');
        } else {
          manualInput.classList.remove('is-invalid');
        }
      });
    }

    // Apply / cancel buttons.
    sheet.addEventListener('click', function (e) {
      var actBtn = e.target.closest('[data-sleep-action]');
      if (!actBtn) return;
      var act = actBtn.getAttribute('data-sleep-action');
      if (act === 'cancel') {
        if (window.AudioEngine && window.AudioEngine.cancelSleepTimer) {
          window.AudioEngine.cancelSleepTimer();
        }
        if (window.Toast && window.Toast.show) {
          window.Toast.show('Таймерът е отменен', { durationMs: 1800 });
        }
        if (window.BottomSheet && window.BottomSheet.close) window.BottomSheet.close();
        return;
      }
      if (act === 'apply') {
        var selected = sheet.querySelector('input[name="pl-sleep"]:checked');
        if (!selected) {
          if (window.Toast && window.Toast.show) {
            window.Toast.show('Изберете време', { durationMs: 1500 });
          }
          return;
        }
        var minutes = 0;
        if (selected.value === 'manual') {
          var raw = manualInput ? parseInt(manualInput.value, 10) : NaN;
          if (isNaN(raw) || raw < 1 || raw > 480) {
            if (window.Toast && window.Toast.show) {
              window.Toast.show('Въведете число между 1 и 480', { durationMs: 2200 });
            }
            if (manualInput) manualInput.classList.add('is-invalid');
            return;
          }
          minutes = raw;
        } else {
          minutes = parseInt(selected.value, 10);
        }
        if (window.AudioEngine && window.AudioEngine.setSleepTimer) {
          window.AudioEngine.setSleepTimer(minutes);
        }
        if (window.Toast && window.Toast.success) {
          window.Toast.success('Таймер: ' + minutes + ' мин.');
        } else if (window.Toast && window.Toast.show) {
          window.Toast.show('Таймер: ' + minutes + ' мин.', { durationMs: 1800 });
        }
        if (window.BottomSheet && window.BottomSheet.close) window.BottomSheet.close();
      }
    });
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
    // Phone test fix: ВИНАГИ apply cfg.noise. Преди това fromOverride flag
    // (volume override) skip-ваше noise auto-pick → ако предишен sound
    // беше meditation (noise='none' persisted), отварянето на rain sound
    // с volume override запазваше noise='none'. Override е САМО за volume —
    // noise selection трябва да следва profile/category за всяка нова сесия.
    // User може да override-не chosen noise чрез NoisePicker след това.
    if (cfg.noise) {
      noiseId = cfg.noise;
      persist(STORAGE_NOISE, noiseId);
    }
    persist(STORAGE_L1_VOL, layer1Vol);
    persist(STORAGE_L2_VOL, layer2Vol);

    // Master volume → AudioEngine.setMasterVolume.
    // „По-силен default" (Тихол): профилните таргети (35–70) през кривата
    // звучат тихо. Под для не падаме под 60 при default (само ако НЕ е user
    // override — изричният избор на потребителя се пази). Потребителят може
    // да усили/намали с новия вертикален master плъзгач.
    var masterVol = cfg.masterVol;
    if (!cfg.fromOverride) masterVol = Math.max(masterVol, 60);
    if (window.AudioEngine && window.AudioEngine.setMasterVolume) {
      window.AudioEngine.setMasterVolume(masterVol);
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
    var master = container.querySelector('#plMaster');
    if (master) {
      master.addEventListener('input', onMasterInput);
      master.addEventListener('change', onMasterInput);
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
      // NAV-LISTENER-LEAK fix: clone-and-replace #app преди да закачаме нашия
      // click listener. innerHTML смята само децата — стария listener от
      // предишния модул (CategoryView/Home/Library/etc.) ОСТАВА на #app и
      // двойно fire-ва handler-ите (e.g. UI back → 2× history.back → home).
      var fresh = app.cloneNode(false);
      app.parentNode.replaceChild(fresh, app);
      app = fresh;
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

    // Mix-hint popup при ВСЕКИ нов звук (Тихол) — напомня за точката на
    // смесване. Показва се само при НОВ звук (не при re-open на същия).
    if (soundId !== prevSoundId) showMixHint();

    startProgressTick();
  }

  // Friendly mix-hint popup (70+: голям шрифт). Стои по-дълго от стандартен toast
  // (~14с) за спокойно четене, после се маха само̀; X / „Разбрах" затварят по-рано;
  // „Не показвай повече" → повече не се показва (persist флаг).
  var MIX_HINT_MS = 14000;
  var MIX_HINT_HIDDEN_KEY = 'auralis-mixhint-hidden';
  function showMixHint() {
    try { if (localStorage.getItem(MIX_HINT_HIDDEN_KEY) === '1') return; } catch (e) {}
    var old = document.getElementById('mixHintOverlay');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var ov = document.createElement('div');
    ov.id = 'mixHintOverlay';
    ov.className = 'mix-hint-overlay';
    ov.innerHTML =
      '<div class="mix-hint-card" role="dialog" aria-label="Съвет за силата">' +
        '<button class="mix-hint-x" type="button" aria-label="Затвори" data-mixhint="ok">×</button>' +
        '<div class="mix-hint-emoji" aria-hidden="true">💛</div>' +
        '<h2 class="mix-hint-title">Малък съвет за Вас</h2>' +
        '<p class="mix-hint-body">Нагласете силата и микса както Ви е приятно — ' +
          '<b>Вие решавате</b>.</p>' +
        '<p class="mix-hint-body">За най-силен ефект и за да отслабва шумът с времето, ' +
          'оставете звука да <b>не заглушава напълно</b> Вашия тинитус — добре е леко ' +
          'да чувате и него под звука.</p>' +
        '<button class="mix-hint-ok" type="button" data-mixhint="ok">Разбрах</button>' +
        '<button class="mix-hint-never" type="button" data-mixhint="never">Не показвай повече</button>' +
      '</div>';
    document.body.appendChild(ov);
    var timer = setTimeout(close, MIX_HINT_MS);
    function close() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (ov.parentNode) ov.parentNode.removeChild(ov);
    }
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mixhint]');
      if (!b) return;
      if (b.getAttribute('data-mixhint') === 'never') {
        try { localStorage.setItem(MIX_HINT_HIDDEN_KEY, '1'); } catch (x) {}
      }
      close();
    });
  }

  // NAV-PARITY: audio cleanup отделен в idempotent функция — извиква се от:
  //   1. close() (UI back бутон) — после прави history.back()
  //   2. app.js popstate handler — когато системната Android стрелка напуска
  //      player phase (без да минава през close())
  // Phone test (Тихол): преди тoзi split UI back прескачаше category, а
  // системната стрелка работеше nav но оставяше audio orphan (свирещ на фон
  // без UI). Сега двата пътя са идентични — audio cleanup + history.back().
  //
  // Idempotent guard: ако activeSoundId е null и нямa subscriber, return.
  // Втори call (popstate след close) → no-op.
  function stopAudioAndCleanup() {
    if (!activeSoundId && !noiseChangedHandler) return;

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
    // Д4: HARD STOP двата слоя — иначе orphan playback (audio на фон без UI).
    if (window.AudioEngine) {
      if (window.AudioEngine.stopLayer1) {
        try { window.AudioEngine.stopLayer1(); } catch (e) {}
      }
      if (window.AudioEngine.stopLayer2) {
        try { window.AudioEngine.stopLayer2(); } catch (e) {}
      }
      if (!window.AudioEngine.stopLayer1 && window.AudioEngine.pause) {
        try { window.AudioEngine.pause(); } catch (e) {}
      }
    }
    activeSoundId = null;
  }

  function close() {
    stopAudioAndCleanup();

    // NAV-UNIFY v2: НИЩО друго преди history.back() — точно както системната
    // Android стрелка би работила. Преди това close() викаше popPhase() и
    // transition() които corrupt-ваха state.current → popstate handler-ът
    // route-ваше неправилно (към home вместо category). Премахнато всичко
    // което системната стрелка НЕ прави — само audio cleanup + history.back().
    var snapshotLen = window.history ? window.history.length : 0;
    console.log('[player] close — history.length:', snapshotLen);

    if (window.history && window.history.length > 1) {
      history.back();
      return;
    }

    // Fallback: PWA reload landed directly на player history entry (length=1).
    // Нямa предишен entry → force home.
    console.log('[player] empty history → force home');
    var s = window.AppState;
    if (s && s.transition) s.transition('home');
    if (s && s.clearPhaseHistory) s.clearPhaseHistory();
    history.replaceState({ phase: 'home' }, '');
    if (window.Home && window.Home.render) window.Home.render();
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
      // NAV-LISTENER-LEAK fix (виж openCore коментара).
      var fresh = app.cloneNode(false);
      app.parentNode.replaceChild(fresh, app);
      app = fresh;
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
    render: render,
    // For app.js popstate handler — извикан когато системната Android стрелка
    // напуска player phase. Stop audio + clean module state без history mutation.
    stopAudioAndCleanup: stopAudioAndCleanup
  };
})();
