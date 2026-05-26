/**
 * AURALIS Library v1.0 — главен пост-quiz екран
 * ================================================
 * Per BIBLE v3 §11: заменя 5-preset Mixer като primary entry point.
 *
 * Source of truth:
 *   audio/library/manifest.json (production, генериран от tools/build_manifest.py)
 *   audio/library/manifest_template.json (development fallback при липса)
 *
 * Public API (window.Library):
 *   Library.render()              — main render
 *   Library.openSound(soundId)    — play sound
 *   Library.search(query)         — filter results
 *   Library.toggleFavorite(id)    — add/remove favorite
 *   Library.getFavorites()        — array of soundIds
 *   Library.getPlayingSound()     — current sound or null
 *
 * Design: chat.php 1:1 (glass cards, neumorphism light, blur dark, Montserrat).
 * Audio: ползва window.AudioEngine за playback.
 */

window.Library = (function () {
  'use strict';

  var STORAGE_FAVORITES = 'auralis_library_favorites';
  var MANIFEST_URL = 'audio/library/manifest.json';
  var MANIFEST_FALLBACK = 'audio/library/manifest_template.json';

  // ============================================================
  // STATE
  // ============================================================

  var manifest = null;           // loaded once, cached
  var manifestLoadPromise = null;
  var activeFilter = 'all';      // category filter (or 'favorites')
  var searchQuery = '';
  var favorites = loadFavorites();

  // ============================================================
  // SVG icons (chat.php style: stroke-based, currentColor)
  // ============================================================

  var SVG = {
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
      '</svg>',
    clear:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>',
    heart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
      '</svg>',
    heartFilled:
      '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
      '</svg>',
    play:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<polygon points="6,4 20,12 6,20" fill="currentColor"/>' +
      '</svg>',
    pause:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>' +
        '<rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>' +
      '</svg>',
    next:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polygon points="5 4 15 12 5 20 5 4" fill="currentColor"/>' +
        '<line x1="19" y1="5" x2="19" y2="19"/>' +
      '</svg>',
    chevron:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="9 18 15 12 9 6"/>' +
      '</svg>',
    // Category icons (minimal stroke-based, no emoji per Bible)
    cat: {
      wave:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>',
      rain:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 13a4 4 0 0 0-8 0v1H6a4 4 0 0 0 0 8h12a4 4 0 0 0 0-8h-2z"/><line x1="8" y1="17" x2="8" y2="22"/><line x1="12" y1="17" x2="12" y2="22"/><line x1="16" y1="17" x2="16" y2="22"/></svg>',
      stream: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6c4 0 4 4 8 4s4-4 8-4"/><path d="M3 12c4 0 4 4 8 4s4-4 8-4"/><path d="M3 18c4 0 4 4 8 4s4-4 8-4"/></svg>',
      deep:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>',
      wind:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5a3 3 0 1 1 3 3H2"/><path d="M16 8a3 3 0 1 1 3 3H2"/><path d="M14 16a3 3 0 1 1 3 3H2"/></svg>',
      tree:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L5 12h4l-3 5h12l-3-5h4z"/><line x1="12" y1="17" x2="12" y2="22"/></svg>',
      fire:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2c2 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-5 2-8 1 1 2 2 3 4z"/></svg>',
      bowl:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 0 18 0z"/><circle cx="12" cy="6" r="2"/></svg>',
      waves:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="16" x2="21" y2="16"/></svg>',
      drone:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>'
    }
  };

  var SHINES =
    '<span class="shine"></span>' +
    '<span class="shine shine-bottom"></span>' +
    '<span class="glow"></span>' +
    '<span class="glow glow-bottom"></span>';

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

  function loadFavorites() {
    try {
      var raw = localStorage.getItem(STORAGE_FAVORITES);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveFavorites() {
    try { localStorage.setItem(STORAGE_FAVORITES, JSON.stringify(favorites)); } catch (e) { /* ignore */ }
  }

  function formatDuration(sec) {
    if (!sec || sec <= 0) return '—';
    var total = Math.round(sec);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return t('library.card.durationFmt',
      m + ':' + (s < 10 ? '0' : '') + s,
      { m: m, s: (s < 10 ? '0' + s : '' + s) });
  }

  // ============================================================
  // Fallback display за неприetraен i18n
  // ============================================================

  function prettifyFilename(id) {
    if (!id) return '';
    return String(id)
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function tOrPrettify(key, prettyFallback) {
    // Ако i18n.t върне самия key (не намерен) → ползвай prettifyFilename
    if (!window.i18n || !window.i18n.t) return prettyFallback;
    var v = window.i18n.t(key, null);
    if (typeof v !== 'string' || v === key || v == null) return prettyFallback;
    // Ако започва с "TODO:" (en.json stub) → fallback също
    if (v.indexOf('TODO:') === 0) return prettyFallback;
    return v;
  }

  function categoryFallback(categoryId) {
    // i18n.t('library.cat_audio.<id>') ако е dostupen, иначе prettify
    if (!categoryId) return '';
    return tOrPrettify('library.cat_audio.' + categoryId, prettifyFilename(categoryId));
  }

  function soundTitle(sound) {
    if (!sound) return '';
    return tOrPrettify(sound.title_key, sound.bg_title || prettifyFilename(sound.id));
  }

  function soundSubtitle(sound) {
    if (!sound) return '';
    // Audio category е по-надежден fallback от raw category string
    var catKey = sound.category_audio || sound.category || '';
    return tOrPrettify(sound.subtitle_key, categoryFallback(catKey));
  }

  // ============================================================
  // Manifest loading
  // ============================================================

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
      return res.json();
    });
  }

  function loadManifest() {
    if (manifest) return Promise.resolve(manifest);
    if (manifestLoadPromise) return manifestLoadPromise;
    manifestLoadPromise = fetchJson(MANIFEST_URL)
      .catch(function () {
        console.warn('[library] manifest.json missing → fallback към template');
        return fetchJson(MANIFEST_FALLBACK);
      })
      .then(function (data) {
        manifest = data;
        return data;
      })
      .catch(function (e) {
        console.error('[library] и двата manifest файла липсват:', e);
        return { sounds: [], categories: [] };
      });
    return manifestLoadPromise;
  }

  // ============================================================
  // Filtering / search
  // ============================================================

  function getFilteredSounds() {
    if (!manifest || !manifest.sounds) return [];
    var sounds = manifest.sounds;

    if (activeFilter === 'favorites') {
      sounds = sounds.filter(function (s) { return favorites.indexOf(s.id) !== -1; });
    } else if (activeFilter !== 'all') {
      sounds = sounds.filter(function (s) { return s.category === activeFilter; });
    }

    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      sounds = sounds.filter(function (s) {
        var title = soundTitle(s).toLowerCase();
        var subtitle = soundSubtitle(s).toLowerCase();
        var cat = (s.category || '').toLowerCase();
        return title.indexOf(q) !== -1 || subtitle.indexOf(q) !== -1 || cat.indexOf(q) !== -1;
      });
    }

    return sounds;
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function buildSearchBarHtml() {
    var placeholder = t('library.search.placeholder', 'Търсете звук...');
    var clearAria = t('library.search.clearAria', 'Изчисти търсенето');
    var diaryAria = t('diary.openAria', 'Отвори дневника');
    var hasQuery = !!searchQuery;
    var diaryIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
      '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
      '</svg>';
    return (
      '<div class="lib-search-row">' +
        '<div class="lib-search">' +
          '<span class="lib-search-icon" aria-hidden="true">' + SVG.search + '</span>' +
          '<input type="search" id="libSearchInput" class="lib-search-input"' +
            ' placeholder="' + escapeHtml(placeholder) + '"' +
            ' value="' + escapeHtml(searchQuery) + '"' +
            ' autocomplete="off" spellcheck="false">' +
          (hasQuery
            ? '<button class="lib-search-clear" type="button" data-action="clear-search"' +
                ' aria-label="' + escapeHtml(clearAria) + '">' + SVG.clear + '</button>'
            : '') +
        '</div>' +
        '<button class="lib-diary-btn" type="button" data-action="open-diary"' +
          ' aria-label="' + escapeHtml(diaryAria) + '">' +
          diaryIcon +
        '</button>' +
      '</div>'
    );
  }

  function buildCategoryTabsHtml() {
    if (!manifest || !manifest.categories) return '';
    var tabs = [{ id: 'all', name_key: 'library.cat.all', icon: null }];
    if (favorites.length > 0) {
      tabs.push({ id: 'favorites', name_key: 'library.favorites.label', icon: 'heartFilled' });
    }
    tabs = tabs.concat(manifest.categories);

    return (
      '<div class="lib-cats" role="tablist">' +
        tabs.map(function (c) {
          var isActive = (c.id === activeFilter);
          var label = t(c.name_key, c.id);
          return (
            '<button class="lib-cat-tab' + (isActive ? ' is-active' : '') + '"' +
              ' role="tab" data-cat="' + escapeHtml(c.id) + '"' +
              ' aria-selected="' + (isActive ? 'true' : 'false') + '">' +
              escapeHtml(label) +
            '</button>'
          );
        }).join('') +
      '</div>'
    );
  }

  function buildSoundCardHtml(sound) {
    var title = soundTitle(sound);
    var subtitle = soundSubtitle(sound);
    var isFav = favorites.indexOf(sound.id) !== -1;
    var isPlaying = (window.AudioEngine && window.AudioEngine.getActivePreset() === sound.id);
    var favAria = isFav
      ? t('library.card.favoriteRemoveAria', 'Премахни ' + title + ' от любими', { title: title })
      : t('library.card.favoriteAddAria', 'Добави ' + title + ' в любими', { title: title });
    var playAria = t('library.card.playAria', 'Пусни ' + title, { title: title });

    // Schema v2: category_audio (от 01_ocean/, 02_rain/, etc.); fallback към legacy category
    var catId = sound.category_audio || sound.category;
    var iconSvg = SVG.cat[getCatIcon(catId)] || SVG.cat.waves;

    return (
      '<div class="glass lib-card' + (isPlaying ? ' is-playing' : '') + '"' +
        ' data-sound-id="' + escapeHtml(sound.id) + '"' +
        ' role="button" tabindex="0" aria-label="' + escapeHtml(playAria) + '">' +
        SHINES +
        '<div class="lib-card-icon" aria-hidden="true">' + iconSvg + '</div>' +
        '<div class="lib-card-body">' +
          '<div class="lib-card-title">' + escapeHtml(title) + '</div>' +
          '<div class="lib-card-subtitle">' + escapeHtml(subtitle) + '</div>' +
        '</div>' +
        '<button class="lib-card-fav' + (isFav ? ' is-active' : '') + '"' +
          ' type="button" data-action="fav"' +
          ' aria-label="' + escapeHtml(favAria) + '"' +
          ' aria-pressed="' + (isFav ? 'true' : 'false') + '">' +
          (isFav ? SVG.heartFilled : SVG.heart) +
        '</button>' +
      '</div>'
    );
  }

  function buildSkeletonGrid(n) {
    n = n || 8;
    var skel = '';
    for (var i = 0; i < n; i++) {
      skel +=
        '<div class="lib-card-skeleton" aria-hidden="true">' +
          '<div class="lib-skel-row lib-skel-row--icon"></div>' +
          '<div class="lib-skel-row lib-skel-row--title"></div>' +
          '<div class="lib-skel-row lib-skel-row--subtitle"></div>' +
          '<div class="lib-skel-row lib-skel-row--duration"></div>' +
        '</div>';
    }
    return '<div class="lib-grid">' + skel + '</div>';
  }

  function buildMeditationCardHtml(sound) {
    var title = soundTitle(sound);
    var subtitle = soundSubtitle(sound);
    var author = sound.author_key ? t(sound.author_key, '') : '';
    var isFav = favorites.indexOf(sound.id) !== -1;
    var playAria = t('library.card.playAria', 'Пусни ' + title, { title: title });
    var favAria = isFav
      ? t('library.card.favoriteRemoveAria', 'Премахни ' + title + ' от любими', { title: title })
      : t('library.card.favoriteAddAria', 'Добави ' + title + ' в любими', { title: title });

    return (
      '<div class="glass lib-med-card" data-sound-id="' + escapeHtml(sound.id) + '"' +
        ' data-meditation="true" role="button" tabindex="0"' +
        ' aria-label="' + escapeHtml(playAria) + '">' +
        SHINES +
        '<div class="lib-med-body">' +
          '<div class="lib-med-title">' + escapeHtml(title) + '</div>' +
          (author ? '<div class="lib-med-author">' + escapeHtml(author) + '</div>' : '') +
          '<div class="lib-med-subtitle">' + escapeHtml(subtitle) + '</div>' +
        '</div>' +
        '<button class="lib-med-fav' + (isFav ? ' is-active' : '') + '"' +
          ' type="button" data-action="fav"' +
          ' aria-label="' + escapeHtml(favAria) + '"' +
          ' aria-pressed="' + (isFav ? 'true' : 'false') + '">' +
          (isFav ? SVG.heartFilled : SVG.heart) +
        '</button>' +
        '<div class="lib-med-play" aria-hidden="true">' + SVG.play + '</div>' +
      '</div>'
    );
  }

  function getCatIcon(catId) {
    if (!manifest || !manifest.categories) return 'waves';
    for (var i = 0; i < manifest.categories.length; i++) {
      if (manifest.categories[i].id === catId) return manifest.categories[i].icon;
    }
    return 'waves';
  }

  function buildGridHtml(sounds) {
    if (sounds.length === 0) {
      var empty = searchQuery
        ? t('library.search.noResults', 'Няма намерени звуци за "' + searchQuery + '"', { query: searchQuery })
        : (activeFilter === 'favorites'
            ? t('library.favorites.empty', 'Натиснете ♡ върху звук, за да го запазите тук')
            : t('library.empty', 'Скоро ще има още звуци'));
      return '<div class="lib-empty">' + escapeHtml(empty) + '</div>';
    }

    // Meditation category → full-width list (не 2-col grid)
    if (activeFilter === 'meditation') {
      return (
        '<div class="lib-med-list">' +
          sounds.map(buildMeditationCardHtml).join('') +
        '</div>'
      );
    }

    return (
      '<div class="lib-grid">' +
        sounds.map(buildSoundCardHtml).join('') +
      '</div>'
    );
  }

  function buildMiniPlayerHtml() {
    if (!window.AudioEngine) return '';
    var activeId = window.AudioEngine.getActivePreset();
    if (!activeId) return '';
    var sound = findSound(activeId);
    if (!sound) return '';
    var title = soundTitle(sound);
    var subtitle = soundSubtitle(sound);
    var playingLabel = t('library.player.playing', 'Възпроизвежда се');
    var pauseAria = t('library.player.pauseAria', 'Пауза');
    var sleepLabel = t('sleep.title', 'Нощен режим');

    var moonSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';

    var openAria = t('library.player.openAria', 'Отвори плейъра');
    return (
      '<div class="lib-miniplayer" id="libMiniPlayer" role="region" aria-label="' +
        escapeHtml(playingLabel) + '">' +
        '<button class="lib-mp-body" type="button" data-action="mp-open"' +
          ' data-sound-id="' + escapeHtml(activeId) + '"' +
          ' aria-label="' + escapeHtml(openAria) + '">' +
          '<span class="lib-mp-eyebrow">' + escapeHtml(playingLabel) + '</span>' +
          '<span class="lib-mp-title">' + escapeHtml(title) + '</span>' +
          '<span class="lib-mp-subtitle">' + escapeHtml(subtitle) + '</span>' +
        '</button>' +
        '<button class="lib-mp-sleep" type="button" data-action="mp-sleep"' +
          ' aria-label="' + escapeHtml(sleepLabel) + '">' +
          moonSvg +
        '</button>' +
        '<button class="lib-mp-btn" type="button" data-action="mp-toggle"' +
          ' aria-label="' + escapeHtml(pauseAria) + '">' +
          SVG.pause +
        '</button>' +
      '</div>'
    );
  }

  function findSound(soundId) {
    if (!manifest || !manifest.sounds) return null;
    for (var i = 0; i < manifest.sounds.length; i++) {
      if (manifest.sounds[i].id === soundId) return manifest.sounds[i];
    }
    return null;
  }

  function buildLibraryHtml() {
    if (!manifest) {
      return '<div class="lib-loading">' +
        escapeHtml(t('library.loading', 'Зареждане...')) +
        '</div>';
    }

    var filtered = getFilteredSounds();

    return (
      '<div class="lib-screen" data-screen="library">' +
        buildSearchBarHtml() +
        buildCategoryTabsHtml() +
        buildGridHtml(filtered) +
        buildMiniPlayerHtml() +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function openSound(soundId) {
    var sound = findSound(soundId);
    if (!sound) {
      console.warn('[library] sound not found:', soundId);
      return;
    }

    ensureErrorListener();

    // P0 FIX: route ВСИЧКИ sound taps през Player.open (както CategoryView).
    // Преди това Library.openSound викаше AudioEngine.playUrl директно →
    // bypass-ваше Player screen, SEQ-REVEAL feedback, HeadphonesWarning,
    // profile config, flight token. Резултат: 30-40s тих delay, звук
    // тръгваше "от въздух" без контроли. (Phone test bug report.)
    // Runtime pink noise остава като fallback ако някой запазва такива
    // synthetic sounds в favorites — не валиден за production.
    if (sound.filename === '__runtime_pink__') {
      if (window.AudioEngine && window.AudioEngine.play) {
        window.AudioEngine.play('brown_noise').catch(function (e) {
          console.error('[library] pink play failed:', e);
        });
        setTimeout(refresh, 50);
      }
      return;
    }

    if (window.Player && window.Player.open) {
      window.Player.open(soundId);
    } else {
      console.error('[library] Player module missing — cannot open sound');
    }
  }

  var errorListenerBound = false;
  function ensureErrorListener() {
    if (errorListenerBound) return;
    errorListenerBound = true;
    window.addEventListener('auralis-sound-error', function (e) {
      var kind = (e.detail && e.detail.kind) || 'notFound';
      var msgKey = 'audio.error.' + kind;
      var msg = t(msgKey, t('audio.error.notFound', 'Звукът не може да се зареди'));
      if (window.Toast && window.Toast.error) window.Toast.error(msg);
      // Re-render → mini player автоматично hides ако getActivePreset() === null
      refresh();
    });
  }

  function toggleFavorite(soundId) {
    var idx = favorites.indexOf(soundId);
    if (idx === -1) favorites.push(soundId);
    else favorites.splice(idx, 1);
    saveFavorites();
    refresh();
  }

  function search(query) {
    searchQuery = (query || '').trim();
    refresh();
  }

  function setCategory(catId) {
    activeFilter = catId;
    refresh();
  }

  function clearSearch() {
    searchQuery = '';
    refresh();
  }

  // ============================================================
  // Render
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildLibraryHtml();
    bindEvents(app);
  }

  function bindEvents(container) {
    // Category tabs
    var tabs = container.querySelectorAll('.lib-cat-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', onTabClick);
    }

    // Search input
    var searchInput = container.querySelector('#libSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', onSearchInput);
    }

    // Delegated click handler
    container.addEventListener('click', onClick);
    // Keyboard activation за role="button" cards
    container.addEventListener('keydown', onKeyDown);
  }

  function onTabClick(e) {
    var catId = e.currentTarget.getAttribute('data-cat');
    if (catId) setCategory(catId);
  }

  function onSearchInput(e) {
    search(e.currentTarget.value);
    // Focus restoration след refresh
    setTimeout(function () {
      var newInput = el('libSearchInput');
      if (newInput) {
        newInput.focus();
        var v = newInput.value;
        newInput.setSelectionRange(v.length, v.length);
      }
    }, 0);
  }

  function onClick(e) {
    // Favorite toggle
    var favBtn = e.target.closest('[data-action="fav"]');
    if (favBtn) {
      e.stopPropagation();
      var card = favBtn.closest('.lib-card');
      if (card) toggleFavorite(card.getAttribute('data-sound-id'));
      return;
    }

    // Clear search
    var clearBtn = e.target.closest('[data-action="clear-search"]');
    if (clearBtn) {
      e.stopPropagation();
      clearSearch();
      return;
    }

    // Mini player body tap → open Player на текущия sound
    var mpOpenBtn = e.target.closest('[data-action="mp-open"]');
    if (mpOpenBtn) {
      e.stopPropagation();
      e.preventDefault();
      var soundId = mpOpenBtn.getAttribute('data-sound-id');
      console.log('[library] mp-open tap →', soundId);
      if (soundId && window.Player && window.Player.open) {
        window.Player.open(soundId);
      } else if (soundId && window.SoundDetail && window.SoundDetail.open) {
        window.SoundDetail.open(soundId);
      }
      return;
    }

    // Mini player toggle (pause/play)
    var mpBtn = e.target.closest('[data-action="mp-toggle"]');
    if (mpBtn) {
      e.stopPropagation();
      if (window.AudioEngine) {
        window.AudioEngine.pause();
        refresh();
      }
      return;
    }

    // Mini player Sleep button
    var sleepBtn = e.target.closest('[data-action="mp-sleep"]');
    if (sleepBtn) {
      e.stopPropagation();
      if (window.Sleep && window.Sleep.open) window.Sleep.open();
      return;
    }

    // Open Diary
    var diaryBtn = e.target.closest('[data-action="open-diary"]');
    if (diaryBtn) {
      e.stopPropagation();
      if (window.Diary && window.Diary.open) window.Diary.open();
      return;
    }

    // Meditation card → Calm full-screen player
    var medCard = e.target.closest('.lib-med-card');
    if (medCard) {
      var medId = medCard.getAttribute('data-sound-id');
      if (window.Calm && window.Calm.open) {
        window.Calm.open(medId);
      } else {
        openSound(medId); // fallback
      }
      return;
    }

    // Card body tap → play
    var soundCard = e.target.closest('.lib-card');
    if (soundCard) {
      openSound(soundCard.getAttribute('data-sound-id'));
    }
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('.lib-card');
    if (card) {
      e.preventDefault();
      openSound(card.getAttribute('data-sound-id'));
    }
  }

  function render() {
    var app = el('app');
    if (!app) return;
    // Skeleton placeholder вместо празно докато manifest зарежда
    app.innerHTML = buildSkeletonGrid(8);
    loadManifest().then(function () {
      refresh();
    });
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    render: render,
    openSound: openSound,
    search: search,
    toggleFavorite: toggleFavorite,
    getFavorites: function () { return favorites.slice(); },
    getSoundById: findSound,
    getPlayingSound: function () {
      if (!window.AudioEngine) return null;
      var id = window.AudioEngine.getActivePreset();
      return id ? findSound(id) : null;
    }
  };
})();
