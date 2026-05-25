/**
 * AURALIS SearchInput — reusable search field (Task U)
 * ======================================================
 * Debounced input (200ms), clear button, ESC clears,
 * Cyrillic-aware. Used by Library, Home, CategoryView.
 *
 * Public API:
 *   SearchInput.create(opts)  → HTMLElement
 *
 * opts:
 *   placeholder:  'Търсете звук...'
 *   onInput:      (query) => {}    — debounced 200ms
 *   onClear:      () => {}
 *   initialValue: ''
 */

window.SearchInput = (function () {
  'use strict';

  var DEBOUNCE_MS = 200;

  function create(opts) {
    opts = opts || {};
    var placeholder = opts.placeholder || t('components.search.placeholder', 'Търсете...');
    var initialValue = opts.initialValue || '';

    var wrap = document.createElement('div');
    wrap.className = 'si-wrap';

    // Magnifier icon
    var iconLeft = document.createElement('span');
    iconLeft.className = 'si-icon-left';
    iconLeft.setAttribute('aria-hidden', 'true');
    iconLeft.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
        ' stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="11" cy="11" r="8"/>' +
        '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
      '</svg>';
    wrap.appendChild(iconLeft);

    // Input
    var input = document.createElement('input');
    input.className = 'si-input';
    input.type = 'search';
    input.placeholder = placeholder;
    input.value = initialValue;
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('aria-label', placeholder);
    wrap.appendChild(input);

    // Clear button
    var clearBtn = document.createElement('button');
    clearBtn.className = 'si-clear';
    clearBtn.type = 'button';
    clearBtn.setAttribute('aria-label', t('components.search.clear', 'Изчисти'));
    clearBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
        ' stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
    if (!initialValue) clearBtn.style.display = 'none';
    wrap.appendChild(clearBtn);

    // Debounce timer
    var debounceId = null;

    function emitInput(val) {
      if (opts.onInput) opts.onInput(val);
    }

    function updateClearVisibility() {
      clearBtn.style.display = input.value.length > 0 ? '' : 'none';
    }

    // Events
    input.addEventListener('input', function () {
      updateClearVisibility();
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(function () {
        emitInput(input.value.trim());
      }, DEBOUNCE_MS);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (input.value) {
          input.value = '';
          updateClearVisibility();
          emitInput('');
          if (opts.onClear) opts.onClear();
        } else {
          input.blur();
        }
      }
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      updateClearVisibility();
      emitInput('');
      if (opts.onClear) opts.onClear();
      input.focus();
    });

    // Public methods on element
    wrap.getValue = function () { return input.value; };
    wrap.setValue = function (v) {
      input.value = v || '';
      updateClearVisibility();
    };
    wrap.focus = function () { input.focus(); };

    return wrap;
  }

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  return {
    create: create
  };
})();
