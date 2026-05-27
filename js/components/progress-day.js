/**
 * AURALIS ProgressDay — back-compat wrapper around ProgressChart
 * ================================================================
 * Бил е първоначалният 14-day dots component (Вълна 3.1 Task Б).
 * Изместен е от ProgressChart (по-богат: status цветове, freeze, tooltip).
 *
 * Този файл остава САМО за back-compat: всеки external caller на
 * ProgressDay.render(...) продължава да работи, но получава новата
 * визуализация. Phase 2 cleanup → consolidate callers → delete.
 *
 * Legacy API (запазен):
 *   ProgressDay.render({ currentDay, completedDays }) → HTMLElement
 */

window.ProgressDay = window.ProgressDay || {
  render: function (opts) {
    opts = opts || {};
    if (window.ProgressChart && typeof window.ProgressChart.render === 'function') {
      // ProgressChart чете AppState директно за richer status (partial/frozen).
      // Подаваме currentDay ако е expicitly зададен (override).
      return window.ProgressChart.render({
        currentDay: opts.currentDay
      });
    }
    // Defensive fallback ако progress-chart.js не е заредил.
    var div = document.createElement('div');
    div.className = 'pc-card pc-card--fallback';
    div.textContent = 'Ден ' + (opts.currentDay || 1) + ' от 14';
    return div;
  }
};
