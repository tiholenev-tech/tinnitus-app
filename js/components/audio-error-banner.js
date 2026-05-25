/**
 * AURALIS AudioErrorBanner — recovery UI for failed sound loads (Task FF)
 * =========================================================================
 * Listens for 'auralis-sound-error' event. Shows bottom banner with:
 *   - "Опитай отново" (max 3 retries)
 *   - "Избери друг" → Library/CategoryView
 *   - "Затвори" → dismiss
 * Auto-dismiss after 8s if no interaction.
 *
 * Public API:
 *   AudioErrorBanner.init()    — bind event listener
 *   AudioErrorBanner.show(opts) — manual show { soundId, message }
 *   AudioErrorBanner.hide()     — dismiss
 */

window.AudioErrorBanner = (function () {
  'use strict';

  var MAX_RETRIES = 3;
  var AUTO_DISMISS_MS = 8000;

  var banner = null;
  var retryCount = 0;
  var currentSoundId = null;
  var dismissTimer = null;

  // ============================================================
  // i18n
  // ============================================================

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    var result = fallback != null ? fallback : key;
    if (params) {
      Object.keys(params).forEach(function (k) {
        result = result.replace('{' + k + '}', params[k]);
      });
    }
    return result;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ============================================================
  // Build / Show / Hide
  // ============================================================

  function show(opts) {
    opts = opts || {};
    currentSoundId = opts.soundId || null;
    retryCount = 0;

    hide(); // remove previous if any

    banner = document.createElement('div');
    banner.className = 'aeb';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');
    renderBannerContent();
    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });

    // Auto-dismiss
    startAutoDismiss();
  }

  function renderBannerContent() {
    if (!banner) return;
    var canRetry = retryCount < MAX_RETRIES;
    var title = canRetry
      ? t('audio.error.banner.title', 'Звукът не успя да се зареди')
      : t('audio.error.banner.giveUp', 'Звукът не работи. Изберете друг.');

    var retryLabel = t('audio.error.banner.retry', 'Опитай отново');
    var retryHint = canRetry
      ? t('audio.error.banner.retryCount', 'Опит {n} от 3', { n: retryCount + 1 })
      : '';

    banner.innerHTML =
      '<div class="aeb-msg">' + escapeHtml(title) + '</div>' +
      '<div class="aeb-actions">' +
        (canRetry
          ? '<button class="aeb-btn aeb-btn--retry" type="button" data-action="retry">' +
              escapeHtml(retryLabel) +
              (retryHint ? ' <small>(' + escapeHtml(retryHint) + ')</small>' : '') +
            '</button>'
          : '') +
        '<button class="aeb-btn aeb-btn--choose" type="button" data-action="choose">' +
          escapeHtml(t('audio.error.banner.choose', 'Избери друг')) +
        '</button>' +
        '<button class="aeb-btn aeb-btn--dismiss" type="button" data-action="dismiss">' +
          escapeHtml(t('audio.error.banner.dismiss', 'Затвори')) +
        '</button>' +
      '</div>';

    // Bind actions
    var btns = banner.querySelectorAll('[data-action]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', onAction);
    }
  }

  function hide() {
    clearAutoDismiss();
    if (!banner) return;
    banner.classList.remove('is-visible');
    banner.classList.add('is-leaving');
    var ref = banner;
    setTimeout(function () {
      if (ref.parentNode) ref.parentNode.removeChild(ref);
    }, 300);
    banner = null;
  }

  function startAutoDismiss() {
    clearAutoDismiss();
    dismissTimer = setTimeout(hide, AUTO_DISMISS_MS);
  }

  function clearAutoDismiss() {
    if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
  }

  // ============================================================
  // Actions
  // ============================================================

  function onAction(e) {
    var action = e.currentTarget.getAttribute('data-action');
    clearAutoDismiss();

    if (action === 'retry') {
      retryCount++;
      if (retryCount >= MAX_RETRIES) {
        renderBannerContent();
        startAutoDismiss();
        return;
      }
      // Retry play
      if (currentSoundId && window.AudioEngine && window.AudioEngine.play) {
        window.AudioEngine.play(currentSoundId);
      }
      hide();
    } else if (action === 'choose') {
      hide();
      if (window.Library && window.Library.render) {
        window.Library.render();
      }
    } else if (action === 'dismiss') {
      hide();
    }
  }

  // ============================================================
  // Event listener
  // ============================================================

  function onSoundError(e) {
    var detail = e.detail || {};
    show({ soundId: detail.soundId, message: detail.message });
  }

  function init() {
    window.addEventListener('auralis-sound-error', onSoundError);
  }

  return {
    init: init,
    show: show,
    hide: hide
  };
})();
