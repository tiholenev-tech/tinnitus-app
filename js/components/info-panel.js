/**
 * AURALIS InfoPanel — reusable component
 * ========================================
 * Per BIBLE v3.1 §O: общ component за информация + FAQ + citations.
 * Ползва се на разни места: card expand, NoisePicker info, About section.
 *
 * API:
 *   InfoPanel.create({
 *     title:     "За какво е",         // optional
 *     body:      "Markdown текст...",   // optional, supports **bold** *italic* [text](url) lists
 *     expandable: true,                 // optional — body става "Прочети повече" expand
 *     citations: [{label, url}],        // optional — footer references
 *     faq:       [{q, a}],              // optional — accordion (one open)
 *     compact:   false,                 // optional — намалена padding (за nested use)
 *     icon:      'info'                 // optional — header icon ('info' | 'book' | 'sound')
 *   })
 *   → returns HTMLElement (caller appendChild-ва някъде).
 *
 * Не open/close API — компонентът е чисто рендер. State (expand/collapse,
 * FAQ accordion) живее в DOM-а на върнатия element.
 */

window.InfoPanel = (function () {
  'use strict';

  // ============================================================
  // i18n + helpers
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

  // ============================================================
  // Markdown parser (basic — за beta)
  // Supports: **bold**, *italic*, [text](url), \n\n → paragraphs,
  //           - item лист на нови редове, single \n → <br>
  // Всичко друго е escape-нато за XSS защита.
  // ============================================================

  function parseInlineMarkdown(text) {
    var out = escapeHtml(text);
    // Links [text](url) — restrict to http(s)/mailto за security
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g,
      function (_, label, url) {
        return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(label) + '</a>';
      });
    // **bold**
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // *italic* (avoid matching inside word boundaries — basic check)
    out = out.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    return out;
  }

  function parseMarkdown(text) {
    if (!text) return '';
    var blocks = String(text).split(/\n\s*\n/); // empty line = paragraph break
    return blocks.map(function (block) {
      block = block.trim();
      if (!block) return '';
      // List detection: блокът започва с "- " на ПЪРВИЯ ред
      var lines = block.split('\n');
      var allListItems = lines.every(function (ln) { return /^\s*-\s+/.test(ln); });
      if (allListItems && lines.length > 0) {
        var items = lines.map(function (ln) {
          return '<li>' + parseInlineMarkdown(ln.replace(/^\s*-\s+/, '')) + '</li>';
        }).join('');
        return '<ul class="ip-list">' + items + '</ul>';
      }
      // Paragraph с single \n → <br>
      return '<p>' + parseInlineMarkdown(block).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  // ============================================================
  // SVG icons
  // ============================================================

  var ICONS = {
    info:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="10"/>' +
        '<line x1="12" y1="16" x2="12" y2="12"/>' +
        '<line x1="12" y1="8" x2="12.01" y2="8"/>' +
      '</svg>',
    book:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
        '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>' +
      '</svg>',
    sound:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none"/>' +
        '<path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>' +
        '<path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>' +
      '</svg>',
    chevron:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<polyline points="6 9 12 15 18 9"/>' +
      '</svg>'
  };

  // ============================================================
  // HTML builders
  // ============================================================

  function buildHeader(title, iconKey) {
    if (!title) return '';
    var iconHtml = (iconKey && ICONS[iconKey])
      ? '<span class="ip-header-icon" aria-hidden="true">' + ICONS[iconKey] + '</span>'
      : '';
    return (
      '<div class="ip-header">' +
        iconHtml +
        '<h3 class="ip-title">' + escapeHtml(title) + '</h3>' +
      '</div>'
    );
  }

  function buildBody(body, expandable) {
    if (!body) return '';
    var html = parseMarkdown(body);
    if (!expandable) {
      return '<div class="ip-body">' + html + '</div>';
    }
    return (
      '<div class="ip-body ip-body--collapsible" data-collapsed="true">' +
        '<div class="ip-body-content">' + html + '</div>' +
      '</div>' +
      '<button class="ip-expand-toggle" type="button" data-action="ip-toggle"' +
        ' aria-expanded="false">' +
        '<span class="ip-expand-text">' +
          escapeHtml(t('components.infoPanel.readMore', 'Прочети повече')) +
        '</span>' +
        '<span class="ip-expand-icon" aria-hidden="true">' + ICONS.chevron + '</span>' +
      '</button>'
    );
  }

  function buildCitations(citations) {
    if (!citations || !citations.length) return '';
    var label = t('components.infoPanel.citationsLabel', 'Източници');
    var items = citations.map(function (c) {
      if (!c || !c.label) return '';
      if (c.url) {
        return '<li><a class="ip-citation-link" href="' + escapeHtml(c.url) +
          '" target="_blank" rel="noopener noreferrer">' + escapeHtml(c.label) + '</a></li>';
      }
      return '<li><span class="ip-citation-text">' + escapeHtml(c.label) + '</span></li>';
    }).join('');
    if (!items) return '';
    return (
      '<div class="ip-citations">' +
        '<div class="ip-citations-label">' + escapeHtml(label) + '</div>' +
        '<ul class="ip-citations-list">' + items + '</ul>' +
      '</div>'
    );
  }

  function buildFaq(faq) {
    if (!faq || !faq.length) return '';
    var label = t('components.infoPanel.faqLabel', 'Често задавани въпроси');
    var items = faq.map(function (item, idx) {
      if (!item || !item.q || !item.a) return '';
      var qHtml = parseInlineMarkdown(item.q);
      var aHtml = parseMarkdown(item.a);
      return (
        '<li class="ip-faq-item" data-faq-idx="' + idx + '">' +
          '<button class="ip-faq-q" type="button" data-action="ip-faq-toggle"' +
            ' aria-expanded="false"' +
            ' aria-label="' + escapeHtml(t('components.infoPanel.expandQuestionAria',
              'Покажи отговора на: ' + item.q, { question: item.q })) + '">' +
            '<span class="ip-faq-q-text">' + qHtml + '</span>' +
            '<span class="ip-faq-icon" aria-hidden="true">' + ICONS.chevron + '</span>' +
          '</button>' +
          '<div class="ip-faq-a" hidden>' + aHtml + '</div>' +
        '</li>'
      );
    }).join('');
    if (!items) return '';
    return (
      '<div class="ip-faq">' +
        '<div class="ip-faq-label">' + escapeHtml(label) + '</div>' +
        '<ul class="ip-faq-list">' + items + '</ul>' +
      '</div>'
    );
  }

  // ============================================================
  // Interactions (delegated на root element)
  // ============================================================

  function bindEvents(root) {
    root.addEventListener('click', function (e) {
      var actionBtn = e.target.closest('[data-action]');
      if (!actionBtn || !root.contains(actionBtn)) return;
      var action = actionBtn.getAttribute('data-action');
      if (action === 'ip-toggle') {
        toggleExpand(root, actionBtn);
      } else if (action === 'ip-faq-toggle') {
        toggleFaqItem(root, actionBtn);
      }
    });
  }

  function toggleExpand(root, btn) {
    var body = root.querySelector('.ip-body--collapsible');
    if (!body) return;
    var collapsed = body.getAttribute('data-collapsed') === 'true';
    body.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
    btn.setAttribute('aria-expanded', collapsed ? 'true' : 'false');
    var textEl = btn.querySelector('.ip-expand-text');
    if (textEl) {
      textEl.textContent = collapsed
        ? t('components.infoPanel.readLess', 'Покажи по-малко')
        : t('components.infoPanel.readMore', 'Прочети повече');
    }
  }

  function toggleFaqItem(root, btn) {
    var item = btn.closest('.ip-faq-item');
    if (!item) return;
    var answer = item.querySelector('.ip-faq-a');
    var willOpen = answer && answer.hasAttribute('hidden');

    // Close all FAQ items (single-open accordion)
    var items = root.querySelectorAll('.ip-faq-item');
    for (var i = 0; i < items.length; i++) {
      var a = items[i].querySelector('.ip-faq-a');
      var b = items[i].querySelector('[data-action="ip-faq-toggle"]');
      if (a) a.setAttribute('hidden', '');
      if (b) {
        b.setAttribute('aria-expanded', 'false');
        items[i].classList.remove('is-open');
      }
    }

    if (willOpen) {
      answer.removeAttribute('hidden');
      btn.setAttribute('aria-expanded', 'true');
      item.classList.add('is-open');
    }
  }

  // ============================================================
  // Public API
  // ============================================================

  function create(opts) {
    opts = opts || {};
    var root = document.createElement('div');
    root.className = 'info-panel' + (opts.compact ? ' info-panel--compact' : '');
    root.innerHTML =
      buildHeader(opts.title, opts.icon) +
      buildBody(opts.body, !!opts.expandable) +
      buildFaq(opts.faq) +
      buildCitations(opts.citations);
    bindEvents(root);
    return root;
  }

  return {
    create: create,
    // Exposed за edge cases / tests:
    _parseMarkdown: parseMarkdown
  };
})();
