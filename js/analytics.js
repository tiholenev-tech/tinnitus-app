/**
 * AURALIS Analytics — local-only usage tracking (Task CC)
 * =========================================================
 * Per BIBLE v3 §6 (OFFLINE-FIRST / PRIVACY):
 *   - Всичко в localStorage (НЕ изпраща нищо навън)
 *   - Track: listening sessions, favorites, profile, app opens, SOS, Sleep
 *
 * Storage keys:
 *   auralis_analytics_sessions  — array of listening sessions
 *   auralis_analytics_summary   — aggregated stats
 *
 * Public API:
 *   Analytics.init()                — call at bootstrap (track app open)
 *   Analytics.trackListen(opts)     — { soundId, startTime, durationSec, completed }
 *   Analytics.trackFavorite(soundId, added) — added: true/false
 *   Analytics.trackProfile(profileCode)
 *   Analytics.trackSOS()
 *   Analytics.trackSleep(minutes)
 *   Analytics.getSummary()          — returns computed stats object
 *   Analytics.getTopSounds(n)       — top N most-played
 *   Analytics.getSessionHistory()   — raw sessions
 *   Analytics.exportAll()           — returns JSON string
 *   Analytics.clear()               — wipe all analytics
 *   Analytics.generateFakeData()    — for debug UI testing
 *   Analytics.showStats()           — opens stats BottomSheet (CC1)
 *   Analytics.showTopPlayed()       — opens top-10 BottomSheet (CC2)
 */

