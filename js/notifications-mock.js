/**
 * AURALIS Notifications Mock (Task II)
 * =======================================
 * In-app notification banner when reminder time matches.
 * No real push notifications — UI mock for Тhol to see before Capacitor.
 *
 * At app open:
 *   - Check if reminders enabled (BB3 settings)
 *   - Check if current time is within 30min of reminder time
 *   - Show in-app banner if yes and not already shown today
 *
 * Public API:
 *   NotificationsMock.init()   — call at bootstrap
 *   NotificationsMock.check()  — manual trigger
 */

window.NotificationsMock = (function () {
  'use strict';

  var STORAGE_LAST_SHOWN = 'auralis_notif_last_shown';
  var SHOWN_WINDOW_MIN = 30; // show within 30 min of reminder time

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  function loadReminders() {
    try {
      var raw = localStorage.getItem('auralis_reminders');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return { daily: false, dailyTime: '21:00', weekly: false };
  }

  function wasShownToday() {
    try {
      return localStorage.getItem(STORAGE_LAST_SHOWN) === today();
    } catch (e) { return true; }
  }

  function markShown() {
    try { localStorage.setItem(STORAGE_LAST_SHOWN, today()); } catch (e) { /* ignore */ }
  }

  function isWithinWindow(reminderTime) {
    try {
      var parts = reminderTime.split(':');
      var reminderMin = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      var now = new Date();
      var nowMin = now.getHours() * 60 + now.getMinutes();
      var diff = nowMin - reminderMin;
      return diff >= 0 && diff <= SHOWN_WINDOW_MIN;
    } catch (e) { return false; }
  }

  function showBanner() {
    if (!window.BottomSheet) {
      // Fallback to toast
      if (window.Toast) window.Toast.info(t('notifications.diary', 'Време е да попълните дневника днес'));
      return;
    }

    var content = document.createElement('div');
    content.style.textAlign = 'center';
    content.style.padding = '12px 0';
    content.innerHTML =
      '<p style="font-size:15px;font-weight:700;color:var(--text);margin:0 0 16px;">' +
        t('notifications.diary', 'Време е да попълните дневника днес') +
      '</p>';

    var handle = window.BottomSheet.open({
      title: t('notifications.title', 'Напомняне'),
      content: content,
      height: 'auto',
      actions: [
        {
          label: t('notifications.goToDiary', 'Запиши сега'),
          variant: 'primary',
          onClick: function () {
            handle.close();
            if (window.Diary && window.Diary.render) {
              if (window.AppState && window.AppState.transition) window.AppState.transition('diary');
              window.Diary.render();
            }
          }
        },
        {
          label: t('notifications.later', 'Напомни по-късно'),
          variant: 'secondary',
          onClick: function () { handle.close(); }
        }
      ],
      onClose: function () { markShown(); }
    });
  }

  function check() {
    var reminders = loadReminders();
    if (!reminders.daily) return;
    if (wasShownToday()) return;
    if (!isWithinWindow(reminders.dailyTime || '21:00')) return;
    // Delay slightly so app finishes rendering first
    setTimeout(showBanner, 2000);
    markShown();
  }

  function init() {
    // Check after a brief delay at startup
    setTimeout(check, 3000);
  }

  return {
    init: init,
    check: check
  };
})();
