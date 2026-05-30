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
    { id: 'sleep_deep',     icon: 'moon'   },
    { id: 'falling_asleep', icon: 'zzz'    },
    { id: 'relaxation',     icon: 'waves'  },
    { id: 'daily',          icon: 'sun'    },
    { id: 'anxiety',        icon: 'shield' },
    { id: 'meditation',     icon: 'lotus'  }
  ];

  // Defense-in-depth BG fallback — used ако i18n keys липсват (path mismatch,
  // late load, etc.). Content team-ът override-ва тези values през i18n.
  var CAT_FALLBACK_BG = {
    sleep_deep:     { name: 'Сън дълбок',  subtitle: 'Цяла нощ' },
    falling_asleep: { name: 'Заспиване',   subtitle: '30–90 мин преди сън' },
    relaxation:     { name: 'Релаксация',  subtitle: 'Преди сън, четене' },
    daily:          { name: 'Ежедневие',   subtitle: 'Работа, концентрация' },
    anxiety:        { name: 'Тревожност',  subtitle: 'SOS, паник атака' },
    meditation:     { name: 'Медитация',   subtitle: 'Водени сесии' }
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
  function getCountForCategory(catId) {
    if (!window.AURALIS_MANIFEST) return 0;
    var sounds = window.AURALIS_MANIFEST.sounds || [];
    var count = 0;
    var isMeditationCat = (catId === 'meditation');
    for (var j = 0; j < sounds.length; j++) {
      var s = sounds[j];
      var arr = s.categories_use || [];
      if (arr.indexOf(catId) === -1) continue;
      var isMedSound = (s.category_audio === 'meditation');
      if (isMeditationCat) {
        if (isMedSound) count++;
      } else {
        if (!isMedSound) count++;
      }
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

    // 6 use category icons — outline style, consistent stroke
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
    )
  };

  // ============================================================
  // HTML builders
  // ============================================================

  function buildCategoryCard(cat, recommended) {
    var bgFallback = CAT_FALLBACK_BG[cat.id] || { name: cat.id, subtitle: '' };
    var name = t('home.cat.' + cat.id + '.name', bgFallback.name);
    var subtitle = t('home.cat.' + cat.id + '.subtitle', bgFallback.subtitle);
    // Strip TODO: prefix ако EN stub дойде като резултат (fallback към БГ)
    if (name && name.indexOf('TODO:') === 0) name = bgFallback.name;
    if (subtitle && subtitle.indexOf('TODO:') === 0) subtitle = bgFallback.subtitle;

    var count = getCountForCategory(cat.id);
    var countText = count > 0
      ? t('home.soundCountFmt', count + ' звука', { n: count })
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
    if (baseline === null || day14 !== null || day < THI_RETEST_DAY_MIN) return '';
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
      title = t('home.pitch.done_title', 'Тон на тинитуса');
      body  = t('home.pitch.done_body', 'Текущ профил: {hz} Hz. Можете да повторите теста при нужда.', { hz: freq });
      cta   = t('home.pitch.done_cta', 'Повтори теста');
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
    if (window.PitchTest && window.PitchTest.open) window.PitchTest.open();
  }

  function openPitchInfo() {
    if (window.ScienceInfo && window.ScienceInfo.open) window.ScienceInfo.open('s3');
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
    if (window.AudioEngine && window.AudioEngine.setMasterVolume) {
      window.AudioEngine.setMasterVolume(val, e.type === 'change');
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
        buildThiCta() +
        buildThiBanner() +
        buildThiBadge() +
        buildPitchBanner() +

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
