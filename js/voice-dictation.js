/**
 * AURALIS VoiceDictation — микрофонна диктовка чрез Web Speech API
 * ===========================================================================
 * Reusable controller: mountButton({ target, container, lang, maxLength })
 * → връща handle { element, start, stop, destroy } или null ако API липсва.
 *
 * Privacy: Web Speech API изпраща audio към браузърна услуга (Google за
 * Chrome, Apple за Safari) — изисква интернет. При първи tap на mic →
 * BottomSheet с privacy обяснение. След acknowledge (flag в localStorage)
 * не се показва повторно.
 *
 * Result text се APPEND-ва към target.value (с whitespace separator),
 * dispatches 'input' event → char counters + autosave hooks реагират.
 * Само final results (не interim) — по-чисто за 60+ user.
 *
 * Public API:
 *   VoiceDictation.isSupported()         → boolean
 *   VoiceDictation.mountButton(opts)     → handle | null
 *   VoiceDictation.resetPrivacyFlag()    → за Settings "Покажи отново инфото"
 *   VoiceDictation.hasAcknowledgedPrivacy() → boolean
 */

window.VoiceDictation = (function () {
  'use strict';

  var PRIVACY_ACK_KEY = 'auralis_voice_privacy_acknowledged';
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

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
  // Privacy BottomSheet
  // ============================================================
  //
  // Показваме при ПЪРВИ tap. След acknowledge → start recording.
  // При cancel → close без запис.

  function showPrivacyModal(onAcknowledge) {
    if (!window.BottomSheet || !window.BottomSheet.open) {
      // Fallback ако BottomSheet липсва: native confirm.
      var title = t('voice.privacy.title', 'Гласовата диктовка');
      var body  = t('voice.privacy.body', '');
      if (window.confirm(title + '\n\n' + body)) {
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
    // Body има няколко параграфа — split по \n\n за читливост.
    var paras = String(body).split(/\n\n+/);
    paras.forEach(function (p) {
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
            // Defer start до след close animation за чист focus return.
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

  // ============================================================
  // Error mapping
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
  // Controller factory (mountButton)
  // ============================================================

  function mountButton(opts) {
    if (!isSupported()) return null;
    if (!opts || !opts.target || !opts.container) return null;

    var lang = opts.lang || 'bg-BG';
    var maxLength = (typeof opts.maxLength === 'number' && opts.maxLength > 0)
      ? opts.maxLength
      : (opts.target.maxLength > 0 ? opts.target.maxLength : Infinity);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'voice-dict-btn';
    btn.setAttribute('aria-label', t('voice.startAria', 'Започни диктовка'));
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = micSvg() +
      '<span class="voice-dict-pulse" aria-hidden="true"></span>';

    var recognition = null;
    var isListening = false;

    function setListeningState(on) {
      isListening = on;
      if (on) {
        btn.classList.add('is-listening');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', t('voice.stopAria', 'Спри диктовката'));
      } else {
        btn.classList.remove('is-listening');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', t('voice.startAria', 'Започни диктовка'));
      }
    }

    function appendFinal(text) {
      if (!text) return;
      var current = opts.target.value || '';
      var needsSpace = current.length > 0 && !/\s$/.test(current);
      var separator = needsSpace ? ' ' : '';
      var combined = current + separator + text;
      if (combined.length > maxLength) combined = combined.slice(0, maxLength);
      opts.target.value = combined;
      // Notify listeners (char counter, autosave).
      try {
        opts.target.dispatchEvent(new Event('input', { bubbles: true }));
      } catch (e) { /* IE11 fallback ignored — not a target */ }
    }

    function createRecognition() {
      var r = new SR();
      r.lang = lang;
      r.continuous = true;
      r.interimResults = false;
      r.maxAlternatives = 1;

      r.onresult = function (e) {
        var finalText = '';
        for (var i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            finalText += e.results[i][0].transcript;
          }
        }
        if (finalText) appendFinal(finalText.trim());
      };

      r.onerror = function (e) {
        showErrorToast(e && e.error ? e.error : 'unknown');
        setListeningState(false);
        if (opts.onError) opts.onError(e && e.error);
      };

      r.onend = function () {
        // Browser auto-stop след тишина — отразяваме в UI.
        setListeningState(false);
        if (opts.onStop) opts.onStop();
      };

      return r;
    }

    function startRecording() {
      if (isListening) return;
      // Pre-flight offline check — Web Speech API изисква интернет.
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        showErrorToast('network');
        return;
      }
      try {
        recognition = createRecognition();
        recognition.start();
        setListeningState(true);
        if (opts.onStart) opts.onStart();
      } catch (e) {
        console.warn('[voice] start failed', e);
        showErrorToast('start-failed');
        setListeningState(false);
      }
    }

    function stopRecording() {
      if (!isListening || !recognition) return;
      try { recognition.stop(); } catch (e) { /* ignore */ }
      setListeningState(false);
      if (opts.onStop) opts.onStop();
    }

    function onClick() {
      if (isListening) {
        stopRecording();
        return;
      }
      if (!hasAcknowledgedPrivacy()) {
        showPrivacyModal(function () { startRecording(); });
        return;
      }
      startRecording();
    }

    btn.addEventListener('click', onClick);
    opts.container.appendChild(btn);

    return {
      element: btn,
      start: startRecording,
      stop: stopRecording,
      destroy: function () {
        try { stopRecording(); } catch (e) { /* ignore */ }
        btn.removeEventListener('click', onClick);
        if (btn.parentNode) btn.parentNode.removeChild(btn);
        recognition = null;
      }
    };
  }

  return {
    isSupported: isSupported,
    mountButton: mountButton,
    hasAcknowledgedPrivacy: hasAcknowledgedPrivacy,
    resetPrivacyFlag: resetPrivacyFlag
  };
})();
