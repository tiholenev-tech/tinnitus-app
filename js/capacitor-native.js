/**
 * AURALIS Capacitor native bridge (Фаза 2) — foreground service за ЗАКЛЮЧЕН ЕКРАН
 * ============================================================================
 * Свързва web аудио lifecycle-а с native foreground service-а:
 *   auralis-session-start → Capacitor.Plugins.ForegroundAudio.start()
 *   auralis-session-end   → Capacitor.Plugins.ForegroundAudio.stop()
 *
 * Service-ът (AudioKeepAliveService.java) държи процеса жив с постоянна
 * нотификация → OS не suspend-ва WebView аудиото при заключен екран. Това е
 * истинското решение за бъг №1 (виж AURALIS_MASTER_2026-06-02.md §1/§3).
 *
 * 🔒 НАПЪЛНО ИНЕРТЕН ЗА WEB/PWA: ако не сме в Capacitor native обвивка, този
 * модул не прави НИЩО. Същият index.html се сервира и на браузър, и на app-а —
 * затова guard-ваме строго. Всичко в try/catch — ако гръмне, аудиото е непокътнато.
 *
 * §5 BRIDGE КАПАН (изяде дни на RunMyStore): при server.url модел window.Capacitor
 * понякога се инжектира малко СЛЕД load, а на някои устройства (стар Samsung WebView)
 * auto-injection-ът се проваля изцяло. Затова ЧАКАМЕ bridge-а до ~6s преди да се
 * откажем, и логваме ясно дали Capacitor е наличен но plugin-ът липсва (= §5 случай,
 * нужен ръчен hosted bridge — виж CAPACITOR_BUILD_GUIDE §5).
 *
 * index.html: <script src="js/capacitor-native.js"></script> СЛЕД media-session.js
 */
(function () {
  'use strict';

  function log() {
    try { console.log.apply(console, ['[cap-native]'].concat([].slice.call(arguments))); } catch (e) {}
  }

  function isNative() {
    try {
      return !!(window.Capacitor &&
        typeof Capacitor.isNativePlatform === 'function' &&
        Capacitor.isNativePlatform());
    } catch (e) { return false; }
  }

  function getPlugin() {
    try {
      return (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.ForegroundAudio) || null;
    } catch (e) { return null; }
  }

  var started = false;

  function startFGS() {
    var p = getPlugin();
    if (!p || started) return;
    started = true;
    try {
      var r = p.start();
      if (r && r.catch) r.catch(function (e) { started = false; log('start rejected:', e && e.message); });
      log('foreground service → START');
    } catch (e) { started = false; log('start threw:', e && e.message); }
  }

  function stopFGS() {
    var p = getPlugin();
    if (!p || !started) return;
    started = false;
    try {
      var r = p.stop();
      if (r && r.catch) r.catch(function (e) { log('stop rejected:', e && e.message); });
      log('foreground service → STOP');
    } catch (e) { log('stop threw:', e && e.message); }
  }

  // -- Хардуерен Back бутон (Android) --
  // По подразбиране Capacitor излиза от app-а при Back. Вместо това:
  //   1) ако има отворен bottom sheet / overlay → затвори него
  //   2) иначе → навигирай назад в app историята (history.back)
  //   3) ако сме на корена (няма история) → излез от app-а
  function wireBackButton() {
    try {
      var App = (window.Capacitor && Capacitor.Plugins && Capacitor.Plugins.App) || null;
      if (!App || !App.addListener) { log('@capacitor/app липсва — back бутон не е закачен'); return; }
      App.addListener('backButton', function (info) {
        try {
          // 1) отворен bottom sheet → затвори
          var sheet = document.querySelector('.bs-overlay.is-open');
          if (sheet && window.BottomSheet && BottomSheet.closeAll) { BottomSheet.closeAll(); return; }
          // друг fallback overlay (напр. headphones warning) → затвори
          var ov = document.querySelector('.hw-fallback-overlay');
          if (ov && ov.parentNode) { ov.parentNode.removeChild(ov); return; }
          // 2) навигация назад
          if (info && info.canGoBack) { window.history.back(); return; }
          // 3) корен → излез
          if (App.exitApp) App.exitApp();
        } catch (e) { log('backButton handler err:', e && e.message); }
      });
      log('back бутон → close sheet / history.back / exitApp');
    } catch (e) { log('wireBackButton fail:', e && e.message); }
  }

  function wire() {
    log('native bridge готов → закачам foreground service + back бутон');
    window.addEventListener('auralis-session-start', startFGS);
    window.addEventListener('auralis-session-end', stopFGS);
    wireBackButton();
    // Ако сесия вече тече при късно закачане на bridge-а → стартирай веднага.
    try {
      var it = (window.AudioResilience && AudioResilience.getIntended)
        ? AudioResilience.getIntended() : null;
      if (it && it.playing) startFGS();
    } catch (e) {}
  }

  // Чакай bridge-а: до 60 × 100ms = 6s.
  var tries = 0;
  function waitForBridge() {
    tries++;
    if (isNative() && getPlugin()) { wire(); return; }
    if (tries > 60) {
      if (window.Capacitor) {
        log('⚠️ Capacitor наличен, но ForegroundAudio plugin липсва — §5 bridge случай (нужен ръчен hosted bridge)');
      } else {
        log('не е Capacitor native (web/PWA режим) → нищо за правене');
      }
      return;
    }
    setTimeout(waitForBridge, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForBridge);
  } else {
    waitForBridge();
  }
})();
