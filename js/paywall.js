/**
 * AURALIS Paywall — entitlement gate (Фаза 2, chunk 2).
 * ============================================================================
 * ⛔ ДОРМАНТЕН: PAYWALL_ENABLED = false → isEntitled() ВИНАГИ връща true →
 * нищо не се заключва. Качва се сега изключен; пуска се чак при старт за
 * продажба (флипваш PAYWALL_ENABLED + добавяш Paywall.guard(...) по екраните).
 *
 * ЗАЩИТА НА ТЕКУЩИТЕ ПОТРЕБИТЕЛИ (баща-тестер!): при първо зареждане на този
 * код всеки, който ВЕЧЕ има история (минал тест / стартирана програма / дневник),
 * се маркира „заварен" (grandfathered) ЛОКАЛНО — без акаунт, без имейл, без
 * плащане → пълен достъп завинаги, дори когато paywall-ът един ден се включи.
 * Само НОВИ инсталации след старта минават trial → €19.99.
 */
(function () {
  'use strict';

  // ⛔⛔ НЕ пипай преди реалния старт за продажба. false = нищо не се заключва.
  var PAYWALL_ENABLED = false;

  var GF_KEY   = 'auralis-grandfathered';
  var INIT_KEY = 'auralis-paywall-init';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Еднократно на устройство: ако потребителят вече ползва приложението → заварен.
  function initGrandfather() {
    if (get(INIT_KEY)) return;               // вече инициализиран тук
    set(INIT_KEY, String(Date.now()));
    var existing = false;
    try {
      existing = (window.AppState && AppState.isQuizDone && AppState.isQuizDone())
        || !!get('auralis-program-start-date')
        || !!get('auralis-diary-entries')
        || !!get('auralis-pitch-tests');
    } catch (e) {}
    if (existing) set(GF_KEY, '1');
  }

  function isGrandfathered() { return get(GF_KEY) === '1'; }

  // Има ли право на пълен достъп?
  function isEntitled() {
    if (!PAYWALL_ENABLED) return true;       // дормантен → всичко отключено
    if (isGrandfathered()) return true;      // заварен потребител
    try {
      if (window.Account && Account.status) {
        var s = Account.status();
        if (s.paid) return true;
        if (s.trialLeft === null || s.trialLeft > 0) return true; // в trial (или още нестартирал)
      }
    } catch (e) {}
    return false;
  }

  // Guard за премиум функция. Докато paywall е OFF → винаги пуска onAllowed.
  // При ON и липса на достъп → показва paywall и НЕ пуска (връща false).
  function guard(onAllowed) {
    if (isEntitled()) { if (typeof onAllowed === 'function') onAllowed(); return true; }
    showPaywall();
    return false;
  }

  function showPaywall() {
    // Засега ползва Account модала (€19.99 unlock); самостоятелен екран — по-късно.
    try { if (window.Account && Account.showLogin) Account.showLogin(); } catch (e) {}
  }

  initGrandfather();

  window.Paywall = {
    enabled: function () { return PAYWALL_ENABLED; },
    isEntitled: isEntitled,
    isGrandfathered: isGrandfathered,
    guard: guard,
    showPaywall: showPaywall
  };

  try { console.log('[paywall] loaded | enabled:', PAYWALL_ENABLED, '| grandfathered:', isGrandfathered()); } catch (e) {}
})();
