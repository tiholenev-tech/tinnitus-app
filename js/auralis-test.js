/* AURALIS — интерактивен тест (Web Audio).
   Чист тон (match) + notched шум („чуйте облекчението" = аха-моментът).
   Безопасност: тих gain, fade in/out, авто-стоп, AudioContext на първи жест.
   INP: дребни handler-и, кеширан шум-буфер, throttle на слайдера. */
(function () {
  'use strict';
  var SAFE_GAIN = 0.12;       // тихо — възрастни уши, слушалки
  var AUTO_STOP_MS = 8000;    // никога не свири безкрайно
  var FADE = 0.08;            // fade in/out срещу „клик"

  var ctx = null, node = null, gain = null, filter = null;
  var current = null, stopTimer = null, retune = null, noiseBuf = null;

  var range = document.querySelector('[data-range]');
  var hzEls = document.querySelectorAll('[data-hz]');
  var btns  = document.querySelectorAll('[data-sound]');
  if (!btns.length) return;

  function fmtHz(v){ return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function setReadout(v){ hzEls.forEach(function (el){ el.textContent = fmtHz(v); }); }
  function freq(){ return range ? +range.value : 6400; }

  function ac(){
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') { ctx.resume(); }
    return ctx;
  }

  function clearActive(){
    btns.forEach(function (b){ b.setAttribute('data-playing','false'); b.setAttribute('aria-pressed','false'); });
  }

  function stop(cb){
    if (stopTimer) { clearTimeout(stopTimer); stopTimer = null; }
    if (!gain || !ctx) { current = null; clearActive(); if (cb) cb(); return; }
    var g = gain, n = node;
    try {
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setValueAtTime(g.gain.value, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE);
    } catch (e) {}
    setTimeout(function (){ try { n && n.stop && n.stop(); } catch (e) {} try { n && n.disconnect && n.disconnect(); } catch (e) {} }, FADE * 1000 + 40);
    node = null; gain = null; filter = null; current = null;
    clearActive();
    if (cb) setTimeout(cb, FADE * 1000 + 50);
  }

  function makeNoise(c){
    if (noiseBuf) return noiseBuf;
    var len = Math.floor(c.sampleRate * 2);
    noiseBuf = c.createBuffer(1, len, c.sampleRate);
    var d = noiseBuf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) { var wn = Math.random() * 2 - 1; last = (last + 0.02 * wn) / 1.02; d[i] = last * 3.2 * 0.5; }
    return noiseBuf;
  }

  function armAutoStop(){ if (stopTimer) clearTimeout(stopTimer); stopTimer = setTimeout(function (){ stop(); }, AUTO_STOP_MS); }

  function playTone(){
    var c = ac(); if (!c) return;
    node = c.createOscillator(); node.type = 'sine'; node.frequency.value = freq();
    gain = c.createGain(); gain.gain.value = 0;
    node.connect(gain).connect(c.destination); node.start();
    gain.gain.linearRampToValueAtTime(SAFE_GAIN, c.currentTime + FADE);
    current = 'tone'; armAutoStop();
  }

  function playRelief(){
    var c = ac(); if (!c) return;
    node = c.createBufferSource(); node.buffer = makeNoise(c); node.loop = true;
    filter = c.createBiquadFilter(); filter.type = 'notch'; filter.frequency.value = freq(); filter.Q.value = 4;
    gain = c.createGain(); gain.gain.value = 0;
    node.connect(filter).connect(gain).connect(c.destination); node.start();
    gain.gain.linearRampToValueAtTime(SAFE_GAIN, c.currentTime + FADE);
    current = 'relief'; armAutoStop();
  }

  function mark(kind){
    clearActive();
    btns.forEach(function (b){ if (b.getAttribute('data-sound') === kind) { b.setAttribute('data-playing','true'); b.setAttribute('aria-pressed','true'); } });
  }

  btns.forEach(function (b){
    b.setAttribute('aria-pressed','false');
    b.addEventListener('click', function (){
      var kind = b.getAttribute('data-sound');
      if (current === kind) { stop(); return; }                 // toggle off
      stop(function (){ kind === 'tone' ? playTone() : playRelief(); mark(kind); });
    });
  });

  if (range) {
    range.addEventListener('input', function (){
      setReadout(freq());
      if (!current || !ctx || retune) return;
      retune = setTimeout(function (){
        retune = null; var f = freq();
        try {
          if (current === 'tone' && node) node.frequency.setTargetAtTime(f, ctx.currentTime, 0.02);
          if (current === 'relief' && filter) filter.frequency.setTargetAtTime(f, ctx.currentTime, 0.02);
        } catch (e) {}
      }, 60);
    });
    setReadout(freq());
  }

  window.addEventListener('pagehide', function (){ stop(); });
  document.addEventListener('visibilitychange', function (){ if (document.hidden) stop(); });
})();
