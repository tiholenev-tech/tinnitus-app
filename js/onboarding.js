// AURALIS Onboarding — 3-screen flow (welcome → value → consent)
// Renders into <main id="app"> based on AppState.subphase
//
// Canon retrofit: HTML template strings updated да ползват:
//  - .glass + 2 shine spans за всеки info container
//  - .btn-cta (wide pill primary CTA per canon §3)
//  - .icon-btn (canon class за back button)
//  - --primary / --champagne-soft / --text-muted (canon tokens) в SVG-те
//  - "Вие" form навсякъде (canon §1 rule 1)
// State/persistence/handlers логика — НЕпроменена.

window.Onboarding = (function () {
  'use strict';

  var FADE_MS = 200;
  var isAnimating = false;

  // ============================================================
  // SVG icon library (inline за theme-awareness чрез currentColor)
  // ============================================================

  var SVG = {
    back:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M19 12H5"/>' +
        '<path d="M12 19l-7-7 7-7"/>' +
      '</svg>',

    mixer:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<line x1="6" y1="3" x2="6" y2="21"/>' +
        '<line x1="12" y1="3" x2="12" y2="21"/>' +
        '<line x1="18" y1="3" x2="18" y2="21"/>' +
        '<circle cx="6" cy="9" r="2.4" fill="var(--bg-main)"/>' +
        '<circle cx="12" cy="15" r="2.4" fill="var(--bg-main)"/>' +
        '<circle cx="18" cy="7" r="2.4" fill="var(--bg-main)"/>' +
      '</svg>',

    chart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<line x1="4" y1="20" x2="20" y2="20"/>' +
        '<rect x="6" y="13" width="3" height="6" rx="0.5"/>' +
        '<rect x="11" y="9" width="3" height="10" rx="0.5"/>' +
        '<rect x="16" y="5" width="3" height="14" rx="0.5"/>' +
      '</svg>',

    voice:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="9" y="3" width="6" height="12" rx="3"/>' +
        '<path d="M5 11a7 7 0 0 0 14 0"/>' +
        '<line x1="12" y1="18" x2="12" y2="21"/>' +
        '<line x1="9" y1="21" x2="15" y2="21"/>' +
      '</svg>',

    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M5 12l5 5L20 7"/>' +
      '</svg>',

    cross:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M6 6l12 12"/>' +
        '<path d="M18 6l-12 12"/>' +
      '</svg>',

    // Audio wave illustration — стабилни звукови вълни, преминаващи в тишина
    // Tokens: --primary (indigo wave), --champagne-soft (gold wave), --text-muted (axis)
    wave:
      '<svg class="ob-wave" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet"' +
      ' aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<linearGradient id="ob-wave-grad-1" x1="0" y1="0" x2="320" y2="0"' +
            ' gradientUnits="userSpaceOnUse">' +
            '<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.95"/>' +
            '<stop offset="55%" stop-color="var(--accent)" stop-opacity="0.45"/>' +
            '<stop offset="100%" stop-color="var(--text-muted)" stop-opacity="0.05"/>' +
          '</linearGradient>' +
          '<linearGradient id="ob-wave-grad-2" x1="0" y1="0" x2="320" y2="0"' +
            ' gradientUnits="userSpaceOnUse">' +
            '<stop offset="0%" stop-color="var(--accent-3)" stop-opacity="0.55"/>' +
            '<stop offset="60%" stop-color="var(--accent-3)" stop-opacity="0.25"/>' +
            '<stop offset="100%" stop-color="var(--accent-3)" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        // dashed silence axis
        '<line x1="0" y1="70" x2="320" y2="70" stroke="var(--text-muted)"' +
          ' stroke-width="1" stroke-dasharray="2 5" opacity="0.35"/>' +
        // primary wave — pulse animated via .ob-wave-primary class
        '<path class="ob-wave-primary" d="' +
          'M 0,70 ' +
          'C 5,28 15,112 20,70 ' +
          'C 25,32 35,108 40,70 ' +
          'C 45,36 55,104 60,70 ' +
          'C 65,40 75,100 80,70 ' +
          'C 85,44 95,96 100,70 ' +
          'C 105,48 115,92 120,70 ' +
          'C 125,52 135,88 140,70 ' +
          'C 145,55 155,85 160,70 ' +
          'C 165,58 175,82 180,70 ' +
          'C 185,61 195,79 200,70 ' +
          'C 205,63 215,77 220,70 ' +
          'C 225,65 235,75 240,70 ' +
          'L 320,70" ' +
          'stroke="url(#ob-wave-grad-1)" stroke-width="2.25" stroke-linecap="round"' +
          ' fill="none"/>' +
        // secondary wave — static, champagne, offset phase
        '<path d="' +
          'M 0,70 ' +
          'C 8,95 22,45 32,70 ' +
          'C 42,93 56,47 66,70 ' +
          'C 76,90 90,50 100,70 ' +
          'C 110,86 124,54 134,70 ' +
          'C 144,82 158,58 168,70 ' +
          'C 178,78 192,62 202,70 ' +
          'L 320,70" ' +
          'stroke="url(#ob-wave-grad-2)" stroke-width="1.75" stroke-linecap="round"' +
          ' fill="none"/>' +
      '</svg>'
  };

  // Glass card shines + glows — chat.php 1:1 (light: glow display:none auto)
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

  function renderProgress(index) {
    var step = index + 1;
    var progressLabel = t('ui.onboarding.progressLabel', 'Стъпка ' + step + ' от 3', { step: step });
    return (
      '<div class="ob-progress" role="progressbar" aria-valuemin="1" aria-valuemax="3"' +
        ' aria-valuenow="' + step + '" aria-label="' + progressLabel + '">' +
        '<span class="ob-dot' + (index === 0 ? ' active' : '') + '" aria-hidden="true"></span>' +
        '<span class="ob-dot' + (index === 1 ? ' active' : '') + '" aria-hidden="true"></span>' +
        '<span class="ob-dot' + (index === 2 ? ' active' : '') + '" aria-hidden="true"></span>' +
      '</div>'
    );
  }

  function renderTopRow(index, showBack) {
    var backLabel = t('ui.onboarding.back', 'Назад');
    return (
      '<div class="ob-top">' +
        (showBack
          ? '<button class="icon-btn ob-back" type="button" data-action="back" aria-label="' + backLabel + '">' +
              SVG.back +
            '</button>'
          : '<span class="ob-back-spacer" aria-hidden="true"></span>') +
        renderProgress(index) +
        '<span class="ob-back-spacer" aria-hidden="true"></span>' +
      '</div>'
    );
  }

  // ============================================================
  // Screen 1: Welcome
  // ============================================================

  function screenWelcome() {
    return (
      '<article class="ob-screen" data-screen="welcome">' +
        renderTopRow(0, false) +

        '<div class="ob-illustration">' + SVG.wave + '</div>' +

        '<h1 class="ob-title">' +
          t('ui.onboarding.welcome.title',
            'Контролирайте шума.<br>Възстановете покоя.') +
        '</h1>' +
        '<p class="ob-subtitle">' +
          t('ui.onboarding.welcome.subtitle',
            'Звукова релаксация за облекчение при хроничен тинитус.') +
        '</p>' +

        '<div class="ob-actions">' +
          '<button class="btn-cta" type="button" data-action="next">' +
            t('ui.onboarding.welcome.cta', 'Започнете безплатната оценка') +
          '</button>' +
        '</div>' +
      '</article>'
    );
  }

  // ============================================================
  // Screen 2: Value Proposition
  // ============================================================

  function valueCard(iconKey, heading, body) {
    return (
      '<li class="glass ob-value-card">' +
        SHINES +
        '<span class="ob-value-icon" aria-hidden="true">' + SVG[iconKey] + '</span>' +
        '<div class="ob-value-text">' +
          '<h3 class="ob-value-heading">' + heading + '</h3>' +
          '<p class="ob-value-body">' + body + '</p>' +
        '</div>' +
      '</li>'
    );
  }

  function screenValue() {
    var betaTitle = t('ui.onboarding.value.beta.title', '');
    var betaText  = t('ui.onboarding.value.beta.text', '');
    var betaHtml = (betaTitle || betaText)
      ? '<div class="glass ob-beta-card">' +
          SHINES +
          (betaTitle ? '<div class="ob-beta-title">' + betaTitle + '</div>' : '') +
          (betaText  ? '<div class="ob-beta-text">'  + betaText  + '</div>' : '') +
        '</div>'
      : '';

    return (
      '<article class="ob-screen" data-screen="value">' +
        renderTopRow(1, true) +

        '<h2 class="ob-title ob-title--sm">' +
          t('ui.onboarding.value.title', 'Какво ще получите') +
        '</h2>' +

        betaHtml +

        '<ul class="ob-value-list">' +
          valueCard('mixer',
            t('ui.onboarding.value.cards.mixer.heading', 'Персонализиран звуков микс'),
            t('ui.onboarding.value.cards.mixer.body', 'Според Вашия профил на тинитус.')) +
          valueCard('chart',
            t('ui.onboarding.value.cards.chart.heading', 'Дневник на прогреса'),
            t('ui.onboarding.value.cards.chart.body', 'Виждате подобрението си с числа.')) +
          valueCard('voice',
            t('ui.onboarding.value.cards.voice.heading', 'Гласов асистент'),
            t('ui.onboarding.value.cards.voice.body', 'Без писане, без сложности.')) +
        '</ul>' +

        '<div class="glass ob-timeline">' +
          SHINES +
          '<p class="ob-timeline-line">' +
            '<span class="ob-timeline-label">' +
              t('ui.onboarding.value.timeline.relief.label', 'Първи признаци на облекчение:') +
            '</span>' +
            '<span class="ob-timeline-value">' +
              t('ui.onboarding.value.timeline.relief.value', '14–21 ден') +
            '</span>' +
          '</p>' +
          '<p class="ob-timeline-line">' +
            '<span class="ob-timeline-label">' +
              t('ui.onboarding.value.timeline.habituation.label', 'Пълна хабитуация:') +
            '</span>' +
            '<span class="ob-timeline-value">' +
              t('ui.onboarding.value.timeline.habituation.value', '8–12 седмици') +
            '</span>' +
          '</p>' +
        '</div>' +

        '<p class="ob-disclaimer-soft">' +
          t('ui.onboarding.value.disclaimerSoft',
            'Не обещаваме чудеса. Тренираме мозъка да игнорира звука.') +
        '</p>' +

        '<div class="ob-actions">' +
          '<button class="btn-cta" type="button" data-action="next">' +
            t('ui.onboarding.value.cta', 'Продължете') +
          '</button>' +
        '</div>' +
      '</article>'
    );
  }

  // ============================================================
  // Screen 3: Consent & Disclaimer
  // ============================================================

  function consentLine(iconKey, kind, text) {
    return (
      '<li class="ob-consent-line ob-consent-line--' + kind + '">' +
        '<span class="ob-consent-icon" aria-hidden="true">' + SVG[iconKey] + '</span>' +
        '<span class="ob-consent-text">' + text + '</span>' +
      '</li>'
    );
  }

  function screenConsent() {
    var checked = window.AppState.consentGranted ? 'checked' : '';
    var disabled = window.AppState.consentGranted ? '' : 'disabled';

    return (
      '<article class="ob-screen" data-screen="consent">' +
        renderTopRow(2, true) +

        '<h2 class="ob-title ob-title--sm">' +
          t('ui.onboarding.consent.title', 'Важно преди да продължите') +
        '</h2>' +

        '<section class="glass ob-consent-card">' +
          SHINES +
          '<p class="ob-consent-intro">' +
            t('ui.onboarding.consent.intro',
              'tinnitus-app е инструмент за слухова релаксация.') +
          '</p>' +
          '<ul class="ob-consent-list">' +
            consentLine('cross', 'no',
              t('ui.onboarding.consent.lines.noReplaceConsult',
                'Не заменя медицинска консултация')) +
            consentLine('cross', 'no',
              t('ui.onboarding.consent.lines.noTreatment', 'Не лекува тинитус')) +
            consentLine('check', 'yes',
              t('ui.onboarding.consent.lines.helpsHabituation',
                'Помага за хабитуация и релаксация')) +
            consentLine('check', 'yes',
              t('ui.onboarding.consent.lines.resultsVary',
                'Резултатите варират индивидуално')) +
          '</ul>' +
          '<p class="ob-consent-footer">' +
            t('ui.onboarding.consent.footer',
              'При остри симптоми консултирайте се с лекар.') +
          '</p>' +
        '</section>' +

        '<label class="ob-checkbox-wrap" for="consent-checkbox">' +
          '<input type="checkbox" id="consent-checkbox" class="ob-checkbox" ' + checked + '>' +
          '<span class="ob-checkbox-box" aria-hidden="true">' +
            '<span class="ob-checkbox-mark">' + SVG.check + '</span>' +
          '</span>' +
          '<span class="ob-checkbox-label">' +
            t('ui.onboarding.consent.checkboxLabel',
              'Разбирам и съм съгласен / съгласна') +
          '</span>' +
        '</label>' +

        '<div class="ob-actions">' +
          '<button class="btn-cta" type="button" data-action="finish" ' + disabled + '>' +
            t('ui.onboarding.consent.cta', 'Продължете към оценка') +
          '</button>' +
        '</div>' +
      '</article>'
    );
  }

  // ============================================================
  // Render & transition (LOGIC UNCHANGED)
  // ============================================================

  function pickScreenHtml() {
    if (window.AppState.isOnboardingDone()) {
      return null;
    }
    switch (window.AppState.subphase) {
      case 'welcome': return screenWelcome();
      case 'value':   return screenValue();
      case 'consent': return screenConsent();
      default:        return screenWelcome();
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function render(skipFade) {
    var app = el('app');
    if (!app) return;

    var html = pickScreenHtml();
    if (html === null) {
      if (window.Quiz && window.Quiz.render) {
        window.Quiz.render(skipFade);
      }
      return;
    }

    if (skipFade || prefersReducedMotion()) {
      app.innerHTML = html;
      bindHandlers();
      app.classList.remove('is-fading');
      return;
    }

    if (isAnimating) return;
    isAnimating = true;

    app.classList.add('is-fading');
    setTimeout(function () {
      app.innerHTML = html;
      bindHandlers();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          app.classList.remove('is-fading');
          isAnimating = false;
        });
      });
    }, FADE_MS);
  }

  function bindHandlers() {
    var app = el('app');
    if (!app) return;

    var buttons = app.querySelectorAll('[data-action]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', onActionClick);
    }

    var checkbox = el('consent-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', onConsentChange);
    }
  }

  function onActionClick(e) {
    var action = e.currentTarget.getAttribute('data-action');
    switch (action) {
      case 'next':
        if (window.AppState.nextSubphase()) {
          history.pushState({ subphase: window.AppState.subphase }, '');
        }
        render();
        break;
      case 'back':
        history.back();
        break;
      case 'finish':
        finishOnboarding();
        break;
    }
  }

  function onConsentChange(e) {
    var granted = !!e.currentTarget.checked;
    window.AppState.consentGranted = granted;
    var cta = document.querySelector('[data-action="finish"]');
    if (cta) {
      if (granted) cta.removeAttribute('disabled');
      else cta.setAttribute('disabled', '');
    }
  }

  function finishOnboarding() {
    if (!window.AppState.consentGranted) return;
    window.AppState.markOnboardingDone();
    window.AppState.transition('quiz');
    var startSub = window.AppState.quizSubphase || 'q1';
    history.pushState({ phase: 'quiz', quizSubphase: startSub }, '');
    if (window.Quiz && window.Quiz.render) {
      window.Quiz.render();
    } else {
      render();
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  function start() {
    window.AppState.load();
    render(true);
  }

  return {
    start: start,
    render: render
  };
})();
