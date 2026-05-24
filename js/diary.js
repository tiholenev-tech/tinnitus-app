/**
 * AURALIS Diary v1.0 — 3 въпроса дневно, SVG charts, JSON export
 * ================================================================
 * Per BIBLE v3.1 §F:
 *  - 3 въпроса: sleep_hours (0-12), tinnitus (0-10), stress (0-10)
 *  - localStorage 'auralis_diary_entries' (last-wins per date)
 *  - 7/30/90 day toggle
 *  - Inline SVG charts (НЕ Chart.js — без CDN, offline-ready)
 *  - Прости insights (correlation math, без AI)
 *  - JSON export download
 *
 * Public API:
 *   Diary.open()        — entry point
 *   Diary.close()
 *   Diary.render()
 *   Diary.getEntries()  — array of {date, sleep_hours, tinnitus, stress, timestamp}
 *   Diary.upsert(entry) — save/update entry (used internally)
 *   Diary.export()      — trigger download
 */

window.Diary = (function () {
  'use strict';

  var STORAGE_KEY = 'auralis_diary_entries';
  var RANGES = [7, 30, 90];

  // State (UI only — persistence is localStorage)
  var draft = { sleep_hours: 7, tinnitus: 5, stress: 5 };
  var activeRange = 7;
  var justSaved = false;

  // ============================================================
  // Helpers
  // ============================================================

  function el(id) { return document.getElementById(id); }

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function todayKey() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }

  function formatHumanDate(isoDate) {
    var parts = isoDate.split('-');
    var months = ['януари','февруари','март','април','май','юни',
                  'юли','август','септември','октомври','ноември','декември'];
    return parseInt(parts[2], 10) + ' ' + months[parseInt(parts[1], 10) - 1];
  }

  // ============================================================
  // Storage
  // ============================================================

  function loadEntries() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function saveEntries(entries) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch (e) { /* ignore */ }
  }

  function findByDate(entries, date) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].date === date) return i;
    }
    return -1;
  }

  function upsert(entry) {
    var entries = loadEntries();
    var idx = findByDate(entries, entry.date);
    entry.timestamp = Date.now();
    if (idx === -1) entries.push(entry);
    else entries[idx] = entry;
    // Sort by date ascending за consistency
    entries.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    saveEntries(entries);
  }

  function getEntriesForRange(days) {
    var all = loadEntries();
    if (!days || all.length === 0) return all;
    var cutoffMs = Date.now() - (days - 1) * 24 * 60 * 60 * 1000;
    return all.filter(function (e) {
      var t = new Date(e.date + 'T00:00:00').getTime();
      return t >= cutoffMs;
    });
  }

  function getTodayEntry() {
    var key = todayKey();
    var entries = loadEntries();
    var idx = findByDate(entries, key);
    return idx >= 0 ? entries[idx] : null;
  }

  // ============================================================
  // SVG chart renderer (inline, no library)
  // ============================================================

  function buildLineChartSvg(values, yMax, color, height) {
    if (!values || values.length === 0) {
      return '<div class="diary-chart-empty">' +
        escapeHtml(t('diary.chart.noData', 'Няма записи в този период')) +
        '</div>';
    }
    height = height || 100;
    var width = 320;
    var padX = 16;
    var padY = 14;
    var w = width - 2 * padX;
    var h = height - 2 * padY;
    var n = values.length;

    var xStep = n > 1 ? w / (n - 1) : 0;

    // Build polyline points
    var pts = [];
    var circles = '';
    for (var i = 0; i < n; i++) {
      var v = Math.max(0, Math.min(yMax, values[i]));
      var x = padX + (i * xStep);
      var y = padY + h - (v / yMax) * h;
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      circles += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) +
        '" r="3" fill="' + color + '"/>';
    }

    // Y grid (3 horizontal lines)
    var grid = '';
    for (var g = 0; g <= 2; g++) {
      var gy = padY + (g * h / 2);
      grid += '<line x1="' + padX + '" y1="' + gy.toFixed(1) +
        '" x2="' + (width - padX) + '" y2="' + gy.toFixed(1) +
        '" stroke="currentColor" stroke-width="0.5" opacity="0.15"/>';
    }

    return (
      '<svg class="diary-chart-svg" viewBox="0 0 ' + width + ' ' + height + '"' +
        ' preserveAspectRatio="none" aria-hidden="true">' +
        grid +
        '<polyline points="' + pts.join(' ') + '"' +
          ' fill="none" stroke="' + color + '" stroke-width="2"' +
          ' stroke-linecap="round" stroke-linejoin="round"/>' +
        circles +
      '</svg>'
    );
  }

  function buildChartSection(titleKey, defaultTitle, values, yMax, color) {
    var avg = values.length > 0
      ? (values.reduce(function (a, b) { return a + b; }, 0) / values.length).toFixed(1)
      : '—';
    return (
      '<div class="diary-chart">' +
        '<div class="diary-chart-head">' +
          '<h3 class="diary-chart-title">' +
            escapeHtml(t(titleKey, defaultTitle)) +
          '</h3>' +
          '<span class="diary-chart-avg">' +
            escapeHtml(t('diary.chart.avg', 'Средно: ' + avg, { n: avg })) +
          '</span>' +
        '</div>' +
        buildLineChartSvg(values, yMax, color) +
      '</div>'
    );
  }

  // ============================================================
  // Insights
  // ============================================================

  function computeInsights(entries) {
    if (entries.length < 7) {
      return [{
        type: 'needMore',
        text: t('diary.insights.needMoreData', 'Запишете поне 7 дни за да видите тенденции.')
      }];
    }

    var insights = [];

    // Sleep correlation
    var goodSleep = entries.filter(function (e) { return e.sleep_hours > 7; });
    var poorSleep = entries.filter(function (e) { return e.sleep_hours <= 7; });
    if (goodSleep.length >= 2 && poorSleep.length >= 2) {
      var avgGood = avgOf(goodSleep, 'tinnitus');
      var avgPoor = avgOf(poorSleep, 'tinnitus');
      var delta = (avgPoor - avgGood).toFixed(1);
      if (parseFloat(delta) >= 0.5) {
        insights.push({
          type: 'sleep',
          text: t('diary.insights.betterWithSleep',
            'Когато спите повече от 7 часа, тинитусът е средно с ' + delta + ' точки по-нисък.',
            { delta: delta })
        });
      }
    }

    // Stress correlation
    var highStress = entries.filter(function (e) { return e.stress > 6; });
    var lowStress = entries.filter(function (e) { return e.stress <= 6; });
    if (highStress.length >= 2 && lowStress.length >= 2) {
      var avgHigh = avgOf(highStress, 'tinnitus');
      var avgLow = avgOf(lowStress, 'tinnitus');
      var d2 = (avgHigh - avgLow).toFixed(1);
      if (parseFloat(d2) >= 0.5) {
        insights.push({
          type: 'stress',
          text: t('diary.insights.moreStressMoreTinnitus',
            'Когато стресът е над 6, тинитусът е средно с ' + d2 + ' точки по-висок.',
            { delta: d2 })
        });
      }
    }

    return insights;
  }

  function avgOf(arr, key) {
    if (arr.length === 0) return 0;
    return arr.reduce(function (a, b) { return a + b[key]; }, 0) / arr.length;
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
  }

  function svgBook() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
      '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
      '</svg>';
  }

  function buildSliderHtml(id, min, max, value, lowLabel, highLabel, suffixFn) {
    var displayValue = suffixFn ? suffixFn(value) : String(value);
    return (
      '<div class="diary-slider-wrap">' +
        '<div class="diary-slider-row">' +
          '<span class="diary-slider-edge">' + escapeHtml(lowLabel) + '</span>' +
          '<input type="range" id="' + id + '" class="diary-slider"' +
            ' min="' + min + '" max="' + max + '" step="1" value="' + value + '"' +
            ' aria-label="' + escapeHtml(lowLabel + ' - ' + highLabel) + '">' +
          '<span class="diary-slider-edge">' + escapeHtml(highLabel) + '</span>' +
        '</div>' +
        '<div class="diary-slider-value" id="' + id + 'Value">' +
          escapeHtml(displayValue) +
        '</div>' +
      '</div>'
    );
  }

  function buildTodayCard() {
    var humanDate = formatHumanDate(todayKey());
    var existing = getTodayEntry();
    if (existing) {
      draft = {
        sleep_hours: existing.sleep_hours,
        tinnitus: existing.tinnitus,
        stress: existing.stress
      };
    }
    var saveLabel = existing
      ? t('diary.saveUpdate', 'Обнови днешния запис')
      : t('diary.save', 'Запиши днешния запис');
    var savedLabel = t('diary.saved', 'Записано');

    return (
      '<section class="diary-today">' +
        '<div class="diary-today-date">' +
          escapeHtml(t('diary.today', 'Днес, ' + humanDate, { date: humanDate })) +
        '</div>' +

        '<div class="diary-q">' +
          '<label class="diary-q-label" for="diarySleep">' +
            escapeHtml(t('diary.q.sleep', 'Колко часа спахте?')) +
          '</label>' +
          buildSliderHtml('diarySleep', 0, 12, draft.sleep_hours,
            '0', '12',
            function (v) { return t('diary.q.sleepHoursSuffix', v + ' ч', { n: v }); }) +
        '</div>' +

        '<div class="diary-q">' +
          '<label class="diary-q-label" for="diaryTinnitus">' +
            escapeHtml(t('diary.q.tinnitus', 'Тинитусът днес:')) +
          '</label>' +
          buildSliderHtml('diaryTinnitus', 0, 10, draft.tinnitus,
            t('diary.q.tinnitusLow', 'Тих'),
            t('diary.q.tinnitusHigh', 'Силен')) +
        '</div>' +

        '<div class="diary-q">' +
          '<label class="diary-q-label" for="diaryStress">' +
            escapeHtml(t('diary.q.stress', 'Стресът днес:')) +
          '</label>' +
          buildSliderHtml('diaryStress', 0, 10, draft.stress,
            t('diary.q.stressLow', 'Спокоен'),
            t('diary.q.stressHigh', 'Тревожен')) +
        '</div>' +

        '<button class="diary-save-btn" type="button" data-action="save"' +
          (justSaved ? ' disabled' : '') + '>' +
          escapeHtml(justSaved ? savedLabel + ' ✓' : saveLabel) +
        '</button>' +
      '</section>'
    );
  }

  function buildHistorySection() {
    var entries = getEntriesForRange(activeRange);
    var sleepVals = entries.map(function (e) { return e.sleep_hours; });
    var tinnVals = entries.map(function (e) { return e.tinnitus; });
    var stressVals = entries.map(function (e) { return e.stress; });

    if (loadEntries().length === 0) {
      return (
        '<section class="diary-history">' +
          '<div class="diary-empty">' +
            escapeHtml(t('diary.empty', 'Започнете да записвате днес — само 3 въпроса, 30 секунди.')) +
          '</div>' +
        '</section>'
      );
    }

    var rangeButtons = RANGES.map(function (r) {
      var isActive = r === activeRange;
      var label = t('diary.history.range' + r, r + ' дни');
      return (
        '<button class="diary-range-btn' + (isActive ? ' is-active' : '') + '"' +
          ' type="button" data-range="' + r + '" role="radio"' +
          ' aria-checked="' + (isActive ? 'true' : 'false') + '">' +
          escapeHtml(label) +
        '</button>'
      );
    }).join('');

    var insights = computeInsights(loadEntries());
    var insightsHtml = insights.length === 0 ? '' :
      '<section class="diary-insights">' +
        '<h3 class="diary-insights-title">' +
          escapeHtml(t('diary.insights.title', 'Какво забелязваме')) +
        '</h3>' +
        '<ul class="diary-insights-list">' +
          insights.map(function (ins) {
            return '<li class="diary-insight diary-insight--' + ins.type + '">' +
              escapeHtml(ins.text) + '</li>';
          }).join('') +
        '</ul>' +
      '</section>';

    return (
      insightsHtml +
      '<section class="diary-history">' +
        '<div class="diary-history-head">' +
          '<h2 class="diary-history-title">' +
            escapeHtml(t('diary.history.label', 'История')) +
          '</h2>' +
          '<div class="diary-ranges" role="radiogroup">' + rangeButtons + '</div>' +
        '</div>' +

        buildChartSection('diary.chart.sleep', 'Сън (часове)',
          sleepVals, 12, 'hsl(var(--hue3) 70% 55%)') +

        buildChartSection('diary.chart.tinnitus', 'Тинитус (0-10)',
          tinnVals, 10, 'hsl(var(--hue1) 70% 55%)') +

        buildChartSection('diary.chart.stress', 'Стрес (0-10)',
          stressVals, 10, 'hsl(38 80% 55%)') +

        '<button class="diary-export-btn" type="button" data-action="export">' +
          escapeHtml(t('diary.export', 'Изтегли история (JSON)')) +
        '</button>' +
      '</section>'
    );
  }

  function buildDiaryHtml() {
    var closeAria = t('diary.closeAria', 'Затвори дневника');
    return (
      '<div class="diary-screen" data-screen="diary">' +
        '<button class="diary-close" type="button" data-action="close"' +
          ' aria-label="' + escapeHtml(closeAria) + '">' + svgClose() + '</button>' +

        '<div class="diary-header">' +
          '<span class="diary-icon" aria-hidden="true">' + svgBook() + '</span>' +
          '<h1 class="diary-title">' +
            escapeHtml(t('diary.title', 'Дневник')) +
          '</h1>' +
        '</div>' +

        buildTodayCard() +
        buildHistorySection() +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onSliderInput(e) {
    var input = e.currentTarget;
    var id = input.id;
    var val = parseInt(input.value, 10);
    if (isNaN(val)) return;
    var valueEl = el(id + 'Value');
    if (id === 'diarySleep') {
      draft.sleep_hours = val;
      if (valueEl) valueEl.textContent = t('diary.q.sleepHoursSuffix', val + ' ч', { n: val });
    } else if (id === 'diaryTinnitus') {
      draft.tinnitus = val;
      if (valueEl) valueEl.textContent = String(val);
    } else if (id === 'diaryStress') {
      draft.stress = val;
      if (valueEl) valueEl.textContent = String(val);
    }
    // Re-enable save button ако беше disabled
    if (justSaved) {
      justSaved = false;
      var btn = document.querySelector('.diary-save-btn');
      if (btn) {
        btn.removeAttribute('disabled');
        var existing = getTodayEntry();
        btn.textContent = existing
          ? t('diary.saveUpdate', 'Обнови днешния запис')
          : t('diary.save', 'Запиши днешния запис');
      }
    }
  }

  function onSave() {
    upsert({
      date: todayKey(),
      sleep_hours: draft.sleep_hours,
      tinnitus: draft.tinnitus,
      stress: draft.stress
    });
    justSaved = true;
    refresh();
  }

  function onRangeChange(range) {
    activeRange = range;
    refresh();
  }

  function exportToFile() {
    var data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entries: loadEntries()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var filename = t('diary.exportFilename', 'auralis-diary-' + todayKey() + '.json',
      { date: todayKey() });
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // ============================================================
  // Render
  // ============================================================

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildDiaryHtml();
    bindEvents(app);
  }

  function bindEvents(container) {
    var sliders = container.querySelectorAll('.diary-slider');
    for (var i = 0; i < sliders.length; i++) {
      sliders[i].addEventListener('input', onSliderInput);
    }
    container.addEventListener('click', onClick);
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      e.stopPropagation();
      var action = actionBtn.getAttribute('data-action');
      if (action === 'close') close();
      else if (action === 'save') onSave();
      else if (action === 'export') exportToFile();
      return;
    }
    var rangeBtn = e.target.closest('[data-range]');
    if (rangeBtn) {
      var r = parseInt(rangeBtn.getAttribute('data-range'), 10);
      if (!isNaN(r)) onRangeChange(r);
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  function open() {
    justSaved = false;
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('diary');
    }
    history.pushState({ phase: 'diary' }, '');
    render();
  }

  function close() {
    if (window.AppState && window.AppState.transition) {
      window.AppState.transition('library');
    }
    history.pushState({ phase: 'library' }, '');
    if (window.Library && window.Library.render) {
      window.Library.render();
    }
  }

  function render() {
    refresh();
  }

  return {
    open: open,
    close: close,
    render: render,
    getEntries: loadEntries,
    upsert: upsert,
    export: exportToFile
  };
})();
