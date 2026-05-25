/**
 * AURALIS a11y — accessibility + keyboard shortcuts (Task V)
 * ============================================================
 * Global keyboard shortcuts, skip-to-content link, focus-visible
 * management, reduced-motion detection, live region management.
 *
 * Shortcuts:
 *   ESC       — close top modal (BottomSheet, SOS, Player)
 *   Space     — play/pause (when not in input field)
 *   ↑↓        — navigate cards (when focus on card)
 *   Enter     — activate focused element
 *   ?         — show keyboard help sheet
 *
 * Public API:
 *   A11y.init()             — call once at app boot
 *   A11y.showShortcuts()    — opens help bottom sheet
 *   A11y.announce(msg)      — announce via live region
 *   A11y.prefersReducedMotion() — boolean
 */

window.A11y = (function () {
  'use strict';

  var liveRegion = null;
  var initialized = false;

  // ============================================================
  // i18n helper
  // ============================================================

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  // ============================================================
  // Skip-to-content link
  // ============================================================

  function createSkipLink() {
    var link = document.createElement('a');
    link.className = 'a11y-skip';
    link.href = '#app';
    link.textContent = t('a11y.skipToContent', 'Прескочи към основно съдържание');
    document.body.insertBefore(link, document.body.firstChild);
  }

  // ============================================================
  // Live region for announcements
  // ============================================================

  function createLiveRegion() {
    liveRegion = document.createElement('div');
    liveRegion.className = 'a11y-live';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    document.body.appendChild(liveRegion);
  }

  function announce(message) {
    if (!liveRegion) createLiveRegion();
    liveRegion.textContent = '';
    // Delay for screen reader to notice change
    setTimeout(function () {
      liveRegion.textContent = message;
    }, 50);
  }

  // ============================================================
  // Reduced motion
  // ============================================================

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ============================================================
  // Global keyboard handler
  // ============================================================

  function onKeyDown(e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var isInput = tag === 'input' || tag === 'textarea' || tag === 'select' ||
                  e.target.isContentEditable;

    // ? → show shortcuts
    if (e.key === '?' && !isInput && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      showShortcuts();
      return;
    }

    // ESC → close top modal (BottomSheet handles its own, but also SOS/Player)
    if (e.key === 'Escape') {
      // BottomSheet has its own ESC handler, so skip if open
      if (window.BottomSheet && document.querySelector('.bs-overlay.is-open')) return;
      // Close SOS if open
      if (window.SOS && document.querySelector('[data-screen="sos"]')) {
        window.SOS.close();
        return;
      }
      // Close Player if open
      if (window.Player && document.querySelector('.pl-screen')) {
        window.Player.close();
        return;
      }
    }

    // Space → play/pause (not in inputs)
    if (e.key === ' ' && !isInput) {
      e.preventDefault();
      if (window.AudioEngine) {
        if (window.AudioEngine.isPlaying()) {
          window.AudioEngine.pause();
          announce(t('a11y.paused', 'Пауза'));
        } else if (window.AudioEngine.getActivePreset && window.AudioEngine.getActivePreset()) {
          window.AudioEngine.play(window.AudioEngine.getActivePreset());
          announce(t('a11y.playing', 'Пускане'));
        }
      }
      return;
    }

    // Arrow keys for card navigation
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isInput) {
      var focused = document.activeElement;
      if (!focused) return;
      var card = focused.closest('[role="listitem"], .card, .lib-card, .mix-card');
      if (!card) return;
      e.preventDefault();
      var parent = card.parentElement;
      if (!parent) return;
      var cards = Array.prototype.slice.call(
        parent.querySelectorAll('[role="listitem"], .card, .lib-card, .mix-card')
      );
      var idx = cards.indexOf(card);
      if (idx === -1) return;
      var next = e.key === 'ArrowDown' ? idx + 1 : idx - 1;
      if (next >= 0 && next < cards.length) {
        var target = cards[next];
        var focusable = target.querySelector('button, [tabindex]') || target;
        focusable.focus();
      }
    }
  }

  // ============================================================
  // Shortcuts help
  // ============================================================

  function showShortcuts() {
    if (!window.BottomSheet) return;

    var shortcuts = [
      { key: 'ESC', desc: t('a11y.help.esc', 'Затвори модал') },
      { key: t('a11y.help.spaceKey', 'Интервал'), desc: t('a11y.help.space', 'Пусни / Пауза') },
      { key: '↑ / ↓', desc: t('a11y.help.arrows', 'Навигация между карти') },
      { key: 'Enter', desc: t('a11y.help.enter', 'Активирай фокусиран елемент') },
      { key: '?', desc: t('a11y.help.question', 'Покажи тази помощ') }
    ];

    var content = document.createElement('div');
    content.className = 'a11y-shortcuts';

    var list = document.createElement('dl');
    list.className = 'a11y-shortcuts-list';
    shortcuts.forEach(function (s) {
      var dt = document.createElement('dt');
      dt.className = 'a11y-shortcut-key';
      dt.innerHTML = '<kbd>' + s.key + '</kbd>';
      list.appendChild(dt);

      var dd = document.createElement('dd');
      dd.className = 'a11y-shortcut-desc';
      dd.textContent = s.desc;
      list.appendChild(dd);
    });
    content.appendChild(list);

    window.BottomSheet.open({
      title: t('a11y.help.title', 'Клавишни комбинации'),
      content: content,
      height: 'auto',
      actions: [{ label: t('components.bottomSheet.close', 'Затвори'), variant: 'secondary',
        onClick: function () { window.BottomSheet.closeAll(); }
      }]
    });
  }

  // ============================================================
  // Init
  // ============================================================

  function init() {
    if (initialized) return;
    initialized = true;
    createSkipLink();
    createLiveRegion();
    window.addEventListener('keydown', onKeyDown);
  }

  return {
    init: init,
    showShortcuts: showShortcuts,
    announce: announce,
    prefersReducedMotion: prefersReducedMotion
  };
})();
