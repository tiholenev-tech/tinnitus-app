/**
 * AURALIS TopSoundsCarousel — horizontal scroll препоръчителни звуци (Task P2)
 * ==============================================================================
 * Per BIBLE v3.1 §P2: 88×88 cards, horizontal scroll, tap → Player.open.
 *
 * Data flow:
 *   manifest.json → window.AURALIS_MANIFEST.sounds
 *   Filter logic:
 *     0. (Strategy 1 / preferred) sound["<profile>_score"] >= SCORE_THRESHOLD
 *        sorted descending → top N. Изисква manifest с per-profile scoring.
 *     1. Ако sound.categories_use съдържа recommendedCategories[0|1] → INCLUDE
 *     2. Fallback ако §9 scoring не е готов: първите 10 от audio category
 *        матчиращ recommended (за TH_C → audio cat 'underwater'+'ocean', etc.)
 *     3. Last resort: първите 10 sounds от целия manifest
 *
 * Public API:
 *   TopSoundsCarousel.create({
 *     mount: HTMLElement,
 *     profileCode: 'TH_C',
 *     recommendedCategories: ['sleep_deep', 'relaxation'],
 *     onTap: (soundId) => void,
 *     onViewAll: () => void
 *   })
 *
 * Returns the carousel root element (also appends to mount ако mount е node).
 */

