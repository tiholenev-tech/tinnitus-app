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

    var quizDone = window.AppState.isQuizDone();

    // Ако quiz-ът не е приключен — quiz е единствената валидна destination.
    if (!quizDone) {
      if (window.Quiz && window.Quiz.render) {
        window.Quiz.render(true);
      }
      if (window.BackButton && window.BackButton.update) window.BackButton.update();
      return;
    }

    // Quiz done → primary destination = Home; nested screens рестейтват се само
    // ако техния required context е наличен (catId / soundId).
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
    // DIARY-MERGE: стария diary → новия diary_hub (14-day program).
    // Старите въпроси (стрес/сън) се преместват в diary_evening (Wave 3.2).
    if (phase === 'diary') {
      window.AppState.transition('diary_hub');
      if (window.DiaryHub && window.DiaryHub.render) {
        window.DiaryHub.render();
      } else if (window.Home && window.Home.render) {
        window.Home.render();
      }
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

    // SAFETY-2: calibration screen
    if (phase === 'calibration' && window.VolumeCalibration && window.VolumeCalibration.render) {
      window.VolumeCalibration.render();
      return;
    }
    // PITCH-1E: pitch matching test screen
    if (phase === 'pitch_test' && window.PitchTest && window.PitchTest.render) {
      window.PitchTest.render();
      return;
    }
    // 14-day program phases (Wave 3.1-A)
    if (phase === 'thi_baseline' && window.ThiBaseline && window.ThiBaseline.render) {
      window.ThiBaseline.render();
      return;
    }
    if (phase === 'diary_hub' && window.DiaryHub && window.DiaryHub.render) {
      window.DiaryHub.render();
      return;
    }
    if (phase === 'diary_evening' && window.DiaryEvening && window.DiaryEvening.render) {
      window.DiaryEvening.render();
      return;
    }
    if (phase === 'diary_morning' && window.DiaryMorning && window.DiaryMorning.render) {
      window.DiaryMorning.render();
      return;
    }
    if (phase === 'cbt_day' && window.CbtDay && window.CbtDay.render) {
      window.CbtDay.render();
      return;
    }
    if (phase === 'progress' && window.Progress && window.Progress.render) {
      window.Progress.render();
      return;
    }

    // Unknown / unsupported phase след quiz → safety net → Home.
    // (Преди това fallback-ваше към Quiz.render(true), което при quiz-done state
    // може да render-не legacy results screen или library с празно UI — "само
    // търсачка".)
    if (window.Home && window.Home.render) {
      window.AppState.transition('home');
      window.Home.render();
    } else if (window.Quiz && window.Quiz.render) {
      window.Quiz.render(true);
    }
    if (window.BackButton && window.BackButton.update) window.BackButton.update();
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
        // popstate landing — history вече е на category entry → използваме
        // openFromPopstate който НЕ прави pushState (би създал duplicate)
        // и НЕ check-ва старият 300ms guard (валиден back-from-Player,
        // не trap-loop). Fallback на Home ако CategoryView липсва.
        if (window.CategoryView && window.CategoryView.openFromPopstate) {
          window.CategoryView.openFromPopstate(s.catId);
        } else if (window.CategoryView && window.CategoryView.render) {
          // Fallback за стара cached version без openFromPopstate
          window.AppState.transition('category');
          window.CategoryView.render();
        } else if (window.Home && window.Home.render) {
          window.Home.render();
        }
        return;
      }
      if (s.phase === 'sound' && s.soundId) {
        window.AppState.transition('sound');
        if (window.SoundDetail && window.SoundDetail.open) window.SoundDetail.open(s.soundId);
        else if (window.Home && window.Home.render) window.Home.render();
        return;
      }
      if (s.phase === 'player' && s.soundId) {
        // A2.4: BACK от Player не трябва да re-open-ва Player loop. Когато
        // popstate доведе обратно до 'player' history entry, ползваме
        // Player.render (router hook, без re-push на history) вместо
        // Player.open (което push-ва нов entry → loop).
        // Ако активният phase вече НЕ е 'player' (close() го изтри) —
        // skip и fallback към home.
        if (window.AppState.current === 'player' && window.Player && window.Player.render) {
          window.Player.render();
        } else if (window.Home && window.Home.render) {
          window.AppState.transition('home');
          window.Home.render();
        }
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

      if (s.phase === 'diary' || s.phase === 'diary_hub') {
        // DIARY-MERGE: popstate landing на legacy 'diary' → diary_hub.
        window.AppState.transition('diary_hub');
        if (window.DiaryHub && window.DiaryHub.render) {
          window.DiaryHub.render();
        } else if (window.Home && window.Home.render) {
          window.Home.render();
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

      // BACK-TO-ONBOARDING fix: setup phases (calibration, pitch_test,
      // profile_results, thi_baseline) са single-pass — popstate landing
      // върху тях → force home. Преди това fallback беше Quiz.render()
      // което изглеждаше визуално като onboarding → "ни връща в онбординга"
      // bug report от phone test.
      if (s.phase === 'calibration' || s.phase === 'pitch_test' ||
          s.phase === 'profile_results' || s.phase === 'thi_baseline') {
        console.log('[popstate] setup phase replay attempted:', s.phase, '→ force home');
        window.AppState.transition('home');
        history.replaceState({ phase: 'home' }, '');
        if (window.Home && window.Home.render) window.Home.render();
        return;
      }

      // Quiz subphase replay — само ако quiz реално активен (не done).
      if (!window.AppState.isQuizDone() && s.quizSubphase &&
          window.AppState.quizSubphases.indexOf(s.quizSubphase) !== -1) {
        window.AppState.transitionQuizSubphase(s.quizSubphase);
        if (window.AppState.current !== 'quiz') window.AppState.transition('quiz');
        if (window.Quiz) window.Quiz.render();
        return;
      }

      // BACK-TO-ONBOARDING fix: Fallback Home.render() (не Quiz.render()).
      // Quiz screen визуално прилича на onboarding wizard → user reportваше
      // "пак на онбординга". Home е safe default за post-quiz user.
      console.log('[popstate] unknown phase fallback → home:', s);
      window.AppState.transition('home');
      history.replaceState({ phase: 'home' }, '');
      if (window.Home && window.Home.render) window.Home.render();
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

    // ===== Wave 3.1-F: DISABLED bootstrap auto-start =====
    // Auto-trigger на thi_baseline СКРИВАШЕ ProfileResults screen след quiz.
    // Потребителят expects flow: onboarding → quiz → ProfileResults → home.
    // 14-day program ще се enroll-ва ръчно (бутон в Settings или ProfileResults).
    //
    // if (window.AppState.isQuizDone() && window.AppState.programStartDate == null) {
    //   window.AppState.startProgram();
    //   window.AppState.transition('thi_baseline');
    // }
    if (window.AppState.programStartDate != null) {
      window.AppState.recomputeCurrentDay();
    }
    // Home → diary_hub redirect DISABLED — Home е primary destination.
    // if (window.AppState.isProgramActive() && window.AppState.current === 'home') {
    //   window.AppState.transition('diary_hub');
    // }

    // SAFETY-2: при ПЪРВО profile_results landing → calibration screen първо.
    // Calibration done flag persistent → не пита пак.
    if (window.AppState.isQuizDone()
        && !window.AppState.calibrationDone
        && window.AppState.current === 'profile_results') {
      console.log('[bootstrap] calibration pending → redirect from profile_results');
      window.AppState.transition('calibration');
    }

    // PITCH-1E: post-calibration pitch test hook. Ако user-ът е завършил
    // calibration но не е направил pitch test (нито го е skip-нал) → редирект
    // към pitch_test от home/calibration landing.
    //
    // Trigger condition: quiz done + calibration done + pitch test "untouched"
    // (no pitch tests, no skip flag). Avoid redirect ако user вече е навигирал
    // другаде (е.g. category, player) — само от home/calibration entry.
    if (window.AppState.isQuizDone()
        && window.AppState.calibrationDone
        && window.AppState.isPitchTestDone && !window.AppState.isPitchTestDone()
        && (window.AppState.current === 'home' || window.AppState.current === 'calibration')) {
      console.log('[bootstrap] pitch test pending → redirect to pitch_test');
      window.AppState.transition('pitch_test');
    }

    // Initial history state според текуща фаза
    var initialState;
    var phase = window.AppState.current;
    var KNOWN_PHASES = ['profile_results','home','category','sound','player',
                        'calm','diary','sleep','library','mixer',
                        // Wave 3.1-A: 14-day program phases
                        'thi_baseline','diary_hub','diary_evening','diary_morning',
                        'cbt_day','progress',
                        // SAFETY-2 + PITCH-1
                        'calibration','pitch_test'];
    if (!window.AppState.isOnboardingDone()) {
      initialState = { subphase: window.AppState.subphase };
    } else if (window.AppState.isQuizDone() && KNOWN_PHASES.indexOf(phase) !== -1) {
      initialState = { phase: phase };
    } else if (window.AppState.isQuizDone()) {
      // Quiz done но phase е неизвестен → coerce към home (защита от "само
      // търсачка" екран — преди това fallback-ваше към quiz subphase).
      window.AppState.transition('home');
      initialState = { phase: 'home' };
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
    if (window.BackButton && window.BackButton.init) window.BackButton.init();

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

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(function (err) {
        console.warn('[auralis] SW registration failed:', err);
      });
      // Listen for update notifications
      navigator.serviceWorker.addEventListener('message', function (e) {
        if (e.data && e.data.type === 'SW_UPDATED') {
          if (window.Toast) {
            window.Toast.show('Нова версия — обновете', {
              variant: 'info',
              durationMs: 10000
            });
          }
        }
      });
    }
  });
})();