window.Analytics = (function () {
  'use strict';

  var STORAGE_SESSIONS = 'auralis_analytics_sessions';
  var STORAGE_SUMMARY = 'auralis_analytics_summary';

  // ============================================================
  // Helpers
  // ============================================================

  function t(key, fallback) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback);
    return fallback != null ? fallback : key;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function saveJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }

  function getSessions() {
    return loadJSON(STORAGE_SESSIONS, []);
  }

  function saveSessions(arr) {
    saveJSON(STORAGE_SESSIONS, arr);
  }

  function getSummaryData() {
    return loadJSON(STORAGE_SUMMARY, {
      appOpens: 0,
      lastActiveDate: null,
      profileCode: null,
      sosCount: 0,
      sosDates: [],
      sleepCount: 0,
      sleepTotalMinutes: 0,
      favoritesAdded: 0,
      favoritesRemoved: 0
    });
  }

  function saveSummary(obj) {
    saveJSON(STORAGE_SUMMARY, obj);
  }

  function now() {
    return new Date().toISOString();
  }

  function today() {
    return new Date().toISOString().split('T')[0];
  }

  // ============================================================
  // Tracking
  // ============================================================

  function init() {
    var summary = getSummaryData();
    summary.appOpens = (summary.appOpens || 0) + 1;
    summary.lastActiveDate = today();
    saveSummary(summary);
  }

  function trackListen(opts) {
    if (!opts || !opts.soundId) return;
    var sessions = getSessions();
    sessions.push({
      soundId: opts.soundId,
      startTime: opts.startTime || now(),
      durationSec: opts.durationSec || 0,
      completed: !!opts.completed
    });
    // Keep last 500 sessions max
    if (sessions.length > 500) sessions = sessions.slice(-500);
    saveSessions(sessions);
  }

  function trackFavorite(soundId, added) {
    var summary = getSummaryData();
    if (added) {
      summary.favoritesAdded = (summary.favoritesAdded || 0) + 1;
    } else {
      summary.favoritesRemoved = (summary.favoritesRemoved || 0) + 1;
    }
    saveSummary(summary);
  }

  function trackProfile(profileCode) {
    var summary = getSummaryData();
    summary.profileCode = profileCode;
    saveSummary(summary);
  }

  function trackSOS() {
    var summary = getSummaryData();
    summary.sosCount = (summary.sosCount || 0) + 1;
    if (!summary.sosDates) summary.sosDates = [];
    summary.sosDates.push(now());
    if (summary.sosDates.length > 50) summary.sosDates = summary.sosDates.slice(-50);
    saveSummary(summary);
  }

  function trackSleep(minutes) {
    var summary = getSummaryData();
    summary.sleepCount = (summary.sleepCount || 0) + 1;
    summary.sleepTotalMinutes = (summary.sleepTotalMinutes || 0) + (minutes || 0);
    saveSummary(summary);
  }

  // ============================================================
  // Computed stats
  // ============================================================

  function getSummary() {
    var sessions = getSessions();
    var summary = getSummaryData();

    var totalSec = 0;
    var soundCounts = {};
    var hourCounts = new Array(24).fill(0);

    sessions.forEach(function (s) {
      totalSec += s.durationSec || 0;
      soundCounts[s.soundId] = (soundCounts[s.soundId] || 0) + (s.durationSec || 0);
      if (s.startTime) {
        try {
          var h = new Date(s.startTime).getHours();
          hourCounts[h]++;
        } catch (e) { /* ignore */ }
      }
    });

    var mostPlayed = null;
    var mostPlayedSec = 0;
    Object.keys(soundCounts).forEach(function (id) {
      if (soundCounts[id] > mostPlayedSec) {
        mostPlayedSec = soundCounts[id];
        mostPlayed = id;
      }
    });

    var favoriteHour = 0;
    var maxHourCount = 0;
    hourCounts.forEach(function (c, h) {
      if (c > maxHourCount) { maxHourCount = c; favoriteHour = h; }
    });

    // Diary stats (from auralis_diary localStorage)
    var diaryStats = computeDiaryStats();

    return {
      totalHours: +(totalSec / 3600).toFixed(1),
      totalSessions: sessions.length,
      mostPlayed: mostPlayed,
      mostPlayedHours: +(mostPlayedSec / 3600).toFixed(1),
      favoriteHour: favoriteHour,
      appOpens: summary.appOpens || 0,
      profileCode: summary.profileCode,
      sosCount: summary.sosCount || 0,
      sleepCount: summary.sleepCount || 0,
      sleepTotalHours: +((summary.sleepTotalMinutes || 0) / 60).toFixed(1),
      diaryDaysLogged: diaryStats.daysLogged,
      diaryAvgTinnitus: diaryStats.avgTinnitus,
      diaryAvgSleep: diaryStats.avgSleep
    };
  }

  function computeDiaryStats() {
    var result = { daysLogged: 0, avgTinnitus: null, avgSleep: null };
    try {
      var raw = localStorage.getItem('auralis_diary_entries');
      if (!raw) return result;
      var entries = JSON.parse(raw);
      if (!Array.isArray(entries) || entries.length === 0) return result;
      result.daysLogged = entries.length;
      var tinSum = 0, tinCount = 0, sleepSum = 0, sleepCount = 0;
      entries.forEach(function (e) {
        if (e.tinnitus != null) { tinSum += e.tinnitus; tinCount++; }
        if (e.sleep != null) { sleepSum += e.sleep; sleepCount++; }
      });
      if (tinCount > 0) result.avgTinnitus = +(tinSum / tinCount).toFixed(1);
      if (sleepCount > 0) result.avgSleep = +(sleepSum / sleepCount).toFixed(1);
    } catch (e) { /* ignore */ }
    return result;
  }

  function getTopSounds(n) {
    n = n || 10;
    var sessions = getSessions();
    var soundCounts = {};
    var soundSessions = {};

    sessions.forEach(function (s) {
      soundCounts[s.soundId] = (soundCounts[s.soundId] || 0) + (s.durationSec || 0);
      soundSessions[s.soundId] = (soundSessions[s.soundId] || 0) + 1;
    });

    var sorted = Object.keys(soundCounts).sort(function (a, b) {
      return soundCounts[b] - soundCounts[a];
    });

    return sorted.slice(0, n).map(function (id) {
      return {
        soundId: id,
        totalHours: +(soundCounts[id] / 3600).toFixed(1),
        sessions: soundSessions[id] || 0
      };
    });
  }

  function getSessionHistory() {
    return getSessions();
  }

  // ============================================================
  // Export / Clear
  // ============================================================

  function exportAll() {
    return JSON.stringify({
      sessions: getSessions(),
      summary: getSummaryData(),
      exportedAt: now()
    }, null, 2);
  }

  function clear() {
    try {
      localStorage.removeItem(STORAGE_SESSIONS);
      localStorage.removeItem(STORAGE_SUMMARY);
    } catch (e) { /* ignore */ }
  }

  // ============================================================
  // Generate fake data (debug)
  // ============================================================

  function generateFakeData() {
    var sounds = ['underwater', 'deep_calm', 'sea_shore', 'pink_rain', 'brown_noise',
      'forest_morning', 'rain_soft', 'ocean_distant', 'wind_calm', 'stream_gentle'];
    var sessions = [];
    var now = Date.now();
    for (var i = 0; i < 80; i++) {
      var daysAgo = Math.floor(Math.random() * 30);
      var hour = 18 + Math.floor(Math.random() * 6); // 18-23
      var date = new Date(now - daysAgo * 86400000);
      date.setHours(hour, Math.floor(Math.random() * 60));
      sessions.push({
        soundId: sounds[Math.floor(Math.random() * sounds.length)],
        startTime: date.toISOString(),
        durationSec: 300 + Math.floor(Math.random() * 3600),
        completed: Math.random() > 0.3
      });
    }
    saveSessions(sessions);

    var summary = getSummaryData();
    summary.appOpens = 45;
    summary.sosCount = 3;
    summary.sosDates = [new Date(now - 86400000 * 5).toISOString(),
      new Date(now - 86400000 * 2).toISOString(), new Date().toISOString()];
    summary.sleepCount = 8;
    summary.sleepTotalMinutes = 3120; // 52h
    summary.profileCode = 'TH_C';
    saveSummary(summary);

    if (window.Toast) window.Toast.success('Fake data generated (80 sessions)');
  }

  // ============================================================
  // CC1: Stats bottom sheet
  // ============================================================

  function showStats() {
    if (!window.BottomSheet) return;
    var stats = getSummary();

    var html =
      '<div class="an-stats">' +
        buildSection(t('analytics.listening.section', 'Слушане'), [
          [t('analytics.listening.totalHours', 'Общо часове'), stats.totalHours + ' ч'],
          [t('analytics.listening.mostPlayed', 'Най-слушан'), stats.mostPlayed || '—'],
          [t('analytics.listening.favoriteHour', 'Любим час'), stats.favoriteHour + ':00']
        ]) +
        buildSection(t('analytics.diary.section', 'Дневник'), [
          [t('analytics.diary.daysLogged', 'Записани дни'), String(stats.diaryDaysLogged || 0)],
          [t('analytics.diary.avgTinnitus', 'Среден тинитус'), stats.diaryAvgTinnitus != null ? String(stats.diaryAvgTinnitus) : '—'],
          [t('analytics.diary.avgSleep', 'Среден сън'), stats.diaryAvgSleep != null ? stats.diaryAvgSleep + ' ч' : '—']
        ]) +
        buildSection(t('analytics.other.section', 'Други'), [
          [t('analytics.other.sosUsed', 'SOS използван'), stats.sosCount + ' пъти'],
          [t('analytics.other.sleepMode', 'Sleep режим'), stats.sleepCount + ' нощи (' + stats.sleepTotalHours + ' ч)']
        ]) +
      '</div>';

    window.BottomSheet.open({
      title: t('analytics.title', 'Вашата статистика'),
      content: html,
      height: '80vh',
      actions: [
        { label: t('settings.data.exportAll', 'Експорт всичко'), variant: 'primary', onClick: function () {
          downloadExport('auralis-all-' + today() + '.json', exportAll());
        }},
        { label: t('analytics.topPlayed', 'Най-слушани'), variant: 'secondary', onClick: function () {
          window.BottomSheet.closeAll();
          setTimeout(showTopPlayed, 350);
        }}
      ]
    });
  }

  function buildSection(title, rows) {
    var html = '<div class="an-section"><h3 class="an-section-title">' + escapeHtml(title) + '</h3>';
    rows.forEach(function (r) {
      html += '<div class="an-row"><span class="an-row-label">' + escapeHtml(r[0]) +
        '</span><span class="an-row-value">' + escapeHtml(r[1]) + '</span></div>';
    });
    return html + '</div>';
  }

  // ============================================================
  // CC2: Top 10 sounds (inline SVG bar chart)
  // ============================================================

  function showTopPlayed() {
    if (!window.BottomSheet) return;
    var top = getTopSounds(10);

    if (top.length === 0) {
      window.BottomSheet.open({
        title: t('analytics.topPlayed', 'Най-слушани'),
        content: '<p style="padding:16px;color:var(--text-muted);">' +
          escapeHtml(t('analytics.noData', 'Няма данни за слушане все още.')) + '</p>',
        height: 'auto'
      });
      return;
    }

    var maxHours = top[0].totalHours || 1;
    var bars = top.map(function (item, idx) {
      var pct = Math.max(4, (item.totalHours / maxHours) * 100);
      return (
        '<div class="an-bar-row">' +
          '<span class="an-bar-rank">' + (idx + 1) + '</span>' +
          '<span class="an-bar-name">' + escapeHtml(item.soundId) + '</span>' +
          '<div class="an-bar-track">' +
            '<div class="an-bar-fill" style="width:' + pct.toFixed(0) + '%"></div>' +
          '</div>' +
          '<span class="an-bar-val">' + escapeHtml(t('ui.analytics.hoursSessionsFmt','{h}ч / {s}x',{h:item.totalHours,s:item.sessions})) + '</span>' +
        '</div>'
      );
    }).join('');

    window.BottomSheet.open({
      title: t('analytics.topPlayed', 'Най-слушани'),
      content: '<div class="an-top">' + bars + '</div>',
      height: '80vh'
    });
  }

  // ============================================================
  // Download helper
  // ============================================================

  function downloadExport(filename, jsonStr) {
    var blob = new Blob([jsonStr], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    if (window.Toast) window.Toast.success(t('settings.data.exported', 'Експортирано'));
  }

  return {
    init: init,
    trackListen: trackListen,
    trackFavorite: trackFavorite,
    trackProfile: trackProfile,
    trackSOS: trackSOS,
    trackSleep: trackSleep,
    getSummary: getSummary,
    getTopSounds: getTopSounds,
    getSessionHistory: getSessionHistory,
    exportAll: exportAll,
    clear: clear,
    generateFakeData: generateFakeData,
    showStats: showStats,
    showTopPlayed: showTopPlayed
  };
})();
