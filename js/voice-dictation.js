/**
 * AURALIS VoiceDictation — гласова диктовка чрез Web Speech API + overlay
 * ===========================================================================
 * Pattern: bottom-sheet overlay (адаптиран от RunMyStore voice-overlay.php).
 *
 * Flow:
 *   tap mic → (privacy modal first time) → fullscreen overlay
 *   → live recording с interim transcript preview → auto-stop on silence
 *   → user натиска [Запиши] → append на текста в target → close.
 *
 * UX wins от RunMyStore:
 *   - Live interim transcript (Web Speech interimResults: true)
 *   - Visual state machine (red recording / green ready)
 *   - Readonly textarea → tap не пуска native keyboard
 *   - Tap-to-retry: tap-ване в transcript при ready → нов запис
 *   - Auto-stop на тишина → ready state с активен Save бутон
 *   - Bottom-sheet positioned за thumb-reachability
 *
 * Premahnati от RunMyStore (AURALIS-specific):
 *   - НЯМА fetch/CSRF/server roundtrip (AURALIS е offline-first)
 *   - НЯМА speechSynthesis TTS (само append на текст)
 *   - НЯМА 'thinking' state (няма async AI)
 *   - НЯМА auto-send (потребителят натиска [Запиши] explicit)
 *
 * Public API (stable — без breaking changes за callers):
 *   VoiceDictation.isSupported()             → boolean
 *   VoiceDictation.mountButton(opts)         → handle | null
 *   VoiceDictation.hasAcknowledgedPrivacy()  → boolean
 *   VoiceDictation.resetPrivacyFlag()        → void
 *   VoiceDictation.closeOverlay()            → void (idempotent)
 */

