/**
 * AURALIS DiaryHub — 14-day program central hub (Wave 3.1-C)
 * ===========================================================================
 * Заместя Home като primary destination докато програмата е активна.
 *
 * Layout:
 *   - Header: StreakBadge (top-right)
 *   - ProgressDay: 14-day tracker
 *   - 3 large action cards (88px min-height):
 *       1. Evening Diary       → transition('diary_evening')
 *       2. Today's CBT         → transition('cbt_day')
 *       3. Progress            → transition('progress')
 *
 * Public API:
 *   DiaryHub.open()   — explicit open
 *   DiaryHub.render() — router hook
 */

window.DiaryHub = (function () {
  'use strict';

  function el(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ============================================================
  // Data
  // ============================================================

  function completedDays() {
    var s = window.AppState;
    if (!s || !s.diaryEntries || !s.programStartDate) return [];
    var done = [];
    // Day N е "completed" ако diaryEntries[date(N)] има evening OR cbtCompleted.
    for (var n = 1; n <= 14; n++) {
      var ts = s.programStartDate + (n - 1) * 86400000;
      var d = new Date(ts);
      var dateKey = d.getFullYear() + '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
        ('0' + d.getDate()).slice(-2);
      var entry = s.diaryEntries[dateKey];
      if (entry && (entry.evening || entry.cbtCompleted)) {
        done.push(n);
      }
    }
    return done;
  }

  // ============================================================
  // SVG icons
  // ============================================================

  var SVG = {
    moon:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
    book:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
      '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="3" y1="20" x2="21" y2="20"/>' +
      '<polyline points="4 16 10 10 14 14 20 6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="9 18 15 12 9 6"/></svg>'
  };

  // ============================================================
  // HTML builders
  // ============================================================

  function buildActionCard(opts) {
    return (
      '<button class="dh-action-card glass" type="button"' +
        ' data-action="' + escapeHtml(opts.action) + '"' +
        ' aria-label="' + escapeHtml(opts.title) + '">' +
        '<span class="shine"></span>' +
        '<span class="shine shine-bottom"></span>' +
        '<span class="dh-action-icon" aria-hidden="true">' + opts.icon + '</span>' +
        '<span class="dh-action-body">' +
          '<span class="dh-action-title">' + escapeHtml(opts.title) + '</span>' +
          '<span class="dh-action-desc">' + escapeHtml(opts.desc) + '</span>' +
        '</span>' +
        '<span class="dh-action-arrow" aria-hidden="true">' + SVG.chevron + '</span>' +
      '</button>'
    );
  }

  function buildHtml() {
    var s = window.AppState || {};
    var currentDay = s.currentProgramDay || 1;
    return (
      '<div class="dh-screen" data-screen="diary_hub">' +
        '<div class="dh-header-row">' +
          '<h1 class="dh-title">Дневник</h1>' +
          '<div class="dh-streak-slot" data-streak-slot></div>' +
        '</div>' +

        '<div class="dh-progress-slot" data-progress-slot></div>' +

        '<div class="dh-actions">' +
          buildActionCard({
            action: 'evening',
            icon: SVG.moon,
            title: 'Вечерен дневник',
            desc: '5 въпроса, 90 секунди'
          }) +
          buildActionCard({
            action: 'cbt',
            icon: SVG.book,
            title: 'Днешна практика',
            desc: 'Ден ' + currentDay + ': TODO 3.2'
          }) +
          buildActionCard({
            action: 'progress',
            icon: SVG.chart,
            title: 'Прогрес',
            desc: 'Вижте промяната'
          }) +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Component injection
  // ============================================================

  function injectStreak() {
    var slot = document.querySelector('[data-streak-slot]');
    if (!slot || !window.StreakBadge) return;
    var s = window.AppState || {};
    var badge = window.StreakBadge.render({
      activeDays: s.streakActiveDays || 0,
      freezesRemaining: s.streakFreezesRemaining
    });
    slot.appendChild(badge);
  }

  function injectProgress() {
    var slot = document.querySelector('[data-progress-slot]');
    if (!slot || !window.ProgressDay) return;
    var s = window.AppState || {};
    var pd = window.ProgressDay.render({
      currentDay: s.currentProgramDay || 1,
      completedDays: completedDays()
    });
    slot.appendChild(pd);
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'evening')      goTo('diary_evening', 'DiaryEvening');
    else if (action === 'cbt')     goTo('cbt_day',       'CbtDay');
    else if (action === 'progress') goToProgress();
  }

  function goTo(phase, moduleName) {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition(phase);
    }
    history.pushState({ phase: phase }, '');
    if (window[moduleName] && window[moduleName].render) {
      window[moduleName].render();
    }
  }

  function goToProgress() {
    // Wave 3.2 ще добави Progress module — засега console.log.
    console.log('[diary-hub] Progress screen — pending Wave 3.2');
    if (window.Toast && window.Toast.show) {
      window.Toast.show('Скоро: Прогрес screen', { variant: 'info', durationMs: 2000 });
    }
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildHtml();
    app.addEventListener('click', onClick);
    injectStreak();
    injectProgress();
  }

  function open() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('diary_hub');
    }
    history.pushState({ phase: 'diary_hub' }, '');
    refresh();
  }

  function render() { refresh(); }

  return {
    open: open,
    render: render
  };
})();
