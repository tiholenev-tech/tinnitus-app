/**
 * AURALIS CbtDay — daily CBT exercise screen (Wave 3.1-E)
 * ===========================================================================
 * Per Day N: title + description + 3-step exercise + reflection textarea.
 *
 * Content е placeholder ("TODO 3.2") до Wave 3.2.
 *
 * Public API:
 *   CbtDay.open()    — explicit open
 *   CbtDay.render()  — router hook
 */

window.CbtDay = (function () {
  'use strict';

  var MAX_REFLECTION_LEN = 500;

  function el(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function todayEntry() {
    var s = window.AppState;
    if (!s || !s.diaryEntries) return null;
    return s.diaryEntries[s.todayKey()] || null;
  }

  // ============================================================
  // HTML
  // ============================================================

  function buildHtml() {
    var s = window.AppState || {};
    var day = s.currentProgramDay || 1;
    var existing = todayEntry();
    var existingReflection = (existing && existing.cbtReflection) || '';
    var alreadyDone = !!(existing && existing.cbtCompleted);

    // Wave 3.2 ще донесе реалния content.
    var dayTitle = 'Ден ' + day + ' — TODO 3.2';
    var description = 'TODO 3.2: 3-4 изречения описание на дневната тема.';
    var steps = [
      'TODO 3.2: стъпка 1',
      'TODO 3.2: стъпка 2',
      'TODO 3.2: стъпка 3'
    ];
    var reflectionPlaceholder = 'TODO 3.2: рефлексия въпрос';

    return (
      '<div class="cbt-screen" data-screen="cbt_day">' +
        '<h1 class="cbt-title">' + escapeHtml(dayTitle) + '</h1>' +

        '<section class="cbt-section">' +
          '<div class="cbt-section-title">Описание</div>' +
          '<div class="cbt-body">' + escapeHtml(description) + '</div>' +
        '</section>' +

        '<section class="cbt-section">' +
          '<div class="cbt-section-title">Упражнение</div>' +
          '<ol class="cbt-steps">' +
            steps.map(function (st) {
              return '<li class="cbt-step">' + escapeHtml(st) + '</li>';
            }).join('') +
          '</ol>' +
        '</section>' +

        '<section class="cbt-section">' +
          '<label class="cbt-section-title" for="cbtReflection">Рефлексия</label>' +
          '<textarea id="cbtReflection" class="cbt-reflection"' +
            ' maxlength="' + MAX_REFLECTION_LEN + '"' +
            ' placeholder="' + escapeHtml(reflectionPlaceholder) + '">' +
            escapeHtml(existingReflection) +
          '</textarea>' +
          '<div class="cbt-char-counter">' +
            '<span data-char-count>' + existingReflection.length + '</span> / ' +
            MAX_REFLECTION_LEN +
          '</div>' +
        '</section>' +

        (alreadyDone
          ? '<div class="cbt-tip">Тази практика вече е записана за днес. Можете да я обновите.</div>'
          : '') +

        '<div class="cbt-actions">' +
          '<button class="cbt-btn cbt-btn--primary" type="button" data-action="save">' +
            'Запиши' +
          '</button>' +
          '<button class="cbt-btn cbt-btn--ghost" type="button" data-action="cancel">' +
            'Откажи' +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onInput(e) {
    if (e.target.id !== 'cbtReflection') return;
    var counter = document.querySelector('[data-char-count]');
    if (counter) counter.textContent = String(e.target.value.length);
  }

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'save') save();
    else if (action === 'cancel') cancel();
  }

  function save() {
    var s = window.AppState;
    if (!s) return;
    var ta = el('cbtReflection');
    var text = ta ? ta.value.slice(0, MAX_REFLECTION_LEN) : '';

    s.saveDiaryEntry(s.todayKey(), {
      cbtCompleted: true,
      cbtReflection: text
    });
    s.updateStreakOnEntry();

    if (window.Toast && window.Toast.success) {
      window.Toast.success('Записано');
    }

    s.transition('diary_hub');
    history.replaceState({ phase: 'diary_hub' }, '');
    if (window.DiaryHub && window.DiaryHub.render) window.DiaryHub.render();
  }

  function cancel() {
    var s = window.AppState;
    if (s && s.transition) s.transition('diary_hub');
    history.back();
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildHtml();
    app.addEventListener('click', onClick);
    app.addEventListener('input', onInput);
  }

  function open() {
    var s = window.AppState;
    if (s && s.transition) s.transition('cbt_day');
    history.pushState({ phase: 'cbt_day' }, '');
    refresh();
  }

  function render() { refresh(); }

  return {
    open: open,
    render: render
  };
})();
