/**
 * AURALIS Home — primary post-quiz entry point (Task N2)
 * ========================================================
 * Per BIBLE v3.1 §N2: заменя Library като main destination.
 * 6 use case cards (sleep_deep/falling_asleep/relaxation/daily/anxiety/meditation)
 * + bottom row: Diary + Legacy Library.
 *
 * Data flow:
 *   manifest.json loaded once (cached в window.AURALIS_MANIFEST) →
 *   Home използва manifest.categories_use[i].sound_count (per use case).
 *   При липса (categories_use не popull-нат) → show "Скоро" placeholder.
 *
 * Public API:
 *   Home.render()                — main render (от router)
 *   Home.openCategory(catId)     — → CategoryView
 *   Home.openLibraryAll()        — → legacy Library
 *   Home.openDiary()             — → Diary
 */

window.Home = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS — 6 hardcoded use cases (placeholder)
  // ============================================================

  var USE_CATEGORIES = [
    { id: 'sleep_deep',     emoji: '🌙', icon: 'moon'    },
    { id: 'falling_asleep', emoji: '😴', icon: 'sleep'   },
    { id: 'relaxation',     emoji: '🛋', icon: 'relax'   },
    { id: 'daily',          emoji: '☕', icon: 'coffee'  },
    { id: 'anxiety',        emoji: '🆘', icon: 'shield'  },
    { id: 'meditation',     emoji: '🧘', icon: 'lotus'   }
  ];

  var manifestPromise = null;

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

  // ============================================================
  // Manifest loading (cached)
  // ============================================================

  function loadManifest() {
    if (window.AURALIS_MANIFEST) return Promise.resolve(window.AURALIS_MANIFEST);
    if (manifestPromise) return manifestPromise;
    manifestPromise = fetch('audio/library/manifest.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function () {
        // Fallback to template
        return fetch('audio/library/manifest_template.json', { cache: 'no-store' })
          .then(function (r) { return r.ok ? r.json() : null; });
      })
      .then(function (data) {
        if (data) window.AURALIS_MANIFEST = data;
        return data;
      });
    return manifestPromise;
  }

  // ============================================================
  // Compute sound counts per use case
  // ============================================================

  function getCountForCategory(catId) {
    if (!window.AURALIS_MANIFEST) return 0;
    // Prefer manifest.categories_use[i].sound_count (от build_manifest.py)
    var catUse = window.AURALIS_MANIFEST.categories_use || [];
    for (var i = 0; i < catUse.length; i++) {
      if (catUse[i].id === catId && typeof catUse[i].sound_count === 'number') {
        return catUse[i].sound_count;
      }
    }
    // Fallback: scan sounds with categories_use array
    var sounds = window.AURALIS_MANIFEST.sounds || [];
    var count = 0;
    for (var j = 0; j < sounds.length; j++) {
      var arr = sounds[j].categories_use || [];
      if (arr.indexOf(catId) !== -1) count++;
    }
    return count;
  }

  function getTotalSounds() {
    if (!window.AURALIS_MANIFEST) return 0;
    return (window.AURALIS_MANIFEST.sounds || []).length;
  }

  function getRecommendedCategoryIds() {
    // Read profile from AppState и map → препоръчителни use case ids
    // (Z task ще даде final mapping; засега базов hardcoded)
    var profile = window.AppState && window.AppState.profile;
    var MAP = {
      'TH_C': ['sleep_deep', 'relaxation'],
      'DN_S': ['relaxation', 'daily'],
      'SS_R': ['anxiety', 'falling_asleep'],
      'SM_F': ['meditation', 'relaxation'],
      'HB_M': ['daily', 'falling_asleep']
    };
    return MAP[profile] || [];
  }

  // ============================================================
  // SVG icons
  // ============================================================

  var SVG = {
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="9 18 15 12 9 6"/></svg>'
  };

  // ============================================================
  // HTML builders
  // ============================================================

  function buildCategoryCard(cat, recommended) {
    var name = t('home.cat.' + cat.id + '.name', cat.id);
    var subtitle = t('home.cat.' + cat.id + '.subtitle', '');
    var count = getCountForCategory(cat.id);
    var countText = count > 0
      ? t('home.soundCountFmt', count + ' звука', { n: count })
      : t('home.soundCountZero', 'Скоро');
    var isRecommended = recommended.indexOf(cat.id) !== -1;

    return (
      '<button class="glass home-cat-card' + (isRecommended ? ' is-recommended' : '') + '"' +
        ' type="button" data-cat-id="' + cat.id + '" data-action="open-cat"' +
        ' aria-label="' + escapeHtml(name) + ' — ' + escapeHtml(countText) + '">' +
        '<span class="shine"></span>' +
        '<span class="shine shine-bottom"></span>' +
        '<span class="glow"></span>' +
        '<span class="glow glow-bottom"></span>' +
        '<span class="home-cat-emoji" aria-hidden="true">' + cat.emoji + '</span>' +
        '<span class="home-cat-body">' +
          '<span class="home-cat-name">' + escapeHtml(name) + '</span>' +
          '<span class="home-cat-subtitle">' + escapeHtml(subtitle) + '</span>' +
          '<span class="home-cat-count">' + escapeHtml(countText) + '</span>' +
        '</span>' +
        (isRecommended
          ? '<span class="home-cat-badge" aria-hidden="true">★</span>'
          : '') +
        '<span class="home-cat-arrow" aria-hidden="true">' + SVG.arrow + '</span>' +
      '</button>'
    );
  }

  function buildHomeHtml() {
    var recommended = getRecommendedCategoryIds();
    var cardsHtml = USE_CATEGORIES.map(function (c) {
      return buildCategoryCard(c, recommended);
    }).join('');

    var totalSounds = getTotalSounds();
    var libraryAllLabel = t('home.openLibraryAll', '🎵 Всички звуци') +
      (totalSounds > 0 ? '  (' + totalSounds + ')' : '');
    var diaryLabel = t('home.openDiary', '📖 Дневник');

    return (
      '<div class="home-screen" data-screen="home">' +
        '<h1 class="home-title">' +
          escapeHtml(t('home.title', 'Изберете режим')) +
        '</h1>' +

        '<div class="home-cat-list">' + cardsHtml + '</div>' +

        '<div class="home-bottom-row">' +
          '<button class="home-bottom-btn" type="button" data-action="open-diary">' +
            escapeHtml(diaryLabel) +
          '</button>' +
          '<button class="home-bottom-btn" type="button" data-action="open-library-all">' +
            escapeHtml(libraryAllLabel) +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function bindEvents(container) {
    container.addEventListener('click', onClick);
    container.addEventListener('keydown', onKeyDown);
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'open-cat') {
      var catId = actionBtn.getAttribute('data-cat-id');
      if (catId) openCategory(catId);
    } else if (action === 'open-diary') {
      openDiary();
    } else if (action === 'open-library-all') {
      openLibraryAll();
    }
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var actionBtn = e.target.closest('[data-action="open-cat"]');
    if (actionBtn) {
      e.preventDefault();
      openCategory(actionBtn.getAttribute('data-cat-id'));
    }
  }

  // ============================================================
  // Navigation
  // ============================================================

  function openCategory(catId) {
    if (!catId) return;
    if (window.CategoryView && window.CategoryView.open) {
      window.CategoryView.open(catId);
    } else {
      console.warn('[home] CategoryView not loaded — fallback Library');
      if (window.Library && window.Library.render) window.Library.render();
    }
  }

  function openDiary() {
    if (window.Diary && window.Diary.open) window.Diary.open();
  }

  function openLibraryAll() {
    // Legacy Library = всички звуци без use case филтър
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('library');
    }
    history.pushState({ phase: 'library' }, '');
    if (window.Library && window.Library.render) window.Library.render();
  }

  // ============================================================
  // Render
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildHomeHtml();
    bindEvents(app);
  }

  function render() {
    loadManifest().then(function () {
      refresh();
    });
  }

  return {
    render: render,
    openCategory: openCategory,
    openLibraryAll: openLibraryAll,
    openDiary: openDiary
  };
})();
