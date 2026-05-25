// AURALIS state machine
// Phases: onboarding → quiz → results → mixer (calm/sleep идват по-късно)
// Onboarding substates: welcome → value → consent
// Quiz substates: q1 .. q15 → results

(function () {
  'use strict';

  // ===== Storage keys =====
  var KEY_PHASE = 'auralis-phase';
  var KEY_SUBPHASE = 'auralis-subphase';
  var KEY_ONBOARDING_DONE = 'auralis-onboarding-done';
  var KEY_CONSENT = 'auralis-consent-granted';

  var KEY_QUIZ_SUBPHASE = 'auralis-quiz-subphase';
  var KEY_QUIZ_ANSWERS  = 'auralis-quiz-answers';
  var KEY_QUIZ_DONE     = 'auralis-quiz-done';
  var KEY_QUIZ_PROFILE  = 'auralis-quiz-profile';
  var KEY_QUIZ_DI       = 'auralis-quiz-di';

  var PHASES = ['onboarding', 'quiz', 'results', 'mixer', 'library', 'sleep', 'diary', 'calm', 'home', 'category', 'sound', 'player'];
  var ONBOARDING_SUBPHASES = ['welcome', 'value', 'consent'];

  function quizSubphaseList() {
    var list = [];
    for (var i = 1; i <= 15; i++) list.push('q' + i);
    list.push('results');
    return list;
  }
  var QUIZ_SUBPHASES = quizSubphaseList();

  // ===== Safe localStorage =====

  function get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function parseJSON(value, fallback) {
    if (!value) return fallback;
    try { return JSON.parse(value); } catch (e) { return fallback; }
  }

  // ===== Public API =====

  window.AppState = {
    current: 'onboarding',
    subphase: 'welcome',
    quizSubphase: 'q1',

    phases: PHASES,
    onboardingSubphases: ONBOARDING_SUBPHASES,
    quizSubphases: QUIZ_SUBPHASES,

    user: null,
    quizAnswers: {},        // { q1: 'a', q2: 'b', ... }
    profile: null,          // 'TH_C' | 'DN_S' | 'SS_R' | 'SM_F' | 'HB_M'
    distressIndex: null,    // 0-20
    consentGranted: false,

    // ===== Status checks =====

    isOnboardingDone: function () {
      return get(KEY_ONBOARDING_DONE) === 'true';
    },

    isQuizDone: function () {
      return get(KEY_QUIZ_DONE) === 'true';
    },

    // ===== Load / save =====

    load: function () {
      this.consentGranted = get(KEY_CONSENT) === 'true';
      this.quizAnswers   = parseJSON(get(KEY_QUIZ_ANSWERS), {});
      this.profile       = get(KEY_QUIZ_PROFILE) || null;
      var diRaw          = get(KEY_QUIZ_DI);
      this.distressIndex = (diRaw === null || diRaw === '') ? null : parseInt(diRaw, 10);

      if (this.isQuizDone()) {
        // Quiz done → primary destination = Home (per BIBLE v3.1 §N2).
        // Honor saved phase ако е recognized navigation phase.
        var savedPhase = get(KEY_PHASE);
        var navPhases = ['home', 'library', 'mixer', 'category', 'sound', 'player'];
        if (savedPhase && navPhases.indexOf(savedPhase) !== -1) {
          this.current = savedPhase;
        } else {
          this.current = 'home';
        }
        return;
      }

      if (this.isOnboardingDone()) {
        this.current = 'quiz';
        var savedQuizSub = get(KEY_QUIZ_SUBPHASE);
        if (savedQuizSub && QUIZ_SUBPHASES.indexOf(savedQuizSub) !== -1) {
          this.quizSubphase = savedQuizSub;
        } else {
          this.quizSubphase = 'q1';
        }
        return;
      }

      // Still in onboarding
      var savedPhase = get(KEY_PHASE);
      var savedSub   = get(KEY_SUBPHASE);
      if (savedPhase && PHASES.indexOf(savedPhase) !== -1) {
        this.current = savedPhase;
      }
      if (savedSub && ONBOARDING_SUBPHASES.indexOf(savedSub) !== -1) {
        this.subphase = savedSub;
      }
    },

    save: function () {
      set(KEY_PHASE, this.current);
      set(KEY_SUBPHASE, this.subphase);
      set(KEY_QUIZ_SUBPHASE, this.quizSubphase);
    },

    saveQuizAnswers: function () {
      set(KEY_QUIZ_ANSWERS, JSON.stringify(this.quizAnswers));
    },

    markOnboardingDone: function () {
      set(KEY_ONBOARDING_DONE, 'true');
      set(KEY_CONSENT, this.consentGranted ? 'true' : 'false');
    },

    markQuizDone: function (profile, di) {
      this.profile = profile;
      this.distressIndex = di;
      set(KEY_QUIZ_DONE, 'true');
      set(KEY_QUIZ_PROFILE, profile);
      set(KEY_QUIZ_DI, String(di));
    },

    // ===== Phase / subphase transitions =====

    transition: function (to) {
      if (PHASES.indexOf(to) === -1) {
        console.warn('[state] непозната фаза:', to);
        return false;
      }
      var from = this.current;
      this.current = to;
      this.save();
      console.log('[state]', from, '→', to);
      return true;
    },

    transitionSubphase: function (to) {
      if (ONBOARDING_SUBPHASES.indexOf(to) === -1) return false;
      var from = this.subphase;
      this.subphase = to;
      this.save();
      console.log('[state] onboarding:', from, '→', to);
      return true;
    },

    transitionQuizSubphase: function (to) {
      if (QUIZ_SUBPHASES.indexOf(to) === -1) return false;
      var from = this.quizSubphase;
      this.quizSubphase = to;
      this.save();
      console.log('[state] quiz:', from, '→', to);
      return true;
    },

    nextSubphase: function () {
      var i = ONBOARDING_SUBPHASES.indexOf(this.subphase);
      if (i < ONBOARDING_SUBPHASES.length - 1) {
        return this.transitionSubphase(ONBOARDING_SUBPHASES[i + 1]);
      }
      return false;
    },

    prevSubphase: function () {
      var i = ONBOARDING_SUBPHASES.indexOf(this.subphase);
      if (i > 0) {
        return this.transitionSubphase(ONBOARDING_SUBPHASES[i - 1]);
      }
      return false;
    },

    nextQuizSubphase: function () {
      var i = QUIZ_SUBPHASES.indexOf(this.quizSubphase);
      if (i < QUIZ_SUBPHASES.length - 1) {
        return this.transitionQuizSubphase(QUIZ_SUBPHASES[i + 1]);
      }
      return false;
    },

    prevQuizSubphase: function () {
      var i = QUIZ_SUBPHASES.indexOf(this.quizSubphase);
      if (i > 0) {
        return this.transitionQuizSubphase(QUIZ_SUBPHASES[i - 1]);
      }
      return false;
    },

    quizQuestionNumber: function () {
      if (this.quizSubphase === 'results') return 16;
      var n = parseInt(this.quizSubphase.replace('q', ''), 10);
      return isNaN(n) ? 1 : n;
    },

    setQuizAnswer: function (qId, optionKey) {
      this.quizAnswers['q' + qId] = optionKey;
      this.saveQuizAnswers();
    },

    subphaseIndex: function () {
      return ONBOARDING_SUBPHASES.indexOf(this.subphase);
    },

    // ===== Reset (full wipe) =====

    reset: function () {
      this.current = 'onboarding';
      this.subphase = 'welcome';
      this.quizSubphase = 'q1';
      this.consentGranted = false;
      this.quizAnswers = {};
      this.profile = null;
      this.distressIndex = null;

      remove(KEY_PHASE);
      remove(KEY_SUBPHASE);
      remove(KEY_ONBOARDING_DONE);
      remove(KEY_CONSENT);
      remove(KEY_QUIZ_SUBPHASE);
      remove(KEY_QUIZ_ANSWERS);
      remove(KEY_QUIZ_DONE);
      remove(KEY_QUIZ_PROFILE);
      remove(KEY_QUIZ_DI);
    }
  };
})();
