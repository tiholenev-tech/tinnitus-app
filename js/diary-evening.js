/**
 * AURALIS DiaryEvening — 5-question evening diary (Wave 3.1-D)
 * ===========================================================================
 * 5 ScaleSlider questions (1-5 scale). Save → state.diaryEntries[today].evening.
 *
 * Public API:
 *   DiaryEvening.open()   — explicit start
 *   DiaryEvening.render() — router hook
 */

window.DiaryEvening = (function () {
  'use strict';

  // 5 въпроса с labels (Wave 3.2 ще ги извлече към i18n при нужда).
  var QUESTIONS = [
    {
      key: 'noise_intensity',
      question: 'Колко силен беше шумът днес?',
      labels: ['Много тих', 'Тих', 'Средно', 'Силен', 'Изключително силен']
    },
    {
      key: 'noise_distress',
      question: 'Колко ви пречеше шумът?',
      labels: ['Изобщо не', 'Леко', 'Умерено', 'Доста', 'Изключително']
    },
    {
      key: 'calm',
      question: 'Колко спокоен се чувствахте?',
      labels: ['Напълно спокоен', 'Спокоен', 'Неутрален', 'Тревожен', 'Изключително тревожен']
    },
    {
      key: 'mood',
      question: 'Какво беше настроението ви?',
      labels: ['Много добро', 'Добро', 'Неутрално', 'Лошо', 'Много потиснато']
    },
    {
      key: 'sleep_last_night',
      question: 'Как беше съня снощи?',
      labels: ['Отличен', 'Добър', 'Среден', 'Лош', 'Много лош']
    }
  ];

  var answers = {};   // { key: 1..5 }
  var sliders = {};   // { key: ScaleSlider instance }

  function el(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ============================================================
  // HTML
  // ============================================================

  function buildHtml() {
    var sections = QUESTIONS.map(function (q, idx) {
      return (
        '<section class="de-section" data-question-key="' + escapeHtml(q.key) + '">' +
          '<div class="de-section-title">' + (idx + 1) + ' / ' + QUESTIONS.length + '</div>' +
          '<div class="de-question">' + escapeHtml(q.question) + '</div>' +
          '<div class="de-slider-slot" data-slider-slot="' + escapeHtml(q.key) + '"></div>' +
        '</section>'
      );
    }).join('');
    return (
      '<div class="de-screen" data-screen="diary_evening">' +
        '<h1 class="de-title">Вечерен дневник</h1>' +
        sections +
        '<div class="de-actions">' +
          '<button class="de-btn de-btn--primary" type="button" data-action="save" disabled>' +
            'Запиши' +
          '</button>' +
          '<button class="de-btn de-btn--ghost" type="button" data-action="cancel">' +
            'Откажи' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // ScaleSlider injection
  // ============================================================

  function injectSliders() {
    QUESTIONS.forEach(function (q) {
      var slot = document.querySelector('[data-slider-slot="' + q.key + '"]');
      if (!slot || !window.ScaleSlider) return;
      var slider = window.ScaleSlider.create({
        labels: q.labels,
        value: answers[q.key] || null,
        onChange: function (val) {
          answers[q.key] = val;
          updateSaveButton();
        }
      });
      slider.mount(slot);
      sliders[q.key] = slider;
    });
    updateSaveButton();
  }

  function updateSaveButton() {
    var btn = document.querySelector('[data-action="save"]');
    if (!btn) return;
    var complete = QUESTIONS.every(function (q) {
      return typeof answers[q.key] === 'number' && answers[q.key] >= 1 && answers[q.key] <= 5;
    });
    if (complete) btn.removeAttribute('disabled');
    else btn.setAttribute('disabled', 'disabled');
  }

  // ============================================================
  // Save / cancel
  // ============================================================

  function save() {
    var s = window.AppState;
    if (!s) return;
    var allAnswered = QUESTIONS.every(function (q) {
      return typeof answers[q.key] === 'number';
    });
    if (!allAnswered) return;

    var today = s.todayKey();
    var evening = {};
    QUESTIONS.forEach(function (q) { evening[q.key] = answers[q.key]; });

    s.saveDiaryEntry(today, { evening: evening });
    s.updateStreakOnEntry();

    if (window.Toast && window.Toast.success) {
      window.Toast.success('Записано');
    }

    // Reset and exit to hub
    answers = {};
    sliders = {};
    s.transition('diary_hub');
    history.replaceState({ phase: 'diary_hub' }, '');
    if (window.DiaryHub && window.DiaryHub.render) window.DiaryHub.render();
  }

  function cancel() {
    answers = {};
    sliders = {};
    var s = window.AppState;
    if (s && s.transition) s.transition('diary_hub');
    history.back();
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'save') save();
    else if (action === 'cancel') cancel();
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildHtml();
    app.addEventListener('click', onClick);
    injectSliders();
  }

  function open() {
    // Pre-populate from today's existing evening entry (resume support)
    answers = {};
    sliders = {};
    var s = window.AppState;
    if (s && s.diaryEntries) {
      var existing = s.diaryEntries[s.todayKey()];
      if (existing && existing.evening) {
        QUESTIONS.forEach(function (q) {
          if (typeof existing.evening[q.key] === 'number') {
            answers[q.key] = existing.evening[q.key];
          }
        });
      }
    }
    if (s && s.transition) s.transition('diary_evening');
    history.pushState({ phase: 'diary_evening' }, '');
    refresh();
  }

  function render() {
    // Router hook (на reload-а — pre-populate)
    answers = {};
    var s = window.AppState;
    if (s && s.diaryEntries) {
      var existing = s.diaryEntries[s.todayKey()];
      if (existing && existing.evening) {
        QUESTIONS.forEach(function (q) {
          if (typeof existing.evening[q.key] === 'number') {
            answers[q.key] = existing.evening[q.key];
          }
        });
      }
    }
    refresh();
  }

  return {
    open: open,
    render: render
  };
})();
