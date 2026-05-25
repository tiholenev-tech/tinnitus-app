/**
 * AURALIS CategoryInfoSheet — учебен screen за use-case категории (Task P4)
 * ===========================================================================
 * Per BIBLE v3.1 §P4: tap (i) на Home category card → отваря bottom sheet
 * с пълна научна информация за категорията.
 *
 * 9 секции (когато content е готов от Opus):
 *   §1 За какво е този режим (definition)
 *   §2 Кога се ползва (timeOfDay / context / duration)
 *   §3 Кога НЕ се ползва (bullet list)
 *   §4 Препоръчителен фонов шум (type + description)
 *   §5 Препоръчително съотношение (Layer 1 / Layer 2 + reasoning)
 *   §6 Очакван ефект
 *   §7 Безопасност (bullet list)
 *   §8 Чести въпроси (FAQ accordion)
 *   §9 Научна основа (citations)
 *  CTA: "▶ Опитайте сега" → CategoryView с autoplay flag
 *
 * Public API:
 *   CategoryInfoSheet.open(categoryId)
 *   CategoryInfoSheet.close()
 *
 * Uses Code 2's BottomSheet (window.BottomSheet) — fallback fixed overlay
 * ако компонентът не е зареден.
 */

window.CategoryInfoSheet = (function () {
  'use strict';

  // Localstorage flag за CategoryView autoplay (consumed once)
  var STORAGE_AUTOPLAY = 'auralis_category_autoplay';

  var openHandle = null;

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    return fallback != null ? fallback : key;
  }

  function tOrNull(key) {
    if (!window.i18n || !window.i18n.t) return null;
    var v = window.i18n.t(key, null);
    if (typeof v !== 'string' || v === key || v.indexOf('TODO:') === 0) return null;
    return v;
  }

  function tObjOrNull(key) {
    if (!window.i18n || !window.i18n.tObj) return null;
    return window.i18n.tObj(key);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function placeholderText() {
    return t('categoryInfo.placeholder', 'Това съдържание се подготвя от научния екип.');
  }

  function sectionTitle(key, fallback) {
    return t('categoryInfo.sectionTitles.' + key, fallback);
  }

  function noiseLabel(noiseId) {
    if (!noiseId) return '—';
    return tOrNull('noises.' + noiseId + '.title') ||
           tOrNull('components.noisePicker.options.' + noiseId) ||
           noiseId;
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function svgPlay() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  }

  function svgChevron() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="6 9 12 15 18 9"/></svg>';
  }

  // ============================================================
  // Section builders
  // ============================================================

  function buildDefinition(catId) {
    var text = tOrNull('categoryInfo.' + catId + '.definition') || placeholderText();
    return (
      '<section class="cis-section">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('definition', 'За какво е този режим')) + '</h3>' +
        '<p class="cis-text">' + escapeHtml(text) + '</p>' +
      '</section>'
    );
  }

  function buildWhenUsed(catId) {
    var obj = tObjOrNull('categoryInfo.' + catId + '.whenUsed');
    if (!obj || typeof obj !== 'object') return '';
    var labels = {
      timeOfDay: t('categoryInfo.whenUsedLabels.timeOfDay', 'Час от деня'),
      context:   t('categoryInfo.whenUsedLabels.context',   'Контекст'),
      duration:  t('categoryInfo.whenUsedLabels.duration',  'Продължителност')
    };
    function row(key) {
      var v = obj[key];
      if (!v || (typeof v === 'string' && v.indexOf('TODO:') === 0)) v = placeholderText();
      return (
        '<div class="cis-pair-row">' +
          '<div class="cis-pair-label">' + escapeHtml(labels[key]) + '</div>' +
          '<div class="cis-pair-value">' + escapeHtml(v) + '</div>' +
        '</div>'
      );
    }
    return (
      '<section class="cis-section">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('whenUsed', 'Кога се ползва')) + '</h3>' +
        '<div class="cis-pair-list">' +
          row('timeOfDay') + row('context') + row('duration') +
        '</div>' +
      '</section>'
    );
  }

  function buildWhenNotUsed(catId) {
    var arr = tObjOrNull('categoryInfo.' + catId + '.whenNotUsed');
    if (!Array.isArray(arr) || !arr.length) {
      return (
        '<section class="cis-section">' +
          '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('whenNotUsed', 'Кога НЕ се ползва')) + '</h3>' +
          '<p class="cis-text cis-muted">' + escapeHtml(placeholderText()) + '</p>' +
        '</section>'
      );
    }
    var items = arr.map(function (line) {
      var clean = (line.indexOf('TODO:') === 0) ? placeholderText() : line;
      return '<li class="cis-bullet">' + escapeHtml(clean) + '</li>';
    }).join('');
    return (
      '<section class="cis-section cis-section--caution">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('whenNotUsed', 'Кога НЕ се ползва')) + '</h3>' +
        '<ul class="cis-bullets">' + items + '</ul>' +
      '</section>'
    );
  }

  function buildRecommendedNoise(catId) {
    var obj = tObjOrNull('categoryInfo.' + catId + '.recommendedNoise');
    if (!obj || typeof obj !== 'object') return '';
    var type = obj.type || '';
    var desc = obj.description || '';
    if (desc.indexOf('TODO:') === 0) desc = placeholderText();
    var label = noiseLabel(type);
    return (
      '<section class="cis-section">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('recommendedNoise', 'Препоръчителен фонов шум')) + '</h3>' +
        '<div class="cis-noise-card">' +
          '<div class="cis-noise-type">' + escapeHtml(label) + '</div>' +
          (type ? '<div class="cis-noise-id">' + escapeHtml(type) + '</div>' : '') +
          '<p class="cis-text">' + escapeHtml(desc) + '</p>' +
        '</div>' +
      '</section>'
    );
  }

  function buildMixRatio(catId) {
    var obj = tObjOrNull('categoryInfo.' + catId + '.mixRatio');
    if (!obj || typeof obj !== 'object') return '';
    var l1 = (typeof obj.layer1 === 'number') ? obj.layer1 : null;
    var l2 = (typeof obj.layer2 === 'number') ? obj.layer2 : null;
    if (l1 === null || l2 === null) return '';
    var reasoning = obj.reasoning || '';
    if (reasoning.indexOf('TODO:') === 0) reasoning = placeholderText();
    var labels = {
      l1: t('categoryInfo.mixRatioLabels.layer1', 'Layer 1 (главен звук)'),
      l2: t('categoryInfo.mixRatioLabels.layer2', 'Layer 2 (фон шум)')
    };
    return (
      '<section class="cis-section">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('mixRatio', 'Препоръчително съотношение')) + '</h3>' +
        '<div class="cis-ratio">' +
          '<div class="cis-ratio-row">' +
            '<div class="cis-ratio-label">' + escapeHtml(labels.l1) + '</div>' +
            '<div class="cis-ratio-value">' + l1 + '%</div>' +
          '</div>' +
          '<div class="cis-ratio-bar" aria-hidden="true">' +
            '<div class="cis-ratio-fill-l1" style="width:' + l1 + '%"></div>' +
          '</div>' +
          '<div class="cis-ratio-row">' +
            '<div class="cis-ratio-label">' + escapeHtml(labels.l2) + '</div>' +
            '<div class="cis-ratio-value">' + l2 + '%</div>' +
          '</div>' +
          '<div class="cis-ratio-bar" aria-hidden="true">' +
            '<div class="cis-ratio-fill-l2" style="width:' + l2 + '%"></div>' +
          '</div>' +
        '</div>' +
        '<p class="cis-text cis-text--reasoning">' + escapeHtml(reasoning) + '</p>' +
      '</section>'
    );
  }

  function buildExpectedEffect(catId) {
    var text = tOrNull('categoryInfo.' + catId + '.expectedEffect') || placeholderText();
    return (
      '<section class="cis-section">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('expectedEffect', 'Очакван ефект')) + '</h3>' +
        '<p class="cis-text">' + escapeHtml(text) + '</p>' +
      '</section>'
    );
  }

  function buildSafety(catId) {
    var arr = tObjOrNull('categoryInfo.' + catId + '.safety');
    if (!Array.isArray(arr) || !arr.length) return '';
    var items = arr.map(function (line) {
      var clean = (typeof line === 'string' && line.indexOf('TODO:') === 0) ? placeholderText() : line;
      return '<li class="cis-bullet cis-bullet--safety">' + escapeHtml(clean) + '</li>';
    }).join('');
    return (
      '<section class="cis-section">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('safety', 'Безопасност')) + '</h3>' +
        '<ul class="cis-bullets">' + items + '</ul>' +
      '</section>'
    );
  }

  function buildFaq(catId) {
    var arr = tObjOrNull('categoryInfo.' + catId + '.faq');
    if (!Array.isArray(arr) || !arr.length) return '';
    var items = arr.map(function (item, idx) {
      var q = item.q || '';
      var a = item.a || '';
      if (a.indexOf('TODO') === 0) a = placeholderText();
      return (
        '<details class="cis-faq-item">' +
          '<summary class="cis-faq-q">' +
            '<span class="cis-faq-q-text">' + escapeHtml(q) + '</span>' +
            '<span class="cis-faq-chev" aria-hidden="true">' + svgChevron() + '</span>' +
          '</summary>' +
          '<div class="cis-faq-a">' + escapeHtml(a) + '</div>' +
        '</details>'
      );
    }).join('');
    return (
      '<section class="cis-section">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('faq', 'Чести въпроси')) + '</h3>' +
        '<div class="cis-faq-list">' + items + '</div>' +
      '</section>'
    );
  }

  function buildScientificBasis(catId) {
    var arr = tObjOrNull('categoryInfo.' + catId + '.scientificBasis');
    if (!Array.isArray(arr) || !arr.length) return '';
    var items = arr.map(function (line) {
      var clean = (typeof line === 'string' && line.indexOf('TODO') === 0) ? placeholderText() : line;
      return '<li class="cis-citation">' + escapeHtml(clean) + '</li>';
    }).join('');
    return (
      '<section class="cis-section cis-section--science">' +
        '<h3 class="cis-section-title">' + escapeHtml(sectionTitle('scientificBasis', 'Научна основа')) + '</h3>' +
        '<ul class="cis-citations">' + items + '</ul>' +
      '</section>'
    );
  }

  function buildPreviewCta(catId) {
    var label = t('categoryInfo.previewCta', 'Опитайте сега');
    return (
      '<button class="cis-preview-cta" type="button" data-action="preview"' +
        ' data-cat-id="' + escapeHtml(catId) + '">' +
        '<span class="cis-preview-icon" aria-hidden="true">' + svgPlay() + '</span>' +
        '<span class="cis-preview-text">' + escapeHtml(label) + '</span>' +
      '</button>'
    );
  }

  // ============================================================
  // Compose sheet content
  // ============================================================

  function buildContent(catId) {
    var root = document.createElement('div');
    root.className = 'cis-content';
    root.innerHTML =
      buildDefinition(catId) +
      buildWhenUsed(catId) +
      buildWhenNotUsed(catId) +
      buildRecommendedNoise(catId) +
      buildMixRatio(catId) +
      buildExpectedEffect(catId) +
      buildSafety(catId) +
      buildFaq(catId) +
      buildScientificBasis(catId) +
      buildPreviewCta(catId);

    // Wire preview CTA
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action="preview"]');
      if (!btn) return;
      e.stopPropagation();
      var id = btn.getAttribute('data-cat-id');
      onPreview(id);
    });

    return root;
  }

  // ============================================================
  // Preview action
  // ============================================================

  function onPreview(catId) {
    // 1. Set flag за CategoryView да autoplay-не първия sound
    try { localStorage.setItem(STORAGE_AUTOPLAY, catId); } catch (e) { /* ignore */ }
    // 2. Close sheet
    close();
    // 3. Open CategoryView (или fallback Home)
    setTimeout(function () {
      if (window.CategoryView && window.CategoryView.open) {
        window.CategoryView.open(catId);
      } else if (window.Home && window.Home.render) {
        window.Home.render();
      }
    }, 50);
  }

  // ============================================================
  // Fallback overlay (ако BottomSheet не е зареден)
  // ============================================================

  function buildFallbackOverlay(title, contentEl) {
    var overlay = document.createElement('div');
    overlay.className = 'cis-fallback-overlay';
    var sheet = document.createElement('div');
    sheet.className = 'cis-fallback-sheet';
    sheet.innerHTML =
      '<header class="cis-fallback-header">' +
        '<h2 class="cis-fallback-title">' + escapeHtml(title) + '</h2>' +
        '<button class="cis-fallback-close" type="button" data-action="close"' +
          ' aria-label="' + escapeHtml(t('categoryInfo.closeAria', 'Затвори')) + '">×</button>' +
      '</header>' +
      '<div class="cis-fallback-body"></div>';
    sheet.querySelector('.cis-fallback-body').appendChild(contentEl);
    overlay.appendChild(sheet);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.getAttribute('data-action') === 'close') {
        close();
      }
    });
    return overlay;
  }

  // ============================================================
  // Public API
  // ============================================================

  function open(catId) {
    if (!catId) return;
    if (openHandle) close(); // Single instance

    var title = tOrNull('categoryInfo.' + catId + '.title') ||
                tOrNull('home.cat.' + catId + '.name') ||
                catId;

    var content = buildContent(catId);

    if (window.BottomSheet && window.BottomSheet.open) {
      openHandle = window.BottomSheet.open({
        title: title,
        content: content,
        height: '85vh',
        showGrip: true,
        closeOnBackdrop: true,
        onClose: function () { openHandle = null; }
      });
      return;
    }

    // Fallback: custom overlay
    var overlay = buildFallbackOverlay(title, content);
    document.body.appendChild(overlay);
    openHandle = { _fallback: overlay };
    document.body.classList.add('cis-locked');
  }

  function close() {
    if (!openHandle) return;
    if (openHandle.close && typeof openHandle.close === 'function') {
      openHandle.close();
    } else if (openHandle._fallback) {
      var ov = openHandle._fallback;
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      document.body.classList.remove('cis-locked');
    }
    openHandle = null;
  }

  // ============================================================
  // CategoryView autoplay flag — consumed once
  // ============================================================

  function consumeAutoplayFlag() {
    try {
      var v = localStorage.getItem(STORAGE_AUTOPLAY);
      if (v) {
        localStorage.removeItem(STORAGE_AUTOPLAY);
        return v;
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  return {
    open: open,
    close: close,
    consumeAutoplayFlag: consumeAutoplayFlag
  };
})();
