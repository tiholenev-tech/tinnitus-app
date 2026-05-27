/**
 * AURALIS ProgressChart — 14-day program визуализация
 * =====================================================
 * 14 квадратчета · per-day status · tooltip · streak freeze badge.
 *
 * Статуси:
 *   completed → champagne gradient   (morning + evening + cbtCompleted)
 *   partial   → muted champagne      (1-2 от трите dimensions)
 *   frozen    → ice blue + ❄         (streak freeze използван)
 *   empty     → glass outline        (нищо записано)
 *   today     → champagne ring marker (overlay на горните)
 *
 * Public API:
 *   ProgressChart.render(opts) → HTMLElement
 *
 * opts (всички optional — fallback към AppState):
 *   currentDay     : 1..14
 *   programStart   : Unix ms
 *   diaryEntries   : { 'YYYY-MM-DD': { evening, morning, cbtCompleted } }
 *   freezesRemaining : 0..2
 *   frozenDates    : ['YYYY-MM-DD', ...] — (Commit #2)
 *
 * Чете директно от window.AppState ако opt-ите не са подадени.
 */

window.ProgressChart = (function () {
  'use strict';

  var DAYS = 14;

  // BG месеци (за tooltip). Native Intl.DateTimeFormat('bg-BG') понякога
  // връща различни форми в зависимост от ICU build; hardcoded е по-предсказуемо.
  var MONTHS_BG = [
    'януари', 'февруари', 'март', 'април', 'май', 'юни',
    'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'
  ];

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return fallback != null ? fallback : key;
  }

  function dateKeyFromTs(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' +
      ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2);
  }

  function formatDateBg(ts) {
    var d = new Date(ts);
    return d.getDate() + ' ' + MONTHS_BG[d.getMonth()];
  }

  function dimensionsCount(entry) {
    if (!entry) return 0;
    var n = 0;
    if (entry.morning) n++;
    if (entry.evening) n++;
    if (entry.cbtCompleted) n++;
    return n;
  }

  // ============================================================
  // Status calculation
  // ============================================================

  function buildDayStates(opts) {
    var s = window.AppState || {};
    var start = opts.programStart != null ? opts.programStart : s.programStartDate;
    var entries = opts.diaryEntries || s.diaryEntries || {};
    var frozen = opts.frozenDates || s.streakFrozenDates || [];

    var states = [];
    for (var n = 1; n <= DAYS; n++) {
      var ts = start ? (start + (n - 1) * 86400000) : null;
      var key = ts ? dateKeyFromTs(ts) : null;
      var entry = key ? entries[key] : null;
      var dims = dimensionsCount(entry);
      var isFrozen = key && frozen.indexOf(key) !== -1;

      var status;
      if (isFrozen) status = 'frozen';
      else if (dims >= 3) status = 'completed';
      else if (dims >= 1) status = 'partial';
      else status = 'empty';

      states.push({
        day: n,
        ts: ts,
        dateKey: key,
        status: status,
        dimensions: dims
      });
    }
    return states;
  }

  function statusLabel(status) {
    switch (status) {
      case 'completed': return t('progress.completed', 'Завършен ден');
      case 'partial':   return t('progress.partial',   'Частичен ден');
      case 'frozen':    return t('progress.frozen',    'Замразен ден');
      default:          return t('progress.empty',     'Празен ден');
    }
  }

  // ============================================================
  // SVG
  // ============================================================

  var SVG_SNOWFLAKE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="12" y1="3" x2="12" y2="21"/>' +
      '<line x1="3" y1="12" x2="21" y2="12"/>' +
      '<line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/>' +
      '<line x1="18.5" y1="5.5" x2="5.5" y2="18.5"/>' +
    '</svg>';

  var SVG_CHECK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="20 6 9 17 4 12"/>' +
    '</svg>';

  // ============================================================
  // Render
  // ============================================================

  function render(opts) {
    opts = opts || {};
    var s = window.AppState || {};
    var currentDay = opts.currentDay || s.currentProgramDay || 1;
    var freezesLeft = (opts.freezesRemaining != null)
      ? opts.freezesRemaining
      : (s.streakFreezesRemaining != null ? s.streakFreezesRemaining : 2);

    var states = buildDayStates(opts);

    // Counts за legend
    var completedN = 0, partialN = 0, frozenN = 0;
    for (var i = 0; i < states.length; i++) {
      if (states[i].status === 'completed') completedN++;
      else if (states[i].status === 'partial') partialN++;
      else if (states[i].status === 'frozen') frozenN++;
    }

    var card = document.createElement('section');
    card.className = 'glass pc-card';
    card.setAttribute('aria-labelledby', 'pcTitle');

    // ----- Header -----
    var header = document.createElement('header');
    header.className = 'pc-header';

    var headBox = document.createElement('div');
    headBox.className = 'pc-headbox';

    var title = document.createElement('h3');
    title.id = 'pcTitle';
    title.className = 'pc-title';
    title.textContent = t('progress.title', 'Вашата 14-дневна програма');
    headBox.appendChild(title);

    var subtitle = document.createElement('p');
    subtitle.className = 'pc-subtitle';
    subtitle.textContent = t('progress.day_of', 'Ден {n} от 14', { n: currentDay });
    headBox.appendChild(subtitle);

    header.appendChild(headBox);

    var freezeBadge = document.createElement('span');
    freezeBadge.className = 'pc-freeze-badge';
    freezeBadge.setAttribute('aria-label',
      t('progress.freeze_remaining', '{count} оставащи freeze-а', { count: freezesLeft }));
    freezeBadge.innerHTML = SVG_SNOWFLAKE + '<span class="pc-freeze-num">' + freezesLeft + '</span>';
    header.appendChild(freezeBadge);

    card.appendChild(header);

    // ----- Squares (14) -----
    var list = document.createElement('ol');
    list.className = 'pc-squares';
    list.setAttribute('role', 'list');

    for (var j = 0; j < states.length; j++) {
      var st = states[j];
      var isToday = (st.day === currentDay);
      var li = document.createElement('li');
      li.className = 'pc-square-li';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pc-square pc-square--' + st.status + (isToday ? ' pc-square--today' : '');
      btn.setAttribute('data-day', st.day);
      btn.setAttribute('data-status', st.status);
      if (st.dateKey) btn.setAttribute('data-date', st.dateKey);
      if (isToday) btn.setAttribute('aria-current', 'step');

      // ARIA label = full description (за screen readers)
      var ariaParts = [t('progress.day_n', 'Ден {n}', { n: st.day })];
      if (st.ts) ariaParts.push(formatDateBg(st.ts));
      ariaParts.push(statusLabel(st.status));
      if (isToday) ariaParts.push(t('progress.today', 'Днес'));
      btn.setAttribute('aria-label', ariaParts.join(' · '));

      // Visual content
      if (st.status === 'completed') {
        btn.innerHTML = '<span class="pc-square-icon">' + SVG_CHECK + '</span>';
      } else if (st.status === 'frozen') {
        btn.innerHTML = '<span class="pc-square-icon">' + SVG_SNOWFLAKE + '</span>';
      } else {
        btn.innerHTML = '<span class="pc-day-num">' + st.day + '</span>';
      }

      li.appendChild(btn);
      list.appendChild(li);
    }
    card.appendChild(list);

    // ----- Legend -----
    var legend = document.createElement('p');
    legend.className = 'pc-legend';
    var legendParts = [];
    if (completedN > 0) legendParts.push(
      '<span class="pc-leg-item pc-leg-item--completed">' + completedN + ' ' +
      t('progress.legend.completed', 'завършени') + '</span>');
    if (partialN > 0) legendParts.push(
      '<span class="pc-leg-item pc-leg-item--partial">' + partialN + ' ' +
      t('progress.legend.partial', 'частични') + '</span>');
    if (frozenN > 0) legendParts.push(
      '<span class="pc-leg-item pc-leg-item--frozen">' + frozenN + ' ' +
      t('progress.legend.frozen', 'замразени') + '</span>');
    legendParts.push(
      '<span class="pc-leg-item pc-leg-item--freeze">' +
      t('progress.freeze_remaining', '{count} оставащи freeze-а', { count: freezesLeft }) +
      '</span>');
    legend.innerHTML = legendParts.join(' <span class="pc-leg-sep">·</span> ');
    card.appendChild(legend);

    // ----- Tooltip (single instance, JS-positioned) -----
    var tooltip = document.createElement('div');
    tooltip.className = 'pc-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('hidden', '');
    card.appendChild(tooltip);

    // ----- Interactions -----
    var activeBtn = null;

    function showTooltip(btn) {
      var day = parseInt(btn.getAttribute('data-day'), 10);
      var status = btn.getAttribute('data-status');
      var dateKey = btn.getAttribute('data-date');
      var st = states[day - 1];

      var dateLabel = (st && st.ts) ? formatDateBg(st.ts) : (dateKey || '—');
      var statusText = statusLabel(status);
      var todayMarker = (day === currentDay)
        ? ' <span class="pc-tt-today">· ' + t('progress.today', 'Днес') + '</span>'
        : '';

      tooltip.innerHTML =
        '<span class="pc-tt-date">' + dateLabel + todayMarker + '</span>' +
        '<span class="pc-tt-status">' + statusText + '</span>';
      tooltip.removeAttribute('hidden');

      // Position: above the square, центрирано спрямо .pc-card.
      var btnRect = btn.getBoundingClientRect();
      var cardRect = card.getBoundingClientRect();
      var ttRect = tooltip.getBoundingClientRect();
      var topPx = btnRect.top - cardRect.top - ttRect.height - 8;
      // Ако не побира отгоре → покажи отдолу
      if (topPx < 0) topPx = btnRect.bottom - cardRect.top + 8;
      var leftPx = (btnRect.left - cardRect.left) + (btnRect.width / 2) - (ttRect.width / 2);
      // Clamp в границите на card
      var maxLeft = cardRect.width - ttRect.width - 4;
      if (leftPx < 4) leftPx = 4;
      if (leftPx > maxLeft) leftPx = maxLeft;
      tooltip.style.top = topPx + 'px';
      tooltip.style.left = leftPx + 'px';
      activeBtn = btn;
    }

    function hideTooltip() {
      tooltip.setAttribute('hidden', '');
      activeBtn = null;
    }

    card.addEventListener('click', function (e) {
      var btn = e.target.closest('.pc-square');
      if (btn) {
        e.stopPropagation();
        if (activeBtn === btn) hideTooltip();
        else showTooltip(btn);
        return;
      }
      // Tap извън square → hide
      hideTooltip();
    });

    // Outside click → hide
    document.addEventListener('click', function (e) {
      if (!card.contains(e.target)) hideTooltip();
    });

    // ESC → hide
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && activeBtn) {
        e.preventDefault();
        hideTooltip();
        activeBtn && activeBtn.focus();
      }
    });

    return card;
  }

  return { render: render };
})();
