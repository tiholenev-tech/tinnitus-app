/**
 * AURALIS EmptyState — placeholder for empty lists/views (Task PP)
 * ==================================================================
 * 4 preset icons: inbox, sound, search, favorite.
 * Glass background, centered SVG illustration, champagne action button.
 *
 * Public API:
 *   EmptyState.create(opts) → HTMLElement
 *
 * opts:
 *   icon:        'inbox' | 'sound' | 'search' | 'favorite'
 *   title:       string
 *   description: string
 *   actionLabel: string (optional — shows CTA button)
 *   onAction:    () => {} (optional)
 */

window.EmptyState = (function () {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var ICONS = {
    inbox:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M8 36h14l4 8h12l4-8h14"/>' +
        '<path d="M16 12h32l8 24v16H8V36l8-24z"/>' +
      '</svg>',
    sound:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<polygon points="24 18 12 28 12 36 24 46 24 18" fill="currentColor" stroke="none" opacity="0.3"/>' +
        '<polygon points="24 18 12 28 12 36 24 46 24 18"/>' +
        '<path d="M34 24a8 8 0 010 16"/>' +
        '<path d="M40 18a16 16 0 010 28"/>' +
        '<path d="M46 12a24 24 0 010 40"/>' +
      '</svg>',
    search:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="28" cy="28" r="16"/>' +
        '<line x1="40" y1="40" x2="54" y2="54"/>' +
        '<line x1="20" y1="28" x2="36" y2="28" opacity="0.3"/>' +
        '<line x1="28" y1="20" x2="28" y2="36" opacity="0.3"/>' +
      '</svg>',
    favorite:
      '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M32 54l-18.5-18.5a11 11 0 0115.5-15.5L32 23l3-3a11 11 0 0115.5 15.5z"/>' +
      '</svg>'
  };

  function create(opts) {
    opts = opts || {};
    var iconKey = opts.icon || 'inbox';
    var iconSvg = ICONS[iconKey] || ICONS.inbox;

    var el = document.createElement('div');
    el.className = 'es';

    var html =
      '<div class="es-icon" aria-hidden="true">' + iconSvg + '</div>' +
      (opts.title ? '<div class="es-title">' + escapeHtml(opts.title) + '</div>' : '') +
      (opts.description ? '<div class="es-desc">' + escapeHtml(opts.description) + '</div>' : '');

    if (opts.actionLabel) {
      html += '<button class="es-action" type="button">' + escapeHtml(opts.actionLabel) + '</button>';
    }

    el.innerHTML = html;

    if (opts.actionLabel && opts.onAction) {
      var btn = el.querySelector('.es-action');
      if (btn) btn.addEventListener('click', opts.onAction);
    }

    return el;
  }

  return { create: create };
})();
