/**
 * AURALIS HeadphonesWarning — first-play safety sheet (SAFETY-3)
 * ===========================================================================
 * Показва се при ПЪРВО отваряне на Player. Educational съдържание за:
 *   - in-ear слушалки → влошават тинитуса (occlusion effect)
 *   - препоръчвани alternative-и (open speakers / bone conduction)
 *   - mixing point principle
 *   - night exposure limit
 *
 * След dismiss → localStorage flag → не се показва пак.
 * Optional checkbox "Не показвай отново" може да override-не показването
 * дори при reset на flag (Wave 3.2).
 *
 * Public API:
 *   HeadphonesWarning.showIfFirstTime(onContinue)
 *   HeadphonesWarning.reset()  — за тест / debug
 */

window.HeadphonesWarning = (function () {
  'use strict';

  var STORAGE_KEY = 'auralis-headphones-warning-seen';

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function hasBeenSeen() {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; }
    catch (e) { return false; }
  }

  function markSeen() {
    try { localStorage.setItem(STORAGE_KEY, 'true'); }
    catch (e) { /* ignore */ }
  }

  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); }
    catch (e) { /* ignore */ }
  }

  function buildContent() {
    var lines = [
      t('ui.headphones.l1', 'Слушалките-тапи (in-ear) ВЛОШАВАТ тинитуса. Те създават оклузивен ефект — вътрешният шум се чува по-силно.'),
      '',
      t('ui.headphones.l2', 'Препоръчваме:'),
      t('ui.headphones.l3', '✓ Външни говорители (60–90 см от главата)'),
      t('ui.headphones.l4', '✓ Костна проводимост (bone conduction)'),
      t('ui.headphones.l5', '✓ Open-back слушалки'),
      '',
      t('ui.headphones.l6', 'Силата НЕ трябва да заглушава тинитуса. Двата звука трябва да се чуват заедно (т.нар. „точка на смесване").'),
      '',
      t('ui.headphones.l7', 'Нощем — максимум 8 часа без прекъсване. Не настройвайте таймер за изключване нощем.')
    ];
    return '<div class="hw-content">' +
      lines.map(function (line) {
        if (!line) return '<div class="hw-spacer"></div>';
        return '<p class="hw-line">' + escapeHtml(line) + '</p>';
      }).join('') +
    '</div>';
  }

  function showIfFirstTime(onContinue) {
    if (hasBeenSeen()) {
      if (typeof onContinue === 'function') onContinue();
      return;
    }
    show(onContinue);
  }

  function show(onContinue) {
    var resumed = false;
    function done() {
      if (resumed) return;
      resumed = true;
      markSeen();
      if (typeof onContinue === 'function') onContinue();
    }

    if (window.BottomSheet && window.BottomSheet.open) {
      window.BottomSheet.open({
        title: t('ui.headphones.title', 'ВАЖНО — преди да започнете'),
        content: buildContent(),
        height: 'auto',
        showGrip: true,
        closeOnBackdrop: false,
        actions: [
          {
            label: t('ui.headphones.cta', 'Разбрах — продължи'),
            variant: 'primary',
            onClick: function () {
              if (window.BottomSheet.closeAll) window.BottomSheet.closeAll();
              done();
            }
          }
        ],
        onClose: function () { done(); }
      });
      return;
    }

    // Fallback overlay ако BottomSheet липсва
    var overlay = document.createElement('div');
    overlay.className = 'hw-fallback-overlay';
    overlay.innerHTML =
      '<div class="hw-fallback-sheet">' +
        '<h2 class="hw-fallback-title">' + escapeHtml(t('ui.headphones.title', 'ВАЖНО — преди да започнете')) + '</h2>' +
        buildContent() +
        '<button class="hw-fallback-cta" type="button">' + escapeHtml(t('ui.headphones.cta', 'Разбрах — продължи')) + '</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.querySelector('.hw-fallback-cta').addEventListener('click', function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      done();
    });
  }

  return {
    showIfFirstTime: showIfFirstTime,
    show: show,
    reset: reset,
    hasBeenSeen: hasBeenSeen
  };
})();
