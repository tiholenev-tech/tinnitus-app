/**
 * AURALIS BottomSheet — reusable bottom sheet framework (Task T)
 * ================================================================
 * Slide-up sheet with backdrop, swipe-down close, ESC close,
 * focus trap, stack management. Used by: NoisePicker, Settings, Sleep timer.
 *
 * Public API:
 *   BottomSheet.open(opts)   → handle { close(), update(content) }
 *   BottomSheet.closeAll()   → closes all open sheets
 *
 * opts:
 *   title:    string          — header title
 *   content:  HTMLElement|string — body
 *   actions:  [{label, onClick, variant: 'primary'|'secondary'|'danger'}]
 *   height:   'auto' | '50vh' | '80vh'  (default 'auto')
 *   onClose:  () => {}
 *   closeOnBackdrop: true     (default true)
 *   showGrip: true            (default true)
 */

window.BottomSheet = (function () {
  'use strict';

  // ============================================================
  // STATE
  // ============================================================

  var stack = []; // array of { overlay, sheet, opts, handle }
  var globalEscBound = false;

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ============================================================
  // Focus trap
  // ============================================================

  function getFocusable(container) {
    return container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  function trapFocus(e, container) {
    if (e.key !== 'Tab') return;
    var focusable = getFocusable(container);
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // ============================================================
  // Swipe detection
  // ============================================================

  function bindSwipe(sheet, closeFn) {
    var startY = 0;
    var currentY = 0;
    var swiping = false;

    sheet.addEventListener('touchstart', function (e) {
      var grip = sheet.querySelector('.bs-grip');
      var header = sheet.querySelector('.bs-header');
      var target = e.target;
      if (target === grip || target === header || (grip && grip.contains(target)) ||
          (header && header.contains(target))) {
        startY = e.touches[0].clientY;
        currentY = startY;
        swiping = true;
      }
    }, { passive: true });

    sheet.addEventListener('touchmove', function (e) {
      if (!swiping) return;
      currentY = e.touches[0].clientY;
      var diff = currentY - startY;
      if (diff > 0) {
        sheet.style.transform = 'translateY(' + diff + 'px)';
      }
    }, { passive: true });

    sheet.addEventListener('touchend', function () {
      if (!swiping) return;
      swiping = false;
      var diff = currentY - startY;
      if (diff > 100) {
        closeFn();
      } else {
        sheet.style.transform = '';
      }
    });
  }

  // ============================================================
  // Build DOM
  // ============================================================

  function buildSheet(opts) {
    var overlay = document.createElement('div');
    overlay.className = 'bs-overlay';
    overlay.style.zIndex = String(220 + stack.length);

    var sheet = document.createElement('div');
    sheet.className = 'bs-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    if (opts.title) {
      sheet.setAttribute('aria-label', opts.title);
    }
    if (opts.height && opts.height !== 'auto') {
      sheet.style.maxHeight = opts.height;
    }

    // Grip
    if (opts.showGrip !== false) {
      var grip = document.createElement('div');
      grip.className = 'bs-grip';
      grip.setAttribute('aria-hidden', 'true');
      sheet.appendChild(grip);
    }

    // Header
    if (opts.title) {
      var header = document.createElement('div');
      header.className = 'bs-header';

      var title = document.createElement('h2');
      title.className = 'bs-title';
      title.textContent = opts.title;
      header.appendChild(title);

      var closeBtn = document.createElement('button');
      closeBtn.className = 'bs-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', t('components.bottomSheet.close', 'Затвори'));
      closeBtn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"' +
          ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      header.appendChild(closeBtn);

      sheet.appendChild(header);
    }

    // Content
    var contentWrap = document.createElement('div');
    contentWrap.className = 'bs-content';
    if (typeof opts.content === 'string') {
      contentWrap.innerHTML = opts.content;
    } else if (opts.content instanceof HTMLElement) {
      contentWrap.appendChild(opts.content);
    }
    sheet.appendChild(contentWrap);

    // Actions
    if (opts.actions && opts.actions.length) {
      var footer = document.createElement('div');
      footer.className = 'bs-footer';
      opts.actions.forEach(function (action) {
        var btn = document.createElement('button');
        btn.className = 'bs-action bs-action--' + (action.variant || 'primary');
        btn.type = 'button';
        btn.textContent = action.label;
        if (action.onClick) {
          btn.addEventListener('click', action.onClick);
        }
        footer.appendChild(btn);
      });
      sheet.appendChild(footer);
    }

    overlay.appendChild(sheet);
    return { overlay: overlay, sheet: sheet, contentWrap: contentWrap };
  }

  // ============================================================
  // Open / Close
  // ============================================================

  function open(opts) {
    opts = opts || {};
    var parts = buildSheet(opts);
    var overlay = parts.overlay;
    var sheet = parts.sheet;
    var contentWrap = parts.contentWrap;

    var entry = { overlay: overlay, sheet: sheet, opts: opts, handle: null };

    function closeSelf() {
      closeEntry(entry);
    }

    var handle = {
      close: closeSelf,
      update: function (newContent) {
        contentWrap.innerHTML = '';
        if (typeof newContent === 'string') {
          contentWrap.innerHTML = newContent;
        } else if (newContent instanceof HTMLElement) {
          contentWrap.appendChild(newContent);
        }
      }
    };
    entry.handle = handle;

    // Backdrop click
    if (opts.closeOnBackdrop !== false) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeSelf();
      });
    }

    // Close button
    var closeBtn = sheet.querySelector('.bs-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeSelf);
    }

    // Focus trap
    sheet.addEventListener('keydown', function (e) {
      trapFocus(e, sheet);
    });

    // Swipe down
    bindSwipe(sheet, closeSelf);

    // Add to DOM + stack
    document.body.appendChild(overlay);
    stack.push(entry);

    // Animate in
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
    });

    // Global ESC
    if (!globalEscBound) {
      window.addEventListener('keydown', onGlobalKey);
      globalEscBound = true;
    }

    // Auto-focus first focusable
    setTimeout(function () {
      var focusable = getFocusable(sheet);
      if (focusable.length > 0) focusable[0].focus();
    }, 50);

    return handle;
  }

  function closeEntry(entry) {
    if (!entry || !entry.overlay) return;
    var overlay = entry.overlay;
    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);

    var idx = stack.indexOf(entry);
    if (idx !== -1) stack.splice(idx, 1);

    if (entry.opts && entry.opts.onClose) {
      try { entry.opts.onClose(); } catch (e) { /* ignore */ }
    }

    if (stack.length === 0 && globalEscBound) {
      window.removeEventListener('keydown', onGlobalKey);
      globalEscBound = false;
    }
  }

  function closeAll() {
    var copy = stack.slice();
    copy.forEach(closeEntry);
  }

  function onGlobalKey(e) {
    if (e.key === 'Escape' && stack.length > 0) {
      e.preventDefault();
      closeEntry(stack[stack.length - 1]);
    }
  }

  return {
    open: open,
    closeAll: closeAll
  };
})();
