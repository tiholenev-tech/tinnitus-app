/**
 * AURALIS Info Content — thin adapter (post-A5 i18n migration)
 * =============================================================
 * Source of truth: i18n/<locale>.json под content.* (mixer/general/categories/navigation/mechanics).
 *
 * Legacy consumers четат window.INFO_CONTENT.mixer[key], window.INFO_CONTENT.mechanics[key]
 * etc. Този адаптер popul-ва window.INFO_CONTENT от i18n на init + на locale change.
 *
 * Migration history:
 * - До Task A5 (commit a5e30ff): 1243 lines с embedded БГ data
 * - От Task A5 нататък: ~30-line адаптер; данните живеят в i18n/bg.json
 *
 * Защо адаптер а не direct i18n.tObj() в mixer.js: запазваме съществуващия contract
 * за бъдещи модули и tests. Phase 2 може да премести всички consumers към i18n.tObj()
 * директно и да премахне този адаптер напълно.
 */

(function () {
  'use strict';

  function buildFromI18n() {
    if (!window.i18n || !window.i18n.tObj) return {};
    var c = window.i18n.tObj('content');
    return c || {};
  }

  function rebuild() {
    window.INFO_CONTENT = buildFromI18n();
  }

  // Initial assignment — empty object докато i18n се зареди.
  // app.js bootstrap извиква rebuild() след i18n.init() resolve.
  window.INFO_CONTENT = {};

  // Auto-rebuild при locale switch
  window.addEventListener('i18n-locale-changed', rebuild);

  // Public API (extending — добавено в A5)
  window.InfoContent = {
    rebuild: rebuild
  };

  // Backward compatibility: node.js module.exports (за tests)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.INFO_CONTENT;
  }
})();
