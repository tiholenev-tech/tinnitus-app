/**
 * AURALIS StreakBadge — daily streak indicator (ВЪЛНА 3.1 Task В)
 * =================================================================
 * Flame icon + days count. Pulse at 7+ days.
 *
 * API:
 *   StreakBadge.render({ activeDays, freezesRemaining }) → HTMLElement
 */

window.StreakBadge = (function () {
  'use strict';

  var SVG_FLAME =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 2C6.5 7.5 3 12.5 3 16a9 9 0 0018 0c0-3.5-3.5-8.5-9-14z' +
        'M12 20a5 5 0 01-5-5c0-2 1.5-4.5 5-8 3.5 3.5 5 6 5 8a5 5 0 01-5 5z"/>' +
    '</svg>';

  function render(opts) {
    opts = opts || {};
    var days = opts.activeDays || 0;
    var freezes = opts.freezesRemaining != null ? opts.freezesRemaining : 0;

    var el = document.createElement('div');
    el.className = 'sb-badge' + (days >= 7 ? ' sb-badge--pulse' : '');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', days + ' дни streak');

    el.innerHTML =
      '<span class="sb-icon">' + SVG_FLAME + '</span>' +
      '<span class="sb-count">' + days + '</span>' +
      '<span class="sb-unit">дни</span>';

    el.addEventListener('click', function () {
      console.log('Streak: ' + days + ' days, freezes: ' + freezes);
    });

    return el;
  }

  return { render: render };
})();
