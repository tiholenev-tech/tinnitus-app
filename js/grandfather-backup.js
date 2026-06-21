/**
 * AURALIS Grandfather Backup — имейл-backup за заварени (2026-06-18, task #2B).
 * ============================================================================
 * Показва ЕДНОКРАТЕН (на отваряне) силен модал на ЗАВАРЕН (lifetime) потребител
 * БЕЗ свързан имейл — за да върже имейл и да не загуби достъпа при wipe на телефона.
 *
 * Поведение (заковано от Тихол):
 *  - само lifetime + без email_backup → показва се;
 *  - „По-късно" → затваря, но се показва ПАК при следващото отваряне (не завинаги);
 *  - остави валиден имейл → server връзва is_lifetime за имейла → НИКОГА повече;
 *  - нов/trial/paid → не се показва.
 *
 * Дизайн за 50+/70+: едър шрифт, висок контраст, голям бутон (≥48px), минимум текст.
 */
(function () {
  'use strict';

  var shownThisSession = false;

  function tt(key, fb, params) { return (window.i18n && window.i18n.t) ? window.i18n.t(key, fb, params) : (fb != null ? fb : key); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  function injectStyle() {
    if (document.getElementById('gfb-style')) return;
    var s = document.createElement('style');
    s.id = 'gfb-style';
    s.textContent =
      '.gfb-ov{position:fixed;inset:0;z-index:100002;display:flex;align-items:center;justify-content:center;padding:20px;' +
      'background:rgba(4,5,10,.82);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);font-family:Montserrat,system-ui,sans-serif;}' +
      '.gfb-card{width:100%;max-width:420px;background:hsla(255,28%,13%,.98);border:1px solid hsla(255,45%,72%,.24);' +
      'border-radius:22px;padding:28px 24px;box-shadow:0 18px 50px hsla(255,60%,3%,.6);color:#eef0ff;text-align:center;}' +
      '.gfb-card h2{margin:0 0 12px;font-size:23px;line-height:1.25;font-weight:800;}' +
      '.gfb-sub{margin:0 0 20px;font-size:16px;line-height:1.55;color:#d2d4f0;}' +
      '.gfb-in{width:100%;box-sizing:border-box;padding:16px 16px;border-radius:14px;border:1px solid hsla(255,40%,70%,.32);' +
      'background:hsla(255,30%,8%,.6);color:#fff;font-size:18px;font-family:inherit;margin-bottom:14px;text-align:center;}' +
      '.gfb-in:focus{outline:none;border-color:hsl(255,80%,75%);}' +
      '.gfb-btn{width:100%;min-height:56px;border:0;cursor:pointer;padding:16px;border-radius:999px;font-family:inherit;' +
      'font-size:18px;font-weight:800;color:#0a0b12;background:linear-gradient(135deg,hsl(255,80%,78%),hsl(222,85%,72%));' +
      'box-shadow:0 4px 16px hsla(255,70%,50%,.4);-webkit-tap-highlight-color:transparent;}' +
      '.gfb-btn:active{transform:scale(.98);}.gfb-btn[disabled]{opacity:.55;}' +
      '.gfb-later{display:block;margin:16px auto 0;background:none;border:0;color:#9aa0cf;cursor:pointer;font-family:inherit;font-size:15px;min-height:44px;}' +
      '.gfb-msg{font-size:14.5px;line-height:1.45;margin:10px 0 0;min-height:18px;}';
    document.head.appendChild(s);
  }

  function close() { var o = document.getElementById('gfb-ov'); if (o) { try { o.remove(); } catch (e) {} } }

  function show() {
    injectStyle();
    close();
    var ov = document.createElement('div'); ov.className = 'gfb-ov'; ov.id = 'gfb-ov';
    var card = document.createElement('div'); card.className = 'gfb-card';
    card.innerHTML =
      '<h2>' + esc(tt('ui.grandfatherBackup.title', 'Запазете безплатния си достъп завинаги')) + '</h2>' +
      '<p class="gfb-sub">' + esc(tt('ui.grandfatherBackup.body', 'Въведете имейл, за да не загубите достъпа при смяна или нулиране на телефона. Безплатно е и остава ваше завинаги.')) + '</p>';

    var input = document.createElement('input');
    input.className = 'gfb-in'; input.type = 'email'; input.inputMode = 'email'; input.autocomplete = 'email';
    input.placeholder = tt('ui.grandfatherBackup.placeholder', 'Вашият имейл');

    var save = document.createElement('button');
    save.type = 'button'; save.className = 'gfb-btn';
    save.textContent = tt('ui.grandfatherBackup.save', 'Запази достъпа');

    var msg = document.createElement('p'); msg.className = 'gfb-msg';

    var later = document.createElement('button');
    later.type = 'button'; later.className = 'gfb-later';
    later.textContent = tt('ui.grandfatherBackup.later', 'По-късно');
    later.addEventListener('click', close);

    save.addEventListener('click', function () {
      var email = (input.value || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.style.color = '#f3c0c0';
        msg.textContent = tt('ui.grandfatherBackup.invalid', 'Моля въведете валиден имейл.');
        return;
      }
      if (!window.Account || !Account.grandfatherBackup) return;
      save.disabled = true; save.textContent = tt('ui.grandfatherBackup.saving', 'Запазвам…');
      Account.grandfatherBackup(email).then(function (r) {
        if (r && r.__status === 200 && r.ok) {
          msg.style.color = '#bfe3c8';
          msg.textContent = tt('ui.grandfatherBackup.done', 'Готово! Достъпът ви е запазен завинаги ✓');
          setTimeout(close, 1800);
        } else {
          save.disabled = false; save.textContent = tt('ui.grandfatherBackup.save', 'Запази достъпа');
          msg.style.color = '#f3c0c0';
          msg.textContent = tt('ui.grandfatherBackup.error', 'Възникна грешка. Опитайте пак.');
        }
      });
    });

    card.appendChild(input); card.appendChild(save); card.appendChild(msg); card.appendChild(later);
    ov.appendChild(card);
    document.body.appendChild(ov);
  }

  function maybeShow(e) {
    if (shownThisSession) return;
    e = e || window.Entitlement;
    if (!e || !e.loaded) return;
    // само заварен (lifetime) БЕЗ свързан имейл
    if (e.lifetime && !e.emailBackup) { shownThisSession = true; show(); }
  }

  window.addEventListener('auralis-entitlement', function (ev) { maybeShow(ev.detail); });
  if (window.Entitlement && window.Entitlement.loaded) maybeShow(window.Entitlement);
})();
