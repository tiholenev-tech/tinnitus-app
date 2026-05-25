/**
 * AURALIS Timeline — reusable timeline component (Task KK)
 * ==========================================================
 * Vertical timeline with dots, connecting line, glass cards.
 * Tap card → expand description (InfoPanel pattern).
 *
 * Public API:
 *   Timeline.create(opts) → HTMLElement
 *
 * opts:
 *   items:   [{ period, title, description }]
 *   variant: 'vertical' | 'horizontal' (default 'vertical')
 */

window.Timeline = (function () {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function create(opts) {
    opts = opts || {};
    var items = opts.items || [];
    var variant = opts.variant || 'vertical';

    var el = document.createElement('div');
    el.className = 'tl tl--' + variant;

    items.forEach(function (item, idx) {
      var node = document.createElement('div');
      node.className = 'tl-item';
      node.setAttribute('data-tl-idx', idx);

      // Dot + line
      node.innerHTML =
        '<div class="tl-marker">' +
          '<div class="tl-dot"></div>' +
          (idx < items.length - 1 ? '<div class="tl-line"></div>' : '') +
        '</div>' +
        '<div class="tl-card">' +
          '<div class="tl-period">' + escapeHtml(item.period || '') + '</div>' +
          '<div class="tl-title">' + escapeHtml(item.title || '') + '</div>' +
          (item.description
            ? '<div class="tl-desc" hidden>' + escapeHtml(item.description) + '</div>'
            : '') +
        '</div>';

      // Tap to expand description
      if (item.description) {
        var card = node.querySelector('.tl-card');
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
          var desc = node.querySelector('.tl-desc');
          if (!desc) return;
          var isHidden = desc.hasAttribute('hidden');
          // Close all others
          var allDescs = el.querySelectorAll('.tl-desc');
          for (var i = 0; i < allDescs.length; i++) {
            allDescs[i].setAttribute('hidden', '');
            allDescs[i].parentElement.classList.remove('is-expanded');
          }
          if (isHidden) {
            desc.removeAttribute('hidden');
            card.classList.add('is-expanded');
          }
        });
      }

      el.appendChild(node);
    });

    return el;
  }

  return { create: create };
})();
