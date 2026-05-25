/**
 * AURALIS ProfileBadge — profile display component (Task MM)
 * =============================================================
 * 3 sizes (small/medium/large). DI bar with color coding.
 * Tap → opens Profile Results screen.
 *
 * Public API:
 *   ProfileBadge.create(opts) → HTMLElement
 *
 * opts:
 *   code:    'TH_C'
 *   name:    'Тонален висок'
 *   diScore: 67
 *   diLevel: 'low' | 'medium' | 'high'
 *   size:    'small' | 'medium' | 'large' (default 'medium')
 */

window.ProfileBadge = (function () {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  var DI_COLORS = {
    low:    { bar: 'hsl(145 60% 50%)', label: 'hsl(145 60% 40%)' },
    medium: { bar: 'hsl(38 80% 55%)',  label: 'hsl(38 70% 40%)' },
    high:   { bar: 'hsl(var(--hue1) 70% 55%)', label: 'hsl(var(--hue1) 70% 50%)' }
  };

  function create(opts) {
    opts = opts || {};
    var code = opts.code || '—';
    var name = opts.name || '';
    var diScore = opts.diScore != null ? opts.diScore : 0;
    var diLevel = opts.diLevel || 'medium';
    var size = opts.size || 'medium';
    var colors = DI_COLORS[diLevel] || DI_COLORS.medium;
    var diPct = Math.max(0, Math.min(100, diScore));

    var el = document.createElement('div');
    el.className = 'pb pb--' + size;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', t('profileBadge.aria', 'Профил: ' + code, { code: code }));

    el.innerHTML =
      '<div class="pb-code">' + escapeHtml(code) + '</div>' +
      (name ? '<div class="pb-name">' + escapeHtml(name) + '</div>' : '') +
      '<div class="pb-di">' +
        '<div class="pb-di-track">' +
          '<div class="pb-di-fill" style="width:' + diPct + '%;background:' + colors.bar + '"></div>' +
        '</div>' +
        '<span class="pb-di-label" style="color:' + colors.label + '">DI ' + diScore + '</span>' +
      '</div>';

    // Tap → Profile Results
    el.addEventListener('click', function () {
      if (window.ProfileResults && window.ProfileResults.render) {
        if (window.AppState && window.AppState.transition) window.AppState.transition('profile_results');
        window.ProfileResults.render();
      }
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });

    return el;
  }

  return { create: create };
})();
