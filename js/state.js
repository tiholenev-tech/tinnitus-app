// AURALIS state machine — skeleton
// Фази (planned): onboarding → quiz → results → mixer
// (sleep mode и AI overlays идват по-късно като отделни slices)

window.AppState = {
  current: 'onboarding',

  phases: ['onboarding', 'quiz', 'results', 'mixer'],

  // потребителски данни (попълват се след auth + quiz)
  user: null,
  quizAnswers: {},
  profile: null,        // TH_C | DN_S | SS_R | SM_F | HB_M
  distressIndex: null,  // 0-20

  transition(to) {
    if (!this.phases.includes(to)) {
      console.warn('[state] непозната фаза:', to);
      return false;
    }
    const from = this.current;
    this.current = to;
    console.log('[state]', from, '→', to);
    return true;
  },

  reset() {
    this.current = 'onboarding';
    this.user = null;
    this.quizAnswers = {};
    this.profile = null;
    this.distressIndex = null;
  }
};
