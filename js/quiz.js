// AURALIS Quiz Wizard — 15 въпроса + резултат
// Renders into <main id="app"> based on AppState.quizSubphase

window.Quiz = (function () {
  'use strict';

  var TOTAL = 15;
  var FADE_MS = 200;
  var AUTO_ADVANCE_MS = 400;
  var isAnimating = false;

  // ============================================================
  // SVG icons (споделени, theme-aware via currentColor)
  // ============================================================

  var SVG = {
    back:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M19 12H5"/>' +
        '<path d="M12 19l-7-7 7-7"/>' +
      '</svg>',

    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M5 12l5 5L20 7"/>' +
      '</svg>',

    laurel:
      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M24 6v36"/>' +
        '<path d="M14 12c-2 3-3 6-3 10 0 6 4 11 10 14"/>' +
        '<path d="M34 12c2 3 3 6 3 10 0 6-4 11-10 14"/>' +
        '<circle cx="24" cy="22" r="2.5" fill="currentColor"/>' +
      '</svg>'
  };

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }

  function prefersReducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function currentQuestionNumber() {
    if (window.AppState.quizSubphase === 'results') return TOTAL + 1;
    var n = parseInt(window.AppState.quizSubphase.replace('q', ''), 10);
    return isNaN(n) ? 1 : n;
  }

  // ============================================================
  // Header: progress bar + back button
  // ============================================================

  function renderHeader(qNum) {
    var pct = Math.round((qNum / TOTAL) * 100);
    var backLabel = t('ui.quiz.back', 'Назад');
    var progressText = t('ui.quiz.progressText', 'Въпрос ' + qNum + ' от ' + TOTAL,
      { n: qNum, total: TOTAL });
    var progressAria = t('ui.quiz.progressAria', 'Прогрес ' + qNum + ' от ' + TOTAL,
      { n: qNum, total: TOTAL });
    return (
      '<div class="quiz-top">' +
        '<button class="icon-button quiz-back" type="button"' +
          ' data-action="back" aria-label="' + backLabel + '">' +
          SVG.back +
        '</button>' +
        '<div class="quiz-progress-text">' + progressText + '</div>' +
        '<span class="quiz-back-spacer" aria-hidden="true"></span>' +
      '</div>' +
      '<div class="quiz-progress-track" role="progressbar"' +
        ' aria-valuemin="1" aria-valuemax="' + TOTAL + '" aria-valuenow="' + qNum + '"' +
        ' aria-label="' + progressAria + '">' +
        '<div class="quiz-progress-fill" style="width: ' + pct + '%"></div>' +
      '</div>'
    );
  }

  // ============================================================
  // Question screen
  // ============================================================

  function renderQuestion(qNum) {
    var q = window.QUIZ_QUESTIONS[qNum - 1];
    if (!q) {
      return '<p>' + escapeHtml(t('ui.quiz.errorQuestionMissing',
        'Грешка: въпрос ' + qNum + ' не съществува.', { n: qNum })) + '</p>';
    }

    var answeredKey = window.AppState.quizAnswers['q' + q.id];
    var questionText = t('quiz.questions.q' + q.id + '.text', q.question);

    var optionsHtml = q.options.map(function (opt) {
      var isSelected = answeredKey === opt.key;
      var optLabel = t('quiz.questions.q' + q.id + '.options.' + opt.key, opt.label);
      return (
        '<li>' +
          '<button class="quiz-option' + (isSelected ? ' is-selected' : '') + '"' +
            ' type="button" data-action="answer" data-option="' + opt.key + '">' +
            '<span class="quiz-option-letter" aria-hidden="true">' +
              opt.key.toUpperCase() + '.' +
            '</span>' +
            '<span class="quiz-option-text">' + escapeHtml(optLabel) + '</span>' +
            '<span class="quiz-option-mark" aria-hidden="true">' + SVG.check + '</span>' +
          '</button>' +
        '</li>'
      );
    }).join('');

    return (
      '<article class="quiz-screen" data-question="' + qNum + '">' +
        renderHeader(qNum) +

        '<h2 class="quiz-question">' + escapeHtml(questionText) + '</h2>' +

        '<ul class="quiz-options" role="list">' + optionsHtml + '</ul>' +
      '</article>'
    );
  }

  // ============================================================
  // Results screen
  // ============================================================

  function renderResults() {
    var profileCode = window.AppState.profile;
    var di = window.AppState.distressIndex;
    var profile = window.QUIZ_PROFILES[profileCode];

    if (!profile) {
      return (
        '<article class="quiz-screen" data-screen="results-error">' +
          '<h1 class="quiz-results-title">' +
            t('ui.quiz.results.computing', 'Изчисляване...') +
          '</h1>' +
          '<p class="quiz-results-description">' +
            t('ui.quiz.results.notComputed', 'Профилът все още не е изчислен.') + ' ' +
            '<button class="btn btn--ghost" data-action="restart">' +
              t('ui.quiz.results.startOver', 'Започни отначало') +
            '</button>' +
          '</p>' +
        '</article>'
      );
    }

    var intensity = window.QuizEngine.intensityFor(di);
    var diLevel = window.QuizEngine.diLevel(di);
    var diLevelKey = window.QuizEngine.diLevelKey(di); // low|medium|high
    var diPct = Math.round((di / 20) * 100);

    var shortName = t('quiz.profiles.' + profileCode + '.shortName', profile.shortName);
    var description = t('quiz.profiles.' + profileCode + '.description', profile.description);

    // NOTE: raw mix codes (snake_case) показват се само ако някак стигне renderResults.
    // Task 7a skipa този екран — продължава директно към Mixer. Тук е защитен fallback.
    var mixesHtml = profile.recommendedMixes.map(function (mixName) {
      var label = mixName.replace(/_/g, ' ')
        .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      return (
        '<li class="quiz-mix-card">' +
          '<span class="quiz-mix-code">' + escapeHtml(mixName) + '</span>' +
          '<span class="quiz-mix-label">' + escapeHtml(label) + '</span>' +
        '</li>'
      );
    }).join('');

    return (
      '<article class="quiz-screen" data-screen="results">' +
        '<div class="quiz-results-hero">' +
          '<span class="quiz-results-laurel" aria-hidden="true">' + SVG.laurel + '</span>' +
          '<p class="quiz-results-eyebrow">' +
            t('ui.quiz.results.eyebrow', 'Вашият профил') +
          '</p>' +
          '<h1 class="quiz-results-title">' + escapeHtml(shortName) + '</h1>' +
        '</div>' +

        '<p class="quiz-results-description">' + escapeHtml(description) + '</p>' +

        '<section class="quiz-di-card" aria-label="Distress Index">' +
          '<div class="quiz-di-row">' +
            '<div>' +
              '<p class="quiz-di-eyebrow">' +
                t('ui.quiz.results.diEyebrow', 'Ниво на дискомфорт') +
              '</p>' +
              '<p class="quiz-di-score">' +
                '<span class="quiz-di-num">' + di + '</span>' +
                '<span class="quiz-di-max">' +
                  t('ui.quiz.results.diSuffix', '/ 20') +
                '</span>' +
              '</p>' +
            '</div>' +
            '<div class="quiz-di-tag quiz-di-tag--' + diLevelKey + '">' +
              escapeHtml(diLevel) +
            '</div>' +
          '</div>' +
          '<div class="quiz-di-bar" role="progressbar"' +
            ' aria-valuemin="0" aria-valuemax="20" aria-valuenow="' + di + '">' +
            '<div class="quiz-di-fill" style="width: ' + diPct + '%"></div>' +
          '</div>' +
          '<p class="quiz-di-intensity">' +
            '<strong>' + t('ui.quiz.results.intensityLabel', 'Препоръчителен интензитет:') +
            '</strong> ' + escapeHtml(intensity) +
          '</p>' +
        '</section>' +

        '<section class="quiz-mixes" aria-label="' +
          t('ui.quiz.results.mixesTitle', 'Препоръчани миксове') + '">' +
          '<h3 class="quiz-mixes-title">' +
            t('ui.quiz.results.mixesTitle', 'Препоръчани миксове') +
          '</h3>' +
          '<ul class="quiz-mixes-list" role="list">' + mixesHtml + '</ul>' +
        '</section>' +

        '<p class="quiz-results-disclaimer">' +
          t('ui.quiz.results.disclaimer',
            'Този профил е базиран на Вашите отговори. Можете да го промените по-късно в настройките.') +
        '</p>' +

        '<div class="quiz-actions">' +
          '<button class="btn btn--cta" type="button" data-action="finish">' +
            t('ui.quiz.results.continueToMixer', 'Продължи към Mixer') +
          '</button>' +
          '<button class="btn btn--ghost" type="button" data-action="restart">' +
            t('ui.quiz.results.restart', 'Започни оценката отначало') +
          '</button>' +
        '</div>' +
      '</article>'
    );
  }

  // ============================================================
  // Mixer placeholder (квизът редиректва тук след finish)
  // ============================================================

  function renderMixerPlaceholder() {
    return (
      '<article class="quiz-screen" data-screen="mixer-placeholder">' +
        '<section class="ob-placeholder-card">' +
          '<h1 class="ob-title ob-title--sm">' +
            t('ui.quiz.mixerPlaceholder.title', 'Mixer следва') +
          '</h1>' +
          '<p class="ob-placeholder-body">' +
            t('ui.quiz.mixerPlaceholder.body',
              'Web Audio engine + 5 канала + Sleep Mode идват в следваща задача.') +
          '</p>' +
          '<button class="btn btn--ghost" type="button" data-action="restart">' +
            t('ui.quiz.mixerPlaceholder.reset', 'Нулирай всичко') +
          '</button>' +
        '</section>' +
      '</article>'
    );
  }

  // ============================================================
  // Render dispatch
  // ============================================================

  function pickScreenHtml() {
    // Mixer phase или results subphase → делегирай към Mixer
    // (старият results екран и mixer placeholder са премахнати).
    if (window.AppState.current === 'mixer' ||
        window.AppState.quizSubphase === 'results') {
      if (window.Mixer && window.Mixer.render) {
        window.Mixer.render();
        return null; // Mixer пое контрол върху #app
      }
      // Fallback ако Mixer не е зареден — placeholder
      return renderMixerPlaceholder();
    }
    return renderQuestion(currentQuestionNumber());
  }

  function render(skipFade) {
    var app = el('app');
    if (!app) return;

    var html = pickScreenHtml();
    if (html === null) return; // Mixer пое контрол; не пипай #app

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

  // ============================================================
  // Handlers
  // ============================================================

  function bindHandlers() {
    var app = el('app');
    if (!app) return;
    var buttons = app.querySelectorAll('[data-action]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', onActionClick);
    }
  }

  function onActionClick(e) {
    var action = e.currentTarget.getAttribute('data-action');
    switch (action) {
      case 'answer':
        onAnswerSelected(e.currentTarget);
        break;
      case 'back':
        history.back();
        break;
      case 'finish':
        finishToMixer();
        break;
      case 'restart':
        if (confirmRestart()) {
          window.AppState.reset();
          window.location.reload();
        }
        break;
    }
  }

  function confirmRestart() {
    return window.confirm(
      t('ui.quiz.confirmRestart',
        'Сигурни ли сте? Това ще изтрие всички отговори и ще започне отначало.')
    );
  }

  function onAnswerSelected(button) {
    var optionKey = button.getAttribute('data-option');
    var qNum = currentQuestionNumber();

    // Visual selection state
    var siblings = button.parentElement.parentElement.querySelectorAll('.quiz-option');
    for (var i = 0; i < siblings.length; i++) siblings[i].classList.remove('is-selected');
    button.classList.add('is-selected');

    window.AppState.setQuizAnswer(qNum, optionKey);

    // Auto-advance (по-малък delay при reduced motion)
    var delay = prefersReducedMotion() ? 50 : AUTO_ADVANCE_MS;
    setTimeout(function () {
      if (qNum < TOTAL) {
        goToQuestion(qNum + 1);
      } else {
        computeAndShowResults();
      }
    }, delay);
  }

  function goToQuestion(num) {
    var sub = 'q' + num;
    window.AppState.transitionQuizSubphase(sub);
    history.pushState({ phase: 'quiz', quizSubphase: sub }, '');
    render();
  }

  function computeAndShowResults() {
    var result = window.QuizEngine.compute(window.AppState.quizAnswers);
    window.AppState.markQuizDone(result.profile, result.di);
    // Skip междинния results екран → директно към Mixer
    // (profile + DI вече се показват в Mixer-а през profile pill + info-expandable)
    window.AppState.transition('mixer');
    history.pushState({ phase: 'mixer' }, '');
    if (window.Mixer && window.Mixer.render) {
      window.Mixer.render();
    } else {
      render(); // fallback ако Mixer модул не зареди
    }
  }

  function finishToMixer() {
    window.AppState.transition('mixer');
    history.pushState({ phase: 'mixer' }, '');
    if (window.Mixer && window.Mixer.render) {
      window.Mixer.render();
    } else {
      render(); // fallback към quiz placeholder
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  function start() {
    // приема, че state-ът вече е зареден (router)
    // и че онбординг е завършен
    var sub = window.AppState.quizSubphase || 'q1';
    var initial = { phase: window.AppState.current, quizSubphase: sub };
    history.replaceState(initial, '');
    render(true);
  }

  return {
    start: start,
    render: render
  };
})();
