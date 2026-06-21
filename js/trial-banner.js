/**
 * AURALIS Trial Banner — in-app предупреждение от ден 7 (2026-06-18).
 * ============================================================================
 * Слуша window 'auralis-entitlement' (от account.js). Показва ненатрапчив банер
 * когато status==='trial' и остават <= 7 дни. CTA → paywall екран. Скрива се за
 * lifetime/paid/expired (при expired guard-ът показва самия paywall).
 * Dismiss = за текущата сесия (per ден), за да не дразни.
 */
(function () {
  'use strict';

  var WARN_FROM = 7;            // от колко оставащи дни показваме
  var dismissedForDay = null;   // daysLeft, за който е скрит този път

  function tt(key, fb, params) { return (window.i18n && window.i18n.t) ? window.i18n.t(key, fb, params) : (fb != null ? fb : key); }

  function injectStyle() {
    if (document.getElementById('tb-style')) return;
    var s = document.createElement('style');
    s.id = 'tb-style';
    s.textContent =
      '.tb-bar{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top,0) + 10px);z-index:99990;margin:auto;' +
      'max-width:520px;display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:14px;' +
      'background:linear-gradient(135deg,hsla(255,40%,18%,.98),hsla(222,46%,18%,.98));' +
      'border:1px solid hsla(255,55%,72%,.28);box-shadow:0 10px 30px hsla(255,55%,4%,.5);' +
      'font-family:Montserrat,system-ui,sans-serif;color:#eef0ff;}' +
      '.tb-txt{flex:1;font-size:13px;line-height:1.35;font-weight:600;}' +
      '.tb-cta{flex:none;border:0;cursor:pointer;padding:8px 13px;border-radius:999px;font-family:inherit;font-size:12.5px;' +
      'font-weight:800;color:#0a0b12;background:linear-gradient(135deg,hsl(255,80%,78%),hsl(222,85%,72%));}' +
      '.tb-x{flex:none;background:none;border:0;color:#aab0e6;cursor:pointer;font-size:18px;line-height:1;padding:2px 4px;}';
    document.head.appendChild(s);
  }

  function remove() { var b = document.getElementById('tb-bar'); if (b) { try { b.remove(); } catch (e) {} } }

  function render(daysLeft) {
    injectStyle();
    remove();
    var bar = document.createElement('div');
    bar.className = 'tb-bar'; bar.id = 'tb-bar';

    var txt = document.createElement('div');
    txt.className = 'tb-txt';
    txt.textContent = (daysLeft <= 1)
      ? tt('ui.trial.bannerLastDay', 'Последен ден от пробния период. Заключете достъпа сега.')
      : tt('ui.trial.bannerFmt', 'Остават {n} дни пробен период.', { n: daysLeft });

    var cta = document.createElement('button');
    cta.type = 'button'; cta.className = 'tb-cta';
    cta.textContent = tt('ui.trial.bannerCta', 'Отключи сега');
    cta.addEventListener('click', function () { if (window.Paywall && Paywall.showPaywall) Paywall.showPaywall(); });

    var x = document.createElement('button');
    x.type = 'button'; x.className = 'tb-x'; x.setAttribute('aria-label', tt('ui.trial.bannerDismiss', 'Скрий'));
    x.innerHTML = '&times;';
    x.addEventListener('click', function () { dismissedForDay = daysLeft; remove(); });

    bar.appendChild(txt); bar.appendChild(cta); bar.appendChild(x);
    document.body.appendChild(bar);
  }

  function update(e) {
    if (!e || !e.loaded) return;
    var d = e.daysLeft;
    if (e.status === 'trial' && typeof d === 'number' && d > 0 && d <= WARN_FROM) {
      if (dismissedForDay === d) return;   // вече скрит за този ден
      render(d);
    } else {
      remove();
    }
  }

  window.addEventListener('auralis-entitlement', function (ev) { update(ev.detail); });
  // ако entitlement вече е зареден преди модулът да закачи listener-а
  if (window.Entitlement && window.Entitlement.loaded) update(window.Entitlement);
})();
