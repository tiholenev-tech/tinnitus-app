/**
 * AURALIS Calm — full-screen meditation player
 * ===============================================
 * Per BIBLE v3 §G:
 *  - Calm = подкатегория на Library (НЕ отделен модул в navigation)
 *  - Full-screen player при tap на meditation card (НЕ mini player)
 *  - Audio с loop=false → onended event → auto-close back to Library
 *  - Large progress bar за дълги дъсчини (5-30 мин)
 *
 * Public API:
 *   Calm.open(soundId)  — start meditation playback + render player
 *   Calm.close()        — stop audio + back to Library
 *   Calm.render()       — router hook (rare — само ако page reload-not-recovered)
 */

window.Calm = (function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================

  var activeSoundId = null;
  var progressTickId = null;
  var soundEndedHandler = null;
  var endedShown = false;
  var endedCloseTimer = null;

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

  function fmtTime(sec) {
    if (!sec || sec < 0 || !isFinite(sec)) return '0:00';
    sec = Math.floor(sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function findSound(soundId) {
    if (!window.Library || !window.Library.getSoundById) {
      // Library.getSoundById не съществува — резервно търсене през getPlayingSound
      var ps = window.Library && window.Library.getPlayingSound ? window.Library.getPlayingSound() : null;
      return ps && ps.id === soundId ? ps : null;
    }
    return window.Library.getSoundById(soundId);
  }

  function soundTitle(sound) {
    return sound ? t(sound.title_key, sound.bg_title || sound.id) : '';
  }

  function soundSubtitle(sound) {
    return sound ? t(sound.subtitle_key, sound.category || '') : '';
  }

  function soundAuthor(sound) {
    if (!sound || !sound.author_key) return '';
    return t(sound.author_key, '');
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
  }

  function svgPlay() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  }

  function svgPause() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>' +
      '<rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';
  }

  function buildPlayerHtml(sound, isPlaying) {
    var title = soundTitle(sound);
    var subtitle = soundSubtitle(sound);
    var author = soundAuthor(sound);
    var duration = (sound && sound.duration_sec) ? sound.duration_sec : 0;
    var categoryLabel = t('calm.categoryLabel', 'Медитация');
    var closeAria = t('calm.closeAria', 'Затвори плеъра');
    var playAria = isPlaying
      ? t('calm.pauseAria', 'Пауза')
      : t('calm.playAria', 'Пусни');

    return (
      '<div class="calm-screen" data-screen="calm"' +
        ' role="region" aria-label="' + escapeHtml(t('calm.playerAria', 'Плеър за медитация')) + '">' +

        '<button class="calm-close" type="button" data-action="close"' +
          ' aria-label="' + escapeHtml(closeAria) + '">' + svgClose() + '</button>' +

        '<div class="calm-category">' + escapeHtml(categoryLabel) + '</div>' +

        '<div class="calm-art" aria-hidden="true">' +
          '<div class="calm-art-orb"></div>' +
        '</div>' +

        '<div class="calm-info">' +
          '<h1 class="calm-title">' + escapeHtml(title) + '</h1>' +
          (author ? '<div class="calm-author">' + escapeHtml(author) + '</div>' : '') +
          '<div class="calm-subtitle">' + escapeHtml(subtitle) + '</div>' +
        '</div>' +

        '<div class="calm-progress">' +
          '<div class="calm-progress-bar" role="progressbar"' +
            ' aria-valuemin="0" aria-valuemax="' + duration + '" aria-valuenow="0">' +
            '<div class="calm-progress-fill" id="calmProgressFill" style="width: 0%"></div>' +
          '</div>' +
          '<div class="calm-progress-times">' +
            '<span id="calmCurTime">0:00</span>' +
            '<span id="calmTotalTime">' + fmtTime(duration) + '</span>' +
          '</div>' +
        '</div>' +

        '<button class="calm-play-btn" type="button" data-action="toggle"' +
          ' aria-label="' + escapeHtml(playAria) + '">' +
          (isPlaying ? svgPause() : svgPlay()) +
        '</button>' +
      '</div>'
    );
  }

  function buildEndedHtml(sound) {
    return (
      '<div class="calm-screen calm-screen--ended" data-screen="calm-ended">' +
        '<div class="calm-ended-orb" aria-hidden="true"></div>' +
        '<h1 class="calm-ended-title">' +
          escapeHtml(t('calm.ended', 'Завършена')) +
        '</h1>' +
        '<div class="calm-ended-sub">' +
          escapeHtml(t('calm.endedSub', 'Връщане към библиотеката...')) +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Progress tick
  // ============================================================

  function startProgressTick() {
    stopProgressTick();
    progressTickId = setInterval(updateProgress, 250);
  }

  function stopProgressTick() {
    if (progressTickId) {
      clearInterval(progressTickId);
      progressTickId = null;
    }
  }

  function updateProgress() {
    if (!window.AudioEngine || !window.AudioEngine.getPlaybackInfo) return;
    var info = window.AudioEngine.getPlaybackInfo();
    if (!info || info.presetId !== activeSoundId) {
      stopProgressTick();
      return;
    }
    var fill = el('calmProgressFill');
    var curEl = el('calmCurTime');
    if (info.duration > 0) {
      var pct = Math.min(100, (info.currentTime / info.duration) * 100);
      if (fill) fill.style.width = pct.toFixed(1) + '%';
    }
    if (curEl) curEl.textContent = fmtTime(info.currentTime);
  }

  // ============================================================
  // 'auralis-sound-ended' listener
  // ============================================================

  function onSoundEnded(e) {
    if (!e.detail || e.detail.presetId !== activeSoundId) return;
    showEndedScreen();
  }

  function showEndedScreen() {
    if (endedShown) return;
    endedShown = true;
    stopProgressTick();
    var app = el('app');
    if (app) app.innerHTML = buildEndedHtml(findSound(activeSoundId));
    endedCloseTimer = setTimeout(close, 2500);
  }

  // ============================================================
  // Open / close
  // ============================================================

  function open(soundId) {
    var sound = findSound(soundId);
    if (!sound) {
      console.warn('[calm] sound not found:', soundId);
      return;
    }
    activeSoundId = soundId;
    endedShown = false;

    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('calm');
    }
    history.pushState({ phase: 'calm', soundId: soundId }, '');

    var app = el('app');
    if (app) {
      app.innerHTML = buildPlayerHtml(sound, true);
      bindEvents(app);
    }

    // Subscribe към sound-ended ПРЕДИ да започнем playback
    if (!soundEndedHandler) {
      soundEndedHandler = onSoundEnded;
      window.addEventListener('auralis-sound-ended', soundEndedHandler);
    }

    // Start playback (loop=false)
    if (window.AudioEngine && window.AudioEngine.playUrl) {
      if (sound.filename === '__runtime_pink__') {
        // Pink not really meditation, но защита
        window.AudioEngine.play('brown_noise');
      } else {
        var url = 'library_staging_loop_ready/' + sound.filename;
        window.AudioEngine.playUrl(soundId, url, { loop: false }).catch(function (err) {
          console.error('[calm] play failed:', soundId, err);
          showMissingFileMessage();
        });
      }
    }

    startProgressTick();
  }

  function showMissingFileMessage() {
    stopProgressTick();
    var app = el('app');
    if (!app) return;
    var msg = t('calm.missingFile',
      'Аудио файлът липсва (placeholder за UI development).');
    var sound = findSound(activeSoundId);
    app.innerHTML = (
      '<div class="calm-screen" data-screen="calm-missing">' +
        '<button class="calm-close" type="button" data-action="close"' +
          ' aria-label="' + escapeHtml(t('calm.closeAria', 'Затвори')) + '">' +
          svgClose() +
        '</button>' +
        '<div class="calm-category">' +
          escapeHtml(t('calm.categoryLabel', 'Медитация')) +
        '</div>' +
        '<div class="calm-art" aria-hidden="true"><div class="calm-art-orb"></div></div>' +
        '<div class="calm-info">' +
          '<h1 class="calm-title">' + escapeHtml(soundTitle(sound)) + '</h1>' +
          '<div class="calm-author">' + escapeHtml(soundAuthor(sound)) + '</div>' +
        '</div>' +
        '<div class="calm-missing-msg">' + escapeHtml(msg) + '</div>' +
      '</div>'
    );
    bindEvents(app);
  }

  function close() {
    stopProgressTick();
    if (endedCloseTimer) { clearTimeout(endedCloseTimer); endedCloseTimer = null; }
    if (soundEndedHandler) {
      window.removeEventListener('auralis-sound-ended', soundEndedHandler);
      soundEndedHandler = null;
    }
    // Stop audio при manual close (не on natural end — там вече се изчистено)
    if (!endedShown && window.AudioEngine && window.AudioEngine.pause) {
      window.AudioEngine.pause();
    }
    activeSoundId = null;
    endedShown = false;

    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('library');
    }
    history.pushState({ phase: 'library' }, '');
    if (window.Library && window.Library.render) {
      window.Library.render();
    }
  }

  // ============================================================
  // Render (router hook — rare; popstate landing)
  // ============================================================

  function render() {
    // Ако нямаме активна meditation → fallback към Library
    if (!activeSoundId) {
      if (window.Library && window.Library.render) window.Library.render();
      return;
    }
    var sound = findSound(activeSoundId);
    if (!sound) {
      close();
      return;
    }
    var app = el('app');
    if (app) {
      app.innerHTML = buildPlayerHtml(sound, true);
      bindEvents(app);
    }
    startProgressTick();
  }

  function bindEvents(container) {
    container.addEventListener('click', onClick);
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'close') close();
    else if (action === 'toggle') {
      // Toggle play/pause без да напуска screen
      if (!window.AudioEngine) return;
      if (window.AudioEngine.isPlaying()) {
        window.AudioEngine.pause();
        stopProgressTick();
        var btn = container.querySelector('.calm-play-btn');
        if (btn) {
          btn.innerHTML = svgPlay();
          btn.setAttribute('aria-label', t('calm.playAria', 'Пусни'));
        }
      } else {
        // Restart playback
        if (activeSoundId) open(activeSoundId);
      }
    }
  }

  return {
    open: open,
    close: close,
    render: render
  };
})();
