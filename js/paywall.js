/**
 * AURALIS Paywall — entitlement gate (anon-first flow, 2026-06-18).
 * ============================================================================
 * Източник на истина = window.Entitlement (server-side, от account.js → me.php /
 * device_init.php). Клиентът само РЕНДИРА; решението кой е entitled е на сървъра.
 *
 * 🛡️ FAIL-OPEN: ако entitlement още не е зареден или мрежата падне → entitled=true.
 *    Заварен потребител НИКОГА не се заключва, дори при бъг/офлайн. По-добре да
 *    не съберем пари веднъж, отколкото да заключим легитимен (особено баща-тестер).
 *
 * Grandfather (localStorage) остава като ДОПЪЛНИТЕЛЕН колан — ако по някаква
 * причина сървърът не е маркирал устройството, старият флаг пак отключва.
 */
(function () {
  'use strict';

  // Реалният старт за продажба. true = заключваме изтекли trial-и (но НЕ заварени).
  var PAYWALL_ENABLED = true;

  var GF_KEY   = 'auralis-grandfathered';
  var INIT_KEY = 'auralis-paywall-init';

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Еднократно на устройство: ако потребителят вече ползва приложението → заварен.
  function initGrandfather() {
    if (get(INIT_KEY)) return;
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

  // Има ли право на пълен достъп? (server-side истина + fail-open)
  function isEntitled() {
    if (!PAYWALL_ENABLED) return true;
    if (isGrandfathered()) return true;                 // локален колан за заварени
    var e = window.Entitlement;
    if (!e || !e.loaded) return true;                   // 🛡️ fail-open докато не знаем
    if (e.lifetime || e.paid) return true;
    return e.entitled !== false;                        // expired → false → заключи
  }

  // Guard за премиум функция.
  function guard(onAllowed) {
    if (isEntitled()) { if (typeof onAllowed === 'function') onAllowed(); return true; }
    showPaywall();
    return false;
  }

  // ── Paywall екран (самостоятелен, не модала на профила) ─────────────────────
  function tt(key, fb, params) { return (window.i18n && window.i18n.t) ? window.i18n.t(key, fb, params) : (fb != null ? fb : key); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  function injectStyle() {
    if (document.getElementById('pw-style')) return;
    var s = document.createElement('style');
    s.id = 'pw-style';
    s.textContent =
      '.pw-ov{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;' +
      'padding:20px;background:rgba(4,5,10,.78);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);' +
      'font-family:Montserrat,system-ui,sans-serif;}' +
      '.pw-card{width:100%;max-width:400px;background:hsla(255,28%,13%,.98);border:1px solid hsla(255,45%,72%,.22);' +
      'border-radius:22px;padding:26px 22px;box-shadow:0 18px 50px hsla(255,60%,3%,.6);color:#eef0ff;text-align:center;}' +
      '.pw-card h2{margin:0 0 8px;font-size:21px;font-weight:800;}' +
      '.pw-sub{margin:0 0 6px;font-size:14px;line-height:1.5;color:#c2c5e8;}' +
      '.pw-note{margin:0 0 18px;font-size:12.5px;color:#9aa0cf;}' +
      '.pw-btn{width:100%;border:0;cursor:pointer;padding:14px;border-radius:999px;font-family:inherit;font-size:15px;' +
      'font-weight:800;color:#0a0b12;background:linear-gradient(135deg,hsl(255,80%,78%),hsl(222,85%,72%));' +
      'box-shadow:0 4px 16px hsla(255,70%,50%,.4);margin-bottom:12px;-webkit-tap-highlight-color:transparent;}' +
      '.pw-btn:active{transform:scale(.97);}.pw-btn[disabled]{opacity:.55;}' +
      '.pw-in{width:100%;box-sizing:border-box;padding:13px 14px;border-radius:12px;border:1px solid hsla(255,40%,70%,.28);' +
      'background:hsla(255,30%,8%,.6);color:#fff;font-size:16px;font-family:inherit;margin-bottom:10px;}' +
      '.pw-in:focus{outline:none;border-color:hsl(255,80%,75%);}' +
      '.pw-lbl{display:block;text-align:left;font-size:12px;color:#9aa0cf;margin:6px 2px 6px;}' +
      '.pw-epay{width:100%;border:1px solid hsla(255,40%,70%,.3);background:transparent;color:#dfe1ff;padding:13px;' +
      'border-radius:999px;cursor:pointer;font-family:inherit;font-size:14.5px;font-weight:700;margin-bottom:6px;}' +
      '.pw-msg{font-size:12.5px;margin:6px 0;min-height:16px;}' +
      '.pw-link{margin-top:12px;background:none;border:0;color:#aab0e6;cursor:pointer;font-family:inherit;font-size:13px;text-decoration:underline;}' +
      '.pw-x{display:block;margin:10px auto 0;background:none;border:0;color:#8b91c0;cursor:pointer;font-family:inherit;font-size:12.5px;}';
    document.head.appendChild(s);
  }

  function close() { var o = document.getElementById('pw-ov'); if (o) { try { o.remove(); } catch (e) {} } }

  // 🔒 Enforcement: при server-side 'expired' (и НЕ заварен) → блокиращ paywall.
  // Само статус 'expired' заключва — lifetime/paid/trial/none не задействат това.
  function enforce(e) {
    if (!PAYWALL_ENABLED || isGrandfathered()) return;
    e = e || window.Entitlement;
    if (e && e.loaded && e.status === 'expired') showPaywall(true);
  }

  function showPaywall(blocking) {
    injectStyle();
    close();
    var ov = document.createElement('div');
    ov.className = 'pw-ov'; ov.id = 'pw-ov';

    var card = document.createElement('div');
    card.className = 'pw-card';
    card.innerHTML =
      '<h2>' + esc(tt('ui.paywall.title', 'Пълен достъп до AURALIS')) + '</h2>' +
      '<p class="pw-sub">' + esc(tt('ui.paywall.subtitle', 'Пробният период приключи. Отключете AURALIS завинаги — еднократно, без абонамент.')) + '</p>' +
      '<p class="pw-note">' + esc(tt('ui.paywall.priceNote', 'Еднократно €19.99 · без абонамент · достъп завинаги')) + '</p>';

    // Карта (Stripe)
    var bCard = mkBtn(tt('ui.paywall.payCard', 'Плати с карта — €19.99'), 'pw-btn');
    bCard.addEventListener('click', function () {
      if (!window.Account || !Account.startCheckout) return;
      bCard.disabled = true; bCard.textContent = tt('ui.paywall.loading', 'Зареждам…');
      Account.startCheckout().then(function (r) {
        if (r && (r.notReady)) { bCard.disabled = false; bCard.textContent = tt('ui.paywall.payCard', 'Плати с карта — €19.99'); setMsg(msg, tt('ui.paywall.notReady', 'Плащането още се настройва. Опитайте по-късно.'), false); }
      });
    });
    card.appendChild(bCard);

    // EasyPay (изисква имейл — събираме го тук)
    var lbl = document.createElement('label'); lbl.className = 'pw-lbl';
    lbl.textContent = tt('ui.paywall.emailLabel', 'Имейл (за EasyPay и възстановяване на достъпа):');
    var input = document.createElement('input');
    input.className = 'pw-in'; input.type = 'email'; input.inputMode = 'email'; input.autocomplete = 'email';
    input.placeholder = tt('ui.paywall.emailPlaceholder', 'вашият@имейл.bg');
    var bEpay = mkBtn(tt('ui.paywall.payEpay', 'Плати с EasyPay / ePay (България)'), 'pw-epay');
    var msg = document.createElement('p'); msg.className = 'pw-msg';
    bEpay.addEventListener('click', function () {
      var email = (input.value || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setMsg(msg, tt('ui.paywall.invalidEmail', 'Моля въведете валиден имейл.'), false); return; }
      if (!window.Account || !Account.startEpay) return;
      bEpay.disabled = true; bEpay.textContent = tt('ui.paywall.loading', 'Зареждам…');
      Account.startEpay(email).then(function (r) {
        if (r && (r.notReady || r.needEmail)) { bEpay.disabled = false; bEpay.textContent = tt('ui.paywall.payEpay', 'Плати с EasyPay / ePay (България)'); setMsg(msg, tt('ui.paywall.notReady', 'Плащането още се настройва. Опитайте по-късно.'), false); }
      });
    });
    card.appendChild(lbl); card.appendChild(input); card.appendChild(bEpay); card.appendChild(msg);

    // Възстановяване (вече платил, друго устройство)
    var restore = mkBtn(tt('ui.paywall.restore', 'Вече сте платили? Възстановете с имейл'), 'pw-link');
    restore.addEventListener('click', function () { close(); if (window.Account && Account.showLogin) Account.showLogin(); });
    card.appendChild(restore);

    // При блокиращ (изтекъл trial) НЕ показваме „Затвори" — достъпът е заключен,
    // докато не плати или възстанови. Иначе (доброволно отваряне) може да затвори.
    if (!blocking) {
      var x = mkBtn(tt('ui.paywall.close', 'Затвори'), 'pw-x');
      x.addEventListener('click', close);
      card.appendChild(x);
    }

    ov.appendChild(card);
    document.body.appendChild(ov);
  }

  function setMsg(el, text, ok) { el.textContent = text; el.style.color = ok ? '#bfe3c8' : '#f3c0c0'; }
  function mkBtn(label, cls) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; return b; }

  initGrandfather();

  // Заключването се задвижва от server-side entitlement (account.js dispatch-ва).
  window.addEventListener('auralis-entitlement', function (ev) { enforce(ev.detail); });
  if (window.Entitlement && window.Entitlement.loaded) enforce(window.Entitlement);

  window.Paywall = {
    enabled: function () { return PAYWALL_ENABLED; },
    isEntitled: isEntitled,
    isGrandfathered: isGrandfathered,
    guard: guard,
    showPaywall: showPaywall,
    enforce: enforce,
    close: close
  };

  try { console.log('[paywall] loaded | enabled:', PAYWALL_ENABLED, '| grandfathered:', isGrandfathered()); } catch (e) {}
})();
