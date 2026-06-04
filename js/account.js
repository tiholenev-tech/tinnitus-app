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
    logout:  '/api/logout.php'
  };

  var state = { ready: false, loggedIn: false, email: null, paid: false, trialLeft: null, rev: 0 };
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
    return getJSON(API.me).then(function (r) {
      state.ready    = true;
      state.loggedIn = !!(r && r.logged_in);
      state.email    = (r && r.email) || null;
      state.paid     = !!(r && r.paid);
      state.trialLeft = (r && typeof r.trial_days_left !== 'undefined') ? r.trial_days_left : null;
      return state.loggedIn;
    });
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  function stripLoginParam() {
    try {
      var u = new URL(location.href);
      if (u.searchParams.has('login')) {
        u.searchParams.delete('login');
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

    // flush при затваряне/скриване
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') flush();
    });

    if (loginParam === 'ok') {
      stripLoginParam();
      checkSession().then(function (ok) {
        if (ok) { toast('Влязохте успешно ✓'); pullAndReload(); }
        else    { toast('Входът не беше успешен. Опитайте пак.'); }
      });
    } else {
      if (loginParam === 'fail') { stripLoginParam(); toast('Връзката е изтекла или невалидна.'); }
      checkSession(); // тихо — за статус в Настройки + активиране на push
    }
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
      toast('Излязохте от профила.');
    });
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
      var trial = (state.paid) ? 'Пълен достъп ✓'
        : (state.trialLeft !== null ? ('Пробен период: още ' + state.trialLeft + ' дни') : 'Пробен период');
      card.innerHTML =
        '<h3>Вашият профил</h3>' +
        '<p class="acc-row">Влезли сте като <b>' + esc(state.email || '') + '</b></p>' +
        '<p class="acc-row">' + esc(trial) + '</p>';
      var bSync = btn('Синхронизирай сега', 'acc-btn');
      bSync.style.marginTop = '14px';
      bSync.addEventListener('click', function () {
        bSync.disabled = true; bSync.textContent = 'Синхронизирам…';
        pushNow().then(function () { bSync.textContent = 'Синхронизирано ✓'; });
      });
      var bOut = btn('Изход', 'acc-ghost');
      bOut.addEventListener('click', function () { logout().then(closeModal); });
      var x = btn('Затвори', 'acc-x');
      x.addEventListener('click', closeModal);
      card.appendChild(bSync); card.appendChild(bOut); card.appendChild(x);
    } else {
      card.innerHTML =
        '<h3>Вход / Възстановяване</h3>' +
        '<p class="acc-sub">Въведете имейл и ще получите връзка за вход — без парола. ' +
        'Така данните ви се пазят и се връщат при смяна на телефон.</p>';
      var input = document.createElement('input');
      input.className = 'acc-in';
      input.type = 'email';
      input.inputMode = 'email';
      input.autocomplete = 'email';
      input.placeholder = 'вашият@имейл.bg';
      var send = btn('Изпрати връзка', 'acc-btn');
      var msg = document.createElement('p');
      msg.className = 'acc-msg';
      msg.style.display = 'none';
      var x2 = btn('Затвори', 'acc-x');
      x2.addEventListener('click', closeModal);

      send.addEventListener('click', function () {
        var email = (input.value || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          msg.style.display = 'block'; msg.style.color = '#f3c0c0';
          msg.textContent = 'Моля въведете валиден имейл.';
          return;
        }
        send.disabled = true; send.textContent = 'Изпращам…';
        postJSON(API.request, { email: email }).then(function (r) {
          if (r && r.ok) {
            msg.style.display = 'block'; msg.style.color = '#bfe3c8';
            msg.innerHTML = 'Изпратихме връзка на <b>' + esc(email) + '</b>.<br>' +
              'Отворете я от <b>същия телефон</b>, за да влезете.';
            send.textContent = 'Готово ✓';
          } else {
            msg.style.display = 'block'; msg.style.color = '#f3c0c0';
            msg.textContent = (r && r.__status === 500)
              ? 'Услугата още се настройва. Опитайте малко по-късно.'
              : 'Възникна грешка. Опитайте пак.';
            send.disabled = false; send.textContent = 'Изпрати връзка';
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

  function btn(label, cls) { var b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; return b; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  // ── Публично API ─────────────────────────────────────────────────────────────
  window.Account = {
    showLogin: showLogin,
    status: function () { return { loggedIn: state.loggedIn, email: state.email, paid: state.paid, trialLeft: state.trialLeft }; },
    isLoggedIn: function () { return state.loggedIn; },
    pushNow: pushNow,
    logout: logout
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
