/**
 * AURALIS Skeleton — loading placeholder component (Task DD)
 * ============================================================
 * Shimmer animation (1.5s linear infinite) с champagne tint.
 * Used при load на Library cards, Home categories, SoundDetail info.
 *
 * Public API:
 *   Skeleton.create(opts)  → HTMLElement (or DocumentFragment if count>1)
 *
 * opts:
 *   type:   'card' | 'list-item' | 'text' | 'image'
 *   width:  'auto' | px string (e.g. '120px')
 *   height: 'auto' | px string (e.g. '80px')
 *   count:  1 (default) — number of skeleton elements
 */

window.Skeleton = (function () {
  'use strict';

  var DEFAULTS = {
    card:      { width: '100%', height: '120px' },
    'list-item': { width: '100%', height: '56px' },
    text:      { width: '80%', height: '14px' },
    image:     { width: '100%', height: '180px' }
  };

  function create(opts) {
    opts = opts || {};
    var type = opts.type || 'card';
    var defaults = DEFAULTS[type] || DEFAULTS.card;
    var width = opts.width || defaults.width;
    var height = opts.height || defaults.height;
    var count = Math.max(1, Math.min(20, opts.count || 1));

    if (count === 1) {
      return buildOne(type, width, height);
    }

    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      frag.appendChild(buildOne(type, width, height));
    }
    return frag;
  }

  function buildOne(type, width, height) {
    var el = document.createElement('div');
    el.className = 'sk sk--' + type;
    el.setAttribute('aria-hidden', 'true');
    el.style.width = width;
    el.style.height = height;

    // Card type gets inner lines for realism
    if (type === 'card') {
      el.innerHTML =
        '<div class="sk-line sk-line--title"></div>' +
        '<div class="sk-line sk-line--body"></div>' +
        '<div class="sk-line sk-line--body sk-line--short"></div>';
    } else if (type === 'list-item') {
      el.innerHTML =
        '<div class="sk-circle"></div>' +
        '<div class="sk-lines">' +
          '<div class="sk-line sk-line--title"></div>' +
          '<div class="sk-line sk-line--body sk-line--short"></div>' +
        '</div>';
    }

    return el;
  }

  return {
    create: create
  };
})();
