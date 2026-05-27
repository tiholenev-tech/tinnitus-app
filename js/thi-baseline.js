/**
 * AURALIS ThiBaseline — 25-question THI assessment (Wave 3.2)
 * ===========================================================================
 * Single-question-per-screen flow. Used for:
 *   - Day 1: baseline (state.thiBaseline)
 *   - Day 14: final (state.thiDay14)
 *
 * Newman C.W., Jacobson G.P., Spitzer J.B. (1996) THI scale:
 *   Да = 4 / Понякога = 2 / Не = 0. Sum 0..100.
 *
 * Категорийни subscores:
 *   F (Functional, 11 q): 1, 2, 4, 7, 9, 12, 13, 15, 18, 20, 24  → max 44
 *   E (Emotional, 9 q):   3, 6, 10, 14, 16, 17, 21, 22, 25       → max 36
 *   C (Catastrophic, 5 q): 5, 8, 11, 19, 23                       → max 20
 *
 * Public API:
 *   ThiBaseline.open()    — start fresh assessment
 *   ThiBaseline.render()  — router hook (resume on reload)
 *   ThiBaseline.scoreBreakdown() — { total, F, E, C } за consumers
 */

window.ThiBaseline = (function () {
  'use strict';

  var STORAGE_INDEX  = 'auralis-thi-active-index';
  var STORAGE_SCORES = 'auralis-thi-active-scores';

  var TOTAL_QUESTIONS = 25;
  var OPTIONS = [
    { key: 'yes',       labelKey: 'thi.options.yes',       fallback: 'Да',       points: 4 },
    { key: 'sometimes', labelKey: 'thi.options.sometimes', fallback: 'Понякога', points: 2 },
    { key: 'no',        labelKey: 'thi.options.no',        fallback: 'Не',       points: 0 }
  ];

  // Newman 1996 category map (1-indexed → cat F/E/C)
  var QUESTIONS_META = [
    { cat: 'F' }, { cat: 'F' }, { cat: 'E' }, { cat: 'F' }, { cat: 'C' },
    { cat: 'E' }, { cat: 'F' }, { cat: 'C' }, { cat: 'F' }, { cat: 'E' },
    { cat: 'C' }, { cat: 'F' }, { cat: 'F' }, { cat: 'E' }, { cat: 'F' },
    { cat: 'E' }, { cat: 'E' }, { cat: 'F' }, { cat: 'C' }, { cat: 'F' },
    { cat: 'E' }, { cat: 'E' }, { cat: 'C' }, { cat: 'F' }, { cat: 'E' }
  ];

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  var currentIndex = 0;   // 0..24
  var scores = [];        // array of points per question

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function loadActive() {
    try {
      var idx = parseInt(localStorage.getItem(STORAGE_INDEX), 10);
      if (!isNaN(idx) && idx >= 0 && idx < TOTAL_QUESTIONS) {
        currentIndex = idx;
      } else {
        currentIndex = 0;
      }
      var raw = localStorage.getItem(STORAGE_SCORES);
      scores = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(scores)) scores = [];
    } catch (e) {
      currentIndex = 0; scores = [];
    }
  }

  function saveActive() {
    try {
      localStorage.setItem(STORAGE_INDEX, String(currentIndex));
      localStorage.setItem(STORAGE_SCORES, JSON.stringify(scores));
    } catch (e) { /* ignore */ }
  }

  function clearActive() {
    try {
      localStorage.removeItem(STORAGE_INDEX);
      localStorage.removeItem(STORAGE_SCORES);
    } catch (e) { /* ignore */ }
  }

  function totalScore() {
    var sum = 0;
    for (var i = 0; i < scores.length; i++) sum += (scores[i] || 0);
    return sum;
  }

  function scoreBreakdown() {
    var breakdown = { total: 0, F: 0, E: 0, C: 0 };
    for (var i = 0; i < scores.length; i++) {
      var pts = scores[i] || 0;
      breakdown.total += pts;
      var meta = QUESTIONS_META[i];
      if (meta && breakdown.hasOwnProperty(meta.cat)) {
        breakdown[meta.cat] += pts;
      }
    }
    return breakdown;
  }

  // ============================================================
  // HTML
  // ============================================================

  function buildQuestionHtml() {
    var qNum = currentIndex + 1;
    var selected = scores[currentIndex];
    var questionText = t('thi.q' + qNum, 'Въпрос ' + qNum);
    var progressText = t('thi.progressFmt', 'Въпрос {n} от {total}', { n: qNum, total: TOTAL_QUESTIONS });
    var progressPct  = Math.round((qNum / TOTAL_QUESTIONS) * 100);
    var titleText    = t('thi.title', 'THI оценка');
    var prevLabel    = t('thi.actions.prev', 'Назад');

    var optionsHtml = OPTIONS.map(function (opt) {
      var isActive = (typeof selected === 'number' && selected === opt.points);
      var label = t(opt.labelKey, opt.fallback);
      return (
        '<button class="thi-option' + (isActive ? ' is-active' : '') + '" type="button"' +
          ' data-action="select" data-points="' + opt.points + '"' +
          ' aria-pressed="' + (isActive ? 'true' : 'false') + '">' +
          '<span class="thi-option-circle" aria-hidden="true"></span>' +
          '<span class="thi-option-label">' + escapeHtml(label) + '</span>' +
        '</button>'
      );
    }).join('');

    var hasAnswer = (typeof selected === 'number');
    var isLast = (currentIndex === TOTAL_QUESTIONS - 1);
    var nextLabel = isLast ? t('thi.actions.finish', 'Завърши') : t('thi.actions.next', 'Следващ');

    return (
      '<div class="thi-screen" data-screen="thi_baseline">' +
        '<div class="thi-progress">' +
          '<div class="thi-progress-bar"><div class="thi-progress-fill" style="width:' + progressPct + '%"></div></div>' +
          '<div class="thi-progress-text">' + escapeHtml(progressText) + '</div>' +
        '</div>' +
        '<h1 class="thi-title">' + escapeHtml(titleText) + '</h1>' +
        '<section class="thi-section">' +
          '<div class="thi-question-num">' + qNum + ' / ' + TOTAL_QUESTIONS + '</div>' +
          '<div class="thi-question">' + escapeHtml(questionText) + '</div>' +
          '<div class="thi-options">' + optionsHtml + '</div>' +
        '</section>' +
        '<div class="thi-actions">' +
          (currentIndex > 0
            ? '<button class="thi-btn thi-btn--ghost" type="button" data-action="prev">' + escapeHtml(prevLabel) + '</button>'
            : '') +
          '<button class="thi-btn thi-btn--primary" type="button"' +
            ' data-action="next"' + (hasAnswer ? '' : ' disabled') + '>' +
            escapeHtml(nextLabel) +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function buildResultHtml() {
    var score = totalScore();
    var isDay14 = !!(window.AppState && window.AppState.currentProgramDay === 14);
    var label = isDay14
      ? t('thi.result.day14', 'Финален THI score (Ден 14)')
      : t('thi.result.baseline', 'Baseline THI score');
    var doneTitle = t('thi.result.done', 'Готово');
    var continueLabel = t('thi.actions.continue', 'Продължи');
    return (
      '<div class="thi-screen" data-screen="thi_baseline_result">' +
        '<h1 class="thi-title">' + escapeHtml(doneTitle) + '</h1>' +
        '<section class="thi-section thi-result">' +
          '<div class="thi-score">' + score + '</div>' +
          '<div class="thi-score-label">' + escapeHtml(label) + '</div>' +
        '</section>' +
        '<div class="thi-actions">' +
          '<button class="thi-btn thi-btn--primary" type="button" data-action="finish">' + escapeHtml(continueLabel) + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'select') {
      var pts = parseInt(btn.getAttribute('data-points'), 10);
      if (isNaN(pts)) return;
      scores[currentIndex] = pts;
      saveActive();
      refresh();
    } else if (action === 'next') {
      if (typeof scores[currentIndex] !== 'number') return;
      if (currentIndex === TOTAL_QUESTIONS - 1) {
        showResult();
      } else {
        currentIndex += 1;
        saveActive();
        refresh();
      }
    } else if (action === 'prev') {
      if (currentIndex > 0) {
        currentIndex -= 1;
        saveActive();
        refresh();
      }
    } else if (action === 'finish') {
      finalize();
    }
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildQuestionHtml();
    app.addEventListener('click', onClick);
  }

  function showResult() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildResultHtml();
    app.addEventListener('click', onClick);
  }

  function finalize() {
    var score = totalScore();
    var breakdown = scoreBreakdown();
    var s = window.AppState;
    if (!s) return;
    // PACK C T1: retest detection — ако baseline вече попълнен, това е retest.
    // Покрива и flexible Day-13 UX choice (не строгото currentProgramDay === 14).
    var isRetest = (typeof s.thiBaseline === 'number');
    if (isRetest) {
      s.setThiDay14(score);
      if (s.setThiDay14Breakdown) s.setThiDay14Breakdown(breakdown);
      clearActive();
      if (window.Toast && window.Toast.success) {
        window.Toast.success(t('thi.result.completed', 'Записахме новия резултат'));
      }
      s.transition('home');
      history.replaceState({ phase: 'home' }, '');
      if (window.Home && window.Home.render) window.Home.render();
    } else {
      s.setThiBaseline(score);
      if (s.setThiBaselineBreakdown) s.setThiBaselineBreakdown(breakdown);
      clearActive();
      // FIX THI-FINALIZE-PITCH-ROUTING: insert pitch_test ако не е минат.
      // Mirror на calibration routing (volume-calibration.js finishCalibration).
      // Преди това baseline branch прескачаше pitch_test → user никога не
      // правеше pitch matching → state.pitchTests винаги празно → T3 notch
      // filter не може да се active-ва.
      var needsPitch = s && s.isPitchTestDone && !s.isPitchTestDone()
                        && window.PitchTest && window.PitchTest.render;
      if (needsPitch) {
        s.transition('pitch_test');
        history.replaceState({ phase: 'pitch_test' }, '');
        window.PitchTest.render();
      } else {
        s.transition('diary_hub');
        history.replaceState({ phase: 'diary_hub' }, '');
        if (window.DiaryHub && window.DiaryHub.render) {
          window.DiaryHub.render();
        } else if (window.Home && window.Home.render) {
          window.Home.render();
        }
      }
    }
  }

  function open() {
    // Fresh start
    currentIndex = 0;
    scores = [];
    clearActive();
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('thi_baseline');
    }
    history.pushState({ phase: 'thi_baseline' }, '');
    refresh();
  }

  function render() {
    // Router hook (resume)
    loadActive();
    refresh();
  }

  return {
    open: open,
    render: render,
    scoreBreakdown: scoreBreakdown
  };
})();
