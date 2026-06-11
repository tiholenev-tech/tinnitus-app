/**
 * AURALIS CategoryView — per use-case sounds list (Task N3)
 * ============================================================
 * Per BIBLE v3.1 §N3: tap-ваш use case от Home → CategoryView.
 *
 * Layout:
 *   Header [< back] [emoji] [name] [⚙]
 *   InfoPanel: "За какво е" description (от i18n) + FAQ
 *   Sounds (N) — 2-col grid (filter manifest.sounds где
 *                categories_use includes catId)
 *   Tap card → SoundDetail.open(soundId)
 *
 * Public API:
 *   CategoryView.open(catId)
 *   CategoryView.close()
 *   CategoryView.render()  — router hook
 */

window.CategoryView = (function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================

  var activeCatId = null;

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

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

  function tArrOrEmpty(key) {
    if (!window.i18n || !window.i18n.tArr) return [];
    var arr = window.i18n.tArr(key);
    return Array.isArray(arr) ? arr : [];
  }

  function tObjOrNull(key) {
    if (!window.i18n || !window.i18n.tObj) return null;
    return window.i18n.tObj(key);
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
    if (!sec || sec <= 0) return '—';
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ============================================================
  // Use category lookup
  // ============================================================

  function findUseCategory(catId) {
    if (!window.AURALIS_MANIFEST) return null;
    var arr = window.AURALIS_MANIFEST.categories_use || [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === catId) return arr[i];
    }
    // Fallback: hardcoded list (mirror на home.js — icon names only)
    var HARDCODED = [
      { id: 'sleep_deep',     icon: 'moon'   },
      { id: 'falling_asleep', icon: 'zzz'    },
      { id: 'relaxation',     icon: 'waves'  },
      { id: 'daily',          icon: 'sun'    },
      { id: 'anxiety',        icon: 'shield' },
      { id: 'meditation',     icon: 'lotus'  }
    ];
    for (var j = 0; j < HARDCODED.length; j++) {
      if (HARDCODED[j].id === catId) return HARDCODED[j];
    }
    // Елемент-категории (category_audio) → синтетичен обект.
    var ELEM_ICONS = { ocean: 'waves', underwater: 'deep', river: 'stream',
      waterfall: 'waterfall', rain: 'rain', wind: 'wind', forest: 'tree',
      fire: 'fire', meditation: 'lotus', noise: 'equalizer', ambient: 'drone' };
    if (ELEM_ICONS[catId]) return { id: catId, icon: ELEM_ICONS[catId], element: true };
    return null;
  }

  // BG имена на елемент-категориите (fallback ако i18n още не е зареден).
  var ELEM_BG = { ocean: 'Вълни', underwater: 'Подводно', river: 'Река',
    waterfall: 'Водопад', rain: 'Дъжд', wind: 'Вятър', forest: 'Гора',
    fire: 'Огън', meditation: 'Медитация', noise: 'Шум', ambient: 'Атмосфера' };

  function getCatName(catId) {
    // Елемент-категории → име от library.cat_audio.<id> (Вълни, Дъжд…),
    // с БГ fallback за да не се показва английско prettify.
    var el = tOrNull('ui.library.cat_audio.' + catId);
    if (el) return el;
    if (ELEM_BG[catId]) return ELEM_BG[catId];
    return t('home.cat.' + catId + '.name', prettifyFilename(catId));
  }

  function getCatSubtitle(catId) {
    return t('ui.library.cat_sub.' + catId, '');
  }

  function getCatDescription(catId) {
    // i18n: categoryView.descriptions.<id> ИЛИ home.cat.<id>.description
    return tOrNull('home.cat.' + catId + '.description') ||
           tOrNull('categoryView.descriptions.' + catId);
  }

  function getCatFaq(catId) {
    // i18n: home.cat.<id>.faq (array of {q, a}) ИЛИ categoryView.faq.<id>
    var arr = tObjOrNull('home.cat.' + catId + '.faq');
    if (Array.isArray(arr)) return arr;
    arr = tObjOrNull('categoryView.faq.' + catId);
    if (Array.isArray(arr)) return arr;
    return [];
  }

  // ============================================================
  // Sound filtering
  // ============================================================

  // MEDITATION-FILTER-V2: by CSV category, not by filename keywords.
  // Истинска медитация: 'meditation' е ПЪРВА категория в Opus CSV
  // OR category_audio === 'meditation' (08_meditation/ folder) +
  // не съдържа natural ambience keyword.
  // Защо: keyword guessing беше неточен — реалните meditation файлове
  // имат имена като "joseph_beg_genetic_waves" или "calm_piano_009"
  // които не съдържат "singing_bowl"/"gong"/"mantra".
  function isRealMeditation(sound) {
    if (!sound || !sound.id) return false;

    var cats = sound.categories_use;
    if (typeof cats === 'string') {
      cats = cats.split(',').map(function (c) { return c.trim(); });
    }

    // Hard exclude — sound с очевидно natural file id не е meditation.
    var id = String(sound.id).toLowerCase();
    var hardBlock = ['ambience', 'ocean', 'wind', 'rain_', 'water_',
                     'waves_', 'underwater', 'storm', 'thunder',
                     'forest', 'birds', 'stream', 'river', 'surf', 'creek',
                     'beach', 'sea_'];
    for (var b = 0; b < hardBlock.length; b++) {
      if (id.indexOf(hardBlock[b]) !== -1) return false;
    }

    // Pass-1: meditation е първата (primary) категория от Opus CSV.
    if (Array.isArray(cats) && cats.length > 0 && cats[0] === 'meditation') {
      return true;
    }
    // Pass-2: файлът идва от curated 08_meditation/ folder.
    if (sound.category_audio === 'meditation') {
      return true;
    }
    return false;
  }

  // CAT-SORT: sort sounds by current profile's score (e.g. HB_M_score),
  // descending. Falls back към 0 ако score липсва.
  function sortByProfileScore(sounds, profileCode) {
    if (!profileCode) return sounds;
    var scoreKey = profileCode + '_score';
    return sounds.slice().sort(function (a, b) {
      var sa = (typeof a[scoreKey] === 'number') ? a[scoreKey] : 0;
      var sb = (typeof b[scoreKey] === 'number') ? b[scoreKey] : 0;
      return sb - sa;
    });
  }

  var MAX_SOUNDS_PER_CATEGORY = 30;

  // Елемент-категории (category_audio) — началният екран вече е по елемент.
  var ELEMENT_IDS = ['ocean', 'river', 'waterfall', 'underwater', 'rain',
                     'wind', 'forest', 'fire', 'meditation', 'noise', 'ambient'];

  function getSoundsForCategory(catId) {
    if (!window.AURALIS_MANIFEST) return [];
    var all = window.AURALIS_MANIFEST.sounds || [];

    // ELEMENT-режим: филтрирай по category_audio (вид звук), покажи ВСИЧКИ.
    if (ELEMENT_IDS.indexOf(catId) !== -1) {
      var el = all.filter(function (s) { return s.category_audio === catId; });
      var p = (window.AppState && window.AppState.profile) || null;
      if (p) el = sortByProfileScore(el, p);
      return el;
    }

    // Legacy use-case режим (categories_use) — запазен за съвместимост.
    var matches = [];
    for (var i = 0; i < all.length; i++) {
      var s = all[i];
      var cats = s.categories_use || [];
      if (cats.indexOf(catId) !== -1) matches.push(s);
    }
    // CAT-MEDITATION: чисто разделение между meditation и природни звуци.
    // (Phone test: "махнеш всички медитации от другите категории".)
    if (catId === 'meditation') {
      var beforeCount = matches.length;
      matches = matches.filter(isRealMeditation);
      console.log('[meditation-filter] meditation cat:', beforeCount, '→', matches.length);
    } else {
      // Други категории: изключи sounds които са meditation music
      // (category_audio === 'meditation' OR passes isRealMeditation).
      var beforeOther = matches.length;
      matches = matches.filter(function (s) {
        return s.category_audio !== 'meditation' && !isRealMeditation(s);
      });
      if (beforeOther !== matches.length) {
        console.log('[meditation-filter]', catId, 'cat excluded meditation music:',
          beforeOther, '→', matches.length);
      }
    }
    // CAT-SORT: sort by profile score (top recommendations first), limit 30.
    var profile = (window.AppState && window.AppState.profile) || null;
    if (profile) {
      matches = sortByProfileScore(matches, profile);
    }
    return matches.slice(0, MAX_SOUNDS_PER_CATEGORY);
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
    return tOrNull('ui.library.cat_audio.' + catId) || ELEM_BG[catId] || prettifyFilename(catId);
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function svgBack() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
  }

  function svgPlay() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  }

  // Category icon SVGs (mirror на home.js)
  function _svg(inner, sw) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }
  var CAT_ICONS = {
    moon:   _svg('<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'),
    zzz:    _svg('<path d="M12 5 L19 5 L12 12 L19 12"/><path d="M4 13 L14 13 L4 21 L14 21"/>'),
    waves:  _svg('<path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>'),
    sun:    _svg('<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4" y1="12" x2="2" y2="12"/><line x1="22" y1="12" x2="20" y2="12"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>'),
    shield: _svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/>'),
    lotus:  _svg('<circle cx="12" cy="6" r="2"/><path d="M8 14c0-2 2-3 4-3s4 1 4 3"/><path d="M3 19c3-3 6-3 9-3s6 0 9 3"/>')
  };

  // ============================================================
  // HTML builders
  // ============================================================

  function buildHeader(cat) {
    var name = getCatName(cat.id);
    var subtitle = getCatSubtitle(cat.id);
    var backAria = t('categoryView.backAria', 'Назад към началото');
    var iconSvg = (cat.icon && CAT_ICONS[cat.icon]) || CAT_ICONS.waves;
    return (
      '<header class="cv-header">' +
        '<button class="cv-back" type="button" data-action="back"' +
          ' aria-label="' + escapeHtml(backAria) + '">' + svgBack() + '</button>' +
        '<div class="cv-header-text">' +
          '<h1 class="cv-title">' +
            '<span class="cv-icon" aria-hidden="true">' + iconSvg + '</span>' +
            '<span class="cv-title-text">' + escapeHtml(name) + '</span>' +
          '</h1>' +
          (subtitle ? '<div class="cv-subtitle">' + escapeHtml(subtitle) + '</div>' : '') +
        '</div>' +
      '</header>'
    );
  }

  function buildInfoSection(cat) {
    var description = getCatDescription(cat.id);
    var faq = getCatFaq(cat.id);
    if (!description && (!faq || faq.length === 0)) {
      // Nothing да показваме засега
      return '';
    }
    // InfoPanel render
    if (window.InfoPanel && window.InfoPanel.create) {
      // Build wrapper и inject InfoPanel след initial render
      return '<div class="cv-info-slot" data-info-slot></div>';
    }
    // Fallback (нямам InfoPanel)
    var html = '<div class="cv-info-fallback">';
    if (description) html += '<p>' + escapeHtml(description) + '</p>';
    if (faq && faq.length) {
      html += '<ul>' + faq.map(function (f) {
        return '<li><strong>' + escapeHtml(f.q) + '</strong><br>' + escapeHtml(f.a) + '</li>';
      }).join('') + '</ul>';
    }
    html += '</div>';
    return html;
  }

  function buildSoundCard(sound) {
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
        '<span class="cv-sound-play" aria-hidden="true">' + svgPlay() + '</span>' +
      '</button>'
    );
  }

  function buildSoundsSection(sounds) {
    var count = sounds.length;
    var label = t('categoryView.soundsCount', 'Звуци (' + count + ')', { n: count });

    if (count === 0) {
      return (
        '<section class="cv-sounds-section">' +
          '<h2 class="cv-section-title">' + escapeHtml(label) + '</h2>' +
          '<div class="cv-empty">' +
            escapeHtml(t('categoryView.noSounds',
              'Скоро ще има звуци в тази категория.')) +
          '</div>' +
        '</section>'
      );
    }

    return (
      '<section class="cv-sounds-section">' +
        '<h2 class="cv-section-title">' + escapeHtml(label) + '</h2>' +
        '<div class="cv-sound-grid">' +
          sounds.map(buildSoundCard).join('') +
        '</div>' +
      '</section>'
    );
  }

  function buildScreenHtml(cat, sounds) {
    return (
      '<div class="cv-screen" data-screen="category" data-cat-id="' + cat.id + '">' +
        buildHeader(cat) +
        buildInfoSection(cat) +
        buildSoundsSection(sounds) +
      '</div>'
    );
  }

  // ============================================================
  // InfoPanel injection (след render)
  // ============================================================

  function injectInfoPanel(cat) {
    var slot = document.querySelector('[data-info-slot]');
    if (!slot) return;
    if (!window.InfoPanel || !window.InfoPanel.create) return;

    var description = getCatDescription(cat.id);
    var faq = getCatFaq(cat.id);

    var panelTitle = t('categoryView.description', 'За какво е');
    var opts = {
      title: panelTitle,
      icon: 'info'
    };
    if (description) {
      opts.body = description;
      opts.expandable = description.length > 200;
    }
    if (faq && faq.length) opts.faq = faq;

    var panel = window.InfoPanel.create(opts);
    slot.appendChild(panel);
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
    var action = actionBtn.getAttribute('data-action');
    if (action === 'back') {
      e.stopPropagation();
      close();
    } else if (action === 'open-sound') {
      e.stopPropagation();
      var soundId = actionBtn.getAttribute('data-sound-id');
      if (soundId) openSound(soundId);
    }
  }

  function onKeyDown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var card = e.target.closest('[data-action="open-sound"]');
    if (card) {
      e.preventDefault();
      var soundId = card.getAttribute('data-sound-id');
      if (soundId) openSound(soundId);
    }
  }

  // SKIP-MIDDLEWARE: tap на sound card → директно Player, без SoundDetail.
  // Информацията от SoundDetail е достъпна през (i) бутон в Player header
  // → bottom sheet с описание / препоръчителен фон / "защо за вас".
  function openSound(soundId) {
    // NAV-CATEGORY-LIST: запази catId + scrollY преди да отидем в Player,
    // за да може back-button.js да restore scroll position при връщане.
    var s = window.AppState;
    if (s && s.saveLastCategoryView && activeCatId) {
      // Опитваме window.scrollY (default) + fallback на documentElement.scrollTop.
      var pos = (typeof window.scrollY === 'number') ? window.scrollY
              : (document.documentElement && document.documentElement.scrollTop) || 0;
      s.saveLastCategoryView(activeCatId, pos);
    }
    if (window.Player && window.Player.open) {
      window.Player.open(soundId);
    } else if (window.SoundDetail && window.SoundDetail.open) {
      window.SoundDetail.open(soundId);
    } else if (window.Library && window.Library.openSound) {
      window.Library.openSound(soundId);
    }
  }

  // ============================================================
  // Render / open / close
  // ============================================================

  function ensureManifest() {
    if (window.AURALIS_MANIFEST) return Promise.resolve(window.AURALIS_MANIFEST);
    return fetch('audio/library/manifest.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { window.AURALIS_MANIFEST = data; return data; })
      .catch(function () { return null; });
  }

  // NAV-POPSTATE: открит истинският bug — Player.close() прави history.back()
  // → popstate fires с {phase:'category'} → app.js handler използваше
  // CategoryView.open(catId) → open() прави pushState (дублиран entry) +
  // 300ms guard fires WRONG за валиден back-from-child (Player) → redirect
  // home → user прескача category list.
  //
  // FIX: отделен openFromPopstate() метод за popstate landing — history
  // вече е позиционирано на правилния entry → НЕ прави pushState (no dup) и
  // НЕ check-ва guard (валиден back from child, не trap-loop).
  // 300ms guard премахнат от open() — beше dead code за trap-loop scenario
  // който вече се route-ва правилно през openFromPopstate.

  function open(catId) {
    if (!catId) return;
    activeCatId = catId;
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('category');
    }
    history.pushState({ phase: 'category', catId: catId }, '');
    render();
  }

  // popstate landing: history вече е на category entry → render-ва БЕЗ
  // pushState (би създал duplicate entry) и БЕЗ guard. catId идва от
  // e.state в app.js popstate handler.
  function openFromPopstate(catId) {
    if (catId) activeCatId = catId;
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('category');
    }
    // Render() handle-ва activeCatId restore от lastCategoryView ако null,
    // и Home fallback ако и него няма.
    render();
  }

  function close() {
    activeCatId = null;
    // Prefer history.back() — popstate handler ще route-не правилно:
    //   - ако стек-ът има 'home' преди нас → user попада там директно
    //   - ако стек-ът има 'category' (от replaceState след Player.close)
    //     → open() guard детектира recent-close и redirect-ва към Home
    // Преди това: history.pushState({phase:'home'}) добавяше НОВ entry
    // вместо да изважда — стек-ът трупа [home, category, sound, home]
    // → следващ back отива на stale 'category' instead of 'home'.
    if (window.history && window.history.length > 1) {
      history.back();
      return;
    }
    // Fallback: shallow history (entry-point start без previous entries).
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('home');
    }
    history.replaceState({ phase: 'home' }, '');
    if (window.Home && window.Home.render) window.Home.render();
  }

  function render() {
    // NAV-CATEGORY-LIST: router landing → ако нямаме activeCatId но имаме
    // saved lastCategoryView (от Player back) → restore catId.
    var s = window.AppState;
    if (!activeCatId && s && s.lastCategoryView && s.lastCategoryView.catId) {
      activeCatId = s.lastCategoryView.catId;
      console.log('[category-view] restored activeCatId from lastCategoryView:', activeCatId);
    }
    if (!activeCatId) {
      // Router landing без context → fallback Home
      if (window.Home && window.Home.render) window.Home.render();
      return;
    }
    var app = el('app');
    if (!app) return;
    // NAV-LISTENER-LEAK fix: clone-and-replace #app преди да закачаме нашия
    // click listener. innerHTML смята само децата — стария listener от
    // предишния модул (Home/Library/etc.) ОСТАВА на #app и двойно fire-ва
    // handler-ите (e.g. UI back → 2× history.back → грешна навигация).
    var fresh = app.cloneNode(false);
    app.parentNode.replaceChild(fresh, app);
    app = fresh;
    // Skeleton while manifest loads
    app.innerHTML = '<div class="cv-loading">' + escapeHtml(t('ui.categoryView.loading','Зарежда се...')) + '</div>';

    ensureManifest().then(function () {
      var cat = findUseCategory(activeCatId);
      if (!cat) {
        app.innerHTML = '<div class="cv-loading">' + escapeHtml(t('ui.categoryView.notFound','Категорията не е намерена.')) + '</div>';
        return;
      }
      var sounds = getSoundsForCategory(activeCatId);
      app.innerHTML = buildScreenHtml(cat, sounds);
      bindEvents(app);
      injectInfoPanel(cat);
      // AUDIO-PRELOAD: prefetch top 15 sounds в background, staggered с
      // 300ms gap между fetch-овете (избягва network burst).
      // Преди беше top 5 → 30s delay при tap на не-cached sound. Сега
      // покрива по-широк range на категорията.
      setTimeout(function () {
        if (!window.AudioEngine || !window.AudioEngine.preloadSound) return;
        var topN = sounds.slice(0, 15);
        topN.forEach(function (s, idx) {
          setTimeout(function () {
            window.AudioEngine.preloadSound(s.id).catch(function () {});
          }, idx * 300);
        });
      }, 500);
      maybeAutoplay(cat, sounds);

      // NAV-CATEGORY-LIST: restore scroll position само ако back от Player
      // и catId match. 50ms задържане дава време DOM да layout-не.
      // Consume → clear lastCategoryView за да не restore-ваме при fresh
      // re-open на същата категория от Home.
      var ss = window.AppState;
      if (ss && ss.lastCategoryView && ss.lastCategoryView.catId === activeCatId
          && typeof ss.lastCategoryView.scrollPos === 'number'
          && ss.lastCategoryView.scrollPos > 0) {
        var savedScroll = ss.lastCategoryView.scrollPos;
        setTimeout(function () {
          window.scrollTo(0, savedScroll);
          console.log('[category-view] scroll restored to', savedScroll);
        }, 50);
        ss.lastCategoryView = null;
        try { localStorage.removeItem('auralis-last-category-view'); } catch (e) {}
      }
    });
  }

  // ============================================================
  // Autoplay flag consumption (P4.4)
  // ============================================================
  // CategoryInfoSheet "Опитайте сега" CTA задава localStorage flag,
  // тук го consume-ваме веднъж и отваряме първия sound (или Player).

  function maybeAutoplay(cat, sounds) {
    if (!window.CategoryInfoSheet || !window.CategoryInfoSheet.consumeAutoplayFlag) return;
    var flag = window.CategoryInfoSheet.consumeAutoplayFlag();
    if (!flag || flag !== cat.id) return;
    if (!sounds || !sounds.length) return;
    // Малка пауза за да се види screen-ът преди да отвори Player
    setTimeout(function () {
      openSound(sounds[0].id);
    }, 250);
  }

  return {
    open: open,
    openFromPopstate: openFromPopstate,
    close: close,
    render: render,
    // Експонирано за Player prev/next навигация — подреденият списък звуци
    // за дадена категория (същата подредба по профил-скор като списъка).
    getSoundsForCategory: getSoundsForCategory
  };
})();
