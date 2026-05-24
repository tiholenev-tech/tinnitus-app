/**
 * AURALIS Toast — bottom-center notification helper
 * ===================================================
 * 3 sec auto-hide. Variant: 'info' (default) | 'error' | 'success'.
 * Stacks vertically ако са няколко наведнъж (rare).
 *
 * Public API:
 *   Toast.show(message, opts?)  — opts: { variant, durationMs }
 *   Toast.error(message)         — shorthand
 *   Toast.success(message)
 *   Toast.clear()                — remove all
 */

window.Toast = (function () {
  'use strict';

  var DEFAULT_DURATION = 3000;
  var container = null;

  function ensureContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
    return container;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function show(message, opts) {
    opts = opts || {};
    var variant = opts.variant || 'info';
    var duration = opts.durationMs || DEFAULT_DURATION;

    var root = ensureContainer();
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + variant;
    toast.setAttribute('role', variant === 'error' ? 'alert' : 'status');
    toast.innerHTML = '<span class="toast-msg">' + escapeHtml(message) + '</span>';
    root.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  function error(message) {
    show(message, { variant: 'error' });
  }

  function success(message) {
    show(message, { variant: 'success' });
  }

  function clear() {
    if (!container) return;
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  return {
    show: show,
    error: error,
    success: success,
    clear: clear
  };
})();
