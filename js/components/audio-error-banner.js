/**
 * AURALIS AudioErrorBanner — recovery UI for failed sound loads (Task FF)
 * =========================================================================
 * Д5: Silent auto-retry x3 при error. Banner се показва САМО ако всичките
 * 3 retry опита са неуспешни. Никаква "Опит N от 3" UI шум.
 *
 * Listens for 'auralis-sound-error' event. След показване:
 *   - "Опитайте отново"   → single retry (без counter)
 *   - "Избери друг"       → Library/CategoryView
 *   - "Затвори"           → dismiss
 * Auto-dismiss after 8s.
 *
 * Suppression: AudioErrorBanner.suppress(ms) → ignore errors в next ms
 * (Player.close го извиква за да избегне race condition с in-flight fetches).
 *
 * Public API:
 *   AudioErrorBanner.init()
 *   AudioErrorBanner.show({ soundId })
 *   AudioErrorBanner.hide()
 *   AudioErrorBanner.suppress(ms)
 */

window.AudioErrorBanner = (function () {
  'use strict';

  var MAX_SILENT_RETRIES = 3;
  var SILENT_RETRY_DELAY_MS = 600;
  var AUTO_DISMISS_MS = 8000;

  var banner = null;
  var currentSoundId = null;
  var dismissTimer = null;
  // Silent retry state per soundId
  var silentRetries = {};   // { soundId: count }
  var suppressUntilTs = 0;

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
    // Д5: без "Опит N от 3" — потребителят не разбира counter-а.
    var title = t('audio.error.banner.title', 'Звукът не успя да се зареди');
    var retryLabel = t('audio.error.banner.retry', 'Опитайте отново');

    banner.innerHTML =
      '<div class="aeb-msg">' + escapeHtml(title) + '</div>' +
      '<div class="aeb-actions">' +
        '<button class="aeb-btn aeb-btn--retry" type="button" data-action="retry">' +
          escapeHtml(retryLabel) +
        '</button>' +
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
      hide();
      if (currentSoundId && window.AudioEngine && window.AudioEngine.play) {
        // Reset silent retry counter — user explicit retry заслужава нов цикъл.
        delete silentRetries[currentSoundId];
        window.AudioEngine.play(currentSoundId);
      }
    } else if (action === 'choose') {
      hide();
      if (window.Home && window.Home.render) {
        if (window.AppState && window.AppState.transition) window.AppState.transition('home');
        window.Home.render();
      } else if (window.Library && window.Library.render) {
        window.Library.render();
      }
    } else if (action === 'dismiss') {
      hide();
    }
  }

  // ============================================================
  // Event listener — silent retry x3, банер само ако всичките fail-нат
  // ============================================================

  function onSoundError(e) {
    var detail = e.detail || {};
    var soundId = detail.soundId || detail.presetId;

    // Suppress race-condition errors (Player.close hits in-flight fetches)
    if (Date.now() < suppressUntilTs) {
      console.log('[audio-error-banner] suppressed (close race):', soundId);
      return;
    }

    if (!soundId) {
      show({ message: detail.message });
      return;
    }

    var count = (silentRetries[soundId] || 0) + 1;
    silentRetries[soundId] = count;

    if (count <= MAX_SILENT_RETRIES) {
      // Silent retry — без UI noise.
      console.log('[audio-error-banner] silent retry', count, '/', MAX_SILENT_RETRIES, 'for', soundId);
      setTimeout(function () {
        if (window.AudioEngine && window.AudioEngine.play) {
          // Само ако пакетът все още е "активен" в player (може user-ът да е затворил).
          if (Date.now() < suppressUntilTs) return;
          window.AudioEngine.play(soundId);
        }
      }, SILENT_RETRY_DELAY_MS * count);
      return;
    }

    // Изчерпан silent retry — показваме banner.
    delete silentRetries[soundId];
    show({ soundId: soundId, message: detail.message });
  }

  function suppress(ms) {
    suppressUntilTs = Date.now() + (ms || 1500);
    // Hide any visible banner during suppression.
    hide();
  }

  function init() {
    window.addEventListener('auralis-sound-error', onSoundError);
  }

  return {
    init: init,
    show: show,
    hide: hide,
    suppress: suppress
  };
})();
