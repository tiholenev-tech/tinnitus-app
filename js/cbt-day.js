/**
 * AURALIS CbtDay — daily CBT exercise screen (Wave 3.2)
 * ===========================================================================
 * 14-day CBT program from research/07-cbt-2-weeks-protocol.md.
 * Per day: title + theme + explanation + 3-step exercise + reflection.
 *
 * Content source priority:
 *   1. i18n.tObj('cbt.day_N') — localized (primary)
 *   2. CBT_DAYS_FALLBACK[N]   — bundled BG fallback (offline-safe)
 *
 * Public API:
 *   CbtDay.open()    — explicit open
 *   CbtDay.render()  — router hook
 *   CbtDay.getDay(n) — returns { title, theme, explanation, exercise[], reflection }
 */

window.CbtDay = (function () {
  'use strict';

  var MAX_REFLECTION_LEN = 500;

  // ============================================================
  // Fallback BG content (used if i18n fails to load)
  // Single source of truth in i18n/bg.json → 'cbt.day_N'.
  // This local copy mirrors that for offline resilience only.
  // ============================================================
  var CBT_DAYS_FALLBACK = {
    1:  { title: 'Сензорна демистификация' },
    2:  { title: 'Порочният кръг на дистреса' },
    3:  { title: 'Улавяне на автоматичните мисли' },
    4:  { title: 'Лична фраза-котва' },
    5:  { title: 'Извеждане на вниманието навън' },
    6:  { title: 'Меко звуково обогатяване' },
    7:  { title: 'Преглед на първата седмица' },
    8:  { title: 'Прогресивно мускулно отпускане' },
    9:  { title: 'Отпускане на челюстта' },
    10: { title: 'Дишане за успокоение' },
    11: { title: 'Мислите като облаци' },
    12: { title: 'Три приятни мига' },
    13: { title: 'Звук и дишане заедно' },
    14: { title: 'Поглед назад и напред' }
  };

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  function tObj(key) {
    if (window.i18n && window.i18n.tObj) return window.i18n.tObj(key);
    return null;
  }

  function getDay(n) {
    var key = 'cbt.day_' + n;
    var data = tObj(key);
    if (data && data.title) return data;
    return CBT_DAYS_FALLBACK[n] || null;
  }

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
    if (day < 1) day = 1;
    if (day > 14) day = 14;

    var existing = todayEntry();
    var existingReflection = (existing && existing.cbtReflection) || '';
    var alreadyDone = !!(existing && existing.cbtCompleted);

    var data = getDay(day) || {};
    var dayTitle = t('cbt.dayTitleFmt', 'Ден {n} — {title}', {
      n: day,
      title: data.title || ''
    });

    var theme       = data.theme || '';
    var explanation = data.explanation || '';
    var exercise    = Array.isArray(data.exercise) ? data.exercise : [];
    var reflection  = data.reflection || '';

    var lblTheme       = t('cbt.sections.theme',       'Тема на деня');
    var lblDescription = t('cbt.sections.description', 'Описание');
    var lblExercise    = t('cbt.sections.exercise',    'Упражнение');
    var lblReflection  = t('cbt.sections.reflection',  'Рефлексия');
    var lblSave        = t('cbt.actions.save',         'Запиши');
    var lblCancel      = t('cbt.actions.cancel',       'Откажи');
    var reflectionPh   = reflection
      ? reflection
      : t('cbt.reflectionPlaceholder', 'Запишете отговора си тук (по избор)…');
    var alreadyDoneMsg = t('cbt.alreadyDone', 'Тази практика вече е записана за днес. Можете да я обновите.');

    return (
      '<div class="cbt-screen" data-screen="cbt_day">' +
        '<h1 class="cbt-title">' + escapeHtml(dayTitle) + '</h1>' +

        (theme
          ? '<section class="cbt-section cbt-section--theme">' +
              '<div class="cbt-section-title">' + escapeHtml(lblTheme) + '</div>' +
              '<div class="cbt-theme"><em>' + escapeHtml(theme) + '</em></div>' +
            '</section>'
          : '') +

        (explanation
          ? '<section class="cbt-section">' +
              '<div class="cbt-section-title">' + escapeHtml(lblDescription) + '</div>' +
              '<div class="cbt-body">' + escapeHtml(explanation) + '</div>' +
            '</section>'
          : '') +

        (exercise.length
          ? '<section class="cbt-section">' +
              '<div class="cbt-section-title">' + escapeHtml(lblExercise) + '</div>' +
              '<ol class="cbt-steps">' +
                exercise.map(function (st) {
                  return '<li class="cbt-step">' + escapeHtml(st) + '</li>';
                }).join('') +
              '</ol>' +
            '</section>'
          : '') +

        '<section class="cbt-section">' +
          '<label class="cbt-section-title" for="cbtReflection">' + escapeHtml(lblReflection) + '</label>' +
          '<textarea id="cbtReflection" class="cbt-reflection"' +
            ' maxlength="' + MAX_REFLECTION_LEN + '"' +
            ' placeholder="' + escapeHtml(reflectionPh) + '">' +
            escapeHtml(existingReflection) +
          '</textarea>' +
          '<div class="cbt-char-counter">' +
            '<span data-char-count>' + existingReflection.length + '</span> / ' +
            MAX_REFLECTION_LEN +
          '</div>' +
        '</section>' +

        (alreadyDone
          ? '<div class="cbt-tip">' + escapeHtml(alreadyDoneMsg) + '</div>'
          : '') +

        '<div class="cbt-actions">' +
          '<button class="cbt-btn cbt-btn--primary" type="button" data-action="save">' +
            escapeHtml(lblSave) +
          '</button>' +
          '<button class="cbt-btn cbt-btn--ghost" type="button" data-action="cancel">' +
            escapeHtml(lblCancel) +
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
      window.Toast.success(t('cbt.savedToast', 'Записано'));
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
    render: render,
    getDay: getDay
  };
})();
