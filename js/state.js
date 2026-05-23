// AURALIS state machine
// Phases: onboarding → quiz → results → mixer
// Onboarding substates: welcome → value → consent

(function () {
  'use strict';

  var KEY_PHASE = 'auralis-phase';
  var KEY_SUBPHASE = 'auralis-subphase';
  var KEY_ONBOARDING_DONE = 'auralis-onboarding-done';
  var KEY_CONSENT = 'auralis-consent-granted';

  var PHASES = ['onboarding', 'quiz', 'results', 'mixer'];
  var ONBOARDING_SUBPHASES = ['welcome', 'value', 'consent'];

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  window.AppState = {
    current: 'onboarding',
    subphase: 'welcome',

    phases: PHASES,
    onboardingSubphases: ONBOARDING_SUBPHASES,

    user: null,
    quizAnswers: {},
    profile: null,
    distressIndex: null,
    consentGranted: false,

    isOnboardingDone: function () {
      return safeGet(KEY_ONBOARDING_DONE) === 'true';
    },

    load: function () {
      if (this.isOnboardingDone()) {
        this.current = 'quiz';
        this.consentGranted = safeGet(KEY_CONSENT) === 'true';
        return;
      }
      var savedPhase = safeGet(KEY_PHASE);
      var savedSub = safeGet(KEY_SUBPHASE);
      if (savedPhase && PHASES.indexOf(savedPhase) !== -1) {
        this.current = savedPhase;
      }
      if (savedSub && ONBOARDING_SUBPHASES.indexOf(savedSub) !== -1) {
        this.subphase = savedSub;
      }
    },

    save: function () {
      safeSet(KEY_PHASE, this.current);
      safeSet(KEY_SUBPHASE, this.subphase);
    },

    markOnboardingDone: function () {
      safeSet(KEY_ONBOARDING_DONE, 'true');
      safeSet(KEY_CONSENT, this.consentGranted ? 'true' : 'false');
    },

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
      console.log('[state] sub:', from, '→', to);
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

    subphaseIndex: function () {
      return ONBOARDING_SUBPHASES.indexOf(this.subphase);
    },

    reset: function () {
      this.current = 'onboarding';
      this.subphase = 'welcome';
      this.consentGranted = false;
      safeRemove(KEY_PHASE);
      safeRemove(KEY_SUBPHASE);
      safeRemove(KEY_ONBOARDING_DONE);
      safeRemove(KEY_CONSENT);
    }
  };
})();