window.VoiceDictation = (function () {
  'use strict';

  var PRIVACY_ACK_KEY = 'auralis_voice_privacy_acknowledged';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  // Single global overlay context — guards срещу double-open.
  var currentCtx = null;
  var escHandlerBound = false;

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function isSupported() { return !!SR; }

  function hasAcknowledgedPrivacy() {
    try { return localStorage.getItem(PRIVACY_ACK_KEY) === 'true'; }
    catch (e) { return false; }
  }

  function markPrivacyAcknowledged() {
    try { localStorage.setItem(PRIVACY_ACK_KEY, 'true'); }
    catch (e) { /* ignore */ }
  }

  function resetPrivacyFlag() {
    try { localStorage.removeItem(PRIVACY_ACK_KEY); }
    catch (e) { /* ignore */ }
  }

  // ============================================================
  // Privacy BottomSheet (UNCHANGED — запазен от предишната версия)
  // ============================================================

  function showPrivacyModal(onAcknowledge) {
    if (!window.BottomSheet || !window.BottomSheet.open) {
      // Fallback: native confirm.
      var titleF = t('voice.privacy.title', 'Гласовата диктовка');
      var bodyF  = t('voice.privacy.body', '');
      if (window.confirm(titleF + '\n\n' + bodyF)) {
        markPrivacyAcknowledged();
        onAcknowledge && onAcknowledge();
      }
      return;
    }

    var title = t('voice.privacy.title', 'Гласовата диктовка');
    var body  = t('voice.privacy.body',
      'При натискане на микрофона, гласът Ви се обработва от браузъра Ви. ' +
      'Браузърът използва безплатна услуга на Google (Chrome) или Apple (Safari), ' +
      'което изисква интернет връзка.\n\n' +
      'Текстът остава САМО на телефона Ви — AURALIS не пази и не изпраща Вашите записи.\n\n' +
      'Можете да изключите гласовата диктовка по всяко време чрез настройките на телефона.');

    var content = document.createElement('div');
    content.className = 'voice-privacy-body';
    String(body).split(/\n\n+/).forEach(function (p) {
      var pEl = document.createElement('p');
      pEl.className = 'voice-privacy-para';
      pEl.textContent = p;
      content.appendChild(pEl);
    });

    var sheetHandle = null;
    sheetHandle = window.BottomSheet.open({
      title: title,
      content: content,
      height: 'auto',
      showGrip: true,
      closeOnBackdrop: false,
      actions: [
        {
          label: t('voice.privacy.acknowledge', 'Разбирам, продължи'),
          variant: 'primary',
          onClick: function () {
            markPrivacyAcknowledged();
            if (sheetHandle && sheetHandle.close) sheetHandle.close();
            setTimeout(function () { onAcknowledge && onAcknowledge(); }, 50);
          }
        },
        {
          label: t('voice.privacy.cancel', 'Отмени'),
          variant: 'secondary',
          onClick: function () {
            if (sheetHandle && sheetHandle.close) sheetHandle.close();
          }
        }
      ]
    });
  }

  // ============================================================
  // Error mapping (UNCHANGED)
  // ============================================================

  function showErrorToast(errCode) {
    var map = {
      'no-speech':              { k: 'voice.error.noSpeech',   fb: 'Не чух нищо. Опитайте отново.' },
      'audio-capture':          { k: 'voice.error.mic',        fb: 'Не намирам микрофон.' },
      'not-allowed':            { k: 'voice.error.permission', fb: 'Разрешете достъп до микрофона в настройките на браузъра.' },
      'service-not-allowed':    { k: 'voice.error.permission', fb: 'Разрешете достъп до микрофона в настройките на браузъра.' },
      'network':                { k: 'voice.error.offline',    fb: 'Гласовата диктовка изисква интернет. Опитайте отново когато сте online.' },
      'language-not-supported': { k: 'voice.error.lang',       fb: 'Българският не се поддържа от браузъра Ви.' }
    };
    var entry = map[errCode] || { k: 'voice.error.generic', fb: 'Възникна грешка при гласовото въвеждане.' };
    var msg = t(entry.k, entry.fb);
    if (window.Toast && window.Toast.warning) {
      window.Toast.warning(msg);
    } else if (window.Toast && window.Toast.show) {
      window.Toast.show(msg, { durationMs: 5000 });
    }
  }

  // ============================================================
  // SVG icons
  // ============================================================

  function micSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>' +
      '<path d="M19 10v2a7 7 0 01-14 0v-2"/>' +
      '<line x1="12" y1="19" x2="12" y2="23"/>' +
      '<line x1="8" y1="23" x2="16" y2="23"/>' +
      '</svg>';
  }

  function closeSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/>' +
      '<line x1="6" y1="6" x2="18" y2="18"/>' +
      '</svg>';
  }

  // ============================================================
  // Overlay DOM (RunMyStore-inspired bottom-sheet)
  // ============================================================

  function buildOverlayDom() {
    var ov = document.createElement('div');
    ov.className = 'vd-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', t('voice.overlay.recording', 'ЗАПИСВАНЕ'));

    var box = document.createElement('div');
    box.className = 'vd-box';
    ov.appendChild(box);

    // Close button (top-right corner)
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'vd-close';
    closeBtn.setAttribute('aria-label', t('voice.overlay.closeAria', 'Затвори диктовката'));
    closeBtn.innerHTML = closeSvg();
    box.appendChild(closeBtn);

    // Status row: dot + label
    var status = document.createElement('div');
    status.className = 'vd-status';
    var dot = document.createElement('div');
    dot.className = 'vd-dot';
    var label = document.createElement('span');
    label.className = 'vd-label';
    label.textContent = t('voice.overlay.recording', 'ЗАПИСВАНЕ');
    status.appendChild(dot);
    status.appendChild(label);
    box.appendChild(status);

    // Transcript textarea (readonly — tap не пуска IME)
    var transcript = document.createElement('textarea');
    transcript.className = 'vd-transcript empty';
    transcript.readOnly = true;
    transcript.rows = 3;
    transcript.setAttribute('aria-label', t('voice.overlay.placeholder', 'Текстът ще се появи тук…'));
    transcript.placeholder = t('voice.overlay.placeholder', 'Текстът ще се появи тук…');
    box.appendChild(transcript);

    // Hint text
    var hint = document.createElement('div');
    hint.className = 'vd-hint';
    hint.textContent = t('voice.overlay.hintRecording',
      'Говорете на български. Спрете и ще видите текста.');
    box.appendChild(hint);

    // Actions row
    var actions = document.createElement('div');
    actions.className = 'vd-actions';

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'vd-btn vd-btn-cancel';
    cancelBtn.textContent = t('voice.overlay.cancel', 'Отмени');

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'vd-btn vd-btn-save';
    saveBtn.disabled = true;
    saveBtn.textContent = t('voice.overlay.save', 'Запиши');

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
    box.appendChild(actions);

    return {
      overlay: ov,
      box: box,
      dot: dot,
      label: label,
      transcript: transcript,
      hint: hint,
      cancelBtn: cancelBtn,
      saveBtn: saveBtn,
      closeBtn: closeBtn
    };
  }

  // ============================================================
  // Overlay state machine
  // ============================================================
  //
  // Three states:
  //   'recording' — SR active, red pulsing dot
  //   'ready'     — SR stopped (auto от silence или error), green dot,
  //                 transcript ready за commit, user може tap-to-retry
  //   'idle'      — initial, преди първи start (рядко в практика)

  function setState(ctx, state) {
    ctx.state = state;
    if (!ctx.dom) return;

    var d = ctx.dom;
    d.dot.classList.remove('is-recording', 'is-ready');
    d.label.classList.remove('is-recording', 'is-ready');

    if (state === 'recording') {
      d.dot.classList.add('is-recording');
      d.label.classList.add('is-recording');
      d.label.textContent = t('voice.overlay.recording', 'ЗАПИСВАНЕ');
      d.hint.textContent = t('voice.overlay.hintRecording',
        'Говорете на български. Спрете и ще видите текста.');
      // Save disabled докато не падне в ready ИЛИ има някакъв текст.
      d.saveBtn.disabled = !ctx.transcript.trim();
    } else if (state === 'ready') {
      d.dot.classList.add('is-ready');
      d.label.classList.add('is-ready');
      d.label.textContent = t('voice.overlay.ready', 'ГОТОВО');
      if (ctx.transcript.trim()) {
        d.hint.textContent = t('voice.overlay.hintReady',
          'Натиснете „Запиши" за да добавите, или текста за нов запис.');
      } else {
        d.hint.textContent = t('voice.overlay.hintEmpty',
          'Не чух нищо. Натиснете текста за нов опит.');
      }
      d.saveBtn.disabled = !ctx.transcript.trim();
    } else {
      // idle (unused в практика)
      d.label.textContent = t('voice.overlay.recording', 'ЗАПИСВАНЕ');
      d.hint.textContent = t('voice.overlay.hintRecording',
        'Говорете на български. Спрете и ще видите текста.');
      d.saveBtn.disabled = true;
    }
  }

  function setTranscript(ctx, text) {
    ctx.transcript = (text || '').trim();
    if (!ctx.dom) return;
    var ta = ctx.dom.transcript;
    if (ctx.transcript) {
      ta.value = ctx.transcript;
      ta.classList.remove('empty');
    } else {
      ta.value = '';
      ta.classList.add('empty');
    }
    // Update Save state ако сме в ready (recording не променя disabled тук).
    if (ctx.state === 'ready') {
      ctx.dom.saveBtn.disabled = !ctx.transcript;
      ctx.dom.hint.textContent = ctx.transcript
        ? t('voice.overlay.hintReady', 'Натиснете „Запиши" за да добавите, или текста за нов запис.')
        : t('voice.overlay.hintEmpty', 'Не чух нищо. Натиснете текста за нов опит.');
    } else if (ctx.state === 'recording' && ctx.transcript) {
      // Live preview може да активира Save и в recording (RunMyStore pattern).
      ctx.dom.saveBtn.disabled = false;
    }
  }

  // ============================================================
  // Recognition lifecycle
  // ============================================================

  function startRec(ctx) {
    // Pre-flight offline check.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      showErrorToast('network');
      setState(ctx, 'ready');
      return;
    }
    try {
      if (ctx.recognition) {
        try { ctx.recognition.abort(); } catch (e) { /* ignore */ }
      }
      var r = new SR();
      r.lang = ctx.lang;
      r.continuous = false;       // single utterance, auto-stop on silence
      r.interimResults = true;    // LIVE preview (RunMyStore key win)
      r.maxAlternatives = 1;

      r.onresult = function (e) {
        // Aggregate ALL results (interim + final) за live update.
        var full = '';
        for (var i = 0; i < e.results.length; i++) {
          full += e.results[i][0].transcript;
        }
        setTranscript(ctx, full);
      };

      r.onerror = function (e) {
        var code = (e && e.error) || 'unknown';
        // 'no-speech' и 'aborted' не са true errors при continuous=false
        // — minimal toast само за наистина action-required errors.
        if (code === 'no-speech' || code === 'aborted') {
          setState(ctx, 'ready');
          return;
        }
        showErrorToast(code);
        setState(ctx, 'ready');
      };

      r.onend = function () {
        // Auto-stop на тишина → ready (user може tap-to-retry).
        if (ctx.state === 'recording') setState(ctx, 'ready');
      };

      ctx.recognition = r;
      setState(ctx, 'recording');
      r.start();
    } catch (err) {
      console.warn('[voice] start failed', err);
      showErrorToast('start-failed');
      setState(ctx, 'ready');
    }
  }

  function stopRec(ctx) {
    if (!ctx.recognition) return;
    try { ctx.recognition.stop(); } catch (e) { /* ignore */ }
    try { ctx.recognition.abort(); } catch (e) { /* ignore */ }
    ctx.recognition = null;
  }

  // ============================================================
  // Overlay open / close / commit
  // ============================================================

  function openOverlay(opts) {
    // Guard срещу double-open.
    if (currentCtx) {
      closeOverlay();
    }

    var dom = buildOverlayDom();
    document.body.appendChild(dom.overlay);
    // Force layout flush преди добавяне на .open class за чиста animation.
    void dom.overlay.offsetHeight;
    dom.overlay.classList.add('open');

    var ctx = {
      dom: dom,
      opts: opts,
      lang: opts.lang || 'bg-BG',
      maxLength: (typeof opts.maxLength === 'number' && opts.maxLength > 0)
        ? opts.maxLength
        : (opts.target && opts.target.maxLength > 0 ? opts.target.maxLength : Infinity),
      transcript: '',
      state: 'idle',
      recognition: null
    };
    currentCtx = ctx;

    // Wire events.
    dom.cancelBtn.addEventListener('click', function () { closeOverlay(); });
    dom.closeBtn.addEventListener('click', function () { closeOverlay(); });
    dom.saveBtn.addEventListener('click', function () { commitToTarget(ctx); });
    dom.overlay.addEventListener('click', function (e) {
      if (e.target === dom.overlay) closeOverlay();
    });
    // RunMyStore pattern: tap-to-retry на transcript при ready/idle.
    dom.transcript.addEventListener('click', function () {
      if (ctx.state === 'ready' || ctx.state === 'idle') {
        startRec(ctx);
      }
    });

    if (!escHandlerBound) {
      document.addEventListener('keydown', onGlobalKeyDown);
      escHandlerBound = true;
    }

    // Haptic feedback (ако e наличен).
    if (navigator.vibrate) {
      try { navigator.vibrate(8); } catch (e) { /* ignore */ }
    }

    // Start recording immediately.
    startRec(ctx);
  }

  function closeOverlay() {
    if (!currentCtx) return;
    var ctx = currentCtx;
    stopRec(ctx);
    if (ctx.dom && ctx.dom.overlay && ctx.dom.overlay.parentNode) {
      ctx.dom.overlay.classList.remove('open');
      // Defer DOM removal за close animation.
      var ov = ctx.dom.overlay;
      setTimeout(function () {
        if (ov.parentNode) ov.parentNode.removeChild(ov);
      }, 220);
    }
    currentCtx = null;
    if (escHandlerBound) {
      document.removeEventListener('keydown', onGlobalKeyDown);
      escHandlerBound = false;
    }
  }

  function commitToTarget(ctx) {
    var text = (ctx.transcript || '').trim();
    if (!text) return;
    var target = ctx.opts && ctx.opts.target;
    if (!target) {
      closeOverlay();
      return;
    }
    // Spirit-приетo: append с whitespace separator, clamp до maxLength.
    var current = target.value || '';
    var needsSpace = current.length > 0 && !/\s$/.test(current);
    var separator = needsSpace ? ' ' : '';
    var combined = current + separator + text;
    if (combined.length > ctx.maxLength) {
      combined = combined.slice(0, ctx.maxLength);
    }
    target.value = combined;
    // Dispatch 'input' за char counter + autosave hooks.
    try {
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (e) { /* ignore */ }
    closeOverlay();
  }

  function onGlobalKeyDown(e) {
    if (e.key === 'Escape' && currentCtx) {
      e.stopPropagation();
      closeOverlay();
    }
  }

  // ============================================================
  // Mic button (inline trigger — API stable)
  // ============================================================

  function mountButton(opts) {
    if (!isSupported()) return null;
    if (!opts || !opts.target || !opts.container) return null;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voice-dict-btn';
    btn.setAttribute('aria-label', t('voice.startAria', 'Започни диктовка'));
    btn.innerHTML = micSvg();

    function onBtnClick() {
      // Privacy gate: при първи tap → modal → след acknowledge отваряме overlay.
      if (!hasAcknowledgedPrivacy()) {
        showPrivacyModal(function () { openOverlay(opts); });
        return;
      }
      openOverlay(opts);
    }

    btn.addEventListener('click', onBtnClick);
    opts.container.appendChild(btn);

    return {
      element: btn,
      start: function () { openOverlay(opts); },
      stop: function () { closeOverlay(); },
      destroy: function () {
        btn.removeEventListener('click', onBtnClick);
        if (btn.parentNode) btn.parentNode.removeChild(btn);
      }
    };
  }

  return {
    isSupported: isSupported,
    mountButton: mountButton,
    hasAcknowledgedPrivacy: hasAcknowledgedPrivacy,
    resetPrivacyFlag: resetPrivacyFlag,
    closeOverlay: closeOverlay
  };
})();
