/**
 * AURALIS FAQ — често задавани въпроси (Wave 3.2)
 * ===========================================================================
 * Fullscreen bottom-sheet overlay launched from Settings.
 * 20 въпроса в 4 категории (safety/technical/therapeutic/program).
 *
 * Content: i18n/bg.json → 'faq' (title, categories, items, support).
 *
 * UI:
 *   - Search field (filter по q + a substring)
 *   - 4 category groups, всеки въпрос — accordion (button toggles aria-expanded)
 *   - Footer: support email link (mailto:)
 *
 * Public API:
 *   FAQ.open()   — open overlay
 *   FAQ.close()  — close overlay
 *   FAQ.toggle() — toggle
 */

window.FAQ = (function () {
  'use strict';

  var overlay = null;
  var escHandlerBound = false;
  var expandedSet = {}; // index → boolean
  var searchTerm = '';
  var CATEGORY_ORDER = ['safety', 'technical', 'therapeutic', 'program'];

  function el(id) { return document.getElementById(id); }

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  function tArr(key) {
    if (window.i18n && window.i18n.tArr) return window.i18n.tArr(key);
    return [];
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escapeAttr(s) { return escapeHtml(s); }

  function svgClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/></svg>';
  }

  function svgChevron() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polyline points="6 9 12 15 18 9"/></svg>';
  }

  // ============================================================
  // Data
  // ============================================================

  function getItems() {
    var items = tArr('faq.items');
    if (!Array.isArray(items)) return [];
    return items.map(function (it, idx) {
      return {
        idx: idx,
        cat: it.cat || 'general',
        q: it.q || '',
        a: it.a || ''
      };
    });
  }

  function filterItems(items, term) {
    if (!term) return items;
    var needle = term.toLowerCase().trim();
    if (!needle) return items;
    return items.filter(function (it) {
      return (it.q + ' ' + it.a).toLowerCase().indexOf(needle) !== -1;
    });
  }

  function groupByCategory(items) {
    var groups = {};
    items.forEach(function (it) {
      if (!groups[it.cat]) groups[it.cat] = [];
      groups[it.cat].push(it);
    });
    return groups;
  }

  // ============================================================
  // HTML
  // ============================================================

  function buildItemHtml(it) {
    var isOpen = !!expandedSet[it.idx];
    return (
      '<div class="faq-item' + (isOpen ? ' is-open' : '') + '">' +
        '<button class="faq-q" type="button" data-action="toggle-item"' +
          ' data-idx="' + it.idx + '"' +
          ' aria-expanded="' + (isOpen ? 'true' : 'false') + '">' +
          '<span class="faq-q-text">' + escapeHtml(it.q) + '</span>' +
          '<span class="faq-q-chevron" aria-hidden="true">' + svgChevron() + '</span>' +
        '</button>' +
        (isOpen
          ? '<div class="faq-a" role="region">' +
              '<p class="faq-a-text">' + escapeHtml(it.a) + '</p>' +
            '</div>'
          : '') +
      '</div>'
    );
  }

  function buildCategoryHtml(catId, items) {
    if (!items || !items.length) return '';
    var catName = t('faq.categories.' + catId, catId);
    return (
      '<section class="faq-category">' +
        '<h3 class="faq-category-title">' + escapeHtml(catName) + '</h3>' +
        '<div class="faq-list">' +
          items.map(buildItemHtml).join('') +
        '</div>' +
      '</section>'
    );
  }

  function buildBodyHtml() {
    var all = getItems();
    var filtered = filterItems(all, searchTerm);

    if (filtered.length === 0) {
      return '<div class="faq-empty">' +
        escapeHtml(t('faq.noResults', 'Няма намерени въпроси по тази дума.')) +
        '</div>';
    }

    var groups = groupByCategory(filtered);
    return CATEGORY_ORDER.map(function (catId) {
      return buildCategoryHtml(catId, groups[catId]);
    }).join('');
  }

  function buildHtml() {
    var title       = t('faq.title', 'Често задавани въпроси');
    var closeAria   = t('faq.closeAria', 'Затвори въпроси и отговори');
    var searchPh    = t('faq.searchPlaceholder', 'Търси въпрос…');
    var searchAria  = t('faq.searchAria', 'Търси въпрос');
    var supportHint = t('faq.supportHint', 'Не намерихте отговор? Свържете се с support чрез email.');
    var supportBtn  = t('faq.supportButton', 'Свържи се със support');
    var supportEmail = t('faq.supportEmail', 'support@auralis.app');
    var supportSubj  = t('faq.supportSubject', 'AURALIS въпрос');
    var mailto = 'mailto:' + supportEmail + '?subject=' + encodeURIComponent(supportSubj);

    return (
      '<div class="faq-sheet" role="dialog" aria-modal="true"' +
        ' aria-label="' + escapeAttr(title) + '">' +
        '<div class="faq-header">' +
          '<h2 class="faq-title">' + escapeHtml(title) + '</h2>' +
          '<button class="faq-close" type="button" data-action="close"' +
            ' aria-label="' + escapeAttr(closeAria) + '">' + svgClose() + '</button>' +
        '</div>' +
        '<div class="faq-search-row">' +
          '<input type="search" class="faq-search-input" id="faqSearch"' +
            ' placeholder="' + escapeAttr(searchPh) + '"' +
            ' aria-label="' + escapeAttr(searchAria) + '"' +
            ' value="' + escapeAttr(searchTerm) + '">' +
        '</div>' +
        '<div class="faq-body" id="faqBody">' +
          buildBodyHtml() +
        '</div>' +
        '<div class="faq-footer">' +
          '<p class="faq-support-hint">' + escapeHtml(supportHint) + '</p>' +
          '<a class="faq-support-link" href="' + mailto + '">' +
            escapeHtml(supportBtn) +
          '</a>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // Interactions
  // ============================================================

  function rebuildBodyOnly() {
    var body = el('faqBody');
    if (body) body.innerHTML = buildBodyHtml();
  }

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'close') {
      close();
    } else if (action === 'toggle-item') {
      var idx = parseInt(btn.getAttribute('data-idx'), 10);
      if (isNaN(idx)) return;
      expandedSet[idx] = !expandedSet[idx];
      rebuildBodyOnly();
    }
  }

  function onOverlayClick(e) {
    if (e.target === overlay) close();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') close();
  }

  function onSearchInput(e) {
    if (e.target.id !== 'faqSearch') return;
    searchTerm = e.target.value || '';
    rebuildBodyOnly();
  }

  // ============================================================
  // Open / close
  // ============================================================

  function open() {
    if (overlay) return; // already open
    expandedSet = {};
    searchTerm = '';

    overlay = document.createElement('div');
    overlay.className = 'faq-overlay';
    overlay.innerHTML = buildHtml();
    document.body.appendChild(overlay);

    overlay.addEventListener('click', onClick);
    overlay.addEventListener('click', onOverlayClick);
    overlay.addEventListener('input', onSearchInput);

    if (!escHandlerBound) {
      document.addEventListener('keydown', onKeyDown);
      escHandlerBound = true;
    }

    // Focus search field for quick filter
    setTimeout(function () {
      var s = el('faqSearch');
      if (s) s.focus();
    }, 50);
  }

  function close() {
    if (!overlay) return;
    overlay.parentNode && overlay.parentNode.removeChild(overlay);
    overlay = null;
    if (escHandlerBound) {
      document.removeEventListener('keydown', onKeyDown);
      escHandlerBound = false;
    }
  }

  function toggle() {
    if (overlay) close();
    else open();
  }

  return {
    open: open,
    close: close,
    toggle: toggle
  };
})();
