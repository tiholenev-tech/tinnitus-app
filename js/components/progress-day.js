/**
 * AURALIS ProgressDay — 14-day CBT progress (ВЪЛНА 3.1 Task Б)
 * ================================================================
 * 14 dots in a row: completed=champagne, current=pulsing, future=empty.
 *
 * API:
 *   ProgressDay.render({ currentDay, completedDays })  → HTMLElement
 */

window.ProgressDay = (function () {
  'use strict';

  function render(opts) {
    opts = opts || {};
    var currentDay = opts.currentDay || 1;
    var completed = opts.completedDays || [];

    var el = document.createElement('div');
    el.className = 'pd-card';

    // Title
    var title = document.createElement('div');
    title.className = 'pd-title';
    title.textContent = 'Ден ' + currentDay;
    el.appendChild(title);

    // Dots row
    var dots = document.createElement('div');
    dots.className = 'pd-dots';
    for (var i = 1; i <= 14; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      var isCompleted = completed.indexOf(i) !== -1;
      var isCurrent = i === currentDay;
      dot.className = 'pd-dot' +
        (isCompleted ? ' pd-dot--done' : '') +
        (isCurrent ? ' pd-dot--current' : '') +
        (!isCompleted && !isCurrent ? ' pd-dot--future' : '');
      dot.setAttribute('aria-label', 'Ден ' + i);
      dot.setAttribute('data-day', i);

      if (isCompleted) {
        dot.addEventListener('click', (function (day) {
          return function () { console.log('Day ' + day + ' tapped'); };
        })(i));
      }
      dots.appendChild(dot);
    }
    el.appendChild(dots);

    // Counter
    var counter = document.createElement('div');
    counter.className = 'pd-counter';
    counter.textContent = 'Завършени: ' + completed.length + '/14';
    el.appendChild(counter);

    return el;
  }

  return { render: render };
})();
