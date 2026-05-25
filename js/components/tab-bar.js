/**
 * AURALIS TabBar — reusable tab bar component (Task LL)
 * ========================================================
 * Glass underlay, champagne active accent, count pills, swipeable.
 *
 * Public API:
 *   TabBar.create(opts) → HTMLElement
 *
 * opts:
 *   tabs:     [{ id, label, count? }]
 *   activeId: string
 *   onChange: (tabId) => {}
 */

window.TabBar = (function () {
  'use strict';

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function create(opts) {
    opts = opts || {};
    var tabs = opts.tabs || [];
    var activeId = opts.activeId || (tabs[0] && tabs[0].id);

    var el = document.createElement('div');
    el.className = 'tb';
    el.setAttribute('role', 'tablist');

    tabs.forEach(function (tab) {
      var btn = document.createElement('button');
      btn.className = 'tb-tab' + (tab.id === activeId ? ' is-active' : '');
      btn.type = 'button';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', tab.id === activeId ? 'true' : 'false');
      btn.setAttribute('data-tab-id', tab.id);

      var label = '<span class="tb-label">' + escapeHtml(tab.label) + '</span>';
      var count = (tab.count != null)
        ? '<span class="tb-count">' + tab.count + '</span>'
        : '';
      btn.innerHTML = label + count;

      btn.addEventListener('click', function () {
        // Update active states
        var allTabs = el.querySelectorAll('.tb-tab');
        for (var i = 0; i < allTabs.length; i++) {
          allTabs[i].classList.remove('is-active');
          allTabs[i].setAttribute('aria-selected', 'false');
        }
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        activeId = tab.id;
        if (opts.onChange) opts.onChange(tab.id);
      });

      el.appendChild(btn);
    });

    // Public method to update active
    el.setActive = function (tabId) {
      var allTabs = el.querySelectorAll('.tb-tab');
      for (var i = 0; i < allTabs.length; i++) {
        var id = allTabs[i].getAttribute('data-tab-id');
        allTabs[i].classList.toggle('is-active', id === tabId);
        allTabs[i].setAttribute('aria-selected', id === tabId ? 'true' : 'false');
      }
    };

    // Update counts
    el.updateCount = function (tabId, newCount) {
      var tab = el.querySelector('[data-tab-id="' + tabId + '"] .tb-count');
      if (tab) tab.textContent = newCount;
    };

    return el;
  }

  return { create: create };
})();
