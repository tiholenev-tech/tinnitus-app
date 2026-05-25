/**
 * AURALIS BreathingOrb — reusable animated orb component (Task S)
 * =================================================================
 * CSS-only animations (батерия first — no JS RAF).
 * Used by: SOS (4-7-8), Player (playing pulse), Sleep (idle).
 *
 * Public API:
 *   BreathingOrb.create(opts)  → HTMLElement (с .setMode, .destroy)
 *
 * opts:
 *   size:  200          // px diameter (default 200)
 *   mode:  'idle'       // 'idle' | '4-7-8' | 'playing' | 'paused'
 *   color: 'auto'       // 'champagne' | 'indigo' | 'auto' (auto = theme-aware)
 *
 * Instance methods (on returned element):
 *   el.setMode(mode)
 *   el.destroy()
 */

window.BreathingOrb = (function () {
  'use strict';

  var MODES = ['idle', '4-7-8', 'playing', 'paused'];
  var COLORS = ['champagne', 'indigo', 'auto'];

  function create(opts) {
    opts = opts || {};
    var size = opts.size || 200;
    var mode = MODES.indexOf(opts.mode) !== -1 ? opts.mode : 'idle';
    var color = COLORS.indexOf(opts.color) !== -1 ? opts.color : 'auto';

    var el = document.createElement('div');
    el.className = 'bo-orb';
    el.setAttribute('aria-hidden', 'true');
    el.style.width = size + 'px';
    el.style.height = size + 'px';

    // Inner glow layer
    var inner = document.createElement('div');
    inner.className = 'bo-inner';
    el.appendChild(inner);

    // Ring layer (for 4-7-8 phase indicator)
    var ring = document.createElement('div');
    ring.className = 'bo-ring';
    el.appendChild(ring);

    // Phase label (for 4-7-8 mode)
    var label = document.createElement('div');
    label.className = 'bo-label';
    el.appendChild(label);

    applyMode(el, mode);
    applyColor(el, color);

    // Public methods on the element
    el.setMode = function (newMode) {
      if (MODES.indexOf(newMode) === -1) return;
      mode = newMode;
      applyMode(el, mode);
    };

    el.destroy = function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    };

    return el;
  }

  function applyMode(el, mode) {
    // Remove all mode classes
    MODES.forEach(function (m) {
      el.classList.remove('bo-mode--' + m);
    });
    el.classList.add('bo-mode--' + mode);
    el.setAttribute('data-mode', mode);
  }

  function applyColor(el, color) {
    COLORS.forEach(function (c) {
      el.classList.remove('bo-color--' + c);
    });
    el.classList.add('bo-color--' + color);
  }

  return {
    create: create
  };
})();