window.TopSoundsCarousel = (function () {
  'use strict';

  var MAX_SOUNDS = 10;

  // Profile scoring threshold (I1.3). Sounds със score >= това → top picks.
  // 7.0 матчва Opus's spec; ако твърде малко sound-ове минават thresh-а, sec-fallback
  // взима топ N без threshold (винаги връща нещо за active profile).
  var SCORE_THRESHOLD = 7.0;

  // Fallback audio category mapping per profile (използва се ако
  // categories_use не е popull-нат)
  var FALLBACK_AUDIO_CATS = {
    sleep_deep:     ['underwater', 'ambient', 'ocean'],
    falling_asleep: ['rain', 'river', 'forest'],
    relaxation:     ['forest', 'river', 'fire', 'wind'],
    daily:          ['wind', 'forest', 'ambient'],
    anxiety:        ['underwater', 'ambient', 'ocean'],
    meditation:     ['meditation', 'ambient']
  };

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }

  function tOrNull(key) {
    if (!window.i18n || !window.i18n.t) return null;
    var v = window.i18n.t(key, null);
    if (typeof v !== 'string' || v === key || v.indexOf('TODO:') === 0) return null;
    return v;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function prettifyFilename(id) {
    if (!id) return '';
    return String(id).replace(/_/g, ' ').replace(/\s+/g, ' ').trim()
      .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function fmtDuration(sec) {
    if (!sec || sec <= 0) return '';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function soundTitle(sound) {
    if (!sound) return '';
    return tOrNull(sound.title_key) || sound.bg_title || prettifyFilename(sound.id);
  }

  // ============================================================
  // Sound selection logic
  // ============================================================

  function selectSounds(recommendedCategories, profileCode) {
    var manifest = window.AURALIS_MANIFEST;
    if (!manifest || !Array.isArray(manifest.sounds)) return [];
    var allSounds = manifest.sounds;
    var seen = {};
    var picked = [];

    // Strategy 0 (preferred): per-profile scoring (I1.3).
    // sound[<code>_score] >= SCORE_THRESHOLD, sorted descending.
    if (profileCode) {
      var scoreKey = profileCode + '_score';
      var hasScores = allSounds.some(function (s) { return typeof s[scoreKey] === 'number'; });
      if (hasScores) {
        var scored = allSounds.filter(function (s) {
          return typeof s[scoreKey] === 'number' && s[scoreKey] >= SCORE_THRESHOLD;
        });
        scored.sort(function (a, b) { return b[scoreKey] - a[scoreKey]; });
        for (var i = 0; i < scored.length && picked.length < MAX_SOUNDS; i++) {
          if (seen[scored[i].id]) continue;
          picked.push(scored[i]);
          seen[scored[i].id] = true;
        }
        // Ако под threshold-а нямаме достатъчно — top-N със scoring без threshold.
        if (picked.length < MAX_SOUNDS) {
          var anyScored = allSounds
            .filter(function (s) { return typeof s[scoreKey] === 'number'; })
            .sort(function (a, b) { return b[scoreKey] - a[scoreKey]; });
          for (var j = 0; j < anyScored.length && picked.length < MAX_SOUNDS; j++) {
            if (seen[anyScored[j].id]) continue;
            picked.push(anyScored[j]);
            seen[anyScored[j].id] = true;
          }
        }
        if (picked.length >= MAX_SOUNDS) return picked.slice(0, MAX_SOUNDS);
      }
    }

    // Strategy 1: filter by categories_use (Opus's §9 output)
    var hasCatsUseData = allSounds.some(function (s) {
      return Array.isArray(s.categories_use) && s.categories_use.length > 0;
    });
    if (hasCatsUseData && recommendedCategories && recommendedCategories.length) {
      recommendedCategories.forEach(function (cat) {
        allSounds.forEach(function (s) {
          if (picked.length >= MAX_SOUNDS) return;
          if (seen[s.id]) return;
          var cu = Array.isArray(s.categories_use) ? s.categories_use : [];
          if (cu.indexOf(cat) !== -1) {
            picked.push(s);
            seen[s.id] = true;
          }
        });
      });
    }

    // Strategy 2: fallback to audio category mapping
    if (picked.length < MAX_SOUNDS && recommendedCategories && recommendedCategories.length) {
      recommendedCategories.forEach(function (catUse) {
        var fallbackAudio = FALLBACK_AUDIO_CATS[catUse] || [];
        fallbackAudio.forEach(function (audioCat) {
          allSounds.forEach(function (s) {
            if (picked.length >= MAX_SOUNDS) return;
            if (seen[s.id]) return;
            var sCat = s.category_audio || s.category || '';
            if (sCat === audioCat) {
              picked.push(s);
              seen[s.id] = true;
            }
          });
        });
      });
    }

    // Strategy 3: last resort — първите N изобщо (filter noise category out)
    if (picked.length === 0) {
      for (var i = 0; i < allSounds.length && picked.length < MAX_SOUNDS; i++) {
        var s = allSounds[i];
        if (s.category_audio === 'noise') continue;
        if (seen[s.id]) continue;
        picked.push(s);
        seen[s.id] = true;
      }
    }

    return picked.slice(0, MAX_SOUNDS);
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function svgPlay() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  }

  function svgChevron() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="9 18 15 12 9 6"/></svg>';
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function buildCardHtml(sound, index) {
    var title = soundTitle(sound);
    var ariaLabel = t('ui.library.card.playAria', 'Пусни ' + title, { title: title });
    return (
      '<button class="tsc-card" type="button"' +
        ' data-tsc-action="play" data-sound-id="' + escapeHtml(sound.id) + '"' +
        ' aria-label="' + escapeHtml(ariaLabel) + '">' +
        '<span class="tsc-card-num" aria-hidden="true">' + (index + 1) + '</span>' +
        '<span class="tsc-card-art" aria-hidden="true">' +
          '<span class="tsc-card-orb"></span>' +
          '<span class="tsc-card-play">' + svgPlay() + '</span>' +
        '</span>' +
        '<span class="tsc-card-body">' +
          '<span class="tsc-card-title">' + escapeHtml(title) + '</span>' +
        '</span>' +
      '</button>'
    );
  }

  function buildEmptyHtml() {
    var msg = t('profile_results.topSounds.empty', 'Препоръките се подготвят...');
    return '<div class="tsc-empty">' + escapeHtml(msg) + '</div>';
  }

  function buildViewAllHtml() {
    var label = t('profile_results.topSounds.viewAll', 'Виж всички препоръчителни');
    return (
      '<button class="tsc-view-all" type="button" data-tsc-action="view-all">' +
        '<span>' + escapeHtml(label) + '</span>' +
        '<span class="tsc-view-all-icon" aria-hidden="true">' + svgChevron() + '</span>' +
      '</button>'
    );
  }

  function buildCarouselHtml(sounds) {
    if (!sounds.length) return buildEmptyHtml();
    var cards = sounds.map(buildCardHtml).join('');
    return (
      '<div class="tsc-carousel">' +
        '<div class="tsc-scroll" role="list">' + cards + '</div>' +
      '</div>' +
      buildViewAllHtml()
    );
  }

  // ============================================================
  // Events
  // ============================================================

  function bind(root, opts) {
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tsc-action]');
      if (!btn) return;
      e.stopPropagation();
      var action = btn.getAttribute('data-tsc-action');
      if (action === 'play') {
        var sid = btn.getAttribute('data-sound-id');
        if (sid && typeof opts.onTap === 'function') opts.onTap(sid);
      } else if (action === 'view-all') {
        if (typeof opts.onViewAll === 'function') opts.onViewAll();
      }
    });
  }

  // ============================================================
  // Public API
  // ============================================================

  function create(opts) {
    opts = opts || {};
    var sounds = selectSounds(opts.recommendedCategories || [], opts.profileCode);

    var root = document.createElement('div');
    root.className = 'tsc-root';
    root.innerHTML = buildCarouselHtml(sounds);
    bind(root, opts);

    if (opts.mount && opts.mount.appendChild) {
      // Clear mount (placeholder loading state може да е там)
      opts.mount.innerHTML = '';
      opts.mount.appendChild(root);
    }
    return root;
  }

  return {
    create: create,
    // Exposed за тестове
    selectSounds: selectSounds
  };
})();
