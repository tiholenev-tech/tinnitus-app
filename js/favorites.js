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

      // Bind sort buttons
      var sortButtons = content.querySelectorAll('[data-sort]');
      for (var i = 0; i < sortButtons.length; i++) {
        sortButtons[i].addEventListener('click', function (e) {
          sortMode = e.currentTarget.getAttribute('data-sort');
          render();
        });
      }

      // Bind item actions
      var items = content.querySelectorAll('.fav-item');
      for (var j = 0; j < items.length; j++) {
        (function (item) {
          var id = item.getAttribute('data-fav-id');
          var playBtn = item.querySelector('[data-action="play"]');
          var removeBtn = item.querySelector('[data-action="remove"]');
          if (playBtn) playBtn.addEventListener('click', function () {
            if (window.Player && window.Player.open) window.Player.open(id);
            else if (window.AudioEngine && window.AudioEngine.play) window.AudioEngine.play(id);
          });
          if (removeBtn) removeBtn.addEventListener('click', function () {
            remove(id);
            all = getAll();
            render();
            if (window.Toast) window.Toast.info(t('favorites.removed', 'Премахнато от любими'));
          });
        })(items[j]);
      }
    }

    render();

    window.BottomSheet.open({
      title: t('favorites.title', 'Моите любими'),
      content: content,
      height: '80vh'
    });
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
    showSheet: showSheet
  };
})();
