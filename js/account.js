/**
 * AURALIS Account — magic-link login + cloud sync (Фаза 1, frontend).
 * ============================================================================
 * Самостоятелен модул. Говори с /api/ (auth_request, me, sync, logout) — всичко
 * same-origin с credentials. Не пипа другите модули; ако backend-ът още не е
 * вдигнат (500), просто стои неактивен (нищо не чупи).
 *
 *  - Boot: обработва ?login=ok/fail, проверява сесия, при нов вход дърпа облака.
 *  - Auto-push: при всяка промяна на синхронизируем localStorage ключ → debounced
 *    POST на цялото състояние (last-write-wins на сървъра).
 *  - Login UI: самостоятелен модал (инжектиран стил).
 *
 * Публично: window.Account = { showLogin, status, isLoggedIn, pushNow, logout }.
 */
(function () {
  'use strict';

  var API = {
    request: '/api/auth_request.php',
    me:      '/api/me.php',
    sync:    '/api/sync.php',
    logout:  '/api/logout.php',
    checkout: '/api/checkout.php',
    epay:    '/api/epay_checkout.php',
    deviceInit: '/api/device_init.php'
  };

  var state = { ready: false, loggedIn: false, email: null, paid: false, trialLeft: null, rev: 0 };

  // ── Device token + entitlement (anon-first flow) ────────────────────────────
  // window.Entitlement = server-side истина за достъпа. fail-open: докато не е
  // зареден (или при мрежова грешка) entitled=true → заварен НИКОГА не се заключва.
  var DEVICE_KEY = 'auralis_device_token';
  window.Entitlement = { loaded: false, entitled: true, status: 'none', daysLeft: null, paid: false, lifetime: false };

  function genToken() {
    try {
      var a = new Uint8Array(32), c = window.crypto || window.msCrypto;
      c.getRandomValues(a);
      return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    } catch (e) {
      var s = ''; for (var i = 0; i < 64; i++) s += '0123456789abcdef'[Math.floor(Math.random() * 16)]; return s;
    }
  }
  function deviceToken() {
    var t = null;
    try { t = localStorage.getItem(DEVICE_KEY); } catch (e) {}
    if (!t || !/^[a-f0-9]{16,64}$/.test(t)) {
      t = genToken();
      try { localStorage.setItem(DEVICE_KEY, t); } catch (e) {}
    }
    return t;
  }

  // 🛡️ Заварен ли е (стари localStorage маркери на реално ползване)? Нова
  // инсталация на първи boot (преди онбординг) НЯМА нито един от тези.
  function detectLegacy() {
    try {
      if (localStorage.getItem('auralis-grandfathered') === '1') return true;
      if (window.AppState && AppState.isQuizDone && AppState.isQuizDone()) return true;
      var keys = ['auralis-onboarding-done', 'auralis-quiz-done', 'auralis-quiz-answers',
        'auralis-quiz-profile', 'auralis-pitch-tests', 'auralis-program-start-date',
        'auralis-diary-entries', 'auralis_diary_entries', 'auralis-thi-baseline',
        'auralis_analytics_sessions', 'auralis_trial_start', 'auralis_favorites'];
      for (var i = 0; i < keys.length; i++) { if (localStorage.getItem(keys[i])) return true; }
    } catch (e) {}
    return false;
  }

  function applyEntitlement(r) {
    if (!r || r.__status !== 200) return;
    window.Entitlement = {
      loaded: true,
      entitled: (r.entitled !== false),
      status: r.status || 'none',
      daysLeft: (typeof r.trial_days_left !== 'undefined') ? r.trial_days_left : null,
      paid: !!r.paid,
      lifetime: !!r.lifetime
    };
    try { window.dispatchEvent(new CustomEvent('auralis-entitlement', { detail: window.Entitlement })); } catch (e) {}
  }

  // Boot: регистрира устройството на сървъра (idempotent) → връща entitlement.
  function initDevice() {
    return postJSON(API.deviceInit, { token: deviceToken(), legacy: detectLegacy() })
      .then(function (r) { applyEntitlement(r); return r; });
  }
  function refreshEntitlement() {
    return getJSON(API.me + '?device=' + encodeURIComponent(deviceToken())).then(function (r) {
      applyEntitlement(r); return r;
    });
  }
  var pushTimer = null, pendingDirty = false, suspendHook = false;
  var PUSH_DEBOUNCE = 2500;

  function log() { try { console.log.apply(console, ['[account]'].concat([].slice.call(arguments))); } catch (e) {} }

  // ── Синхронизируеми ключове (всички auralis*, без ефемерна навигация) ──────
  var SYNC_DENY = {
    'auralis-phase': 1, 'auralis-subphase': 1,
    'auralis-quiz-subphase': 1, 'auralis-last-category-view': 1
  };
  function isSyncKey(k) { return !!k && k.indexOf('auralis') === 0 && !SYNC_DENY[k]; }

  function snapshot() {
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (isSyncKey(k)) out[k] = localStorage.getItem(k);
      }
    } catch (e) {}
    return out;
  }
  function applySnapshot(obj) {
    if (!obj || typeof obj !== 'object') return;
    suspendHook = true;
    try {
      Object.keys(obj).forEach(function (k) {
        if (isSyncKey(k) && typeof obj[k] === 'string') {
          try { localStorage.setItem(k, obj[k]); } catch (e) {}
        }
      });
    } catch (e) {}
    suspendHook = false;
  }

  // ── API ────────────────────────────────────────────────────────────────────
  function postJSON(url, body) {
    return fetch(url, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j.__status = r.status; return j; });
    }).catch(function () { return { __status: 0 }; });
  }
  function getJSON(url) {
    return fetch(url, { credentials: 'include' }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { j.__status = r.status; return j; });
    }).catch(function () { return { __status: 0 }; });
  }

  // ── Sync ─────────────────────────────────────────────────────────────────
  function pushNow() {
    if (!state.loggedIn) return Promise.resolve();
    pendingDirty = false;
    return postJSON(API.sync, { data: snapshot() }).then(function (r) {
      if (r && r.rev) state.rev = r.rev;
      log('pushed → rev', state.rev);
    });
  }
  function schedulePush() {
    if (!state.loggedIn) return;
    pendingDirty = true;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(pushNow, PUSH_DEBOUNCE);
  }
  function pullAndReload() {
    return getJSON(API.sync).then(function (r) {
      var hasServer = r && r.rev > 0 && r.data && typeof r.data === 'object' && Object.keys(r.data).length > 0;
      if (hasServer) {
        applySnapshot(r.data);
        state.rev = r.rev;
        log('pulled rev', state.rev, '→ reload');
        setTimeout(function () { try { location.reload(); } catch (e) {} }, 800);
        return true;
      }
      // сървърът е празен → качи локалните данни
      return pushNow().then(function () { return false; });
    });
  }

  function checkSession() {
    return getJSON(API.me + '?device=' + encodeURIComponent(deviceToken())).then(function (r) {
      state.ready    = true;
      state.loggedIn = !!(r && r.logged_in);
      state.email    = (r && r.email) || null;
      state.paid     = !!(r && r.paid);
      state.trialLeft = (r && typeof r.trial_days_left !== 'undefined') ? r.trial_days_left : null;
      applyEntitlement(r);
      return state.loggedIn;
    });
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  function stripParam(name) {
    try {
      var u = new URL(location.href);
      if (u.searchParams.has(name)) {
        u.searchParams.delete(name);
        history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
      }
    } catch (e) {}
  }

  function init() {
    var loginParam = null;
    try { loginParam = new URL(location.href).searchParams.get('login'); } catch (e) {}

    // hook: всяка промяна на синхронизируем ключ → debounced push
    try {
      var orig = localStorage.setItem.bind(localStorage);
      localStorage.setItem = function (k, v) {
        orig(k, v);
        if (!suspendHook && state.loggedIn && isSyncKey(k)) schedulePush();
      };
    } catch (e) {}

    var paidParam = null;
    try { paidParam = new URL(location.href).searchParams.get('paid'); } catch (e) {}

    // flush при затваряне/скриване
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flush();
    });

    // initDevice() първо: регистрира устройството (трал/lifetime) + entitlement,
    // после обработваме login/paid/статус. Така paywall-ът има server-side истина.
    initDevice().then(function () {
      if (loginParam === 'ok') {
        stripParam('login');
        checkSession().then(function (ok) {
          if (ok) { toast(t('ui.account.loginOk','Влязохте успешно ✓')); pullAndReload(); }
          else    { toast(t('ui.account.loginFail','Входът не беше успешен. Опитайте пак.')); }
        });
      } else if (paidParam === 'ok') {
        stripParam('paid');
        confirmPaid(4);
      } else if (paidParam === 'cancel') {
        stripParam('paid');
        toast(t('ui.account.payCancelled','Плащането е отменено.'));
        checkSession();
      } else {
        if (loginParam === 'fail') { stripParam('login'); toast(t('ui.account.linkExpired','Връзката е изтекла или невалидна.')); }
        checkSession(); // тихо — за статус в Настройки + активиране на push
      }
    });
  }

  function flush() {
    if (!state.loggedIn || !pendingDirty) return;
    pendingDirty = false;
    try {
      fetch(API.sync, {
        method: 'POST', credentials: 'include', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: snapshot() })
      });
    } catch (e) {}
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function logout() {
    return postJSON(API.logout, {}).then(function () {
      state.loggedIn = false; state.email = null; state.paid = false; state.trialLeft = null;
      toast(t('ui.account.loggedOut','Излязохте от профила.'));
    });
  }

  // ── Плащане (Stripe Checkout) ───────────────────────────────────────────────
  function startCheckout() {
    return postJSON(API.checkout, { device: deviceToken() }).then(function (r) {
      if (r && r.url) { try { location.href = r.url; } catch (e) {} return { redirect: true }; }
      if (r && r.already_paid) { state.paid = true; toast(t('ui.account.alreadyPaid','Вече имате пълен достъп ✓')); return { paid: true }; }
      return { notReady: true };
    });
  }

  // След връщане от Stripe (?paid=ok): webhook-ът може да закъснее няколко сек —
  // проверяваме сесията няколко пъти докато paid стане true.
  function confirmPaid(tries) {
    checkSession().then(function () {
      if (state.paid) { toast(t('ui.account.payThanks','Благодарим! Пълен достъп е отключен ✓')); return; }
      if (tries > 0) setTimeout(function () { confirmPaid(tries - 1); }, 2500);
      else toast(t('ui.account.payProcessing','Плащането се обработва… може да отнеме минута.'));
    });
  }

  // ── Плащане през ePay.bg / EasyPay (БГ) ─────────────────────────────────────
  function startEpay(email) {
    var body = { device: deviceToken() };
    if (email) body.email = email;
    return postJSON(API.epay, body).then(function (r) {
      if (r && r.submit_url && r.fields) { submitForm(r.submit_url, r.fields); return { redirect: true }; }
      if (r && r.already_paid) { state.paid = true; toast(t('ui.account.alreadyPaid','Вече имате пълен достъп ✓')); return { paid: true }; }
      if (r && r.error === 'email_required') return { needEmail: true };
      return { notReady: true };
    });
  }
  function submitForm(url, fields) {
    try {
      var f = document.createElement('form');
      f.method = 'POST'; f.action = url; f.style.display = 'none';
      Object.keys(fields).forEach(function (k) {
        var i = document.createElement('input');
        i.type = 'hidden'; i.name = k; i.value = fields[k];
        f.appendChild(i);
      });
      document.body.appendChild(f);
      f.submit();
    } catch (e) {}
  }

  // ── UI (самостоятелен модал) ────────────────────────────────────────────────
  function injectStyle() {
    if (document.getElementById('acc-style')) return;
    var s = document.createElement('style');
    s.id = 'acc-style';
    s.textContent =
      '.acc-ov{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;' +
      'justify-content:center;padding:20px;background:rgba(4,5,10,.66);' +
      '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);' +
      'font-family:Montserrat,system-ui,sans-serif;}' +
      '.acc-card{width:100%;max-width:380px;background:hsla(255,28%,13%,.97);' +
      'border:1px solid hsla(255,45%,72%,.22);border-radius:20px;padding:22px 20px;' +
      'box-shadow:0 18px 50px hsla(255,60%,3%,.6);color:#eef0ff;}' +
      '.acc-card h3{margin:0 0 6px;font-size:19px;font-weight:800;}' +
      '.acc-sub{margin:0 0 16px;font-size:13.5px;line-height:1.45;color:#b9bce0;}' +
      '.acc-in{width:100%;box-sizing:border-box;padding:13px 14px;border-radius:12px;' +
      'border:1px solid hsla(255,40%,70%,.28);background:hsla(255,30%,8%,.6);' +
      'color:#fff;font-size:16px;font-family:inherit;margin-bottom:12px;}' +
      '.acc-in:focus{outline:none;border-color:hsl(255,80%,75%);}' +
      '.acc-btn{width:100%;border:0;cursor:pointer;padding:13px;border-radius:999px;' +
      'font-family:inherit;font-size:15px;font-weight:800;color:#0a0b12;' +
      'background:linear-gradient(135deg,hsl(255,80%,78%),hsl(222,85%,72%));' +
      'box-shadow:0 4px 16px hsla(255,70%,50%,.4);-webkit-tap-highlight-color:transparent;}' +
      '.acc-btn:active{transform:scale(.97);}' +
      '.acc-btn[disabled]{opacity:.55;}' +
      '.acc-ghost{margin-top:10px;width:100%;border:1px solid hsla(255,40%,70%,.25);' +
      'background:transparent;color:#cfd2f5;padding:11px;border-radius:999px;cursor:pointer;' +
      'font-family:inherit;font-size:14px;font-weight:600;}' +
      '.acc-x{margin-top:14px;width:100%;background:none;border:0;color:#9aa0cf;' +
      'cursor:pointer;font-family:inherit;font-size:13px;}' +
      '.acc-msg{font-size:13px;line-height:1.45;margin:4px 0 0;color:#bfe3c8;}' +
      '.acc-row{font-size:13.5px;color:#cfd2f5;margin:2px 0;}' +
      '.acc-toast{position:fixed;left:16px;right:16px;bottom:calc(env(safe-area-inset-bottom,0)+18px);' +
      'z-index:100001;margin:auto;max-width:420px;padding:13px 16px;border-radius:14px;' +
      'background:hsla(255,30%,14%,.96);color:#eef0ff;font-family:Montserrat,system-ui,sans-serif;' +
      'font-size:14px;font-weight:600;text-align:center;box-shadow:0 12px 34px hsla(255,50%,4%,.55);' +
      'border:1px solid hsla(255,45%,72%,.2);opacity:0;transform:translateY(12px);' +
      'transition:opacity .3s,transform .3s;}' +
      '.acc-toast.show{opacity:1;transform:translateY(0);}';
    document.head.appendChild(s);
  }

  function toast(msg) {
    injectStyle();
    var el = document.createElement('div');
    el.className = 'acc-toast';
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { try { el.remove(); } catch (e) {} }, 350);
    }, 3600);
  }

  function closeModal() {
    var ov = document.getElementById('acc-ov');
    if (ov) { try { ov.remove(); } catch (e) {} }
  }

  function showLogin() {
    injectStyle();
    closeModal();
    var ov = document.createElement('div');
    ov.className = 'acc-ov';
    ov.id = 'acc-ov';
    ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });

    var card = document.createElement('div');
    card.className = 'acc-card';

    if (state.loggedIn) {
      var trial = (state.paid) ? t('ui.account.fullAccess','Пълен достъп ✓')
        : (state.trialLeft !== null ? t('ui.account.trialLeftFmt','Пробен период: още {n} дни',{n:state.trialLeft}) : t('ui.account.trial','Пробен период'));
      card.innerHTML =
        '<h3>' + esc(t('ui.account.profileTitle','Вашият профил')) + '</h3>' +
        '<p class="acc-row">' + t('ui.account.loggedInAs','Влезли сте като <b>{email}</b>',{email:esc(state.email || '')}) + '</p>' +
        '<p class="acc-row">' + esc(trial) + '</p>';
      if (!state.paid) {
        var bPay = btn(t('ui.account.unlock','Отключи пълен достъп — €19.99'), 'acc-btn');
        bPay.style.marginTop = '14px';
        bPay.addEventListener('click', function () {
          bPay.disabled = true; bPay.textContent = t('ui.account.loading','Зареждам…');
          startCheckout().then(function (r) {
            if (r && r.notReady) {
              bPay.disabled = false; bPay.textContent = t('ui.account.unlock','Отключи пълен достъп — €19.99');
              toast(t('ui.account.payNotReady','Плащането още се настройва. Опитайте малко по-късно.'));
            }
          });
        });
        card.appendChild(bPay);

        var bEpay = btn(t('ui.account.epay','Плати с ePay / EasyPay (България)'), 'acc-ghost');
        bEpay.addEventListener('click', function () {
          bEpay.disabled = true; bEpay.textContent = t('ui.account.loading','Зареждам…');
          startEpay().then(function (r) {
            if (r && r.notReady) {
              bEpay.disabled = false; bEpay.textContent = t('ui.account.epay','Плати с ePay / EasyPay (България)');
              toast(t('ui.account.epayNotReady','ePay още се настройва. Опитайте малко по-късно.'));
            }
          });
        });
        card.appendChild(bEpay);
      }
      var bSync = btn(t('ui.account.syncNow','Синхронизирай сега'), 'acc-btn');
      bSync.style.marginTop = '14px';
      bSync.addEventListener('click', function () {
        bSync.disabled = true; bSync.textContent = t('ui.account.syncing','Синхронизирам…');
        pushNow().then(function () { bSync.textContent = t('ui.account.synced','Синхронизирано ✓'); });
      });
      var bOut = btn(t('ui.account.logout','Изход'), 'acc-ghost');
      bOut.addEventListener('click', function () { logout().then(closeModal); });
      var x = btn(t('ui.account.close','Затвори'), 'acc-x');
      x.addEventListener('click', closeModal);
      card.appendChild(bSync); card.appendChild(bOut); card.appendChild(x);
    } else {
      card.innerHTML =
        '<h3>' + esc(t('ui.account.loginTitle','Вход / Възстановяване')) + '</h3>' +
        '<p class="acc-sub">' + esc(t('ui.account.loginSub','Въведете имейл и ще получите връзка за вход — без парола. Така данните ви се пазят и се връщат при смяна на телефон.')) + '</p>';
      var input = document.createElement('input');
      input.className = 'acc-in';
      input.type = 'email';
      input.inputMode = 'email';
      input.autocomplete = 'email';
      input.placeholder = t('ui.account.emailPlaceholder','вашият@имейл.bg');
      var send = btn(t('ui.account.sendLink','Изпрати връзка'), 'acc-btn');
      var msg = document.createElement('p');
      msg.className = 'acc-msg';
      msg.style.display = 'none';
      var x2 = btn(t('ui.account.close','Затвори'), 'acc-x');
      x2.addEventListener('click', closeModal);

      send.addEventListener('click', function () {
        var email = (input.value || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          msg.style.display = 'block'; msg.style.color = '#f3c0c0';
          msg.textContent = t('ui.account.invalidEmail','Моля въведете валиден имейл.');
          return;
        }
        send.disabled = true; send.textContent = t('ui.account.sending','Изпращам…');
        postJSON(API.request, { email: email }).then(function (r) {
          if (r && r.ok) {
            msg.style.display = 'block'; msg.style.color = '#bfe3c8';
            msg.innerHTML = t('ui.account.linkSent','Изпратихме връзка на <b>{email}</b>.<br>Отворете я от <b>същия телефон</b>, за да влезете.',{email:esc(email)});
            send.textContent = t('ui.account.done','Готово ✓');
          } else {
            msg.style.display = 'block'; msg.style.color = '#f3c0c0';
            msg.textContent = (r && r.__status === 500)
              ? t('ui.account.serviceNotReady','Услугата още се настройва. Опитайте малко по-късно.')
              : t('ui.account.genericError','Възникна грешка. Опитайте пак.');
            send.disabled = false; send.textContent = t('ui.account.sendLink','Изпрати връзка');
          }
        });
      });

      card.appendChild(input);
      card.appendChild(send);
      card.appendChild(msg);
      card.appendChild(x2);
    }

    ov.appendChild(card);
    document.body.appendChild(ov);
  }

  function t(key, fallback, params) { return (window.i18n && window.i18n.t) ? window.i18n.t(key, fallback, params) : (fallback != null ? fallback : key); }
  function btn(label, cls) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; return b; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  // ── Публично API ─────────────────────────────────────────────────────────────
  window.Account = {
    showLogin: showLogin,
    status: function () { return { loggedIn: state.loggedIn, email: state.email, paid: state.paid, trialLeft: state.trialLeft }; },
    isLoggedIn: function () { return state.loggedIn; },
    pushNow: pushNow,
    logout: logout,
    deviceToken: deviceToken,
    entitlement: function () { return window.Entitlement; },
    refreshEntitlement: refreshEntitlement,
    startCheckout: startCheckout,
    startEpay: startEpay
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
