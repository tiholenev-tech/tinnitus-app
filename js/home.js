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

  // ПОДРЕДБА ПО ЕЛЕМЕНТ (Тихол 06.01): началният екран показва звуците по
  // вид (вода, дъжд, вятър…), не по „повод". Водата първа (предпочитание).
  // id-тата = category_audio в manifest; имената идват от library.cat_audio.
  var USE_CATEGORIES = [
    { id: 'ocean',      icon: 'waves'     },
    { id: 'underwater', icon: 'deep'      },
    { id: 'river',      icon: 'stream'    },
    { id: 'waterfall',  icon: 'waterfall' },
    { id: 'rain',       icon: 'rain'      },
    { id: 'wind',       icon: 'wind'      },
    { id: 'forest',     icon: 'tree'      },
    { id: 'fire',       icon: 'fire'      },
    { id: 'meditation', icon: 'lotus'     },
    { id: 'noise',      icon: 'equalizer' },
    { id: 'ambient',    icon: 'drone'     }
  ];

  // BG fallback (име + кратко описание). Името основно идва от
  // library.cat_audio.<id>; тук е резервно + подзаглавие.
  var CAT_FALLBACK_BG = {
    ocean:      { name: 'Вълни',     subtitle: 'Морски вълни и прибой' },
    underwater: { name: 'Подводно',  subtitle: 'Звуци под водата' },
    river:      { name: 'Река',      subtitle: 'Реки и потоци' },
    waterfall:  { name: 'Водопад',   subtitle: 'Шум на водопад' },
    rain:       { name: 'Дъжд',      subtitle: 'Дъжд и капки' },
    wind:       { name: 'Вятър',     subtitle: 'Вятър и бриз' },
    forest:     { name: 'Гора',      subtitle: 'Гора и птици' },
    fire:       { name: 'Огън',      subtitle: 'Огън в камината' },
    meditation: { name: 'Медитация', subtitle: 'Спокойна музика' },
    noise:      { name: 'Шум',       subtitle: 'Кафяв и розов шум' },
    ambient:    { name: 'Атмосфера', subtitle: 'Дълбоки тонове' }
  };

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

  // Phone test fix: преди това използвахме manifest.categories_use[].sound_count
  // което беше raw count БЕЗ filter — meditation показваше 142, но при
  // CategoryView филтър остават ~30. Сега броим същото като CategoryView:
  //   • meditation → САМО category_audio==='meditation' (music sounds)
  //   • други → exclude meditation music от count
  // Това гарантира че числото на cards == списъка който user вижда.
  // ПОДРЕДБА ПО ЕЛЕМЕНТ: броим звуците с category_audio === catId
  // (същото като CategoryView element-режим → числото == списъка).
  function getCountForCategory(catId) {
    if (!window.AURALIS_MANIFEST) return 0;
    var sounds = window.AURALIS_MANIFEST.sounds || [];
    var count = 0;
    for (var j = 0; j < sounds.length; j++) {
      if (sounds[j].category_audio === catId) count++;
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
    // Map профил → препоръчани ЕЛЕМЕНТИ (ring индикация на картите).
    var MAP = {
      'TH_C': ['ocean', 'underwater'],
      'DN_S': ['river', 'rain'],
      'SS_R': ['ocean', 'rain'],
      'SM_F': ['meditation', 'underwater'],
      'HB_M': ['wind', 'forest']
    };
    return MAP[profile] || [];
  }

  // ============================================================
  // SVG icons
  // ============================================================

  // ============================================================
  // SVG icons — chat.php style (stroke-based, currentColor)
  // ============================================================

  function svg(inner, strokeWidth) {
    var sw = strokeWidth || 1.8;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var SVG = {
    arrow: svg('<polyline points="9 18 15 12 9 6"/>', 2),

    // Елемент-икони (outline, consistent stroke)
    deep: svg(
      '<path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>' +
      '<path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>' +
      '<path d="M12 3v6"/><path d="M9.5 6.5 12 9l2.5-2.5"/>'
    ),
    stream: svg(
      '<path d="M3 7c4 0 4 3 8 3s4-3 8-3"/>' +
      '<path d="M3 13c4 0 4 3 8 3s4-3 8-3"/>' +
      '<path d="M5 19c3 0 3 2 7 2"/>'
    ),
    waterfall: svg(
      '<path d="M5 3v8"/><path d="M10 3v10"/><path d="M14 3v9"/><path d="M19 3v8"/>' +
      '<path d="M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0"/>'
    ),
    rain: svg(
      '<path d="M7 14a5 5 0 011-9.8A5.5 5.5 0 0118 6.5 4 4 0 0117 14H7z"/>' +
      '<line x1="8" y1="18" x2="7" y2="21"/>' +
      '<line x1="12" y1="18" x2="11" y2="21"/>' +
      '<line x1="16" y1="18" x2="15" y2="21"/>'
    ),
    wind: svg(
      '<path d="M3 8h11a3 3 0 10-3-3"/>' +
      '<path d="M3 12h15a3 3 0 11-3 3"/>' +
      '<path d="M3 16h9a2.5 2.5 0 11-2.5 2.5"/>'
    ),
    tree: svg(
      '<path d="M12 2 6 11h12L12 2z"/>' +
      '<path d="M12 8 7 16h10L12 8z"/>' +
      '<line x1="12" y1="16" x2="12" y2="22"/>'
    ),
    fire: svg(
      '<path d="M12 2c1 3 4 4 4 8a4 4 0 01-8 0c0-1 .5-2 1-2.5C9 9 12 7 12 2z"/>' +
      '<path d="M12 22a5 5 0 005-5c0-2-1.5-3.5-2.5-4.5C14 14 13 15 12 15s-2-1-2.5-2.5C8.5 13.5 7 15 7 17a5 5 0 005 5z"/>'
    ),
    drone: svg(
      '<circle cx="12" cy="12" r="2"/>' +
      '<path d="M7.5 7.5a6.4 6.4 0 000 9"/>' +
      '<path d="M16.5 7.5a6.4 6.4 0 010 9"/>' +
      '<path d="M4.5 4.5a10.6 10.6 0 000 15"/>' +
      '<path d="M19.5 4.5a10.6 10.6 0 010 15"/>'
    ),

    // legacy use-case icons (запазени за съвместимост)
    moon:   svg('<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'),
    zzz:    svg(
      // Cascading Z's — top-right (smaller) + bottom-left (larger)
      '<path d="M12 5 L19 5 L12 12 L19 12"/>' +
      '<path d="M4 13 L14 13 L4 21 L14 21"/>'
    ),
    waves:  svg(
      '<path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>' +
      '<path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>' +
      '<path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>'
    ),
    sun: svg(
      '<circle cx="12" cy="12" r="4"/>' +
      '<line x1="12" y1="2" x2="12" y2="4"/>' +
      '<line x1="12" y1="20" x2="12" y2="22"/>' +
      '<line x1="4" y1="12" x2="2" y2="12"/>' +
      '<line x1="22" y1="12" x2="20" y2="12"/>' +
      '<line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>' +
      '<line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>' +
      '<line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/>' +
      '<line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>'
    ),
    shield: svg(
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
      '<polyline points="9 11 11 13 15 9"/>'
    ),
    lotus: svg(
      '<circle cx="12" cy="6" r="2"/>' +
      '<path d="M8 14c0-2 2-3 4-3s4 1 4 3"/>' +
      '<path d="M3 19c3-3 6-3 9-3s6 0 9 3"/>'
    ),

    // Bottom row icons
    book: svg(
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
      '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'
    ),
    info: svg(
      '<circle cx="12" cy="12" r="10"/>' +
      '<line x1="12" y1="16" x2="12" y2="12"/>' +
      '<line x1="12" y1="8" x2="12.01" y2="8"/>',
      2
    ),
    equalizer: svg(
      '<line x1="6" y1="6" x2="6" y2="18"/>' +
      '<line x1="10" y1="3" x2="10" y2="21"/>' +
      '<line x1="14" y1="8" x2="14" y2="16"/>' +
      '<line x1="18" y1="5" x2="18" y2="19"/>',
      2
    ),
    speaker: svg(
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>' +
      '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
      '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
      2
    ),

    // „Моите тестове" иконки
    testProfile: svg(
      '<rect x="5" y="3.5" width="14" height="17" rx="2"/>' +
      '<path d="M9 3.5h6v3H9z"/>' +
      '<path d="M8.5 12l2 2 4-4"/>'
    ),
    testThi: svg('<polyline points="3 12 7 12 10 5 14 19 17 12 21 12"/>'),
    testPitch: svg(
      '<polygon points="10 5 6 9 3 9 3 15 6 15 10 19 10 5"/>' +
      '<path d="M14 9a4 4 0 0 1 0 6"/>' +
      '<path d="M17 6a8 8 0 0 1 0 12"/>'
    )
  };

  // ============================================================
  // HTML builders
  // ============================================================

  function buildCategoryCard(cat, recommended) {
    var bgFallback = CAT_FALLBACK_BG[cat.id] || { name: cat.id, subtitle: '' };
    // Името по елемент идва от library.cat_audio.<id> (Вълни, Дъжд…).
    var name = t('ui.library.cat_audio.' + cat.id, bgFallback.name);
    var subtitle = t('home.cat.' + cat.id + '.subtitle', bgFallback.subtitle);
    // Strip TODO: prefix ако EN stub дойде като резултат (fallback към БГ)
    if (name && name.indexOf('TODO:') === 0) name = bgFallback.name;
    if (subtitle && subtitle.indexOf('TODO:') === 0) subtitle = bgFallback.subtitle;

    var count = getCountForCategory(cat.id);
    var countWord = (count === 1) ? 'звук' : 'звука';   // БГ единствено/множествено
    var countText = count > 0
      ? t('home.soundCountFmt', count + ' ' + countWord, { n: count })
      : null; // count=0 → не показваме count line (subtitle вече описва)
    var isRecommended = recommended.indexOf(cat.id) !== -1;
    var iconSvg = SVG[cat.icon] || SVG.waves;

    var ariaLabel = name + (countText ? ' — ' + countText : '');
    var infoAria = t('home.infoAria', 'Информация за категорията');

    // Cards трябва да са wrapper <div>, защото <button> вложен в <button>
    // не е валиден HTML. (i) бутонът е отделен <button> с stopPropagation.
    return (
      '<div class="home-cat-card-wrap' + (isRecommended ? ' is-recommended' : '') + '"' +
        ' data-cat-id="' + cat.id + '">' +
        '<button class="glass home-cat-card" type="button"' +
          ' data-cat-id="' + cat.id + '" data-action="open-cat"' +
          ' aria-label="' + escapeHtml(ariaLabel) + '">' +
          '<span class="shine"></span>' +
          '<span class="shine shine-bottom"></span>' +
          '<span class="glow"></span>' +
          '<span class="glow glow-bottom"></span>' +
          '<span class="home-cat-icon" aria-hidden="true">' + iconSvg + '</span>' +
          '<span class="home-cat-body">' +
            '<span class="home-cat-name">' + escapeHtml(name) + '</span>' +
            '<span class="home-cat-subtitle">' + escapeHtml(subtitle) + '</span>' +
            (countText
              ? '<span class="home-cat-count">' + escapeHtml(countText) + '</span>'
              : '') +
          '</span>' +
          '<span class="home-cat-arrow" aria-hidden="true">' + SVG.arrow + '</span>' +
        '</button>' +
        // ★ badge изтрит — recommendation indication остава на ring + (i)
        // позицията. Per spec design в P4.
        '<button class="home-cat-info" type="button"' +
          ' data-action="info-cat" data-cat-id="' + cat.id + '"' +
          ' aria-label="' + escapeHtml(infoAria + ': ' + name) + '">' +
          SVG.info +
        '</button>' +
      '</div>'
    );
  }

  // PACK C T1 — Constants
  var THI_GOAL = 40;
  var THI_RETEST_DAY_MIN = 13;

  // Pitch retest banner — soft caution ако последен тест е < N дни.
  // Pitch-matching тестът е най-надежден при няколко дни между измерванията
  // (test-retest reliability); банерът обаче СТОИ постоянно (user decision).
  var PITCH_RETEST_MIN_DAYS = 7;
  var STORAGE_VOLUME = 'auralis-master-volume';

  // Bug 5 (T1.5): THI-ENTRY CTA — показва се ако calibration done но
  // baseline още не. Подсказва user-а да направи THI оценка преди да
  // се появи бадж. Над всички останали Home cards (highest priority).
  function buildThiCta() {
    var s = window.AppState || {};
    var baseline = (typeof s.thiBaseline === 'number') ? s.thiBaseline : null;
    if (baseline !== null) return '';
    // Show само ако calibration вече е завършен (т.е. user е past onboarding
    // флоу). Иначе изглежда objfusing на fresh-quiz user.
    if (!s.calibrationDone) return '';
    var title = t('home.thiCta.title', 'Завършете научната оценка');
    var body  = t('home.thiCta.body',  'Попълнете THI тест (5 минути) за персонализиран план');
    var btn   = t('home.thiCta.button', 'Започнете теста');
    return (
      '<button class="home-thi-cta glass" type="button" data-action="thi-start"' +
        ' aria-label="' + escapeHtml(title) + '">' +
        '<span class="shine" aria-hidden="true"></span>' +
        '<span class="shine shine-bottom" aria-hidden="true"></span>' +
        '<span class="home-thi-cta-content">' +
          '<span class="home-thi-cta-title">' + escapeHtml(title) + '</span>' +
          '<span class="home-thi-cta-body">' + escapeHtml(body) + '</span>' +
        '</span>' +
        '<span class="home-thi-cta-btn">' + escapeHtml(btn) + ' ›</span>' +
      '</button>'
    );
  }

  function openThiStart() {
    if (window.ThiBaseline && window.ThiBaseline.open) window.ThiBaseline.open();
  }

  // ============================================================
  // Favorites entry — heart button до заглавието
  // ============================================================
  //
  // Phone test ask (2026-05-28): премахната старата секция с pills
  // (имаше bug с английски id-та + лошо позициониране на home).
  // Сега: heart icon до заглавието → отваря fullscreen Favorites page
  // (категория-style 2-col grid с правилни БГ имена от manifest).

  function buildFavoritesTitleButton() {
    // i18n key за Code 3: home.favoritesBtn.aria → "Любими"
    var label = t('home.favoritesBtn.aria', 'Любими');
    // Стилизирано чрез .home-favorites-btn в css/home.css —
    // position:absolute top:8px right:52px (точно вляво от .home-science-btn
    // с 8px gap). Така heart + ? са на ИДЕНТИЧНА вертикална позиция.
    return (
      '<button class="home-favorites-btn" type="button"' +
        ' data-action="open-favorites-page"' +
        ' aria-label="' + escapeHtml(label) + '">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
          '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' +
        '</svg>' +
      '</button>'
    );
  }

  function openFavoritesPage() {
    if (window.Favorites && window.Favorites.openPage) {
      if (window.AppState && window.AppState.transition) {
        window.AppState.transition('home'); // safe parent phase
      }
      window.Favorites.openPage();
    } else if (window.Favorites && window.Favorites.showSheet) {
      // Fallback на legacy bottom sheet ако нов API липсва.
      window.Favorites.showSheet();
    }
  }

  // Science Info quick-access "?" бутон близо до THI badge.
  // Видим винаги (entry point към fullscreen научен прозорец).
  function buildScienceQuickButton() {
    var label = t('science.openLabel', 'Научна основа');
    return (
      '<button class="home-science-btn" type="button" data-action="open-science"' +
        ' aria-label="' + escapeHtml(label) + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
          ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<circle cx="12" cy="12" r="10"/>' +
          '<path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>' +
          '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
        '</svg>' +
      '</button>'
    );
  }

  function buildThiBanner() {
    var s = window.AppState || {};
    var day = s.currentProgramDay || 0;
    var baseline = (typeof s.thiBaseline === 'number') ? s.thiBaseline : null;
    var day14 = (typeof s.thiDay14 === 'number') ? s.thiDay14 : null;
    // ONBOARDING SIMPLIFICATION: THI вече НЕ е в Ден-1 онбординга. Ако baseline
    // още не е направен → нежна ПО ЖЕЛАНИЕ покана (търпеливо напомняне, не насила).
    if (baseline === null) {
      var bTitle = t('thi.homeBanner.baseline_title', 'Кратка оценка на тинитуса');
      var bBody  = t('thi.homeBanner.baseline_body', 'По желание — помага да следим напредъка Ви. Отнема 2–3 минути.');
      var bCta   = t('thi.homeBanner.baseline_cta', 'Направи оценка');
      return (
        '<button class="home-thi-banner" type="button" data-action="thi-retest"' +
          ' aria-label="' + escapeHtml(bTitle) + '">' +
          '<span class="home-thi-banner-content">' +
            '<span class="home-thi-banner-title">' + escapeHtml(bTitle) + '</span>' +
            '<span class="home-thi-banner-body">' + escapeHtml(bBody) + '</span>' +
          '</span>' +
          '<span class="home-thi-banner-cta">' + escapeHtml(bCta) + ' ›</span>' +
        '</button>'
      );
    }
    if (day14 !== null || day < THI_RETEST_DAY_MIN) return '';
    var title = t('thi.homeBanner.retest_title', 'Време е за вторично THI измерване');
    var body  = t('thi.homeBanner.retest_body', 'Изпълнихте 13 дни от програмата. Направете втория тест за сравнение.');
    var cta   = t('thi.homeBanner.retest_cta', 'Направи тест');
    return (
      '<button class="home-thi-banner" type="button" data-action="thi-retest"' +
        ' aria-label="' + escapeHtml(title) + '">' +
        '<span class="home-thi-banner-content">' +
          '<span class="home-thi-banner-title">' + escapeHtml(title) + '</span>' +
          '<span class="home-thi-banner-body">' + escapeHtml(body) + '</span>' +
        '</span>' +
        '<span class="home-thi-banner-cta">' + escapeHtml(cta) + ' ›</span>' +
      '</button>'
    );
  }

  function buildThiBadge() {
    var s = window.AppState || {};
    if (typeof s.thiBaseline !== 'number') return '';
    var current = (typeof s.thiDay14 === 'number') ? s.thiDay14 : s.thiBaseline;
    var label = t('thi.badge.label', 'THI');
    var goalText = t('thi.badge.goal', 'цел < {goal}', { goal: THI_GOAL });
    var fillPct = Math.max(0, Math.min(100, current));
    var goalPct = Math.max(0, Math.min(100, THI_GOAL));
    var hint = t('thi.badge.tapHint', 'Натиснете за подробности');
    return (
      '<button class="home-thi-badge glass" type="button" data-action="open-thi-detail"' +
        ' aria-label="' + escapeHtml(label + ': ' + current + '. ' + hint) + '">' +
        '<span class="shine" aria-hidden="true"></span>' +
        '<span class="shine shine-bottom" aria-hidden="true"></span>' +
        '<span class="home-thi-head">' +
          '<span class="home-thi-label">' + escapeHtml(label) + '</span>' +
          '<span class="home-thi-score">' + current + '</span>' +
        '</span>' +
        '<span class="home-thi-goal">' + escapeHtml(goalText) + '</span>' +
        '<span class="home-thi-progress" aria-hidden="true">' +
          '<span class="home-thi-progress-fill" style="width:' + fillPct + '%"></span>' +
          '<span class="home-thi-progress-goal" style="left:' + goalPct + '%"></span>' +
        '</span>' +
      '</button>'
    );
  }

  function openThiRetest() {
    if (window.ThiBaseline && window.ThiBaseline.open) window.ThiBaseline.open();
  }

  // ============================================================
  // Pitch retest banner — ВИНАГИ видим (user decision). Adaptive copy +
  // info бутон (→ ScienceInfo s3, цитати Pantev 2012 / Stein 2015) + CTA.
  // ============================================================

  function getLastPitchTs() {
    var s = window.AppState || {};
    var arr = s.pitchTests;
    if (arr && arr.length) {
      var last = arr[arr.length - 1];
      return (last && last.timestamp) || null;
    }
    return null;
  }

  function buildPitchBanner() {
    var s = window.AppState || {};
    var done = !!(s.isPitchTestDone && s.isPitchTestDone());
    var freq = (s.getNotchFreq && s.getNotchFreq()) || null;

    var title, body, cta;
    if (done && freq) {
      title = t('home.pitch.done_title', 'Вашата честота');
      body  = t('home.pitch.refine_body', 'Намерена: {hz} Hz. Искате ли да я уточним по-точно? Отнема 5 минути.', { hz: freq });
      cta   = t('home.pitch.refine_cta', 'Уточни честотата');
    } else if (done) {
      title = t('home.pitch.skipped_title', 'Тон на тинитуса');
      body  = t('home.pitch.skipped_body', 'Тестът беше пропуснат. Направете го за персонализиран филтър.');
      cta   = t('home.pitch.skipped_cta', 'Направи тест');
    } else {
      title = t('home.pitch.new_title', 'Тон на тинитуса');
      body  = t('home.pitch.new_body', 'Открийте честотата на вашия тинитус за персонализиран notch филтър.');
      cta   = t('home.pitch.new_cta', 'Направи тест');
    }

    var cautionHtml = '';
    var lastTs = getLastPitchTs();
    if (lastTs) {
      var days = Math.floor((Date.now() - lastTs) / 86400000);
      if (days < PITCH_RETEST_MIN_DAYS) {
        var caution = t('home.pitch.caution',
          'Не е нужно да тествате често — резултатите са най-надеждни при няколко дни между измерванията.');
        cautionHtml = '<span class="home-pitch-caution">' + escapeHtml(caution) + '</span>';
      }
    }

    var infoAria = t('home.pitch.infoAria', 'Научна информация за теста');
    return (
      '<div class="home-pitch-card glass sm">' +
        '<span class="shine" aria-hidden="true"></span>' +
        '<span class="shine shine-bottom" aria-hidden="true"></span>' +
        '<div class="home-pitch-main">' +
          '<div class="home-pitch-text">' +
            '<span class="home-pitch-title">' + escapeHtml(title) + '</span>' +
            '<span class="home-pitch-body">' + escapeHtml(body) + '</span>' +
            cautionHtml +
          '</div>' +
          '<button class="home-pitch-info" type="button" data-action="pitch-info"' +
            ' aria-label="' + escapeHtml(infoAria) + '">' + SVG.info + '</button>' +
        '</div>' +
        '<button class="home-pitch-cta" type="button" data-action="pitch-retest">' +
          escapeHtml(cta) + ' ›' +
        '</button>' +
      '</div>'
    );
  }

  function openPitchTest() {
    if (!window.PitchTest || !window.PitchTest.open) return;
    // BUG FIX: precise (дълъг, „уточни") САМО ако вече има ВАЛИДНА честота.
    // Преди това „пропуснат/без честота" състояние (done, но freq=null) пускаше
    // дългия precise режим без награда. Сега → нормалния кратък тест + награда.
    var s = window.AppState || {};
    var hasFreq = !!(s.getNotchFreq && s.getNotchFreq());
    window.PitchTest.open(hasFreq ? { mode: 'precise' } : undefined);
  }

  function openPitchInfo() {
    if (window.ScienceInfo && window.ScienceInfo.open) window.ScienceInfo.open('s3');
  }

  // ============================================================
  // „МОИТЕ ТЕСТОВЕ" — единна секция (Тихол 31.05 / 06.01). Само ДВАТА
  // периодични теста: THI (оценка) + Тон (честота). Профилът (15 въпроса)
  // е еднократен — не се показва тук. Всеки тест в .glass карта с:
  //   • ясно ИМЕ + СТАТУС (THI → СТЕПЕН, не голо число; Тон → честота)
  //   • прогрес-бар + „Продължи" ако има НЕДОВЪРШЕН тест (resume от където спря)
  //   • последният резултат СТОИ докато новият тест не завърши
  //   • напомняне за повтаряне по документацията (THI на 14-ия ден).
  // ============================================================

  function fmtHz(hz) {
    if (!hz || hz <= 0) return '';
    if (hz >= 1000) {
      var k = hz / 1000;
      return (k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)) + ' kHz';
    }
    return hz + ' Hz';
  }

  // THI степен по тежест (docs/research/18 — Newman граници), вместо голо число.
  function thiGrade(score) {
    if (typeof score !== 'number') return '';
    if (score <= 16) return t('home.tests.thi.grade1', 'Много леко');
    if (score <= 36) return t('home.tests.thi.grade2', 'Леко');
    if (score <= 56) return t('home.tests.thi.grade3', 'Умерено');
    if (score <= 76) return t('home.tests.thi.grade4', 'Тежко');
    return t('home.tests.thi.grade5', 'Много тежко');
  }

  // o = { icon, name, statusMain, statusSub, state, btnLabel, btnAction,
  //       btnSecondary, progressPct (null=без бар), progressText }
  function buildTestCard(o) {
    var progressHtml = '';
    if (o.progressPct != null) {
      progressHtml =
        '<div class="home-test-progress">' +
          '<div class="home-test-progress-bar" role="progressbar" aria-valuemin="0"' +
            ' aria-valuemax="100" aria-valuenow="' + o.progressPct + '">' +
            '<div class="home-test-progress-fill" style="width:' + o.progressPct + '%"></div>' +
          '</div>' +
          (o.progressText
            ? '<span class="home-test-progress-text">' + escapeHtml(o.progressText) + '</span>'
            : '') +
        '</div>';
    }
    // При недовършен тест — втора възможност „Започни отначало" (до „Продължи").
    var restartHtml = o.restartAction
      ? '<button class="home-test-restart" type="button" data-action="' + o.restartAction + '">' +
          escapeHtml(o.restartLabel || 'Започни отначало') + '</button>'
      : '';
    return (
      '<div class="home-test-card glass sm" data-state="' + (o.state || 'todo') + '">' +
        '<span class="shine" aria-hidden="true"></span>' +
        '<span class="shine shine-bottom" aria-hidden="true"></span>' +
        '<span class="glow" aria-hidden="true"></span>' +
        '<span class="glow glow-bottom" aria-hidden="true"></span>' +
        '<div class="home-test-card-row">' +
          '<span class="home-test-icon" aria-hidden="true">' + (o.icon || '') + '</span>' +
          '<span class="home-test-info">' +
            '<span class="home-test-name">' + escapeHtml(o.name) + '</span>' +
            '<span class="home-test-status">' + escapeHtml(o.statusMain) + '</span>' +
            (o.statusSub
              ? '<span class="home-test-substatus">' + escapeHtml(o.statusSub) + '</span>'
              : '') +
          '</span>' +
          '<button class="home-test-btn' + (o.btnSecondary ? ' is-secondary' : '') + '"' +
            ' type="button" data-action="' + o.btnAction + '">' + escapeHtml(o.btnLabel) + '</button>' +
        '</div>' +
        progressHtml +
        restartHtml +
      '</div>'
    );
  }

  function buildThiTestCard() {
    var s = window.AppState || {};
    var active = (window.ThiBaseline && window.ThiBaseline.activeProgress)
      ? window.ThiBaseline.activeProgress() : null;
    var has = (typeof s.thiBaseline === 'number');
    var day14 = (typeof s.thiDay14 === 'number');
    var day = s.currentProgramDay || 0;
    var o = { icon: SVG.testThi, name: t('home.tests.thi.name', 'Оценка на тинитуса') };

    if (active) {
      // Недовършена оценка → продължи; последният резултат (ако има) СТОИ.
      o.state = 'progress';
      o.statusMain = has
        ? t('home.tests.lastFmt', 'Последно: {v}', { v: thiGrade(s.thiBaseline) })
        : t('home.tests.unfinishedF', 'Недовършена оценка');
      o.statusSub = t('home.tests.thi.resumeFmt', 'Има недовършен тест · въпрос {n} от {total}',
        { n: active.index + 1, total: active.total });
      o.btnLabel = t('home.tests.continueBtn', 'Продължи');
      o.btnAction = 'thi-resume';
      o.progressPct = Math.round((active.answered / active.total) * 100);
      o.progressText = active.answered + ' / ' + active.total;
      o.restartLabel = t('home.tests.restartBtn', 'Започни отначало');
      o.restartAction = 'thi-restart';
    } else if (has && day14) {
      o.state = 'done';
      o.statusMain = t('home.tests.thi.compared', 'Сравнение готово');
      o.statusSub = t('home.tests.thi.comparedSub', 'Ден 1 → Ден 14');
      o.btnLabel = t('home.tests.viewBtn', 'Виж'); o.btnAction = 'open-thi-detail'; o.btnSecondary = true;
    } else if (has && day >= THI_RETEST_DAY_MIN) {
      // Програмата стигна 14-ия ден → активна покана за повторна оценка (MCID).
      o.state = 'due';
      o.statusMain = thiGrade(s.thiBaseline);
      o.statusSub = t('home.tests.thi.due', 'Време за повторна оценка');
      o.btnLabel = t('home.tests.retestBtn', 'Направи отново'); o.btnAction = 'thi-start';
    } else if (has) {
      o.state = 'done';
      o.statusMain = thiGrade(s.thiBaseline);
      o.statusSub = t('home.tests.thi.readySub', 'оценка готова');
      o.btnLabel = t('home.tests.viewBtn', 'Виж'); o.btnAction = 'open-thi-detail'; o.btnSecondary = true;
    } else {
      o.state = 'todo';
      o.statusMain = t('home.tests.thi.todoMain', 'Не е направена');
      o.statusSub = t('home.tests.thi.todoSub', '25 въпроса · по желание');
      o.btnLabel = t('home.tests.doBtn', 'Направи'); o.btnAction = 'thi-start';
    }
    return buildTestCard(o);
  }

  function buildPitchTestCard() {
    var s = window.AppState || {};
    var active = (window.PitchTest && window.PitchTest.activeProgress)
      ? window.PitchTest.activeProgress() : null;
    var freq = (s.getNotchFreq && s.getNotchFreq()) || null;
    var pitchDone = !!(s.isPitchTestDone && s.isPitchTestDone());
    var o = { icon: SVG.testPitch, name: t('home.tests.pitch.name', 'Тон на тинитуса') };

    if (active) {
      o.state = 'progress';
      o.statusMain = freq
        ? t('home.tests.lastFmt', 'Последно: {v}', { v: fmtHz(freq) })
        : t('home.tests.unfinishedM', 'Недовършен тест');
      if (active.phase === 'octave') {
        o.statusSub = t('home.tests.pitch.resumeOctave', 'Има недовършен тест · финална проверка');
        o.progressPct = 95;
        o.progressText = active.total + ' / ' + active.total;
      } else {
        o.statusSub = t('home.tests.pitch.resumeFmt', 'Има недовършен тест · замерване {n} от {total}',
          { n: active.n + 1, total: active.total });
        o.progressPct = Math.round((active.n / active.total) * 100);
        o.progressText = Math.min(active.n, active.total) + ' / ' + active.total;
      }
      o.btnLabel = t('home.tests.continueBtn', 'Продължи');
      o.btnAction = 'pitch-resume';
      o.restartLabel = t('home.tests.restartBtn', 'Започни отначало');
      o.restartAction = 'pitch-restart';
    } else if (freq) {
      o.state = 'done';
      o.statusMain = t('home.tests.pitch.freqFmt', 'Честота {hz}', { hz: fmtHz(freq) });
      o.statusSub = t('home.tests.pitch.readySub', 'готов');
      o.btnLabel = t('home.tests.refineBtn', 'Уточни'); o.btnAction = 'pitch-retest'; o.btnSecondary = true;
    } else if (pitchDone) {
      o.state = 'todo';
      o.statusMain = t('home.tests.pitch.skippedMain', 'Пропуснат');
      o.statusSub = t('home.tests.pitch.skippedSub', 'направете го за личен филтър');
      o.btnLabel = t('home.tests.doBtn', 'Направи'); o.btnAction = 'pitch-retest';
    } else {
      o.state = 'todo';
      o.statusMain = t('home.tests.pitch.todoMain', 'Не е направен');
      o.statusSub = t('home.tests.pitch.todoSub', '~5 минути · по желание');
      o.btnLabel = t('home.tests.doBtn', 'Направи'); o.btnAction = 'pitch-retest';
    }
    return buildTestCard(o);
  }

  // Дневник карта — горе до тестовете, ДОКАТО не е попълнен днешният запис
  // (Тихол: напомняне + видимост). Скрива се щом днес е попълнен.
  function buildDiaryCard() {
    var s = window.AppState || {};
    var started = !!s.programStartDate;
    var day = s.currentProgramDay || 1;
    var tk = s.todayKey ? s.todayKey() : null;
    var todayEntry = (s.diaryEntries && tk) ? s.diaryEntries[tk] : null;
    var todayDone = !!(todayEntry && (todayEntry.evening || todayEntry.cbtCompleted));
    var o = { icon: SVG.book, name: t('home.diary.name', 'Дневник'), btnAction: 'open-diary' };
    if (!started) {
      o.state = 'todo';
      o.statusMain = t('home.diary.todoMain', 'Започнете да следите');
      o.statusSub = t('home.diary.todoSub', 'Сън и настроение · 14 дни');
      o.btnLabel = t('home.diary.startBtn', 'Започни');
    } else if (!todayDone) {
      o.state = 'due';
      o.statusMain = t('home.diary.dueFmt', 'Ден {n} от 14', { n: Math.min(day, 14) });
      o.statusSub = t('home.diary.dueSub', 'Попълнете днешния запис');
      o.btnLabel = t('home.diary.fillBtn', 'Попълни');
    } else {
      return '';   // днес е попълнен → не показваме (достъпен от долния ред)
    }
    return buildTestCard(o);
  }

  function buildTestsSection() {
    var thiCard = buildThiTestCard();
    var pitchCard = buildPitchTestCard();
    var diaryCard = buildDiaryCard();
    // брояч „готови" — done = завършен с резултат (не недовършен, не „по желание").
    var s = window.AppState || {};
    var thiDoneN = (typeof s.thiBaseline === 'number'
      && !(window.ThiBaseline && window.ThiBaseline.activeProgress && window.ThiBaseline.activeProgress())) ? 1 : 0;
    var pitchDoneN = ((s.getNotchFreq && s.getNotchFreq())
      && !(window.PitchTest && window.PitchTest.activeProgress && window.PitchTest.activeProgress())) ? 1 : 0;
    var doneCount = thiDoneN + pitchDoneN;
    var counter = t('home.tests.counterFmt', '{n} от {total} готови', { n: doneCount, total: 2 });

    return (
      '<section class="home-tests" aria-labelledby="homeTestsTitle">' +
        '<div class="home-tests-head">' +
          '<h2 class="home-tests-title" id="homeTestsTitle">' +
            escapeHtml(t('home.tests.title', 'Моите тестове')) + '</h2>' +
          '<span class="home-tests-counter" data-full="' + (doneCount === 2 ? 'true' : 'false') + '">' +
            escapeHtml(counter) + '</span>' +
        '</div>' +
        '<div class="home-tests-list">' + thiCard + pitchCard + diaryCard + '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // Master volume card — преместен от Настройки (user decision). Slider-only,
  // без keyboard. Persist в localStorage (същия ключ като старата Settings).
  // ============================================================

  function getMasterVol() {
    if (window.AudioEngine && window.AudioEngine.getMasterVolume) {
      return window.AudioEngine.getMasterVolume();
    }
    try {
      var saved = localStorage.getItem(STORAGE_VOLUME);
      if (saved !== null) {
        var n = parseInt(saved, 10);
        if (!isNaN(n)) return n;
      }
    } catch (e) {}
    return 50;
  }

  function buildVolumeCard() {
    var vol = getMasterVol();
    var label = t('home.volume.label', 'Сила на звука');
    var aria  = t('home.volume.aria', 'Сила на звука 0-100');
    return (
      '<div class="home-volume-card glass sm">' +
        '<span class="shine" aria-hidden="true"></span>' +
        '<span class="shine shine-bottom" aria-hidden="true"></span>' +
        '<div class="home-volume-head">' +
          '<span class="home-volume-icon" aria-hidden="true">' + SVG.speaker + '</span>' +
          '<span class="home-volume-label">' + escapeHtml(label) + '</span>' +
          '<span class="home-volume-value" id="homeVolValue">' + vol + '%</span>' +
        '</div>' +
        '<input type="range" class="home-volume-slider" id="homeVolSlider"' +
          ' min="0" max="100" step="1" value="' + vol + '"' +
          ' aria-label="' + escapeHtml(aria) + '">' +
      '</div>'
    );
  }

  var homeVolTimer = null;
  function onHomeVolInput(e) {
    var val = parseInt(e.currentTarget.value, 10);
    if (isNaN(val)) return;
    val = Math.max(0, Math.min(100, val));
    var label = el('homeVolValue');
    if (label) label.textContent = val + '%';
    var isFinal = (e.type === 'change');
    if (window.AudioEngine) {
      // Preview noise: докато потребителят влачи, пускаме pink noise през
      // master gain → той чува реалната сила и сам преценява какво да остави.
      // На release (change) оставяме звука кратко на финалното ниво, после fade.
      if (!isFinal && window.AudioEngine.startVolumePreview) {
        window.AudioEngine.startVolumePreview();
      }
      if (window.AudioEngine.setMasterVolume) {
        window.AudioEngine.setMasterVolume(val, isFinal);
      }
      if (isFinal && window.AudioEngine.stopVolumePreview) {
        window.AudioEngine.stopVolumePreview(800);
      }
    }
    // 'change' = финален commit (потребителят пусна плъзгача) → пиши веднага,
    // за да не се загуби стойността ако навигира < 300ms след това.
    // 'input' = междинно влачене → debounce за да не спамим localStorage.
    if (e.type === 'change') {
      if (homeVolTimer) { clearTimeout(homeVolTimer); homeVolTimer = null; }
      try { localStorage.setItem(STORAGE_VOLUME, String(val)); } catch (e2) {}
      return;
    }
    if (homeVolTimer) clearTimeout(homeVolTimer);
    homeVolTimer = setTimeout(function () {
      homeVolTimer = null;
      try { localStorage.setItem(STORAGE_VOLUME, String(val)); } catch (e2) {}
    }, 300);
  }

  function buildThiSubscoresHtml(breakdown) {
    if (!breakdown) return '';
    var M = (window.ThiInterpret && window.ThiInterpret._MAX) || { F:44, E:36, C:20 };
    var rows = [
      { lbl: t('thi.detail.functional','Функционален'),   val: breakdown.F||0, max: M.F },
      { lbl: t('thi.detail.emotional','Емоционален'),     val: breakdown.E||0, max: M.E },
      { lbl: t('thi.detail.catastrophic','Катастрофичен'),val: breakdown.C||0, max: M.C }
    ];
    var rowsHtml = rows.map(function (r) {
      var pct = r.max > 0 ? Math.round((r.val / r.max) * 100) : 0;
      return '<div class="thi-sub-row">' +
        '<span class="thi-sub-lbl">' + escapeHtml(r.lbl) + '</span>' +
        '<span class="thi-sub-bar" aria-hidden="true"><span class="thi-sub-bar-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="thi-sub-val">' + r.val + ' / ' + r.max + '</span>' +
      '</div>';
    }).join('');
    return '<section class="thi-section"><h3 class="thi-section-title">' +
      escapeHtml(t('thi.detail.subscoresTitle','По категории')) + '</h3>' +
      '<div class="thi-subscores">' + rowsHtml + '</div></section>';
  }

  function buildThiInsightHtml(breakdown) {
    if (!breakdown || !window.ThiInterpret || !window.ThiInterpret.fromBreakdown) return '';
    var ins = window.ThiInterpret.fromBreakdown(breakdown);
    if (!ins) return '';
    return '<section class="thi-section thi-insight thi-insight--' + (ins.tone||'neutral') + '">' +
      '<h3 class="thi-section-title">' + escapeHtml(ins.title) + '</h3>' +
      '<p class="thi-insight-body">' + escapeHtml(ins.body) + '</p></section>';
  }

  function buildThiCompareHtml() {
    var s = window.AppState || {};
    if (typeof s.thiBaseline !== 'number' || typeof s.thiDay14 !== 'number') return '';
    var cmp = (window.ThiInterpret && window.ThiInterpret.compareScores)
      ? window.ThiInterpret.compareScores(s.thiBaseline, s.thiDay14) : null;
    if (!cmp) return '';
    var deltaSign = cmp.delta > 0 ? '+' : '';
    var deltaText = deltaSign + cmp.delta + ' (' + (cmp.pctChange > 0 ? '+' : '') + cmp.pctChange + '%)';
    var deltaCls = cmp.delta < 0 ? ' thi-delta--good' : (cmp.delta > 0 ? ' thi-delta--bad' : '');

    // SCIENCE Day-14 MCID block — appended след cmp.message.
    // improvement = baseline - day14 (positive = THI намалял = подобрение).
    var mcidHtml = '';
    if (window.ScienceInfo && window.ScienceInfo.getDay14ReminderText) {
      var improvement = s.thiBaseline - s.thiDay14;
      var mcid = window.ScienceInfo.getDay14ReminderText(improvement);
      if (mcid) {
        var interpCls = improvement >= 7 ? ' thi-mcid--good' : ' thi-mcid--partial';
        mcidHtml = '<div class="thi-mcid' + interpCls + '">' +
          '<div class="thi-mcid-line thi-mcid-mcid">' + escapeHtml(mcid.mcid) + '</div>' +
          '<div class="thi-mcid-line thi-mcid-delta">' + escapeHtml(mcid.delta) + '</div>' +
          '<div class="thi-mcid-line thi-mcid-interp">' + escapeHtml(mcid.interp) + '</div>' +
        '</div>';
      }
    }

    return '<section class="thi-section thi-compare">' +
      '<h3 class="thi-section-title">' + escapeHtml(t('thi.detail.compareTitle','Сравнение Ден 1 → Ден 14')) + '</h3>' +
      '<div class="thi-compare-grid">' +
        '<div class="thi-compare-col"><span class="thi-compare-lbl">' + escapeHtml(t('thi.detail.compareDay1','Ден 1')) + '</span><span class="thi-compare-val">' + s.thiBaseline + '</span></div>' +
        '<div class="thi-compare-col"><span class="thi-compare-lbl">' + escapeHtml(t('thi.detail.compareDay14','Ден 14')) + '</span><span class="thi-compare-val">' + s.thiDay14 + '</span></div>' +
        '<div class="thi-compare-col"><span class="thi-compare-lbl">' + escapeHtml(t('thi.detail.compareChange','Промяна')) + '</span><span class="thi-compare-val thi-compare-delta' + deltaCls + '">' + deltaText + '</span></div>' +
      '</div><p class="thi-compare-msg">' + escapeHtml(cmp.message) + '</p>' +
      mcidHtml +
      '</section>';
  }

  function buildThiRetestSectionHtml() {
    var s = window.AppState || {};
    if (typeof s.thiBaseline !== 'number') return '';
    if (typeof s.thiDay14 === 'number') return '';
    var day = s.currentProgramDay || 0;
    if (day >= THI_RETEST_DAY_MIN) {
      return '<section class="thi-section thi-retest-section">' +
        '<button class="thi-retest-btn" type="button" data-action="thi-retest">' +
          escapeHtml(t('thi.detail.retest_button','Направи тест отново')) +
        '</button></section>';
    }
    var daysLeft = Math.max(1, THI_RETEST_DAY_MIN - day);
    var msg = t('thi.detail.retest_countdown','Тест отново след {days} дни', { days: daysLeft });
    return '<section class="thi-section thi-retest-section thi-retest-section--countdown">' +
      '<span class="thi-retest-countdown">' + escapeHtml(msg) + '</span></section>';
  }

  function openThiDetailSheet() {
    var s = window.AppState || {};
    var breakdown = s.thiDay14Breakdown || s.thiBaselineBreakdown || null;
    var title = t('thi.detail.title', 'Резултат от THI теста');
    var content = '<div class="thi-detail">' +
      buildThiCompareHtml() +
      buildThiSubscoresHtml(breakdown) +
      buildThiInsightHtml(breakdown) +
      buildThiRetestSectionHtml() +
    '</div>';
    if (window.BottomSheet && window.BottomSheet.open) {
      window.BottomSheet.open({
        title: title, content: content, height: 'auto',
        showGrip: true, closeOnBackdrop: true
      });
      setTimeout(function () {
        var sheet = document.querySelector('.thi-detail');
        if (!sheet) return;
        sheet.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-action="thi-retest"]');
          if (!btn) return;
          if (window.BottomSheet && window.BottomSheet.close) window.BottomSheet.close();
          openThiRetest();
        });
      }, 50);
    }
  }

  function buildHomeHtml() {
    var recommended = getRecommendedCategoryIds();
    var cardsHtml = USE_CATEGORIES.map(function (c) {
      return buildCategoryCard(c, recommended);
    }).join('');

    var totalSounds = getTotalSounds();
    var libraryAllLabel = t('home.openLibraryAll', 'Всички звуци') +
      (totalSounds > 0 ? '  (' + totalSounds + ')' : '');
    var diaryLabel = t('home.openDiary', 'Дневник');

    return (
      '<div class="home-screen" data-screen="home">' +
        // Title plain — БЕЗ flex wrapper. Heart + science са двата
        // absolute-positioned siblings (top-right floating, ИДЕНТИЧНА
        // височина 8px, gap 8px). Виж .home-favorites-btn (right:52px)
        // и .home-science-btn (right:8px) в css/home.css.
        '<h1 class="home-title">' +
          escapeHtml(t('home.title', 'Изберете режим')) +
        '</h1>' +

        buildFavoritesTitleButton() +
        buildScienceQuickButton() +
        // Единна секция „Моите тестове" (Тихол 31.05) — заменя THI CTA/banner/
        // badge + pitch card. Едно ясно място: кои са тестовете, кой е готов.
        buildTestsSection() +

        '<div class="home-cat-list">' + cardsHtml + '</div>' +

        buildVolumeCard() +

        '<div class="home-bottom-row">' +
          '<button class="home-bottom-btn" type="button" data-action="open-diary">' +
            '<span class="home-bottom-icon" aria-hidden="true">' + SVG.book + '</span>' +
            '<span class="home-bottom-text">' + escapeHtml(diaryLabel) + '</span>' +
          '</button>' +
          '<button class="home-bottom-btn" type="button" data-action="open-library-all">' +
            '<span class="home-bottom-icon" aria-hidden="true">' + SVG.equalizer + '</span>' +
            '<span class="home-bottom-text">' + escapeHtml(libraryAllLabel) + '</span>' +
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
    var volSlider = container.querySelector('#homeVolSlider');
    if (volSlider) {
      volSlider.addEventListener('input', onHomeVolInput);
      volSlider.addEventListener('change', onHomeVolInput);
    }
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'open-cat') {
      var catId = actionBtn.getAttribute('data-cat-id');
      if (catId) openCategory(catId);
    } else if (action === 'info-cat') {
      var infoCatId = actionBtn.getAttribute('data-cat-id');
      if (infoCatId && window.CategoryInfoSheet && window.CategoryInfoSheet.open) {
        window.CategoryInfoSheet.open(infoCatId);
      }
    } else if (action === 'open-diary') {
      openDiary();
    } else if (action === 'open-library-all') {
      openLibraryAll();
    } else if (action === 'open-thi-detail') {
      openThiDetailSheet();
    } else if (action === 'thi-retest') {
      openThiRetest();
    } else if (action === 'pitch-retest') {
      openPitchTest();
    } else if (action === 'thi-resume') {
      if (window.ThiBaseline && window.ThiBaseline.resume) window.ThiBaseline.resume();
    } else if (action === 'pitch-resume') {
      if (window.PitchTest && window.PitchTest.resume) window.PitchTest.resume();
    } else if (action === 'thi-restart') {
      if (window.ThiBaseline && window.ThiBaseline.open) window.ThiBaseline.open();
    } else if (action === 'pitch-restart') {
      openPitchTest();
    } else if (action === 'pitch-info') {
      openPitchInfo();
    } else if (action === 'thi-start') {
      openThiStart();
    } else if (action === 'open-science') {
      if (window.ScienceInfo && window.ScienceInfo.open) window.ScienceInfo.open();
    } else if (action === 'open-favorites-page') {
      openFavoritesPage();
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
    // NAV-LISTENER-LEAK fix: clone-and-replace #app преди да закачаме нашия
    // click listener. innerHTML смята само децата — стария listener от
    // предишния модул (Player/Category/etc.) ОСТАВА на #app и двойно
    // fire-ва handler-ите.
    var fresh = app.cloneNode(false);
    app.parentNode.replaceChild(fresh, app);
    app = fresh;
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
