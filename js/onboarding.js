// AURALIS Onboarding — 3-screen flow (welcome → value → consent)
// Renders into <main id="app"> based on AppState.subphase

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
        '<circle cx="6" cy="9" r="2.4" fill="var(--card)"/>' +
        '<circle cx="12" cy="15" r="2.4" fill="var(--card)"/>' +
        '<circle cx="18" cy="7" r="2.4" fill="var(--card)"/>' +
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
    wave:
      '<svg class="ob-wave" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid meet"' +
      ' aria-hidden="true" focusable="false">' +
        '<defs>' +
          '<linearGradient id="ob-wave-grad-1" x1="0" y1="0" x2="320" y2="0"' +
            ' gradientUnits="userSpaceOnUse">' +
            '<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.95"/>' +
            '<stop offset="55%" stop-color="var(--accent)" stop-opacity="0.45"/>' +
            '<stop offset="100%" stop-color="var(--muted)" stop-opacity="0.05"/>' +
          '</linearGradient>' +
          '<linearGradient id="ob-wave-grad-2" x1="0" y1="0" x2="320" y2="0"' +
            ' gradientUnits="userSpaceOnUse">' +
            '<stop offset="0%" stop-color="var(--champagne)" stop-opacity="0.55"/>' +
            '<stop offset="60%" stop-color="var(--champagne)" stop-opacity="0.25"/>' +
            '<stop offset="100%" stop-color="var(--champagne)" stop-opacity="0"/>' +
          '</linearGradient>' +
        '</defs>' +
        // dashed silence axis
        '<line x1="0" y1="70" x2="320" y2="70" stroke="var(--muted)"' +
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

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

  function renderProgress(index) {
    return (
      '<div class="ob-progress" role="progressbar" aria-valuemin="1" aria-valuemax="3"' +
        ' aria-valuenow="' + (index + 1) + '" aria-label="Стъпка ' + (index + 1) + ' от 3">' +
        '<span class="ob-dot' + (index === 0 ? ' active' : '') + '" aria-hidden="true"></span>' +
        '<span class="ob-dot' + (index === 1 ? ' active' : '') + '" aria-hidden="true"></span>' +
        '<span class="ob-dot' + (index === 2 ? ' active' : '') + '" aria-hidden="true"></span>' +
      '</div>'
    );
  }

  function renderTopRow(index, showBack) {
    return (
      '<div class="ob-top">' +
        (showBack
          ? '<button class="icon-button ob-back" type="button" data-action="back" aria-label="Назад">' +
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

        '<h1 class="ob-title">Контролирай шума.<br>Възстанови покоя.</h1>' +
        '<p class="ob-subtitle">Научно валидирана терапия за хроничен тинитус.</p>' +

        '<div class="ob-actions">' +
          '<button class="btn btn--cta" type="button" data-action="next">' +
            'Започнете безплатната оценка' +
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
      '<li class="ob-value-card">' +
        '<span class="ob-value-icon" aria-hidden="true">' + SVG[iconKey] + '</span>' +
        '<div class="ob-value-text">' +
          '<h3 class="ob-value-heading">' + heading + '</h3>' +
          '<p class="ob-value-body">' + body + '</p>' +
        '</div>' +
      '</li>'
    );
  }

  function screenValue() {
    return (
      '<article class="ob-screen" data-screen="value">' +
        renderTopRow(1, true) +

        '<h2 class="ob-title ob-title--sm">Какво ще получите</h2>' +

        '<ul class="ob-value-list">' +
          valueCard('mixer',
            'Персонализиран звуков микс',
            'Според Вашия профил на тинитус.') +
          valueCard('chart',
            'Дневник на прогреса',
            'Виждате подобрението си с числа.') +
          valueCard('voice',
            'Гласов асистент',
            'Без писане, без сложности.') +
        '</ul>' +

        '<div class="ob-timeline">' +
          '<p class="ob-timeline-line">' +
            '<span class="ob-timeline-label">Първи признаци на облекчение:</span>' +
            '<span class="ob-timeline-value">14–21 ден</span>' +
          '</p>' +
          '<p class="ob-timeline-line">' +
            '<span class="ob-timeline-label">Пълна хабитуация:</span>' +
            '<span class="ob-timeline-value">8–12 седмици</span>' +
          '</p>' +
        '</div>' +

        '<p class="ob-disclaimer-soft">' +
          'Не обещаваме чудеса. Тренираме мозъка да игнорира звука.' +
        '</p>' +

        '<div class="ob-actions">' +
          '<button class="btn btn--cta" type="button" data-action="next">Продължи</button>' +
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

        '<h2 class="ob-title ob-title--sm">Важно преди да продължите</h2>' +

        '<section class="ob-consent-card">' +
          '<p class="ob-consent-intro">' +
            'tinnitus-app е инструмент за слухова релаксация.' +
          '</p>' +
          '<ul class="ob-consent-list">' +
            consentLine('cross', 'no',  'Не заменя медицинска консултация') +
            consentLine('cross', 'no',  'Не лекува тинитус') +
            consentLine('check', 'yes', 'Помага за хабитуация и релаксация') +
            consentLine('check', 'yes', 'Резултатите варират индивидуално') +
          '</ul>' +
          '<p class="ob-consent-footer">' +
            'При остри симптоми консултирайте се с лекар.' +
          '</p>' +
        '</section>' +

        '<label class="ob-checkbox-wrap" for="consent-checkbox">' +
          '<input type="checkbox" id="consent-checkbox" class="ob-checkbox" ' + checked + '>' +
          '<span class="ob-checkbox-box" aria-hidden="true">' +
            '<span class="ob-checkbox-mark">' + SVG.check + '</span>' +
          '</span>' +
          '<span class="ob-checkbox-label">Разбирам и съм съгласен / съгласна</span>' +
        '</label>' +

        '<div class="ob-actions">' +
          '<button class="btn btn--cta" type="button" data-action="finish" ' + disabled + '>' +
            'Продължи към оценка' +
          '</button>' +
        '</div>' +
      '</article>'
    );
  }

  // ============================================================
  // After onboarding (placeholder until quiz exists)
  // ============================================================

  function screenQuizPlaceholder() {
    return (
      '<article class="ob-screen" data-screen="placeholder">' +
        '<section class="ob-placeholder-card">' +
          '<h1 class="ob-title ob-title--sm">Onboarding завършен</h1>' +
          '<p class="ob-placeholder-body">' +
            'Следваща стъпка: Quiz (15 въпроса).<br>' +
            'Този екран е placeholder — quiz wizard ще се добави в следваща задача.' +
          '</p>' +
          '<button class="btn btn--ghost" type="button" data-action="reset">' +
            'Нулирай и започни отначало' +
          '</button>' +
        '</section>' +
      '</article>'
    );
  }

  // ============================================================
  // Render & transition
  // ============================================================

  function pickScreenHtml() {
    if (window.AppState.isOnboardingDone()) return screenQuizPlaceholder();
    switch (window.AppState.subphase) {
      case 'welcome': return screenWelcome();
      case 'value':   return screenValue();
      case 'consent': return screenConsent();
      default:        return screenWelcome();
    }
  }

  function render(skipFade) {
    var app = el('app');
    if (!app) return;

    var html = pickScreenHtml();

    if (skipFade) {
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
      // double rAF за гарантиран reflow преди fade-in
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
      case 'reset':
        window.AppState.reset();
        window.location.reload();
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
    history.pushState({ phase: 'quiz' }, '');
    render();
  }

  // ============================================================
  // History (browser back / forward)
  // ============================================================

  function onPopstate(e) {
    var s = e.state || {};

    // След като onboarding е завършен, browser back не трябва да връща в него.
    if (window.AppState.isOnboardingDone()) {
      if (s.phase !== 'quiz') {
        history.pushState({ phase: 'quiz' }, '');
      }
      render();
      return;
    }

    if (s.subphase && window.AppState.onboardingSubphases.indexOf(s.subphase) !== -1) {
      window.AppState.transitionSubphase(s.subphase);
      render();
    } else if (s.phase === 'quiz') {
      window.AppState.transition('quiz');
      render();
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  function start() {
    window.AppState.load();

    var initial = window.AppState.isOnboardingDone()
      ? { phase: 'quiz' }
      : { subphase: window.AppState.subphase };
    history.replaceState(initial, '');

    window.addEventListener('popstate', onPopstate);

    render(true);
  }

  return {
    start: start,
    render: render
  };
})();
