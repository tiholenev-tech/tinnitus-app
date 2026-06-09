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
  // anchorShouldPlay = НАШЕТО намерение котвата да свири. Разграничава „ние
  // паузнахме" (pauseAnchor) от „OS паузна" (audio focus loss от известие/
  // обаждане). Само второто пуска recovery loop-а.
  var anchorShouldPlay = false;

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
      attachAnchorListeners(anchor);
    } catch (e) { log('anchor create fail:', e && e.message); anchor = null; }
    return anchor;
  }

  // -- AUDIO-FOCUS RECOVERY (БЪГ: звук умира след известие нощем) -------------
  // На Android, когато друго app/известие вземе audio focus, OS ПАУЗВА нашата
  // <audio> котва (native 'pause' event) И suspend-ва Web Audio context-а. Web
  // Audio НЕ се връща сам след като фокусът се освободи — Chrome НЕ авто-resume-ва
  // и НЕ fire-ва нов statechange при връщане на фокуса. Затова без активна намеса
  // звукът остава мъртъв (само 2-мин watchdog-ът би пробвал — твърде бавно, а и
  // resume му може да се провали докато фокусът още е зает).
  //
  // Решение (огледало на native OnAudioFocusChangeListener → AUDIOFOCUS_GAIN):
  // при OS-пауза на котвата пускаме backoff loop, който пробва да върне котвата
  // (audio-focus proxy) + resume-ва Web Audio, докато фокусът се върне.
  var RECOVERY_BACKOFF = [800, 1500, 3000, 6000, 12000, 30000]; // ms, capped на 30s
  var recovering   = false;
  var recoveryStep = 0;
  var recoveryTimer = null;

  function stillInSession() {
    try {
      var it = window.AudioResilience && AudioResilience.getIntended
        ? AudioResilience.getIntended() : null;
      return !!(it && it.playing);
    } catch (e) { return false; }
  }

  function startFocusRecovery(reason) {
    if (recovering) return;          // вече пробваме
    if (!stillInSession()) return;   // потребителят е спрял → не „съживявай"
    recovering = true;
    recoveryStep = 0;
    setState('paused');
    log('audio focus LOST (' + reason + ') → старт на recovery loop');
    scheduleNextRecovery();
  }

  function stopFocusRecovery() {
    recovering = false;
    recoveryStep = 0;
    if (recoveryTimer) { clearTimeout(recoveryTimer); recoveryTimer = null; }
  }

  function scheduleNextRecovery() {
    if (!recovering) return;
    var idx = Math.min(recoveryStep, RECOVERY_BACKOFF.length - 1);
    recoveryStep++;
    recoveryTimer = setTimeout(attemptRecovery, RECOVERY_BACKOFF[idx]);
  }

  function attemptRecovery() {
    recoveryTimer = null;
    if (!recovering) return;
    // Потребителят спря/паузна междувременно → прекрати.
    if (!stillInSession() || !anchorShouldPlay) { stopFocusRecovery(); setState('none'); return; }

    // 1) Resume-ни Web Audio (ctx.resume + replay на паднали слоеве).
    try { if (window.AudioResilience && AudioResilience.forceCheck) AudioResilience.forceCheck(); } catch (e) {}

    // 2) Опитай да върнеш котвата = заявка за audio focus. Успее ли play() →
    //    фокусът е върнат; провали ли се (NotAllowedError, фокусът още е зает) →
    //    пробвай пак с по-голям backoff.
    var a = getAnchor();
    if (!a) { stopFocusRecovery(); return; }
    var p;
    try { p = a.play(); } catch (e) { p = null; }
    if (p && p.then) {
      p.then(function () {
        log('recovery: котва върната → audio focus regained');
        setState('playing');
        try { if (window.AudioResilience && AudioResilience.forceCheck) AudioResilience.forceCheck(); } catch (e) {}
        stopFocusRecovery();
      }).catch(function (e) {
        scheduleNextRecovery();
      });
    } else {
      // Стар браузър без play()-promise → разчитай на paused флага.
      if (a.paused) scheduleNextRecovery();
      else { setState('playing'); stopFocusRecovery(); }
    }
  }

  function attachAnchorListeners(a) {
    if (!a || a._auralisHooked) return;
    a._auralisHooked = true;
    // OS паузна котвата докато ние искаме звук → audio focus loss → recovery.
    a.addEventListener('pause', function () {
      if (!anchorShouldPlay) return;           // ние я паузнахме — игнорирай
      startFocusRecovery('anchor-pause');
    });
    // Котвата засвири отново → фокусът е наличен; спри recovery loop-а.
    a.addEventListener('play', function () {
      if (recovering) { stopFocusRecovery(); setState('playing'); }
    });
    // loop=true → 'ended' не би трябвало да идва, но ако дойде — рестартирай.
    a.addEventListener('ended', function () {
      if (anchorShouldPlay) { try { a.play(); } catch (e) {} }
    });
  }

  function playAnchor() {
    var a = getAnchor();
    if (!a) return;
    anchorShouldPlay = true;
    try {
      var p = a.play();
      if (p && p.catch) p.catch(function (e) {
        log('anchor play blocked:', e && e.message);
        // Блокирана при опит за старт по време на чужд фокус → пробвай recovery.
        if (anchorShouldPlay) startFocusRecovery('play-blocked');
      });
    } catch (e) {}
  }
  function pauseAnchor() {
    anchorShouldPlay = false;   // ПРЕДИ pause() → listener-ът да не пусне recovery
    stopFocusRecovery();
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
          // Същата пътека като manifest.json / index.html (app-icons/ е тази,
          // която реално се сервира на сървъра — в репото PNG-ите са в icons/).
          { src: 'app-icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'app-icons/icon-512.png', sizes: '512x512', type: 'image/png' }
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
    stopFocusRecovery();
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
      if (intended && intended.playing) {
        // Връщане в foreground → веднага опитай да възстановиш (не чакай backoff).
        stopFocusRecovery();
        playAnchor();
        try { if (AudioResilience.forceCheck) AudioResilience.forceCheck(); } catch (e) {}
        setState('playing');
      }
    } catch (e) {}
  });

  log('loaded | mediaSession:', hasMediaSession);
})();
