/**
 * AURALIS ProfileResults v2 — extended 8-section layout (Task P1)
 * ====================================================================
 * Per BIBLE v3.1 §O1 + §P1: detailed assessment screen след quiz finish.
 *
 * 8 секции:
 *   §1 Meaning      — Какво означава за вас (InfoPanel)
 *   §2 Why          — Защо имате този тип (InfoPanel)
 *   §3 Strategy     — Препоръчителна стратегия (noise + mix ratio + duration)
 *   §4 Recommended  — Препоръчителни режими (2 cards с ★ "За Вас" badge)
 *   §5 TopSounds    — Top препоръчителни звуци (carousel — Code 2 P2 component)
 *   §6 Timeline     — Очаквания във времето (table)
 *   §7 Additional   — Допълнителни препоръки (InfoPanel)
 *   §8 Medical      — Кога към лекар (InfoPanel, danger tone)
 *
 * Source data:
 *   AppState.profile + AppState.distressIndex (localStorage fallback)
 *   PROFILE_ADVICE — JS const (strategy data + recommendedCategories)
 *   i18n profile_results.profiles.<code>.{meaning, why, ..., timeline}
 *
 * Public API:
 *   ProfileResults.open() | close() | render()
 */

window.ProfileResults = (function () {
  'use strict';

  // ============================================================
  // PROFILE_ADVICE — non-translatable data (strategy + categories).
  // Translatable text (meaning/why/etc.) живее в i18n.
  // Когато Opus output идва — само тук се update-ват ratio/noise/cats.
  // ============================================================

  // Източник: docs/content/AURALIS_PROFILE_ADVICE_v1.md (I1.2.B)
  // Summary table:
  //   Профил | носещ noise           | mix     | top use cases
  //   TH_C   | pink_lp4000           | 70/30   | daily → relaxation → falling_asleep
  //   DN_S   | brown_lp500           | 50/50   | sleep_deep → falling_asleep → relaxation
  //   SS_R   | brown_lp500 (green TBD)| 50/50  | anxiety → relaxation → meditation
  //   SM_F   | brown_lp1000          | 85/15   | relaxation → daily → meditation
  //   HB_M   | brown_lp500 (или none)| 90/10   | relaxation → falling_asleep → daily
  var PROFILE_ADVICE = {
    TH_C: {
      strategy: { noise: 'pink_lp4000', mixRatio: [70, 30], duration: '2+ часа дневно (идеално 4–6 ч.)' },
      recommendedCategories: ['daily', 'relaxation']
    },
    DN_S: {
      strategy: { noise: 'brown_lp500', mixRatio: [50, 50], duration: '8 часа нощно, непрекъснато' },
      recommendedCategories: ['sleep_deep', 'falling_asleep']
    },
    SS_R: {
      strategy: { noise: 'brown_lp500', mixRatio: [50, 50], duration: '2–4 часа дневно + SOS режим (3–10 мин)' },
      recommendedCategories: ['anxiety', 'relaxation']
    },
    SM_F: {
      strategy: { noise: 'brown_lp1000', mixRatio: [85, 15], duration: '2–4 часа дневно при движение' },
      recommendedCategories: ['relaxation', 'daily']
    },
    HB_M: {
      strategy: { noise: 'brown_lp500', mixRatio: [90, 10], duration: '30–60 мин в моменти на тишина' },
      recommendedCategories: ['relaxation', 'falling_asleep']
    }
  };

  var DEFAULT_PROFILE = 'TH_C';

  // Defense-in-depth БГ fallback
  var CAT_FALLBACK_BG = {
    sleep_deep:     { name: 'Сън дълбок',  subtitle: 'Цяла нощ' },
    falling_asleep: { name: 'Заспиване',   subtitle: '30–90 мин преди сън' },
    relaxation:     { name: 'Релаксация',  subtitle: 'Преди сън, четене' },
    daily:          { name: 'Ежедневие',   subtitle: 'Работа, концентрация' },
    anxiety:        { name: 'Тревожност',  subtitle: 'SOS, паник атака' },
    meditation:     { name: 'Медитация',   subtitle: 'Водени сесии' }
  };
  var PROFILE_FALLBACK = {
    TH_C: { short: 'Тонален висок',          full: 'Тонален високочестотен' },
    DN_S: { short: 'Шумов нискочестотен',    full: 'Шумов нискочестотен / Сън' },
    SS_R: { short: 'Стрес-чувствителен',     full: 'Стрес-чувствителен / Реактивен' },
    SM_F: { short: 'Соматичен / Флуктуиращ', full: 'Соматичен / Флуктуиращ' },
    HB_M: { short: 'Адаптиран / Лек',        full: 'Адаптиран / Лек' }
  };

  // ============================================================
  // SVG icons
  // ============================================================

  function svg(inner, sw) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  var CAT_ICONS = {
    moon:   svg('<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'),
    zzz:    svg('<path d="M12 5 L19 5 L12 12 L19 12"/><path d="M4 13 L14 13 L4 21 L14 21"/>'),
    waves:  svg('<path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 19c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>'),
    sun:    svg('<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4" y1="12" x2="2" y2="12"/><line x1="22" y1="12" x2="20" y2="12"/><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.07" y2="4.93"/>'),
    shield: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 11 11 13 15 9"/>'),
    lotus:  svg('<circle cx="12" cy="6" r="2"/><path d="M8 14c0-2 2-3 4-3s4 1 4 3"/><path d="M3 19c3-3 6-3 9-3s6 0 9 3"/>')
  };

  var CAT_ICON_BY_ID = {
    sleep_deep: 'moon',
    falling_asleep: 'zzz',
    relaxation: 'waves',
    daily: 'sun',
    anxiety: 'shield',
    meditation: 'lotus'
  };

  function svgStar() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<polygon points="12,2 15,9 22,9.5 17,14 19,21 12,17.5 5,21 7,14 2,9.5 9,9"/>' +
      '</svg>';
  }

  function svgChevron() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="6 9 12 15 18 9"/></svg>';
  }

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

  function tObjOrNull(key) {
    if (!window.i18n || !window.i18n.tObj) return null;
    return window.i18n.tObj(key);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function placeholderText() {
    return t('profile_results.placeholder', 'Това съдържание се подготвя от научния екип.');
  }

  // ============================================================
  // Data accessors
  // ============================================================

  function getProfileCode() {
    if (window.AppState && window.AppState.profile) return window.AppState.profile;
    try {
      var v = localStorage.getItem('auralis-quiz-profile');
      if (v && PROFILE_FALLBACK[v]) return v;
    } catch (e) { /* ignore */ }
    return DEFAULT_PROFILE;
  }

  function getDIScore() {
    if (window.AppState && typeof window.AppState.distressIndex === 'number') {
      return window.AppState.distressIndex;
    }
    try {
      var raw = localStorage.getItem('auralis-quiz-di');
      if (raw !== null) {
        var n = parseInt(raw, 10);
        if (!isNaN(n)) return n;
      }
    } catch (e) { /* ignore */ }
    return 0;
  }

  function getDILevel(di) {
    if (window.QuizEngine && window.QuizEngine.diLevelKey) {
      return window.QuizEngine.diLevelKey(di);
    }
    if (di <= 5) return 'low';
    if (di <= 12) return 'medium';
    return 'high';
  }

  function getAdvice(code) {
    return PROFILE_ADVICE[code] || PROFILE_ADVICE[DEFAULT_PROFILE];
  }

  function getProfileText(code, field, useTODO) {
    // useTODO=true: даже TODO се връща (за виждане на дефолт стойност)
    // useTODO=false: TODO се третира като missing → placeholder
    if (!window.i18n || !window.i18n.t) return useTODO ? null : null;
    var key = 'profile_results.profiles.' + code + '.' + field;
    var v = window.i18n.t(key, null);
    if (typeof v !== 'string' || v === key) return null;
    if (!useTODO && v.indexOf('TODO:') === 0) return null;
    return v;
  }

  function getProfileShortName(code) {
    var v = tOrNull('profile_results.profiles.' + code + '.shortName');
    if (v) return v;
    return (PROFILE_FALLBACK[code] || {}).short || code;
  }

  function getProfileFullName(code) {
    var v = tOrNull('profile_results.profiles.' + code + '.fullName');
    if (v) return v;
    return (PROFILE_FALLBACK[code] || {}).full || code;
  }

  function getNoiseLabel(noiseId) {
    if (!noiseId || noiseId === 'none') return '—';
    return tOrNull('noises.' + noiseId + '.title') ||
           tOrNull('components.noisePicker.options.' + noiseId) ||
           noiseId;
  }

  function getCatName(catId) {
    var fallback = (CAT_FALLBACK_BG[catId] || {}).name || catId;
    return t('home.cat.' + catId + '.name', fallback);
  }

  function getCatSubtitle(catId) {
    var fallback = (CAT_FALLBACK_BG[catId] || {}).subtitle || '';
    return t('home.cat.' + catId + '.subtitle', fallback);
  }

  function getRecommendedReason(profile, catId) {
    return tOrNull('profile_results.profiles.' + profile + '.reasons.' + catId) ||
           getCatSubtitle(catId);
  }

  // ============================================================
  // §0: Hero (profile card with DI bar)
  // ============================================================

  function buildHero(code, di, level) {
    var shortName = getProfileShortName(code);
    var fullName = getProfileFullName(code);
    var diPct = Math.round(Math.min(100, Math.max(0, (di / 20) * 100)));
    var levelLabel = t('profile_results.di.' + level,
      level === 'low' ? 'Слаб интензитет' :
      level === 'medium' ? 'Умерен интензитет' : 'Висок интензитет');
    var codeLabel = t('profile_results.code.label', 'Код на профил');
    var diLabel = t('profile_results.di.label', 'DI скор');

    return (
      '<section class="glass pr-profile-card">' +
        '<span class="shine"></span>' +
        '<span class="shine shine-bottom"></span>' +
        '<span class="glow"></span>' +
        '<span class="glow glow-bottom"></span>' +
        '<div class="pr-card-inner">' +
          '<div class="pr-code-label">' + escapeHtml(codeLabel) + '</div>' +
          '<div class="pr-code-value">' + escapeHtml(code) + '</div>' +
          '<div class="pr-fullname">' + escapeHtml(fullName) + '</div>' +
          '<div class="pr-shortname">' + escapeHtml(shortName) + '</div>' +
          '<div class="pr-di">' +
            '<div class="pr-di-row">' +
              '<span class="pr-di-label">' + escapeHtml(diLabel) + '</span>' +
              '<span class="pr-di-value">' + di + ' / 20</span>' +
            '</div>' +
            '<div class="pr-di-bar" role="progressbar"' +
              ' aria-valuemin="0" aria-valuemax="20" aria-valuenow="' + di + '">' +
              '<div class="pr-di-fill pr-di-fill--' + level + '"' +
                ' style="width: ' + diPct + '%"></div>' +
            '</div>' +
            '<div class="pr-di-level pr-di-level--' + level + '">' +
              escapeHtml(levelLabel) +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // §3: Strategy block (noise + ratio + duration)
  // ============================================================

  function buildStrategyBlock(code) {
    var adv = getAdvice(code);
    var noiseLabel = getNoiseLabel(adv.strategy.noise);
    var ratio = adv.strategy.mixRatio || [];
    var ratioText = (ratio.length === 2)
      ? t('profile_results.strategy.mixRatioFmt', ratio[0] + '/' + ratio[1],
          { l1: ratio[0], l2: ratio[1] })
      : '—';
    var duration = adv.strategy.duration || '—';
    var reasoning = getProfileText(code, 'strategyReasoning', false);

    var noiseLbl    = t('profile_results.strategy.noiseLabel', 'Препоръчителен фонов шум');
    var ratioLbl    = t('profile_results.strategy.mixRatioLabel', 'Препоръчително съотношение');
    var durationLbl = t('profile_results.strategy.durationLabel', 'Препоръчителна продължителност');
    var reasoningLbl = t('profile_results.strategy.reasoningLabel', 'Защо тази стратегия');

    return (
      '<section class="pr-section">' +
        '<h2 class="pr-section-title">' +
          escapeHtml(t('profile_results.sections.strategy', 'Препоръчителна стратегия')) +
        '</h2>' +
        '<div class="glass pr-strategy-card">' +
          '<span class="shine"></span>' +
          '<span class="shine shine-bottom"></span>' +
          '<span class="glow"></span>' +
          '<span class="glow glow-bottom"></span>' +
          '<div class="pr-card-inner">' +
            '<div class="pr-strategy-row">' +
              '<div class="pr-strategy-label">' + escapeHtml(noiseLbl) + '</div>' +
              '<div class="pr-strategy-value pr-strategy-value--mono">' +
                escapeHtml(noiseLabel) + '</div>' +
            '</div>' +
            '<div class="pr-strategy-divider" aria-hidden="true"></div>' +
            '<div class="pr-strategy-row">' +
              '<div class="pr-strategy-label">' + escapeHtml(ratioLbl) + '</div>' +
              '<div class="pr-strategy-value pr-strategy-value--mono">' +
                escapeHtml(ratioText) + '</div>' +
            '</div>' +
            '<div class="pr-strategy-divider" aria-hidden="true"></div>' +
            '<div class="pr-strategy-row">' +
              '<div class="pr-strategy-label">' + escapeHtml(durationLbl) + '</div>' +
              '<div class="pr-strategy-value">' +
                escapeHtml(duration) + '</div>' +
            '</div>' +
            (reasoning
              ? '<div class="pr-strategy-divider" aria-hidden="true"></div>' +
                '<div class="pr-strategy-reasoning">' +
                  '<div class="pr-strategy-label">' + escapeHtml(reasoningLbl) + '</div>' +
                  '<p class="pr-strategy-reasoning-text">' + escapeHtml(reasoning) + '</p>' +
                '</div>'
              : '') +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // §4: Recommended categories
  // ============================================================

  function buildRecommendedCard(code, catId) {
    var name = getCatName(catId);
    var reason = getRecommendedReason(code, catId);
    var iconName = CAT_ICON_BY_ID[catId] || 'waves';
    var iconSvg = CAT_ICONS[iconName] || CAT_ICONS.waves;
    var badgeLabel = t('profile_results.recommendedBadge', 'За Вас');

    return (
      '<button class="glass pr-rec-card" type="button"' +
        ' data-action="open-cat" data-cat-id="' + catId + '"' +
        ' aria-label="' + escapeHtml(name) + ' — ' + escapeHtml(badgeLabel) + '">' +
        '<span class="shine"></span>' +
        '<span class="shine shine-bottom"></span>' +
        '<span class="glow"></span>' +
        '<span class="glow glow-bottom"></span>' +
        '<span class="pr-rec-icon" aria-hidden="true">' + iconSvg + '</span>' +
        '<span class="pr-rec-body">' +
          '<span class="pr-rec-name">' + escapeHtml(name) + '</span>' +
          '<span class="pr-rec-reason">' + escapeHtml(reason) + '</span>' +
        '</span>' +
        '<span class="pr-rec-badge" aria-label="' + escapeHtml(badgeLabel) + '">' +
          '<span class="pr-rec-badge-icon" aria-hidden="true">' + svgStar() + '</span>' +
          '<span class="pr-rec-badge-text">' + escapeHtml(badgeLabel) + '</span>' +
        '</span>' +
      '</button>'
    );
  }

  function buildRecommendedSection(code) {
    var advice = getAdvice(code);
    var recs = advice.recommendedCategories || [];
    if (recs.length === 0) return '';
    var title = t('profile_results.sections.recommended', 'Препоръчителни режими');
    return (
      '<section class="pr-section">' +
        '<h2 class="pr-section-title">' + escapeHtml(title) + '</h2>' +
        '<div class="pr-rec-list">' +
          recs.map(function (c) { return buildRecommendedCard(code, c); }).join('') +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // §5: Top sounds carousel (placeholder slot — wired by Code 2 TopSoundsCarousel)
  // ============================================================

  function buildTopSoundsSection(code) {
    var title = t('profile_results.sections.topSounds', 'Топ препоръчителни звуци');
    return (
      '<section class="pr-section">' +
        '<h2 class="pr-section-title">' + escapeHtml(title) + '</h2>' +
        '<div class="pr-top-sounds-slot" data-top-sounds-slot></div>' +
      '</section>'
    );
  }

  function injectTopSoundsCarousel(code) {
    var slot = document.querySelector('[data-top-sounds-slot]');
    if (!slot) return;
    if (!window.TopSoundsCarousel || !window.TopSoundsCarousel.create) {
      // Fallback заглушка
      slot.innerHTML = '<div class="pr-top-empty">' +
        escapeHtml(t('profile_results.topSounds.loading', 'Зареждане на препоръки...')) +
        '</div>';
      return;
    }
    var advice = getAdvice(code);
    window.TopSoundsCarousel.create({
      mount: slot,
      profileCode: code,
      recommendedCategories: advice.recommendedCategories || [],
      onTap: function (soundId) {
        if (window.Player && window.Player.open) window.Player.open(soundId);
        else if (window.SoundDetail && window.SoundDetail.open) window.SoundDetail.open(soundId);
      },
      onViewAll: function () {
        // Open first recommended category
        var first = (advice.recommendedCategories || [])[0];
        if (first && window.CategoryView && window.CategoryView.open) {
          window.CategoryView.open(first);
        }
      }
    });
  }

  // ============================================================
  // §6: Timeline (table)
  // ============================================================

  function buildTimelineSection(code) {
    var title = t('profile_results.sections.timeline', 'Очаквания във времето');
    var rows = tObjOrNull('profile_results.profiles.' + code + '.timeline');
    if (!Array.isArray(rows) || rows.length === 0) return '';

    var rowsHtml = rows.map(function (row) {
      var period = row.period || '';
      var expectation = row.expectation || '';
      // Strip TODO prefix → show placeholder
      if (expectation.indexOf('TODO') === 0) expectation = placeholderText();
      return (
        '<div class="pr-tl-row">' +
          '<div class="pr-tl-period">' + escapeHtml(period) + '</div>' +
          '<div class="pr-tl-expectation">' + escapeHtml(expectation) + '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<section class="pr-section">' +
        '<h2 class="pr-section-title">' + escapeHtml(title) + '</h2>' +
        '<div class="glass pr-timeline-card">' +
          '<span class="shine"></span>' +
          '<span class="shine shine-bottom"></span>' +
          '<span class="glow"></span>' +
          '<span class="glow glow-bottom"></span>' +
          '<div class="pr-card-inner pr-tl-inner">' + rowsHtml + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // §1/§2/§7/§8: Section slots → InfoPanel injection
  // ============================================================

  function buildInfoSection(field, sectionKey, fallbackTitle, opts) {
    opts = opts || {};
    var title = t('profile_results.sections.' + sectionKey, fallbackTitle);
    var extraClass = opts.danger ? ' pr-section--danger' : '';
    return (
      '<section class="pr-section' + extraClass + '">' +
        '<h2 class="pr-section-title">' + escapeHtml(title) + '</h2>' +
        '<div data-info-slot="' + field + '"></div>' +
      '</section>'
    );
  }

  function injectInfoPanels(code) {
    if (!window.InfoPanel || !window.InfoPanel.create) return;

    var panels = [
      { field: 'meaning',    sectionKey: 'meaning',    fallbackTitle: 'Какво означава за вас',    icon: 'info' },
      { field: 'why',        sectionKey: 'why',        fallbackTitle: 'Защо имате този тип',     icon: 'help' },
      { field: 'additional', sectionKey: 'additional', fallbackTitle: 'Допълнителни препоръки',  icon: 'book' },
      { field: 'medical',    sectionKey: 'medical',    fallbackTitle: 'Кога към лекар',          icon: 'warning' }
    ];

    panels.forEach(function (p) {
      var slot = document.querySelector('[data-info-slot="' + p.field + '"]');
      if (!slot) return;
      var content = getProfileText(code, p.field, false) || placeholderText();
      var panelTitle = t('profile_results.sections.' + p.sectionKey, p.fallbackTitle);
      slot.appendChild(window.InfoPanel.create({
        title: panelTitle,
        body: content,
        expandable: content.length > 280,
        icon: p.icon
      }));
    });

    // Disclaimer winner-take-all bottom (allways shown)
    var discText = t('profile_results.disclaimer.text', '');
    var discTitle = t('profile_results.disclaimer.title', 'Важно — научни ограничения');
    var discSlot = document.querySelector('[data-info-slot="disclaimer"]');
    if (discSlot && discText) {
      discSlot.appendChild(window.InfoPanel.create({
        title: discTitle,
        body: discText,
        expandable: discText.length > 220,
        icon: 'warning'
      }));
    }
  }

  // ============================================================
  // Continue CTA
  // ============================================================

  function buildContinueCta() {
    var label = t('profile_results.continue', 'Продължете към звуците');
    return (
      '<button class="pr-continue-btn" type="button" data-action="continue">' +
        '<span class="pr-continue-text">' + escapeHtml(label) + '</span>' +
        '<span class="pr-continue-icon" aria-hidden="true">' + svgChevron() + '</span>' +
      '</button>'
    );
  }

  // ============================================================
  // Screen assembly
  // ============================================================

  function buildScreenHtml() {
    var code = getProfileCode();
    var di = getDIScore();
    var level = getDILevel(di);
    var title = t('profile_results.title', 'Вашата оценка');

    return (
      '<div class="pr-screen" data-screen="profile_results">' +
        '<h1 class="pr-title">' + escapeHtml(title) + '</h1>' +
        buildHero(code, di, level) +

        // §1
        buildInfoSection('meaning', 'meaning', 'Какво означава за вас') +
        // §2
        buildInfoSection('why', 'why', 'Защо имате този тип') +
        // §3
        buildStrategyBlock(code) +
        // §4
        buildRecommendedSection(code) +
        // §5
        buildTopSoundsSection(code) +
        // §6
        buildTimelineSection(code) +
        // §7
        buildInfoSection('additional', 'additional', 'Допълнителни препоръки') +
        // §8 (danger tone)
        buildInfoSection('medical', 'medical', 'Кога към лекар', { danger: true }) +

        // Disclaimer + CTA
        '<div class="pr-section pr-section--disclaimer">' +
          '<div data-info-slot="disclaimer"></div>' +
        '</div>' +
        buildContinueCta() +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function bindEvents(container) {
    container.addEventListener('click', onClick);
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'continue') {
      goToHome();
    } else if (action === 'open-cat') {
      var catId = actionBtn.getAttribute('data-cat-id');
      goToCategory(catId);
    }
  }

  function goToHome() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('home');
    }
    history.pushState({ phase: 'home' }, '');
    if (window.Home && window.Home.render) window.Home.render();
  }

  function goToCategory(catId) {
    if (!catId) return goToHome();
    if (window.CategoryView && window.CategoryView.open) {
      window.CategoryView.open(catId);
    } else {
      goToHome();
    }
  }

  // ============================================================
  // Render / open / close
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    var code = getProfileCode();
    app.innerHTML = buildScreenHtml();
    bindEvents(app);
    injectInfoPanels(code);
    injectTopSoundsCarousel(code);
  }

  function open() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('profile_results');
    }
    history.pushState({ phase: 'profile_results' }, '');
    refresh();
  }

  function close() { goToHome(); }
  function render() { refresh(); }

  return {
    open: open,
    close: close,
    render: render,
    // Exposed за тестове / отвън:
    getAdvice: getAdvice
  };
})();
