/**
 * AURALIS ProfileResults — detailed assessment screen (Task O1)
 * ===============================================================
 * Per BIBLE v3.1 §O1: междинен screen между quiz finish и Home.
 *
 * Source data (от localStorage чрез AppState):
 *   profile  — 'TH_C' | 'DN_S' | 'SS_R' | 'SM_F' | 'HB_M'
 *   di       — 0-20 (compute level: low/medium/high via QuizEngine)
 *
 * Layout:
 *   Title "Вашата оценка"
 *   Profile card (code XL + full name + DI scale + level text)
 *   InfoPanel: "Какво означава това" (profile.description)
 *   "Препоръчителни режими" (2 cards с ★ badge)
 *   InfoPanel: "Какво да очаквате" (profile.expectations)
 *   Duration block (Първи 2 седмици / След това)
 *   InfoPanel: "Важно — научни ограничения" (disclaimer)
 *   "Продължете към звуците" CTA → Home
 *
 * Public API:
 *   ProfileResults.open()
 *   ProfileResults.close()  — → Home
 *   ProfileResults.render() — router hook
 */

window.ProfileResults = (function () {
  'use strict';

  // ============================================================
  // CONSTANTS
  // ============================================================

  // Profile → recommended use-case category ids (mirror на N1-N5 plan)
  var PROFILE_RECOMMENDATIONS = {
    TH_C: ['sleep_deep', 'relaxation'],
    DN_S: ['relaxation', 'daily'],
    SS_R: ['anxiety', 'falling_asleep'],
    SM_F: ['meditation', 'relaxation'],
    HB_M: ['daily', 'falling_asleep']
  };

  var DEFAULT_PROFILE = 'TH_C';

  // Defense-in-depth БГ fallback (mirror на home.js)
  var CAT_FALLBACK_BG = {
    sleep_deep:     { name: 'Сън дълбок',  subtitle: 'Цяла нощ' },
    falling_asleep: { name: 'Заспиване',   subtitle: '30–90 мин преди сън' },
    relaxation:     { name: 'Релаксация',  subtitle: 'Преди сън, четене' },
    daily:          { name: 'Ежедневие',   subtitle: 'Работа, концентрация' },
    anxiety:        { name: 'Тревожност',  subtitle: 'SOS, паник атака' },
    meditation:     { name: 'Медитация',   subtitle: 'Водени сесии' }
  };

  // Profile fallback names (защита ако i18n липсва)
  var PROFILE_FALLBACK = {
    TH_C: { short: 'Тонален висок',          full: 'Тонален високочестотен' },
    DN_S: { short: 'Шумов нискочестотен',    full: 'Шумов нискочестотен / Сън' },
    SS_R: { short: 'Стрес-чувствителен',     full: 'Стрес-чувствителен / Реактивен' },
    SM_F: { short: 'Соматичен / Флуктуиращ', full: 'Соматичен / Флуктуиращ' },
    HB_M: { short: 'Адаптиран / Лек',        full: 'Адаптиран / Лек' }
  };

  // SVG icons (mirror на home.js)
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

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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
    // Fallback per quiz-engine.js logic
    if (di <= 5) return 'low';
    if (di <= 12) return 'medium';
    return 'high';
  }

  function getProfileShortName(code) {
    var v = tOrNull('profile_results.profiles.' + code + '.shortName');
    if (v) return v;
    v = tOrNull('quiz.profiles.' + code + '.shortName');
    if (v) return v;
    return (PROFILE_FALLBACK[code] || {}).short || code;
  }

  function getProfileFullName(code) {
    var v = tOrNull('profile_results.profiles.' + code + '.fullName');
    if (v) return v;
    v = tOrNull('quiz.profiles.' + code + '.fullName');
    if (v) return v;
    return (PROFILE_FALLBACK[code] || {}).full || code;
  }

  function getProfileDescription(code) {
    return tOrNull('profile_results.profiles.' + code + '.description') ||
           tOrNull('quiz.profiles.' + code + '.description') ||
           '';
  }

  function getProfileExpectations(code) {
    return tOrNull('profile_results.profiles.' + code + '.expectations') || '';
  }

  function getProfileDisclaimer() {
    return tOrNull('profile_results.disclaimer.text') ||
      'AURALIS е инструмент за wellness support, не заменя медицинска ' +
      'диагноза или лечение. Препоръките се базират на агрегирани изследвания ' +
      'и общи модели, не на личен медицински преглед. При тежки симптоми ' +
      'или нараствано влошаване — консултирайте се със специалист (УНГ ' +
      'лекар или аудиолог).';
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
    // i18n key: profile_results.profiles.<code>.reasons.<catId>
    return tOrNull('profile_results.profiles.' + profile + '.reasons.' + catId) ||
           getCatSubtitle(catId);
  }

  // ============================================================
  // SVG helpers
  // ============================================================

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
  // HTML builders
  // ============================================================

  function buildProfileCard(code, di, level) {
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
    var recs = PROFILE_RECOMMENDATIONS[code] || [];
    var title = t('profile_results.recommendedTitle', 'Препоръчителни режими');
    if (recs.length === 0) return '';
    return (
      '<section class="pr-section">' +
        '<h2 class="pr-section-title">' + escapeHtml(title) + '</h2>' +
        '<div class="pr-rec-list">' +
          recs.map(function (c) { return buildRecommendedCard(code, c); }).join('') +
        '</div>' +
      '</section>'
    );
  }

  function buildDurationBlock() {
    var title = t('profile_results.duration.title', 'Препоръчителна продължителност');
    var firstLabel = t('profile_results.duration.firstTwoWeeks', 'Първи 2 седмици');
    var firstText  = t('profile_results.duration.firstTwoWeeksText', '2-3 часа на ден');
    var afterLabel = t('profile_results.duration.afterTitle', 'След това');
    var afterText  = t('profile_results.duration.afterText', 'Цяла нощ (с sleep timer)');
    return (
      '<section class="pr-section">' +
        '<h2 class="pr-section-title">' + escapeHtml(title) + '</h2>' +
        '<div class="glass pr-duration-card">' +
          '<span class="shine"></span>' +
          '<span class="shine shine-bottom"></span>' +
          '<span class="glow"></span>' +
          '<span class="glow glow-bottom"></span>' +
          '<div class="pr-card-inner">' +
            '<div class="pr-duration-row">' +
              '<div class="pr-duration-label">' + escapeHtml(firstLabel) + '</div>' +
              '<div class="pr-duration-value">' + escapeHtml(firstText) + '</div>' +
            '</div>' +
            '<div class="pr-duration-divider" aria-hidden="true"></div>' +
            '<div class="pr-duration-row">' +
              '<div class="pr-duration-label">' + escapeHtml(afterLabel) + '</div>' +
              '<div class="pr-duration-value">' + escapeHtml(afterText) + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function buildContinueCta() {
    var label = t('profile_results.continue', 'Продължете към звуците');
    return (
      '<button class="pr-continue-btn" type="button" data-action="continue">' +
        '<span class="pr-continue-text">' + escapeHtml(label) + '</span>' +
        '<span class="pr-continue-icon" aria-hidden="true">' + svgChevron() + '</span>' +
      '</button>'
    );
  }

  function buildScreenHtml() {
    var code = getProfileCode();
    var di = getDIScore();
    var level = getDILevel(di);
    var title = t('profile_results.title', 'Вашата оценка');

    return (
      '<div class="pr-screen" data-screen="profile_results">' +
        '<h1 class="pr-title">' + escapeHtml(title) + '</h1>' +
        buildProfileCard(code, di, level) +
        '<div class="pr-section pr-section--description">' +
          '<div data-info-slot="description"></div>' +
        '</div>' +
        buildRecommendedSection(code) +
        '<div class="pr-section pr-section--expectations">' +
          '<div data-info-slot="expectations"></div>' +
        '</div>' +
        buildDurationBlock() +
        '<div class="pr-section pr-section--disclaimer">' +
          '<div data-info-slot="disclaimer"></div>' +
        '</div>' +
        buildContinueCta() +
      '</div>'
    );
  }

  // ============================================================
  // InfoPanel injection (Code 2 O)
  // ============================================================

  function injectInfoPanels(code) {
    if (!window.InfoPanel || !window.InfoPanel.create) return;

    var description = getProfileDescription(code);
    var expectations = getProfileExpectations(code);
    var disclaimer = getProfileDisclaimer();

    var descSlot = document.querySelector('[data-info-slot="description"]');
    if (descSlot && description) {
      descSlot.appendChild(window.InfoPanel.create({
        title: t('profile_results.descriptionTitle', 'Какво означава това'),
        body: description,
        expandable: description.length > 280,
        icon: 'info'
      }));
    }

    var expSlot = document.querySelector('[data-info-slot="expectations"]');
    if (expSlot && expectations) {
      expSlot.appendChild(window.InfoPanel.create({
        title: t('profile_results.expectationsTitle', 'Какво да очаквате'),
        body: expectations,
        expandable: expectations.length > 280,
        icon: 'clock'
      }));
    }

    var discSlot = document.querySelector('[data-info-slot="disclaimer"]');
    if (discSlot && disclaimer) {
      discSlot.appendChild(window.InfoPanel.create({
        title: t('profile_results.disclaimer.title', 'Важно — научни ограничения'),
        body: disclaimer,
        expandable: disclaimer.length > 220,
        icon: 'warning'
      }));
    }
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
    app.innerHTML = buildScreenHtml();
    bindEvents(app);
    injectInfoPanels(getProfileCode());
  }

  function open() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('profile_results');
    }
    history.pushState({ phase: 'profile_results' }, '');
    refresh();
  }

  function close() {
    goToHome();
  }

  function render() {
    refresh();
  }

  return {
    open: open,
    close: close,
    render: render
  };
})();
