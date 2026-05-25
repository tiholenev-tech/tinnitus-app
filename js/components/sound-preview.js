/**
 * AURALIS SoundPreview — long-press peek audio (Task VV)
 * =========================================================
 * Long-press (500ms) on sound card → 5-sec audio preview.
 * Release → stop. Auto-stop after 5s.
 *
 * Public API:
 *   SoundPreview.bind(container)  — attach to a parent element
 *   SoundPreview.stop()           — force stop
 */

window.SoundPreview = (function () {
  'use strict';

  var LONG_PRESS_MS = 500;
  var PREVIEW_DURATION_MS = 5000;
  var holdTimer = null;
  var previewTimer = null;
  var activeCard = null;
  var previewing = false;

  function bind(container) {
    if (!container) return;
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);
    // Mouse fallback
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onTouchEnd);
    container.addEventListener('mouseleave', onTouchEnd);
  }

  function onTouchStart(e) {
    var card = findCard(e.target);
    if (!card) return;
    startHold(card);
  }

  function onMouseDown(e) {
    var card = findCard(e.target);
    if (!card) return;
    startHold(card);
  }

  function onTouchEnd() {
    cancelHold();
    if (previewing) stopPreview();
  }

  function findCard(target) {
    return target.closest('[data-sound-id]');
  }

  function startHold(card) {
    cancelHold();
    activeCard = card;
    holdTimer = setTimeout(function () {
      startPreview(card);
    }, LONG_PRESS_MS);
  }

  function cancelHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  }

  function startPreview(card) {
    var soundId = card.getAttribute('data-sound-id');
    if (!soundId) return;

    previewing = true;

    // Show overlay on card
    showOverlay(card);

    // Play preview
    if (window.AudioEngine && window.AudioEngine.play) {
      window.AudioEngine.play(soundId);
    }

    // Haptic
    if (window.Haptics) window.Haptics.medium();

    // Auto-stop after 5s
    previewTimer = setTimeout(function () {
      stopPreview();
    }, PREVIEW_DURATION_MS);
  }

  function stopPreview() {
    previewing = false;
    if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }

    // Stop audio
    if (window.AudioEngine && window.AudioEngine.pause) {
      window.AudioEngine.pause();
    }

    // Remove overlay
    hideOverlay();
    activeCard = null;
  }

  function showOverlay(card) {
    hideOverlay(); // remove previous
    var overlay = document.createElement('div');
    overlay.className = 'sp-overlay';
    overlay.innerHTML =
      '<span class="sp-indicator"></span>' +
      '<span class="sp-label">Preview</span>';
    card.style.position = 'relative';
    card.appendChild(overlay);
  }

  function hideOverlay() {
    var existing = document.querySelector('.sp-overlay');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  }

  function stop() {
    cancelHold();
    if (previewing) stopPreview();
  }

  return {
    bind: bind,
    stop: stop
  };
})();
