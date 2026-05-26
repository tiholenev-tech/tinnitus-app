/**
 * AURALIS BackButton — header back navigation (Task А)
 * ======================================================
 * When NOT on Home → replaces theme toggle with back chevron.
 * On Home → theme toggle visible.
 *
 * Public API:
 *   BackButton.init()     — call at bootstrap, watches state changes
 *   BackButton.update()   — manual refresh (call after route change)
 */

window.BackButton = (function () {
  'use strict';

  var backBtn = null;
  var initialized = false;

  var SVG_BACK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="15 18 9 12 15 6"/></svg>';

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function isHome() {
    if (window.AppState) {
      var phase = window.AppState.current;
      return phase === 'home' || phase === 'onboarding' || phase === 'quiz';
    }
    return true;
  }

  function createBackBtn() {
    if (backBtn) return backBtn;
    backBtn = document.createElement('button');
    backBtn.className = 'icon-btn back-btn';
    backBtn.id = 'headerBackBtn';
    backBtn.type = 'button';
    backBtn.setAttribute('aria-label', t('ui.header.backAria', 'Назад'));
    backBtn.innerHTML = SVG_BACK;
    backBtn.addEventListener('click', onBack);
    return backBtn;
  }

  // NAV-STACK: рендеринг dispatch по phase name.
  // popPhase() в state.js връща предишния phase без да го re-push-ва.
  function rendererFor(phase) {
    var renderers = {
      'home': window.Home,
      'category': window.CategoryView,
      'sound': window.SoundDetail,
      'player': window.Player,
      'profile_results': window.ProfileResults,
      'diary_hub': window.DiaryHub,
      'diary_evening': window.DiaryEvening,
      'diary_morning': window.DiaryMorning,
      'cbt_day': window.CbtDay,
      'thi_baseline': window.ThiBaseline,
      // DIARY-MERGE: legacy 'diary' phase → новия DiaryHub.
      'diary': window.DiaryHub,
      'calm': window.Calm,
      'sleep': window.Sleep,
      'library': window.Library,
      'mixer': window.Mixer,
      'settings': window.Settings
    };
    return renderers[phase] || null;
  }

  // NAV-STALE: phases които НЕ са валидни back targets ако потребителят
  // е приключил onboarding+quiz. popPhase ги skip-ва.
  // Phone test (шефа): "влязох в дневника, натиснах бутона да излеза и
  // ме върна пак на онбординга" — добавени pitch_test + calibration +
  // profile_results (single-pass setup phases, не valid back targets).
  var STALE_AFTER_ONBOARDING = [
    'onboarding', 'quiz', 'results', 'thi_baseline',
    'calibration', 'pitch_test', 'profile_results'
  ];

  function onBack() {
    if (window.Haptics) window.Haptics.light();

    if (!window.AppState) {
      window.history.back();
      return;
    }

    var s = window.AppState;
    var onboardingComplete = s.isOnboardingDone && s.isOnboardingDone();
    var quizComplete = s.isQuizDone && s.isQuizDone();
    // BACK-TO-ONBOARDING fix: ползваме quizComplete като primary indicator.
    // Ако quiz е приключен, onboarding ТРЯБВА да е приключен преди това
    // (markQuizDone не може без markOnboardingDone). Това защитава срещу
    // случаи където isOnboardingDone се desync-ва (localStorage corruption,
    // SW cache mishap) — quiz done винаги implies onboarding done.
    var pastSetup = quizComplete; // mark всеки setup phase като stale

    var prev = s.popPhase();

    // NAV-STALE: skip phases които вече не са валидни (e.g. q15 след quiz
    // done) — pop continues докато намерим валиден phase или празно.
    if (pastSetup) {
      while (prev && STALE_AFTER_ONBOARDING.indexOf(prev) !== -1) {
        console.log('[back-button] skip stale:', prev);
        prev = s.popPhase();
      }
    }

    if (!prev) {
      // Empty stack — clear remaining (safety) + go home.
      if (s.clearPhaseHistory) s.clearPhaseHistory();
      console.log('[back-button] empty stack → home');
      s.transition('home');
      if (window.Home && window.Home.render) window.Home.render();
      return;
    }

    // BACK-TO-ONBOARDING ultimate guard: ако след skip pass-а резултатът е
    // 'onboarding' или 'quiz' но quiz е приключен — force home. Това е
    // последна defense — never let post-setup user land на setup screen.
    if (pastSetup && (prev === 'onboarding' || prev === 'quiz')) {
      console.warn('[back-button] post-setup user got setup phase from pop → force home');
      if (s.clearPhaseHistory) s.clearPhaseHistory();
      s.transition('home');
      if (window.Home && window.Home.render) window.Home.render();
      return;
    }

    console.log('[back-button] BACK to:', prev);

    var renderer = rendererFor(prev);
    if (renderer && renderer.render) {
      renderer.render();
    } else {
      // Renderer missing → fallback Home.
      console.warn('[back-button] no renderer for:', prev, '→ home');
      s.transition('home');
      if (window.Home && window.Home.render) window.Home.render();
    }
  }

  function update() {
    var themeBtn = document.getElementById('themeBtn');
    if (!themeBtn) return;
    var parent = themeBtn.parentElement;
    if (!parent) return;

    if (isHome()) {
      // Show theme, hide back
      themeBtn.style.display = '';
      if (backBtn && backBtn.parentNode) backBtn.parentNode.removeChild(backBtn);
    } else {
      // Show back, hide theme
      themeBtn.style.display = 'none';
      createBackBtn();
      if (!backBtn.parentNode) {
        parent.insertBefore(backBtn, themeBtn);
      }
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    // Watch popstate for route changes
    window.addEventListener('popstate', function () {
      setTimeout(update, 50);
    });
    // Initial check
    setTimeout(update, 100);
  }

  return {
    init: init,
    update: update
  };
})();
