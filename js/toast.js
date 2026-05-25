/**
 * AURALIS Toast — bottom-center notification helper (Task R polish)
 * ===================================================================
 * Queue + tap-to-dismiss + 3 variants (info/error/success) + ARIA live.
 * Slide-up animation. prefers-reduced-motion friendly.
 *
 * Public API:
 *   Toast.show(message, opts?)  — opts: { variant, durationMs, dismissible }
 *   Toast.info(message)          — shorthand (default variant = info)
 *   Toast.error(message)         — variant=error, role=alert, longer duration
 *   Toast.success(message)       — variant=success
 *   Toast.clear()                — remove all queued + visible
 *
 * Queue behavior:
 *   - Several toasts stack vertically (newest at bottom)
 *   - Each has own timer; tap dismisses immediately
 *   - Container persists; toasts auto-remove after fade-out
 */

window.Toast = (function () {
  'use strict';

  var DEFAULTS = {
    info:    { duration: 3000, role: 'status' },
    success: { duration: 3000, role: 'status' },
    error:   { duration: 4500, role: 'alert' }
  };

  var container = null;

  // ============================================================
  // Helpers
  // ============================================================

  function ensureContainer() {
    if (container && document.body.contains(container)) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
    return container;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove('is-visible');
    toast.classList.add('is-leaving');
    var done = function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    };
    // Поддръжка за prefers-reduced-motion: immediate removal
    var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (rm) {
      done();
    } else {
      setTimeout(done, 280);
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  function show(message, opts) {
    opts = opts || {};
    var variant = DEFAULTS[opts.variant] ? opts.variant : 'info';
    var defaults = DEFAULTS[variant];
    var duration = opts.durationMs || defaults.duration;
    var dismissible = opts.dismissible !== false;

    var root = ensureContainer();
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + variant + (dismissible ? ' toast--tappable' : '');
    toast.setAttribute('role', defaults.role);
    toast.setAttribute('tabindex', dismissible ? '0' : '-1');

    var inner = document.createElement('span');
    inner.className = 'toast-msg';
    inner.textContent = String(message); // textContent → авто escape
    toast.appendChild(inner);

    // Tap-to-dismiss (или Enter/Space at keyboard focus)
    if (dismissible) {
      var dismiss = function (e) {
        if (e && e.type === 'keydown') {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
        }
        if (timer) clearTimeout(timer);
        removeToast(toast);
      };
      toast.addEventListener('click', dismiss);
      toast.addEventListener('keydown', dismiss);
    }

    root.appendChild(toast);

    // Trigger enter animation на следващия frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { toast.classList.add('is-visible'); });
    });

    var timer = setTimeout(function () { removeToast(toast); }, duration);

    return toast;
  }

  function info(message)    { return show(message, { variant: 'info' }); }
  function success(message) { return show(message, { variant: 'success' }); }
  function error(message)   { return show(message, { variant: 'error' }); }

  function clear() {
    if (!container) return;
    var toasts = Array.prototype.slice.call(container.children);
    toasts.forEach(removeToast);
  }

  return {
    show: show,
    info: info,
    success: success,
    error: error,
    clear: clear
  };
})();
