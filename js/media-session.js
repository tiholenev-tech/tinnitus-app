/**
 * AURALIS Media Session — PWA кръпка за ЗАКЛЮЧЕН ЕКРАН (Path A, преди Capacitor)
 * ============================================================================
 * ПРОБЛЕМ (виж AURALIS_MASTER_2026-06-02.md §1): на заключен екран Android
 * suspend-ва PWA таба за пестене на батерия → Web Audio спира след ~5 мин, а при
 * отключване приложението се презарежда от нула. Wake Lock е 'screen' тип →
 * умира при заключване → не помага.
 *
 * КРЪПКА (НЕ гаранция — точно както е описано в документа): караме браузъра да
 * третира AURALIS като активен медиен плейър. На Android Chrome Media Session се
 * активира само ако СВИРИ реален HTMLMediaElement — затова държим безшумна
 * <audio> "котва" в loop, докато AudioEngine свири. Котвата задържа audio focus и
 * активира Media Session → Android показва lock-screen контрол и НЕ suspend-ва
 * таба толкова агресивно. Реалният звук пак идва от Web Audio; котвата е тиха
 * (PCM нули). Истинското решение остава Capacitor (native foreground service).
 *
 * ИЗОЛИРАН МОДУЛ: не пипа audio-engine internals. Слуша само събитията
 * auralis-session-start / auralis-session-end от audio-resilience.js. Всичко е в
 * try/catch — ако нещо тук гръмне, аудиото продължава напълно непокътнато.
 *
 * index.html: <script src="js/media-session.js"></script> ВЕДНАГА СЛЕД
 *             <script src="js/audio-resilience.js"></script>
 */
(function () {
  'use strict';

  function log() {
    try { console.log.apply(console, ['[media-session]'].concat([].slice.call(arguments))); } catch (e) {}
  }

  var hasMediaSession = ('mediaSession' in navigator);

  // -- Безшумна WAV котва, генерирана в JS (валиден WAV, без външен файл/мрежа).
  //    1s, mono, 8kHz, 16-bit, всички семпли = 0 → пълна тишина, без click при loop.
  function makeSilentWavUrl(seconds, sampleRate) {
    try {
      sampleRate = sampleRate || 8000;
      var numSamples = Math.max(1, Math.floor(seconds * sampleRate));
      var dataSize = numSamples * 2; // 16-bit mono
      var buf = new ArrayBuffer(44 + dataSize);
      var view = new DataView(buf);
      function str(off, s) { for (var i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); }
      str(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      str(8, 'WAVE');
      str(12, 'fmt ');
      view.setUint32(16, 16, true);             // PCM chunk size
      view.setUint16(20, 1, true);              // PCM формат
      view.setUint16(22, 1, true);              // mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true); // byte rate
      view.setUint16(32, 2, true);              // block align
      view.setUint16(34, 16, true);             // bits/sample
      str(36, 'data');
      view.setUint32(40, dataSize, true);
      // останалите байтове са нули = тишина
      return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    } catch (e) { log('wav gen fail:', e && e.message); return null; }
  }

  // -- Котвата (lazy: създава се при първата сесия, в рамките на user gesture) --
  var anchor = null;
  function getAnchor() {
    if (anchor) return anchor;
    try {
      var url = makeSilentWavUrl(1.0, 8000);
      if (!url) return null;
      anchor = new Audio(url);
      anchor.loop = true;
      anchor.preload = 'auto';
      // НЕ слагаме muted и НЕ нулираме volume: muted/0-volume елемент може да не
      // задържи audio focus на Android. Тишината идва от нулевите PCM семпли.
    } catch (e) { log('anchor create fail:', e && e.message); anchor = null; }
    return anchor;
  }

  function playAnchor() {
    var a = getAnchor();
    if (!a) return;
    try {
      var p = a.play();
      if (p && p.catch) p.catch(function (e) { log('anchor play blocked:', e && e.message); });
    } catch (e) {}
  }
  function pauseAnchor() {
    if (!anchor) return;
    try { anchor.pause(); } catch (e) {}
  }

  // -- Media Session metadata + playbackState --
  function setMeta() {
    if (!hasMediaSession || !window.MediaMetadata) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'AURALIS',
        artist: 'Звукова терапия',
        artwork: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });
    } catch (e) {}
  }
  function setState(state) {
    if (!hasMediaSession) return;
    try { navigator.mediaSession.playbackState = state; } catch (e) {}
  }

  // -- Lock-screen транспорт → AudioEngine.
  //    Запомняме какво свири преди пауза, за да можем да го върнем при "play".
  var resumeL1 = null, resumeL2 = null;

  function doPause() {
    try {
      if (window.AudioResilience && AudioResilience.getIntended) {
        var it = AudioResilience.getIntended();
        resumeL1 = it.l1 || null;
        resumeL2 = (it.l2 && it.l2 !== 'none') ? it.l2 : null;
      }
      if (window.AudioEngine && AudioEngine.pause) AudioEngine.pause();
    } catch (e) {}
    pauseAnchor();
    setState('paused');
  }

  function doResume() {
    try {
      if (window.AudioEngine) {
        if (resumeL1 && AudioEngine.playLayer1) AudioEngine.playLayer1(resumeL1);
        if (resumeL2 && AudioEngine.playLayer2) AudioEngine.playLayer2(resumeL2);
      }
    } catch (e) {}
    playAnchor();
    setState('playing');
  }

  function doStop() {
    try { if (window.AudioEngine && AudioEngine.stop) AudioEngine.stop(); } catch (e) {}
    pauseAnchor();
    setState('none');
  }

  function registerHandlers() {
    if (!hasMediaSession || !navigator.mediaSession.setActionHandler) return;
    var handlers = [['play', doResume], ['pause', doPause], ['stop', doStop]];
    for (var i = 0; i < handlers.length; i++) {
      try { navigator.mediaSession.setActionHandler(handlers[i][0], handlers[i][1]); } catch (e) {}
    }
  }

  // -- Lifecycle: задвижван от audio-resilience.js (единствен източник на истина
  //    за "потребителят иска звук") --
  window.addEventListener('auralis-session-start', function () {
    setMeta();
    registerHandlers();
    playAnchor();
    setState('playing');
    log('session active → котва + media session ВКЛ');
  });

  window.addEventListener('auralis-session-end', function () {
    pauseAnchor();
    setState('none');
    // resumeL1/resumeL2 НЕ се нулират тук нарочно: doPause() минава през
    // AudioEngine.pause() → endSession() → това събитие, а вече сме запомнили
    // какво да върнем. Презаписват се при следващата пауза/сесия.
  });

  // Отключване на екрана: ако още сме в сесия, OS може да е паузнал котвата —
  // върни я (в рамките на visibility "жеста").
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible') return;
    try {
      var intended = window.AudioResilience && AudioResilience.getIntended
        ? AudioResilience.getIntended() : null;
      if (intended && intended.playing) { playAnchor(); setState('playing'); }
    } catch (e) {}
  });

  log('loaded | mediaSession:', hasMediaSession);
})();
