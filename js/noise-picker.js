/**
 * AURALIS NoisePicker — bottom sheet за Layer 2 noise selection (Task Q)
 * ========================================================================
 * 6 noise варианта + "Без фон" (none). (i) info button per option →
 * показва InfoPanel със описание от i18n.t('noises.<id>.description').
 *
 * Емитира 'noise-changed' window event с detail: { noiseId }.
 * Player (P) слуша → setLayer2 в AudioEngine.
 *
 * Public API:
 *   NoisePicker.open(currentNoiseId?) — opens bottom sheet
 *   NoisePicker.close()
 *   NoisePicker.getOptions() — returns NOISE_IDS array
 */

window.NoisePicker = (function () {
  'use strict';

  // ============================================================
  // Noise options (mirror на i18n components.noisePicker.options.*)
  // ============================================================

  var NOISE_IDS = [
    'none',
    'brown_pure',
    'brown_lp1000',
    'brown_lp500',
    'pink_pure',
    'pink_lp2000',
    'pink_lp4000'
  ];

  // ============================================================
  // STATE
  // ============================================================

  var overlay = null;
  var currentSelected = 'none';
  var escHandlerBound = false;

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function noiseLabel(id) {
    return t('components.noisePicker.options.' + id, id);
  }

  function noiseDescription(id) {
    return t('noises.' + id + '.description', '');
  }

  function noiseTitle(id) {
    return t('noises.' + id + '.title', noiseLabel(id));
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
  }

  function svgInfo() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>' +
      '<line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  // ============================================================
  // HTML builders
  // ============================================================

  function buildOptionRow(id) {
    var isActive = id === currentSelected;
    var label = noiseLabel(id);
    var infoAria = t('components.noisePicker.infoAria',
      'Информация за: ' + noiseTitle(id), { name: noiseTitle(id) });
    var radioMark = isActive
      ? '<span class="np-radio is-active" aria-hidden="true"><span class="np-radio-dot"></span></span>'
      : '<span class="np-radio" aria-hidden="true"></span>';

    return (
      '<li class="np-option' + (isActive ? ' is-active' : '') + '" data-noise-id="' + id + '">' +
        '<button class="np-option-main" type="button" role="radio"' +
          ' aria-checked="' + (isActive ? 'true' : 'false') + '"' +
          ' data-action="select">' +
          radioMark +
          '<span class="np-option-label">' + escapeHtml(label) + '</span>' +
        '</button>' +
        (id !== 'none'
          ? '<button class="np-option-info" type="button"' +
              ' data-action="info" aria-label="' + escapeHtml(infoAria) + '">' +
              svgInfo() +
            '</button>'
          : '') +
      '</li>'
    );
  }

  function buildSheetHtml() {
    var title = t('components.noisePicker.title', 'Изберете фонов шум');
    var closeLabel = t('components.noisePicker.close', 'Затвори');

    return (
      '<div class="np-sheet" role="dialog" aria-modal="true"' +
        ' aria-label="' + escapeHtml(title) + '">' +
        '<div class="np-sheet-grip" aria-hidden="true"></div>' +
        '<div class="np-header">' +
          '<h2 class="np-title">' + escapeHtml(title) + '</h2>' +
          '<button class="np-close" type="button" data-action="close"' +
            ' aria-label="' + escapeHtml(closeLabel) + '">' + svgClose() + '</button>' +
        '</div>' +

        '<ul class="np-list" role="radiogroup" aria-label="' +
          escapeHtml(title) + '">' +
          NOISE_IDS.map(buildOptionRow).join('') +
        '</ul>' +

        '<div class="np-info-slot" id="npInfoSlot" hidden></div>' +

        '<div class="np-footer">' +
          '<button class="np-close-btn" type="button" data-action="close">' +
            escapeHtml(closeLabel) +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function bindEvents() {
    if (!overlay) return;
    overlay.addEventListener('click', onOverlayClick);
    var sheet = overlay.querySelector('.np-sheet');
    if (sheet) sheet.addEventListener('click', onClick);
  }

  function onOverlayClick(e) {
    if (e.target === overlay) close();
  }

  function onClick(e) {
    var actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    e.stopPropagation();
    var action = actionBtn.getAttribute('data-action');
    if (action === 'close') {
      close();
      return;
    }
    var li = actionBtn.closest('.np-option');
    if (!li) return;
    var noiseId = li.getAttribute('data-noise-id');
    if (action === 'select') {
      selectNoise(noiseId);
    } else if (action === 'info') {
      showInfoFor(noiseId);
    }
  }

  function selectNoise(noiseId) {
    if (!noiseId) return;
    currentSelected = noiseId;
    // Re-render списъка (single source of truth = currentSelected)
    refreshList();
    // Emit event за Player + AudioEngine
    try {
      window.dispatchEvent(new CustomEvent('noise-changed', {
        detail: { noiseId: noiseId }
      }));
    } catch (e) { /* ignore */ }
    // Auto-close след кратък delay (UX: user вижда selection update first)
    setTimeout(close, 280);
  }

  function refreshList() {
    if (!overlay) return;
    var list = overlay.querySelector('.np-list');
    if (!list) return;
    list.innerHTML = NOISE_IDS.map(buildOptionRow).join('');
  }

  function showInfoFor(noiseId) {
    if (!overlay) return;
    var slot = overlay.querySelector('#npInfoSlot');
    if (!slot) return;

    // Ако вече е отворен този id → close (toggle)
    if (slot.getAttribute('data-current-id') === noiseId && !slot.hidden) {
      slot.hidden = true;
      slot.innerHTML = '';
      slot.removeAttribute('data-current-id');
      return;
    }

    var panelTitle = noiseTitle(noiseId);
    var panelBody = noiseDescription(noiseId);

    slot.innerHTML = '';
    if (window.InfoPanel && window.InfoPanel.create) {
      var panel = window.InfoPanel.create({
        title: panelTitle,
        body: panelBody,
        compact: true,
        icon: 'sound'
      });
      slot.appendChild(panel);
    } else {
      // Fallback ако InfoPanel липсва
      slot.innerHTML = '<div class="np-info-fallback">' +
        '<strong>' + escapeHtml(panelTitle) + '</strong><br>' +
        escapeHtml(panelBody) + '</div>';
    }
    slot.hidden = false;
    slot.setAttribute('data-current-id', noiseId);
    // Scroll info into view smoothly
    if (slot.scrollIntoView) {
      setTimeout(function () {
        slot.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape' && overlay) close();
  }

  // ============================================================
  // Open / close
  // ============================================================

  function open(currentNoiseId) {
    if (overlay) return;
    if (currentNoiseId && NOISE_IDS.indexOf(currentNoiseId) !== -1) {
      currentSelected = currentNoiseId;
    }
    overlay = document.createElement('div');
    overlay.className = 'np-overlay';
    overlay.innerHTML = buildSheetHtml();
    document.body.appendChild(overlay);
    bindEvents();
    if (!escHandlerBound) {
      window.addEventListener('keydown', onKeyDown);
      escHandlerBound = true;
    }
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    if (escHandlerBound) {
      window.removeEventListener('keydown', onKeyDown);
      escHandlerBound = false;
    }
  }

  function getOptions() {
    return NOISE_IDS.slice();
  }

  return {
    open: open,
    close: close,
    getOptions: getOptions
  };
})();
