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

  // Local-only storage за soft check-in отговора (#3). Не отива в state.
  var SOFT_CHECK_KEY = 'auralis-diary-soft-check';
  // Timezone tracking (#17).
  var TZ_KEY = 'auralis-tz-last';
  var TZ_DISMISS_KEY = 'auralis-tz-banner-dismissed-at';
  // Listen nudge (#20) — dismiss за 7 дни между показвания.
  var LISTEN_NUDGE_DISMISS_KEY = 'auralis-listen-nudge-dismissed-at';
  var LISTEN_THRESHOLD_SEC = 60;

  function el(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  function dateKeyFromTs(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  // ============================================================
  // Data
  // ============================================================

  function completedDays() {
    var s = window.AppState;
    if (!s || !s.diaryEntries || !s.programStartDate) return [];
    var done = [];
    for (var n = 1; n <= 14; n++) {
      var ts = s.programStartDate + (n - 1) * 86400000;
      var entry = s.diaryEntries[dateKeyFromTs(ts)];
      if (entry && (entry.evening || entry.cbtCompleted)) {
        done.push(n);
      }
    }
    return done;
  }

  // Missed days = past program days (< currentProgramDay) без entry.
  // Връща { count, lastMissedDay, lastMissedDateKey }
  function missedDaysInfo() {
    var s = window.AppState;
    if (!s || !s.programStartDate) return { count: 0, lastMissedDay: 0, lastMissedDateKey: null };
    var current = s.currentProgramDay || 1;
    var lastN = 0;
    var lastKey = null;
    var count = 0;
    for (var n = 1; n < current; n++) {
      var ts = s.programStartDate + (n - 1) * 86400000;
      var key = dateKeyFromTs(ts);
      var entry = (s.diaryEntries || {})[key];
      if (!entry || (!entry.evening && !entry.cbtCompleted)) {
        count++;
        lastN = n;
        lastKey = key;
      }
    }
    return { count: count, lastMissedDay: lastN, lastMissedDateKey: lastKey };
  }

  function softCheckSeen() {
    try {
      var raw = localStorage.getItem(SOFT_CHECK_KEY);
      if (!raw) return false;
      var d = JSON.parse(raw);
      // Скрий за 7 дни след отговор/skip.
      if (d && d.ts && (Date.now() - d.ts) < 7 * 86400000) return true;
      return false;
    } catch (e) { return false; }
  }

  function markSoftCheck(answer) {
    try {
      localStorage.setItem(SOFT_CHECK_KEY, JSON.stringify({
        answer: answer || null,
        ts: Date.now()
      }));
    } catch (e) { /* ignore */ }
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

  // ============================================================
  // Adaptive banners (edge cases #1, #2, #3)
  // ============================================================

  function buildLateEntryBanner(info) {
    var n = info.lastMissedDay;
    var body = t('ui.diary.hub.missedYesterday',
      'Вчера не успяхте да попълните дневника. Това е напълно нормално. Ден {n} Ви чака — можете да го направите днес или просто да продължите.',
      { n: n });
    var cta = t('ui.diary.hub.missedYesterdayCta', 'Попълни Ден {n} със закъснение', { n: n });
    var skip = t('ui.diary.hub.missedYesterdaySkip', 'Прескочи към днешния ден');
    return (
      '<section class="dh-banner dh-banner--late" role="note">' +
        '<p class="dh-banner-body">' + escapeHtml(body) + '</p>' +
        '<div class="dh-banner-actions">' +
          '<button class="dh-banner-btn dh-banner-btn--primary" type="button"' +
            ' data-action="late-entry" data-late-key="' + escapeHtml(info.lastMissedDateKey) + '">' +
            escapeHtml(cta) +
          '</button>' +
          '<button class="dh-banner-btn dh-banner-btn--ghost" type="button"' +
            ' data-action="dismiss-late">' +
            escapeHtml(skip) +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  function buildMicroDoseBanner() {
    var title = t('ui.diary.hub.microDoseTitle', 'Ние сме тук.');
    var body  = t('ui.diary.hub.microDoseBody',
      'Започнете отново — с 2 минути. Просто 3 спокойни вдишвания или един ред в дневника.');
    var cta   = t('ui.diary.hub.microDoseCta', 'Започни 2-минутна доза');
    return (
      '<section class="dh-banner dh-banner--micro" role="note">' +
        '<h2 class="dh-banner-title">' + escapeHtml(title) + '</h2>' +
        '<p class="dh-banner-body">' + escapeHtml(body) + '</p>' +
        '<div class="dh-banner-actions">' +
          '<button class="dh-banner-btn dh-banner-btn--primary" type="button"' +
            ' data-action="micro-dose">' +
            escapeHtml(cta) +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  function buildSoftCheckBanner() {
    var title = t('ui.diary.hub.softCheckTitle', 'Какво се случи?');
    var body  = t('ui.diary.hub.softCheckBody',
      'Виждаме, че Ви няма от няколко дни. Не сте задължен да отговорите, но ще ни помогне да Ви бъдем полезни.');
    var opts = [
      { code: 'busy',  label: t('ui.diary.hub.softCheckOpt1', 'Бях зает') },
      { code: 'worse', label: t('ui.diary.hub.softCheckOpt2', 'Чувствах се по-зле') },
      { code: 'tech',  label: t('ui.diary.hub.softCheckOpt3', 'Технически проблем') },
      { code: 'notme', label: t('ui.diary.hub.softCheckOpt4', 'Не беше за мен') }
    ];
    var skipLbl = t('ui.diary.hub.softCheckSkip', 'Прескочи');
    var optsHtml = opts.map(function (o) {
      return '<button class="dh-soft-opt" type="button"' +
        ' data-action="soft-check" data-answer="' + escapeHtml(o.code) + '">' +
        escapeHtml(o.label) +
        '</button>';
    }).join('');
    return (
      '<section class="dh-banner dh-banner--soft" role="region">' +
        '<h2 class="dh-banner-title">' + escapeHtml(title) + '</h2>' +
        '<p class="dh-banner-body">' + escapeHtml(body) + '</p>' +
        '<div class="dh-soft-opts">' + optsHtml + '</div>' +
        '<div class="dh-banner-actions">' +
          '<button class="dh-banner-btn dh-banner-btn--ghost" type="button"' +
            ' data-action="soft-check-skip">' +
            escapeHtml(skipLbl) +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  function buildBannersHtml() {
    var info = missedDaysInfo();
    if (info.count === 0) return '';
    // #3 (4+ missed) — soft check-in, но само ако не е скрит за 7 дни
    if (info.count >= 4 && !softCheckSeen()) {
      return buildSoftCheckBanner();
    }
    // #2 (2-3 missed) — micro-dose hint
    if (info.count >= 2) {
      return buildMicroDoseBanner();
    }
    // #1 (1 missed) — late entry tile
    return buildLateEntryBanner(info);
  }

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

        buildTimezoneBanner() +
        buildListenNudgeBanner() +
        buildBannersHtml() +

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
            desc: 'Ден ' + currentDay + ' от 14'
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
    if (!slot) return;
    var s = window.AppState || {};
    // Предпочитаме ProgressChart (status цветове + freeze + tooltip);
    // fallback към legacy ProgressDay wrapper за back-compat.
    var renderer = window.ProgressChart || window.ProgressDay;
    if (!renderer) return;
    var pd = renderer.render({
      currentDay: s.currentProgramDay || 1
    });
    slot.appendChild(pd);
  }

  // ============================================================
  // Interactions
  // ============================================================

  // ============================================================
  // Listen nudge (#20) — Day >= 6 AND not listened >= 60 sec
  // ============================================================

  function userHasListened() {
    // Read-only consumer на Analytics.getSessionHistory().
    // Не пипаме player.js или analytics.js.
    if (!window.Analytics || !window.Analytics.getSessionHistory) return false;
    var sessions = window.Analytics.getSessionHistory() || [];
    var totalSec = 0;
    for (var i = 0; i < sessions.length; i++) {
      totalSec += (sessions[i] && sessions[i].durationSec) || 0;
      if (totalSec >= LISTEN_THRESHOLD_SEC) return true;
    }
    return false;
  }

  function listenNudgeShouldShow() {
    var s = window.AppState;
    if (!s || !s.programStartDate) return false;
    var day = s.currentProgramDay || 1;
    if (day < 6) return false;
    if (userHasListened()) return false;
    try {
      var dismissedAt = parseInt(localStorage.getItem(LISTEN_NUDGE_DISMISS_KEY), 10);
      if (!isNaN(dismissedAt) && (Date.now() - dismissedAt) < 7 * 86400000) return false;
    } catch (e) { /* ignore */ }
    return true;
  }

  function dismissListenNudge() {
    try { localStorage.setItem(LISTEN_NUDGE_DISMISS_KEY, String(Date.now())); }
    catch (e) { /* ignore */ }
  }

  function buildListenNudgeBanner() {
    if (!listenNudgeShouldShow()) return '';
    var title = t('ui.diary.hub.listenNudgeTitle', 'Не сте слушали звуци още');
    var body  = t('ui.diary.hub.listenNudgeBody',
      'Звуковото обогатяване е една от опорите на 14-дневния модул. Можете да опитате кратка сесия сега — само 5 минути.');
    var cta   = t('ui.diary.hub.listenNudgeCta', 'Опитай 5 минути');
    var skip  = t('ui.diary.hub.listenNudgeSkip', 'По-късно');
    return (
      '<section class="dh-banner dh-banner--listen" role="note">' +
        '<h2 class="dh-banner-title">' + escapeHtml(title) + '</h2>' +
        '<p class="dh-banner-body">' + escapeHtml(body) + '</p>' +
        '<div class="dh-banner-actions">' +
          '<button class="dh-banner-btn dh-banner-btn--primary" type="button"' +
            ' data-action="listen-now">' +
            escapeHtml(cta) +
          '</button>' +
          '<button class="dh-banner-btn dh-banner-btn--ghost" type="button"' +
            ' data-action="listen-skip">' +
            escapeHtml(skip) +
          '</button>' +
        '</div>' +
      '</section>'
    );
  }

  // ============================================================
  // Timezone change detection (#17)
  // ============================================================

  function currentTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) { return ''; }
  }

  function tzBannerShouldShow() {
    var current = currentTimezone();
    if (!current) return null;
    var last = null;
    try { last = localStorage.getItem(TZ_KEY); } catch (e) { /* ignore */ }

    if (!last) {
      // Първо посещение → запиши и не показвай нищо.
      try { localStorage.setItem(TZ_KEY, current); } catch (e) { /* ignore */ }
      return null;
    }
    if (last === current) return null;

    // Проверка дали banner-ът е dismiss-нат в последните 30 дни.
    try {
      var dismissAt = parseInt(localStorage.getItem(TZ_DISMISS_KEY), 10);
      if (!isNaN(dismissAt) && (Date.now() - dismissAt) < 30 * 86400000) {
        return null;
      }
    } catch (e) { /* ignore */ }

    return { from: last, to: current };
  }

  function buildTimezoneBanner() {
    var info = tzBannerShouldShow();
    if (!info) return '';
    var msg = t('ui.diary.hub.timezoneChangedBanner',
      'Часовата зона се промени на {tz}. Следващите записи ще използват новата зона.',
      { tz: info.to });
    var aria = t('ui.diary.hub.timezoneDismissAria', 'Затвори съобщението за часова зона');
    return (
      '<section class="dh-tz-banner" role="note">' +
        '<span class="dh-tz-banner-text">' + escapeHtml(msg) + '</span>' +
        '<button class="dh-tz-banner-close" type="button"' +
          ' data-action="tz-dismiss"' +
          ' aria-label="' + escapeHtml(aria) + '">×</button>' +
      '</section>'
    );
  }

  function dismissTimezoneBanner() {
    try {
      localStorage.setItem(TZ_KEY, currentTimezone());
      localStorage.setItem(TZ_DISMISS_KEY, String(Date.now()));
    } catch (e) { /* ignore */ }
  }

  // ============================================================
  // 24h CBT soft barrier (#14) — Дни 1-4 (CBT линейно ядро)
  // ============================================================

  function cbtBarrierActiveFor(day) {
    // Активен само за Дни 2-4 (Ден 1 винаги отворен; Дни 5+ — без барjер
    // защото релаксационни упражнения могат да се повтарят свободно).
    if (day < 2 || day > 4) return null;
    var s = window.AppState;
    if (!s || !s.programStartDate || !s.diaryEntries) return null;

    // Изисквания: предишният ден трябва да е попълнен (cbtCompleted)
    // И трябва да са изминали >= 24 часа от попълването му.
    var prevDay = day - 1;
    var prevTs = s.programStartDate + (prevDay - 1) * 86400000;
    var prevKey = dateKeyFromTs(prevTs);
    var prevEntry = s.diaryEntries[prevKey];
    if (!prevEntry || !prevEntry.cbtCompleted) return null;  // нищо за блокиране

    // Локално запазен timestamp на cbt completion (опциално — ако state не
    // го пази). Използваме fallback: prevDay начало = prevTs; искаме now
    // да е >= prevTs + 24h. Това е по-меко от "от момент на попълване".
    var requiredMs = prevTs + 24 * 60 * 60 * 1000;
    var remaining = requiredMs - Date.now();
    if (remaining <= 0) return null;
    return { day: day, msRemaining: remaining };
  }

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'evening')      goTo('diary_evening', 'DiaryEvening');
    else if (action === 'cbt') {
      var s = window.AppState || {};
      var day = s.currentProgramDay || 1;
      var barrier = cbtBarrierActiveFor(day);
      if (barrier) {
        var msg = t('ui.diary.hub.cbtLocked24hToast',
          'Ден {n} ще е достъпен утре. Този материал работи най-добре, когато оставите време между дните.',
          { n: day });
        if (window.Toast && window.Toast.info) {
          window.Toast.info(msg, { duration: 6000 });
        } else if (window.Toast && window.Toast.show) {
          window.Toast.show(msg, { durationMs: 6000 });
        }
        return;
      }
      goTo('cbt_day', 'CbtDay');
    }
    else if (action === 'progress') goToProgress();
    else if (action === 'late-entry') {
      var lateKey = btn.getAttribute('data-late-key');
      openLateEntry(lateKey);
    }
    else if (action === 'dismiss-late') {
      // Просто скриваме баннера за тази сесия без да маркираме нищо.
      var banner = btn.closest('.dh-banner');
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    }
    else if (action === 'micro-dose') {
      // 2-минутна доза = open evening diary (минималния път до запис).
      goTo('diary_evening', 'DiaryEvening');
    }
    else if (action === 'soft-check') {
      var answer = btn.getAttribute('data-answer');
      handleSoftCheck(answer);
    }
    else if (action === 'soft-check-skip') {
      markSoftCheck(null);
      refresh();
    }
    else if (action === 'tz-dismiss') {
      dismissTimezoneBanner();
      var tzBanner = btn.closest('.dh-tz-banner');
      if (tzBanner && tzBanner.parentNode) tzBanner.parentNode.removeChild(tzBanner);
    }
    else if (action === 'listen-now') {
      // Навигация към Home — там user вижда препоръчителни звуци за профила.
      dismissListenNudge();
      var s = window.AppState;
      if (s && s.transition) s.transition('home');
      history.replaceState({ phase: 'home' }, '');
      if (window.Home && window.Home.render) window.Home.render();
    }
    else if (action === 'listen-skip') {
      dismissListenNudge();
      var lnBanner = btn.closest('.dh-banner--listen');
      if (lnBanner && lnBanner.parentNode) lnBanner.parentNode.removeChild(lnBanner);
    }
  }

  function openLateEntry(dateKey) {
    if (!dateKey) return;
    if (window.DiaryEvening && window.DiaryEvening.openForDate) {
      window.DiaryEvening.openForDate(dateKey);
    } else if (window.DiaryEvening && window.DiaryEvening.open) {
      // Fallback ако openForDate не е достъпен — обикновен open.
      window.DiaryEvening.open();
    }
  }

  function handleSoftCheck(answer) {
    markSoftCheck(answer);
    var msg = t('ui.diary.hub.softCheckSavedToast',
      'Благодарим за отговора. AURALIS остава с Вас.');
    if (window.Toast && window.Toast.success) {
      window.Toast.success(msg);
    }
    if (answer === 'worse') {
      setTimeout(function () {
        var advice = t('ui.diary.hub.softCheckWorseAdvice',
          'Чувствата Ви са важни. Може да е добра идея да говорите с лекар или специалист.');
        if (window.Toast && window.Toast.info) {
          window.Toast.info(advice, { duration: 8000 });
        } else if (window.Toast && window.Toast.success) {
          window.Toast.success(advice);
        }
      }, 900);
    }
    refresh();
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
    // Phone test fix: real Progress sheet вместо toast placeholder.
    // Показва computable от съществуващи данни — текущ ден, completed дни,
    // streak. Бъдеще Wave 3.2 може да добави графика, но засега тук са
    // основните метрики.
    var s = window.AppState || {};
    var currentDay = s.currentProgramDay || (s.programStartDate ? 1 : 0);
    var completed = completedDays();
    var totalEntries = 0;
    if (s.diaryEntries) {
      for (var k in s.diaryEntries) {
        if (Object.prototype.hasOwnProperty.call(s.diaryEntries, k)) totalEntries++;
      }
    }
    var streak = s.streakActiveDays || 0;
    var freezes = (typeof s.streakFreezesRemaining === 'number')
      ? s.streakFreezesRemaining : 2;

    var content;
    if (!s.programStartDate) {
      content = '<div class="dh-progress-sheet">' +
        '<p>Все още не сте започнали 14-дневната програма.</p>' +
        '<p style="margin-top:12px;color:var(--text-muted);font-size:14px;">' +
          'Когато стартирате, тук ще виждате докъде сте и какво сте записали.' +
        '</p>' +
      '</div>';
    } else {
      content = '<div class="dh-progress-sheet">' +
        '<div class="dh-prog-stat">' +
          '<span class="dh-prog-stat-num">' + currentDay + ' / 14</span>' +
          '<span class="dh-prog-stat-label">текущ ден от програмата</span>' +
        '</div>' +
        '<div class="dh-prog-stat">' +
          '<span class="dh-prog-stat-num">' + completed.length + '</span>' +
          '<span class="dh-prog-stat-label">завършени дни</span>' +
        '</div>' +
        '<div class="dh-prog-stat">' +
          '<span class="dh-prog-stat-num">' + totalEntries + '</span>' +
          '<span class="dh-prog-stat-label">записа в дневника</span>' +
        '</div>' +
        '<div class="dh-prog-stat">' +
          '<span class="dh-prog-stat-num">' + streak + '</span>' +
          '<span class="dh-prog-stat-label">последователни активни дни</span>' +
        '</div>' +
        '<div class="dh-prog-stat">' +
          '<span class="dh-prog-stat-num">' + freezes + ' / 2</span>' +
          '<span class="dh-prog-stat-label">останали "пропуски"</span>' +
        '</div>' +
        '<p style="margin-top:16px;color:var(--text-muted);font-size:13px;line-height:1.5;">' +
          'Един "пропуск" Ви позволява да изтървете ден без да губите серията.' +
        '</p>' +
      '</div>';
    }

    if (window.BottomSheet && window.BottomSheet.open) {
      window.BottomSheet.open({
        title: 'Прогрес',
        content: content,
        height: 'auto',
        showGrip: true,
        closeOnBackdrop: true
      });
    } else if (window.Toast && window.Toast.show) {
      window.Toast.show('Завършени дни: ' + completed.length + ' / 14', { durationMs: 3000 });
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
