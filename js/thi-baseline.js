/**
 * AURALIS ThiBaseline — 25-question THI assessment (Wave 3.1-B)
 * ===========================================================================
 * Single-question-per-screen flow. Used for:
 *   - Day 1: baseline (state.thiBaseline)
 *   - Day 14: final (state.thiDay14)
 *
 * 3 options: Никога=0pt, Понякога=2pt, Винаги=4pt. Sum 0..100.
 *
 * Public API:
 *   ThiBaseline.open()    — start fresh assessment
 *   ThiBaseline.render()  — router hook (resume on reload)
 *
 * Wave 3.2 ще замени placeholder texts с реални THI question strings.
 */

window.ThiBaseline = (function () {
  'use strict';

  var STORAGE_INDEX  = 'auralis-thi-active-index';
  var STORAGE_SCORES = 'auralis-thi-active-scores';

  var TOTAL_QUESTIONS = 25;
  var OPTIONS = [
    { key: 'never',     label: 'Никога',    points: 0 },
    { key: 'sometimes', label: 'Понякога',  points: 2 },
    { key: 'always',    label: 'Винаги',    points: 4 }
  ];

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

  // ============================================================
  // HTML
  // ============================================================

  function buildQuestionHtml() {
    var qNum = currentIndex + 1;
    var selected = scores[currentIndex];
    // Phone test cleanup: премахнат "TODO 3.2" placeholder.
    // Реалните 25 THI questions ще се добавят с content team Wave 3.2.
    var questionText = 'Въпрос ' + qNum;
    var progressText = 'Въпрос ' + qNum + ' от ' + TOTAL_QUESTIONS;
    var progressPct  = Math.round((qNum / TOTAL_QUESTIONS) * 100);

    var optionsHtml = OPTIONS.map(function (opt, idx) {
      var isActive = (typeof selected === 'number' && selected === opt.points);
      return (
        '<button class="thi-option' + (isActive ? ' is-active' : '') + '" type="button"' +
          ' data-action="select" data-points="' + opt.points + '"' +
          ' aria-pressed="' + (isActive ? 'true' : 'false') + '">' +
          '<span class="thi-option-circle" aria-hidden="true"></span>' +
          '<span class="thi-option-label">' + escapeHtml(opt.label) + '</span>' +
        '</button>'
      );
    }).join('');

    var hasAnswer = (typeof selected === 'number');
    var isLast = (currentIndex === TOTAL_QUESTIONS - 1);
    var nextLabel = isLast ? 'Завърши' : 'Следващ';

    return (
      '<div class="thi-screen" data-screen="thi_baseline">' +
        '<div class="thi-progress">' +
          '<div class="thi-progress-bar"><div class="thi-progress-fill" style="width:' + progressPct + '%"></div></div>' +
          '<div class="thi-progress-text">' + escapeHtml(progressText) + '</div>' +
        '</div>' +
        '<h1 class="thi-title">THI оценка</h1>' +
        '<section class="thi-section">' +
          '<div class="thi-question-num">' + qNum + ' / ' + TOTAL_QUESTIONS + '</div>' +
          '<div class="thi-question">' + escapeHtml(questionText) + '</div>' +
          '<div class="thi-options">' + optionsHtml + '</div>' +
        '</section>' +
        '<div class="thi-actions">' +
          (currentIndex > 0
            ? '<button class="thi-btn thi-btn--ghost" type="button" data-action="prev">Назад</button>'
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
    var label = (window.AppState && window.AppState.currentProgramDay === 14)
      ? 'Финален THI score (Ден 14)'
      : 'Baseline THI score';
    return (
      '<div class="thi-screen" data-screen="thi_baseline_result">' +
        '<h1 class="thi-title">Готово</h1>' +
        '<section class="thi-section thi-result">' +
          '<div class="thi-score">' + score + '</div>' +
          '<div class="thi-score-label">' + escapeHtml(label) + '</div>' +
        '</section>' +
        '<div class="thi-actions">' +
          '<button class="thi-btn thi-btn--primary" type="button" data-action="finish">Продължи</button>' +
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
    var s = window.AppState;
    if (!s) return;
    var day = s.currentProgramDay || 1;
    if (day === 14) {
      s.setThiDay14(score);
      clearActive();
      // Toast: program complete
      if (window.Toast && window.Toast.success) {
        window.Toast.success('Програмата приключи');
      }
      s.transition('home');
      history.replaceState({ phase: 'home' }, '');
      if (window.Home && window.Home.render) window.Home.render();
    } else {
      // Day 1 (или anywhere преди 14) → baseline
      s.setThiBaseline(score);
      clearActive();
      s.transition('diary_hub');
      history.replaceState({ phase: 'diary_hub' }, '');
      if (window.DiaryHub && window.DiaryHub.render) {
        window.DiaryHub.render();
      } else if (window.Home && window.Home.render) {
        window.Home.render();
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
    render: render
  };
})();
