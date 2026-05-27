/**
 * AURALIS DiaryEvening — 5-question evening diary (Wave 3.2)
 * ===========================================================================
 * 5 ScaleSlider questions (1-5 scale) + optional 1-line note.
 * Saves → state.diaryEntries[today].evening = { ...answers, note }.
 *
 * Edge cases implemented (от docs/content/code3/diary_edge_cases.md):
 *   #4  — нощен hint между 00:00-04:00 (тих banner, без блокиране)
 *   #6  — autosave draft на всеки slider change (debounced)
 *   #8  — multi-entry в едно и също време (мек hint)
 *   #9  — незадължителна textarea бележка (1 ред, 200 знака)
 *   #15 — Save disabled hint под бутона
 *   #16 — resume незавършен draft при връщане
 *   #18 — confirmation при 5/5/5/5/5
 *   #19 — high-distress банер след 3 поредни дни max
 *   #22 — aria-* labels чрез ScaleSlider component
 *
 * Public API:
 *   DiaryEvening.open()   — explicit start
 *   DiaryEvening.render() — router hook
 */

window.DiaryEvening = (function () {
  'use strict';

  var NOTE_MAX = 200;
  var DRAFT_KEY_PREFIX = 'auralis-diary-evening-draft-';
  var DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  // 5 въпроси с labels — текстовете идват от i18n при наличие.
  // Fallback labels запазваме (offline-safe).
  var QUESTIONS = [
    {
      key: 'noise_intensity',
      fallbackQuestion: 'Колко силен беше шумът днес?',
      labels: ['Много тих', 'Тих', 'Средно', 'Силен', 'Изключително силен']
    },
    {
      key: 'noise_distress',
      fallbackQuestion: 'Колко ви пречеше шумът?',
      labels: ['Изобщо не', 'Леко', 'Умерено', 'Доста', 'Изключително']
    },
    {
      key: 'calm',
      fallbackQuestion: 'Колко спокоен се чувствахте?',
      labels: ['Напълно спокоен', 'Спокоен', 'Неутрален', 'Тревожен', 'Изключително тревожен']
    },
    {
      key: 'mood',
      fallbackQuestion: 'Какво беше настроението ви?',
      labels: ['Много добро', 'Добро', 'Неутрално', 'Лошо', 'Много потиснато']
    },
    {
      key: 'sleep_last_night',
      fallbackQuestion: 'Как беше съня снощи?',
      labels: ['Отличен', 'Добър', 'Среден', 'Лош', 'Много лош']
    }
  ];

  var answers = {};   // { key: 1..5 }
  var note = '';
  var sliders = {};
  var saveDraftTimer = null;
  var lateEntryForDate = null;  // ако != null → save отива в този dateKey + lateCompletedAt

  function el(id) { return document.getElementById(id); }

  function t(key, fallback, params) {
    if (window.i18n && window.i18n.t) return window.i18n.t(key, fallback, params);
    if (fallback != null && params) {
      return String(fallback).replace(/\{(\w+)\}/g, function (m, n) {
        return (params[n] !== undefined) ? String(params[n]) : m;
      });
    }
    return (fallback != null ? fallback : key);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getQuestionText(q) {
    return t('ui.diary.evening.questions.' + q.key, q.fallbackQuestion);
  }

  // ============================================================
  // Draft persistence (edge #6, #16)
  // ============================================================

  function draftKeyFor(dateKey) { return DRAFT_KEY_PREFIX + dateKey; }

  function loadDraft(dateKey) {
    try {
      var raw = localStorage.getItem(draftKeyFor(dateKey));
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (!d || !d.ts) return null;
      if (Date.now() - d.ts > DRAFT_TTL_MS) {
        localStorage.removeItem(draftKeyFor(dateKey));
        return null;
      }
      return d;
    } catch (e) { return null; }
  }

  function saveDraft(dateKey) {
    try {
      localStorage.setItem(draftKeyFor(dateKey), JSON.stringify({
        answers: answers,
        note: note,
        ts: Date.now()
      }));
    } catch (e) {
      if (window.Toast && window.Toast.warning) {
        window.Toast.warning(t('ui.diary.edge.saveDraftFailed',
          'Не успяхме да запазим автоматично. Натиснете „Запиши" преди да затворите.'));
      }
    }
  }

  function clearDraft(dateKey) {
    try { localStorage.removeItem(draftKeyFor(dateKey)); } catch (e) { /* ignore */ }
  }

  function scheduleDraftSave(dateKey) {
    if (saveDraftTimer) clearTimeout(saveDraftTimer);
    saveDraftTimer = setTimeout(function () { saveDraft(dateKey); }, 400);
  }

  // ============================================================
  // Edge case helpers
  // ============================================================

  function isLateNight() {
    var h = new Date().getHours();
    return h >= 0 && h < 4;
  }

  function isAllMaxValues() {
    return QUESTIONS.every(function (q) { return answers[q.key] === 5; });
  }

  function morningEnteredToday() {
    var s = window.AppState;
    if (!s || !s.diaryEntries) return null;
    var existing = s.diaryEntries[s.todayKey()];
    return (existing && existing.morning) ? existing.morning : null;
  }

  // Edge #19: 3 поредни вечерни записа с всички max (5/5/5/5/5).
  function highDistressStreakHits(newEvening) {
    var s = window.AppState;
    if (!s || !s.diaryEntries) return false;
    var entries = s.diaryEntries;
    var todayKey = s.todayKey();

    function allMax(ev) {
      if (!ev) return false;
      return QUESTIONS.every(function (q) { return ev[q.key] === 5; });
    }
    if (!allMax(newEvening)) return false;

    // Check previous 2 days
    function dayOffsetKey(offset) {
      var d = new Date();
      d.setDate(d.getDate() - offset);
      var y = d.getFullYear();
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + dd;
    }
    var d1 = entries[dayOffsetKey(1)];
    var d2 = entries[dayOffsetKey(2)];
    return allMax(d1 && d1.evening) && allMax(d2 && d2.evening);
  }

  // ============================================================
  // HTML
  // ============================================================

  function buildHtml() {
    var lblTitle  = t('ui.diary.evening.title', 'Вечерен дневник');
    var lblSave   = t('ui.diary.evening.save', 'Запиши');
    var lblCancel = t('ui.diary.evening.cancel', 'Откажи');
    var lblHint   = t('ui.diary.validation.fillAllHint',
      'Попълнете всички плъзгачи, за да продължите.');
    var lblNote   = t('ui.diary.evening.noteLabel', 'Бележка за деня (по избор)');
    var lblNoteP  = t('ui.diary.evening.notePlaceholder',
      'Една кратка мисъл за днес — например „променливо: сутрин 4, вечер 2".');

    var sections = QUESTIONS.map(function (q, idx) {
      var indexText = t('ui.diary.evening.questionIndexFmt', '{n} / {total}',
        { n: idx + 1, total: QUESTIONS.length });
      return (
        '<section class="de-section" data-question-key="' + escapeHtml(q.key) + '">' +
          '<div class="de-section-title">' + escapeHtml(indexText) + '</div>' +
          '<div class="de-question">' + escapeHtml(getQuestionText(q)) + '</div>' +
          '<div class="de-slider-slot" data-slider-slot="' + escapeHtml(q.key) + '"></div>' +
        '</section>'
      );
    }).join('');

    var noteHtml =
      '<section class="de-section de-section--note">' +
        '<label class="de-section-title" for="deNote">' + escapeHtml(lblNote) + '</label>' +
        '<div class="de-note-row">' +
          '<textarea id="deNote" class="de-note" maxlength="' + NOTE_MAX + '"' +
            ' placeholder="' + escapeHtml(lblNoteP) + '"' +
            ' rows="2">' + escapeHtml(note) + '</textarea>' +
          '<div class="voice-dict-slot" data-voice-slot="deNote"></div>' +
        '</div>' +
        '<div class="de-char-counter">' +
          '<span data-char-count>' + note.length + '</span> / ' + NOTE_MAX +
        '</div>' +
      '</section>';

    var nightHintHtml = '';
    if (isLateNight()) {
      var nhTitle = t('ui.diary.edge.nightHintTitle', 'Не успявате да заспите?');
      var nhBody  = t('ui.diary.edge.nightHintBody',
        'Това е чест момент при тинитус. Можете да попълните дневника сега, или вместо това да изберете тиха звукова сесия.');
      nightHintHtml =
        '<div class="de-night-hint" role="note">' +
          '<div class="de-night-hint-title">' + escapeHtml(nhTitle) + '</div>' +
          '<div class="de-night-hint-body">' + escapeHtml(nhBody) + '</div>' +
        '</div>';
    }

    var multiEntryHtml = '';
    if (morningEnteredToday()) {
      var meText = t('ui.diary.edge.multiEntryHint',
        'Виждаме, че днес попълвате и сутрешния, и вечерния запис заедно. Това е окей. Обикновено вечерният се прави след 20:00.');
      multiEntryHtml =
        '<div class="de-multi-hint" role="note">' +
          escapeHtml(meText) +
        '</div>';
    }

    return (
      '<div class="de-screen" data-screen="diary_evening">' +
        '<h1 class="de-title">' + escapeHtml(lblTitle) + '</h1>' +
        nightHintHtml +
        multiEntryHtml +
        sections +
        noteHtml +
        '<div class="de-save-hint" data-save-hint>' + escapeHtml(lblHint) + '</div>' +
        '<div class="de-actions">' +
          '<button class="de-btn de-btn--primary" type="button" data-action="save" disabled>' +
            escapeHtml(lblSave) +
          '</button>' +
          '<button class="de-btn de-btn--ghost" type="button" data-action="cancel">' +
            escapeHtml(lblCancel) +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ============================================================
  // ScaleSlider injection
  // ============================================================

  function injectSliders() {
    var dateKey = (window.AppState && window.AppState.todayKey) ? window.AppState.todayKey() : '';
    QUESTIONS.forEach(function (q) {
      var slot = document.querySelector('[data-slider-slot="' + q.key + '"]');
      if (!slot || !window.ScaleSlider) return;
      var slider = window.ScaleSlider.create({
        labels: q.labels,
        value: answers[q.key] || null,
        onChange: function (val) {
          answers[q.key] = val;
          updateSaveButton();
          scheduleDraftSave(dateKey);
        }
      });
      slider.mount(slot);
      sliders[q.key] = slider;
    });
    updateSaveButton();
  }

  function updateSaveButton() {
    var btn = document.querySelector('[data-action="save"]');
    var hint = document.querySelector('[data-save-hint]');
    if (!btn) return;
    var complete = QUESTIONS.every(function (q) {
      return typeof answers[q.key] === 'number' && answers[q.key] >= 1 && answers[q.key] <= 5;
    });
    if (complete) {
      btn.removeAttribute('disabled');
      if (hint) hint.style.display = 'none';
    } else {
      btn.setAttribute('disabled', 'disabled');
      if (hint) hint.style.display = '';
    }
  }

  // ============================================================
  // Save / cancel
  // ============================================================

  function performSave() {
    var s = window.AppState;
    if (!s) return;
    var allAnswered = QUESTIONS.every(function (q) {
      return typeof answers[q.key] === 'number';
    });
    if (!allAnswered) return;

    var today = s.todayKey();
    var targetDate = lateEntryForDate || today;
    var isLate = !!lateEntryForDate && lateEntryForDate !== today;

    var evening = {};
    QUESTIONS.forEach(function (q) { evening[q.key] = answers[q.key]; });
    if (note && note.trim()) evening.note = note.trim().slice(0, NOTE_MAX);
    if (isLate) evening.lateCompletedAt = new Date().toISOString();

    s.saveDiaryEntry(targetDate, { evening: evening });
    if (!isLate) s.updateStreakOnEntry();  // late entry не променя streak
    clearDraft(targetDate);

    if (window.Toast && window.Toast.success) {
      var savedKey = isLate ? 'ui.diary.hub.lateEntrySavedToast' : 'ui.diary.evening.savedToast';
      var savedFb  = isLate ? 'Записан със закъснение' : 'Записано';
      window.Toast.success(t(savedKey, savedFb));
    }

    // Edge #19: висок дистрес 3 поредни дни → последващ информативен toast.
    if (highDistressStreakHits(evening)) {
      setTimeout(function () {
        var msg = t('ui.diary.edge.highDistress3d',
          'През последните 3 дни сте отчели висок дистрес. AURALIS е wellness инструмент, не медицински. Ако се чувствате претоварен, можете да обмислите консултация със специалист.');
        if (window.Toast && window.Toast.info) {
          window.Toast.info(msg, { duration: 9000 });
        } else if (window.Toast && window.Toast.success) {
          window.Toast.success(msg);
        }
      }, 700);
    }

    // Reset & exit to hub
    answers = {};
    note = '';
    sliders = {};
    lateEntryForDate = null;
    s.transition('diary_hub');
    history.replaceState({ phase: 'diary_hub' }, '');
    if (window.DiaryHub && window.DiaryHub.render) window.DiaryHub.render();
  }

  function save() {
    // Edge #18: confirm при 5/5/5/5/5
    if (isAllMaxValues()) {
      var title = t('ui.diary.edge.confirmAllMaxTitle', 'Точно ли е?');
      var body  = t('ui.diary.edge.confirmAllMaxBody',
        'Отбелязахте най-високата стойност на всички въпроси. Сигурни ли сте, че така са били усещанията Ви днес?');
      var confirmed = window.confirm(title + '\n\n' + body);
      if (!confirmed) return;
    }
    performSave();
  }

  function cancel() {
    // Note: drafts остават до 7 дни — НЕ ги изтриваме при cancel.
    answers = {};
    note = '';
    sliders = {};
    lateEntryForDate = null;
    if (saveDraftTimer) { clearTimeout(saveDraftTimer); saveDraftTimer = null; }
    var s = window.AppState;
    if (s && s.transition) s.transition('diary_hub');
    history.back();
  }

  // ============================================================
  // Interactions
  // ============================================================

  function onClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    if (action === 'save') save();
    else if (action === 'cancel') cancel();
  }

  function onInput(e) {
    if (e.target.id !== 'deNote') return;
    note = e.target.value.slice(0, NOTE_MAX);
    var counter = document.querySelector('[data-char-count]');
    if (counter) counter.textContent = String(note.length);
    var dateKey = (window.AppState && window.AppState.todayKey) ? window.AppState.todayKey() : '';
    scheduleDraftSave(dateKey);
  }

  // ============================================================
  // Lifecycle — populate state then render
  // ============================================================

  function populateFromExistingOrDraft() {
    answers = {};
    note = '';
    sliders = {};
    var s = window.AppState;
    if (!s) return;
    var today = lateEntryForDate || s.todayKey();

    // Priority 1: saved evening entry (already submitted) — pre-fill за edit.
    if (s.diaryEntries) {
      var existing = s.diaryEntries[today];
      if (existing && existing.evening) {
        QUESTIONS.forEach(function (q) {
          if (typeof existing.evening[q.key] === 'number') {
            answers[q.key] = existing.evening[q.key];
          }
        });
        if (typeof existing.evening.note === 'string') note = existing.evening.note;
        return;
      }
    }

    // Priority 2: in-progress draft (edge #16).
    var d = loadDraft(today);
    if (d && d.answers) {
      QUESTIONS.forEach(function (q) {
        if (typeof d.answers[q.key] === 'number') answers[q.key] = d.answers[q.key];
      });
      if (typeof d.note === 'string') note = d.note;
    }
  }

  function refresh() {
    var app = el('app');
    if (!app) return;
    app.innerHTML = buildHtml();
    app.addEventListener('click', onClick);
    app.addEventListener('input', onInput);
    injectSliders();
    injectVoiceDictation();
  }

  function injectVoiceDictation() {
    if (!window.VoiceDictation || !window.VoiceDictation.isSupported()) return;
    var slot = document.querySelector('[data-voice-slot="deNote"]');
    var target = el('deNote');
    if (!slot || !target) return;
    window.VoiceDictation.mountButton({
      target: target,
      container: slot,
      lang: 'bg-BG',
      maxLength: NOTE_MAX
    });
  }

  function open() {
    lateEntryForDate = null;
    populateFromExistingOrDraft();
    var s = window.AppState;
    if (s && s.transition) s.transition('diary_evening');
    history.pushState({ phase: 'diary_evening' }, '');
    refresh();
  }

  function openForDate(dateKey) {
    if (!dateKey) return open();
    lateEntryForDate = dateKey;
    populateFromExistingOrDraft();
    var s = window.AppState;
    if (s && s.transition) s.transition('diary_evening');
    history.pushState({ phase: 'diary_evening' }, '');
    refresh();
  }

  function render() {
    // Router hook (resume след reload).
    populateFromExistingOrDraft();
    refresh();
  }

  return {
    open: open,
    openForDate: openForDate,
    render: render
  };
})();
