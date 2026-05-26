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

  // 14-day program state keys (Wave 3.1-A)
  var KEY_PROGRAM_START_DATE     = 'auralis-program-start-date';
  var KEY_PROGRAM_CURRENT_DAY    = 'auralis-program-current-day';
  var KEY_THI_BASELINE           = 'auralis-thi-baseline';
  var KEY_THI_DAY14              = 'auralis-thi-day14';
  var KEY_DIARY_ENTRIES          = 'auralis-diary-entries';
  var KEY_STREAK_ACTIVE_DAYS     = 'auralis-streak-active-days';
  var KEY_STREAK_FREEZES         = 'auralis-streak-freezes-remaining';
  var KEY_STREAK_LAST_ENTRY_DATE = 'auralis-streak-last-entry-date';

  // SAFETY-2: Volume calibration state keys
  var KEY_CALIBRATION_DONE       = 'auralis-calibration-done';
  var KEY_MIXING_POINT_VOLUME    = 'auralis-mixing-point-volume';

  // PROFILE-CONFIG: user overrides per sound
  var KEY_USER_OVERRIDES         = 'auralis-user-overrides';

  // NAV-CATEGORY-LIST: remember last category + scroll position за back-from-Player
  var KEY_LAST_CATEGORY_VIEW     = 'auralis-last-category-view';

  // PITCH-1: pitch matching test persistence
  var KEY_PITCH_TESTS            = 'auralis-pitch-tests';
  var KEY_PITCH_SKIP_REASON      = 'auralis-pitch-skip-reason';
  var KEY_PITCH_SKIPPED          = 'auralis-pitch-skipped';
  var KEY_AUDIO_DEVICE           = 'auralis-audio-device';

  var PHASES = [
    'onboarding', 'quiz', 'results', 'profile_results',
    'mixer', 'library', 'sleep', 'diary', 'calm',
    'home', 'category', 'sound', 'player',
    // 14-day program phases (Wave 3.1-A)
    'thi_baseline', 'diary_hub', 'diary_evening', 'diary_morning',
    'cbt_day', 'progress',
    // SAFETY-2: volume calibration screen
    'calibration',
    // PITCH-1: pitch matching test (Phase 1 — first test only)
    'pitch_test'
  ];
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

    // ===== 14-day program (Wave 3.1-A) =====
    programStartDate: null,         // Unix ms timestamp; null преди старт
    currentProgramDay: null,        // 1..14 — derived от today - programStartDate
    thiBaseline: null,              // 0..100; baseline THI score (Day 1)
    thiDay14: null,                 // 0..100; финален THI score (Day 14)
    diaryEntries: {},               // { 'YYYY-MM-DD': { evening, morning, cbtCompleted, cbtReflection } }
    streakActiveDays: 0,            // последователни активни дни
    streakFreezesRemaining: 2,      // максимум 2 freeze-а в програмата
    streakLastEntryDate: null,      // 'YYYY-MM-DD' на последния запис

    // ===== Volume calibration (SAFETY-2) =====
    calibrationDone: false,         // true след първото калибриране
    mixingPointVolume: null,        // 0..75 — потребителска точка на смесване

    // ===== PROFILE-CONFIG user overrides per sound =====
    userOverrides: {},              // { soundId: { l1, l2, master, ts } }

    // ===== NAV-CATEGORY-LIST (back-from-Player) =====
    lastCategoryView: null,         // { catId, scrollPos, ts }

    // ===== PITCH-1: pitch matching test state =====
    pitchTests: [],                 // [{ day, freq, timestamp, trials, octaveCheck? }]
    pitchSkipReason: null,          // 'noise_type' | 'pulsing' | 'other' | null
    pitchSkipped: false,            // true ако user избра skip в pre-test
    audioDevice: 'unknown',         // 'speakers' | 'bone' | 'openback' | 'inear' | 'unknown'

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

      // 14-day program restore (Wave 3.1-A)
      var psd = get(KEY_PROGRAM_START_DATE);
      this.programStartDate = (psd === null || psd === '') ? null : (parseInt(psd, 10) || null);
      var cpd = get(KEY_PROGRAM_CURRENT_DAY);
      this.currentProgramDay = (cpd === null || cpd === '') ? null : (parseInt(cpd, 10) || null);
      var thiB = get(KEY_THI_BASELINE);
      this.thiBaseline = (thiB === null || thiB === '') ? null : parseInt(thiB, 10);
      if (isNaN(this.thiBaseline)) this.thiBaseline = null;
      var thiD = get(KEY_THI_DAY14);
      this.thiDay14 = (thiD === null || thiD === '') ? null : parseInt(thiD, 10);
      if (isNaN(this.thiDay14)) this.thiDay14 = null;
      this.diaryEntries = parseJSON(get(KEY_DIARY_ENTRIES), {});
      var sad = get(KEY_STREAK_ACTIVE_DAYS);
      this.streakActiveDays = (sad === null || sad === '') ? 0 : (parseInt(sad, 10) || 0);
      var sfr = get(KEY_STREAK_FREEZES);
      this.streakFreezesRemaining = (sfr === null || sfr === '') ? 2 : (parseInt(sfr, 10) || 0);
      this.streakLastEntryDate = get(KEY_STREAK_LAST_ENTRY_DATE) || null;
      // SAFETY-2: calibration restore
      this.calibrationDone = get(KEY_CALIBRATION_DONE) === 'true';
      var mpv = get(KEY_MIXING_POINT_VOLUME);
      this.mixingPointVolume = (mpv === null || mpv === '') ? null : parseInt(mpv, 10);
      if (isNaN(this.mixingPointVolume)) this.mixingPointVolume = null;
      // PROFILE-CONFIG: user overrides
      this.userOverrides = parseJSON(get(KEY_USER_OVERRIDES), {});
      // NAV-CATEGORY-LIST: last category view (back-from-Player)
      this.lastCategoryView = parseJSON(get(KEY_LAST_CATEGORY_VIEW), null);
      // PITCH-1: pitch test state
      this.pitchTests = parseJSON(get(KEY_PITCH_TESTS), []);
      this.pitchSkipReason = get(KEY_PITCH_SKIP_REASON) || null;
      this.pitchSkipped = get(KEY_PITCH_SKIPPED) === 'true';
      this.audioDevice = get(KEY_AUDIO_DEVICE) || 'unknown';
      // Recompute currentProgramDay (capped 1..14)
      if (this.programStartDate) {
        var daysElapsed = Math.floor((Date.now() - this.programStartDate) / 86400000);
        this.currentProgramDay = Math.min(daysElapsed + 1, 14);
        set(KEY_PROGRAM_CURRENT_DAY, String(this.currentProgramDay));
      }

      if (this.isQuizDone()) {
        // Quiz done → primary destination = Home (per BIBLE v3.1 §N2).
        // Bug 1 fix: legacy phases ('library', 'mixer') се MIGRATE към 'home'.
        // Това гарантира че old session storage не праща юзъра на премахнати
        // primary екрани.
        var savedPhase = get(KEY_PHASE);
        var LEGACY_TO_HOME = ['library', 'mixer', 'results'];
        var RESTORE_OK = [
          'home', 'category', 'sound', 'player', 'sleep', 'diary', 'calm',
          'profile_results',
          // 14-day program phases
          'thi_baseline', 'diary_hub', 'diary_evening', 'diary_morning',
          'cbt_day', 'progress',
          // SAFETY-2
          'calibration',
          // PITCH-1
          'pitch_test'
        ];

        if (savedPhase && LEGACY_TO_HOME.indexOf(savedPhase) !== -1) {
          // Migrate + persist (предотвратява повторен reload в legacy)
          this.current = 'home';
          set(KEY_PHASE, 'home');
        } else if (savedPhase && RESTORE_OK.indexOf(savedPhase) !== -1) {
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

    // NAV-STACK: phaseHistory вместо single previousPhase slot.
    // Single slot loop-ваше при BACK→transition→overwrites previousPhase.
    phaseHistory: [],

    transition: function (to) {
      if (PHASES.indexOf(to) === -1) {
        console.warn('[state] непозната фаза:', to);
        return false;
      }
      var from = this.current;
      if (!this.phaseHistory) this.phaseHistory = [];
      if (from && from !== to) {
        this.phaseHistory.push(from);
        // Cap at 20 entries (memory leak protection)
        if (this.phaseHistory.length > 20) this.phaseHistory.shift();
      }
      this.current = to;
      this.save();
      console.log('[state]', from, '→', to, '(stack:', this.phaseHistory.length + ')');
      return true;
    },

    // popPhase: BACK navigation. Pop последния phase БЕЗ да го push-ва
    // обратно (предотвратява loop). Връща null ако stack-а е празен.
    popPhase: function () {
      if (!this.phaseHistory || this.phaseHistory.length === 0) {
        return null;
      }
      var prev = this.phaseHistory.pop();
      this.current = prev;
      this.save();
      console.log('[state] BACK to:', prev, '(stack:', this.phaseHistory.length + ')');
      return prev;
    },

    // Backward compat: getter връща top на stack-а (без да pop-ва).
    // Стария код който чете state.previousPhase да продължи да работи.
    get previousPhase() {
      if (!this.phaseHistory || this.phaseHistory.length === 0) return null;
      return this.phaseHistory[this.phaseHistory.length - 1];
    },

    clearPhaseHistory: function () {
      this.phaseHistory = [];
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

    // ===== 14-day program helpers (Wave 3.1-A) =====

    isProgramActive: function () {
      return this.programStartDate !== null && this.currentProgramDay !== null
        && this.currentProgramDay <= 14;
    },

    todayKey: function () {
      var d = new Date();
      var y = d.getFullYear();
      var m = ('0' + (d.getMonth() + 1)).slice(-2);
      var day = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + day;
    },

    recomputeCurrentDay: function () {
      if (!this.programStartDate) return null;
      var elapsed = Math.floor((Date.now() - this.programStartDate) / 86400000);
      this.currentProgramDay = Math.min(elapsed + 1, 14);
      set(KEY_PROGRAM_CURRENT_DAY, String(this.currentProgramDay));
      return this.currentProgramDay;
    },

    startProgram: function () {
      this.programStartDate = Date.now();
      this.currentProgramDay = 1;
      this.thiBaseline = null;
      this.thiDay14 = null;
      this.diaryEntries = {};
      this.streakActiveDays = 0;
      this.streakFreezesRemaining = 2;
      this.streakLastEntryDate = null;
      set(KEY_PROGRAM_START_DATE, String(this.programStartDate));
      set(KEY_PROGRAM_CURRENT_DAY, '1');
      remove(KEY_THI_BASELINE);
      remove(KEY_THI_DAY14);
      set(KEY_DIARY_ENTRIES, '{}');
      set(KEY_STREAK_ACTIVE_DAYS, '0');
      set(KEY_STREAK_FREEZES, '2');
      remove(KEY_STREAK_LAST_ENTRY_DATE);
      console.log('[state] program started at', new Date(this.programStartDate).toISOString());
    },

    setThiBaseline: function (score) {
      this.thiBaseline = score;
      set(KEY_THI_BASELINE, String(score));
    },

    setThiDay14: function (score) {
      this.thiDay14 = score;
      set(KEY_THI_DAY14, String(score));
    },

    // SAFETY-2: volume calibration helpers
    setCalibration: function (volume) {
      this.mixingPointVolume = Math.max(0, Math.min(75, parseInt(volume, 10) || 0));
      this.calibrationDone = true;
      set(KEY_MIXING_POINT_VOLUME, String(this.mixingPointVolume));
      set(KEY_CALIBRATION_DONE, 'true');
    },

    // PROFILE-CONFIG: user override persistence
    saveUserOverrides: function () {
      try { set(KEY_USER_OVERRIDES, JSON.stringify(this.userOverrides || {})); }
      catch (e) { /* ignore */ }
    },

    // NAV-CATEGORY-LIST: запази последно отворена category + scroll position.
    // Викан от CategoryView.openSound преди да отиде в Player → onBack
    // restore-ва както категорията, така и позицията.
    saveLastCategoryView: function (catId, scrollPos) {
      this.lastCategoryView = {
        catId: catId,
        scrollPos: Math.max(0, parseInt(scrollPos, 10) || 0),
        ts: Date.now()
      };
      try { set(KEY_LAST_CATEGORY_VIEW, JSON.stringify(this.lastCategoryView)); }
      catch (e) { /* ignore */ }
    },

    // PITCH-1: pitch test result persistence + skip handling.
    addPitchTest: function (test) {
      // test = { freq, trials, octaveCheck? }
      if (!this.pitchTests) this.pitchTests = [];
      var entry = {
        day: this.currentProgramDay || null,
        freq: parseInt(test.freq, 10) || null,
        timestamp: Date.now(),
        trials: test.trials || [],
        octaveCheck: test.octaveCheck || null
      };
      this.pitchTests.push(entry);
      try { set(KEY_PITCH_TESTS, JSON.stringify(this.pitchTests)); } catch (e) {}
      return entry;
    },
    setPitchSkip: function (reason) {
      this.pitchSkipped = true;
      this.pitchSkipReason = reason || 'other';
      set(KEY_PITCH_SKIPPED, 'true');
      set(KEY_PITCH_SKIP_REASON, this.pitchSkipReason);
    },
    setAudioDevice: function (device) {
      var ALLOWED = ['speakers', 'bone', 'openback', 'inear', 'unknown'];
      if (ALLOWED.indexOf(device) === -1) device = 'unknown';
      this.audioDevice = device;
      set(KEY_AUDIO_DEVICE, device);
    },
    isPitchTestDone: function () {
      return !!(this.pitchSkipped || (this.pitchTests && this.pitchTests.length > 0));
    },

    saveDiaryEntry: function (dateKey, partial) {
      // partial = { evening?:..., morning?:..., cbtCompleted?:..., cbtReflection?:... }
      if (!this.diaryEntries[dateKey]) this.diaryEntries[dateKey] = {};
      Object.keys(partial).forEach(function (k) {
        this.diaryEntries[dateKey][k] = partial[k];
      }.bind(this));
      set(KEY_DIARY_ENTRIES, JSON.stringify(this.diaryEntries));
    },

    // Streak logic — invoked после нов diary запис.
    // Ако last entry е "вчера" → +1.
    // Ако last entry е >1 ден назад → consume freeze; ако freeze няма → reset до 1.
    updateStreakOnEntry: function () {
      var today = this.todayKey();
      if (this.streakLastEntryDate === today) {
        // Същия ден — нищо ново.
        return;
      }
      if (!this.streakLastEntryDate) {
        this.streakActiveDays = 1;
      } else {
        var last = new Date(this.streakLastEntryDate + 'T00:00:00');
        var now  = new Date(today + 'T00:00:00');
        var diffDays = Math.round((now - last) / 86400000);
        if (diffDays === 1) {
          this.streakActiveDays += 1;
        } else if (diffDays > 1 && this.streakFreezesRemaining > 0) {
          // Consume freezes за missed days, до limit.
          var missed = diffDays - 1;
          var consume = Math.min(missed, this.streakFreezesRemaining);
          this.streakFreezesRemaining -= consume;
          if (missed > consume) {
            this.streakActiveDays = 1;
          } else {
            this.streakActiveDays += 1;
          }
        } else if (diffDays > 1) {
          this.streakActiveDays = 1;
        }
      }
      this.streakLastEntryDate = today;
      set(KEY_STREAK_ACTIVE_DAYS, String(this.streakActiveDays));
      set(KEY_STREAK_FREEZES, String(this.streakFreezesRemaining));
      set(KEY_STREAK_LAST_ENTRY_DATE, this.streakLastEntryDate);
    },

    setQuizAnswer: function (qId, optionKey) {
      this.quizAnswers['q' + qId] = optionKey;
      this.saveQuizAnswers();
    },

    subphaseIndex: function () {
      return ONBOARDING_SUBPHASES.indexOf(this.subphase);
    },

    // ===== Reset quiz only (preserve onboarding/consent/theme) =====
    // Викай при връщане в onboarding welcome → новата сесия започва с чисти отговори.
    resetQuiz: function () {
      this.quizSubphase = 'q1';
      this.quizAnswers = {};
      this.profile = null;
      this.distressIndex = null;

      remove(KEY_QUIZ_SUBPHASE);
      remove(KEY_QUIZ_ANSWERS);
      remove(KEY_QUIZ_DONE);
      remove(KEY_QUIZ_PROFILE);
      remove(KEY_QUIZ_DI);
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
      this.phaseHistory = [];  // NAV-STACK: clean start
      // 14-day program reset (Wave 3.1-A)
      this.programStartDate = null;
      this.currentProgramDay = null;
      this.thiBaseline = null;
      this.thiDay14 = null;
      this.diaryEntries = {};
      this.streakActiveDays = 0;
      this.streakFreezesRemaining = 2;
      this.streakLastEntryDate = null;

      remove(KEY_PHASE);
      remove(KEY_SUBPHASE);
      remove(KEY_ONBOARDING_DONE);
      remove(KEY_CONSENT);
      remove(KEY_QUIZ_SUBPHASE);
      remove(KEY_QUIZ_ANSWERS);
      remove(KEY_QUIZ_DONE);
      remove(KEY_QUIZ_PROFILE);
      remove(KEY_QUIZ_DI);
      remove(KEY_PROGRAM_START_DATE);
      remove(KEY_PROGRAM_CURRENT_DAY);
      remove(KEY_THI_BASELINE);
      remove(KEY_THI_DAY14);
      remove(KEY_DIARY_ENTRIES);
      remove(KEY_STREAK_ACTIVE_DAYS);
      remove(KEY_STREAK_FREEZES);
      remove(KEY_STREAK_LAST_ENTRY_DATE);
      // SAFETY-2: calibration reset
      this.calibrationDone = false;
      this.mixingPointVolume = null;
      remove(KEY_CALIBRATION_DONE);
      remove(KEY_MIXING_POINT_VOLUME);
      // PROFILE-CONFIG: user overrides reset
      this.userOverrides = {};
      remove(KEY_USER_OVERRIDES);
      // NAV-CATEGORY-LIST: reset
      this.lastCategoryView = null;
      remove(KEY_LAST_CATEGORY_VIEW);
      // PITCH-1: reset
      this.pitchTests = [];
      this.pitchSkipReason = null;
      this.pitchSkipped = false;
      this.audioDevice = 'unknown';
      remove(KEY_PITCH_TESTS);
      remove(KEY_PITCH_SKIP_REASON);
      remove(KEY_PITCH_SKIPPED);
      remove(KEY_AUDIO_DEVICE);
    }
  };
})();
