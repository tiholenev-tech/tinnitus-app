/**
 * AURALIS Favorites Manager (Task GG)
 * ======================================
 * Extracted from library.js inline favorites into dedicated module.
 * Extended schema: {id, addedAt, playCount, category}
 *
 * Public API:
 *   Favorites.add(soundId, metadata?)
 *   Favorites.remove(soundId)
 *   Favorites.toggle(soundId) → boolean (new state)
 *   Favorites.has(soundId) → boolean
 *   Favorites.getAll() → [{id, addedAt, playCount, category}]
 *   Favorites.getRecent(n) → last n added
 *   Favorites.getMostPlayed(n) → top n by playCount
 *   Favorites.incrementPlay(soundId)
 *   Favorites.getStats() → {total, mostPlayedId, addedThisWeek}
 *   Favorites.clear()
 *   Favorites.showSheet() → opens Favorites bottom sheet
 */

window.Favorites = (function () {
  'use strict';

  var STORAGE_KEY = 'auralis_favorites';

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function now() { return new Date().toISOString(); }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return [];
  }

  function save(arr) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); } catch (e) { /* ignore */ }
  }

  function findIndex(arr, soundId) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === soundId) return i;
    }
    return -1;
  }

  // ============================================================
  // Core API
  // ============================================================

  function add(soundId, metadata) {
    if (!soundId) return;
    var arr = load();
    if (findIndex(arr, soundId) !== -1) return; // already exists
    var entry = {
      id: soundId,
      addedAt: now(),
      playCount: 0,
      category: (metadata && metadata.category) || null
    };
    arr.push(entry);
    save(arr);
    // Analytics track
    if (window.Analytics && window.Analytics.trackFavorite) {
      window.Analytics.trackFavorite(soundId, true);
    }
  }

  function remove(soundId) {
    var arr = load();
    var idx = findIndex(arr, soundId);
    if (idx === -1) return;
    arr.splice(idx, 1);
    save(arr);
    if (window.Analytics && window.Analytics.trackFavorite) {
      window.Analytics.trackFavorite(soundId, false);
    }
  }

  function toggle(soundId, metadata) {
    if (has(soundId)) {
      remove(soundId);
      return false;
    } else {
      add(soundId, metadata);
      return true;
    }
  }

  function has(soundId) {
    var arr = load();
    return findIndex(arr, soundId) !== -1;
  }

  function getAll() {
    return load();
  }

  function getRecent(n) {
    n = n || 10;
    var arr = load();
    return arr.slice().sort(function (a, b) {
      return (b.addedAt || '').localeCompare(a.addedAt || '');
    }).slice(0, n);
  }

  function getMostPlayed(n) {
    n = n || 10;
    var arr = load();
    return arr.slice().sort(function (a, b) {
      return (b.playCount || 0) - (a.playCount || 0);
    }).slice(0, n);
  }

  function incrementPlay(soundId) {
    var arr = load();
    var idx = findIndex(arr, soundId);
    if (idx === -1) return;
    arr[idx].playCount = (arr[idx].playCount || 0) + 1;
    save(arr);
  }

  function getStats() {
    var arr = load();
    var total = arr.length;
    var mostPlayedId = null;
    var maxPlays = 0;
    var weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    var addedThisWeek = 0;

    arr.forEach(function (item) {
      if ((item.playCount || 0) > maxPlays) {
        maxPlays = item.playCount;
        mostPlayedId = item.id;
      }
      if (item.addedAt && item.addedAt >= weekAgo) {
        addedThisWeek++;
      }
    });

    return { total: total, mostPlayedId: mostPlayedId, addedThisWeek: addedThisWeek };
  }

  function clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  // ============================================================
  // UI: Favorites Bottom Sheet
  // ============================================================

  function showSheet() {
    if (!window.BottomSheet) return;

    var all = getAll();
    if (all.length === 0) {
      window.BottomSheet.open({
        title: t('favorites.title', 'Моите любими'),
        content: '<p style="padding:16px;color:var(--text-muted);text-align:center;">' +
          escapeHtml(t('favorites.empty', 'Все още нямате любими звуци.')) + '</p>',
        height: 'auto'
      });
      return;
    }

    var sortMode = 'recent'; // recent | playCount | alpha
    var content = document.createElement('div');
    content.className = 'fav-sheet';

    function render() {
      var sorted = all.slice();
      if (sortMode === 'recent') {
        sorted.sort(function (a, b) { return (b.addedAt || '').localeCompare(a.addedAt || ''); });
      } else if (sortMode === 'playCount') {
        sorted.sort(function (a, b) { return (b.playCount || 0) - (a.playCount || 0); });
      } else {
        sorted.sort(function (a, b) { return (a.id || '').localeCompare(b.id || ''); });
      }

      var sortBtns =
        '<div class="fav-sort">' +
          '<button class="fav-sort-btn' + (sortMode === 'recent' ? ' is-active' : '') +
            '" data-sort="recent">' + escapeHtml(t('favorites.sort.recent', 'Скорошни')) + '</button>' +
          '<button class="fav-sort-btn' + (sortMode === 'playCount' ? ' is-active' : '') +
            '" data-sort="playCount">' + escapeHtml(t('favorites.sort.played', 'Слушани')) + '</button>' +
          '<button class="fav-sort-btn' + (sortMode === 'alpha' ? ' is-active' : '') +
            '" data-sort="alpha">' + escapeHtml(t('favorites.sort.alpha', 'A-Z')) + '</button>' +
        '</div>';

      var list = sorted.map(function (item) {
        var label = t('sounds.' + item.id + '.title', item.id);
        return (
          '<div class="fav-item" data-fav-id="' + escapeHtml(item.id) + '">' +
            '<button class="fav-item-main" type="button" data-action="play">' +
              '<span class="fav-item-name">' + escapeHtml(label) + '</span>' +
              '<span class="fav-item-meta">' + (item.playCount || 0) + 'x</span>' +
            '</button>' +
            '<button class="fav-item-remove" type="button" data-action="remove"' +
              ' aria-label="' + escapeHtml(t('favorites.remove', 'Премахни')) + '">×</button>' +
          '</div>'
        );
      }).join('');

      content.innerHTML = sortBtns + '<div class="fav-list">' + list + '</div>';
      // P0-10 FIX: НЕ bind-ваме индивидуални listeners тук — те се
      // акумулираха при всеки re-render (sort tap / remove tap) защото
      // re-bind happen-ваше преди GC да овъвчисти старите closures.
      // Сега използваме SINGLE delegated listener на `content` (виж по-долу).
    }

    // Single delegated click handler — bound веднъж за целия живот на sheet.
    // innerHTML re-render-ите не го трият (parent остава, listener остава).
    function onContentClick(e) {
      // Sort buttons
      var sortBtn = e.target.closest('[data-sort]');
      if (sortBtn && content.contains(sortBtn)) {
        sortMode = sortBtn.getAttribute('data-sort');
        render();
        return;
      }
      // Item action — find both action и parent item.
      var actionBtn = e.target.closest('[data-action]');
      if (!actionBtn || !content.contains(actionBtn)) return;
      var itemEl = actionBtn.closest('.fav-item');
      if (!itemEl) return;
      var id = itemEl.getAttribute('data-fav-id');
      if (!id) return;
      var action = actionBtn.getAttribute('data-action');
      if (action === 'play') {
        if (window.Player && window.Player.open) window.Player.open(id);
        else if (window.AudioEngine && window.AudioEngine.play) window.AudioEngine.play(id);
      } else if (action === 'remove') {
        remove(id);
        all = getAll();
        render();
        if (window.Toast) window.Toast.info(t('favorites.removed', 'Премахнато от любими'));
      }
    }
    content.addEventListener('click', onContentClick);

    render();

    window.BottomSheet.open({
      title: t('favorites.title', 'Моите любими'),
      content: content,
      height: '80vh'
    });
  }

  // ============================================================
  // FULL-SCREEN FAVORITES PAGE (phone test ask 2026-05-28)
  // ────────────────────────────────────────────────────────────
  // Identical layout на CategoryView (.cv-* classes reused) →
  // 2-col sound grid с правилни БГ имена от manifest.
  //
  // КРИТИЧЕН BUG FIX: преди това home favorites pills чели
  // t('sounds.'+id+'.title', id) — ключът не съществува в i18n
  // (sounds.* namespace не е попълнен) → връщаше английски id-та.
  // Сега използваме същия 3-stage fallback като category-view.js:
  //   1. tOrNull(sound.title_key)   — i18n за категория-агностични keys
  //   2. sound.bg_title              — readable БГ име от manifest
  //   3. prettifyFilename(sound.id)  — graceful fallback
  // ============================================================

  function tOrNull(key) {
    if (!window.i18n || !window.i18n.t) return null;
    var v = window.i18n.t(key, null);
    if (typeof v !== 'string' || v === key || v.indexOf('TODO:') === 0) return null;
    return v;
  }

  function prettifyFilename(id) {
    if (!id) return '';
    return String(id).replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function getSoundTitle(sound) {
    if (!sound) return '';
    var v = tOrNull(sound.title_key);
    if (v) return v;
    if (sound.bg_title) return sound.bg_title;
    return prettifyFilename(sound.id);
  }

  function getSoundSubtitle(sound) {
    if (!sound) return '';
    var v = tOrNull(sound.subtitle_key);
    if (v) return v;
    var catId = sound.category_audio || sound.category || '';
    return tOrNull('library.cat_audio.' + catId) || prettifyFilename(catId);
  }

  function ensureManifest() {
    if (window.AURALIS_MANIFEST) return Promise.resolve(window.AURALIS_MANIFEST);
    return fetch('audio/library/manifest.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { window.AURALIS_MANIFEST = data; return data; })
      .catch(function () { return null; });
  }

  function findSoundsByIds(manifest, ids) {
    if (!manifest || !Array.isArray(manifest.sounds) || !Array.isArray(ids)) return [];
    var byId = {};
    for (var i = 0; i < manifest.sounds.length; i++) {
      var s = manifest.sounds[i];
      if (s && s.id) byId[s.id] = s;
    }
    var found = [];
    for (var j = 0; j < ids.length; j++) {
      if (byId[ids[j]]) found.push(byId[ids[j]]);
    }
    return found;
  }

  function svgBackPage() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  }

  function svgPlayPage() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  }

  function svgHeartPage() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' +
      '</svg>';
  }

  function buildFavSoundCard(sound) {
    var title = getSoundTitle(sound);
    var subtitle = getSoundSubtitle(sound);
    return (
      '<button class="glass cv-sound-card" type="button"' +
        ' data-action="open-sound" data-sound-id="' + escapeHtml(sound.id) + '"' +
        ' aria-label="' + escapeHtml(title) + '">' +
        '<span class="shine"></span>' +
        '<span class="shine shine-bottom"></span>' +
        '<span class="glow"></span>' +
        '<span class="glow glow-bottom"></span>' +
        '<span class="cv-sound-body">' +
          '<span class="cv-sound-title">' + escapeHtml(title) + '</span>' +
          '<span class="cv-sound-subtitle">' + escapeHtml(subtitle) + '</span>' +
        '</span>' +
        '<span class="cv-sound-play" aria-hidden="true">' + svgPlayPage() + '</span>' +
      '</button>'
    );
  }

  function buildPageHtml(sounds) {
    var title    = t('favorites.title', 'Любими');
    var subtitle = t('favorites.pageSubtitle', 'Вашите запазени звуци');
    var backAria = t('favorites.backAria', 'Назад');
    var count    = sounds.length;
    var soundsLabel = t('favorites.countFmt', 'Звуци (' + count + ')', { n: count });

    var emptyMsg = t('favorites.empty', 'Все още нямате любими звуци.');
    var emptyHint = t('favorites.emptyHint',
      'Натиснете сърцето в плеъра за да добавите звук към любими.');

    var soundsHtml = count === 0
      ? '<div class="cv-empty"><p>' + escapeHtml(emptyMsg) + '</p>' +
        '<p style="margin-top:8px;font-size:13px;color:var(--text-muted);">' +
          escapeHtml(emptyHint) + '</p></div>'
      : '<div class="cv-sound-grid">' +
        sounds.map(buildFavSoundCard).join('') +
        '</div>';

    return (
      '<div class="cv-screen" data-screen="favorites">' +
        '<header class="cv-header">' +
          '<button class="cv-back" type="button" data-action="fav-back"' +
            ' aria-label="' + escapeHtml(backAria) + '">' + svgBackPage() + '</button>' +
          '<div class="cv-header-text">' +
            '<h1 class="cv-title">' +
              '<span class="cv-icon" aria-hidden="true">' + svgHeartPage() + '</span>' +
              '<span class="cv-title-text">' + escapeHtml(title) + '</span>' +
            '</h1>' +
            '<div class="cv-subtitle">' + escapeHtml(subtitle) + '</div>' +
          '</div>' +
        '</header>' +
        '<section class="cv-sounds-section">' +
          '<h2 class="cv-section-title">' + escapeHtml(soundsLabel) + '</h2>' +
          soundsHtml +
        '</section>' +
      '</div>'
    );
  }

  function onPageClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'fav-back') {
      e.stopPropagation();
      closePage();
    } else if (action === 'open-sound') {
      e.stopPropagation();
      var id = btn.getAttribute('data-sound-id');
      if (!id) return;
      // Increment play count за консистентност с другите play paths.
      try { incrementPlay(id); } catch (e2) { /* ignore */ }
      if (window.Player && window.Player.open) {
        window.Player.open(id);
      } else if (window.SoundDetail && window.SoundDetail.open) {
        window.SoundDetail.open(id);
      }
    }
  }

  function openPage() {
    var app = document.getElementById('app');
    if (!app) return;
    // NAV-LISTENER-LEAK fix: clone-and-replace #app преди да закачаме нашия
    // click listener. Преди това pageMounted flag предпазваше от double-bind,
    // но flag-ът ставаше stale ако друг модул (Player/Home) клонираше #app —
    // нашия listener се загубваше, но pageMounted=true го блокираше при
    // следващ openPage → cards "глухи". Сега всеки openPage клонира → fresh
    // node → винаги закачаме нов listener.
    var fresh = app.cloneNode(false);
    app.parentNode.replaceChild(fresh, app);
    app = fresh;
    // Skeleton while manifest loads.
    app.innerHTML = '<div class="cv-loading" style="padding:24px;text-align:center;color:var(--text-muted);">' + escapeHtml(t('ui.favorites.loadingSkeleton','Зарежда се...')) + '</div>';

    history.pushState({ phase: 'favorites' }, '');

    ensureManifest().then(function (manifest) {
      var favList = getAll(); // {id, addedAt, playCount, category}
      // Sort: most-recent първи (consistency с home pattern).
      favList.sort(function (a, b) {
        return (b.addedAt || '').localeCompare(a.addedAt || '');
      });
      var ids = favList.map(function (f) { return f.id; });
      var sounds = findSoundsByIds(manifest, ids);

      // Manifest miss — fallback на raw favorites без metadata.
      // Така empty state не показва грешно "няма" когато manifest fail-не.
      if (sounds.length === 0 && favList.length > 0) {
        sounds = favList.map(function (f) {
          return { id: f.id, bg_title: null, title_key: null, category_audio: null };
        });
      }

      app.innerHTML = buildPageHtml(sounds);
      app.addEventListener('click', onPageClick);
    });
  }

  function closePage() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('home');
    }
    history.replaceState({ phase: 'home' }, '');
    if (window.Home && window.Home.render) {
      window.Home.render();
    }
  }

  return {
    add: add,
    remove: remove,
    toggle: toggle,
    has: has,
    getAll: getAll,
    getRecent: getRecent,
    getMostPlayed: getMostPlayed,
    incrementPlay: incrementPlay,
    getStats: getStats,
    clear: clear,
    showSheet: showSheet,
    openPage: openPage,
    closePage: closePage
  };
})();
