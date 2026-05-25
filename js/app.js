// AURALIS entry point — theme toggle + top-level router
// Делегира към Onboarding или Quiz module според AppState.

(function () {
  'use strict';

  var STORAGE_KEY = 'auralis-theme';
  var THEME_COLOR_DARK  = '#080813';
  var THEME_COLOR_LIGHT = '#E8E3EE';

  // ============================================================
  // Theme
  // ============================================================

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? THEME_COLOR_LIGHT : THEME_COLOR_DARK);
    }

    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    }
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function toggleTheme() {
    var next = currentTheme() === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
  }

  // ============================================================
  // Router
  // ============================================================

  function route() {
    if (!window.AppState.isOnboardingDone()) {
      if (window.Onboarding && window.Onboarding.render) {
        window.Onboarding.render(true);
      }
      return;
    }
    // Onboarding done → profile_results (post-quiz) / home (primary) / nested / legacy
    var phase = window.AppState.current;
    if (phase === 'profile_results' && window.ProfileResults && window.ProfileResults.render) {
      window.ProfileResults.render();
      return;
    }
    if (phase === 'home' && window.Home && window.Home.render) {
      window.Home.render();
      return;
    }
    if (phase === 'category' && window.CategoryView && window.CategoryView.render) {
      window.CategoryView.render();
      return;
    }
    if (phase === 'sound' && window.SoundDetail && window.SoundDetail.render) {
      window.SoundDetail.render();
      return;
    }
    if (phase === 'player' && window.Player && window.Player.render) {
      window.Player.render();
      return;
    }
    if (phase === 'calm' && window.Calm && window.Calm.render) {
      window.Calm.render();
      return;
    }
    if (phase === 'diary' && window.Diary && window.Diary.render) {
      window.Diary.render();
      return;
    }
    if (phase === 'sleep' && window.Sleep && window.Sleep.render) {
      window.Sleep.render();
      return;
    }
    if (phase === 'library' && window.Library && window.Library.render) {
      window.Library.render();
      return;
    }
    if (phase === 'mixer' && window.Mixer && window.Mixer.render) {
      window.Mixer.render();
      return;
    }
    // Quiz subphase render (incl. results → ще auto-bounce към library)
    if (window.Quiz && window.Quiz.render) {
      window.Quiz.render(true);
    }
  }

  // ============================================================
  // Global popstate handler — единствено централно място
  // ============================================================

  function onPopstate(e) {
    var s = e.state || {};

    // === Onboarding е завършен → quiz/mixer навигация ===
    if (window.AppState.isOnboardingDone()) {
      // Browser back към onboarding entries → блокирай (re-push текущото)
      if (s.phase === 'onboarding' || s.subphase) {
        var sub = window.AppState.quizSubphase || 'q1';
        history.pushState({ phase: window.AppState.current, quizSubphase: sub }, '');
        if (window.Quiz) window.Quiz.render(true);
        return;
      }

      if (s.phase === 'profile_results') {
        window.AppState.transition('profile_results');
        if (window.ProfileResults && window.ProfileResults.render) {
          window.ProfileResults.render();
        } else if (window.Home && window.Home.render) {
          window.Home.render();
        }
        return;
      }
      if (s.phase === 'home') {
        window.AppState.transition('home');
        if (window.Home && window.Home.render) window.Home.render();
        return;
      }
      if (s.phase === 'category' && s.catId) {
        window.AppState.transition('category');
        if (window.CategoryView && window.CategoryView.open) window.CategoryView.open(s.catId);
        else if (window.Home && window.Home.render) window.Home.render();
        return;
      }
      if (s.phase === 'sound' && s.soundId) {
        window.AppState.transition('sound');
        if (window.SoundDetail && window.SoundDetail.open) window.SoundDetail.open(s.soundId);
        else if (window.Home && window.Home.render) window.Home.render();
        return;
      }
      if (s.phase === 'player' && s.soundId) {
        window.AppState.transition('player');
        if (window.Player && window.Player.open) window.Player.open(s.soundId);
        else if (window.Home && window.Home.render) window.Home.render();
        return;
      }
      if (s.phase === 'calm') {
        window.AppState.transition('calm');
        if (window.Calm && window.Calm.render) {
          window.Calm.render();
        } else if (window.Library && window.Library.render) {
          window.Library.render();
        }
        return;
      }

      if (s.phase === 'diary') {
        window.AppState.transition('diary');
        if (window.Diary && window.Diary.render) {
          window.Diary.render();
        } else if (window.Library && window.Library.render) {
          window.Library.render();
        }
        return;
      }

      if (s.phase === 'sleep') {
        window.AppState.transition('sleep');
        if (window.Sleep && window.Sleep.render) {
          window.Sleep.render();
        } else if (window.Library && window.Library.render) {
          window.Library.render();
        }
        return;
      }

      if (s.phase === 'library') {
        window.AppState.transition('library');
        if (window.Library && window.Library.render) {
          window.Library.render();
        } else if (window.Quiz) {
          window.Quiz.render();
        }
        return;
      }

      if (s.phase === 'mixer') {
        window.AppState.transition('mixer');
        if (window.Mixer && window.Mixer.render) {
          window.Mixer.render();
        } else if (window.Quiz) {
          window.Quiz.render();
        }
        return;
      }

      if (s.quizSubphase && window.AppState.quizSubphases.indexOf(s.quizSubphase) !== -1) {
        window.AppState.transitionQuizSubphase(s.quizSubphase);
        if (window.AppState.current !== 'quiz') window.AppState.transition('quiz');
        if (window.Quiz) window.Quiz.render();
        return;
      }

      // Fallback
      if (window.Quiz) window.Quiz.render();
      return;
    }

    // === Все още в onboarding ===
    if (s.subphase && window.AppState.onboardingSubphases.indexOf(s.subphase) !== -1) {
      window.AppState.transitionSubphase(s.subphase);
      if (window.Onboarding) window.Onboarding.render();
      return;
    }

    if (s.phase === 'quiz') {
      window.AppState.transition('quiz');
      if (window.Quiz) window.Quiz.render();
      return;
    }
  }

  // ============================================================
  // Bootstrap
  // ============================================================

  function bootstrap() {
    var themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    applyTheme(currentTheme());

    // i18n приложи към статичните DOM елементи (aria-labels на header)
    if (window.i18n && window.i18n.applyToDOM) {
      window.i18n.applyToDOM(document);
    }

    // Popul-ва window.INFO_CONTENT от i18n.content (thin adapter в info-content.js)
    if (window.InfoContent && window.InfoContent.rebuild) {
      window.InfoContent.rebuild();
    }

    window.AppState.load();

    // Initial history state според текуща фаза
    var initialState;
    if (!window.AppState.isOnboardingDone()) {
      initialState = { subphase: window.AppState.subphase };
    } else if (window.AppState.current === 'profile_results') {
      initialState = { phase: 'profile_results' };
    } else if (window.AppState.current === 'home') {
      initialState = { phase: 'home' };
    } else if (window.AppState.current === 'category') {
      initialState = { phase: 'category' };
    } else if (window.AppState.current === 'sound') {
      initialState = { phase: 'sound' };
    } else if (window.AppState.current === 'player') {
      initialState = { phase: 'player' };
    } else if (window.AppState.current === 'calm') {
      initialState = { phase: 'calm' };
    } else if (window.AppState.current === 'diary') {
      initialState = { phase: 'diary' };
    } else if (window.AppState.current === 'sleep') {
      initialState = { phase: 'sleep' };
    } else if (window.AppState.current === 'library') {
      initialState = { phase: 'library' };
    } else if (window.AppState.current === 'mixer') {
      initialState = { phase: 'mixer' };
    } else {
      initialState = { phase: 'quiz', quizSubphase: window.AppState.quizSubphase };
    }
    history.replaceState(initialState, '');

    window.addEventListener('popstate', onPopstate);

    // Global modules init
    if (window.ErrorHandler && window.ErrorHandler.init) window.ErrorHandler.init();
    if (window.Analytics && window.Analytics.init) window.Analytics.init();
    if (window.A11y && window.A11y.init) window.A11y.init();
    if (window.AudioErrorBanner && window.AudioErrorBanner.init) window.AudioErrorBanner.init();
    if (window.NotificationsMock && window.NotificationsMock.init) window.NotificationsMock.init();

    route();

    console.log('[auralis] bootstrap · phase:', window.AppState.current,
      '· sub:', window.AppState.subphase,
      '· quiz:', window.AppState.quizSubphase,
      '· onboarded:', window.AppState.isOnboardingDone(),
      '· quizDone:', window.AppState.isQuizDone(),
      '· locale:', window.i18n ? window.i18n.getLocale() : 'none');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Gate bootstrap на i18n.init() — translations трябва да са заредени
    // преди render-ите на onboarding/quiz/mixer да започнат.
    if (window.i18n && window.i18n.init) {
      window.i18n.init()
        .then(bootstrap)
        .catch(function (err) {
          console.error('[auralis] i18n init failed — rendering без translations:', err);
          bootstrap();
        });
    } else {
      bootstrap();
    }
  });
})();
